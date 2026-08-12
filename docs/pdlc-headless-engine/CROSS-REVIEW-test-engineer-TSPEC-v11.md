# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-headless-engine/TSPEC-pdlc-headless-engine.md` (v1.9)
**Date:** 2026-08-11
**Iteration:** 11

**Scope:** delta confirmation of the Phase-T erratum round against v1.8, the revision approved in
round 10 (`REVIEWED-COMMIT: ed0e0eec`). This is not a fresh review: the question answered here is
whether the three erratum items routed to this document are discharged, and whether the targeted
edit broke anything that was previously approved. Unchanged sections were not re-reviewed.

Diff read: `git diff ed0e0eec..HEAD -- docs/pdlc-headless-engine/TSPEC-pdlc-headless-engine.md`
(+70/−41), across five commits (`f1d68757`, `316a5a6f`, `8e2b9c70`, `1d136daa`, `03d28fc6`).
Every anchor below was re-read at HEAD on `feat-pdlc-headless-engine` against the committed blob,
not the working tree.

## Erratum disposition

| Erratum item | Disposition | Verification at HEAD |
|---|---|---|
| **1 — TSPEC v1.8 still pins FSPEC v1.6** (`TSPEC:20`, `:54`) | **Discharged.** The lineage header now reads `FSPEC-pdlc-headless-engine.md` **v1.7** (`TSPEC:9`) and the v1.9 changelog states the pin move explicitly (`TSPEC:19`). The two surviving "FSPEC v1.6" strings are inside the **v1.8 and v1.7 changelog entries** (`TSPEC:42`, `:76`), which record the pin in force when those revisions were written; the document says so in as many words (`TSPEC:36-38`). That is the correct handling — rewriting a historical changelog line to a version that did not exist when the entry was written would make the changelog a worse record, not a better one. The pin in force *now* is unambiguous and appears in exactly the two places a reader looks: the lineage table and the current entry. | `TSPEC:9`, `:19`, `:36-38`; FSPEC version row at HEAD is `1.7` (`FSPEC:16`) |
| **2 — pre-insertion rung-4a anchors** (`FSPEC:299` at `TSPEC:1034`, `FSPEC:406` at `TSPEC:2179`) | **Discharged, and each anchor lands on the text it claims.** Re-read against the HEAD blob, not the worktree: `FSPEC:307` is the `\| 4a \| **guard executable (C-11)** \|` ladder row; `FSPEC:416` is EC-START-10 ("no accepted interpreter on the host"); `FSPEC:417` is EC-START-11 (the `PATH`-present-but-not-runnable stub); `FSPEC:300-308` spans the rung table head through rung 5, which is what the `RUNG_ORDER` code comment now cites (`TSPEC:1050`); `FSPEC:928-931` is BR-GUARD-6's candidate-set bullet and `:932-933` its "observed by **running**" rule; `FSPEC:977` is AT-ENG-11a. A grep of the live body for every superseded anchor (`:299`, `:302`, `:406`, `:918`, `:922`, `:967`, and "FSPEC §5") returns **no live-body hit** — the only survivors are the `old → new` pairs inside the v1.9 changelog (`TSPEC:27-29`) and one historical v1.6 changelog line (`:124`), both of which are meant to name the superseded value. §4.3's "FSPEC §5's ladder" is corrected to **§4.1** (`TSPEC:1050`). | `FSPEC:307`, `:416-417`, `:300-308`, `:928-931`, `:932-933`, `:977`; `TSPEC:1050`, `:1055-1056`, `:2201-2202`, `:2236`, `:2241` |
| **3 — BR-START-1 "no probe of any kind"** (`TSPEC:9`, `:21`, `:2448-2452`) | **Discharged, and discharged in the strongest available form: quoted verbatim from the landed upstream text.** FSPEC v1.7 at HEAD reads "No model call, and no *billable* probe of any kind, is made while the ladder is running", and adds the clause that settles the question — "Local checks the ladder performs on the host's own bytes are not probes in this sense and are not dispatches — rung 4a observes interpreter availability by running a candidate (BR-GUARD-6), which bills nothing" (`FSPEC:310-313`). §7.8 no longer *infers* the billable reading from BR-START-1's "zero tokens billed" justification; it quotes the qualifier now in force (`TSPEC:2248-2252`). §9.3's entry moves from "raised, outstanding" to `**resolved in FSPEC v1.7**` (`TSPEC:2474-2480`), and §7.8 records the discharge (`TSPEC:2256`). | `FSPEC:310-313`; `TSPEC:21-22`, `:2248-2256`, `:2474-2480` |

The third item is worth naming precisely, because it is the one that could have been discharged
badly. The cheap discharge was to narrow §7.8's design until it fit the un-qualified prose — drop
the `spawnSync` observation, or downgrade rung 4a to a `PATH` lookup. That would have satisfied the
letter of BR-START-1 and broken EC-START-11, whose entire content is that presence is not
executability. The document instead held the design, raised the erratum upstream in round 9, and
this round records that upstream adopted it. §7.8's tests are byte-identical across the erratum
round, which is the observable signature of a correctly-routed erratum: the finding moved, the
design did not.

## Regression check on the previously approved design

A citation-only round can still do damage two ways: by editing a test contract while claiming to
edit a citation, or by leaving an anchor pointing at plausible-but-wrong text so a later reader
"corrects" a correct design. Both were checked mechanically.

**No test contract moved.** Filtering the delta for lines containing `assert`, `fixture`, `test`,
`oracle`, `spawnSync` or `state ===` yields exactly three changed lines, and all three are citation
swaps inside surrounding prose that is otherwise byte-identical:

