# LEARNINGS — pdlc-consolidation-agent

| Field | Detail |
|---|---|
| Feature | pdlc-consolidation-agent |
| REQ | docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md |
| Date Completed | 2026-08-11 |
| Total Iterations | REQ: 21, FSPEC: 18, TSPEC: 18, DECISIONS: 9, PLAN: 10, PROPERTIES: 9, IMPL: 2 (Phase CR implementation lens) + 3 (Phase CR codebase review), DoD: 6 |
| Upstream | REQ → FSPEC → TSPEC → DECISIONS → PLAN → PROPERTIES → IMPL |
| Harvested from | 190 files, enumerated in the table below — all deleted by the sweep commit that follows this document |
| Phases exercised | R, F, T (absorbing D), D, P, PR, I, CR, DOD, H |
| DoD rounds | 6 (`CODE_REVIEW-pdlc-consolidation-agent-v{1..6}.md`; v1–v5 `DOD_STATUS: failed`, v6 `failed` on one documentation erratum) |

### Harvested from — full enumeration

| Family | Count |
|---|---|
| `CODE_REVIEW-pdlc-consolidation-agent-v{1..6}.md` | 6 |
| `CROSS-REVIEW-product-manager-DECISIONS-v{1..9}.md` | 9 |
| `CROSS-REVIEW-product-manager-IMPLEMENTATION-v{1..2}.md` | 2 |
| `CROSS-REVIEW-product-manager-PLAN-v{1..10}.md` | 10 |
| `CROSS-REVIEW-product-manager-PROPERTIES-v{1..9}.md` | 9 |
| `CROSS-REVIEW-product-manager-REVIEW-v{1..3}.md` | 3 |
| `CROSS-REVIEW-product-manager-TSPEC-v{1..18}.md` | 18 |
| `CROSS-REVIEW-software-engineer-FSPEC-v{1..18}.md` | 18 |
| `CROSS-REVIEW-software-engineer-PROPERTIES-v{1..9}.md` | 9 |
| `CROSS-REVIEW-software-engineer-REQ-v{1..21}.md` | 21 |
| `CROSS-REVIEW-test-engineer-DECISIONS-v{1..9}.md` | 9 |
| `CROSS-REVIEW-test-engineer-FSPEC-v{1..18}.md` | 18 |
| `CROSS-REVIEW-test-engineer-IMPLEMENTATION-v1.md` | 1 |
| `CROSS-REVIEW-test-engineer-PLAN-v{1,2,3,4,5,6,7,8,10}.md` | 9 |
| `CROSS-REVIEW-test-engineer-REQ-v{1..21}.md` | 21 |
| `CROSS-REVIEW-test-engineer-REVIEW-v{1..3}.md` | 3 |
| `CROSS-REVIEW-test-engineer-TSPEC-v{1..18}.md` | 18 |
| `POSTMORTEM-{D,F,P,PR,R,T}-pdlc-consolidation-agent.md` | 6 |
| **Total** | **190** |

Two files in `docs/pdlc-consolidation-agent/` that look adjacent are **not** harvest-class and were
deliberately kept: `ITERATION-ANALYSIS-pdlc-consolidation-agent.md` (an operator-authored token-burn
accounting, cited throughout §4 below) and the six specification documents.

**Headline.** This is the largest corpus the pipeline has produced — 84 lifetime review rounds across
six documents, 178 cross-reviews, 6 DoD rounds, 6 POSTMORTEMs covering **nine** halt episodes, and
~558 commits. It converged. The durable finding is not that any document was wrong: across 178
reviews **no reviewer was ever shown to be wrong**, the only withdrawn claim in the record is a
reviewer withdrawing its own in the document's favour, and 100% of prior-round findings were closed
as filed in every counted round of every phase. What failed, repeatedly and in five structurally
distinct ways, is the **loop around** the documents.

## 1. Non-Convergences

Nine halt episodes across six POSTMORTEM files. Four are round-budget exhaustion; four are erratum-
channel failures; one is a DoD loop that outran its own round budget. Every one was cleared by an
operator, and every `RESOLVED:` marker in the corpus reads `yes`.

