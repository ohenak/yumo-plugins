# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-workflow-distribution/REQ-pdlc-workflow-distribution.md` (v14.0, `09aa773`)
**Date:** 2026-07-28
**Iteration:** 13 (SE round 13; orchestrator loop iteration 1 against REQ v14)
**Scope:** REQ — product/requirements altitude, per the v14 stopping rule (POSTMORTEM-R R-1/R-5)

## Review posture

v14 is a de-escalation revision. I have honoured its stopping rule: I did **not** raise oracle,
fixture, trace-grammar, seam-vocabulary, coverage-floor or property-axis findings — every such
observation I made maps to an existing §10 obligation (O-1, O-7, O-9, O-10, O-11, O-12) and is
recorded there, so it is downstream, not a REQ defect. The findings below are restricted to
scope, phasing, and observable AC behaviour.

I re-verified all eleven §0 grounding facts in one pass. **All eleven hold** at `09aa773`:
`marketplace.json` → `"source": "./pdlc"`; the cache holds `0.9.0` and `0.10.0` with ES modules
and no bundle; four tracked artifacts in `.claude/workflows/` with duplicate `meta.name`; no
`.github/`; all three shipped hook scripts index mode `100644`; `build-runtime.mjs` imports only
`fs`/`path`/`url` and writes one `OUT_DIR`; all three hook scripts contain a Python discovery
loop. AC-6.4's "measured covered set today: 5 files" also reproduces exactly
(`docs/PLAN-pdlc-integration-boundary-gates.md`, `docs/_queue/QUEUE.md`,
`docs/design/MASTER-PLAN-engineering-loop.md`, `pdlc/workflows/orchestrate-{dev,queue}.js`).

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **The A′→B edge the REQ claims to close is unowned by any AC and undeferred.** §1 states "This REQ closes A′→B (REQ-DIST-06: build to a shippable path **and ship it**)", and §9 traces US-04 ("a merged workflow change is published in the plugin package and reaches the consumers it was written for") to AC-6.1–6.5. But 6.1–6.5 stop at *`dist/` is built, tracked and committed in this repo*. The diagram's B-edge is labelled `(plugin publish/update, version-pinned)` and nothing requires the pin to move: no AC requires `pdlc/.claude-plugin/plugin.json` `version` to change when `dist/` bytes change, and no AC assigns ownership of cutting the release. The failure is silent and green: maintainer edits a workflow, rebuilds `dist/`, merges, does not bump `version` → the marketplace advertises nothing new → the consumer's plugin cache is never refreshed → the consumer's drift check compares its copy against that unchanged installed plugin and reports **all rows `in-sync`, exit 0, queue proceeds silently**. §0 fact 6 already establishes the enabling condition — `0.9.0` and `0.10.0` ship byte-identical workflow files, i.e. this repo has *already shipped* two versions without the workflow content moving, which is the same defect in the opposite direction. This is not covered by a deferral: D-DIST-05 is scoped to *cache stale behind the marketplace* (the updater's job), D-DIST-06 to *hosted CI / release automation*. "The maintainer must bump the plugin version when `dist/` changes" is neither automation nor the updater — it is the requirement's own edge. Resolve one of three ways, all requirements-altitude: (a) an AC under REQ-DIST-06 requiring the version bump, with a `npm test` oracle comparing `plugin.json` version against the last commit that changed `dist/`; (b) an explicit D-DIST-08 deferral naming the residual and the manual step that covers it; or (c) restate §1/§9 so US-04 traces only to "published *in the package*", not "reaches the consumers". | §1 (diagram + closing paragraph), §9 US-04, REQ-DIST-06, §8 |
| F-02 | Medium | Local | **AC-6.4's stated invariant is observably false against its own pattern set, and §1 misquotes the two documents that motivate the feature.** §1 says the consumer copy is "today, `managed manually` (both orchestrator SKILLs say so)". Neither SKILL says that. Measured: `pdlc/skills/orchestrate-dev/SKILL.md:98` — "Until a formal `pdlc install` mechanism exists, copying the bundle into a consumer repo **is manual**"; `pdlc/skills/orchestrate-queue/SKILL.md:183` — "Copying the bundle into a consumer repo **remains manual** until a formal `pdlc install` mechanism exists". Consequence: AC-6.4's four literal patterns (two `orchestrate-{dev,queue}.js` forms, `.claude/workflows/*.js`, the phrase `managed manually`) match **neither** SKILL line, so both files sit outside `coveredViolations(repoRoot)` — yet they are the most normative distribution statements in the repo and the ones §1 cites as evidence of the problem. AC-6.4 is titled "No document contradicts the manifest" and asserts `coveredViolations == ∅`; that conjunction reads as a completeness claim the criterion cannot deliver. §6 handles the two SKILLs only as "the three already-correct normative documents get their `dist/` path updates as ordinary in-scope edits" — a one-time edit with no invariant behind it, so the superseded convention can be reintroduced into either SKILL and the oracle stays green forever. Either add a fifth literal pattern covering the manual-copy phrasing (and re-measure the covered set — it grows past 5), or restate AC-6.4's claim as exactly what it computes ("no document states the superseded *path* convention") and drop the completeness framing from the title. Correct §1's quotation either way. | AC-6.4, §1, §6 (document corrections) |
| F-03 | Low | Local | **§0 fact 3's path-mapping claim carries no cited evidence, and it is the precondition of the entire feature.** "An artifact built at `pdlc/workflows/dist/X` installs at `${CLAUDE_PLUGIN_ROOT}/workflows/dist/X` — the `pdlc/` segment is dropped, the `dist/` segment survives" is stated as measured, but nothing under a nested build-output directory has ever shipped, so the second clause is inference. The available evidence is good and should simply be cited: the installed cache **does** contain a nested subdirectory, `~/.claude/plugins/cache/yumo-plugins/pdlc/0.10.0/workflows/__tests__/`, which demonstrates that subdirectory structure under `workflows/` survives packaging. Cite it in fact 3 (or fold it into BL-01, which today spikes only `${CLAUDE_PLUGIN_ROOT}` resolution and not subdirectory shipping). | §0 fact 3; BL-01 |
| F-04 | Low | Local | **AC-2.9(5) and §10 O-7 disagree on whether the trace seam is mandated.** AC-2.9(5) is unconditional and normative: "The scripts own two declared, test-only environment seams (§4): `PDLC_TRACE_FILE` … and `PDLC_FAULT`", and §4 lists both as owned constants. O-7 is conditional: "**If** a trace seam is specified: pin delimiter and quoting…". O-1 is likewise conditional in effect ("repair by: … giving the trace grammar row-id and phase fields"). A downstream author reading O-7 may conclude the seam is optional; a reader of AC-2.9(5) may not. Since the v14 preamble's stated intent is that the *vocabulary* moves downstream while the seams' *existence* stays a requirement, make O-7 unconditional ("the trace seam is mandated by AC-2.9(5); TSPEC pins delimiter and quoting"), or relax AC-2.9(5) to "the scripts provide a test-observable call-order seam; its form is a TSPEC decision". | AC-2.9(5), §4, §10 O-7 |
| F-05 | Low | Local | **§6 In-scope never lists the `hooks.json` edit the SessionStart hook requires.** BL-03 gates on "`hooks.json` accepts a second `SessionStart` entry beside `nudge-consolidation.sh`", so the REQ knows the registration exists, but §6's bullet is only "SessionStart warning hook" and the enumerated file-level scope items (`build-runtime.mjs`, `__tests__/runtimeBundle.test.js`, execute bits on five scripts, the `git rm` landing step, `CLAUDE.md`/`pdlc/README.md`) omit `pdlc/hooks/hooks.json`. Add it — the landing step is otherwise incomplete and the hook never fires. | §6 In-scope; BL-03 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | For F-01: is the intended disposition (a) an AC, (b) a D-DIST-08 deferral, or (c) a narrowing of US-04's traceability? The choice changes §6 scope, so it belongs in the REQ rather than in FSPEC. |
| Q-02 | For F-02: after the two SKILL.md files are corrected in this landing, is anything meant to keep the manual-copy phrasing from returning — or is the one-time edit the accepted end state? |
| Q-03 | §0 fact 11 and §6 commit this feature to fixing the execute bit on the three *existing* sibling hook scripts. Those three currently work (`hooks.json` invokes them by bare path at mode `100644`), so this is a latent class fix rather than a live bug. Confirmed as deliberate in-scope work rather than something to split out? |

