// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, renderHook, screen } from "@testing-library/react";
import { Reveal } from "./Reveal";
import { Stagger } from "./Stagger";
import { StaggerItem } from "./StaggerItem";
import { fadeIn, fadeInUp, motionVariants, scaleIn, staggerContainer } from "@/lib/motion";

/**
 * Installs a window.matchMedia mock. Framer Motion queries
 * `window.matchMedia("(prefers-reduced-motion)")` (jsdom does not implement it),
 * so we return `matches: prefersReduced` for reduced-motion queries.
 */
function mockMatchMedia(prefersReduced: boolean) {
  const impl = (query: string) =>
    ({
      matches: query.includes("reduce") ? prefersReduced : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }) as unknown as MediaQueryList;
  window.matchMedia = vi.fn(impl) as unknown as typeof window.matchMedia;
}

/** jsdom lacks IntersectionObserver, which Framer Motion's whileInView uses. */
class IntersectionObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

beforeEach(() => {
  vi.stubGlobal("IntersectionObserver", IntersectionObserverStub);
  mockMatchMedia(false);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("Reveal", () => {
  it("renders its children with default props", () => {
    render(<Reveal>Reveal content</Reveal>);
    expect(screen.getByText("Reveal content")).toBeTruthy();
  });

  it("renders the correct element tag via the `as` prop", () => {
    render(
      <Reveal as="section">
        <span>Sectioned content</span>
      </Reveal>,
    );
    const el = screen.getByText("Sectioned content").closest("section");
    expect(el).not.toBeNull();
    expect(el?.tagName).toBe("SECTION");
  });
});

describe("Stagger", () => {
  it("renders all StaggerItem children", () => {
    render(
      <Stagger>
        <StaggerItem>Item 1</StaggerItem>
        <StaggerItem>Item 2</StaggerItem>
        <StaggerItem>Item 3</StaggerItem>
      </Stagger>,
    );
    expect(screen.getByText("Item 1")).toBeTruthy();
    expect(screen.getByText("Item 2")).toBeTruthy();
    expect(screen.getByText("Item 3")).toBeTruthy();
    expect(screen.getAllByText(/^Item \d$/)).toHaveLength(3);
  });
});

describe("motion.ts variants", () => {
  it("exports the expected variants, each with hidden + visible keys", () => {
    expect(Object.keys(motionVariants).sort()).toEqual(
      ["fadeIn", "fadeInUp", "scaleIn", "staggerContainer"].sort(),
    );

    for (const variant of [fadeInUp, fadeIn, scaleIn, staggerContainer]) {
      expect(variant).toHaveProperty("hidden");
      expect(variant).toHaveProperty("visible");
    }
  });
});

describe("reduced motion (accessibility guarantee)", () => {
  it("useReducedMotionSafe returns true and Reveal still renders children", async () => {
    // Framer Motion caches the reduced-motion result in a module-level singleton
    // on first read. framer-motion is inlined (see vite.config.ts) so resetting
    // modules re-imports it fresh, re-reading matchMedia = reduce. React and RTL
    // stay externalized (single instance), so there is no dual-React mismatch.
    mockMatchMedia(true);
    vi.resetModules();

    const { useReducedMotionSafe } = await import("@/lib/motion");
    const { Reveal: FreshReveal } = await import("./Reveal");

    const { result } = renderHook(() => useReducedMotionSafe());
    expect(result.current).toBe(true);

    render(<FreshReveal>Reduced content</FreshReveal>);
    expect(screen.getByText("Reduced content")).toBeTruthy();
  });
});
