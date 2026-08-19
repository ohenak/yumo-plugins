# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/REQ-pdlc-learnings-injection.md`
**Date:** 2026-08-18
**Iteration:** 2

**Delta scope.** Reviewed `git diff 36f82b3e..29fe79a4` on the REQ (the only revision commit since
v1). Prior findings F-01…F-10 checked for resolution; unchanged sections not re-litigated.

## Prior-round disposition

| v1 finding | Severity | Status |
|---|---|---|
| F-01 — "exactly six dispatches" not the HEAD dispatch model | High | **Resolved.** C-1 is now a rule over creator / optimizer / erratum dispatches, AC-1.1 drops the fixed count as an oracle, AC-1.2 is set equality over the pipeline's own classification, §4.1 and O-1 state per-round rather than per-phase cost. One residual naming issue, F-02 below. |
| F-02 — corpus enumeration reinvented shipped mechanism | High | **Addressed in direction, defective in execution.** §1.2 claim 2, C-3 and O-7 now bind to the shipped enumeration — but they bind to it as *one shared definition*, which is what the cited decision rejects. See F-01 below. |
| F-03 — C-5's "no model call" false on the runtime-adapter channel | High | **Resolved.** C-5 now concedes model-mediated listing/read seams, scopes AC-2.5's byte-identity to a deterministic transport, and routes a failing listing to C-7 rather than to an empty corpus. |
| F-04 — malformed config silently identical to deliberate disable | High | **Resolved.** AC-5.1 is split into AC-5.1a (disabled/absent) and AC-5.1b (malformed ⇒ catalogued notice), C-9 names the notice, AC-6.2 asserts it fires. |
| F-05 — corpus includes untracked, excludes ignored | Medium | Resolved (C-3 states tracked-or-untracked, ignored excluded). |
| F-06 — §1.2 claim 1 overstated today's readership | Medium | Resolved (claim narrowed to "no *different* feature's LEARNINGS"; Tier-2 reader named). |
| F-07 — AC-5.1's unmeasurable "pre-feature baseline" | Medium | Partly resolved; the replacement is self-comparing on one branch — F-03 below. |
| F-08 — AC-2.2 ordering key unparseable at HEAD, no tiebreak | Medium | Resolved (total tiebreak = byte order over path; verified against the shipped enumeration, see Positive Observations). |
| F-09 — AC-5.2 absence-only | Medium | Resolved (positive membership claim added). |
| F-10 — AC-3.2 reasons as prose, not ids | Medium | Resolved as ids; one domain-mixing defect introduced — F-05 below. |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Cross-Feature | **`delta` `local` — DEC-CONS-05 is cited as authority for the thing it rejects.** §1.2 claim 2, C-3 and O-7 now rest on "one corpus definition, shared with consolidation", with C-3 adding "two consumers of one corpus must not drift apart" and O-7 asking to bind them "as a single shared definition rather than a second implementation … including whether a shared test asserts the two agree". The cited entry decides the opposite on all three points: its title is "Two enumerations, held by literal pins; one predicate, held by a differential" (`docs/completed/pdlc-consolidation-agent/DECISIONS-pdlc-consolidation-agent.md:422`); **one shared implementation is listed and rejected** by name on measured cost (`:462-469`); enumeration **set-equality is rejected as "red on correct code"** because the divergence is measured, not hypothesised — a `.gitignore`d LEARNINGS file is in the hook's set and not the pass's, a staged-but-deleted file is in the pass's and not the hook's (`:470-476`). HEAD bears this out: the pass enumerates with `git ls-files --cached --others --exclude-standard` over two `:(glob)` pathspecs (`pdlc/workflows/consolidate-learnings.js:1337-1345`), while the shipped hook enumerates the same two patterns with `glob.glob`, which sees ignored files (`pdlc/hooks/scripts/nudge-consolidation.sh:60-61`). So there are already two consumers that deliberately *do* differ, and "must not drift apart" is a project-wide invariant HEAD does not hold. As written this either misstates HEAD or silently overturns a shipped decision, and TSPEC would inherit an agreement test that is red on correct code. Fix without changing the intent: scope C-3 and §1.2 claim 2 to **the pass-side definition** (`LS_FILES_ARGV`, `consolidate-learnings.js:1337-1345`), note that the hook's enumeration deliberately diverges per DEC-CONS-05, and restate O-7 as reuse of the shipped `enumerateCorpus` seam *within the same JS bundle* — where DEC-CONS-05's cost argument (a third artifact plus a Python/bash language boundary) does not apply — rather than as a new "single shared definition" spanning all three readers. | §1.2 claim 2, C-3, O-7 |
| F-02 | Medium | Local | **`delta` `local` — "the pipeline tags as an authoring dispatch" names a tag that does not exist at HEAD.** C-1 and AC-1.2 make the oracle "the pipeline's own dispatch classification". `PHASE_DISPATCH` carries `creator`, `creatorInputs`, `reviewers`, `optimizer` per phase (`pdlc/workflows/orchestrate-dev.js:3625-3735`) and the erratum path composes an author through `erratumAuthorPrompt` (`:9438`, dispatched `:12810`) — a classification is *derivable* from those slots, but no field says `authoring`, so "already classifies"/"already tags" is a claim about HEAD that no reader can check. Restate as "the creator and optimizer slots of `PHASE_DISPATCH`, plus the erratum author dispatch", which is true at HEAD and gives the test engineer the same set without inventing a tag. | C-1, AC-1.2 |
| F-03 | Medium | Local | **`delta` `local` — AC-5.1a's byte-identity oracle self-compares on one of its two branches.** The *given* is "`enabled` set to `false`, **or** the configuration section absent"; the *then* is "every composed dispatch is byte-identical to the same run with the section absent". For the section-absent branch that compares a run to itself and passes vacuously. AC-6.2 supplies the real oracle ("against a recorded baseline"), so the fix is small: make AC-5.1a's comparand the recorded baseline AC-6.2 names, once, for both branches. | AC-5.1a, AC-6.2 |
| F-04 | Medium | Local | **`delta` `local` — "records that it did" contradicts "no injection summary at all".** AC-5.1a requires "the run's recorded count of corpus reads is zero" *and* "the run report carries no injection summary at all — the key is absent, not present-and-empty"; AC-4.4 (zero-valued thresholds) requires behaviour "exactly as the disabled case" *and* "records that it did". A count and a record need a field; the disabled case forbids the field. Name the one place each record lives, or state that zero-valued thresholds are the *enabled-with-empty-selection* case (report present, empty rows per AC-3.1) rather than the disabled case. | AC-5.1a, AC-4.4, AC-3.1 |
| F-05 | Medium | Local | **`delta` `local` — `RSN-UNLISTABLE` is a corpus-level state inside a per-document enumeration.** AC-3.2 requires the report to name "corpus documents available but **not** selected, each with a reason drawn from a closed set of catalogued ids", and includes `RSN-UNLISTABLE` in that set. When the listing itself fails no document is known, so there is no row to carry the id, and the set-equality check AC-3.1/AC-3.2 ask for cannot be written over one domain. Split the catalogue: per-document reasons (`RSN-COUNT`, `RSN-BYTES`, `RSN-SELF`, `RSN-UNREADABLE`, `RSN-UNPARSEABLE`, `RSN-TRUNCATED`) versus corpus-level outcomes (`RSN-UNLISTABLE`, empty corpus), each with its own closed enumeration. The shipped seam already returns the corpus-level shape as a distinct union member — `{unlistable: true, detail}` (`consolidate-learnings.js:1348-1354`) — so the split matches the code this feature reuses. | AC-3.2, AC-3.1, C-9 |
| F-06 | Low | Local | **`delta` `local` — BL-01 and AC-1.1 disagree on the corpus floor.** AC-1.1 was relaxed this round to "at least one prior feature `{p}`"; BL-01 still reads "at least two features in the consumer repository". Make BL-01 one. | BL-01, AC-1.1 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Does this feature intend to *call* `enumerateCorpus` (`consolidate-learnings.js:1348`) from the orchestrator, or to re-declare the same argv in `orchestrate-dev.js`? Both are defensible inside one bundle; F-01's fix reads differently depending on which, and O-7 is the place to say. |
| Q-02 | AC-4.2 routes a failed listing to "nothing is injected". Is that per-dispatch (each dispatch re-lists, so a transient failure degrades one dispatch) or per-run (list once, cache for the run)? NG-4 forbids a state file but not an in-process value, and the answer changes what R-1's per-run cost measurement in O-1 is measuring. |

