// escalation-view.mjs — PLAN P2-02 (Architecture §6, TSPEC Data Model "escalation-view.mjs").
//
// `parseEscalationLog` reads `docs/_queue/ESCALATIONS.md` text into `EscalationEntry` records,
// per the parse contract (TSPEC §4b, BR-16, BR-17, AC-4.7). `canonicalBlockText`/`entryId` are
// the single home of the canonical byte-range recipe (Architecture §6) so the writer
// (`renderDecisionEntry`) and this reader can never diverge on the digest.

import { createHash } from "node:crypto";

/**
 * The frozen parse-notice reason vocabulary (TSPEC §4b's three unparseable shapes). Every notice
 * `reason` in this module is built by `parseNoticeReason`, so an off-catalogue reason cannot ship:
 * the helper throws, exactly as `notice()` does for the loop's notice codes
 * (`loop-session.mjs`). `unrecognised-shape` carries no field; the other two suffix `: {field}`.
 */
export const PARSE_NOTICE_REASON_KINDS = Object.freeze([
  "unrecognised-shape",
  "duplicate-field",
  "missing-field",
]);

/** Pure. Renders an on-catalogue parse-notice `reason`; throws on an off-catalogue kind. */
export function parseNoticeReason(kind, field = null) {
  if (!PARSE_NOTICE_REASON_KINDS.includes(kind)) {
    throw new Error(
      `off-catalogue parse-notice reason kind ${kind} (expected one of ${PARSE_NOTICE_REASON_KINDS.join(", ")})`,
    );
  }
  return field === null ? kind : `${kind}: ${field}`;
}

/** Field names duplicate-checked per TSPEC §4b — order is the table's citation order. */
const DUPLICATE_CHECKED_FIELDS = [
  "Feature",
  "Seam",
  "Source",
  "Decision",
  "Decides",
  "Decided at",
  "Decided by",
];

function escapeRegExp(literal) {
  return literal.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Every match of a `| {name} | {value} |` row, value trimmed, in file order. */
function fieldMatches(text, name) {
  const pattern = new RegExp(`^\\|\\s*${escapeRegExp(name)}\\s*\\|\\s*(.*?)\\s*\\|\\s*$`, "gm");
  return [...text.matchAll(pattern)].map((m) => m[1].trim());
}

function fieldValue(text, name) {
  const matches = fieldMatches(text, name);
  return matches.length > 0 ? matches[0] : null;
}

/** TSPEC Architecture §6 rank-2 `conditionKey` normalisation. */
function normaliseConditionKey(raw) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\d+/g, "#")
    .replace(/\s+/g, " ");
}

function conditionKeyFor(trimmedChunk) {
  const rootCause = fieldValue(trimmedChunk, "Root cause");
  if (rootCause !== null) return rootCause;
  const refusalReason = fieldValue(trimmedChunk, "Refusal reason");
  if (refusalReason !== null) return normaliseConditionKey(refusalReason);
  return "";
}

/**
 * Pure. Architecture §6's canonical byte range: split shipped precedent's chunk, trimmed,
 * with the `## ` prefix re-attached — exactly three ASCII bytes, no trailing newline.
 */
export function canonicalBlockText(chunk) {
  return `## ${chunk.trim()}`;
}

/** Pure. `sha256(canonicalBlockText(chunk)).slice(0, 12)`, hex, lowercase. */
export function entryId(chunk) {
  return createHash("sha256").update(canonicalBlockText(chunk), "utf8").digest("hex").slice(0, 12);
}

/**
 * Parse one already-split, already-`## `-stripped chunk. Returns `{ entry }` on success or
 * `{ notice }` (TSPEC §4b's three unparseable shapes) on failure. `blockIndex` is the caller's
 * 1-based position among the blocks actually found by the `/^## /m` split.
 */
