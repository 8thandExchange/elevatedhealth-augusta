import { useState } from "react";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { CompareQuizModal } from "./CompareQuizModal";

interface CompareProps {
  isQuizOpen?: boolean;
  onQuizClose?: () => void;
}

const Compare = ({ isQuizOpen = false, onQuizClose }: CompareProps) => {
  const [internalIsQuizOpen, setInternalIsQuizOpen] = useState(false);
  
  const effectiveIsQuizOpen = isQuizOpen || internalIsQuizOpen;
  const handleClose = () => {
    if (onQuizClose) {
      onQuizClose();
    }
    setInternalIsQuizOpen(false);
  };

  return (
    <section id="compare" className="py-16 md:py-24 bg-background scroll-mt-20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Compare Your Options
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the right ketamine therapy for your treatment goals
            </p>
          </div>

          {/* Comparison Table */}
          <div className="overflow-x-auto mb-8">
            <table className="w-full border-collapse bg-card rounded-lg overflow-hidden shadow-sm">
              <thead>
                <tr className="bg-primary/10">
                  <th className="text-left p-4 md:p-6 font-semibold text-base md:text-lg border-b-2 border-primary/20">
                    Category
                  </th>
                  <th className="text-left p-4 md:p-6 font-semibold text-base md:text-lg border-b-2 border-l border-primary/20">
                    IV Ketamine
                  </th>
                  <th className="text-left p-4 md:p-6 font-semibold text-base md:text-lg border-b-2 border-l border-primary/20">
                    SPRAVATO® (Intranasal)
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Row 1: Route */}
                <tr className="hover:bg-muted/50 transition-colors">
                  <td className="p-4 md:p-6 font-medium border-b border-border">
                    Route of Administration
                  </td>
                  <td className="p-4 md:p-6 border-b border-l border-border">
                    Intravenous (IV) infusion
                  </td>
                  <td className="p-4 md:p-6 border-b border-l border-border">
                    Nasal spray (self-administered)
                  </td>
                </tr>

                {/* Row 2: Session Time */}
                <tr className="hover:bg-muted/50 transition-colors">
                  <td className="p-4 md:p-6 font-medium border-b border-border">
                    Session Time
                  </td>
                  <td className="p-4 md:p-6 border-b border-l border-border">
                    40-60 minutes infusion + monitoring
                  </td>
                  <td className="p-4 md:p-6 border-b border-l border-border">
                    Self-administration + minimum 2-hour observation
                  </td>
                </tr>

                {/* Row 3: Coverage */}
                <tr className="hover:bg-muted/50 transition-colors">
                  <td className="p-4 md:p-6 font-medium border-b border-border">
                    Coverage & Payment
                  </td>
                  <td className="p-4 md:p-6 border-b border-l border-border">
                    <div className="space-y-1">
                      <p className="font-medium">Insurance: Varies by plan</p>
                      <p className="text-sm text-muted-foreground">Self-pay options available</p>
                    </div>
                  </td>
                  <td className="p-4 md:p-6 border-b border-l border-border">
                    <div className="space-y-1">
                      <p className="font-medium">Insurance: Often covered with prior authorization</p>
                      <p className="text-sm text-muted-foreground">Self-pay available</p>
                    </div>
                  </td>
                </tr>

                {/* Row 4: Typical Course */}
                <tr className="hover:bg-muted/50 transition-colors">
                  <td className="p-4 md:p-6 font-medium border-b border-border">
                    Typical Treatment Course
                  </td>
                  <td className="p-4 md:p-6 border-b border-l border-border">
                    <div className="space-y-1">
                      <p>Initial: 6 sessions over 2-3 weeks</p>
                      <p className="text-sm text-muted-foreground">Maintenance: As needed</p>
                    </div>
                  </td>
                  <td className="p-4 md:p-6 border-b border-l border-border">
                    <div className="space-y-1">
                      <p>Initial: 2x/week for 4 weeks</p>
                      <p className="text-sm text-muted-foreground">Maintenance: Weekly or bi-weekly</p>
                    </div>
                  </td>
                </tr>

                {/* Row 5: FDA Status */}
                <tr className="hover:bg-muted/50 transition-colors">
                  <td className="p-4 md:p-6 font-medium border-b border-border">
                    FDA Status
                  </td>
                  <td className="p-4 md:p-6 border-b border-l border-border">
                    Off-label use for depression/anxiety
                  </td>
                  <td className="p-4 md:p-6 border-b border-l border-border">
                    FDA-approved for TRD and MDD with acute suicidal ideation
                  </td>
                </tr>

                {/* Row 6: Ideal Candidates */}
                <tr className="hover:bg-muted/50 transition-colors">
                  <td className="p-4 md:p-6 font-medium">
                    Ideal Candidates
                  </td>
                  <td className="p-4 md:p-6 border-l border-border">
                    <ul className="space-y-2 text-sm">
                      <li>• Treatment-resistant depression or anxiety</li>
                      <li>• Prefer IV administration</li>
                      <li>• Seeking flexible dosing options</li>
                      <li>• Good cardiovascular health</li>
                    </ul>
                  </td>
                  <td className="p-4 md:p-6 border-l border-border">
                    <ul className="space-y-2 text-sm">
                      <li>• Diagnosed TRD with failed antidepressants</li>
                      <li>• Comfortable with nasal spray</li>
                      <li>• Can commit to 2-hour observation</li>
                      <li>• Meet REMS requirements</li>
                    </ul>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Help Me Choose Button */}
          <div className="text-center">
            <Button
              onClick={() => setInternalIsQuizOpen(true)}
              size="lg"
              variant="outline"
              className="gap-2"
              aria-label="Open treatment selection quiz"
            >
              <HelpCircle className="h-5 w-5" />
              Help me choose
            </Button>
          </div>
        </div>
      </div>

      <CompareQuizModal isOpen={effectiveIsQuizOpen} onClose={handleClose} />
    </section>
  );
};

export default Compare;
