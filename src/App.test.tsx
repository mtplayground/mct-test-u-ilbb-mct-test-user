import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { App } from "@/App";
import { starterProject } from "@/lib/project";
import { useDocumentStore } from "@/stores/document-store";

vi.mock("@monaco-editor/react", () => ({
  default: ({
    language,
    value,
    onChange,
  }: {
    language: string;
    value: string;
    onChange: (value: string) => void;
  }) => (
    <textarea
      aria-label={`${language} editor`}
      value={value}
      onChange={(event) => onChange(event.currentTarget.value)}
    />
  ),
}));

describe("App toolbar", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.className = "";
    useDocumentStore.setState({
      currentProjectId: starterProject.id,
      title: starterProject.title,
      html: starterProject.html,
      css: starterProject.css,
      js: starterProject.js,
    });
  });

  it("renders the primary toolbar actions", () => {
    render(<App />);

    const toolbar = screen.getByRole("navigation", { name: "Playground actions" });

    expect(within(toolbar).getByRole("button", { name: "Light" })).toBeInTheDocument();
    expect(within(toolbar).getByRole("checkbox", { name: "Auto Run" })).toBeChecked();
    expect(within(toolbar).getByRole("button", { name: "Run" })).toBeInTheDocument();
    expect(within(toolbar).getByRole("button", { name: "Load" })).toBeInTheDocument();
    expect(within(toolbar).getByRole("button", { name: "Save" })).toBeInTheDocument();
    expect(within(toolbar).getByRole("button", { name: "Save As" })).toBeInTheDocument();
    expect(within(toolbar).getByRole("button", { name: "Share" })).toBeInTheDocument();
    expect(within(toolbar).getByRole("button", { name: "Reset" })).toBeInTheDocument();
  });

  it("toggles and persists the toolbar theme control", async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByRole("button", { name: "Light" }));

    expect(screen.getByRole("button", { name: "Dark" })).toBeInTheDocument();
    expect(document.documentElement).toHaveClass("dark");
    expect(window.localStorage.getItem("mct-playground-theme")).toBe("dark");
  });
});
