# Cross-Review: test-engineer — DECISIONS

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-wave-resume/DECISIONS-pdlc-wave-resume.md (v1.1, bytes unchanged)
**Date:** 2026-08-21
**Iteration:** 4
**Scope:** upstream-cascade confirmation — does DECISIONS still hold as approved against TSPEC v1.3 at HEAD? Not a re-review of DECISIONS.

## Context

My approval of DECISIONS v1.1 was last confirmed in `CROSS-REVIEW-test-engineer-DECISIONS-v3.md`
(*Approved with minor changes*, 0 High / 3 Medium / 4 Low), recorded against
`REVIEWED-COMMIT: 701b8e7b` with `UPSTREAM-STATE: TSPEC sha256:458e9ec6…` (TSPEC v1.2). TSPEC is now
`sha256:5ed76227…` (v1.3). REQ (`sha256:17e83bfc…`) and FSPEC (`sha256:9a6be7b5…`) are byte-identical
to the versions both prior approvals were taken against, so this confirmation is again entirely
about the TSPEC delta. DECISIONS' own bytes have not changed since `020b74a0`.

**The delta, measured rather than described.** `git diff b4a628b8..HEAD --
docs/pdlc-wave-resume/TSPEC-pdlc-wave-resume.md` is 9 insertions / 4 deletions across three hunks,
and all three say the same thing in three places:

| TSPEC hunk | What changed |
|---|---|
| Header metadata + revision history | Version 1.2 → **1.3**, with a round-4 erratum row recording the reassignment below and stating that the floor, its threshold (`--per-file --branches 85`) and its backstop are unchanged. |
| §5.8 (coverage floor) | The floor's owner moves from “the **last implementation wave's `postWaveCommand`**” to “the **last implementation task** (PLAN T-10, RK-2), which runs it explicitly and reports the measured per-file branch number”, plus the reason: V-13 closes the config surface at four keys with a single *global* `postWaveCommand`, so a per-wave-scoped setting is not expressible and a global one would run `test:coverage` after every wave. |
| §6.4 RT-7 row | The same reassignment and the same reason, restated in the risk's mitigation cell; the backstop clause (§5.3 per-arm unit coverage, §5.7 generative suite, degrade to a PUB-time finding) is preserved verbatim apart from “if T-10's run proves too slow”. |

This is the erratum PLAN raised as **RK-2** (`PLAN-pdlc-wave-resume.md` §4.4, and the §3.4 row
“Coverage floor | **T-10**, not `postWaveCommand`”). TSPEC has now adopted PLAN's position, so the
two documents agree; nothing was re-litigated and no scope moved.

**What I checked, beyond the item list (DEC-ERR-03).** The item landing is necessary, not
sufficient. The question is whether DECISIONS is still a faithful compression of TSPEC v1.3, so I
went at it from the DECISIONS side: I grepped the document for every surface the delta could have
moved under it — `coverage`, `85%`, `test:coverage`, `§5.8`, `RT-7`, `postWaveCommand`,
`postWavePathspecs`, `V-13`, “four keys” — and re-read each hit against TSPEC at HEAD. There are
exactly two hits, neither of which is a claim about the coverage floor:

| DECISIONS site | What it asserts | TSPEC v1.3 / shipped code at HEAD | Verdict |
|---|---|---|---|
| O-5, the key-generic notice argument (line 153) | The invalid-value notice is emitted by a key-generic loop “shared verbatim by every `implementation` key (`testCommand`, `postWaveCommand`, `postWavePathspecs`, `startWave`)” — four keys | TSPEC V-13 (§2.1) still closes the recognised set at exactly those four, and the erratum **re-asserts** the four-key surface as its own load-bearing premise | **Faithful, and newly reinforced** — the delta leans on the same fact DECISIONS leans on |
| Risks, “Generated artifacts go stale” bullet (line 472) | A wave touching the module must name the dist path in `implementation.postWavePathspecs`; “the post-wave command runs before the gate” | TSPEC §6.4 RT-5 says the same (`M-WG-2`), untouched by this delta; and `pdlc/workflows/orchestrate-dev.js` runs `postWaveCommand` and only then `implConfig.testCommand`, with the comment “The build runs BEFORE the test gate” | **Faithful**, verified against the shipped loop rather than trusted from the doc |

