import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Loader2, 
  Brain, 
  Scale, 
  Sparkles, 
  Droplets, 
  Syringe, 
  Check, 
  Plus,
  ArrowRight
} from "lucide-react";
import PatientNavbar from "@/components/patient/PatientNavbar";
import EditProfileModal from "@/components/patient/EditProfileModal";

interface Service {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  treatmentKey: string;
  publicPage: string;
  color: string;
}

const SERVICES: Service[] = [
  {
    id: "hormone",
    name: "Hormone Optimization",
    description: "Bio-identical hormone therapy for women experiencing menopause, perimenopause, or hormonal imbalance.",
    icon: <Sparkles className="w-6 h-6" />,
    treatmentKey: "hormone",
    publicPage: "/hormones",
    color: "pink",
  },
  {
    id: "weight_loss",
    name: "Medical Weight Loss",
    description: "GLP-1 therapy with metabolic optimization for sustainable weight management.",
    icon: <Scale className="w-6 h-6" />,
    treatmentKey: "weight_loss",
    publicPage: "/weightloss",
    color: "green",
  },
  {
    id: "ketamine",
    name: "Ketamine Therapy",
    description: "IV and at-home ketamine for treatment-resistant depression, anxiety, and PTSD.",
    icon: <Brain className="w-6 h-6" />,
    treatmentKey: "ketamine",
    publicPage: "/ketamine",
    color: "purple",
  },
  {
    id: "peptides",
    name: "Peptide Therapy",
    description: "Growth hormone support, NAD+ for brain restoration, and intimacy enhancement.",
    icon: <Syringe className="w-6 h-6" />,
    treatmentKey: "peptides",
    publicPage: "/peptides",
    color: "blue",
  },
  {
    id: "iv_lounge",
    name: "IV Hydration Lounge",
    description: "Vitamin infusions for wellness, immunity, recovery, and beauty.",
    icon: <Droplets className="w-6 h-6" />,
    treatmentKey: "iv_lounge",
    publicPage: "/iv-lounge",
    color: "teal",
  },
];

