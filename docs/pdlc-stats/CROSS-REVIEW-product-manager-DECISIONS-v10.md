# Cross-Review: product-manager — DECISIONS (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-stats/DECISIONS-pdlc-stats.md` (v1.6, bytes unchanged)
**Base reviewed at v9:** `7adc9666196cca6357174fcbb513b6a6f597af2f`
**Upstream HEAD this round:** REQ `5f3e8051…` (v1.6) · FSPEC `c7d2c832…` (v1.7) · TSPEC `f2261510…` / blob `a06a6032…` (v1.7)
**TSPEC reviewed at v9:** `3742216…` (v1.6)
**Date:** 2026-08-31
**Iteration:** 10 (upstream-cascade confirmation — TSPEC erratum round 7)

## Context

**What moved: upstream only.** `git diff 7adc9666..HEAD -- docs/pdlc-stats/DECISIONS-pdlc-stats.md`
is empty. This document has not been edited since I approved it at v8 and re-confirmed it at v9; its
bytes are still v1.6. What changed is **TSPEC**, from `3742216…` (v1.6) to `a06a6032…` (v1.7) across
three commits — `e1315dcdb`, `fd4b7b3ab`, `bf496d9aa`. So my v9 approval was taken against a TSPEC
revision that no longer exists, and the single question this round answers is whether DECISIONS is
still a faithful compression of TSPEC **as it now stands**.

**REQ and FSPEC did not move.** Both dispatch pins match HEAD exactly: REQ
`5f3e80519b982f29…` (v1.6) and FSPEC `c7d2c832dee586c8…` (v1.7) are the same revisions v9 measured.
The TSPEC pin in this dispatch (`f2261510…`) is the first dispatch pin in four rounds that I could
not reconcile against a blob on this branch — the file's own content hashes to `a06a6032…` — but
unlike the `512a9fcf…` pin carried through v7/v8, the dispatch's *stated version* (TSPEC after
erratum round 7) resolves unambiguously to HEAD, so re-grounding on HEAD per `DEC-ERR-03` is
uncontroversial here and I say so once rather than re-opening it.

**What the TSPEC edit actually did.** Read in full, `git diff 4943a8777..HEAD --
docs/pdlc-stats/TSPEC-pdlc-stats.md` is +23/−3 and does one substantive thing: it corrects §2.1's
`coverageInstrumentation.test.js` row. That row had described P9-02's title as moving *six → seven*.
It now states the measured direction — the feature moves the set **seven → eight** — and adds that
the test title's word `six` and the adjacent comment's "three entries" phrasing are **already stale
at HEAD**, independent of this feature. The v1.7 changelog attributes the correction to `pm-review`,
`se-author` and `te-review` jointly, and the stale `six → seven` restatement in the v1.3 changelog
has its number removed so it cannot be misread as a live claim. No `BR-`, `E-` or `AC-` row moved,
no vocabulary renamed, no site added to or removed from §2.1's ten.

**This is the erratum I have routed upstream since v6.** F-01 in my v6, v7, v8 and v9 rounds was
exactly this divergence: DECISIONS' K-3 carries *seven → eight*, TSPEC §2.1 carried *six → seven*,
the arithmetic here is right and the repair is owed upstream. TSPEC v1.7 discharges it. **The
cascade moved upstream toward this document, not away from it.**

**What I re-measured mechanically rather than inheriting.** DECISIONS' load-bearing arithmetic is
now asserted by both documents, so I re-ran it against the repository rather than trusting either:

| Claim | How checked | Result at HEAD |
|---|---|---|
| `c8.include` holds seven entries | read `pdlc/workflows/package.json` | seven `**/`-anchored entries |
| `REQUIRED_INCLUDES` holds four | read `coverageInstrumentation.test.js` | four (`orchestrate-dev.js`, `orchestrate-queue.js`, `build-runtime.mjs`, `scripts/check-wave-resume-delta-coverage.mjs`) |
| literal `4 + 1 + 2` = seven | derived | seven; feature makes it **eight** |
| §2.1's ten co-change sites unchanged | diffed the site table | no row added or removed |

I did **not** re-open `DEC-STATS-01`'s chosen option, `DEC-STATS-02`, `DEC-STATS-03`, the option
table, K-1 through K-9 on their merits, or the *Standing costs accepted* bullets. None changed, and
all were approved across v5–v9.

## Options Considered

The bytes in front of me are frozen. Only the relationship to upstream can have broken, and there
are three readings of what an upstream correction *toward* this document does to its approval. I
state them rather than leaving the choice implicit.