DECISIONS makes **no claim at all** about the 85% branch floor, about §5.8, or about RT-7 — the
floor is a TSPEC-and-PLAN obligation that this DECISIONS never compressed. The delta is therefore
non-interacting with every position this document holds: nothing it cites moved, and nothing it
cites now says the same thing a different way.

## Options Considered

Three dispositions were available. I record the rejected two because a reader of the findings table
could reasonably expect either.

### C-1 — Approve with zero findings: the delta is non-interacting, so there is nothing to say *(rejected)*

Strictly true of the **delta**: no DECISIONS sentence quotes §5.8, RT-7 or the coverage floor, so
this edit could not have made any of them stale. But DECISIONS' bytes have not changed since
`020b74a0`, and my v3 confirmation left seven findings open — three Medium, four Low. A
zero-finding confirmation would silently retire them: the erratum machinery reads `FINDING:` lines,
not review history, so an open finding that stops being re-filed stops existing. Rejected: it would
launder seven open defects through a round that had nothing to do with them.

### C-2 — Escalate the reassignment itself, on the ground that the wave gate no longer closes the floor *(rejected)*

There is a real testing question buried in this erratum — a floor enforced by “T-10 runs
`npm run test:coverage` and reports the number” is a **task-discipline** gate, not a script-owned
one, and it is weaker than a command the runtime executes and halts on. If DECISIONS had taken a
position on how the floor is enforced, this delta would have moved out from under it and I would be
filing a High here.

It did not, and the weakening is not this document's to answer:

- **The floor was never script-owned in the first place.** At v1.2 the proposal was
  `implementation.postWaveCommand`, and TSPEC v1.3's own argument is that it was *not expressible* —
  V-13's single global key would have run `test:coverage` after every wave, reddening waves whose new
  branches are not yet covered. A gate that cannot be configured was never a gate; v1.3 replaces an
  unimplementable mechanism with an implementable obligation, which is strictly forward.
- **T-10 is not a bare promise.** PLAN §3.4 and the batch-4 DoD row make the floor a green-gate
  condition of the last task, and §4.5.1 pairs it with a **delta oracle** — c8's per-file uncovered
  line list asserted to contain no line inside this feature's introduced ranges, against a mapping
  table whose completeness is itself the check. That is a falsifiable oracle over exactly the
  branches this feature adds, which the whole-file percentage alone is not.
- **The lens boundary.** Whether a floor belongs in `postWaveCommand`, a task DoD or CI is a TSPEC
  and PLAN question, and it was answered in TSPEC's own round-4 and in PLAN RK-2 — both of which I
  review under their own doc types, and where I raised the coverage-floor findings (F-06/F-07) that
  produced §5.8 in the first place. Re-raising it here, against a document that never spoke to it,
  would be re-litigating a settled upstream decision from a downstream confirmation.

Rejected: no High, and not this document's finding to carry.

### C-3 — Approve, re-filing every still-open finding as `inherited` *(chosen)*

Chosen. It states the confirmation's actual answer — the delta is non-interacting — while keeping
the seven open findings visible to the next revision and to harvest, tagged `inherited` so the round
routes them back to Phase D's ordinary loop instead of halting on them.

## Decision

**DECISIONS still holds as approved against TSPEC v1.3.** The round-4 erratum touched §5.8, the RT-7
mitigation cell and the revision history — three surfaces this DECISIONS never compressed — so no
claim it makes about upstream became stale, and no oracle a downstream author transcribes from it
changed. No High finding, so this confirmation approves.

### The full fidelity re-read, not just the changed hunks

