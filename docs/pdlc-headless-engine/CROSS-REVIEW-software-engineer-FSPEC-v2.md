# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-headless-engine/FSPEC-pdlc-headless-engine.md` (v1.1)
**Date:** 2026-08-11
**Iteration:** 2
**Scope:** delta re-review of v1.0 → v1.1 — my own v1 findings, plus new issues in changed
sections only

## Delta scope

Diffed `6129a1a6..HEAD` on the FSPEC (281 insertions, 76 deletions). Every v1 finding of mine
is checked below; unchanged sections were not re-litigated. New-issue scanning was confined to
the changed hunks, and every code citation added in v1.1 was re-verified at HEAD.

## Prior findings

| v1 ID | Severity | Status | Evidence in v1.1 |
|---|---|---|---|
| F-01 | High | **Resolved** | BR-PARITY-5 (§10.2) names the vacuity directly and requires a double that *replays each dispatch's file writes from its fixture*; AT-ENG-45 now asserts, as its first obligation, that a write-less double **fails** the test. That is the anti-vacuity oracle I asked for. (One clause of BR-PARITY-5's premise is factually off — F-13 below — but the operative instruction is right.) |
| F-02 | High | **Resolved** | §3.2 states plainly that **no transport selector ships**, the report carries a `transport` field (§12.2), §16.2's "both transports or neither" is re-scoped to a *test-level* obligation over recorded fixtures, and AT-ENG-X3 (§18.2) now says no live fallback run is implied. The per-transport obligations are now falsifiable as written. |
| F-03 | High | **Resolved** | BR-REP-0 (§12.1): one JSON line, always the last line of stdout, no file written, and a refusal still emits it. EC-REP-1 and AT-ENG-68 give it an oracle, and §14.1 traces AC-4.5 to §12.1 as well. (Minor citation drift, F-15.) |
| F-04 | Medium | **Resolved** | BR-START-1 now carries the exception in the rule: rungs 0–4 and a dispatching-path rung 5 are fatal; rung 5 under `--dry-run` is reported and non-fatal. §4.2/EC-START-4 no longer contradict it. |
| F-05 | Medium | **Resolved** | Rung 0 exists (§4.1) and BR-START-0 states what `doctor` can and cannot run of it — the REQ-path half is reported *not applicable*, never as passing. EC-CLI-3 and EC-DISP-5 both re-point at rung 0, and §15.1 gains step 1a. |
| F-06 | Medium | **Resolved** | §5.3's sets are literal: `{"none"}` and `{"none","user","project","org","temporary"}`, matching the shipped policy exactly (`pdlc/engine/bin/pdlc.mjs:93`, `:201-203` — verified). The fallback's inheritance of the same sets is stated in the fail-closed direction. |
| F-07 | Medium | **Resolved** | `--max-iterations` and `--dry-run-skill` both have rows in §3.2, with correct HEAD citations (`bin/pdlc.mjs:83` VALUE_FLAGS, `:303`, `:306-307`; `:172`, `:189-191` — verified). BR-SKILL-6 additionally fixes how §6.4's every-member assertion is reached over a one-at-a-time surface. |
| F-08 | Medium | **Resolved** | BR-FAIL-3: an engine-fatal stop writes no POSTMORTEM, commits no `halted` row, leaves the queue row untouched, and emits only the report; AT-ENG-67 asserts it, and §15.2's residue row is updated. |
| F-09 | Medium | **Resolved** | EC-GUARD-4 now states the operator's move — the refusal names the missing capability, names the fallback, and says selecting it is not yet available. BR-GUARD-5 and the widened O-2 go further than I asked: they make "does any PreToolUse guard fire under `bypassPermissions` at all" the first thing O-2 must measure, which is the right ordering. |
| F-10 | Low | **Resolved** | §14.2 gains a G-2 row and an explicit NG-2…NG-5 row whose honouring is "the absence of a section", checkable against §3.1's command set. |
| F-11 | Low | **Resolved** | Raised as erratum O-ENG-5 rather than absorbed — the right routing. |
| F-12 | Low | **Resolved** | §12.2's three FSPEC-added rows are marked, with the six AC-4.5 rows left unmarked and a sentence saying so. |

All three v1 Highs are resolved, and I found no regression introduced by the revision: the
literal tables I checked cell-by-cell in v1 (§5.1's six auth rows, §8.2's eight retry sequences)
are byte-unchanged, and no previously-approved section lost content.

