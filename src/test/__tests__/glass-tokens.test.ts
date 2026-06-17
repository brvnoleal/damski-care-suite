import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Ensures the Soft UI Minimal SaaS design tokens and utility classes remain
 * defined in index.css. Guards against accidental removal of:
 *  - .glass / .glass-strong / .glass-hover / .glass-header / .glass-sidebar
 *  - --shadow-glass token
 *  - monochrome surface tokens (background, card, border)
 */
describe("Soft UI Minimal CSS tokens", () => {
  const css = readFileSync(resolve(__dirname, "../../index.css"), "utf-8");

  it.each([
    [".glass"],
    [".glass-strong"],
    [".glass-hover"],
    [".glass-header"],
    [".glass-sidebar"],
  ])("defines %s utility", (selector) => {
    expect(css).toContain(selector);
  });

  it("declares --shadow-glass token", () => {
    expect(css).toMatch(/--shadow-glass\s*:/);
  });

  it("uses flat white surfaces (no backdrop blur)", () => {
    expect(css).toMatch(/background-color:\s*hsl\(var\(--card\)\)/);
    expect(css).not.toMatch(/backdrop-filter:\s*blur\(/);
  });

  it("body has a clean neutral background", () => {
    expect(css).toMatch(/@apply\s+.*\bbg-background\b/);
  });
});
