import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Phone, Calendar, User, Mail, Sparkles, Mic, MicOff } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./ui/use-toast";
import { VoiceAgent } from "@/utils/VoiceAgent";

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
  { label: "Ketamine Therapy", value: "I'd like to learn about ketamine therapy for mental health." },
  { label: "How to Start", value: "How do I get started as a new patient?" },
];

const AssistantHub = () => {
  const [mode, setMode] = useState<AssistantMode>("closed");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Welcome to Elevated Health Augusta! I'm here to help you explore our services and answer your questions. What brings you here today?",
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

  // Voice state
  const [voiceAgent, setVoiceAgent] = useState<VoiceAgent | null>(null);
  const [isVoiceConnected, setIsVoiceConnected] = useState(false);
  const [isVoiceConnecting, setIsVoiceConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");

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
      detectedInterest = "ketamine";
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
        content: `Thank you${leadInfo.name ? `, ${leadInfo.name}` : ""}! I've shared your information with our team. Someone will reach out within one business day to help you take the next step. In the meantime, feel free to ask me any other questions!`
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
    setIsVoiceConnecting(true);
    
    try {
      const agent = new VoiceAgent(
        (event) => {
          // Handle transcripts
          if (event.type === 'response.audio_transcript.delta') {
            setVoiceTranscript(prev => prev + (event.delta || ''));
          } else if (event.type === 'response.audio_transcript.done') {
            // Could save transcript to messages
          } else if (event.type === 'conversation.item.input_audio_transcription.completed') {
            // User's speech was transcribed
            console.log("User said:", event.transcript);
          }
        },
        (connected) => {
          setIsVoiceConnected(connected);
          setIsVoiceConnecting(false);
          if (!connected) {
            setVoiceTranscript("");
          }
        },
        (speaking) => {
          setIsSpeaking(speaking);
          if (!speaking) {
            setVoiceTranscript("");
          }
        },
        (lead) => {
          // Lead was captured via voice
          console.log("Voice lead captured:", lead);
          toast({
            title: "Contact Info Saved",
            description: `${lead.name ? `Thanks ${lead.name}! ` : ''}Our team will follow up soon.`,
          });
        }
      );

      await agent.init();
      setVoiceAgent(agent);
      
      toast({
        title: "Voice Connected",
        description: "You can now speak with our assistant.",
      });
    } catch (error) {
      console.error("Voice init error:", error);
      setIsVoiceConnecting(false);
      toast({
        title: "Microphone Access Required",
        description: "Please allow microphone access to use voice chat.",
        variant: "destructive",
      });
    }
  };

  const stopVoice = () => {
    voiceAgent?.disconnect();
    setVoiceAgent(null);
    setIsVoiceConnected(false);
    setIsSpeaking(false);
    setVoiceTranscript("");
  };

  const openMenu = () => setMode("menu");
  const closeAll = () => {
    stopVoice();
    setMode("closed");
  };

  return (
    <>
      {/* Floating Button - Only when closed */}
      {mode === "closed" && (
        <Button
          onClick={openMenu}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-elegant hover:shadow-glow transition-all z-40 bg-primary hover:bg-primary/90"
          size="icon"
          aria-label="Open assistant"
        >
          <Sparkles className="h-6 w-6" />
        </Button>
      )}

      {/* Menu - Shows options */}
      {mode === "menu" && (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
          {/* Menu Options */}
          <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <Button
              onClick={() => setMode("text")}
              className="flex items-center gap-2 rounded-full shadow-lg bg-card border border-border text-foreground hover:bg-muted px-4"
              size="sm"
            >
              <MessageCircle className="h-4 w-4" />
              Text Chat
            </Button>
            <Button
              onClick={() => {
                setMode("voice");
                startVoice();
              }}
              className="flex items-center gap-2 rounded-full shadow-lg bg-card border border-border text-foreground hover:bg-muted px-4"
              size="sm"
            >
              <Mic className="h-4 w-4" />
              Voice Agent
            </Button>
            <a
              href="https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ1TXM4LhPdRGp7nOBvJPbfiFFOquxK3lpKR6YXEgwYfF9HYSUCMqUJRlEJxsVCw7nJ1MhPCDXhT"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full shadow-lg bg-accent text-accent-foreground hover:bg-accent/90 px-4 py-2 text-sm font-medium"
            >
              <Calendar className="h-4 w-4" />
              Book Now
            </a>
          </div>
          
          {/* Close Button */}
          <Button
            onClick={() => setMode("closed")}
            className="h-14 w-14 rounded-full shadow-elegant bg-primary hover:bg-primary/90"
            size="icon"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
      )}

      {/* Text Chat Window */}
      {mode === "text" && (
        <div className="fixed bottom-6 right-6 w-[380px] max-w-[calc(100vw-3rem)] h-[550px] max-h-[calc(100vh-6rem)] bg-card border border-border rounded-2xl shadow-elegant flex flex-col z-40 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-primary text-primary-foreground rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Text Chat</h3>
                <p className="text-xs opacity-80">Type your questions</p>
              </div>
            </div>
            <Button
              onClick={closeAll}
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
            >
              <X className="h-4 w-4" />
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
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
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
                        className="text-xs px-3 py-1.5 rounded-full border border-primary/30 text-primary hover:bg-primary/10 transition-colors"
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
                        className="pl-9 h-9 text-sm"
                      />
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Email address"
                        type="email"
                        value={leadInfo.email || ""}
                        onChange={(e) => setLeadInfo(prev => ({ ...prev, email: e.target.value }))}
                        className="pl-9 h-9 text-sm"
                      />
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Phone number"
                        type="tel"
                        value={leadInfo.phone || ""}
                        onChange={(e) => setLeadInfo(prev => ({ ...prev, phone: e.target.value }))}
                        className="pl-9 h-9 text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleLeadCapture} size="sm" className="flex-1">
                      Contact Me
                    </Button>
                    <Button onClick={() => setShowLeadCapture(false)} variant="ghost" size="sm">
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

          {/* Book Now CTA */}
          {messages.length > 2 && (
            <div className="px-4 py-2 border-t border-border bg-accent/30">
              <a
                href="https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ1TXM4LhPdRGp7nOBvJPbfiFFOquxK3lpKR6YXEgwYfF9HYSUCMqUJRlEJxsVCw7nJ1MhPCDXhT"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-sm text-primary hover:text-primary/80 font-medium"
              >
                <Calendar className="h-4 w-4" />
                Book a Free Discovery Call
              </a>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button onClick={() => handleSend()} disabled={isLoading || !input.trim()} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Voice Agent Window */}
      {mode === "voice" && (
        <div className="fixed bottom-6 right-6 w-[320px] max-w-[calc(100vw-3rem)] bg-card border border-border rounded-2xl shadow-elegant z-40 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-primary text-primary-foreground rounded-t-2xl">
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
              className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Voice Content */}
          <div className="p-6 flex flex-col items-center gap-4">
            {/* Visual Indicator */}
            <div className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
              isSpeaking 
                ? "bg-accent/20 ring-4 ring-accent/40 animate-pulse" 
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
              ) : isVoiceConnected ? (
                <Mic className={`h-10 w-10 ${isSpeaking ? "text-accent" : "text-primary"}`} />
              ) : (
                <MicOff className="h-10 w-10 text-muted-foreground" />
              )}
            </div>

            {/* Status Text */}
            <p className="text-sm text-muted-foreground text-center">
              {isVoiceConnecting 
                ? "Connecting to voice assistant..."
                : isVoiceConnected 
                  ? isSpeaking 
                    ? "Assistant is speaking..." 
                    : "Speak now—I'm listening"
                  : "Voice disconnected"
              }
            </p>

            {/* Transcript Preview */}
            {voiceTranscript && (
              <p className="text-xs text-foreground bg-muted rounded-lg p-2 max-h-20 overflow-y-auto w-full">
                {voiceTranscript}
              </p>
            )}

            {/* Action Button */}
            {isVoiceConnected ? (
              <Button onClick={stopVoice} variant="outline" className="w-full">
                End Voice Chat
              </Button>
            ) : !isVoiceConnecting && (
              <Button onClick={startVoice} className="w-full">
                <Mic className="h-4 w-4 mr-2" />
                Start Voice Chat
              </Button>
            )}

            {/* Book CTA */}
            <a
              href="https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ1TXM4LhPdRGp7nOBvJPbfiFFOquxK3lpKR6YXEgwYfF9HYSUCMqUJRlEJxsVCw7nJ1MhPCDXhT"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-sm text-primary hover:text-primary/80 font-medium"
            >
              <Calendar className="h-4 w-4" />
              Book a Free Discovery Call
            </a>
          </div>
        </div>
      )}
    </>
  );
};

export default AssistantHub;
