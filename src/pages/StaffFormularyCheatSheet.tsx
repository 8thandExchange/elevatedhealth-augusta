import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { useMemo, useRef } from "react";
import { ArrowLeft, Download, ExternalLink, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  buildFormularyCheatSheetHtml,
  CHEAT_SHEET_HTML_PATH,
  CHEAT_SHEET_PDF_PATH,
  downloadFormularyCheatSheetHtml,
} from "@/lib/formularyCheatSheetExport";
import { CHEAT_SHEET_META } from "@/lib/formularyCheatSheetContent";

const StaffFormularyCheatSheet = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const html = useMemo(() => buildFormularyCheatSheetHtml(), []);

  const handlePrint = () => {
    iframeRef.current?.contentWindow?.print();
  };

  return (
    <>
      <Helmet>
        <title>Formulary Cheat Sheet | Elevated Health Augusta</title>
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
              {CHEAT_SHEET_META.title} · v{CHEAT_SHEET_META.version}
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
                onClick={() => downloadFormularyCheatSheetHtml()}
              >
                <Download className="h-4 w-4" />
                Download HTML
              </Button>
              <Button type="button" variant="outline" size="sm" className="font-jost gap-2" asChild>
                <a href={CHEAT_SHEET_PDF_PATH} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4" />
                  Open PDF
                </a>
              </Button>
              <Button type="button" variant="outline" size="sm" className="font-jost gap-2" asChild>
                <a href={CHEAT_SHEET_HTML_PATH} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  New tab
                </a>
              </Button>
            </div>
          </div>
        </div>

        <iframe
          ref={iframeRef}
          title={CHEAT_SHEET_META.title}
          srcDoc={html}
          className="flex-1 w-full min-h-[calc(100vh-8rem)] border-0 bg-white print:min-h-screen print:h-auto"
        />
      </div>
    </>
  );
};

export default StaffFormularyCheatSheet;
