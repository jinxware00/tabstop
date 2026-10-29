import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { languages, snippets } from "../../assets/catalog.js";

async function startSnippet(page, title, language) {
  await page.goto("/#library");
  if (language)
    await page
      .getByLabel("Library language", { exact: true })
      .selectOption(language);
  await page
    .getByRole("searchbox", { name: "Search snippets", exact: true })
    .fill(title);
  await page.getByRole("button", { name: title, exact: true }).click();
  await expect(page.getByRole("dialog", { name: title })).toBeVisible();
  await page.getByRole("button", { name: /Practise this snippet/ }).click();
  await expect(
    page.getByRole("textbox", { name: "Typing area", exact: true }),
  ).toBeFocused();
  return snippets.find(
    (item) => item.title === title && (!language || item.language === language),
  );
}

test("practice loads locally with readable code and responsive layout", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await expect(
    page.getByRole("heading", { name: "Find your rhythm." }),
  ).toBeVisible();
  await expect(page.locator("#CatalogCount")).toHaveText(
    "28 languages · 418 snippets",
  );
  await expect(page.locator("#SnippetTitle")).not.toHaveText(
    "Getting your practice ready",
  );
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  expect(errors).toEqual([]);
});

test("every language can be selected and topics match difficulty", async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.goto("/");
  const names = languages.map((language) => language.name);
  for (const language of names) {
    await page.locator("#LanguageButton").click();
    await page
      .getByRole("searchbox", { name: "Search languages" })
      .fill(language);
    await page
      .getByRole("button", {
        name: new RegExp(
          `^${language.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} \\d+ snippets$`,
        ),
      })
      .click();
    await expect(page.locator("#CurrentLanguage")).toHaveText(language);
    for (const level of ["Beginner", "Intermediate", "Advanced"]) {
      await page
        .getByRole("combobox", { name: "Difficulty", exact: true })
        .selectOption(level);
      await expect(page.locator("#Code .char").first()).toBeVisible();
      expect(await page.locator("#Topic option").count()).toBeGreaterThan(1);
    }
  }
  await page.reload();
  await expect(page.locator("#CurrentLanguage")).toHaveText("Clojure");
  await expect(
    page.getByRole("combobox", { name: "Difficulty", exact: true }),
  ).toHaveValue("Advanced");
});

test("finishing an untimed snippet saves exactly one result and updates progress", async ({
  page,
}) => {
  await page.clock.install();
  const item = await startSnippet(page, "Trim surrounding spaces", "Lua");
  await page.keyboard.insertText(item.code[0]);
  await page.clock.runFor(5000);
  await page.keyboard.insertText(item.code.slice(1));
  await expect(
    page.getByRole("heading", { name: "Nicely done." }),
  ).toBeVisible();
  await expect(page.locator(".result-metric").nth(1)).toContainText("100%");
  await expect
    .poll(() =>
      page.evaluate(
        () => JSON.parse(localStorage.getItem("tabstop.sessions")).length,
      ),
    )
    .toBe(1);
  await page.keyboard.press("a");
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("tabstop.sessions")).length,
    ),
  ).toBe(1);
  await page
    .getByRole("button", { name: "View progress", exact: true })
    .click();
  await expect(page.locator(".history-table tbody tr")).toHaveCount(1);
  await expect(page.locator(".history-table tbody")).toContainText("Lua");
  await expect(
    page.getByRole("heading", { name: "Your progress." }),
  ).toBeFocused();
});

test("gaps count only the highlighted section and precision ends after three errors", async ({
  page,
}) => {
  await page.clock.install();
  const item = await startSnippet(page, "Trim surrounding spaces", "Lua");
  await page.getByRole("radio", { name: "Fill the gaps", exact: true }).check();
  // Pick the same snippet again while keeping gap mode.
  await startSnippet(page, item.title, item.language);
  const gap = item.code.slice(...item.gap);
  await page.keyboard.insertText(gap[0]);
  await page.clock.runFor(4000);
  await page.keyboard.insertText(gap.slice(1));
  await expect(
    page.getByRole("heading", { name: "Nicely done." }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("tabstop.sessions"))[0].Correct,
    ),
  ).toBe(gap.length);
  await page.getByRole("radio", { name: "Precision", exact: true }).check();
  await page.locator("#ResumeButton").click();
  await page.keyboard.insertText("§§§");
  await expect(
    page.getByRole("heading", { name: "Precision run complete." }),
  ).toBeVisible();
  await expect(page.locator(".result-metric").last()).toContainText("3");
});

test("timer pauses across navigation and still expires after a restart", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/");
  await page.getByRole("radio", { name: "15s", exact: true }).check();
  let code = await page.locator("#AccessibleCode").textContent();
  await page.locator("#ResumeButton").click();
  await page.keyboard.insertText(code[0]);
  await page.clock.runFor(3000);
  await page.getByRole("link", { name: "Library", exact: true }).click();
  await page.clock.runFor(30000);
  await page.getByRole("link", { name: "Practice", exact: true }).click();
  await expect(page.locator("#Timer")).toHaveText("12s");
  await expect(page.locator("#FocusHint")).toContainText("Paused");
  await page.locator("#ResumeButton").click();
  await page.clock.runFor(5000);
  await expect(page.locator("#Timer")).toHaveText("7s");
  await page.getByRole("button", { name: "Restart", exact: true }).click();
  await expect(page.locator("#Timer")).toHaveText("15s");
  code = await page.locator("#AccessibleCode").textContent();
  await page.keyboard.insertText(code[0]);
  await page.clock.runFor(15001);
  await expect(
    page.getByRole("heading", { name: "Time well spent." }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("tabstop.sessions")).length,
    ),
  ).toBe(1);
});

