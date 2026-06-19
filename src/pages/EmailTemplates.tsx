import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Loader2, 
  ArrowLeft, 
  Mail, 
  MessageSquare, 
  Save, 
  Eye, 
  Edit, 
  RotateCcw,
  Check,
  X
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AdminNavbar from "@/components/admin/AdminNavbar";

interface EmailTemplate {
  id: string;
  name: string;
  template_key: string;
  category: string;
  subject: string;
  body_html: string;
  sms_text: string | null;
  merge_fields: string[];
  is_active: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  onboarding: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  billing: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  clinical: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  scheduling: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  general: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
};

const EmailTemplates = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  // Edit state
  const [editedSubject, setEditedSubject] = useState("");
  const [editedBody, setEditedBody] = useState("");
  const [editedSms, setEditedSms] = useState("");

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .order("category", { ascending: true });

      if (error) throw error;
      setTemplates(data as EmailTemplate[]);
    } catch (err) {
      console.error("Error loading templates:", err);
      toast.error("Failed to load templates");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setEditedSubject(template.subject);
    setEditedBody(template.body_html);
    setEditedSms(template.sms_text || "");
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!selectedTemplate) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("email_templates")
        .update({
          subject: editedSubject,
          body_html: editedBody,
          sms_text: editedSms || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedTemplate.id);

      if (error) throw error;

      toast.success("Template saved successfully!");
      setIsEditing(false);
      
      // Refresh templates
      await loadTemplates();
      
      // Update selected template
      setSelectedTemplate({
        ...selectedTemplate,
        subject: editedSubject,
        body_html: editedBody,
        sms_text: editedSms || null,
      });
    } catch (err: any) {
      console.error("Error saving template:", err);
      toast.error(err.message || "Failed to save template");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (selectedTemplate) {
      setEditedSubject(selectedTemplate.subject);
      setEditedBody(selectedTemplate.body_html);
      setEditedSms(selectedTemplate.sms_text || "");
      setIsEditing(false);
    }
  };

  const mergePlaceholders = (text: string) => {
    return text
      .replace(/\{\{patient_name\}\}/g, "John Smith")
      .replace(/\{\{first_name\}\}/g, "John")
      .replace(/\{\{email\}\}/g, "john@example.com")
      .replace(/\{\{phone\}\}/g, "(555) 123-4567")
      .replace(/\{\{clinic_phone\}\}/g, "(706) 760-3470")
      .replace(/\{\{payment_link\}\}/g, "https://pay.example.com/abc123")
      .replace(/\{\{portal_link\}\}/g, "https://portal.example.com")
      .replace(/\{\{appointment_time\}\}/g, "10:00 AM")
      .replace(/\{\{appointment_date\}\}/g, "January 15, 2026");
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
      <AdminNavbar 
        title="Email Templates" 
        subtitle="Manage email and SMS templates"
      />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate("/provider/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Template List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Templates</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleSelectTemplate(template)}
                    className={`w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors ${
                      selectedTemplate?.id === template.id ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-sm">{template.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-[10px] ${CATEGORY_COLORS[template.category] || CATEGORY_COLORS.general}`}>
                        {template.category}
                      </Badge>
                      {template.sms_text && (
                        <Badge variant="outline" className="text-[10px]">
                          <MessageSquare className="w-3 h-3 mr-1" />
                          SMS
                        </Badge>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Template Editor */}
          <Card className="lg:col-span-2">
            {selectedTemplate ? (
              <>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <div>
                    <CardTitle className="text-lg">{selectedTemplate.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Key: <code className="bg-muted px-1.5 py-0.5 rounded">{selectedTemplate.template_key}</code>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setIsPreviewOpen(true)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Preview
                    </Button>
                    {!isEditing ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    ) : (
                      <>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={handleReset}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                        <Button 
                          size="sm"
                          onClick={handleSave}
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4 mr-1" />
                          )}
                          Save
                        </Button>
                      </>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Subject Line</Label>
                    <Input 
                      value={editedSubject}
                      onChange={(e) => setEditedSubject(e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Email Body (HTML)</Label>
                    <Textarea 
                      value={editedBody}
                      onChange={(e) => setEditedBody(e.target.value)}
                      disabled={!isEditing}
                      rows={12}
                      className="font-mono text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>SMS Message (Optional)</Label>
                    <Textarea 
                      value={editedSms}
                      onChange={(e) => setEditedSms(e.target.value)}
                      disabled={!isEditing}
                      rows={3}
                      placeholder="Leave empty if no SMS version needed"
                    />
                    <p className="text-xs text-muted-foreground">
                      {editedSms.length}/160 characters
                    </p>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <Label className="text-xs font-medium text-muted-foreground">Merge Fields</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedTemplate.merge_fields?.map((field) => (
                        <code 
                          key={field} 
                          className="bg-background px-2 py-1 rounded text-xs cursor-pointer hover:bg-primary/10"
                          onClick={() => {
                            if (isEditing) {
                              navigator.clipboard.writeText(`{{${field}}}`);
                              toast.success(`Copied {{${field}}} to clipboard`);
                            }
                          }}
                        >
                          {`{{${field}}}`}
                        </code>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex items-center justify-center py-16">
                <div className="text-center text-muted-foreground">
                  <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Select a template to edit</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </main>

      {/* Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Template Preview</DialogTitle>
          </DialogHeader>
          
          {selectedTemplate && (
            <div className="space-y-4">
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-muted px-4 py-2 border-b">
                  <p className="text-sm font-medium">
                    Subject: {mergePlaceholders(editedSubject)}
                  </p>
                </div>
                <div 
                  className="p-4 bg-white prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: mergePlaceholders(editedBody) }}
                />
              </div>

              {editedSms && (
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-muted px-4 py-2 border-b flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    <p className="text-sm font-medium">SMS Preview</p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-950/20">
                    <p className="text-sm">{mergePlaceholders(editedSms)}</p>
                  </div>
                </div>
              )}

              <p className="text-xs text-muted-foreground text-center">
                Merge fields are replaced with sample data for preview
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmailTemplates;