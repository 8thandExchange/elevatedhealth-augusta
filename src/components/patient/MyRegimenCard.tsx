import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplets } from "lucide-react";

interface RegimenItem {
  name: string;
  compound: string;
  color: "pink" | "blue" | "white";
  instructions: string;
  applicationSite: string;
  timing: string;
}

interface MyRegimenCardProps {
  protocolName: string;
  items: RegimenItem[];
}

const DispenserVisual = ({ color, compound }: { color: "pink" | "blue" | "white"; compound: string }) => {
  const gradients = {
    pink: "from-pink-300 via-pink-400 to-pink-500",
    blue: "from-blue-300 via-blue-400 to-blue-500",
    white: "from-gray-200 via-gray-300 to-gray-400",
  };

  const labels = {
    pink: "BI-EST",
    blue: "TESTOSTERONE",
    white: "PROGESTERONE",
  };

  return (
    <div className="flex flex-col items-center">
      {/* Dispenser bottle */}
      <div className={`relative w-16 h-24 rounded-xl bg-gradient-to-b ${gradients[color]} shadow-lg`}>
        {/* Cap */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-4 bg-gray-700 rounded-t-lg" />
        {/* Label */}
        <div className="absolute inset-x-2 top-8 bottom-4 bg-white/90 rounded flex items-center justify-center">
          <span className="text-[8px] font-bold text-gray-700 text-center leading-tight">
            {labels[color]}
          </span>
        </div>
        {/* Pump indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-4 h-1 bg-white/50 rounded" />
      </div>
      <p className="mt-2 text-xs text-muted-foreground text-center">{compound}</p>
    </div>
  );
};

const ApplicationDiagram = ({ site, color }: { site: string; color: "pink" | "blue" | "white" }) => {
  const siteColors = {
    pink: "stroke-pink-500 fill-pink-100",
    blue: "stroke-blue-500 fill-blue-100",
    white: "stroke-gray-500 fill-gray-100",
  };

  // Simple body outline with application zone highlighted
  if (site.toLowerCase().includes("thigh") || site.toLowerCase().includes("knee")) {
    return (
      <svg viewBox="0 0 100 120" className="w-20 h-24">
        {/* Leg outline */}
        <path
          d="M30 10 L30 110 Q50 115 70 110 L70 10"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-muted-foreground/30"
        />
        {/* Inner thigh highlight */}
        <ellipse
          cx="40"
          cy="50"
          rx="12"
          ry="20"
          className={siteColors[color]}
          strokeWidth="2"
        />
        <text x="50" y="90" textAnchor="middle" className="text-[8px] fill-muted-foreground">
          Inner Thigh
        </text>
      </svg>
    );
  }

  if (site.toLowerCase().includes("clitor") || site.toLowerCase().includes("labia")) {
    return (
      <svg viewBox="0 0 100 100" className="w-20 h-20">
        {/* Abstract representation */}
        <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground/30" />
        <ellipse cx="50" cy="50" rx="15" ry="20" className={siteColors[color]} strokeWidth="2" />
        <text x="50" y="95" textAnchor="middle" className="text-[7px] fill-muted-foreground">
          Direct Application
        </text>
      </svg>
    );
  }

  if (site.toLowerCase().includes("breast") || site.toLowerCase().includes("neck")) {
    return (
      <svg viewBox="0 0 100 100" className="w-20 h-20">
        {/* Upper body outline */}
        <path
          d="M50 15 Q70 20 75 40 Q80 60 70 75 L30 75 Q20 60 25 40 Q30 20 50 15"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-muted-foreground/30"
        />
        {/* Chest/neck area highlight */}
        <ellipse cx="40" cy="50" rx="12" ry="15" className={siteColors[color]} strokeWidth="2" />
        <ellipse cx="60" cy="50" rx="12" ry="15" className={siteColors[color]} strokeWidth="2" />
        <text x="50" y="95" textAnchor="middle" className="text-[8px] fill-muted-foreground">
          Chest/Neck
        </text>
      </svg>
    );
  }

  return null;
};

export const MyRegimenCard = ({ protocolName, items }: MyRegimenCardProps) => {
  return (
    <Card className="bg-card border-border/50 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Droplets className="w-5 h-5 text-primary" />
          <CardTitle className="font-cormorant text-xl">My Daily Routine</CardTitle>
        </div>
        <p className="text-xs text-muted-foreground">{protocolName}</p>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          {items.map((item, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl border-2 ${
                item.color === "pink"
                  ? "border-pink-200 bg-pink-50/50 dark:border-pink-800 dark:bg-pink-950/20"
                  : item.color === "blue"
                  ? "border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20"
                  : "border-gray-200 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-900/20"
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Dispenser Visual */}
                <DispenserVisual color={item.color} compound={item.compound} />

                {/* Instructions */}
                <div className="flex-1 space-y-2">
                  <h4 className="font-semibold text-foreground">{item.name}</h4>
                  <p className="text-sm text-muted-foreground">{item.instructions}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className={`px-2 py-0.5 rounded-full ${
                      item.color === "pink" ? "bg-pink-200 text-pink-700" :
                      item.color === "blue" ? "bg-blue-200 text-blue-700" :
                      "bg-gray-200 text-gray-700"
                    }`}>
                      {item.timing}
                    </span>
                  </div>
                </div>

                {/* Application Diagram */}
                <div className="hidden md:block">
                  <ApplicationDiagram site={item.applicationSite} color={item.color} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MyRegimenCard;