test("a timed run continues through snippets without repeating immediately", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/");
  await page.getByRole("radio", { name: "15s", exact: true }).check();
  const title = await page.locator("#SnippetTitle").textContent();
  const code = await page.locator("#AccessibleCode").textContent();
  await page.locator("#ResumeButton").click();
  await page.keyboard.insertText(code[0]);
  await page.clock.runFor(4000);
  await page.keyboard.insertText(code.slice(1));
  await expect(page.locator("#SnippetTitle")).not.toHaveText(title);
  await expect(page.locator("#SnippetProgress")).toHaveText(
    "1 snippet completed",
  );
  await expect(page.locator("#Results")).toBeHidden();
  await page.clock.runFor(11001);
  await expect(
    page.getByRole("heading", { name: "Time well spent." }),
  ).toBeVisible();
  const stored = await page.evaluate(
    () => JSON.parse(localStorage.getItem("tabstop.sessions"))[0],
  );
  expect(stored.Completed).toBe(1);
  expect(stored.Correct).toBe(code.length);
});

test("indentation, corrections, escape, and paste protection work", async ({
  page,
}) => {
  const item = await startSnippet(page, "Map a generic slice", "Go");
  const prefix = item.code.slice(0, item.code.indexOf("    "));
  await page.keyboard.insertText(prefix);
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("textbox", { name: "Typing area", exact: true }),
  ).toHaveValue(prefix + "    ");
  await page.keyboard.insertText("§");
  await expect(page.locator("#Editor")).toHaveClass(/has-error/);
  await page.keyboard.insertText("abc");
  await expect(
    page.getByRole("textbox", { name: "Typing area", exact: true }),
  ).toHaveValue(prefix + "    §");
  await page.keyboard.press("Backspace");
  await expect(page.locator("#Editor")).not.toHaveClass(/has-error/);
  await page.keyboard.press("Escape");
  await expect(page.locator("#ResumeButton")).toBeFocused();
  await expect(page.locator("#FocusHint")).toContainText("Paused");
  const prevented = await page
    .locator("#Typing")
    .evaluate(
      (input) =>
        !input.dispatchEvent(
          new ClipboardEvent("paste", { bubbles: true, cancelable: true }),
        ),
    );
  expect(prevented).toBe(true);
});

test("library search, preview, and saved snippets survive a reload", async ({
  page,
}) => {
  await page.goto("/#library");
  await page
    .getByRole("searchbox", { name: "Search snippets", exact: true })
    .fill("no-such-snippet-xyz");
  await expect(
    page.getByRole("heading", { name: "No matches this time." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reset filters" }).click();
  await page
    .getByRole("searchbox", { name: "Search snippets", exact: true })
    .fill("Yield a range");
  await expect(page.locator(".snippet-card")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Save Yield a range", exact: true })
    .click();
  await page.reload();
  await page.getByRole("button", { name: /Saved snippets/ }).click();
  await expect(page.locator(".snippet-card")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Yield a range", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Yield a range" }),
  ).toContainText("sync*");
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Yield a range", exact: true }),
  ).toBeFocused();
});

test("legacy data persists, themes work, and history can be exported", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      "tabstop.sessions",
      JSON.stringify([
        {
          Id: "legacy",
          At: "2026-10-27T12:00:00Z",
          Lang: "Lua",
          Level: "Beginner",
          Type: "Copy Code",
          Net: 52,
          Accuracy: 95,
          Mistakes: 2,
          Duration: 60,
          ElapsedMs: 60000,
        },
      ]),
    ),
  );
  await page.goto("/#progress");
  await expect(page.locator(".history-table tbody tr")).toHaveCount(1);
  await expect(page.locator(".progress-metric").first()).toContainText("52");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: /Export sessions/ }).click();
  expect((await download).suggestedFilename()).toMatch(
    /tabstop-sessions-.*\.json/,
  );
  await page.getByRole("button", { name: "Open settings" }).click();
  await page.getByRole("radio", { name: "Paper", exact: true }).check();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "paper");
  await page
    .getByRole("combobox", { name: "Motion", exact: true })
    .selectOption("on");
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduce");
  await page.keyboard.press("Escape");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "paper");
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduce");
});

test("accessibility checks pass for practice, library, and settings", async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  for (const route of ["practice", "library"]) {
    await page
      .getByRole("link", {
        name: route === "practice" ? "Practice" : "Library",
        exact: true,
      })
      .click();
    const audit = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(audit.violations).toEqual([]);
  }
  await page.getByRole("button", { name: "Open settings" }).click();
  for (const theme of ["Graphite", "Midnight", "Paper"]) {
    await page.getByRole("radio", { name: theme, exact: true }).check();
    const audit = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(audit.violations).toEqual([]);
  }
});

test("storage failures do not prevent practice", async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new Error("Blocked");
    };
    Storage.prototype.setItem = () => {
      throw new Error("Blocked");
    };
  });
  await page.goto("/");
  await expect(page.locator("#Notice")).toContainText("storage is unavailable");
  await page.getByRole("radio", { name: "Untimed", exact: true }).check();
  const code = await page.locator("#AccessibleCode").textContent();
  await page.locator("#ResumeButton").click();
  await page.keyboard.insertText(code);
  await expect(
    page.getByRole("heading", { name: "Nicely done." }),
  ).toBeVisible();
  await expect(page.locator(".result-tip")).toContainText("could not be saved");
});
