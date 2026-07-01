import { Card, CardContent } from "@/components/ui/card";
import {
  peptideOutcomeGroups,
  therapyByKey,
  type PeptideOutcomeGroup,
} from "@/lib/therapyCatalog";

function therapyLabel(key: string): string | null {
  const t = therapyByKey(key);
  if (!t) return null;
  if (t.hiddenAtLaunch) return null;
  return t.name.replace(/\s*\(.+\)$/, "");
}

function visibleTherapyLabels(group: PeptideOutcomeGroup): string[] {
  return group.therapyKeys
    .map(therapyLabel)
    .filter((name, i, arr): name is string => Boolean(name) && arr.indexOf(name) === i);
}

export function PeptideOutcomeCards() {
  const groups = peptideOutcomeGroups().filter((g) => visibleTherapyLabels(g).length > 0);

  return (
    <div className="grid sm:grid-cols-2 gap-6">
      {groups.map((group) => {
        const labels = visibleTherapyLabels(group);
        return (
          <Card key={group.id} className="border-border/60">
            <CardContent className="p-6 space-y-3">
              <h3 className="font-playfair text-lg text-foreground">{group.title}</h3>
              <p className="font-jost text-xs text-accent">{labels.join(" · ")}</p>
              <p className="font-jost text-sm text-muted-foreground leading-relaxed">{group.summary}</p>
              <p className="font-jost text-xs text-muted-foreground italic">
                Provider-reviewed · physician-guided · your provider determines fit
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
