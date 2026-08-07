# POSTMORTEM — Phase P — pdlc-consolidation-agent

| Field | Value |
|---|---|
| Upstream | `REQ` → `FSPEC` → `TSPEC` → `DECISIONS` → `PLAN` → **POSTMORTEM-P** |
| Downstream | operator decision; `LEARNINGS-pdlc-consolidation-agent.md` harvest |
| Cross-Reviews | `CROSS-REVIEW-{product-manager,test-engineer}-PLAN-v{1,2}.md` (4 files); `CROSS-REVIEW-{product-manager,test-engineer}-TSPEC-v9.md` (the failed erratum confirmation) |
| LEARNINGS | `docs/pdlc-consolidation-agent/LEARNINGS-pdlc-consolidation-agent.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | halted | Claude (se-author) | 1.0 | 2026-08-06 |

RESOLVED: no

## Phase

**Phase P — PLAN authoring and cross-review. The review loop is not what failed.** The PLAN
converged in **two** rounds, well inside the `MAX_REVIEW_ROUNDS = 5` window, with both approvers
holding an approval and approval anchors recorded (`0339276b`,
`sha256:6f58b4ede3bcb91d4ece30763feea5f27864206107aede499f7d1e653ed7a997`). What halted the phase is
the **erratum channel that runs after convergence**.

| | |
|---|---|
| Document (converged) | `docs/pdlc-consolidation-agent/PLAN-pdlc-consolidation-agent.md` — **v1.1**, approved by both reviewers at round 2 |
| Document (halted on) | `docs/pdlc-consolidation-agent/TSPEC-pdlc-consolidation-agent.md` — **v1.8**, the upstream document Phase P's errata were routed to |
| Branch | `feat-pdlc-consolidation-agent` |
| PLAN window | rounds 1–2; 22:03 → 22:26 — **23 minutes**, 2 of 5 rounds consumed |
| Erratum round | TSPEC erratum round **8**, edited 22:30–22:34 (six commits, `e22a3c4c` … `569578d0`), confirmed 22:38–22:40 as TSPEC cross-review round **9** |
| Terminal state | delta confirmation **did not pass** — non-approving: **`te-review`** (`VERDICT: Needs revision`, 1 High + 2 Medium). `pm-review` returned `VERDICT: Approved with minor changes` |
| Halt rule | one erratum round per upstream doc per phase (shipped constant); a **failed confirmation** halts to the current phase's POSTMORTEM. No second round was available |

**This is a different failure from the three that precede it, and the difference is the whole point
of this document.** `POSTMORTEM-R`, `POSTMORTEM-F` and `POSTMORTEM-T` are all *exhausted-window*
halts: five rounds consumed, no pair of approvals, the loop out of budget. This one is an
**erratum-protocol** halt. The budget was never touched — the PLAN used 2 of its 5 rounds, and the
erratum round used its 1 of 1. Nothing was slow, nothing stalled, and no reviewer refused to
converge. One bounded repair to an upstream document was attempted, and one of the two approvers of
that document declined to confirm it.

**What the errata were.** Phase P raised **13 erratum lines** against the TSPEC across four reviews
(PM PLAN v1/v2, TE PLAN v1/v2) and the se-author's own hand-off scan. De-duplicated they are **six
distinct defects**, and the shape of that set is diagnostic:

| # | Distinct defect | Raise lines | Class |
|---|---|---|---|
| E-1 | §12.3's traceability table omits `AT-M11`, `AT-Q13`, `AT-R7` | 5 | traceability bookkeeping |
| E-2 | §12.3 fixes the register at "96 ids, measured at v11.1"; FSPEC is v11.3 and re-enumeration gives **99** | 4 | stale transcribed count |
| E-3 | the same three ids have no test **level** and no test **file** | 1 | coverage assignment (a facet of E-1) |
| E-4 | §3.2's modified-files table omits `CLAUDE.md`, whose `:62` is already false at HEAD | 2 | file-touch bookkeeping |
| E-5 | both `SKILL.md` production edits have no falsifying test | 1 | coverage gap |
| E-6 | §11.3(c) names two L3 scan axes and misses `runtimeBundle.test.js:26`'s `BUNDLES` | 1 | coverage gap |

Every one of the thirteen raises is a **bookkeeping** defect — a table that omits a row, a count
that went stale, a production edit with no oracle. **Not one of them names the semantic defect that
actually blocked the confirmation.** That gap is § Best-Guess Root Cause.

**What the confirmation found instead.** The erratum edit resolved all six items on their own terms —
both reviewers independently re-derived the register set equality (99 ids, `comm` empty in both
directions) and confirmed it. `te-review` then filed three findings that are **not** in the raised
set:

- **F-01 (High)** — `AT-M11` was assigned a file but has **no fixture that can pass** against this
  TSPEC's own §7.3. AT-M11's fixtures carry `RELEASED: {passId} {ISO-8601}`; §7.3 (`TSPEC:926-930`)
  decides `parseMarker` accepts *exactly* `IN-PROGRESS: …` and maps present-but-unparseable ⇒
  `reclaim`, and `present` is true for a `RELEASED:`-carrying file. So a §7.3-conformant
  implementation records `reclaimed-stale-lock` on both AT-M11 fixtures — the exact outcome AT-M11
  exists to forbid. The id landed as bookkeeping; the PLAN task that must write the case (**T05**)
  is still red on arrival, which is the failure mode the register erratum was raised to prevent.
- **F-02 (Medium)** — §13.3's marker bullet (`TSPEC:2592-2608`) still hands the removal-verb question
  downstream as **open** ("The question the FSPEC owns is…", "Until it is answered…") and still
  asserts "release is an in-place write of `\"\"`". **FSPEC v11.3 answered it 13 minutes before the
  TSPEC's own erratum round began**: BR-14a (`FSPEC:2551`) decides release is an in-place write of
  `RELEASED: {passId} {ISO-8601}`, and E-11b (`:2645`) decides a `RELEASED:` marker is taken like an
  absent one at any age with no reason code.
