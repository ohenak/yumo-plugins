# POSTMORTEM — Phase D (review cap) — pdlc-advisory-wave-gate

| Field | Value |
|---|---|
| Upstream | `REQ → FSPEC → TSPEC → **DECISIONS**` |
| Downstream | `PLAN`, `PROPERTIES`, `IMPL` |
| Cross-Reviews | `CROSS-REVIEW-{product-manager,test-engineer}-DECISIONS-v1…v8.md` |
| LEARNINGS | `docs/pdlc-advisory-wave-gate/LEARNINGS-pdlc-advisory-wave-gate.md` |

**Date:** 2026-08-19
**Halt class:** `REVIEW-CAP` (`MAX_REVIEW_ROUNDS = 5`, per-invocation)
**Halt text:** Phase D exhausted this invocation's five-round review window (rounds 4–8) without a
both-lens approving round on `DECISIONS-pdlc-advisory-wave-gate.md`.
**Document at halt:** `DECISIONS-pdlc-advisory-wave-gate.md` v1.7 (`bbe65771`)

RESOLVED: no

---

## 1. Phase

Phase D authored and revised `DECISIONS-pdlc-advisory-wave-gate.md`, the record of the four
load-bearing choices inside TSPEC v1.10's A6 design: how the pre-repair tree is captured
(`DEC-A6-01`, dangling snapshot commit, never stashed), how an E-6 promotion reaches git history
(`DEC-A6-02`, its own `commitPaths` call), what the snapshot ref is named (`DEC-A6-03`, wave-scoped,
no run discriminator), and whether `waveBudgetPerRun: 0` is a configuration error (`DEC-A6-04`, a
supported affordance validated by a new `nonNegativeInt`).

**The four decisions are not what halted.** They were approved on substance early and stayed
byte-identical from round 5 onward; both lenses stopped re-litigating them and said so in scope
notes ("the four decisions … are byte-identical to the round I approved on substance and are not
re-litigated", PM v8). Every round from 4 to 8 turned on one sub-section of the `Consequences`
half — the DEC-A6-04 "sizing" bullet block that enumerates how many places in the tree carry the
pre-A6 five-member seam literal and the four-member envelope literal, split into three columns:
(1) gate-demanded edits, (2) oracles that flip red→green with no edit, (3) ungated hand-copy and
prose surfaces.

That block is a **measurement of the repository**, not a decision. It exists to stop PLAN sizing A6
as "one task touching three constants". Its numbers are only true against a HEAD that the feature's
own early-landed test-side commit (`e3b9d5a3`) had already moved, and every round both re-measured
one column and left another stale — so every round closed a High and opened a new one in the same
paragraph.

Phase D's window this invocation opened at round 4 (rounds 1–3 ran on 2026-08-18; round 2 earned an
approval anchor at `8ac724c0`, and round 3 re-opened the document as an upstream-cascade
confirmation against TSPEC v1.6). Rounds 4–8 all ran inside 42 minutes on 2026-08-19
(20:49 → 21:31). Round 8 returned PM **Needs revision** / TE **Approved with minor changes**; the
author addressed every round-8 finding in v1.7 (`17bf0e92`, `9e81ad0d`, `31d9105b`, `bbe65771`),
but the per-invocation budget was spent before round 9 could confirm it. The document at halt is
therefore **fully responsive to the last review round and unconfirmed**, which is a materially
different position from the Phase T halt recorded in `POSTMORTEM-T-pdlc-advisory-wave-gate.md`.

## 2. Iterations (5 — limit reached)

Eight rounds exist on disk; five of them (4–8) are this invocation's window and are what the cap
counted. `MAX_REVIEW_ROUNDS = 5` is per-invocation; `MAX_LIFETIME_ROUNDS = 15` is not yet reached,
so re-invocation is permitted and is the recommendation in §6.

