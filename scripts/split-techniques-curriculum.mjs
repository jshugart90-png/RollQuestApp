import fs from "fs";
import path from "path";

const root = process.cwd();
const srcPath = path.join(root, "app", "data", "techniques.ts");
const outDir = path.join(root, "app", "data", "curriculum");

const src = fs.readFileSync(srcPath, "utf8");

const startMarker = "export const TECHNIQUES: Technique[] = [";
const endMarker = "\n];\n\nexport function getTechniqueById";
const start = src.indexOf(startMarker);
const end = src.indexOf(endMarker);
if (start === -1 || end === -1) {
  throw new Error("Could not find TECHNIQUES array boundaries");
}

const body = src.slice(start + startMarker.length, end);

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
        if (escaped) {
          escaped = false;
        } else if (ch === "\\") {
          escaped = true;
        } else if (ch === '"') {
          inString = false;
        }
        continue;
      }

      if (ch === '"') {
        inString = true;
        continue;
      }
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

    if (j >= text.length) {
      throw new Error("Unbalanced object braces while splitting techniques");
    }
  }
  return objs;
}

const objects = splitObjects(body)
  .filter((chunk) => chunk.includes('id: "') && chunk.includes('belt: "'))
  .map((chunk) => chunk.trim())
  .map((chunk) => `  ${chunk.replace(/\n/g, "\n  ")}`);

const white = objects.filter((o) => o.includes('belt: "white"'));
const blue = objects.filter((o) => o.includes('belt: "blue"'));

const whiteFile = `import type { Technique } from "./index";

function video(id: string) {
  return \`https://www.youtube.com/watch?v=\${id}\`;
}

/**
 * Core White Belt core curriculum.
 * Kept separate for maintainability and gym-specific extensions.
 */
export const Core_WHITE_TECHNIQUES: Technique[] = [
${white.join(",\n\n")}
];
`;

const blueFile = `import type { Technique } from "./index";

function video(id: string) {
  return \`https://www.youtube.com/watch?v=\${id}\`;
}

/**
 * Core Blue Belt core curriculum.
 * Kept separate for maintainability and gym-specific extensions.
 */
export const Core_BLUE_TECHNIQUES: Technique[] = [
${blue.join(",\n\n")}
];
`;

const indexFile = `import { Core_WHITE_TECHNIQUES } from "./core.white";
import { Core_BLUE_TECHNIQUES } from "./core.blue";

export type PositionTab =
  | "Takedowns & Standing"
  | "Guard Work"
  | "Guard Passing"
  | "Side Control"
  | "Mount"
  | "Back / Rear Mount"
  | "Turtle & Leg Entanglements"
  | "Submissions"
  | "Self Defense"
  | "Escapes";

export type Technique = {
  id: string;
  name: string;
  belt: "white" | "blue";
  position: PositionTab;
  category: string;
  shortDescription: string;
  fullStepByStep: string[];
  tips: string[];
  commonMistakes: string[];
  youtubeUrl: string;
  difficulty: "beginner" | "intermediate";
  curriculum: {
    sourceGym: string;
    track: string;
    isMasterLibrary: boolean;
    tags: string[];
  };
};

export type TechniqueOverride = Partial<Omit<Technique, "id">>;
export type GymTechniqueOverrides = Record<string, TechniqueOverride>;

export const POSITION_TABS: PositionTab[] = [
  "Takedowns & Standing",
  "Guard Work",
  "Guard Passing",
  "Side Control",
  "Mount",
  "Back / Rear Mount",
  "Turtle & Leg Entanglements",
  "Submissions",
  "Self Defense",
  "Escapes",
];

/**
 * Apply gym-specific customizations while preserving master IDs.
 */
export function applyGymOverrides(
  techniques: Technique[],
  overrides?: GymTechniqueOverrides
): Technique[] {
  if (!overrides) return techniques;
  return techniques.map((tech) => ({ ...tech, ...(overrides[tech.id] ?? {}) }));
}

/**
 * Backward-compatible combined export used by existing screens and stores.
 */
export const TECHNIQUES: Technique[] = [
  ...Core_WHITE_TECHNIQUES,
  ...Core_BLUE_TECHNIQUES,
];

export function getTechniqueById(id: string): Technique | undefined {
  return TECHNIQUES.find((technique) => technique.id === id);
}

export {
  Core_WHITE_TECHNIQUES,
  Core_BLUE_TECHNIQUES,
};
`;

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "core.white.ts"), whiteFile);
fs.writeFileSync(path.join(outDir, "core.blue.ts"), blueFile);
fs.writeFileSync(path.join(outDir, "index.ts"), indexFile);

const compatibility = `/**
 * Compatibility re-export.
 * Existing imports from app/data/techniques continue to work.
 */
export * from "./curriculum";
`;
fs.writeFileSync(srcPath, compatibility);

console.log(`Split complete: white=${white.length}, blue=${blue.length}`);
