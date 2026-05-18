import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Search } from "lucide-react";
import { Icon, iconSizeClass } from "../icon";

describe("Icon", () => {
  it("aplica tamanho 'sm' como padrão (w-4 h-4)", () => {
    const { container } = render(<Icon icon={Search} />);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("class")).toContain("w-4");
    expect(svg.getAttribute("class")).toContain("h-4");
    expect(svg.getAttribute("class")).toContain("shrink-0");
  });

  it("respeita cada tamanho padronizado", () => {
    (Object.keys(iconSizeClass) as Array<keyof typeof iconSizeClass>).forEach((size) => {
      const { container } = render(<Icon icon={Search} size={size} />);
      const svg = container.querySelector("svg")!;
      iconSizeClass[size].split(" ").forEach((cls) => {
        expect(svg.getAttribute("class")).toContain(cls);
      });
    });
  });

  it("mescla className customizada sem perder o tamanho", () => {
    const { container } = render(
      <Icon icon={Search} size="lg" className="text-primary" />,
    );
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("class")).toContain("w-5");
    expect(svg.getAttribute("class")).toContain("h-5");
    expect(svg.getAttribute("class")).toContain("text-primary");
  });
});
