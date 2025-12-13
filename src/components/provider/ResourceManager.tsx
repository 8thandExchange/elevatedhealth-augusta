import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Play, FileText, Upload, Link, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type ResourceCategory = 
  | "hormone_therapy" 
  | "weight_loss" 
  | "ketamine_therapy" 
  | "peptide_therapy" 
  | "iv_hydration"
  | "general_wellness"
  | "injection_tutorials" 
  | "nutrition_guides" 
  | "stress_management";

type ResourceType = "video" | "pdf";

interface Resource {
  id: string;
  title: string;
  description: string | null;
  category: ResourceCategory;
  resource_type: ResourceType;
  url: string;
  thumbnail_url: string | null;
  created_at: string;
}

const categoryLabels: Record<ResourceCategory, string> = {
  hormone_therapy: "Hormone Therapy",
  weight_loss: "Weight Loss / GLP-1",
  ketamine_therapy: "Mental Wellness / Ketamine",
  peptide_therapy: "Peptide Therapy",
  iv_hydration: "IV Hydration",
  general_wellness: "General Wellness",
  injection_tutorials: "Injection Tutorials",
  nutrition_guides: "Nutrition Guides",
  stress_management: "Stress Management"
};

const ResourceManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [resourceType, setResourceType] = useState<ResourceType>("video");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ResourceCategory>("injection_tutorials");
  const [videoUrl, setVideoUrl] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { data: resources = [], isLoading } = useQuery({
    queryKey: ["admin-resources"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patient_resources")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Resource[];
    }
  });

  const addResourceMutation = useMutation({
    mutationFn: async (newResource: Omit<Resource, "id" | "created_at">) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("patient_resources")
        .insert({ ...newResource, created_by: user?.id });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-resources"] });
      queryClient.invalidateQueries({ queryKey: ["patient-resources"] });
      toast({ title: "Resource added successfully" });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({ title: "Failed to add resource", description: error.message, variant: "destructive" });
    }
  });

  const deleteResourceMutation = useMutation({
    mutationFn: async (id: string) => {
      const resource = resources.find(r => r.id === id);
      
      // Delete file from storage if it's a PDF
      if (resource?.resource_type === "pdf" && resource.url.includes("patient-resources")) {
        const path = resource.url.split("/patient-resources/")[1];
        if (path) {
          await supabase.storage.from("patient-resources").remove([path]);
        }
      }

      const { error } = await supabase
        .from("patient_resources")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-resources"] });
      queryClient.invalidateQueries({ queryKey: ["patient-resources"] });
      toast({ title: "Resource deleted" });
    },
    onError: (error) => {
      toast({ title: "Failed to delete resource", description: error.message, variant: "destructive" });
    }
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setVideoUrl("");
    setPdfFile(null);
    setResourceType("video");
    setCategory("injection_tutorials");
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({ title: "Please enter a title", variant: "destructive" });
      return;
    }

    setIsUploading(true);

    try {
      let url = "";

      if (resourceType === "video") {
        if (!videoUrl.trim()) {
          toast({ title: "Please enter a video URL", variant: "destructive" });
          setIsUploading(false);
          return;
        }
        url = videoUrl.trim();
      } else {
        if (!pdfFile) {
          toast({ title: "Please select a PDF file", variant: "destructive" });
          setIsUploading(false);
          return;
        }

        const fileExt = pdfFile.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("patient-resources")
          .upload(fileName, pdfFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("patient-resources")
          .getPublicUrl(fileName);

        url = publicUrl;
      }

      await addResourceMutation.mutateAsync({
        title: title.trim(),
        description: description.trim() || null,
        category,
        resource_type: resourceType,
        url,
        thumbnail_url: null
      });
    } catch (error: any) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-cormorant text-xl">Patient Resources</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Resource
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-cormorant">Add New Resource</DialogTitle>
            </DialogHeader>

            <Tabs value={resourceType} onValueChange={(v) => setResourceType(v as ResourceType)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="video" className="gap-2">
                  <Link className="h-4 w-4" />
                  Video Link
                </TabsTrigger>
                <TabsTrigger value="pdf" className="gap-2">
                  <Upload className="h-4 w-4" />
                  PDF Upload
                </TabsTrigger>
              </TabsList>

              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input 
                    placeholder="e.g., How to Self-Administer Testosterone"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description (optional)</Label>
                  <Textarea 
                    placeholder="Brief description of the resource..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={(v) => setCategory(v as ResourceCategory)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(categoryLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <TabsContent value="video" className="mt-0 space-y-2">
                  <Label>YouTube or Vimeo URL</Label>
                  <Input 
                    placeholder="https://youtube.com/watch?v=..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Paste a YouTube or Vimeo link. Thumbnail will be auto-generated for YouTube.
                  </p>
                </TabsContent>

                <TabsContent value="pdf" className="mt-0 space-y-2">
                  <Label>PDF File</Label>
                  <Input 
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                  />
                  {pdfFile && (
                    <p className="text-xs text-muted-foreground">
                      Selected: {pdfFile.name}
                    </p>
                  )}
                </TabsContent>

                <Button 
                  className="w-full" 
                  onClick={handleSubmit}
                  disabled={isUploading || addResourceMutation.isPending}
                >
                  {(isUploading || addResourceMutation.isPending) ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {resourceType === "pdf" ? "Uploading..." : "Adding..."}
                    </>
                  ) : (
                    "Add Resource"
                  )}
                </Button>
              </div>
            </Tabs>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : resources.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p>No resources added yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {resources.map(resource => (
              <div 
                key={resource.id}
                className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg"
              >
                <div className="w-10 h-10 rounded flex items-center justify-center bg-background">
                  {resource.resource_type === "video" ? (
                    <Play className="h-5 w-5 text-primary" />
                  ) : (
                    <FileText className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <div className="flex-grow min-w-0">
                  <p className="font-medium text-sm truncate">{resource.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {categoryLabels[resource.category]}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteResourceMutation.mutate(resource.id)}
                  disabled={deleteResourceMutation.isPending}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResourceManager;
