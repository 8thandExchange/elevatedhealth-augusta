import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Settings, Building2, User, Save, ArrowLeft } from "lucide-react";
import AdminNavbar from "@/components/admin/AdminNavbar";

interface ClinicSetting {
  key: string;
  value: string;
  description: string | null;
}

const ClinicSettings = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<Record<string, string>>({
    clinic_legal_name: "",
    clinic_tax_id: "",
    provider_npi: "",
    clinic_address: "",
    clinic_phone: "",
  });

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  const checkAuthAndLoad = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/admin/login");
        return;
      }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      const hasAccess = roles?.some(r => r.role === "admin" || r.role === "staff");
      if (!hasAccess) {
        toast.error("Access denied");
        navigate("/admin/login");
        return;
      }

      await loadSettings();
    } catch (error: any) {
      toast.error(error.message);
      navigate("/admin/login");
    }
  };

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("clinic_settings")
        .select("key, value");

      if (error) throw error;

      if (data) {
        const settingsMap: Record<string, string> = {};
        data.forEach((s) => {
          settingsMap[s.key] = s.value;
        });
        setSettings((prev) => ({ ...prev, ...settingsMap }));
      }
    } catch (err) {
      console.error("Error loading settings:", err);
      toast.error("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Upsert each setting
      for (const [key, value] of Object.entries(settings)) {
        const { error } = await supabase
          .from("clinic_settings")
          .upsert(
            { key, value, updated_at: new Date().toISOString(), updated_by: user?.id },
            { onConflict: "key" }
          );

        if (error) throw error;
      }

      toast.success("Settings saved successfully!");
    } catch (err: any) {
      console.error("Error saving settings:", err);
      toast.error(err.message || "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNavbar title="Clinic Settings" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar title="Clinic Settings" subtitle="Configuration" />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin/dashboard")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Settings className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Clinic Settings</h1>
            <p className="text-muted-foreground">
              Configure your clinic information for superbills and requisitions
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Business Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Business Information
              </CardTitle>
              <CardDescription>
                Legal entity details used on superbills and official documents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="clinic_legal_name">Legal Business Name</Label>
                  <Input
                    id="clinic_legal_name"
                    value={settings.clinic_legal_name}
                    onChange={(e) => updateSetting("clinic_legal_name", e.target.value)}
                    placeholder="e.g., Wilkers Group LLC"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clinic_tax_id">Tax ID (EIN)</Label>
                  <Input
                    id="clinic_tax_id"
                    value={settings.clinic_tax_id}
                    onChange={(e) => updateSetting("clinic_tax_id", e.target.value)}
                    placeholder="e.g., 99-0830253"
                  />
                  <p className="text-xs text-muted-foreground">
                    Employer Identification Number for tax and insurance purposes
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="clinic_address">Clinic Address</Label>
                <Input
                  id="clinic_address"
                  value={settings.clinic_address}
                  onChange={(e) => updateSetting("clinic_address", e.target.value)}
                  placeholder="e.g., 3654 Wheeler Road, Suite 103, Augusta, GA 30909"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clinic_phone">Clinic Phone</Label>
                <Input
                  id="clinic_phone"
                  value={settings.clinic_phone}
                  onChange={(e) => updateSetting("clinic_phone", e.target.value)}
                  placeholder="e.g., (706) 250-9855"
                />
              </div>
            </CardContent>
          </Card>

          {/* Provider Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Provider Information
              </CardTitle>
              <CardDescription>
                Provider credentials for superbills and insurance claims
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="provider_npi">Provider NPI Number</Label>
                <Input
                  id="provider_npi"
                  value={settings.provider_npi}
                  onChange={(e) => updateSetting("provider_npi", e.target.value)}
                  placeholder="e.g., 1578971552"
                />
                <p className="text-xs text-muted-foreground">
                  National Provider Identifier - required for insurance claims
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving} size="lg">
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isSaving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClinicSettings;
