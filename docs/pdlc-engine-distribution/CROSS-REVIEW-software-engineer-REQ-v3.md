# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/REQ-pdlc-engine-distribution.md` (v0.8, 2026-08-13)
**Date:** 2026-08-13
**Iteration:** 3
**Scope:** Delta re-review against `CROSS-REVIEW-software-engineer-REQ-v2.md`. Engineering lens
only — feasibility, implementability, existing-code claim verification, integration risk.
Diff base `1c4fdb60` (the commit v2 reviewed) → HEAD `5f349a2d`.

## Prior findings disposition

All seven round-2 findings are resolved, including the one High. Each was re-checked against
HEAD rather than against the v0.8 changelog's claim about it.

| v2 ID | Sev | Status | Evidence |
|---|---|---|---|
| F-14 | High | **Resolved** | M-ENG-10 now carries two columns and the rendered one is correct. Verified against the workflow itself: authored `name:` strings at `pr-tests.yml:28`, `:78`, `:112`, `:138`, `:196`; the matrix that expands rows 1–2 is `os: [ubuntu-latest]` / `node: ['20']` at `:40-41` and `os: [ubuntu-latest]` with no node axis at `:87` — exactly what M-ENG-10 records at `pdlc-engine-baseline.md:196-208`. The rendered names now match `CLAUDE.md`'s CI table (`Unit tests (ubuntu-latest, node 20)`). T-7 and AC-3.4 require equality in **both** alphabets, so the oracle can now pass on a correct repo and fail on a matrix edit. |
| F-15 | Medium | **Resolved** | O-8's invented failure ordering is gone. The three items are now labelled by what actually enforces each — (1) tool-enforced, (2) and (3) decision-enforced — and "npm would publish it happily under the wrong name" is the correct characterisation of the unscoped-name item. |
| F-16 | Medium | **Partly resolved → F-21** | AC-6.2 is no longer *worded* as absence-only, but conjunct (3) rests on a false statement about existing behaviour, so the oracle still collapses to a weak positive plus an absence. See F-21. |
| F-17 | Medium | **Resolved** | AC-1.3's oracle is the packed tarball, and the AC now states *why* (`files` absent per M-ENG-11 ⇒ a "declared list" oracle passes vacuously). Verified: `pdlc/engine/package.json` still has no `files` field. The expected set also excludes the test corpus now, which is what an `npm pack` default set would otherwise sweep in. |
| F-18 | Low | **Resolved** | AC-3.4 says "any addition fails" is literal, not a judgement about review, and names M-ENG-10 as the change-control point. The load-bearing adjective is gone. |
| F-19 | Low | **Resolved** | AC-2.3 split per leg; the install leg no longer asserts a change against a before-value that does not exist on a clean machine. |
| F-20 | Low | **Resolved** | AC-4.5's exception is now the run report's own authored-file enumeration — decidable from output rather than from judgement — with the "does the report enumerate them today?" gap routed to O-9 rather than assumed. Other features' files are exempt from the exception entirely. |

## Findings

