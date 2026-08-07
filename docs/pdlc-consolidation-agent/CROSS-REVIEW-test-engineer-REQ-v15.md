# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md`
**Date:** 2026-08-06
**Iteration:** 15
**Scope:** Local (Scope tags per finding below)
**Delta base:** `6c025bb4` (the tree v14 approved) → HEAD `7c1e0cfb` — erratum round v2.1, three commits

## Delta

This is a **delta confirmation**, not a re-review. I approved this REQ at v14 (and v11–v13 before it);
the document has since taken one bounded erratum round and my only question is whether that round
resolves the four routed items without breaking what the standing approval covered.

`git diff 6c025bb4..HEAD -- docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md` is
**+40/−2 across exactly three hunks** — the header/erratum note, REQ-CONS-01 step 1, and §4b. Nothing
else in the document moved, so every section my v14 approval covered is byte-identical except those
three, and I confine my scan to them.

| Hunk | Location | Nature |
|---|---|---|
| 1 | header table + new erratum note (`:18-23`) | `Version` 2.0 → 2.1; a four-line note naming the three corrections |
| 2 | REQ-CONS-01 step 1 (`:117-140`) | withdraws "keeping one enumeration as well as one predicate"; adds **One predicate, two enumerations** and decides both divergence classes |
| 3 | §4b (`:595-607`) | adds **Unreadable corpus entries add no field** — no `unread:` field, unreadable entry is *not consumed* |

`git diff --stat 6c025bb4..HEAD -- pdlc/` is **empty**: no shipped code moved in the interval, so the
new `file:line` citations the erratum introduces resolve against the same bytes I can print at HEAD.
I printed all three rather than inferring them (Positive Observations).

## Erratum items — disposition

Four items were routed; items 1 and 2 are the same defect raised by two reviewers, so the edit that
closes one closes both. Each is checked against the mechanism it cites, at HEAD, not against the
erratum's prose.

| # | Raised by | Disposition | Where |
|---|---|---|---|
| 1 | te-review | **Resolved** | REQ `:117-131` |
| 2 | se-author | **Resolved** (same defect as 1) | REQ `:117-131` |
| 3 | se-author | **Resolved — answered "yes"** | REQ `:132-137` |
| 4 | se-author | **Resolved — answered "no field"** | REQ `:595-607` |

**Items 1–2 — the undeliverable "one enumeration" claim.** The clause is *withdrawn in terms*, not
softened: "The second half is not deliverable and is **withdrawn**" (`:120-121`). What replaces it is
the weaker claim that is actually true — one predicate held equal **by construction** (both sides run
the same block-scoped basename test), two enumerations held equal **as a stated, testable property**.
That is the right shape for me: a construction-guaranteed equality needs no test and can't drift; a
mechanism-agreement equality needs one, and the REQ now says so explicitly rather than leaving a
downstream test author to discover the divergence at implementation time. The mechanical reason is
cited correctly — `rtListFiles` at `runtime-adapter.js:915` runs
`ls -p -A "${d}" | grep -v '/$'`, one directory, directory entries dropped, and `:929-931` rejects any
returned line containing `/`, so the seam structurally cannot return a nested path. `docs/*/` is
therefore unreachable through `_listFiles`; the git seam is forced. Both citations print at the lines
given.

**Item 3 — is a `.gitignore`d LEARNINGS corpus?** Answered, unambiguously, in the direction se-author
measured: **yes**, and the pass's enumeration therefore drops `--exclude-standard` (`:132-137`). The
answer is decidable and the reason is a testable one rather than a preference — the hook cannot read
`.gitignore`, so the "no" answer produces a nag that never quiesces. I verified the stated price is
the whole price: `git ls-files --cached --others -- ':(glob)docs/*/LEARNINGS-*.md'
':(glob)docs/completed/*/LEARNINGS-*.md'` returns exactly the five files the REQ names at `:104-107`,
with and without the flag; `docs/discarded/*/` (eight directories at HEAD) is excluded by the
pathspec's depth, not by any ignore rule, and the repo's `.gitignore` carries no `docs/` pattern at
all. The claim "closes this class at exactly that price and no other" holds as measured.

**Item 3's second half — the staged-but-deleted class** is closed the other way: an index entry with
no working-tree file is **not** corpus (`:138-140`), on the stated ground that it has no body to read.
The two answers are asymmetric, and the REQ now says which it intends for each — which was the
substance of the item.

