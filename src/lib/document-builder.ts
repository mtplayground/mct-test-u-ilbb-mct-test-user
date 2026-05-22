import type { Project } from "@/lib/project";

export type BuildDocumentInput = Pick<Project, "html" | "css" | "js">;

export const PREVIEW_MESSAGE_SOURCE = "mct-playground-preview";
export const PREVIEW_ERROR_MESSAGE_TYPE = "preview-error";

const errorReportingBootstrap = `
(() => {
  const source = ${JSON.stringify(PREVIEW_MESSAGE_SOURCE)};
  const type = ${JSON.stringify(PREVIEW_ERROR_MESSAGE_TYPE)};

  const serialize = (value) => {
    if (value instanceof Error) {
      return value.stack || value.message;
    }

    if (typeof value === "string") {
      return value;
    }

    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  };

  const postError = (error) => {
    window.parent?.postMessage({ source, type, error }, "*");
  };

  window.addEventListener("error", (event) => {
    postError({
      message: event.message || "Runtime error",
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    postError({
      message: serialize(event.reason) || "Unhandled promise rejection",
    });
  });

  const originalConsoleError = console.error.bind(console);

  console.error = (...args) => {
    originalConsoleError(...args);
    postError({
      message: args.map(serialize).join(" "),
    });
  };
})();
`;

export function buildDocument({ html, css, js }: BuildDocumentInput) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
${escapeStyleContent(css)}
    </style>
  </head>
  <body>
${html}
    <script>
${escapeScriptContent(errorReportingBootstrap)}
    </script>
    <script type="module">
${escapeScriptContent(js)}
    </script>
  </body>
</html>`;
}

function escapeScriptContent(value: string) {
  return value.replace(/<\/script/gi, "<\\/script");
}

function escapeStyleContent(value: string) {
  return value.replace(/<\/style/gi, "<\\/style");
}
