# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md`
**Date:** 2026-08-06
**Iteration:** 8
**Scope:** Local (Scope tags per finding below)
**Delta base:** `5c00a31` (the tree v7 reviewed) → HEAD `980fde0`

Delta re-review. v7's findings F-42…F-44 are dispositioned in §Prior findings; new findings are
numbered F-45 onward so ids never collide across rounds. Only the nine commits that touched the REQ
since `5c00a31` were read for new issues; unchanged sections approved in v1–v7 were not revisited.

## Prior findings

All three v7 findings are dispositioned below. Each was checked against the code or the measurement
the revision cites, not against its prose.

| v7 ID | Sev | Disposition | Evidence |
|---|---|---|---|
| F-42 | Low | **Resolved, on the stronger of the two options** | AC-5.1 narrows the keying input rather than downgrading the claim: `artifact` is now "**exactly one canonical repository path, never a glob and never a directory**: the single file the edit touches, path-normalised (repository-root-relative, no `./`, no symlink alias)" (`:369-370`). The justifying paragraph is rewritten to argue the direction I said it did not cover — "The glob form is forbidden for the same reason in the other direction: passes free to name `pdlc/workflows/orchestrate-dev.js`, `pdlc/workflows/*.js` or `pdlc/workflows/` for one mode would slug three ways and NFR-4 would miss. One canonical path closes the **split** direction as `phase` closes the **merge** direction" (`:377-379`), which is my finding's text taken as the argument rather than paraphrased around. The overclaim at the old `:371-372` is now earned: with the input normalised, "a later pass re-deriving the same failure mode yields the same id" is a property a test can falsify by feeding two passes different spellings of one path and asserting one id. The accepted residual (two modes in one phase touching one file merge) is stated *and* given a deferral row, D-CONS-08 (`:683`), so the cost is tracked rather than absorbed. |
| F-43 | Low | **Resolved** | AC-3.4 replaces "written back into" with the append-shaped reading and names which one: the URL "is **not** an in-place edit of an earlier record — that shape is forbidden (AC-1.3): it is the `pr:` field of the pass's single terminal row, appended once (AC-7.2). 'Exactly one report' there counts reports, and the log gains exactly one row per pass on this path" (`:355-357`). Both halves of the ambiguity are closed — the record count is decidable (one) and AC-7.2's counting unit is stated. AC-7.2 was tightened in the same revision beyond what I asked: the `pr:` field is now a scoped biconditional ("the URL of a PR **this pass opened**, when and only when this pass opened one", `:507-509`) with the all-suppressed `no-op` case routed to a distinct `suppressed-by:` field, and §4b gained a row for each (`:605-606`). That makes a fixture that suppresses one duplicate and opens no PR assertable on both fields instead of on one overloaded one. |
| F-44 | Low/Process | **Regressed — the ceiling is now breached; refiled as F-46 at Medium** | The margin I recorded at v7 (37 lines / 69 bytes) was spent and overspent. At HEAD the REQ is **683 lines / 65,492 bytes** against `LINE_LIMIT=700` / `BYTE_LIMIT=61440` (`pdlc/hooks/scripts/check-req-size.sh:41-42`) — 4,052 bytes **over** the hard ceiling, not near it. This is no longer the trend finding I carried for two rounds as `Process` signal; it is a measurable violation of a shipped, mechanical limit, so it is refiled at Medium in §Findings rather than renewed at Low. |

## Findings

