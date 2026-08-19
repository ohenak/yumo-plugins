# POSTMORTEM — Phase T (TSPEC) — pdlc-advisory-wave-gate

| Field | Value |
|---|---|
| Upstream | REQ → FSPEC → **TSPEC** |
| Downstream | DECISIONS, PLAN, PROPERTIES, IMPL |
| Cross-Reviews | `CROSS-REVIEW-product-manager-TSPEC-v1..v5.md`, `CROSS-REVIEW-test-engineer-TSPEC-v1..v5.md` |
| LEARNINGS | `docs/pdlc-advisory-wave-gate/LEARNINGS-pdlc-advisory-wave-gate.md` |

RESOLVED: yes

---

## 1. Phase

Phase T — technical specification. Document under review:
`docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md`.

The review loop did not converge within `MAX_REVIEW_ROUNDS = 5` and halted. The
TSPEC is at **v1.5** on `feat-pdlc-advisory-wave-gate`; the last *reviewed*
revision is **v1.4**. Round 5's findings were all addressed in v1.5 (commits
`2278cd7a`, `6bd7c090`, `efdd9d24`, `2ed04c2f`, `af4835d9`, `9e25251f`,
`f2705bf4`) but the budget was exhausted before a round-6 review could observe
them. **No finding is known-open on content; the open state is
verification, not authorship.**

## 2. Iterations (5 of 5 reached)

| Round | TSPEC | PM verdict | PM new findings | TE verdict | TE new findings |
|---|---|---|---|---|---|
| 1 | v1.0 | Needs revision | 8 (3H / 3M / 2L) | Needs revision | 12 (3H / 6M / 3L) |
| 2 | v1.1 | Needs revision | 3 (1H / 1M / 1L) | Needs revision | 8 (2H / 4M / 2L) |
| 3 | v1.2 | Needs revision | 3 (1H / 2M) | Needs revision | 5 (1H / 3M / 1L) |
| 4 | v1.3 | Needs revision | 3 (1H / 2M) | Needs revision | 3 (2H / 1M) |
| 5 | v1.4 | **Approved with minor changes** (0H / 1M / 1L) | 2 | Needs revision (1H / 1M / 1L) | 3 |
| — | v1.5 | *not reviewed — budget exhausted* | — | *not reviewed* | — |

Trend: new-finding volume fell monotonically for both reviewers (PM 8→3→3→3→2,
TE 12→8→5→3→3), and every prior-round finding was dispositioned **Resolved**
in the following round's disposition table, with two exceptions — PM F-01
round 3→4 ("Addressed, but replacement rule wrong") and TE F-21 round 3→4
("Not resolved; the replacement rule has a worse failure mode"). Those two are
the same defect seen through two lenses (see §4).

The loop was one round short. PM reached approval at round 5; TE's round-5
High (F-29) was narrow, self-described as "should be a small edit", and the
document already contained its own fix pattern.

## 3. Reviewers

| Role | Rounds | Final verdict | Residual at halt |
|---|---|---|---|
| product-manager | 1–5 | Approved with minor changes | F-01 (Medium), F-02 (Low) — both addressed in v1.5, unverified |
| test-engineer | 1–5 | Needs revision | F-29 (High), F-30 (Medium), F-31 (Low) — all addressed in v1.5, unverified |

