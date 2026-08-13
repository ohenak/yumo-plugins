# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/REQ-pdlc-engine-distribution.md` (v0.7, 2026-08-13)
**Date:** 2026-08-13
**Iteration:** 2
**Scope:** Delta re-review against `CROSS-REVIEW-software-engineer-REQ-v1.md`. Engineering lens
only — feasibility, implementability, existing-code claim verification, integration risk.
Diff base `cc06f696` (the commit v1 reviewed) → HEAD `1c4fdb60`.

## Prior findings — disposition

All five round-1 High findings are resolved. Each was re-checked against the revised text and
against HEAD, not merely against the changelog's claim to have fixed it.

| v1 ID | Sev | Status | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved** | O-7 exists and decides *two* records rather than adjudicating one. T-1a/T-1b split the table row; AC-1.4 reads T-1a; AC-3.6 now says the tag "is an engine tag… never compared against the plugin's number". BL-03's resolution form correctly states the transcription — not the paragraph — discharges it. |
| F-02 | High | **Resolved** | §1.1 re-measured at `89babe8e`; O-F now cites M-ENG-13 rather than restating line numbers. `pdlc/engine/lib/report.mjs:77-96` does carry `engineVersion`/`pluginVersion`, and the workflow modules carry none — so REQ-EDIST-04 is correctly narrowed to the *committed* artifacts, and AC-4.1/AC-4.4 are no longer green-on-arrival. |
| F-03 | High | **Resolved** | O-8 now names `private` first. Verified `pdlc/engine/package.json:4` is still `"private": true`. (One factual defect remains in how O-8 frames the other two — F-15 below, not a regression of F-03.) |
| F-04 | High | **Partly resolved — new defect** | The count→set-equality restatement landed at T-7, C-5 and AC-3.4 exactly as asked. But the enumeration those three now delegate to is not made of literal names. See **F-14**. |
| F-05 | High | **Resolved** | R-5 exists, prices all three resolutions and names the anti-fork consequence of each; O-10 owns the choice; AC-1.3 is set-equality. Verified the collision is real: `pdlc/engine/lib/run.mjs:53-54` resolves `../../workflows/orchestrate-{dev,queue}.js`, and `__tests__/run.test.js:51` (no vendored copy under `pdlc/engine/`) plus `:67` (exact repo-relative path) both go red under resolution (a). |
| F-06…F-13 | Med/Low | **Resolved** | F-06 → O-9. F-07 → AC-2.1's explicit "that refusal **is** the pass condition". F-08 → §1.2 closing paragraph rewritten to the landed disposition. F-09 → "named by feature name, not queue Order" in §1.2 and O-3. F-10 → T-1b cites `plugin.json` via M-ENG-11, no inline literal. F-11 → C-8 now says "**distribution-channel** credential". F-12 → O-1 states the licence decision once and routes it to O-8. F-13 → Status reads "Draft — in review (Phase R)". |

## Findings