## Positive Observations

- The three factual repairs this round all check out against HEAD rather than against intent: the pass's enumeration is exactly the two `:(glob)` pathspecs with `--cached --others --exclude-standard` (`consolidate-learnings.js:1337-1345`), the fail-open listing outcome is a real union member and not an aspiration (`:1348-1354`), and the erratum author dispatch C-1 now includes genuinely exists (`orchestrate-dev.js:9438`, `:12810`).
- AC-2.2's tiebreak was checked empirically, not assumed: `git ls-files --cached --others --exclude-standard` over the two pathspecs emits a **single byte-ordered stream across tracked and untracked entries** (verified in a scratch repository where an untracked `docs/aaa/…` sorts ahead of a tracked `docs/bbb/…`). The stated fallback is therefore free — it is what the shipped enumeration already yields — and the two negative properties AC-2.2 adds (permuted mtimes, renamed containing directory) are testable before O-2 lands.
- AC-4.3 is much stronger than its v1 form. Replacing "same verdicts and round counts across runs" with "no injection-derived value reaches any gate input", and saying in the criterion itself why the cross-run comparison would have measured model nondeterminism, is the rare case of a REQ recording *why* the weaker oracle was rejected.
- C-5's rewrite is honest in a way that costs it something: conceding that the runtime-adapter channel makes listing and reading model-mediated, and then scoping the determinism claim to model *judgement* plus a deterministic transport, is harder to write than the original absolute and is the version an implementer can satisfy.
- §7.1's pasted stopping rule is well-placed. This round closed four Highs and opened one; that is the churn exception it names, and the one open blocker is a citation scope error, not a contested requirement.

## Recommendation

**Needs revision**

One High. F-01 is a bounded edit in three places — §1.2 claim 2, C-3, O-7 — that keeps the reuse
intent while telling the truth about DEC-CONS-05: reuse the **pass-side** enumeration seam inside the
same JS bundle, and drop the "one shared definition across all readers" framing plus the shared
agreement test, both of which the cited decision rejected on measured evidence. Nothing else in this
round blocks. F-03, F-04 and F-05 are worth taking in the same pass because each is a defect a test
engineer would otherwise have to resolve by guessing, and F-05 in particular decides the shape of the
set-equality assertion AC-3.1 and AC-3.2 both ask for.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 4, "low": 1}
