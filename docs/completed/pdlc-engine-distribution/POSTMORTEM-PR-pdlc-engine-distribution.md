# POSTMORTEM — Phase PR — pdlc-engine-distribution

| Field | Value |
|---|---|
| Upstream | `REQ` → `FSPEC` → `TSPEC` → `PLAN` → `PROPERTIES` → **POSTMORTEM-PR** |
| Downstream | operator decision; `LEARNINGS-pdlc-engine-distribution.md` at harvest |
| Cross-Reviews | `CROSS-REVIEW-{product-manager,software-engineer}-PROPERTIES-v{1,2}.md`; `CROSS-REVIEW-{software-engineer,test-engineer}-FSPEC-v6.md` (the erratum delta confirmation) |
| LEARNINGS | `docs/pdlc-engine-distribution/LEARNINGS-pdlc-engine-distribution.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | halted | Claude (te-author) | 1.0 | 2026-08-14 |

RESOLVED: yes

*Cleared 2026-08-14 by `8980ffe7`. Steps 1–3 of the Recommendation are on
`feat-pdlc-engine-distribution`, each cited site read before the marker was flipped: FSPEC's
Upstream cell names REQ v0.11 (`01c27ee4`), the v0.6 changelog carries the DEC-ERR-01 re-grounding
record with both absorbed decisions, and the three routed-but-decided hand-off statements are
marked discharged — `te-review`'s `F-01`, the only High on record, and `se-review`'s `F-02`.
Step 2's downstream wave landed with it: PLAN T15(e) and §5 step 5 (v0.7) and PROP-LAUNCH-3 (v0.4)
now pin "not AT-1.1's `not found` message"; `grep -rn "none installed" pdlc/engine/` returns
nothing, and `pdlc/engine/__tests__/handshake.test.js:111-118` pins `pluginVersion === "not found"`
with `reason` matching `/not found/`, which is the containment/equality split AT-1.1 now states
(Step 3, `te-review` `Q-01`; the `:113` citation is a range, `F-03`). Step 6's rule-gap routing to
`DECISIONS-review-severity-bars.md` is deliberately left open — it changes no artifact this phase
consumes.*

**Halt class: ERRATUM-PROTOCOL, not review non-convergence.** PROPERTIES itself converged and was
approved by both reviewers in round 2, with approval anchors recorded (`f99d649c`). The phase
halted afterwards, inside the erratum channel it opened against the FSPEC: the delta confirmation
over the erratum edit was non-approving from `te-review`, and one erratum round per upstream
document per phase is the shipped bound.

## Phase

**Phase PR — PROPERTIES authoring and cross-review. The document converged; the *erratum channel*
did not.** Two reviewers of PROPERTIES v2 raised the same upstream defect against the FSPEC, the
author made the FSPEC edit, and the bounded delta-confirmation round that closes an erratum came
back split — `se-review` **Approved with minor changes**, `te-review` **Needs revision** on a High.
With one erratum round per upstream document per phase, a non-approving confirmation halts the
phase.

| | |
|---|---|
| Document authored | `docs/pdlc-engine-distribution/PROPERTIES-pdlc-engine-distribution.md` — **v0.3 at HEAD**, 89 properties |
| PROPERTIES status | **approved, round 2**: PM `Approved with minor changes {0, 0, 2}` (`55a19cec`), SE `Approved with minor changes {0, 1, 1}` (`6f3c3581`); anchors recorded `f99d649c` (`sha256:5742146d…`) |
| Branch | `feat-pdlc-engine-distribution` |
| Halt reason | delta confirmation for the FSPEC erratum round not approved — non-approving: `[te-review]` |
| Erratum target | `docs/pdlc-engine-distribution/FSPEC-pdlc-engine-distribution.md` (v0.5 → **v0.6**, commit `73e664bb`) |
| Erratum budget | **one round per upstream doc per phase — spent.** A second edit-and-confirm batch is not available inside this invocation |
| Review-round budget | `MAX_REVIEW_ROUNDS = 5` — **2 of 5 used** on PROPERTIES. The halt is not budget exhaustion |

The two raised items were one defect seen from two seats:

| Raiser | Item |
|---|---|
| `pm-review` (PROPERTIES v2, `Q-03`) | FSPEC `AT-1.6` quotes the placeholder `"none"` for the missing-plugin case, but the shipped `checkCompat` reports `not found` (`lib/handshake.mjs:164`, `handshake.test.js:113`); `PROP-LAUNCH-5`/`-9` already pin the shipped literal |
| `se-review` (PROPERTIES v2) | `AT-1.6` (`FSPEC:663`) writes the triple's missing-plugin member as `"none"` while the shipped renderer and the approved PROPERTIES both say `not found` (`handshake.mjs:209`, `handshake.test.js:113`) — a verifier transcribing AT-1.6 pins the wrong user-facing string |

Neither item was a defect in PROPERTIES. Both reviewers said so explicitly and told the author not
to absorb them downstream — "PROPERTIES is right and the FSPEC is the odd document out"
(`CROSS-REVIEW-software-engineer-PROPERTIES-v2.md:61-62`; PM's `Q-03` says the same). Routing them
upward was correct; the routing is not what failed.

**Both items were confirmed resolved by both confirmation reviewers.** The blocking finding is a
*new* one, raised by `te-review` against the erratum round's own process obligation.

## Iterations

Two PROPERTIES rounds, then one erratum round. Twenty-two minutes end to end.

| Round | Document | Version | PM verdict | SE verdict | TE verdict | Prior findings resolved |
|---|---|---|---|---|---|---|
| 1 | PROPERTIES | v0.2 | Needs revision `{2, 3, 0}` (`7858f1e3`) | Approved with minor changes `{0, 2, 2}` (`00177ed3`) | — | — |
| 2 | PROPERTIES | v0.3 | **Approved with minor changes** `{0, 0, 2}` (`55a19cec`) | **Approved with minor changes** `{0, 1, 1}` (`6f3c3581`) | — | **9 / 9** (PM `F-01`…`F-05`, SE `F-01`…`F-04`) |
| E | FSPEC (erratum) | v0.6 (`73e664bb`) | — | Approved with minor changes `{0, 4, 2}` (`6a5d8b6b`) | **Needs revision** `{1, 1, 1}` (`f8c059f9`) | **2 / 2 raised items** |

Timeline, from `git log`:

| Time (2026-08-13) | Commit | Event |
|---|---|---|
| 22:07 | `01c27ee4` | **REQ moves v0.10 → v0.11** — a different phase's erratum lands AC-1.3's ownership split and the F-4 pin citation |
| 23:10 / 23:12 | `7858f1e3`, `00177ed3` | PROPERTIES round-1 cross-reviews |
| 23:15–23:17 | `455c8ba5`…`16b022b3` | PROPERTIES v0.3 — four section-sized commits closing all nine findings |
| 23:21–23:23 | `3d46b30b`…`6f3c3581` | PROPERTIES round-2 cross-reviews; both approve; **both raise `ERRATUM: FSPEC`** |
| 23:23 | `f99d649c` | Approval anchors recorded — PROPERTIES is done |
| 23:28 | `73e664bb` | FSPEC erratum edit, v0.5 → v0.6 (17 insertions / 7 deletions) |
| 23:31 | `f8c059f9` | `te-review` delta confirmation — **Needs revision**, `F-01` High |
| 23:32 | `6a5d8b6b` | `se-review` delta confirmation — Approved with minor changes |
| — | — | **halt** |

The erratum edit itself is small and, on the item list, complete:

| What `73e664bb` changed | Verified at HEAD |
|---|---|
| `AT-1.6` (`FSPEC:672-674`) — "the literal `not found` when none is installed" | `handshake.mjs:146` (null/empty → `"not found"`), `:164` (refusal reason), `:209` (banner triple); pinned `handshake.test.js:110-118`, `:113` `assert.equal(out.pluginVersion, "not found")` |
| `AT-1.1` (`:655-658`) — "states none is installed" → "reports the plugin version as the literal `not found`" | true of the refusal text at `handshake.mjs:164`, not only the banner |
| `Q-1` (`:596`) — the triple's content obligation carries the same literal | matches `PROP-LAUNCH-5` (`PROPERTIES:87`) and `PROP-LAUNCH-9` (`:91`) |
| `AT-1.4` (`:664-666`) — discriminator repointed from the deleted `"none installed"` message to "**not** AT-1.1's `not found` message" | id-anchored, so only AT-1.1 owns the string |

Both confirmation reviewers diffed the whole commit and agreed nothing else moved: no `AC-`, no
`BR-`, no `E-`, no `§5.2` cell, no expected-set arithmetic. Alignment ran **towards** the shipped
value, so the documents moved to the green oracle rather than asking the implementation to move to
prose. On raised items alone this round was a clean pass.

## Reviewers

| Role | Confirmation verdict | Blocking finding | Character of the review |
|---|---|---|---|
| `se-review` (software-engineer) | **Approved with minor changes** `{0, 4, 2}` | none | Did the DEC-ERR-01 re-grounding itself: read REQ at HEAD, found **v0.11** (`01c27ee4`, 22:07 — *before* the erratum commit at 23:28), and checked what it decided. AC-1.3's re-wording ("classes and per-class member counts stated in the FSPEC", "member names stated downstream in the TSPEC", `REQ:264-274`) turned out to be **exactly what this FSPEC already holds** (`FSPEC:59-63`, `:509-517`) — absorbed in substance, no edit needed. Also re-checked that REQ states no literal at all for the missing-plugin case (AC-1.1, AC-1.4, `REQ:253-278`), so pinning `not found` **narrows without contradicting**. Recorded the missing paper trail as `F-02` (Medium, Process) and carried forward three v5 items untouched by this round |
| `te-review` (test-engineer) | **Needs revision** `{1, 1, 1}` | `F-01` (High): the erratum round did not re-ground on REQ HEAD, and the FSPEC now carries **three readable false statements about its upstream** — `FSPEC:9`'s Upstream cell still pins REQ **v0.10**; `:30` still routes "REQ AC-1.3 wording" upstream as open, though REQ v0.11 decided it; `:38` quotes AC-1.3 as "*expected set stated in the FSPEC*", a phrase REQ v0.11 no longer carries; `:42-43` still says the F-3/F-4 pin citation is "noted, not fixed, for the next round", though REQ v0.11 fixed it | Same measurement, opposite gate. Read DEC-ERR-01's rule as normative on *content*, not on bookkeeping: a routed-but-already-decided item is a false statement in a hand-off section, and DEC-ERR-01 says such an item is never demoted below the bar. Named the fix precisely and priced it — header cell plus one changelog paragraph, "no `§5.2`, `AT-3.8a` or `AT-3.8b` text needs to change" |

Neither reviewer disputed a fact the other asserted. Both confirmed both raised items. Both found
the same downstream residue and both are complimentary about the edit itself — `te-review` calls it
"exactly the shape an erratum should be: one literal, aligned everywhere it is quoted, the shipped
source and its pinning test cited".

The one genuinely live defect they *share* is the one nobody's verdict turns on:

| Finding | `se-review` | `te-review` | Content |
|---|---|---|---|
| the deleted literal survives downstream | `F-01`, **Medium** (Cross-Feature) | `F-02`, **Medium** | `"none installed"` is gone from the FSPEC but three approved documents still discriminate against it *by name*: `PLAN:146` T15(e), `PLAN:458` step 5, and `PROP-LAUNCH-3` (`PROPERTIES:85`). An implementer reading T15(e) writes an assertion against a string that appears nowhere in `lib/handshake.mjs` and nowhere in the FSPEC — the same defect this erratum just fixed, one layer down. It blocks T15 |

`se-review` states the severity split in as many words: Medium *here* only because the FSPEC is now
correct; **against PLAN and PROPERTIES it is High**.

## Pattern of Disagreement

**There is no disagreement about facts. There is one disagreement about a bar, and it is the whole
halt.**

Both confirmation reviewers measured the same three things and got the same three answers:

| Measured | `se-review` | `te-review` |
|---|---|---|
| Are both raised items resolved? | yes | yes |
| Did REQ move under this document? | yes, v0.10 → v0.11 at `01c27ee4` | yes, v0.10 → v0.11 at `01c27ee4` |
| Does the FSPEC record that it read REQ v0.11? | no (`F-02`) | no (`F-01`) |
| Does any acceptance criterion, oracle or test level need to move? | no | no |

The split is on **what a stale hand-off statement is worth**:

- `se-review` scored it by **consequence**: the content check passes, §2's re-grounding shows the
  substance was already absorbed, nothing an implementer reads goes red. Therefore *Process*,
  *Medium*, and the round passes with a bookkeeping note.
- `te-review` scored it by **DEC-ERR-01's rule**: an item this document routes upstream as open,
  which the upstream has already decided, is a **false statement in a hand-off section**, and
  DEC-ERR-01 says such an item is never demoted to a lesser finding. There are three of them
  (`:30`, `:38`, `:42-43`). Therefore High, and under the High-only convergence bar, Needs
  revision.

Both readings are defensible on the shipped rule text, which is what makes this a bar dispute
rather than an error by either reviewer. DEC-ERR-01 forbids *demoting* a routed-but-decided item;
it does not say in so many words whether an item routed by an **earlier round's changelog prose**,
in a round scoped to a single literal, is one of those items or is instead ordinary staleness the
next round sweeps up.

A second, quieter pattern: **the erratum wave propagated up but not down.** DEC-ERR-01's ordering
rule is child-confirmed-before-parent, and this wave ran REQ → FSPEC correctly. What no one owned
was FSPEC → PLAN / PROPERTIES, where the *deleted* literal still lives. Both reviewers found it and
both filed it Medium against the document in front of them, because against *that* document it is
Medium — so the one finding that will actually redden T15 is the one the erratum protocol has no
seat for. The halt fired on paperwork; the live defect rode along as a note.

Round-budget context, for the record: PROPERTIES converged in 2 of 5 rounds with all nine round-1
findings closed and zero re-litigation. Nothing about the phase's review economics is stressed.
The only exhausted budget is the erratum channel's single round.

## Best-Guess Root Cause

**The erratum round was scoped to its item list and skipped the re-grounding step that DEC-ERR-01
attaches to every erratum round — so a one-literal edit inherited a High from four-hour-old
upstream drift it had nothing to do with, and the channel's single round was spent before anyone
could write the two-line fix.**

Four contributing conditions, in order of leverage:

1. **Re-grounding is a step of the erratum round, and this round treated it as optional because
   the items did not need it.** DEC-ERR-01 is explicit: an erratum round re-reads its immediate
   upstream at HEAD, diffs the `Version` cell and changelog against the version last approved
   against, and **absorbs** what moved *before* touching the raised items. The author went
   straight to the raised items — correctly, in substance: the literal alignment is independent of
   AC-1.3's ownership split. But the round is the unit that carries the obligation, not the item.
   The evidence that this was skipped rather than done-and-unrecorded is the `:30` / `:38` /
   `:42-43` trio: an author who had read REQ v0.11 would have found their own routed items already
   discharged there and could not have left them standing as open.

2. **REQ moved 81 minutes before the edit, from a different phase.** `01c27ee4` landed at 22:07;
   the FSPEC erratum committed at 23:28. Nothing in the PROPERTIES phase's own record announced
   that move — Phase PR's inputs are FSPEC/TSPEC/PLAN, and its reviewers were reading PROPERTIES.
   Cross-phase upstream drift is exactly what the re-grounding step exists to catch, and it is
   invisible to anyone who does not perform it.

3. **Severity of a stale hand-off statement is not pinned by any shipped rule, and the convergence
   bar is High-only.** With no shared bar, one reviewer's Process/Medium and another's High are
   both faithful readings, and the High-only gate turns that ambiguity directly into a halt. The
   two reviewers agree on the fix, the fix's size, and the fact that it moves no criterion — they
   disagree only on whether it may be deferred one round. That is a rule gap, not a review defect.

4. **The erratum channel is bounded at one round per upstream document per phase, and this round
   spent it on a defect the round did not introduce.** The bound is right — it stops erratum
   ping-pong — but it prices every erratum round as one-shot. A round that fixes its items
   perfectly and misses the process step gets no second attempt, even when the remedy is a header
   cell and a changelog paragraph that both reviewers have already written out for the author.

**What is not the cause.** Not PROPERTIES quality: approved by both reviewers in round 2, all nine
round-1 findings closed, anchors recorded. Not the raised items: both confirmed resolved by both
reviewers, aligned to the shipped literal, with the pinning test cited. Not a contested design:
zero substantive disagreement in either confirmation. Not review-round exhaustion: 2 of 5 used, 13
of `MAX_LIFETIME_ROUNDS` remaining. Not authoring stall: the whole phase, both revisions and the
erratum edit, ran in twenty-two minutes of section-sized commits. Not a wrong routing decision:
both reviewers independently said PROPERTIES was right and the FSPEC was the odd document out.

## Recommendation

The halt should be cleared by **making the two edits both reviewers already specified**, then
re-invoking. No document needs re-authoring and no design question is open.

**Step 1 — Close `te-review` `F-01` in the FSPEC (the blocking finding).** Four edits, all
bookkeeping, none touching a criterion, oracle or test level:

| Site | Edit |
|---|---|
| `FSPEC:9` Upstream cell | pin REQ **v0.11** (`01c27ee4`), replacing "v0.10, re-grounded 2026-08-13 erratum round" |
| `FSPEC:19-24` v0.6 changelog | add one absorption paragraph recording that REQ v0.11 was read at HEAD and what it decided: (a) AC-1.3's ownership split — classes and per-class counts in the FSPEC, member names downstream in TSPEC §5.4 — which `FSPEC:59-63` and `:509-517` already implement, absorbed in substance with no text change; (b) the F-4 step-2 run-side `engine.*` pin citation, which `FSPEC:180` already carries |
| `FSPEC:30`, `:38`, `:42-43` | mark each **discharged** rather than open — REQ v0.11 decided all three |
| `FSPEC:522-523` (optional) | restate §5.2's quotation of AC-1.3 in REQ v0.11's words |

`se-review`'s `F-02` is the same finding and is closed by the same edit.

**Step 2 — Propagate the wave one layer down, which is the only defect with a red test behind
it.** `"none installed"` no longer exists in the FSPEC or in `lib/handshake.mjs`, but three
approved documents still discriminate against it by name. Point each at AT-1.1's `not found`
message, as `AT-1.4` (`FSPEC:664-666`) now does:

| Site | Current text | Consequence if left |
|---|---|---|
| `PLAN:146` T15(e) | "the assertion pins that it is **not** the 'none installed' message" | an implementer writes an assertion against a string no shipped module emits — T15 red |
| `PLAN:458` step 5 | "the unparseable-manifest refusal is not the 'none installed' message" | same, in the acceptance-mapping prose |
| `PROPERTIES:85` `PROP-LAUNCH-3` | "must pin that the text is not the 'none installed' message" | the property's discriminator names a dead literal; its replacement should discriminate positively against AT-1.1's `not found` text (`notEqual` plus a positive substring pin on each), not by absence |

This is a te-owned edit for `PROPERTIES` and an se-owned edit for `PLAN`. Both documents carry
recorded approvals, so each edit is a targeted versioned revision with a changelog line, not a
re-open.

**Step 3 — Answer `te-review` `Q-01` while editing AT-1.1.** At HEAD the literal appears in two
non-substring-equal shapes: `version found: not found` inside `checkCompat`'s reason
(`handshake.mjs:164`) and `pdlc vnot found` in the banner triple (`:209`, pinned
`handshake.test.js:167`). AT-1.1 is a refusal-message criterion and AT-1.6/`Q-1` is the triple, so
the split is almost certainly intended — but a verifier who picks the wrong surface writes a red
test against correct code. One clause in AT-1.1 naming the refusal-reason surface closes it.
`te-review` `F-03` (Low) is adjacent and one line: cite `handshake.test.js:110-118` by range, or
the test by name, rather than the drift-prone `:113`.

**Step 4 — Flip the marker.** When Steps 1–3 are on the branch, verify each cited site by reading
it, then set `RESOLVED: yes` at the top of this file with the date and the commit range, and
commit. The marker is a judgement that the `## Recommendation` was addressed, not a mechanical
step — do not flip it on the strength of the commit messages alone.

