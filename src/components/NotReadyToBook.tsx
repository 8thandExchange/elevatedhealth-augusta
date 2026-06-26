import { Phone, MessageCircle, Heart, Clock, Star, Quote } from "lucide-react";
import { Button } from "./ui/button";

interface NotReadyToBookProps {
  onOpenChat?: () => void;
  variant?: "default" | "compact" | "a" | "b" | "c";
  className?: string;
  // Custom messaging props
  title?: string;
  description?: string;
  ctaText?: string;
}

const NotReadyToBook = ({ 
  onOpenChat, 
  variant = "default", 
  className = "",
  title,
  description,
  ctaText
}: NotReadyToBookProps) => {
  // Variant C: Testimonial-focused with social proof
  if (variant === "c") {
    return (
      <section className={`bg-gradient-to-br from-secondary/30 to-primary/5 rounded-2xl p-8 border border-border/20 ${className}`}>
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-accent text-accent" />
            ))}
          </div>
          
          <div className="relative mb-6">
            <Quote className="absolute -top-2 -left-2 h-8 w-8 text-accent/20" />
            <p className="text-lg text-foreground italic text-center px-6">
              "I was nervous about the cost and process, but the Care Team walked me through everything. 
              They even helped me understand my insurance benefits. Best decision I ever made."
            </p>
            <p className="text-sm text-muted-foreground text-center mt-3">
              — Sarah M., Augusta patient since 2023
            </p>
          </div>
          
          <div className="bg-background/50 rounded-xl p-4 mb-6">
            <p className="text-center text-sm text-muted-foreground mb-3">
              <span className="font-semibold text-foreground">500+ patients</span> have started their journey with a simple conversation
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Insurance questions answered
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                No pressure, no obligation
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Real humans, real answers
              </span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            {onOpenChat && (
              <Button 
                onClick={onOpenChat} 
                variant="default"
                className="gap-2 rounded-full"
              >
                <MessageCircle className="h-5 w-5" />
                {ctaText || "Chat with Virtual Care Team"}
              </Button>
            )}
            
            <a 
              href="tel:+17067603470" 
              className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-full font-medium hover:border-accent hover:text-accent transition-colors"
            >
              <Phone className="h-5 w-5" />
              Or Call: (706) 760-3470
            </a>
          </div>
          
          <p className="text-xs text-muted-foreground italic text-center mt-4">
            Administrative support only • No medical advice provided
          </p>
        </div>
      </section>
    );
  }

  // Variant B: More empathetic, urgency-focused copy
  if (variant === "b") {
    return (
      <section className={`bg-gradient-to-br from-secondary/40 to-accent/5 rounded-2xl p-8 text-center border border-accent/20 ${className}`}>
        <div className="flex justify-center mb-4">
          <Heart className="h-8 w-8 text-accent" />
        </div>
        <h3 className="text-2xl font-playfair font-medium text-foreground mb-3">
          {title || "Questions? We're here for you."}
        </h3>
        <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
          {description || "Taking the first step toward better health can feel overwhelming. Our dedicated Care Team has helped hundreds of patients just like you navigate insurance, understand our approach, and feel confident about their decision."}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-6">
          {onOpenChat && (
            <Button 
              onClick={onOpenChat} 
              variant="default"
              className="gap-2 rounded-full"
            >
              <MessageCircle className="h-5 w-5" />
              {ctaText || "Chat with Virtual Care Team"}
            </Button>
          )}
          
          <a 
            href="tel:+17067603470" 
            className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-full font-medium hover:border-accent hover:text-accent transition-colors"
          >
            <Phone className="h-5 w-5" />
            Or Call: (706) 760-3470
          </a>
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
          {title || "Not ready to book? Let's chat first."}
        </p>
        <p className="text-xs text-muted-foreground mb-3">
          {description || "Questions about our process, insurance, or pricing? Our virtual care team can help instantly."}
        </p>
        <div className="flex flex-col gap-2">
          {onOpenChat && (
            <button 
              onClick={onOpenChat} 
              className="inline-flex items-center justify-center gap-2 text-accent hover:text-accent/80 font-medium text-sm transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{ctaText || "Chat with Virtual Care Team"}</span>
            </button>
          )}
          <a 
            href="tel:+17067603470" 
            className="inline-flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors"
          >
            <Phone className="h-4 w-4" />
            <span>Or call: (706) 760-3470</span>
          </a>
        </div>
        <p className="text-[10px] text-muted-foreground mt-3 italic text-center">
          Admin questions only • No medical advice provided
        </p>
      </div>
    );
  }

  // Variant A (default): Original "Let's chat first" copy
  return (
    <section className={`bg-background rounded-2xl p-8 text-center border border-border/30 ${className}`}>
      <h3 className="text-2xl font-playfair font-medium text-foreground mb-3">
        {title || "Have Questions? Chat with Us First."}
      </h3>
      <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
        {description || "Our virtual care team can instantly answer your questions about pricing, insurance, and our process—24/7."}
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-4">
        {onOpenChat && (
          <Button 
            onClick={onOpenChat} 
            variant="default"
            className="gap-2"
          >
            <MessageCircle className="h-5 w-5" />
            {ctaText || "Chat with Virtual Care Team"}
          </Button>
        )}
        
        <a 
          href="tel:+17067603470" 
          className="inline-flex items-center gap-2 text-lg font-medium text-muted-foreground hover:text-accent transition-colors"
        >
          <Phone className="h-5 w-5" />
          Or Call: (706) 760-3470
        </a>
      </div>
      
      <p className="text-xs text-muted-foreground italic">
        We can answer your administrative questions instantly. No medical advice provided.
      </p>
    </section>
  );
};

export default NotReadyToBook;
