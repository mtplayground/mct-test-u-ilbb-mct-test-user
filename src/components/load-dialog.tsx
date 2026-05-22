import { useEffect, useState } from "react";
import { Check, Pencil, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Project } from "@/lib/project";
import { deleteProject, listProjects, renameProject } from "@/lib/storage";

type LoadDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoad: (project: Project) => void;
};

export function LoadDialog({ open, onOpenChange, onLoad }: LoadDialogProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    let isActive = true;

    queueMicrotask(() => {
      if (!isActive) {
        return;
      }

      setIsLoading(true);
      setError(null);

      listProjects()
        .then((savedProjects) => {
          if (isActive) {
            setProjects(savedProjects);
          }
        })
        .catch((loadError: unknown) => {
          if (isActive) {
            setError(getErrorMessage(loadError));
          }
        })
        .finally(() => {
          if (isActive) {
            setIsLoading(false);
          }
        });
    });

    return () => {
      isActive = false;
    };
  }, [open]);

  if (!open) {
    return null;
  }

  const startRename = (project: Project) => {
    setRenamingId(project.id);
    setDraftTitle(project.title);
  };

  const cancelRename = () => {
    setRenamingId(null);
    setDraftTitle("");
  };

  const submitRename = async () => {
    if (!renamingId) {
      return;
    }

    const nextTitle = draftTitle.trim();

    if (!nextTitle) {
      setError("Project title cannot be empty");
      return;
    }

    try {
      const renamedProject = await renameProject(renamingId, nextTitle);

      if (renamedProject) {
        setProjects((currentProjects) =>
          sortProjectsByUpdatedAt(
            currentProjects.map((project) =>
              project.id === renamedProject.id ? renamedProject : project,
            ),
          ),
        );
      }

      cancelRename();
      setError(null);
    } catch (renameError) {
      setError(getErrorMessage(renameError));
    }
  };

  const removeProject = async (id: string) => {
    try {
      await deleteProject(id);
      setProjects((currentProjects) => currentProjects.filter((project) => project.id !== id));
      setError(null);
    } catch (deleteError) {
      setError(getErrorMessage(deleteError));
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="load-dialog-title"
        className="max-h-[min(42rem,90vh)] w-full max-w-2xl overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-lg"
      >
        <header className="flex items-start justify-between gap-4 border-b border-border p-4">
          <div>
            <h2 id="load-dialog-title" className="text-lg font-semibold tracking-normal">
              Load Project
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">Saved projects from this browser</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            aria-label="Close load dialog"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </header>

        <div className="max-h-[32rem] overflow-y-auto p-4">
          {error ? (
            <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          {isLoading ? <p className="text-sm text-muted-foreground">Loading projects...</p> : null}

          {!isLoading && projects.length === 0 ? (
            <p className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              No saved projects yet.
            </p>
          ) : null}

          <div className="grid gap-3">
            {projects.map((project) => {
              const isRenaming = renamingId === project.id;

              return (
                <article
                  key={project.id}
                  className="grid gap-3 rounded-md border border-border bg-background p-3 sm:grid-cols-[minmax(0,1fr)_auto]"
                >
                  <div className="min-w-0">
                    {isRenaming ? (
                      <input
                        value={draftTitle}
                        onChange={(event) => setDraftTitle(event.currentTarget.value)}
                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label="Project title"
                      />
                    ) : (
                      <>
                        <h3 className="truncate text-sm font-medium">{project.title}</h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatRelativeDate(project.updatedAt)}
                        </p>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isRenaming ? (
                      <>
                        <Button type="button" size="sm" onClick={submitRename}>
                          <Check className="h-4 w-4" aria-hidden="true" />
                          Save
                        </Button>
                        <Button type="button" variant="ghost" size="sm" onClick={cancelRename}>
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button type="button" size="sm" onClick={() => onLoad(project)}>
                          Load
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => startRename(project)}
                          aria-label={`Rename ${project.title}`}
                        >
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => removeProject(project.id)}
                          aria-label={`Delete ${project.title}`}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

function sortProjectsByUpdatedAt(projects: Project[]) {
  return [...projects].sort(
    (first, second) => Date.parse(second.updatedAt) - Date.parse(first.updatedAt),
  );
}

function formatRelativeDate(value: string) {
  const timestamp = Date.parse(value);

  if (Number.isNaN(timestamp)) {
    return "Unknown date";
  }

  const differenceMs = Date.now() - timestamp;
  const suffix = differenceMs < 0 ? "from now" : "ago";
  const absoluteMs = Math.abs(differenceMs);

  if (absoluteMs < 60_000) {
    return "just now";
  }

  const units = [
    { label: "day", duration: 86_400_000 },
    { label: "hour", duration: 3_600_000 },
    { label: "minute", duration: 60_000 },
  ];

  const unit = units.find(({ duration }) => absoluteMs >= duration) ?? units[units.length - 1];
  const amount = Math.floor(absoluteMs / unit.duration);

  return `${amount} ${unit.label}${amount === 1 ? "" : "s"} ${suffix}`;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Unable to update saved projects";
}
