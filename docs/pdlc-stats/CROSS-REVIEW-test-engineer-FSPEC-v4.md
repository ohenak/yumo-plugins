# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-stats/FSPEC-pdlc-stats.md` (v1.3)
**Date:** 2026-08-31
**Iteration:** 4
**Previous review:** `CROSS-REVIEW-test-engineer-FSPEC-v3.md` (1 High, 2 Medium, 2 Low) — *Needs revision*
**Delta reviewed:** `git diff c3ee2c0ef..HEAD -- docs/pdlc-stats/FSPEC-pdlc-stats.md` (42 insertions, 29 deletions), commit `32a23e013`

## Prior Findings Disposition

| Prior | Sev | Status | Evidence in the revision |
|---|---|---|---|
| F-01 — BR-20's widened "every path but one" guarantee and BR-30's closed two-value `reason` enum contradicted each other on EC-11's single-feature path, and no oracle was written either way | High | **Resolved** | The contradiction is closed the way the finding asked, in the rule rather than in the exception list: D-10 is a new decision row (line 894) that names the choice explicitly ("Third `reason`, or a second BR-20 exception?") and takes the third `reason`, with the rationale that a second exception "would make BR-20's guarantee path-by-path again — the rot it was rewritten to prevent". BR-30's enum is now `not_found`, `no_docs_root` and `unreadable_feature` (line 499); EC-11 carries the `--json` stdout clause (line 530); BR-20 now reads "a report and every BR-30 refusal … all emit one" (line 398), which is the shape that does not rot — the enumeration is delegated to a closed enum rather than restated as a path list; BR-29's exit-1 list gains "unreadable feature directory in single-feature mode" (line 493); §3.3 C3 names the path (line 174). AT-27 gains a leg asserting stdout content, `error.reason` exactly `unreadable_feature`, "not empty stdout". All three enum values are now pinned by a test: `not_found` at AT-23, `no_docs_root` and `unreadable_feature` at AT-27. |
| F-02 — AT-27's root leg never pinned `feature` on the single-feature JSON root failure, the exact path D-9 was written to decide; and "four runs" was ambiguous over three axes | Medium | **Resolved** | Both halves. The run set is now spelled as an explicit cross product — "the eight root-failure runs — {`docs/` root absent, `docs/` root unreadable} × {single-feature, fleet} × {human, `--json`}" — so the count follows from the axes instead of the reader guessing. And `feature` is asserted per mode: "the supplied name in the single-feature runs and `null` in the fleet runs — D-9's carve-out turns on that name, so hardcoding `null` on every root failure must fail here". That last clause states the falsifying implementation, which is the form that survives transcription into a test. |
| F-03 — §6.11 credited EC-21 to AT-20, but AT-20 tested B5's read failure, a different path; the catch-all had no oracle | Medium | **Resolved** | AT-20 gains a second leg over "a fleet in which one feature's directory is readable but computing its metrics fails unexpectedly", asserting the gap row carries a reason, other features report normally, exit 0 — and it states the discrimination in the AT itself: "B5's read failure and EC-21's catch-all are different paths: only this leg fails an implementation whose guard is around the read alone." That is the sentence that stops a TSPEC author collapsing the two legs back into one fixture. One rule-side consequence is left open — F-02 below. |
| F-04 — AT-24's rationale claimed `--dry-run` is "in no command's list"; HEAD contradicts it | Low | **Resolved** | Now reads "`--dry-run`, which `doctor`'s row does not carry" (line 774), which is the claim the argument actually needs. Re-verified at HEAD: `dry-run` sits in the `dev` and `queue` rows and not in `doctor`'s (`pdlc/engine/bin/cli.mjs:169-185`). |
| F-05 — §3.3's C3 promised the JSON error object on paths whose flow rows terminated in place with no route to Flow C | Low | **Resolved** | A2, A3 and B2 now read "the refusal renders through Flow C, exit 1" (lines 137-138, 156). The flow tables now compose into the call graph they describe. |

Five findings, five resolved. None was resolved by wording alone: each one landed a rule change or an
AT conjunct that can fail. The High in particular was fixed at the level it was raised — the enum
grew a value rather than BR-20 growing a second exception — and the document records why at D-10.

## Claim verification at HEAD

Only claims this round's edit introduced or moved.

