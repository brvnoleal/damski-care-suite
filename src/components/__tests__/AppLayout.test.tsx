import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AppLayout from "@/components/AppLayout";

/**
 * Guards the Liquid Glass chrome of AppLayout:
 *  - sidebar uses .glass-sidebar (not solid bg-sidebar)
 *  - header uses .glass-header (not solid bg-card)
 *  - main content is transparent (no bg-background) so body gradient shows
 */
describe("AppLayout — Liquid Glass chrome", () => {
  const renderLayout = () =>
    render(
      <MemoryRouter>
        <AppLayout>
          <div data-testid="content">child</div>
        </AppLayout>
      </MemoryRouter>
    );

  it("renders children", () => {
    const { getByTestId } = renderLayout();
    expect(getByTestId("content")).toBeInTheDocument();
  });

  it("sidebar uses glass-sidebar utility", () => {
    const { container } = renderLayout();
    const aside = container.querySelector("aside");
    expect(aside).not.toBeNull();
    expect(aside!.className).toMatch(/\bglass-sidebar\b/);
    expect(aside!.className).not.toMatch(/\bbg-sidebar\b/);
  });

  it("header uses glass-header utility", () => {
    const { container } = renderLayout();
    const header = container.querySelector("header");
    expect(header).not.toBeNull();
    expect(header!.className).toMatch(/\bglass-header\b/);
    expect(header!.className).not.toMatch(/\bbg-card\b/);
  });

  it("main is transparent (no bg-background) so gradient shows through", () => {
    const { container } = renderLayout();
    const main = container.querySelector("main");
    expect(main).not.toBeNull();
    expect(main!.className).not.toMatch(/\bbg-background\b/);
  });
});
