import { beforeEach, describe, expect, it } from "vitest";

import { starterProject } from "@/lib/project";
import { useDocumentStore } from "@/stores/document-store";

describe("useDocumentStore", () => {
  beforeEach(() => {
    useDocumentStore.setState({
      currentProjectId: starterProject.id,
      title: starterProject.title,
      html: starterProject.html,
      css: starterProject.css,
      js: starterProject.js,
    });
  });

  it("starts with the starter project document", () => {
    const state = useDocumentStore.getState();

    expect(state.currentProjectId).toBe(starterProject.id);
    expect(state.title).toBe(starterProject.title);
    expect(state.html).toBe(starterProject.html);
    expect(state.css).toBe(starterProject.css);
    expect(state.js).toBe(starterProject.js);
  });

  it("updates individual document fields", () => {
    const store = useDocumentStore.getState();

    store.setCurrentProjectId("project-1");
    store.setTitle("Updated");
    store.setHtml("<main>Updated</main>");
    store.setCss("main { color: red; }");
    store.setJs("console.log('updated');");

    expect(useDocumentStore.getState()).toMatchObject({
      currentProjectId: "project-1",
      title: "Updated",
      html: "<main>Updated</main>",
      css: "main { color: red; }",
      js: "console.log('updated');",
    });
  });

  it("replaces the editable document without changing the current project id", () => {
    useDocumentStore.getState().setCurrentProjectId("existing-project");

    useDocumentStore.getState().setDocument({
      title: "Loaded",
      html: "<section>Loaded</section>",
      css: "section { display: grid; }",
      js: "console.log('loaded');",
    });

    expect(useDocumentStore.getState()).toMatchObject({
      currentProjectId: "existing-project",
      title: "Loaded",
      html: "<section>Loaded</section>",
      css: "section { display: grid; }",
      js: "console.log('loaded');",
    });
  });
});
