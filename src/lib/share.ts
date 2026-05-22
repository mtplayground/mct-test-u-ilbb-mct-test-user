import { compressToUint8Array, decompressFromUint8Array } from "lz-string";

import type { Project } from "@/lib/project";

export type SharedProjectPayload = Pick<Project, "title" | "html" | "css" | "js">;

export function encodeProjectForShare(project: SharedProjectPayload) {
  const compressed = compressToUint8Array(JSON.stringify(project));

  return bytesToBase64Url(compressed);
}

export function decodeProjectFromShare(encoded: string) {
  const decompressed = decompressFromUint8Array(base64UrlToBytes(encoded));

  if (!decompressed) {
    throw new Error("Shared project could not be decoded");
  }

  const parsedPayload: unknown = JSON.parse(decompressed);

  if (!isSharedProjectPayload(parsedPayload)) {
    throw new Error("Shared project payload is invalid");
  }

  return parsedPayload;
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(encoded: string) {
  const normalizedBase64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
  const paddedBase64 = normalizedBase64.padEnd(
    normalizedBase64.length + ((4 - (normalizedBase64.length % 4)) % 4),
    "=",
  );
  const binary = atob(paddedBase64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function isSharedProjectPayload(value: unknown): value is SharedProjectPayload {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.title === "string" &&
    typeof value.html === "string" &&
    typeof value.css === "string" &&
    typeof value.js === "string"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
