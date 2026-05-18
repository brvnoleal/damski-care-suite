import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { LiquidGlassCard } from "@/components/ui/liquid-glass";
import { Card } from "@/components/ui/card";

/**
 * Liquid Glass regression tests.
 * Guarantees that the glass utility classes remain applied to the core
 * surface components. If anyone removes the blur/translucency, these break.
 */
describe("Liquid Glass surfaces", () => {
  it("LiquidGlassCard applies glass-strong + glass-hover + rounded", () => {
    const { container } = render(
      <LiquidGlassCard>
        <span>conteúdo</span>
      </LiquidGlassCard>
    );
    const root = container.firstChild as HTMLElement;
    expect(root).toBeInTheDocument();
    expect(root.className).toMatch(/\bglass-strong\b/);
    expect(root.className).toMatch(/\bglass-hover\b/);
    expect(root.className).toMatch(/\brounded-xl\b/);
  });

  it("LiquidGlassCard preserves children and custom className", () => {
    const { container, getByText } = render(
      <LiquidGlassCard className="custom-x">
        <span>oi</span>
      </LiquidGlassCard>
    );
    expect(getByText("oi")).toBeInTheDocument();
    const root = container.firstChild as HTMLElement;
    expect(root.className).toMatch(/\bcustom-x\b/);
    expect(root.className).toMatch(/\bglass-strong\b/);
  });

  it("Card uses the glass utility (not solid bg-card)", () => {
    const { container } = render(<Card>hello</Card>);
    const root = container.firstChild as HTMLElement;
    expect(root.className).toMatch(/\bglass\b/);
    expect(root.className).not.toMatch(/\bbg-card\b/);
    expect(root.className).not.toMatch(/\bshadow-sm\b/);
  });

  it("LiquidGlassCard structure snapshot", () => {
    const { container } = render(
      <LiquidGlassCard>
        <p>snapshot</p>
      </LiquidGlassCard>
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it("Card structure snapshot", () => {
    const { container } = render(<Card>snap</Card>);
    expect(container.firstChild).toMatchSnapshot();
  });
});
