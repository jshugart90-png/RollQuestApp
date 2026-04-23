import fs from "fs";
import path from "path";

const root = process.cwd();
const curriculumDir = path.join(root, "app", "data", "curriculum");

const targets = [
  { belt: "purple", file: "core.purple.ts", constName: "Core_PURPLE_TECHNIQUES" },
  { belt: "brown", file: "core.brown.ts", constName: "Core_BROWN_TECHNIQUES" },
];

function splitObjects(text) {
  const objs = [];
  let i = 0;
  while (i < text.length) {
    const open = text.indexOf("{", i);
    if (open === -1) break;
    let depth = 0;
    let inString = false;
    let escaped = false;
    let j = open;
    for (; j < text.length; j++) {
      const ch = text[j];
      if (inString) {
        if (escaped) escaped = false;
        else if (ch === "\\") escaped = true;
        else if (ch === '"') inString = false;
        continue;
      }
      if (ch === '"') { inString = true; continue; }
      if (ch === "{") depth++;
      if (ch === "}") {
        depth--;
        if (depth === 0) {
          objs.push(text.slice(open, j + 1));
          i = j + 1;
          break;
        }
      }
    }
    if (j >= text.length) throw new Error("Unbalanced object parsing");
  }
  return objs;
}

function posSlug(pos) {
  return pos.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function toConstBase(slug) {
  return slug.toUpperCase().replace(/-/g, "_");
}

for (const t of targets) {
  const full = path.join(curriculumDir, t.file);
  const src = fs.readFileSync(full, "utf8");

  const startMarker = `export const ${t.constName}: Technique[] = [`;
  const start = src.indexOf(startMarker);
  if (start === -1) throw new Error(`Cannot find array in ${t.file}`);
  const end = src.lastIndexOf("\n];");
  if (end === -1 || end <= start) throw new Error(`Cannot find array end in ${t.file}`);

  const body = src.slice(start + startMarker.length, end);
  const objs = splitObjects(body)
    .map((o) => o.trim())
    .filter((o) => o.includes(`belt: \"${t.belt}\"`));

  const byPosition = new Map();
  for (const o of objs) {
    const m = o.match(/position:\s+\"([^\"]+)\"/);
    if (!m) continue;
    const p = m[1];
    if (!byPosition.has(p)) byPosition.set(p, []);
    byPosition.get(p).push(o);
  }

  const outSubDir = path.join(curriculumDir, "core", t.belt);
  fs.mkdirSync(outSubDir, { recursive: true });

  const imports = [];
  const spreads = [];

  for (const [position, list] of byPosition.entries()) {
    const slug = posSlug(position);
    const constName = `${t.constName}_${toConstBase(slug)}`;
    imports.push(`import { ${constName} } from "./core/${t.belt}/${slug}";`);
    spreads.push(`  ...${constName},`);

    const positionFile = `import type { Technique } from "../../index";

function video(id: string) {
  return \`https://www.youtube.com/watch?v=\${id}\`;
}

/**
 * Core ${t.belt} belt - ${position}
 */
export const ${constName}: Technique[] = [
${list.map((o) => `  ${o.replace(/\n/g, "\n  ")}`).join(",\n\n")}
];
`;

    fs.writeFileSync(path.join(outSubDir, `${slug}.ts`), positionFile, "utf8");
  }

  const refactored = `${imports.join("\n")}

/**
 * Core ${t.belt[0].toUpperCase() + t.belt.slice(1)} Belt core curriculum.
 * Split by position for easier maintenance and gym-specific extension.
 */
export const ${t.constName} = [
${spreads.join("\n")}
];
`;

  fs.writeFileSync(full, refactored, "utf8");
  console.log(`Refactored ${t.file} into ${byPosition.size} position modules.`);
}
