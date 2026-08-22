# CODE_REVIEW — pdlc-learnings-injection (v1)

| Field | Value |
|---|---|
| Feature | pdlc-learnings-injection |
| Branch | `feat-pdlc-learnings-injection` |
| Review version | 1 (re-verified at HEAD `4e609c3b`; supersedes the round committed at `bbc88069`) |
| Date | 2026-08-21 |
| Reviewer role | dod-verify (Constructive Verifier) |
| Verdict | **FAILED** (1 Low finding) |
| Branch coverage (lowest included module) | **88.75%** — `orchestrate-dev.js` / `orchestrate-queue.js`; `scripts/capture-learnings-baseline.mjs` 89.47%; `build-runtime.mjs` 88.23% |
| Coverage gate | `npm run test:coverage` exit **0** (stage 1 aggregate + stage 2 `--per-file --branches 85`) |
| Requirements traced | 25 / 25 clean |
| req_gaps | 0 |
| boundary_gaps | 1 |

Scope legend: **Local** = fixable inside this feature's diff; **Cross-Feature** = touches a
surface shared with another feature or an already-merged convention; **Process** = a deferral,
disclosure or gate arrangement rather than a code defect.

**Why this document was rewritten rather than opened as v2.** The orchestrator dispatched review
version 1. A v1 was committed at `bbc88069` (2026-08-21 11:17) recording twelve findings; roughly
eleven hours of remediation commits followed. This round re-verifies the same feature at HEAD and
carries the prior round's disposition in §1a below. The superseded text remains in git history at
`bbc88069`.

---

## §1 Code Quality Findings

| # | Criterion | Severity | File:Line | Problem | Required fix | Scope |
|---|---|---|---|---|---|---|
| G1 | 6(a) — adjacent-surface falsification introduced by the remediation diff | Low | `pdlc/workflows/orchestrate-dev.js:2425` | The v1 F3 remediation dropped `feature` from `selectLearnings`'s signature (`:2427` now reads `({ entries, thresholds })`) but left the JSDoc directly above it declaring `@param {{entries: object[], feature: string, thresholds: object}} arg`. The disclosure was true before the diff and is false after it. This is F3's own defect re-expressed one line up: F3's stated harm was that "a future reader will reasonably assume selection re-checks self-exclusion and may rely on a guarantee that is not there", and the JSDoc is the surface a reader consults first. Self-exclusion is still decided upstream in `gatherLearningsCorpus` (`:2595`). | Drop `feature: string` from the `@param` record at `:2425` so the doc names the three parameters the function accepts. No behavioural change. | Local |

**Criterion-1/2/3 sweep — clean.** A case-insensitive sweep of
`TODO|FIXME|HACK|XXX|NotImplementedError|not implemented|placeholder|stub|dummy|mock|fake|pragma: no cover|c8 ignore|istanbul ignore`
over the LEARNINGS INJECTION REGION (`orchestrate-dev.js:2137–2704`) returns nothing. The same
sweep over `scripts/capture-learnings-baseline.mjs` returns one hit, at `:166`, inside the
comment that records the *history* of the removed refusal stub — `learningsErratumBinding.test.js`
`LI-ERR-05` strips comments before asserting no deferral survives in live code, which is the
correct scoping. No hardcoded sample data, no placeholder URL, no coverage-exemption pragma. No
skipped or `.todo` test survives in any `learnings*.test.js` suite.

**Stale-disclosure family sweep (criterion 6a).** G1 was found by a mechanical comparison of every
`@param` record against its function's destructured parameter list across the whole region. The
family has four members — `selectLearnings`, `renderLearningsBlock`, `gatherLearningsCorpus`,
`buildLearningsInjector`. Only `selectLearnings` mismatches; the other three are consistent or
carry no `@param`. G1 is the whole family, not its nearest member.

## §1a Prior-Round Finding Disposition (`bbc88069` v1 → HEAD)

Each row was verified to a production code path **and** an oracle whose contents would fail if the
fix broke. Assertion-free or stub-backed remediation was not accepted.

