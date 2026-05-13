import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CORE_SERVICES,
  ELEVATED_PROGRAMS,
  IV_WALKIN_EXAMPLES,
  MEDICATION_FILLS,
  MEMBER_DISCOUNT_PERCENT,
  MEMBERSHIP_COMPARISON_ESTIMATES,
} from "@/lib/stripeConfig";

export type Program = "trt" | "hrt" | "glp1" | "wellness";

export interface MembershipComparisonProps {
  program: Program;
  className?: string;
  ctaHref?: string;
  /** GLP-1 only: which single-fill pricing to compare for the non-member med column. */
  drug?: "semaglutide" | "tirzepatide";
}

const fmt = (cents: number) => `$${(cents / 100).toFixed(0)}`;

const INCLUDED = "Included";

const DEFAULT_HREF: Record<Program, string> = {
  trt: "/hormones-men",
  hrt: "/hormones-women",
  glp1: "/weightloss",
  wellness: "/membership",
};

type Row = { service: string; nonMember: ReactNode; member: ReactNode };

function buildTrtRows(): Row[] {
  const nmSteady = MEMBERSHIP_COMPARISON_ESTIMATES.nonMemberSteadyMonthlyCents.trt;
  const nmM1 =
    CORE_SERVICES.wellnessAssessment.amount +
    CORE_SERVICES.comprehensivePanel.amount +
    MEDICATION_FILLS.testosterone.amount;
  const mM1 =
    CORE_SERVICES.wellnessAssessment.amount +
    CORE_SERVICES.comprehensivePanel.amount +
    ELEVATED_PROGRAMS.trt.amount;
  const nmY1 = nmM1 + nmSteady * 11;
  const mY1 = mM1 + ELEVATED_PROGRAMS.trt.amount * 11;
  const nmY2 = nmSteady * 12;
  const mY2 = ELEVATED_PROGRAMS.trt.amount * 12;

  return [
    {
      service: "Monthly medication (testosterone)",
      nonMember: `${MEDICATION_FILLS.testosterone.displayPrice}/fill`,
      member: INCLUDED,
    },
    {
      service: "Monthly check-in (clinical team)",
      nonMember: `${CORE_SERVICES.wellnessAssessment.displayPrice}/visit`,
      member: INCLUDED,
    },
    {
      service: "Quarterly Comprehensive Panel",
      nonMember: `${CORE_SERVICES.comprehensivePanel.displayPrice} each`,
      member: `${INCLUDED} (free quarterly)`,
    },
    {
      service: "Lab review by our physician",
      nonMember: `${CORE_SERVICES.medicalReview.displayPrice} if needed`,
      member: `${INCLUDED} for staff-initiated`,
    },
    {
      service: "Unlimited messaging",
      nonMember: "Not available à la carte",
      member: INCLUDED,
    },
    {
      service: "Month 1 total",
      nonMember: fmt(nmM1),
      member: fmt(mM1),
    },
    {
      service: "Monthly after Month 1",
      nonMember: `~${fmt(nmSteady)} (med + amortized labs + check-in)`,
      member: ELEVATED_PROGRAMS.trt.displayPrice,
    },
    {
      service: "Year 1 total",
      nonMember: `~${fmt(nmY1)} estimate`,
      member: fmt(mY1),
    },
    {
      service: "Year 2 total",
      nonMember: `~${fmt(nmY2)} estimate`,
      member: fmt(mY2),
    },
    {
      service: "Member savings (steady state Year 2)",
      nonMember: "—",
      member: "Saves ~$1,500+ in clinical care included that à la carte buyers skip",
    },
  ];
}

