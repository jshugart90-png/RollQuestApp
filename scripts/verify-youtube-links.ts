/**
 * Verifies curriculum youtubeUrl values resolve via YouTube oEmbed (public/embeddable).
 * Run from repo root: npm run verify:videos
 */
import { ALL_TECHNIQUES } from "../app/data/curriculum/index";
import { canonicalYoutubeWatchUrl } from "../app/utils/youtubeVideoUrl";

type CheckResult =
  | { ok: true; title: string }
  | { ok: false; status: number; detail: string };

function oembedUrl(watchUrl: string): string {
  return `https://www.youtube.com/oembed?url=${encodeURIComponent(
    watchUrl
  )}&format=json`;
}

async function checkUrl(watchUrl: string): Promise<CheckResult> {
  const canonical = canonicalYoutubeWatchUrl(watchUrl);
  if (!canonical) {
    return {
      ok: false,
      status: 0,
      detail: "Could not parse a valid 11-char video id from URL",
    };
  }
  const res = await fetch(oembedUrl(canonical), {
    headers: { "User-Agent": "RollQuest-curriculum-link-check/1.0" },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return {
      ok: false,
      status: res.status,
      detail: text.slice(0, 200) || res.statusText,
    };
  }
  const data = (await res.json()) as { title?: string };
  return { ok: true, title: data.title ?? "(no title)" };
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const byUrl = new Map<string, typeof ALL_TECHNIQUES>();
  for (const t of ALL_TECHNIQUES) {
    const u = t.youtubeUrl?.trim() ?? "";
    if (!byUrl.has(u)) byUrl.set(u, []);
    byUrl.get(u)!.push(t);
  }

  const noUrl = byUrl.get("") ?? [];
  if (noUrl.length) {
    byUrl.delete("");
  }

  const uniqueUrls = [...byUrl.keys()].sort();
  const urlResults = new Map<string, CheckResult>();

  console.log(
    `Techniques: ${ALL_TECHNIQUES.length} | Unique non-empty youtubeUrl: ${uniqueUrls.length}` +
      (noUrl.length ? ` | No URL (skipped): ${noUrl.length}` : "") +
      "\n"
  );

  let i = 0;
  for (const url of uniqueUrls) {
    i++;
    process.stdout.write(`\r[oEmbed ${i}/${uniqueUrls.length}]`);
    const result = await checkUrl(url);
    urlResults.set(url, result);
    await sleep(120);
  }
  console.log("\n");

  const failures: {
    url: string;
    result: Extract<CheckResult, { ok: false }>;
    techniques: typeof ALL_TECHNIQUES;
  }[] = [];

  const okRows: { url: string; title: string; count: number }[] = [];

  for (const url of uniqueUrls) {
    const r = urlResults.get(url)!;
    if (!r.ok) failures.push({ url, result: r, techniques: byUrl.get(url)! });
    else okRows.push({ url, title: r.title, count: byUrl.get(url)!.length });
  }

  const okCount = uniqueUrls.length - failures.length;
  console.log(`Unique URLs OK: ${okCount}  FAIL: ${failures.length}\n`);

  if (okRows.length) {
    console.log("--- OK (sanity-check oEmbed titles vs curriculum intent) ---\n");
    okRows.sort((a, b) => a.url.localeCompare(b.url));
    for (const row of okRows) {
      console.log(`×${row.count}  ${row.url}`);
      console.log(`     “${row.title}”\n`);
    }
  }

  if (failures.length) {
    console.log("--- Failures ---\n");
    for (const { url, result, techniques } of failures) {
      console.log(`URL: ${url || "(empty)"}`);
      console.log(`  HTTP/status: ${result.status}  ${result.detail}`);
      for (const t of techniques) {
        console.log(`  - [${t.belt}] ${t.id} — ${t.name}`);
      }
      console.log("");
    }
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
