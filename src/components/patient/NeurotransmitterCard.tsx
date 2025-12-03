import { useState } from "react";
import { TestTube, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface NeurotransmitterCardProps {
  patientEmail?: string;
  patientName?: string;
}

const NeurotransmitterCard = ({ patientEmail, patientName }: NeurotransmitterCardProps) => {
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-neurotransmitter-checkout', {
        body: { 
          email: patientEmail,
          name: patientName
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Unable to start checkout. Please try again or contact support.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-accent/30 bg-gradient-to-br from-accent/5 to-background overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-serif">
            <div className="p-2 rounded-full bg-accent/20">
              <TestTube className="h-5 w-5 text-accent" />
            </div>
            Neurotransmitter Analysis
          </CardTitle>
          <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
            Optional Add-on
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Advanced brain chemistry profiling to optimize your ketamine protocol and 
          personalize your treatment for better outcomes.
        </p>

        <div className="p-4 rounded-lg bg-background/50 border border-border space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium">ZRT Neurotransmitter Profile</span>
          </div>
          
          <ul className="space-y-2 text-xs text-muted-foreground pl-6">
            <li className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-accent" />
              Serotonin, Dopamine, Norepinephrine levels
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-accent" />
              GABA & Glutamate balance assessment
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-accent" />
              Cortisol & stress hormone analysis
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-accent" />
              At-home urine collection kit included
            </li>
          </ul>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div>
            <p className="text-2xl font-serif text-foreground">$349</p>
            <p className="text-xs text-muted-foreground">One-time analysis</p>
          </div>
          
          <Button 
            onClick={handlePurchase}
            disabled={loading}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <ArrowRight className="h-4 w-4 mr-2" />
            )}
            Add to Treatment
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NeurotransmitterCard;
