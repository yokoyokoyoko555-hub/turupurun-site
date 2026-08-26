const express = require("express");
const path = require("path");

const app = express();
const rootDir = __dirname;
const port = Number(process.env.PORT) || 3000;

app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use((req, res, next) => {
  res.set({
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  });

  next();
});

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true, site: "franchise" });
});

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

app.get("/robots.txt", (_req, res) => {
  res
    .type("text/plain; charset=utf-8")
    .send(
      "User-agent: *\nAllow: /\n\nSitemap: https://franchise.torecabinks.com/sitemap.xml\n",
    );
});

app.get("/sitemap.xml", (_req, res) => {
  res.type("application/xml; charset=utf-8").send(
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
      "  <url>\n" +
      "    <loc>https://franchise.torecabinks.com/</loc>\n" +
      "    <priority>1.0</priority>\n" +
      "  </url>\n" +
      "</urlset>\n",
  );
});

function sendPage(res, pageName) {
  res.set("Cache-Control", "no-cache");
  res.sendFile(path.join(rootDir, `${pageName}.html`));
}

// このRailwayサービスではフランチャイズLPだけを公開する。
app.get("/", (_req, res) => sendPage(res, "franchise"));
app.get(["/franchise", "/franchise.html"], (_req, res) =>
  sendPage(res, "franchise"),
);

app.use((_req, res) => {
  res.status(404).type("text/plain; charset=utf-8").send("404 Not Found");
});

app.listen(port, "0.0.0.0", () => {
  console.log(`TURUPURUN site listening on port ${port}`);
});
