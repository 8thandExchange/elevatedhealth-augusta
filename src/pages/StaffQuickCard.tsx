import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer } from "lucide-react";

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
              <p className="text-sm font-medium">Front Desk Cheat Sheet • January 2025</p>
            </div>

            {/* Entry Point */}
            <div className="bg-primary/10 rounded-lg p-3 mb-4 print:bg-gray-100">
              <h2 className="font-bold text-sm uppercase tracking-wide mb-1">Entry Point</h2>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-lg">$79 Wellness Assessment</p>
                  <p className="text-sm">30 min • IN-PERSON at Evans clinic</p>
                  <p className="text-sm italic">Fee credited toward first treatment</p>
                </div>
              </div>
            </div>

            {/* Core Services Grid */}
            <div className="mb-4">
              <h2 className="font-bold text-sm uppercase tracking-wide mb-2 border-b border-foreground pb-1 print:border-black">
                Core Services
              </h2>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                <div className="flex justify-between py-1 border-b border-border">
                  <span>Vitality Membership</span>
                  <span className="font-mono font-bold">$249/mo</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border">
                  <span>Semaglutide (GLP-1)</span>
                  <span className="font-mono font-bold">$399/mo</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border">
                  <span>Tirzepatide</span>
                  <span className="font-mono font-bold">$499/mo</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border">
                  <span>Hormone Add-On (GLP-1)</span>
                  <span className="font-mono font-bold">+$149/mo</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border">
                  <span>IV Ketamine (single)</span>
                  <span className="font-mono font-bold">$400</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border">
                  <span>IV Ketamine (6-pack)</span>
                  <span className="font-mono font-bold">$2,200</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border">
                  <span>Hormone Mapping Kit</span>
                  <span className="font-mono font-bold">$349</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border">
                  <span className="italic">↳ With $79 credit</span>
                  <span className="font-mono font-bold">$270</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border">
                  <span>RN Follow-Up (15min)</span>
                  <span className="font-mono font-bold">$49</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border">
                  <span>Injection Admin</span>
                  <span className="font-mono font-bold">$20</span>
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
                  <span>"The $79 fee is credited toward your treatment."</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span>"Labs are NOT required for weight loss — most start the same week."</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span>"SPRAVATO® is often covered by insurance (BCBS, TRICARE)."</span>
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
                <p className="text-xs">BCBS, TRICARE, VA accepted for Ketamine</p>
                <p className="text-xs">Other services: Superbill for OON</p>
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
