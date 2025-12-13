import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import HealthPillarRing from "./HealthPillarRing";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LabData {
  testosterone_t?: number | null;
  estradiol_e2?: number | null;
  cortisol_morning?: number | null;
  cortisol_noon?: number | null;
  cortisol_evening?: number | null;
  cortisol_night?: number | null;
  dhea_s?: number | null;
  progesterone_pg?: number | null;
  fasting_insulin?: number | null;
  a1c?: number | null;
  tsh?: number | null;
  free_t3?: number | null;
  free_t4?: number | null;
  serotonin?: number | null;
  dopamine?: number | null;
  gaba?: number | null;
  glutamate?: number | null;
  mercury?: number | null;
  lead_level?: number | null;
  arsenic?: number | null;
  cadmium?: number | null;
  vitamin_d?: number | null;
  magnesium?: number | null;
  selenium?: number | null;
  zinc?: number | null;
}

interface HealthOverviewProps {
  patientId: string;
  patientEmail: string;
  patientName: string;
  labData: LabData | null;
  gender?: string;
  hasToxicityPayment?: boolean;
  hasElevatedArchitecturePayment?: boolean;
}

// Scoring functions (simplified)
const calculateHormonalScore = (data: LabData | null, gender?: string): number | null => {
  if (!data) return null;
  const values = [data.testosterone_t, data.estradiol_e2, data.cortisol_morning, data.dhea_s];
  const validValues = values.filter(v => v !== null && v !== undefined);
  if (validValues.length === 0) return null;
  let score = 70;
  if (data.cortisol_morning !== null && data.cortisol_morning !== undefined) {
    if (data.cortisol_morning >= 5 && data.cortisol_morning <= 25) score += 10;
    else score -= 15;
  }
  if (data.testosterone_t !== null && data.testosterone_t !== undefined) {
    const optimalT = gender === 'male' ? { min: 500, max: 900 } : { min: 20, max: 75 };
    if (data.testosterone_t >= optimalT.min && data.testosterone_t <= optimalT.max) score += 10;
    else score -= 10;
  }
  return Math.max(0, Math.min(100, score));
};

const calculateMetabolicScore = (data: LabData | null): number | null => {
  if (!data) return null;
  const values = [data.fasting_insulin, data.a1c, data.tsh, data.free_t3, data.free_t4];
  const validValues = values.filter(v => v !== null && v !== undefined);
  if (validValues.length === 0) return null;
  let score = 70;
  if (data.fasting_insulin !== null && data.fasting_insulin !== undefined) {
    if (data.fasting_insulin < 5) score += 15;
    else if (data.fasting_insulin > 10) score -= 20;
  }
  if (data.a1c !== null && data.a1c !== undefined) {
    if (data.a1c < 5.4) score += 10;
    else if (data.a1c > 5.7) score -= 15;
  }
  return Math.max(0, Math.min(100, score));
};

const calculateBrainScore = (data: LabData | null): number | null => {
  if (!data) return null;
  const values = [data.serotonin, data.dopamine, data.gaba, data.glutamate];
  const validValues = values.filter(v => v !== null && v !== undefined);
  if (validValues.length === 0) return null;
  let score = 70;
  if (data.serotonin !== null && data.serotonin !== undefined) {
    if (data.serotonin >= 120 && data.serotonin <= 185) score += 10;
    else score -= 15;
  }
  if (data.gaba !== null && data.gaba !== undefined) {
    if (data.gaba >= 2.5 && data.gaba <= 4.5) score += 10;
    else score -= 10;
  }
  return Math.max(0, Math.min(100, score));
};

const calculateToxicityScore = (data: LabData | null): number | null => {
  if (!data) return null;
  const values = [data.mercury, data.lead_level, data.arsenic, data.cadmium];
  const validValues = values.filter(v => v !== null && v !== undefined);
  if (validValues.length === 0) return null;
  let score = 100;
  if (data.mercury !== null && data.mercury !== undefined) {
    if (data.mercury > 5) score -= 25;
    else if (data.mercury > 2) score -= 10;
  }
  if (data.lead_level !== null && data.lead_level !== undefined) {
    if (data.lead_level > 5) score -= 25;
    else if (data.lead_level > 2) score -= 10;
  }
  return Math.max(0, Math.min(100, score));
};

