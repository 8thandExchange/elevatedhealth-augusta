import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Brain, Beaker, AlertTriangle, CheckCircle, Copy, Sparkles, Activity, Flame, Heart, Pill, ArrowRight } from 'lucide-react';
import { analyzeLabResults, LabValues, ClinicalImpression, REFERENCE_RANGES, KitType } from '@/lib/holgateLogic';
import { generateMedicationRecommendations, MedicationRecommendation } from '@/lib/medicationMapping';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LabInterpretationEngineProps {
  patientId: string;
  patientName: string;
  patientGender?: string;
  onApplyToRx?: (recommendations: MedicationRecommendation[]) => void;
}

export function LabInterpretationEngine({ patientId, patientName, patientGender = 'female', onApplyToRx }: LabInterpretationEngineProps) {
  const [kitType, setKitType] = useState<KitType>('hormone_mapping');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [impression, setImpression] = useState<ClinicalImpression | null>(null);
  const [medicationRecs, setMedicationRecs] = useState<MedicationRecommendation[]>([]);
  
  // Hormone values
  const [estradiol, setEstradiol] = useState('');
  const [progesterone, setProgesterone] = useState('');
  const [testosterone, setTestosterone] = useState('');
  const [dheaS, setDheaS] = useState('');
  
  // Cortisol curve
  const [cortisolMorning, setCortisolMorning] = useState('');
  const [cortisolNoon, setCortisolNoon] = useState('');
  const [cortisolEvening, setCortisolEvening] = useState('');
  const [cortisolNight, setCortisolNight] = useState('');
  
  // Neurotransmitters
  const [serotonin, setSerotonin] = useState('');
  const [gaba, setGaba] = useState('');
  const [dopamine, setDopamine] = useState('');
  const [glutamate, setGlutamate] = useState('');
  const [norepinephrine, setNorepinephrine] = useState('');
  const [epinephrine, setEpinephrine] = useState('');
  
  // Metabolic/Thyroid values
  const [tsh, setTsh] = useState('');
  const [freeT3, setFreeT3] = useState('');
  const [freeT4, setFreeT4] = useState('');
  const [tpoAntibodies, setTpoAntibodies] = useState('');
  const [fastingInsulin, setFastingInsulin] = useState('');
  const [a1c, setA1c] = useState('');
  const [vitaminD, setVitaminD] = useState('');
  const [triglycerides, setTriglycerides] = useState('');
  const [hdl, setHdl] = useState('');
  const [ldl, setLdl] = useState('');

  const parseValue = (val: string): number | null => {
    const num = parseFloat(val);
    return isNaN(num) ? null : num;
  };

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    
    const values: LabValues = {
      estradiol_e2: parseValue(estradiol),
      progesterone_pg: parseValue(progesterone),
      testosterone_t: parseValue(testosterone),
      dhea_s: parseValue(dheaS),
      cortisol_morning: parseValue(cortisolMorning),
      cortisol_noon: parseValue(cortisolNoon),
      cortisol_evening: parseValue(cortisolEvening),
      cortisol_night: parseValue(cortisolNight),
      serotonin: parseValue(serotonin),
      gaba: parseValue(gaba),
      dopamine: parseValue(dopamine),
      glutamate: parseValue(glutamate),
      norepinephrine: parseValue(norepinephrine),
      epinephrine: parseValue(epinephrine),
      // Metabolic/Thyroid
      tsh: parseValue(tsh),
      free_t3: parseValue(freeT3),
      free_t4: parseValue(freeT4),
      tpo_antibodies: parseValue(tpoAntibodies),
      fasting_insulin: parseValue(fastingInsulin),
      a1c: parseValue(a1c),
      vitamin_d: parseValue(vitaminD),
      triglycerides: parseValue(triglycerides),
      hdl: parseValue(hdl),
      ldl: parseValue(ldl),
    };
    
    // Simulate brief processing for UX
    setTimeout(() => {
      const result = analyzeLabResults(values, patientGender, kitType);
      setImpression(result);
      
      // Generate medication recommendations from Holgate analysis
      const meds = generateMedicationRecommendations(result, values, patientGender);
      setMedicationRecs(meds);
      
      setIsAnalyzing(false);
    }, 500);
  };

  const handleApplyToRx = () => {
    if (medicationRecs.length > 0 && onApplyToRx) {
      onApplyToRx(medicationRecs);
      toast.success('Medication recommendations applied to Rx card');
    }
  };

  const handleSaveToRecord = async () => {
    if (!impression) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase.from('lab_results').insert({
        patient_id: patientId,
        collection_date: new Date().toISOString().split('T')[0],
        kit_type: kitType,
        estradiol_e2: parseValue(estradiol),
        progesterone_pg: parseValue(progesterone),
        testosterone_t: parseValue(testosterone),
        dhea_s: parseValue(dheaS),
        cortisol_morning: parseValue(cortisolMorning),
        cortisol_noon: parseValue(cortisolNoon),
        cortisol_evening: parseValue(cortisolEvening),
        cortisol_night: parseValue(cortisolNight),
        serotonin: parseValue(serotonin),
        gaba: parseValue(gaba),
        dopamine: parseValue(dopamine),
        glutamate: parseValue(glutamate),
        norepinephrine: parseValue(norepinephrine),
        epinephrine: parseValue(epinephrine),
        tsh: parseValue(tsh),
        free_t3: parseValue(freeT3),
        free_t4: parseValue(freeT4),
        tpo_antibodies: parseValue(tpoAntibodies),
        fasting_insulin: parseValue(fastingInsulin),
        vitamin_d: parseValue(vitaminD),
        triglycerides: parseValue(triglycerides),
        hdl: parseValue(hdl),
        ldl: parseValue(ldl),
        clinical_story: impression.story,
        treatment_plan: impression.protocols as any,
      } as any);
      
      if (error) throw error;
      toast.success('Lab results and interpretation saved to patient record');
    } catch (error) {
      console.error('Error saving lab results:', error);
      toast.error('Failed to save lab results');
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = () => {
    if (!impression) return;
    
    const kitLabels: Record<KitType, string> = {
      hormone_mapping: 'Hormone Mapping (Saliva Profile III)',
      neuro_reset: 'Neuro-Reset (Neuro + Saliva)',
      metabolic_thyroid: 'Metabolic Architecture (Weight Management + Thyroid + Cardio)',
    };
    
    let text = `CLINICAL IMPRESSION - ${patientName}\n`;
    text += `Kit Type: ${kitLabels[kitType]}\n\n`;
    text += `THE STORY:\n${impression.story}\n\n`;
    text += `FINDINGS:\n`;
    impression.findings.forEach(f => {
      text += `• [${f.priority.toUpperCase()}] ${f.pattern}: ${f.description}\n`;
    });
    text += `\nTREATMENT PLAN:\n`;
    impression.protocols.forEach(p => {
      text += `${p.priority}. ${p.name} - ${p.dosage} (${p.timing})\n   Rationale: ${p.rationale}\n`;
    });
    
    navigator.clipboard.writeText(text);
    toast.success('Clinical impression copied to clipboard');
  };

  const InputWithHint = ({ 
    label, 
    value, 
    onChange, 
    hint 
  }: { 
    label: string; 
    value: string; 
    onChange: (val: string) => void; 
    hint: string;
  }) => (
    <div className="space-y-1">
      <Label className="text-sm font-medium">{label}</Label>
      <Input 
        type="number" 
        step="0.01"
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter value"
        className="h-9"
      />
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Kit Type Selector */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Beaker className="h-5 w-5 text-primary" />
            Lab Interpretation Engine
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Select Kit Type</Label>
              <Select value={kitType} onValueChange={(val) => setKitType(val as KitType)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hormone_mapping">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-pink-500" />
                      Hormone Mapping (Saliva Profile III)
                    </div>
                  </SelectItem>
                  <SelectItem value="neuro_reset">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-purple-500" />
                      Neuro-Reset (Neuro + Saliva)
                    </div>
                  </SelectItem>
                  {/* Metabolic Architecture ($599 Kit) - Discontinued */}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hormone Panel */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4 text-pink-500" />
            Hormone Panel (Saliva Profile III)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <InputWithHint 
              label="Estradiol (E2)" 
              value={estradiol} 
              onChange={setEstradiol}
              hint={`Optimal: ${patientGender === 'male' ? '1.0-3.0' : '1.3-3.3'} pg/mL`}
            />
            <InputWithHint 
              label="Progesterone (Pg)" 
              value={progesterone} 
              onChange={setProgesterone}
              hint="Optimal: 75-270 pg/mL"
            />
            <InputWithHint 
              label="Testosterone (T)" 
              value={testosterone} 
              onChange={setTestosterone}
              hint={`Optimal: ${patientGender === 'male' ? '50-210' : '20-55'} pg/mL`}
            />
            <InputWithHint 
              label="DHEA-S (DS)" 
              value={dheaS} 
              onChange={setDheaS}
              hint="Optimal: 150-350 ng/mL"
            />
          </div>
        </CardContent>
      </Card>

      {/* Cortisol - Conditional based on kit type */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {kitType === 'hormone_mapping' ? 'Morning Cortisol (Saliva)' : 'Cortisol Curve (4-Point)'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {kitType === 'hormone_mapping' ? (
            // Single cortisol for ZRT Saliva Profile III
            <div className="max-w-xs">
              <InputWithHint 
                label="Morning Cortisol (AM)" 
                value={cortisolMorning} 
                onChange={setCortisolMorning}
                hint="Optimal: 8-25 ng/dL"
              />
            </div>
          ) : (
            // Full 4-point curve for other kits
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <InputWithHint 
                label="Morning (AM)" 
                value={cortisolMorning} 
                onChange={setCortisolMorning}
                hint="Optimal: 8-25 ng/dL"
              />
              <InputWithHint 
                label="Noon" 
                value={cortisolNoon} 
                onChange={setCortisolNoon}
                hint="Optimal: 5-12 ng/dL"
              />
              <InputWithHint 
                label="Evening" 
                value={cortisolEvening} 
                onChange={setCortisolEvening}
                hint="Optimal: 3-8 ng/dL"
              />
              <InputWithHint 
                label="Night" 
                value={cortisolNight} 
                onChange={setCortisolNight}
                hint="Optimal: 1-4 ng/dL"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Neurotransmitter Panel - Only show for Neuro-Reset */}
      {kitType === 'neuro_reset' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-500" />
              Neurotransmitter Panel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <InputWithHint 
                label="Serotonin" 
                value={serotonin} 
                onChange={setSerotonin}
                hint="Optimal: 100-225 mcg/g"
              />
              <InputWithHint 
                label="GABA" 
                value={gaba} 
                onChange={setGaba}
                hint="Optimal: 500-1500 mcg/g"
              />
              <InputWithHint 
                label="Dopamine" 
                value={dopamine} 
                onChange={setDopamine}
                hint="Optimal: 150-350 mcg/g"
              />
              <InputWithHint 
                label="Glutamate" 
                value={glutamate} 
                onChange={setGlutamate}
                hint="Optimal: 10-60 mcg/g"
              />
              <InputWithHint 
                label="Norepinephrine" 
                value={norepinephrine} 
                onChange={setNorepinephrine}
                hint="Optimal: 30-60 mcg/g"
              />
              <InputWithHint 
                label="Epinephrine" 
                value={epinephrine} 
                onChange={setEpinephrine}
                hint="Optimal: 5-15 mcg/g"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metabolic + Thyroid Panel - Only show for metabolic_thyroid */}
      {kitType === 'metabolic_thyroid' && (
        <>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Flame className="h-4 w-4 text-amber-500" />
                Thyroid Panel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <InputWithHint label="TSH" value={tsh} onChange={setTsh} hint="Optimal: 1.0-2.5 mIU/L" />
                <InputWithHint label="Free T3" value={freeT3} onChange={setFreeT3} hint="Optimal: 2.5-4.2 pg/mL" />
                <InputWithHint label="Free T4" value={freeT4} onChange={setFreeT4} hint="Optimal: 1.0-1.5 ng/dL" />
                <InputWithHint label="TPO Antibodies" value={tpoAntibodies} onChange={setTpoAntibodies} hint="Negative: <35 IU/mL" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500" />
                Metabolic & Lipid Panel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <InputWithHint label="Fasting Insulin" value={fastingInsulin} onChange={setFastingInsulin} hint="Optimal: 2-8 uIU/mL" />
                <InputWithHint label="HbA1c (%)" value={a1c} onChange={setA1c} hint="Normal: <5.7%" />
                <InputWithHint label="Vitamin D" value={vitaminD} onChange={setVitaminD} hint="Optimal: 50-80 ng/mL" />
                <InputWithHint label="Triglycerides" value={triglycerides} onChange={setTriglycerides} hint="Optimal: <150 mg/dL" />
                <InputWithHint label="HDL" value={hdl} onChange={setHdl} hint={`Optimal: >${patientGender === 'male' ? '40' : '50'} mg/dL`} />
                <InputWithHint label="LDL" value={ldl} onChange={setLdl} hint="Optimal: <100 mg/dL" />
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Analyze Button */}
      <Button 
        onClick={handleAnalyze} 
        disabled={isAnalyzing}
        className="w-full"
        size="lg"
      >
        {isAnalyzing ? (
          <>
            <Sparkles className="h-4 w-4 mr-2 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 mr-2" />
            Analyze Labs
          </>
        )}
      </Button>

      {/* Clinical Impression Output */}
      {impression && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Clinical Impression
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
                <Button size="sm" onClick={handleSaveToRecord} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save to Record'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* The Story */}
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                The Story (Tell the Patient)
              </h4>
              <p className="text-foreground leading-relaxed bg-background p-4 rounded-lg border">
                "{impression.story}"
              </p>
            </div>

            <Separator />

            {/* Findings */}
            {impression.findings.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                  Findings
                </h4>
                <div className="space-y-2">
                  {impression.findings.map((finding, idx) => (
                    <div 
                      key={idx}
                      className="flex items-start gap-3 p-3 rounded-lg bg-background border"
                    >
                      {finding.priority === 'high' ? (
                        <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                      ) : (
                        <CheckCircle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{finding.pattern}</span>
                          <Badge 
                            variant={finding.priority === 'high' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {finding.priority}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {finding.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {finding.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* The Plan */}
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                The Plan (Recommended Protocols)
              </h4>
              {impression.protocols.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No specific protocols recommended. Continue monitoring.
                </p>
              ) : (
                <div className="space-y-3">
                  {impression.protocols.map((protocol, idx) => (
                    <div 
                      key={idx}
                      className="p-4 rounded-lg bg-background border"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Badge 
                          className={
                            protocol.priority === 1 
                              ? 'bg-destructive text-destructive-foreground' 
                              : protocol.priority === 2 
                              ? 'bg-amber-500 text-white'
                              : 'bg-emerald-500 text-white'
                          }
                        >
                          Priority {protocol.priority}
                        </Badge>
                        <span className="font-semibold">{protocol.name}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Dosage:</span>{' '}
                          <span className="font-medium">{protocol.dosage}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Timing:</span>{' '}
                          <span className="font-medium">{protocol.timing}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2 italic">
                        {protocol.rationale}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Medication Recommendations - Apply to Rx */}
            {medicationRecs.length > 0 && onApplyToRx && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                    Recommended Medications (Holgate Protocol)
                  </h4>
                  <div className="space-y-2 mb-4">
                    {medicationRecs.map((med, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                        <Pill className="h-5 w-5 text-green-600" />
                        <div className="flex-1">
                          <p className="font-medium text-green-800">{med.name}</p>
                          <p className="text-sm text-green-600">{med.strength}</p>
                        </div>
                        <Badge variant="outline" className="border-green-400 text-green-700">
                          Priority {med.priority}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <Button onClick={handleApplyToRx} className="w-full gap-2" size="lg">
                    <Pill className="h-4 w-4" />
                    Apply to Rx Card
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
