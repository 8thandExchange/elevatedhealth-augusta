import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingDown, TrendingUp, Minus, ArrowRight } from "lucide-react";

interface ProgressReportProps {
  previousScores: {
    estrogen: number;
    progesterone: number;
    androgen: number;
    cortisol: number;
  } | null;
  currentScores: {
    estrogen: number;
    progesterone: number;
    androgen: number;
    cortisol: number;
  };
  onContinue: () => void;
}

const ProgressReport = ({ previousScores, currentScores, onContinue }: ProgressReportProps) => {
  const calculateTotalScore = (scores: typeof currentScores) => {
    return scores.estrogen + scores.progesterone + scores.androgen + scores.cortisol;
  };

  const currentTotal = calculateTotalScore(currentScores);
  const previousTotal = previousScores ? calculateTotalScore(previousScores) : null;

  const getPercentChange = () => {
    if (!previousTotal || previousTotal === 0) return null;
    return Math.round(((currentTotal - previousTotal) / previousTotal) * 100);
  };

  const percentChange = getPercentChange();
  const improved = percentChange !== null && percentChange < 0;
  const worsened = percentChange !== null && percentChange > 0;

  const getCategoryChange = (category: keyof typeof currentScores) => {
    if (!previousScores) return null;
    const prev = previousScores[category];
    const curr = currentScores[category];
    if (prev === 0) return curr === 0 ? 0 : 100;
    return Math.round(((curr - prev) / prev) * 100);
  };

  const categories = [
    { key: "estrogen" as const, label: "Estrogen", color: "text-pink-500" },
    { key: "progesterone" as const, label: "Progesterone", color: "text-purple-500" },
    { key: "androgen" as const, label: "Vitality", color: "text-blue-500" },
    { key: "cortisol" as const, label: "Stress", color: "text-orange-500" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <Card className={`w-full max-w-md border-2 ${
        improved ? "border-green-500 bg-green-50/30 dark:bg-green-950/20" : 
        worsened ? "border-amber-500 bg-amber-50/30 dark:bg-amber-950/20" :
        "border-border"
      }`}>
        <CardHeader className="text-center">
          <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
            improved ? "bg-green-100 dark:bg-green-900/30" : 
            worsened ? "bg-amber-100 dark:bg-amber-900/30" :
            "bg-muted"
          }`}>
            {improved ? (
              <TrendingDown className="w-8 h-8 text-green-600" />
            ) : worsened ? (
              <TrendingUp className="w-8 h-8 text-amber-600" />
            ) : (
              <Minus className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
          <CardTitle className="font-playfair text-2xl">
            {improved ? "Great Progress!" : worsened ? "We're Here For You" : "Check-In Complete"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main Message */}
          <div className={`text-center p-4 rounded-lg ${
            improved ? "bg-green-100/50 dark:bg-green-900/20" : 
            worsened ? "bg-amber-100/50 dark:bg-amber-900/20" :
            "bg-muted/50"
          }`}>
            {improved ? (
              <p className="text-green-700 dark:text-green-400">
                Your symptoms are decreasing. Your treatment is working!
              </p>
            ) : worsened ? (
              <p className="text-amber-700 dark:text-amber-400">
                Symptoms stable or increased. We will notify your provider to review your protocol.
              </p>
            ) : previousScores === null ? (
              <p className="text-muted-foreground">
                Your baseline symptoms have been recorded. We'll compare future check-ins to today.
              </p>
            ) : (
              <p className="text-muted-foreground">
                Your symptoms are stable. Continue with your current protocol.
              </p>
            )}
          </div>

          {/* Overall Change */}
          {percentChange !== null && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Overall Symptom Change</p>
              <p className={`text-3xl font-bold ${
                improved ? "text-green-600" : worsened ? "text-amber-600" : "text-muted-foreground"
              }`}>
                {percentChange > 0 ? "+" : ""}{percentChange}%
              </p>
            </div>
          )}

          {/* Category Breakdown */}
          {previousScores && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">Category Breakdown</p>
              {categories.map(({ key, label, color }) => {
                const change = getCategoryChange(key);
                const prev = previousScores[key];
                const curr = currentScores[key];
                return (
                  <div key={key} className="flex items-center justify-between text-sm">
                    <span className={color}>{label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{prev}</span>
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                      <span className="font-medium">{curr}</span>
                      {change !== null && change !== 0 && (
                        <span className={`text-xs ${change < 0 ? "text-green-600" : "text-amber-600"}`}>
                          ({change > 0 ? "+" : ""}{change}%)
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <Button onClick={onContinue} className="w-full" size="lg">
            Continue to Dashboard
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressReport;
