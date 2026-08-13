# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-engine-distribution/TSPEC-pdlc-engine-distribution.md` (v0.4)
**Upstream read:** `REQ-pdlc-engine-distribution.md` (AC-1.3, AC-4.5, AC-5.3), `FSPEC-pdlc-engine-distribution.md` (§5.2 `:472`, AT-3.8b `:685`, BR-9.1…BR-9.3)
**Prior review:** `CROSS-REVIEW-product-manager-TSPEC-v3.md` (Needs revision — 2 High, 1 Medium, 1 Low)
**Diff reviewed:** `1c2dd64b..HEAD` on the TSPEC (6 commits, +212/−74)
**Date:** 2026-08-13
**Iteration:** 4
**Scope:** Delta re-review, product lens only — whether v3's blocking findings are resolved and whether the revision broke anything. Unchanged sections already approved are not re-litigated.

## 1. Prior findings disposition

| v3 ID | Severity | Status | Evidence in v0.4 |
|---|---|---|---|
| F-01 | High | **Resolved** | Kind 3's mark moved **inside `rewriteStatus`** (§7.2, the R-1…R-5 table and steps 1–4), which is the fix asked for: one writer, five inheriting routes. Re-verified at HEAD — `rewriteStatus` is `export async function` at `orchestrate-queue.js:1522` and genuinely takes **seven** parameters (`:1522-1530`: `queuePath, feature, status, readFileFn, writeFileFn, gitFn, evidence`), so `provenance` is genuinely 8th; all five routes exist as cited (`build-runtime.mjs:274`, `:307`; `orchestrate-queue.js:1426`, `:1439`, `:1464`); the row write is at `:1571` and `commitQueueRow` at `:1598`. The `updateQueueStatus` two-path gap I flagged in the same finding is closed explicitly — both the `evidence == null` quick path (`:443-450`, comment verbatim as quoted) and `writeEvidenceCarryingRow` (`:462`, defined `:491`) write the cell |
| F-02 | High | **Resolved, and better than asked** | The commit-site set is closed at **five**. I re-ran the measurement: grepping `git commit` invocations across both modules returns exactly `orchestrate-dev.js:2839`, `:6736`, `:10429` and `orchestrate-queue.js:1603`, `:1645` — five, matching C-a…C-e member for member. C-e is marked **in place** rather than deferred to a routing task, so the expected set is unconditional, which is what made the earlier version's oracle depend on merge order. The "enclosing *named* function" reading is stated precisely and is correct against the code: the commit at `:2839` sits in an anonymous `apply` arrow inside the exported `buildA5SeamOps` (`:2743`), called once at `:11718`. The added per-helper routing table goes beyond the finding and closes a gap I had not named — C-b's two call sites (`:6516`, `:11336`) and C-d's scope (`commitAdvisoryRecord(recordPath, feature, gitFn, emit)` at `:1637`, reached from `:1300`, in a module with **no** `_provenance` seam — grepped, 0 matches) |
| F-03 | Medium | **Resolved** | §7.4's "It does" is gone; the class-11 row and the prose now agree that this is work the feature builds. Re-verified: the only `artifactPaths.push` in the file is `:11507`, conditional on `pushArtifact` (`:11498`), inside `main()`'s `runPhase`; `artifactPaths` is `main()`-local at `:11659`. The named route checks out — `reviewLoop` is module-scope at `:6183` with callers at `:11532` and `:12532` inside `main()`; `erratumRound` is at `:11123`, nested in `main()`, calling `appendApprovalAnchors` at `:11336` |
| F-04 | Low | **Resolved** | §7.2 now states the shipped rule — lowercased substring containment, first match wins (`colIndex`, `orchestrate-queue.js:154-160`), re-implemented at `:427-433` — and adds the fixed-position fallback at `:169` that I had not caught. Pairing it with "the round-trip test asserts the header literal" turns the weaker guarantee into something a future rename trips over |

Both blocking findings are closed on their own terms, and neither closure
weakened a claim to get there. One defect the revision **introduced** is
below (F-01), plus two smaller consequences of the same renumbering.

