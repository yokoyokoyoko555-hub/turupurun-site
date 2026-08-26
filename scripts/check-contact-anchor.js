const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corporate = fs.readFileSync(path.join(root, "index.html"), "utf8");
const franchise = fs.readFileSync(path.join(root, "franchise.html"), "utf8");
const errors = [];

if (!/<[^>]+\bid=["']contact["'][^>]*>/i.test(corporate)) {
  errors.push('Corporate site is missing the anchor target id="contact".');
}

if (!corporate.includes("function scrollToCurrentHash()")) {
  errors.push("Corporate site is missing the post-render hash scroll handler.");
}

if (!corporate.includes("${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}")) {
  errors.push("Language switching does not preserve the URL hash.");
}

if (franchise.includes("?scroll=contact#contact")) {
  errors.push("Legacy contact query URL remains in franchise.html.");
}

const corporateContactLinks = franchise.match(/https:\/\/www\.turupurun\.com\/#contact/g) || [];
if (corporateContactLinks.length === 0) {
  errors.push("Franchise LP has no link to the corporate contact anchor.");
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log(`Contact anchor check passed (${corporateContactLinks.length} franchise links).`);