function parseBlock(rawChunk, blockIndex) {
  const trimmedChunk = rawChunk.trim();
  const lines = trimmedChunk.split("\n");
  const headingLine = (lines[0] || "").trim();
  const headingParts = headingLine.split(" — ");

  const hasFieldValueTable = /^\|\s*Field\s*\|\s*Value\s*\|\s*$/m.test(trimmedChunk);

  if (headingParts.length !== 3 || headingParts.some((p) => p.trim() === "") || !hasFieldValueTable) {
    return {
      notice: { blockIndex, heading: headingLine, reason: parseNoticeReason("unrecognised-shape") },
    };
  }

  const [iso, feature, label] = headingParts.map((p) => p.trim());
  const isDecision = label === "decision";

  // Duplicate-field check (TSPEC §4b): a count, not a first-match — any recognised field name
  // matching two or more rows skips the block, regardless of block kind.
  for (const name of DUPLICATE_CHECKED_FIELDS) {
    if (fieldMatches(trimmedChunk, name).length > 1) {
      return {
        notice: {
          blockIndex,
          heading: headingLine,
          reason: parseNoticeReason("duplicate-field", name),
        },
      };
    }
  }

  // Missing-field check — decision blocks are exempt (TSPEC §4b: "and it is not a decision
  // block"); their own five-row shape is validated by field extraction below, not this rule.
  if (!isDecision) {
    const featureValues = fieldMatches(trimmedChunk, "Feature");
    if (featureValues.length === 0) {
      return {
        notice: {
          blockIndex,
          heading: headingLine,
          reason: parseNoticeReason("missing-field", "Feature"),
        },
      };
    }
    const seamValues = fieldMatches(trimmedChunk, "Seam");
    const sourceValues = fieldMatches(trimmedChunk, "Source");
    if (seamValues.length === 0 && sourceValues.length === 0) {
      return {
        notice: {
          blockIndex,
          heading: headingLine,
          reason: parseNoticeReason("missing-field", "Seam"),
        },
      };
    }
  }

  const id = entryId(rawChunk);
  const blockText = canonicalBlockText(rawChunk);
  const decideMatch = trimmedChunk.match(/^\*\*Decide:\*\*\s*(.+)$/m);

  if (isDecision) {
    const outcome = fieldValue(trimmedChunk, "Decision");
    return {
      entry: {
        id,
        kind: "decision",
        seam: null,
        source: null,
        feature,
        decision: "",
        conditionKey: "",
        timestamp: iso,
        blockText,
        decidedOutcome: outcome === "resolved" || outcome === "rejected" ? outcome : null,
        decidedBy: fieldValue(trimmedChunk, "Decided by"),
        decidesId: fieldValue(trimmedChunk, "Decides"),
        decidedAt: fieldValue(trimmedChunk, "Decided at"),
      },
    };
  }

  const seam = fieldValue(trimmedChunk, "Seam");
  const source = seam === null ? fieldValue(trimmedChunk, "Source") : null;

  return {
    entry: {
      id,
      kind: seam !== null ? "advisory" : "non-advisory",
      seam,
      source,
      feature,
      decision: decideMatch ? decideMatch[1].trim() : "",
      conditionKey: conditionKeyFor(trimmedChunk),
      timestamp: iso,
      blockText,
      decidedOutcome: null,
      decidedBy: null,
      decidesId: null,
      decidedAt: null,
    },
  };
}

/**
 * Pure. `text === null` (log absent, E-06/PROP-ESC-14) yields an empty result — no write is
 * attempted (BR-17, AT-28). Otherwise splits on `/^## /m`, the shipped precedent's recipe
 * (`parseEscalations`, `consolidate-learnings.js`), parsing every block; an unparseable block
 * is skipped and recorded as a parse notice while sibling blocks still render (BR-16, AT-27,
 * PROP-VIEW-10).
 */