**Reading 1 — TSPEC moved, so DECISIONS is stale and owes a re-grounding round.** Rejected on
evidence. Staleness is a defect only when it changes something. The TSPEC v1.6→v1.7 delta touches
exactly one row of §2.1 plus two changelog restatements of it. DECISIONS decides module boundaries,
seam identity and co-change cost; the corrected row is inside its subject matter, so I checked it
directly rather than waiting out the diff — and the check comes back agreeing, not diverging. No
`BR-`/`E-`/`AC-` row moved, no decision was opened upstream this round that DECISIONS owes
absorption for. TSPEC's own v1.7 changelog says so explicitly: *"no upstream decision absorbed this
round"*. There is nothing to re-ground.

**Reading 2 — the correction lands upstream, so DECISIONS' K-3 divergence clause is now a live
falsehood and must be edited.** Rejected as a *gating* reading, accepted as a finding. K-3's clause
says the divergence is *"owed upstream in TSPEC and not resolved here (TE F-05)"*. At TSPEC v1.7 it
**is** resolved there. That sentence no longer describes HEAD. But weigh what it costs: the number
K-3 carries (`seven → eight`) was always correct and is now corroborated upstream; the obligation
K-3 states — add the `**/`-anchored `lib/stats.mjs` entry to `c8.include`, add the matching member to
P9-02's expected literal, fix the stale title and comment words — is unchanged and correctly sized;
and the falsifier cell PLAN reads to place its red test is untouched. Nothing an implementer or a
PLAN author *does* changes. What goes wrong is narrower and real: a reader of K-3 is told to chase a
repair upstream that has already landed. That is a bookkeeping defect in a routing note, not a
misdirection of work — **Low**, recorded, not gating. Editing frozen bytes to close it would open a
downstream obligation (PLAN and PROPERTIES are approved beneath this document) that nobody was asked
to discharge, which is the same reasoning v1.6 used when it declined to edit TSPEC from a DECISIONS
dispatch, and it holds symmetrically here.

**Reading 3 — test whether the document's load-bearing claims still hold at HEAD, and route what
does not.** Adopted. It is the only question a frozen round can honestly answer, and this document
passes it. Every claim DECISIONS leans on TSPEC for — the ten-site co-change set, its partition
across K-1/K-3/K-8/K-9, the seven-entry `c8.include`, the four-entry `REQUIRED_INCLUDES`, the
`4 + 1 + 2` literal, the `MODULE_NAMES` copied-class (4 → 5) versus packed-class (5 → 6) distinction,
K-7's sibling-document carve-out sitting *outside* the ten — I re-read against TSPEC v1.7 and against
the shipped code. All hold, and one of them holds *better* than it did at v9.

**The bar I am applying is the one I set at v9, unchanged.** Under a decision freeze, only two things
may block: a defect the revision introduced (there is no revision, so this limb is vacuous), and a
factual contradiction between this document and repository/upstream HEAD. The second limb is the
whole of this round's work, and it produced one contradiction — K-3's *"not resolved here"* clause —
whose severity I calibrate to what a reader would mis-*do*, which is nothing.

## Decision

**Approved with minor changes.** Zero High. Two Low — one `delta`/`local`, one `inherited`/`nonlocal`
— and neither is actionable inside this document while it is frozen.

**DECISIONS still holds as approved against TSPEC v1.7.** The load-bearing claims, re-tested against
upstream at its current version and against the shipped code:

| Load-bearing claim in DECISIONS | Status at HEAD |
|---|---|
| `pdlc/workflows/package.json`'s `c8.include` holds **seven** entries | True — seven `**/`-anchored entries |
| `REQUIRED_INCLUDES` holds **four**, so P9-02's literal `4 + 1 + 2` is seven | True — four entries, third and fourth are `build-runtime.mjs` and `scripts/check-wave-resume-delta-coverage.mjs` |
| This feature moves the include set **seven → eight** | True — one added member; **and TSPEC §2.1 now states the same** |
| The co-change set is **ten sites**, set-equal to TSPEC §2.1's ten | True — no row added or removed by the v1.7 edit |
| K-7's two sibling-document edits sit **outside** the ten | True — TSPEC §1 and §2.1 both read "outside" since v1.5, unchanged |
| `MODULE_NAMES` copied class moves 4 → 5, packed class 5 → 6, not synchronised | True — TSPEC's README row restates exactly this, unchanged |
| P-1's title quote: "MODULE_NAMES contains exactly the four canonical workflow modules" | True — `learningsPremises.test.js` unchanged |
| K-3's falsifier: P9-02 `toEqual`, array-equality, position-sensitive | True — shipped assertion unchanged |

