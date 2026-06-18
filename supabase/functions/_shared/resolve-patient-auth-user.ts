import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

async function findAuthUserIdByEmail(
  supabase: SupabaseClient,
  email: string,
): Promise<string | null> {
  const normalized = email.trim().toLowerCase();

  for (let page = 1; page <= 10; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) {
      throw new Error(error.message);
    }

    const match = data.users.find((user) => user.email?.trim().toLowerCase() === normalized);
    if (match?.id) {
      return match.id;
    }

    if (data.users.length < 200) {
      break;
    }
  }

  return null;
}

/**
 * Ensures a patient row is linked to a Supabase auth user for magic-link sign-in.
 * Creates a new auth user when none exists; reuses an existing account when the
 * email is already registered (e.g. staff members who are also test patients).
 */
export async function resolvePatientAuthUserId(
  supabase: SupabaseClient,
  patient: { id: string; full_name: string | null; email: string; user_id: string | null },
): Promise<string> {
  if (patient.user_id) {
    return patient.user_id;
  }

  const tempPassword = crypto.randomUUID() + crypto.randomUUID();
  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email: patient.email,
    email_confirm: true,
    password: tempPassword,
    user_metadata: { full_name: patient.full_name, patient_id: patient.id },
  });

  let authUserId: string | null = created?.user?.id ?? null;

  if (!authUserId) {
    authUserId = await findAuthUserIdByEmail(supabase, patient.email);
  }

  if (!authUserId) {
    throw new Error(createError?.message ?? "Could not resolve auth user for patient");
  }

  const { data: otherPatient } = await supabase
    .from("patients")
    .select("id")
    .eq("user_id", authUserId)
    .neq("id", patient.id)
    .maybeSingle();

  if (otherPatient) {
    throw new Error("This email is already linked to another patient record");
  }

  await supabase.from("patients").update({ user_id: authUserId }).eq("id", patient.id);

  const { data: existingRole } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", authUserId)
    .eq("role", "user")
    .maybeSingle();

  if (!existingRole) {
    await supabase.from("user_roles").insert({ user_id: authUserId, role: "user" });
  }

  return authUserId;
}
