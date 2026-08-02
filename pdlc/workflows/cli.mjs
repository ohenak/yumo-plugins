#!/usr/bin/env node
/**
 * cli.mjs — the document-state query CLI.
 *
 * Every answer here is already computed by orchestrate-dev.js; this file adds a
 * process boundary and a byte-exact wire format, nothing else. No predicate is
 * re-implemented: a second implementation of `isComplete` (or of the round
 * window, or of the approval digest) would be a second oracle for a question the
 * pipeline already has exactly one answer to.
 *
 * Output protocol — a fixed contract other callers parse:
 *   line 1  the result as SINGLE-LINE JSON
 *   line 2  `DIGEST: sha256:{64 hex}` over line 1's exact string
 * The digest is `sha256Hex`, which canonicalises its input (LF-only, one
 * trailing newline) before hashing, so a verifier must use that same function
 * rather than a raw `crypto` digest of the line.
 *
 * Exit status is about the PROTOCOL, not about the answer: 0 whenever JSON was
 * printed — `{"ok":false,…}` included — and non-zero only when no JSON could be
 * produced at all (unknown command, missing argument), which prints one usage
 * line on stderr and nothing on stdout.
 *
 * Usage:  node pdlc/workflows/cli.mjs <command> [args...]
 */

import * as dev from "./orchestrate-dev.js"; // BUILD:REPLACE-DEV-IMPORT

const USAGE =
  "usage: pdlc-cli doc-probe <path> [docType] | review-state <feature> <docType> | postmortem <phase> <feature>";

/** Path arguments are consumer-relative; the caller's cwd is the repo root. */
function resolveArg(path) {
  const raw = String(path ?? "");
  if (raw.startsWith("/")) return raw;
  const cwd = process.cwd().replace(/\/+$/, "");
  return `${cwd}/${raw}`;
}

/** The seams' async form. The Node defaults are synchronous; the seams are not. */
const readFileAsync = async (path) => dev.defaultReadFile(path);

/** A Map is not JSON; every Map in a result is published as a plain object. */
function objectFromMap(map) {
  const out = {};
  if (map instanceof Map) for (const [key, value] of map) out[key] = value;
  return out;
}

function docProbe(pathArg, docType) {
  const path = resolveArg(pathArg);
  const text = dev.defaultReadFile(path);
  const exists = text != null;
  const body = text ?? "";
  const artifactClass = dev.artifactClassOf(path);
  const { complete, missing, T, S } = dev.isComplete(artifactClass, docType, body);
  return {
    ok: true,
    exists,
    empty: body.trim() === "",
    hash: exists ? dev.approvalHashOf(text) : null,
    artifactClass,
    complete,
    missing,
    T,
    S,
    firstUnwritten: dev.firstUnwrittenSection(artifactClass, docType, body),
    anchors: dev.approvalAnchorPreCount(body),
  };
}

async function reviewState(feature, docType) {
  const state = await dev.refreshReviewState({
    feature,
    docType,
    _listFiles: dev.defaultListFiles,
    _readFile: readFileAsync,
  });
  // An `ok: false` state is a legitimate answer, not a protocol failure — it is
  // published unchanged, and the exit status stays 0.
  if (!state || !state.ok) return state;
  return {
    ...state,
    present: objectFromMap(state.present),
    reviewFiles: objectFromMap(state.reviewFiles),
  };
}

async function run(argv) {
  const [command, ...rest] = argv;
  switch (command) {
    case "doc-probe":
      if (!rest[0]) return null;
      return docProbe(rest[0], rest[1]);
    case "review-state":
      if (!rest[0] || !rest[1]) return null;
      return reviewState(rest[0], rest[1]);
    case "postmortem":
      if (!rest[0] || !rest[1]) return null;
      return dev.checkPostmortem({ phase: rest[0], feature: rest[1], _readFile: readFileAsync });
    default:
      return null;
  }
}

/**
 * stdout belongs to the protocol, and to nothing else.
 *
 * The predicates this CLI calls emit operator diagnostics through the module's
 * `log`, which is `console.log` — on stdout, where a third line would corrupt
 * the two-line contract. Diagnostics are captured and re-emitted on stderr
 * rather than dropped: they are still worth reading, just not by the parser.
 */
async function withCleanStdout(fn) {
  const captured = [];
  const realWrite = process.stdout.write.bind(process.stdout);
  process.stdout.write = (chunk, encoding, callback) => {
    captured.push(typeof chunk === "string" ? chunk : String(chunk));
    const cb = typeof encoding === "function" ? encoding : callback;
    if (typeof cb === "function") cb();
    return true;
  };
  try {
    return await fn();
  } finally {
    process.stdout.write = realWrite;
    if (captured.length) process.stderr.write(captured.join(""));
  }
}

const result = await withCleanStdout(() => run(process.argv.slice(2)));

if (result == null) {
  process.stderr.write(`${USAGE}\n`);
  process.exit(2);
}

const line = JSON.stringify(result);
process.stdout.write(`${line}\nDIGEST: sha256:${dev.sha256Hex(line)}\n`);
