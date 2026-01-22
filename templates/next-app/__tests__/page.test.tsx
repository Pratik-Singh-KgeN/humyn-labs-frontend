import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";

import Page from "../app/page";

describe("Next page", () => {
  test("renders page", () => {
    render(<Page />);

    expect(screen.getByText(/__APP_NAME__/i)).toBeInTheDocument();
  });
});