**Item 4 — unreadable corpus basenames in the durable log row.** Answered at §4b, which is where §3's
field set is reserved, so it is answered at the layer that owns it: **no `unread:` field**, `§3` stays
at `Version 1.4`, and an unreadable entry is **omitted from the consumed pair** rather than marked
consumed. This is the answer I would have argued for on oracle grounds and the REQ gives the oracle
argument itself: a consumed-but-unread entry can only push AC-5.2 toward `prevented` /
`insufficient-evidence` and never toward `recurred`, i.e. it biases the falsifiability loop in exactly
one direction — the direction that makes REQ-CONS-05 unfalsifiable. Omission keeps the basename in the
un-consolidated set both the hook and the next tick compute, so the condition stays observable to a
test without a new field, a new reason code or a vocabulary row. Holding `§3` at `1.4` also preserves
the fixed expected value the set-equality oracle at `:592-593` gives a downstream test to transcribe;
had the erratum added a field, that pin would have moved and every downstream transcription with it.

**Nothing previously approved is broken.** The three hunks add text and delete one clause; they
introduce no new vocabulary row, no new reason code, no new AC id and no change to any enumeration the
§4b oracle ranges over. The §4b addition explicitly holds the `Version 1.4` pin, and the step-1
addition changes no predicate — only the claim made *about* the enumerations. I re-checked the three
`file:line` claims my v14 approval leaned on (`orchestrate-dev.js:1669`, `:1833`, `:1859`) and they
still print; the empty `pdlc/` diff makes that structural.

## Findings

One new finding, all three carried findings re-checked at HEAD (ids are never renumbered). The
carried two that are about `docs/_constraints/` are unchanged because `git diff 6c025bb4..HEAD --
docs/_constraints/` is empty; F-56's *measurement* did change and its text is updated accordingly.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-57 | Low | Local | **New, introduced by the item-4 decision.** "Not consumed, retried next pass" is the right answer for evidence integrity, but it makes an unreadable on-disk LEARNINGS a *permanent* member of the un-consolidated set. Below `volumeThreshold` that is harmless — the cadence test bounds re-attempts to one per `cadenceHours`. At or above it the volume test fires on **every** tick, so `k >= volumeThreshold` permanently-unreadable files schedule a pass per tick that can consume none of them: a non-quiescing loop the REQ does not name. The retry is still correct; what is missing is one sentence saying whether an unreadable basename counts toward the volume test. Either answer is fine (excluding it from the *count* while keeping it in the *set* closes it); the REQ should pick one, because a PROPERTIES author cannot write the termination property without it. | REQ §4b (`:604-607`), REQ-CONS-01 step 2 (`:141-142`) |
| F-54 | Low | Cross-Feature | **Open — unchanged.** `pdlc-advisory-corpus-baseline.md:7` still reads `1.0 · 2026-08-06` while the clause making an unbumped content change a defect is still at `:19`; the REQ still pins the unbumped `1.0` (now at `:226`, `:472`, and the honest-limit line). No baseline file moved this round, so the finding is exactly as v14 left it. Fix unchanged: bump to `1.1`, repin. | `docs/_constraints/pdlc-advisory-corpus-baseline.md:7`, `:19`; REQ `:226`, `:472` |
| F-55 | Low | Local | **Open — unchanged.** §4b's ownership sentence still spans both governed files while the classification sentence names neither (`:589-593`); still decidable only through the `Version 1.4` pin (`pdlc-consolidation-vocabularies.md:7` carries `1.4`, the baseline `:7` carries `1.0`). The erratum's §4b addition sits *below* that sentence and re-uses the same `1.4` pin, so it neither worsens nor fixes it. | REQ §4b (`:589-593`) |
| F-56 | Low | Process | **Open — measurement changed, and the hard ceiling is now crossed.** `wc -l -c` at HEAD: **674 lines / 64,397 bytes**, against `LINE_LIMIT=700` / `BYTE_LIMIT=61440` (`pdlc/hooks/scripts/check-req-size.sh:41-42`). The erratum added ~3,288 bytes to a 331-byte margin, so the REQ is now **2,957 bytes over** the byte ceiling (lines remain inside). Severity is unchanged because enforcement is unchanged: `check-req-size.sh` emits a `PostToolUse` `additionalContext` line and `exit 0` on every path — it cannot fail a build or halt the pipeline. Recorded so that whoever lands F-54/F-55 knows the budget is no longer a place to spend. The cheapest recovery is relocating REQ-CONS-01 step 1's now-lengthy justification prose into the governed vocabularies file, which the REQ already cites by version. | Whole document; `pdlc/hooks/scripts/check-req-size.sh:41-42` |

