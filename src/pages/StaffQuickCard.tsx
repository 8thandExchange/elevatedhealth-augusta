import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer } from "lucide-react";
import { CORE_SERVICES, ELEVATED_PROGRAMS } from "@/lib/stripeConfig";
import { MEMBER_DISCOUNT_PERCENT } from "@/lib/pricing";

const StaffQuickCard = () => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Helmet>
        <title>Quick Reference Card | Elevated Health Augusta</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background print:bg-white">
        {/* Screen-only header */}
        <div className="max-w-2xl mx-auto px-4 py-6 print:hidden">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/provider/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <Button variant="default" size="sm" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Print Card
            </Button>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            This card is optimized for printing on a single page. Click "Print Card" above.
          </p>
        </div>

        {/* Printable Card */}
        <div className="max-w-[8.5in] mx-auto px-4 py-2 print:p-4">
          <div className="border-2 border-foreground rounded-lg p-4 print:border-black">
            {/* Header */}
            <div className="text-center border-b-2 border-foreground pb-3 mb-4 print:border-black">
              <h1 className="text-xl font-bold tracking-tight">ELEVATED HEALTH AUGUSTA QUICK REFERENCE</h1>
              <p className="text-sm font-medium">Front Desk Cheat Sheet • {new Date().getFullYear()}</p>
            </div>

            {/* Entry Point */}
            <div className="bg-primary/10 rounded-lg p-3 mb-4 print:bg-gray-100">
              <h2 className="font-bold text-sm uppercase tracking-wide mb-1">Entry Point</h2>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-lg">{CORE_SERVICES.wellnessAssessment.name} {CORE_SERVICES.wellnessAssessment.displayPrice}</p>
                  <p className="text-sm">30 min • IN-PERSON at Evans clinic</p>
                  <p className="text-sm italic">Paid at booking; program pricing quoted separately</p>
                </div>
              </div>
            </div>

            {/* Core Services Grid */}
            <div className="mb-4">
              <h2 className="font-bold text-sm uppercase tracking-wide mb-2 border-b border-foreground pb-1 print:border-black">
                Core Services
              </h2>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                {Object.values(ELEVATED_PROGRAMS).map((p) => (
                  <div key={p.priceId} className="flex justify-between py-1 border-b border-border">
                    <span>{p.name}</span>
                    <span className="font-mono font-bold">{p.displayPrice}</span>
                  </div>
                ))}
                <div className="flex justify-between py-1 border-b border-border col-span-2">
                  <span>Member discount on à la carte</span>
                  <span className="font-mono font-bold">{MEMBER_DISCOUNT_PERCENT}%</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border col-span-2 text-xs text-muted-foreground italic">
                  Full catalog: Staff Pricing Cheatsheet (digital)
                </div>
              </div>
            </div>

            {/* Key Talking Points */}
            <div className="mb-4">
              <h2 className="font-bold text-sm uppercase tracking-wide mb-2 border-b border-foreground pb-1 print:border-black">
                Key Talking Points
              </h2>
              <ul className="text-sm space-y-1">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span>&quot;ELEVATED programs bundle medication when prescribed, check-ins, quarterly labs, and messaging.&quot;</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span>&quot;{MEMBER_DISCOUNT_PERCENT}% off eligible à la carte services for active ELEVATED members.&quot;</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span>&quot;Ketamine and SPRAVATO are not offered on our current public menu.&quot;</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive font-bold">✗</span>
                  <span>"We do NOT offer pellets or synthetic HGH."</span>
                </li>
              </ul>
            </div>

            {/* Insurance & Payment */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-muted/50 rounded-lg p-3 print:bg-gray-50">
                <h3 className="font-bold text-xs uppercase tracking-wide mb-1">Insurance</h3>
                <p className="text-xs">Superbills for eligible out-of-network reimbursement when applicable</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 print:bg-gray-50">
                <h3 className="font-bold text-xs uppercase tracking-wide mb-1">Payment Options</h3>
                <p className="text-xs">HSA/FSA accepted</p>
                <p className="text-xs">Klarna/Affirm financing available</p>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center border-t-2 border-foreground pt-2 print:border-black">
              <p className="font-bold text-sm">(706) 760-3470</p>
              <p className="text-xs">7013 Evans Town Center Blvd, Suite 203 • Evans, GA 30809</p>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: letter;
            margin: 0.5in;
          }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:hidden { display: none !important; }
          .print\\:bg-white { background: white !important; }
          .print\\:bg-gray-100 { background: #f3f4f6 !important; }
          .print\\:bg-gray-50 { background: #f9fafb !important; }
          .print\\:border-black { border-color: black !important; }
          .print\\:p-4 { padding: 1rem !important; }
        }
      `}</style>
    </>
  );
};

export default StaffQuickCard;
