import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pill } from "lucide-react";
import FCCPortalModal from "./FCCPortalModal";

interface PatientData {
  id: string;
  full_name: string;
  dob?: string | null;
  email?: string | null;
  phone?: string | null;
  medical_history?: Record<string, any> | null;
}

interface PharmacyOrderCardProps {
  patient: PatientData;
  onOrderCreated?: () => void;
}

const FORMULARY = [
  {
    id: "semaglutide",
    name: "Semaglutide/Pyridoxine Injection (Monthly)",
    strength: "0.25mg-1mg/B6 40mg",
    sig: "Inject subcutaneously once weekly as directed. Qty: 4 doses.",
  },
  {
    id: "sermorelin",
    name: "Sermorelin Acetate (Growth Protocol)",
    strength: "500mcg Troche",
    sig: "Dissolve 1 under tongue daily at bedtime. Qty: 30.",
  },
  {
    id: "nad_injection",
    name: "NAD+ Injection (Cognitive)",
    strength: "100mg/mL",
    sig: "Inject 0.5mL subcutaneously twice weekly. Qty: 8 doses.",
  },
  {
    id: "pt141",
    name: "PT-141 (Libido Kit)",
    strength: "10mg vial",
    sig: "Inject 1mg subcutaneously 30-60 min before activity as needed. Qty: 10 doses.",
  },
  {
    id: "biest",
    name: "Bi-Est Cream (Menopause)",
    strength: "80/20 E3/E2 2.5mg/g",
    sig: "Apply 1-2 clicks to inner thigh each morning. Qty: 1 Topiclick.",
  },
  {
    id: "testosterone",
    name: "Testosterone Cream (Vitality)",
    strength: "50mg/g",
    sig: "Apply 1 click to clitoral area each morning. Wash hands after. Qty: 1 Topiclick.",
  },
];

const PharmacyOrderCard = ({ patient, onOrderCreated }: PharmacyOrderCardProps) => {
  const [selectedMed, setSelectedMed] = useState<string>("");
  const [quantity, setQuantity] = useState("1");
  const [refills, setRefills] = useState("0");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const selectedMedication = FORMULARY.find((m) => m.id === selectedMed);

  const handlePrepareOrder = () => {
    if (!selectedMedication) return;
    setIsModalOpen(true);
  };

  const buildRxString = () => {
    if (!selectedMedication) return "";
    return `${selectedMedication.name.split(" (")[0]} ${selectedMedication.strength}. Sig: ${selectedMedication.sig}`;
  };

  return (
    <>
      <Card className="border-gold/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Pill className="w-5 h-5 text-gold" />
            Pharmacy Order
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Prepare order for FCC Portal
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Medication Dropdown */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Medication</Label>
            <Select value={selectedMed} onValueChange={setSelectedMed}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select medication..." />
              </SelectTrigger>
              <SelectContent className="bg-background border">
                {FORMULARY.map((med) => (
                  <SelectItem key={med.id} value={med.id}>
                    {med.name}
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
