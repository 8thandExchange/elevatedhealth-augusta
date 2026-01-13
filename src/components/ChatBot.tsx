import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Phone, User, Mail, Sparkles, CreditCard } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./ui/use-toast";
import { SITE_CONFIG } from "@/lib/siteConfig";

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

const QUICK_PROMPTS = [
  { label: "Hormone Therapy", value: "I'm interested in hormone replacement therapy. What symptoms can it help with?" },
  { label: "Weight Loss", value: "Tell me about your medical weight loss program." },
  { label: "Ketamine Therapy", value: "I'd like to learn about ketamine therapy for mental health." },
  { label: "How to Start", value: "How do I get started as a new patient?" },
];

// Helper to render URLs as clickable links
const renderMessageWithLinks = (content: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = content.split(urlRegex);
  
  return parts.map((part, index) => {
    if (urlRegex.test(part)) {
      // Reset regex lastIndex since we're using global flag
      urlRegex.lastIndex = 0;
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline hover:text-primary/80 break-all"
        >
          {part}
        </a>
      );
    }
    return part;
  });
};

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Welcome to Elevated Health Augusta! I can help with questions about our process, pricing, and insurance. What would you like to know?",
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

    // Detect interest from conversation
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

      // Add confirmation message to chat
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `Thank you${leadInfo.name ? `, ${leadInfo.name}` : ""}! I've shared your information with our team. You'll receive a text with booking info for your $99 consultation, and someone will follow up within one business day. Feel free to ask me any other questions!`
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

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-elegant hover:shadow-glow transition-all z-50 bg-primary hover:bg-primary/90"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[380px] max-w-[calc(100vw-3rem)] h-[550px] max-h-[calc(100vh-6rem)] bg-card border border-border rounded-2xl shadow-elegant flex flex-col z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-primary text-primary-foreground rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Care Coordination</h3>
                <p className="text-xs opacity-80">Admin questions • No medical advice</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <a
                href="tel:+17067603470"
                className="h-8 w-8 flex items-center justify-center rounded-md text-primary-foreground hover:bg-primary-foreground/20 transition-colors"
                title="Call (706) 760-3470"
              >
                <Phone className="h-4 w-4" />
              </a>
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
          {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {message.role === "assistant" 
                        ? renderMessageWithLinks(message.content)
                        : message.content
                      }
                    </p>
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
                    <Button 
                      onClick={handleLeadCapture}
                      size="sm"
                      className="flex-1"
                    >
                      Contact Me
                    </Button>
                    <Button 
                      onClick={() => setShowLeadCapture(false)}
                      variant="ghost"
                      size="sm"
                    >
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

          {/* $99 Consultation CTA */}
          {messages.length > 2 && (
            <div className="px-4 py-3 border-t border-border bg-primary/10">
              <a
                href={SITE_CONFIG.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors shadow-sm"
              >
                <CreditCard className="h-4 w-4" />
                Book $99 Medical Consultation
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
              <Button
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
