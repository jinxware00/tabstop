export const round = (value) => Math.round(value * 10) / 10;
export const levels = ["Beginner", "Intermediate", "Advanced"];

export function createSession() {
  return {
    state: "idle",
    typed: "",
    correctBefore: 0,
    completed: 0,
    keysOk: 0,
    keysBad: 0,
    elapsed: 0,
    start: 0,
    samples: [],
    missed: {},
    saved: false,
  };
}
export function elapsed(session, now) {
  return (
    session.elapsed +
    (session.state === "running" ? Math.max(0, now - session.start) : 0)
  );
}
export function pause(session, now) {
  if (session.state !== "running") return;
  session.elapsed = elapsed(session, now);
  session.state = "paused";
}
export function resume(session, now) {
  if (!["idle", "paused"].includes(session.state)) return;
  session.start = now;
  session.state = "running";
}
export function applyInput(session, value, target, stopOnError, now) {
  if (session.state === "done" || session.state === "paused")
    return session.typed;
  let next = value.slice(0, target.length);
  if (stopOnError) {
    const wrong = [...next].findIndex(
      (character, index) => character !== target[index],
    );
    if (wrong !== -1) next = next.slice(0, wrong + 1);
  }
  let prefix = 0;
  while (
    prefix < Math.min(next.length, session.typed.length) &&
    next[prefix] === session.typed[prefix]
  )
    prefix++;
  if (next.length > prefix && session.state === "idle") resume(session, now);
  for (let index = prefix; index < next.length; index++) {
    if (next[index] === target[index]) session.keysOk++;
    else {
      session.keysBad++;
      const expected = target[index];
      session.missed[expected] = (session.missed[expected] || 0) + 1;
    }
  }
  session.typed = next;
  return next;
}
export function metrics(session, target, now) {
  const milliseconds = elapsed(session, now);
  const correct = [...session.typed].filter(
    (character, index) => character === target[index],
  ).length;
  const minutes = Math.max(milliseconds, 3000) / 60000;
  const keys = session.keysOk + session.keysBad;
  return {
    net: round((session.correctBefore + correct) / 5 / minutes),
    raw: round(keys / 5 / minutes),
    accuracy: keys ? round((session.keysOk / keys) * 100) : 100,
    mistakes: session.keysBad,
    correct: session.correctBefore + correct,
    completion: round((correct / Math.max(target.length, 1)) * 100),
    elapsed: milliseconds,
  };
}
export function completeSnippet(session, target) {
  if (session.typed !== target) return false;
  session.correctBefore += target.length;
  session.completed++;
  session.typed = "";
  return true;
}
export function shuffled(items, random = Math.random) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}
export function filterSnippets(snippets, filter) {
  const query = (filter.query || "").trim().toLowerCase();
  return snippets.filter(
    (snippet) =>
      (!filter.language ||
        filter.language === "All" ||
        snippet.language === filter.language) &&
      (!filter.level ||
        filter.level === "All" ||
        snippet.level === filter.level) &&
      (!filter.topic ||
        filter.topic === "Any" ||
        snippet.topic === filter.topic) &&
      (!query ||
        [snippet.title, snippet.language, snippet.topic, snippet.code].some(
          (text) => text.toLowerCase().includes(query),
        )),
  );
}
export function dailySnippet(snippets, date) {
  let hash = 2166136261;
  for (const char of date)
    hash = Math.imul(hash ^ char.charCodeAt(0), 16777619) >>> 0;
  return snippets[hash % snippets.length];
}
export function validSessions(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (item) =>
        item &&
        typeof item === "object" &&
        Number.isFinite(item.Net) &&
        item.Net >= 0 &&
        Number.isFinite(item.Accuracy) &&
        item.Accuracy >= 0 &&
        item.Accuracy <= 100 &&
        typeof item.Lang === "string" &&
        typeof item.At === "string" &&
        !Number.isNaN(Date.parse(item.At)),
    )
    .slice(-500);
}
