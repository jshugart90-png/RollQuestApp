/**
 * Pull --rebase from origin + push (no add/commit). Same branch as HEAD.
 *   npm run sync:github
 */
import { execSync } from "node:child_process";

const branch = execSync("git branch --show-current", { encoding: "utf8", shell: true }).trim();
if (!branch) {
  console.error("sync-github: not on a named branch.");
  process.exit(1);
}
execSync(`git pull --rebase origin ${branch}`, { stdio: "inherit", shell: true });
execSync(`git push origin ${branch}`, { stdio: "inherit", shell: true });
console.log(`sync-github: done (branch ${branch}).`);
