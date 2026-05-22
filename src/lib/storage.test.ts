import { beforeEach, describe, expect, it } from "vitest";

import type { Project } from "@/lib/project";
import { deleteProject, getProject, listProjects, renameProject, saveProject } from "@/lib/storage";

describe("project storage", () => {
  beforeEach(async () => {
    const projects = await listProjects();

    await Promise.all(projects.map((project) => deleteProject(project.id)));
  });

  it("saves, reads, lists, and deletes projects", async () => {
    const olderProject = createProject({
      id: "older",
      title: "Older project",
      updatedAt: "2024-01-01T00:00:00.000Z",
    });
    const newerProject = createProject({
      id: "newer",
      title: "Newer project",
      updatedAt: "2024-02-01T00:00:00.000Z",
    });

    await saveProject(olderProject);
    await saveProject(newerProject);

    await expect(getProject("older")).resolves.toEqual(olderProject);
    await expect(listProjects()).resolves.toEqual([newerProject, olderProject]);

    await deleteProject("newer");

    await expect(getProject("newer")).resolves.toBeUndefined();
    await expect(listProjects()).resolves.toEqual([olderProject]);
  });

  it("renames existing projects and refreshes their update timestamp", async () => {
    const project = createProject({
      id: "rename-me",
      title: "Original title",
      updatedAt: "2024-01-01T00:00:00.000Z",
    });

    await saveProject(project);

    const renamedProject = await renameProject(project.id, "Renamed project");

    expect(renamedProject).toEqual({
      ...project,
      title: "Renamed project",
      updatedAt: expect.any(String),
    });
    expect(renamedProject?.updatedAt).not.toBe(project.updatedAt);
    await expect(getProject(project.id)).resolves.toEqual(renamedProject);
  });

  it("returns undefined when renaming a missing project", async () => {
    await expect(renameProject("missing", "No project")).resolves.toBeUndefined();
  });
});

function createProject(overrides: Partial<Project>): Project {
  return {
    id: "project",
    title: "Project",
    html: "<main>Project</main>",
    css: "main { display: block; }",
    js: "console.log('project');",
    updatedAt: "2024-01-01T00:00:00.000Z",
    ...overrides,
  };
}
