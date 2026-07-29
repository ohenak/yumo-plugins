/**
 * driftOrdering.js — the trace grammar (TSPEC §4.1), the classify-phase rule (§4.2), and
 * the ordering/tree-invariance assertions built on top of them (§4.3, §8.3).
 *
 * Ownership (PLAN, single-writer-per-file across batches): T-16 (batch 4) owns this file
 * exactly. No later task touches it — `assertClassifyBeforeCreate` and
 * `assertRecordedPassIs` are consumed, not written, by T-29/T-43 (batch 5/12), and both are
 * specified in full here even though T-01 clause (c)'s contract suite exercises only the
 * codec, `parseTrace`'s throw, `assertPhaseOrder`, the multiset form of
 * `assertPostCopyNarrow`, and the `.git/`-excluding form of `assertTreeUnchanged`.
 */

import { readFileSync, readdirSync, readlinkSync } from "fs";
import { join, relative, sep } from "path";

// ───────────────────────────── §4.1 the percent codec ─────────────────────────────

const PERCENT_ESCAPE_RE = /^[0-9A-Fa-f]{2}$/;

/**
 * Byte-exact inverse of TSPEC §4.1's encoding rule (`%`, tab, newline, carriage return, and
 * every byte outside 0x20-0x7E is `%XX`, uppercase hex; everything else passes through
 * unescaped). Every unescaped character in a conforming field is already ASCII 0x20-0x7E, so
 * reading the trace file as UTF-8 text never loses information — only the emitted `%XX`
 * escapes can name a byte outside that range, and this function is what turns those back
 * into raw bytes.
 *
 * @param {string} field raw (still-encoded) field text
 * @returns {Buffer} the decoded bytes — a `Buffer`, never a JS string, so a non-UTF-8 byte
 *   round-trips rather than throwing (TSPEC §4.1)
 */
function percentDecodeToBuffer(field) {
  const bytes = [];
  for (let i = 0; i < field.length; i++) {
    const ch = field[i];
    if (ch === "%" && PERCENT_ESCAPE_RE.test(field.slice(i + 1, i + 3))) {
      bytes.push(parseInt(field.slice(i + 1, i + 3), 16));
      i += 2;
    } else {
      bytes.push(field.charCodeAt(i));
    }
  }
  return Buffer.from(bytes);
}

// ───────────────────────────── §4.1/§4.2 parseTrace ─────────────────────────────

/**
 * Thrown when a trace file cannot be read at all — the harness-error half of §4.4's
 * unwritable-trace red test.
 */
export class TraceUnavailableError extends Error {
  constructor(path, cause) {
    super(
      `driftOrdering.parseTrace: trace file unavailable at "${path}"` +
        (cause ? `: ${cause.message}` : "")
    );
    this.name = "TraceUnavailableError";
    this.path = path;
  }
}

const CLASSIFY_PHASES = new Set(["as-found", "post-copy", "post-run"]);
const SEQ_RE = /^[1-9][0-9]*$/;

function parseTraceLine(line, index) {
  const fields = line.split("\t");
  if (fields.length !== 5) {
    throw new Error(
      `driftOrdering.parseTrace: line ${index + 1} does not have five tab-delimited fields ` +
        `(TSPEC §4.1): "${line}"`
    );
  }
  const [seqRaw, phase, op, rowId, argRaw] = fields;
  if (!SEQ_RE.test(seqRaw)) {
    throw new Error(`driftOrdering.parseTrace: line ${index + 1} has a malformed seq "${seqRaw}"`);
  }
  const seq = Number(seqRaw);

  // §4.2: `classify` records carry a pass label; every other op carries the literal "run".
  // Both directions of a mislabel are a harness error naming the offending record.
  if (op === "classify") {
    if (!CLASSIFY_PHASES.has(phase)) {
      throw new Error(
        `driftOrdering.parseTrace: line ${index + 1} is a "classify" record but carries phase ` +
          `"${phase}" — must be one of as-found/post-copy/post-run (TSPEC §4.2)`
      );
    }
  } else if (phase !== "run") {
    throw new Error(
      `driftOrdering.parseTrace: line ${index + 1} is a non-"classify" record ("${op}") but ` +
        `carries phase "${phase}" — every non-classify op must carry phase "run" (TSPEC §4.2)`
    );
  }

  return { seq, phase, op, rowId, arg: percentDecodeToBuffer(argRaw) };
}

