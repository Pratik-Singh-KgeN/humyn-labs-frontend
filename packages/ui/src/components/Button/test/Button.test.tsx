import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import Button from "../index";

describe("Button", () => {
  test("renders children", () => {
    render(<Button>Shared Button</Button>);

    expect(
      screen.getByRole("button", { name: /shared button/i }),
    ).toBeInTheDocument();
  });
});
