import { supabase } from "@/integrations/supabase/client";

export class VoiceAgent {
  private pc: RTCPeerConnection | null = null;
  private dc: RTCDataChannel | null = null;
  private audioEl: HTMLAudioElement;
  private localStream: MediaStream | null = null;

  constructor(
    private onMessage: (event: any) => void,
    private onConnectionChange: (connected: boolean) => void,
    private onSpeakingChange: (isSpeaking: boolean) => void
  ) {
    this.audioEl = document.createElement("audio");
    this.audioEl.autoplay = true;
  }

  async init() {
    try {
      console.log("Initializing voice agent...");
      
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

      // Create peer connection
      this.pc = new RTCPeerConnection();

      // Set up remote audio playback
      this.pc.ontrack = (e) => {
        console.log("Received remote track");
        this.audioEl.srcObject = e.streams[0];
      };

      // Get local audio and add track
      this.localStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
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
    
    this.audioEl.srcObject = null;
    this.onConnectionChange(false);
    this.onSpeakingChange(false);
  }

  isConnected(): boolean {
    return this.dc?.readyState === 'open';
  }
}
