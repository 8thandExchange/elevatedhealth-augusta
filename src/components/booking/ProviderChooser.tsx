import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, User } from "lucide-react";

export interface ProviderOption {
  provider_id: string;
  display_name: string;
  credentials?: string | null;
  bio?: string | null;
}

interface ProviderChooserProps {
  serviceLine: string;
  selectedProviderId: string | null;
  onChange: (providerId: string | null) => void;
  // When true, hides the entire chooser if there is only one option
  // (auto-selects it and renders nothing). Used by IV where provider
  // assignment is invisible to the patient.
  hideWhenSingle?: boolean;
}

// Patient-facing chooser for which provider will see them. Today we have a
// single MD; this component is built so adding more providers later is a
// data-only change. Provider eligibility is derived from provider_schedules
// (any provider with at least one active schedule serving the service line
// is shown), avoiding a parallel "providers" table that would drift out of
// sync with what's actually scheduled.
const ProviderChooser = ({
  serviceLine,
  selectedProviderId,
  onChange,
  hideWhenSingle = false,
}: ProviderChooserProps) => {
  const [providers, setProviders] = useState<ProviderOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      // Eligible provider_ids = any active provider_schedules row whose
      // service_lines array contains the requested line.
      const { data: schedules } = await supabase
        .from("provider_schedules")
        .select("provider_id, service_lines, is_active")
        .eq("is_active", true)
        .contains("service_lines", [serviceLine]);

      const ids = Array.from(
        new Set((schedules || []).map((s) => s.provider_id)),
      );

      if (ids.length === 0) {
        if (!cancelled) {
          setProviders([]);
          setLoading(false);
        }
        return;
      }

      // No public profiles/providers table exists yet (provider names live
      // in auth.users metadata, only readable by the get-team-members edge
      // function). For now we render a neutral label per provider; when a
      // patient-readable provider directory lands we hydrate display_name,
      // credentials, and bio here.
      const opts: ProviderOption[] = ids.map((id) => ({
        provider_id: id,
        display_name:
          ids.length === 1 ? "Your provider" : `Provider ${id.slice(0, 4)}`,
        credentials: null,
        bio: null,
      }));

      if (cancelled) return;
      setProviders(opts);
      setLoading(false);

      // Auto-select if there's only one option and nothing is selected.
      if (opts.length === 1 && !selectedProviderId) {
        onChange(opts[0].provider_id);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [serviceLine, onChange, selectedProviderId]);

  if (loading) {
    return <Skeleton className="h-24 w-full rounded-lg" />;
  }

  if (providers.length === 0) {
    return null;
  }

  if (providers.length === 1 && hideWhenSingle) {
    return null;
  }

  return (
    <div className="space-y-3">
      <p className="font-jost text-sm text-muted-foreground">
        {providers.length === 1
          ? "Your visit will be with:"
          : "Choose your provider:"}
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        {providers.map((p) => {
          const selected = p.provider_id === selectedProviderId;
          return (
            <Card
              key={p.provider_id}
              role="button"
              aria-pressed={selected}
              onClick={() => onChange(p.provider_id)}
              className={`cursor-pointer transition-all border-2 ${
                selected
                  ? "border-accent bg-accent/5"
                  : "border-border hover:border-accent/50"
              }`}
            >
              <CardContent className="p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-jost font-medium text-foreground">
                      {p.display_name}
                    </p>
                    {selected && (
                      <CheckCircle2 className="h-4 w-4 text-accent" />
                    )}
                  </div>
                  {p.credentials && (
                    <p className="font-jost text-xs text-muted-foreground">
                      {p.credentials}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ProviderChooser;