/**
 * Parses a `PDLC_TRACE_FILE` (TSPEC §4.1) into an array of records
 * `{seq, phase, op, rowId, arg}`, `arg` decoded to a `Buffer`.
 *
 * Throws `TraceUnavailableError` when the path cannot be read at all (§4.4). Throws a plain
 * `Error` when a record violates the grammar (malformed `seq`, wrong field count) or §4.2's
 * phase rule. Self-checks `seq` is the gapless `1,2,3,…` sequence (§4.1 — a violation means a
 * traced call ran in a subshell) and that at most one `run`-op record exists and, if present,
 * that it is the first line (§4.2's single-invocation scoping) — vacuously true over a
 * trace fragment that names no `run` record at all, which is what lets this parser also
 * serve hand-built single/two-line fixtures that exercise only the codec or the phase rule.
 *
 * @param {string} path
 * @returns {{seq:number, phase:string, op:string, rowId:string, arg:Buffer}[]}
 */
export function parseTrace(path) {
  let raw;
  try {
    raw = readFileSync(path, "utf8");
  } catch (err) {
    throw new TraceUnavailableError(path, err);
  }

  const lines = raw.split("\n").filter((line) => line.length > 0);
  const records = lines.map((line, index) => parseTraceLine(line, index));

  records.forEach((record, index) => {
    if (record.seq !== index + 1) {
      throw new Error(
        `driftOrdering.parseTrace: seq is not the gapless 1,2,3,… sequence at line ${
          index + 1
        } (got ${record.seq}) — a traced call likely ran in a subshell (TSPEC §4.1)`
      );
    }
  });

  const runIndexes = [];
  records.forEach((record, index) => {
    if (record.op === "run") runIndexes.push(index);
  });
  if (runIndexes.length > 1) {
    throw new Error(
      `driftOrdering.parseTrace: more than one "run" record in a single trace file — a trace ` +
        `must contain exactly one invocation (TSPEC §4.2)`
    );
  }
  if (runIndexes.length === 1 && runIndexes[0] !== 0) {
    throw new Error(
      `driftOrdering.parseTrace: the "run" record must be the first line of the trace (TSPEC §4.2)`
    );
  }

  return records;
}

function argToString(arg) {
  return Buffer.isBuffer(arg) ? arg.toString("utf8") : String(arg);
}

// ───────────────────────────── multiset equality (shared) ─────────────────────────────

function assertMultisetEqual(actual, expected, label) {
  if (!Array.isArray(expected) || expected.length === 0) {
    throw new Error(`${label}: expected id list must be a non-empty array`);
  }
  const sortedActual = [...actual].sort();
  const sortedExpected = [...expected].sort();
  const equal =
    sortedActual.length === sortedExpected.length &&
    sortedActual.every((value, i) => value === sortedExpected[i]);
  if (!equal) {
    throw new Error(
      `${label}: multiset mismatch — got [${sortedActual.join(", ")}], expected ` +
        `[${sortedExpected.join(", ")}]`
    );
  }
}

// ───────────────────────────── §4.3 the AC-2.9(1) oracle ─────────────────────────────

const MUTATING_OPS = new Set(["mkdir", "write", "copy", "backup", "delete"]);
const CLASSIFY_PHASE_ORDER = ["as-found", "post-copy", "post-run"];

/**
 * TSPEC §4.3's four conjuncts, asserted together. `trace` is line-order-indexed records
 * (as returned by `parseTrace`, or an equivalent literal array). Throws naming the violated
 * conjunct.
 *
 * @param {{phase:string, op:string, rowId:string}[]} trace
 * @param {string[]} expectedRowIds every manifest row id expected to be classified as-found
 */
