import {
  peptideOutcomeGroups,
  therapyByKey,
  type PeptideOutcomeGroup,
} from "@/lib/therapyCatalog";
import { OutcomeGroupCard } from "./design-system";

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
      {groups.map((group) => (
        <OutcomeGroupCard
          key={group.id}
          title={group.title}
          therapyLabels={visibleTherapyLabels(group)}
          summary={group.summary}
        />
      ))}
    </div>
  );
}