## 2. Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Local | **§5.4's closing note still points AT-3.8b at E-17…E-19, but this round's renumbering moved the workflow members to E-20…E-22 — so the one sentence that unblocks FSPEC's blocked row now names the three new `lib/` modules instead of the vendored workflow files.** Line 357-359 reads: *"Note for the FSPEC's §5.2 workflow-module row. That row is marked '[blocked on O-10], not enumerable yet'. This section unblocks it: the members are exactly E-17, E-18 and E-19."* In v0.3 that was true. In v0.4 the table at `:300-305` assigns E-17 = `lib/resolve-version.mjs`, E-18 = `lib/store.mjs`, E-19 = `lib/provenance.mjs`, and the vendored workflow members are **E-20** (`vendor/workflows/orchestrate-dev.js`), **E-21** (`orchestrate-queue.js`), **E-22** (`VENDOR-MANIFEST.json`). The document's own §14 changelog records the move ("vendor rows renumbered E-20…E-22") and §5.4's own summary sentence at `:332-333` gets it right ("three vendored workflow members (E-20…E-22)"), so this is a stale line, not a disagreement about design. The cost is not cosmetic: AT-3.8b is a **shipped acceptance test whose expected member set this sentence defines** (FSPEC `:685`, `:472` — the row is blocked precisely *because* its member list was not enumerable). Transcribed literally, AT-3.8b asserts that the packed workflow-module class equals `{resolve-version.mjs, store.mjs, provenance.mjs}` — red against a correct implementation — and, worse, leaves the vendored members unasserted, which is the class BR-8.2 and AC-1.3 actually hinge on. This is the same defect kind the last three rounds closed one level up: an expected set that names the wrong members. Fix is one line — E-20, E-21, E-22 | AC-1.3, FSPEC BR-8.2, AT-3.8b |
| F-02 | Medium | Local | **The `E-nn` identifier namespace now collides with the FSPEC's error catalogue in the exact range this round added, and the collision is a plausible cause of F-01.** §5.4's packed-set members run E-1…E-23. §11's error table cites FSPEC error IDs in the *same* rendered form: `E-22 runtime analogue` (`:1309`), `E-17` for re-publish collision (`:1315`), `E-18` for a missing publish credential (`:1314`), and §8.5 cites `E-19` twice (`:1025-1026`). Below E-17 the zero-padding distinguishes them (`E-01` vs `E-1`); from E-17 up both series render as two unpadded digits, so the literal string `E-17` denotes `lib/resolve-version.mjs` in §5.4 and a publish-collision error in §11, with nothing in the text marking the switch. A PLAN or PROPERTIES author transcribing "E-18" out of this document cannot tell which is meant without reading both tables. This was latent at E-16 and became live at E-17 this round. Fix: give the packed-set members their own prefix (`P-1…P-23`, or `PK-`), or pad them to `E-01`-style and accept that the two catalogues then fully overlap — the first is cheaper and mechanical | AC-1.3 |
| F-03 | Low | Local | **§12.1's module-side row assigns kind 4 to `orchestrate-dev.js` while two of kind 4's five helpers live in `orchestrate-queue.js`.** The row reads "kinds 1, 2 and 4 against `orchestrate-dev.js`, kind 3 against `orchestrate-queue.js`", but C-c (`commitQueueRow`, `orchestrate-queue.js:1598`) and C-d (`commitAdvisoryRecord`, `:1637`) are queue-module members of the kind-4 set §7.2 just closed. The row's later sentence — "Kind 4 asserts each of the five helpers composes `line`" — is right and rescues the coverage, so nothing is actually untested; but the per-module split as stated would let a task author put kind-4 coverage in one target and quietly skip C-d, whose route (a new queue-module `_provenance` seam) is the newest and least-exercised of the five. Fix: state the split as "kinds 1 and 2 against `orchestrate-dev.js`; kinds 3 and 4 across both modules" | AC-5.3 |

## 3. Questions

| ID | Question |
|----|---------|
| Q-01 | §5.4 says new `lib/` modules join the expected set "by hand, as a visible edit, or PF-4 is not an expectation" — agreed, and the anti-globbing argument is right. But nothing in the document makes the *omission* of that hand edit loud: a future feature adding `lib/foo.mjs` gets a red PF-4 with a message about set inequality, which reads as "the package is wrong" rather than "the table is stale". Is a one-line pointer in the failure message (or a comment on the expected-set literal naming §5.4 as its source) worth scheduling in the PLAN, so the next author is told where to edit? |
| Q-02 | §12.3's oracle 2 now asserts the green **queue-driven** run's two rows (R-3 `in-progress`, R-5 `awaiting-merge`) carry the mark — this closes v3's Q-01 exactly. The green **direct** run is described as having "only Phase MERGE's" rewrite, taking the evidence-carrying path. Since `mergeMode` ships `off` and the phase resolves `skipped` until an operator opts in, does a green direct run in the default configuration produce a kind-3 artifact at all? If it does not, BR-9.2's "the kinds it actually produced" makes that fixture's kind-3 expectation empty, and it would be worth saying so — an empty expectation that looks like coverage is the one shape §12.3 exists to prevent. |

