#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const DEFAULT_FO_DIR = "/home/auke/git/slonl/curriculum-utils/editor/curriculum-fo";

const args = parseArgs(process.argv.slice(2));
const repo = args["fo-repo"] ?? DEFAULT_FO_DIR;
const dataDir = args["data-dir"] ?? path.join(repo, "data");
const limit = Number(args.limit ?? 25);
const minScore = Number(args["min-score"] ?? 0.35);
const format = args.format ?? "markdown";
const noGit = Boolean(args["no-git"]);
const historyRows = Number(args["history-rows"] ?? Math.min(limit, 12));
const typeFilter = args.types
  ? new Set(String(args.types).split(",").map((value) => value.trim()).filter(Boolean))
  : null;
const excludeGeneric = Boolean(args["exclude-generic"]);

const activeFiles = {
  fo_set: "sets.json",
  fo_domein: "domeinen.json",
  fo_subdomein: "subdomeinen.json",
  fo_kernzin: "kernzinnen.json",
  fo_doelzin: "doelzinnen.json",
  fo_uitwerking: "uitwerkingen.json",
  fo_illustratie: "illustraties.json",
};

const childKeys = [
  "fo_domein_id",
  "fo_subdomein_id",
  "fo_kernzin_id",
  "fo_doelzin_id",
  "fo_uitwerking_id",
  "fo_illustratie_id",
];

const stopWords = new Set([
  "aan", "als", "andere", "bij", "concept", "de", "domein", "een", "en",
  "fo", "gaat", "havo", "het", "hierbij", "in", "is", "kan", "kerndoel",
  "leerling", "literatuur", "met", "nederlandse", "nederlands", "of", "om",
  "op", "school", "subdomein", "taal", "te", "teksten", "tot", "van",
  "voor", "wordt", "zijn",
]);

main();

function main() {
  const activeRows = [];
  const activeByType = new Map();
  for (const [type, file] of Object.entries(activeFiles)) {
    const rows = readJson(path.join(dataDir, file)).map((row) => ({ ...row, _type: type }));
    activeByType.set(type, rows);
    activeRows.push(...rows);
  }
  const deprecatedRows = readJson(path.join(dataDir, "deprecated.json"))
    .map((row) => ({ ...row, _type: row.types?.[0] ?? "unknown" }));

  const activeById = new Map(activeRows.map((row) => [row.id, row]));
  const deprecatedById = new Map(deprecatedRows.map((row) => [row.id, row]));
  const activeParentIndex = buildParentIndex(activeRows);
  const deprecatedParentIndex = buildParentIndex(deprecatedRows);
  const activeContextCache = new Map();
  const deprecatedContextCache = new Map();

  const activeRoots = activeByType.get("fo_set").filter(isNederlandsRoot);
  const deprecatedRoots = deprecatedRows
    .filter((row) => (row.types ?? []).includes("fo_set"))
    .filter(isNederlandsRoot);

  const activeSubgraph = collectDescendants(activeRoots.map((row) => row.id), activeById);
  const deprecatedSubgraph = collectDescendants(deprecatedRoots.map((row) => row.id), deprecatedById);

  const activeCandidatePool = activeSubgraph.filter(inIncludedType).filter(notExcludedGeneric);
  const activeCandidatesByType = groupBy(activeCandidatePool, (row) => row._type);
  const missingOld = deprecatedSubgraph
    .filter(isUsableMissingOld)
    .filter(inIncludedType)
    .filter(notExcludedGeneric);

  const gitCache = new Map();
  const queue = [];
  for (const old of missingOld) {
    const candidates = activeCandidatesByType.get(old._type) ?? [];
    if (!candidates.length) continue;

    const oldContext = contextFor(old.id, deprecatedParentIndex, deprecatedContextCache);
    const preliminary = candidates
      .filter((candidate) => candidate.id !== old.id)
      .map((candidate) => {
        const candidateContext = contextFor(candidate.id, activeParentIndex, activeContextCache);
        const text = textScore(old, candidate);
        const graph = graphScore(oldContext, candidateContext);
        const link = linkScore(old, candidate);
        const total = text.total + graph.total + link.total;
        return {
          candidate,
          context: candidateContext,
          history: { commits: [], error: "" },
          scores: {
            total: round(total),
            text: text,
            graph: graph,
            link: link,
            timing: { total: 0, kind: noGit ? "disabled" : "not-checked" },
          },
        };
      })
      .sort((a, b) => b.scores.total - a.scores.total)
      .slice(0, 12);

    if (!preliminary.length || preliminary[0].scores.total < minScore) continue;

    queue.push({
      old,
      oldContext,
      oldHistory: { commits: [], error: "" },
      best: preliminary[0],
      alternatives: preliminary.slice(1, 5),
      classification: classify(old, preliminary.slice(0, 5)),
    });
  }

  const preliminaryQueue = queue.sort((a, b) => b.best.scores.total - a.best.scores.total);
  const enrichedQueue = noGit
    ? preliminaryQueue
    : preliminaryQueue.slice(0, historyRows).map((item) => enrichWithGit(item, gitCache));
  enrichedQueue.sort((a, b) => b.best.scores.total - a.best.scores.total);
  const output = enrichedQueue.slice(0, limit);
  if (format === "json") {
    console.log(JSON.stringify({
      metadata: metadata(activeRoots, deprecatedRoots, activeSubgraph, deprecatedSubgraph, missingOld, preliminaryQueue, enrichedQueue),
      results: output.map(toJsonResult),
    }, null, 2));
  } else {
    printMarkdown(metadata(activeRoots, deprecatedRoots, activeSubgraph, deprecatedSubgraph, missingOld, preliminaryQueue, enrichedQueue), output);
  }
}