**The one carried divergence is now closed, and closed upstream where I routed it.** From v6 through
v9 I carried a single inherited Low: TSPEC §2.1 said *six → seven*, DECISIONS said *seven → eight*,
the measurement backed DECISIONS, and the repair was owed to TSPEC. TSPEC v1.7 makes that repair.
**I am retiring that finding, not re-carrying it.** This is worth stating plainly because it is the
outcome the erratum channel exists to produce: a downstream document held a correct number against
four rounds of pressure to match a wrong one, and upstream came to it. The v1.6 decision *not* to
match TSPEC's number into false agreement is vindicated by this round.

**What replaces it is strictly smaller.** K-3's clause routing the erratum upstream is now stale in
the harmless direction — it describes a debt already paid. That is F-01 below, `delta` because the
TSPEC edit created the staleness, `local` because it sits in the DECISIONS section that mirrors the
edited TSPEC row, Low because no number, obligation, falsifier or task boundary changes.

**No new decision is opened here.** The freeze holds. Beyond F-01 and the carried changelog-tense
observation, I record two deferred items rather than manufacturing questions:

DEFERRED: when a routed erratum is discharged upstream, the downstream document that routed it holds
a clause asserting the debt is open. Nothing in the pipeline retires that clause — it is discovered
only by a cascade confirmation like this one. Worth a line in the erratum checklist rather than a
constraint.

DEFERRED: the dispatch's TSPEC pin (`f2261510…`) does not match the file's content hash (`a06a6032…`).
The *version* it names is unambiguous, so this round was not impeded, but it is the third consecutive
round whose TSPEC pin did not resolve to a blob on this branch. Pipeline observation, not a document
defect; recorded, not raised as a finding against DECISIONS.

## Consequences

**For Phase D / PLAN.** Not blocked, and marginally better off than at v9. PLAN reads DECISIONS' ten
-site table, the K-row partition and the falsifier column; all three are intact and now agree with
TSPEC §2.1 on **both** the site set and the include-count direction. The one place the two documents
disagreed for four rounds is gone, so a PLAN author no longer has to pick a number. The co-change set
still partitions mechanically: ten in-repo sites, four K-rows covering them with deliberate overlap,
two sibling-document edits owned separately under K-7 and explicitly outside the ten, one site
(`pdlc/README.md`) flagged as having no falsifier behind it.

**For the implementer.** Unchanged from v8/v9. The array-equality warning on `c8.include` still
matters (P9-02 asserts `toEqual`, so position matters, not just membership); the `MODULE_NAMES`
copied-versus-packed distinction (4 → 5 and 5 → 6 are two different counts and must **not** be
synchronised to each other) still matters; K-9's `pdlc/README.md` site still has no red behind it and
is caught only by review. One thing gets easier: the test title and comment words in
`coverageInstrumentation.test.js` are now described identically by TSPEC and DECISIONS, so the
implementer who follows either lands the same edit.

**For upstream (TSPEC).** Nothing further owed to this document. TSPEC v1.7 discharged the one item
DECISIONS routed to it. I want to record the shape of the fix approvingly: rather than editing the
shipped test title to match the spec, it corrected the *spec* to the measurement and named the title
and comment as independently stale at HEAD. That keeps the spec a description of the repository
rather than a wish about it.

**For upstream (REQ / FSPEC).** Nothing owed. Neither moved this round. TSPEC §8.3's
REQ-STATS-06-versus-BR-16 conflict is still open upstream and still outside what DECISIONS decides —
it settles AT-17's fourth-leg expected value, not a module boundary or a seam. If that reconciliation
ever reaches the parser-catalogue seam, `DEC-STATS-03`'s bundle-identity oracle is where to re-check;
nothing today makes that likely. This is the second consecutive round in which substantial upstream
movement landed entirely outside this document's subject matter, which is a healthy signal about the
seam: a document confined to module boundaries and co-change cost should be able to sit through
upstream revisions of halt states, harvested-family scoping and basename shape without owing a round.

**For harvest.** One durable signal, and I flag it as `Process` rather than inflating its severity or
proposing a `DOMAIN-CONSTRAINTS.md` entry:

- **A routed erratum leaves a stale claim in the document that routed it.** DECISIONS correctly
  recorded "this divergence is owed upstream and not resolved here". When upstream resolved it, that
  clause silently became false, and nothing in the pipeline retires it — no phase re-reads a frozen
  downstream document to check whether its outstanding-debt notes are still outstanding. The fix is a
  line in the erratum checklist: when an erratum lands upstream, note the downstream documents whose
  routing clauses it retires. That is a workflow-prompt shape, not a domain invariant.

**On the previously-harvested signal, unchanged.** The v9 observation stands: an attestation that
reads "upstream did not move" is only sound if the round compared *two* hashes — the previously
grounded one and the current one. This round's TSPEC v1.7 changelog does exactly that correctly,
which is evidence the lesson has already taken hold.

## Delta-Confirmation Findings

_pending_

## Verdict

_pending_
