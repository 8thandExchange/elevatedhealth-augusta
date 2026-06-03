import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type ProtocolLinkInfo = {
  slug: string;
  title: string;
  versionStatus: string | null;
};

export async function fetchClinicalProtocolsBySlugs(
  slugs: string[],
): Promise<Map<string, ProtocolLinkInfo>> {
  const unique = [...new Set(slugs.filter(Boolean))];
  const out = new Map<string, ProtocolLinkInfo>();
  if (unique.length === 0) return out;

  const { data: protocols, error } = await supabase
    .from("clinical_protocols")
    .select("slug, title, current_version_id")
    .in("slug", unique);
  if (error) throw error;

  const versionIds = (protocols ?? [])
    .map((p) => p.current_version_id)
    .filter((id): id is string => !!id);

  const statusByVersionId = new Map<string, string>();
  if (versionIds.length) {
    const { data: versions, error: vErr } = await supabase
      .from("clinical_protocol_versions")
      .select("id, status")
      .in("id", versionIds);
    if (vErr) throw vErr;
    for (const v of versions ?? []) {
      statusByVersionId.set(v.id, v.status);
    }
  }

  for (const p of protocols ?? []) {
    const row = p as Pick<Tables<"clinical_protocols">, "slug" | "title" | "current_version_id">;
    out.set(row.slug, {
      slug: row.slug,
      title: row.title,
      versionStatus: row.current_version_id
        ? statusByVersionId.get(row.current_version_id) ?? null
        : null,
    });
  }
  return out;
}
