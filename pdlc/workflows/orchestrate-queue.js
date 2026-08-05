/**
 * orchestrate-queue.js — Serial queue driver around orchestrate-dev
 *
 * Canonical plugin source: pdlc/workflows/orchestrate-queue.js
 * Built artifact:          pdlc/workflows/dist/orchestrate-queue.bundle.js
 * Consumer runtime copy:   installed from dist/ by pdlc/hooks/scripts/sync-workflows.sh
 *
 * Purpose
 * -------
 * The PDLC pipeline (orchestrate-dev) is NOT stateless: each FSPEC/TSPEC/PLAN is
 * authored against the codebase as it exists at fire time. Two REQs that touch the
 * same subsystem must therefore run in a dependency-respecting order, one at a time.
 *
 * This wrapper turns a human-curated queue into a Claude loop ("/loop run
 * /pdlc:orchestrate-queue"). On each invocation it picks AT MOST ONE ready REQ from
 * docs/_queue/QUEUE.md, runs a Phase-0 readiness check, and — if ready — delegates
 * the whole pipeline to orchestrate-dev's main(). One feature per invocation keeps
 * each run bounded and observable; the loop fires again for the next.
 *
 * Design axes (resolved with the developer):
 *   1. Ordering   — QUEUE.md gives the high-level order (Option A) AND each REQ
 *                   declares its own `depends-on` in frontmatter (Option B). The
 *                   effective dependency set is the UNION of both. A REQ that is not
 *                   marked `ready: true` in its frontmatter is never auto-picked,
 *                   so an in-progress draft can sit safely in the queue.
 *   2. Concurrency— Serial. One pipeline per invocation; an existing `in-progress`
 *                   queue entry blocks new pickups until a human resolves it.
 *   3. Readiness  — A Phase-0 triage agent (se-author, which knows the current
 *                   implementation) verifies declared dependencies are actually
 *                   present in the base before the dependent's specs are authored.
 *                   A deterministic pre-check (precheckDependencies) runs FIRST and
 *                   short-circuits candidates the queue already proves blocked (a
 *                   dependency present with a non-`done` status), so no Sonnet triage
 *                   agent is spawned to rediscover what QUEUE.md already states.
 *
 * Manual single-REQ runs remain available via /pdlc:orchestrate-dev — this wrapper
 * does not replace it, it drives it.
 */

// Single-line on purpose: stripModuleSyntax recognises imports line-wise.
import realMain, { runAdvisorySeam, readAdvisoryConfigSafely, parseAdvisoryConfig, defaultAppendFile, ADVISORY_CONFIG_PATH } from "./orchestrate-dev.js";

// ─── Exported meta object (mirrors orchestrate-dev) ──────────────────────────
export const meta = {
  name: "orchestrate-queue",
  description:
    "Serial PDLC queue driver — picks the next ready REQ from docs/_queue/QUEUE.md and runs orchestrate-dev for it. Designed to be driven by /loop.",
  inputs: [
    {
      name: "queuePath",
      description:
        "Path to the queue file. Defaults to docs/_queue/QUEUE.md.",
      type: "string",
      required: false,
    },
  ],
};

// Default location of the queue file.
export const DEFAULT_QUEUE_PATH = "docs/_queue/QUEUE.md";

// Location of the drift-state artifact the queue's gate reads (FSPEC §6.1). Written by the
// sync hook / manual sync / manifest check — never by this module.
export const DRIFT_STATE_PATH = ".claude/workflows/.pdlc-drift-state.json";

// MODEL-01: the queue driver's own agent work (the Phase-0 readiness triage) runs
// on Sonnet — it is a bounded lookup against git/working-tree state, not deep
// reasoning. The delegated pipeline (orchestrate-dev) pins its OWN models: Opus for
// every phase except its Phase I implementation batches. See orchestrate-dev.js.
const MODEL_QUEUE = "sonnet";

// Recognized queue statuses. Only `pending` entries are eligible for pickup.
// `in-progress` is a crash/active marker; `awaiting-merge`/`done`/`blocked`/`halted`
// are terminal-for-this-loop and skipped.
export const QUEUE_STATUSES = [
  "pending",
  "in-progress",
  "awaiting-merge",
  "done",
  "blocked",
  "halted",
];

// TSPEC §8.2 — the closed *row disposition* catalogue `rewriteStatus` /
// `commitQueueRow` / `uncommitted` report through `_recordQueueRow`. This is
// vocabulary about the queue-row *write*, never about the queue *status*
// column (`QUEUE_STATUSES` above): a disposition of `"recorded"` can be
// reported whatever `status` was written, including `"halted"`. Exported and
// frozen (DC-01) so a test enumerates membership rather than pinning prose.
export const QUEUE_ROW_DISPOSITIONS = Object.freeze([
  "recorded",
  "recorded (uncommitted)",
  "none",
  "error",
]);

// ─── Halt helper (same shape as orchestrate-dev) ─────────────────────────────
function haltError(message) {
  const err = new Error(message);
  err.isHalt = true;
  return err;
}

// ─── QUEUE-PARSE-01: parseQueue ──────────────────────────────────────────────

/**
 * Parse a QUEUE.md markdown table into an ordered list of entries.
 *
 * Expected table columns (header row is matched case-insensitively, extra columns
 * are ignored): Order | Status | Feature | REQ Path | Depends-On
 *
 * Depends-On is a comma/space separated list of feature names, or "-"/"—"/"" for none.
 *
 * @param {string | null | undefined} markdown - Raw QUEUE.md contents
 * @returns {Array<{order: number|null, status: string, feature: string, reqPath: string, dependsOn: string[], rawStatus: string}>}
 */
export function parseQueue(markdown) {
  if (markdown == null || typeof markdown !== "string") return [];

  const rows = markdown
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("|"));

  if (rows.length === 0) return [];

  // Locate header to map columns; fall back to positional if header missing.
  let headerIdx = -1;
  let cols = null;
  for (let i = 0; i < rows.length; i++) {
    const cells = splitRow(rows[i]).map((c) => c.toLowerCase());
    if (cells.includes("status") && cells.some((c) => c.includes("req"))) {
      headerIdx = i;
      cols = cells;
      break;
    }
  }

  const colIndex = (names) => {
    if (!cols) return -1;
    for (let i = 0; i < cols.length; i++) {
      if (names.some((n) => cols[i].includes(n))) return i;
    }
    return -1;
  };

  const idxOrder = colIndex(["order", "#"]);
  const idxStatus = colIndex(["status"]);
  const idxFeature = colIndex(["feature"]);
  const idxReq = colIndex(["req path", "req", "path"]);
  const idxDeps = colIndex(["depends", "depends-on", "deps"]);

  const entries = [];
  const startIdx = headerIdx === -1 ? 0 : headerIdx + 1;

  for (let i = startIdx; i < rows.length; i++) {
    const cells = splitRow(rows[i]);
    // Skip the markdown separator row (|---|---|).
    if (cells.every((c) => /^:?-{2,}:?$/.test(c) || c === "")) continue;
    if (cells.length === 0) continue;

    const rawStatus = pick(cells, idxStatus, 1);
    const status = (rawStatus || "").toLowerCase();
    const feature = pick(cells, idxFeature, 2);
    const reqPath = pick(cells, idxReq, 3);
    if (!feature && !reqPath) continue; // not a data row

    const orderRaw = pick(cells, idxOrder, 0);
    const order = /^\d+$/.test(orderRaw) ? parseInt(orderRaw, 10) : null;

    entries.push({
      order,
      status,
      rawStatus: rawStatus || "",
      feature,
      reqPath,
      dependsOn: parseDepsCell(pick(cells, idxDeps, 4)),
    });
  }

  return entries;
}

function splitRow(row) {
  // Drop leading/trailing pipe, then split. Keeps internal spacing trimmed.
  return row
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());
}

function pick(cells, idx, fallbackIdx) {
  const i = idx >= 0 ? idx : fallbackIdx;
  return i >= 0 && i < cells.length ? cells[i] : "";
}

function parseDepsCell(cell) {
  if (!cell) return [];
  const cleaned = cell.replace(/[—–-]/g, (m) => (m === "-" ? "-" : "")).trim();
  if (cleaned === "" || cleaned === "-" || cleaned.toLowerCase() === "none") {
    return [];
  }
  return cell
    .split(/[\s,]+/)
    .map((d) => d.trim())
    .filter((d) => d && d !== "-" && d !== "—" && d !== "–" && d.toLowerCase() !== "none");
}

// ─── QUEUE-PARSE-02: parseReqFrontmatter ─────────────────────────────────────

/**
 * How far into a REQ to look for the frontmatter block. Large enough to clear
 * an agent-added preamble, small enough that a `---` rule in the body is never
 * mistaken for frontmatter.
 */
const FRONTMATTER_SCAN_LIMIT = 4000;

/**
 * Parse the YAML-ish frontmatter block of a REQ document.
 *
 * Recognized keys:
 *   ready: true|false       — gate. Absent or non-true means "not pickable".
 *   depends-on: [a, b]      — inline list, or comma/space list, or "-"/none.
 *   feature: name           — informational.
 *
 * Tolerant of missing frontmatter (returns ready:false so nothing is auto-run by
 * accident) and of simple YAML list syntaxes.
 *
 * @param {string | null | undefined} text - Raw REQ contents
 * @returns {{ ready: boolean, dependsOn: string[], feature: string|null }}
 */
