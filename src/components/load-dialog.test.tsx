import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LoadDialog } from "@/components/load-dialog";
import type { Project } from "@/lib/project";
import { deleteProject, listProjects, saveProject } from "@/lib/storage";

describe("LoadDialog", () => {
  beforeEach(async () => {
    const projects = await listProjects();

    await Promise.all(projects.map((project) => deleteProject(project.id)));
  });

  it("renders an empty state when there are no saved projects", async () => {
    render(<LoadDialog open onLoad={vi.fn()} onOpenChange={vi.fn()} />);

    expect(screen.getByRole("dialog", { name: "Load Project" })).toBeInTheDocument();
    expect(await screen.findByText("No saved projects yet.")).toBeInTheDocument();
  });

  it("loads a selected saved project and can close the dialog", async () => {
    const user = userEvent.setup();
    const onLoad = vi.fn();
    const onOpenChange = vi.fn();
    const project = createProject({ id: "saved-project", title: "Saved Project" });

    await saveProject(project);

    render(<LoadDialog open onLoad={onLoad} onOpenChange={onOpenChange} />);

    expect(await screen.findByText("Saved Project")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Load" }));

    expect(onLoad).toHaveBeenCalledWith(project);

    await user.click(screen.getByRole("button", { name: "Close load dialog" }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

function createProject(overrides: Partial<Project>): Project {
  return {
    id: "project",
    title: "Project",
    html: "<main>Project</main>",
    css: "main { color: teal; }",
    js: "console.log('project');",
    updatedAt: "2024-01-01T00:00:00.000Z",
    ...overrides,
  };
}