Two Mediums and one Low, all on material this round introduced. Neither Medium contests a claim
about code at HEAD — every `file:line` in the changed text resolves (see §Positive Observations).
F-45 is a reachability hole the new `action` key opened one step further out than it closed; F-46 is
a measurement.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-45 | Medium | Local | **The new `(failure-mode-id, action)` key fixes suppression of the *first* remediation and leaves the *second* unreachable: a merged `revise` PR bars every later `revise` for that id forever, so AC-5.3's mandated proposal has no stated outcome when a revision itself proves ineffective.** NFR-4 keys suppression on the pair and states the win it buys — "with `action` in the key it suppresses only a re-`promote`, never a remediation" (`:539`) — and AC-5.1 states the consequence as a closed claim: a merged `promote` "bars a second `promote` for that `(phase, artifact)` pair forever and bars **nothing else**" (`:392-393`). Both sentences are true and both are about the `promote` member only. Follow the pair key one cycle further, on a path AC-5.3 makes ordinary: promotion P is `recurred` twice, is flagged `ineffective`, and the pass proposes a `revise` whose PR the operator merges. The revision does not work; P is `recurred` twice again and is flagged `ineffective` again (AC-5.3 attaches no once-only qualifier, and `retire`/`revise` mint no new id — AC-5.4 `:447-449`, so the id is unchanged). AC-5.3 now requires the pass to "propose either a revision or a retirement". If it chooses revision, the pair `(P, revise)` **is already on a merged PR**, so NFR-4's suppression rule applies verbatim — "a pass whose proposal's pair is already on a PR in state **open or merged** opens nothing for it, records `duplicate-suppressed`" (`:534-535`) — and the pass proposes nothing while reporting `duplicate-suppressed`. The testing consequence is that the two ACs cannot both be satisfied by one implementation and no oracle can be written for the state: a test author building the second-ineffective-cycle fixture has two defensible expected outcomes (an AC-5.3 proposal, or an NFR-4 suppression) and the REQ chooses neither. This is exactly the defect class the `action` discriminator was added to remove (`:531-533`: keying on the id alone would make "the remediation of an `ineffective` promotion unreachable and the §1 `Unfalsifiability` problem unsolved") — it is not removed, only pushed one iteration downstream, where the §1 problem recurs identically. One clause settles it, and there are three honest shapes: (a) suppression is scoped to `promote` only, remediations never suppressed (simplest, and matches AC-5.4's existing spirit); (b) the key gains a third member that distinguishes remediation *rounds*; or (c) revision is once-only by decision, with AC-5.3's alternative set narrowing to `retirement` after a merged `revise` and the report saying so. Any of the three yields a decidable oracle; the current text yields none. | AC-5.3, AC-5.4, AC-5.1 ("Action, and what it discriminates"), NFR-4 |
| F-46 | Medium | Local | **The REQ is now over the hard size ceiling that `check-req-size.sh` measures and that pm-author requires at every commit: 683 lines / 65,492 bytes against 700 / 61,440 — 4,052 bytes over.** Measured at HEAD `980fde0` (`wc -l -c`), against `LINE_LIMIT=700` and `BYTE_LIMIT=61440` (`pdlc/hooks/scripts/check-req-size.sh:41-42`); the file also sits past both soft thresholds (`SOFT_LINE_LIMIT=630`, `SOFT_BYTE_LIMIT=55296`, `:47-48`). This is a breach of a written obligation, not a style preference: `pdlc/skills/pm-author/SKILL.md:193` requires that the document stay "**under the hard ceiling (700 lines / 60 KB) at every commit**", and rule 5e (`:118`) requires that, once within 5 % of either limit at the start of a review round, content is relocated to `docs/_constraints/` "**before** addressing that round's findings — never after, and never as per-round byte scavenging inside the fix", explicitly because "proximity to the ceiling is a structural decision that **blocks the round**". At the start of this round the document was 69 bytes from the ceiling — inside 5 % by a wide margin — so relocation was due before any of the nine commits landed, and instead the round added ~4.1 KB of new rationale (`action` discriminator, `suppressed-by:`, `.gitignore` justification, D-CONS-08) on top. I have carried this as `Process`/Low for three consecutive rounds on the argument that the margin held and the compression cost nothing checkable; that argument is now spent, because the margin does not hold. Note this is genuinely non-blocking *mechanically* — the hook is advisory (`exit 0` on both paths, `check-req-size.sh:74-75`), which is precisely why a reviewer has to be the one to hold it. The fix is the one the standard names and does not require deleting a reason: relocate the §4b vocabulary tables and the phase catalogue — the largest self-contained, cross-feature-reusable block in the document, and already the shape `docs/_constraints/` exists for — leaving a citation in their place. | Whole document; §4b; `pdlc/hooks/scripts/check-req-size.sh:41-42`, `:47-48`; `pdlc/skills/pm-author/SKILL.md:118`, `:193` |
| F-47 | Low | Local | **AC-5.1's one-path `artifact` rule leaves the split direction unstated for a promotion whose edit spans two files, so the expected id *count* for that fixture is unspecified.** The new text states the merge direction explicitly — "Two distinct failure modes in one `phase` touching one file therefore merge into one promotion" (`:386-387`) — and defines `artifact` as "the single file the edit touches" (`:370`), which presupposes rather than states that a proposal is one-file. The converse case is ordinary in this repo: one recurring failure mode whose remedy is a matching clause in both `se-review/SKILL.md` and `te-review/SKILL.md` is one lesson and two files. Under AC-5.1 that must become two `failure-mode-id`s, two AC-3.3 commits and two AC-5.2 rows tracked independently — which is a defensible design, and is derivable from "the single file the edit touches" plus AC-3.3's per-edit commit, but is nowhere asserted. It matters for oracles because AC-5.2's set-equality obligation ("exactly one row per distinct `failure-mode-id`", `:427-431`) is only decidable once the id count of a multi-file promotion is fixed, and because AC-5.3's streak then advances per file rather than per lesson. Filed Low, not Medium, because the reading is derivable and a test author will land on it; what is missing is one clause making it explicit — e.g. "a remedy spanning two files is two proposals, one per `artifact`". | AC-5.1 ("Uniqueness, scoped"), AC-3.3, AC-5.2 |

## Questions

No open questions. Neither Medium is a clarification: F-45 is a choice between three stated shapes
that the REQ must make rather than explain, and F-46 is a measurement with a named remedy.

## Positive Observations

- **F-42 was closed by narrowing the requirement, not the promise.** The round could have downgraded
  `:371-372`'s "true rather than hoped for" — I offered that as the cheaper of two options — and
  instead constrained `artifact` to one canonical path and rewrote the justification to carry the
  split-direction argument (`:377-379`). That is the third consecutive round in which the weaker
  escape hatch was available and declined. The resulting NFR-4 oracle is now fully transcribable:
  two passes, same `phase`, differently-spelled paths normalising to one, different `symptom` text,
  assert one id and `duplicate-suppressed`.
- **The residual F-42 cost was given a deferral row rather than a sentence.** D-CONS-08 (`:683`)
  names the finer key, its reason ("a finer key needs a stable sub-file location identity LEARNINGS
  does not carry today") and its vehicle (`pdlc-engineering-loop`). An accepted cost with a row is a
  decision; an accepted cost in a clause is a hope.
- **AC-7.2's `pr:` field became a scoped biconditional with a second field beside it.** "The URL of
  a PR **this pass opened**, when and only when this pass opened one … an all-suppressed `no-op`
  leaves `pr:` empty and carries its evidence in the distinct `suppressed-by:` field instead … the
  two fields are never merged and a row may carry both" (`:507-510`). Both new fields got §4b rows
  (`:605-606`) with permitted-status sets consistent with the existing `duplicate-suppressed` reason
  code, so the enumerated-vocabulary set-equality check still closes over the full table. This
  removes an oracle overload I had not filed: under the old wording, the all-suppressed `no-op` and
  the opened-a-PR case were distinguishable only by a URL's presence.
- **The `.gitignore` claim is grounded and I re-verified it exhaustively rather than by grep.** AC-1.3
  (`:170-174`) asserts the repository `.gitignore` "today carries no pattern matching it (verified at
  HEAD: `.tokensave/`, `.claude/settings.local.json`, `.claude/.headroom_wrap_marker.json`,
  `node_modules/`, `/.claude/workflows/`)". Read whole: those are exactly the five patterns, in that
  order, and none matches `docs/_decisions/.consolidation-lock`. The stated consequence of omitting
  the entry — "a committed lock reaches every fresh clone and refuses every pass with
  `consolidation-in-progress` until `staleLockMinutes` elapses, per clone" — follows from AC-1.3's
  own reclaim rule, and the entry was added to §5 In-scope in the same revision (`:633-634`) rather
  than left as an implied task. That is a testable first-run assertion.
- **The compressed AC-1.5 citations all still resolve after the round's rewrites.** `MODEL_ADVISORY`
  at `orchestrate-dev.js:1652` and `MODEL_ADVISORY_FALLBACK` at `:1653`; `resolveAdvisoryRung`
  exported at `:1833`; the doc comment at `:1800` reads "TSPEC §3.4's model-rung ladder, and the
  **one** ladder the tier ships", so the REQ's shortened quotation is a faithful substring, not a
  reconstruction; and the second-consumer claim holds at `orchestrate-queue.js:1245-1256`, where
  `runAdvisorySeamFn` is called with a threaded `rungState` and an injected `_agent`/`_appendFile`
  rather than copied literals. The compression this round removed sentences, not checkable facts —
  which is the same verdict I reached in v7, and is why F-46 is filed against the *budget*, not
  against what compression cost.
- **The REQ-CONS-01 exempt-record clause was tightened where the round made it weaker.** Adding the
  held marker's `passId` and ISO-8601 timestamp to the `refused` row could have broken the
  "no field is ever a basename" property the legacy-region predicate depends on; instead the clause
  states the property positively and discharges it for the new fields — "A passId is
  `{YYYY-MM-DD}-{n}` and a timestamp is neither a `LEARNINGS-*.md` basename" (`:106-110`). The
  invariant travelled with the field set instead of being left behind by it.

## Recommendation

**Needs revision** — 0 High, 2 Medium, 1 Low.

Both v7 Lows that were about the document's content are resolved, and resolved on the mechanism:
F-42 narrowed `artifact` to one canonical path and rewrote the justification to carry the
split-direction argument, and F-43's PR-URL write is now the `pr:` field of a single appended
terminal row. I want to be explicit that neither Medium is a re-litigation of settled ground: F-45
is a consequence of text this round introduced, and F-46 is a threshold this round crossed. Nothing
in §§1–4a, REQ-CONS-02, REQ-CONS-04, REQ-CONS-06 or NFR-1/2/3/3a/5/6 is contested.

What must change, in order:

1. **F-45 (Medium)** — Decide what happens when a promotion whose merged `revise` PR exists is
   flagged `ineffective` again. Three shapes are honest: scope NFR-4 suppression to `promote` only;
   add a remediation-round member to the key; or make revision once-only, narrowing AC-5.3's
   alternative set to `retirement` thereafter and reporting that. Any one of them is a clause, and
   any one of them makes the second-cycle fixture assertable. As written, AC-5.3 requires a proposal
   the NFR-4 rule suppresses, and a test author has two defensible expected outcomes.
2. **F-46 (Medium)** — Bring the document back under 700 lines / 61,440 bytes. It is 683 / 65,492 at
   HEAD. Per `pm-author/SKILL.md:118` this was due *before* this round's findings were addressed, so
   it should precede the F-45 clause rather than follow it — and per that same rule the remedy is
   relocation, not another compression pass: §4b's vocabulary tables and the 13-member phase
   catalogue are the natural block for `docs/_constraints/`, are cross-feature by nature, and would
   leave a citation behind. Compressing rationale a fifth time would fund one more round and breach
   again on the next.
3. **F-47 (Low)** — One clause fixing the id count for a remedy that spans two files.

I considered approving with minor changes and holding F-45 as a Low routed to FSPEC. I decided
against it on the ground the Challenger bar makes explicit: the gap is not a derivation rule FSPEC
can state within the REQ's envelope, it is two ACs of this document that cannot both hold in a
reachable state, and the state is the one §1 names as the problem the feature exists to solve. That
is a requirement-level contradiction, not a downstream mechanic.

No upstream defects were found. Every citation in the changed text resolves to a real authority
saying what the REQ attributes to it — `.gitignore` read whole, `orchestrate-dev.js:1652`/`:1653`/
`:1800`/`:1833`, `orchestrate-queue.js:1245-1256`, `check-req-size.sh:41-42`/`:47-48`,
`pm-author/SKILL.md:118`/`:193`. No ERRATUM lines are emitted.

## Verdict

VERDICT: Needs revision
