import { createStore, del, get, keys, set } from "idb-keyval";

import type { Project } from "@/lib/project";

const projectsStore = createStore("mct-playground", "projects");

export async function saveProject(project: Project) {
  await set(project.id, project, projectsStore);

  return project;
}

export async function listProjects() {
  const projectKeys = await keys(projectsStore);
  const projects = await Promise.all(
    projectKeys.map(async (projectKey) => {
      if (typeof projectKey !== "string") {
        return undefined;
      }

      return getProject(projectKey);
    }),
  );

  return projects
    .filter((project): project is Project => Boolean(project))
    .sort((first, second) => Date.parse(second.updatedAt) - Date.parse(first.updatedAt));
}

export async function getProject(id: string) {
  const project = await get<Project>(id, projectsStore);

  return project ?? undefined;
}

export async function deleteProject(id: string) {
  await del(id, projectsStore);
}

export async function renameProject(id: string, title: string) {
  const project = await getProject(id);

  if (!project) {
    return undefined;
  }

  const renamedProject: Project = {
    ...project,
    title,
    updatedAt: new Date().toISOString(),
  };

  await saveProject(renamedProject);

  return renamedProject;
}
