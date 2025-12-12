import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Pill } from "lucide-react";
import FCCPortalModal from "./FCCPortalModal";

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
  medical_history?: Record<string, any> | null;
  gender?: string | null;
}

interface PharmacyOrderCardProps {
  patient: PatientData;
  onOrderCreated?: () => void;
}

// Dr. Holgate's Approved Formulary - Updated with specific protocols
const FORMULARY = [
  // === MALE TESTOSTERONE PROTOCOLS (No 50mg - "doesn't work" per Dr. Holgate) ===
  {
    id: "male_test_100",
    name: "Testosterone Cream - Male 100mg",
    strength: "100mg/g (Liposomal Base)",
    sig: "Apply to large hairless muscle area (shoulder/thigh) every morning. Wash hands after use.",
    category: "male_hormone",
    defaultCadence: "30",
  },
  {
    id: "male_test_150",
    name: "Testosterone Cream - Male 150mg",
    strength: "150mg/g (Liposomal Base)",
    sig: "Apply to large hairless muscle area (shoulder/thigh) every morning. Wash hands after use.",
    category: "male_hormone",
    defaultCadence: "30",
  },
  {
    id: "male_test_200",
    name: "Testosterone Cream - Male 200mg",
    strength: "200mg/g (Liposomal Base)",
    sig: "Apply to large hairless muscle area (shoulder/thigh) every morning. Wash hands after use.",
    category: "male_hormone",
    defaultCadence: "30",
  },
  
  // === MALE TROCHE OPTIONS ===
  {
    id: "male_test_troche_50",
    name: "Testosterone Troche - Male 50mg",
    strength: "50mg Troche (1/2 troche = 25mg)",
    sig: "Place under tongue or in cheek daily. Rotate sites.",
    category: "male_hormone",
    defaultCadence: "30",
  },
  {
    id: "male_test_troche_100",
    name: "Testosterone Troche - Male 100mg",
    strength: "100mg Troche",
    sig: "Place under tongue or in cheek daily. Rotate sites.",
    category: "male_hormone",
    defaultCadence: "30",
  },
  
  // === FEMALE TESTOSTERONE ===
  {
    id: "female_testosterone",
    name: "Testosterone Cream - Female (Vitality)",
    strength: "10mg/g (Topiclick)",
    sig: "Apply 1 click to clitoral area each morning. Wash hands immediately after use.",
    category: "female_hormone",
    defaultCadence: "30",
  },
  
  // === SLEEP STACK (Progesterone) ===
  {
    id: "progesterone_sleep",
    name: "Progesterone Cream (Sleep Stack)",
    strength: "40mg/click (Topiclick)",
    sig: "Apply 1 click to neck at bedtime for sleep support.",
    category: "sleep_support",
    defaultCadence: "30",
  },
  
  // === BI-EST (Estrogen) ===
  {
    id: "biest",
    name: "Bi-Est Cream (Menopause)",
    strength: "80/20 E3/E2 2.5mg/g (Topiclick)",
    sig: "Apply 1-2 clicks to inner thigh each morning.",
    category: "female_hormone",
    defaultCadence: "30",
  },
  
  // === WEIGHT LOSS ===
  {
    id: "semaglutide",
    name: "Semaglutide/Pyridoxine Injection",
    strength: "0.25mg-1mg/B6 40mg",
    sig: "Inject subcutaneously once weekly as directed.",
    category: "weight_loss",
    defaultCadence: "30",
  },
  
  // === PEPTIDES ===
  {
    id: "sermorelin",
    name: "Sermorelin Acetate (Growth Protocol)",
    strength: "500mcg Troche",
    sig: "Dissolve 1 under tongue daily at bedtime.",
    category: "peptide",
    defaultCadence: "30",
  },
  {
    id: "nad_injection",
    name: "NAD+ Injection (Cognitive)",
    strength: "100mg/mL",
    sig: "Inject 0.5mL subcutaneously twice weekly.",
    category: "peptide",
    defaultCadence: "30",
  },
  {
    id: "pt141",
    name: "PT-141 (Libido Kit)",
    strength: "10mg vial",
    sig: "Inject 1mg subcutaneously 30-60 min before activity as needed.",
    category: "peptide",
    defaultCadence: "30",
  },
];

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "male_hormone", label: "Male Hormone" },
  { id: "female_hormone", label: "Female Hormone" },
  { id: "sleep_support", label: "Sleep Stack" },
  { id: "weight_loss", label: "Weight Loss" },
  { id: "peptide", label: "Peptide" },
];