export function assertClassifyBeforeCreate(trace, expectedRowIds) {
  const indexed = trace.map((record, index) => ({ ...record, __index: index }));
  const asFoundClassify = indexed.filter((r) => r.phase === "as-found" && r.op === "classify");
  const mutating = indexed.filter((r) => MUTATING_OPS.has(r.op));

  // (a) multiset positive-presence — every expected id exactly once, no other id at all.
  assertMultisetEqual(
    asFoundClassify.map((r) => r.rowId),
    expectedRowIds,
    "assertClassifyBeforeCreate conjunct (a)"
  );

  if (mutating.length > 0) {
    const maxAsFoundIndex = Math.max(...asFoundClassify.map((r) => r.__index));
    const minMutatingIndex = Math.min(...mutating.map((r) => r.__index));

    // (b) every as-found classification precedes every mutation.
    if (!(maxAsFoundIndex < minMutatingIndex)) {
      throw new Error(
        "assertClassifyBeforeCreate conjunct (b): a mutation precedes the last as-found " +
          "classify record"
      );
    }

    // (c) — vacuous when there are no mutations at all; catches a run that mutates before
    // classifying anything (conjunct (b) alone is vacuously true when C is empty).
    if (asFoundClassify.length === 0) {
      throw new Error(
        "assertClassifyBeforeCreate conjunct (c): mutations occurred with no as-found classify " +
          "record at all"
      );
    }
    const minAsFoundIndex = Math.min(...asFoundClassify.map((r) => r.__index));
    if (!(minAsFoundIndex < minMutatingIndex)) {
      throw new Error(
        "assertClassifyBeforeCreate conjunct (c): a mutation precedes the first as-found " +
          "classify record"
      );
    }
  }

  // (d) a manifest-read record exists and precedes every as-found classify record.
  const manifestReadIndex = indexed.findIndex((r) => r.op === "manifest-read");
  if (manifestReadIndex === -1) {
    throw new Error(
      "assertClassifyBeforeCreate conjunct (d): no manifest-read record present in the trace"
    );
  }
  for (const record of asFoundClassify) {
    if (!(manifestReadIndex < record.__index)) {
      throw new Error(
        "assertClassifyBeforeCreate conjunct (d): a classify record precedes the manifest-read " +
          "record"
      );
    }
  }
}

/**
 * TSPEC §4.3's phase-order restatement. (1) re-asserts `parseTrace`'s grammar rule so a
 * helper used without `parseTrace` cannot skip it — every non-`classify` record must carry
 * `phase === "run"` and no `classify` record may. (2) the `classify` records' phase labels,
 * taken in line order and run-length-collapsed, must form a prefix of
 * `[as-found, post-copy, post-run]`.
 *
 * @param {{phase:string, op:string}[]} trace
 */
export function assertPhaseOrder(trace) {
  for (const record of trace) {
    if (record.op === "classify") {
      if (!CLASSIFY_PHASE_ORDER.includes(record.phase)) {
        throw new Error(
          `assertPhaseOrder: a "classify" record carries phase "${record.phase}", which is not ` +
            `one of as-found/post-copy/post-run`
        );
      }
    } else if (record.phase !== "run") {
      throw new Error(
        `assertPhaseOrder: a non-"classify" record ("${record.op}") carries phase ` +
          `"${record.phase}" instead of "run"`
      );
    }
  }

  const classifyLabels = trace.filter((r) => r.op === "classify").map((r) => r.phase);
  const collapsed = [];
  for (const label of classifyLabels) {
    if (collapsed[collapsed.length - 1] !== label) collapsed.push(label);
  }

  const isPrefix =
    collapsed.length <= CLASSIFY_PHASE_ORDER.length &&
    collapsed.every((label, i) => label === CLASSIFY_PHASE_ORDER[i]);
  if (!isPrefix) {
    throw new Error(
      `assertPhaseOrder: the collapsed classify-phase sequence [${collapsed.join(", ")}] is not ` +
        `a prefix of [${CLASSIFY_PHASE_ORDER.join(", ")}]`
    );
  }
}