## Positive Observations

- All eleven §0 grounding facts re-verify at `09aa773` in a single command each, as the section
  claims. That is unusual and materially reduced this review's cost.
- AC-6.4's "measured covered set today: 5 files" reproduces exactly under the four literal
  patterns and the four path-rule exemptions. The move from a hand-listed enumeration (v2–v5) to
  a computed pure function of a root directory is the right shape and now holds up under an
  independent grep.
- The de-escalation itself is sound engineering judgement: AC-1.0's baseline-then-rows ordering,
  AC-1.1's six states with the `stale`/`local-edit` discrimination on recorded `consumerHash`
  rather than mtime, and AC-2.9's write-failure contract are all product-observable and belong at
  REQ altitude; the trace grammar and fixture construction that v13 carried did not. §10 binds
  the removed material by name to a named downstream document, so nothing was dropped.
- The `--check` exits 2 / queue proceeds asymmetry on `unverified` (AC-3.3) is explicitly argued
  rather than accidental, and the argument is correct: an assertion surface and a work surface
  should optimise for opposite errors.
- REQ-DIST-04's "primary detector is the hook, not the queue" preamble correctly identifies that
  the queue check lives inside the artifact whose staleness it detects, and forbids relying on
  AC-4.1 for first adoption. That is the bootstrapping trap this feature most easily falls into.

## Recommendation

**Needs revision**

Required to clear: **F-01** — assign an owner to the A′→B publish edge (AC, deferral, or a
narrowed US-04 trace); **F-02** — reconcile AC-6.4's completeness claim with its pattern set and
fix §1's quotation of the two SKILLs. F-03/F-04/F-05 are one-line corrections that can land in
the same revision.

Both blocking findings contest scope and an AC's observable behaviour — neither is an oracle,
fixture or seam-specification defect — so raising them is consistent with the v14 stopping rule
and with §10 O-13.
