import { useState } from "react";
import { TestTube, Sparkles, ArrowRight, Loader2, CheckCircle, Package, Truck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface NeurotransmitterPayment {
  id: string;
  kit_status: string;
  tracking_number: string | null;
  shipped_at: string | null;
  sample_received_at: string | null;
  results_ready_at: string | null;
}

interface NeurotransmitterCardProps {
  patientEmail?: string;
  patientName?: string;
  patientId?: string;
  existingPayment?: NeurotransmitterPayment | null;
}

const NeurotransmitterCard = ({ patientEmail, patientName, patientId, existingPayment }: NeurotransmitterCardProps) => {
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-neurotransmitter-checkout', {
        body: { 
          email: patientEmail,
          name: patientName,
          patientId: patientId
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

  // If already ordered, show status tracker
  if (existingPayment && existingPayment.kit_status !== 'not_ordered') {
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
            <Badge className="bg-green-500/20 text-green-600 border-green-500/30">
              <CheckCircle className="h-3 w-3 mr-1" />
              Ordered
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Status Timeline */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${existingPayment.kit_status === 'ordered' || existingPayment.shipped_at ? 'bg-green-500/20' : 'bg-muted'}`}>
                <Package className={`h-4 w-4 ${existingPayment.kit_status === 'ordered' || existingPayment.shipped_at ? 'text-green-600' : 'text-muted-foreground'}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Kit Ordered</p>
                <p className="text-xs text-muted-foreground">Your ZRT Neurotransmitter kit is being prepared</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${existingPayment.shipped_at ? 'bg-green-500/20' : 'bg-muted'}`}>
                <Truck className={`h-4 w-4 ${existingPayment.shipped_at ? 'text-green-600' : 'text-muted-foreground'}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Shipped</p>
                {existingPayment.shipped_at ? (
                  <p className="text-xs text-green-600">
                    {existingPayment.tracking_number && (
                      <a 
                        href={`https://tools.usps.com/go/TrackConfirmAction?tLabels=${existingPayment.tracking_number}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:no-underline"
                      >
                        Track: {existingPayment.tracking_number}
                      </a>
                    )}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">Ships within 3-5 business days</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${existingPayment.sample_received_at ? 'bg-green-500/20' : 'bg-muted'}`}>
                <TestTube className={`h-4 w-4 ${existingPayment.sample_received_at ? 'text-green-600' : 'text-muted-foreground'}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Sample Received</p>
                <p className="text-xs text-muted-foreground">Lab processing your sample</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${existingPayment.results_ready_at ? 'bg-green-500/20' : 'bg-muted'}`}>
                <Sparkles className={`h-4 w-4 ${existingPayment.results_ready_at ? 'text-green-600' : 'text-muted-foreground'}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Results Ready</p>
                <p className="text-xs text-muted-foreground">Provider will review and contact you</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show purchase card
  return (
    <Card className="border-accent/30 bg-gradient-to-br from-accent/5 to-background overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-serif">
            <div className="p-2 rounded-full bg-accent/20">
              <TestTube className="h-5 w-5 text-accent" />
            </div>
            Optimize Your Brain Chemistry
          </CardTitle>
          <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
            Optional Add-on
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Analyze your Serotonin, Dopamine, and GABA levels to tailor your Ketamine therapy 
          for optimal mental health outcomes.
        </p>

        <div className="p-4 rounded-lg bg-background/50 border border-border space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium">ZRT Neurotransmitter Profile</span>
          </div>
          
          <ul className="space-y-2 text-xs text-muted-foreground pl-6">
            <li className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-accent" />
              Serotonin, Dopamine & Norepinephrine levels
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-accent" />
              GABA & Glutamate balance assessment
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-accent" />
              Cortisol & HPA axis stress analysis
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-accent" />
              At-home dried urine collection kit included
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-accent" />
              Personalized protocol recommendations
            </li>
          </ul>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div>
            <p className="text-2xl font-serif text-foreground">$399</p>
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
            Order Neurotransmitter Kit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NeurotransmitterCard;
