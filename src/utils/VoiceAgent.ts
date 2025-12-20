import { supabase } from "@/integrations/supabase/client";

interface LeadCaptureData {
  name?: string;
  phone?: string;
  email?: string;
  interest?: string;
  notes?: string;
}

// Safari/iOS detection utilities
const isSafari = (): boolean => {
  const ua = navigator.userAgent;
  return /^((?!chrome|android).)*safari/i.test(ua);
};

const isIOS = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

// Unlock audio context on user gesture (required for Safari/iOS)
const unlockAudioContext = async (): Promise<AudioContext> => {
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  const audioContext = new AudioContextClass();
  
  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }
  
  // Create and play a silent buffer to unlock audio
  const buffer = audioContext.createBuffer(1, 1, 22050);
  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(audioContext.destination);
  source.start(0);
  
  return audioContext;
};

export class VoiceAgent {
  private pc: RTCPeerConnection | null = null;
  private dc: RTCDataChannel | null = null;
  private audioEl: HTMLAudioElement;
  private localStream: MediaStream | null = null;
  private pendingFunctionCalls: Map<string, string> = new Map();
  private audioContext: AudioContext | null = null;

  constructor(
    private onMessage: (event: any) => void,
    private onConnectionChange: (connected: boolean) => void,
    private onSpeakingChange: (isSpeaking: boolean) => void,
    private onLeadCaptured?: (lead: LeadCaptureData) => void
  ) {
    this.audioEl = document.createElement("audio");
    // Safari/iOS compatibility attributes
    this.audioEl.autoplay = true;
    this.audioEl.setAttribute('playsinline', 'true');
    this.audioEl.setAttribute('webkit-playsinline', 'true');
    // Start muted for Safari autoplay, will unmute after user interaction
    if (isSafari() || isIOS()) {
      this.audioEl.muted = true;
    }
  }

  async init() {
    try {
      console.log("Initializing voice agent...");
      console.log("Browser detection - Safari:", isSafari(), "iOS:", isIOS());
      
      // Unlock audio context for Safari/iOS
      if (isSafari() || isIOS()) {
        console.log("Unlocking audio context for Safari/iOS...");
        try {
          this.audioContext = await unlockAudioContext();
          console.log("Audio context unlocked");
        } catch (audioErr) {
          console.warn("Audio context unlock failed, continuing anyway:", audioErr);
        }
      }
      
      // Get ephemeral token from edge function
      const { data, error } = await supabase.functions.invoke("voice-session");
      
      if (error) {
        console.error("Voice session error:", error);
        throw new Error("Failed to get voice session token");
      }

      if (!data?.client_secret?.value) {
        console.error("Invalid session response:", data);
        throw new Error("Failed to get ephemeral token");
      }

      const EPHEMERAL_KEY = data.client_secret.value;
      console.log("Got ephemeral key, creating peer connection...");

      // Create peer connection with Safari-compatible config
      const rtcConfig: RTCConfiguration = {
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      };
      
      // Use prefixed version if available (older Safari)
      const RTCPeerConnectionClass = window.RTCPeerConnection || 
        (window as any).webkitRTCPeerConnection || 
        (window as any).mozRTCPeerConnection;
      
      if (!RTCPeerConnectionClass) {
        throw new Error("WebRTC is not supported in this browser");
      }
      
      this.pc = new RTCPeerConnectionClass(rtcConfig);

      // Set up remote audio playback
      this.pc.ontrack = (e) => {
        console.log("Received remote track");
        this.audioEl.srcObject = e.streams[0];
        
        // Unmute after receiving track (Safari/iOS)
        if (this.audioEl.muted) {
          this.audioEl.muted = false;
        }
        
        // Attempt to play (may fail on Safari without user gesture)
        this.audioEl.play().catch(playErr => {
          console.warn("Auto-play blocked, user interaction required:", playErr);
        });
      };

      // Get local audio with Safari-compatible constraints
      const audioConstraints: MediaStreamConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          // Safari may not support all constraints
          ...(isIOS() ? {} : { sampleRate: 48000 })
        }
      };
      
      // Use prefixed getUserMedia for older Safari
      const getUserMediaFn = navigator.mediaDevices?.getUserMedia?.bind(navigator.mediaDevices) ||
        ((constraints: MediaStreamConstraints) => {
          const legacyGetUserMedia = (navigator as any).webkitGetUserMedia || 
            (navigator as any).mozGetUserMedia;
          if (!legacyGetUserMedia) {
            return Promise.reject(new Error('getUserMedia is not supported'));
          }
          return new Promise<MediaStream>((resolve, reject) => {
            legacyGetUserMedia.call(navigator, constraints, resolve, reject);
          });
        });
      
      this.localStream = await getUserMediaFn(audioConstraints);
      this.pc.addTrack(this.localStream.getTracks()[0]);
      console.log("Added local audio track");

      // Set up data channel for events
      this.dc = this.pc.createDataChannel("oai-events");
      
      this.dc.addEventListener("open", () => {
        console.log("Data channel opened");
        this.onConnectionChange(true);
      });

      this.dc.addEventListener("close", () => {
        console.log("Data channel closed");
        this.onConnectionChange(false);
      });