**Step 5 — Re-invoke Phase PR.**

```
/pdlc:orchestrate-dev {"reqPath": "docs/pdlc-engine-distribution/REQ-pdlc-engine-distribution.md", "forcePhases": "PR"}
```

This opens a fresh erratum budget for the phase. Expect the FSPEC confirmation to pass: both raised
items were already confirmed by both reviewers, and Step 1 closes the only High on the record.

**Step 6 — Route the rule gap, so the next erratum round does not halt the same way.** Two
candidates for `docs/_decisions/DECISIONS-review-severity-bars.md`, both cheap:

1. **State the severity of a stale-but-substantively-absorbed hand-off statement.** DEC-ERR-01
   forbids demoting a routed-but-already-decided item. Say whether that applies to items routed by
   an *earlier round's* changelog prose when the current round's own items are unrelated — i.e.
   whether the remedy is High (halt) or Medium (note, fix next round). Either answer is workable;
   the ambiguity is what cost this phase.
2. **Make the re-grounding step's *record* an explicit deliverable of every erratum round**, not
   an implicit consequence of having done it: the edit is not complete until the Upstream cell
   names the upstream version read and the changelog records what was absorbed — including
   "nothing, already held". Had that been stated, this round's author would have caught REQ v0.11
   before writing the first line, and the round would have passed.

**Not recommended.** Forcing Phase I on the strength of the approved PROPERTIES without Step 2.
`PROP-LAUNCH-3` and `PLAN` T15(e) currently instruct an implementer to assert against a string that
exists in no shipped module — precisely the defect class this erratum was raised to fix, and the
one that is cheap now and expensive inside a wave.