The two lenses stayed in their lanes throughout. PM findings were
traceability- and AC-fidelity-shaped (`AC-3.4`'s closed refusal-reason set,
`AC-5.1`'s restoration boundary, `AC-4.1` conjunct (iii)). TE findings were
oracle-quality-shaped (AT-to-test-home mapping, absence-only oracles,
implementation-echo assertions, fixture discriminating power). There is no
role-vs-role contradiction anywhere in the ten reviews: no finding from one
reviewer was refuted by the other, and both signed off on the same mechanism
in round 5.

## 4. Pattern of Disagreement

The loop did not stall on disagreement between reviewers. It stalled on a
**single load-bearing mechanism that took four attempts to specify**: the rule
by which Phase A6's wave gate decides that a repair was genuinely *resolved*
(REQ `AC-4.1` conjunct (iii) / `AC-4.6`).

| Round | Rule proposed in §3.2 step 6 | Refuted by |
|---|---|---|
| 2→3 | ledger *growth equality* — `invocations` grew by exactly the wave's gate sequence | PM v3 F-01 (High): read literally, denies resolution genuinely reached on attempt 2+ |
| 3→4 | ledger *suffix* check — ledger ends with the gate sequence | PM v4 F-01 + TE F-21/F-26 (High, both): the first pass already appended that suffix, so the check passes on the exact mutation it exists to refuse |
| 4→5 | growth *measured from an anchor* — `sameSequence(invocations.slice(ledgerAtLastApply), gateSequence)`, `apply` records the anchor | PM v5: **resolved, correct**. TE v5 F-29 (High): the rule is right but unimplementable as written — `apply` lives in the top-level `buildA6SeamOps` export and physically cannot write a variable in `runWaveGateSeam`'s scope; §3.3's signature carries no carrier |
| 5→(none) | anchor passed as an explicit mutable `ledgerAnchor` carrier into `buildA6SeamOps`, named in §3.3's signature and `apply` row | *unreviewed* |

Three secondary observations about the shape of the loop:

1. **Each fix was correct at the layer it was written and defective at the
   layer below.** Round 3 fixed the semantics and broke the multi-attempt case;
   round 4 fixed the multi-attempt case and broke falsifiability; round 5 fixed
   falsifiability and left the plumbing unstated. No round regressed a
   previously-settled concern — the disposition tables confirm this — but each
   round's fix opened exactly one new question one level closer to the code.
2. **Reviewer citations were accurate throughout.** TE v5 verified `:3521`
   (`apply`) precedes `:3546` (`VERIFY`) and PM v5 independently verified the
   same ordering. The loop was not burning rounds on false findings; every
   High named a real defect.
3. **Round-5 residual severity had already collapsed.** Aggregate at halt:
   1 High, 2 Medium, 2 Low across both reviewers, against 6 High in round 1.
   The High-only convergence bar was missed by exactly one finding.

## 5. Best-Guess Root Cause

**The TSPEC was specifying a rule whose correctness depends on a fact about
the shipped driver's variable scoping, and the spec's own structure did not
force that fact to be stated until a reviewer went looking for it.**

Concretely: §3.2 (algorithm, prose + code sketch) and §3.3 (signatures and
seam-op contracts) are separate sections. A rule could be stated completely
and coherently in §3.2 while §3.3's signature silently failed to carry the
value the rule reads. Rounds 3, 4 and 5 each produced a §3.2 rule that was
locally sound; the defect each time lived in the gap between the two sections.
The document already had the antibody — §3.3's `declaredScope` row documents
exactly this idiom for `invocations` ("a live array, mutated in place, never
reassigned … because GATE test doubles shallow-copy the SeamOps object") —
but nothing forced the new anchor to be given the same treatment, so it wasn't,
for three rounds running.

Contributing factors, in descending confidence:

- **A6's `resolved` predicate is genuinely hard.** It must distinguish "the
  gate ran and passed after repair" from "the gate passed because it had
  already passed", against a driver whose attempt loop re-enters
  (`orchestrate-dev.js:3554`) and whose non-gating paths also increment the
  ledger (`:3421`, `:3428`, `:3459`). Four attempts on a predicate with this
  many adjacent near-misses is not obviously excessive.
- **The round budget was consumed by round 1's volume, not by round 5's
  difficulty.** 20 findings landed in round 1 (6 High). Rounds 1–2 were spent
  on breadth — missing AT mapping, under-scoped file table, coverage mechanics,
  disposition-object members — which were all resolved and never reopened.
  Only rounds 3–5 were spent on the mechanism that actually blocked
  convergence. A tighter round-1 draft would likely have left budget for it.
- **Serial single-mechanism refinement is the loop's worst case.** When
  N rounds each refute the previous round's fix for the *same* obligation,
  the loop cannot amortise: the budget is spent one attempt per round with no
  parallelism, and each attempt is only falsifiable after it is written.

Not a cause: reviewer disagreement, scope creep, upstream churn. REQ (v1.8)
and FSPEC (v1.3) were stable across rounds 3–5, and the one upstream-pending
item (OQ-7 / FSPEC `BR-9` / `AT-05-1`, the `.gitignore` restoration boundary)
was correctly routed as an erratum in round 2 and has not blocked Phase T
since.

## 6. Recommendation

**Resume Phase T with one review round against TSPEC v1.5. Do not re-author.**

Rationale: every round-5 finding is already addressed on the branch, by commits
that name the findings they close. The document is not incomplete; it is
unverified. Re-running authoring would violate the "no gratuitous writes" rule
and would burn the reopened budget on the same content.

Ordered steps for the operator:

1. **Verify the v1.5 edits by inspection** — specifically that §3.3's
   `buildA6SeamOps` signature carries the `ledgerAnchor` carrier, that its
   `apply` row states the write and §3.2 step 6 states the read with one
   spelling, that §3.3 names the carrier's initial (fail-closed) value and ties
   its lifetime to `invocations`' lifetime (TE Q-01), and that §5.5's mutation
   fixtures state they build real seam ops and replace `verifyGate` only
   (TE F-30).
2. **Flip `RESOLVED: no` → `RESOLVED: yes` in this file** only after step 1,
   and re-invoke `orchestrate-dev`. Phase T will re-run with a fresh
   per-invocation round budget; note `MAX_LIFETIME_ROUNDS = 15` still applies
   (10 rounds consumed).
3. **Expect a short round.** PM is at "Approved with minor changes" with two
   non-gating findings, both addressed. TE's residual is one High whose fix is
   the `declaredScope` idiom already shipped in the same section. A single
   round-6 pair should converge.
4. **If round 6 does not converge on the same mechanism**, escalate rather
   than iterate: the anchor question would then be an implementation-shape
   question, not a specification question, and belongs in DECISIONS with a
   named alternative (e.g. `runWaveGateSeam` computing the predicate itself
   from a wave-local closure, with `buildA6SeamOps` left anchor-free) rather
   than in a seventh TSPEC revision.

Carry forward to LEARNINGS (Phase H):

- When a spec rule reads a value produced elsewhere in the same spec, the
  section that declares the *signature* must be edited in the same write as
  the section that declares the *rule*. Three rounds were lost to editing one
  without the other.
- A document that has solved a plumbing problem once (`declaredScope`) should
  be grepped for that precedent whenever a new value needs the same treatment
  — the antibody existed and went unused for three rounds.
- Round-1 finding volume is the practical constraint on convergence, not
  round-5 difficulty. Front-loading the AT-mapping and file-table completeness
  work into the first draft protects budget for the one mechanism that is
  actually hard.


**Provenance**
- Engine version: 0.2.0
- Plugin version: 0.23.0
- Plugin compat: ^0.23.0
- Channel: engine
- Mode: latest (pin: n/a)
- Load root: /Users/kaneho/.local/share/mise/installs/node/20.20.1/lib/node_modules/@kaneho/pdlc-engine/vendor/workflows
