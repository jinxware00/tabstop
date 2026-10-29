import { languages, snippets } from "./assets/catalog.js";
import {
  createSession,
  elapsed,
  pause,
  resume,
  applyInput,
  metrics,
  completeSnippet,
  shuffled,
  filterSnippets,
  dailySnippet,
  validSessions,
  levels,
  round,
} from "./core.js";

const $ = (id) => document.getElementById(id);
const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};
const button = (label, className, callback) => {
  const node = el("button", className, label);
  node.type = "button";
  node.onclick = callback;
  return node;
};
const modeNames = {
  copy: "Copy Code",
  gaps: "Complete Snippet",
  precision: "Error-Free Run",
};
let storageOk = true,
  noticeTimer;
function notice(message) {
  $("Notice").textContent = message;
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => {
    $("Notice").textContent = "";
  }, 5000);
}
function load(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    storageOk = false;
    return fallback;
  }
}
function store(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    storageOk = false;
    notice(
      "Browser storage is unavailable. You can still practise this visit.",
    );
  }
}
const settings = {
  Theme: "graphite",
  Accent: "Mint",
  Sound: false,
  StopOnError: true,
  Motion: "system",
  Size: 18,
  ...load("tabstop.settings", {}),
};
const config = {
  language: "Lua",
  level: "Beginner",
  mode: "copy",
  topic: "Any",
  duration: 60,
  ...load("tabstop.practice", {}),
};
if (!languages.some((item) => item.name === config.language))
  config.language = "Lua";
if (!levels.includes(config.level)) config.level = "Beginner";
if (!Object.hasOwn(modeNames, config.mode)) config.mode = "copy";
if (![0, 15, 30, 60, 120].includes(config.duration)) config.duration = 60;
if (typeof config.topic !== "string") config.topic = "Any";
let sessions = validSessions(load("tabstop.sessions", []));
const savedIds = load("tabstop.saved", []);
const saved = new Set(
  (Array.isArray(savedIds) ? savedIds : []).filter((id) =>
    snippets.some((item) => item.id === id),
  ),
);
let session = createSession(),
  current,
  target = "",
  targetStart = 0,
  characters = [],
  timer,
  queue = [],
  lastId,
  preview;
let view = "practice",
  libraryLimit = 24,
  savedOnly = false,
  audio;
const typing = $("Typing");
const motionQuery = matchMedia("(prefers-reduced-motion: reduce)");
const day = new Date().toISOString().slice(0, 10);
const daily = dailySnippet(snippets, day);
const languageInfo = (name) => languages.find((item) => item.name === name);
const now = () => performance.now();
const symbolName = (key) =>
  ({ " ": "space", "\n": "enter", "\t": "tab" })[key] || key;

