# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-consolidation-agent/TSPEC-pdlc-consolidation-agent.md
**Date:** 2026-08-10
**Iteration:** 14
**Mode:** Delta re-review (`cd74cb54..HEAD`, TSPEC v2.3 → v2.4)
**Scope:** 149 insertions / 54 deletions over round 13. Round 13's three findings verified
against HEAD's code and REQ text, not against the changelog. Changed sections scanned for new
issues; sections outside the diff not re-litigated — with one exception, named in F-01, where
this round's rewrite converts a previously-handed-up question into a decision made here, which
puts the premise it rests on inside the delta.

## What changed, and what I measured

All three round-13 findings are resolved in mechanism:

- **F-01 (High) — §13.1 row 6.** Rewritten (`TSPEC:2894`): *"The round trip on this is closed,
  and this row records a settled shape, not a contingent one"*. *"not settled here"*, *"§13.3
  raises it as a REQ/FSPEC erratum"* and *"if the relaxation is accepted"* are all gone. The
  re-cast pointer quotes REQ §3.1 step 1's heading verbatim — `REQ-…:131` reads
  *"**One predicate, two enumerations (erratum, v2.1).**"*, exact match, and the document's last
  `REQ-…:NNN` line pointer is retired per §12.3's own widened rule. §13.3's DECISIONS list
  (`:2918-2919`) now carries row 6 as *"two predicate implementations, with the
  predicate/enumeration split named"*, i.e. as a shape, not as a pending relaxation. Resolved.
- **F-02 (Medium) — §13.1 row 10.** Now reads *"**two** `_git(["ls-files", …])` reads over one
  identical `:(glob)`-anchored pathspec pair — a `--cached --others` enumeration, minus a
  `--deleted` subtraction"* (`:2897`), citing REQ §3.1 step 1's second bullet. A task owner sizing
  the enumeration off §13.1 alone now provisions both calls. Resolved.
- **F-03 (Low) — §3.2 vs §10.4 tense.** §3.2's hook row keeps the ownership claim and adds the
  landed-at-HEAD note (`:268`, commit `b22834b7`). I checked the commit: it touches
  `pdlc/hooks/scripts/nudge-consolidation.sh` and nothing else, and all four edits stand at HEAD —
  `CORPUS_GLOBS` (`:60`), the comprehension (`:61`), `region_split` (`:29`, used `:72`), the
  `pending` fall-through (`:73`, no `if not learnings` above it), the `PDLC_PENDING:` line
  (`:77-78`, and it is `sorted(set(…))` as the corrected snippet says). Resolved.

**The te-driven `fakeGit` re-pointing checks out call by call.** `mergeDoubles.js`'s factory does
key on the subcommand after skipping `-C`/`-c` (`mergeDoubles.js:200-205`) with an unscripted key
returning `{ok:true, stdout:""}` (`:209`), and it is `async` returning `{calls, _git}`
(`:193-211`) — not callable, so it could not have been T-13's `asAsync` subject either, exactly as
§11.2 now says. `seams.js:389`'s version supports the function form, the per-call array with the
last entry repeating (`:407-408`), the map form keyed on raw `args[0]` with no `-C` skipping
(`:409-412`), and exposes `.calls` / `.commands` / `.callCount` (`:421-426`). The clone-domain
caveat is therefore true as stated. `asAsync` exists (`consolidationDoubles.js:83`).

**Hook re-anchoring by symbol is accurate.** `PY_BIN` probe loop and its `[ -z "$PY_BIN" ] && exit 0`
guard (`:13-20`), `THRESHOLD = 5` (`:25`), `proj` read from `CLAUDE_PROJECT_DIR` (`:58`) immediately
above `CORPUS_GLOBS` (`:60`). No stale line index survives in the changed passages.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Local | **§13.3 closes the `unread:` question by deciding it here, but REQ §4b already decided it upstream — and decided a *different* remedy, which §7.1 contradicts.** The new text (`TSPEC:2996-3010`) reasons: *"§7.1 puts an unreadable corpus entry **in the consumed pair** … **This layer's answer is no, and nothing is handed up**"*, i.e. no field, report body suffices. REQ §4b, *"Unreadable corpus entries add no field (erratum, v2.1)"* (`REQ-…:611-620`), agrees on the field and then goes further, in this REQ's reserved vocabulary section: *"An enumerated basename whose body cannot be read is instead **not consumed** — it is omitted from the `<!-- pdlc:consumed {passId} -->` pair, so it stays un-consolidated and the next pass retries it."* It states why: an entry marked consumed while contributing no evidence *"can only ever push a verdict toward `prevented` or `insufficient-evidence` and never toward `recurred`, which corrupts REQ-CONS-05's falsifiability loop in one direction."* §7.1 arm 2 (`TSPEC:940-944`) decides the opposite — inclusion in the pair, on a convergence argument — and §12.2's `(no FSPEC AT)` row (`:2734`) and §12.3's `consolidationPass.test.js` row (`:2807`) both make *"the consumed pair contains **both** basenames"* an asserted conjunct. Only arm 1 (counts toward `\|un-consolidated\|`) matches REQ (`:623`). Two things make this High rather than a stale-prose Low: the contradiction is now the **stated premise of a decision this document takes for itself**, where before it was routed upstream as a question; and it has already propagated — PROPERTIES **PROP-COR-09** (`PROPERTIES:384-392`) is titled *"An unreadable corpus **entry** is omitted from the consumed pair"* and cites *"REQ §4b's erratum decision"*, yet its conjunct (2) transcribes TSPEC's arm: *"`renderConsumedPair`'s output contains **both** basenames"*. An implementer reading the title builds omission; one reading the conjunct builds inclusion; the test passes for whichever the same author wrote. **Fix, all in this document:** absorb REQ §4b — §7.1 arm 2 becomes *omitted from the consumed pair, retried next pass*, with REQ's falsifiability-loop reason quoted rather than re-argued; re-state §10.4's convergence worry against REQ's answer (the retry is bounded by the fault being operator-visible and transient — the same population §13.3 now names) instead of against inclusion; correct §12.2's and §12.3's conjunct (2) to *not* in the pair, keeping the readable control and the report-body conjunct so the oracle stays positive-and-negative; and let §13.3 record the question as **answered upstream and absorbed**, not as answered here. Emitted as ERRATUM: PROPERTIES for conjunct (2), which cannot be corrected from this document. | REQ §4b (`REQ-…:611-620`), REQ-CONS-05, AC-1.1, AC-1.2 |
| F-02 | Low | Local | **Two of §11.2's new `seams.js` anchors are off by one to two lines.** The paragraph cites the function form at `:404` and the array form at `:406-408`; at HEAD `:404` is `let value;`, the function branch is `:405-406`, and the array branch is `:407-408`. The other four anchors in the same passage (`:389`, `:409-413`, `:421-426`, and `mergeDoubles.js:200-207`/`:193-211`) are exact, and the argument does not turn on the imprecise pair — but this passage is the one that just corrected a line-anchor defect elsewhere, and §12.3's rule is that a pointer either resolves or is re-cast. **Fix:** `:405-406` and `:407-408`, or cite the branch by its condition text. | §12.3's citation rule |