function enrichWithGit(item, gitCache) {
  const oldHistory = gitHistory(item.old.id, gitCache);
  const ranked = [item.best, ...item.alternatives]
    .map((candidateItem) => {
      const candidateHistory = gitHistory(candidateItem.candidate.id, gitCache);
      const timing = timingScore(oldHistory, candidateHistory);
      const total = candidateItem.scores.text.total +
        candidateItem.scores.graph.total +
        candidateItem.scores.link.total +
        timing.total;
      return {
        ...candidateItem,
        history: candidateHistory,
        scores: {
          ...candidateItem.scores,
          total: round(total),
          timing,
        },
      };
    })
    .sort((a, b) => b.scores.total - a.scores.total);
  return {
    ...item,
    oldHistory,
    best: ranked[0],
    alternatives: ranked.slice(1),
    classification: classify(item.old, ranked),
  };
}

function parseArgs(argv) {
  const parsed = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith("--")) continue;
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      parsed[key] = true;
    } else {
      parsed[key] = next;
      i++;
    }
  }
  return parsed;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function isNederlandsRoot(row) {
  const haystack = `${row.title ?? ""} ${row.description ?? ""}`;
  return /nederlands|nederlandse taal/i.test(haystack) && !/gebarentaal/i.test(haystack);
}

function isUsableMissingOld(row) {
  const noReplacement = !Array.isArray(row.replacedBy) || row.replacedBy.length === 0;
  const usable = normalize(textBlob(row)).length > 20;
  const notDelete = normalize(row.prefix) !== "delete" && !/^delete\b/.test(normalize(row.title));
  return noReplacement && usable && notDelete;
}

function inIncludedType(row) {
  return !typeFilter || typeFilter.has(row._type);
}

function notExcludedGeneric(row) {
  return !excludeGeneric || !isGeneric(row);
}

function isGeneric(row) {
  return ["het gaat hierbij om", "te denken valt aan"].includes(normalize(row.title));
}

function collectDescendants(rootIds, byId) {
  const seen = new Set();
  const out = [];
  const queue = [...rootIds];
  while (queue.length) {
    const id = queue.shift();
    if (seen.has(id)) continue;
    seen.add(id);
    const row = byId.get(id);
    if (!row) continue;
    out.push(row);
    for (const key of childKeys) {
      const values = asArray(row[key]);
      for (const value of values) queue.push(value);
    }
  }
  return out;
}

function buildParentIndex(rows) {
  const index = new Map();
  for (const row of rows) {
    for (const key of childKeys) {
      for (const id of asArray(row[key])) {
        if (!index.has(id)) index.set(id, []);
        index.get(id).push(row);
      }
    }
  }
  return index;
}