- **F-03 (Medium)** — the new `CLAUDE.md` ↔ manifest oracle §12.2 introduces to close E-4 is **red on
  correct code as specified**. It asserts set equality between `CLAUDE.md`'s artifact enumeration and
  the ids in `distribution-manifest.json`; the manifest carries no row for itself (`orchestrate-dev`,
  `orchestrate-queue`, `pdlc-cli` — three rows, verified at HEAD) while the enumeration must keep its
  `distribution-manifest.json` bullet. The two sets structurally cannot be equal.

All three verify at HEAD. F-01 and F-02 are one defect seen from two channels; F-03 is a new one the
repair itself minted.

## Iterations

**Two PLAN rounds (limit 5, not reached) plus one erratum round (limit 1, reached).** Findings are
counted from each review's `## Findings` table only; prior-finding disposition rows are closures, not
findings.

### PLAN review loop — the part that worked

| Round | PLAN ver. | product-manager | test-engineer | PM verdict | TE verdict |
|---|---|---|---|---|---|
| 1 | 1.0 | **2 High**, 3 Medium, 2 Low | **2 High**, 4 Medium, 3 Low | Needs revision | Needs revision |
| 2 | 1.1 | 0 High, 0 Medium, **1 Low** | 0 High, 0 Medium, **1 Low** | Approved with minor changes | Approved with minor changes |

