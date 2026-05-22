import { expect, test, type Page } from "@playwright/test";

const htmlSource = `<main>
  <h1>Flow saved</h1>
  <p id="message">Before run</p>
</main>`;
const changedHtmlSource = `<main>
  <h1>Changed after save</h1>
  <p id="message">Unsaved change</p>
</main>`;
const cssSource = `body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  font-family: system-ui, sans-serif;
}`;
const jsSource = `const message = document.querySelector("#message");
if (message) {
  message.textContent = "Preview updated";
}`;

test("core playground flow", async ({ context, page }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");

  await replaceEditor(page, "html", htmlSource);
  await replaceEditor(page, "css", cssSource);
  await replaceEditor(page, "javascript", jsSource);
  await page.getByRole("button", { name: "Run" }).click();

  await expect(preview(page).locator("h1")).toHaveText("Flow saved");
  await expect(preview(page).locator("#message")).toHaveText("Preview updated");

  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByText("Saved", { exact: true })).toBeVisible();

  await replaceEditor(page, "html", changedHtmlSource);
  await page.getByRole("button", { name: "Run" }).click();
  await expect(preview(page).locator("h1")).toHaveText("Changed after save");

  await page.getByRole("button", { name: "Load" }).click();
  const loadDialog = page.getByRole("dialog", { name: "Load Project" });
  await expect(loadDialog.getByText("Starter Project")).toBeVisible();
  await loadDialog.getByRole("button", { name: "Load", exact: true }).click();

  await expect(preview(page).locator("h1")).toHaveText("Flow saved");
  await expect(preview(page).locator("#message")).toHaveText("Preview updated");

  await page.getByRole("button", { name: "Share" }).click();
  await expect(page.getByText("Share link copied")).toBeVisible();

  const shareUrl = await page.evaluate(() => navigator.clipboard.readText());

  expect(shareUrl).toContain("/p/");

  await page.goto(shareUrl);
  await expect(preview(page).locator("h1")).toHaveText("Flow saved");
  await expect(preview(page).locator("#message")).toHaveText("Preview updated");

  await page.getByRole("button", { name: "Light" }).click();
  await expect(page.getByRole("button", { name: "Dark" })).toBeVisible();
  await expect(page.locator("html")).toHaveClass(/dark/);

  await page.getByRole("button", { name: "Fullscreen" }).click();
  await expect(page.getByRole("button", { name: "Exit Preview" })).toBeVisible();
  await expect(page.getByTestId("preview-frame")).toHaveClass(/h-screen/);

  await page.getByRole("button", { name: "Exit Preview" }).click();
  await expect(page.getByRole("button", { name: "Fullscreen" })).toBeVisible();
});

async function replaceEditor(page: Page, language: string, value: string) {
  const editor = page.getByTestId(`editor-${language}`).locator(".monaco-editor").first();

  await expect(editor).toBeVisible({ timeout: 20_000 });
  await editor.click();
  await page.keyboard.press("Control+A");
  await page.keyboard.press("Backspace");
  await page.keyboard.insertText(value);
}

function preview(page: Page) {
  return page.frameLocator('[data-testid="preview-frame"]');
}
