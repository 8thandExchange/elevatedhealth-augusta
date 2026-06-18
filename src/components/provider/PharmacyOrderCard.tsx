import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Pill, Sparkles, ChevronDown, FlaskConical, ClipboardList } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import PrescriptionPortalModal from "./PrescriptionPortalModal";
import {
  primaryCreamPrescription,
  parseSymptomContext,
  buildSymptomSummary,
  type CreamPrescriptionRecommendation,
} from "@/lib/creamPrescriptionAlgorithm";
import {
  defaultPharmacyCategory,
  findFormularyItem,
  formularyItemsForCategory,
  portalRoutingCategory,
  CUSTOM_PHARMACY_VENDOR,
  type PharmacyFormularyItem,
} from "@/lib/pharmacyOrderFormulary";

interface PatientData {
  id: string;
  full_name: string;
  dob?: string | null;
  email?: string | null;
  phone?: string | null;
  street_address?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  allergies?: string | null;
  medical_history?: Record<string, unknown> | null;
  gender?: string | null;
}

interface PharmacyOrderCardProps {
  patient: PatientData;
  onOrderCreated?: () => void;
}

const CADENCE_OPTIONS = [
  { value: "30", label: "30 Day Supply (New Patient)" },
  { value: "90", label: "90 Day Supply (Renewal)" },
];