| Round | Doc rev | PM verdict | PM findings | TE verdict | TE findings | Window |
|---|---|---|---|---|---|---|
| 1 | v1.0 | Approved w/ minor | 7 (0H / 3M / 4L) | Needs revision | 7 (3H / 3M / 1L) | prior |
| 2 | v1.1 | Approved w/ minor | 2 (0H / 1M / 1L) | Approved w/ minor | 3 (0H / 2M / 1L) | prior (anchored `8ac724c0`) |
| 3 | v1.1 (bytes unchanged) | Approved w/ minor | 5 (0H / 4M / 1L) | Needs revision | 5 (2H / 2M / 1L) | prior (upstream cascade) |
| 4 | v1.2 | **Needs revision** | 7 (1H / 2M / 4L) | Approved w/ minor | 2 (0H / 1M / 1L) | **1 of 5** |
| 5 | v1.3 | **Needs revision** | 3 (1H / 0M / 2L) | Approved w/ minor | 2 (0H / 1M / 1L) | **2 of 5** |
| 6 | v1.4 | **Needs revision** | 2 (1H / 0M / 1L) | Approved w/ minor | 2 (0H / 2M / 0L) | **3 of 5** |
| 7 | v1.5 | **Needs revision** | 5 (1H / 2M / 2L) | **Needs revision** | 3 (1H / 2M / 0L) | **4 of 5** |
| 8 | v1.6 | **Needs revision** | 5 (1H / 1M / 3L) | Approved w/ minor | 2 (0H / 1M / 1L) | **5 of 5 — cap** |

Three features of this trajectory matter more than the totals:

- **The finding volume converged; the verdict did not.** Total findings per round fall
  14 → 5 → 10 → 9 → 5 → 4 → 8 → 7, and the High count is pinned at exactly **one per round from
  round 4 to round 8** — always PM's, always `F-01`, always in the same bullet block. A stream of
  single Highs of shrinking scope is the signature the lifetime cap was written for (`DEC-ROUNDS-02`);
  the per-invocation cap caught it first.
- **Every round's High was a genuine, verified defect — and a new one.** Not one of the five was a
  re-raise. PM v4 F-01: the DEC-A6-04 bullet still assigned the engine expectation to
  `ci-arrangement.test.js` and contradicted itself four sentences later. PM v5 F-01: the seam
  enumeration was not re-derived and five of its six sites had already migrated. PM v6 F-01: the
  round's two new "oracle" claims were false at HEAD (`advisoryConfig`'s `PROP-CFG-02` deep-equal
  *is* an envelope oracle and *is* red). PM v7 F-01: column (2) was presented as a closed set of two
  and was ten. PM v8 F-01: the new parenthetical reconciling "seven sites" with column (2)'s ten
  asserted a subset relation the integers refute. Each was resolved in the next revision, verified
  resolved by the reviewer who raised it, and replaced.
- **The reviewers' verification got stronger as the rounds went on, which is why the loop did not
  self-terminate.** Round 7's repair moved from *reading* the suites to *running* them, and both
  lenses independently reproduced the same figure at HEAD — `npm test -- __tests__/advisory`,
  24 failed / 386 passed / 410 total across 15 suites — and each partitioned all 24 failures against
  the document's two populations with none left over and none double-counted. That is the strongest
  evidence any round in this phase produced, and it is also what surfaced
  `advisoryHarvest.test.js`'s `T-08-8`, a member four rounds of reading had missed. Better
  measurement kept finding real residue, so the document kept being right-shaped and non-approving.

## 3. Reviewers

## 4. Pattern of Disagreement

## 5. Best-Guess Root Cause

## 6. Recommendation

---

**Provenance**

- Engine version: 0.2.0
- Plugin version: 0.23.0
- Plugin compat: ^0.23.0
- Channel: engine
- Mode: latest (pin: n/a)
- Load root: /Users/kaneho/.local/share/mise/installs/node/20.20.1/lib/node_modules/@kaneho/pdlc-engine/vendor/workflows
