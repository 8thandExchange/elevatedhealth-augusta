import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Brain, ArrowLeft, Sparkles, ArrowRight, BookOpen } from "lucide-react";
import MindCareCard from "@/components/patient/MindCareCard";
import NeurotransmitterCard from "@/components/patient/NeurotransmitterCard";
import PatientNavbar from "@/components/patient/PatientNavbar";
import EditProfileModal from "@/components/patient/EditProfileModal";
import PatientChatWidget from "@/components/chat/PatientChatWidget";

interface NeurotransmitterPayment {
  id: string;
  kit_status: string;
  tracking_number: string | null;
  shipped_at: string | null;
  sample_received_at: string | null;
  results_ready_at: string | null;
}

interface Patient {
  id: string;
  full_name: string;
  email: string | null;
  avatar_url: string | null;
}

const MentalWellnessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [neuroPayment, setNeuroPayment] = useState<NeurotransmitterPayment | null>(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  useEffect(() => {
    loadData();
    
    // Check for neurotransmitter payment success
    const sessionId = searchParams.get("session_id");
    if (searchParams.get("neurotransmitter") === "success" && sessionId) {
      verifyNeurotransmitterPayment(sessionId);
    }
  }, []);

  const verifyNeurotransmitterPayment = async (sessionId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-neurotransmitter-payment', {
        body: { sessionId }
      });
      
      if (error) throw error;
      
      if (data?.verified) {
        toast.success("Neurotransmitter Analysis purchased! Your kit will ship within 3-5 business days.");
        loadData();
      }
    } catch (err) {
      console.error('Payment verification error:', err);
      toast.success("Payment received! Your kit will ship soon.");
    }
  };

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: patientData, error } = await supabase
        .from("patients")
        .select("id, full_name, email, avatar_url")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      if (!patientData) {
        toast.error("Patient profile not found");
        return;
      }

      setPatient(patientData);

      // Fetch neurotransmitter payment
      const { data: neuroData } = await supabase
        .from("neurotransmitter_payments")
        .select("id, kit_status, tracking_number, shipped_at, sample_received_at, results_ready_at")
        .eq("patient_id", patientData.id)
        .eq("payment_status", "paid")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      setNeuroPayment(neuroData);
    } catch (error: any) {
      toast.error(error.message || "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PatientNavbar 
        patientName={patient?.full_name || "Patient"}
        avatarUrl={patient?.avatar_url}
        onEditProfile={() => setIsEditProfileOpen(true)}
      />

      <main className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate("/patient/dashboard")}
          className="gap-2 -ml-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Services
        </Button>

        {/* Page Header */}
        <div className="text-center space-y-2 pb-4">
          <div className="inline-flex items-center justify-center p-3 bg-purple-500/20 rounded-full mb-2">
            <Brain className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="font-cormorant text-3xl text-foreground">Mental Wellness</h1>
          <p className="text-muted-foreground">
            Your ketamine therapy journey and mental health resources
          </p>
        </div>

        {/* Mind Care Card - Osmind Portal */}
        <MindCareCard />

        {/* Neurotransmitter Analysis Add-on */}
        <NeurotransmitterCard 
          patientEmail={patient?.email || undefined}
          patientName={patient?.full_name}
          patientId={patient?.id}
          existingPayment={neuroPayment}
        />

        {/* Treatment Journey Info */}
        <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Brain className="w-12 h-12 text-primary mx-auto" />
              <h3 className="font-cormorant text-xl text-foreground">
                Your Mental Wellness Journey
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Your ketamine therapy is coordinated through Osmind, our HIPAA-compliant mental health platform. 
                Check your email for your secure portal invitation.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Educational Resources */}
        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50/50 dark:from-purple-950/30 dark:to-indigo-900/20 border-purple-200 dark:border-purple-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-500/20 rounded-full">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Educational Resources</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Preparation guides, integration tips, and FAQs about ketamine therapy.
                </p>
                <Button 
                  variant="outline"
                  onClick={() => navigate("/patient-resources?service=ketamine")}
                  className="border-purple-300 hover:bg-purple-50"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  View Resources
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Explore More Services */}
        <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-accent/20 rounded-full">
                <Sparkles className="w-6 h-6 text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Explore More Services</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Discover our full range of treatments including hormone optimization, weight loss, peptide therapy, and more.
                </p>
                <Button 
                  variant="outline"
                  onClick={() => navigate("/patient/dashboard")}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Browse Services
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Edit Profile Modal */}
      {patient && (
        <EditProfileModal
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          patientId={patient.id}
          currentName={patient.full_name}
          currentAvatarUrl={patient.avatar_url}
          onUpdate={(newName, newAvatarUrl) => setPatient({ ...patient, full_name: newName, avatar_url: newAvatarUrl })}
        />
      )}

      {/* Chat Widget */}
      {patient && <PatientChatWidget patientId={patient.id} />}
    </div>
  );
};

export default MentalWellnessPage;
