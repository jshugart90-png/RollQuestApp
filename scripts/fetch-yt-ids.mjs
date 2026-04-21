import https from "https";

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(
      url,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9",
        },
      },
      (res) => {
        let d = "";
        res.on("data", (c) => (d += c));
        res.on("end", () => resolve(d));
      }
    ).on("error", reject);
  });
}

const queries = [
  "chewjitsu double leg",
  "gracie university closed guard",
  "john danaher guard passing",
  "bernard faria mount",
  "lachlan giles half guard",
  "marcelo garcia butterfly sweep",
  "bjj turtle attack",
  "bjj leg drag pass",
];

for (const q of queries) {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
  const html = await get(url);
  const ids = [...html.matchAll(/"videoId":"([\w-]{11})"/g)].map((m) => m[1]);
  const uniq = [...new Set(ids)].slice(0, 8);
  console.log("\n#", q);
  console.log(uniq.join("\n"));
}