New findings only, scoped to sections changed since `cc06f696`. Every existing-code claim the
revision introduced was re-checked at HEAD in one pass.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-14 | High | Cross-Feature | **The set-equality fix delegates to an enumeration that is not made of literal check names, so the oracle it creates cannot pass.** T-7 now reads "the set of **literal** required-check names enumerated at M-ENG-10 — that enumeration is the authoritative list"; C-5 and AC-3.4 both defer to the same set, and O-B explicitly demotes its own words to "a gloss, not the names". But M-ENG-10 rows 1 and 2 record the *unexpanded YAML expressions* — `Unit tests (${{ matrix.os }}, node ${{ matrix.node }})` and `Engine tests (${{ matrix.os }})` — copied off `pr-tests.yml:28` and `:78`. GitHub reports the expanded names: with `os: [ubuntu-latest]` and `node: ['20']` (`:39-40`, `:88-89`) they are `Unit tests (ubuntu-latest, node 20)` and `Engine tests (ubuntu-latest)`. The repo already knows this — `CLAUDE.md`'s CI table names `Unit tests (ubuntu-latest, node 20)`, and Phase PUB polls `statusCheckRollup` for exactly that string. So a verifier who implements AC-3.4 as written compares four resolved names against a list containing two templates and fails on two members of a five-member set; a verifier who "fixes" it by eyeballing has restored the containment-and-judgement oracle F-04 asked to remove. Rows 3–5 are unaffected (those jobs are not matrixed). Fix at the authority, not here: correct M-ENG-10 to record expanded names, and have it state that the matrix is what expands them, so adding an OS or a Node version is visibly a change to the required-check set and not a silent one. Then T-7/C-5/AC-3.4 need no further edit. | T-7, C-5, AC-3.4, O-B (via M-ENG-10) |
| F-15 | Medium | Local | **O-8's ordering claim is stated as measured fact but is not measured, and one of its three items is not a publish blocker at all.** O-8 says "`npm publish` fails on them in this order (M-ENG-11): (1) `private` … refused outright, before licence or credentials; (2) the package name `pdlc-engine` is **unscoped**; (3) `license: UNLICENSED`". M-ENG-11 records the four field values and that the package is unpublishable as declared; it records no failure ordering, and none of the three is a citation for one. More substantively, item (2) is miscategorised: an unscoped name does not make `npm publish` fail — it publishes to the public registry under that name, or fails on name-taken/permission, which is a different failure with a different remedy. Its real status is "contradicts DEC-DIST-05's scoped-package decision", which is a decision-consistency blocker, not a tool blocker. Item (3) likewise: `UNLICENSED` is a policy contradiction the operator must resolve, not something npm refuses. Only (1) is mechanically enforced. Fix: drop the invented ordering, and label each item by what actually stops it — (1) tool-enforced, (2) and (3) decision-enforced. The operator reading this to plan a first publish will otherwise expect npm to catch (2) and (3) for them. | O-8 |
| F-16 | Medium | Local | **AC-6.2's bundle-channel oracle is still absence-only; the sentence asserting otherwise contradicts itself.** It reads: the bundle channel "is identified **positively by the engine's absence of an engine provenance block**, which is itself asserted". Identification by absence is not a positive assertion however it is worded — a run that crashed before writing anything, a truncated report, or a report shape change all satisfy "no engine provenance block" without a bundle run having happened. The grounding is right (`report.mjs` adds an `engine` block only on the engine path, so the bundle path structurally cannot carry one), but the criterion needs a real positive on the same path. The clause that follows already supplies one and is not being used as the oracle: the two installs' write roots are disjoint enumerated paths. Fix: state the bundle-channel pass condition as a positive the bundle run *does* produce — a `.claude/workflows/`-rooted artifact, or a channel field the bundle path can actually write — paired with the absence assertion, rather than asking absence to carry the identification alone. | AC-6.2, C-9 |
| F-17 | Medium | Local | **AC-1.3 is stated over "the file list the package declares it ships", but M-ENG-11 records that `files` is absent, so today the package declares nothing.** The set-equality shape is right and this is a target-state criterion, so it is not wrong — but "declares" quietly makes a `files` field a requirement of the design without saying so, and a verifier can equally read it as the `npm pack` output, which is a different set (it would include `__tests__/` and its fixture corpus unless excluded). Those two readings disagree on exactly the files most likely to leak. Fix: name which artefact is the oracle — the packed tarball's contents is the stronger choice, since it is what a consumer actually receives and it makes an absent `files` field fail rather than pass vacuously. | AC-1.3 |
| F-18 | Low | Local | **AC-3.4's set-equality makes any addition a failure, including the one this feature is likely to make.** "a deletion, a rename **and** an unreviewed addition all fail" is the right bar, but "unreviewed" is doing load-bearing work that no mechanism implements: a set-equality check cannot tell a reviewed addition from an unreviewed one. If REQ-EDIST-03's publish workflow ever contributes a required check, AC-3.4 fails until M-ENG-10 is updated. That is probably the intended behaviour — but it should be stated as such (the enumeration is the change-control point) rather than implied by an adjective the oracle cannot see. | AC-3.4 |
| F-19 | Low | Local | **AC-2.3's positive half is undefined on the install leg.** "its own install location changed (the positive that proves the install was not a silent no-op)" works for an upgrade, where a prior location existed to differ from. On a clean-machine install there is no before-value, so "changed" has no referent. Fix: split the positive per leg — install asserts the location now exists and resolves to the expected version; upgrade asserts it differs from the recorded before-value. | AC-2.3 |
| F-20 | Low | Local | **AC-4.5's exception clause is unbounded enough to swallow the assertion.** "every file … hashes identically after it, **except those the run itself authors as part of its normal phase work**" — since a pipeline run's normal phase work can author or rewrite any document under `docs/{feature}/`, the exception can absorb any observed diff, and the non-regression property becomes unfalsifiable in the general case. Fix: bound it by enumeration rather than by category — the exempt set is the artifacts of the feature this run is executing, and files belonging to *other* features must hash identically with no exception at all. | AC-4.5 |