function buildHrtRows(): Row[] {
  const nmSteady = MEMBERSHIP_COMPARISON_ESTIMATES.nonMemberSteadyMonthlyCents.hrt;
  const nmM1 =
    CORE_SERVICES.wellnessAssessment.amount +
    CORE_SERVICES.comprehensivePanel.amount +
    MEDICATION_FILLS.biEst.amount +
    MEDICATION_FILLS.progesterone.amount;
  const mM1 =
    CORE_SERVICES.wellnessAssessment.amount +
    CORE_SERVICES.comprehensivePanel.amount +
    ELEVATED_PROGRAMS.hrt.amount;
  const nmY1 = nmM1 + nmSteady * 11;
  const mY1 = mM1 + ELEVATED_PROGRAMS.hrt.amount * 11;
  const savingsY1 = nmY1 - mY1;

  return [
    {
      service: "Monthly Bi-Est cream",
      nonMember: `${MEDICATION_FILLS.biEst.displayPrice}/fill`,
      member: INCLUDED,
    },
    {
      service: "Monthly Progesterone",
      nonMember: `${MEDICATION_FILLS.progesterone.displayPrice}/fill`,
      member: INCLUDED,
    },
    {
      service: "Monthly check-in (clinical team)",
      nonMember: `${CORE_SERVICES.wellnessAssessment.displayPrice}/visit`,
      member: INCLUDED,
    },
    {
      service: "Quarterly Comprehensive Panel",
      nonMember: `${CORE_SERVICES.comprehensivePanel.displayPrice} each`,
      member: INCLUDED,
    },
    {
      service: "Lab review by our physician",
      nonMember: `${CORE_SERVICES.medicalReview.displayPrice} if needed`,
      member: `${INCLUDED} for staff-initiated`,
    },
    {
      service: "Unlimited messaging",
      nonMember: "Not available à la carte",
      member: INCLUDED,
    },
    {
      service: "Month 1 total",
      nonMember: fmt(nmM1),
      member: fmt(mM1),
    },
    {
      service: "Monthly after Month 1",
      nonMember: `~${fmt(nmSteady)}`,
      member: ELEVATED_PROGRAMS.hrt.displayPrice,
    },
    {
      service: "Year 1 total",
      nonMember: `~${fmt(nmY1)}`,
      member: fmt(mY1),
    },
    {
      service: "Member savings (Year 1)",
      nonMember: "—",
      member: fmt(savingsY1),
    },
  ];
}

function buildGlp1Rows(drug: "semaglutide" | "tirzepatide"): Row[] {
  const fill = drug === "semaglutide" ? MEDICATION_FILLS.semaglutide : MEDICATION_FILLS.tirzepatide;
  const steadyKey = drug === "semaglutide" ? "glp1Semaglutide" : "glp1Tirzepatide";
  const nmSteady = MEMBERSHIP_COMPARISON_ESTIMATES.nonMemberSteadyMonthlyCents[steadyKey];
  const nmM1 =
    CORE_SERVICES.wellnessAssessment.amount + CORE_SERVICES.expandedPanel.amount + fill.amount;
  const mM1 =
    CORE_SERVICES.wellnessAssessment.amount +
    CORE_SERVICES.expandedPanel.amount +
    ELEVATED_PROGRAMS.glp1.amount;
  const nmY1 = nmM1 + nmSteady * 11;
  const mY1 = mM1 + ELEVATED_PROGRAMS.glp1.amount * 11;
  const savingsY1 = nmY1 - mY1;

  const medLabel =
    drug === "semaglutide" ? "Monthly compounded semaglutide" : "Monthly compounded tirzepatide";

  return [
    {
      service: medLabel,
      nonMember: `${fill.displayPrice}/fill`,
      member: INCLUDED,
    },
    {
      service: "Monthly check-in (clinical team)",
      nonMember: `${CORE_SERVICES.wellnessAssessment.displayPrice}/visit`,
      member: INCLUDED,
    },
    {
      service: "Quarterly Expanded Panel",
      nonMember: `${CORE_SERVICES.expandedPanel.displayPrice} each`,
      member: `${INCLUDED} (free quarterly)`,
    },
    {
      service: "Lab review by our physician",
      nonMember: `${CORE_SERVICES.medicalReview.displayPrice} if needed`,
      member: `${INCLUDED} for staff-initiated`,
    },
    {
      service: "Dose titration support",
      nonMember: "Not available à la carte",
      member: INCLUDED,
    },
    {
      service: "Unlimited messaging",
      nonMember: "Not available à la carte",
      member: INCLUDED,
    },
    {
      service: "Month 1 total",
      nonMember: fmt(nmM1),
      member: fmt(mM1),
    },
    {
      service: "Monthly after Month 1",
      nonMember: `~${fmt(nmSteady)}`,
      member: ELEVATED_PROGRAMS.glp1.displayPrice,
    },
    {
      service: "Year 1 total",
      nonMember: `~${fmt(nmY1)}`,
      member: fmt(mY1),
    },
    {
      service: "Member savings (Year 1)",
      nonMember: "—",
      member: fmt(savingsY1),
    },
  ];
}

function buildWellnessRows(): Row[] {
  const ivPair = IV_WALKIN_EXAMPLES.myersCocktailCents * 2;
  const nonMemberMonthly = ivPair + CORE_SERVICES.wellnessAssessment.amount;
  const memberMonthly = ELEVATED_PROGRAMS.wellness.amount;
  const savings = nonMemberMonthly - memberMonthly;

  return [
    {
      service: "IV drips (avg 2/month)",
      nonMember: `${fmt(IV_WALKIN_EXAMPLES.myersCocktailCents)} × 2 = ${fmt(ivPair)}/mo`,
      member: "2 included free",
    },
    {
      service: "À la carte peptide/sexual/hair products",
      nonMember: "Full price",
      member: `${MEMBER_DISCOUNT_PERCENT}% off`,
    },
    {
      service: "Monthly check-in (clinical team)",
      nonMember: `${CORE_SERVICES.wellnessAssessment.displayPrice}/visit`,
      member: INCLUDED,
    },
    {
      service: "Priority booking",
      nonMember: "Not available",
      member: INCLUDED,
    },
    {
      service: "Unlimited messaging",
      nonMember: "Not available",
      member: INCLUDED,
    },
    {
      service: "Monthly value",
      nonMember: `${fmt(nonMemberMonthly)}+/mo`,
      member: `${fmt(memberMonthly)}/mo`,
    },
    {
      service: "Member savings (steady state)",
      nonMember: "—",
      member: `${fmt(savings)}+/mo`,
    },
  ];
}