| Phase | Reviewer | Issue | Resolution | Iteration Count |
|---|---|---|---|---|
| R (window 1, rounds 1–5) | se-review + te-review, no disagreement | **Propagation debt.** The REQ nominated half a dozen enumerations as normative set-equality oracles, so every semantic change had to be propagated to N tables and one missed cell was blocking by the document's own standard. Severity fell 14 H → 0 H; the budget, not the defect stock, bound | Operator verified all ten v5 findings closed against the tree (not commit messages), ran a propagation sweep over all six self-nominated oracles (SWEEP CLEAN), flipped the marker | 5 (limit) |
| R (window 2, rounds 6–10) | se-review (never approved) vs te-review (approved 3 of last 4) | **Relocation debt + an unadjudicated severity split.** The REQ sat 344–437 bytes under a hard 61,440-byte ceiling, so every round had to relocate normative text out of the REQ to pay for its own fixes; each relocation opened a fresh ownership/oracle-range seam in a shared `docs/_constraints/` file. SE scored each seam Medium (blocking), TE scored it Low. One blocking Medium per round, indefinitely | Operator adjudicated the split explicitly and recorded it as `DEC-SEV-01` (a governance-rule scope gap detectable through a version-pin clause is Low); swept both constraints files for rules whose scope is stated as a section list; froze the structure for the confirming round | 5 (limit); 10 cumulative |
| F (window 1, rounds 1–5) | se-review + te-review, zero contradicted findings | **Repairs manufacture defects at a roughly constant rate.** High drained monotonically 12 → 6 → 2 → 0 (original-draft defects, consumed by repair); Medium stayed flat at 4–5 (manufactured by repair). Root cause: implementable-layer decisions — tie-breaks, reader indices, seam permitted-sets, fixture construction — were being settled at FSPEC layer. Symptom: FSPEC at 4.1× its REQ's byte size | Verified all nine findings closed; declared a **mechanism freeze** for the confirming round; recorded `DEC-LAYER-01` (`DECISIONS-spec-layer-boundary.md`) moving those four decision classes below FSPEC | 5 (limit) |
| F (window 2, rounds 6–10) | se-review approved rounds 7–8; te-review approved round 6 — **never in the same round** | **Anti-phase approval.** The countermeasures worked on their target (mechanism-class Medium gone, Medium rate −75%) and the window still exhausted, because convergence required *simultaneous* approval over a document that changes between every judgement. The round that satisfies one reviewer is the round whose repair text gives the other something new to check. Residual class: a completeness universal over a register the same round enlarged | Recorded `DEC-CONV-01` (`DECISIONS-review-convergence.md`) — an approval **carries forward** and is re-opened only by its own reviewer on a Scope-touching diff or a new Medium+; recorded `DEC-SEV-02` (a falsified bookkeeping-completeness assertion whose repair is deletion is Low); extended the freeze to a **register freeze** — *delete completeness universals rather than repairing them* | 5 (limit); 10 cumulative. With carry-forward the window would have converged at **round 7** |
| T (episode 1, TSPEC rounds 1–5) | pm-review + te-review, **no approval in any round** | **A layer boundary without a collision-disposition rule.** `DEC-LAYER-01` moved decisions down to TSPEC as designed; it did not supply a rule for the case where a correct local decision falsifies an *enumerated* upstream row. Every such collision became a fresh High, and collisions are generated by the act of deciding. High ran 9 → 1 → 1 → 0 → 1 — regenerated twice after reaching zero. `DEC-CONV-01` was inert: it can only carry an approval that was granted | Recorded `DEC-SEV-03` — **a named, priced and erratum-routed upstream collision is Low; High only when the collision is absorbed silently. Severity attaches to the concealment, never to the collision.** Declared a decision freeze for the confirming round | 5 (limit) |
| T (episode 2, PROPERTIES erratum confirmation, round 5 of 5) | pm-review **Approved** / se-review **Needs revision** (1 High) on identical bytes | **A multi-layer erratum wave has no synchronisation point.** The routing list was minted when the wave opened (REQ v2.1) and travelled unchanged while the wave kept deciding; by the time the tail layer (PROPERTIES) was dispatched, REQ v2.5 had grown a **second arm** that the list did not carry. All six routed items were absorbed — correctly, and more strongly than asked — and the document still shipped a hole. PM ran the protocol check (*absorbed ⊇ raised*) and passed it; SE ran a superset check against upstream HEAD and failed it | PROPERTIES v1.5 added the all-unreadable-corpus arm to `PROP-COR-09` with no new id; recommended `DEC-ERR-02`/`DEC-ERR-03` — routing lists re-derived **at dispatch**, and the superset read made the stated obligation for *both* confirming channels | 5 (limit) + 1 erratum round (limit) |
| P (PLAN converged; TSPEC erratum round 8 failed confirmation) | pm-review **Approved w/ minor** vs te-review **Needs revision** (1 H, 2 M) — the first genuine reviewer disagreement in 60 reviews | **The erratum channel confirms a document against the items raised against it, never against the current state of its own upstream.** 13 erratum lines, 6 distinct defects, **100% resolved**, and the confirmation failed anyway on three findings **none of which anyone had raised**. Phase P raised only the *countable* residue of an upstream change (3 missing register ids, a count of 96 vs 99) because a set difference is what a downstream reader can falsify from where it stands; the *semantic* half (FSPEC v11.3's `RELEASED:` sentinel decision, landed 71 minutes earlier) reached nobody. One repair also minted a brand-new blocking finding — an oracle red on correct code — inside a four-minute round | TSPEC v2.0 adopted the sentinel (closing two findings together, without contradicting the reasoning both reviewers had already approved); recorded **`DEC-ERR-01`** — *a collision whose upstream has already decided is absorbed, never routed; routing a settled question is a false statement in a hand-off section*; added the **upstream re-grounding step** to `CLAUDE.md` and to `{pm,se,te}-author/SKILL.md` | PLAN 2 of 5 rounds (**converged**); erratum round 1 of 1 (failed) |
| D (DECISIONS converged; FSPEC erratum confirmation) | se-review file said `Approved`; orchestrator scored it non-approving | **A transport fault became a phase halt.** Both confirmation files on disk carried exactly one approving `VERDICT:` line. The erratum gate reads the verdict from the **dispatch response only** — `parseVerdict(responses[i])` — and `parseVerdict` fails closed on a missing trailer, while the review loop has a second, file-side reading (`extractFileVerdict`) precisely for this case. Blast radius: the halt preempts `appendApprovalAnchors`, so FSPEC's recorded approval still pinned pre-erratum bytes and a naive re-invocation would have re-opened the 15-round Phase F window over a defect already fixed | Verified both files; appended the skipped approval anchors by hand (the one sanctioned post-verdict write); flipped the marker. Gate fix recorded as follow-up, deliberately not landed in a docs-only change | 1 erratum round (limit); DECISIONS review loop itself never failed |
| PR (PROPERTIES converged at round 4; REQ erratum confirmation round 17) | Both confirmers **Approved with minor changes**, `high: 0` — orchestrator recorded te-review as non-approving | **The same single-channel read, second instance, three days later.** The reviewer named as rejecting wrote the *more* affirmative of the two files and self-appended its own approval anchors — behaviour inconsistent with the verdict attributed to it. *A converged phase should not halt on a signal that the tree contradicts.* | Verified both `VERDICT:` lines on the branch; appended `se-review`'s missing anchors (hash **recomputed independently** and confirmed to reproduce, then `git diff` used to prove the bytes were still HEAD's); re-invocation deliberately deferred until the file-side fallback (`DEC-ERR-02`) lands, so the same channel could not halt the same approved work twice | PROPERTIES 4 of 5 rounds (**converged**); erratum round 1 of 1 (failed) |
| DOD | dod-verify (evaluator) → se-implement (optimizer) | Six rounds against a 3-round budget, every one `DOD_STATUS: failed`. Findings were real and shrank monotonically (v1: 8 findings incl. a placeholder repo literal reaching two production `gh` calls and an unreachable AC-1.1 override; v6: one stale FSPEC sentence). Two Process findings recurred for **five consecutive rounds**: the DoD dispatcher's version argument is *computed*, not derived from the directory listing, so round 6 was instructed to write `-v2.md` and would have **destroyed a merged four-round-old record** had the verifier obeyed | Verifier deviated from its dispatch on the append-only rule and wrote `-v6`; the recurring dispatch defect is carried to §5 | 6 (budget 3) |

## 2. Cross-Feature Patterns

`Cross-Feature`-tagged findings, plus `Local`-tagged findings that reference a sibling feature or a
repo-wide mechanism (the under-tagging re-route the harvest SKILL mandates — see §4).

