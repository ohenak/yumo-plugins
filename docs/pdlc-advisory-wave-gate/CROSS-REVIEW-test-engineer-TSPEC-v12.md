# Cross-Review: test-engineer — TSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md`
**Date:** 2026-08-19
**Iteration:** 12 (delta confirmation on a previously approved document)

## Scope

This is a **delta confirmation**, not a re-review. TSPEC was approved at v1.10; a single targeted
erratum edit landed in commit `1f2a4fbf` (*"docs(tspec): size PROP-SWEEP-2(b) residue in 1.3 and
route it to PLAN"*). The question answered here is narrow: does the delta resolve the routed item
without breaking anything previously approved, and — per DEC-ERR-03 — does the document still
faithfully compress the upstream it leans on, read at the upstream's *current* bytes?

Routed item under confirmation: §1.3's repository-hygiene note sized the residue commit `e3b9d5a3`
left as the tracked `.claude/workflows/.pdlc-backups/*.bak` blobs alone, which under-states the
`PROP-SWEEP-2(b)` residual and names no owner for the part this branch cannot close.

The erratum is confined to two places, both prose, both in-scope:

| Site | Edit | Design claim moved? |
|---|---|---|
| Changelog, v1.10 entry | Appends a *"Phase-P erratum (this dispatch)"* sentence recording the sizing and the routing | No |
| §1.3, after the revert-vs-re-derive routing paragraph | New paragraph *"Sizing the hygiene residue, and where it is owned"* | No |

No table, oracle, seam contract, cardinality pin or transcription surface elsewhere in the document
was touched. `git diff` over the erratum commit shows exactly two hunks, both additive.

## Design

Nothing in the document's design content changed, and I re-checked the two structures the new
paragraph sits next to, because a paragraph inserted into §1.3 could have displaced or contradicted
them:

- The eight-row HEAD-drift surface table in §1.3 (the `A6` transcription residue: seam list,
  envelope defaults, config defaults, per-seam report rows, gate-exclusivity registry, harvest /
  property seam lists, the four bare row-count sites, and the `.enabled` occurrence count) is
  byte-unchanged and still reads the same at HEAD.
- The revert-vs-re-derive routing paragraph immediately above the insertion is unchanged, and the
  new paragraph is consistent with it rather than a second, competing routing: it routes *sizing
  and ownership* to PLAN's Overview HEAD-drift note and A6-00's Edit 1, which is where PLAN v1.7 and
  v1.9 actually put them. I verified both landing sites exist in PLAN at HEAD and carry the
  partition, the owners and the figures the paragraph defers to.
- The new paragraph's back-reference (*"The `.bak` blobs named above"*) resolves: the blobs are named
  earlier in the same §1.3, so the paragraph is not orphaned by a later section reorder.

The design-neutrality claim in the changelog (*"Sizing and routing only … no design claim moves"*)
holds as written.

## Seams

The delta names one oracle seam, and I exercised it rather than trusting the prose. The paragraph
cites `PROP-SWEEP-2(b)` in `pdlc/workflows/__tests__/documentOracles.test.js`, the case titled
*"the unfiltered sweep minus A-1's frozen glob list is empty"*. That case exists at HEAD, its title
is quoted verbatim, and its shape is as described: it assembles the seven-term sweep over
`git ls-files`, subtracts A-1's fifteen frozen globs via a local glob-to-RegExp helper, and asserts
the remainder set-equals the empty list. The citation is accurate and the seam is the right one to
size the residue against.

I re-ran that subtraction against the live tree to check the paragraph's three-class partition:

| Class | Paragraph says | Measured at review-time HEAD |
|---|---|---|
| 1 — backup blobs | 14 `.claude/workflows/.pdlc-backups/*.bak` | **14** — matches exactly |
| 2 — consumer-runtime artifacts | 4 named paths, *"all four branch-introduced by the same commit"* | **4** — matches; none of the four is present in the tree at merge-base `1efb9a3b`, which is PLAN's deciding provenance leg |
| 3 — this feature's own documents | `TSPEC`, `PLAN`, `DECISIONS`, `PROPERTIES` and its `CROSS-REVIEW-*` files | **14** at review time — the four named documents plus ten cross-review files |

The partition itself is sound: every residual path at HEAD falls into exactly one of the three
classes, and no fourth class exists. The class-2 flat provenance claim is also defensible — PLAN
carries a caveat that two of the four artifacts have an earlier superseded add on an ancestor of
the merge-base, but the *deciding* leg (tracked-at-merge-base) says branch-introduced for all four,
and that is the leg the paragraph's claim rests on. No finding there.

## Data Model

The only "data" the delta introduces is a set of counts, so I treated them as claims under test.

- **14 closable** — matches the measured class-1 size exactly, and matches A6-00's Edit 1, which
  untracks those blobs *and* adds the bare directory rule to `.gitignore`. The closure claim is
  arithmetically and mechanically true.
- **28 total, "at PLAN's dated 2026-08-19 measurement"** — this is date-stamped and explicitly
  attributed to PLAN rather than asserted as an invariant, which is the right shape. At review time
  the same subtraction reports **32**, because five cross-review files have been committed since the
  measurement. The paragraph anticipates this and states the growth mechanism, so the figure is not
  misleading; it is, however, already stale on the same calendar day (F-02).
- **"the other 14 are not closable on this branch"** — true at the dated measurement, 18 at review
  time. Same drift, same cause. PLAN's own v1.9 round deliberately stopped restating `28`/`14` in the
  DoD for exactly this reason and pointed at the Overview instead; TSPEC's paragraph re-introduces
  the absolute pair one layer up. It is narrative rather than a gate, and it does defer ownership in
  the very next sentence, so this is Low, not gating (F-02).
- **"grow by one per *committed* cross-review file"** — over-stated. Only cross-review files that
  quote one of L-2's seven grep terms enter the sweep. At HEAD, ten of the feature's committed
  cross-review files are in the residual and several others are not (this file, written to avoid
  quoting those terms verbatim, will not be) (F-03).

## Verification

**Upstream fidelity re-check (DEC-ERR-03).** The confirmation is scoped to the document against its
upstream at HEAD, not to the routed-item list, so I re-read the upstream anchors rather than
assuming them:

| Upstream | Version at HEAD | Digest at HEAD | TSPEC's recorded anchor | Verdict |
|---|---|---|---|---|
| REQ | 1.9 | `sha256:817b6745…` | v1.9, `sha256:817b6745…` (v1.9 changelog) | Faithful |
| FSPEC | 1.4 | `sha256:82f74a2d…` | v1.4, `sha256:82f74a2d…` (header + v1.9 changelog) | Faithful |

Neither upstream has moved since the approval round: the last REQ commit is `e619b6d6` (v1.9) and
the last FSPEC commit is `0737fdc5` (v1.4), both already absorbed. Nothing the document cites has
changed wording or stopped saying what TSPEC compresses it as saying. No inherited upstream-drift
finding is owed.

**What I re-ran, rather than read.** Per the falsifiability bar, every count in the delta was
re-derived from the tree, not taken from the prose: the seven-term sweep over `git ls-files`, the
fifteen-glob subtraction reproduced from the oracle's own helper, the class-1/2/3 partition of the
result, and the merge-base tracked-set check behind the class-2 provenance claim. The oracle case
name and file path in the citation were confirmed to exist verbatim.

**Testability impact of the delta: none, in either direction.** The paragraph adds no acceptance
criterion, no oracle obligation and no test-level assignment. It also does not weaken one: it does
not tell Phase I to expect `PROP-SWEEP-2(b)` green, and PLAN's batch-1 gate wording already carries
the matching inherited-red rule (*"PROP-SWEEP-2(b) is only partly closed … the oracle stays red at
the wave boundary"*). Document and PLAN agree on the expected-red channel, which is the property
that actually matters for Phase I not mistaking an unowned red for drift. Previously approved
content is intact.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|-------------|
| F-01 | Low | Process | The document's bytes changed but its version did not: the header still reads **v1.10** and the erratum is appended inside the existing v1.10 changelog entry rather than opening a v1.11 row. Two distinct byte states now both answer to "TSPEC v1.10", while downstream `PLAN`/`PROPERTIES` cite the document by version. Prior erratum rounds (v1.9 → v1.10) each took a new version row; this one did not. Mechanical traceability still works via the tier-1 commit/hash anchors, which is why this is Low. Suggested fix: open a v1.11 row carrying the erratum sentence and bump the header. | Header table; Changelog v1.10 |
| F-02 | Low | Local | The absolute pair **28 total / 14 not closable** is already stale on the same calendar day — the same subtraction reports 32 / 18 at review-time HEAD, because class 3 grew by five committed cross-review files. The paragraph date-stamps the figure, attributes it to PLAN and states the growth mechanism, so it does not mislead; but PLAN v1.9 deliberately removed the same absolute pair from the DoD for exactly this reason. Suggested fix: keep the invariant half (*"14 are closable here; the remainder is class 2 plus a class 3 that grows"*) and drop the standalone `28`/`14`, letting PLAN's dated note be the single owner of the numbers, as the paragraph's own last sentence already promises. | §1.3, *"Sizing the hygiene residue"* |
| F-03 | Low | Local | *"which therefore grow by one per **committed** cross-review file"* over-states the growth rule: only cross-review files that quote one of L-2's seven grep terms enter the sweep. At HEAD, ten of the feature's committed cross-review files are residual members and several others are not. Suggested fix: qualify as *"per committed cross-review file that quotes an L-2 term"* — which also documents the avoidance discipline reviewers can apply. | §1.3, *"Sizing the hygiene residue"* |

All three are Low. No High and no Medium finding is raised, so the previously approved status is not
disturbed and the erratum does not earn a follow-up revision round on its own account.

## Obligations

| ID | Item |
|----|------|
| Q-01 | None blocking. F-01's version bump is the only item worth folding into whatever edit lands next on this document; F-02 and F-03 can ride the same edit or be left as recorded observations, since no oracle and no gate reads this paragraph. |

Delta-confirmation tags (also emitted as `FINDING:` lines with the verdict trailer): F-01 is
`{delta, local}` — the erratum edit is what changed the bytes without changing the version. F-02 and
F-03 are `{delta, local}` — both sit inside the text the erratum introduced.

## Positive Observations

- The paragraph does the thing that makes a routed item genuinely closable: it names a **specific
  oracle case** (`PROP-SWEEP-2(b)`, by file and by verbatim test title) as the instrument that
  measures the residue, so the size claim is falsifiable by re-running one test rather than by
  agreeing with prose. I could re-derive every figure from that citation alone.
- The three-class partition is exactly right at HEAD — no residual path escapes it, and no empty
  fourth class is invented. The class boundaries are also the *ownership* boundaries, which is what
  makes the routing meaningful rather than decorative.
- It resists the temptation to re-litigate. The disposition stays with PLAN's Overview HEAD-drift
  note and A6-00's Edit 1, and the paragraph says so explicitly, so there is now exactly one owner of
  the figures instead of two competing ones.
- It states its own reason for existing (*"so that no reader mistakes the `.bak` blobs for the whole
  residue"*), which is the right altitude for a TSPEC: size and route, do not decide.
- The growth mechanism for class 3 is disclosed rather than hidden, so a future reader who measures
  a larger number will read it as expected behaviour, not as a regression. F-02 and F-03 are
  refinements of that disclosure, not objections to it.

## Recommendation

**Approved with minor changes.**

The delta resolves the routed item — the residue is now sized with a measured, dated, oracle-backed
figure, partitioned into three classes, and routed to a named owner — and it breaks nothing that was
previously approved. Upstream REQ v1.9 and FSPEC v1.4 are unchanged at HEAD and the document remains
a faithful compression of both. The three Low findings are refinements of the new paragraph's own
wording; none gates.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 3}

