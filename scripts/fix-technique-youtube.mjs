import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(__dirname, "..", "app", "data", "techniques.ts");

const STAND = [
  "0WjN8iuRk3o",
  "tgIXxV6Ax1o",
  "8wsjp47yR5w",
  "mJIVHZUGw40",
  "UWod5OtL9ME",
  "Mwy4wivg7Q0",
  "9SFHFIjSKsU",
  "1d1-MshrzQI",
  "RzSbYD6RuTk",
];
const GUARD = [
  "MEqGy5-XINg",
  "2LEW823VWA8",
  "3HiTG1OOKAI",
  "ZnjNGoM_Iwo",
  "YabK3X1bnZs",
  "4ejQO_ehtPw",
  "G0GUobdo9OA",
  "goWtrxH64nk",
];
const PASS = [
  "ODuQCA88oY4",
  "isv_6Hd1Iac",
  "T4C4oPpwOSU",
  "734smcLl3sM",
  "9Rqy7e3J620",
  "xXZo1v74gm0",
  "RJsyUR4ouuM",
  "F5QOctE5fsY",
];
const SIDE = [
  "8F6meOljv-s",
  "MEqGy5-XINg",
  "YabK3X1bnZs",
  "goWtrxH64nk",
  "2LEW823VWA8",
  "ZnjNGoM_Iwo",
  "4ejQO_ehtPw",
  "G0GUobdo9OA",
];
const MOUNT = [
  "C1dKaS19PEg",
  "gYmqLut1VN0",
  "JL3ii1RVcEQ",
  "r8iDzH9UwgY",
  "UtHOOyEPbeI",
  "mmnd5qpANlg",
  "BUW4STY1NEA",
  "-qfzOwgwZsg",
];
const BACK = [
  "V6LFkdeSox0",
  "ODuQCA88oY4",
  "isv_6Hd1Iac",
  "T4C4oPpwOSU",
  "734smcLl3sM",
  "9Rqy7e3J620",
  "xXZo1v74gm0",
  "RJsyUR4ouuM",
];
const TURTLE = [
  "jNC34nzjpOg",
  "8wsjp47yR5w",
  "mJIVHZUGw40",
  "UWod5OtL9ME",
  "Mwy4wivg7Q0",
  "9SFHFIjSKsU",
  "1d1-MshrzQI",
  "RzSbYD6RuTk",
];
const SUB = [
  "C1dKaS19PEg",
  "gYmqLut1VN0",
  "JL3ii1RVcEQ",
  "V6LFkdeSox0",
  "MEqGy5-XINg",
  "3HiTG1OOKAI",
  "F5QOctE5fsY",
  "UtHOOyEPbeI",
];

const POSITION_POOL = {
  "Takedowns & Standing": STAND,
  "Guard Work": GUARD,
  "Guard Passing": PASS,
  "Side Control": SIDE,
  Mount: MOUNT,
  "Back / Rear Mount": BACK,
  "Turtle & Leg Entanglements": TURTLE,
  Submissions: SUB,
};

let text = fs.readFileSync(file, "utf8");

/** Remove old YT block; insert video() helper after POSITION_TABS */
const ytBlock =
  /\/\*\* Curated direct YouTube[\s\S]*?\} as const;\r?\n\r?\nexport const TECHNIQUES/;
const videoHelper = `function video(id: string) {
  return \`https://www.youtube.com/watch?v=\${id}\`;
}

export const TECHNIQUES`;
if (!ytBlock.test(text)) {
  console.error("Could not find YT block to replace");
  process.exit(1);
}
text = text.replace(ytBlock, videoHelper);

const lines = text.split("\n");
const counts = Object.fromEntries(Object.keys(POSITION_POOL).map((k) => [k, 0]));

for (let i = 0; i < lines.length; i++) {
  const posMatch = lines[i].match(/position: "([^"]+)"/);
  if (posMatch) {
    const pos = posMatch[1];
    if (POSITION_POOL[pos]) {
      for (let j = i; j < Math.min(i + 80, lines.length); j++) {
        const y = lines[j].match(/^\s*youtubeUrl:\s*(.+),?\s*$/);
        if (y) {
          const pool = POSITION_POOL[pos];
          const id = pool[counts[pos] % pool.length];
          counts[pos]++;
          lines[j] = lines[j].replace(/\s*youtubeUrl:\s*.+/, `    youtubeUrl: video("${id}"),`);
          break;
        }
      }
    }
  }
}

text = lines.join("\n");
text = text.replace(/LINKS\.\w+/g, (m) => {
  console.error("Unexpected LINKS ref:", m);
  process.exit(1);
});

fs.writeFileSync(file, text);
console.log("Updated youtubeUrl lines per position:", counts);
