import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Phone, Calendar, User, Mail, Sparkles, Mic, MicOff, CreditCard, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./ui/use-toast";
import { VoiceAgent } from "@/utils/VoiceAgent";
import { useIsMobile } from "@/hooks/use-mobile";
import { SITE_CONFIG } from "@/lib/siteConfig";
import { useBooking } from "@/contexts/BookingContext";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface LeadInfo {
  name?: string;
  email?: string;
  phone?: string;
  interest?: string;
}

type AssistantMode = "closed" | "menu" | "text" | "voice";

const QUICK_PROMPTS = [
  { label: "Hormone Therapy", value: "I'm interested in hormone replacement therapy. What symptoms can it help with?" },
  { label: "Weight Loss", value: "Tell me about your medical weight loss program." },
  { label: "Peptide Therapy", value: "Tell me about your peptide protocols and what they can help with." },
  { label: "How to Start", value: "How do I get started as a new patient?" },
];

// Safari/iOS detection
const isSafari = (): boolean => {
  const ua = navigator.userAgent;
  return /^((?!chrome|android).)*safari/i.test(ua);
};

const isIOS = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

const AssistantHub = () => {
  const [mode, setMode] = useState<AssistantMode>("closed");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm Elevated Health Augusta's AI assistant. I can help you understand our programs, pricing, and how to book — but I'm not a clinician, so I can't give medical advice. For anything clinical, your $79 Wellness Assessment is the right next step. What brings you here today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickPrompts, setShowQuickPrompts] = useState(true);
  const [showLeadCapture, setShowLeadCapture] = useState(false);
  const [leadInfo, setLeadInfo] = useState<LeadInfo>({});
  const [leadCaptured, setLeadCaptured] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Voice state
  const [voiceAgent, setVoiceAgent] = useState<VoiceAgent | null>(null);
  const [isVoiceConnected, setIsVoiceConnected] = useState(false);
  const [isVoiceConnecting, setIsVoiceConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [userTranscript, setUserTranscript] = useState("");
  const [needsAudioUnlock, setNeedsAudioUnlock] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);

  useEffect(() => {
    // Check voice support on mount
    setVoiceSupported(VoiceAgent.isSupported());

    // Allow other components to open the chat assistant
    const openText = () => setMode("text");
    const openMenuEvt = () => setMode("menu");
    document.addEventListener("open-assistant-chat", openText);
    document.addEventListener("open-assistant-menu", openMenuEvt);
    return () => {
      document.removeEventListener("open-assistant-chat", openText);
      document.removeEventListener("open-assistant-menu", openMenuEvt);
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Show lead capture after a few exchanges
  useEffect(() => {
    const userMessages = messages.filter(m => m.role === "user").length;
    if (userMessages >= 2 && !leadCaptured && !showLeadCapture) {
      setShowLeadCapture(true);
    }
  }, [messages, leadCaptured, showLeadCapture]);

  // Cleanup voice on unmount
  useEffect(() => {
    return () => {
      voiceAgent?.disconnect();
    };
  }, [voiceAgent]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading) return;

    setShowQuickPrompts(false);
    const userMessage: Message = { role: "user", content: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("chat", {
        body: { messages: [...messages, userMessage] },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    handleSend(prompt);
  };

  const handleLeadCapture = async () => {
    if (!leadInfo.name && !leadInfo.email && !leadInfo.phone) {
      toast({
        title: "Please enter your information",
        description: "We need at least your name, email, or phone to follow up.",
        variant: "destructive",
      });
      return;
    }

    const conversationText = messages.map(m => m.content).join(" ").toLowerCase();
    let detectedInterest = "general";
    if (conversationText.includes("hormone") || conversationText.includes("menopause") || conversationText.includes("testosterone")) {
      detectedInterest = "hormone";
    } else if (conversationText.includes("weight") || conversationText.includes("semaglutide") || conversationText.includes("tirzepatide")) {
      detectedInterest = "weight_loss";
    } else if (conversationText.includes("ketamine") || conversationText.includes("depression") || conversationText.includes("anxiety") || conversationText.includes("mental")) {
      detectedInterest = "general";
    }

    try {
      await supabase.functions.invoke("chat", {
        body: { 
          messages,
          captureLeadInfo: {
            ...leadInfo,
            interest: detectedInterest,
          }
        },
      });

      setLeadCaptured(true);
      setShowLeadCapture(false);
      
      toast({
        title: "Thank you!",
        description: "Our team will reach out within one business day.",
      });

      setMessages(prev => [...prev, {
        role: "assistant",
        content: `Thank you${leadInfo.name ? `, ${leadInfo.name}` : ""}! I've shared your information with our team. You'll receive a text with booking info for your $79 Wellness Assessment, and someone will follow up within one business day. Feel free to ask me any other questions!`
      }]);
    } catch (error) {
      console.error("Lead capture error:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Voice functions
  const startVoice = async () => {
    if (!voiceSupported) {
      toast({
        title: "Voice Not Supported",
        description: "Your browser doesn't support voice chat. Please try Chrome or Safari.",
        variant: "destructive",
      });
      return;
    }

    // On Safari/iOS, show audio unlock prompt
    if ((isSafari() || isIOS()) && !needsAudioUnlock) {
      setNeedsAudioUnlock(true);
      return;
    }

    setIsVoiceConnecting(true);
    setNeedsAudioUnlock(false);
    
    try {
      const agent = new VoiceAgent(
        (event) => {
          // Handle transcripts and state changes
          if (event.type === 'response.audio_transcript.delta') {
            setVoiceTranscript(prev => prev + (event.delta || ''));
            setIsSpeaking(true);
            setIsProcessing(false);
            setIsListening(false);
          } else if (event.type === 'response.audio_transcript.done') {
            // Assistant finished speaking this segment
          } else if (event.type === 'response.done') {
            // Response complete, back to listening
            setIsSpeaking(false);
            setIsListening(true);
            setVoiceTranscript("");
          } else if (event.type === 'input_audio_buffer.speech_started') {
            // User started speaking
            setIsListening(true);
            setIsProcessing(false);
            setUserTranscript("");
          } else if (event.type === 'input_audio_buffer.speech_stopped') {
            // User stopped speaking, processing
            setIsListening(false);
            setIsProcessing(true);
          } else if (event.type === 'conversation.item.input_audio_transcription.completed') {
            // User's speech was transcribed
            console.log("User said:", event.transcript);
            setUserTranscript(event.transcript || "");
            setIsProcessing(true);
          } else if (event.type === 'response.created') {
            // AI is generating response
            setIsProcessing(true);
            setIsListening(false);
          }
        },
        (connected) => {
          setIsVoiceConnected(connected);
          setIsVoiceConnecting(false);
          if (connected) {
            setIsListening(true);
          } else {
            setVoiceTranscript("");
            setUserTranscript("");
            setIsListening(false);
            setIsProcessing(false);
          }
        },
        (speaking) => {
          setIsSpeaking(speaking);
          if (speaking) {
            setIsListening(false);
            setIsProcessing(false);
          } else {
            setVoiceTranscript("");
            setIsListening(true);
          }
        },
        (lead) => {
          // Lead was captured via voice
          console.log("Voice lead captured:", lead);
          toast({
            title: "Contact Info Saved",
            description: `${lead.name ? `Thanks ${lead.name}! ` : ''}We'll send you booking info for your $79 Wellness Assessment.`,
          });
        }
      );

      await agent.init();
      // Unlock audio after init for Safari
      await agent.unlockAudio();
      setVoiceAgent(agent);
      
      toast({
        title: "Voice Connected",
        description: "You can now speak with our assistant.",
      });
    } catch (error) {
      console.error("Voice init error:", error);
      setIsVoiceConnecting(false);
      
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      if (errorMessage.includes("getUserMedia") || errorMessage.includes("Permission")) {
        toast({
          title: "Microphone Access Required",
          description: "Please allow microphone access to use voice chat.",
          variant: "destructive",
        });
      } else if (errorMessage.includes("WebRTC")) {
        toast({
          title: "Connection Failed",
          description: "Voice chat is not available. Please try text chat instead.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Voice Error",
          description: "Could not start voice chat. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const stopVoice = () => {
    voiceAgent?.disconnect();
    setVoiceAgent(null);
    setIsVoiceConnected(false);
    setIsSpeaking(false);
    setIsListening(false);
    setIsProcessing(false);
    setVoiceTranscript("");
    setUserTranscript("");
    setNeedsAudioUnlock(false);
  };

  const openMenu = () => setMode("menu");
  const closeAll = () => {
    stopVoice();
    setMode("closed");
  };

  // Mobile-optimized positioning classes
  const mobileWindowClasses = isMobile 
    ? "fixed inset-x-0 bottom-0 w-full max-w-full rounded-t-2xl rounded-b-none" 
    : "fixed bottom-6 right-6 w-[380px] max-w-[calc(100vw-3rem)] rounded-2xl";

  const mobileVoiceWindowClasses = isMobile
    ? "fixed inset-x-0 bottom-0 w-full max-w-full rounded-t-2xl rounded-b-none"
    : "fixed bottom-6 right-6 w-[320px] max-w-[calc(100vw-3rem)] rounded-2xl";

  return (
    <>
      {/* Floating Button - Only when closed */}
      {mode === "closed" && (
        <Button
          onClick={openMenu}
          className="fixed bottom-6 right-6 h-14 w-14 md:h-14 md:w-14 rounded-full shadow-elegant hover:shadow-glow transition-all z-40 bg-primary hover:bg-primary/90"
          style={{ minWidth: '56px', minHeight: '56px' }} // Ensure 44px+ touch target
          size="icon"
          aria-label="Open assistant"
        >
          <Sparkles className="h-6 w-6" />
        </Button>
      )}

      {/* Menu - Shows options */}
      {mode === "menu" && (
        <div className={`fixed z-40 ${isMobile ? 'inset-x-0 bottom-0 px-4 pb-6 pt-4 bg-background/95 backdrop-blur-sm border-t border-border rounded-t-2xl' : 'bottom-6 right-6 flex flex-col items-end gap-3'}`}>
          {/* Menu Options */}
          <div className={`flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200 ${isMobile ? 'w-full' : ''}`}>
            <Button
              onClick={() => setMode("text")}
              className={`flex items-center gap-3 shadow-lg bg-card border border-border text-foreground hover:bg-muted ${isMobile ? 'w-full justify-start h-12 px-4 rounded-xl' : 'rounded-full px-4'}`}
              size={isMobile ? "lg" : "sm"}
            >
              <MessageCircle className="h-5 w-5" />
              <span className="font-medium">Text Chat</span>
            </Button>
            <Button
              onClick={() => {
                setMode("voice");
                startVoice();
              }}
              disabled={!voiceSupported}
              className={`flex items-center gap-3 shadow-lg bg-card border border-border text-foreground hover:bg-muted ${isMobile ? 'w-full justify-start h-12 px-4 rounded-xl' : 'rounded-full px-4'} ${!voiceSupported ? 'opacity-50' : ''}`}
              size={isMobile ? "lg" : "sm"}
            >
              <Mic className="h-5 w-5" />
              <span className="font-medium">Voice Agent</span>
            </Button>
            <button
              onClick={() => {
                setMode("closed");
                // Access openBooking through a separate component to avoid hook rules
                document.dispatchEvent(new CustomEvent('open-booking-modal'));
              }}
              className={`flex items-center gap-3 shadow-lg bg-accent text-accent-foreground hover:bg-accent/90 font-medium ${isMobile ? 'w-full justify-start h-12 px-4 rounded-xl' : 'rounded-full px-4 py-2 text-sm'}`}
            >
              <CreditCard className="h-5 w-5" />
              <span>$79 Wellness Assessment</span>
            </button>
            <a
              href="tel:+17067603470"
              className={`flex items-center gap-3 shadow-lg bg-card border border-border text-foreground hover:bg-muted font-medium ${isMobile ? 'w-full justify-start h-12 px-4 rounded-xl' : 'rounded-full px-4 py-2 text-sm'}`}
            >
              <Phone className="h-5 w-5" />
              <span>Call Care Team</span>
            </a>
          </div>
          
          {/* Disclaimer */}
          <p className={`text-xs text-muted-foreground ${isMobile ? 'text-center mt-3' : 'text-right max-w-[180px] mr-2 mt-2'}`}>
            Admin questions only • No medical advice
          </p>
          
          {/* Close Button */}
          <Button
            onClick={() => setMode("closed")}
            className={`shadow-elegant bg-primary hover:bg-primary/90 ${isMobile ? 'w-full h-12 rounded-xl mt-2' : 'h-14 w-14 rounded-full mt-2'}`}
            size={isMobile ? "lg" : "icon"}
          >
            {isMobile ? (
              <span className="flex items-center gap-2">
                <ChevronDown className="h-5 w-5" />
                Close
              </span>
            ) : (
              <X className="h-6 w-6" />
            )}
          </Button>
        </div>
      )}

      {/* Text Chat Window */}
      {mode === "text" && (
        <div className={`${mobileWindowClasses} ${isMobile ? 'h-[85vh]' : 'h-[550px] max-h-[calc(100vh-6rem)]'} bg-card border border-border shadow-elegant flex flex-col z-40 overflow-hidden`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-primary text-primary-foreground shrink-0" style={{ paddingTop: isMobile ? 'max(1rem, env(safe-area-inset-top))' : '1rem' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Care Coordination</h3>
                <p className="text-xs opacity-80">Admin questions • No medical advice</p>
              </div>
            </div>
            <Button
              onClick={closeAll}
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground"
              style={{ minWidth: '44px', minHeight: '44px' }}
              aria-label="Close chat"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {message.content
                        .replace(/\[BOOK_WELLNESS_ASSESSMENT\]/g, "")
                        .replace(/\[BOOK_IV_DIRECT\]/g, "")
                        .trim()}
                    </p>
                    {message.role === "assistant" &&
                      message.content.includes("[BOOK_WELLNESS_ASSESSMENT]") && (
                      <a
                        href="/schedule-consult"
                        className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-4 py-2 text-xs font-medium hover:opacity-90 transition"
                      >
                        Book $79 Wellness Assessment →
                      </a>
                    )}
                    {message.role === "assistant" && message.content.includes("[BOOK_IV_DIRECT]") && (
                      <a
                        href="/iv-lounge#the-menu"
                        className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-4 py-2 text-xs font-medium hover:opacity-90 transition"
                      >
                        Browse IV Drips →
                      </a>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Quick Prompts */}
              {showQuickPrompts && messages.length === 1 && (
                <div className="space-y-2 pt-2">
                  <p className="text-xs text-muted-foreground text-center">Quick questions:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {QUICK_PROMPTS.map((prompt, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickPrompt(prompt.value)}
                        className="text-xs px-3 py-2 rounded-full border border-primary/30 text-primary hover:bg-primary/10 transition-colors"
                        style={{ minHeight: '36px' }} // Better touch target
                      >
                        {prompt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Lead Capture Form */}
              {showLeadCapture && !leadCaptured && (
                <div className="bg-accent/50 rounded-xl p-4 space-y-3 border border-accent">
                  <p className="text-sm font-medium text-foreground">
                    Want our team to reach out? Leave your info:
                  </p>
                  <div className="space-y-2">
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Your name"
                        value={leadInfo.name || ""}
                        onChange={(e) => setLeadInfo(prev => ({ ...prev, name: e.target.value }))}
                        className="pl-9 h-11 text-base" // Larger for mobile
                      />
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Email address"
                        type="email"
                        value={leadInfo.email || ""}
                        onChange={(e) => setLeadInfo(prev => ({ ...prev, email: e.target.value }))}
                        className="pl-9 h-11 text-base"
                      />
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Phone number"
                        type="tel"
                        value={leadInfo.phone || ""}
                        onChange={(e) => setLeadInfo(prev => ({ ...prev, phone: e.target.value }))}
                        className="pl-9 h-11 text-base"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleLeadCapture} size="lg" className="flex-1 h-11">
                      Contact Me
                    </Button>
                    <Button onClick={() => setShowLeadCapture(false)} variant="ghost" size="lg" className="h-11">
                      Not now
                    </Button>
                  </div>
                </div>
              )}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted text-muted-foreground rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* $79 Wellness Assessment CTA */}
          {messages.length > 2 && (
            <div className="px-4 py-2 border-t border-border bg-accent/30 shrink-0">
              <a
                href="https://calendar.app.google/hf3NNdiqJDueUuSN9"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-sm text-primary hover:text-primary/80 font-medium py-1"
                style={{ minHeight: '44px' }}
              >
                <CreditCard className="h-4 w-4" />
                Book $79 Wellness Assessment
              </a>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-border shrink-0" style={{ paddingBottom: isMobile ? 'max(1rem, env(safe-area-inset-bottom))' : '1rem' }}>
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1 h-11 text-base"
              />
              <Button 
                onClick={() => handleSend()} 
                disabled={isLoading || !input.trim()} 
                size="icon"
                className="h-11 w-11"
                style={{ minWidth: '44px', minHeight: '44px' }}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Voice Agent Window */}
      {mode === "voice" && (
        <div className={`${mobileVoiceWindowClasses} bg-card border border-border shadow-elegant z-40 overflow-hidden`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-primary text-primary-foreground" style={{ paddingTop: isMobile ? 'max(1rem, env(safe-area-inset-top))' : '1rem' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <Mic className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Voice Assistant</h3>
                <p className="text-xs opacity-80">
                  {isVoiceConnecting ? "Connecting..." : isVoiceConnected ? "Listening..." : "Disconnected"}
                </p>
              </div>
            </div>
            <Button
              onClick={closeAll}
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground"
              style={{ minWidth: '44px', minHeight: '44px' }}
              aria-label="Close voice chat"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Voice Content */}
          <div className="p-6 flex flex-col items-center gap-4" style={{ paddingBottom: isMobile ? 'max(1.5rem, env(safe-area-inset-bottom))' : '1.5rem' }}>
            {/* Safari/iOS Audio Unlock Prompt */}
            {needsAudioUnlock && (
              <div className="bg-accent/20 rounded-xl p-4 text-center space-y-3 w-full">
                <p className="text-sm text-foreground">
                  Tap the button below to enable audio
                </p>
                <Button 
                  onClick={startVoice} 
                  className="w-full h-12"
                  size="lg"
                >
                  <Mic className="h-5 w-5 mr-2" />
                  Enable Audio & Start
                </Button>
              </div>
            )}

            {!needsAudioUnlock && (
              <>
                {/* Visual Indicator with State-Specific Animations */}
                <div className="relative">
                  {/* Outer ripple rings for listening state */}
                  {isListening && isVoiceConnected && (
                    <>
                      <div className="absolute inset-0 w-24 h-24 rounded-full bg-green-500/20 animate-ping" style={{ animationDuration: '2s' }} />
                      <div className="absolute inset-0 w-24 h-24 rounded-full bg-green-500/10 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
                    </>
                  )}
                  
                  {/* Processing pulse */}
                  {isProcessing && (
                    <div className="absolute inset-0 w-24 h-24 rounded-full bg-amber-500/30 animate-pulse" />
                  )}
                  
                  {/* Speaking waves */}
                  {isSpeaking && (
                    <>
                      <div className="absolute inset-0 w-24 h-24 rounded-full bg-accent/30 animate-pulse" style={{ animationDuration: '0.8s' }} />
                      <div className="absolute inset-0 w-24 h-24 rounded-full ring-4 ring-accent/50 animate-ping" style={{ animationDuration: '1.5s' }} />
                    </>
                  )}
                  
                  {/* Main circle */}
                  <div className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isSpeaking 
                      ? "bg-accent/30 ring-4 ring-accent" 
                      : isProcessing
                        ? "bg-amber-500/20 ring-4 ring-amber-500/60"
                        : isListening
                          ? "bg-green-500/20 ring-4 ring-green-500/60" 
                          : isVoiceConnected 
                            ? "bg-primary/10 ring-2 ring-primary/30" 
                            : "bg-muted"
                  }`}>
                    {isVoiceConnecting ? (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    ) : isSpeaking ? (
                      /* Sound wave bars for speaking */
                      <div className="flex items-center gap-1">
                        <div className="w-1 bg-accent rounded-full animate-pulse" style={{ height: '24px', animationDuration: '0.4s' }} />
                        <div className="w-1 bg-accent rounded-full animate-pulse" style={{ height: '32px', animationDuration: '0.3s', animationDelay: '0.1s' }} />
                        <div className="w-1 bg-accent rounded-full animate-pulse" style={{ height: '20px', animationDuration: '0.5s', animationDelay: '0.05s' }} />
                        <div className="w-1 bg-accent rounded-full animate-pulse" style={{ height: '28px', animationDuration: '0.35s', animationDelay: '0.15s' }} />
                        <div className="w-1 bg-accent rounded-full animate-pulse" style={{ height: '16px', animationDuration: '0.45s', animationDelay: '0.2s' }} />
                      </div>
                    ) : isProcessing ? (
                      /* Thinking dots */
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "0ms", animationDuration: "0.6s" }} />
                        <div className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "150ms", animationDuration: "0.6s" }} />
                        <div className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "300ms", animationDuration: "0.6s" }} />
                      </div>
                    ) : isListening ? (
                      <Mic className="h-10 w-10 text-green-600 animate-pulse" />
                    ) : isVoiceConnected ? (
                      <Mic className="h-10 w-10 text-primary" />
                    ) : (
                      <MicOff className="h-10 w-10 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {/* Status Badge */}
                {isVoiceConnected && (
                  <div className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    isSpeaking 
                      ? "bg-accent/20 text-accent-foreground border border-accent"
                      : isProcessing
                        ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/50"
                        : isListening
                          ? "bg-green-500/20 text-green-700 dark:text-green-300 border border-green-500/50"
                          : "bg-muted text-muted-foreground"
                  }`}>
                    {isSpeaking 
                      ? "🔊 Speaking..."
                      : isProcessing
                        ? "💭 Thinking..."
                        : isListening
                          ? "🎤 Listening..."
                          : "Ready"
                    }
                  </div>
                )}

                {/* Status Text */}
                <p className="text-sm text-muted-foreground text-center">
                  {isVoiceConnecting 
                    ? "Connecting to voice assistant..."
                    : isVoiceConnected 
                      ? isSpeaking 
                        ? "Assistant is responding" 
                        : isProcessing
                          ? "Processing your message..."
                          : "Speak now—I'm listening"
                      : "Voice disconnected"
                  }
                </p>

                {/* User Transcript Preview */}
                {userTranscript && !isSpeaking && (
                  <div className="w-full">
                    <p className="text-xs text-muted-foreground mb-1">You said:</p>
                    <p className="text-sm text-foreground bg-primary/10 rounded-lg p-2 border border-primary/20">
                      {userTranscript}
                    </p>
                  </div>
                )}

                {/* Assistant Transcript Preview */}
                {voiceTranscript && (
                  <div className="w-full">
                    <p className="text-xs text-muted-foreground mb-1">Assistant:</p>
                    <p className="text-sm text-foreground bg-muted rounded-lg p-2 max-h-24 overflow-y-auto">
                      {voiceTranscript}
                    </p>
                  </div>
                )}

                {/* Action Button */}
                {isVoiceConnected ? (
                  <Button onClick={stopVoice} variant="outline" className="w-full h-12">
                    End Voice Chat
                  </Button>
                ) : !isVoiceConnecting && (
                  <Button onClick={startVoice} className="w-full h-12">
                    <Mic className="h-4 w-4 mr-2" />
                    Start Voice Chat
                  </Button>
                )}
              </>
            )}

            {/* $79 Wellness Assessment CTA */}
            <a
              href="https://calendar.app.google/hf3NNdiqJDueUuSN9"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-sm text-primary hover:text-primary/80 font-medium py-2"
              style={{ minHeight: '44px' }}
            >
              <CreditCard className="h-4 w-4" />
              Book $79 Wellness Assessment
            </a>
            
            {/* Disclaimer */}
            <p className="text-xs text-muted-foreground text-center">
              Admin questions only • No medical advice
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default AssistantHub;