| v1 # | Criterion | Fix location | Verified how | Status |
|---|---|---|---|---|
| F1 | 1 — refusal stub at the capture CLI entry point | `scripts/capture-learnings-baseline.mjs:164-208`; matrix committed at `__tests__/helpers/learningsBaselineScenarios.js` | `learningsCaptureScript.test.js:348` spawns the **real** entry point as a subprocess against the real repo at the pinned merge base and compares the produced `MANIFEST.json` digests to the committed ones, with a `status === 0` vacuity control. Provenance is now checked, not asserted. | **Remediated** |
| F2 | 2 — `_log` seam declared but never supplied in production | `orchestrate-dev.js:14085-14090` | Mutation-verified: deleting the `_log:` property from the production factory call reds `learningsDispatchSet.test.js:526`. The oracle asserts both conjuncts — the seam is a `function` (1), and it fires per dispatch carrying §D.2's exact four-key field set (2), so a non-callable placeholder cannot satisfy it. | **Remediated** |
| F3 | 2 — unread `feature` parameter on `selectLearnings` | `orchestrate-dev.js:2427` | Signature now `({ entries, thresholds })`; no call site depends on the dropped key. **Left the JSDoc behind — see G1.** | **Remediated (with G1 residue)** |
| F4 | 4 — capture script outside the measured set | `pdlc/workflows/package.json` c8 `include` + `allow-external` + `exclude`; `learningsCaptureScript.test.js:192` | `scripts/capture-learnings-baseline.mjs` now measures 89.47% branch and is gated by stage 2. `captureFixturesFromWorktree` has direct tests including the duplicate-`caseId` guard and the no-MANIFEST-on-throw arm (`:306`). `coverageInstrumentation.test.js` reds if any include entry stops resolving — which is what catches the `allow-external` resolution trap the c8 comment records. | **Remediated** |
| F5 | 4 — no property-based tests over `parseLearningsConfig` | `learningsConfig.test.js:564-660` | fast-check properties over a recursive arbitrary JSON value space × the declared key set × malformed section shapes, including `PROP-F5-4` (total, pure, never disables except on a literal `enabled: false`). | **Remediated** |
| F6 | 4 — uncovered fail-open `catch` in `readLearningsConfigSafely` | `orchestrate-dev.js:2266-2272` | `learningsConfig.test.js:214` drives a `_readFile` that **throws** for the config path and asserts the run proceeds enabled on §4.1 defaults with no notice; `:463` covers the helper directly. | **Remediated** |
| F7 | 5 — LI-AT-03 titled stronger than its body; three-prompt baseline | `learningsDispatchSet.test.js:445`; `__tests__/fixtures/learnings-baseline/` | The title now states what the body asserts (enabled/disabled parity) and defers the committed-baseline half by name. The committed baseline matrix grew from 3 to **21** prompts (18 `PIPELINE-NON-AUTHORING-PROMPTS`, 2 `PHASE-R-REVIEW-PROMPTS`, 1 `PHASE-F-AUTHORING-PROMPT`), each digest-pinned in `MANIFEST.json` at merge base `5a080c7a`. | **Remediated** |
| F8 | 5 — PROP-ORDER-05 claimed two process invocations, suite delivered one | `learningsDispatchSet.test.js:543` | Arm 2 is now a child `node` invocation of `helpers/learningsComposition.js` — cold module registry, cold heap. Carries a vacuity control (`status: 0, stderr: ""` plus non-empty prompt sets) so a child that failed to run cannot pass as `[] === []`, and diverts `NODE_V8_COVERAGE` so the second entry cannot depress the measured coverage. Ordered-sequence equality, not set equality. | **Remediated** |
| F9 | 6 — `learningsInjection` absent from `pdlc.config.example.json` | `.claude/pdlc.config.example.json`; `pdlc/engine/__tests__/learnings-config-example.test.js` | The section ships all four §4.1 keys at their shipping defaults, with a sibling delivery-blocking test mirroring `advisory-config-example.test.js`. Independently confirmed by a **real-config smoke**: feeding the shipped example file to the real `parseLearningsConfig` yields `invalidKeys: []`, `sectionMalformed: false`, and a config byte-equal to `LEARNINGS_DEFAULTS`. | **Remediated** |
| F10 | 6 — stale operator-facing disclosure family | `pdlc/OPERATIONS.md:96-128`; `CLAUDE.md:104`; `pdlc/README.md:74-79`; `learningsDisclosure.test.js` | All three family members now document the feature. The oracle is **derived, not transcribed** — key set and notice catalogue imported from `orchestrate-dev.js`, each member required to appear — so a fifth key or third notice reds the runbook rather than passing silently. Defaults are independently hand-stated, and each assertion is sliced to the LEARNINGS section so `advisory.enabled: false` a few hundred bytes above cannot satisfy a search for `enabled … true`. | **Remediated** |
| F11 | 6 — mixed count/byte erratum routed to nobody | FSPEC v0.14 erratum (`:83-90`) and BR-6's total-bound paragraph; REQ v0.10 AC-2.4 (`:296-301`); routing comment deleted from the region | Closed rather than bound, which is the stronger disposition. `learningsErratumBinding.test.js` `LI-ERR-01…04` assert the upstream text **by content** (window-scoped accumulation, both `RSN-COUNT` and `RSN-BYTES` named, cause-defined attribution) — a changelog bump alone would not pass — and `LI-ERR-04` reds on a re-introduced `ERRATUM:` routing comment, scoped to the region so the pipeline's own erratum grammar elsewhere in the file is not hostage. | **Remediated** |
| F12 | 6 — "not wired … **yet**" deferral in the capture script | `scripts/capture-learnings-baseline.mjs` | Closed with F1. `LI-ERR-05` strips comments, then asserts no `\byet\b` and no `entrypoint|not wired` survives in live code, plus a positive half (`isMainModule`, `runCaptureScript(`) so deleting the entry point's body would not satisfy it. | **Remediated** |

