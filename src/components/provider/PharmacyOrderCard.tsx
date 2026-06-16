import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Pill, Sparkles, AlertTriangle } from "lucide-react";
import PrescriptionPortalModal from "./PrescriptionPortalModal";
import { MedicationRecommendation } from "@/lib/medicationMapping";
import {
  defaultPharmacyCategory,
  findFormularyItem,
  formularyItemsForCategory,
  resolveFormularyId,
  visiblePharmacyCategories,
  portalRoutingCategory,
  type PharmacyCategoryId,
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
  recommendedMedications?: MedicationRecommendation[];
  /** When false, hide escalation-only SKUs */
  showEscalationItems?: boolean;
}

const CADENCE_OPTIONS = [
  { value: "30", label: "30 Day Supply (New Patient)" },
  { value: "90", label: "90 Day Supply (Renewal)" },
];

const PharmacyOrderCard = ({
  patient,
  onOrderCreated,
  recommendedMedications,
  showEscalationItems = false,
}: PharmacyOrderCardProps) => {
  const categories = useMemo(
    () => visiblePharmacyCategories(patient.gender),
    [patient.gender],
  );

  const [activeCategory, setActiveCategory] = useState<PharmacyCategoryId>(
    defaultPharmacyCategory(patient.gender),
  );
  const [selectedMed, setSelectedMed] = useState<string>("");
  const [cadence, setCadence] = useState<string>("30");
  const [quantity, setQuantity] = useState("1");
  const [refills, setRefills] = useState("0");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRecommended, setIsRecommended] = useState(false);

  const filteredMedications = useMemo(
    () =>
      formularyItemsForCategory(activeCategory, {
        patientGender: patient.gender,
        includeEscalation: showEscalationItems,
      }),
    [activeCategory, patient.gender, showEscalationItems],
  );

  const selectedMedication = findFormularyItem(selectedMed);

  useEffect(() => {
    if (recommendedMedications && recommendedMedications.length > 0) {
      const primaryRec = recommendedMedications[0];
      const resolvedId = resolveFormularyId(primaryRec.formularyId);
      const formularyMed = findFormularyItem(resolvedId);
      if (formularyMed) {
        setSelectedMed(resolvedId);
        setActiveCategory(formularyMed.category);
        setCadence(formularyMed.defaultCadence);
        setIsRecommended(true);
      }
    }
  }, [recommendedMedications]);

  const handleMedicationChange = (medId: string) => {
    setSelectedMed(medId);
    const med = findFormularyItem(medId);
    if (med?.defaultCadence) setCadence(med.defaultCadence);
  };

  const orderCategory = portalRoutingCategory(
    selectedMedication?.category ?? defaultPharmacyCategory(patient.gender),
  );

  const buildRxString = () => {
    if (!selectedMedication) return "";
    const qtyText = cadence === "90" ? "Qty: 90 day supply." : "Qty: 30 day supply.";
    return `${selectedMedication.name} ${selectedMedication.strength}. Sig: ${selectedMedication.sig} ${qtyText}`;
  };

  const mapToModalMedication = (med: PharmacyFormularyItem) => ({
    id: med.id,
    name: med.name,
    strength: med.strength,
    sig: med.sig,
    category: med.category,
    defaultCadence: med.defaultCadence,
  });

  return (
    <>
      <Card className={isRecommended ? "border-green-400 border-2" : "border-accent/30"}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <CardTitle className="text-lg flex items-center gap-2 font-playfair">
              <Pill className="w-5 h-5 text-accent" />
              Pharmacy order
            </CardTitle>
            {isRecommended && (
              <Badge className="bg-green-100 text-green-800 border border-green-300 gap-1 font-jost">
                <Sparkles className="h-3 w-3" />
                Lab-recommended
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground font-jost">
            Category tabs per clinic policy — injectable TRT default for men.{" "}
            <Link to="/clinical-policy" className="text-accent underline text-xs">
              Policy catalog
            </Link>
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs
            value={activeCategory}
            onValueChange={(v) => {
              setActiveCategory(v as PharmacyCategoryId);
              setSelectedMed("");
            }}
          >
            <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
              {categories.map((cat) => (
                <TabsTrigger key={cat.id} value={cat.id} className="font-jost text-xs">
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {categories.map((cat) => (
              <TabsContent key={cat.id} value={cat.id} className="mt-3 space-y-1">
                <p className="text-xs text-muted-foreground font-jost">{cat.description}</p>
              </TabsContent>
            ))}
          </Tabs>

          {selectedMedication?.programOnly && (
            <Alert className="border-amber-500/40 bg-amber-500/5 py-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-xs font-jost ml-2">
                Program-only path — enroll via metabolic program workflow, not standalone Rx fax.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label className="text-sm font-medium font-jost">Medication</Label>
            <Select value={selectedMed} onValueChange={handleMedicationChange}>
              <SelectTrigger className="bg-background font-jost">
                <SelectValue placeholder="Select medication..." />
              </SelectTrigger>
              <SelectContent className="bg-background border max-h-[300px]">
                {filteredMedications.map((med) => (
                  <SelectItem key={med.id} value={med.id}>
                    {med.publicDefault ? med.name : `${med.name} (escalation)`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedMedication && (
              <p className="text-[11px] text-muted-foreground font-jost">
                Vendor: {selectedMedication.vendor}
                {selectedMedication.policyKey && (
                  <>
                    {" "}
                    · Policy:{" "}
                    <code className="text-xs">{selectedMedication.policyKey}</code>
                  </>
                )}
              </p>
            )}
          </div>

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

          {selectedMedication && (
            <div className="bg-muted/40 rounded-lg p-3 text-sm font-jost">
              <p className="font-medium text-foreground mb-1">Rx preview</p>
              <p className="text-muted-foreground">{buildRxString()}</p>
            </div>
          )}

          <Button
            onClick={() => setIsModalOpen(true)}
            disabled={!selectedMed || selectedMedication?.programOnly}
            className="w-full font-jost"
          >
            <Pill className="w-4 h-4 mr-2" />
            Prepare portal order
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
