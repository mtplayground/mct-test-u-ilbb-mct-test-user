import { describe, expect, it } from "vitest";

import {
  decodeProjectFromShare,
  encodeProjectForShare,
  type SharedProjectPayload,
} from "@/lib/share";

describe("share payload encoding", () => {
  it("round-trips project data through a URL-safe token", () => {
    const project: SharedProjectPayload = {
      title: "Counter",
      html: '<button id="count">0</button>',
      css: "#count { font-size: 2rem; }",
      js: "document.querySelector('#count')?.addEventListener('click', () => {})",
    };

    const encoded = encodeProjectForShare(project);

    expect(encoded).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(decodeProjectFromShare(encoded)).toEqual(project);
  });

  it("throws for invalid shared payloads", () => {
    expect(() => decodeProjectFromShare("not-a-valid-share")).toThrow();
  });
});
