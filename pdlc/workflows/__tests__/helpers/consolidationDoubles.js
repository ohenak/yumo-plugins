// consolidationDoubles.js — PLAN T01 (batch 1, depends on T00).
//
// The single canonical double module for pdlc-consolidation-agent (TSPEC §3.1, §11.2). No
// `consolidation*.test.js` file builds its own `_envPresent`/`_makeTempDir` fake, its own log or
// corpus fixture, or its own vocabulary transcription — everything comes from here, or (for the
// seams TSPEC §11.2 says already exist) is re-exported from the module that already owns it.
//
// Excluded from jest collection by the shipped `testPathIgnorePatterns`
// (`pdlc/workflows/package.json:18-22`) — this is infrastructure, not a suite.
//
// ─── The fixture-builder rule (PLAN T01) ───────────────────────────────────
//
// No fixture in this module may depend on git *visibility* — whether a path is ignored, staged,
// staged-but-deleted, or otherwise a fact about the index/worktree rather than about the text
// `_git` returned. `classifyCorpus` (TSPEC §7.1) is driven directly, from a `CorpusFile[]` and a
// `logText`, never through a `_git` double in these builders: a fixture that encoded "this path is
// git-ignored" would be exercising `enumerateCorpus`'s pathspec, not `classifyCorpus`'s predicate,
// and would read as coverage of the enumeration half while actually testing nothing about it (the
// enumeration half's own oracle is the literal argv, TSPEC §7.1). Builders here therefore take
// plain path/basename lists and log text, nothing that models `.gitignore` or index state.

import { fakeFs, fakeListFiles } from "./seams.js";
import { fakeGit, fakeGhRun, matchKey, fakeNow, FIXED_NOW_MS, fakeSleep, seeded, resolveSeed } from "./mergeDoubles.js";
import { makeAgentDouble } from "./advisoryDoubles.js";

// ─── Re-exports (TSPEC §11.2 — reuse, never re-author) ─────────────────────
//
// Every seam this feature shares with the shipped suites is re-exported under its original name,
// never re-declared: `_readFile`/`_writeFile`/`_appendFile`/`_checkFile` from `fakeFs`,
// `_listFiles` from `fakeListFiles` (wired for protocol completeness only — no consolidation test
// drives it; the corpus is enumerated through `_git`, TSPEC §7.1/§11.2), `_git` from `fakeGit`,
// `_ghRun`/its key function from `fakeGhRun`/`matchKey`, `_agent` from `makeAgentDouble`, and the
// clock/sleep from `mergeDoubles.js`. The PRNG (`seeded`/`resolveSeed`) is re-exported for the same
// one-import-site reason every other double module in this repo re-exports it.
export { fakeFs, fakeListFiles, fakeGit, fakeGhRun, matchKey, makeAgentDouble, fakeNow, FIXED_NOW_MS, fakeSleep, seeded, resolveSeed };

// ─── fakeEnvPresent — the `_envPresent` double (TSPEC §5.1, §5.3) ──────────
//
// `_envPresent(name: string): Promise<boolean>` — NEVER the value (TSPEC §5.3: a seam returning
// the credential's value would put the secret inside the JS process and the agent transcript that
// transported it). `presentNames` is a `Set<string>` of the env var names this fixture treats as
// present; every requested name is recorded, in order, on `.calls`, so a test can assert both the
// boolean answer and which name was actually probed.
export function fakeEnvPresent(presentNames = new Set()) {
  const calls = [];
  const _envPresent = async (name) => {
    calls.push(name);
    return presentNames.has(name);
  };
  return { calls, _envPresent };
}

// ─── fakeMakeTempDir — the `_makeTempDir` double (TSPEC §5.1, §5.3) ────────
//
// `_makeTempDir(passId: string): Promise<string | null>` — a fixed absolute path, or `null` to
// script the §6.1/§9.1 `api-failure` degradation. Every requested `passId` is recorded, in order,
// on `.calls`.
export function fakeMakeTempDir(path) {
  const calls = [];
  const _makeTempDir = async (passId) => {
    calls.push(passId);
    return path;
  };
  return { calls, _makeTempDir };
}