const PatientServices = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [patient, setPatient] = useState<any>(null);
  const [currentInterests, setCurrentInterests] = useState<string[]>([]);
  const [addingService, setAddingService] = useState<string | null>(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  useEffect(() => {
    loadPatientData();
  }, []);

  const loadPatientData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/patient/login");
        return;
      }

      const { data: patientData, error } = await supabase
        .from("patients")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      if (!patientData) {
        toast.error("Patient profile not found");
        return;
      }

      setPatient(patientData);
      
      // Parse current interests
      const interests = patientData.treatment_request?.split(",").filter(Boolean) || [];
      setCurrentInterests(interests);
    } catch (error: any) {
      toast.error(error.message || "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddService = async (service: Service) => {
    if (!patient) return;
    
    setAddingService(service.id);
    try {
      // Add service to interests
      const newInterests = [...currentInterests, service.treatmentKey];
      const treatmentRequest = newInterests.join(",");
      
      const { error } = await supabase
        .from("patients")
        .update({ 
          treatment_request: treatmentRequest,
          // Reset intake for services that need it
          ...(service.treatmentKey !== "iv_lounge" && !patient.intake_completed && { 
            onboarding_status: "intake_required" 
          })
        })
        .eq("id", patient.id);

      if (error) throw error;

      // Send notification to provider
      await supabase.functions.invoke("send-patient-signup-notification", {
        body: {
          patientName: patient.full_name,
          patientEmail: patient.email,
          primaryProgram: service.treatmentKey,
          isHighRisk: false,
          notificationType: "service_added",
          addedService: service.name,
        }
      });

      setCurrentInterests(newInterests);
      toast.success(`${service.name} added to your care plan! A provider will reach out.`);
      
      // For ketamine, direct to intake if not completed
      if (service.treatmentKey === "ketamine" && !patient.intake_completed) {
        toast.info("Please complete the mental wellness intake for ketamine therapy.");
        navigate("/patient/intake");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to add service");
    } finally {
      setAddingService(null);
    }
  };

  const hasService = (treatmentKey: string) => currentInterests.includes(treatmentKey);

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      pink: "from-pink-50 to-pink-100/50 border-pink-200 dark:from-pink-950/30 dark:to-pink-900/20 dark:border-pink-800",
      green: "from-green-50 to-green-100/50 border-green-200 dark:from-green-950/30 dark:to-green-900/20 dark:border-green-800",
      purple: "from-purple-50 to-purple-100/50 border-purple-200 dark:from-purple-950/30 dark:to-purple-900/20 dark:border-purple-800",
      blue: "from-blue-50 to-blue-100/50 border-blue-200 dark:from-blue-950/30 dark:to-blue-900/20 dark:border-blue-800",
      teal: "from-teal-50 to-teal-100/50 border-teal-200 dark:from-teal-950/30 dark:to-teal-900/20 dark:border-teal-800",
    };
    return colors[color] || colors.blue;
  };

  const getIconColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      pink: "bg-pink-500/20 text-pink-600",
      green: "bg-green-500/20 text-green-600",
      purple: "bg-purple-500/20 text-purple-600",
      blue: "bg-blue-500/20 text-blue-600",
      teal: "bg-teal-500/20 text-teal-600",
    };
    return colors[color] || colors.blue;
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

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="font-cormorant text-3xl text-foreground mb-2">Your Services</h1>
          <p className="text-muted-foreground">
            View your current services or add new treatments to your care plan.
          </p>
        </div>

        {/* Current Services */}
        {currentInterests.length > 0 && (
          <div className="mb-8">
            <h2 className="font-semibold text-foreground mb-4">Active Services</h2>
            <div className="flex flex-wrap gap-2">
              {SERVICES.filter(s => hasService(s.treatmentKey)).map((service) => (
                <Badge key={service.id} variant="secondary" className="px-3 py-1 gap-2">
                  <Check className="w-3 h-3 text-green-600" />
                  {service.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* All Services Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {SERVICES.map((service) => {
            const isActive = hasService(service.treatmentKey);
            const isAdding = addingService === service.id;
            
            return (
              <Card 
                key={service.id}
                className={`bg-gradient-to-br ${getColorClasses(service.color)} transition-all hover:shadow-md`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-full ${getIconColorClasses(service.color)}`}>
                      {service.icon}
                    </div>
                    {isActive && (
                      <Badge variant="secondary" className="gap-1">
                        <Check className="w-3 h-3 text-green-600" />
                        Active
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="font-cormorant text-xl">{service.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                  
                  <div className="flex gap-2">
                    {isActive ? (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/patient-resources?service=${service.treatmentKey}`)}
                          className="flex-1"
                        >
                          Resources
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => {
                            // Navigate to service-specific action
                            if (service.treatmentKey === "ketamine") {
                              window.open("https://app.osmind.org", "_blank");
                            } else if (service.treatmentKey === "iv_lounge") {
                              navigate("/iv-lounge");
                            } else if (patient?.intake_completed) {
                              navigate("/patient/checkin");
                            } else {
                              navigate("/patient/intake");
                            }
                          }}
                          className="flex-1"
                        >
                          {service.treatmentKey === "ketamine" 
                            ? "Osmind Portal" 
                            : service.treatmentKey === "iv_lounge"
                            ? "Book Session"
                            : patient?.intake_completed 
                            ? "Log Symptoms" 
                            : "Complete Intake"}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(service.publicPage)}
                          className="flex-1"
                        >
                          Learn More
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleAddService(service)}
                          disabled={isAdding}
                          className="flex-1"
                        >
                          {isAdding ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Plus className="w-4 h-4 mr-1" />
                              Add Service
                            </>
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Contact Card */}
        <Card className="mt-8 bg-card border-border/50">
          <CardContent className="pt-6 text-center">
            <h3 className="font-semibold mb-2">Questions about our services?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Our team is happy to help you find the right treatment plan.
            </p>
            <Button onClick={() => navigate("/consult")}>
              Schedule a Consultation
            </Button>
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
    </div>
  );
};

export default PatientServices;