## §2 Requirements Traceability

One row per REQ acceptance criterion (25 — the set is unchanged at REQ v0.10). "Implementation
path" names the code that makes the criterion true; "Test path" names an oracle whose **contents**
would fail if that implementation broke.

**Writer enumeration (criterion 5).** The traced operator-visible artifacts are (a) the composed
dispatch prompt string and (b) `report.learningsInjection`. `learningsInjectionField`
(`orchestrate-dev.js:14106`) is threaded to six `buildFinalReport` call sites (`:15429`, `:15446`,
`:15471`, `:15495`, `:16989`, `:17024`) and read at `:17130`. It is assigned **once**; no later
stage rebinds or overwrites the key, and `stampReport` is transport-only. Rows 1–25 therefore
trace to the final artifact, not to node/builder output.

| # | Source | Criterion / AC | Implementation path | Test path | Gap? | Severity | Scope |
|---|---|---|---|---|---|---|---|
| 1 | REQ | AC-1.1 — injection occurs when corpus non-empty | `gatherLearningsCorpus` → `selectLearnings` → `renderLearningsBlock` (dev:2583/2427/2543) → suffix in the composed prompt | `learningsDispatchSet.test.js` LI-AT-01 | No | — | — |
| 2 | REQ | AC-1.2 — dispatch-set equality; non-authoring prompts byte-identical | `LEARNINGS_TARGET_DOCTYPES` gate consulted in `injectLearnings` (dev:2644-2700) | LI-AT-02 (set equality); LI-AT-03 (enabled/disabled parity, honestly titled); **`learningsBaselineGuard.test.js` vs the 21-prompt committed baseline at merge base `5a080c7a`** | No | — | — |
| 3 | REQ | AC-1.3 — re-run excludes own LEARNINGS | `isLearningsSelfPath` (dev:2569) consulted before any read (dev:2595) | `learningsCorpus.test.js` LI-AT-25/26 — the self path is never opened and carries `RSN-SELF` | No | — | — |
| 4 | REQ | AC-1.4 — injected material visibly delimited | `renderLearningsBlock` preamble / `<<<`-fenced opener (dev:2550) / END trailer | `learningsBlock.test.js` LI-AT-05/11/12 pin the exact framing strings and the ABRIDGED annotation | No | — | — |
| 5 | REQ | AC-2.1 — all N selected when no bound binds | `selectLearnings` window logic (dev:2427+) | `learningsSelect.test.js` LI-AT-04 + fast-check property over arbitrary N | No | — | — |
| 6 | REQ | AC-2.2 — `maxDocuments` bound | count bound emitting `RSN-COUNT` | `learningsSelect.test.js` LI-AT-07/08; PROP-SELECT cardinality properties | No | — | — |
| 7 | REQ | AC-2.3 — `maxBytesPerDocument` abridgement | per-document truncation + `bounded` flag | LI-AT-09; `learningsBlock.test.js` LI-AT-12 asserts ABRIDGED reaches the rendered artifact | No | — | — |
| 8 | REQ | AC-2.4 — `maxTotalBytes` window, cause-defined attribution | window accumulation + `RSN-BYTES`/`RSN-COUNT` attribution | LI-AT-10/13; PROP-SELECT total-byte property; **`learningsErratumBinding.test.js` LI-ERR-01…03 pin the upstream text to this behaviour** | No | — | — |
| 9 | REQ | AC-2.5 — determinism across two compositions | pure `selectLearnings`/`renderLearningsBlock`; `Buffer.compare` tie-break | **LI-AT-14 — two whole-process invocations (child `node`), with a vacuity control** (was F8) | No | — | — |
| 10 | REQ | AC-2.6 — `docs/discarded/` excluded, no rule of its own | `LEARNINGS_CORPUS_ARGV` pathspecs list only `docs/*/` and `docs/completed/*/` | `learningsCorpus.test.js` LI-AT-27 | No | — | — |
| 11 | REQ | AC-3.1 — per-document rows in the report | `injectLearnings` pushes rows onto `sink.dispatches`; surfaced into `report.learningsInjection` | `learningsRecord.test.js` LI-AT-17/18 set-equality at the per-dispatch locus | No | — | — |
| 12 | REQ | AC-3.2 — not-selected rows + corpus outcomes, closed catalogues | frozen `LEARNINGS_REJECT_REASONS` / `LEARNINGS_CORPUS_OUTCOMES` | LI-AT-19/20 set-equality; **`learningsArmInventory.test.js` LI-T-ARMS-1…3 drive all twelve fail-open arms and assert set-equality to the frozen catalogues** | No | — | — |
| 13 | REQ | AC-3.3 — rule inputs reproducible from report | `sink.ruleInputs.thresholds` built once per run (dev:14098-14104); `orderKeys` per dispatch | LI-AT-21/22 (both loci); LI-AT-23/24 (run-level locus survives to the report) | No | — | — |
| 14 | REQ | AC-3.4 — source document nameable from report | `rows[].path` carried to `report.learningsInjection` | `learningsRecord.test.js` LI-AT-17 | No | — | — |
| 15 | REQ | AC-4.1 — empty corpus → `RSN-EMPTY`, no block | empty result → `corpusOutcome: "RSN-EMPTY"`; renderer returns `""` | `learningsCorpus.test.js` LI-AT-26; `learningsBaselineGuard.test.js` EMPTY state vs committed digests | No | — | — |
| 16 | REQ | AC-4.2 — unreadable / unparseable / unlistable fail open | `RSN-UNREADABLE`/`RSN-UNPARSEABLE`; `try/catch` → `{unlistable:true}` | LI-AT-25; LI-AT-15/16; **`learningsConfig.test.js:214` covers the throwing-read arm** (was F6) | No | — | — |
| 17 | REQ | AC-4.3 — convergence machinery untouched | no writes to review-loop state; `buildLearningsInjector` returns `null` when disabled | `learningsBaselineGuard.test.js` DISABLED/UNLISTABLE states + LI-AT-29 | No | — | — |
| 18 | REQ | AC-4.4 — admits-nothing thresholds inject empty, do not refuse | zero thresholds produce an empty selection, not an error | `learningsConfig.test.js` zero-threshold cases; ADMITS-NOTHING baseline state | No | — | — |
| 19 | REQ | AC-5.1a — `enabled:false` → byte-identical to recorded baseline | `buildLearningsInjector` returns `null`; no suffix appended | `learningsBaselineGuard.test.js` DISABLED state vs the **21-file** committed fixture set + MANIFEST digests, plus the >1000-byte control fixture that must differ | No | — | — |
| 20 | REQ | AC-5.1b — malformed section fails open with `NTC-MALFORMED` | `parseLearningsConfig` `sectionMalformed`; notice at dev:14061-14068 | `learningsConfig.test.js` LI-AT-30 | No | — | — |
| 21 | REQ | AC-5.1c — wrong-typed **declared §4.1 key** → `NTC-KEYTYPE`, stays enabled | `numberField`/`boolField` fallbacks + `invalidKeys.push(key)`; notice at dev:14069-14076 | LI-AT-32 over the three thresholds **plus `enabled: "false"` at `learningsConfig.test.js:358` and `:367`** — the truthy-but-not-boolean arm that must keep the feature ON. Was the v1 row-21 gap. | No | — | — |
| 22 | REQ | AC-5.2 — filesystem footprint is exactly the named reads | reads confined to `gatherLearningsCorpus`; no writer in the region (BR-15) | `learningsDispatchSet.test.js` LI-AT-33/34 — read half and the `recordWrite` write half against a dedicated temp git repo | No | — | — |
| 23 | REQ | AC-5.3 — no new authoring requirement | no change to completeness/verdict/round-window code | `learningsDispatchSet.test.js` LI-AT-35 | No | — | — |
| 24 | REQ | AC-6.1 — fixture-driven, no live model calls | all suites drive `reviewLoopDev`/`mainDev` through injected `_agent` doubles | `learningsSuiteMap.test.js` LI-T-SUITEMAP (35 ATs partitioned over the suites, directory-wide closure) + LI-T-ARMS | No | — | — |
| 25 | REQ | AC-6.2 — byte-identity vs recorded pre-feature baseline; both notices fire | committed `__tests__/fixtures/learnings-baseline/` + `MANIFEST.json` pinned to merge base `5a080c7a`; `scripts/capture-learnings-baseline.mjs` regenerates it | `learningsBaselineGuard.test.js` (4 non-injecting states + control); notices via LI-AT-30/32; **provenance reproduced by executing the committed entry point** (`learningsCaptureScript.test.js:348`) | No | — | — |

