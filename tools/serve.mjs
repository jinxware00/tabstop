import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { watch } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const port = Number(process.env.PORT || 5173);
const clients = new Set();
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".woff2": "font/woff2",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};
const reload =
  '<script>new EventSource("/__reload").onmessage=()=>location.reload()</script>';
const server = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(
      new URL(req.url, "http://localhost").pathname,
    );
    if (pathname === "/__reload") {
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });
      res.write(": connected\n\n");
      clients.add(res);
      req.on("close", () => clients.delete(res));
      return;
    }
    if (
      pathname
        .split("/")
        .some((part) => part.startsWith(".") || part === "node_modules")
    )
      throw new Error("Not found");
    const file = path.resolve(
      root,
      "." + (pathname === "/" ? "/index.html" : pathname),
    );
    if (!file.startsWith(root) || !(await stat(file)).isFile())
      throw new Error("Not found");
    let body = await readFile(file);
    if (file.endsWith(".html"))
      body = Buffer.from(
        body.toString().replace("</body>", reload + "</body>"),
      );
    res.writeHead(200, {
      "Content-Type": types[path.extname(file)] || "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
});
let timer;
watch(root, { recursive: true }, (_, name) => {
  if (
    !name ||
    name
      .split(/[\\/]/)
      .some(
        (part) =>
          part.startsWith(".") ||
          ["node_modules", "test-results", "tests", "tools"].includes(part),
      )
  )
    return;
  clearTimeout(timer);
  timer = setTimeout(
    () => clients.forEach((client) => client.write("data: reload\n\n")),
    150,
  );
});
server.listen(port, "127.0.0.1", () =>
  console.log(
    `Tabstop is ready: http://localhost:${port}\nSaved changes reload the preview automatically.`,
  ),
);