export function parseReqFrontmatter(text) {
  const empty = { ready: false, dependsOn: [], feature: null };
  if (text == null || typeof text !== "string") return empty;

  // The frontmatter is normally the first thing in the file, but the runtime
  // reads files by round-tripping them through an agent's final message: for a
  // large REQ the agent may prepend a line explaining it could not return the
  // whole file verbatim. Scan a bounded prefix for the first `---` block rather
  // than anchoring at offset 0, so a preamble does not read as "no frontmatter"
  // (which silently degrades to ready:false and skips a genuinely ready REQ).
  const head = text.slice(0, FRONTMATTER_SCAN_LIMIT);
  const fm = /(?:^|\n)\s*---[ \t]*\n([\s\S]*?)\n---[ \t]*(?:\n|$)/.exec(head);
  if (!fm) return empty;

  const body = fm[1];
  const lines = body.split("\n");

  let ready = false;
  let feature = null;
  let dependsOn = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const m = /^([A-Za-z0-9_-]+)\s*:\s*(.*)$/.exec(line.trim());
    if (!m) continue;
    const key = m[1].toLowerCase();
    const value = m[2].trim();

    if (key === "ready") {
      ready = value.toLowerCase() === "true";
    } else if (key === "feature") {
      feature = value || null;
    } else if (key === "depends-on" || key === "dependson" || key === "deps") {
      if (value.startsWith("[")) {
        // inline flow list: [a, b]
        dependsOn = value
          .replace(/^\[/, "")
          .replace(/\]$/, "")
          .split(/[\s,]+/)
          .map((d) => d.trim().replace(/['"]/g, ""))
          .filter(Boolean);
      } else if (value === "" ) {
        // block list on following indented "- item" lines
        for (let j = i + 1; j < lines.length; j++) {
          const item = /^\s*-\s*(.+)$/.exec(lines[j]);
          if (!item) break;
          dependsOn.push(item[1].trim().replace(/['"]/g, ""));
        }
      } else if (value !== "-" && value.toLowerCase() !== "none") {
        dependsOn = value
          .split(/[\s,]+/)
          .map((d) => d.trim().replace(/['"]/g, ""))
          .filter((d) => d && d !== "-");
      }
    }
  }

  return { ready, dependsOn, feature };
}

// ─── QUEUE-PARSE-03: parseTriageVerdict ──────────────────────────────────────

/**
 * Extract the Phase-0 triage verdict from an se-author result.
 * Looks for the last line of form `TRIAGE: ready|blocked|needs-human [SEAM:A1|A2]? <reason>`.
 * Defaults to "needs-human" (the safe, no-auto-run option) when absent/malformed.
 *
 * `seamToken` is `null` for an absent or unrecognised token — the anchored single-group
 * alternation only matches `A1`/`A2`; anything else (including a malformed "both tokens on one
 * stop" stop) falls through into `reason` unconsumed. TSPEC §6.2/§6.5.
 *
 * @param {string | null | undefined} result
 * @returns {{ verdict: "ready"|"blocked"|"needs-human", reason: string, seamToken: "A1"|"A2"|null }}
 */
export function parseTriageVerdict(result) {
  const fallback = {
    verdict: "needs-human",
    reason: "triage agent returned no TRIAGE verdict — treating as needs-human",
    seamToken: null,
  };
  if (result == null || (typeof result === "string" && result.trim() === "")) {
    return fallback;
  }

  const lines = result.split("\n");
  for (let i = lines.length - 1; i >= 0; i--) {
    const trimmed = lines[i].trim();
    const m = /^TRIAGE:\s*(ready|blocked|needs-human)\b\s*(.*)$/i.exec(trimmed);
    if (m) {
      const verdict = m[1].toLowerCase();
      const rest = m[2].trim();

      // Consume at most one leading [SEAM:A1|A2] token. A second one immediately following
      // (the "both tokens on one stop" malformed case, V-4) is left unconsumed — seamToken
      // stays null and `reason` carries the residual "[SEAM:" prefix, which is exactly what
      // `hasResidualSeamToken` is the one predicate for.
      let seamToken = null;
      let reason = rest;
      const tokenMatch = /^\[SEAM:(A1|A2)\]\s*(.*)$/i.exec(rest);
      if (tokenMatch) {
        if (/^\[SEAM:/i.test(tokenMatch[2].trim())) {
          seamToken = null;
          reason = rest;
        } else {
          seamToken = tokenMatch[1].toUpperCase();
          reason = tokenMatch[2].trim();
        }
      }

      return {
        verdict,
        seamToken,
        reason: reason || "(no reason given)",
      };
    }
  }
  return fallback;
}

// ─── QUEUE-PARSE-04: hasResidualSeamToken ────────────────────────────────────

/**
 * True when `reason` (as returned by `parseTriageVerdict`) still carries an unconsumed
 * `[SEAM:` prefix — the "both tokens on one stop" malformed case (TSPEC §6.2/§6.5, V-4): the
 * anchored single-group match in `parseTriageVerdict` consumes at most one token, so a second
 * one lands, unconsumed, at the front of `reason`.
 *
 * @param {string | null | undefined} reason
 * @returns {boolean}
 */
export function hasResidualSeamToken(reason) {
  return typeof reason === "string" && /^\[SEAM:/i.test(reason.trim());
}

// ─── QUEUE-WRITE-01: updateQueueStatus ───────────────────────────────────────

/**
 * Return a new QUEUE.md string with `feature`'s row Status cell set to newStatus.
 * Pure string transform — preserves all other formatting.
 *
 * TSPEC §4.6: the return is `{ markdown, matched }`, not a bare string. The old
 * not-found path (`return markdown; // feature row not found`) was
 * indistinguishable, to the caller, from a successful update whose replacement
 * happened to be a no-op — so a status write against a row that had been deleted
 * mid-run looked exactly like a write that landed. `matched` makes the
 * difference observable, which is what `_recordQueueRow` needs in order to
 * report `queueRow: "error"` (FSPEC §13.5) rather than claiming a write it
 * never made.
 *
 * `evidence` (TSPEC §8.4) is the 4th, defaulted, parameter. `evidence == null`
 * is exactly today's code path, character for character: column resolution,
 * row match, `newCells[statusCol] = newStatus`, re-emit — no migration, no
 * sixth cell, no re-emission of any other row (FSPEC §7.4's required
 * evidence-free identity property, PROP-M-12). `evidence != null` first
 * applies the §2.5 non-overwrite rule (only `in-progress` / `awaiting-merge`
 * / `done` rows are overwritten; any other status is reported back,
 * untouched, as `{ matched: true, written: false, foundStatus }`) and, when
 * overwritable, migrates the `Evidence` column via `ensureEvidenceColumn`
 * (once — never twice) before setting the status cell and merging the
 * evidence cell through `mergeEvidenceCell`'s no-downgrade rule.
 *
 * @param {string} markdown
 * @param {string} feature
 * @param {string} newStatus
 * @param {string|null} [evidence]
 * @returns {{ markdown: string, matched: boolean, written?: boolean, foundStatus?: string }}
 */
export function updateQueueStatus(markdown, feature, newStatus, evidence = null) {
  if (typeof markdown !== "string" || !feature) {
    return { markdown, matched: false };
  }

  const lines = markdown.split("\n");

  // Resolve column indices from the header (same logic as parseQueue).
  let statusCol = 1;
  let featureCol = 2;
  for (const line of lines) {
    if (!line.trim().startsWith("|")) continue;
    const cells = splitRow(line.trim()).map((c) => c.toLowerCase());
    if (cells.includes("status") && cells.some((c) => c.includes("feature"))) {
      const s = cells.findIndex((c) => c.includes("status"));
      const f = cells.findIndex((c) => c.includes("feature"));
      if (s >= 0) statusCol = s;
      if (f >= 0) featureCol = f;
      break;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim().startsWith("|")) continue;
    const cells = splitRow(line.trim());
    if (cells.every((c) => /^:?-{2,}:?$/.test(c) || c === "")) continue;
    if ((cells[featureCol] || "").trim() !== feature) continue;

    // evidence == null: exactly today's code path, byte for byte (§8.4.1).
    if (evidence == null) {
      const newCells = cells.slice();
      newCells[statusCol] = newStatus;
      lines[i] = `| ${newCells.join(" | ")} |`;
      return { markdown: lines.join("\n"), matched: true };
    }

    // evidence != null: §2.5's non-overwrite rule first — the file is
    // returned byte-unchanged whenever the row's current status is not
    // one the write-back is permitted to overwrite.
    const foundStatus = (cells[statusCol] || "").trim();
    if (!EVIDENCE_OVERWRITABLE_STATUSES.includes(foundStatus)) {
      return { markdown, matched: true, written: false, foundStatus };
    }

    // Overwritable: migrate the Evidence column (once), re-locate the row in
    // the migrated table, set the status and evidence cells, and re-emit.
    return writeEvidenceCarryingRow(markdown, feature, newStatus, evidence, {
      statusCol,
      featureCol,
    });
  }

  return { markdown, matched: false }; // feature row not found
}

// TSPEC §8.4c / FSPEC §2.5 — the only statuses the evidence-carrying write is
// permitted to overwrite. Any other status (`pending`, `blocked`, `halted`)
// is left untouched: it describes work this run did not drive to completion.
const EVIDENCE_OVERWRITABLE_STATUSES = ["in-progress", "awaiting-merge", "done"];

/**
 * The evidence-carrying write itself (TSPEC §8.4, steps a/d/e), split out so
 * `updateQueueStatus`'s non-overwrite early-return never touches
 * `ensureEvidenceColumn` — the file it returns on that path is the pristine
 * input, not a discarded migration.
 *
 * @param {string} markdown
 * @param {string} feature
 * @param {string} newStatus
 * @param {string} evidence
 * @param {{statusCol: number, featureCol: number}} hint - column indices
 *   resolved from the pre-migration header (unaffected by the appended
 *   Evidence column, which lands after them).
 * @returns {{ markdown: string, matched: boolean, written?: boolean }}
 */
function writeEvidenceCarryingRow(markdown, feature, newStatus, evidence, hint) {
  const { markdown: migrated } = ensureEvidenceColumn(markdown);
  const lines = migrated.split("\n");

  let statusCol = hint.statusCol;
  let featureCol = hint.featureCol;
  let evidenceCol = -1;
  for (const line of lines) {
    if (!line.trim().startsWith("|")) continue;
    const cells = splitRow(line.trim()).map((c) => c.toLowerCase());
    if (cells.includes("status") && cells.some((c) => c.includes("feature"))) {
      const s = cells.findIndex((c) => c.includes("status"));
      const f = cells.findIndex((c) => c.includes("feature"));
      const e = cells.findIndex((c) => c.includes("evidence"));
      if (s >= 0) statusCol = s;
      if (f >= 0) featureCol = f;
      if (e >= 0) evidenceCol = e;
      break;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim().startsWith("|")) continue;
    const cells = splitRow(line.trim());
    if (cells.every((c) => /^:?-{2,}:?$/.test(c) || c === "")) continue;
    if ((cells[featureCol] || "").trim() !== feature) continue;

    const newCells = cells.slice();
    newCells[statusCol] = newStatus;
    if (evidenceCol >= 0) {
      const prevEvidence = (newCells[evidenceCol] || "").trim();
      newCells[evidenceCol] = mergeEvidenceCell(prevEvidence, evidence);
    }
    lines[i] = `| ${newCells.join(" | ")} |`;
    return { markdown: lines.join("\n"), matched: true, written: true };
  }

  // Unreachable in practice — the caller already located this exact row
  // before migrating — but stay defensive rather than throw.
  return { markdown, matched: false };
}

// ─── QUEUE-WRITE-02: ensureEvidenceColumn / mergeEvidenceCell ────────────────
// TSPEC §8.5, FSPEC §7.3 (Q-02) and §7.2. Pure helpers behind the `Evidence`
// column Phase MERGE's queue write-back needs; `updateQueueStatus` (B2)
// drives them, they do not drive it.

/**
 * Migrate a QUEUE.md table to carry a sixth `Evidence` column, once.
 *
 * Exactly three structural changes, and no fourth (FSPEC §7.3): `Evidence`
 * appended to the header row (the row whose cells include "status" and one
 * containing "feature" — the same predicate `parseQueue`/`updateQueueStatus`
 * use); one `---` cell appended to the separator row immediately below it,
 * recognised by "every cell is a dash run or empty"; and one empty cell
 * appended to every other data row, so cell counts stay uniform. Rows that
 * are not part of the table (prose, blank lines, anything not starting with
 * `|`) are untouched, and no other cell of any row is rewritten — the
 * append is a string splice after the row's trailing `|`, never a
 * split/rejoin of the row's existing cells. A queue already carrying an
 * `Evidence` column is returned unchanged (`migrated: false`) — never
 * migrated twice. A queue with no recognisable header is also returned
 * unchanged.
 *
 * @param {string} markdown
 * @returns {{ markdown: string, migrated: boolean }}
 */
export function ensureEvidenceColumn(markdown) {
  if (typeof markdown !== "string") return { markdown, migrated: false };

  const lines = markdown.split("\n");
  const isSeparatorRow = (cells) => cells.every((c) => /^:?-{2,}:?$/.test(c) || c === "");
  const appendCell = (line, cellText) => `${line.replace(/\|\s*$/, "")}| ${cellText} |`;

  // Locate the header row exactly as parseQueue/updateQueueStatus do.
  let headerIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim().startsWith("|")) continue;
    const cells = splitRow(line.trim()).map((c) => c.toLowerCase());
    if (cells.includes("status") && cells.some((c) => c.includes("feature"))) {
      headerIdx = i;
      break;
    }
  }
  if (headerIdx === -1) return { markdown, migrated: false }; // no table found

  const headerCells = splitRow(lines[headerIdx].trim()).map((c) => c.toLowerCase());
  if (headerCells.some((c) => c.includes("evidence"))) {
    return { markdown, migrated: false }; // already migrated — never twice
  }

  lines[headerIdx] = appendCell(lines[headerIdx].trim(), "Evidence");

  // The separator row is the very next `|`-starting line, if it is
  // separator-shaped; appending an empty-shaped dash cell keeps the
  // rendered table well-formed over a six-column header.
  const sepIdx = headerIdx + 1;
  if (sepIdx < lines.length && lines[sepIdx].trim().startsWith("|")) {
    const sepLine = lines[sepIdx].trim();
    if (isSeparatorRow(splitRow(sepLine))) {
      lines[sepIdx] = appendCell(sepLine, "---");
    }
  }

  // Every other `|`-starting row is a data row: append one empty cell.
  for (let i = sepIdx + 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim().startsWith("|")) continue;
    const trimmed = line.trim();
    if (isSeparatorRow(splitRow(trimmed))) continue; // a stray separator-shaped row
    lines[i] = appendCell(trimmed, "");
  }

  return { markdown: lines.join("\n"), migrated: true };
}

/**
 * FSPEC §7.2's no-downgrade rule for the `Evidence` cell: a cell already
 * holding a non-empty value is never downgraded to the `merged #{prNumber}`
 * placeholder form by a later re-entry that could not resolve the oid — a
 * real SHA always wins over a placeholder. Everything else takes the new
 * value, including a `merged #{n}` cell being overwritten by a later
 * `{shortSha} #{n}` once the oid resolves.
 *
 * @param {string} prev - the cell's current content (e.g. "" for a freshly migrated row).
 * @param {string} next - the value this write would set absent the rule.
 * @returns {string}
 */
export function mergeEvidenceCell(prev, next) {
  if (typeof prev === "string" && prev !== "" && /^merged #/.test(next)) {
    return prev;
  }
  return next;
}

// ─── selectNextPending ───────────────────────────────────────────────────────

/**
 * Decide which queue entry to attempt next, BEFORE the async readiness triage.
 * Pure: returns the first `pending` entry whose REQ-gate could let it run, or a
 * structured "nothing to pick" reason. Also surfaces an `in-progress` blocker.
 *
 * @param {Array} entries - parseQueue() output
 * @returns {{ kind: "blocked-active", entry: object }
 *          | { kind: "candidates", candidates: object[] }
 *          | { kind: "empty", reason: string }}
 */
export function selectNextPending(entries) {
  if (!Array.isArray(entries) || entries.length === 0) {
    return { kind: "empty", reason: "queue is empty" };
  }

  const active = entries.find((e) => e.status === "in-progress");
  if (active) {
    return { kind: "blocked-active", entry: active };
  }

  const candidates = entries.filter((e) => e.status === "pending");
  if (candidates.length === 0) {
    return {
      kind: "empty",
      reason: "no pending entries (all done, awaiting-merge, blocked, or halted)",
    };
  }

  // Preserve queue order: by explicit order field when present, else document order.
  candidates.sort((a, b) => {
    if (a.order != null && b.order != null) return a.order - b.order;
    return 0;
  });

  return { kind: "candidates", candidates };
}

// ─── precheckDependencies ─────────────────────────────────────────────────────

/**
 * Deterministic dependency pre-check run BEFORE the Sonnet triage agent.
 *
 * The queue file already records the lifecycle status of every feature it knows
 * about. If a declared dependency is present in the queue with a non-`done` status
 * it is *definitely* not merged into the base yet — no agent session is needed to
 * conclude the candidate is blocked. This short-circuits that case to avoid burning
 * a triage agent spawn on an answer the queue already gives.
 *
 * Conservative on purpose: a dependency that is `done`, or one that is absent from
 * the queue entirely, CANNOT be judged from the queue alone (it may live outside the
 * queue, or `done` may not yet be reflected in the working tree) — those fall
 * through to the triage agent, which inspects git/working-tree state.
 *
 * @param {string[]} dependsOn - union of QUEUE ∪ REQ-frontmatter dependency names
 * @param {Array} entries      - parseQueue() output
 * @returns {{ blocked: boolean, reason?: string }}
 */
export function precheckDependencies(dependsOn, entries) {
  if (!Array.isArray(dependsOn) || dependsOn.length === 0) {
    return { blocked: false };
  }
  const rows = Array.isArray(entries) ? entries : [];

  for (const dep of dependsOn) {
    const match = rows.find((e) => e.feature === dep);
    // Present in the queue but not yet done → definitely blocked. First one wins.
    if (match && match.status !== "done") {
      return {
        blocked: true,
        reason: `dependency ${dep} is ${match.status} in queue (not done)`,
      };
    }
    // Dependency done, or not in the queue at all → inconclusive here; defer to triage.
  }

  return { blocked: false };
}

/**
 * A1's queue-level decision surface (TSPEC §6.3, A1-2/A1-3). `precheck` is a superset of
 * `precheckDependencies`'s own return — `{ blocked, dependsOn, entries }` — carrying the same
 * `dependsOn`/`entries` the pre-check already had in scope, so this function can enforce A1-3
 * (presence-in-base unsettled ⇒ escalate) without a second query surface.
 *
 * A1-2 (defence in depth): a `blocked` precheck always escalates, regardless of `verdict` — the
 * candidate must never run, even if A1's own recommendation was `run-candidate`.
 * A1-3: a declared dependency with no matching row in `entries` is "unsettled" and forces
 * `escalate` regardless of `verdict` — it cannot be judged safe from the queue alone.
 * Otherwise, `verdict` passes through unchanged.
 *
 * @param {"run-candidate"|"hold"|"escalate"} verdict
 * @param {{ blocked: boolean, dependsOn: string[], entries: Array<{feature: string, status: string}> }} precheck
 * @returns {"run-candidate"|"hold"|"escalate"}
 */
export function honourA1Verdict(verdict, precheck) {
  const p = precheck || {};
  if (p.blocked) {
    return "escalate";
  }
  const dependsOn = Array.isArray(p.dependsOn) ? p.dependsOn : [];
  const entries = Array.isArray(p.entries) ? p.entries : [];
  const unsettled = dependsOn.some((dep) => !entries.some((e) => e.feature === dep));
  if (unsettled) {
    return "escalate";
  }
  return verdict;
}

// ─── Advisory SeamOps builders (TSPEC §6.3/§6.4) ──────────────────────────────

/**
 * A1's `SeamOps` (TSPEC §6.3): triage-abstention adjudication. A1-4 — no file-changing
 * capability at all: `declaredScope`/`permittedActions` are both empty, `verifyGate` is null,
 * and `apply`/`producedPaths`/`revert` are unreachable (the generic driver never calls them when
 * `permittedActions` is empty) but throw descriptively rather than silently no-op if it ever did.
 *
 * @param {{ feature: string, reqPath: string, dependsOn: string[], triageReason: string, precheck: object }} args
 * @returns {import("./orchestrate-dev.js").SeamOps}
 */
function buildA1SeamOps({ feature, reqPath, dependsOn, triageReason, precheck }) {
  const unreachable = (member) => async () => {
    throw new Error(
      `A1 SeamOps.${member} is unreachable: permittedActions is empty (TSPEC §6.3, A1-4)`
    );
  };
  return {
    gatherEvidence: async () =>
      `Feature: ${feature}\nREQ: ${reqPath}\n` +
      `Phase-0 triage abstained: ${triageReason}\n` +
      `Declared dependencies: ${dependsOn.length ? dependsOn.join(", ") : "(none)"}\n` +
      `Pre-check: ${JSON.stringify(precheck)}`,
    prompt: (evidence) =>
      `A1 triage-abstention adjudication for "${feature}".\n${evidence}\n\n` +
      `Decide whether the pipeline should run for this candidate now. Reply with your verdict ` +
      `trailer; proposedAction must be exactly one of "run-candidate", "hold", or "escalate".`,
    conditionHolds: async () => true,
    apply: unreachable("apply"),
    producedPaths: unreachable("producedPaths"),
    revert: unreachable("revert"),
    verifyGate: null,
    declaredScope: [],
    permittedActions: [],
  };
}

/**
 * A2's `SeamOps` placeholder (TSPEC §6.4). PLAN A-31 lands A2's real re-grounding semantics
 * (gatherEvidence/prompt/apply/verifyGate); this task (A-30) only wires routing to A2 by seam
 * token, so this stub carries A2's structural declaredScope/permittedActions and throws on the
 * members A-31 has not landed yet, rather than silently no-op.
 *
 * @param {{ feature: string, reqPath: string }} args
 * @returns {import("./orchestrate-dev.js").SeamOps}
 */
function buildA2SeamOpsPlaceholder({ feature, reqPath }) {
  const notYetImplemented = (member) => async () => {
    throw new Error(`A2 SeamOps.${member} is not yet implemented (PLAN A-31) for "${feature}"`);
  };
  return {
    gatherEvidence: notYetImplemented("gatherEvidence"),
    prompt: notYetImplemented("prompt"),
    conditionHolds: notYetImplemented("conditionHolds"),
    apply: notYetImplemented("apply"),
    producedPaths: notYetImplemented("producedPaths"),
    revert: notYetImplemented("revert"),
    verifyGate: notYetImplemented("verifyGate"),
    declaredScope: [reqPath],
    permittedActions: ["E-4"],
  };
}

// ─── Prompt helper ───────────────────────────────────────────────────────────

export function triagePrompt(feature, reqPath, dependsOn) {
  const depList = dependsOn.length ? dependsOn.join(", ") : "(none declared)";
  return (
    `Phase-0 readiness triage for feature "${feature}".\n` +
    `REQ: ${reqPath}\n` +
    `Declared dependencies (must already be merged into the base branch): ${depList}\n\n` +
    `Determine whether the PDLC pipeline can author correct FSPEC/TSPEC/PLAN for this REQ NOW, ` +
    `given the current state of the codebase. Specifically verify, using git history and the ` +
    `working tree, that every declared dependency's implementation is present in the base. ` +
    `Also flag if the REQ references subsystems that do not yet exist.\n\n` +
    `Also check whether the REQ's file:line citations still resolve at HEAD. If some have drifted ` +
    `but every cited symbol still exists, return needs-human [SEAM:A2].\n\n` +
    `Do NOT modify any files. End your final message with exactly one line:\n` +
    `TRIAGE: ready        <one-line reason>   — dependencies satisfied, safe to run\n` +
    `TRIAGE: blocked      <one-line reason>   — a dependency is not yet in the base; skip for now\n` +
    `TRIAGE: needs-human [SEAM:A1] <one-line reason>   — ambiguous; a human must decide\n` +
    `TRIAGE: needs-human [SEAM:A2] <one-line reason>   — the REQ's file:line citations have drifted`
  );
}

// ─── Runtime API stubs (replaced by real runtime in production) ──────────────
/* Mirror orchestrate-dev: tests override these via dependency injection. */

// eslint-disable-next-line no-unused-vars
async function agent(skill, prompt, opts) {
  throw new Error("agent() not available outside Claude Code runtime");
}

// eslint-disable-next-line no-unused-vars
function phase(label) {
  // Provided by runtime
}

function log(message) {
  if (typeof console !== "undefined") {
    console.log("[orchestrate-queue]", message);
  }
}

// Default file IO — real fs, injectable for tests (mirrors mergeWorktree style).
async function defaultReadFile(path) {
  const { readFileSync } = await import("fs");
  try {
    return readFileSync(path, "utf8");
  } catch {
    return null;
  }
}

async function defaultWriteFile(path, contents) {
  const { writeFileSync } = await import("fs");
  writeFileSync(path, contents, "utf8");
}

// ─── TSPEC §3.4 — the transport seam's Node default ───────────────────────────

/**
 * Run a git command. The caller branches on `ok`; the seam interprets nothing
 * and never throws. `argv` is an array, NOT a command string: a string would
 * need quoting rules at the seam boundary and would make a feature name
 * containing a space a shell-injection surface.
 *
 * Mirrors `defaultGit` in orchestrate-dev.js (RLH-18). The two modules are
 * bundled into separate IIFEs, so the duplicate name is not a collision, and
 * each module stays independently loadable by the runtime.
 *
 * @param {string[]} argv - git arguments, NOT including the leading "git"
 * @param {{ execFn?: function }} [opts] - injection point for tests
 * @returns {Promise<{ ok: boolean, stdout: string, stderr: string }>}
 */
async function defaultGit(argv, { execFn } = {}) {
  const { execFileSync: realExecFileSync } = await import("child_process");
  const exec =
    execFn ?? ((file, args, opts) => realExecFileSync(file, args, opts));

  const args = Array.isArray(argv) ? argv : [];
  const execOpts = { stdio: "pipe", encoding: "utf8" };

  try {
    const stdout = exec("git", args, execOpts);
    return { ok: true, stdout: String(stdout ?? ""), stderr: "" };
  } catch (err) {
    return {
      ok: false,
      stdout: String((err && err.stdout) ?? ""),
      stderr: String((err && (err.stderr || err.message)) ?? ""),
    };
  }
}

/**
 * Default for `_readAdvisoryConfig` (TSPEC §6.1). Composes the raw-text read seam
 * (`readAdvisoryConfigSafely`, never throws — a missing/unreadable file maps to `null`) with the
 * pure parse (`parseAdvisoryConfig`), mirroring the read+parse composition orchestrate-dev's own
 * `main` uses for merge config (dev.js:1412-1413: `raw = await readMergeConfigSafely(...); parsed
 * = parseMergeConfig(raw);`). Callers receive the fully parsed `{config, sectionMalformed,
 * invalidKeys}` shape and never see raw JSON text.
 *
 * @param {function} readFileFn - async (path) => string|null
 * @param {string} path
 * @returns {Promise<{config: object, sectionMalformed: boolean, invalidKeys: string[]}>}
 */
async function defaultReadAdvisoryConfig(readFileFn, path) {
  const raw = await readAdvisoryConfigSafely(readFileFn, path);
  return parseAdvisoryConfig(raw);
}

// ─── main() ───────────────────────────────────────────────────────────────────

/**
 * Drive the queue: pick at most one ready REQ and run the full pipeline for it.
 *
 * @param {object} params
 * @param {string} [params.queuePath]   - Defaults to DEFAULT_QUEUE_PATH.
 * @param {function} [params._agent]      - Injected agent (triage).
 * @param {function} [params._readFile]   - async (path) => string|null.
 * @param {function} [params._writeFile]  - async (path, contents) => void.
 * @param {function} [params._git]        - async (argv) => {ok, stdout, stderr};
 *   TSPEC §3.6 — threads down to `rewriteStatus` so every status write is
 *   committed (§6.5). Never throws; the caller branches on `ok`.
 * @param {function} [params._runPipeline]- async ({reqPath}) => FinalReport.
 * @param {function} [params._log]        - Injected logger.
 * @param {function} [params._phase]      - Injected phase marker.
 * @returns {Promise<QueueReport>}
 */
export default async function main({
  queuePath = DEFAULT_QUEUE_PATH,
  _agent: rawAgentFn = agent,
  _readFile: readFileFn = defaultReadFile,
  _writeFile: writeFileFn = defaultWriteFile,
  _appendFile: appendFileFn = defaultAppendFile,
  _git: gitFn = defaultGit,
  _runPipeline: runPipelineFn = realMain,
  _runAdvisorySeam: runAdvisorySeamFn = runAdvisorySeam,
  _readAdvisoryConfig: readAdvisoryConfigFn = defaultReadAdvisoryConfig,
  _log: logFn = log,
  _phase: phaseFn = phase,
} = {}) {
  const emit = logFn;

  // MODEL-01: pin the queue's own agent calls (Phase-0 triage) to Sonnet. The
  // delegated orchestrate-dev pipeline is invoked without _agent below, so it uses
  // its OWN runtime agent and its OWN Opus-default model pinning — unaffected by this.
  const agentFn = (skill, prompt, opts) =>
    rawAgentFn(skill, prompt, { model: MODEL_QUEUE, ...opts });

  // ─── Drift gate (O-19, FSPEC §6.2/§6.4, TSPEC §12.3/§12.4) ───────────────
  // Runs BEFORE the queue is even read, so a blocked drift state costs no queue
  // work. `readDriftStateSafely` is the O-19(d) wrapper: the injected read is
  // agent-mediated (rtReadFile, runtime-adapter.js:85-96), not a raw filesystem
  // call, and that seam never throws in production — it maps a missing/unreadable
  // file to `null` itself. The wrapper exists anyway (defence in depth, O-19(c)):
  // if some future/alternate read implementation DID throw, propagating that
  // exception here would abort the whole queue invocation instead of yielding a
  // `blocked` verdict, which is the wrong failure mode for something that must
  // fail closed onto row 1 (FSPEC §6.2 row 1 — "hook never ran").
  phaseFn("Queue: Drift gate");
  const driftRaw = await readDriftStateSafely(readFileFn, DRIFT_STATE_PATH);
  const driftGate = mapDriftState(validateDriftRecord(driftRaw));
  if (driftGate.outcome === "blocked") {
    emit(
      `Queue blocked by drift gate (row ${driftGate.row}): ${driftGate.reasons.join("; ")}`
    );
    return buildQueueReport({
      outcome: "blocked",
      reason: `Drift gate row ${driftGate.row}: ${driftGate.reasons.join("; ")}`,
      remaining: 0,
      driftReport: driftGate.report,
    });
  }

  // A PROCEEDING verdict is not necessarily a silent one. Row 9 is the trivial
  // all-clear (empty `reasons`, empty report) and says nothing; every other
  // proceeding row carries something the operator must still see:
  //   • row 2 — the checkEnabled:false opt-out. AC-4.1 row 2 is "proceed; skip
  //     noted in report", AC-4.3 is "skips state evaluation and notes the skip".
  //     A queue that ran a stale tree without saying so would be exactly the
  //     silent-degradation this feature exists to prevent.
  //   • row 8 — local-edit / unverified rows. AC-4.1 row 8 is "proceed, rows
  //     named in the run report".
  // Both obligations are on the RETURNED QueueReport (and the run log), not on
  // `mapDriftState`'s node output — so the notice is captured once here and
  // `finish` is the single funnel every remaining exit path in this pass returns
  // through, `runPicked`'s two included. Adding a new `return` below that calls
  // `buildQueueReport` directly would silently reopen this gap.
  const driftNotice = driftGate.row === 9 ? null : driftGate.report;
  if (driftNotice) {
    emit(
      `Drift gate proceeding (row ${driftGate.row}): ${driftGate.reasons.join("; ")}`
    );
  }
  const finish = (fields) => buildQueueReport({ ...fields, driftReport: driftNotice });

  // ─── Advisory-tier config (TSPEC §6.1) ───────────────────────────────────
  // Read once per run: after the drift gate (a blocked gate costs no advisory work) and before
  // QUEUE.md is read, so every candidate walked below shares one config read and one rung-state
  // memo (TSPEC §3.4/§3.5 — model-rung resolution happens once per run, not once per seam call).
  const advisoryConfig = await readAdvisoryConfigFn(readFileFn, ADVISORY_CONFIG_PATH);
  const rungState = { resolved: null };

  // ─── Load queue ─────────────────────────────────────────────────────────
  phaseFn("Queue: Load");
  const queueText = await readFileFn(queuePath);
  if (queueText == null) {
    return finish({
      outcome: "no-queue",
      reason: `Queue file not found at ${queuePath}`,
      remaining: 0,
    });
  }

  const entries = parseQueue(queueText);
  const remainingPending = entries.filter((e) => e.status === "pending").length;

  // ─── Select candidate(s) ─────────────────────────────────────────────────
  phaseFn("Queue: Select");
  const selection = selectNextPending(entries);

  if (selection.kind === "blocked-active") {
    emit(
      `Queue blocked: "${selection.entry.feature}" is still in-progress. ` +
        `Resolve it (mark done/awaiting-merge or reset to pending) before new work is picked up.`
    );
    return finish({
      outcome: "blocked",
      reason: `An entry is in-progress: ${selection.entry.feature}`,
      remaining: remainingPending,
      active: selection.entry.feature,
    });
  }

  if (selection.kind === "empty") {
    emit(`Nothing to pick up — ${selection.reason}.`);
    return finish({
      outcome: "idle",
      reason: selection.reason,
      remaining: 0,
    });
  }

  // ─── Walk candidates in order; run readiness triage on each until one is ready ──
  phaseFn("Queue: Triage");
  const skipped = [];

  for (const entry of selection.candidates) {
    // REQ-gate: frontmatter must mark ready:true and contributes extra deps. `readFileFn`'s
    // documented contract is `async (path) => string|null` (never throws), but a queue may walk
    // past entries whose REQ was never seeded for this candidate's scenario — tolerate an
    // injected double that throws (e.g. an ENOENT-shaped error) the same as a documented `null`.
    let reqText;
    try {
      reqText = await readFileFn(entry.reqPath);
    } catch {
      reqText = null;
    }
    if (reqText == null) {
      emit(`Skip "${entry.feature}": REQ not found at ${entry.reqPath}.`);
      skipped.push({ feature: entry.feature, reason: "REQ file missing" });
      continue;
    }

    const fm = parseReqFrontmatter(reqText);
    if (!fm.ready) {
      emit(`Skip "${entry.feature}": REQ not marked ready: true (still a draft).`);
      skipped.push({ feature: entry.feature, reason: "REQ not marked ready" });
      continue;
    }

    // Union of declared dependencies (QUEUE ∪ REQ frontmatter).
    const dependsOn = Array.from(
      new Set([...(entry.dependsOn || []), ...(fm.dependsOn || [])])
    );

    // Deterministic pre-check: if the queue already shows a dependency as not done,
    // it is definitely blocked — skip without spawning a (Sonnet) triage agent.
    const precheck = precheckDependencies(dependsOn, entries);
    if (precheck.blocked) {
      emit(`Skip "${entry.feature}": blocked (pre-check) — ${precheck.reason}.`);
      skipped.push({
        feature: entry.feature,
        reason: `blocked (pre-check): ${precheck.reason}`,
      });
      continue;
    }

    // Phase-0 readiness triage against the actual codebase.
    const triageResult = await agentFn(
      "se-author",
      triagePrompt(entry.feature, entry.reqPath, dependsOn)
    );
    const triage = parseTriageVerdict(triageResult);

    if (triage.verdict === "blocked") {
      emit(`Skip "${entry.feature}": blocked — ${triage.reason}.`);
      skipped.push({ feature: entry.feature, reason: `blocked: ${triage.reason}` });
      continue;
    }
    if (triage.verdict === "needs-human") {
      // TSPEC §6.1/§6.2 — the seam token on the triage verdict names the route; default to A1
      // (triage-abstention adjudication) when no recognised token is present.
      const seam = triage.seamToken === "A2" ? "A2" : "A1";
      const seamOps =
        seam === "A2"
          ? buildA2SeamOpsPlaceholder({ feature: entry.feature, reqPath: entry.reqPath })
          : buildA1SeamOps({
              feature: entry.feature,
              reqPath: entry.reqPath,
              dependsOn,
              triageReason: triage.reason,
              precheck,
            });

      // A1/A2 dispatch through the raw agent, NOT the MODEL_QUEUE-pinned `agentFn` wrapper
      // (TSPEC §6.1) — the advisory driver resolves its own model rung.
      const advisoryDisposition = await runAdvisorySeamFn({
        seam,
        feature: entry.feature,
        seamOps,
        config: advisoryConfig.config,
        rungState,
        _agent: rawAgentFn,
        _appendFile: appendFileFn,
        _writeFile: writeFileFn,
        _readFile: readFileFn,
        _git: gitFn,
        _log: emit,
      });

      if (seam === "A1") {
        // Decision #3 (this file's own header / advisoryQueueSeams.test.js): A1 declares
        // permittedActions: [], so the generic driver always classifies A1's real recommendation
        // as out-of-envelope — that is A1's normal completion, not a driver failure. Read
        // `disposition.verdict.proposedAction` through `honourA1Verdict` only in that case; any
        // other escalation reason is an unconditional escalate regardless of proposedAction.
        const action =
          advisoryDisposition.reason === "out-of-envelope" && advisoryDisposition.verdict
            ? honourA1Verdict(advisoryDisposition.verdict.proposedAction, {
                blocked: precheck.blocked,
                dependsOn,
                entries,
              })
            : "escalate";

        if (action === "run-candidate") {
          return runPicked({
            entry,
            dependsOn,
            triageReason: triage.reason,
            queuePath,
            queueText,
            remainingPending,
            skipped,
            runPipelineFn,
            writeFileFn,
            readFileFn,
            gitFn,
            phaseFn,
            emit,
            finish,
          });
        }

        emit(`Skip "${entry.feature}": A1 adjudicated ${action} — ${triage.reason}.`);
        skipped.push({
          feature: entry.feature,
          reason: `needs-human (A1 ${action}): ${triage.reason}`,
        });
        continue;
      }

      // A2 (PLAN A-31 lands its real apply/verifyGate handling) — for this task's scope, an A2
      // route never picks the candidate; it is skipped exactly like any other needs-human stop.
      emit(`Skip "${entry.feature}": needs human decision (A2) — ${triage.reason}.`);
      skipped.push({
        feature: entry.feature,
        reason: `needs-human (A2): ${triage.reason}`,
      });
      continue;
    }

    // ─── triage.verdict === "ready": run the pipeline for exactly this entry ──
    return runPicked({
      entry,
      dependsOn,
      triageReason: triage.reason,
      queuePath,
      queueText,
      remainingPending,
      skipped,
      runPipelineFn,
      writeFileFn,
      readFileFn,
      gitFn,
      // `queueText` is deliberately NOT passed: every status write now re-reads
      // at write time through `rewriteStatus`, so a pre-run snapshot would be
      // stale by construction (TSPEC §3.6).
      phaseFn,
      emit,
      finish,
    });
  }

  // No candidate became ready this pass.
  emit(`No ready REQ this pass (${skipped.length} candidate(s) skipped).`);
  return finish({
    outcome: "idle",
    reason: "no candidate passed the readiness gate",
    remaining: remainingPending,
    skipped,
  });
}

/**
 * Mark the picked entry in-progress, run the pipeline, then record the outcome.
 * Status transitions: pending → in-progress → awaiting-merge (success) | halted.
 * Note: success is `awaiting-merge`, NOT `done` — a human merges the PR and sets
 * `done`, which is the signal a dependent's Phase-0 triage looks for in the base.
 */
async function runPicked({
  entry,
  dependsOn,
  triageReason,
  queuePath,
  remainingPending,
  skipped,
  runPipelineFn,
  writeFileFn,
  readFileFn,
  gitFn,
  phaseFn,
  emit,
  // `main`'s exit funnel — carries the proceeding drift notice onto whichever
  // report this pass returns (see the `finish` comment in `main`). Injected
  // rather than recomputed so there is exactly one place that decides it.
  finish,
}) {
  phaseFn(`Pipeline: ${entry.feature}`);
  emit(
    `Picked "${entry.feature}" (deps: ${
      dependsOn.length ? dependsOn.join(", ") : "none"
    }) — ${triageReason}. Running orchestrate-dev.`
  );

  // Persist in-progress BEFORE running so a crash leaves a visible marker.
  // TSPEC §6.5 scopes the commit to *every* status write, not only `halted`:
  // `in-progress` and `awaiting-merge` become durable too, which is a strict
  // improvement and avoids a second, divergent code path.
  await rewriteStatus(
    queuePath,
    entry.feature,
    "in-progress",
    readFileFn,
    writeFileFn,
    gitFn
  );

  let report;
  try {
    report = await runPipelineFn({ reqPath: entry.reqPath });
  } catch (err) {
    await rewriteStatus(
      queuePath,
      entry.feature,
      "halted",
      readFileFn,
      writeFileFn,
      gitFn
    );
    return finish({
      outcome: "halted",
      reason: `Pipeline threw for ${entry.feature}: ${err && err.message}`,
      remaining: remainingPending - 1,
      picked: entry.feature,
    });
  }

  const succeeded = report && report.outcome === "success";
  // TSPEC §9.1 — `mergeStatus` rides the pipeline report Phase MERGE (A7/A8)
  // populates. Read defensively: a report without the field (an older bundle,
  // a throw-path stub) is `undefined`, which is not `"merged"`, so a missing
  // field falls back to today's `awaiting-merge` behaviour rather than a
  // wrongly-recorded `done` (fail-safe direction, FSPEC §7.5). `merged` can
  // only be true when `succeeded` is also true — Q-02's mutual exclusion.
  const merged = succeeded && report.mergeStatus === "merged";
  const newStatus = merged ? "done" : succeeded ? "awaiting-merge" : "halted";
  await rewriteStatus(
    queuePath,
    entry.feature,
    newStatus,
    readFileFn,
    writeFileFn,
    gitFn
  );

  emit(
    merged
      ? `"${entry.feature}" complete and merged (${report.mergeSha ?? "sha unknown"}) — status set to done.`
      : succeeded
      ? `"${entry.feature}" complete — status set to awaiting-merge. Merge the PR, then set it to done to unblock dependents.`
      : `"${entry.feature}" halted: ${report && report.haltReason}. Status set to halted.`
  );

  return finish({
    outcome: succeeded ? "ran" : "halted",
    reason: succeeded
      ? `Pipeline succeeded for ${entry.feature}`
      : `Pipeline halted for ${entry.feature}: ${report && report.haltReason}`,
    remaining: remainingPending - 1,
    picked: entry.feature,
    pipelineReport: report,
    skipped,
  });
}

/**
 * Re-read the queue (the pipeline may have touched it), set a feature's status,
 * and commit that one row (TSPEC §6.5).
 *
 * **Exported deliberately, and load-bearing** (TSPEC §3.6): the bundle can only
 * publish names the module exports (`stripModuleSyntax` rewrites `export
 * function` to `function`; `wrapModule` re-publishes only the names in its
 * `exportedNames` list), and `build-runtime.mjs`'s `_recordQueueRow` closure
 * has to reach this function through `__queue`.
 *
 * The re-read is not defensive padding: the pipeline that just ran may itself
 * have rewritten the queue, so a snapshot taken before the run is stale by
 * construction. Exactly one read, at write time.
 *
 * Never throws for a git failure — §6.5's "commit failure does not downgrade the
 * halt". The row is on disk either way; only its durability is at stake.
 *
 * @param {string} queuePath
 * @param {string} feature
 * @param {string} status
 * @param {function} readFileFn  - async (path) => string|null
 * @param {function} writeFileFn - async (path, contents) => void
 * @param {function} [gitFn]     - async (argv) => {ok, stdout, stderr}
 * @returns {Promise<{ queueRow: string, detail?: string }>}
 *   `queueRow` is drawn from `QUEUE_ROW_DISPOSITIONS`, TSPEC §4.7's / §8.2's
 *   closed catalogue: `"recorded" | "recorded (uncommitted)" | "none" |
 *   "error"`. The catalogue describes the *row disposition*, not the status
 *   written, so a recorded write reports `"recorded"` whatever `status` was.
 */
export async function rewriteStatus(
  queuePath,
  feature,
  status,
  readFileFn,
  writeFileFn,
  gitFn = defaultGit,
  evidence = null
) {
  const current = await readFileFn(queuePath);

  // FSPEC §14.3 — no queue document at all. Reporting `"none"` (rather than an
  // error) is what stops a direct, queue-less invocation turning one failure
  // into two. No write, no git.
  if (current === null || current === undefined) {
    return { queueRow: "none" };
  }

  const { markdown, matched, written, foundStatus } = updateQueueStatus(
    current,
    feature,
    status,
    evidence
  );

  // FSPEC §13.5 — document present, row expected, row absent. Distinct from
  // "none": something removed the row mid-run, which the operator must see.
  // Write nothing and touch git not at all; a write here would clobber the
  // queue with an unchanged copy and hide the discrepancy.
  if (!matched) {
    return {
      queueRow: "error",
      detail:
        `no row for ${feature} in ${queuePath}; ` +
        `status "${status}" was not recorded`,
    };
  }

  // §2.5 / TSPEC §8.4c — evidence supplied, but the row's current status is
  // not one this write is allowed to overwrite. `updateQueueStatus` already
  // returned the file byte-unchanged; skip the write and the git commit
  // entirely, and name the status that blocked it.
  if (written === false) {
    return {
      queueRow: "recorded",
      detail: `row for ${feature} left unchanged: found status "${foundStatus}", not overwritable`,
    };
  }

  await writeFileFn(queuePath, markdown);
  return await commitQueueRow(queuePath, feature, status, gitFn);
}

/** `git`'s idempotence signal. Emitted on stdout by some versions, stderr by others. */
const NOTHING_TO_COMMIT_RE = /nothing to commit/i;

/** First line only — a multi-line hook rejection must not flood the report. */
function firstLine(text) {
  return String(text ?? "").split("\n")[0].trim();
}

/**
 * TSPEC §6.5 — exactly two `_git` invocations, in order:
 *
 *     git add    -- {queuePath}
 *     git commit -m "chore(queue): {feature} → {status}" -- {queuePath}
 *
 * Both are pathspec-scoped after `--`. `git commit -a` would sweep unrelated
 * working-tree changes into a queue-status commit, and a halted pipeline
 * routinely leaves a partially written document in the tree — that partial
 * progress is what the recovery path resumes from, so the tree is neither
 * cleaned nor treated as an error. No `push`: the halt must survive the
 * *process*, which a local commit achieves.
 *
 * @returns {Promise<{ queueRow: string, detail?: string }>}
 */
async function commitQueueRow(queuePath, feature, status, gitFn) {
  const added = await gitFn(["add", "--", queuePath]);
  if (!added.ok) return uncommitted(added, queuePath);

  const committed = await gitFn([
    "commit",
    "-m",
    `chore(queue): ${feature} → ${status}`,
    "--",
    queuePath,
  ]);
  if (committed.ok) return { queueRow: "recorded" };

  // E-39 — the row already read the target status and was already committed
  // (the common case on a re-entry). Idempotence, not a fault: no warning, and
  // nothing to narrate. `git` reports it on stdout or stderr depending on
  // version, so both are inspected.
  if (
    NOTHING_TO_COMMIT_RE.test(committed.stdout ?? "") ||
    NOTHING_TO_COMMIT_RE.test(committed.stderr ?? "")
  ) {
    return { queueRow: "recorded" };
  }

  return uncommitted(committed, queuePath);
}

/**
 * E-38 / FSPEC §13.4 — the row is correct on disk but git refused (hook
 * rejection, missing identity, index lock). Distinct from `"error"` because the
 * operator's remaining action differs: a manual commit, not a re-run.
 */
function uncommitted(result, queuePath) {
  const reason = firstLine(result && result.stderr);
  return {
    queueRow: "recorded (uncommitted)",
    detail:
      `queue row written but not committed` +
      (reason ? `: ${reason}` : "") +
      `; commit ${queuePath} manually`,
  };
}

// ─── Report builder ───────────────────────────────────────────────────────────

/**
 * @typedef {Object} QueueReport
 * @property {"ran"|"halted"|"idle"|"blocked"|"no-queue"} outcome
 * @property {string} reason
 * @property {number} remaining        - pending entries left after this pass
 * @property {string} [picked]         - feature run this pass (if any)
 * @property {string} [active]         - in-progress feature blocking pickup (if any)
 * @property {object} [pipelineReport] - the orchestrate-dev FinalReport (if a pipeline ran)
 * @property {Array}  [skipped]        - candidates skipped this pass with reasons
 * @property {{manifest:string[], row:string[], run:string[]}} [driftReport] - the drift gate's
 *   Manifest/Row/Run reasons (FSPEC §6.3). Present whenever the gate had something to say —
 *   on a `blocked` verdict, and on a proceeding verdict at any row other than 9's all-clear
 *   (AC-4.1 rows 2 and 8, AC-4.3). Absent exactly when the gate was silent.
 */
function buildQueueReport({
  outcome,
  reason,
  remaining,
  picked,
  active,
  pipelineReport,
  skipped,
  driftReport,
}) {
  return {
    outcome,
    reason,
    remaining: typeof remaining === "number" ? Math.max(0, remaining) : 0,
    ...(picked ? { picked } : {}),
    ...(active ? { active } : {}),
    ...(pipelineReport ? { pipelineReport } : {}),
    ...(skipped && skipped.length ? { skipped } : {}),
    ...(driftReport ? { driftReport } : {}),
  };
}

// ─── DRIFT-01: validateDriftRecord (TSPEC §12.1, FSPEC §1.3 / §6.2 row 1) ────
//
// Shape validator for the single injected read of `.claude/workflows/.pdlc-drift-state.json`
// (FSPEC §6.1). Pure — no filesystem, no model calls. Defence in depth only: the hook is the
// primary drift detector; this validator exists to fail closed (⇒ `blocked`) on any relay that
// is not byte-faithful to what the writer produced, since the read is LLM-mediated (an agent
// turn), not a raw filesystem read (§6.1). It does not, and cannot, detect a relay that mangles
// a *value* while staying inside that value's closed set (§6.1's stated residual) — only shapes.
//
// Clause order is significant: clauses are checked D1 → D8 and the FIRST failing clause is
// reported, matching FSPEC §6.2's row-1 predicate table and TSPEC §12.1's one-clause-per-row
// fixtures. `mapDriftState` (T-12) consumes this function's `{ok, record}` / `{ok, clause}`
// result as its own row 1; the mapping/report/gate-wiring layers are out of this task's scope.

const DRIFT_CLOSED_ROW_STATES = ["in-sync", "missing", "stale", "local-edit", "unverified", "unknown"];

const DRIFT_CLOSED_ROW_REASONS = [
  "hash-tool-absent",
  "plugin-artifact-missing",
  "plugin-artifact-unreadable",
  "consumer-artifact-unreadable",
];

// §2.8's declared precedence order is irrelevant here — D4 only needs closed-set membership,
// not ranking.
const DRIFT_CLOSED_BASELINE_REASONS = [
  "drift-state-invalidated",
  "manifest-empty",
  "json-tool-absent",
  "manifest-malformed",
  "manifest-absent",
  "repo-root-unresolved",
  "plugin-root-unreadable",
  "plugin-root-unset",
];

const DRIFT_CLOSED_GENERATED_BY = ["hook", "check", "sync"];

function isDriftPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// D3 — schemaVersion present, integer 1.
function failsD3(record) {
  return !(typeof record.schemaVersion === "number" && Number.isInteger(record.schemaVersion) && record.schemaVersion === 1);
}

// D4 — baselineStatus one of "resolved" | "unresolved"; baselineReason present and either
// null or one of the eight closed baseline reasons (FSPEC §6.2's literal clause text, TSPEC
// §12.1 row 6/7). Note (T-12): this clause does NOT correlate baselineReason's null-ness with
// baselineStatus — a "resolved" record carrying a closed baseline reason (e.g.
// "drift-state-invalidated") is shape-valid under D4. §2.8/§4.4 describe what real writers
// produce (baselineStatus:"unresolved" alongside "drift-state-invalidated"), but that is a
// writer-side invariant, not a reader-side shape constraint — §6.2's row 3 precedence fixture
// (TSPEC §12.2) is exactly a shape-valid "resolved" record carrying that reason, and mapDriftState
// must still be able to reach it.
function failsD4(record) {
  if (record.baselineStatus !== "resolved" && record.baselineStatus !== "unresolved") {
    return true;
  }
  return record.baselineReason !== null && !DRIFT_CLOSED_BASELINE_REASONS.includes(record.baselineReason);
}

// D5 — checkEnabled present boolean (not the string "false", not absent).
function failsD5(record) {
  return typeof record.checkEnabled !== "boolean";
}

// D6 — rows, retiredPresent, writeFailures all present arrays.
function failsD6(record) {
  return (
    !Array.isArray(record.rows) ||
    !Array.isArray(record.retiredPresent) ||
    !Array.isArray(record.writeFailures)
  );
}

// D7 — every member of rows / retiredPresent / writeFailures is shape-valid. Only called once
// D6 has already confirmed all three are arrays.
function failsD7(record) {
  const rowsOk = record.rows.every(
    (row) =>
      isDriftPlainObject(row) &&
      typeof row.id === "string" &&
      row.id.length > 0 &&
      DRIFT_CLOSED_ROW_STATES.includes(row.state) &&
      (row.reason === null || DRIFT_CLOSED_ROW_REASONS.includes(row.reason))
  );
  if (!rowsOk) return true;

  const retiredOk = record.retiredPresent.every(
    (entry) =>
      isDriftPlainObject(entry) &&
      typeof entry.path === "string" &&
      entry.path.length > 0 &&
      typeof entry.supersededBy === "string" &&
      entry.supersededBy.length > 0 &&
      DRIFT_CLOSED_ROW_STATES.includes(entry.supersedingState)
  );
  if (!retiredOk) return true;

  return !record.writeFailures.every(
    (failure) =>
      isDriftPlainObject(failure) &&
      typeof failure.path === "string" &&
      typeof failure.operation === "string"
  );
}

// D8 — generatedBy closed-set; pluginVersion null-or-string; syncCommand, if present,
// null-or-string. Absence of syncCommand is the one thing D8 tolerates (FSPEC §1.3, SE F-16).
function failsD8(record) {
  if (!DRIFT_CLOSED_GENERATED_BY.includes(record.generatedBy)) return true;
  if (!(record.pluginVersion === null || typeof record.pluginVersion === "string")) return true;
  if ("syncCommand" in record) {
    if (!(record.syncCommand === null || typeof record.syncCommand === "string")) return true;
  }
  return false;
}

const DRIFT_CLAUSE_CHECKS = [
  ["D3", failsD3],
  ["D4", failsD4],
  ["D5", failsD5],
  ["D6", failsD6],
  ["D7", failsD7],
  ["D8", failsD8],
];

// Runs D3–D8 against a parsed top-level object, in order, returning the first failing clause
// id or `null` when every clause is satisfied. Shared by the top-level validation and by the
// single-level envelope check below (TSPEC §12.1 row 4).
function firstFailingDriftClause(record) {
  for (const [clauseId, fails] of DRIFT_CLAUSE_CHECKS) {
    if (fails(record)) return clauseId;
  }
  return null;
}

/**
 * Validate the shape of a drift-state record as relayed by the injected read (FSPEC §6.1,
 * §6.2 row 1; TSPEC §12.1). `value` is whatever the injected read returned — the caller is
 * responsible for normalising a throw to `null` (O-19(d)); this function only judges shape.
 *
 * @param {unknown} value
 * @returns {{ok:true, record:object} | {ok:false, clause:"D1"|"D2"|"D3"|"D4"|"D5"|"D6"|"D7"|"D8"}}
 */
export function validateDriftRecord(value) {
  // D1 — a usable value. In production this is always a string (or `null`, per §6.1) because the
  // seam is a raw, LLM-mediated file read; some callers validate an already-parsed record object
  // obtained by other means (e.g. AT-24's end-to-end fresh-clone assertion, which reads the
  // written drift-state JSON directly off disk), so a plain object is accepted here too and
  // treated as already having passed D2's JSON-parse step. Anything else (`null`, an array, a
  // scalar) is D1.
  let parsed;
  if (typeof value === "string") {
    // D2 — parses as JSON, and the top level is an object (not an array or a scalar).
    try {
      parsed = JSON.parse(value);
    } catch {
      return { ok: false, clause: "D2" };
    }
  } else if (isDriftPlainObject(value)) {
    parsed = value;
  } else {
    return { ok: false, clause: "D1" };
  }

  if (!isDriftPlainObject(parsed)) {
    return { ok: false, clause: "D2" };
  }

  // D2's single-level known-envelope check (TSPEC §12.1 row 4, v2.1 TE Q-02): a top-level
  // object with exactly one key, "result", whose value is ITSELF fully shape-valid, is a
  // mangled relay (re-wrapped), not a record to unwrap. This check goes exactly one level
  // deep — it does not recurse the inner value through this same envelope check again — so
  // `{"result": 42}` is judged on its own top-level shape (⇒ D3, schemaVersion missing) rather
  // than being treated as an envelope, because 42 is not itself shape-valid.
  const keys = Object.keys(parsed);
  if (
    keys.length === 1 &&
    keys[0] === "result" &&
    isDriftPlainObject(parsed.result) &&
    firstFailingDriftClause(parsed.result) === null
  ) {
    return { ok: false, clause: "D2" };
  }

  const clause = firstFailingDriftClause(parsed);
  if (clause) {
    return { ok: false, clause };
  }

  return {
    ok: true,
    record: {
      ...parsed,
      syncCommand: "syncCommand" in parsed ? parsed.syncCommand : null,
    },
  };
}

// ─── T-12: mapDriftState — the ten-row precedence mapping (AC-4.1, TSPEC §12.2) ─────────────
//
// A pure function of `validateDriftRecord`'s result (never of the raw injected read — the
// call site is O-19(d)'s job, T-13). Every branch below is ordered exactly as FSPEC §6.2's
// precedence table and each later branch's fixture is required (TSPEC §12.2) to "defeat" every
// row above it, so the ORDER of these checks is itself the spec, not an implementation detail.
//
// Report shape: the three reason sets (Manifest / Row / Run, FSPEC §6.3) are disjoint, so
// `report` is always `{ manifest: string[], row: string[], run: string[] }` — never a flat
// list — because a flat list would let a Row-level reason print under Manifest with nothing
// to catch it (TSPEC §12.2, rows 3/4/7's structural assertions).

function emptyReport() {
  return { manifest: [], row: [], run: [] };
}

function gate(outcome, row, reasons, report) {
  return { outcome, row, reasons, report };
}

/**
 * Map a `validateDriftRecord` result to the queue's gate verdict (FSPEC §6.2, TSPEC §12.2).
 *
 * @param {{ok:true, record:object} | {ok:false, clause:string} | null | undefined} validated
 * @returns {{outcome:"blocked"|"proceed", row:number, reasons:string[], report:{manifest:string[], row:string[], run:string[]}}}
 */
export function mapDriftState(validated) {
  // Row 1 — the read did not yield a shape-valid record (FSPEC §6.2 row 1; D1-D8 upstream).
  // This is the mapping's own fail-closed floor: every one of validateDriftRecord's negative
  // clauses (D1-D8) lands here, undifferentiated, because none of rows 2-10 below can be
  // trusted to mean what they say once the shape itself is unverified.
  if (!validated || validated.ok !== true) {
    const clause = validated && typeof validated.clause === "string" ? validated.clause : "D1";
    const reasons = [`drift state did not yield a usable record (${clause})`];
    return gate("blocked", 1, reasons, { manifest: reasons, row: [], run: [] });
  }

  const record = validated.record;

  // Row 2 — checkEnabled:false is the operator's opt-out. It sits above every row below EXCEPT
  // row 1 (FSPEC §6.2's "three further design points") — so it must be checked before rows
  // 3-10, deliberately even when the record also carries their conditions (TSPEC §12.2 row 2).
  if (record.checkEnabled === false) {
    const reasons = ["checkEnabled is false — drift check skipped by operator opt-out (AC-4.3)"];
    return gate("proceed", 2, reasons, { manifest: reasons, row: [], run: [] });
  }

  // Row 3 — a non-empty writeFailures blocks even with checkEnabled:true (AT-31(a)). Named at
  // Run level, one line per entry; `drift-state-invalidated`, when carried, renders at Manifest
  // level (FSPEC §6.3 — "drift-state-invalidated's rendering site is the Manifest-level line").
  if (Array.isArray(record.writeFailures) && record.writeFailures.length > 0) {
    const run = record.writeFailures.map(
      (failure) => `write failure: ${failure.path} (${failure.operation})`
    );
    const manifest =
      record.baselineReason === "drift-state-invalidated" ? ["drift-state-invalidated"] : [];
    return gate("blocked", 3, [...manifest, ...run], { manifest, row: [], run });
  }

  // Row 4 — baselineStatus:"unresolved" blocks once writeFailures is empty (defeats row 3).
  // Named at Manifest level only.
  if (record.baselineStatus === "unresolved") {
    const manifest = [String(record.baselineReason)];
    return gate("blocked", 4, manifest, { manifest, row: [], run: [] });
  }

  // Row 5 — any row "unknown" blocks, ordered above a co-occurring stale row (defeats row 6).
  if (record.rows.some((row) => row.state === "unknown")) {
    const row = record.rows
      .filter((r) => r.state === "unknown")
      .map((r) => `${r.id}: unknown${r.reason ? ` (${r.reason})` : ""}`);
    return gate("blocked", 5, row, { manifest: [], row, run: [] });
  }

  // Row 6 — any row "missing" or "stale" blocks, ordered above a co-occurring retired path
  // (defeats row 7).
  if (record.rows.some((row) => row.state === "missing" || row.state === "stale")) {
    const row = record.rows
      .filter((r) => r.state === "missing" || r.state === "stale")
      .map((r) => `${r.id}: ${r.state}`);
    return gate("blocked", 6, row, { manifest: [], row, run: [] });
  }

  // Row 7 — retiredPresent non-empty blocks even with every row in-sync (AT-31(b)). Named at
  // Row level, never Manifest level (a flat list would hide it there — TSPEC §12.2).
  if (Array.isArray(record.retiredPresent) && record.retiredPresent.length > 0) {
    const row = record.retiredPresent.map((entry) => `retired artifact present: ${entry.path}`);
    return gate("blocked", 7, row, { manifest: [], row, run: [] });
  }

  // Row 8 — local-edit / unverified rows proceed, named in the run report (FSPEC §6.2 row 8's
  // literal text: "rows named in the run report").
  if (record.rows.some((row) => row.state === "local-edit" || row.state === "unverified")) {
    const run = record.rows
      .filter((r) => r.state === "local-edit" || r.state === "unverified")
      .map((r) => `${r.id}: ${r.state}`);
    return gate("proceed", 8, run, { manifest: [], row: [], run });
  }

  // Row 9 — resolved, non-empty rows, all in-sync, both arrays empty ⇒ proceed silently.
  if (
    record.baselineStatus === "resolved" &&
    record.rows.length > 0 &&
    record.rows.every((row) => row.state === "in-sync") &&
    record.retiredPresent.length === 0 &&
    record.writeFailures.length === 0
  ) {
    return gate("proceed", 9, [], emptyReport());
  }

  // Row 10 — the terminal row: shape-valid but matches no row 1-9 (FSPEC §6.2's totality
  // argument — e.g. `resolved` with `rows: []`, which row 9 explicitly excludes).
  const reasons = ["drift state does not describe a recognised outcome"];
  return gate("blocked", 10, reasons, { manifest: reasons, row: [], run: [] });
}

// ─── T-13: readDriftStateSafely — the O-19(d) wrapper (TSPEC §12.3) ─────────
//
// O-19(c): the injected read this wraps (`_readFile`, production: `rtReadFile`,
// runtime-adapter.js:85-96) is LLM-mediated — an agent turn that reads a file and
// relays its contents as the agent's final message — not a raw filesystem call.
// `rtReadFile` itself never throws today: it maps "file absent / unreadable" to a
// returned `null`, the same as this module's own `defaultReadFile`. This wrapper's
// `try`/`catch` is therefore defence in depth (O-19(d)), not dead code covering an
// impossible path: it is what stands between a hypothetical throwing read (a
// transport failure some other future/alternate injected implementation surfaces
// as an exception rather than a `null`) and an *aborted* queue invocation. Without
// it, that throw would propagate out of `main` entirely instead of mapping to
// `mapDriftState`'s row 1 `blocked` verdict with a returned report — the fail-closed
// behavior FSPEC §6.2 row 1 ("hook never ran") requires. The call site (`main`,
// below) `await`s this — per CLAUDE.md's runtime rule, every injected IO call must
// be awaited because the runtime adapter's implementations are async.
//
// @param {function} readFileFn - async (path) => string|null (or throws)
// @param {string} path - DRIFT_STATE_PATH
// @returns {Promise<unknown>} the raw read result, or `null` on any throw
export async function readDriftStateSafely(readFileFn, path) {
  try {
    return await readFileFn(path);
  } catch {
    return null;
  }
}