## Questions

| ID | Question |
|----|---------|
| Q-01 | If F-01 lands as omission, §7.1's *"nudged forever, never clearable"* worry needs an explicit bound so the fix does not reopen the shape §10.4 calls the worst outcome. REQ supplies half of it (the fault is a permissions error or a mid-pass unlink, both operator-visible and both clearable at the source) and §13.3's new re-evaluation trigger supplies the other half (the same basename reported unreadable on two consecutive passes falsifies "transient"). Is that pairing enough for §10.4's accepted-residue list to carry the retried entry as a *third* residue class alongside the nested repository, or does the PLAN owe an operator-facing line in the report body naming it as retryable? Either answer is fine; my concern is only that §10.4's residue list stay set-equal to what the mechanism actually leaves behind. |

## Positive Observations

- **The double defect was repaired at the double, not at the assertion.** §11.2 could have weakened
  AT-P1's conjuncts to survive an always-empty corpus; it re-pointed at the helper that can express
  two same-subcommand calls, added no factory, widened nothing shipped, and stated the map form's
  exclusion as a rule with its reason. The `mergeDoubles.js` `async`/`{calls,_git}` observation
  reconciling T-13 is the kind of check that only comes from opening the file.
- **The build-order guard on §11.1's ignored fixture is the right shape.** My Q-02 asked for one
  sentence; the revision added a guard conjunct instead — `git status --ignored --porcelain` reports
  `!!`, and the path is in neither `ls-files --cached` nor `--error-unmatch`. That makes the fixture's
  premise asserted rather than assumed, which is the difference between an oracle on the code and an
  oracle on the fixture.
- **The set-order paragraph closes a class of intermittent green.** `ls-files` output order is a fact
  about git, and §7.1 now binds every corpus oracle — including the one real-git case where an
  unsorted listing actually reaches an assertion — to set comparison. Measured, stated, and bound to
  the specific case that would have flaked.
- **Row 6's closure is written as a round trip, not as a retraction.** It names what REQ withdrew,
  what FSPEC re-scoped, and where §7.1 absorbed it, so a DECISIONS author transcribing the row cannot
  reopen a settled REQ question — which was precisely the DEC-ERR-01 failure the previous round named.
- **The re-evaluation trigger on a declined question.** *"If a pass is ever observed reporting the
  same unreadable basename on two consecutive passes, the fault is not transient"* — a declined
  question with a stated falsifier is worth more than a deferred one, and it survives F-01 intact.

## Recommendation

**Needs revision**

The round-13 findings are all resolved in mechanism, and the `fakeGit`, symbol-anchor and set-order
work is sound where I could check it against HEAD. What blocks is one thing, and it is upstream
fidelity rather than craft: **§13.3 decides here a question REQ §4b already decided, and §7.1's
consumed-pair arm decides it the other way from REQ.** Concretely:

1. **F-01 (High)** — absorb REQ §4b: the unreadable entry is **omitted** from the consumed pair and
   retried; correct §7.1 arm 2, §12.2's `(no FSPEC AT)` row and §12.3's conjunct (2); re-cast
   §13.3 as *answered upstream and absorbed*, not *answered here*.
2. **F-02 (Low)** — `:404` → `:405-406`, `:406-408` → `:407-408` in §11.2.

One erratum is emitted to PROPERTIES, whose PROP-COR-09 title and conjunct (2) already disagree with
each other across this same boundary. Nothing approved in v10–v13 is disturbed by this round's
edits, and no oracle in the diff is weakened.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 0, "low": 1}