function applySettings() {
  if (!["graphite", "midnight", "paper"].includes(settings.Theme))
    settings.Theme = "graphite";
  if (![18, 21, 24].includes(Number(settings.Size))) settings.Size = 18;
  const palette =
    settings.Theme === "paper"
      ? {
          Mint: "#476c36",
          Amber: "#805b17",
          Violet: "#6c4a98",
          Rose: "#9b4058",
          Cyan: "#166574",
        }
      : {
          Mint: "#c4e7b2",
          Amber: "#e0bd7d",
          Violet: "#c2afe4",
          Rose: "#e9afb9",
          Cyan: "#9fd9e4",
        };
  if (!palette[settings.Accent]) settings.Accent = "Mint";
  document.documentElement.dataset.theme = settings.Theme;
  document.documentElement.dataset.motion =
    settings.Motion === "on" ||
    (settings.Motion !== "off" && motionQuery.matches)
      ? "reduce"
      : "full";
  document.documentElement.style.setProperty(
    "--accent",
    palette[settings.Accent],
  );
  document.documentElement.style.setProperty(
    "--code-size",
    `${settings.Size}px`,
  );
  document.querySelector('meta[name="theme-color"]').content =
    settings.Theme === "paper"
      ? "#f6f5f0"
      : settings.Theme === "midnight"
        ? "#11141d"
        : "#121615";
  requestAnimationFrame(moveCaret);
}
function beep(correct = true) {
  if (!settings.Sound) return;
  try {
    audio ||= new AudioContext();
    if (audio.state === "suspended") audio.resume();
    const oscillator = audio.createOscillator(),
      gain = audio.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = correct ? 560 : 170;
    gain.gain.setValueAtTime(0.024, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.045);
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start();
    oscillator.stop(audio.currentTime + 0.05);
  } catch {
    /* Practice remains available without audio. */
  }
}
function pool() {
  return filterSnippets(snippets, {
    language: config.language,
    level: config.level,
    topic: config.topic,
  });
}
function refreshControls() {
  const topics = [
    ...new Set(
      snippets
        .filter(
          (item) =>
            item.language === config.language && item.level === config.level,
        )
        .map((item) => item.topic),
    ),
  ].sort();
  if (config.topic !== "Any" && !topics.includes(config.topic))
    config.topic = "Any";
  $("Topic").replaceChildren();
  for (const topic of ["Any", ...topics]) {
    const option = el("option", "", topic === "Any" ? "All topics" : topic);
    option.value = topic;
    $("Topic").append(option);
  }
  $("Topic").value = config.topic;
  $("Difficulty").value = config.level;
  $("CurrentLanguage").textContent = config.language;
  $("LanguageButton").style.setProperty(
    "--language-color",
    languageInfo(config.language).color,
  );
  document
    .querySelectorAll("input[name=mode]")
    .forEach((input) => (input.checked = input.value === config.mode));
  document
    .querySelectorAll("input[name=duration]")
    .forEach(
      (input) => (input.checked = Number(input.value) === config.duration),
    );
  $("PoolCount").textContent = `${pool().length} snippets to explore`;
  store("tabstop.practice", config);
}
function pickNext() {
  if (!queue.length) {
    queue = shuffled(pool());
    if (queue.length > 1 && queue[0].id === lastId)
      [queue[0], queue[1]] = [queue[1], queue[0]];
  }
  const item = queue.shift();
  lastId = item.id;
  return item;
}
function classify(code) {
  const types = new Array(code.length).fill("");
  const pattern =
    /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|\b(\d+(?:\.\d+)?)\b|\b(local|function|return|end|if|then|else|for|while|const|let|var|def|class|import|from|public|private|static|void|int|fn|pub|struct|enum|match|use|func|package|SELECT|FROM|WHERE|true|false|nil|null|None|async|await|val|fun|do|case|yield|type|interface)\b/g;
  for (const match of code.matchAll(pattern))
    types.fill(
      match[1] ? "string" : match[2] ? "number" : "keyword",
      match.index,
      match.index + match[0].length,
    );
  return types;
}
function renderCode(item) {
  current = item;
  targetStart = config.mode === "gaps" ? item.gap[0] : 0;
  target = config.mode === "gaps" ? item.code.slice(...item.gap) : item.code;
  const syntax = classify(item.code),
    code = $("Code");
  code.replaceChildren();
  characters = [];
  let line = el("span", "code-line"),
    lineNumber = 1;
  line.append(el("span", "line-number", lineNumber));
  code.append(line);
  for (let index = 0; index < item.code.length; index++) {
    const character = item.code[index],
      active = index >= targetStart && index < targetStart + target.length;
    const span = el(
      "span",
      `char ${syntax[index]}${active ? (config.mode === "gaps" ? " gap" : "") : " context"}${character === "\n" ? " newline" : ""}`,
      character === "\n" ? "↵" : character,
    );
    if (active) characters.push(span);
    line.append(span);
    if (character === "\n") {
      line = el("span", "code-line");
      line.append(el("span", "line-number", ++lineNumber));
      code.append(line);
    }
  }
  $("AccessibleCode").textContent =
    config.mode === "gaps"
      ? `Type this section: ${target}. Full context: ${item.code}`
      : item.code;
  $("SnippetTitle").textContent = item.title;
  $("FileExtension").textContent = "." + languageInfo(item.language).extension;
  $("ModeHint").textContent =
    config.mode === "gaps"
      ? "Type the highlighted section. The rest is context."
      : config.mode === "precision"
        ? "Three mistakes end the run. Every character counts."
        : config.duration
          ? "The clock starts with your first character. Keep going across snippets."
          : "Take your time. Finish the snippet at your own pace.";
  typing.value = "";
  typing.maxLength = target.length;
  typing.readOnly = false;
  $("CodeScroll").scrollTop = 0;
  updateSaved();
  paint();
}
function reset(item, focus = false) {
  clearInterval(timer);
  timer = undefined;
  session = createSession();
  document.body.classList.remove("running");
  $("SessionArea").hidden = false;
  $("Results").hidden = true;
  $("Editor").classList.remove("paused", "has-error");
  renderCode(item || pickNext());
  updateFocusHint();
  if (focus) typing.focus({ preventScroll: true });
}
function changeConfig() {
  queue = [];
  refreshControls();
  reset();
}
function paint() {
  for (let index = 0; index < characters.length; index++) {
    characters[index].classList.toggle(
      "correct",
      index < session.typed.length && session.typed[index] === target[index],
    );
    characters[index].classList.toggle(
      "error",
      index < session.typed.length && session.typed[index] !== target[index],
    );
  }
  const wrong = [...session.typed].some(
    (character, index) => character !== target[index],
  );
  $("Editor").classList.toggle("has-error", wrong);
  updateMetrics();
  moveCaret();
}
function moveCaret() {
  if (!current || $("SessionArea").hidden) return;
  const span =
    characters[Math.min(session.typed.length, characters.length - 1)];
  if (!span) return;
  const scroller = $("CodeScroll"),
    box = span.getBoundingClientRect(),
    parent = scroller.getBoundingClientRect();
  const top = box.top - parent.top + scroller.scrollTop;
  $("Caret").style.transform =
    `translate(${box.left - parent.left + scroller.scrollLeft - 1}px, ${top}px)`;
  $("Caret").style.height = `${Math.max(18, box.height)}px`;
  if (document.activeElement === typing) {
    if (top > scroller.scrollTop + scroller.clientHeight - 45)
      scroller.scrollTop = top - scroller.clientHeight + 65;
    else if (top < scroller.scrollTop + 10)
      scroller.scrollTop = Math.max(0, top - 25);
  }
  const before = current.code
    .slice(0, targetStart + session.typed.length)
    .split("\n");
  $("Position").textContent =
    `Line ${before.length}, column ${before.at(-1).length + 1}`;
}
function updateMetrics() {
  const result = metrics(session, target, now());
  const seconds = config.duration
    ? Math.max(0, Math.ceil(config.duration - result.elapsed / 1000))
    : Math.floor(result.elapsed / 1000);
  $("Timer").replaceChildren(
    document.createTextNode(String(seconds)),
    el("span", "", "s"),
  );
  $("TimerLabel").textContent = config.duration ? "remaining" : "elapsed";
  $("Wpm").textContent = Math.round(result.net);
  $("Accuracy").replaceChildren(
    document.createTextNode(String(Math.round(result.accuracy))),
    el("span", "", "%"),
  );
  $("Mistakes").textContent =
    result.mistakes + (config.mode === "precision" ? "/3" : "");
  $("TimeFill").style.transform =
    `scaleX(${config.duration ? Math.max(0, 1 - result.elapsed / (config.duration * 1000)) : result.completion / 100})`;
  $("TimeFill").parentNode.classList.toggle(
    "low",
    config.duration > 0 && seconds <= 5,
  );
  $("SnippetProgress").textContent =
    `${session.completed} snippet${session.completed === 1 ? "" : "s"} completed`;
}
function updateFocusHint() {
  const focused = document.activeElement === typing;
  $("FocusHint").textContent =
    session.state === "paused"
      ? "Paused · click to continue"
      : session.state === "running"
        ? "Keep your rhythm"
        : focused
          ? "Start typing when you’re ready"
          : "Click here to start typing";
  $("Editor").classList.toggle("paused", session.state === "paused");
}
function pausePractice() {
  pause(session, now());
  document.body.classList.remove("running");
  updateFocusHint();
  updateMetrics();
}
function tick() {
  if (session.state !== "running") return;
  const milliseconds = elapsed(session, now());
  if (config.duration && milliseconds >= config.duration * 1000) {
    finish("time");
    return;
  }
  if (milliseconds - (session.samples.at(-1)?.time || 0) >= 1000)
    session.samples.push({
      time: Math.round(milliseconds),
      wpm: metrics(session, target, now()).net,
    });
  updateMetrics();
}
function onInput() {
  if (session.state === "done" || session.state === "paused") {
    typing.value = session.typed;
    return;
  }
  if (
    config.duration &&
    session.state === "running" &&
    elapsed(session, now()) >= config.duration * 1000
  ) {
    typing.value = session.typed;
    finish("time");
    return;
  }
  const previousBad = session.keysBad,
    previousLength = session.typed.length;
  typing.value = applyInput(
    session,
    typing.value,
    target,
    config.mode !== "precision" && settings.StopOnError !== false,
    now(),
  );
  if (session.state === "running") {
    document.body.classList.add("running");
    timer ||= setInterval(tick, 100);
  }
  if (session.typed.length > previousLength)
    beep(session.keysBad === previousBad);
  paint();
  updateFocusHint();
  if (config.mode === "precision" && session.keysBad >= 3) finish("broken");
  else if (session.typed === target) {
    if (!config.duration) {
      session.completed++;
      finish("complete");
    } else {
      completeSnippet(session, target);
      renderCode(pickNext());
      notice("Snippet complete. Keep going!");
    }
  }
}
function resultChart(points, label, xLabel = "session") {
  const ns = "http://www.w3.org/2000/svg";
  const svg = (name, attrs, text) => {
    const node = document.createElementNS(ns, name);
    for (const [key, value] of Object.entries(attrs))
      node.setAttribute(key, value);
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const graph = svg("svg", {
    viewBox: "0 0 900 200",
    class: "chart",
    role: "img",
    "aria-label": label,
  });
  const maximum =
    Math.ceil(Math.max(40, ...points.map((point) => point.wpm)) / 20) * 20;
  const x = (index) =>
    points.length > 1 ? 45 + (index / (points.length - 1)) * 835 : 450;
  const y = (value) => 162 - (value / maximum) * 145;
  for (let step = 0; step <= 2; step++) {
    const value = (maximum * step) / 2;
    graph.append(
      svg("line", {
        x1: 40,
        x2: 885,
        y1: y(value),
        y2: y(value),
        class: "grid-line",
      }),
      svg("text", { x: 0, y: y(value) + 4 }, value),
    );
  }
  if (points.length > 1) {
    const coords = points
      .map((point, index) => `${x(index)},${y(point.wpm)}`)
      .join(" ");
    graph.append(
      svg("polygon", {
        points: `${x(0)},162 ${coords} ${x(points.length - 1)},162`,
        class: "data-area",
      }),
      svg("polyline", { points: coords, class: "data-line" }),
    );
  }
  points.forEach((point, index) => {
    const circle = svg("circle", { cx: x(index), cy: y(point.wpm), r: 4 });
    circle.append(
      svg(
        "title",
        {},
        `${round(point.wpm)} WPM · ${point.label || `${index + 1} ${xLabel}`}`,
      ),
    );
    graph.append(circle);
  });
  graph.append(
    svg(
      "text",
      { x: 42, y: 190 },
      points.length && xLabel === "seconds"
        ? `${Math.round(points[0].time / 1000)}s`
        : "earlier",
    ),
    svg(
      "text",
      { x: 880, y: 190, "text-anchor": "end" },
      points.length && xLabel === "seconds"
        ? `${Math.round(points.at(-1).time / 1000)}s`
        : "latest",
    ),
  );
  return graph;
}
function finish(reason) {
  if (session.state !== "running") return;
  const finishedAt = now();
  pause(session, finishedAt);
  if (config.duration)
    session.elapsed = Math.min(session.elapsed, config.duration * 1000);
  session.state = "done";
  clearInterval(timer);
  timer = undefined;
  document.body.classList.remove("running");
  const result = metrics(session, target, finishedAt);
  const comparisons = sessions.filter(
    (item) =>
      item.Lang === config.language &&
      item.Level === config.level &&
      item.Type === modeNames[config.mode] &&
      item.Duration === config.duration,
  );
  const best = comparisons.length
    ? Math.max(...comparisons.map((item) => item.Net))
    : null;
  session.samples.push({ time: Math.round(result.elapsed), wpm: result.net });
  if (!session.saved) {
    session.saved = true;
    sessions.push({
      Id: crypto.randomUUID(),
      At: new Date().toISOString(),
      Lang: config.language,
      Level: config.level,
      Topic: current.topic,
      Type: modeNames[config.mode],
      Duration: config.duration,
      SnippetId: current.id,
      Title: current.title,
      Reason: reason,
      Net: result.net,
      Gross: result.raw,
      Accuracy: result.accuracy,
      Mistakes: result.mistakes,
      Correct: result.correct,
      Completion: result.completion,
      ElapsedMs: Math.round(result.elapsed),
      Completed: session.completed,
    });
    sessions = sessions.slice(-500);
    store("tabstop.sessions", sessions);
  }
  $("SessionArea").hidden = true;
  const box = $("Results");
  box.hidden = false;
  box.replaceChildren();
  box.append(
    el(
      "p",
      "eyebrow",
      reason === "broken"
        ? "Three mistakes. A fresh start is one click away."
        : "Another bit of practice, in the books.",
    ),
    el(
      "h2",
      "",
      reason === "time"
        ? "Time well spent."
        : reason === "broken"
          ? "Precision run complete."
          : "Nicely done.",
    ),
    el(
      "p",
      "result-meta",
      `${config.language} · ${config.level} · ${modeNames[config.mode]} · ${round(result.elapsed / 1000)} seconds`,
    ),
  );
  if (best !== null && result.net > best)
    box.append(
      el(
        "span",
        "result-badge",
        `New personal best for this setup · +${round(result.net - best)} WPM`,
      ),
    );
  const grid = el("div", "result-metrics");
  for (const [value, label] of [
    [result.net, "net words per minute"],
    [result.accuracy + "%", "accuracy"],
    [result.raw, "raw wpm"],
    [result.mistakes, "mistakes"],
  ]) {
    const cell = el("div", "result-metric");
    cell.append(el("strong", "", value), el("span", "", label));
    grid.append(cell);
  }
  box.append(grid);
  if (session.samples.length > 1)
    box.append(
      resultChart(
        session.samples,
        "Your net typing speed throughout this session",
        "seconds",
      ),
    );
  const tip = el("div", "result-tip");
  tip.append(
    el(
      "p",
      "",
      `${session.completed} snippet${session.completed === 1 ? "" : "s"} completed. ${result.correct} correct characters. ${storageOk ? "Saved to your progress." : "Progress could not be saved in this browser."}`,
    ),
  );
  const missed = Object.entries(session.missed)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  if (missed.length) {
    tip.append(
      el("p", "", "Give these keys a little extra attention next time:"),
    );
    const row = el("div", "result-keys");
    missed.forEach(([key, count]) =>
      row.append(el("span", "", `${symbolName(key)} × ${count}`)),
    );
    tip.append(row);
  } else
    tip.append(
      el("p", "", "Every character was accurate. Keep that steady rhythm."),
    );
  box.append(tip);
  const actions = el("div", "result-actions"),
    retry = button("Try again ↺", "button primary", () => reset(current, true));
  actions.append(
    retry,
    button("Next snippet →", "button secondary", () => reset(undefined, true)),
    button("View progress", "quiet-button", () => (location.hash = "progress")),
  );
  box.append(actions);
  updateSummary();
  retry.focus({ preventScroll: true });
}
function updateSummary() {
  const today = sessions.filter((item) => item.At.slice(0, 10) === day);
  $("PracticeSummary").textContent = today.length
    ? `${today.length} session${today.length === 1 ? "" : "s"} today · ${round(today.reduce((total, item) => total + (item.ElapsedMs || 0), 0) / 60000)} minutes of practice`
    : "Your progress stays in this browser.";
}
function toggleSaved(id) {
  if (saved.has(id)) saved.delete(id);
  else saved.add(id);
  store("tabstop.saved", [...saved]);
  updateSaved();
  if (view === "library") renderLibrary();
}
function bookmark(id) {
  const node = button(saved.has(id) ? "★" : "☆", "icon-button", () =>
    toggleSaved(id),
  );
  node.setAttribute(
    "aria-label",
    `${saved.has(id) ? "Unsave" : "Save"} ${snippets.find((item) => item.id === id).title}`,
  );
  node.setAttribute("aria-pressed", String(saved.has(id)));
  return node;
}
function updateSaved() {
  $("SavedCount").textContent = saved.size;
  if (!current) return;
  $("BookmarkCurrent").setAttribute(
    "aria-pressed",
    String(saved.has(current.id)),
  );
  $("BookmarkCurrent").setAttribute(
    "aria-label",
    saved.has(current.id) ? "Unsave this snippet" : "Save this snippet",
  );
}
function openPreview(item) {
  preview = item;
  $("PreviewTitle").textContent = item.title;
  $("PreviewMeta").textContent =
    `${item.language} · ${item.level} · ${item.topic}`;
  $("PreviewCode").textContent = item.code;
  $("PreviewLength").textContent =
    `${item.code.length} characters · ${item.code.split("\n").length} lines`;
  $("SnippetDialog").showModal();
}
function practiseItem(item) {
  config.language = item.language;
  config.level = item.level;
  config.topic = "Any";
  config.duration = 0;
  queue = [];
  refreshControls();
  location.hash = "practice";
  showView("practice");
  reset(item, true);
}
function renderLibrary() {
  const filtered = filterSnippets(snippets, {
    language: $("LibraryLanguage").value,
    level: $("LibraryLevel").value,
    query: $("LibrarySearch").value,
  }).filter((item) => !savedOnly || saved.has(item.id));
  const grid = $("SnippetGrid");
  grid.replaceChildren();
  $("LibraryCount").textContent =
    `${filtered.length} snippet${filtered.length === 1 ? "" : "s"}${savedOnly ? " in your saved collection" : " found"}`;
  if (!filtered.length) {
    const empty = el("div", "empty-state");
    empty.append(
      el(
        "h2",
        "",
        savedOnly ? "Your own little collection." : "No matches this time.",
      ),
      el(
        "p",
        "",
        savedOnly
          ? "Save snippets with the bookmark button, then come back to practise them."
          : "Try another language, topic, or a shorter search.",
      ),
      button("Reset filters", "button secondary", () => {
        savedOnly = false;
        $("SavedFilter").setAttribute("aria-pressed", "false");
        $("LibrarySearch").value = "";
        $("LibraryLanguage").value = $("LibraryLevel").value = "All";
        renderLibrary();
      }),
    );
    grid.append(empty);
  }
  for (const item of filtered.slice(0, libraryLimit)) {
    const card = el("article", "snippet-card"),
      top = el("div", "snippet-card-top"),
      dot = el("span", "language-dot");
    dot.style.background = languageInfo(item.language).color;
    top.append(
      dot,
      el("span", "", item.language),
      el("span", "level", item.level),
    );
    const title = el("h2");
    title.append(button(item.title, "", () => openPreview(item)));
    const bottom = el("div", "snippet-card-bottom");
    bottom.append(
      el("span", "", `${item.topic} · ${item.code.length} chars`),
      bookmark(item.id),
    );
    card.append(top, title, el("pre", "", item.code), bottom);
    grid.append(card);
  }
  $("LoadMore").hidden = filtered.length <= libraryLimit;
}
function renderLanguages() {
  const query = $("LanguageSearch").value.trim().toLowerCase();
  $("LanguageList").replaceChildren();
  const filtered = languages.filter((item) =>
    [item.name, item.group, item.extension].some((value) =>
      value.toLowerCase().includes(query),
    ),
  );
  for (const language of filtered) {
    const option = button("", "language-option", () => {
      config.language = language.name;
      config.topic = "Any";
      $("LanguageDialog").close();
      changeConfig();
    });
    const dot = el("span", "language-dot");
    dot.style.background = language.color;
    option.append(
      dot,
      el("span", "", language.name),
      el(
        "small",
        "",
        `${snippets.filter((item) => item.language === language.name).length} snippets`,
      ),
    );
    option.setAttribute(
      "aria-pressed",
      String(language.name === config.language),
    );
    $("LanguageList").append(option);
  }
  if (!filtered.length)
    $("LanguageList").append(
      el("p", "empty-state", "No languages match that search."),
    );
}
function renderProgress() {
  const selected = $("ProgressLanguage").value,
    filtered = sessions.filter(
      (item) => selected === "All" || item.Lang === selected,
    ),
    box = $("ProgressContent");
  box.replaceChildren();
  $("ExportButton").disabled = sessions.length === 0;
  if (!filtered.length) {
    const empty = el("div", "empty-state");
    empty.append(
      el("h2", "", "Your next session starts the story."),
      el(
        "p",
        "",
        "Finish a practice run to see your speed, accuracy, and history here. A few minutes is a good place to start.",
      ),
      button(
        "Start practising →",
        "button primary",
        () => (location.hash = "practice"),
      ),
    );
    box.append(empty);
    return;
  }
  const grid = el("div", "progress-metrics");
  const values = [
    [
      Math.max(...filtered.map((item) => item.Net)),
      "Personal best",
      "net words per minute",
    ],
    [
      round(
        filtered.reduce((sum, item) => sum + item.Net, 0) / filtered.length,
      ),
      "Average speed",
      "across your sessions",
    ],
    [
      round(
        filtered.reduce((sum, item) => sum + item.Accuracy, 0) /
          filtered.length,
      ) + "%",
      "Average accuracy",
      "correct typed characters",
    ],
    [filtered.length, "Sessions completed", "saved on this device"],
  ];
  for (const [value, title, subtitle] of values) {
    const cell = el("div", "progress-metric");
    cell.append(
      el("span", "", title),
      el("strong", "", value),
      el("small", "", subtitle),
    );
    grid.append(cell);
  }
  box.append(grid);
  const chart = el("div", "chart-panel");
  chart.append(
    el("h2", "", "A little more fluent."),
    el(
      "p",
      "",
      `Net WPM across your last ${Math.min(filtered.length, 30)} sessions. Different languages and difficulties can change your pace.`,
    ),
    resultChart(
      filtered.slice(-30).map((item) => ({
        wpm: item.Net,
        label: `${item.Lang}, ${new Date(item.At).toLocaleDateString()}`,
      })),
      "Net words per minute across recent practice sessions",
    ),
  );
  box.append(chart, el("h2", "", "Recent sessions"));
  const wrap = el("div", "table-wrap"),
    table = el("table", "history-table"),
    head = el("thead"),
    header = el("tr");
  for (const text of [
    "Date",
    "Language",
    "Mode",
    "WPM",
    "Accuracy",
    "Mistakes",
  ]) {
    const th = el("th", "", text);
    th.scope = "col";
    header.append(th);
  }
  head.append(header);
  table.append(head);
  const body = el("tbody");
  for (const item of filtered.slice(-30).reverse()) {
    const row = el("tr");
    [
      new Date(item.At).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
      item.Lang,
      item.Type,
      item.Net,
      item.Accuracy + "%",
      item.Mistakes ?? "—",
    ].forEach((value) => row.append(el("td", "", value)));
    body.append(row);
  }
  table.append(body);
  wrap.append(table);
  box.append(wrap);
}
function showView(name) {
  if (!["practice", "library", "progress"].includes(name)) name = "practice";
  const changed = view !== name;
  if (name !== "practice") {
    pausePractice();
    document.body.classList.remove("focus-mode");
    $("FocusButton").setAttribute("aria-pressed", "false");
  }
  view = name;
  for (const key of ["Practice", "Library", "Progress"])
    $(key + "View").hidden = key.toLowerCase() !== name;
  document.querySelectorAll("[data-view]").forEach((link) => {
    if (link.dataset.view === name) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  if (name === "library") renderLibrary();
  if (name === "progress") renderProgress();
  if (name === "practice") requestAnimationFrame(moveCaret);
  if (changed) {
    const heading = document.querySelector(
      `#${name[0].toUpperCase() + name.slice(1)}View h1`,
    );
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
  }
}
function openSettings() {
  pausePractice();
  $("SettingsDialog").showModal();
}
function exportSessions() {
  const blob = new Blob(
    [
      JSON.stringify(
        { version: 2, exportedAt: new Date().toISOString(), sessions },
        null,
        2,
      ),
    ],
    { type: "application/json" },
  );
  const link = el("a");
  link.href = URL.createObjectURL(blob);
  link.download = `tabstop-sessions-${day}.json`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

applySettings();
for (const language of languages)
  for (const id of ["LibraryLanguage", "ProgressLanguage"]) {
    const option = el("option", "", language.name);
    option.value = language.name;
    $(id).append(option);
  }
$("LibrarySubtitle").textContent =
  `${snippets.length} snippets. ${languages.length} languages. Plenty of room to get curious.`;
$("LibraryDescription").textContent =
  `${snippets.length} snippets across ${languages.length} languages, from the familiar to the next thing you want to learn.`;
$("CatalogCount").textContent =
  `${languages.length} languages · ${snippets.length} snippets`;
$("DailyTitle").textContent = daily.title;
$("DailyMeta").textContent = `${daily.language} · ${daily.level}`;
$("DailyButton").onclick = () => practiseItem(daily);
$("Difficulty").onchange = () => {
  config.level = $("Difficulty").value;
  config.topic = "Any";
  changeConfig();
};
$("Topic").onchange = () => {
  config.topic = $("Topic").value;
  changeConfig();
};
document.querySelectorAll("input[name=mode]").forEach(
  (input) =>
    (input.onchange = () => {
      config.mode = input.value;
      changeConfig();
    }),
);
document.querySelectorAll("input[name=duration]").forEach(
  (input) =>
    (input.onchange = () => {
      config.duration = Number(input.value);
      changeConfig();
    }),
);
$("LanguageButton").onclick = () => {
  pausePractice();
  $("LanguageSearch").value = "";
  renderLanguages();
  $("LanguageDialog").showModal();
};
$("LanguageSearch").oninput = renderLanguages;
$("LanguageSearch").onkeydown = (event) => {
  if (event.key === "ArrowDown") {
    event.preventDefault();
    $("LanguageList").querySelector("button")?.focus();
  }
  if (
    event.key === "Enter" &&
    $("LanguageList").querySelectorAll("button").length === 1
  )
    $("LanguageList").querySelector("button").click();
};
$("LanguageList").onkeydown = (event) => {
  if (!["ArrowDown", "ArrowUp"].includes(event.key)) return;
  event.preventDefault();
  const choices = [...$("LanguageList").querySelectorAll("button")],
    index = choices.indexOf(document.activeElement);
  choices[
    (index + (event.key === "ArrowDown" ? 1 : -1) + choices.length) %
      choices.length
  ]?.focus();
};
$("ResumeButton").onclick = () => typing.focus({ preventScroll: true });
$("CodeScroll").onclick = () => typing.focus({ preventScroll: true });
typing.onfocus = () => {
  if (session.state === "paused") {
    resume(session, now());
    document.body.classList.add("running");
    timer ||= setInterval(tick, 100);
  }
  typing.setSelectionRange(typing.value.length, typing.value.length);
  updateFocusHint();
  moveCaret();
};
typing.onblur = pausePractice;
typing.addEventListener("input", (event) => {
  if (!event.isComposing) onInput();
});
typing.addEventListener("compositionend", onInput);
typing.addEventListener("keydown", (event) => {
  if (
    [
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Home",
      "End",
      "PageUp",
      "PageDown",
    ].includes(event.key) ||
    ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "a")
  )
    event.preventDefault();
  if (event.key === "Escape") {
    event.preventDefault();
    typing.blur();
    document.body.classList.remove("focus-mode");
    $("FocusButton").setAttribute("aria-pressed", "false");
    $("ResumeButton").focus({ preventScroll: true });
  }
  if (event.key === "Tab" && !event.shiftKey) {
    const whitespace = target.slice(typing.value.length).match(/^[ \t]+/)?.[0];
    if (whitespace) {
      event.preventDefault();
      const insertion = whitespace.startsWith("\t")
        ? "\t"
        : whitespace.slice(0, 4);
      typing.setRangeText(
        insertion,
        typing.value.length,
        typing.value.length,
        "end",
      );
      onInput();
    }
  }
});
for (const type of ["paste", "drop", "cut"])
  typing.addEventListener(type, (event) => {
    event.preventDefault();
    if (type !== "cut")
      notice(
        "This one is for your fingers. Pasting is disabled during practice.",
      );
  });
typing.addEventListener("beforeinput", (event) => {
  if (
    /insertFromPaste|insertFromDrop|insertFromYank|historyUndo|historyRedo/.test(
      event.inputType,
    )
  )
    event.preventDefault();
});
typing.addEventListener("select", () => {
  if (
    typing.selectionStart !== typing.value.length ||
    typing.selectionEnd !== typing.value.length
  )
    typing.setSelectionRange(typing.value.length, typing.value.length);
});
document.addEventListener("keydown", (event) => {
  if (
    (event.ctrlKey || event.metaKey) &&
    event.key === "Enter" &&
    view === "practice" &&
    !document.querySelector("dialog[open]")
  ) {
    event.preventDefault();
    reset(current, true);
  }
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    pausePractice();
    typing.blur();
  }
});
$("RestartButton").onclick = () => reset(current, true);
$("NextButton").onclick = () => reset(undefined, true);
$("FocusButton").onclick = () => {
  const focused = document.body.classList.toggle("focus-mode");
  $("FocusButton").setAttribute("aria-pressed", String(focused));
  typing.focus({ preventScroll: true });
  requestAnimationFrame(moveCaret);
};
$("BookmarkCurrent").onclick = () => toggleSaved(current.id);
$("LibrarySearch").oninput = () => {
  libraryLimit = 24;
  renderLibrary();
};
for (const id of ["LibraryLanguage", "LibraryLevel"])
  $(id).onchange = () => {
    libraryLimit = 24;
    renderLibrary();
  };
$("SavedFilter").onclick = () => {
  savedOnly = !savedOnly;
  libraryLimit = 24;
  $("SavedFilter").setAttribute("aria-pressed", String(savedOnly));
  renderLibrary();
};
$("LoadMore").onclick = () => {
  libraryLimit += 24;
  renderLibrary();
};
$("PractiseSnippet").onclick = () => {
  $("SnippetDialog").close();
  practiseItem(preview);
};
$("ProgressLanguage").onchange = renderProgress;
$("ExportButton").onclick = exportSessions;
for (const id of ["SettingsButton", "FooterSettings"])
  $(id).onclick = openSettings;
document
  .querySelectorAll("dialog [data-close]")
  .forEach((node) => (node.onclick = () => node.closest("dialog").close()));
document.querySelectorAll("dialog").forEach((dialog) =>
  dialog.addEventListener("click", (event) => {
    const rect = dialog.getBoundingClientRect();
    if (
      event.target === dialog &&
      (event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom)
    )
      dialog.close();
  }),
);
document.querySelectorAll("input[name=theme]").forEach((input) => {
  input.checked = input.value === settings.Theme;
  input.onchange = () => {
    settings.Theme = input.value;
    applySettings();
    store("tabstop.settings", settings);
  };
});
if (settings.Accent === "Cyan")
  $("SetAccent").append(new Option("Cyan", "Cyan"));
for (const [id, key] of [
  ["SetAccent", "Accent"],
  ["SetSize", "Size"],
  ["SetMotion", "Motion"],
]) {
  $(id).value = settings[key];
  $(id).onchange = () => {
    settings[key] = id === "SetSize" ? Number($(id).value) : $(id).value;
    applySettings();
    store("tabstop.settings", settings);
  };
}
for (const [id, key] of [
  ["SetSound", "Sound"],
  ["SetStop", "StopOnError"],
]) {
  $(id).checked = Boolean(settings[key]);
  $(id).onchange = () => {
    settings[key] = $(id).checked;
    store("tabstop.settings", settings);
    if (id === "SetSound") beep();
  };
}
$("ResetButton").onclick = () => {
  if (
    !confirm(
      "Clear all saved practice sessions? Your settings and saved snippets will stay.",
    )
  )
    return;
  sessions = [];
  store("tabstop.sessions", sessions);
  updateSummary();
  if (view === "progress") renderProgress();
  notice("Practice history cleared.");
};
window.addEventListener("hashchange", () => showView(location.hash.slice(1)));
window.addEventListener("resize", moveCaret);
motionQuery.addEventListener("change", applySettings);
document.fonts.ready.then(moveCaret);
refreshControls();
reset();
updateSummary();
showView(location.hash.slice(1) || "practice");
if (!storageOk)
  notice("Browser storage is unavailable. You can still practise this visit.");