function rowsForProgram(program: Program, drug: "semaglutide" | "tirzepatide"): Row[] {
  switch (program) {
    case "trt":
      return buildTrtRows();
    case "hrt":
      return buildHrtRows();
    case "glp1":
      return buildGlp1Rows(drug);
    case "wellness":
      return buildWellnessRows();
  }
}

function footnoteFor(program: Program): string | null {
  if (program === "trt") {
    return "Non-member estimates assume monthly fills + quarterly labs only. Members receive full clinical oversight, lab review, and unlimited messaging — services not sold à la carte.";
  }
  if (program === "wellness") {
    return "Member savings vary based on usage. IV drip pricing example uses Myers Cocktail at " +
      fmt(IV_WALKIN_EXAMPLES.myersCocktailCents) +
      "; actual pricing varies by drip type.";
  }
  return null;
}

export function MembershipComparison({
  program,
  className,
  ctaHref,
  drug = "semaglutide",
}: MembershipComparisonProps) {
  const rows = rowsForProgram(program, drug);
  const prog = ELEVATED_PROGRAMS[program === "wellness" ? "wellness" : program];
  const href = ctaHref ?? DEFAULT_HREF[program];
  const memberTitle =
    program === "wellness" ? ELEVATED_PROGRAMS.wellness.name : `${prog.name} Member`;
  const footnote = footnoteFor(program);

  return (
    <section className={cn("text-foreground", className)}>
      {/* Mobile: member-first cards */}
      <div className="md:hidden space-y-3">
        {rows.map((row, i) => (
          <div
            key={i}
            className="rounded-lg border border-border bg-background p-4 space-y-3 shadow-sm"
          >
            <p className="font-playfair text-lg font-semibold leading-snug">{row.service}</p>
            <div
              className={cn(
                "rounded-lg p-3 space-y-1 bg-accent/10 ring-2 ring-accent",
                i === 0 && "relative pt-8",
              )}
            >
              {i === 0 && (
                <span className="absolute left-3 top-2 text-xs font-medium uppercase tracking-wide text-accent-foreground">
                  Recommended
                </span>
              )}
              <p className="text-xs font-medium text-muted-foreground">ELEVATED member</p>
              <p className="text-sm font-medium">{row.member}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Non-member (à la carte)</p>
              <p className="text-sm">{row.nonMember}</p>
            </div>
          </div>
        ))}
        <div className="flex justify-center pt-2">
          <Button variant="outline" asChild>
            <Link to={href}>
              Join {prog.name} — {prog.displayPrice}
            </Link>
          </Button>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden md:block rounded-lg border border-border overflow-hidden">
        <div className="grid grid-cols-3 gap-0 border-b border-border bg-muted/40">
          <div className="p-4 font-playfair text-lg font-semibold border-r border-border">Service</div>
          <div className="p-4 font-playfair text-lg font-semibold border-r border-border">
            Non-Member (à la carte)
          </div>
          <div className="p-4 font-playfair text-lg font-semibold bg-accent/10 ring-2 ring-inset ring-accent relative">
            <span className="absolute right-3 top-3 text-xs font-medium uppercase tracking-wide text-accent-foreground">
              Recommended
            </span>
            {memberTitle}
          </div>
        </div>
        {rows.map((row, i) => (
          <div
            key={i}
            className="grid grid-cols-3 gap-0 border-b border-border last:border-b-0 text-sm"
          >
            <div className="p-4 border-r border-border font-medium">{row.service}</div>
            <div className="p-4 border-r border-border">{row.nonMember}</div>
            <div className="p-4 bg-accent/10 ring-2 ring-inset ring-accent">{row.member}</div>
          </div>
        ))}
        <div className="grid grid-cols-3 gap-0 border-t border-border">
          <div className="p-4 border-r border-border" />
          <div className="p-4 border-r border-border" />
          <div className="p-4 bg-accent/10 ring-2 ring-inset ring-accent flex items-center justify-center">
            <Button variant="outline" asChild>
              <Link to={href}>
                Join {prog.name} — {prog.displayPrice}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {footnote ? <p className="mt-4 text-xs text-muted-foreground max-w-3xl">{footnote}</p> : null}
    </section>
  );
}
