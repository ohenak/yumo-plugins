# Cross-Review: product-manager — DECISIONS

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-engine-distribution/DECISIONS-pdlc-engine-distribution.md` (v0.3, Phase D)
**Date:** 2026-08-13
**Iteration:** 3
**Scope:** Delta re-review. Product lens only. Diffed
`8f3d6a1e..HEAD` — one commit touches this document (`8ab3b795`), one hunk pair in §7.
Only the changed passage was scanned for new issues; every claim it makes was
re-verified against HEAD code, not against the document it cites.

## Prior findings disposition

| v2 ID | Sev | Disposition | Evidence checked at HEAD |
|---|---|---|---|
| F-01 | Medium | **Open, unchanged** | §13's DEC-EDIST-05 row (`DECISIONS:816`) still reads "An explicit `files` allow-list … | An `.npmignore` deny-list — a forgotten entry **ships** what should not" with no clause recording that a one-purpose `.npmignore` **is** shipped to negate `vendor/workflows/`. §2 (`:103`) and §6 (`:375`) still decide the opposite of what the register alone implies. The commit in this round did not touch §13. Non-gating, carried forward. |
| F-02 | Low | **Open, unchanged** | §2's re-evaluation trigger at `:134` still reads "any new literal `pdlc/workflows/` path appearing outside the tree itself" without the "beyond the five enumerated above" qualifier; two of the five enumerated consumers already sit outside the tree at HEAD. Non-gating, carried forward. |
| Q-01 | — | **Not answered in this edit** | §8's row (c) is untouched by `8ab3b795`. The question was explicitly non-blocking and remains open for the next edit or for TSPEC to answer. |
| Q-02 | — | **Answered, and acted on** | I asked that the exit-code constraint be stated once, in the right place. TSPEC v0.11's changelog records the split explicitly — §6.2 "names that and **defers the reasoning to DEC-EDIST-06** rather than restating it, so the constraint is stated right in one place instead of wrong in two (PM Q-02)" (`TSPEC:28`), and `TSPEC:465` carries the corrected citation. This document holds the full reasoning. That is the disposition I hoped for. |

## Findings

No High findings. The one substantive change in this round is correct, verified
line by line against shipped code, and it repairs a false citation I raised in the
sibling TSPEC review. Two Medium and two Low findings, all record-hygiene rather
than decision content.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Process | **A substantive edit landed with no changelog row and no version bump, and the sibling document treated the identical edit as changelog-worthy.** The header still reads `Version 0.3` (`:12`) and the newest changelog row is still `0.3` describing round-1 revisions only (`:20`) — yet commit `8ab3b795` replaced the cited *authority* for DEC-EDIST-06's constraint in two places (`:467-470`, `:494-498`). TSPEC recorded the same edit as a new version: `TSPEC:28` (v0.11) names "F-47 / PM F-01: the `AC-1.4's exit-code contract` citation is withdrawn as false … the sibling DECISIONS §7 is corrected in the same edit". So at HEAD two documents disagree about whether this round happened: TSPEC says v0.11, DECISIONS says nothing changed since v0.3. This is the same class as my v1 F-05, which was accepted and fixed — the erratum protocol's delta-confirmation diffs the `Version` cell against the version last approved against, and a silent edit is invisible to it. **Fix:** bump to `0.4` and add one changelog row naming the two §7 occurrences and the authority they now cite. | BR-8.1 (record integrity) |
| F-02 | Medium | Local | **The Upstream cell declares TSPEC v0.9; TSPEC is v0.11 at HEAD, and both intervening rounds rewrote sections this document records.** `:5` reads "`TSPEC-pdlc-engine-distribution.md` (v0.9)". At HEAD the TSPEC changelog carries v0.10 (`:27`) and v0.11 (`:28`), and their content is exactly this document's subject matter: v0.10 creates `pdlc/engine/.npmignore` (DEC-EDIST-01/05's territory) and withdraws §6.5's "covers it for free" claim (DEC-EDIST-04's), v0.11 adds seam **S-7 `PluginRootResolver`** and the `notices` return extension behind AC-5.6's oracle. I verified the *entries themselves* are current — §2/§6 do decide the shipped `.npmignore`, §5 does state the two assertions — so this is stale provenance metadata, not stale content. But a reader deciding whether to trust this record checks that cell first, and it under-reports by two versions. **Fix:** repoint the Upstream cell to TSPEC v0.11 in the same edit as F-01, and state in the changelog row that nothing was absorbed (the entries already reflect that TSPEC's content). | AC-1.3 |
| F-03 | Low | Local | **"REQ carries no exit-code statement at all" is one word stronger than the evidence.** `:470` states it flatly. REQ does carry an exit-code statement — `REQ:434-435` requires that the two bootstrap commands "both exit 0, and `sync-workflows.sh --check` then exits 0 with every manifest row in sync". It is not an *engine-CLI* exit-code statement, which is the true and load-bearing claim, and the TSPEC-side version of this same correction scoped itself correctly. The overstatement is cheap to trip over: a later reader who greps `exit` in REQ finds two hits and doubts the whole paragraph. **Fix:** "REQ states nothing about the engine CLI's exit codes (its only exit-code text, `:434-435`, is about the bootstrap scripts)". | AC-1.4 |
| F-04 | Low | Local | **The new citation names a file but not a line, where the surrounding entry's convention is `file:line`.** Both occurrences cite `pdlc/engine/lib/run.mjs` bare (`:468`, `:495`). Every other re-grounded citation in this document after round 1 carries a line anchor, and my v2 review verified them individually on that basis. `exitCodeFor` is at `run.mjs:290` with the PROP-EXIT-1 contract in its JSDoc at `:282-289`; `PROP-EXIT-1`'s pinning test is `pdlc/engine/__tests__/exit-loop.test.js:88`. Adding `:290` and the test anchor costs nothing and keeps the document's own standard uniform. | AC-1.4 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Carried from v2, still open and still non-blocking: does §8's row (c) intend `doctor` over an unreadable config to print the version triple as well as the parse error? AC-1.4 promises one triple from the diagnostic; the corrupt-config state is the one place a reader cannot tell whether the promise survives. One clause in row (c) settles it. |
| Q-02 | Now that §7 is the single place the crash-1/halt-2 invariant is stated (TSPEC §6.2 defers here), should the entry say so in one line — "TSPEC §6.2 defers the reasoning to this entry" — so a later editor of §6.2 knows that thinning this entry leaves the constraint stated nowhere? Not a defect; the deferral is recorded in TSPEC's changelog but not in the document that inherited the obligation. |

