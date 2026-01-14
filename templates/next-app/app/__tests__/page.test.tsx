import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";

import Page from "../page";

describe("Next page", () => {
  test("renders page and shared button", () => {
    render(<Page />);

    expect(screen.getByText(/__APP_NAME__/i)).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /shared button/i }),
    ).toBeInTheDocument();
  });
});
