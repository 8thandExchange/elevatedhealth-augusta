import { useMemo, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { HelpCircle, Search, ExternalLink, BookOpen, CalendarDays, Clock, ClipboardList, Boxes, Loader2, Sparkles, TestTube2 } from "lucide-react";
import { LABCORP_PROVIDER_PORTAL_URL } from "@/lib/labcorpPortal";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

type HelpArticle = {
  id: string;
  title: string;
  keywords: string[];
  steps: string[];
  links?: Array<{ label: string; to: string }>;
};

const ARTICLES: HelpArticle[] = [
  {
    id: "schedule-edit",
    title: "Update your schedule (your recurring availability)",
    keywords: ["schedule", "availability", "hours", "recurring", "provider schedule", "my schedule"],
    steps: [
      "Open My Schedule.",
      "Use the week view to confirm you are editing the right week.",
      "Click and drag on the calendar grid to create availability blocks.",
      "Use Time Off to block out PTO, meetings, or a one-off absence.",
      "If a patient says they can't find a time, verify your availability blocks exist for that day and time.",
    ],
    links: [
      { label: "Open My Schedule", to: "/calendar?tab=hours" },
      { label: "Office-wide Schedule (front desk view)", to: "/calendar" },
    ],
  },
  {
    id: "schedule-timeoff",
    title: "Block time off (PTO, lunch, meetings)",
    keywords: ["time off", "pto", "block", "meeting", "lunch", "unavailable"],
    steps: [
      "Open My Schedule.",
      "Click Time Off (or the block tool) and select the start and end time.",
      "Add a short reason (optional) and save.",
      "If you still appear available, refresh and verify the block covers the full time window.",
    ],
    links: [{ label: "Open My Schedule", to: "/calendar?tab=hours" }],
  },
  {
    id: "book-patient",
    title: "Book a patient who already paid (or needs help booking)",
    keywords: ["book", "booking", "paid", "consult", "wellness assessment", "schedule consult"],
    steps: [
      "For hormones/peptides/weight loss: patients start with the $79 Wellness Assessment and then pick a time.",
      "If a patient is stuck, you can book them from the Office-wide Schedule or guide them to the booking link.",
      "If payment is confirmed but they can't see times, verify provider availability exists for that service line and duration.",
    ],
    links: [
      { label: "Office-wide Schedule", to: "/calendar" },
      { label: "Provider Dashboard", to: "/provider/dashboard" },
    ],
  },
  {
    id: "inventory-formulary",
    title: "Where to find inventory and formulary",
    keywords: ["inventory", "stock", "lots", "formulary", "pricing", "sku"],
    steps: [
      "Use Inventory for lot tracking, expirations, and quantities.",
      "Use Formulary for standardized pricing, suppliers, and dose references.",
    ],
    links: [
      { label: "Inventory", to: "/inventory" },
      { label: "Formulary", to: "/formulary" },
      { label: "Lab catalog (panels, COGS, draw rules)", to: "/lab-catalog" },
      { label: "Vendor guide", to: "/staff/vendor-guide" },
      { label: "SOP Manual", to: "/staff/sop-manual" },
      { label: "Staff quick card (PDF)", to: "/staff-quick-card" },
      { label: "Formulary cheat sheet", to: "/staff/formulary-cheat-sheet" },
      { label: "Formulary economics", to: "/formulary-economics" },
    ],
  },
  {
    id: "vendor-routing",
    title: "GC vs FCC vs Custom Pharmacy",
    keywords: ["gc", "fcc", "vendor", "pharmacy", "routing", "cogs", "margin"],
    steps: [
      "Metabolic peptides and advanced recovery (BPC-157, TB-500) → GC Scientific partner network.",
      "IV Lounge premix and boosters → FCC FormuConnect.",
      "Sermorelin → GC or FCC per catalog availability.",
      "All hormones → Custom Pharmacy of Evans (fax).",
    ],
    links: [{ label: "Vendor guide", to: "/staff/vendor-guide" }, { label: "System guide", to: "/staff/system-guide" }, { label: "IV safety", to: "/staff/iv-safety" }],
  },
];

function scoreArticle(article: HelpArticle, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return 0;
  const hay = [article.title, ...article.keywords].join(" ").toLowerCase();
  if (hay.includes(q)) return 100;
  const tokens = q.split(/\s+/).filter(Boolean);
  let score = 0;
  for (const t of tokens) {
    if (t.length < 2) continue;
    if (hay.includes(t)) score += 10;
  }
  return score;
}

export function StaffHelpWidget() {
  const { pathname } = useLocation();
  const [query, setQuery] = useState("");
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const results = useMemo(() => {
    const scored = ARTICLES.map((a) => ({ a, s: scoreArticle(a, query) }))
      .filter((x) => (query.trim() ? x.s > 0 : true))
      .sort((x, y) => y.s - x.s);
    return scored.map((x) => x.a);
  }, [query]);

  const quickLinks = useMemo(
    () => [
      { label: "My Schedule", to: "/calendar?tab=hours", icon: Clock },
      { label: "Office Schedule", to: "/calendar", icon: CalendarDays },
      { label: "Dashboard", to: "/provider/dashboard", icon: BookOpen },
      { label: "LabCorp Portal", href: LABCORP_PROVIDER_PORTAL_URL, icon: TestTube2, external: true },
      { label: "Inventory", to: "/inventory", icon: Boxes },
      { label: "Formulary", to: "/formulary", icon: ClipboardList },
      { label: "Lab catalog", to: "/lab-catalog", icon: TestTube2 },
      { label: "Vendor guide", to: "/staff/vendor-guide" },
      { label: "System guide", to: "/staff/system-guide" },
      { label: "IV safety", to: "/staff/iv-safety" },
      { label: "Pricing readiness", to: "/admin/pricing-readiness" },
      { label: "Clinical policy", to: "/clinical-policy" },
      { label: "Formulary economics", to: "/formulary-economics" },
      { label: "SOP Manual", to: "/staff/sop-manual", icon: ClipboardList },
      { label: "Staff quick card", to: "/staff-quick-card", icon: ClipboardList },
      { label: "Formulary cheat sheet", to: "/staff/formulary-cheat-sheet", icon: ClipboardList },
    ],
    [],
  );

  const askAi = async () => {
    const q = aiQuestion.trim();
    if (!q) return;
    setAiLoading(true);
    setAiError(null);
    setAiAnswer(null);
    try {
      const { data, error } = await supabase.functions.invoke("staff-help-ai", {
        body: { question: q, pathname },
      });
      if (error) throw error;
      if (data?.error) throw new Error(String(data.error));
      setAiAnswer(String(data?.answer || ""));
    } catch (e: any) {
      setAiError(e?.message || "Could not reach the help assistant. Try again.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            type="button"
            variant="secondary"
            className="shadow-lg"
            aria-label="Open staff help"
          >
            <HelpCircle className="h-4 w-4" />
            Help
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[92vw] sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="font-playfair">Staff Help</SheetTitle>
            <SheetDescription className="font-jost">
              Ask “how do I…” and get step-by-step guidance. You’re on{" "}
              <span className="font-medium text-foreground">{pathname}</span>.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-5 space-y-4">
            <div className="rounded-lg border border-border/60 bg-card p-4">
              <div className="flex items-center gap-2 text-sm font-jost font-medium text-foreground">
                <Sparkles className="h-4 w-4 text-accent" />
                Ask the Help Assistant
              </div>
              <p className="mt-1 text-xs font-jost text-muted-foreground">
                Keep questions portal-focused. Don’t include patient names, emails, or phone numbers.
              </p>
              <div className="mt-3 flex gap-2">
                <Input
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  placeholder='Example: "How do I block lunch on my schedule?"'
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void askAi();
                  }}
                />
                <Button type="button" onClick={askAi} disabled={aiLoading || !aiQuestion.trim()}>
                  {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ask"}
                </Button>
              </div>
              {aiError && (
                <div className="mt-3 text-xs font-jost text-destructive">
                  {aiError}
                </div>
              )}
              {aiAnswer && (
                <div className="mt-3 whitespace-pre-wrap rounded-md bg-muted/40 p-3 text-sm font-jost text-foreground">
                  {aiAnswer}
                </div>
              )}
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='Try: "block time off", "update my schedule", "book a patient"'
                className="pl-9"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {quickLinks.map((l) => {
                const Icon = l.icon;
                const label = (
                  <>
                    {Icon ? <Icon className="h-4 w-4" /> : null}
                    {l.label}
                  </>
                );
                if ("href" in l && l.href) {
                  return (
                    <Button
                      key={l.label}
                      asChild
                      variant="outline"
                      size="sm"
                      className="normal-case tracking-normal border-blue-600/30 bg-blue-50/70 dark:bg-blue-950/25"
                    >
                      <a href={l.href} target="_blank" rel="noopener noreferrer">
                        {label}
                        <ExternalLink className="h-3 w-3 opacity-60" />
                      </a>
                    </Button>
                  );
                }
                return (
                  <Button key={l.to} asChild variant="outline" size="sm" className="normal-case tracking-normal">
                    <Link to={l.to!}>{label}</Link>
                  </Button>
                );
              })}
            </div>

            <div className="space-y-3 overflow-auto max-h-[60vh] pr-1">
              {results.map((a) => (
                <div key={a.id} className="rounded-lg border border-border/60 bg-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-playfair text-base text-foreground">{a.title}</div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {a.keywords.slice(0, 5).map((k) => (
                          <Badge
                            key={k}
                            variant="secondary"
                            className={cn("text-[10px] font-jost font-medium", query ? "opacity-100" : "opacity-70")}
                          >
                            {k}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <ol className="mt-3 space-y-2 list-decimal ml-5 font-jost text-sm text-muted-foreground">
                    {a.steps.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ol>

                  {a.links && a.links.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {a.links.map((l) => (
                        <Button key={l.to} asChild variant="ghost" size="sm" className="normal-case tracking-normal">
                          <Link to={l.to}>
                            <ExternalLink className="h-4 w-4" />
                            {l.label}
                          </Link>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {results.length === 0 && (
                <div className="rounded-lg border border-dashed border-border/70 p-4 text-sm text-muted-foreground font-jost">
                  No matches yet. Try different words (example: “schedule”, “time off”, “book”).
                  If you’re still stuck, call (706) 760-3470.
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

