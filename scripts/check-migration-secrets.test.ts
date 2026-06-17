import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = join(import.meta.dirname, "..");
const MIGRATIONS_DIR = join(REPO_ROOT, "supabase/migrations");

/** Literal string inside crypt('...') or extensions.crypt('...') — must not appear in migrations. */
const CRYPT_LITERAL_PATTERN =
  /(?:extensions\.)?crypt\s*\(\s*'(?!gen_random_uuid)[^']+'/gi;

const FORBIDDEN_PASSWORD_PATTERNS = [
  /Elevated2026/i,
  /crypt\s*\(\s*'calendar'/i,
  /extensions\.crypt\s*\(\s*'calendar'/i,
];

function migrationFiles(): string[] {
  return readdirSync(MIGRATIONS_DIR)
    .filter((name) => name.endsWith(".sql"))
    .sort();
}

describe("migration secret guard", () => {
  it("no migration sets a known literal password via crypt()", () => {
    const violations: string[] = [];

    for (const file of migrationFiles()) {
      const content = readFileSync(join(MIGRATIONS_DIR, file), "utf8");
      const path = `supabase/migrations/${file}`;

      for (const pattern of FORBIDDEN_PASSWORD_PATTERNS) {
        if (pattern.test(content)) {
          violations.push(`${path}: matches ${pattern}`);
        }
      }

      CRYPT_LITERAL_PATTERN.lastIndex = 0;
      if (CRYPT_LITERAL_PATTERN.test(content)) {
        violations.push(`${path}: crypt() uses a literal password string`);
      }
    }

    expect(violations, violations.join("\n")).toEqual([]);
  });
});
