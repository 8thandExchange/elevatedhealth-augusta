import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Info, Moon, Droplets, Sparkles } from "lucide-react";

interface TreatmentPlanProps {
  protocolName: string;
  dispenserType: string;
  instructions: string;
}

const DispenserVisual = ({ type }: { type: string }) => {
  const getDispenserStyle = () => {
    switch (type.toLowerCase()) {
      case "pink topiclick":
        return "from-pink-300 via-pink-400 to-pink-500";
      case "blue topiclick":
        return "from-blue-300 via-blue-400 to-blue-500";
      case "cream":
      case "white topiclick":
        return "from-gray-200 via-gray-300 to-gray-400";
      default:
        return "from-gray-300 via-gray-400 to-gray-500";
    }
  };

  return (
    <div className="flex justify-center py-6">
      <div className="relative">
        {/* Dispenser Body */}
        <div className={`w-16 h-28 rounded-t-lg rounded-b-xl bg-gradient-to-b ${getDispenserStyle()} shadow-lg relative overflow-hidden`}>
          {/* Highlight */}
          <div className="absolute left-1 top-2 bottom-2 w-2 bg-white/30 rounded-full" />
          {/* Label area */}
          <div className="absolute inset-x-3 top-6 bottom-8 bg-white/90 rounded flex items-center justify-center">
            <span className="text-[8px] font-bold text-gray-700 tracking-tight text-center leading-tight">
              TOPICLICK<br />
              <span className="text-[6px] font-normal">Rx Only</span>
            </span>
          </div>
          {/* Bottom cap */}
          <div className={`absolute bottom-0 inset-x-0 h-4 bg-gradient-to-b ${getDispenserStyle()} rounded-b-xl border-t border-white/20`} />
        </div>
        {/* Top cap */}
        <div className={`w-10 h-3 mx-auto -mt-0.5 rounded-t-full bg-gradient-to-b ${getDispenserStyle()} shadow`} />
      </div>
    </div>
  );
};

const protocolDetails: Record<string, {
  title: string;
  icon: React.ReactNode;
  instruction: string;
  applicationSite: string;
  timing: string;
  medicalNote: string;
  warning?: string;
  dispenserType: string;
}> = {
  "Protocol A: Menopause": {
    title: "Bi-Est (Estrogen) Therapy",
    icon: <Droplets className="w-5 h-5 text-pink-500" />,
    instruction: "Apply 1-2 clicks to inner thigh or behind the knee (thin skin) in the morning.",
    applicationSite: "Inner thigh or behind knee",
    timing: "Morning application",
    medicalNote: "Transdermal application avoids the liver, reducing clotting risk compared to oral pills. Thin skin areas provide optimal absorption.",
    dispenserType: "Pink Topiclick"
  },
  "Protocol B: Vitality": {
    title: "Testosterone Therapy",
    icon: <Sparkles className="w-5 h-5 text-blue-500" />,
    instruction: "Apply directly to the clitoral area or labia minora for maximum absorption.",
    applicationSite: "Clitoral area or labia minora",
    timing: "Daily application",
    medicalNote: "Genital application provides the highest absorption rate and targets androgen receptors directly for libido and vitality benefits.",
    warning: "Wash hands immediately after use to avoid transferring to children or pets. Do not allow skin-to-skin contact with others at the application site.",
    dispenserType: "Blue Topiclick"
  },
  "Protocol C: Balance": {
    title: "Progesterone Support",
    icon: <Moon className="w-5 h-5 text-purple-500" />,
    instruction: "Apply to breasts or neck at bedtime.",
    applicationSite: "Breasts or neck",
    timing: "Bedtime application",
    medicalNote: "Promotes deep, restorative sleep and provides protective benefits for breast tissue. Natural progesterone supports the calming GABA receptors.",
    dispenserType: "Cream"
  },
  "Protocol D: Adrenal Support": {
    title: "DHEA + Pregnenolone",
    icon: <Sparkles className="w-5 h-5 text-orange-500" />,
    instruction: "Take 1 capsule each morning with food.",
    applicationSite: "Oral",
    timing: "Morning with breakfast",
    medicalNote: "Supports adrenal function and provides building blocks for hormone production. Best absorbed with dietary fats.",
    dispenserType: "Capsule"
  }
};

