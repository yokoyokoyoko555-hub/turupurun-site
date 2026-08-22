const express = require("express");
const path = require("path");
const contactHandler = require("./api/contact");

const app = express();
const rootDir = __dirname;
const port = Number(process.env.PORT) || 3000;
const publicPages = new Set([
  "index",
  "trading",
  "systems",
  "privacy",
  "imailuka",
  "confirm",
  "franchise",
]);

app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use((req, res, next) => {
  res.set({
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  });

  if (req.hostname === "www.turupurun.com") {
    return res.redirect(308, `https://turupurun.com${req.originalUrl}`);
  }

  next();
});

app.use(express.json({ limit: "100kb" }));

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

app.all("/api/contact", contactHandler);

app.use(
  "/assets",
  express.static(path.join(rootDir, "assets"), {
    fallthrough: false,
    immutable: false,
    maxAge: "1d",
  }),
);

app.get("/common.css", (_req, res) => {
  res.sendFile(path.join(rootDir, "common.css"));
});

app.get(["/robots.txt", "/sitemap.xml"], (req, res) => {
  res.sendFile(path.join(rootDir, req.path.slice(1)));
});

function sendPage(res, pageName) {
  res.set("Cache-Control", "no-cache");
  res.sendFile(path.join(rootDir, `${pageName}.html`));
}

// RailwayではフランチャイズLPをドメイン直下で公開する。
app.get("/", (_req, res) => sendPage(res, "franchise"));

app.get("/:page", (req, res, next) => {
  const requestedPage = req.params.page.replace(/\.html$/i, "");

  if (!publicPages.has(requestedPage)) {
    return next();
  }

  return sendPage(res, requestedPage);
});

app.use((error, _req, res, next) => {
  if (error instanceof SyntaxError && "body" in error) {
    return res.status(400).json({
      ok: false,
      message: "送信内容を読み取れませんでした。",
    });
  }

  return next(error);
});

app.use((_req, res) => {
  res.status(404).type("text/plain; charset=utf-8").send("404 Not Found");
});

app.listen(port, "0.0.0.0", () => {
  console.log(`TURUPURUN site listening on port ${port}`);
});