// ─── asAsync — the macrotask-deferring seam wrapper (TSPEC §11.2, T-13) ────
//
// Wraps a synchronous double (`seams.js`'s doubles are sync by design — its own header names that
// as the central hazard: a missing `await` on an injected seam call passes L1 and L2 and fails only
// in production) and returns a function that defers BOTH the recording and the resolution onto a
// macrotask. The deferral must be a macrotask (`setTimeout(…, 0)`), never a microtask: a microtask
// deferral cannot survive a caller that awaits at all, because awaiting is itself
// microtask-scheduled, and the discrimination this wrapper exists for (§11.2's await-discipline
// test, T-13) would then pass on a broken, un-awaited implementation. Scope: this wrapper exists
// for exactly one row — §12.2's T-13 await-discipline test — and no other suite should reach for
// it; the rest of the suite deliberately keeps the sync doubles because their subject is the pass's
// logic, not its await discipline.
//
// Per TSPEC §11.2's own caveat: each wrapped double must be constructed fresh, inside the test case
// body, never at module scope — a late timer from a prior case must never be able to write into a
// double a later case reads.
export const asAsync = (fn) => (...args) =>
  new Promise((resolve) => setTimeout(() => resolve(fn(...args)), 0));

// ─── buildConsolidationLog — the `.consolidation-log.md` fixture builder ───
// (TSPEC §3, §7.1 `classifyCorpus`)
//
// So no suite concatenates a log by hand. `legacy` is arbitrary pre-convention prose (the region
// preceding the file's first `<!-- pdlc:consumed` marker, matched by bare substring containment,
// §3's "legacy region" rule) and `blocks` is an ordered list of `{passId, basenames}` pairs, each
// rendered as one well-formed `<!-- pdlc:consumed {passId} -->` / `<!-- /pdlc:consumed -->` span
// (one basename per line, §3's block grammar). Concatenation order is legacy text first, then every
// block in array order — `classifyCorpus` finds the boundary at the first marker regardless, so
// this ordering is the only one a real append history ever produces.
export function buildConsolidationLog({ legacy = "", blocks = [] } = {}) {
  const blockText = blocks
    .map(({ passId, basenames }) => [`<!-- pdlc:consumed ${passId} -->`, ...basenames, `<!-- /pdlc:consumed -->`].join("\n"))
    .join("\n");
  return blocks.length === 0 ? legacy : `${legacy}${blockText}\n`;
}

// ─── Corpus fixture builders (TSPEC §7.1) ──────────────────────────────────
//
// `buildCorpusListing(paths)` renders the raw `_git ls-files` stdout `enumerateCorpus`/
// `parseCorpusListing` consume: one repository-root-relative path per line, newline-joined, with a
// trailing newline the way real `git` output carries one.
//
// `buildCorpusFiles(paths)` builds the already-parsed `CorpusFile[]` shape (`{path, basename}`)
// `classifyCorpus` is driven with directly (§7.1) — the basename is the same last-`/`-segment split
// `parseCorpusListing` performs, so the two builders never disagree about what a path's basename is.
//
// Neither builder encodes ignore-state, staged-state, or any other git-visibility fact (this
// module's header rule, above): a path is corpus here because it is IN the list, never because of
// something asserted about the index.
export function buildCorpusListing(paths = []) {
  return paths.length === 0 ? "" : `${paths.join("\n")}\n`;
}

export function buildCorpusFiles(paths = []) {
  return paths.map((path) => {
    const slash = path.lastIndexOf("/");
    return { path, basename: slash === -1 ? path : path.slice(slash + 1) };
  });
}

// ─── buildEscalationsFixture — the `ESCALATIONS.md` fixture builder ────────
// (TSPEC §7.7, mirroring `orchestrate-dev.js`'s shipped `renderEscalationEntry`)
//
// `parseEscalations` (§7.7) reads only the metadata table row, never the heading — it splits on
// `/^## /m` into entries and matches `Feature` / `Seam` rows inside each. This builder renders the
// same shape the shipped `renderEscalationEntry` does (heading plus a `| Field | Value |` table
// carrying `Feature` and `Seam` rows) so a fixture here is never more permissive than what
// production actually writes. `entries` is `{feature, seam}[]`; an entry may omit `feature` or
// `seam` to fixture §7.7's E-12 "missing either row is skipped with a parse notice" case.
export function buildEscalationsFixture(entries = []) {
  return entries
    .map(({ feature, seam }) => {
      const lines = [`## ${feature ?? "unknown"} — ${seam ?? "unknown"}`, "", "| Field | Value |", "|---|---|"];
      if (feature !== undefined) lines.push(`| Feature | ${feature} |`);
      if (seam !== undefined) lines.push(`| Seam | ${seam} |`);
      lines.push("");
      return lines.join("\n");
    })
    .join("\n");
}

