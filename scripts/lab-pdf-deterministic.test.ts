import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseLabTextFixture } from "../supabase/functions/_shared/lab-pdf-deterministic.ts";

const FIXTURES = join(import.meta.dirname, "../supabase/functions/parse-zrt-labs/fixtures");

describe("deterministic lab text parsing", () => {
  it("parses ZRT fixture analytes and omits patient name", () => {
    const text = readFileSync(join(FIXTURES, "zrt-synthetic-text-layer.txt"), "utf8");
    const result = parseLabTextFixture(text);
    expect(result).not.toBeNull();
    expect(result!.source).toBe("deterministic");
    expect(result!.patientName).toBeNull();
    expect(result!.labSource).toBe("zrt");
    expect(result!.collectionDate).toBe("2026-01-15");
    expect(result!.estradiol).toBe(1.8);
    expect(result!.progesterone).toBe(125);
    expect(result!.testosterone).toBe(42);
    expect(result!.dheas).toBe(1800);
    expect(result!.cortisol).toBe(0.85);
    expect(result!.pgE2Ratio).toBe(69.4);
  });

  it("parses LabCorp fixture analytes and omits patient name", () => {
    const text = readFileSync(join(FIXTURES, "labcorp-synthetic-text-layer.txt"), "utf8");
    const result = parseLabTextFixture(text);
    expect(result).not.toBeNull();
    expect(result!.patientName).toBeNull();
    expect(result!.labSource).toBe("labcorp");
    expect(result!.collectionDate).toBe("2026-01-19");
    expect(result!.hematocrit).toBe(42);
    expect(result!.psa).toBe(0.9);
    expect(result!.a1c).toBe(5.4);
    expect(result!.tsh).toBe(2.1);
    expect(result!.vitaminD).toBe(38);
    expect(result!.ldl).toBe(102);
  });
});