**Round 2 closed 16 of 16 prior findings as filed** — PM F-01…F-07 and TE F-01…F-09, every row of
both disposition tables reading **Resolved** — and produced exactly one new Low each, both cosmetic
(a stale label in T05's status cell; a stale counting paragraph in §8.1). The High population went
4 → 0 in one round. Nothing in the feature's three prior windows looks like this: **this is the first
document on this feature to converge inside its window at all**, and it did so in the second round.

The eight commits that produced v1.1 are targeted and legible (`0832f8b0` … `1682227b`, 22:11–22:18):
version pins re-taken, §1 counts re-measured, the `DC-07` mis-citations dropped, the T25→T19 edge
added, the hook byte-identity claim replaced by a two-arm positive oracle, and — commit `6bf1a181` —
**the errata raised rather than absorbed**. That last commit is the phase behaving exactly as the
erratum channel prescribes.

### Erratum round 8 — the part that failed

| Stage | Time | What happened |
|---|---|---|
| Raise | 22:11–22:26 | 13 erratum lines across four PLAN reviews + the author's hand-off scan; 6 distinct defects |
| Route + edit | 22:30–22:34 | TSPEC author, same session, six targeted commits `e22a3c4c` … `569578d0`; **v1.7 → v1.8**; no restructuring |
| Confirm | 22:38–22:40 | TSPEC cross-review round 9, both approvers, delta-scoped to `a3049d1f..HEAD` |
| Outcome | 22:40 | `pm-review` **Approved with minor changes** (1 Low); `te-review` **Needs revision** (1 High, 2 Medium) ⇒ confirmation fails ⇒ halt |

**Erratum item disposition, as judged by the two confirmers:**

| Item | pm-review | te-review |
|---|---|---|
| E-1 ids omitted | Resolved (set diffed both directions, empty) | Resolved (each id in exactly one file row) |
| E-2 register count stale | Resolved (99 at v11.3, re-derived independently) | Resolved, **and independently confirmed** |
| E-3 no level / no file | Resolved | **Resolved for two of three** — AT-M11 has a file and a level but no fixture that can pass (F-01) |
| E-4 `CLAUDE.md` omitted from §3.2 | Resolved (count-free rewrite, the fix that does not recur) | Resolved for §3.2; **its new oracle cannot green** (F-03) |
| E-5 `SKILL.md` edits untested | Resolved | Resolved — and the refusal to widen `skillFiles.test.js` is correct on the shipped source |
| E-6 `BUNDLES` third scan axis | Resolved | Resolved; **all six cited suites checked** and all are where the document says |

Six items, six resolutions on both sides. **The confirmation did not fail on any raised item.** It
failed on F-01/F-02 — a defect the erratum round had the opportunity to fix and did not touch — plus
F-03, which the repair itself created.

### The number that matters

| | |
|---|---|
| Erratum lines raised in Phase P | 13 |
| Distinct defects among them | 6 |
| Distinct defects **resolved** by the round | 6 (100 %) |
| Blocking findings at confirmation | 3 |
| Of those, raised by anyone in Phase P | **0** |

A repair that closes 100 % of what was asked and still fails confirmation is not an execution
failure. It is evidence that **the wrong thing was asked for**.

## Reviewers

Two reviewer populations are in scope, because the erratum channel makes the *upstream* document's
approvers the deciders of a *downstream* phase's fate.

| Role | Skill | Lens | Rounds | Files |
|---|---|---|---|---|
| product-manager | `pdlc:pm-review` | requirements traceability, scope compliance, AC fidelity | PLAN 1–2; TSPEC 9 (erratum confirmation) | `CROSS-REVIEW-product-manager-PLAN-v{1,2}.md`, `CROSS-REVIEW-product-manager-TSPEC-v9.md` |
| test-engineer | `pdlc:te-review` | testability, oracle strength, fixture buildability, completeness by set-equality | PLAN 1–2; TSPEC 9 (erratum confirmation) | `CROSS-REVIEW-test-engineer-PLAN-v{1,2}.md`, `CROSS-REVIEW-test-engineer-TSPEC-v9.md` |

Both reviewers approved the TSPEC at v1.7 (round 8, the erratum-round-7 confirmation), so both were
the correct deciders here, and both scoped the confirmation correctly — each names its diff range
(`a3049d1f..HEAD`) and states that sections outside it stand approved from v8. Neither re-litigated
§7.3, whose reasoning both had approved.

**Nothing in this round impeaches either reviewer's conduct.** The record:

- **Both verified against primary sources rather than the edit's own account.** Both independently
  extracted the `AT-…` token set from FSPEC §13 (`:2041-2191`), de-duplicated it, extracted the
  §12.3 set, and diffed them **in both directions** — empty on both sides, 99 = 99. This is the first
  round on this feature in which §12.3's central claim was confirmed mechanically rather than by
  inspection, and it was confirmed twice, independently.
- **Both checked the two premises no reviewer could have taken from the documents.**
  `__tests__/skillFiles.test.js:13-17` is a three-member `reviewSkills` literal whose every assertion
  is about `VERDICT` trailers (so the TSPEC's refusal to widen it is right); `runtimeBundle.test.js:26`
  is the two-member `BUNDLES` constant, and `te-review` walked all six suites it keys (`:503`, `:509`,
  `:549`, `:1044`, `:1290`, `:1584`) and reports they are where the document says.
- **`te-review`'s three findings are each falsifiable and each verify at HEAD.** F-01: `grep RELEASED`
  over the TSPEC returns only prose about the divergence, and §7.3's `parseMarker` contract is as
  quoted. F-02: `TSPEC:2592-2608` still reads "The question the FSPEC owns is…" while `FSPEC:2551`
  (BR-14a) and `FSPEC:2645` (E-11b) decide it — I re-read all four spans. F-03: the manifest's `rows[]`
  at HEAD is exactly `orchestrate-dev`, `orchestrate-queue`, `pdlc-cli`, and `CLAUDE.md:57-59`
  enumerates its own manifest — set equality cannot hold.
- **`te-review` applied the shipped bar, and applied `DEC-SEV-03` correctly *against* itself.** F-01 is
  filed High **not** because a decision collides with an upstream row — `DEC-SEV-03` demotes that to
  Low when it is named, priced and routed, and §12.3's AT-M11 row does name and price it. It is High
  because the erratum's *purpose* was to unblock a PLAN task, and the task is still red on arrival:
  the row asserts coverage the mechanism cannot deliver. That is the concealment half of
  `DEC-SEV-03`, not the collision half.
- **`pm-review` was not wrong on its own lens.** Its Q-01 states the divergence explicitly, judges it
  a "form question, not a coverage question" that "belongs to the FSPEC round", and flags it so it is
  not lost. From a product lens that is defensible: AC-1.3's negative half is spelling-independent.
  Its one Low (a stale summary paragraph in §12.2) is real and cosmetic.
- **The author performed the erratum round to specification.** Six targeted commits in four minutes,
  no restructuring, every raised item addressed, the register measurement converted from a transcribed
  number into a run-time re-derivation (`consolidationTraceability.test.js`) so the *class* of defect
  is removed rather than the instance, and the `CLAUDE.md` fix written count-free so it does not
  recur. Both reviewers say so in their positive observations.

The one thing that did not happen is that **neither the raisers nor the author re-read the upstream
document the erratum wave had just changed**. That is § Best-Guess Root Cause, and it is a protocol
gap, not a conduct failure.

## Pattern of Disagreement

**For the first time on this feature, the two reviewers genuinely disagree — and the disagreement is
about whether a decided upstream fact has been absorbed.** In 60 prior reviews across three phases,
no finding was ever contradicted by the other reviewer. Here, one and the same divergence is filed by
`te-review` as a **High** that blocks (F-01, with F-02 as its hand-off half) and dismissed by
`pm-review` as a non-blocking form question (Q-01: *"it is a form question, not a coverage question,
and it does not hold up the TSPEC"*). Five patterns describe the round.

### 1. The disagreement is real, it is decidable, and `te-review` is right on the evidence

Both reviewers read §12.3's AT-M11 row, which states the divergence honestly: AT-M11's fixtures spell
the released marker as FSPEC §4.1's `RELEASED: {passId} {ISO-8601}` sentinel, while §7.3 decides the
**empty** released form — and the row *raises it as an erratum against FSPEC §4.1/§4.2 and leaves
§7.3 as approved*.

That disposition — name it, price it, raise it — is exactly what `DEC-SEV-03` prescribes, and
`pm-review` scored it accordingly. It is also **out of date by 71 minutes**. `FSPEC` v11.3 landed at
21:19 (`b68dddea`, `fcb8a4bc`) and *answered the question*:

| Artifact | At HEAD | Consequence |
|---|---|---|
| `FSPEC:2551` BR-14a | "The marker is released by an **in-place write** of `RELEASED: {passId} {ISO-8601}` — never by removing the file, which no seam can do" | the removal-verb question §13.3 hands downstream as open is **closed** |
| `FSPEC:2645` E-11b | a `RELEASED:` marker "of any age" is "taken like an absent file … records **no** reason code" | the released-marker case is decided, and AT-M11 is its oracle |
| `FSPEC:2643` E-11 | now reads "Reachable **because** §4.1 releases by writing a `RELEASED:` sentinel and never by truncating" | the empty-marker arm §7.3 called unreachable is **reachable again** |

So the TSPEC is raising an erratum against a question its own upstream has already decided, in the
FSPEC's own words, against this feature's own AT-M11. `pm-review`'s "belongs to the FSPEC round" is
correct in form and empty in substance: the FSPEC round already happened. `te-review` is not
disagreeing about severity — it is reporting that the upstream fact changed and the document did not
follow.

### 2. Every raised erratum was a *shadow* of the defect; none was the defect

FSPEC v11.3's erratum did two things at once: it **minted three ids** (AT-M11, AT-Q13, AT-R7) and it
**decided a mechanism** (BR-14a / E-11b, the `RELEASED:` sentinel). The three ids are visible from a
downstream document by pure arithmetic — a set difference over a traceability table, a count that no
longer matches. The mechanism decision is visible only by *reading the FSPEC's prose*.

| What FSPEC v11.3 changed | Detectable how | Raised in Phase P? |
|---|---|---|
| three new register ids | set difference over §12.3 | **yes — 5 raises** |
| register size 96 → 99 | count comparison | **yes — 4 raises** |
| release form ⇒ `RELEASED:` sentinel (BR-14a) | reading §4.1 | **no** |
| released marker is free at any age (E-11b) | reading §4.2 / E-11b | **no** |
| the empty-marker arm becomes reachable (E-11) | reading E-11 | **no** |

Thirteen raises, all on the countable half. Zero on the semantic half. AT-M11 is precisely where the
two halves meet — it is the *id* the mechanism decision minted — so assigning the id without
absorbing the mechanism produced the failure mode `te-review` names: **the id has a home and no
fixture that can live in it.**

### 3. The repair minted a new blocking finding, as every repair on this feature has

F-03 is not a pre-existing defect the round failed to fix; it is a defect the round **created**. E-4
asked for a missing `CLAUDE.md` row; the author gave it the row *and* — correctly, by this feature's
own standing rule that "a named gap is not a licence to ship uncovered" — a falsifying oracle. The
oracle asserts set equality between two sets that structurally cannot be equal, because the manifest
carries no row for itself while `CLAUDE.md` must keep its manifest bullet. The `BUNDLES` half of the
very same case states its exclusion explicitly (`.mjs`, not `.bundle.js`); the `CLAUDE.md` half states
none.

This is the identical mechanism `POSTMORTEM-T` recorded as RC-2 — *the coverage contract turns every
decision into two further obligations* — reappearing inside a four-minute erratum round. It is the
strongest evidence that the erratum channel is not a special quiet path: a targeted edit generates
new blocking surface at the same rate a review round does.

### 4. The channel was used correctly at every step, which is why the failure is protocol, not conduct

Nobody edited an upstream document out of channel. The PLAN reviewers raised rather than absorbed
(`6bf1a181`, "raise TSPEC errata 4 and 5"); the PLAN's own T05 row **states the erratum as a
precondition** and predicts the exact failure ("If a wave nonetheless reaches T05 with §12.3 still at
96, the task halts and reports the three missing ids"); PLAN §9's risk table carries the row "FSPEC or
TSPEC erratum round moves the AT register mid-implementation and reds T05 inside a halt-on-red wave".
The author edited in place, versioned, changelogged, and did not restructure. The confirmers scoped
to the diff and did not re-litigate. **Every actor followed the protocol and the protocol produced a
halt** — which is the definition of a protocol gap.

### 5. The disagreement is cheap to settle, and settling it closes two of the three findings

`te-review`'s own Q-02 states the resolution and is worth quoting because it is the whole
recommendation in one sentence: *"an in-place write of a non-empty sentinel is as writable as an
in-place write of `\"\"`, and the `file_empty ≡ absent` equivalence §7.3 leans on is then no longer
load-bearing."* §7.3's approved argument is **"no seam can unlink"** — and FSPEC's `RELEASED:` form
requires no unlink either. Adopting it therefore does not contradict the reasoning either reviewer
approved at v7/v8; it *satisfies* it. F-01 and F-02 close together, and the divergence §12.3 records
disappears rather than being disclosed.

## Best-Guess Root Cause

## Recommendation
