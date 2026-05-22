import Editor from "@monaco-editor/react";

import { cn } from "@/lib/utils";

export type CodeEditorProps = {
  label: string;
  language: string;
  theme: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  height?: string;
};

export function CodeEditor({
  label,
  language,
  theme,
  value,
  onChange,
  className,
  height = "16rem",
}: CodeEditorProps) {
  return (
    <section className={cn("overflow-hidden rounded-lg border border-border bg-card", className)}>
      <header className="flex min-h-11 items-center justify-between border-b border-border bg-muted/40 px-3">
        <h3 className="text-sm font-medium text-card-foreground">{label}</h3>
        <span className="rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground">
          {language}
        </span>
      </header>
      <div className="min-h-64">
        <Editor
          height={height}
          language={language}
          theme={theme}
          value={value}
          onChange={(nextValue) => onChange(nextValue ?? "")}
          options={{
            automaticLayout: true,
            fontSize: 14,
            minimap: { enabled: false },
            padding: { top: 16, bottom: 16 },
            scrollBeyondLastLine: false,
            tabSize: 2,
            wordWrap: "on",
          }}
        />
      </div>
    </section>
  );
}
