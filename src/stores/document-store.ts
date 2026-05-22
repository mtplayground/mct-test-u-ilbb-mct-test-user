import { create } from "zustand";

import { starterProject, type Project } from "@/lib/project";

export type CurrentDocument = Pick<Project, "title" | "html" | "css" | "js">;

type DocumentStore = CurrentDocument & {
  currentProjectId: string;
  setCurrentProjectId: (id: string) => void;
  setTitle: (title: string) => void;
  setHtml: (html: string) => void;
  setCss: (css: string) => void;
  setJs: (js: string) => void;
  setDocument: (document: CurrentDocument) => void;
};

const starterDocument: CurrentDocument = {
  title: starterProject.title,
  html: starterProject.html,
  css: starterProject.css,
  js: starterProject.js,
};

export const useDocumentStore = create<DocumentStore>((set) => ({
  ...starterDocument,
  currentProjectId: starterProject.id,
  setCurrentProjectId: (id) => set({ currentProjectId: id }),
  setTitle: (title) => set({ title }),
  setHtml: (html) => set({ html }),
  setCss: (css) => set({ css }),
  setJs: (js) => set({ js }),
  setDocument: (document) => set(document),
}));
