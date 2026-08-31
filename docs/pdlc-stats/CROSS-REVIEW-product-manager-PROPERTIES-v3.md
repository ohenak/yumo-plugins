# Cross-Review: product-manager — PROPERTIES

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-stats/PROPERTIES-pdlc-stats.md`
**Date:** 2026-08-31
**Iteration:** 3

## Delta scope

**The document did not change this round.** `git log aa7e066..HEAD -- docs/pdlc-stats/PROPERTIES-pdlc-stats.md` is empty and `git diff --stat` over the same range is empty; the last commit touching the file is still `aa7e06626` ("PROPERTIES v1.1 — G-4 narrowed, revision history"), the exact commit `CROSS-REVIEW-product-manager-PROPERTIES-v2.md` recorded as `REVIEWED-COMMIT:`. This is therefore a **cascade re-confirmation**, not a re-review of a revision: the round exists because upstream pins moved, not because the author edited bytes.

Which pins moved, measured at HEAD (`fd0debb2a`) against the `UPSTREAM-STATE` anchors v2 recorded:

| Upstream | Pinned in v2 | At HEAD | Moved? |
|---|---|---|---|
| REQ | `5f3e8051…` | `5f3e8051…` | no |
| FSPEC | `c7d2c832…` | `c7d2c832…` | no |
| DECISIONS | `48522bf9…` | `48522bf9…` | no |
| TSPEC | `f2261510…` | `a06a6032…` | **yes** |
| PLAN | `7c2a888d…` | `87b439ea…` | **yes** |

So the review question this round is narrow and answerable: **does PROPERTIES still hold against the moved TSPEC and PLAN?** I read the PLAN v1.2 delta (te F-01…F-05) and the TSPEC erratum-round commits, then checked every PROPERTIES claim they could touch. Sections untouched by that upstream movement, and approved in v1/v2, were not re-read.

Because the document is byte-identical, **all three findings from v2 remain open by construction** — they were not addressed, and could not have been. They are carried below so they are not lost, but they are not new evidence and none of them gates.

One further piece of ground truth changed the character of this round: **implementation of PLAN T-09 and T-10 has already landed on this branch** (`2fc6d9b57` "T-09 — CLI process-level reds", `df1441b76` "T-10 — CLI structure reds"). `pdlc/engine/__tests__/stats-cli.test.js` (357 lines) and `pdlc/engine/__tests__/stats-cli-structure.test.js` (521 lines) are tracked at HEAD. That let me check two of PROPERTIES' trace claims against shipped test code rather than against documents alone, which is where both of this round's findings come from.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | **EC-19's shipped-seam evidence is required by PLAN at HEAD and traced by no property.** PLAN v1.2 answered te F-01 by adding to T-09 "**a symbolic-link leg on that same production path** … asserting the reported byte total counts the *link's own* size (EC-19)", and states in terms why: "This is the only **behavioural** evidence that the **shipped** seam counts the link and not its target: T-18's leg runs over T-02's `realStatsIo()` (a helper this PLAN also asks the implementer to write), and T-10's conjunct is source-level" (`PLAN-pdlc-stats.md:101`). PROPERTIES has not moved with it. Its §PLAN tasks row for T-09 (`PROPERTIES-pdlc-stats.md:492`) lists `PROP-CLI-02, -03, -04, -06, -08; PROP-JSON-01, -02; PROP-NEG-08` — no `PROP-RATIO-*` member — and its §FSPEC EC table maps `EC-19` to `PROP-RATIO-04, PROP-RATIO-05` only (`:464`), i.e. to the helper-level leg (`:169`, `integration-fs`, PLAN T-18) and the source-level one (`:170`, `process`, PLAN T-10) — precisely the two PLAN now says are *not* behavioural evidence on the shipped seam. The gap is visible in code, not only across documents: the landed T-09 test carries no symlink leg at all (`grep -n 'symlink\|symbolic\|EC-19\|lstat' pdlc/engine/__tests__/stats-cli.test.js` returns nothing across its 357 lines). The claim is not unproven — PROP-RATIO-05's equivalence conjunct is real and shipped (`stats-cli-structure.test.js:516`, "statsIo() and realStatsIo() must make the identical node:fs call set"), so helper-behaviour plus call-set equivalence does chain to the shipped seam — but that is a weaker chain than the direct one PLAN now asks for, and PROPERTIES does not record that PLAN made the judgement. **Fix:** give T-09's row a `PROP-RATIO-*` member (a new property, or PROP-RATIO-04 re-levelled with a `process` conjunct) whose falsifier is PLAN's own — "a `statSync` implementation of `statsIo().fileSize` reds here" — and add it to the `EC-19` row. | FSPEC EC-19, AT-15; REQ-STATS-06; PLAN T-09 |
| F-02 | Low | Local | **PROP-RATIO-05 keeps the "stats seam" qualifier PLAN T-10 explicitly dropped.** The property reads "`bin/cli.mjs`'s `stats` seam must contain no `statSync` call" (`:170`). PLAN v1.2, answering te F-02, now specifies the opposite scoping in normative terms: "`bin/cli.mjs`'s **whole source** matches the boundary-anchored `/(?<![A-Za-z])statSync\s*\(/` **zero** times … The assertion is whole-file and carries no 'in the `stats` seam' qualifier, because HEAD's `bin/cli.mjs` contains neither `statSync` nor `lstatSync` anywhere" (`PLAN-pdlc-stats.md:102`). I verified PLAN's premise at HEAD: the only `fs` predicate in the file is `fs.existsSync` (`pdlc/engine/bin/cli.mjs:262`), and no `statSync`/`lstatSync` occurs. Substance is safe — the landed test asserts over the **whole** masked source and extracts call *names* with `\b([A-Za-z_$][A-Za-z0-9_$]*Sync)\s*\(` (`stats-cli-structure.test.js:227-233`, asserted `:493-498`), so `lstatSync` yields `"lstatSync"` and the oracle really can red. Only the wording lags, in the property *and* in the shipped test's title/message, which inherited it. Not gating, but PROPERTIES is where the qualifier originates. **Fix:** restate as "`bin/cli.mjs`'s whole source contains no `statSync` call", matching PLAN. | FSPEC EC-19; TSPEC §2.4, §3.1; PLAN T-10 |
| F-03 | Medium | Local | **Carried open from v2, unaddressed (document unchanged).** PROP-ERR-10's set-equality warranty claims a fourth `error.reason` released without an FSPEC edit would red, but the superset direction only sees reasons reachable from FSPEC §5's own scenario set. Fix as filed in v2: restate the falsifier honestly, or add a conjunct sweeping the `fakeStatsIo` `throwOn` seams PROP-ERR-09 already drives. | REQ R-5; FSPEC BR-30 |
| F-04 | Low | Local | **Carried open from v2, unaddressed.** PROP-DISC-10's Traces column reads `PLAN T-05/T-06/T-07` while §PLAN tasks lists it under T-05 and T-07 only; T-06's render row does not name it. Reconcile the two tables. | FSPEC EC-20, AT-18; PLAN T-05/T-06/T-07 |
| F-05 | Low | Local | **Carried open from v2, unaddressed.** PROP-DISC-10's `F-EXCLUDED-ONLY` sits under §Fixtures' "Constructed fixtures (over `fakeStatsIo`)" yet the property asks the fixture to hold eight names "as a real directory"; "real" is the document's own word for the real-path level. Say "as a directory entry (`isDirectory` true), not a file". | FSPEC EC-20, AT-18 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | PLAN T-09's symlink leg and PROP-RATIO-04's T-18 leg now assert the same product claim (a link contributes its own size) at two levels, over two different IO bundles. Once F-01 lands, is T-18's leg still worth its cost, or does the pair "shipped-seam behavioural leg + call-set equivalence conjunct" already carry EC-19 on its own? I have no view on which way to cut; I would only like the answer written down once rather than re-derived at implementation time. |
| Q-02 | Both v2 questions stay open and unanswered, since the document did not change: whether `F-EXCLUDED-ONLY`'s eight-name list should be stated as "the eight names PROP-DISC-05 pins" to keep one transcription of BR-25's set, and whether PROP-CLI-03's two differently-lived halves should name the flag half in its failure message. Neither needs an answer this round. |

## Positive Observations

- **The document survived an upstream move that was aimed straight at it.** PLAN v1.2 changed five things, two of which (te F-01 on EC-19's production path, te F-02 on the `statSync` matcher) land directly on properties PROPERTIES owns. I checked every one against the file and found exactly two lagging traces, both narrow, neither wrong about the world. A properties document that stays 98 % true through a round of upstream corrections it did not participate in is a well-anchored document.
- **The equivalence conjunct paid off exactly as designed, and I can now see it in code.** §Fixtures argued at `:317` that `realStatsIo()` is "not a second implementation" and that PROP-RATIO-05 pins the construction-site call set "so helper and shipped seam cannot diverge". That argument is no longer a promise: `stats-cli-structure.test.js:516` asserts the two call sets identical, with the message the document predicted. This is the mechanism that keeps F-01 at Medium rather than High — the shipped seam is not unproven, it is proven one hop away.
- **PLAN's premise for dropping the seam qualifier checks out, and PROPERTIES is why it could be dropped.** PLAN reasons that no boundary needs delimiting because `bin/cli.mjs` carries no `statSync`/`lstatSync` at all; I re-measured at HEAD and its only `fs` predicate is `fs.existsSync` (`pdlc/engine/bin/cli.mjs:262`). PROPERTIES' insistence (`:277`) that `lstat`-vs-`stat` is "structurally invisible below the real filesystem" is what forced the conjunct to `process` level in the first place, which is what made the whole-file matcher available.
- **PROP-RO-03 anticipated this checkout's actual state.** It requires snapshot-vs-snapshot comparison rather than a fixed literal, naming untracked developer files as the failure mode `coveredViolations` produces (`:224`). This working tree currently holds untracked `pdlc/workflows/lib/stats.mjs` — the precise situation the property was written against. Writing a property because a failure mode is *foreseeable* and then having it show up is the good version of this pipeline working.
- **No absence-only oracles in anything this round touched.** PROP-RATIO-05's structural absence claim is explicitly paired with PROP-RATIO-04's behavioural one, in the property text itself; the §Oracles table (`:272`) states the pairing rule generally and names the properties that follow it. Both of this round's findings are about *scope of a claim*, not about a claim resting on a negative alone.

## Recommendation

**Approved with minor changes**

No High finding is open anywhere in the document — none inherited from v1 or v2, and none introduced this round, since this round introduced no bytes. The two upstream pins that moved (TSPEC, PLAN) do not falsify any load-bearing claim PROPERTIES makes: I checked each PLAN v1.2 change against the properties it could touch, and re-measured PLAN's own repository premise at HEAD rather than taking it on trust.

This is a frozen round, so I want to be explicit about what I am *not* doing with the two new findings. Neither qualifies as a blocking cause: F-01 and F-02 are trace and wording lags behind an upstream that moved *after* this document was last written, not defects a revision introduced, and neither states something false about the repository. F-01 is the one worth doing promptly — not because coverage is missing today, but because PLAN has now made an explicit judgement about where EC-19's shipped-seam evidence lives, and a properties document that does not reflect that judgement will let the T-09 symlink leg be dropped at implementation time with no property going red. It is already absent from the landed T-09 test.

For the next ordinary round, in priority order:

1. **F-01 (Medium)** — trace EC-19's shipped-seam behavioural leg from a `PROP-RATIO-*` property and add it to §PLAN tasks' T-09 row.
2. **F-03 (Medium, carried from v2)** — restate PROP-ERR-10's superset warranty to match the direction its oracle actually closes.
3. **F-02, F-04, F-05 (Low)** — the `stats` seam qualifier, PROP-DISC-10's T-06 trace, and `F-EXCLUDED-ONLY`'s "real directory" wording. Three one-line edits.

DEFERRED: decide whether §PLAN tasks' "(new)" annotations should be re-stated as "created by this feature" now that T-09's and T-10's test files are tracked at HEAD and the annotation reads as false to a literal reader.
DEFERRED: untracked `pdlc/workflows/lib/stats.mjs` sits in this working tree; confirm it is intended in-flight T-12 work before it reaches a document oracle that walks the whole tree.

## Delta-Confirmation Findings

Not applicable. This is an ordinary iteration-3 cascade re-confirmation of an unrevised document, not an erratum delta confirmation, so findings carry the ordinary-round `Scope` legend (`Local` / `Cross-Feature` / `Process`). The `FINDING:` lines emitted to the orchestrator carry provenance and locality tags as the gate requires: both are `inherited` (the document's bytes did not change this round — the divergence opened underneath it when PLAN moved) and `nonlocal` (there is no edited section for anything to sit inside).

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 3}

APPROVAL-HASH: sha256:7baf9b336f04c0e1848ff370878646f7c08f0ccccabf13eb8aaba312bbbecab6
APPROVAL-HASH-NORMALIZED: sha256:d90ae161c3bb302cc2f972362066d267fe92031d897504e59daa1b955b4edd72
REVIEWED-COMMIT: fd0debb2a675a71959bfee7bc209fa6fb799ad2d
UPSTREAM-STATE: REQ sha256:5f3e80519b982f29ab0b6dad30fa776b4be4b2d34085b235ad755890064ed9f8
UPSTREAM-STATE: FSPEC sha256:c7d2c832dee586c8e371ec843c0809b167b65dbbeced4dd140934fe68d0ec63d
UPSTREAM-STATE: TSPEC sha256:f2261510e5b63be00a859776877eb3513e453da0728c10eaecca8b5bb04d244f
UPSTREAM-STATE: DECISIONS sha256:48522bf9e03f6a459ce4c38eb0aa4b8fcb00d6c2d3693c749167af7bc2a4c88e
UPSTREAM-STATE: PLAN sha256:87b439eafbb04c37b9f4419fec1d8bc3f9166e51ec91bcd6e70384ac1c3d0baf
