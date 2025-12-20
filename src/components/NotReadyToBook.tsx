import { Phone, MessageCircle, Heart, Clock } from "lucide-react";
import { Button } from "./ui/button";

interface NotReadyToBookProps {
  onOpenChat?: () => void;
  variant?: "default" | "compact" | "a" | "b";
  className?: string;
}

const NotReadyToBook = ({ onOpenChat, variant = "default", className = "" }: NotReadyToBookProps) => {
  // Variant B: More empathetic, urgency-focused copy
  if (variant === "b") {
    return (
      <section className={`bg-gradient-to-br from-secondary/40 to-accent/5 rounded-2xl p-8 text-center border border-accent/20 ${className}`}>
        <div className="flex justify-center mb-4">
          <Heart className="h-8 w-8 text-accent" />
        </div>
        <h3 className="text-2xl font-cormorant font-medium text-foreground mb-3">
          Questions? We're here for you.
        </h3>
        <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
          Taking the first step toward better health can feel overwhelming. Our dedicated Care Team has helped 
          hundreds of patients just like you navigate insurance, understand our approach, and feel confident 
          about their decision.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-6">
          <a 
            href="tel:+17067603470" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground rounded-full font-medium hover:bg-accent/90 transition-colors"
          >
            <Phone className="h-5 w-5" />
            Speak with Our Care Team Now
          </a>
          
          {onOpenChat && (
            <Button 
              onClick={onOpenChat} 
              variant="outline" 
              className="gap-2 rounded-full"
            >
              <MessageCircle className="h-4 w-4" />
              Quick Chat
            </Button>
          )}
        </div>
        
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Average response time: under 2 minutes</span>
        </div>
        
        <p className="text-xs text-muted-foreground italic mt-4">
          Administrative support only • No medical advice provided
        </p>
      </section>
    );
  }

  if (variant === "compact") {
    return (
      <div className={`p-4 bg-secondary/50 rounded-xl border border-border/30 ${className}`}>
        <p className="text-sm font-medium text-foreground mb-2">
          Not ready to book? Let's chat first.
        </p>
        <p className="text-xs text-muted-foreground mb-3">
          Questions about our process, insurance, or pricing? Our Care Coordination team is here to help.
        </p>
        <div className="flex flex-col gap-2">
          <a 
            href="tel:+17067603470" 
            className="inline-flex items-center justify-center gap-2 text-accent hover:text-accent/80 font-medium text-sm transition-colors"
          >
            <Phone className="h-4 w-4" />
            <span>Call our Concierge: (706) 760-3470</span>
          </a>
          {onOpenChat && (
            <button 
              onClick={onOpenChat} 
              className="inline-flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Or chat with our AI assistant</span>
            </button>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground mt-3 italic text-center">
          Admin questions only • No medical advice provided
        </p>
      </div>
    );
  }

  // Variant A (default): Original "Let's chat first" copy
  return (
    <section className={`bg-secondary/30 rounded-2xl p-8 text-center border border-border/20 ${className}`}>
      <h3 className="text-2xl font-cormorant font-medium text-foreground mb-3">
        Not ready to book? Let's chat first.
      </h3>
      <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
        We understand that Functional Medicine is a different approach. If you have questions about our process, 
        insurance reimbursement, or pricing, our Care Coordination team is available to help.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-4">
        <a 
          href="tel:+17067603470" 
          className="inline-flex items-center gap-2 text-lg font-medium text-accent hover:text-accent/80 transition-colors"
        >
          <Phone className="h-5 w-5" />
          Call our Concierge: (706) 760-3470
        </a>
        
        {onOpenChat && (
          <Button 
            onClick={onOpenChat} 
            variant="outline" 
            className="gap-2"
          >
            <MessageCircle className="h-4 w-4" />
            Chat with AI Assistant
          </Button>
        )}
      </div>
      
      <p className="text-xs text-muted-foreground italic">
        We can answer your administrative questions instantly. No medical advice provided.
      </p>
    </section>
  );
};

export default NotReadyToBook;