function contextFor(id, parentIndex, cache) {
  if (cache.has(id)) return cache.get(id);
  const ancestors = ancestorsFor(id, parentIndex);
  const sets = ancestors.filter((row) => row._type === "fo_set");
  const pathRows = ancestors
    .filter((row) => row._type !== "fo_set")
    .slice(0, 6);
  return {
    sets: sets.map(compactRow),
    categories: [...new Set(sets.flatMap(setCategories))],
    path: pathRows.map(compactRow),
    tokens: tokenize(ancestors.map((row) => `${row.prefix ?? ""} ${row.title ?? ""}`).join(" ")),
  };
  cache.set(id, context);
  return context;
}

function ancestorsFor(id, parentIndex) {
  const seen = new Set();
  const queue = [id];
  const out = [];
  while (queue.length) {
    const current = queue.shift();
    if (seen.has(current)) continue;
    seen.add(current);
    for (const parent of parentIndex.get(current) ?? []) {
      out.push(parent);
      queue.push(parent.id);
    }
  }
  return out;
}

function compactRow(row) {
  return {
    id: row.id,
    type: row._type,
    prefix: row.prefix ?? "",
    title: row.title ?? "",
  };
}

function textScore(old, candidate) {
  const titleExact = normalize(old.title) && normalize(old.title) === normalize(candidate.title) ? 0.18 : 0;
  const descExact = normalize(old.description) && normalize(old.description) === normalize(candidate.description) ? 0.30 : 0;
  const prefixExact = old.prefix && candidate.prefix && String(old.prefix) === String(candidate.prefix) ? 0.10 : 0;
  const lexical = jaccard(tokenize(textBlob(old)), tokenize(textBlob(candidate)));
  return {
    total: round(lexical + titleExact + descExact + prefixExact),
    lexical: round(lexical),
    titleExact: round(titleExact),
    descriptionExact: round(descExact),
    prefixExact: round(prefixExact),
  };
}

function graphScore(oldContext, candidateContext) {
  const categoryOverlap = intersection(oldContext.categories, candidateContext.categories);
  const incompatible = incompatibleCategories(oldContext.categories, candidateContext.categories);
  const category = categoryOverlap.length ? 0.25 : incompatible ? -0.20 : 0;
  const path = jaccard(oldContext.tokens, candidateContext.tokens) * 0.25;
  return {
    total: round(category + path),
    category: round(category),
    path: round(path),
    oldCategories: oldContext.categories,
    candidateCategories: candidateContext.categories,
    warning: incompatible ? "candidate appears to be in a different programme/level family" : "",
  };
}

function linkScore(old, candidate) {
  if (asArray(candidate.replaces).includes(old.id)) {
    return { total: 0.45, kind: "candidate-replaces-old" };
  }
  if (asArray(old.replacedBy).includes(candidate.id)) {
    return { total: 0.45, kind: "old-replacedBy-candidate" };
  }
  if (asArray(candidate.replaces).length) {
    return { total: 0.05, kind: "candidate-has-other-replaces" };
  }
  return { total: 0, kind: "" };
}

function timingScore(oldHistory, candidateHistory) {
  if (noGit) return { total: 0, kind: "disabled" };
  if (oldHistory.error || candidateHistory.error) {
    return { total: 0, kind: "unavailable", error: oldHistory.error || candidateHistory.error };
  }
  const oldTop = oldHistory.commits[0];
  const candidateTop = candidateHistory.commits[0];
  if (!oldTop || !candidateTop) return { total: 0, kind: "missing-history" };
  if (oldTop.hash === candidateTop.hash) return { total: 0.35, kind: "same-commit" };
  const days = Math.abs(daysBetween(oldTop.date, candidateTop.date));
  if (days <= 14) return { total: 0.25, kind: "within-14-days", days };
  if (days <= 120) return { total: 0.12, kind: "within-120-days", days };
  return { total: 0, kind: "distant", days };
}

