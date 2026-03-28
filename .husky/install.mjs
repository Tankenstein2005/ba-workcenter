import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gitExePath = "C:\\Program Files\\Git\\cmd\\git.exe";
const hooksDir = path.join(__dirname, "_");
const huskyShimSource = path.join(
  process.cwd(),
  "node_modules",
  "husky",
  "husky",
);
const hookNames = ["pre-commit"];

if (!existsSync(path.join(process.cwd(), ".git"))) {
  process.exit(0);
}

if (!existsSync(gitExePath)) {
  console.warn(`Git executable not found at ${gitExePath}`);
  process.exit(0);
}

execFileSync(gitExePath, ["config", "core.hooksPath", ".husky/_"], {
  cwd: process.cwd(),
  stdio: "ignore",
});

mkdirSync(hooksDir, { recursive: true });
writeFileSync(path.join(hooksDir, ".gitignore"), "*\n");
copyFileSync(huskyShimSource, path.join(hooksDir, "h"));

for (const hookName of hookNames) {
  writeFileSync(
    path.join(hooksDir, hookName),
    '#!/usr/bin/env sh\n. "$(dirname "$0")/h"\n',
    { mode: 0o755 },
  );
}
