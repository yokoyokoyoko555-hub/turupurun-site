const fs = require("fs");
const path = require("path");

const rootDir = path.join(__dirname, "..");
const targets = [
  ["railway.json", "npm run start:franchise"],
  ["railway.toreca-dx.json", "npm run start:toreca-dx"],
];

for (const [fileName, expectedCommand] of targets) {
  const config = JSON.parse(fs.readFileSync(path.join(rootDir, fileName), "utf8"));
  const actualCommand = config.deploy?.startCommand;

  if (actualCommand !== expectedCommand) {
    throw new Error(
      `${fileName}: startCommand must be "${expectedCommand}" (found "${actualCommand}")`,
    );
  }

  if (actualCommand.includes("corporate")) {
    throw new Error(`${fileName}: corporate site must not be deployed on Railway`);
  }
}

console.log("Deployment target check passed.");