## Findings

New findings only; all are in text v1.1 added. None is High.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-13 | Medium | Local | **BR-PARITY-5's premise mis-attributes the approval anchors, and a double that follows it makes clause 3 vacuous.** The rule says every artifact clauses 1–3 observe — "`CROSS-REVIEW-*` files, their `VERDICT:` lines, **the approval anchors**" — is "written by the *dispatched agent's* tool calls, never by the modules". The anchors are written by the module: `orchestrate-dev.js:6190` appends `\nAPPROVAL-HASH: {hash}\nREVIEWED-COMMIT: {commit}\n` through `_appendFile`, guarded by the pre-count at `:6113-6190` (ambiguous or mismatched existing anchors yield no approval). The rule's *operative* instruction is still correct — it tells the double to write the cross-review file the prompt names with the fixture's verdict line and counts object, and says nothing about anchors — so the fix is one clause, not a redesign. But a test author reading the premise will have the double write anchors too, and then clause 3 asserts the fixture's own bytes rather than the module's append logic: a self-fulfilling oracle of exactly the kind BR-PARITY-5 exists to prevent. Fix: attribute the anchors to the module (cite `:6190`), and state that the double must **not** write them, so clause 3 observes a module-produced artifact. | §10.2 BR-PARITY-5, clause 3 |
| F-14 | Medium | Local | **§3.2's new closed-flag-surface rule has no edge case and no test.** "This table is the closed flag surface: a flag outside it is a usage error, and a flag the engine ships is a row here or a defect" is a new operator-visible obligation, but §3.4 has no row for an unrecognised flag (EC-CLI-1 is unrecognised *command*, EC-CLI-5 is a value flag with no value) and §3.5 no test (AT-ENG-01 covers the command set only). It is also red at HEAD in a way nothing records: an unknown `--flag` is silently dropped — `positionals()` skips any token starting with `--` (`pdlc/engine/bin/pdlc.mjs:63-75`), `readFlag` returns `null` and `hasFlag` returns false, so `pdlc dev REQ.md --dry-runn` runs live. That is precisely the unattended typo the three grammar rules exist to catch. Fix: add EC-CLI-7 (unknown flag → usage error, exit `1`, nothing resolved), extend AT-ENG-05's list, and note the HEAD state as §2 does elsewhere. | §3.2, §3.4, §3.5 |
| F-15 | Low | Local | **BR-REP-0's HEAD citation is off by a few lines in both halves.** The one-line/last-line convention is documented at `pdlc/engine/bin/pdlc.mjs:208-215`; `:215-221` is the tail of that comment plus the *exit-code* convention. The emission is `console.log(JSON.stringify(stamped))` at `:235` (preceded by a blank line at `:234`); `:236-237` are the exit-code returns (`if (!report) return 1;` / `outcome === "halted" \|\| "blocked"` → `2`). Both cited spans are adjacent to, not on, the claim. Every other new citation I checked lands exactly (`:41`, `:83`, `:93`, `:172`, `:189-191`, `:201-203`, `:303`, `:306-307`, `:332`, `:335`; `transport.mjs:89`, `:159`, `:168`, `:170-175`; `adapter.mjs:58-59`, `:75-93`; `startup.mjs:20`, `:102`; `orchestrate-dev.js:48-53`), so this is a slip, not a pattern. | §12.1 BR-REP-0 |
| F-16 | Low | Local | **BR-EXIT-3's illustration includes an unreachable case.** "an engine refusal in *any* iteration is the loop's exit code even if a **later** or earlier iteration halted" — no later iteration exists, because BR-LOOP-4 stops the loop on an engine refusal. The reachable form is the one the rule already gives next (iteration 1 halts, iteration 2 refuses → `1`), so the total order is fine and AT-ENG-56 is derivable; the words just promise a fixture nobody can build. Drop "later or", or say explicitly that the refusal is always the last iteration. | §3.3 BR-EXIT-3, §11.2 BR-LOOP-4 |
| F-17 | Low | Local | **EC-REP-1 is red at HEAD and BR-REP-0's "matches the shipped convention" hides it.** The convention matches for the completed-run path, but a startup refusal never reaches `emitReport`: `cmdDev` prints the ladder and reason to stderr and returns (`pdlc/engine/bin/pdlc.mjs:252-258`), as does `cmdQueue` (`:280-287`), so today a refusal emits **no** report line at all. §2 tracks red/green per AC and AC-4.5 is listed green except its auth clause, so a test author has no signal that AT-ENG-68's refusal half starts red. One clause on EC-REP-1 ("red at HEAD: the refusal path returns before the report is stamped") closes it. | §12.1 BR-REP-0, EC-REP-1, §2 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | All four of my v1 questions are answered in v1.1 (BR-START-4's union-over-commands answer to Q-01/Q-02, EC-RUN-1's rewrite to Q-03, §12.2's effective-tunables row plus O-3 to Q-04), so this is the only one left. BR-MSG-1's "ids emitted accumulate across the whole suite, and at the end of the run the accumulated set is compared to the registered set" is a whole-suite invariant, not a per-test one. Under a parallel or sharded runner, no single process sees every id. Is the check declared to run in one process (a serial suite, or a final aggregation step), or is that a TSPEC concern? I raise it as a question rather than a finding because either answer is cheap here and expensive after the harness is built. |

## Positive Observations

- The revision addressed all three Highs at the level they were raised — mechanism, not
  reassurance. BR-PARITY-5 in particular does the hard thing: it names the vacuity, then makes
  *detecting* the vacuity AT-ENG-45's first assertion, which is the only way an anti-vacuity
  clause survives contact with an implementer in a hurry.
- BR-RETRY-3's pause table is now the most transcribable rule in the document, and it matches
  HEAD exactly, including the detail most specs get wrong: jitter is added **after** the cap
  (`adapter.mjs:92-93` — `waitMs = Math.min(waitMs, capMs); return waitMs + jitterFn(jitterMs)`),
  which is precisely what the parenthetical "a floor-of-the-capped-case, not a ceiling the jitter
  breaches" says. The retry-after / resetsAt / exponential ladder matches `:81-91`, including the
  seconds-vs-ms normalisation.
- BR-AUTH-0 converts the vaguest phrase in the REQ ("logged-in Claude Code settings state") into
  one inspectable path and one record name, backed by a new measured fact (M-ENG-08,
  `docs/_constraints/pdlc-engine-baseline.md:132-146`), and then makes every row of §5.1
  fixturable by pointing `HOME` at a scratch directory. Row 5's two named recourses turn a
  refusal into an action.
- BR-READ-1's new paragraph is a model of how to state a negative precisely: the module *names*
  `.claude/workflows/` in the Phase-MERGE guard prefix list and never opens it — verified,
  `orchestrate-dev.js:48-53` is a frozen array of four path prefixes compared against a PR's
  changed files. Saying so pre-empts a source-grep reading of clause (c) that would fail a
  correct engine.
- BR-FAIL-1's provocation corpus and BR-MSG-1's emission seam give the two remaining
  set-equalities the same shape as §7.3's model map: both directions observable, neither left to
  a reviewer reading the source. §18.3 now says that in one line, which makes the property
  auditable across the document rather than section by section.
- BR-PERM-2 is a finding the document raised on itself: `bypassPermissions` is what the shipped
  transport sets (`transport.mjs:89`, `:170-175`), so asserting the guard under a stricter
  test-only posture would prove nothing. Coupling that to O-2 is the safety-relevant call in
  this round.

## Recommendation

**Approved with minor changes**

Every High from v1 is resolved with a mechanism rather than a promise, and the revision broke
nothing I had previously approved. The five findings here are one clause each: F-13 re-attributes
the approval anchors to the module so clause 3 of the parity oracle stays non-vacuous, F-14 gives
the new closed-flag rule an edge case and a test, and F-15…F-17 are citation and reachability
hygiene. None blocks TSPEC.

One upstream defect is emitted as an erratum rather than folded in here: **M-ENG-08**'s
per-platform paragraph (`docs/_constraints/pdlc-engine-baseline.md:144-146`) says a host whose
login evidence is unreadable is `auth.unknown` "never a refusal", and cites FSPEC §5.1 BR-AUTH-0
as agreeing. It does not agree, and should not: with `ANTHROPIC_API_KEY` present and no
observable credential, AC-2.1's ordered first-match list lands on **row 5** and refuses. The
FSPEC is right and the measured fact is over-broad by one clause.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 3}