## Questions

| ID | Question |
|----|---------|
| Q-05 | O-7 settles which number a tag names, but not the cadence question underneath it: does a plugin-only release (a `SKILL.md` edit plus a plugin version bump, no engine change) require an engine republish to widen `pdlcPluginCompat`? Today's declared `^0.22.0` (`pdlc/engine/package.json:9`) admits every 0.22.x, so a patch bump needs nothing — but a 0.23.0 plugin release would strand every installed engine on a refusal until an engine republish lands. R-2 names this friction; is "the engine republishes on every plugin minor" the accepted operating cost, or does O-6's per-release record need a widening path that is not a republish? |
| Q-06 | AC-5.6 permits two branches (refuse, or run released and announce the variable was ignored). The second branch would make the engine ignore `PDLC_PLUGIN_ROOT` — but that variable is what `handshake.mjs:134` prints as the *remedy* for a compat refusal, and `skills.mjs:212-231` honours it ahead of every other candidate. Does the second branch mean the remedy string must change too, or is the ignore scoped to dev-mode marking only, leaving plugin-root resolution untouched? These have very different blast radii and the TSPEC will have to know which. |

## Positive Observations

- The M-ENG-* extraction is the right structural move and was done properly, not cosmetically:
  §1.1 now carries observations and delegates every line-cited fact, so the REQ's altitude is
  correct and a code drift is a one-file correction. F-14 is a defect in one row of the new
  authority, not an argument against the move.
- O-7 resolves BL-03 by rejecting the question's premise — two records, not one contested
  record — and then follows the consequence through every dependent row (T-1a/T-1b, T-4, AC-1.4,
  AC-3.6, AC-3.7, C-1) rather than leaving half the document reading the old assumption. The
  rejected alternative is named with its cost (re-coupling the release cadences), which is what
  makes it a decision rather than a preference.
- R-5 is an honest pricing of the packaging collision, including the part that is
  uncomfortable: resolution (a) is cheapest *and* weakens the anti-fork oracle, and the text
  says so instead of picking (a) and hoping. Pairing it with O-10's "a resolution that silently
  drops the anti-fork property is not acceptable" gives the TSPEC a real constraint.
- AC-4.4's anti-echo half is stated as a change check across two observations rather than as an
  adjective — change the plugin version, the pair changes; revert, it restores. That defeats a
  hardcoded constant, which a single-observation equality assertion would not.
- AC-5.1 putting the "newer version exists" probe behind an injectable seam is the right call
  for a criterion that otherwise smuggles a network dependency into a pin test, and it makes
  NG-3's "may notice, never fetches" boundary testable by stubbing rather than by inspection.
- AC-2.1 now names its own pass condition on a plugin-free machine (reaching the handshake, not
  dispatching), which removes the contradiction with AC-1.1 without weakening either.

## Recommendation

**Needs revision**

One High finding, and it is narrow. F-14 is the residue of the round-1 fix that landed
everywhere except at the enumeration it points to: T-7, C-5 and AC-3.4 correctly became
set-equality over M-ENG-10, but M-ENG-10 rows 1 and 2 hold unexpanded YAML expressions rather
than the names GitHub reports, so the oracle those three ACs create fails on two of five
members. The correction belongs in `docs/_constraints/pdlc-engine-baseline.md` — record the
expanded names (`Unit tests (ubuntu-latest, node 20)`, `Engine tests (ubuntu-latest)`) and note
that the matrix is what expands them, so a matrix change is visibly a change to the required-check
set. With that done, no edit to this REQ's T-7, C-5 or AC-3.4 is needed.

The four Medium findings are worth taking in the same pass but none blocks FSPEC authoring:
relabel O-8's three items by what actually enforces each and drop the invented npm failure
ordering (F-15); give AC-6.2's bundle channel a positive the bundle path actually produces
(F-16); say whether AC-1.3's oracle is the declared `files` list or the packed tarball (F-17).
The Lows are wording precision on ACs that a test engineer will otherwise have to interpret.

Everything the round-1 review blocked on is otherwise closed, and closed against the code rather
than against the changelog.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 3, "low": 3}