const calculateNutrientScore = (data: LabData | null): number | null => {
  if (!data) return null;
  const values = [data.vitamin_d, data.magnesium, data.selenium, data.zinc];
  const validValues = values.filter(v => v !== null && v !== undefined);
  if (validValues.length === 0) return null;
  let score = 60;
  if (data.vitamin_d !== null && data.vitamin_d !== undefined) {
    if (data.vitamin_d >= 50 && data.vitamin_d <= 80) score += 15;
    else if (data.vitamin_d < 30) score -= 20;
  }
  if (data.magnesium !== null && data.magnesium !== undefined) {
    if (data.magnesium >= 5.0 && data.magnesium <= 6.5) score += 10;
    else if (data.magnesium < 4.5) score -= 15;
  }
  return Math.max(0, Math.min(100, score));
};

const HealthOverview = ({
  patientId,
  patientEmail,
  patientName,
  labData,
  gender,
  hasToxicityPayment = false,
  hasElevatedArchitecturePayment = false,
}: HealthOverviewProps) => {
  const [loadingCheckout, setLoadingCheckout] = useState<string | null>(null);

  const hormonalScore = calculateHormonalScore(labData, gender);
  const metabolicScore = calculateMetabolicScore(labData);
  const brainScore = calculateBrainScore(labData);
  const toxicityScore = calculateToxicityScore(labData);
  const nutrientScore = calculateNutrientScore(labData);

  const scores = [hormonalScore, metabolicScore, brainScore, toxicityScore, nutrientScore].filter(s => s !== null) as number[];
  const overallScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

  const handleUnlockToxicity = async () => {
    setLoadingCheckout('toxicity');
    try {
      const { data, error } = await supabase.functions.invoke('create-toxicity-checkout', {
        body: { patientId, patientEmail, patientName }
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
    } catch {
      toast.error('Failed to start checkout');
    } finally {
      setLoadingCheckout(null);
    }
  };

  const handleUnlockBundle = async () => {
    setLoadingCheckout('bundle');
    try {
      const { data, error } = await supabase.functions.invoke('create-total-body-checkout', {
        body: { patientId, patientEmail, patientName }
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
    } catch {
      toast.error('Failed to start checkout');
    } finally {
      setLoadingCheckout(null);
    }
  };

  return (
    <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border/30 flex items-center justify-between">
        <div>
          <h2 className="font-playfair text-lg font-semibold text-foreground">Health Overview</h2>
          <p className="text-xs text-muted-foreground font-inter">Your biological scorecard</p>
        </div>
        {overallScore !== null && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/10 border border-gold/20">
            <span className="text-sm font-inter font-bold text-gold">{overallScore}%</span>
          </div>
        )}
      </div>

      {/* Pillar Rings */}
      <div className="px-2 py-4">
        <div className="grid grid-cols-5 gap-1">
          <HealthPillarRing
            pillar="hormonal"
            score={hormonalScore}
            label="Hormones"
            unlockPrice={299}
          />
          <HealthPillarRing
            pillar="metabolic"
            score={metabolicScore}
            label="Metabolism"
            unlockPrice={399}
          />
          <HealthPillarRing
            pillar="brain"
            score={brainScore}
            label="Brain"
            unlockPrice={399}
          />
          <HealthPillarRing
            pillar="toxicity"
            score={hasToxicityPayment || hasElevatedArchitecturePayment ? toxicityScore : null}
            label="Toxicity"
            unlockPrice={299}
            onUnlock={handleUnlockToxicity}
            isLoading={loadingCheckout === 'toxicity'}
          />
          <HealthPillarRing
            pillar="nutrient"
            score={nutrientScore}
            label="Nutrients"
            unlockPrice={199}
          />
        </div>
      </div>

      {/* Bundle Promo */}
      {!hasElevatedArchitecturePayment && (
        <div className="mx-4 mb-4 p-4 rounded-xl bg-gradient-to-r from-primary/5 via-gold/5 to-primary/5 border border-gold/20">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold shrink-0" />
              <div>
                <p className="text-sm font-inter font-semibold text-foreground">Unlock All Pillars</p>
                <p className="text-xs text-muted-foreground">The Elevated Architecture™ Protocol</p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={handleUnlockBundle}
              disabled={loadingCheckout === 'bundle'}
              className="bg-gold hover:bg-gold-dark text-primary-foreground font-inter text-xs h-8"
            >
              {loadingCheckout === 'bundle' ? '...' : '$999'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthOverview;