New findings only, scoped to sections changed since `1c4fdb60`. Every existing-code claim the
revision introduced or repointed was re-checked at HEAD in one pass.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-21 | High | Local | **AC-6.2's conjunct (3) states something no run does, so the bundle-channel oracle still reduces to an absence.** The AC now identifies the bundle channel by three observations "bound to one run", of which (3) is "the write root it touched is the plugin's `.claude/workflows/`". A bundle-channel run touches no such write root. The workflow runtime has no `fs`, `process` or `import` at all (M-ENG-13, DEC-DIST-01), so it cannot write there under any circumstance; `.claude/workflows/` is written by `sync-workflows.sh` and by the SessionStart drift hook, not by a run, and the runtime's own contact with that tree is a **read**: `orchestrate-queue.js:79` declares `DRIFT_STATE_PATH = ".claude/workflows/.pdlc-drift-state.json"` and `:1720` describes it as "the single injected read". Both channels' runs write to the *same* root — the consumer repo's `docs/{feature}/` — so the two are not disjoint on the write axis at all. Strike (3) and AC-6.2 is (1) "the run emitted its named artifacts" plus (2) "no provenance block", i.e. a weak positive plus the absence F-16 asked to pair. Fix, one clause: repoint (3) from *write* root to **load root** — the tree the executing modules were loaded from, `.claude/workflows/` versus the engine's own install location, which genuinely is disjoint and is the thing that differs. Then say how a verifier observes it for a channel that C-4 forbids teaching to self-report: installing only one channel makes the load root a *precondition of the experiment*, not an observation of it, and a precondition cannot discharge an oracle. If no run-bound observation of the load root exists on the bundle side, that is the honest answer and it belongs at **O-9** next to AC-4.2's carrier problem, not inside an AC that reads as already solved. (The trailing sentence, "the two installs' write roots are disjoint", is true — of the *installs*: sync writes `.claude/workflows/`, npm writes the install location. It is a different claim from (3) and can stay.) | AC-6.2, C-9, O-9 |
| F-22 | Medium | Local | **O-5's repointed citation is off by one and excludes the exact string it is cited for — and v0.7's citation was correct before the revision changed it.** O-5 now cites `pdlc/engine/lib/handshake.mjs:130-133` "where the compat-refusal remedy string names the variable". Lines 130–133 are a blank line plus the first three lines of `const REMEDY`; the literal `PDLC_PLUGIN_ROOT` is on `:134` — which is precisely what v0.7 cited (`handshake.mjs:134`) before this round repointed it. The repoint away from M-ENG-06 was right; the new range is wrong. Two fixes, either sufficient: cite the named symbol (`REMEDY` in `pdlc/engine/lib/handshake.mjs`) rather than a line window, which is what the baseline file's own citation-form note recommends for exactly this drift; or, better for REQ altitude, add the fact as an `M-ENG-*` row and cite it by id — round 1's F-02 moved every code-level fact out of this REQ for this reason, and O-5 quietly moved one back in. | O-5 |
| F-23 | Medium | Local | **AC-3.4's rendered-name equality does not say whether it is decidable offline, and the two candidate observation sources differ enormously in cost.** The authored-column equality is a file read. The rendered-column equality has two plausible implementations: query GitHub for the check-run names on a real PR (accurate, but needs network, a live PR, and credentials — none of which the other ACs' oracles need), or expand the matrix locally (offline, but means writing a `${{ matrix.* }}` evaluator whose own correctness then has to be maintained, and which will silently rot the day the workflow uses any expression form it does not implement). AC-1.3 sets the precedent by saying "Decidable offline, without publishing" in the AC itself; AC-3.4 should say which side of that line it sits on. Naming the constraint is REQ-level; picking the mechanism remains the TSPEC's. | AC-3.4, T-7 |
| F-24 | Low | Local | **T-7/AC-3.4 make M-ENG-10 a forward change-control gate, but the baseline file declares itself a point-in-time measurement and "not a reviewed pipeline artifact".** AC-3.4 now says a check this feature adds "must land in M-ENG-10 first". M-ENG-10's own tail agrees ("a change to either is a change to this fact first"), so the two are not in contradiction — but the file header still reads "Measured on 2026-08-08 … Read-only, not a reviewed pipeline artifact. No cross-review is written against it, nothing gates on it", and AC-3.4 now gates on it. Recording a check that does not exist yet is also not a measurement. Cheapest resolution: let the *expected* set be FSPEC-owned, exactly as AC-1.3's expected set is, seeded from M-ENG-10 as the current-state observation — measurement stays measurement, and the change-control point lands in a document that is reviewed. | T-7, AC-3.4 |

## Questions