const CADENCE_OPTIONS = [
  { value: "30", label: "30 Day Supply (New Patient)" },
  { value: "90", label: "90 Day Supply (Renewal)" },
];

const PharmacyOrderCard = ({ patient, onOrderCreated }: PharmacyOrderCardProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedMed, setSelectedMed] = useState<string>("");
  const [cadence, setCadence] = useState<string>("30");
  const [quantity, setQuantity] = useState("1");
  const [refills, setRefills] = useState("0");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Auto-select category based on patient gender
  const defaultCategory = patient.gender === "male" ? "male_hormone" : 
                          patient.gender === "female" ? "female_hormone" : "all";
  
  // Filter medications by category
  const filteredMedications = selectedCategory === "all" 
    ? FORMULARY 
    : FORMULARY.filter(med => med.category === selectedCategory);

  const selectedMedication = FORMULARY.find((m) => m.id === selectedMed);

  // Update cadence when medication changes
  const handleMedicationChange = (medId: string) => {
    setSelectedMed(medId);
    const med = FORMULARY.find(m => m.id === medId);
    if (med?.defaultCadence) {
      setCadence(med.defaultCadence);
    }
  };

  const handlePrepareOrder = () => {
    if (!selectedMedication) return;
    setIsModalOpen(true);
  };

  const buildRxString = () => {
    if (!selectedMedication) return "";
    const qtyText = cadence === "90" ? "Qty: 90 day supply." : "Qty: 30 day supply.";
    return `${selectedMedication.name.split(" - ")[0]} ${selectedMedication.strength}. Sig: ${selectedMedication.sig} ${qtyText}`;
  };

  return (
    <>
      <Card className="border-gold/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Pill className="w-5 h-5 text-gold" />
            Pharmacy Order (Holgate Rx)
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Dr. Holgate's approved protocols
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <Badge
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "outline"}
                className={`cursor-pointer transition-colors ${
                  selectedCategory === cat.id 
                    ? "bg-gold text-white hover:bg-gold-dark" 
                    : "hover:bg-muted"
                }`}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setSelectedMed(""); // Reset selection when category changes
                }}
              >
                {cat.label}
              </Badge>
            ))}
          </div>

          {/* Medication Dropdown */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Medication</Label>
            <Select value={selectedMed} onValueChange={handleMedicationChange}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select medication..." />
              </SelectTrigger>
              <SelectContent className="bg-background border max-h-[300px]">
                {filteredMedications.map((med) => (
                  <SelectItem key={med.id} value={med.id}>
                    {med.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Supply Duration */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Supply Duration</Label>
            <Select value={cadence} onValueChange={setCadence}>
              <SelectTrigger className="bg-background">
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

          {/* Quantity & Refills */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Quantity</Label>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Refills</Label>
              <Input
                type="number"
                min="0"
                value={refills}
                onChange={(e) => setRefills(e.target.value)}
                className="bg-background"
              />
            </div>
          </div>

          {/* Preview */}
          {selectedMedication && (
            <div className="bg-secondary/50 rounded-lg p-3 text-sm">
              <p className="font-medium text-foreground mb-1">Rx Preview:</p>
              <p className="text-muted-foreground">{buildRxString()}</p>
            </div>
          )}

          {/* Prepare Order Button */}
          <Button
            onClick={handlePrepareOrder}
            disabled={!selectedMed}
            className="w-full bg-gold hover:bg-gold-dark text-white"
          >
            <Pill className="w-4 h-4 mr-2" />
            Prepare Portal Order
          </Button>
        </CardContent>
      </Card>

      <FCCPortalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        patient={patient}
        medication={selectedMedication}
        rxString={buildRxString()}
        quantity={parseInt(quantity) || 1}
        refills={parseInt(refills) || 0}
        onOrderCreated={onOrderCreated}
      />
    </>
  );
};

export default PharmacyOrderCard;