const TreatmentPlan = ({ protocolName, dispenserType, instructions }: TreatmentPlanProps) => {
  const details = protocolDetails[protocolName];

  if (!details) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="font-cormorant text-xl">My Treatment Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Your treatment plan details will appear here once your provider assigns a protocol.
          </p>
        </CardContent>
      </Card>
    );
  }

  const isTopiclick = details.dispenserType.toLowerCase().includes("topiclick");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h2 className="font-cormorant text-xl text-foreground">My Treatment Plan</h2>
        <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full">
          Active
        </span>
      </div>

      {/* Main Protocol Card */}
      <Card className={`border-2 overflow-hidden ${
        details.dispenserType === "Pink Topiclick" 
          ? "border-pink-200 dark:border-pink-800" 
          : details.dispenserType === "Blue Topiclick"
          ? "border-blue-200 dark:border-blue-800"
          : "border-purple-200 dark:border-purple-800"
      }`}>
        {/* Header */}
        <div className={`px-6 py-4 ${
          details.dispenserType === "Pink Topiclick" 
            ? "bg-gradient-to-r from-pink-50 to-pink-100 dark:from-pink-950/30 dark:to-pink-900/20" 
            : details.dispenserType === "Blue Topiclick"
            ? "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20"
            : "bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20"
        }`}>
          <div className="flex items-center gap-3">
            {details.icon}
            <div>
              <h3 className="font-cormorant text-lg font-semibold text-foreground">
                {details.title}
              </h3>
              <p className="text-xs text-muted-foreground">{protocolName}</p>
            </div>
          </div>
        </div>

        <CardContent className="pt-6 space-y-6">
          {/* Dispenser Visual */}
          {isTopiclick && <DispenserVisual type={details.dispenserType} />}

          {/* Application Instructions */}
          <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
            <h4 className="font-medium text-foreground flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">1</span>
              Application Instructions
            </h4>
            <p className="text-foreground font-medium pl-8">
              {details.instruction}
            </p>
            <div className="pl-8 space-y-1">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Site:</span> {details.applicationSite}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Timing:</span> {details.timing}
              </p>
            </div>
          </div>

          {/* Warning (if applicable) */}
          {details.warning && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-700 dark:text-amber-400 mb-1">
                    Important Safety Warning
                  </h4>
                  <p className="text-sm text-amber-600 dark:text-amber-300">
                    {details.warning}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Medical Note */}
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-1">
                  Medical Note
                </h4>
                <p className="text-sm text-blue-600 dark:text-blue-300">
                  {details.medicalNote}
                </p>
              </div>
            </div>
          </div>

          {/* Dispenser Type Badge */}
          <div className="flex justify-center">
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
              details.dispenserType === "Pink Topiclick" 
                ? "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300" 
                : details.dispenserType === "Blue Topiclick"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                : details.dispenserType === "Cream"
                ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
            }`}>
              {details.dispenserType}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Quick Reference Card */}
      <Card className="border-border/50 bg-card">
        <CardContent className="pt-6">
          <h4 className="font-medium text-foreground mb-4">Quick Reference</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <div className="w-10 h-10 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-lg">📍</span>
              </div>
              <p className="text-xs text-muted-foreground">Where</p>
              <p className="text-xs font-medium text-foreground">{details.applicationSite}</p>
            </div>
            <div className="space-y-1">
              <div className="w-10 h-10 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-lg">⏰</span>
              </div>
              <p className="text-xs text-muted-foreground">When</p>
              <p className="text-xs font-medium text-foreground">{details.timing}</p>
            </div>
            <div className="space-y-1">
              <div className="w-10 h-10 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-lg">💊</span>
              </div>
              <p className="text-xs text-muted-foreground">How</p>
              <p className="text-xs font-medium text-foreground">
                {isTopiclick ? "1-2 clicks" : "As directed"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TreatmentPlan;