DEC-ERR-03's bar is faithfulness at HEAD, not item-list arithmetic, so I re-read every TSPEC passage
DECISIONS leans on at v1.3 — the same six citation families my v3 pass enumerated — and confirmed
each is byte-identical to what it was at my v1.2 confirmation:

| DECISIONS site | TSPEC dependency | State at v1.3 |
|---|---|---|
| O-3; DEC-WVR-02 | §3.4 seam table and “the diff adds no parameter to `main()`”; §6.1 DEC-WVR-02 (b) “plumbing, not capability” | Untouched by round 4 — **faithful** |
| O-5; DEC-WVR-03 | §2.4's announcement table, its by-rule closure block and the named exclusion row | Untouched — **faithful on the rule**, with the two stale raises of v3 still standing (F-01, F-06) |
| DEC-WVR-03; Risks | §2.4's “three shipped assertions that do change” | Untouched — **faithful**, still three |
| O-8; DEC-WVR-06 | §3.1's “three of the seven … carrying four interpolated values” | Untouched — **faithful**, with O-8's stale parenthetical still standing (F-02) |
| Risks, rebase-churn bullet | §6.4 RT-1's two byte figures and their `git ls-tree` provenance | Untouched — **faithful** |
| Risks, generated-artifacts bullet; O-5 key list | §6.4 RT-5 (`M-WG-2` ordering); V-13's four-key surface | Untouched, and V-13 is now *load-bearing for the erratum's own argument* — **faithful and reinforced** |
| Open table | OB-F1, OB-F4, RT-6 | Untouched — **faithful** |

The only TSPEC row adjacent to the delta that DECISIONS references at all is RT-5, and RT-5 is a
different risk from RT-7: RT-5 is stale generated artifacts (mitigated by `postWavePathspecs`, which
still exists), RT-7 is the branch floor (reassigned). The erratum did not touch RT-5, and DECISIONS
does not touch RT-7. They pass each other without contact.

### Where the delta *does* land, and why it is not a finding here