## 4. Positive Observations

- **F-01's fix chose the structurally right place, not the locally cheap one.** The finding said "mark inside `rewriteStatus`, or name all five and say what each carries". The revision took the first option and then justified it with the measurement that makes it necessary — the two rows a *green* queue-driven run produces (R-3, R-5) are among the four the call-site approach would have missed. That is the sentence that converts a design preference into a requirement, and §12.3's new green-path assertion pins it so the reasoning cannot decay into a comment.

- **C-e was marked in place rather than deferred, and the deferral was diagnosed, not just dropped.** The v3 finding allowed either fix. The revision took the harder-to-argue one and explained why re-routing through `commitPaths` is not the free move the earlier framing implied — C-e commits *whatever is staged* with a message an advisory assertion may pin, so routing would change both committed content and message text. Naming that cost is what makes "marked in place" a decision instead of a shortcut, and the expected set is now unconditional, which was the actual product property at stake.

- **The per-helper routing table answers a question I had not asked.** F-02 asked for a closed set. The revision closed it and then noticed that a closed set says nothing about how `provenance` *arrives* — three of the five sit in scopes kind 3's route never reaches. C-d's row is the sharpest: it establishes that `orchestrate-queue.js` has no `_provenance` seam at all today (I re-grepped: zero matches in either module), so the queue module's `main()` needs the same parameter. Without that row, AT-5.3 would have been unimplementable for three of five members while every stated oracle looked green. Finding the second-order gap in one's own fix is the behaviour that ends review loops.

- **§9.3's top-level-`await` correction is the document catching itself in its own subject matter.** A guard whose entire purpose is to refuse below Node 14 was specified using a Node 14.8+ parse-level feature — it would have `SyntaxError`d before its first statement on exactly the runtime it promises to name. The fix is not just the promise chain: clause 3 of the structural oracle makes the syntax-level claim falsifiable in the unit suite, and the document states plainly that `node:18-alpine` is structurally blind to it. Stating the honest floor (12.17, where dynamic `import()` first parses) rather than a rounder number is the same discipline.

- **The K-3 reprice is now three rounds of getting *more* expensive, in public.** Two modules, five helpers, an 8th parameter, two generated closures, a return-shape change threaded through three call sites, a new `QUEUE.md` column on two write paths. Every one of those arrived from a finding, and none was absorbed silently into "bounded". A cost row that grows visibly as the design is measured is worth more to the operator deciding whether to build this than one that stayed small.

## 5. Recommendation

**Needs revision** — one High, and it is a one-line edit.

Both of v3's blocking findings are closed, and closed better than they were
asked to be: kind 3's mark moved into the single writer with all five routes
enumerated and verified at HEAD, and the commit-helper set is now five members,
unconditional, with a per-helper routing table that closes a gap the finding did
not reach. F-03 and F-04 are closed too. Nothing settled in earlier rounds was
re-opened, and §9.3's self-caught `SyntaxError` defect was found by the author,
not by a reviewer.

The blocker is collateral from this round's own renumbering: §5.4's closing note
still says the FSPEC's blocked workflow-module row is unblocked by "E-17, E-18
and E-19", which after the renumber are the three new `lib/` modules. The
vendored workflow members are E-20…E-22 — as the changelog and §5.4's own
summary sentence both say correctly. AT-3.8b's expected set is defined by that
one sentence, so it must name the right three.

To approve:

1. **F-01** — change `:358` to read E-20, E-21 and E-22. Nothing else in the
   design moves.

F-02 (the `E-nn` namespace collision with §11's FSPEC error IDs, which is the
likeliest cause of F-01) and F-03 (§12.1's per-module split for kind 4) are
worth the same revision but do not gate on their own.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 1, "low": 1}
