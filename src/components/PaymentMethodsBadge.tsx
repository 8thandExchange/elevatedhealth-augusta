import { CreditCard } from "lucide-react";

interface PaymentMethodsBadgeProps {
  variant?: "light" | "dark" | "compact";
  showText?: boolean;
  className?: string;
}

const PaymentMethodsBadge = ({ 
  variant = "light", 
  showText = true,
  className = "" 
}: PaymentMethodsBadgeProps) => {
  const isDark = variant === "dark";
  const isCompact = variant === "compact";
  
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {showText && !isCompact && (
        <span className={`text-xs font-lato ${isDark ? "text-background/70" : "text-muted-foreground"}`}>
          Flexible financing available
        </span>
      )}
      
      <div className="flex items-center gap-2">
        {/* Klarna Logo */}
        <div 
          className={`px-2 py-1 rounded text-[10px] font-bold ${
            isDark 
              ? "bg-background/10 text-background" 
              : "bg-[#FFB3C7] text-[#17120F]"
          }`}
        >
          Klarna
        </div>
        
        {/* Affirm Logo */}
        <div 
          className={`px-2 py-1 rounded text-[10px] font-bold ${
            isDark 
              ? "bg-background/10 text-background" 
              : "bg-[#0FA0EA] text-white"
          }`}
        >
          affirm
        </div>
        
        {/* Card icons */}
        <div className={`flex items-center gap-1 ${isDark ? "text-background/60" : "text-muted-foreground"}`}>
          <CreditCard className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodsBadge;
