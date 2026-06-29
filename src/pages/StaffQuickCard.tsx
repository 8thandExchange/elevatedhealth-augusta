import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { useMemo, useRef, useState } from "react";
import { ArrowLeft, Download, ExternalLink, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  buildStaffDeskCardHtml,
  buildStaffQuickCardHtml,
  DESK_CARD_PDF_STABLE,
  downloadDeskCardPdf,
  downloadFullQuickReferencePdf,
  QUICK_CARD_PDF_STABLE,
} from "@/lib/staffQuickCardExport";
import { QUICK_CARD_META } from "@/lib/staffQuickCardContent";

const StaffQuickCard = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [view, setView] = useState<"desk" | "full">("desk");
  const [downloading, setDownloading] = useState<string | null>(null);

  const html = useMemo(
    () => (view === "desk" ? buildStaffDeskCardHtml() : buildStaffQuickCardHtml()),
    [view],
  );

  const handlePrint = () => {
    iframeRef.current?.contentWindow?.print();
  };

  const handleDownload = async (kind: "desk" | "full") => {
    setDownloading(kind);
    try {
      if (kind === "desk") await downloadDeskCardPdf();
      else await downloadFullQuickReferencePdf();
    } finally {
      setDownloading(null);
    }
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
            <p className="font-jost text-sm text-muted-foreground hidden md:block">
              {QUICK_CARD_META.title} · laminate the 1-page desk card
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant={view === "desk" ? "default" : "outline"}
                className="font-jost"
                onClick={() => setView("desk")}
              >
                1-page desk card
              </Button>
              <Button
                type="button"
                size="sm"
                variant={view === "full" ? "default" : "outline"}
                className="font-jost"
                onClick={() => setView("full")}
              >
                3-page full guide
              </Button>
            </div>
          </div>
          <div className="container mx-auto px-4 pb-3 flex flex-wrap gap-2 max-w-6xl">
            <Button
              type="button"
              size="sm"
              className="font-jost gap-2"
              disabled={downloading === "desk"}
              onClick={() => handleDownload("desk")}
            >
              <Download className="h-4 w-4" />
              {downloading === "desk" ? "Downloading…" : "Download Desk Card PDF"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="font-jost gap-2"
              disabled={downloading === "full"}
              onClick={() => handleDownload("full")}
            >
              <Download className="h-4 w-4" />
              {downloading === "full" ? "Downloading…" : "Download Full Guide PDF"}
            </Button>
            <Button type="button" variant="outline" size="sm" className="font-jost gap-2" onClick={handlePrint}>
              <Printer className="h-4 w-4" />
              Print preview
            </Button>
            <Button type="button" variant="ghost" size="sm" className="font-jost gap-2" asChild>
              <a href={DESK_CARD_PDF_STABLE} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                Open desk PDF
              </a>
            </Button>
            <Button type="button" variant="ghost" size="sm" className="font-jost gap-2" asChild>
              <a href={QUICK_CARD_PDF_STABLE} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                Open full PDF
              </a>
            </Button>
          </div>
        </div>

        <iframe
          ref={iframeRef}
          title={QUICK_CARD_META.title}
          srcDoc={html}
          className="flex-1 w-full min-h-[calc(100vh-10rem)] border-0 bg-white print:min-h-screen print:h-auto"
        />
      </div>
    </>
  );
};

export default StaffQuickCard;
