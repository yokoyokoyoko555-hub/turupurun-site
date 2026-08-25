const fs = require("fs");
const path = require("path");

const project = process.argv[2];
const rootDir = path.resolve(__dirname, "..");
const outputRoot = path.join(rootDir, "dist");
const outputDir = path.join(outputRoot, project || "");

if (!new Set(["corporate", "franchise"]).has(project)) {
  console.error("Usage: node scripts/build-cloudflare.js <corporate|franchise>");
  process.exit(1);
}

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });

function copyFile(sourceName, destinationName = sourceName) {
  const source = path.join(rootDir, sourceName);
  const destination = path.join(outputDir, destinationName);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
}

function copyDirectory(sourceName, destinationName = sourceName) {
  fs.cpSync(path.join(rootDir, sourceName), path.join(outputDir, destinationName), {
    recursive: true,
  });
}

function writeFile(destinationName, contents) {
  fs.writeFileSync(path.join(outputDir, destinationName), contents, "utf8");
}

copyFile("common.css");
copyDirectory("assets");

if (project === "franchise") {
  copyFile("franchise.html", "index.html");
  writeFile(
    "robots.txt",
    "User-agent: *\nAllow: /\n\nSitemap: https://franchise.torecabinks.com/sitemap.xml\n",
  );
  writeFile(
    "sitemap.xml",
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
      "  <url><loc>https://franchise.torecabinks.com/</loc><priority>1.0</priority></url>\n" +
      "</urlset>\n",
  );
  writeFile(
    "_routes.json",
    JSON.stringify({ version: 1, include: ["/*"], exclude: ["/*"] }, null, 2) +
      "\n",
  );
} else {
  for (const page of [
    "index.html",
    "trading.html",
    "systems.html",
    "toreca-dx.html",
    "privacy.html",
    "imailuka.html",
    "confirm.html",
  ]) {
    copyFile(page);
  }
  copyFile("robots.txt");
  copyFile("sitemap.xml");
  writeFile(
    "_routes.json",
    JSON.stringify({ version: 1, include: ["/api/*"], exclude: [] }, null, 2) +
      "\n",
  );
}

console.log(`Built Cloudflare ${project} site at ${outputDir}`);