// ─── VOCABULARY_TRANSCRIPTION — the §11.3(b) literal table ─────────────────
//
// A literal transcription of `docs/_constraints/pdlc-consolidation-vocabularies.md` §1 at
// `Version` 1.4, held here as a plain data table so AT-L5's harness can compare an enumerated-class
// fixture set against it, and so the module's own §6.4 frozen catalogues can be pinned against it
// three ways (module catalogue ≡ this transcription ≡ the authority file, both directions — the
// third leg, reading the authority file itself, is the harness's own job, not this module's; this
// export is only the doubles' half of that comparison). The free-form fields (`pr:`, `suppressed-by:`
// entries, the `credential:` field's underlying value, revision/retirement display aliases of
// `revise`/`retire`) are excluded BY NAME, matching §11.3(b)'s "the free-form class is excluded by
// name, so narrowing the domain cannot silently drop a direction".
//
// Keys mirror §6.4's nine frozen catalogue names exactly, plus `REASON_CODE_STATUSES` — the
// vocabularies table's third column (`May accompany status`), transcribed verbatim per reason code.
export const VOCABULARY_VERSION = "1.4";

export const VOCABULARY_TRANSCRIPTION = Object.freeze({
  TERMINAL_STATUSES: Object.freeze(["promoted", "promoted-degraded", "no-op", "skipped-cadence", "refused", "failed"]),
  REASON_CODES: Object.freeze([
    "consolidation-in-progress",
    "reclaimed-stale-lock",
    "advisory-model-unresolved",
    "no-cadence-datum",
    "writes-uncommitted",
    "credential-unavailable",
    "repository-unresolved",
    "api-failure",
    "branch-exists",
    "duplicate-suppressed",
    "no-advisory-corpus",
    "advisory-corpus-empty",
  ]),
  TRIGGERS: Object.freeze(["cadence", "volume", "manual"]),
  ROUTES: Object.freeze(["constraints", "decisions", "PR", "degraded"]),
  ACTIONS: Object.freeze(["promote", "revise", "retire"]),
  VERDICTS: Object.freeze(["prevented", "recurred", "insufficient-evidence"]),
  PROMO_STATES: Object.freeze(["ineffective", "unmeasurable"]),
  CREDENTIAL_VALUES: Object.freeze(["present (redacted)", "absent", "local-gh"]),
  PHASE_CATALOGUE: Object.freeze(["R", "F", "T", "D", "P", "PR", "I", "PT", "CR", "DOD", "H", "PUB", "MERGE"]),
  REASON_CODE_STATUSES: Object.freeze({
    "consolidation-in-progress": Object.freeze(["refused"]),
    "reclaimed-stale-lock": Object.freeze(["promoted", "promoted-degraded", "no-op", "failed"]),
    "advisory-model-unresolved": Object.freeze(["failed"]),
    "no-cadence-datum": Object.freeze(["promoted", "promoted-degraded", "no-op", "failed", "refused"]),
    "writes-uncommitted": Object.freeze(["promoted", "promoted-degraded", "no-op", "failed"]),
    "credential-unavailable": Object.freeze(["promoted-degraded", "no-op"]),
    "repository-unresolved": Object.freeze(["promoted-degraded", "no-op"]),
    "api-failure": Object.freeze(["promoted-degraded", "no-op"]),
    "branch-exists": Object.freeze(["promoted-degraded", "no-op"]),
    "duplicate-suppressed": Object.freeze(["promoted", "promoted-degraded", "no-op"]),
    "no-advisory-corpus": Object.freeze(["promoted", "promoted-degraded", "no-op", "failed"]),
    "advisory-corpus-empty": Object.freeze(["promoted", "promoted-degraded", "no-op", "failed"]),
  }),
});