The reassignment's real downstream consumer is PLAN — which already holds the destination position
(RK-2, §3.4, the batch-4 DoD row, §4.5.1's mapping table) and raised the erratum that produced this
edit. TSPEC v1.3 moved onto PLAN's side; the two now agree, and the agreement is the thing the
erratum bought. PROPERTIES, when authored, transcribes the floor from PLAN T-10's two oracles, not
from DECISIONS, which is silent on the subject.

## Consequences

**For Phase D.** DECISIONS as approved stands. Seven findings remain open, all carried from earlier
rounds, none gating: three Medium and four Low, every one of them `inherited`. They route back to
Phase D's ordinary revision loop, not to a halt.

**For the PROPERTIES author, concretely.** Nothing to change. The three oracles a PROPERTIES author
transcribes from this DECISIONS are unaffected by the delta:

- the announcement **set-equality** oracle (DEC-WVR-03 Consequences) — transcribed from TSPEC §2.4,
  which round 4 did not touch;
- the write-side **key-set equality** for the wave-state record (DEC-WVR-04) — still carrying the
  `head`-presence conditional flagged as F-04, still a shipped-code question, not a TSPEC one;
- the seven-code **catalogue closure** (DEC-WVR-06) — unchanged at three interpolating reasons
  carrying four values.

The coverage floor is *not* one of them: it is transcribed from PLAN T-10's two oracles (the
whole-file `--per-file --branches 85` run and §4.5.1's delta oracle over the uncovered line list),
and this erratum is what makes those two the single source. A PROPERTIES author who read
“the last wave's `postWaveCommand`” out of TSPEC v1.2 would have written a property against a config
key that cannot express it; at v1.3 that trap is closed.

**For the next DECISIONS revision.** The correction list is unchanged from v3 and still small:
delete O-5's closing parenthetical and O-8's closing parenthetical (both now resolved upstream),
restate them in the past tense naming the erratum round that settled them, add the Consequences
observer that DEC-WVR-05's trigger needs, state DEC-WVR-04's `head` conjunct as two admissible
key-sets, and give the revision-history row a truthful downstream-obligation line.

**For harvest.** One durable observation, sharper this round than last: this is the **second**
upstream-cascade confirmation in a row where the delta was non-interacting with DECISIONS and the
whole value of the round was re-filing findings that already existed. The cost is per-round dispatch
of a reviewer against a document whose bytes have not moved in three rounds; the signal is that a
confirmation's finding set is not derivable from the delta alone, which is precisely why it must
re-file. Tagged `Process` below (F-03).

## Delta-Confirmation Findings

Every finding this round is `inherited`: DECISIONS' bytes have not changed since `020b74a0`, and the
round-4 TSPEC erratum introduced none of them. Every finding is `nonlocal`: the sections this edit
changed (TSPEC §5.8, the §6.4 RT-7 row, the revision history) have no counterpart in DECISIONS —
this document holds no position on the coverage floor — so no finding can sit inside them.

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Medium | inherited | nonlocal | Carried from v3 F-01, unresolved. O-5's closing parenthetical says “TSPEC §2.4's announcement table omits the invalid-pointer notice entirely rather than excluding it by rule; that is an upstream gap”. TSPEC has closed the catalogue by rule since v1.2 and names the excluded notice in a one-row table, so an approved document is asserting something false about its own upstream (DEC-ERR-01). Non-gating: DECISIONS held the winning side and DEC-WVR-03's oracle transcribes identically either way. Delete the parenthetical, or restate it in the past tense naming TSPEC v1.2. | O-5, closing parenthetical (→ DEC-WVR-03) |
| F-02 | Low | inherited | nonlocal | Carried from v3 F-02, unresolved. O-8's closing parenthetical says “TSPEC §3.1 says 'four of the seven reasons interpolate'”. §3.1 has said **three** — `feature-mismatch`, `head-unreachable`, `over-count`, carrying four values between them — since v1.2, which is the count DECISIONS itself held. Same class as F-01, lower cost: no oracle transcribes the interpolation count. | O-8, closing parenthetical (→ DEC-WVR-06) |
| F-03 | Low | inherited | nonlocal | `Process`. Carried from v3 F-03, unresolved and now demonstrated twice more: erratum raises written into the durable document body have no expiry, so nothing in the pipeline retires them when upstream honours the raise — only an upstream-cascade confirmation re-reads the text. Two rounds later F-01 and F-02 are still stale. File errata in the cross-review, and state only the position taken in the body. | Cross-cutting (O-5, O-8) |
| F-04 | Medium | inherited | nonlocal | Carried from v2 F-01 / v3 F-04, unresolved. DEC-WVR-04's write-side key-set oracle conditions `head`'s presence on “the transport being injected”; the shipped write site fills `waveHead` only when the transport is injected **and** `rev-parse HEAD` returns a sha, so a strict key-set equality reds on a fixture where `rev-parse` fails. State the two admissible key-sets instead of one. | DEC-WVR-04, Consequences |
| F-05 | Medium | inherited | nonlocal | Carried from v2 F-02 / v3 F-05, unresolved. DEC-WVR-05's re-evaluation trigger is stated observably, but no Consequences row obliges anyone to build the observer — a trigger with no detector can never fire, which makes the decision effectively irreversible in practice while documented as reversible. | DEC-WVR-05, trigger vs. Consequences |
| F-06 | Low | inherited | nonlocal | Carried from v2 F-03 / v3 F-06, unresolved. O-5's parenthetical discriminates the past-the-end notice by **code location** (“emitted inside the resume decision”), while TSPEC §2.4's adopted rule discriminates by **subject matter** (“about a resolved start point”). The upstream discriminant is the better one and survives DEC-WVR-02's extraction; the location-based one does not. Restate O-5 on the upstream discriminant. | O-5; DEC-WVR-03 criterion parenthetical |
| F-07 | Low | inherited | nonlocal | Carried from v2 F-04 / v3 F-07, unresolved. The v1.1 revision-history row ends “No decision, alternative disposition or downstream obligation changed”, but v1.1 added four downstream obligations. A PLAN or PROPERTIES author who trusts that line skips four obligations. | Revision history, v1.1 row |

FINDING: Medium | inherited | nonlocal | O-5, closing parenthetical (→ DEC-WVR-03) | v3 F-01, still open: O-5 raises TSPEC §2.4's missing exclusion as an outstanding upstream gap, but §2.4 has closed the catalogue by rule and named the excluded notice since v1.2 — a false statement about upstream standing in an approved document (DEC-ERR-01). Non-gating: DECISIONS holds the winning side and DEC-WVR-03's set-equality oracle transcribes identically either way.
FINDING: Low | inherited | nonlocal | O-8, closing parenthetical (→ DEC-WVR-06) | v3 F-02, still open: O-8 cites TSPEC §3.1 as saying "four of the seven reasons interpolate"; §3.1 has said three reasons carrying four values since v1.2, which is the count DECISIONS already held. No oracle transcribes the count.
FINDING: Low | inherited | nonlocal | Cross-cutting (O-5, O-8), Process | v3 F-03, still open: erratum raises live in the durable document body rather than in the disposable cross-review, so nothing expires them when upstream honours the raise — F-01 and F-02 have now survived two confirmations as stale text.
FINDING: Medium | inherited | nonlocal | DEC-WVR-04, Consequences | v2 F-01 / v3 F-04, still open: the write-side key-set oracle conditions `head` on transport injection alone, while the shipped site also requires `rev-parse HEAD` to succeed — strict key-set equality reds on a fixture where `rev-parse` fails. State two admissible key-sets.
FINDING: Medium | inherited | nonlocal | DEC-WVR-05, trigger vs. Consequences row | v2 F-02 / v3 F-05, still open: the observable re-evaluation trigger has no Consequences row obliging anyone to build the observer, so the trigger cannot fire and the reversibility claim is untestable.
FINDING: Low | inherited | nonlocal | O-5 / DEC-WVR-03 criterion parenthetical | v2 F-03 / v3 F-06, still open: O-5 discriminates the past-the-end notice by code location while TSPEC §2.4's adopted rule discriminates by subject matter (about a resolved start point) — the upstream discriminant is the one that survives DEC-WVR-02's extraction.
FINDING: Low | inherited | nonlocal | Revision history, v1.1 row | v2 F-04 / v3 F-07, still open: the row's "No decision, alternative disposition or downstream obligation changed" is false — v1.1 added four downstream obligations.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 3, "low": 4}

UPSTREAM-STATE: REQ sha256:17e83bfcd332f8f8f0482e2ebee7bbe78a3f434193dd3f9c3589723e39e8c79f
UPSTREAM-STATE: FSPEC sha256:9a6be7b5a95e9b7f16c30e88154995fdd546a60093a3b3620af24e831552356e
UPSTREAM-STATE: TSPEC sha256:5ed76227d8e4cb5b37681421d30a3c50d29e755a7334d37e5ef09c996832234a

APPROVAL-HASH: sha256:37b3684d4a042b5dfb3be0b8e259f8db5f4cc8823f61c61ad69db22fb950fd46
APPROVAL-HASH-NORMALIZED: sha256:37b3684d4a042b5dfb3be0b8e259f8db5f4cc8823f61c61ad69db22fb950fd46
REVIEWED-COMMIT: 2eb5e2379271a5f7c8e567f43dbb1a88b9b11fe4
UPSTREAM-STATE: REQ sha256:17e83bfcd332f8f8f0482e2ebee7bbe78a3f434193dd3f9c3589723e39e8c79f
UPSTREAM-STATE: FSPEC sha256:9a6be7b5a95e9b7f16c30e88154995fdd546a60093a3b3620af24e831552356e
UPSTREAM-STATE: TSPEC sha256:5ed76227d8e4cb5b37681421d30a3c50d29e755a7334d37e5ef09c996832234a
