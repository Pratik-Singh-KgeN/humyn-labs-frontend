import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";

import App from "../App";

describe("Vite App", () => {
  test("renders app name and shared button", () => {
    render(<App />);

    expect(screen.getByText(/__APP_NAME__/i)).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /shared button/i }),
    ).toBeInTheDocument();
  });
});
