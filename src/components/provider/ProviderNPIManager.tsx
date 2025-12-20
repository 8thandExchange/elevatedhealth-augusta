import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  Loader2, 
  UserPlus, 
  Trash2, 
  Save, 
  Stethoscope,
  AlertCircle,
  Check,
  Edit2,
  X,
  Upload,
  Pen
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

interface Provider {
  id: string;
  name: string;
  credentials: string;
  npi: string;
  email: string;
  isPrimary: boolean;
  signatureUrl?: string;
}

const ProviderNPIManager = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    credentials: "",
    npi: "",
    email: "",
    isPrimary: false,
    signatureUrl: ""
  });
  const [isUploadingSignature, setIsUploadingSignature] = useState(false);
  const signatureInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      // Fetch provider data from clinic_settings using a structured key pattern
      const { data, error } = await supabase
        .from("clinic_settings")
        .select("key, value")
        .like("key", "provider_%");

      if (error) throw error;

      // Parse provider data from settings
      const providersData: Record<string, Partial<Provider>> = {};
      
      data?.forEach((setting) => {
        // Pattern: provider_{id}_{field}
        const match = setting.key.match(/^provider_([^_]+)_(.+)$/);
        if (match) {
          const [, id, field] = match;
          if (!providersData[id]) {
            providersData[id] = { id };
          }
          if (field === "name") providersData[id].name = setting.value;
          if (field === "credentials") providersData[id].credentials = setting.value;
          if (field === "npi") providersData[id].npi = setting.value;
          if (field === "email") providersData[id].email = setting.value;
          if (field === "is_primary") providersData[id].isPrimary = setting.value === "true";
          if (field === "signature_url") providersData[id].signatureUrl = setting.value;
        }
      });

      const providersList = Object.values(providersData).filter(
        (p) => p.name && p.npi
      ) as Provider[];

      setProviders(providersList);
    } catch (err) {
      console.error("Error loading providers:", err);
      toast.error("Failed to load providers");
    } finally {
      setIsLoading(false);
    }
  };

  const validateNPI = (npi: string): boolean => {
    // NPI must be exactly 10 digits
    return /^\d{10}$/.test(npi);
  };

  const handleSaveProvider = async () => {
    if (!formData.name.trim()) {
      toast.error("Provider name is required");
      return;
    }
    if (!formData.npi.trim()) {
      toast.error("NPI number is required");
      return;
    }
    if (!validateNPI(formData.npi)) {
      toast.error("NPI must be exactly 10 digits");
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const providerId = editingProvider?.id || Date.now().toString();

      // If setting as primary, remove primary from others
      if (formData.isPrimary) {
        for (const p of providers) {
          if (p.isPrimary && p.id !== providerId) {
            await supabase
              .from("clinic_settings")
              .upsert({
                key: `provider_${p.id}_is_primary`,
                value: "false",
                updated_at: new Date().toISOString(),
                updated_by: user?.id
              }, { onConflict: "key" });
          }
        }
      }

      // Save all provider fields
      const settings = [
        { key: `provider_${providerId}_name`, value: formData.name },
        { key: `provider_${providerId}_credentials`, value: formData.credentials },
        { key: `provider_${providerId}_npi`, value: formData.npi },
        { key: `provider_${providerId}_email`, value: formData.email },
        { key: `provider_${providerId}_is_primary`, value: formData.isPrimary.toString() },
        { key: `provider_${providerId}_signature_url`, value: formData.signatureUrl || "" },
      ];

      for (const setting of settings) {
        const { error } = await supabase
          .from("clinic_settings")
          .upsert({
            ...setting,
            updated_at: new Date().toISOString(),
            updated_by: user?.id
          }, { onConflict: "key" });

        if (error) throw error;
      }

      // Also update the legacy provider_npi if this is primary
      if (formData.isPrimary) {
        await supabase
          .from("clinic_settings")
          .upsert({
            key: "provider_npi",
            value: formData.npi,
            updated_at: new Date().toISOString(),
            updated_by: user?.id
          }, { onConflict: "key" });
      }

      toast.success(editingProvider ? "Provider updated!" : "Provider added!");
      setIsDialogOpen(false);
      setEditingProvider(null);
      resetForm();
      await loadProviders();
    } catch (err: any) {
      console.error("Error saving provider:", err);
      toast.error(err.message || "Failed to save provider");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProvider = async (provider: Provider) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Delete signature file if exists
      if (provider.signatureUrl) {
        const path = provider.signatureUrl.split('/provider-signatures/')[1];
        if (path) {
          await supabase.storage.from('provider-signatures').remove([path]);
        }
      }

      // Delete all settings for this provider
      const keysToDelete = [
        `provider_${provider.id}_name`,
        `provider_${provider.id}_credentials`,
        `provider_${provider.id}_npi`,
        `provider_${provider.id}_email`,
        `provider_${provider.id}_is_primary`,
        `provider_${provider.id}_signature_url`,
      ];

      for (const key of keysToDelete) {
        await supabase
          .from("clinic_settings")
          .delete()
          .eq("key", key);
      }

      toast.success("Provider removed");
      await loadProviders();
    } catch (err: any) {
      console.error("Error deleting provider:", err);
      toast.error(err.message || "Failed to delete provider");
    }
  };

  const openEditDialog = (provider: Provider) => {
    setEditingProvider(provider);
    setFormData({
      name: provider.name,
      credentials: provider.credentials,
      npi: provider.npi,
      email: provider.email || "",
      isPrimary: provider.isPrimary,
      signatureUrl: provider.signatureUrl || ""
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      credentials: "",
      npi: "",
      email: "",
      isPrimary: providers.length === 0,
      signatureUrl: ""
    });
  };

  const handleSignatureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file (PNG, JPG, etc.)");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Signature image must be less than 2MB");
      return;
    }

    setIsUploadingSignature(true);
    try {
      const providerId = editingProvider?.id || Date.now().toString();
      const fileExt = file.name.split('.').pop();
      const fileName = `signature_${providerId}.${fileExt}`;

      // Delete old signature if exists
      if (formData.signatureUrl) {
        const oldPath = formData.signatureUrl.split('/provider-signatures/')[1];
        if (oldPath) {
          await supabase.storage.from('provider-signatures').remove([oldPath]);
        }
      }

      // Upload new signature
      const { error: uploadError } = await supabase.storage
        .from('provider-signatures')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('provider-signatures')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, signatureUrl: publicUrl }));
      toast.success("Signature uploaded successfully");
    } catch (err: any) {
      console.error("Error uploading signature:", err);
      toast.error(err.message || "Failed to upload signature");
    } finally {
      setIsUploadingSignature(false);
      if (signatureInputRef.current) {
        signatureInputRef.current.value = "";
      }
    }
  };

  const handleRemoveSignature = async () => {
    if (formData.signatureUrl) {
      const path = formData.signatureUrl.split('/provider-signatures/')[1];
      if (path) {
        await supabase.storage.from('provider-signatures').remove([path]);
      }
    }
    setFormData(prev => ({ ...prev, signatureUrl: "" }));
    toast.success("Signature removed");
  };

  const openAddDialog = () => {
    setEditingProvider(null);
    resetForm();
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5" />
              Provider Credentials
            </CardTitle>
            <CardDescription>
              Manage provider NPIs for prescriptions and insurance claims
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAddDialog} size="sm">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Provider
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingProvider ? "Edit Provider" : "Add New Provider"}
                </DialogTitle>
                <DialogDescription>
                  Enter the provider's credentials and NPI number
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="provider_name">Full Name *</Label>
                    <Input
                      id="provider_name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Lauren Bursey"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="provider_credentials">Credentials</Label>
                    <Input
                      id="provider_credentials"
                      value={formData.credentials}
                      onChange={(e) => setFormData(prev => ({ ...prev, credentials: e.target.value }))}
                      placeholder="e.g., NP-C, MD, DO"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="provider_npi">NPI Number *</Label>
                  <Input
                    id="provider_npi"
                    value={formData.npi}
                    onChange={(e) => setFormData(prev => ({ ...prev, npi: e.target.value.replace(/\D/g, "").slice(0, 10) }))}
                    placeholder="10-digit NPI"
                    maxLength={10}
                  />
                  {formData.npi && !validateNPI(formData.npi) && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      NPI must be exactly 10 digits
                    </p>
                  )}
                  {formData.npi && validateNPI(formData.npi) && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Valid NPI format
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="provider_email">Email (for matching)</Label>
                  <Input
                    id="provider_email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="provider@clinic.com"
                  />
                  <p className="text-xs text-muted-foreground">
                    Used to auto-match provider when creating prescriptions
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_primary"
                    checked={formData.isPrimary}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPrimary: e.target.checked }))}
                    className="rounded border-border"
                  />
                  <Label htmlFor="is_primary" className="text-sm font-normal cursor-pointer">
                    Set as primary provider (used as default on superbills)
                  </Label>
                </div>

                {/* Signature Upload Section */}
                <div className="space-y-2 pt-4 border-t border-border">
                  <Label className="flex items-center gap-2">
                    <Pen className="w-4 h-4" />
                    Provider Signature
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Upload signature image for prescriptions and superbills
                  </p>
                  
                  {formData.signatureUrl ? (
                    <div className="space-y-2">
                      <div className="border border-border rounded-lg p-3 bg-muted/30">
                        <img 
                          src={formData.signatureUrl} 
                          alt="Provider signature"
                          className="max-h-16 max-w-full object-contain"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => signatureInputRef.current?.click()}
                          disabled={isUploadingSignature}
                        >
                          <Upload className="w-3 h-3 mr-1" />
                          Replace
                        </Button>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm"
                          onClick={handleRemoveSignature}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => signatureInputRef.current?.click()}
                      disabled={isUploadingSignature}
                      className="w-full"
                    >
                      {isUploadingSignature ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4 mr-2" />
                      )}
                      {isUploadingSignature ? "Uploading..." : "Upload Signature Image"}
                    </Button>
                  )}
                  <input
                    ref={signatureInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleSignatureUpload}
                    className="hidden"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveProvider} disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {isSaving ? "Saving..." : "Save Provider"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {providers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Stethoscope className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No providers configured</p>
            <p className="text-sm">Add your first provider to enable prescriptions</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provider</TableHead>
                <TableHead>NPI</TableHead>
                <TableHead>Signature</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {providers.map((provider) => (
                <TableRow key={provider.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{provider.name}</span>
                      {provider.credentials && (
                        <span className="text-muted-foreground">, {provider.credentials}</span>
                      )}
                      {provider.isPrimary && (
                        <Badge variant="secondary" className="ml-2">Primary</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {provider.npi}
                    </code>
                  </TableCell>
                  <TableCell>
                    {provider.signatureUrl ? (
                      <img 
                        src={provider.signatureUrl} 
                        alt="Signature"
                        className="max-h-8 max-w-20 object-contain"
                      />
                    ) : (
                      <span className="text-muted-foreground text-xs">Not uploaded</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(provider)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Provider?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will remove {provider.name} from the system. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteProvider(provider)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default ProviderNPIManager;
