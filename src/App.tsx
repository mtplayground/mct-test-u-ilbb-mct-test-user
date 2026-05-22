import { Code2, Eye, Play, Save, Share2 } from "lucide-react";
import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";

import { CodeEditor } from "@/components/code-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDocumentStore } from "@/stores/document-store";

const appTitle = import.meta.env.VITE_APP_TITLE || "MCT Playground";
const routerBasename = getRouterBasename(import.meta.env.VITE_BASE_PATH);

export function App() {
  return (
    <BrowserRouter basename={routerBasename}>
      <Routes>
        <Route path="/" element={<PlaygroundPage />} />
        <Route path="/p/:encoded" element={<SharedPlaygroundRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function SharedPlaygroundRoute() {
  const { encoded } = useParams<{ encoded: string }>();

  return <PlaygroundPage sharedToken={encoded} />;
}

function PlaygroundPage({ sharedToken }: { sharedToken?: string }) {
  const routeLabel = sharedToken ? "Shared link route" : "Static playground shell";
  const title = useDocumentStore((state) => state.title);
  const html = useDocumentStore((state) => state.html);
  const css = useDocumentStore((state) => state.css);
  const js = useDocumentStore((state) => state.js);
  const setHtml = useDocumentStore((state) => state.setHtml);
  const setCss = useDocumentStore((state) => state.setCss);
  const setJs = useDocumentStore((state) => state.setJs);
  const editorPanels = [
    {
      title: "HTML",
      language: "html",
      value: html,
      onChange: setHtml,
    },
    {
      title: "CSS",
      language: "css",
      value: css,
      onChange: setCss,
    },
    {
      title: "JavaScript",
      language: "javascript",
      value: js,
      onChange: setJs,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Code2 className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h1 id="app-title" className="truncate text-lg font-semibold tracking-normal">
                {appTitle}
              </h1>
              <p className="text-sm text-muted-foreground">{routeLabel}</p>
            </div>
          </div>

          <nav className="flex items-center gap-2" aria-label="Playground actions">
            <Button type="button" size="sm">
              <Play className="h-4 w-4" aria-hidden="true" />
              Run
            </Button>
            <Button type="button" variant="outline" size="sm">
              <Save className="h-4 w-4" aria-hidden="true" />
              Save
            </Button>
            <Button type="button" variant="secondary" size="sm">
              <Share2 className="h-4 w-4" aria-hidden="true" />
              Share
            </Button>
          </nav>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.8fr)]">
        <section className="grid gap-4" aria-labelledby="editors-heading">
          <div className="flex items-center justify-between">
            <h2
              id="editors-heading"
              className="text-sm font-semibold uppercase text-muted-foreground"
            >
              Editors
            </h2>
            <span className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground">
              {sharedToken ? "Decode pending" : "Placeholder"}
            </span>
          </div>

          {sharedToken ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Shared project route</CardTitle>
                <CardDescription>
                  Decode and store hydration will be implemented with the sharing utilities.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <code className="block overflow-hidden text-ellipsis whitespace-nowrap rounded-md border border-border bg-muted px-3 py-2 font-mono text-xs text-muted-foreground">
                  {sharedToken}
                </code>
              </CardContent>
            </Card>
          ) : null}

          <div className="grid gap-4 lg:grid-rows-3">
            {editorPanels.map((panel) => (
              <CodeEditor
                key={panel.title}
                label={panel.title}
                language={panel.language}
                theme="vs"
                value={panel.value}
                onChange={panel.onChange}
                height="18rem"
              />
            ))}
          </div>
        </section>

        <section className="grid gap-4" aria-labelledby="preview-heading">
          <div className="flex items-center justify-between">
            <h2
              id="preview-heading"
              className="text-sm font-semibold uppercase text-muted-foreground"
            >
              Preview
            </h2>
            <Eye className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </div>

          <Card className="min-h-[32rem] overflow-hidden">
            <CardHeader className="border-b border-border">
              <CardTitle>{title}</CardTitle>
              <CardDescription>Preview iframe placeholder</CardDescription>
            </CardHeader>
            <CardContent className="grid min-h-[26rem] place-items-center bg-muted/40 p-4">
              <div className="w-full max-w-sm rounded-lg border border-dashed border-border bg-background p-6 text-center">
                <p className="text-sm font-medium">Preview surface</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Editor execution and iframe rendering will be connected in later issues.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}

function getRouterBasename(basePath: string) {
  if (!basePath || basePath === "/") {
    return undefined;
  }

  return `/${basePath.replace(/^\/|\/$/g, "")}`;
}
