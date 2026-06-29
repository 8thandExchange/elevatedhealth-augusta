/**
 * EHA print/PDF brand tokens — Navy + Steel Blue (matches src/index.css logo palette).
 * Used by staff quick card, complete reference, formulary cheat sheet, and SOP exports.
 */
export const STAFF_PRINT_BRAND = {
  navy: "#00477E",
  navyDark: "#002D4F",
  steel: "#0B7BB8",
  steelLight: "#3D9FD1",
  paper: "#FFFFFF",
  ink: "#0B3555",
  surface: "#F4F8FB",
  muted: "#5B6770",
  border: "#C9D4DD",
  green: "#1a5f1a",
  red: "#8b2e2e",
} as const;

/** Shared :root block for staff print HTML exports. */
export const STAFF_PRINT_CSS_ROOT = `
  :root {
    --navy: ${STAFF_PRINT_BRAND.navy};
    --navy-dark: ${STAFF_PRINT_BRAND.navyDark};
    --steel: ${STAFF_PRINT_BRAND.steel};
    --steel-light: ${STAFF_PRINT_BRAND.steelLight};
    --paper: ${STAFF_PRINT_BRAND.paper};
    --ink: ${STAFF_PRINT_BRAND.ink};
    --surface: ${STAFF_PRINT_BRAND.surface};
    --muted: ${STAFF_PRINT_BRAND.muted};
    --border: ${STAFF_PRINT_BRAND.border};
    --green: ${STAFF_PRINT_BRAND.green};
    --red: ${STAFF_PRINT_BRAND.red};
  }
`;