**Why F-57 is Low and not Medium.** Applying `DEC-SEV-01`'s test — does this leave a downstream author
unable to make a decision today? — the answer is no. A TSPEC or PROPERTIES author can write every
oracle the erratum enables (consumed-pair omission, retry on the next pass, the two-enumeration
agreement property) without knowing the volume-count answer; only the *termination* property for the
pathological case needs it, and that case requires `>= volumeThreshold` simultaneously unreadable
on-disk files, which no reachable state at HEAD produces (all five corpus files read fine). It is also
strictly an addition to the erratum's decision, not a defect in it: the direction chosen is the one
that protects AC-5.2's falsifiability, and reversing it would reintroduce the defect item 4 named. I
am not willing to re-open a bounded erratum round over a sentence that can land with F-55.

**No finding is raised against the withdrawal itself.** Withdrawing an undeliverable claim is the
correct disposition of items 1–2, and replacing "guaranteed" with "stated, testable property" moves
work to my layer honestly rather than hiding it. I would have raised a finding had the erratum
retained the claim with softened wording; it does not.

## Questions

| ID | Question |
|---|---|
| Q-02 | Non-blocking, for the PROPERTIES layer rather than for this REQ. The erratum converts an equality that was claimed as structural into one that must be *observed*: hook enumeration ≡ pass enumeration over the two globs. The natural oracle is a property test that generates a docs tree (tracked / untracked / `.gitignore`d / staged-but-deleted / nested-deeper / `docs/discarded/`) and asserts the two enumerations return the same basename set. Both mechanisms are pure functions of the tree, so this parameterises cleanly and should not be example-based. Should PROPERTIES carry it as a property with those five generators named, rather than as a handful of examples? I raise it as a question and not a finding because it is a PROPERTIES obligation the REQ correctly hands over, not something the REQ owes. |

## Positive Observations

- **The withdrawal is a withdrawal, not a hedge.** `:120-121` says the claim "is not deliverable and is
  **withdrawn**", names what replaces it, and separates the half that survives by construction from the
  half that becomes a test obligation. Specs usually resolve this class of finding by weakening the
  adjectives; this one deleted the claim and paid for the replacement.
- **Every new citation prints at the line given.** `nudge-consolidation.sh:28` is
  `learnings = glob.glob(os.path.join(proj, "docs", "*", "LEARNINGS-*.md"))`;
  `runtime-adapter.js:915` is the `ls -p -A "${d}" | grep -v '/$'` line, one directory, directory
  entries dropped; `:929-931` is the `!/[\/\s]/` rejection that makes a nested path structurally
  unreturnable. I ran all three rather than trusting the erratum, and `git diff --stat 6c025bb4..HEAD
  -- pdlc/` being empty means none can have drifted since.
- **The item-3 price claim is measured, and I re-measured it.** With and without `--exclude-standard`
  the pathspec enumeration returns the same five basenames at HEAD; the repo `.gitignore` contains no
  `docs/` pattern; the eight `docs/discarded/*/` directories are excluded by the glob's depth. So
  "closes this class at exactly that price and no other" is a true statement about this tree, not an
  assertion about intent.
- **Item 4 is answered with an oracle argument, in the layer that owns the field set.** The reason
  given for refusing `unread:` is that a consumed-but-unread entry biases AC-5.2 in one direction only
  — toward `prevented` / `insufficient-evidence`, never `recurred`. That is precisely the
  one-directional-bias failure that makes a falsifiability loop unfalsifiable, and it is the argument I
  would have had to make had the erratum chosen the other answer. Answering it at §4b also keeps the
  `Version 1.4` pin fixed, so no downstream transcription moves.
- **The erratum stayed inside its envelope.** Three hunks, +40/−2, no new AC id, no new vocabulary row,
  no new reason code, no enumeration inside the §4b oracle's range touched. A bounded erratum round
  that edits only what it was routed is the mechanism working; I checked the diff for scope creep
  specifically and found none.

## Recommendation

## Verdict
