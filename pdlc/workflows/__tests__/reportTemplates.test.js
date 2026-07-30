// reportTemplates.test.js — RLH-28 (batch 3, RED)
//
// RLH-AT-55 — "no un-substituted template reaches a report".
//
// TSPEC §6.3 states the rule in its general form:
//
//   "The general rule this establishes: no un-substituted template reaches a
//    report. Any operator-facing string whose {…} placeholders are not all
//    substituted is a defect. The same rule condemns `reviewerPrompt`'s and
//    `optimizerPrompt`'s `{DOC-TYPE}` literals (§5.2)."
//
// FSPEC §19's acceptance wording:
//
//   "AT-55 — No un-substituted template reaches a report (AC-5.2).
//    *Then* no report string produced by any halt path contains a literal
//    `{feature}` or `{DOC-TYPE}`."
//
// Because the rule is *general*, this suite is a SWEEP, not a check of three
// known-bad templates. It enumerates the pipeline sources from the tree at
// HEAD and flags every half-substituted template token it finds, so a report
// string added later with an un-substituted placeholder is caught too.
//
// RED reason (batches 3–9, PLAN §7.3 ledger row "RLH-AT-55"): the sweep finds
// four live half-substituted templates in `orchestrate-dev.js` —
//   * `checkConverged`'s `postmortemPath` (TSPEC §6.3), corrected by RLH-27
//     in batch 9;
//   * three `{DOC-TYPE}` (and one `{role}`) cross-review paths in
//     `reviewerPrompt` / `optimizerPrompt` (TSPEC §5.2 / §3.9), substituted by
//     RLH-30 in batch 10.
// Both fixes must land before this greens, which is exactly why the ledger
// binds RLH-AT-55 to batch 10 / RLH-30 rather than to batch 9 / RLH-27.

import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const HERE = dirname(fileURLToPath(import.meta.url));
const WORKFLOWS = join(HERE, "..");

// ─── The swept surface ────────────────────────────────────────────────────────
//
// Every operator-facing report string the pipeline can emit — halt reasons,
// `recordPhase` messages, `_log` lines, the final-report fields of TSPEC §4.7,
// and the agent prompts §6.3 explicitly folds into the same rule — is a string
// literal in one of these three hand-written sources. Sweeping the whole source
// text is therefore a superset of the report surface: no report string can
// escape it, and it needs no per-site allow-list to maintain.
//
// Deliberately excluded:
//   * `pdlc/workflows/dist/` — generated from these three by `build-runtime.mjs`.
//     Including it would double-count every finding. `runtimeBundle.test.js`
//     already asserts the artifacts are byte-fresh against these sources, so a
//     violation here is a violation there.
//   * `build-runtime.mjs` — a Node-side build script; it emits no operator
//     report string from a pipeline run.
const SWEPT_SOURCES = [
  "orchestrate-dev.js",
  "orchestrate-queue.js",
  "runtime-adapter.js",
];

// ─── The oracle ───────────────────────────────────────────────────────────────
//
// Text/regex-shaped, no parser and no new dependency (PLAN §12.3's grep-shaped
// oracles; brief halt condition H-n).
//
// A *half-substituted* template is the falsifiable, machine-decidable form of
// TSPEC §6.3's rule: a single whitespace-delimited token that carries BOTH a
// real `${…}` interpolation AND a bare `{placeholder}`. That token was written
// as one interpolated string and one of its placeholders was left behind — the
// exact shape of `checkConverged`'s
//   `docs/{feature}/POSTMORTEM-${phaseId}-{feature}.md`
// and of `reviewerPrompt`'s
//   `docs/${feature}/CROSS-REVIEW-${role}-{DOC-TYPE}-v${prev}.md`.
//
// Why token-scoped rather than string-scoped: a wholly un-interpolated brace
// pattern is a *legitimate* operator-facing construct — `main()`'s usage halt
// prints the literal pattern `docs/{feature}/REQ-{feature}.md` so the operator
// knows the shape to supply, and the phase table's `creatorOutputPath` entries
// are templates by design, substituted downstream. Scoping to the token keeps
// those green while still flagging a mixed token that sits inside prose (e.g.
// `optimizerPrompt`'s parenthesised path). No allow-list, no `file:line`
// exemption, nothing to maintain per site.
//
// Known and accepted limit, stated so it is not mistaken for coverage: a report
// string in which *every* placeholder is un-substituted is textually
// indistinguishable from a deliberate pattern message and is not flagged. TSPEC
// §6.3's live defects, and every defect of the class it names, are mixed.

/** A bare `{ident}` placeholder — `$`-prefixed interpolations excluded. */
const PLACEHOLDER = /(?:^|[^$])\{[A-Za-z][A-Za-z0-9_-]*\}/;

/**
 * Blank out comment text so JSDoc `@param {string}` tags and prose that quotes
 * a template are not mistaken for emitted strings. Block comments are replaced
 * space-for-space to keep line numbers exact; only line-leading `//` comments
 * are dropped, so a `//` inside a string literal can never truncate it.
 * @param {string} src
 * @returns {string}
 */
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .split("\n")
    .map((line) => (/^\s*\/\//.test(line) ? "" : line))
    .join("\n");
}

/**
 * Sweep one source for half-substituted template tokens.
 * @param {string} file - basename under `pdlc/workflows/`
 * @returns {{ findings: Array<{file:string,line:number,token:string}>,
 *             interpolatedTokens: number }}
 */
function sweepSource(file) {
  const src = stripComments(readFileSync(join(WORKFLOWS, file), "utf8"));
  const findings = [];
  let interpolatedTokens = 0;
  src.split("\n").forEach((line, index) => {
    for (const token of line.split(/\s+/)) {
      if (!token.includes("${")) continue;
      interpolatedTokens += 1;
      if (PLACEHOLDER.test(token)) {
        findings.push({ file, line: index + 1, token });
      }
    }
  });
  return { findings, interpolatedTokens };
}

/**
 * Sweep every source in `SWEPT_SOURCES`.
 * @returns {{ findings: Array<{file:string,line:number,token:string}>,
 *             interpolatedTokens: number, filesSwept: number }}
 */
function sweepAll() {
  let findings = [];
  let interpolatedTokens = 0;
  for (const file of SWEPT_SOURCES) {
    const result = sweepSource(file);
    findings = findings.concat(result.findings);
    interpolatedTokens += result.interpolatedTokens;
  }
  return { findings, interpolatedTokens, filesSwept: SWEPT_SOURCES.length };
}