const PharmacyOrderCard = ({ patient, onOrderCreated }: PharmacyOrderCardProps) => {
  const [selectedMed, setSelectedMed] = useState<string>("");
  const [cadence, setCadence] = useState<string>("30");
  const [quantity, setQuantity] = useState("1");
  const [refills, setRefills] = useState("2");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [algorithmRec, setAlgorithmRec] = useState<CreamPrescriptionRecommendation | null>(null);
  const [loadingAlgorithm, setLoadingAlgorithm] = useState(true);
  const [hasLabs, setHasLabs] = useState(false);
  const [labDate, setLabDate] = useState<string | null>(null);
  const [symptomSummary, setSymptomSummary] = useState<string>("");
  const [overrideOpen, setOverrideOpen] = useState(false);

  const applyCreamRecommendation = (rec: CreamPrescriptionRecommendation) => {
    setSelectedMed(rec.formularyId);
    setCadence(rec.formularyItem.defaultCadence);
    setRefills("2");
    setAlgorithmRec(rec);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingAlgorithm(true);
      try {
        const [{ data: labRow }, { data: symptomRow }] = await Promise.all([
          supabase
            .from("lab_results")
            .select("*")
            .eq("patient_id", patient.id)
            .order("collection_date", { ascending: false })
            .limit(1)
            .maybeSingle(),
          supabase
            .from("symptom_logs")
            .select("*")
            .eq("patient_id", patient.id)
            .order("date_logged", { ascending: false })
            .limit(1)
            .maybeSingle(),
        ]);

        if (cancelled) return;

        const symptoms = parseSymptomContext(symptomRow ?? null);
        setSymptomSummary(buildSymptomSummary(symptoms, patient.gender));
        setHasLabs(!!labRow);
        setLabDate(
          labRow?.collection_date
            ? new Date(String(labRow.collection_date)).toLocaleDateString()
            : null,
        );

        const rec = primaryCreamPrescription({
          gender: patient.gender,
          labRow: labRow ?? null,
          symptoms,
        });

        if (rec) {
          applyCreamRecommendation(rec);
        } else {
          setAlgorithmRec(null);
          setSelectedMed("");
        }
      } catch (err) {
        console.error("Pharmacy cream algorithm:", err);
      } finally {
        if (!cancelled) setLoadingAlgorithm(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [patient.id, patient.gender]);

  const overrideItems = formularyItemsForCategory(
    defaultPharmacyCategory(patient.gender),
    { patientGender: patient.gender, includeEscalation: true },
  );

  const selectedMedication = findFormularyItem(selectedMed);

  const handleOverrideChange = (medId: string) => {
    setAlgorithmRec(null);
    setSelectedMed(medId);
    const med = findFormularyItem(medId);
    if (med?.defaultCadence) setCadence(med.defaultCadence);
  };

  const orderCategory = portalRoutingCategory(
    selectedMedication?.category ?? defaultPharmacyCategory(patient.gender),
  );

  const buildRxString = () => {
    if (!selectedMedication) return "";
    const strength =
      algorithmRec && selectedMedication.id === algorithmRec.formularyId
        ? algorithmRec.strength
        : selectedMedication.strength;
    const sig =
      algorithmRec && selectedMedication.id === algorithmRec.formularyId
        ? algorithmRec.sig
        : selectedMedication.sig;
    const qtyText = cadence === "90" ? "Qty: 90 day supply." : "Qty: 30 day supply.";
    return `${selectedMedication.name} ${strength}. Sig: ${sig} ${qtyText}`;
  };

  const mapToModalMedication = (med: PharmacyFormularyItem) => {
    const useAlgo = algorithmRec && med.id === algorithmRec.formularyId;
    return {
      id: med.id,
      name: med.name,
      strength: useAlgo ? algorithmRec.strength : med.strength,
      sig: useAlgo ? algorithmRec.sig : med.sig,
      category: med.category,
      defaultCadence: med.defaultCadence,
    };
  };

  const canOrder = hasLabs && !!selectedMed && !!selectedMedication;

  return (
    <>
      <Card className={algorithmRec ? "border-green-400 border-2" : "border-accent/30"}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <CardTitle className="text-lg flex items-center gap-2 font-playfair">
              <Pill className="w-5 h-5 text-accent" />
              Custom Pharmacy — hormone cream
            </CardTitle>
            {algorithmRec && (
              <Badge className="bg-green-100 text-green-800 border border-green-300 gap-1 font-jost">
                <Sparkles className="h-3 w-3" />
                Holgate algorithm
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground font-jost">
            Intake symptoms + returned labs → compounded cream recommendation for{" "}
            {CUSTOM_PHARMACY_VENDOR}. Fax through this system; delivery confirmation appears after
            transmission.{" "}
            <Link to="/clinical-policy" className="text-accent underline text-xs">
              Policy catalog
            </Link>
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingAlgorithm && (
            <p className="text-xs text-muted-foreground font-jost">
              Analyzing symptoms and lab results…
            </p>
          )}

          {!loadingAlgorithm && !hasLabs && (
            <Alert>
              <FlaskConical className="h-4 w-4" />
              <AlertDescription className="text-sm font-jost">
                Lab results are required before a Custom Pharmacy order. Complete the visit
                (symptoms + labs), then return here when LabCorp results are in the record.
              </AlertDescription>
            </Alert>
          )}

          {!loadingAlgorithm && hasLabs && symptomSummary && (
            <div className="rounded-md border border-border/60 bg-muted/20 px-3 py-2 text-xs font-jost text-muted-foreground flex gap-2">
              <ClipboardList className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{symptomSummary}</span>
            </div>
          )}

          {!loadingAlgorithm && hasLabs && labDate && (
            <p className="text-xs text-muted-foreground font-jost">
              Latest lab panel: {labDate}
            </p>
          )}

          {algorithmRec && (
            <Alert className="border-green-300/60 bg-green-50/60 dark:bg-green-950/20">
              <AlertDescription className="text-sm font-jost space-y-1">
                <p>
                  <span className="font-medium text-foreground">Recommended cream: </span>
                  {algorithmRec.formularyItem.name} ({algorithmRec.strength})
                </p>
                <p className="text-muted-foreground">{algorithmRec.rationale}</p>
              </AlertDescription>
            </Alert>
          )}

          <div className="rounded-md border border-accent/20 bg-muted/30 px-3 py-2 text-xs font-jost text-muted-foreground">
            Pharmacy: <span className="font-medium text-foreground">{CUSTOM_PHARMACY_VENDOR}</span>
            {" · "}
            Fax: (706) 993-3772
          </div>

          {selectedMedication && (
            <>
              <div className="space-y-2">
                <Label className="text-sm font-medium font-jost">Supply duration</Label>
                <Select value={cadence} onValueChange={setCadence}>
                  <SelectTrigger className="bg-background font-jost">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border">
                    {CADENCE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium font-jost">Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="bg-background font-jost"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium font-jost">Refills</Label>
                  <Input
                    type="number"
                    min="0"
                    value={refills}
                    onChange={(e) => setRefills(e.target.value)}
                    className="bg-background font-jost"
                  />
                </div>
              </div>

              <div className="bg-muted/40 rounded-lg p-3 text-sm font-jost">
                <p className="font-medium text-foreground mb-1">Rx preview</p>
                <p className="text-muted-foreground">{buildRxString()}</p>
                <p className="text-[11px] text-muted-foreground mt-2">
                  À la carte: {selectedMedication.fillDisplayPrice}
                  {" · "}
                  {selectedMedication.programLabel} members:{" "}
                  {selectedMedication.programDisplayPrice}/mo
                </p>
              </div>
            </>
          )}

          <Collapsible open={overrideOpen} onOpenChange={setOverrideOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full font-jost text-muted-foreground">
                <ChevronDown className="h-4 w-4 mr-1" />
                Physician override (alternate hormone cream)
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 space-y-2">
              <Select value={selectedMed} onValueChange={handleOverrideChange}>
                <SelectTrigger className="bg-background font-jost">
                  <SelectValue placeholder="Select alternate cream…" />
                </SelectTrigger>
                <SelectContent className="bg-background border max-h-[300px]">
                  {overrideItems.map((med) => (
                    <SelectItem key={med.id} value={med.id}>
                      {med.publicDefault ? med.name : `${med.name} (escalation)`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CollapsibleContent>
          </Collapsible>

          <Button
            onClick={() => setIsModalOpen(true)}
            disabled={!canOrder}
            className="w-full font-jost"
          >
            <Pill className="w-4 h-4 mr-2" />
            Fax to Custom Pharmacy
          </Button>
        </CardContent>
      </Card>

      <PrescriptionPortalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        patient={patient}
        medication={
          selectedMedication ? mapToModalMedication(selectedMedication) : undefined
        }
        customPreparationId={selectedMedication?.customPreparationId}
        algorithmCreamSelection={
          algorithmRec && selectedMedication?.id === algorithmRec.formularyId
            ? {
                strength: algorithmRec.strength,
                sig: algorithmRec.sig,
                refills: 2,
              }
            : undefined
        }
        rxString={buildRxString()}
        quantity={parseInt(quantity, 10) || 1}
        refills={parseInt(refills, 10) || 0}
        supplyDays={parseInt(cadence, 10) || 30}
        category={orderCategory}
        onOrderCreated={onOrderCreated}
      />
    </>
  );
};

export default PharmacyOrderCard;
