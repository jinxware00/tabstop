import test from "node:test";
import assert from "node:assert/strict";
import {
  createSession,
  applyInput,
  metrics,
  elapsed,
  pause,
  resume,
  completeSnippet,
  filterSnippets,
  dailySnippet,
  shuffled,
  validSessions,
} from "../core.js";

test("corrected mistakes remain in accuracy and raw WPM", () => {
  const session = createSession();
  applyInput(session, "abX", "abcdef", true, 100);
  applyInput(session, "ab", "abcdef", true, 200);
  applyInput(session, "abcdef", "abcdef", true, 30100);
  const result = metrics(session, "abcdef", 30100);
  assert.equal(result.correct, 6);
  assert.equal(result.mistakes, 1);
  assert.equal(result.accuracy, 85.7);
  assert.equal(result.net, 2.4);
  assert.equal(result.raw, 2.8);
  assert.deepEqual(session.missed, { c: 1 });
});
test("mistake lock accepts one wrong character and requires correction", () => {
  const session = createSession();
  assert.equal(applyInput(session, "aZZZ", "abcd", true, 1), "aZ");
  assert.equal(applyInput(session, "aZZZZ", "abcd", true, 2), "aZ");
  assert.equal(session.keysBad, 1);
  assert.equal(applyInput(session, "a", "abcd", true, 3), "a");
  assert.equal(applyInput(session, "ab", "abcd", true, 4), "ab");
});
test("precision mode records every error", () => {
  const session = createSession();
  applyInput(session, "XYZ", "abc", false, 10);
  assert.equal(session.keysBad, 3);
  assert.equal(metrics(session, "abc", 5010).net, 0);
});
test("idle time and paused time never reduce typing speed", () => {
  const session = createSession();
  assert.equal(elapsed(session, 300000), 0);
  applyInput(session, "a", "abc", true, 300000);
  pause(session, 305000);
  assert.equal(elapsed(session, 900000), 5000);
  assert.equal(applyInput(session, "abc", "abc", true, 900000), "a");
  resume(session, 900000);
  assert.equal(elapsed(session, 903000), 8000);
});
test("timed runs carry correct characters across completed snippets", () => {
  const session = createSession();
  applyInput(session, "abc", "abc", true, 0);
  assert.equal(completeSnippet(session, "abc"), true);
  assert.equal(session.completed, 1);
  assert.equal(session.typed, "");
  applyInput(session, "de", "def", true, 3000);
  assert.equal(completeSnippet(session, "def"), false);
  assert.equal(metrics(session, "def", 6000).correct, 5);
  assert.equal(metrics(session, "def", 6000).net, 10);
});
test("a finished session cannot accept or duplicate more input", () => {
  const session = createSession();
  session.state = "done";
  assert.equal(applyInput(session, "new", "new", false, 100), "");
  assert.equal(session.keysOk, 0);
});
test("search combines language, level, topic, and text without silent fallbacks", () => {
  const snippets = [
    {
      language: "Lua",
      level: "Beginner",
      topic: "Strings",
      title: "Trim text",
      code: "string.match",
    },
    {
      language: "Lua",
      level: "Advanced",
      topic: "Strings",
      title: "Parse text",
      code: "parse",
    },
  ];
  assert.equal(
    filterSnippets(snippets, {
      language: "Lua",
      level: "Beginner",
      query: " MATCH ",
    }).length,
    1,
  );
  assert.equal(filterSnippets(snippets, { topic: "Arrays" }).length, 0);
});
test("shuffle has no missing or duplicated entries and daily selection is stable", () => {
  const input = Array.from({ length: 30 }, (_, id) => ({ id }));
  assert.deepEqual(new Set(shuffled(input)), new Set(input));
  assert.equal(
    dailySnippet(input, "2026-10-29"),
    dailySnippet(input, "2026-10-29"),
  );
  assert.notEqual(
    dailySnippet(input, "2026-10-29"),
    dailySnippet(input, "2026-10-30"),
  );
});
test("legacy history is preserved while malformed records are ignored", () => {
  const legacy = {
    Net: 52,
    Accuracy: 95,
    Lang: "Lua",
    At: "2026-10-27T12:00:00Z",
  };
  assert.deepEqual(
    validSessions([
      legacy,
      null,
      "bad",
      { ...legacy, Accuracy: 300 },
      { ...legacy, At: "invalid" },
    ]),
    [legacy],
  );
  assert.deepEqual(validSessions({ nope: true }), []);
});