/**
 * TSPEC §4.3 — the `post-copy` classify records' row ids must be **multiset**-equal to
 * `retiringIds` (TE F-01): a set equality would pass an implementation that classifies each
 * retiring row twice.
 *
 * @param {{phase:string, op:string, rowId:string}[]} trace
 * @param {string[]} retiringIds
 */
export function assertPostCopyNarrow(trace, retiringIds) {
  const rowIds = trace
    .filter((r) => r.phase === "post-copy" && r.op === "classify")
    .map((r) => r.rowId);
  assertMultisetEqual(rowIds, retiringIds, "assertPostCopyNarrow");
}

/**
 * TSPEC §4.3 — the executable form of "which pass the record carries": every row a `phase`
 * pass classified must carry, in the drift-state record, the same state that pass's
 * `classify` record named.
 *
 * @param {{phase:string, op:string, rowId:string, arg:(Buffer|string)}[]} trace
 * @param {{rows:{id:string, state:string}[]}} driftState
 * @param {"as-found"|"post-copy"|"post-run"} phase
 */
export function assertRecordedPassIs(trace, driftState, phase) {
  const rowsById = new Map((driftState.rows || []).map((row) => [row.id, row]));
  const classifyRecords = trace.filter((r) => r.op === "classify" && r.phase === phase);
  for (const record of classifyRecords) {
    const row = rowsById.get(record.rowId);
    const expectedState = argToString(record.arg);
    if (!row) {
      throw new Error(
        `assertRecordedPassIs: row "${record.rowId}" recorded by the ${phase} pass has no ` +
          `matching row in the drift state`
      );
    }
    if (row.state !== expectedState) {
      throw new Error(
        `assertRecordedPassIs: row "${record.rowId}"'s drift-state state "${row.state}" does not ` +
          `match the ${phase} pass's classify record ("${expectedState}")`
      );
    }
  }
}

// ───────────────────────────── §8.3 tree-invariance (R-8, TE F-12) ─────────────────────────────

function isUnderGit(relPath) {
  return relPath.split(sep).includes(".git");
}

function walkTree(root, dir, map) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const abs = join(dir, entry.name);
    const rel = relative(root, abs);
    if (entry.isDirectory()) {
      walkTree(root, abs, map);
    } else if (entry.isSymbolicLink()) {
      map.set(rel, Buffer.from(`symlink:${readlinkSync(abs)}`));
    } else if (entry.isFile()) {
      map.set(rel, readFileSync(abs));
    }
  }
}

/**
 * A content snapshot of every file and symlink under `root`, keyed by path relative to
 * `root`. Take one before an operation that must not mutate the tree, and pass it to
 * `assertTreeUnchanged` afterward.
 *
 * @param {string} root
 * @returns {Map<string, Buffer>}
 */
export function snapshotTree(root) {
  const map = new Map();
  walkTree(root, root, map);
  return map;
}

/**
 * Compares a fresh snapshot of `root` against `before` (from `snapshotTree`), ignoring any
 * path with a `.git/` segment — a `.git` invocation's own bookkeeping is not the tree
 * invariance this assertion guards (TE F-12, R-8). Throws naming the first mutated path
 * found outside `.git/`.
 *
 * @param {string} root
 * @param {Map<string, Buffer>} before
 */
export function assertTreeUnchanged(root, before) {
  const after = snapshotTree(root);
  const allPaths = new Set([...before.keys(), ...after.keys()]);
  const mutated = [];
  for (const rel of allPaths) {
    if (isUnderGit(rel)) continue;
    const beforeContent = before.get(rel);
    const afterContent = after.get(rel);
    const unchanged =
      beforeContent !== undefined && afterContent !== undefined && beforeContent.equals(afterContent);
    if (!unchanged) mutated.push(rel);
  }
  if (mutated.length > 0) {
    throw new Error(
      `assertTreeUnchanged: unexpected mutation outside .git/ at: ${mutated.sort().join(", ")}`
    );
  }
}