function gitHistory(id, cache) {
  if (noGit) return { commits: [], error: "" };
  if (cache.has(id)) return cache.get(id);
  try {
    const stdout = execFileSync("git", [
      "-C", repo,
      "log",
      "--all",
      "--date=short",
      "--format=%H%x09%h%x09%ad%x09%s",
      "-S", id,
      "--",
      "data",
    ], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    const commits = stdout.trim().split("\n").filter(Boolean).slice(0, 6).map((line) => {
      const [hash, shortHash, date, ...subject] = line.split("\t");
      return { hash, shortHash, date, subject: subject.join("\t") };
    });
    const result = { commits, error: "" };
    cache.set(id, result);
    return result;
  } catch (error) {
    const result = { commits: [], error: error.code || error.message };
    cache.set(id, result);
    return result;
  }
}

function classify(old, ranked) {
  const best = ranked[0];
  const alternativesClose = ranked.slice(1).filter((item) => best.scores.total - item.scores.total <= 0.15).length;
  const graphWarning = Boolean(best.scores.graph.warning);
  let confidence = "low";
  if (best.scores.total >= 1.0 && !graphWarning && alternativesClose === 0) confidence = "high";
  else if (best.scores.total >= 0.65 && !graphWarning) confidence = "medium";
  else if (best.scores.total >= 0.45) confidence = "medium-low";

  let relationClass = "insufficient-evidence";
  if (best.scores.text.descriptionExact || best.scores.text.titleExact) relationClass = "exact-or-near-continuity";
  else if (best.scores.text.lexical >= 0.45) relationClass = "exact-or-near-continuity";
  else if (best.scores.text.lexical >= 0.25) relationClass = "related-or-narrower";

  let action = "needs-more-context";
  if (confidence === "high" || confidence === "medium") action = "accept-for-human-review";
  if (graphWarning || alternativesClose > 1) action = "needs-context-selection";

  return {
    confidence,
    relationClass,
    reviewerAction: action,
    alternativesClose,
    note: old._type === "fo_uitwerking" || old._type === "fo_illustratie"
      ? "generic child rows require parent context before continuity review"
      : "",
  };
}

function setCategories(row) {
  const title = normalize(row.title);
  const categories = [];
  if (title.includes("functionele kerndoelen")) categories.push("functionele-kerndoelen");
  else if (title.includes("kerndoelen")) categories.push("kerndoelen");
  if (title.includes("havo")) categories.push("havo");
  if (title.includes("vwo")) categories.push("vwo");
  if (title.includes("vmbo bb") || title.includes("vmbo-bb")) categories.push("vmbo-bb");
  if (title.includes("vmbo kb") || title.includes("vmbo-kb")) categories.push("vmbo-kb");
  if (title.includes("vmbo gl") || title.includes("vmbo tl") || title.includes("gl/tl")) categories.push("vmbo-gl-tl");
  if (!categories.length && title.includes("nederlands")) categories.push("nederlands-general");
  return categories;
}

function incompatibleCategories(a, b) {
  const levels = ["havo", "vwo", "vmbo-bb", "vmbo-kb", "vmbo-gl-tl", "kerndoelen", "functionele-kerndoelen"];
  const aa = a.filter((value) => levels.includes(value));
  const bb = b.filter((value) => levels.includes(value));
  if (!aa.length || !bb.length) return false;
  return intersection(aa, bb).length === 0;
}

function textBlob(row) {
  return [
    row.prefix,
    row.title,
    row.description,
    row.karakteristiek,
    row.doelzin,
    row.uitwerking,
  ].filter(Boolean).join(" ");
}

function tokenize(value) {
  return normalize(value)
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2 && !stopWords.has(token));
}

function normalize(value) {
  return String(value ?? "").replace(/\r/g, "\n").replace(/\s+/g, " ").trim().toLowerCase();
}

function jaccard(a, b) {
  const aa = new Set(a);
  const bb = new Set(b);
  if (!aa.size || !bb.size) return 0;
  let hits = 0;
  for (const value of aa) if (bb.has(value)) hits++;
  return hits / (aa.size + bb.size - hits);
}

function groupBy(values, fn) {
  const grouped = new Map();
  for (const value of values) {
    const key = fn(value);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(value);
  }
  return grouped;
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
}

