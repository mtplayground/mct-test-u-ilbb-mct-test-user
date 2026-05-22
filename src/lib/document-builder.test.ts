import { describe, expect, it } from "vitest";

import {
  buildDocument,
  isPreviewErrorMessage,
  PREVIEW_ERROR_MESSAGE_TYPE,
  PREVIEW_MESSAGE_SOURCE,
} from "@/lib/document-builder";

describe("buildDocument", () => {
  it("renders the supplied HTML, CSS, and JavaScript into a full document", () => {
    const document = buildDocument({
      html: '<main id="app">Hello</main>',
      css: "body { color: rebeccapurple; }",
      js: 'document.body.dataset.ready = "true";',
    });

    expect(document).toContain("<!doctype html>");
    expect(document).toContain('<main id="app">Hello</main>');
    expect(document).toContain("body { color: rebeccapurple; }");
    expect(document).toContain('document.body.dataset.ready = "true";');
    expect(document).toContain(PREVIEW_MESSAGE_SOURCE);
    expect(document).toContain(PREVIEW_ERROR_MESSAGE_TYPE);
  });

  it("escapes closing style and script tags in user content", () => {
    const document = buildDocument({
      html: "",
      css: "body::before { content: '</style>'; }",
      js: "console.log('</script>');",
    });

    expect(document).toContain("<\\/style>");
    expect(document).toContain("<\\/script>");
    expect(document).not.toContain("content: '</style>'");
    expect(document).not.toContain("console.log('</script>');");
  });
});

describe("isPreviewErrorMessage", () => {
  it("accepts well-formed preview error messages", () => {
    expect(
      isPreviewErrorMessage({
        source: PREVIEW_MESSAGE_SOURCE,
        type: PREVIEW_ERROR_MESSAGE_TYPE,
        error: {
          message: "Boom",
          filename: "preview.js",
          lineno: 10,
          colno: 2,
        },
      }),
    ).toBe(true);
  });

  it("rejects unrelated messages", () => {
    expect(
      isPreviewErrorMessage({
        source: PREVIEW_MESSAGE_SOURCE,
        type: PREVIEW_ERROR_MESSAGE_TYPE,
        error: { filename: "preview.js" },
      }),
    ).toBe(false);
  });
});
