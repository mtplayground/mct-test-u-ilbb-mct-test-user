import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Code2, Copy, Eye, FolderOpen, Play, RotateCcw, Save, Share2 } from "lucide-react";
import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";

import { CodeEditor } from "@/components/code-editor";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ErrorBanner } from "@/components/error-banner";
import { LoadDialog } from "@/components/load-dialog";
import { PreviewFrame, type PreviewFrameHandle } from "@/components/preview-frame";
import { Toast, type ToastMessage } from "@/components/toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buildDocument,
  isPreviewErrorMessage,
  type PreviewErrorPayload,
} from "@/lib/document-builder";
import { starterProject, type Project } from "@/lib/project";
import { decodeProjectFromShare, encodeProjectForShare } from "@/lib/share";
import { saveProject } from "@/lib/storage";
import { useDocumentStore } from "@/stores/document-store";

const appTitle = import.meta.env.VITE_APP_TITLE || "MCT Playground";
const routerBasename = getRouterBasename(import.meta.env.VITE_BASE_PATH);
const autoRunStorageKey = "mct-playground-auto-run";
const autoRunDelayMs = 400;

type SaveStatus = {
  tone: "success" | "error";
  message: string;
};

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
  const currentProjectId = useDocumentStore((state) => state.currentProjectId);
  const setCurrentProjectId = useDocumentStore((state) => state.setCurrentProjectId);
  const setDocument = useDocumentStore((state) => state.setDocument);
  const setTitle = useDocumentStore((state) => state.setTitle);
  const setHtml = useDocumentStore((state) => state.setHtml);
  const setCss = useDocumentStore((state) => state.setCss);
  const setJs = useDocumentStore((state) => state.setJs);
  const latestSrcDoc = useMemo(() => buildDocument({ html, css, js }), [html, css, js]);
  const previewRef = useRef<PreviewFrameHandle>(null);
  const [previewSrcDoc, setPreviewSrcDoc] = useState(latestSrcDoc);
  const [previewError, setPreviewError] = useState<PreviewErrorPayload | null>(null);
  const [isAutoRun, setIsAutoRun] = useState(readInitialAutoRun);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus | null>(null);
  const [isLoadOpen, setIsLoadOpen] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const hasStarterChanges =
    title !== starterProject.title ||
    html !== starterProject.html ||
    css !== starterProject.css ||
    js !== starterProject.js;
  const runPreview = useCallback(() => {
    setPreviewError(null);
    setPreviewSrcDoc(latestSrcDoc);
    previewRef.current?.refresh();
  }, [latestSrcDoc]);
  const createCurrentProject = useCallback(
    (id: string, projectTitle = title): Project => ({
      id,
      title: projectTitle,
      html,
      css,
      js,
      updatedAt: new Date().toISOString(),
    }),
    [css, html, js, title],
  );
  const handleSave = useCallback(async () => {
    setIsSaving(true);

    try {
      const savedProject = await saveProject(createCurrentProject(currentProjectId));
      setCurrentProjectId(savedProject.id);
      setSaveStatus({ tone: "success", message: "Saved" });
    } catch (error) {
      setSaveStatus({ tone: "error", message: getErrorMessage(error) });
    } finally {
      setIsSaving(false);
    }
  }, [createCurrentProject, currentProjectId, setCurrentProjectId]);
  const handleSaveAs = useCallback(async () => {
    setIsSaving(true);

    try {
      const forkedTitle = createForkedTitle(title);
      const savedProject = await saveProject(createCurrentProject(createProjectId(), forkedTitle));
      setCurrentProjectId(savedProject.id);
      setTitle(savedProject.title);
      setSaveStatus({ tone: "success", message: "Saved copy" });
    } catch (error) {
      setSaveStatus({ tone: "error", message: getErrorMessage(error) });
    } finally {
      setIsSaving(false);
    }
  }, [createCurrentProject, setCurrentProjectId, setTitle, title]);
  const handleLoadProject = useCallback(
    (project: Project) => {
      setCurrentProjectId(project.id);
      setDocument({
        title: project.title,
        html: project.html,
        css: project.css,
        js: project.js,
      });
      setPreviewError(null);
      setPreviewSrcDoc(buildDocument(project));
      setShareError(null);
      setSaveStatus({ tone: "success", message: "Loaded" });
      setIsLoadOpen(false);
    },
    [setCurrentProjectId, setDocument],
  );
  const handleShare = useCallback(async () => {
    try {
      const encoded = encodeProjectForShare({ title, html, css, js });
      const shareUrl = buildShareUrl(encoded);

      await copyTextToClipboard(shareUrl);
      setToast({ tone: "success", message: "Share link copied" });
    } catch (error) {
      setToast({ tone: "error", message: getErrorMessage(error) });
    }
  }, [css, html, js, title]);
  const resetToStarter = useCallback(() => {
    setCurrentProjectId(starterProject.id);
    setDocument({
      title: starterProject.title,
      html: starterProject.html,
      css: starterProject.css,
      js: starterProject.js,
    });
    setPreviewError(null);
    setPreviewSrcDoc(buildDocument(starterProject));
    setShareError(null);
    setSaveStatus({ tone: "success", message: "Reset to starter" });
    setIsResetConfirmOpen(false);
  }, [setCurrentProjectId, setDocument]);
  const handleReset = useCallback(() => {
    if (hasStarterChanges) {
      setIsResetConfirmOpen(true);
      return;
    }

    resetToStarter();
  }, [hasStarterChanges, resetToStarter]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeoutId = window.setTimeout(() => setToast(null), 2500);

    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  useEffect(() => {
    if (!sharedToken) {
      return;
    }

    let isActive = true;

    queueMicrotask(() => {
      if (!isActive) {
        return;
      }

      try {
        const sharedProject = decodeProjectFromShare(sharedToken);

        setCurrentProjectId(createProjectId());
        setDocument(sharedProject);
        setPreviewError(null);
        setPreviewSrcDoc(buildDocument(sharedProject));
        setShareError(null);
        setSaveStatus({ tone: "success", message: "Loaded shared project" });
      } catch (error) {
        setShareError(getErrorMessage(error));
        setSaveStatus({ tone: "error", message: "Invalid share link" });
      }
    });

    return () => {
      isActive = false;
    };
  }, [setCurrentProjectId, setDocument, sharedToken]);

  useEffect(() => {
    window.localStorage.setItem(autoRunStorageKey, String(isAutoRun));
  }, [isAutoRun]);

  useEffect(() => {
    if (!isAutoRun) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setPreviewError(null);
      setPreviewSrcDoc(latestSrcDoc);
    }, autoRunDelayMs);

    return () => window.clearTimeout(timeoutId);
  }, [isAutoRun, latestSrcDoc]);

  useEffect(() => {
    const handlePreviewMessage = (event: MessageEvent<unknown>) => {
      if (isPreviewErrorMessage(event.data)) {
        setPreviewError(event.data.error);
      }
    };

    window.addEventListener("message", handlePreviewMessage);

    return () => window.removeEventListener("message", handlePreviewMessage);
  }, []);

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
            <label className="flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm text-muted-foreground">
              <input
                type="checkbox"
                className="h-4 w-4 accent-primary"
                checked={isAutoRun}
                onChange={(event) => setIsAutoRun(event.currentTarget.checked)}
              />
              Auto Run
            </label>
            <Button type="button" size="sm" onClick={runPreview}>
              <Play className="h-4 w-4" aria-hidden="true" />
              Run
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setIsLoadOpen(true)}>
              <FolderOpen className="h-4 w-4" aria-hidden="true" />
              Load
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              Save
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSaveAs}
              disabled={isSaving}
            >
              <Copy className="h-4 w-4" aria-hidden="true" />
              Save As
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4" aria-hidden="true" />
              Share
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={handleReset}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </Button>
            {saveStatus ? (
              <span
                className={
                  saveStatus.tone === "error"
                    ? "text-sm text-destructive"
                    : "text-sm text-muted-foreground"
                }
              >
                {saveStatus.message}
              </span>
            ) : null}
          </nav>
        </div>
      </header>

      {toast ? <Toast toast={toast} onDismiss={() => setToast(null)} /> : null}

      <LoadDialog open={isLoadOpen} onOpenChange={setIsLoadOpen} onLoad={handleLoadProject} />
      <ConfirmDialog
        open={isResetConfirmOpen}
        title="Reset to starter?"
        description="This will discard any unsaved changes in the editor and restore the starter project."
        confirmLabel="Reset"
        onConfirm={resetToStarter}
        onCancel={() => setIsResetConfirmOpen(false)}
      />

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
              {sharedToken ? (shareError ? "Decode failed" : "Shared project") : "Placeholder"}
            </span>
          </div>

          {sharedToken ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Shared project route</CardTitle>
                <CardDescription>
                  {shareError
                    ? "The shared link could not be decoded."
                    : "Decoded shared project loaded into the editors."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {shareError ? (
                  <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                    {shareError}
                  </div>
                ) : (
                  <code className="block overflow-hidden text-ellipsis whitespace-nowrap rounded-md border border-border bg-muted px-3 py-2 font-mono text-xs text-muted-foreground">
                    {sharedToken}
                  </code>
                )}
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

          {previewError ? (
            <ErrorBanner error={previewError} onDismiss={() => setPreviewError(null)} />
          ) : null}

          <Card className="min-h-[32rem] overflow-hidden">
            <CardHeader className="border-b border-border">
              <CardTitle>{title}</CardTitle>
              <CardDescription>Sandboxed iframe preview</CardDescription>
            </CardHeader>
            <CardContent className="h-[26rem] bg-muted/40 p-0">
              <PreviewFrame ref={previewRef} srcDoc={previewSrcDoc} title={`${title} preview`} />
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

function readInitialAutoRun() {
  if (typeof window === "undefined") {
    return true;
  }

  const storedValue = window.localStorage.getItem(autoRunStorageKey);

  if (storedValue === null) {
    return true;
  }

  return storedValue === "true";
}

function createProjectId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `project-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function createForkedTitle(title: string) {
  const trimmedTitle = title.trim();

  return trimmedTitle ? `${trimmedTitle} Copy` : "Untitled Project Copy";
}

function buildShareUrl(encoded: string) {
  const basePath = getRouterBasename(import.meta.env.VITE_BASE_PATH) ?? "";
  const sharePath = `${basePath}/p/${encoded}`.replace(/\/{2,}/g, "/");

  return new URL(sharePath, window.location.origin).toString();
}

async function copyTextToClipboard(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textArea = document.createElement("textarea");
  textArea.value = value;
  textArea.style.position = "fixed";
  textArea.style.left = "-9999px";

  document.body.append(textArea);
  textArea.focus();
  textArea.select();

  try {
    document.execCommand("copy");
  } finally {
    textArea.remove();
  }
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Unable to save project";
}