| ID | Question |
|----|---------|
| Q-05 | *(carried, unanswered — no text changed on it this round)* O-7 settles which number a tag names, but not the cadence question underneath it: does a plugin-only release (a `SKILL.md` edit plus a plugin version bump, no engine change) require an engine republish to widen `pdlcPluginCompat`? Today's declared `^0.22.0` (`pdlc/engine/package.json:9`) admits 0.22.x, so a patch bump needs nothing — but a 0.23.0 plugin release strands every installed engine on AC-1.1's refusal until an engine republish lands. R-2 names the friction; is "the engine republishes on every plugin minor" the accepted operating cost, or does O-6's per-release record need a widening path that is not a republish? |
| Q-06 | *(carried; AC-5.6 unchanged this round)* AC-5.6 permits two branches (refuse, or run the released version and announce the variable was ignored). Does the second branch mean `PDLC_PLUGIN_ROOT` stops being honoured at `handshake.mjs`/`skills.mjs` — in which case the remedy string at `REMEDY` must change too — or does "ignored" scope to dev-mode marking only, leaving plugin-root resolution untouched? Different blast radii; the TSPEC will need to know which. |
| Q-07 | AC-1.1 now exempts `pdlc doctor` and says it "reports the same triple (AC-1.4)". Verified that `doctor` really is dispatch-free today (`pdlc/engine/bin/pdlc.mjs:204-207`: "Dispatches NOTHING: no transport is constructed"), so the exemption is sound. Is the *triple* also already there, or is that new work? `cmdDoctor` prints `result.banner` plus rung states (`:209-224`); if the banner does not name the declared range and the found plugin version, AC-1.1's exemption clause quietly adds a small piece of implementation that no O-row owns. Worth one sentence either way. |

## Positive Observations

- The F-14 fix was done at the right layer and done completely. M-ENG-10 gained a second
  column rather than having its single column overwritten, so the distinction that caused the
  defect — authored versus rendered — is now visible in the artefact rather than in a reviewer's
  head, and the file says which consumer reads which alphabet. AC-3.4 and T-7 then follow it
  without either re-stating the names. I re-derived all five rendered names from
  `pr-tests.yml` independently; they match.
- O-8's relabelling is not a softening. "npm would publish it happily under the wrong name, so
  nothing catches this but the operator" is the accurate and more alarming statement, and the
  explicit "An operator planning the first publish must not expect npm to catch (2) or (3)"
  turns a taxonomy into an instruction. Dropping the unmeasured failure ordering rather than
  measuring it was the right trade for a REQ.
- AC-4.5's rewrite converts a judgement call into a set operation: the exception is whatever
  the run's own report enumerates, and if the report does not enumerate today, that is named as
  new work owned at O-9 rather than assumed away. The added "files belonging to any other
  feature hash identically with no exception at all" closes the leak the old wording left open.
- AC-1.1's `pdlc doctor` exemption is grounded in what the CLI actually does, not in what
  would be convenient — the diagnostic that explains a refusal survives the refusal. That
  closes the test engineer's Q-01 with a behaviour, not a promise.
- The v0.8 compression is real editing, not truncation: the changelog collapsed four entries
  into one line each while the deleted NG-1 paragraph's *conclusion* survived. The document is
  584 lines, inside the 700-line REQ budget, and denser than v0.7 rather than shorter than it.

## Recommendation

**Needs revision**

One High, and it is narrow: AC-6.2's conjunct (3) describes a write that no run performs, so
the bundle-channel oracle has not actually left the absence-only shape that round 2 flagged.
The fix is a repoint from *write* root to *load* root, plus one honest sentence about whether a
run-bound observation of the load root exists at all on a channel C-4 forbids teaching to speak
— and if it does not, routing that residue to O-9 alongside AC-4.2 rather than leaving an AC
that reads solved. No other section is affected.

Two Mediums are worth the same pass: O-5's citation is off by one and excludes the string it
cites, where v0.7's citation was correct (F-22 — prefer a symbol reference or an `M-ENG-*` row,
since this is the one code-level fact that crept back into the REQ after round 1 evicted them
all); and AC-3.4 should say whether rendered-name equality must be decidable offline, the way
AC-1.3 already does (F-23). The Low is M-ENG-10's measurement/gate role conflict.

Everything round 2 blocked on is closed, and closed at the source rather than in the changelog
— I re-derived the check names, the matrix, the absent `files` field and the dispatch-free
`doctor` from the repo. The document is close.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 2, "low": 1}