function intersection(a, b) {
  const bb = new Set(b);
  return [...new Set(a)].filter((value) => bb.has(value));
}

function daysBetween(a, b) {
  const aa = new Date(`${a}T00:00:00Z`).getTime();
  const bb = new Date(`${b}T00:00:00Z`).getTime();
  return Math.round((aa - bb) / 86400000);
}

function round(value) {
  return Math.round(value * 1000) / 1000;
}

function metadata(activeRoots, deprecatedRoots, activeSubgraph, deprecatedSubgraph, missingOld, queue, enrichedQueue) {
  return {
    repo,
    dataDir,
    activeRoots: activeRoots.length,
    deprecatedRoots: deprecatedRoots.length,
    activeSubgraph: activeSubgraph.length,
    deprecatedSubgraph: deprecatedSubgraph.length,
    missingOld: missingOld.length,
    candidatesAtThreshold: queue.length,
    gitEnrichedRows: noGit ? 0 : enrichedQueue.length,
    historyRows,
    types: typeFilter ? [...typeFilter] : ["all"],
    excludeGeneric,
    minScore,
    git: noGit ? "disabled" : "enabled",
  };
}

function toJsonResult(item) {
  return {
    old: entityJson(item.old, item.oldContext, item.oldHistory),
    best: candidateJson(item.best),
    alternatives: item.alternatives.map(candidateJson),
    classification: item.classification,
  };
}

function entityJson(row, context, history) {
  return {
    id: row.id,
    type: row._type,
    prefix: row.prefix ?? "",
    title: row.title ?? "",
    description: row.description ?? "",
    replacedBy: row.replacedBy ?? [],
    replaces: row.replaces ?? [],
    context,
    history: history.commits?.slice(0, 3) ?? [],
    historyError: history.error ?? "",
  };
}

function candidateJson(item) {
  return {
    entity: entityJson(item.candidate, item.context, item.history),
    scores: item.scores,
  };
}

function printMarkdown(meta, results) {
  console.log("# FO Continuity Review Queue Probe\n");
  console.log(`FO repo: \`${meta.repo}\``);
  console.log(`Active roots: ${meta.activeRoots}; deprecated roots: ${meta.deprecatedRoots}`);
  console.log(`Active rows: ${meta.activeSubgraph}; deprecated rows: ${meta.deprecatedSubgraph}; missing old rows: ${meta.missingOld}`);
  console.log(`Types: ${meta.types.join(", ")}; exclude generic rows: ${meta.excludeGeneric}`);
  console.log(`Candidates at threshold ${meta.minScore}: ${meta.candidatesAtThreshold}; Git timing: ${meta.git}\n`);
  console.log("| Score | Confidence | Old | Best candidate | Evidence | Action |");
  console.log("|---:|---|---|---|---|---|");
  for (const item of results) {
    const old = item.old;
    const best = item.best;
    const candidate = best.candidate;
    const evidence = [
      `text ${best.scores.text.total}`,
      `graph ${best.scores.graph.total}`,
      `link ${best.scores.link.total} ${best.scores.link.kind}`.trim(),
      `timing ${best.scores.timing.total} ${best.scores.timing.kind}`.trim(),
      best.scores.graph.warning,
      item.classification.alternativesClose ? `${item.classification.alternativesClose} close alternatives` : "",
    ].filter(Boolean).join("; ");
    console.log([
      best.scores.total.toFixed(3),
      item.classification.confidence,
      mdEntity(old, item.oldContext),
      mdEntity(candidate, best.context),
      evidence,
      item.classification.reviewerAction,
    ].map(escapeCell).join(" | ").replace(/^/, "| ").replace(/$/, " |"));
  }
}

function mdEntity(row, context) {
  const set = context.sets[0]?.title ?? "";
  const path = context.path.slice(0, 2).map((item) => item.title).join(" / ");
  return `\`${row.id}\` ${row._type} ${row.prefix ?? ""} ${row.title ?? ""}: ${row.description ?? ""} (${[path, set].filter(Boolean).join(" / ")})`;
}

function escapeCell(value) {
  return String(value).replace(/\|/g, "\\|").replace(/\n/g, " ");
}
