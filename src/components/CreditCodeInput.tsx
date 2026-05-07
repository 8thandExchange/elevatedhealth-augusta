import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Tag, X } from "lucide-react";

interface CreditCodeInputProps {
  value: string;
  onChange: (value: string) => void;
  isApplied: boolean;
  onApply: () => void;
  onClear: () => void;
  className?: string;
}

export const CreditCodeInput = ({
  value,
  onChange,
  isApplied,
  onApply,
  onClear,
  className = "",
}: CreditCodeInputProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (isApplied) {
    return (
      <div className={`flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg ${className}`}>
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <span className="text-sm text-green-700 font-medium flex-1">
          $79 credit applied: {value}
        </span>
        <button
          onClick={onClear}
          className="text-green-600 hover:text-green-800"
          aria-label="Remove credit code"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className={`flex items-center gap-2 text-xs text-primary hover:text-primary/80 transition-colors ${className}`}
      >
        <Tag className="h-3.5 w-3.5" />
        Have a credit code from your consultation?
      </button>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Enter credit code (e.g., EH-ABC123)"
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase().trim())}
          className="text-sm h-9"
          maxLength={20}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onApply}
          disabled={!value || value.length < 5}
          className="h-9 px-3"
        >
          Apply
        </Button>
      </div>
      <button
        onClick={() => {
          setIsExpanded(false);
          onChange("");
        }}
        className="text-xs text-muted-foreground hover:text-foreground"
      >
        Cancel
      </button>
    </div>
  );
};
