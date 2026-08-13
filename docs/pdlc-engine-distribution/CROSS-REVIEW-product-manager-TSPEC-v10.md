# Cross-Review: product-manager — TSPEC (delta confirmation, erratum round)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-engine-distribution/TSPEC-pdlc-engine-distribution.md (v0.10)
**Date:** 2026-08-13
**Iteration:** 10 (erratum delta confirmation — not a full re-review)

## Scope

Delta confirmation of the Phase D erratum edit (`046f0c58`…`85ecb399`, diffed against the
approval anchor `a3d3489a`). Read: the diff, the edited sections at HEAD (§4/D-5, §5.1, §5.2,
§5.4, §6.2, §6.5, §12.1, changelog), and the **upstream at HEAD** — REQ v0.10 and FSPEC v0.2 —
rather than the item list alone (DEC-ERR-03). Scope is judged against upstream as it now
reads, not against the raised items.

Not re-reviewed: everything settled in rounds 1–8. I confirmed by diff that the edit touches
only the seven hunks the changelog claims and re-opens nothing else.

**Upstream re-grounding.** The changelog's claim checks out: REQ is v0.10
(`REQ:18`) and FSPEC v0.2 (`FSPEC:16`) at HEAD, and both last moved *before* the approval
anchor (`git log`: REQ's last edit `c38feb61` sits below `a3d3489a`). Nothing upstream has
moved since this TSPEC was approved, so there is nothing to absorb and no upstream decision
this round routes back.

## Item-by-item confirmation

| # | Item (as raised) | Landed? | Evidence at HEAD |
|---|---|---|---|
| 1 | §5.4/PF-3 closes O-8 blocker 1 but records still count three open | **Yes** | §5.1 (`TSPEC:216-221`) states blocker 1 is closed by this feature, cites `pdlc/engine/package.json:4` (verified: `"private": true` still at HEAD, line 4), PF-3 (`TSPEC:1199`) does assert `private` absent, and the manifest row (`:204`) already carried the removal. DECISIONS §12 (`:769-784`) now matches — two operator-owned rows, N-2 and N-6. See F-02 for the one loose end |
| 2 | `.npmignore` absent from §5.1's inventory while DEC-EDIST-01/05 ship one | **Yes** | New inventory row (`TSPEC:214`) — one line `!vendor/workflows/`, "never a packed member", PF-4's PK-* set unchanged. Verified `pdlc/engine/` ships no `.npmignore` at HEAD (`ls -a`: `.gitignore` only), so "absent at HEAD (same listing)" is true |
| 3 | §5.2 does not schedule the file next to the `vendor/` git-ignore rule | **Yes** | `TSPEC:241-247` authors both in the same task, and V-06 (`:64`) still correctly records that `.gitignore` carries only `node_modules/` today |
| 4 | D-5's wording contradicts a shipped `.npmignore` | **Yes** | D-5 (`:152`) now reads "a `files` allow-list **decides the packed set**", cites both DEC-EDIST-05 and DEC-EDIST-01; §5.4 (`:302-313`) states the two consequences (never packed, cannot widen) explicitly. Consistent with DECISIONS §6 (`:416-419`) |
| 5 | §6.2 names signal handling as needing assertion but decides only exit code and stdio | **Yes, substantively** | `TSPEC:457-466` decides `128 + signum` for `status === null`, and the oracle (`:469-478`, §12.1 fixture-machine row `:1770`) asserts the **exact number**, not `!== 0`. Matches DEC-EDIST-06 (`DECISIONS:434-495`). One citation defect carried in with it — F-01 |
| 6 | §6.5's "the catalogue equality covers it for free" is false at HEAD | **Yes** | Claim withdrawn (`TSPEC:621-655`) with both shipped oracles named and correctly characterised — verified `__tests__/catalogue.test.js:71` compares `messageIds()` with `Object.keys(MESSAGES)` (module against itself), `:4-6` disclaims emitted-ids equality, and `_assert-suite-wide.mjs:196-210` (`checkMessageCatalogue`) is path-blind and runs the obligation direction. AC-5.6 now gets a named path-level oracle over `resolvePluginRoot`'s four rows, mirrored in §12.1's unit row (`:1767`) |

AC-5.6 exists upstream as cited (`REQ:422`), and the new oracle's positive/absence split
matches its trigger condition. No previously approved statement is contradicted by items 2–4
or 6.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Cross-Feature | **§6.2's new signalled-child paragraph justifies itself with an AC that does not say what it is quoted as saying.** `TSPEC:461` says exiting 0 on a Ctrl-C'd run "collides with AC-1.4's exit-code contract"; DECISIONS §7 spells the same claim out as "AC-1.4's exit-code contract (crash 1, halt 2)". At HEAD **AC-1.4 is the version-triple AC** (`REQ:266-270`: "*When:* they ask the CLI for its version. *Then:* it reports the engine version, the compatible-plugin range, and the installed plugin version") — it says nothing about exit codes, and `grep -n "exit" REQ` returns only the two bootstrap-command lines at `:434-435`. This TSPEC's own AC map agrees: `:1927` and `:1739-1740` map AC-1.4 to `runStartupChecks.versions` surfaced by `--version`/`doctor`, so the document now attributes two different contracts to one AC. **The decision itself is sound and traceable** — "crash 1, halt 2" is real shipped behaviour, `exitCodeFor` (`pdlc/engine/lib/run.mjs:283-295`, PROP-EXIT-1), whose ordering `worstExitCode` (`:297`) preserves. **Fix:** re-cite the constraint to the shipped invariant (`run.mjs:290`, PROP-EXIT-1) instead of to AC-1.4, in §6.2 and in DECISIONS §7's two occurrences (`§7` body and its "Constraints that forced the shape" row). No behaviour changes; the `128 + signum` decision and its exact-number oracle stand as written. Tagged Cross-Feature because the false citation is shipped in **two** documents and the same "AC-1.4's exit-code contract" phrase will otherwise be copied into PLAN and PROPERTIES | AC-1.4 (REQ-EDIST-01) |
| F-02 | Medium | Local | **§5.1's blocker-1 closure diverges from upstream ownership without routing an erratum upward.** `TSPEC:216-221` now says blocker 1 "is closed here, by this feature, not by an operator", leaving 2 and 3 "the only two left". Upstream at HEAD still says otherwise in two places: `REQ:578-589` gives O-8 *Owner: operator* for all three, and FSPEC F-5 step 7 (`FSPEC:211-215`) plus Q-8 (`FSPEC:795-802`) read "At HEAD all three of O-8's blockers stand … Clearing them is the operator's". The TSPEC's mitigation — "downstream records citing 'three blockers' should cite this closure" — points the wrong way: FSPEC and REQ are **upstream** of this document, so they cannot absorb a TSPEC instruction. To be clear about what is *not* wrong here: removing `"private": true` is engineering work, PF-3 already asserts it, and the manifest row at `:204` was approved in an earlier round — the substance is right and no scope is added. What is missing is the routing. **Fix (either is acceptable):** (a) state in §5.1 that this refines FSPEC F-5 step 7 / Q-8 and REQ O-8's owner field, and raise the one-line erratum against FSPEC so the two documents stop disagreeing; or (b) narrow the wording to "blocker 1 is discharged by this feature's manifest edit; O-8's owner field is unchanged because clearing it still gates AC-3.1's real-channel leg" | O-8, AC-3.1 (REQ-EDIST-03) |
| F-03 | Low | Local | **The v0.10 changelog entry says "Four items" and then numbers five, (1) through (5)** (`TSPEC:27`). Six items were raised. The count is the only thing wrong — every numbered item is present and each maps to a real edit — but a reader reconciling the erratum wave against the changelog will stop at the arithmetic. Fix: say "Five items" (items 5 and 6 of the raised list are the same §6.5 defect, raised twice) | — |

## Questions

| ID | Question |
|----|---------|
| Q-01 | §5.4 states the shipped `.npmignore` "cannot widen the packed set" because a negation only readmits. True for the file **as specified** (one line, `!vendor/workflows/`). Is anything asserting it stays one line? PF-4 packs for real and compares members, so an added deny-line that *narrowed* the set would go red there — but a future negation of a second git-ignore rule would readmit silently. I do not think this needs an oracle at this altitude; confirming it is a deliberate no rather than an oversight. |
| Q-02 | Is F-01's re-citation better made once, in DECISIONS §7, with §6.2 pointing at DEC-EDIST-06 rather than re-stating the constraint? That would leave one place to be wrong instead of two, matching how §6.2 already defers the decision itself. |

## Positive Observations

- **The §6.5 withdrawal is the model of what an erratum should look like.** It does not just
  delete the false claim; it names both shipped oracles, says exactly why each one misses this
  row (module-against-itself; path-blind, and running the direction that creates an
  *obligation* rather than coverage), and then specifies the replacement positively — emission
  by catalogue id **plus rendered text** on the ignore branch, absence on the other three. I
  verified all three citations at HEAD and they are exact. AC-5.6 went from "covered for free"
  to genuinely covered, and §12.1's unit row was updated to match instead of drifting.
- **The signalled-child oracle is specified as an exact-number assertion, and the reason is
  written down** — a `!== 0` would have been satisfied by the very `null`-coerced-to-0 defect
  being closed. That sentence is worth more than the decision it guards.
- **Upstream was re-grounded before editing, and the changelog says so with checkable facts**
  (REQ v0.10, FSPEC v0.2). Both check out, including the ordering against the approval anchor.
- **No previously settled material was re-opened.** The diff is seven hunks, each traceable to
  a raised item; rounds 1–8's decisions — the five-key `deps` seam, the two-leg assertion-key
  split, the single `provenance-path.test.js` — are untouched.

## Recommendation

**Approved with minor changes.**

All six raised items land, and land correctly against HEAD, not just against the item list. No
High finding: nothing previously approved is broken, no acceptance criterion is narrowed,
dropped or reinterpreted in substance, and no scope is added. The two Medium findings are both
about *citation and routing*, not about the decisions themselves — F-01's `128 + signum` rule
and F-02's blocker-1 closure are both right, they are just each pinned to the wrong record.
Both fixes are one or two sentences and can ride with the next edit to this document; neither
should hold the phase.

If only one is taken, take **F-01** — it is the one that propagates, because PLAN and
PROPERTIES will copy "AC-1.4's exit-code contract" forward from two documents.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 1}