| Changed line | Nature |
|---|---|
| EC-START-11 fixture sentence — `FSPEC:922-924` → `:932-933` | anchor only; the fixture (`python3` resolves and fails to execute, `python` succeeds) is unchanged |
| set-equality sentence — `FSPEC:919-921` → `:929-931` | anchor only; the `GUARD_INTERPRETERS` set-equality assertion against the script's own `:15-20` is unchanged |
| BR-START-1 paragraph — inferred reading → verbatim v1.7 quote | the *justification* changed, the design it justifies did not |

The assertions this round's reviewers care about most are intact at HEAD: EC-START-11 still asserts
rung 5's record **positively** (`state === "pass"` under a green billing posture), which was the
F-45 repair and is the conjunct that stops a three-valued enum from false-greening the branch; the
`{ran, outcome}` mapping still uses the exact phrases the fixture asserts (`"found but exited
9009"`, `"ran"`), which was the Q-21 repair. Neither was touched. The `GUARD_INTERPRETERS` code
comment moved `// FSPEC:918-921` → `// FSPEC:928-931` and now lands on the candidate-set bullet, so
the set-equality test still has a citable upstream authority to be equal *to* — that test's whole
value is that a script-side change to the candidate set turns it red rather than drifting silently,
and it would have lost that if the anchor had gone stale in the other direction.

**Every re-anchored citation was independently re-read**, not taken from the changelog's arrow
list. Spot-checking the eight mechanical shifts the changelog claims: `FSPEC:218` is the
`--dry-run-skill` row, `:223-225` the transport/`transport`-field text, `:572-574` BR-SKILL-3,
`:690-694` BR-MODEL-3's corpus rule, `:747` the `agent-reported-failure` outcome row, `:977`
AT-ENG-11a, `:1213-1223` the §12.2 report-field table. REQ citations are untouched and still land
(`REQ:284` is C-11, `REQ:502-506` is AC-3.5) — correct, since REQ is still v0.10.

**Prior-round findings.** F-48 (Medium — the skill-argument position is not named per dispatch
function, so the indirect count is 11 by enumeration and 10 by rule) and F-49 (Low — §8.3's
`orchestrate-dev.js` row says "the eleven class-4 literals" where ten of the eleven are in that
file) are both **still open** at HEAD (`TSPEC:562`, `:593-601`, `:2344`). That is the right outcome
for this round, not a regression: an erratum round re-grounds citations and must not smuggle in
unrelated content edits. Both were non-blocking under round 10's *Approved with minor changes* and
they remain non-blocking here; they belong to the next substantive revision, and neither affects a
test that exists today.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-50 | Low | Local | **The v1.9 changelog's BR-START-1 span stops one line short of the clause that discharges the erratum.** The changelog records the move as BR-START-1 `:302-303` → `:310-312` (`TSPEC:27`), but the body cites `:310-313` in both places it quotes the rule (`TSPEC:22`, `:2252`), and `:313` is the correct end: `FSPEC:313` carries "availability by running a candidate (BR-GUARD-6), which bills nothing" — precisely the sentence that makes rung 4a's `spawnSync` lawful and the reason the erratum is closed. `:310-312` stops at "rung 4a observes interpreter", mid-clause. The body is right and the changelog is one line short, so nothing downstream reads the wrong text; the cost is that a future re-grounding pass driven off the changelog's arrow list would re-anchor to a span that omits the operative clause. Fix is one character in `TSPEC:27`. | v1.9 changelog (`TSPEC:27`) vs §1/§7.8 (`:22`, `:2252`) |

## Questions

None. The three erratum items are closed by the landed FSPEC v1.7 text, and the round introduced no
new ambiguity — no design, decision, mechanism or assertion changed.

## Positive Observations

- **The erratum was discharged by quoting upstream, not by paraphrasing it.** §7.8 previously had to
  *argue* the billable reading from BR-START-1's "zero tokens billed" justification; it now quotes
  the qualifier FSPEC actually landed (`FSPEC:310-313`). A test-facing document that reasons its way
  to an upstream reading is one upstream edit away from being wrong; one that quotes the text in
  force fails loudly instead. This is the more durable of the two forms.
- **The design was held while the erratum was routed, and that judgement is now vindicated.** Round 9
  could have narrowed rung 4a to a `PATH` lookup to fit the un-qualified prose. That would have
  satisfied BR-START-1's letter and destroyed EC-START-11, whose only content is that presence is
  not executability. Holding the design and raising the erratum upstream kept the falsifying test
  alive; §7.8 is byte-identical across the round, which is exactly what a correctly-routed erratum
  looks like from the test lens.
- **The re-anchoring was verified, not asserted.** The changelog claims each citation "was re-read at
  HEAD and lands on the text it claims" (`TSPEC:34-35`), and independent re-reading of all fourteen
  shifted anchors — plus a grep proving no superseded anchor survives in the live body — bears that
  out. The distinction between live-body anchors (re-grounded) and historical changelog anchors
  (deliberately left) is stated up front (`TSPEC:36-38`) rather than left for a reviewer to guess.
- **§9.3 closes the ledger explicitly** with "No erratum against FSPEC or REQ is outstanding"
  (`TSPEC:2480`), and the round-8 incidental note about the guard script's line span stays withdrawn
  rather than quietly reappearing.

## Recommendation

**Approved with minor changes**

All three erratum items are discharged and verified against the committed HEAD blob: the upstream
pin moves to FSPEC v1.7, every rung-4a anchor lands on the text it claims, and BR-START-1's
"billable" qualifier is quoted from the landed v1.7 rather than inferred. No test contract, fixture,
oracle or assertion changed in this round — the delta is citations and erratum status only, which is
what a Phase-T erratum round should be. F-50 is a one-character changelog span; it blocks nothing and
can ride along with the next revision.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 1}
