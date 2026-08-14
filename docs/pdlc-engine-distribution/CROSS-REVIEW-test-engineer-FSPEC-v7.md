# Cross-Review: test-engineer — FSPEC (delta re-review, round 7)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/FSPEC-pdlc-engine-distribution.md` (v0.7)
**Date:** 2026-08-14
**Iteration:** 7

**Scope:** Delta over `73e664bb..a57e0547` (v0.6 → v0.7), the commit range since my v6
review. Carried-forward §5.2 anchoring, the CLI-entry cardinality note, AT-3.8a's count
conjunct, the Workflow-members rename, AT-1.1's surface clarification, and the v0.6
re-grounding record. Not a whole-document re-review.

## Prior-finding disposition

| v6 finding | Severity | Disposition | Evidence |
|---|---|---|---|
| `F-01` — FSPEC not re-grounded on REQ v0.11; three routed items already decided upstream, left readable as open | High | **Resolved** | Upstream cell now names REQ **v0.11**, commit `01c27ee4`, "re-grounded 2026-08-14 erratum round" (`FSPEC:9`). A dedicated **re-grounding record** (`FSPEC:36-43`) absorbs both REQ v0.11 decisions and states neither moved text. I checked both against REQ HEAD, not against the changelog's own claim: (a) REQ AC-1.3 does read "**classes and per-class member counts are stated in the FSPEC** … **member names are stated downstream in the TSPEC**" (`REQ:268-269`), and FSPEC `:544-545` now quotes that wording with the `REQ v0.11, :268` pin rather than the superseded "expected set stated in the FSPEC"; (b) REQ v0.11's changelog does correct the run-side `engine.*` pin citation to **F-4 step 2** (`REQ:23-24`), and FSPEC `§3` carries that flow (`FSPEC:201`, `:608`). Each of the three previously-false lines is now marked discharged in place: the v0.5 entry (`FSPEC:47-49`) and the v0.4 entry (`FSPEC:58-64`). |
| `F-02` — downstream PROPERTIES still quoted the deleted `"none installed"` literal | Medium | **Resolved downstream** (see `F-01` below for a residual prose effect) | `grep -rn "none installed" docs/pdlc-engine-distribution/` returns no live assertion text: PROPERTIES v0.4 (`PROPERTIES:21`) and PLAN v0.7 (`PLAN:24`) repointed PROP-LAUNCH-3 and T15(e) to "**not** AT-1.1's `not found` message", and PROP-LAUNCH-3's discriminator is now a paired positive pin, not an absence oracle. Landed in `8980ffe7`. |
| `F-03` — `handshake.test.js:113` cited as a bare line inside a multi-line assertion block | Low | **Resolved in this document** | `FSPEC:29-30` now cites "the missing-plugin case in `pdlc/engine/__tests__/handshake.test.js:110-118`" — the case range, which survives insertions above it. (PROPERTIES' PROP-LAUNCH-5 still carries the bare `:113`; that is a PROPERTIES-side residue, not an FSPEC defect, and PROP-LAUNCH-9 already cites the range.) |
| `Q-01` — was the AT-1.1 / AT-1.6 split between the refusal *reason text* and the version-*triple member* intended? | — | **Answered in the document** | `FSPEC:679-681` states it explicitly: AT-1.1 pins the **refusal reason text**, which *contains* the literal; AT-1.6 and Q-1 pin the **version-triple member**, which *equals* it. That matches HEAD's two shapes — `handshake.mjs:164` (`version found: not found`) and `:209` (`plugin: pdlc vnot found`) — so a verifier can no longer pick the wrong surface and get a red test with no defect. |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | **The v0.7 changelog's closing sentence is stale against HEAD.** It reads "SE `F-01`/TE `F-02` are routed as errata on PLAN and PROPERTIES, which still name the deleted 'none installed' message." At HEAD they do not: PLAN v0.7 and PROPERTIES v0.4 discharged that erratum in `8980ffe7`, which is the commit *before* this FSPEC edit (`a57e0547`), so the sentence was already false when written. No oracle depends on it, but it is the same class of defect the v0.6 round existed to fix — a document asserting a downstream state that has moved — and a reader auditing the erratum wave will chase a closed item. Suggest: "…routed as errata on PLAN and PROPERTIES; **discharged in `8980ffe7` by PLAN v0.7 and PROPERTIES v0.4**." | Changelog `:23-24` |
| F-02 | Low | Local | **The Workflow-members rename did not reach BR-8.2.** §5.2's class row and AT-3.8b are now consistently "workflow **members**" — correct, since `PK-22` is `vendor/workflows/VENDOR-MANIFEST.json` (`TSPEC:358`), not a module — but BR-8.2 still reads "how the **workflow modules** get inside the package" (`:571`). The rule is about the packaging mechanism and its subject set is the same three `PK-*` ids, so nothing is ambiguous for a test author; it is the one surviving instance of the term the rename retired. §1's "canonical workflow modules" (`:97`) is a *different* referent — the repo's own workflow sources — and correctly keeps the old word. | `:571` |

**Nothing in the delta weakened an oracle.** I re-derived the three things this round touched
that a test actually reads:

- **Set-equality survived, and the count conjunct got stronger.** AT-3.8a's first conjunct is
  still member-for-member over the full enumeration with the added-file *and* removed-member
  falsifiers named (`:762-765`), so a deletion still fails — containment was not substituted for
  set-equality. The count conjunct was rewritten from a negative ("never the tarball's own
  length") to a positive obligation: the transcribed `PK-*` list's length **and each class's
  slice of it** must equal §5.2's total and per-class numbers (`:768-772`). That is a strictly
  larger assertion than v0.6's, and it keeps the per-class granularity that defeats the
  merge-one-`lib`-module / split-one-`bin`-entry swap. The "never the tarball's own length"
  clause remains, correctly, as a *rationale* for the positive form rather than as the assertion
  itself — no implementation echo: the expected numbers are literal transcriptions of §5.2.
- **The new `PK-*` anchors are accurate, so the per-class counts are now mechanically
  checkable.** CLI entry → `PK-4`, `PK-4b` = 2 members (`TSPEC:350-351`); engine modules →
  `PK-5`…`PK-19` = 15 (`TSPEC:352-355`, V-03's twelve plus §3.1's three); workflow members →
  `PK-20`…`PK-22` = 3 (`TSPEC:356-358`). Sum with manifest 1, README 1, install script 1 and
  licence 0/1 gives 23/24, which is the arithmetic `TSPEC:388-392` derives independently from
  its own rows. Both sides agree and neither is derived from the other.
- **The CLI-entry note no longer contradicts the count paragraph.** v0.6 called the entry's
  cardinality "a decomposition question TSPEC §5.4 decides, not this document" while the
  paragraph two lines below owned the number 2. The row now says the class holds "the **2**
  members counted below, and moving that number is an FSPEC edit" (`:534`), which is the same
  change-control rule every other class carries. A verifier reading only §5.2 can now write the
  per-class assertion without deciding which of two sentences governs.

## Questions

| ID | Question |
|----|---------|
| Q-01 | AT-3.8b now asserts the workflow-member class "member-for-member … and a removed member fails", with the parenthetical "three members and not three modules". Is the `.js`/`.json` distinction meant to be *asserted* — i.e. does the expected slice pin the three filenames including the `.json` extension — or is it only prose guarding against a future `lib/*.mjs`-style glob? I read it as the former, since §5.4 names the three literally, and that is the testable reading; flagging only because a verifier who reads it as prose might write a `*.js` glob over `vendor/workflows/` and drop `PK-22` while still passing a count of three. |

## Positive Observations

- The re-grounding record is the strongest artefact this feature has produced for the erratum
  protocol. It names the upstream version *and commit*, enumerates exactly two absorbed
  decisions, states for each why no text moved, and closes with "nothing else in REQ v0.11
  touches this document" — the set-closure claim that makes the record auditable rather than
  merely reassuring. I verified both absorptions against REQ HEAD and the closure claim against
  REQ's v0.11 changelog; all three hold.
- Discharge was recorded **in place** rather than by deleting the stale lines. The v0.4 and v0.5
  entries still carry their original routing text with the discharge marked inline
  ("**superseded by REQ v0.11**", "**fixed in REQ v0.11**, which cites F-4 step 2"). That keeps
  the changelog append-only and lets a later reader reconstruct why an item was raised, which
  deleting would have destroyed.
- AT-1.1's clarification answers a review question by making the document more testable rather
  than by arguing the reviewer was wrong. Naming *contains* versus *equals* for the two surfaces
  turns what was an ambiguity into two separate, individually falsifiable assertions.
- Every carried-forward §5.2 edit moved toward a mechanically-checkable statement: ids anchored,
  cardinality owned, count conjunct stated positively. None of them changed a criterion, and the
  changelog says so and is right — I diffed the AT bodies to confirm the only AT-level changes
  are AT-1.1's added sentence, AT-3.8a's count-conjunct rewording, and AT-3.8b's terminology.

## Recommendation

**Approved with minor changes.**

The one High from round 6 is fully resolved, and resolved at the level it was raised: the
document is re-grounded on REQ v0.11 by version and commit, both upstream decisions are
absorbed with evidence, and the three lines that had become false statements about upstream are
each marked discharged. The Medium is resolved one layer down, in the documents that owned it.
Nothing in the delta broke an oracle; AT-3.8a's count conjunct is measurably stronger than the
version I last approved.

The two remaining findings are Low and prose-only: refresh the v0.7 changelog's closing sentence
to record that the PLAN/PROPERTIES erratum is already discharged (`F-01`), and carry the
Workflow-**members** rename into BR-8.2's one surviving "workflow modules" (`F-02`). Neither
blocks; both can ride the next edit this document takes for any reason.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 2}


APPROVAL-HASH: sha256:d3891a6570da0f3abb126312255e430934ba7fcaa653d63ce1132b39b03423b1
APPROVAL-HASH-NORMALIZED: sha256:87f231423b7f964a35b657c3e8e1daf3f947d436940550e3340dd390746b2153
REVIEWED-COMMIT: a57e0547e9f233ed5e6b86fc87b6263e57974921
