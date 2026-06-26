import { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export function BillingPortalButton({ className }: { className?: string }) {
  const [loading, setLoading] = useState(false);

  const openPortal = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-customer-portal-session", {
        body: {},
      });
      if (error) throw error;
      if (data?.url) {
        window.location.assign(data.url as string);
        return;
      }
      if (data?.error === "no_billing_account") {
        toast.info("Your billing account is created with your first payment.");
        return;
      }
      throw new Error(data?.message || data?.error || "Could not open billing portal");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not open billing portal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      className={`justify-start font-jost w-full ${className ?? ""}`}
      onClick={() => void openPortal()}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <CreditCard className="mr-2 h-4 w-4" />
      )}
      Manage billing & membership
    </Button>
  );
}

export default BillingPortalButton;