## Positive Observations

- **The correction is exactly the one I asked for, and it goes further than the ask.**
  I raised the mis-citation against TSPEC §6.2 (PM `F-01` on TSPEC v10) and noted the same
  phrase sat in DECISIONS §7 twice. Both occurrences are fixed here — the entry body
  (`:467-470`) and the "Constraints that forced the shape" paragraph (`:494-498`) — rather
  than the one a narrow reading would have covered. Fixing the second occurrence is the
  part that keeps the register honest, because that paragraph is what a later reader
  reconstructs the constraint set from.
- **Every claim in the new text is true against HEAD; I checked each independently.**
  `exitCodeFor` exists at `pdlc/engine/lib/run.mjs:290` and maps exactly as stated —
  `if (refusal) return 1; if (!report) return 1;` then `halted`/`blocked` → 2, else 0
  (`:290-295`). Its JSDoc names PROP-EXIT-1 (`:283`). The property is pinned by a real
  test, `pdlc/engine/__tests__/exit-loop.test.js:88`. AC-1.4 is the version-triple
  criterion (`REQ:266-270`: "*When:* they ask the CLI for its version. *Then:* it reports
  the engine version … the compatible-plugin range … the installed plugin version"), and
  it says nothing about exit codes. The replacement authority is real, shipped, and
  test-pinned — which is the difference between correcting a citation and swapping one
  unverified pointer for another.
- **The entry now says which record owns the constraint, not just which record it isn't.**
  "That invariant is the engine's own, **not** REQ's AC-1.4" is a positive statement of
  ownership paired with the negative. That matters for this feature specifically:
  the engine's exit-code invariant is inherited from a completed feature
  (`docs/completed/pdlc-headless-engine/PROPERTIES-*.md` carries PROP-EXIT-1), so a
  reviewer who could not find it in this feature's REQ had no way to tell whether the
  constraint was invented or inherited. Now they do.
- **The decision itself is untouched, and that is the right restraint.** `128 + signum`,
  the exact-number oracle rather than `!== 0`, the "launcher-side mapping only; nothing
  about the child's own exit codes changes" scope limit — all preserved verbatim. The
  round changed what the decision *cites*, not what it *decides*, which is exactly what a
  citation erratum should change. Nothing I approved in v2 was reopened or re-litigated.

## Recommendation

**Approved with minor changes.**

No open High finding, old or new. My v2 review carried no High; the one substantive
change this round is verified correct against shipped code and broke nothing I had
previously approved — no entry was reopened, no decision reinterpreted, no scope
added that REQ or FSPEC does not already carry. Every decision in the document still
traces to a criterion upstream, and no entry decides a product question REQ has not
already delegated.

Four non-gating items to fold into the next edit of this document, ideally in one
commit since they are all in the header or the paragraph just changed:

1. **F-01 (Medium)** — bump to `0.4` and add the changelog row for `8ab3b795`, so the
   version cell stops disagreeing with TSPEC v0.11 about whether this round happened.
2. **F-02 (Medium)** — repoint the Upstream cell from TSPEC v0.9 to v0.11, noting that
   nothing needs absorbing because the entries already reflect that content.
3. **F-03 (Low)** — narrow "REQ carries no exit-code statement at all" to the engine CLI.
4. **F-04 (Low)** — add `:290` to the two `run.mjs` citations and the `exit-loop.test.js:88`
   anchor for PROP-EXIT-1.

Carried forward from v2 and still open, both non-gating: v2 `F-01` (§13's DEC-EDIST-05
row does not record the shipped `.npmignore`) and v2 `F-02` (§2's re-evaluation trigger
needs "beyond the five enumerated above").

No errata are raised this round. The upstream defect that motivated this edit is already
repaired at HEAD — TSPEC §6.2 (`:465`) cites `exitCodeFor`/`PROP-EXIT-1` and defers the
reasoning here, and the stale phrase in its v0.10 changelog row is fixed. The two
documents agree.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 2}
