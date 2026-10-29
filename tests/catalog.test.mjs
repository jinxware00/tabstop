import test from "node:test";
import assert from "node:assert/strict";
import { languages, snippets } from "../assets/catalog.js";

test("every language has varied content at each level and a usable completion gap", () => {
  assert.ok(languages.length >= 28);
  assert.ok(snippets.length >= 400);
  assert.equal(new Set(snippets.map((item) => item.id)).size, snippets.length);
  assert.equal(
    new Set(snippets.map((item) => item.language + ":" + item.code)).size,
    snippets.length,
  );
  for (const language of languages) {
    const items = snippets.filter((item) => item.language === language.name);
    assert.ok(items.length >= 12, language.name);
    for (const level of ["Beginner", "Intermediate", "Advanced"])
      assert.ok(
        items.filter((item) => item.level === level).length >= 2,
        `${language.name} / ${level}`,
      );
    assert.ok(
      new Set(items.map((item) => item.topic)).size >= 4,
      language.name,
    );
  }
  for (const item of snippets) {
    assert.ok(item.title && item.topic);
    assert.equal(item.code.includes("⟦") || item.code.includes("⟧"), false);
    assert.ok(
      item.gap[0] >= 0 &&
        item.gap[1] <= item.code.length &&
        item.gap[1] > item.gap[0],
      item.title,
    );
    assert.ok(item.code.length < 2200, item.title);
    assert.ok(!/[\u0000-\u0008\u000b\u000c]/.test(item.code), item.title);
  }
});
