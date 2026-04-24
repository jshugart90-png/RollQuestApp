/**
 * One-shot: stage everything → commit (if needed) → pull --rebase → push.
 *
 *   npm run save:github
 *   npm run save:github -- "fix: library search"
 *   set SAVE_MSG=fix: thing & npm run save:github   (cmd.exe)
 *   $env:SAVE_MSG="fix: thing"; npm run save:github (PowerShell)
 *
 * Commits only when there are staged changes after `git add -A`.
 * Uses your current branch (not hardcoded to master).
 */
import { execSync } from "node:child_process";

function run(cmd) {
  execSync(cmd, { stdio: "inherit", shell: true });
}

function shQuiet(cmd) {
  return execSync(cmd, { encoding: "utf8", shell: true }).trim();
}

const branch = shQuiet("git branch --show-current");
if (!branch) {
  console.error("save-to-github: not a git branch (detached HEAD?).");
  process.exit(1);
}

run("git add -A");

let hasStagedChanges = false;
try {
  execSync("git diff --cached --quiet", { stdio: "pipe", shell: true });
} catch {
  hasStagedChanges = true;
}

if (hasStagedChanges) {
  const fromArgs = process.argv.slice(2).join(" ").trim();
  const msg = process.env.SAVE_MSG?.trim() || fromArgs || "chore: save to GitHub";
  run(`git commit -m ${JSON.stringify(msg)}`);
} else {
  console.log("save-to-github: nothing new to commit; continuing with pull + push.");
}

run(`git pull --rebase origin ${branch}`);
run(`git push origin ${branch}`);
console.log(`save-to-github: done (branch ${branch}).`);