export function parseEscalationLog(text) {
  if (text === null) {
    return { entries: [], parseNotices: [] };
  }

  const chunks = text.split(/^## /m).filter((c) => c.trim() !== "");
  const entries = [];
  const parseNotices = [];

  chunks.forEach((rawChunk, i) => {
    const result = parseBlock(rawChunk, i + 1);
    if (result.entry) {
      entries.push(result.entry);
    } else {
      parseNotices.push(result.notice);
    }
  });

  return { entries, parseNotices };
}

/**
 * `blockedFeatureCounts` — PLAN P2-04 (TSPEC Interfaces, FSPEC BR-13, E-10/E-11/E-12,
 * PROP-VIEW-02/03/05, AT-23, AT-42).
 *
 * For every `QUEUE.md` row whose status is not `done`, walks the transitive closure of the
 * **effective** dependency union — `dependsOn` ∪ `frontmatterDeps.get(feature)` — starting
 * from that row's own feature, via BFS over a visited set (so cycles terminate and every
 * reached feature is counted at most once per row). The starting feature itself is seeded
 * into `visited` before traversal, so it is never counted in its own total (excludes self).
 * `counts.get(F)` is the number of non-done rows that transitively depend on F; a feature
 * reached by no row has no key (absence reads as 0 — E-10).
 */
export function blockedFeatureCounts({ queueEntries, frontmatterDeps }) {
  const deps = frontmatterDeps ?? new Map();

  const effectiveDepsOf = (feature) => {
    const row = queueEntries.find((entry) => entry.feature === feature);
    const columnDeps = row?.dependsOn ?? [];
    const frontmatterOnly = deps.get(feature) ?? [];
    return Array.from(new Set([...columnDeps, ...frontmatterOnly]));
  };

  const counts = new Map();

  for (const row of queueEntries) {
    if (row.status === "done") {
      continue;
    }

    const visited = new Set([row.feature]);
    const queue = [...effectiveDepsOf(row.feature)];

    while (queue.length > 0) {
      const dep = queue.shift();
      if (visited.has(dep)) {
        continue;
      }
      visited.add(dep);
      counts.set(dep, (counts.get(dep) ?? 0) + 1);
      queue.push(...effectiveDepsOf(dep));
    }
  }

  return counts;
}

/** `(source-or-seam, feature, conditionKey)` — the V3 recurrence key (BR-15). */
function recurrenceKey(entry) {
  const sourceOrSeam = entry.seam ?? entry.source ?? "";
  return `${sourceOrSeam} ${entry.feature} ${entry.conditionKey}`;
}

/**
 * `buildOperatorView` — PLAN P2-05/P2-06 (TSPEC Interfaces, Architecture §6, BR-13, BR-14,
 * BR-15, AT-22, AT-24, AT-26, AT-43, AT-50).
 *
 * Pure; recomputed on every render (AC-4.3). Pipeline: V3 collapse (keyed on
 * `(source-or-seam, feature, conditionKey)`, `occurrences` frozen as the on-disk member count)
 * runs before V4 decision overlay, which only ever reads that frozen count.
 */
export function buildOperatorView({ log, counts }) {
  const effectiveCounts = counts ?? new Map();
  const { entries, parseNotices } = log;

  const escalationEntries = entries.filter((e) => e.kind !== "decision");
  const decisions = entries.filter((e) => e.kind === "decision");

  // V3 collapse — group escalation entries by recurrence key, in file order.
  const groups = new Map();
  for (const entry of escalationEntries) {
    const key = recurrenceKey(entry);
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(entry);
  }

  const items = [];
  for (const members of groups.values()) {
    // `entryIds` retains EVERY member id, oldest first (Architecture §6).
    const ordered = [...members].sort((a, b) => (a.timestamp < b.timestamp ? -1 : a.timestamp > b.timestamp ? 1 : 0));
    const entryIds = ordered.map((m) => m.id);
    const latestMemberId = entryIds[entryIds.length - 1];
    const first = ordered[0];

    // V4 decision overlay — the latest decision (by `Decided at`, ties by file order) naming
    // ANY id in entryIds.
    let overlayDecision = null;
    for (const decision of decisions) {
      if (!entryIds.includes(decision.decidesId)) {
        continue;
      }
      if (overlayDecision === null || decision.decidedAt >= overlayDecision.decidedAt) {
        overlayDecision = decision;
      }
    }

    const closed =
      overlayDecision !== null &&
      (overlayDecision.decidedOutcome === "resolved" || overlayDecision.decidedOutcome === "rejected") &&
      overlayDecision.decidesId === latestMemberId;

    if (closed) {
      continue;
    }

    items.push({
      feature: first.feature,
      seam: first.seam,
      source: first.source,
      conditionKey: first.conditionKey,
      occurrences: ordered.length,
      blockedFeatures: effectiveCounts.get(first.feature) ?? 0,
      firstSeen: first.timestamp,
      entryIds,
    });
  }

  // V5 order — descending blockedFeatures, ties by oldest firstSeen, ties by feature name asc.
  items.sort((a, b) => {
    if (a.blockedFeatures !== b.blockedFeatures) {
      return b.blockedFeatures - a.blockedFeatures;
    }
    if (a.firstSeen !== b.firstSeen) {
      return a.firstSeen < b.firstSeen ? -1 : 1;
    }
    return a.feature < b.feature ? -1 : a.feature > b.feature ? 1 : 0;
  });

  return { items, parseNotices };
}
