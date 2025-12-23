import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Search, CreditCard, Copy, Check, Calendar, DollarSign } from "lucide-react";
import { format } from "date-fns";

interface CreditCode {
  id: string;
  credit_code: string;
  customer_email: string;
  customer_name: string | null;
  amount_paid: number | null;
  created_at: string;
  status: string;
}

const CreditCodeLookup = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<CreditCode[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error("Please enter an email or name to search");
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      // Search consultation_bookings for unused credits
      const { data, error } = await supabase
        .from("consultation_bookings")
        .select("id, credit_code, customer_email, customer_name, amount_paid, created_at, status")
        .or(`customer_email.ilike.%${searchTerm.trim()}%,customer_name.ilike.%${searchTerm.trim()}%`)
        .is("credit_used_at", null)
        .eq("status", "paid")
        .not("credit_code", "is", null)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      setResults(data || []);
      
      if (!data || data.length === 0) {
        toast.info("No unused credit codes found for this search");
      } else {
        toast.success(`Found ${data.length} unused credit code${data.length > 1 ? "s" : ""}`);
      }
    } catch (err: any) {
      console.error("Credit code search error:", err);
      toast.error(err.message || "Failed to search credit codes");
    } finally {
      setIsSearching(false);
    }
  };

  const copyToClipboard = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      toast.success("Credit code copied to clipboard");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 text-amber-600">
          <CreditCard className="w-4 h-4" />
          Credit Code Lookup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">
          Search for unused consultation credit codes by patient email or name.
        </p>

        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="credit-search" className="sr-only">
              Search by email or name
            </Label>
            <Input
              id="credit-search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Email or patient name..."
              disabled={isSearching}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={isSearching || !searchTerm.trim()}
            variant="outline"
            className="border-amber-500/50 text-amber-600 hover:bg-amber-500/10"
          >
            {isSearching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </Button>
        </div>

        {hasSearched && (
          <div className="space-y-2">
            {results.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground text-sm">
                No unused credit codes found
              </div>
            ) : (
              results.map((result) => (
                <div
                  key={result.id}
                  className="bg-background/50 rounded-lg p-3 border border-border/50 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-mono text-sm font-semibold text-amber-600">
                      {result.credit_code}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(result.credit_code, result.id)}
                      className="h-7 px-2"
                    >
                      {copiedId === result.id ? (
                        <Check className="w-3.5 h-3.5 text-green-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{result.customer_name || "Unknown"}</span>
                      <span>·</span>
                      <span>{result.customer_email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        ${result.amount_paid || 99}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(result.created_at), "MMM d, yyyy")}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CreditCodeLookup;
