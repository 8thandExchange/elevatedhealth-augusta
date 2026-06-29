import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { useMemo, useRef } from "react";
import { ArrowLeft, Download, ExternalLink, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  buildStaffQuickCardHtml,
  downloadStaffQuickCardHtml,
  QUICK_CARD_HTML_PATH,
  QUICK_CARD_PDF_PATH,
} from "@/lib/staffQuickCardExport";
import { QUICK_CARD_META } from "@/lib/staffQuickCardContent";

const StaffQuickCard = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const html = useMemo(() => buildStaffQuickCardHtml(), []);

  const handlePrint = () => {
    iframeRef.current?.contentWindow?.print();
  };

  return (
    <>
      <Helmet>
        <title>Staff Quick Reference Card | Elevated Health Augusta</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-muted/30">
        <div className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur print:hidden">
          <div className="container mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3 max-w-6xl">
            <Button asChild variant="ghost" size="sm" className="font-jost gap-2">
              <Link to="/staff/sop-manual">
                <ArrowLeft className="h-4 w-4" />
                SOP Manual
              </Link>
            </Button>
            <p className="font-jost text-sm text-muted-foreground hidden sm:block">
              {QUICK_CARD_META.title} · v{QUICK_CARD_META.version} · print &amp; laminate at desk
            </p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" size="sm" className="font-jost gap-2" onClick={handlePrint}>
                <Printer className="h-4 w-4" />
                Print
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="font-jost gap-2"
                onClick={() => downloadStaffQuickCardHtml()}
              >
                <Download className="h-4 w-4" />
                Download HTML
              </Button>
              <Button type="button" variant="default" size="sm" className="font-jost gap-2" asChild>
                <a href={QUICK_CARD_PDF_PATH} target="_blank" rel="noopener noreferrer" download>
                  <Download className="h-4 w-4" />
                  Download PDF
                </a>
              </Button>
              <Button type="button" variant="outline" size="sm" className="font-jost gap-2" asChild>
                <a href={QUICK_CARD_HTML_PATH} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  Open PDF folder
                </a>
              </Button>
            </div>
          </div>
        </div>

        <iframe
          ref={iframeRef}
          title={QUICK_CARD_META.title}
          srcDoc={html}
          className="flex-1 w-full min-h-[calc(100vh-8rem)] border-0 bg-white print:min-h-screen print:h-auto"
        />
      </div>
    </>
  );
};

export default StaffQuickCard;
