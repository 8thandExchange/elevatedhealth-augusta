import { Brain, Mail, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const MindCareCard = () => {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-serif">
          <div className="p-2 rounded-full bg-primary/10">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          My Mind Care
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Your secure mental health portal is managed through <span className="font-semibold text-foreground">Osmind</span>, 
          our HIPAA-compliant partner for ketamine therapy coordination.
        </p>
        
        <div className="p-4 rounded-lg bg-background border border-border">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-accent mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Check Your Email</p>
              <p className="text-xs text-muted-foreground">
                You'll receive an invitation from Osmind within 1-2 hours of your consultation. 
                This email will contain your secure login link to access your treatment portal.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <p className="text-xs text-muted-foreground mb-3">
            Once you receive your Osmind invite, you'll be able to:
          </p>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-accent" />
              Complete your mental health intake assessments
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-accent" />
              Schedule your ketamine therapy sessions
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-accent" />
              Message your care team securely
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-accent" />
              Track your treatment progress
            </li>
          </ul>
        </div>

        <Button 
          variant="outline" 
          className="w-full mt-4"
          onClick={() => window.open('https://app.osmind.org', '_blank')}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Open Osmind Portal
        </Button>
      </CardContent>
    </Card>
  );
};

export default MindCareCard;
