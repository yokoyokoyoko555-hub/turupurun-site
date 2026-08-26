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
  res.status(200).json({ ok: true, site: "toreca-dx" });
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

function sendPage(res) {
  res.set("Cache-Control", "no-cache");
  res.sendFile(path.join(rootDir, "toreca-dx.html"));
}

app.get("/", (_req, res) => sendPage(res));
app.get(["/toreca-dx", "/toreca-dx.html"], (_req, res) => sendPage(res));

app.use((_req, res) => {
  res.status(404).type("text/plain; charset=utf-8").send("404 Not Found");
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Toreca DX LP listening on port ${port}`);
});
