import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ErrorBanner } from "@/components/error-banner";

describe("ErrorBanner", () => {
  it("renders preview error details and dismisses", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();

    render(
      <ErrorBanner
        error={{
          message: "Unexpected token",
          filename: "preview.js",
          lineno: 12,
          colno: 4,
        }}
        onDismiss={onDismiss}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Preview error");
    expect(screen.getByText("Unexpected token")).toBeInTheDocument();
    expect(screen.getByText("preview.js:12:4")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Dismiss preview error" }));

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