      this.dc.addEventListener("error", (e) => {
        console.error("Data channel error:", e);
      });

      this.dc.addEventListener("message", (e) => {
        try {
          const event = JSON.parse(e.data);
          console.log("Received event:", event.type);
          
          // Track speaking state
          if (event.type === 'response.audio.delta') {
            this.onSpeakingChange(true);
          } else if (event.type === 'response.audio.done' || event.type === 'response.done') {
            this.onSpeakingChange(false);
          }
          
          // Handle function call arguments accumulation
          if (event.type === 'response.function_call_arguments.delta') {
            const callId = event.call_id;
            const existing = this.pendingFunctionCalls.get(callId) || '';
            this.pendingFunctionCalls.set(callId, existing + (event.delta || ''));
          }
          
          // Handle completed function calls
          if (event.type === 'response.function_call_arguments.done') {
            this.handleFunctionCall(event);
          }
          
          this.onMessage(event);
        } catch (err) {
          console.error("Error parsing message:", err);
        }
      });

      // Create and set local description
      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);
      console.log("Created offer");

      // Connect to OpenAI's Realtime API
      const baseUrl = "https://api.openai.com/v1/realtime";
      const model = "gpt-4o-realtime-preview-2024-12-17";
      
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${EPHEMERAL_KEY}`,
          "Content-Type": "application/sdp"
        },
      });

      if (!sdpResponse.ok) {
        const errorText = await sdpResponse.text();
        console.error("SDP response error:", sdpResponse.status, errorText);
        throw new Error(`WebRTC connection failed: ${sdpResponse.status}`);
      }

      const answer: RTCSessionDescriptionInit = {
        type: "answer",
        sdp: await sdpResponse.text(),
      };
      
      await this.pc.setRemoteDescription(answer);
      console.log("WebRTC connection established");

    } catch (error) {
      console.error("Error initializing voice agent:", error);
      this.disconnect();
      throw error;
    }
  }

  // Call this method after a user gesture to ensure audio works on Safari/iOS
  async unlockAudio(): Promise<void> {
    if (this.audioEl.muted) {
      this.audioEl.muted = false;
    }
    
    try {
      await this.audioEl.play();
    } catch {
      // No audio to play yet, that's fine
    }
    
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  private async handleFunctionCall(event: any) {
    const { call_id, name, arguments: argsString } = event;
    
    console.log("Function call completed:", name, argsString);
    
    if (name === 'capture_lead') {
      try {
        const args: LeadCaptureData = JSON.parse(argsString || '{}');
        console.log("Capturing voice lead:", args);
        
        // Save to database
        const { error } = await supabase.from('chat_leads').insert({
          name: args.name || null,
          phone: args.phone || null,
          email: args.email || null,
          interest: args.interest || 'general',
          source: 'voice',
          chat_summary: args.notes || null,
          status: 'new'
        });
        
        if (error) {
          console.error("Error saving voice lead:", error);
          this.sendFunctionResult(call_id, "Failed to save contact information. Please try again.");
        } else {
          console.log("Voice lead saved successfully");
          this.onLeadCaptured?.(args);
          this.sendFunctionResult(call_id, "Contact information has been saved. The team will follow up soon.");
        }
      } catch (err) {
        console.error("Error parsing function arguments:", err);
        this.sendFunctionResult(call_id, "There was an error. Please repeat your information.");
      }
    }
    
    // Clear pending call
    this.pendingFunctionCalls.delete(call_id);
  }

  private sendFunctionResult(callId: string, result: string) {
    if (!this.dc || this.dc.readyState !== 'open') {
      console.error('Data channel not ready for function result');
      return;
    }

    // Send the function result back
    const outputEvent = {
      type: 'conversation.item.create',
      item: {
        type: 'function_call_output',
        call_id: callId,
        output: result
      }
    };
    
    this.dc.send(JSON.stringify(outputEvent));
    // Trigger response generation
    this.dc.send(JSON.stringify({ type: 'response.create' }));
  }

  sendTextMessage(text: string) {
    if (!this.dc || this.dc.readyState !== 'open') {
      console.error('Data channel not ready');
      return;
    }

    const event = {
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [
          {
            type: 'input_text',
            text
          }
        ]
      }
    };

    this.dc.send(JSON.stringify(event));
    this.dc.send(JSON.stringify({ type: 'response.create' }));
  }

  disconnect() {
    console.log("Disconnecting voice agent...");
    
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    
    if (this.dc) {
      this.dc.close();
      this.dc = null;
    }
    
    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
    
    this.audioEl.srcObject = null;
    this.pendingFunctionCalls.clear();
    this.onConnectionChange(false);
    this.onSpeakingChange(false);
  }

  isConnected(): boolean {
    return this.dc?.readyState === 'open';
  }

  // Check if browser supports required features
  static isSupported(): boolean {
    const hasWebRTC = !!(window.RTCPeerConnection || (window as any).webkitRTCPeerConnection);
    const hasGetUserMedia = !!(navigator.mediaDevices?.getUserMedia || (navigator as any).webkitGetUserMedia);
    return hasWebRTC && hasGetUserMedia;
  }
}