**Property-level traces (PROPERTIES).** 70 PROP ids, mapped to tests through the AT map rather
than by literal id (22 ids appear verbatim in test text; the remainder trace through their owning
`LI-AT-` title, and `LI-T-SUITEMAP`'s directory-wide closure is what makes the partition total).
PROP-ORDER-05's divergence — the one the v1 round recorded — is closed at row 9. `PROP-RECORD-09`
is asserted in its negative form (no suite asserts on `runMirror`'s value) with both a positive
control over a non-empty suite set and a negative control over a planted synthetic assertion,
which is the correct shape for a property about absence.

## §3 Integration-Boundary Notes

- **Writers.** `report.learningsInjection` has one writer (§2 above). The composed prompt's
  suffix has one appender, gated by `LEARNINGS_TARGET_DOCTYPES`.
- **Config-disclosure family** (`pdlc.config.example.json`, `OPERATIONS.md`, `CLAUDE.md`,
  `pdlc/README.md`): all four members carry the feature, two of them oracle-pinned. Real-config
  smoke passes against the shipped example.
- **Hook family.** The branch adds `check-finding-grammar.sh`; it is registered in
  `pdlc/hooks/hooks.json` and disclosed in both members of the hook-table family (`CLAUDE.md:85`,
  `pdlc/README.md:34`). `OPERATIONS.md` carries no hook table and is not a member.
- **Engine channel.** `pdlc/engine/README.md` delegates config documentation to `pdlc/README.md`
  by design; `pdlc/engine/lib/run.mjs` mentions the advisory seam only in comments. No sibling
  surface in the engine needs a `learningsInjection` entry.
- **Version pairing.** `pdlc/.claude-plugin/plugin.json` bumped `0.23.2` → `0.23.3`, satisfying
  `OPERATIONS.md:145`'s obligation for a branch that changes `pdlc/workflows/` and `pdlc/hooks/`;
  `pdlc/engine`'s `pdlcPluginCompat: "^0.23.0"` still admits it.
- **Bundle.** `node pdlc/workflows/build-runtime.mjs --check` reports `in-sync`.
- **Deferrals.** No unbound deferral survives on the branch. Both of the prior round's (F11, F12)
  were **closed** rather than bound, and both closures are guarded against reopening by
  `learningsErratumBinding.test.js`.
- **Not this feature's.** `pdlc/workflows/package.json:16` cites "CODE_REVIEW v2 §1-1" for the
  two-stage coverage rationale; the nearest matching document,
  `docs/completed/pdlc-advisory-wave-gate/CODE_REVIEW-pdlc-advisory-wave-gate-v2.md`, has an
  empty §1. The citation is imprecise, but the text is **unchanged by this diff** (the branch
  only re-encoded its em dashes), so it is inherited, not introduced. Recorded here, not counted.

## Notes for the remediator

1. G1 is a one-line edit at `orchestrate-dev.js:2425`: delete `feature: string,` from the
   `@param` record. Nothing else on the branch requires work.
2. The family sweep behind G1 found no second member. Do not go looking for one — but do re-run
   the `@param`-vs-signature comparison if the fix touches any other signature in the region.
3. Everything else on this branch is verified. The twelve prior-round findings are remediated to
   the evidence bar (production path **and** a failing-capable oracle), the coverage gate is green
   at exit 0 with every included module clear of 85% branch, `build-runtime.mjs --check` is
   in-sync, and the real-config smoke against the shipped `pdlc.config.example.json` passes.
4. Nothing in this review was fixed. This document is evaluation only.
