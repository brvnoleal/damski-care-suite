import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Ensures the Liquid Glass design tokens and utility classes remain
 * defined in index.css. Guards against accidental removal of:
 *  - .glass / .glass-strong / .glass-hover / .glass-header / .glass-sidebar
 *  - --shadow-glass token
 *  - backdrop-filter blur
 */
describe("Liquid Glass CSS tokens", () => {
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

  it("uses backdrop-filter blur (translucency effect)", () => {
    expect(css).toMatch(/backdrop-filter:\s*blur\(/);
    expect(css).toMatch(/-webkit-backdrop-filter:\s*blur\(/);
  });

  it("body has decorative radial-gradient background", () => {
    expect(css).toMatch(/body\s*\{[\s\S]*radial-gradient/);
  });
});
