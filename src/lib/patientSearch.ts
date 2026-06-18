/** Escape user input for PostgREST filter strings (double-quoted ilike values). */
export function escapePostgrestFilterValue(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

/** OR filter: full_name, email, phone — for `.or()` on patients queries. */
export function patientNameEmailPhoneOrFilter(term: string): string {
  const like = `%${escapePostgrestFilterValue(term.trim())}%`;
  return `full_name.ilike."${like}",email.ilike."${like}",phone.ilike."${like}"`;
}

/** OR filter: full_name, email only. */
export function patientNameEmailOrFilter(term: string): string {
  const like = `%${escapePostgrestFilterValue(term.trim())}%`;
  return `full_name.ilike."${like}",email.ilike."${like}"`;
}
