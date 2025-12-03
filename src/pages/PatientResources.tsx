import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Play, FileText, Download, BookOpen, Syringe, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet";

type ResourceCategory = "injection_tutorials" | "nutrition_guides" | "stress_management";

interface Resource {
  id: string;
  title: string;
  description: string | null;
  category: ResourceCategory;
  resource_type: "video" | "pdf";
  url: string;
  thumbnail_url: string | null;
}

const categoryConfig = {
  injection_tutorials: {
    label: "Injection Tutorials",
    icon: Syringe,
    description: "Step-by-step guides for self-administration"
  },
  nutrition_guides: {
    label: "Nutrition Guides",
    icon: BookOpen,
    description: "Optimize your results with proper nutrition"
  },
  stress_management: {
    label: "Stress Management",
    icon: Heart,
    description: "Techniques for hormonal balance and mental wellness"
  }
};

const getYouTubeThumbnail = (url: string): string | null => {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (match) {
    return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
  }
  return null;
};

const getVimeoId = (url: string): string | null => {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? match[1] : null;
};

const VideoCard = ({ resource }: { resource: Resource }) => {
  const thumbnail = resource.thumbnail_url || getYouTubeThumbnail(resource.url);
  
  const handleClick = () => {
    window.open(resource.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card 
      className="group cursor-pointer overflow-hidden border-border/50 hover:border-gold/50 transition-all duration-300 hover:shadow-lg"
      onClick={handleClick}
    >
      <div className="relative aspect-video bg-muted overflow-hidden">
        {thumbnail ? (
          <img 
            src={thumbnail} 
            alt={resource.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/10">
            <Play className="h-12 w-12 text-primary/50" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Play className="h-8 w-8 text-primary ml-1" />
          </div>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-cormorant text-lg text-foreground mb-1 line-clamp-2">{resource.title}</h3>
        {resource.description && (
          <p className="text-sm text-muted-foreground font-light line-clamp-2">{resource.description}</p>
        )}
      </CardContent>
    </Card>
  );
};

const PDFCard = ({ resource }: { resource: Resource }) => {
  const handleDownload = () => {
    window.open(resource.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className="border-border/50 hover:border-gold/50 transition-all duration-300 hover:shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
            <FileText className="h-6 w-6 text-red-600" />
          </div>
          <div className="flex-grow min-w-0">
            <h3 className="font-cormorant text-lg text-foreground mb-1 line-clamp-2">{resource.title}</h3>
            {resource.description && (
              <p className="text-sm text-muted-foreground font-light line-clamp-2 mb-3">{resource.description}</p>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDownload}
              className="text-primary border-primary/30 hover:bg-primary/5"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const PatientResources = () => {
  const [activeTab, setActiveTab] = useState<string>("all");

  const { data: resources = [], isLoading } = useQuery({
    queryKey: ["patient-resources"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patient_resources")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Resource[];
    }
  });

  const filteredResources = activeTab === "all" 
    ? resources 
    : resources.filter(r => r.category === activeTab);

  const videos = filteredResources.filter(r => r.resource_type === "video");
  const pdfs = filteredResources.filter(r => r.resource_type === "pdf");

  return (
    <>
      <Helmet>
        <title>Patient Resources | Elevated Health Augusta</title>
        <meta name="description" content="Educational resources for Elevated Health patients including injection tutorials, nutrition guides, and stress management techniques." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main>
          {/* Hero Section */}
          <section className="relative py-24 bg-gradient-to-br from-primary via-primary/95 to-[hsl(200,25%,35%)]">
            <div className="container mx-auto px-6 text-center">
              <p className="text-sm tracking-[0.3em] uppercase text-gold mb-4 font-lato font-light">
                Patient Education
              </p>
              <h1 className="font-cormorant text-white mb-4">
                Patient Resources
              </h1>
              <p className="text-lg text-white/80 max-w-2xl mx-auto font-light">
                Video tutorials, guides, and resources to support your wellness journey
              </p>
            </div>
          </section>

          {/* Resources Section */}
          <section className="section-spacing">
            <div className="container mx-auto px-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex justify-center mb-12">
                  <TabsList className="bg-secondary/50 p-1">
                    <TabsTrigger value="all" className="px-6">All Resources</TabsTrigger>
                    {Object.entries(categoryConfig).map(([key, config]) => (
                      <TabsTrigger key={key} value={key} className="px-4 hidden sm:flex items-center gap-2">
                        <config.icon className="h-4 w-4" />
                        <span className="hidden md:inline">{config.label}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                {/* Mobile Category Pills */}
                <div className="flex flex-wrap gap-2 justify-center mb-8 sm:hidden">
                  {Object.entries(categoryConfig).map(([key, config]) => (
                    <Button
                      key={key}
                      variant={activeTab === key ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveTab(key)}
                      className="text-xs"
                    >
                      <config.icon className="h-3 w-3 mr-1" />
                      {config.label}
                    </Button>
                  ))}
                </div>

                <TabsContent value={activeTab} className="mt-0">
                  {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[1, 2, 3, 4, 5, 6].map(i => (
                        <Card key={i} className="animate-pulse">
                          <div className="aspect-video bg-muted" />
                          <CardContent className="p-4">
                            <div className="h-5 bg-muted rounded mb-2" />
                            <div className="h-4 bg-muted rounded w-2/3" />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : filteredResources.length === 0 ? (
                    <div className="text-center py-16">
                      <BookOpen className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                      <h3 className="font-cormorant text-2xl text-foreground mb-2">No Resources Yet</h3>
                      <p className="text-muted-foreground font-light">
                        Check back soon for educational content
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-12">
                      {/* Videos Section */}
                      {videos.length > 0 && (
                        <div>
                          <h2 className="font-cormorant text-2xl text-foreground mb-6 flex items-center gap-2">
                            <Play className="h-5 w-5 text-gold" />
                            Video Tutorials
                          </h2>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {videos.map(resource => (
                              <VideoCard key={resource.id} resource={resource} />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* PDFs Section */}
                      {pdfs.length > 0 && (
                        <div>
                          <h2 className="font-cormorant text-2xl text-foreground mb-6 flex items-center gap-2">
                            <FileText className="h-5 w-5 text-gold" />
                            Downloadable Guides
                          </h2>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {pdfs.map(resource => (
                              <PDFCard key={resource.id} resource={resource} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default PatientResources;
