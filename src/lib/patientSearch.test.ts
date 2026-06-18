import { describe, expect, it } from "vitest";
import {
  escapePostgrestFilterValue,
  patientNameEmailOrFilter,
  patientNameEmailPhoneOrFilter,
} from "./patientSearch";

describe("patientSearch", () => {
  it("quotes ilike patterns for PostgREST", () => {
    expect(patientNameEmailPhoneOrFilter("jane")).toBe(
      'full_name.ilike."%jane%",email.ilike."%jane%",phone.ilike."%jane%"',
    );
  });

  it("escapes double quotes in search terms", () => {
    expect(patientNameEmailOrFilter('a"b')).toBe(
      'full_name.ilike."%a\\"b%",email.ilike."%a\\"b%"',
    );
  });

  it("escapes backslashes", () => {
    expect(escapePostgrestFilterValue("a\\b")).toBe('a\\\\b');
  });
});