| Finding | Suggested Promotion Target |
|---|---|
| **Approvals pin document *bytes*, so a citation-only edit stales them.** Six line-number-only fixes re-opened approvals on four documents and four phases; 104 of 558 commits (19%) were anchor/citation/re-pin bookkeeping. The sharpest exhibit: one REQ round's fix required 13 further anchor edits across five files. An approval hash over a *normalised* form (anchors and changelog blocks stripped), or an "editorial edit" class that re-anchors without re-opening, removes a +25-round tail on its own | `docs/_decisions/DECISIONS-review-convergence.md` (new rule beside DEC-CONV-01) |
| **`file:line` citations in prose are a document convention that does not scale.** The corpus carries hundreds of `file:line` pins across five documents; any edit moves lines and review correctly treats a stale anchor as a finding. One review round found *every* `orchestrate-dev.js` anchor uniformly off by +227 lines — one insertion above them all, never re-measured. The counter-pattern the corpus itself converged on: pin the *pattern* in a test and cite content, not line numbers, in prose | `docs/_constraints/DOMAIN-CONSTRAINTS.md` |
| **A multi-layer erratum wave must propagate downward in order, and its routing list must be re-derived at dispatch.** A child confirmed before its parent's decision reaches it is *approved stale*, and its approval is worth less than it looks. Two independent halts (P, T-ep2) are instances | `docs/_constraints/DOMAIN-CONSTRAINTS.md` + `DECISIONS-spec-layer-boundary.md` companion note (partly landed as DEC-ERR-01/DEC-ERR-03) |
| **A downstream reader raises only what it can *count*.** Missing ids and a stale register count get raised by arithmetic; a mechanism decision in the parent's prose reaches nobody, because nobody's job description says "re-read the grandparent". The pipeline has good machinery for a downstream document that must *decide*, and none for one that must **notice its upstream decided** | `docs/_constraints/DOMAIN-CONSTRAINTS.md` |
| **A single-channel verdict read turns a transport fault into a phase halt.** Two of the nine halt episodes (D, PR) are this exact defect. The review loop already carries the fix (`extractFileVerdict`); the erratum path does not | `pdlc/workflows/orchestrate-dev.js` (recorded as `DEC-ERR-02`, not yet landed) |
| **Absence-only oracles pass vacuously and were filed independently by three reviewers across three documents** (AT-Q7's "no merge API call exists"; NFR-2's "never logged, never written, never persisted"; NFR-5's "never modifies a consumed LEARNINGS"). Every one needs a paired positive conjunct on the same path — a set-equality over what the path *does* call, not only over what it does not | `docs/_decisions/DECISIONS-test-oracle-mechanics.md` |
| **Set-equality oracles must state their exclusions in the row, never be weakened to containment.** The `CLAUDE.md` ↔ `distribution-manifest.json` oracle was born red on correct code because the manifest carries no row for itself; the sibling `BUNDLES` half of the same case names its own exclusion explicitly. Containment would have stayed green through precisely the drift the row exists to catch | `docs/_decisions/DECISIONS-test-oracle-mechanics.md` |
| **A hand-transcribed count in one document against an enumeration in another is a stale-by-construction defect.** Three reviewers independently raised the 96-vs-99 register count. The durable fix that shipped — re-derive **both sides at run time** (`consolidationTraceability.test.js`) — removes the defect *class*, not the instance, and should be the standing pattern | `docs/_constraints/DOMAIN-CONSTRAINTS.md` |
| **A shared normative file under `docs/_constraints/` needs its ownership, its set-equality range, its enumerated/narrative classification, its version pin and its deliverable list to range over *every section that currently exists*.** Both windows of Phase R died on rules written for the sections that existed when the rule was written. A constraints file whose own change-control clause is breached by the commit that introduced it (`pdlc-advisory-corpus-baseline.md`) is the degenerate case, filed identically by reviewers in nine separate rounds | `docs/_constraints/DOMAIN-CONSTRAINTS.md` |
| **A guard/enumeration in a document must be set-equal to the constant it claims to inherit.** AC-3.1/AC-3.7 enumerated two path prefixes; `MERGE_GUARD_DEFAULTS` has four. Same shape as the register count, one layer over | `docs/_constraints/DOMAIN-CONSTRAINTS.md` |
| **A REQ pinned against its size ceiling cannot converge.** Each round must relocate normative text to buy space for its own fixes, and each relocation is new review surface. A relocation must be *sized against the round it runs beside*, not merely ordered ahead of it — `pm-author/SKILL.md:118` mandates the ordering and the ordering alone is provably insufficient (three compliant relocate-first rounds: 387 → 344 → 331 bytes of margin, i.e. worse) | `pdlc/skills/pm-author/SKILL.md` + `DOMAIN-CONSTRAINTS.md` |
| **Deferred/uncovered obligations need a collecting section, not a scattered set of parenthetical notices.** Three reviewers filed variants; the count of PROPERTIES-owned deferrals rose from two to three with no place in the document that collects them | `pdlc/skills/se-author/SKILL.md` |
| **The PR base branch was a hardcoded `"main"` at the only production call site**, and the placeholder repository literal `"unknown/unknown"` reached two production `gh` invocations on the shipped default config. Both are the same class: a value that is *correct in this repo* shipped as a constant in a plugin that other repos install | `docs/_constraints/DOMAIN-CONSTRAINTS.md` |

## 3. Rejected Proposals (with rationale)

| Proposal | Rejected By | Rationale | Reusable for future features? |
|---|---|---|---|
| Raise `MAX_REVIEW_ROUNDS` above 5 | Every POSTMORTEM, independently (R, F×2, T) | Buys rounds at an unchanged manufacture rate and against an unchanged synchronisation rule. Four windows closed in 54 min, 1 h 29 m, 1 h 46 m and 23 min of wall clock — the loop was never slow. **The budget was never the binding constraint.** Only a rule change (`DEC-CONV-01`, `DEC-SEV-03`) or a rate change (`DEC-LAYER-01`, the freezes) moves the outcome | **Yes** — reach for a rule or a rate change before a budget change. (A separate lifetime round cap of 15 with accept-and-move-forward *was* adopted, as a backstop, not as a fix) |
| Rewrite or restructure the FSPEC / TSPEC | POSTMORTEM-F, POSTMORTEM-T | Twenty rounds found no structural defect; every open finding was local and named. A rewrite discards verified convergence and re-opens the drained High population. The TSPEC was also *smaller* than its FSPEC — there was no bloat to cut | Yes |
| Split the feature (consolidation-cadence half from cross-repo-promotion half) | POSTMORTEM-R window 2 | Right answer in window 1, wrong answer by window 2: the size pressure had already been relieved the right way, by relocating shared vocabulary into `docs/_constraints/` files a successor feature reads anyway. A split would duplicate those citations across two REQs and **double the governance surface that caused the halt** | Yes — a split is a size fix, and it is the wrong fix once the size came from shared vocabulary |
| Lower the approval bar / force past the reviews | POSTMORTEM-F×2, POSTMORTEM-T | The bar was being applied correctly, downward as often as upward — reviewers deliberately down-scored their own findings under `DEC-LAYER-01` and said so per finding. *The fix is to stop discarding approvals, not to stop requiring them* | Yes |
| Reverse `DEC-LAYER-01` | POSTMORTEM-F window 2, POSTMORTEM-T | It removed the class it targeted (mechanism Medium gone, rate −75%). Reversing it returns those decisions to the FSPEC, which is exactly what consumed both Phase F windows. **The residual finding rate is the cost of the discipline, not a reason to reverse it** | Yes — countermeasures that work on their target class are *incomplete*, not mistaken |
| Allow a second erratum round per phase | POSTMORTEM-P | Does not address the cause: a second round scoped to the same item list closes the same six items again. **Fix the scoping, not the budget** | Yes |
| Raise a second erratum against the FSPEC about the release form | POSTMORTEM-P | The FSPEC had already **answered** it. That is `DEC-ERR-01`'s exact anti-pattern, and it would have burned the next phase's erratum round on a settled question | Yes |
| Weaken the `CLAUDE.md` ↔ manifest oracle to containment | POSTMORTEM-P, te-review | Containment stays green through exactly the drift the row exists to catch — `CLAUDE.md:62`'s "Those three" was already false at HEAD, and containment would not have caught it | Yes |
| Redact NFR-2 secrets at the logging boundary | DEC-CONS-01, then **overturned** by cross-review (High, Cross-Feature) | The decision claimed "the module has no boundary to scrub" and concluded non-disclosure was *structural*. The module does have such a boundary and this feature renders through it (`rtGit`). Recorded here because the rejection's *stated reason was false*, and a reviewer caught it — a rejected proposal is only as durable as the fact it rests on | **Yes, as a caution:** re-verify a rejection's premise when it is cited as authority later |
| Ship the AT-M11 register assignment as bookkeeping and let Phase I discover it | POSTMORTEM-P | That is the failure mode the register erratum existed to prevent: the owning task sits in a halt-on-red wave, so the whole wave stops on a red the spec could have removed | Yes |
| Re-run the pipeline unchanged with a larger budget after a second window | POSTMORTEM-R window 2 | Two independent five-round windows reached the same steady state by two *different* mechanisms (propagation debt, then relocation debt). A third would find a third | Yes |

## 4. Process Learnings

**Every document in this feature needed ≥3 iterations, and four needed ≥9.** The counts alone
(REQ 21, FSPEC 18, TSPEC 18, PLAN 10, DECISIONS 9, PROPERTIES 9, DoD 6) route the whole corpus here.
Eight signals, ordered by how much they cost.

**4.1 · The +25-round tail was paid for zero behaviour change.** Measured post hoc: at
code-complete the feature had run 59 rounds; it finished at 84. The extra 25 rounds — 60–75 Opus
dispatches — changed **no production behaviour**. They were citation re-anchoring, re-measured
counts, and re-approvals of documents that had moved only in their line numbers. One in five commits
in the whole feature is anchor bookkeeping. This is the single largest cost in the record and it is
addressable by one change: **an approval must hash a normalised form, or an editorial-edit class must
re-anchor without re-opening the approval window.** (See §2, row 1.)

**4.2 · Repairs manufacture findings, at every layer, in every channel.** This is the corpus's most
robust observation because it was found five times independently, by different reviewers, at
different layers, under different countermeasures:

- FSPEC window 1 — "the repairs create new checkable defects in the sections they rewrote"; High
  drains (original-draft stock), Medium does not (manufactured).
- FSPEC window 2, post-freeze — the freeze changed the *class* (mechanism → bookkeeping) and not the
  *rate*; every late Medium is a **completeness universal that the same round introduced and the same
  round's own amendment falsified**. A register is a universal quantifier over a range the register
  itself keeps enlarging.
- TSPEC — each round's fix *decides* something, and every decision owes two coverage rows
  (`§12.2` + `§12.3`); four of nine Mediums are exactly that shape.
- Erratum rounds — a four-minute targeted edit minted a new blocking Medium at the same rate a review
  round does, but with a **budget of one attempt** instead of five. An erratum round is therefore
  *structurally harder* than a review round.
- DoD — five of six rounds closed their findings and produced new ones; only the sixth closed at the
  **class** level rather than the instance level, and that is the one that ended the loop.

The counter-move that measurably worked, three times: **a freeze** (mechanism freeze → register
freeze → decision freeze), declared in the resolution commit, told to the reviewers, in force for
exactly the confirming round. Its most refined form is worth quoting: *delete completeness universals
rather than repairing them — a register that lists its entries needs no theorem about the list.*

**4.3 · Convergence is a synchronisation problem before it is a quality problem.** Phase F window 2
contained an approval in three of five rounds, alternating between the reviewers, and never
simultaneously. A rule requiring simultaneous approval over a document that changes between every
judgement makes convergence a coincidence: the probability of two independent finding streams being
empty at the same instant does not rise as the document improves. `DEC-CONV-01` (carry-forward) would
have converged that window at round 7. The complementary observation from Phase T: carry-forward is
**inert** in a window that produces no approval at all — it can only preserve one that was granted.
Two different failures, two different fixes; neither is a substitute for the other.

**4.4 · Delta-scoped review has a blind spot at the seam it was designed to protect.** Delta scoping
worked exactly as intended in every window: baselines named, diffs stated, nothing unchanged
re-litigated, no settled decision re-opened in 84 rounds. Its cost surfaced twice. (a) Delta-scoped
reviewers never read each other's cross-review, so a **two-reviewer severity split cannot be resolved
by the loop** — only by an operator. (b) The delta-confirmation check as specified is
*absorbed ⊇ raised*; a reviewer running exactly that check passed a document with a hole, and the
reviewer who over-delivered (document vs upstream **HEAD**) is the one who caught it. The outcome
should not depend on which reviewer over-delivers: make the superset read the stated obligation for
both channels.

**4.5 · The pipeline halted three times on things that were not defects.** Two erratum
confirmations halted on lost dispatch trailers while approving files sat committed on the branch (D,
PR), and one DOD dispatch was told to overwrite a merged four-round-old artifact because its version
argument was **computed rather than derived from the directory listing**. `deriveRoundWindow`'s
content-addressed discipline exists precisely to prevent the third, and the DOD dispatch path was not
using it; the verifier had to disobey its own dispatch to avoid destroying history. The general rule
the corpus argues for: **every gate that can halt a phase should read the tree, not the transcript,
and derive its indices from the directory listing, not from a counter.**

**4.6 · Vacuous green is the most expensive failure mode in the record, and it is invisible.** The
un-skip audit found roughly 133 skipped tests at peak sitting inside `describe.skip` blocks whose
wave gates had passed *on suites that reported skipped*. Fifteen waves of "complete" were hollow. The
recovery — re-run, re-review, hand-finish, re-verification — cost ~40 dispatches. Fixed durably by
`checkWaveUnskips` making an un-skip regression a wave-gate failure. **A gate that reads "did the
suite fail" and not "did the suite run" is not a gate.**

**4.7 · Reviewer conduct was not the problem, and saying so is load-bearing.** Across 178 reviews:
100% of prior-round findings closed as filed in every counted round of every phase; zero findings
argued, rejected or deferred in fourteen consecutive rounds; two rounds closed findings *wider* than
they were filed; one reviewer withdrew its own prior claim after re-measuring and said so in the
disposition table rather than dropping it quietly; reviewers repeatedly and deliberately **down**-scored
their own findings under `DEC-LAYER-01`/`DEC-SEV-0x` and said so per finding. Ruling out reviewer
drift, severity inflation, author non-responsiveness and deadlock is what made every root cause in
this corpus locatable in the *protocol*.

**4.8 · Scope tagging was materially under-used, and the harvest had to re-route.** Most reviews
declare a file-level `Scope:` (`Local`, or a lens statement) and carry per-finding `Scope` cells only
in the findings table; a large number of findings that name a sibling feature, a shipped constant, a
`docs/_constraints/` file or a repo-wide mechanism are tagged `Local`. Several §2 rows above were
re-routed by the harvest on that basis. Two smaller tagging observations: one review tagged the same
finding `Process` while its sibling tagged it `Local` and the two reconciled it *in text* (the right
behaviour); and one review's Scope field parsed as the literal string `it`. The under-tagging itself
is the finding — recorded here so consolidation sees the routing gap rather than the re-routed items.

**4.9 · Reflexivity is real and should be priced into scoping.** This feature specifies a
*specification-governance mechanism*, so the document and its reviewers reason about the same kind of
object: every rule the document states about records, registers, coverage and deferral is immediately
available as a rule the reviewers can check the document itself against — and they did, correctly.
Three separate POSTMORTEMs name this as a contributing cause. It converts ordinary spec prose into
checkable claims at an unusually high rate, and it is not fixable by rewriting prose. The forward
action is to **scope such features smaller**, not to review them differently.

**4.10 · Transport faults hit the longest, most expensive dispatches.** Four halts in one session
were transport, not substance: two optimizer dispatches died mid-flight and one remediation hit the
30-minute ceiling, each time leaving salvageable-but-uncommitted work for an operator to finish by
hand, and each costing a full re-entry pass (~15–20 extra Opus dispatches). The remediation protocol
should be decomposed so that no single dispatch needs 30 minutes, and faulted dispatches should be
retried rather than halted.

## 5. Open Items for Consolidation

Candidates the harvest is not authorized to promote. No handed open-promotion list accompanied this
harvest, so no `failure-mode-id:` line is copied onto any item below.

1. **Normalised approval hashing, or an editorial-edit class.** The highest-value unlanded change in
   the corpus (§4.1). Target: `docs/_decisions/DECISIONS-review-convergence.md`. Explicitly named as
   recommendation 1 of the iteration analysis and *not yet done*.
2. **`DEC-ERR-02` — file-side fallback for the erratum delta confirmation.** When
   `parseVerdict(responses[i])` returns `malformed: true`, fall back to `extractFileVerdict` over the
   confirmation path before halting, exactly as the review loop does. Preserves fail-closed (both
   channels unreadable still halts) and removes two of the nine halt episodes outright. Companion:
   **report which channel decided the verdict** in the halt message. Target:
   `pdlc/workflows/orchestrate-dev.js`. Recorded; not landed.
3. **`DEC-ERR-03` — routing lists re-derived at dispatch, and superset confirmations.** Both clauses
   are recorded decisions and neither is mechanised. Target: `orchestrate-dev.js` erratum routing +
   `{pm,se,te}-review` SKILL prompts.
4. **De-duplicate routed erratum items by `(docType, normalised subject)`.** `collectErrata` unions
   raw `ERRATUM:` lines from creator, optimizer and reviewer; in Phase D, one defect noticed by four
   agents produced **seven** near-identical routed items and a 2 KB halt message. Target:
   `orchestrate-dev.js`.
5. **Move `appendApprovalAnchors` so it runs for reviewers already scored approving**, before any
   halt on a sibling reviewer. Phase D and Phase PR both left a half-recorded approval that an
   operator had to repair by hand — and an unrepaired one would have re-opened the most expensive
   phase in the feature. Target: `orchestrate-dev.js`.
6. **Derive the DoD round index from the directory listing.** Five consecutive rounds were dispatched
   with a computed version argument; round 6 was instructed to overwrite a merged artifact. Target:
   the DOD dispatch path in `orchestrate-dev.js`, reusing `deriveRoundWindow`'s discipline.
7. **Retire `file:line` citations in prose as a documented convention**, in favour of
   section-and-row anchors plus pattern assertions in tests. 104 commits of evidence. Target:
   `docs/_constraints/DOMAIN-CONSTRAINTS.md` and the author SKILLs.
8. **The erratum wave has no step that retires downstream *cautions* whose premise it falsified.**
   Six lines across TSPEC, PLAN and PROPERTIES still asserted a REQ wording the erratum had corrected;
   the *instruction* in each remained right and the *premise* was false. Propagation must cover
   consumers of corrected **wording**, not only of corrected behaviour. Target:
   `DOMAIN-CONSTRAINTS.md` + author SKILLs.
9. **Promote the `DEC-*` family that this feature minted into `DOMAIN-CONSTRAINTS.md`**, per the
   explicit Phase-H notes in four POSTMORTEMs: `DEC-LAYER-01` (spec layer boundary), `DEC-SEV-01/02/03`
   (severity bars), `DEC-CONV-01` (approval carry-forward), `DEC-ERR-01` (absorb, never re-route, a
   settled upstream question). All five are currently feature-adjacent decisions carrying
   feature-specific evidence.
10. **Sized-relocation rule for size-capped REQs.** `pm-author/SKILL.md:118` mandates relocate-first;
    three compliant rounds proved ordering alone insufficient. Add: *a relocation must be sized
    against the round it runs beside*. Target: `pdlc/skills/pm-author/SKILL.md`.
11. **Freeze as a first-class pipeline mode.** Three ad-hoc freezes (mechanism, register, decision)
    each measurably worked; each was declared in prose in a resolution commit and communicated to
    reviewers by hand. A named, dispatchable freeze mode would make the countermeasure repeatable.
12. **Decompose long remediation dispatches and retry faulted ones** (§4.10). Four session halts were
    transport, not substance.
13. **A wave gate must assert the suite *ran*, not merely that it did not fail** (§4.6). Landed as
    `checkWaveUnskips`; promote the general rule.

**Note for whoever runs the consolidation pass:** the feature being specified here *is* a
consolidation agent, and this document is a worked example of the input it will be asked to distil.
Both the P and T post-mortems flag the reflexivity deliberately.

## 6. Approval Record

The durable (tier-2) record of every approving cross-review round, copied out of the
`CROSS-REVIEW-*` files before they were deleted. Approval Hash and Reviewed Commit cells are
**verbatim** — never recomputed. `unavailable` means the file carried no such anchor line.

Rows are ordered by document type in pipeline order (REQ → FSPEC → TSPEC → PLAN → PROPERTIES →
DECISIONS, then the two non-spec review families this feature also ran: IMPLEMENTATION and REVIEW,
both Phase CR), then round ascending, then role slug ascending.

| Document Type | Round | Role | Verdict | Approval Hash | Reviewed Commit |
|---|---|---|---|---|---|
| REQ | 7 | test-engineer | Approved with minor changes | unavailable | unavailable |
| REQ | 9 | test-engineer | Approved with minor changes | unavailable | unavailable |
| REQ | 10 | test-engineer | Approved with minor changes | unavailable | unavailable |
| REQ | 11 | software-engineer | Approved with minor changes | sha256:0d2b2497235209181f0599a2ef2e25fa106d1917af8f02448a027fe969ad6f17 | e54ee26d933567ee426405649fe3271791e03eee |
| REQ | 11 | test-engineer | Approved with minor changes | sha256:0d2b2497235209181f0599a2ef2e25fa106d1917af8f02448a027fe969ad6f17 | e54ee26d933567ee426405649fe3271791e03eee |
| REQ | 12 | software-engineer | Approved with minor changes | sha256:0d2b2497235209181f0599a2ef2e25fa106d1917af8f02448a027fe969ad6f17 | 455929d4687c990f10c1b00d9441d8f1f219c4a5 |
| REQ | 12 | test-engineer | Approved with minor changes | sha256:0d2b2497235209181f0599a2ef2e25fa106d1917af8f02448a027fe969ad6f17 | 455929d4687c990f10c1b00d9441d8f1f219c4a5 |
| REQ | 13 | software-engineer | Approved with minor changes | sha256:0d2b2497235209181f0599a2ef2e25fa106d1917af8f02448a027fe969ad6f17 | 1cebcce3a4dcf50ee23fdcf9f8787cc94d8fb5e5 |
| REQ | 13 | test-engineer | Approved with minor changes | sha256:0d2b2497235209181f0599a2ef2e25fa106d1917af8f02448a027fe969ad6f17 | d2160ddbac7b178cdf7592244f327b83da62847e |
| REQ | 14 | software-engineer | Approved with minor changes | sha256:0d2b2497235209181f0599a2ef2e25fa106d1917af8f02448a027fe969ad6f17 | 22564a6f47f6ff4989e64ca6007eac7cf9ca9998 |
| REQ | 14 | test-engineer | Approved with minor changes | sha256:0d2b2497235209181f0599a2ef2e25fa106d1917af8f02448a027fe969ad6f17 | 22564a6f47f6ff4989e64ca6007eac7cf9ca9998 |
| REQ | 15 | software-engineer | Approved with minor changes | sha256:c21f8a42bd766aa28deec9f5de1488c194452c0e7e3c52c5c0b8f26b34d9ffd0 | 7c1e0cfb224e2f2d45b81fb1f1c912c6037cdc75 |
| REQ | 15 | test-engineer | Approved with minor changes | sha256:c21f8a42bd766aa28deec9f5de1488c194452c0e7e3c52c5c0b8f26b34d9ffd0 | 6bccbfc91e376323d5fe31f783630c4de04dc639 |
| REQ | 16 | software-engineer | Approved with minor changes | sha256:c21f8a42bd766aa28deec9f5de1488c194452c0e7e3c52c5c0b8f26b34d9ffd0 | 760ae1c64cf3c6152838d2928bac89422f8623fd |
| REQ | 16 | test-engineer | Approved with minor changes | sha256:c21f8a42bd766aa28deec9f5de1488c194452c0e7e3c52c5c0b8f26b34d9ffd0 | 760ae1c64cf3c6152838d2928bac89422f8623fd |
| REQ | 17 | software-engineer | Approved with minor changes | sha256:cac4eac81935b3218ac9389538b5fe4b99415bae3daeea5a325f7af9c0c00254 | 54a464331c8b0ef120d27bc0ef8627833e044071 |
| REQ | 17 | test-engineer | Approved with minor changes | sha256:cac4eac81935b3218ac9389538b5fe4b99415bae3daeea5a325f7af9c0c00254 | 54a464331c8b0ef120d27bc0ef8627833e044071 |
| REQ | 18 | test-engineer | Approved with minor changes | unavailable | unavailable |
| REQ | 19 | test-engineer | Approved with minor changes | unavailable | unavailable |
| REQ | 21 | software-engineer | Approved with minor changes | sha256:2728a67ad2b31a557c01aa3874598b19b38eaa973a259b6f9088578fca417a9f | cdd187fe443cfd832ba47d911807e6a9ae3ecd56 |
| REQ | 21 | test-engineer | Approved with minor changes | sha256:2728a67ad2b31a557c01aa3874598b19b38eaa973a259b6f9088578fca417a9f | cdd187fe443cfd832ba47d911807e6a9ae3ecd56 |
| FSPEC | 6 | test-engineer | Approved with minor changes | unavailable | unavailable |
| FSPEC | 7 | software-engineer | Approved with minor changes | unavailable | unavailable |
| FSPEC | 8 | software-engineer | Approved with minor changes | unavailable | unavailable |
| FSPEC | 11 | software-engineer | Approved with minor changes | sha256:6e20bfc8b586f8f28dd769438e15bd3df787a25a845e2a509e3c2ac409ad2f43 | 8c970a7ed9e0ebf68f6f21fb58a786dd5fc1d954 |
| FSPEC | 11 | test-engineer | Approved with minor changes | sha256:6e20bfc8b586f8f28dd769438e15bd3df787a25a845e2a509e3c2ac409ad2f43 | 8c970a7ed9e0ebf68f6f21fb58a786dd5fc1d954 |
| FSPEC | 12 | software-engineer | Approved with minor changes | sha256:1e55ae3278c6ac2b572a2ddfb7b8e1f9e65c5e28f3cc558bbe5e10426f1f424d | 767b6b59cf8e49e9b809f2517b73d1444d3579fc |
| FSPEC | 12 | test-engineer | Approved with minor changes | sha256:1e55ae3278c6ac2b572a2ddfb7b8e1f9e65c5e28f3cc558bbe5e10426f1f424d | 767b6b59cf8e49e9b809f2517b73d1444d3579fc |
| FSPEC | 13 | software-engineer | Approved with minor changes | sha256:ba91e4c9877edac47b253a96412ba15fdd4295cd9d34f1cc525d4fd9d77f8363 | 0499e5325b35bc4f7f147e90f098e25f237459a0 |
| FSPEC | 13 | test-engineer | Approved with minor changes | sha256:ba91e4c9877edac47b253a96412ba15fdd4295cd9d34f1cc525d4fd9d77f8363 | 0499e5325b35bc4f7f147e90f098e25f237459a0 |
| FSPEC | 14 | software-engineer | Approved with minor changes | sha256:310f88a0556482f664096f77bf4ee14fae0acebaa6398d294ac2785c58edc5c5 | 99aff9bc2f40c9b044047f8846b9286e34f41af1 |
| FSPEC | 14 | test-engineer | Approved with minor changes | sha256:310f88a0556482f664096f77bf4ee14fae0acebaa6398d294ac2785c58edc5c5 | 99aff9bc2f40c9b044047f8846b9286e34f41af1 |
| FSPEC | 15 | software-engineer | Approved | sha256:18df4716504e48c1c3cf1124471b4ca7eb8b2e3e1847a35a1b445549e390dd13 | 2f18dbd7349fba72f0c0e61b52fc061491d5dfb8 |
| FSPEC | 15 | test-engineer | Approved with minor changes | sha256:18df4716504e48c1c3cf1124471b4ca7eb8b2e3e1847a35a1b445549e390dd13 | 2f18dbd7349fba72f0c0e61b52fc061491d5dfb8 |
| FSPEC | 16 | software-engineer | Approved with minor changes | sha256:bdb8fe63d045321433105d8c4b6bc4a50fb4209fa8cffbf875cdf161d7290df9 | 76476315aa85373a44e166bfe9781954b7687f59 |
| FSPEC | 16 | test-engineer | Approved with minor changes | sha256:bdb8fe63d045321433105d8c4b6bc4a50fb4209fa8cffbf875cdf161d7290df9 | 76476315aa85373a44e166bfe9781954b7687f59 |
| FSPEC | 17 | software-engineer | Approved with minor changes | sha256:fcbe2e85f40fb77df54439985cd6497c95cb3d655bdb7828d6f7f3ddededbe25 | 48631bc661d04b3e810c7e49d4710c23723241cc |
| FSPEC | 17 | test-engineer | Approved with minor changes | sha256:fcbe2e85f40fb77df54439985cd6497c95cb3d655bdb7828d6f7f3ddededbe25 | 48631bc661d04b3e810c7e49d4710c23723241cc |
| FSPEC | 18 | software-engineer | Approved with minor changes | sha256:9fbdf6e7d25468127aace762afed45b2aa12549263c3b108625d087d0eecdbaf | b5ab7503e9fa5d1ba7c46cc5a56a6c98bb657c0c |
| FSPEC | 18 | test-engineer | Approved with minor changes | sha256:9fbdf6e7d25468127aace762afed45b2aa12549263c3b108625d087d0eecdbaf | b5ab7503e9fa5d1ba7c46cc5a56a6c98bb657c0c |
| TSPEC | 6 | product-manager | Approved with minor changes | unavailable | unavailable |
| TSPEC | 7 | product-manager | Approved | sha256:15cb268de89d55d6d68b6d08c5f2308fd9ce44e95549d746c53e1981151b581e | 94e6bb1fa5081bd5d14ac78fcfb25b6a9206780f |
| TSPEC | 7 | test-engineer | Approved | sha256:15cb268de89d55d6d68b6d08c5f2308fd9ce44e95549d746c53e1981151b581e | 94e6bb1fa5081bd5d14ac78fcfb25b6a9206780f |
| TSPEC | 8 | product-manager | Approved with minor changes | sha256:0fd555518918aa16784ac446a8f5a92c6791142bc110d2f7f67f23cef82d543d | a3049d1f3b9820b826ee08a6e3a78814b6ae8458 |
| TSPEC | 8 | test-engineer | Approved with minor changes | sha256:0fd555518918aa16784ac446a8f5a92c6791142bc110d2f7f67f23cef82d543d | a3049d1f3b9820b826ee08a6e3a78814b6ae8458 |
| TSPEC | 9 | product-manager | Approved with minor changes | unavailable | unavailable |
| TSPEC | 10 | product-manager | Approved with minor changes | sha256:78c467dc407a8ba513fa0f9a0f7f91c0cc8bd5d676869cbcb1ec045661c077be | db1fc4f9b8aee7fff339f089e3ad7c5b71186d97 |
| TSPEC | 10 | test-engineer | Approved with minor changes | sha256:78c467dc407a8ba513fa0f9a0f7f91c0cc8bd5d676869cbcb1ec045661c077be | db1fc4f9b8aee7fff339f089e3ad7c5b71186d97 |
| TSPEC | 11 | product-manager | Approved with minor changes | sha256:16cea5beda38d8c8ce67fbd04c607951aa171f096d9e534728a09070611d49e4 | b4addcdddc6dd48e60212e5e7005a9645ccd87d2 |
| TSPEC | 11 | test-engineer | Approved | sha256:16cea5beda38d8c8ce67fbd04c607951aa171f096d9e534728a09070611d49e4 | b4addcdddc6dd48e60212e5e7005a9645ccd87d2 |
| TSPEC | 12 | test-engineer | Approved with minor changes | unavailable | unavailable |
| TSPEC | 14 | test-engineer | Approved with minor changes | unavailable | unavailable |
| TSPEC | 15 | product-manager | Approved with minor changes | unavailable | unavailable |
| TSPEC | 16 | product-manager | Approved with minor changes | sha256:65e0ea12bc1dd110bc67e35094cc0a4ad7453ece30af600df853eefe169f1848 | d74d80d01303896d425197d28b8fe7aacaf3867e |
| TSPEC | 16 | test-engineer | Approved with minor changes | sha256:65e0ea12bc1dd110bc67e35094cc0a4ad7453ece30af600df853eefe169f1848 | d74d80d01303896d425197d28b8fe7aacaf3867e |
| TSPEC | 17 | product-manager | Approved with minor changes | sha256:44790289796a40f8b6122a1df2b92a36b9253cf072f2b768408134a4b1217315 | e192d6e739420ba179d05b1eee905c85663600aa |
| TSPEC | 17 | test-engineer | Approved with minor changes | sha256:44790289796a40f8b6122a1df2b92a36b9253cf072f2b768408134a4b1217315 | e192d6e739420ba179d05b1eee905c85663600aa |
| TSPEC | 18 | product-manager | Approved | sha256:40fcf56227cf911eb900b2f25499da169e0258753a64585f7522635f57854980 | 37bad08d6285ef124b2cdd7cd195a7916f5cb2d8 |
| TSPEC | 18 | test-engineer | Approved | sha256:40fcf56227cf911eb900b2f25499da169e0258753a64585f7522635f57854980 | 37bad08d6285ef124b2cdd7cd195a7916f5cb2d8 |
| PLAN | 2 | product-manager | Approved with minor changes | sha256:6f58b4ede3bcb91d4ece30763feea5f27864206107aede499f7d1e653ed7a997 | 1682227ba623a9c01c0842a79b985b223c5c1d67 |
| PLAN | 2 | test-engineer | Approved with minor changes | sha256:6f58b4ede3bcb91d4ece30763feea5f27864206107aede499f7d1e653ed7a997 | 1682227ba623a9c01c0842a79b985b223c5c1d67 |
| PLAN | 4 | product-manager | Approved with minor changes | sha256:fd181b0b9b080fa742f98204085c9ed113dd97346685cc0c35893c9beca85398 | d57808bacb44f7b0501ad6d1ca2d18f540ab20f6 |
| PLAN | 4 | test-engineer | Approved with minor changes | sha256:fd181b0b9b080fa742f98204085c9ed113dd97346685cc0c35893c9beca85398 | d57808bacb44f7b0501ad6d1ca2d18f540ab20f6 |
| PLAN | 5 | product-manager | Approved with minor changes | sha256:772556cc7bae9a5342f811c461d01cb279738f7070672c30b9499d0ad534e7ec | 6d350ba7cfa18e155711813c6ca85e83e338d5af |
| PLAN | 5 | test-engineer | Approved with minor changes | sha256:772556cc7bae9a5342f811c461d01cb279738f7070672c30b9499d0ad534e7ec | 6d350ba7cfa18e155711813c6ca85e83e338d5af |
| PLAN | 6 | product-manager | Approved with minor changes | sha256:4ebd3198acd7447cec042928ab6260557573a12c65f5b8ac1366c76c449b678b | 6a5d6aa0266090f84cedec2de3aa4d23238f3fb6 |
| PLAN | 6 | test-engineer | Approved with minor changes | sha256:4ebd3198acd7447cec042928ab6260557573a12c65f5b8ac1366c76c449b678b | 6a5d6aa0266090f84cedec2de3aa4d23238f3fb6 |
| PLAN | 7 | product-manager | Approved with minor changes | sha256:026a4ec94278ca12f8e4b462f1d11f4a579142f5839f6707ce2c082b777c797a | c421ceb3e6aa31e946bc23cd7aadf0b08f91d6fa |
| PLAN | 7 | test-engineer | Approved with minor changes | sha256:026a4ec94278ca12f8e4b462f1d11f4a579142f5839f6707ce2c082b777c797a | c421ceb3e6aa31e946bc23cd7aadf0b08f91d6fa |
| PLAN | 8 | product-manager | Approved with minor changes | sha256:a8fe9eef791cdaabd1f514287050724c7ec982cfb22227833d7fccb91b046b9f | aa8cbb2fff8ce07a9deb09643c1518b25ed70f7a |
| PLAN | 8 | test-engineer | Approved with minor changes | sha256:a8fe9eef791cdaabd1f514287050724c7ec982cfb22227833d7fccb91b046b9f | aa8cbb2fff8ce07a9deb09643c1518b25ed70f7a |
| PLAN | 9 | product-manager | Approved | unavailable | unavailable |
| PLAN | 10 | product-manager | Approved | sha256:8cd3dfa8f35b2fed87cf70b26ae85ef707da09e81fcc95dcbf8de2f78eafcd2e | 87d9c6ad363df73d57f765d0863743b8233fcf76 |
| PLAN | 10 | test-engineer | Approved with minor changes | sha256:8cd3dfa8f35b2fed87cf70b26ae85ef707da09e81fcc95dcbf8de2f78eafcd2e | 87d9c6ad363df73d57f765d0863743b8233fcf76 |
| PROPERTIES | 2 | product-manager | Approved with minor changes | unavailable | unavailable |
| PROPERTIES | 3 | product-manager | Approved with minor changes | unavailable | unavailable |
| PROPERTIES | 4 | product-manager | Approved | sha256:8c8a4024ae87d944e105e9dad771c7dc1469fa006fdbd922beb065921466e4ac | c568c4c3e1404bc9425ca6ee3003bb8e92fc01b0 |
| PROPERTIES | 4 | software-engineer | Approved | sha256:8c8a4024ae87d944e105e9dad771c7dc1469fa006fdbd922beb065921466e4ac | c568c4c3e1404bc9425ca6ee3003bb8e92fc01b0 |
| PROPERTIES | 5 | product-manager | Approved | unavailable | unavailable |
| PROPERTIES | 6 | software-engineer | Approved with minor changes | unavailable | unavailable |
| PROPERTIES | 7 | software-engineer | Approved with minor changes | unavailable | unavailable |
| PROPERTIES | 8 | software-engineer | Approved with minor changes | unavailable | unavailable |
| PROPERTIES | 9 | product-manager | Approved with minor changes | sha256:b4ad69f2b45ca5f409f4dfe45d52913ae72eae01d137bcb0ac0a9ec1eeac1954 | 3c1d68538b9501afdf3ad754a0aa51f4d548c84d |
| PROPERTIES | 9 | software-engineer | Approved with minor changes | sha256:b4ad69f2b45ca5f409f4dfe45d52913ae72eae01d137bcb0ac0a9ec1eeac1954 | 3c1d68538b9501afdf3ad754a0aa51f4d548c84d |
| DECISIONS | 2 | product-manager | Approved with minor changes | unavailable | unavailable |
| DECISIONS | 3 | test-engineer | Approved with minor changes | unavailable | unavailable |
| DECISIONS | 4 | product-manager | Approved with minor changes | sha256:496286f486d1507cdd51da2295de0b058a604145c4610ac1bc6713cf06c407c7 | 61f1147802c73d6f132c86339ff7b1a013260ade |
| DECISIONS | 4 | test-engineer | Approved with minor changes | sha256:496286f486d1507cdd51da2295de0b058a604145c4610ac1bc6713cf06c407c7 | 61f1147802c73d6f132c86339ff7b1a013260ade |
| DECISIONS | 7 | product-manager | Approved with minor changes | unavailable | unavailable |
| DECISIONS | 8 | product-manager | Approved with minor changes | sha256:286797a97ad68d3986c38bc63b860a59133a6b479838d0a2a20079e899846c21 | d8a297e164e9cbd13aad2e1740c757615ffda9f4 |
| DECISIONS | 8 | test-engineer | Approved with minor changes | sha256:286797a97ad68d3986c38bc63b860a59133a6b479838d0a2a20079e899846c21 | d8a297e164e9cbd13aad2e1740c757615ffda9f4 |
| DECISIONS | 9 | product-manager | Approved with minor changes | sha256:fbd08c3639247fe3637ed1de6c40d7fe11db59a5610d1d96861617221ed6dfcf | eb0abde7d977b3aa81d3f20d567e64d392152cba |
| DECISIONS | 9 | test-engineer | Approved with minor changes | sha256:fbd08c3639247fe3637ed1de6c40d7fe11db59a5610d1d96861617221ed6dfcf | eb0abde7d977b3aa81d3f20d567e64d392152cba |
| REVIEW | 1 | test-engineer | Approved with minor changes | unavailable | unavailable |
| REVIEW | 2 | test-engineer | Approved with minor changes | unavailable | unavailable |
| REVIEW | 3 | product-manager | Approved with minor changes | unavailable | unavailable |
| REVIEW | 3 | test-engineer | Approved with minor changes | unavailable | unavailable |
