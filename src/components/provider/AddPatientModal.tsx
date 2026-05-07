import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, CreditCard, Users, ArrowRight } from "lucide-react";
import InvitePatientCard from "./InvitePatientCard";
import AddExistingPatientCard from "./AddExistingPatientCard";

interface AddPatientModalProps {
  onPatientAdded?: () => void;
  trigger?: React.ReactNode;
}

const AddPatientModal = ({ onPatientAdded, trigger }: AddPatientModalProps) => {
  const [open, setOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<"new" | "existing" | null>(null);

  const handleSuccess = () => {
    setOpen(false);
    setSelectedOption(null);
    onPatientAdded?.();
  };

  const resetModal = () => {
    setSelectedOption(null);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetModal();
    }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <UserPlus className="w-4 h-4" />
            Add Patient
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-cormorant">
            {selectedOption ? (
              <Button variant="ghost" size="sm" onClick={resetModal} className="mr-2">
                ← Back
              </Button>
            ) : null}
            Add New Patient
          </DialogTitle>
        </DialogHeader>

        {!selectedOption ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {/* New Patient - Consultation Required */}
            <Card 
              className="cursor-pointer hover:border-primary transition-colors hover:shadow-md"
              onClick={() => setSelectedOption("new")}
            >
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <CreditCard className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">New Consultation</CardTitle>
                <CardDescription>Patient pays $79 Wellness Assessment fee</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Sends payment link via email/SMS</li>
                  <li>• Creates patient account on payment</li>
                  <li>• Best for new prospective patients</li>
                </ul>
                <Button variant="ghost" size="sm" className="mt-4 w-full">
                  Select <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Existing Patient - No Fee */}
            <Card 
              className="cursor-pointer hover:border-gold transition-colors hover:shadow-md border-gold/50"
              onClick={() => setSelectedOption("existing")}
            >
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mb-2">
                  <Users className="w-6 h-6 text-gold" />
                </div>
                <CardTitle className="text-lg">Add Existing Patient</CardTitle>
                <CardDescription>No consultation fee required</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• For patients already seen in clinic</li>
                  <li>• Transfers from other EMR systems</li>
                  <li>• Creates account immediately</li>
                </ul>
                <Button variant="ghost" size="sm" className="mt-4 w-full text-gold hover:text-gold">
                  Select <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : selectedOption === "new" ? (
          <div className="py-4">
            <InvitePatientCard 
              onInviteSent={handleSuccess} 
              embedded 
            />
          </div>
        ) : (
          <div className="py-4">
            <AddExistingPatientCard 
              onPatientAdded={handleSuccess} 
              embedded 
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddPatientModal;