| Claim in the revision | Verdict | Evidence |
|---|---|---|
| BR-29: exit `2` "is never emitted: the existing CLI reserves it for a pipeline halt (`pdlc/engine/bin/cli.mjs`, exit-code header)" | **Holds** | `pdlc/engine/bin/cli.mjs:20-23` — "Exit codes (REQ AC-1.4 — a halt is not a crash): 0 … 2 the pipeline HALTED (a normal, recorded pdlc outcome) … 1 the engine itself refused or crashed". The cited header exists, at the cited file, and says what the rule says it says. |
| AT-24 (revised): `--dry-run` is a token `doctor`'s row does not carry | **Holds** | `FLAGS_BY_COMMAND`, `pdlc/engine/bin/cli.mjs:168-185`: `dry-run` appears in the `dev` and `queue` rows, not in `doctor`'s. The revised phrasing is now true of HEAD where the previous one was not. |
| §7.3: "Three more bullets follow … the third collecting two wording findings" | **Holds** | Three bullets follow the sentence (REQ-STATS-09, REQ-STATS-07, and the combined REQ-STATS-02 / REQ-STATS-08 bullet); the third does collect two findings. The count word and the list agree, which is the kind of pairing that silently rots when a bullet is added later. |
| D-9's rationale, edited from "BR-30's two `reason` values" to "BR-30's `reason` values" | **Holds** | Necessary consequence of the enum growing to three; the sentence no longer carries a count that would now be wrong. Worth noting because it is the class of stale-count defect this round could easily have shipped. |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **AT-27's new `unreadable_feature` leg asserts two field values but not BR-30's key-set equality — the conjunct both sibling legs carry.** BR-30's contract is that the error object has "exactly three top-level keys — `schemaVersion`, `error`, `feature` — set-equal and no longer". Both other enum values are pinned that way: AT-23 asserts the three-key set equality for `not_found` (that was v2 F-04's fix), and AT-27's root leg asserts "top-level keys exactly `schemaVersion`, `error`, `feature`" for `no_docs_root`. The leg this round added asserts only that stdout "parses as BR-30's error object, `error.reason` exactly `unreadable_feature`, `feature` the supplied name — not empty stdout". "Parses as BR-30's error object" is a reference, not an oracle; a transcriber writes the two field assertions and stops. The failure it lets through is not hypothetical on this path specifically: the unreadable-directory branch is exactly where an implementer wants to attach the offending path (`"path": "docs/{feature}"`) or the underlying errno, and a fourth key emitted on that path alone breaks REQ-STATS-02's set-equality discipline while passing every assertion written. Fix: one clause — the same "top-level keys exactly `schemaVersion`, `error`, `feature`" conjunct, on this leg too. | AT-27, BR-30, AT-23 |
| F-02 | Medium | Local | **AT-20's new EC-21 leg asserts a gap row on a path BR-27 does not authorise: BR-27 is still scoped to "cannot be read".** The round fixed the test side of v3 F-03 and left the rule side. BR-27 opens "A feature whose directory **cannot be read** is reported by name with a reason" (line 477), and §3.2's B5 asks the same read-scoped question. EC-21 is the other path — "an unexpected failure while computing a feature's metrics" over a directory that *is* readable — and it cites BR-27 as its authority for degrading to a gap row. AT-20's second leg now tests that behaviour and is a good falsifying test ("only this leg fails an implementation whose guard is around the read alone"). So the AT and the rule now disagree in the direction that matters least — the test is stronger than the rule — but an implementer reading the rules to decide what to build still finds no rule that says a computation failure produces a gap row, and a TSPEC author reconciling AT-20 against BR-27 has to guess which is authoritative. This is also the divergence a later editor "fixes" by deleting the AT leg as unsupported. Fix: broaden BR-27's subject by one clause — a feature whose directory cannot be read, or whose metrics cannot be computed, is reported by name with a reason — so EC-21's citation resolves to text that covers it. | BR-27, EC-21, AT-20, §3.2 B5 |
| F-03 | Low | Local | **BR-30's opening sentence still enumerates two refusals; its own `reason` enum now has three.** The rule now reads "An unknown feature exits 1 and says so by name; so does a `docs/`-root failure (EC-09)" and then, three sentences later, "`reason` is one of `not_found`, `no_docs_root` and `unreadable_feature`". The enum is the machine contract and it is correct, so nothing is untestable — but the rule's lead sentence is the sentence a reader uses to decide whether their path is in scope, and it omits the path this round added. This is the same stale-enumeration failure mode BR-20 was rewritten to avoid, surviving one paragraph below it. Fix: add the unreadable-feature clause to the lead sentence, or replace the two-item list with a pointer to the enum. | BR-30 |
| F-04 | Low | Local | **AT-27's `--json` unreadable-feature leg asserts stdout only; its stderr diagnostic goes unasserted, unlike every sibling leg.** §3.3's C4 states "Diagnostics go to stderr in **both** modes"; AT-27's human single-feature half asserts stderr "names the feature and the reason"; the root leg asserts a stderr message in all four `--json` runs as well as the human ones. The one leg with no stderr conjunct is the new one. An implementation that emits the JSON error object on stdout and says nothing on stderr in `--json` mode passes AT-27 and violates C4. Fix: carry the same "names the feature and the reason on stderr" conjunct onto the repeated `--json` run. | AT-27, §3.3 C4 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Is EC-21's catch-all intended to produce a gap row *shaped identically* to BR-27's read-failure row (name + reason string, same field), or a row whose reason is distinguishable as "computation failed" rather than "could not read"? AT-20's two legs currently assert the same shape for both, which is a real decision and worth stating in BR-27 rather than leaving to the test. (F-02) |
| Q-02 | On the single-feature `--json` unreadable path, does `error.message` carry the same text as the human-mode stderr message, or are they independently worded? AT-27 asserts the human message names the feature and the reason and asserts the JSON `reason` value, but never the JSON `message` — the same shape AT-23 settled for `not_found`, so this may be a deliberate house rule rather than a gap. |

## Positive Observations

- **The High was fixed at the level it was raised, and the document says why.** The cheap fix was
  available and visible: add EC-11 to BR-20's exception list, two words, no new enum value. D-10
  names that option and rejects it in one sentence — "A second exception would make BR-20's
  guarantee path-by-path again — the rot it was rewritten to prevent." The rule that the finding
  attacked survived because the fix was made to respect its argument rather than to satisfy the
  finding. That is the difference between closing a review item and improving the specification.
- **The eight-run cross product replaced a count with axes.** "Four runs" was ambiguous because a
  reader had to infer which two of three axes were in play. The revision writes
  `{absent, unreadable} × {single, fleet} × {human, --json}` and lets the count fall out. A test
  author now transcribes a parameterised case matrix instead of guessing, and adding a fourth axis
  later changes the count automatically instead of leaving a stale numeral — which is precisely the
  defect D-9's own rationale sentence avoided when it dropped "two `reason` values".
- **Two conjuncts in this round name the implementation they falsify.** "Hardcoding `null` on every
  root failure must fail here" and "only this leg fails an implementation whose guard is around the
  read alone" are both statements of what a *plausible wrong* implementation does. An AT that names
  its falsifier cannot be satisfied by a test that merely runs the path, and it survives the
  transcription into TSPEC that usually erodes intent.
- **AT-14 grew from two of EC-14's three conditions to all three, unprompted.** Neither reviewer
  asked for it. The AT now covers absent, duplicated and unparseable markers and states which one
  carries the risk — "absent is the one a naive implementation reads as `resolved`, the opposite of
  the driver's fail-closed rule". Set-completeness over an enumerated edge case, with the dangerous
  member identified, is the standard this document has been converging on for three rounds.
- **The traceability tables moved with the content.** BR-29 and BR-20 both gained AT-27, §2.1's
  REQ-STATS-09 row carries the root-leg annotation, and §7.3's "three more bullets" matches three
  bullets. Coverage tables that are updated in the same edit as the behaviour are what let the
  previous two rounds' credit-without-oracle findings be found at all.

## Recommendation

**Approved with minor changes**

No open High findings. My one blocking finding from v3 is resolved in the rule rather than in the
exception list, and I checked that the fix did not break what I had already approved: BR-20's
always-but-one guarantee still holds with a closed enum behind it, all three `reason` values are now
pinned by a test (AT-23 for `not_found`, AT-27 for the other two), the three-key set-equality
survives at AT-23 and AT-27's root leg, and the exit-code rule's HEAD citation re-verifies at
`pdlc/engine/bin/cli.mjs:20-23`.

The four findings that remain are all one-clause edits on the surfaces this round touched, and none
of them blocks TSPEC: F-01 and F-04 add a missing conjunct to the new AT-27 leg (key-set equality,
stderr diagnostic), F-02 widens BR-27's subject so EC-21's citation resolves, F-03 refreshes BR-30's
lead sentence against its own enum. They are worth landing before TSPEC transcribes AT-27, because a
missing conjunct at FSPEC altitude becomes a missing assertion in a test file, where it is much
harder to notice.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 2}
