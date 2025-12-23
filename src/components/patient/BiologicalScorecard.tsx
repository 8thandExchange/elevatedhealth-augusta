import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp } from "lucide-react";
import PillarRing from "./PillarRing";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LabData {
  // Hormones
  testosterone_t?: number | null;
  estradiol_e2?: number | null;
  cortisol_morning?: number | null;
  cortisol_noon?: number | null;
  cortisol_evening?: number | null;
  cortisol_night?: number | null;
  dhea_s?: number | null;
  progesterone_pg?: number | null;
  // Metabolic
  fasting_insulin?: number | null;
  a1c?: number | null;
  tsh?: number | null;
  free_t3?: number | null;
  free_t4?: number | null;
  // Brain
  serotonin?: number | null;
  dopamine?: number | null;
  gaba?: number | null;
  glutamate?: number | null;
  // Toxicity
  mercury?: number | null;
  lead_level?: number | null;
  arsenic?: number | null;
  cadmium?: number | null;
  // Nutrients
  vitamin_d?: number | null;
  magnesium?: number | null;
  selenium?: number | null;
  zinc?: number | null;
}

interface BiologicalScorecardProps {
  patientId: string;
  patientEmail: string;
  patientName: string;
  labData: LabData | null;
  gender?: string;
  hasToxicityPayment?: boolean;
  hasElevatedArchitecturePayment?: boolean;
}

// Scoring logic for each pillar
const calculateHormonalScore = (data: LabData | null, gender?: string): number | null => {
  if (!data) return null;
  
  const values = [data.testosterone_t, data.estradiol_e2, data.cortisol_morning, data.dhea_s];
  const validValues = values.filter(v => v !== null && v !== undefined);
  
  if (validValues.length === 0) return null;
  
  // Simplified scoring - each value contributes to the score
  let score = 70; // Base score
  
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
  
  if (data.tsh !== null && data.tsh !== undefined) {
    if (data.tsh >= 1.0 && data.tsh <= 2.5) score += 10;
    else score -= 10;
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
  
  if (data.glutamate !== null && data.glutamate !== undefined) {
    if (data.glutamate > 50) score -= 15; // Excitotoxicity
  }
  
  return Math.max(0, Math.min(100, score));
};

const calculateToxicityScore = (data: LabData | null): number | null => {
  if (!data) return null;
  
  const values = [data.mercury, data.lead_level, data.arsenic, data.cadmium];
  const validValues = values.filter(v => v !== null && v !== undefined);
  
  if (validValues.length === 0) return null;
  
  let score = 100; // Start high - lower with toxicity
  
  if (data.mercury !== null && data.mercury !== undefined) {
    if (data.mercury > 5) score -= 25;
    else if (data.mercury > 2) score -= 10;
  }
  
  if (data.lead_level !== null && data.lead_level !== undefined) {
    if (data.lead_level > 5) score -= 25;
    else if (data.lead_level > 2) score -= 10;
  }
  
  if (data.arsenic !== null && data.arsenic !== undefined) {
    if (data.arsenic > 35) score -= 25;
    else if (data.arsenic > 15) score -= 10;
  }
  
  if (data.cadmium !== null && data.cadmium !== undefined) {
    if (data.cadmium > 1) score -= 25;
    else if (data.cadmium > 0.5) score -= 10;
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
  
  if (data.selenium !== null && data.selenium !== undefined) {
    if (data.selenium >= 100 && data.selenium <= 150) score += 10;
    else if (data.selenium < 80) score -= 10;
  }
  
  if (data.zinc !== null && data.zinc !== undefined) {
    if (data.zinc >= 80 && data.zinc <= 120) score += 10;
    else if (data.zinc < 60) score -= 10;
  }
  
  return Math.max(0, Math.min(100, score));
};

const BiologicalScorecard = ({
  patientId,
  patientEmail,
  patientName,
  labData,
  gender,
  hasToxicityPayment = false,
  hasElevatedArchitecturePayment = false,
}: BiologicalScorecardProps) => {
  const [loadingCheckout, setLoadingCheckout] = useState<string | null>(null);

  const hormonalScore = calculateHormonalScore(labData, gender);
  const metabolicScore = calculateMetabolicScore(labData);
  const brainScore = calculateBrainScore(labData);
  const toxicityScore = calculateToxicityScore(labData);
  const nutrientScore = calculateNutrientScore(labData);

  // Calculate overall health score
  const scores = [hormonalScore, metabolicScore, brainScore, toxicityScore, nutrientScore].filter(s => s !== null) as number[];
  const overallScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

  // TEMPORARILY HIDDEN - Only offering Hormone Mapping Kit for now
  // const handleUnlockToxicity = async () => {
  //   setLoadingCheckout('toxicity');
  //   try {
  //     const { data, error } = await supabase.functions.invoke('create-toxicity-checkout', {
  //       body: { patientId, patientEmail, patientName }
  //     });
  //     if (error) throw error;
  //     if (data?.url) {
  //       window.open(data.url, '_blank');
  //     }
  //   } catch (err) {
  //     console.error('Checkout error:', err);
  //     toast.error('Failed to start checkout');
  //   } finally {
  //     setLoadingCheckout(null);
  //   }
  // };

  // TEMPORARILY HIDDEN - Only offering Hormone Mapping Kit for now
  // const handleUnlockBundle = async () => {
  //   setLoadingCheckout('bundle');
  //   try {
  //     const { data, error } = await supabase.functions.invoke('create-total-body-checkout', {
  //       body: { patientId, patientEmail, patientName }
  //     });
  //     if (error) throw error;
  //     if (data?.url) {
  //       window.open(data.url, '_blank');
  //     }
  //   } catch (err) {
  //     console.error('Checkout error:', err);
  //     toast.error('Failed to start checkout');
  //   } finally {
  //     setLoadingCheckout(null);
  //   }
  // };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-card to-card/80">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <CardTitle className="text-xl font-cormorant">Biological Scorecard</CardTitle>
          </div>
          {overallScore !== null && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">{overallScore}% Overall</span>
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Your health across 5 key biological pillars
        </p>
      </CardHeader>
      <CardContent>
        {/* Pillar Rings Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-6">
          <PillarRing
            pillar="hormonal"
            score={hormonalScore}
            label="Hormonal Health"
            unlockPrice={299}
          />
          <PillarRing
            pillar="metabolic"
            score={metabolicScore}
            label="Metabolic Engine"
            unlockPrice={399}
          />
          <PillarRing
            pillar="brain"
            score={brainScore}
            label="Brain Balance"
            unlockPrice={399}
          />
          <PillarRing
            pillar="toxicity"
            score={hasToxicityPayment || hasElevatedArchitecturePayment ? toxicityScore : null}
            label="Toxicity Load"
            unlockPrice={299}
            // TEMPORARILY HIDDEN - Only offering Hormone Mapping Kit for now
            // onUnlock={handleUnlockToxicity}
            // isLoading={loadingCheckout === 'toxicity'}
          />
          <PillarRing
            pillar="nutrient"
            score={nutrientScore}
            label="Nutrient Status"
            unlockPrice={199}
          />
        </div>

        {/* TEMPORARILY HIDDEN - Only offering Hormone Mapping Kit for now */}
        {/* Elevated Architecture Bundle Promo */}
        {/* {!hasElevatedArchitecturePayment && (
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 p-4 border border-primary/20">
            ...
          </div>
        )} */}
      </CardContent>
    </Card>
  );
};

export default BiologicalScorecard;
