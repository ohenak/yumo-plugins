# DECISIONS — pdlc-engineering-loop

| Field | Value |
|---|---|
| Upstream | REQ → FSPEC → TSPEC → **DECISIONS** |
| Downstream | PLAN, PROPERTIES, IMPL |
| Cross-Reviews | `CROSS-REVIEW-{product-manager,test-engineer}-DECISIONS[-v{N}].md` in this directory |
| LEARNINGS | `docs/pdlc-engineering-loop/LEARNINGS-pdlc-engineering-loop.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude | 0.9 | 2026-08-26 |

v0.9 is a citation-and-legibility pass closing cross-review round 10 (product-manager
*Approved with minor changes*, `{0,0,2}`; test-engineer *Approved with minor changes*, `{0,0,1}`).
**No decision is reopened, no alternative is re-priced, and no obligation is created, retired or
weakened** — the DECISION FREEZE holds, and every edit lands in a historical changelog entry or in
one consequence bullet's phrasing. Three edits:

1. **Round markers on four bare finding ids in the v0.6 entry** (PM F-01, PM F-02). That paragraph
   is headed *"closing cross-review round 6"*, but v0.7 had re-pointed three of its credits at
   round 7's numbering, and the two rounds number the same two inherited TE items in **opposite**
   order: in `CROSS-REVIEW-test-engineer-DECISIONS-v6.md` F-02 is the `LOOP_STOP_REASONS` item and
   F-03 the `AT-15a`/`AT-15b` traceability item, while `-v7.md` has them the other way round;
   likewise `CROSS-REVIEW-product-manager-DECISIONS-v6.md` F-02 is the `files`-list item (its F-03
   is the stale-v0.4-pin item) against `-v7.md`'s F-03. Rather than choose one round's numbering
   and leave the other resolvable to the wrong finding, each credit now carries an explicit round
   marker naming **both** ids (*"TE v6 F-02, re-raised as TE v7 F-03"*), which is the convention
   the same paragraph already uses for `(PM v5 F-01)`. TE v8 F-04(a)'s premise — that the ids were
   reversed in *both* files — is true of `-v7.md` only, and the v0.7 entry now says so.
2. **The six-site blast-radius bullet marks that its two partitions cut differently** (TE F-01).
   The bullet's *one spec-side member* count (D-4) and TSPEC §7's *"four in the shipped pipeline
   and two in the harnesses"* are both true at HEAD but are not the same cut: §7's two harness
   members are D-5 (`scripts/fixture-machine.mjs`) and D-6 (`__tests__/packaging.test.js`), so
   D-3 (`_tspec-packed-set.mjs`) falls inside §7's *shipped pipeline* four while this bullet calls
   it a test fixture. One clause now says so; no count, member or conclusion moves.
3. **No third substantive edit.** The three PM and two TE deferrals of this round are left
   deferred: a table rendering of the six co-change sites (with a partition column), a
   re-measurement recipe for the `no-pin` census and for the v0.4 historical pins, and splitting
   the routed-upstream items out of the v0.7 entry — all presentation of approved material, out of
   scope under the freeze. The TSPEC erratum PM round 10 raised (§7's D-4 row still renders
   AT-3.8b as *"three members and nothing else"*) is re-raised from here, unchanged: it is a
   defect of that document, not of this one.

v0.8 adds **one decision** and changes nothing else. Phase CR (implementation cross-review, PM
v2 F-03) found PLAN **P7-03** — AT-52's installed-engine fixture-machine leg — unlanded at HEAD,
and asked which it was: deliberately dropped, or simply not built. **DEC-LOOP-07** answers it as a
descope and records the coverage argument that stands in for the leg (P7-01(a)'s importability
conjunct over a genuinely packed tree), the alternative it defers rather than dismisses (a reduced
installed-engine assertion), the residual risk it accepts (no CI check runs the loop path of a
packed-and-installed binary), and its re-evaluation triggers. The DECISION FREEZE is respected in
the sense that matters: **no existing decision is reopened, re-priced or weakened** — v0.8 records a
question the freeze never covered, because it arose from what the implementation did, not from
re-reading what the design said. Two counters move with it (*Decision*'s lead sentence, the
*Consequences* table caption) and the *Positive consequences* engine-stability bullet now says
"six code-bearing decisions", since DEC-LOOP-07 bears no code. DEC-LOOP-07 carries its alternatives
table inline: **Options Considered** was written and approved before Phase CR, and retro-fitting a
seventh subsection into it would edit approved material to no reader's benefit.

v0.7 is a citation-and-accuracy sweep closing cross-review round 8 (product-manager
*Approved with minor changes*, `{0,0,3}`; test-engineer *Approved with minor changes*, `{0,2,2}`;
both under the DECISION FREEZE). **No decision is reopened, no alternative is re-priced, and no
obligation is created, retired or weakened.** Every edit lands in prose v0.5/v0.6 added, and each was
re-measured at HEAD rather than read back from the prose. Six edits: DEC-LOOP-04's alternative D no
longer claims the `package.json` `files` list is a site this feature edits or a member of TSPEC
**Architecture §7**'s inventory — `files` carries the *directory* entry `vendor/workflows/`, so this
feature's nested `lib/*.mjs` vendored copies pack with no edit, and §7's inventory is D-1…D-6 with no
`package.json` row (TE F-01); the six-site blast-radius bullet now counts **one** spec-side member
(D-4) rather than two, and states `_tspec-packed-set.mjs`'s header as an ordering constraint on a
fixture rather than a spec-side classification (TE F-02); the same bullet quotes AT-3.8b verbatim as
*"three members and not three modules"* (TE F-03, PM F-01) — the conflation was inherited from TSPEC
§7's D-4 row and is routed upstream as a TSPEC erratum, not fixed here; the v0.6 changelog's TE
finding credits are re-pointed at round 7's numbering (TE v7 F-02 is the `AT-15a`/`AT-15b`
traceability item, TE v7 F-03 the `LOOP_STOP_REASONS` naming), along with the PM credit for the
`files`-list time-stamp (PM v7 F-03, not v7 F-02) — all four ids given round markers at v0.9,
because round 6 numbered the same two TE items in the opposite order, and DEC-LOOP-05's closing paragraph now cites TSPEC **Error Handling** *and* **Test Strategy**,
since AT-34a's pinned seeds sit under Error Handling while the non-firing property row sits under Test
Strategy (TE F-04); and the v0.4 entry's `FSPEC v0.7` / `TSPEC v0.5` pins are marked historical
as superseded by whatever version each carries at HEAD, rather than re-pinned to a
figure that drifts on the next upstream round (PM F-03); and *Not decided here*'s lead clause no longer summarises the two
TSPEC errata as addressed *"to the REQ, not to the FSPEC"* — both originate against the REQ, but
item 2 is applied to FSPEC BR-21 as well, which is what TSPEC HEAD's errata table gives as that
item's Document cell (*"REQ §5 **and FSPEC BR-21**"*), so the flat summary was an overstatement
the same sentence already self-corrected (PM F-02). The three PM and two TE deferrals of this round are
left deferred: they ask for a re-measurement recipe in place of the `no-pin` figure, an operator-
observable discriminator for DEC-LOOP-05 residual (b), and a table rendering of the six co-change
sites — presentation changes to approved material, out of scope under the freeze.

v0.6 is a citation-and-scope sweep closing cross-review round 6 (product-manager,
test-engineer — both *Approved with minor changes*, 0 High). **No decision is reopened, no
alternative is re-priced, and no obligation changes.** The round was an upstream-cascade
confirmation against **REQ v1.8** (erratum r11: `99aa787e8`, `600a565cb`, `fe35644cc`), which
qualified NFR-1 and added a §5 **Carve-out (in scope)** widening the completed
`pdlc-engine-distribution` feature's distribution/release-gate file enumerations without changing
what any gate asserts. Re-read at HEAD, r11 reopened nothing here: every REQ clause this document
cites (AC-1.5, AC-2.5, AC-3.3, AC-3.4, NFR-5, REQ-LOOP-02) sits in text the erratum did not touch,
and the carve-out creates no obligation on DECISIONS — it is a scope grant whose delivery obligation
lands on TSPEC **Architecture §7** (D-1…D-6) and the PLAN. Four edits land: the *Positive
consequences* totality clause now names the carve-out as an assertion-preserving third change
(PM F-01); the *Negative consequences* completed-feature bullet now counts `pdlc-engine-distribution`
as the second such feature and names its six co-change sites (TE F-01); DEC-LOOP-04's alternative D
time-stamps its `package.json` `files`-list argument against the carve-out (PM v6 F-02,
re-raised as PM v7 F-03); and
DEC-LOOP-02's alternative A names `LOOP_STOP_REASONS` as a **runtime stop vocabulary**, distinct
from the file enumerations §5 licenses (TE v6 F-02, re-raised as TE v7 F-03). The v5/v6
inherited residue rides the same sweep:
the Traceability DEC-LOOP-06 row now reads `AT-15a, AT-15b, AT-33, AT-44` and attributes the
`(a)`/`(b)` sub-case split to the TSPEC rather than to FSPEC's undivided `E-20` (TE v6 F-03,
re-raised as TE v7 F-02; PM v5 F-01), and *Not decided here* corrects the upstream-errata count and target (PM v5 F-02). The
previous v0.4 changelog entry's REQ pin (v1.6) is superseded by this entry's REQ v1.8 grounding.

v0.5 is a Phase P erratum edit, raised by TSPEC round 9 (pm-review) and confined to
**DEC-LOOP-05**. No decision is reopened and no alternative is re-priced. DEC-LOOP-05's *Accepted
residual risk* section previously recorded one residual — the **false negative** (an unrecognised
secret is not redacted), which is also the only kind REQ NFR-5 and FSPEC BR-18/Q-10 scope. The TSPEC
cited that clause for the base64url/`AKIA` collision, which is a **false positive** (a legitimate
`--loop-state` token is destroyed) and was therefore sanctioned nowhere. The section is restated as
two residuals, (a) and (b), with (b)'s price, its rejected alternative (a token-shape exemption), its
explicit non-coverage by NFR-5, and a fourth re-evaluation trigger. Nothing else in this document
changes.

v0.4 is cross-review round 4 plus the Phase R erratum, re-grounded on REQ (unchanged), **FSPEC v0.7**
and **TSPEC v0.5** at HEAD — *historical pins, recorded as of that round; both documents have since moved past those
pins — read each one's own header for its current version rather than a figure copied here, and neither move reopened anything this entry decided (see the v0.6 and
v0.7 entries above for the current grounding)*. It is a targeted erratum edit: no decision is reopened and no new
alternative is introduced. **DEC-LOOP-06 is re-issued against what HEAD ships.** TSPEC v0.4/v0.5
settled that `cmdQueue`'s `!startup.ok` branch is preserved byte-for-byte on every path, the
`--loop-state` path supplying only a `loop` block on the existing `emitReport` seam, and FSPEC
BR-11b states the rule that forces it ("No value of `loop.preflight` makes an unready engine run an
iteration"). Alternative **B** — leave the branch untouched — is therefore re-priced as **Chosen**,
with its former "a refusal to implement" verdict withdrawn as false against HEAD, and alternative
**D** — policy-aware on the `--loop-state` path — is re-priced as **Rejected**, kept and priced
because it is the option a future reader will reach for. The DEC-LOOP-06 heading, Decision block,
Constraints, Reversibility, re-evaluation triggers, the obligations row and the two Consequences
bullets are restated over that shape: the `"off"`-vs-`"strict"` asymmetry AC-3.4 draws is carried by
the loop's `preflight-warning` notice and its distinct `engine-dispatch-refused` stop reason
(E-19, AT-15a/AT-15b, AT-44), not by bending the engine's refusal (Phase R erratum item, te-review).
Two round-4 findings also land: alternative D's `no-pin` split in DEC-LOOP-04 is corrected to
**4 shipped-production / 16 non-production** — `pdlc/engine/scripts/fixture-machine.mjs` is outside
`package.json`'s `files`, CI-only by its own header, and its one hit is the scenario label
`"no-pin-latest"` rather than a `state` value; the v0.3 changelog's "5 production / 15 oracle" is
retracted, the total (20 across 8 files) is unaffected and D's rejection is unchanged either way
(PM F-04, TE F-01); and DEC-LOOP-04's Context now records BR-02's "AC-2.5 names three states"
clause as **already retired** in FSPEC v0.6 rather than as an open upstream item (PM F-05). No
oracle shape, requirement mapping, `ConfigCase` member or prefix-family set changes in this round.

v0.3 is cross-review round 3, an upstream-cascade round: DECISIONS' own design is unchanged and no
decision reopens. REQ v1.6 pulled the configuration-state partition up into AC-2.5 and declared it
authoritative, and rescoped NFR-5; three passages that cited the pre-cascade upstream were restated
over REQ at HEAD. DEC-LOOP-04's Context now derives the four states from **REQ AC-2.5** as the
authoritative partition, with FSPEC BR-02 concurring and BR-02's "AC-2.5 names three states"
sentence noted as routed for retirement — the "elaboration a later reader relaxes deliberately"
licence is withdrawn, since deleting a `case` value is an AC-2.5 violation (PM F-01; TE F-01).
The "divergence" framing is rescoped to the **five workflow-side** readers in the standing-context
list, the DEC-LOOP-04 heading, the obligations table and the negative-consequences bullet: relative
to `readEngineConfig` this is the *extension* AC-2.5 describes, not a divergence (PM F-02; TE F-02).
DEC-LOOP-05's "Constraints" and its Traceability tag now record that NFR-5 is itself scoped to what
the redaction check recognises and that BR-18 **implements** it rather than narrowing it (PM F-03).
Alternative D's `no-pin` retrofit cost is re-measured at HEAD — 20 occurrences across 8 files, split
5 production / 15 oracle, including the previously unnamed production `pdlc/engine/scripts/fixture-machine.mjs`
(TE F-03); DEC-LOOP-04's re-evaluation trigger (a) reads "four-state" (TE F-04); and DEC-LOOP-05's
duplicated Reversibility clause is deleted (TE F-05). No oracle shape, requirement mapping or
downstream obligation changes in this round.

v0.2 is cross-review round 1 (product-manager, test-engineer). DEC-LOOP-04's decision restated over
FSPEC BR-02's **four** configuration states, its Context corrected to name `readEngineConfig` as a
shipped reader of the same file that already carries a provenance discriminator, and the
"reuse that naming" alternative added and priced (PM F-01, F-05; TE F-02, F-06, Q-01);
DEC-LOOP-05's redacted-field enumeration restored to the TSPEC's five fields with the excluded
closed-vocabulary set enumerated, and the prefix catalogue's coverage obligation stated (PM F-02;
TE F-01, F-07); DEC-LOOP-03's blast radius corrected to three production consumers and three test
files, with the measurement method stated and re-evaluation trigger (a) restated over a condition
false at HEAD (PM F-03, F-04; TE F-03, F-04); DEC-LOOP-01's size-bound trigger made observable and
its totality obligation anchored to the TSPEC property row (TE F-05, F-08); the "five of six" count
corrected to four and the refusal literal quoted once (PM F-06, F-07).

## Context

`pdlc-engineering-loop` closes the last gap between "the pipeline delivers a feature" and "the
pipeline delivers features unattended": a session-level `/loop` driver, a once-per-session preflight,
a single operator escalation view, and a termination discipline (REQ §1, REQ-LOOP-01…07).

The design questions worth recording here are not "what does the loop do" — TSPEC **Architecture**
and **Interfaces** carry that, and the code will carry it after. They are the six places where a
cheaper-looking or more conventional option existed, was weighed, and was rejected. Each was
contested across TSPEC cross-review rounds 1–3 (`CROSS-REVIEW-{product-manager,test-engineer}-TSPEC-v{1,2,3}.md`)
and each is the kind of question a future agent will otherwise confidently reopen, because in every
case the rejected option is the one that looks obvious from the outside:

| # | The question | The option that looks obvious |
|---|---|---|
| DEC-LOOP-01 | Where session state lives | a durable `.claude/pdlc-loop-state.json`, like the wave ledger |
| DEC-LOOP-02 | Who waits out the backoff interval | the engine — `runQueueLoop` already exists and could sleep |
| DEC-LOOP-03 | How `corpusState` is derived | leave the shipped one-line derivation alone |
| DEC-LOOP-04 | How `readLoopConfig` reports config provenance | copy `parseAdvisoryConfig`/`parseMergeConfig` verbatim |
| DEC-LOOP-05 | What the escalation redactor matches | a high-entropy heuristic — it catches more |
| DEC-LOOP-06 | How far `cmdQueue`'s fail-closed refusal bends | make it policy-aware — for every invocation, or just for the loop's |
| DEC-LOOP-07 | FSPEC BR-21, AT-52; PLAN P7-01, P7-03 | **Architecture** §7 (D-1…D-6, the packed channel) | P7-01(a)'s importability conjunct in `pdlc/engine/__tests__/loop-distribution.test.js` — the oracle that stands in for the unlanded leg; no oracle of its own, which is the point of recording it |

**Standing context these decisions sit inside.** Two shipped facts constrain almost all six:

- **The engine channel is the only way the pipeline runs.** `pdlc/workflows/*.js` are vendored into
  `@kaneho/pdlc-engine` at pack time; the SKILL files delegate to the installed CLI (`pdlc queue`).
  A design that assumes a module is reachable "because it is in this source tree" is a design that
  does not run — `pdlc-learnings-injection` lost review rounds to exactly that.
- **The engine is fail-closed on startup.** Both `cmdDev` and `cmdQueue` refuse to dispatch on
  `!startup.ok`, emitting `pdlc: startup did not pass — the engine refuses to dispatch (fail-closed, C-10).`
  before a `report: null` line (`pdlc/engine/bin/cli.mjs`, `cmdDev`'s and `cmdQueue`'s `!startup.ok`
  branches). Any loop-side policy that lets an operator proceed has to say precisely how far that
  refusal bends, and for whom.
- **A blast-radius claim states the method that produced it.** "Measured, not guessed" means a named
  measurement, and the default one — grepping the identifier — is systematically blind to a field
  that reaches an oracle through a *rendered string* (`` `corpus ${corpusState}` `` in
  `renderAdvisoryItem`, `pdlc/workflows/consolidate-learnings.js`, is the instance that bit
  DEC-LOOP-03 in review round 1; `renderEscalationEntry`'s row values are the same shape). So every
  cost claim below that reaches a rendered artifact greps the **rendered literals** as well as the
  identifier, and says which of the two found each hit. Routed to
  `docs/_constraints/DOMAIN-CONSTRAINTS.md` at harvest as a durable rule for DECISIONS authors and
  reviewers.

Project-level decisions read before authoring: `docs/_decisions/DECISIONS-seam-defaults.md`,
`DECISIONS-spec-layer-boundary.md`, `DECISIONS-test-oracle-mechanics.md`, `DECISIONS-wave-gates.md`,
`DECISIONS-review-severity-bars.md` (DEC-DOC-01 governs the citation form used throughout this
document), and `docs/_constraints/DOMAIN-CONSTRAINTS.md`. Nothing below contradicts them; DEC-LOOP-04
is the one deliberate departure from the **five workflow-side** config readers' *implementation*
precedent, and it is recorded as such rather than silently taken. It is not a departure from the
sibling reader of this same file that already names provenance: REQ AC-2.5 records that the fourth
distinction *extends* `readEngineConfig`'s three-state precedent and that "no divergence from any
sibling reader is required to obtain it". DEC-LOOP-04 implements exactly that extension.


## Options Considered

Six load-bearing forks. Each row records the alternatives that were live, and what each would have
cost **measured against the files it would touch**, not estimated.

### DEC-LOOP-01 — where the session's state lives

**Context.** One `/loop` iteration is exactly one `pdlc queue` process (TSPEC **Architecture** §2).
Three things must survive across iterations: the once-per-session preflight marker, the
consecutive-`idle` counter, and the backoff schedule position (FSPEC §3.1).

| Alternative | Verified cost / why rejected |
|---|---|
| **A. Durable state file** — `.claude/pdlc-loop-state.json`, mirroring the shipped wave ledger (`WAVE_STATE_PATH = ".claude/pdlc-wave-state.json"`, `pdlc/workflows/orchestrate-dev.js`), gitignored by the anchored `/.claude/pdlc-wave-state.json` rule in `.gitignore` | Cheap to *build* — the wave ledger is a working precedent and would be copied, not designed. Rejected on semantics, not cost: a durable file **outlives the session that wrote it**, so a stale file from an abandoned session silently seeds a fresh session's idle counter. REQ/FSPEC E-24 ("state lost mid-run ⇒ behave as a fresh session") would then have to be *simulated* by a staleness rule rather than falling out of the design. The wave ledger's own operational history is the evidence: recovering from a wave halt has repeatedly meant hand-editing `lastGreenWave`/`head` in that file, i.e. a human repairing state the machine mis-carried across runs |
| **B. Recompute from `QUEUE.md` + git history** | Not implementable as specified: the consecutive-`idle` counter is not durable anywhere. `QUEUE.md` records row state, not the number of consecutive iterations that found nothing to do, and no commit is produced by an `idle` iteration — so there is nothing in the tree to recompute from. This is a correctness failure, not an expense |
| **C. Caller-echoed token** — `--loop-state new` on iteration 1, `--loop-state <T>` thereafter, decoded by a total `decodeLoopState` | Chosen. Losing the transcript loses the token, which *is* a fresh session, so E-24 is structural |

### DEC-LOOP-02 — who waits out the backoff interval

**Context.** Backoff (`loop.backoffSchedule`, default `[5, 15, 30, 60]` minutes; REQ-LOOP-02) requires
something to wait. The engine already ships an in-process loop.

| Alternative | Verified cost / why rejected |
|---|---|
| **A. Teach `runQueueLoop` to sleep** — the function exists today at `pdlc/engine/lib/run.mjs` (`export async function runQueueLoop({ maxPasses = null, ...args })`), driven by `cmdQueue`'s `--loop`/`--max-iterations` flags (`pdlc/engine/bin/cli.mjs`), stopping on one of `LOOP_STOP_REASONS` (`["exhausted", "bound-reached", "blocked", "refused"]`) | Small diff, real consequences. (i) It holds a Node process **and an authenticated adapter** for up to the schedule's 60-minute tail with no operator-visible progress — the engine's live adapter is constructed per invocation alongside `startupFor` in `defaultDeps` (`pdlc/engine/bin/cli.mjs`). (ii) It cannot satisfy REQ AC-1.5, which requires the session-level path and the in-engine `--loop` path to **diverge observably on `halted`**: today `runQueueLoop` has no `halted` member in `LOOP_STOP_REASONS` at all, so making the two paths agree would mean widening a frozen, already-shipped enumeration that four stop-reason oracles read. To be explicit about *which* enumeration: `LOOP_STOP_REASONS` is a **runtime stop vocabulary** exported from `pdlc/engine/lib/run.mjs` and frozen there (`Object.freeze(["exhausted", "bound-reached", "blocked", "refused"])`), asserted by set-equality and frozenness in `pdlc/engine/__tests__/exit-loop.test.js`. It is **not** one of the file enumerations REQ §5's carve-out licenses this feature to widen (those are the packed-file and copy-recipe sites listed at TSPEC **Architecture §7**, D-1…D-6), and the carve-out's own closing clause — the widening "may not alter what those gates assert about anything else" — forecloses reading it as licence here: adding a `halted` member would change what the stop-vocabulary oracle asserts, not merely widen the file set an unchanged assertion ranges over |
| **B. The session waits; the engine stays single-pass** | Chosen. The in-engine `--loop` path is left exactly as shipped — this feature neither uses nor retires it (REQ AC-1.5) |

### DEC-LOOP-03 — how `corpusState` is derived

**Context.** `pdlc-consolidation-agent`'s confidence calibration must count **advisory** entries only
(FSPEC BR-12a, AT-20). This feature adds two new escalation sources to the same append-only
`docs/_queue/ESCALATIONS.md`, so non-advisory blocks now appear in a log the calibration reads.

Measured at HEAD: `parseEscalations` (`pdlc/workflows/consolidate-learnings.js`) already isolates
four of its five outputs — it keys a block on **both** its `| Feature |` and `| Seam |` rows
(`ESCALATION_FEATURE_ROW`, `ESCALATION_SEAM_ROW`) and `continue`s past any block missing either, so
`bySeamFeature`, `totals`, `distinctFeatures` and `entryCount` are already blind to a non-advisory
entry. The fifth is not: `corpusState` is computed from the **raw** `^## ` split
(`const corpusState = blocks.length === 0 ? "empty" : "present"`). Downstream there are **three** production consumers, not two: `main` turns it into
`state.reasons` (`no-advisory-corpus` / `advisory-corpus-empty`); `seamCandidates` short-circuits
on `if (c.corpusState !== "present") return { over: null, tie: [], under: [] };`; and
`renderAdvisoryItem` (same file) opens the operator-visible report item 7 with
`` `corpus ${corpusState}` ``, so the value is **operator-visible prose**, not only internal state.
The third consumer is the one an identifier grep cannot see (**Context**, bullet 3).

| Alternative | Verified cost / why rejected |
|---|---|
| **A. Leave `corpusState` alone; filter source names inside `seamCandidates`** | Looks like the smaller change and is not. It leaves `corpusState` — and therefore `state.reasons` — wrong on a log holding only non-advisory entries, so AT-20's whole-output identity assertion still fails. It also fixes only the consumer that happens to be looked at, leaving the next consumer of `corpusState` to rediscover the bug |
| **B. A separate non-advisory sidecar file** | Splits the operator's single place to look, contradicting REQ US-02 and AC-4.1's single-file requirement. The whole point of the escalation view is one file |
| **C. Derive `corpusState` from contributing blocks** — `empty` when no block contributed a key, `present` otherwise | Chosen. Blast radius measured by both methods the standing rule requires (**Context**, bullet 3). *Identifier grep:* `corpusState` is asserted in exactly two test files — `pdlc/workflows/__tests__/consolidationAdvisory.test.js` (4 occurrences) and `consolidationPass.test.js` (1). *Rendered-literal grep:* a **third** test file asserts the value through its rendered string and is invisible to the identifier grep — `consolidationOperatorChannels.test.js`, whose `AC-6.1/AC-6.2/AC-6.3` block asserts `result.body` contains `"corpus present"` and, in its absent-corpus control, `"corpus absent"`. Both survive the change unchanged, and the reason is checkable: every seeded block in the `present` fixture carries a `Feature` and a `Seam` row, so each still contributes a key; the `"corpus absent"` case is the `absent` branch `parseEscalations` returns before the block split, which this derivation does not touch. Behaviour change is therefore confined to one pre-existing case, a *malformed advisory* block (missing `Feature` or `Seam`) no longer lifting an otherwise-empty corpus to `present` — including in the rendered report item 7. Those oracles belong to `pdlc-consolidation-agent` (QUEUE row 2, completed), so this feature owns them; the PLAN task that lands the derivation re-runs all three in the same commit (T-Q-02) |
### DEC-LOOP-04 — how `readLoopConfig` reports where its values came from

**Context.** **REQ AC-2.5 states the authoritative four-state partition** — (a) the `loop` section
absent, (b) the section present and explicitly default-valued, (c) the section present but
malformed, (d) the configuration file itself absent or unreadable/unparseable — and requires the
session report to name which of the four applied, "so all four are distinguishable from one
another". FSPEC BR-02 states that same partition; it is a concurring, not the originating, source.
BR-02's sentence "AC-2.5 names three states" was named false by AC-2.5 itself and has since been
retired: FSPEC v0.6 dropped the clause from BR-02 and restated Q-03 over AC-2.5, so nothing here
rests on it and nothing upstream remains open on it and **no state may be relaxed away
as a downstream elaboration**: deleting a `case` value is an AC-2.5 violation, which is why AT-10's
oracle shape is set-equality over four values rather than containment. The discriminator is
therefore designed over four values, not three (TSPEC **Data Model** §1, `ConfigCase`).

Measured at HEAD, the *workflow-side* sibling precedent cannot express that distinction. Five config
readers ship today — `parseMergeConfig`, `parseImplementationConfig`, `parseAdvisoryConfig`, `parseLearningsConfig`
(all `pdlc/workflows/orchestrate-dev.js`) and `parseConsolidationConfig`
(`pdlc/workflows/consolidate-learnings.js`) — and every one collapses **three different
preconditions onto one indistinguishable result**. In `parseAdvisoryConfig`: `text == null`,
`JSON.parse` throwing, and the section being absent all `return degraded(false)`, i.e. defaults with
`sectionMalformed: false`. Only a section present with a non-object value yields `degraded(true)`.
`parseMergeConfig` has the identical four-branch shape. This is the same defect
`pdlc-learnings-injection` hit from the other side (a misspelled section name being indistinguishable
from absence).

**A sixth reader of the same file does ship a provenance discriminator**, and the claim above is
therefore about the five workflow-side readers, not about the tree. `readEngineConfig`
(`pdlc/engine/lib/run.mjs`) reads the same `.claude/pdlc.config.json` (`ENGINE_CONFIG_PATH`) and
returns a third key alongside `config`/`notices`: `engine` is `{state: "absent"}` (no file, or no
`engine` key), `{state: "unreadable", path, error}` (unparseable file, or an `engine` section that is
not a plain object) or `{state: "no-pin", config}` (section present). So a precedent for *naming*
provenance exists, in the package this feature ships into, and the option of adopting it is priced
as alternative D below rather than left unweighed.
| Alternative | Verified cost / why rejected |
|---|---|
| **A. Adopt the sibling precedent unchanged** | AC-2.5 becomes **unsatisfiable**, not merely awkward: `{sectionMalformed: false}` is returned for absent, unreadable and default-valued alike, so no session report field can name which case applied. Rejected on correctness |
| **B. Retrofit the distinction into the sibling readers** | The honest cost, counted: **five** reader implementations plus every consumer of their `sectionMalformed` flag — `sectionMalformed` is asserted in **14 test files, 62 occurrences** under `pdlc/workflows/__tests__/` (`mergeConfig` 12, `advisoryQueueSeams` 13, `learningsConfig` 9, `consolidationReport` 6, `advisoryConfig` 4, `waveExecution` 4, `advisoryDisabled` 3, and seven files with 1–2 each). No requirement of this feature asks for any of it. Rejected as blast radius bought for nothing |
| **C. Diverge in `readLoopConfig` only, confined to a new `case` field** — identical config values to the sibling shape, one extra discriminator over BR-02's four states (`absent-file`, `absent-section`, `malformed-section`, `explicit-default`) | Chosen. The divergence is one reader wide and additive: nothing that reads `sectionMalformed` today changes, and no shipped `state` vocabulary is renamed |
| **D. Adopt `readEngineConfig`'s shipped `{state: …}` naming** — reuse the key name and the `absent`/`unreadable`/`no-pin` values for `readLoopConfig`'s discriminator (`pdlc/engine/lib/run.mjs`) | The convergent-looking option, and the closest thing to a precedent in the tree — so it is priced rather than dismissed. It is **not** adoptable as-is on this feature's requirement, and the cost of making it so is not zero. (i) The vocabulary is a triple and BR-02 needs four: `readEngineConfig` folds *file absent* and *section absent* into one `absent`, which is precisely BR-02's (d)-vs-(a) split, so adopting the values verbatim loses the distinction the divergence exists to make. (ii) `no-pin` names a version-pin concept (`engine.version` absent) with no counterpart in a `loop` section, so the one value that would carry over reads as a false cognate. (iii) It is an engine-package export (`pdlc/engine/lib/run.mjs`) while `readLoopConfig` lives in `pdlc/workflows/lib/loop-session.mjs`, which is *vendored into* the engine — reuse would be of the naming only, not of code, so the option buys vocabulary agreement and nothing else. Converging would mean widening `readEngineConfig`'s triple to four and renaming `no-pin` where it is written today — re-measured at HEAD with `grep -rno 'no-pin' pdlc/engine`, the literal occurs **20 times across 8 files**: 4 in shipped production (`pdlc/engine/lib/run.mjs` ×3, `pdlc/engine/lib/resolve-version.mjs` ×1) and 16 non-production — `pdlc/engine/scripts/fixture-machine.mjs` ×1 belongs on the non-production side (it is outside `package.json`'s `files` list so it never ships — measured at HEAD that list is `["bin/", "lib/", "vendor/workflows/", "scripts/postinstall.mjs"]`, and `scripts/fixture-machine.mjs` is in none of them; its own header declares it invoked only by `.github/workflows/fixture-machine.yml`; and its single hit is the scenario label `"no-pin-latest"`, not a `state` value), alongside the oracles and doubles (`__tests__/_doubles.mjs` ×6, `engine-config.test.js` ×6, `resolve-version.test.js` ×1, `launch-wiring.test.js` ×1, `fixture-machine.test.js` ×1, plus the `scripts/fixture-machine.mjs` label hit above). Note that the `files` enumeration this classification leans on needs **no** widening from this feature, and is **not** one of the sites TSPEC **Architecture §7** inventories: `files` is `["bin/", "lib/", "vendor/workflows/", "scripts/postinstall.mjs"]` (`pdlc/engine/package.json`, the `files` key), and `vendor/workflows/` is a *directory* entry, so this feature's nested `vendor/workflows/lib/*.mjs` vendored copies are already inside the packed set with no edit at all; §7's inventory is D-1…D-6 and carries no `package.json` row (TE v8 F-01). The classification is therefore unaffected for a reason independent of the carve-out: `scripts/fixture-machine.mjs` appears in none of the four `files` entries today and stays outside them after this feature ships, exactly as before it. The earlier figure (11 across 5, split 3/8) undercounted on both sides and omitted three files — retrofit work of the same class alternative B was rejected for, on a reader no requirement of this feature touches. **Rejected for now, and the vocabulary question is decided rather than left open:** `case` is kept (see the Decision block) |

### DEC-LOOP-05 — what the escalation redactor matches

**Context.** FSPEC BR-18 requires that secret-shaped material reaching an escalation entry's free
prose is redacted or omitted, proven positively against seeded material (AT-34). Nothing at HEAD does
this: the only "redaction" in the tree is a **label**, `CREDENTIAL_VALUES`' `"present (redacted)"`
state (`pdlc/workflows/consolidate-learnings.js`) — a credential *classification*, not a text
transform. So there is no sibling mechanism to cite and reuse; the redactor is genuinely new code,
which is exactly why the matching rule needs a recorded decision rather than a default.

| Alternative | Verified cost / why rejected |
|---|---|
| **A. Entropy heuristic** (TSPEC v0.1's) — a run of ≥20 `[A-Za-z0-9_\-]` containing at least one digit and one letter | Rejected as actively harmful, with two in-repo counterexamples: a 40-hex git oid matches it, and **this feature's own `--loop-state` token** matches it — a plain base64url encoding kept deliberately inspectable (**Data Model** §3, T-Q-03). The heuristic would silently mangle the operator's only durable record of a session in the one file US-02 promises is the single place to look, and would defeat the token's inspectability |
| **B. Omit the field entirely rather than redact it** | Loses the operator's ability to see that *something* was there. `[redacted:{n} chars]` preserves the fact and the size while destroying the value |
| **C. Prefix-anchored match on published credential prefixes** — `gh[pousr]_`, `ghs_`, `github_pat_`, `sk-`, `xox[baprs]-`, `AKIA` → `[redacted:{n} chars]` | Chosen. Precision over recall, with the residual recorded rather than papered over |

### DEC-LOOP-06 — how far the engine's fail-closed refusal bends (it does not)

**Context.** REQ AC-3.4 says `loop.preflight: "off"` suppresses the *loop's own* refusal but never
suppresses the *check*. At HEAD, `cmdQueue` (`pdlc/engine/bin/cli.mjs`) opens with
`const startup = deps.startupFor(argv); if (!startup.ok) { … }` — printing the startup lines, the
reason, `pdlc: startup did not pass — the engine refuses to dispatch (fail-closed, C-10).`, and a
`report: null` line — a branch byte-for-byte mirrored in `cmdDev`, whose comment names it as the
shared BR-REP-0a / PROP-EXIT-10 contract.

| Alternative | Verified cost / why rejected |
|---|---|
| **A. Make the branch policy-aware for every invocation** | Weakens C-10 fail-closed for **plain `pdlc queue`** in any repo that sets `loop.preflight: "off"` — a blast radius no requirement asks for, reaching every consumer of the engine, not just loop sessions |
| **B. Leave the branch untouched; the engine's dispatch refusal holds under every `loop.preflight` value** | Chosen. This is what FSPEC BR-11b requires at HEAD: `"off"` suppresses the *loop's own* refusal, never the check and never the engine's second refusal — "No value of `loop.preflight` makes an unready engine run an iteration". The asymmetry AC-3.4 draws is honoured one layer up, in the loop: under `"off"` a failing **engine-readiness** condition becomes a `preflight-warning` notice naming the same condition and remediation a refusal would have named, and the session stops at zero iterations with FSPEC §3.4's `engine-dispatch-refused` reason — distinct from `preflight-refused` precisely because the refusal is the engine's, not the loop's (BR-10, E-19, AT-15b, AT-44). Under BR-11's **working-tree** condition the session does proceed to iteration 1, which is where the two conditions part company under `"off"`. The `--loop-state` path adds only a `loop` block on the existing `emitReport` seam; the refusal's printed lines, `report: null` line and exit code stay byte-identical to HEAD, and `cmdDev`'s mirrored branch is untouched |
| **C. Shell out to `pdlc doctor` from the session** — `cmdDoctor` ships today and prints one `PASS`/`FAIL`/`SKIP` line per rung | A subprocess **per iteration**, on a loop designed to run for hours; and `cmdDoctor` routes through `runVersionDoctor`, whose version preamble always reports rather than refuses, so the session would still have to re-derive the startup result it wanted. Q-06 was answered in-process |
| **D. Policy-aware only on the `--loop-state` path** | Rejected — and priced rather than dropped, because it is the option a future reader will reach for: `--loop-state` is present on **every** loop iteration including the first (the reserved literal `new`), so it *is* a usable loop-mode marker, and gating the refusal on it would leave non-loop invocations byte-identical. It fails on the requirement, not on the mechanism. BR-11b makes the engine's dispatch refusal hold under every policy value, so a policy-aware branch would let `"off"` dispatch an iteration against an unready engine — the single outcome BR-11b names as forbidden — while spending C-10 fail-closed to do it. Everything AC-3.4 asks for is delivered by the loop's `preflight-warning` notice and its distinct `engine-dispatch-refused` stop reason, at no cost to the shipped refusal |



## Decision

Seven decisions. Alternatives and their measured costs for DEC-LOOP-01…DEC-LOOP-06 are in **Options
Considered** above; each block below records what was chosen, what forced its shape, and when to
reopen it. DEC-LOOP-07 was taken in Phase CR, after **Options Considered** was written and frozen,
and carries its alternatives table inline rather than retro-fitting a section the earlier rounds
approved.

### DEC-LOOP-01: Session state travels in a caller-echoed token, not a durable file

**Decision.** The session's cross-iteration state — preflight-ran marker, consecutive-`idle` counter,
schedule position — is encoded into a plain base64url `--loop-state` token that the driving prompt
echoes into the next `pdlc queue` invocation. Iteration 1 passes the reserved literal `new`. No file
on disk holds loop session state. `decodeLoopState` is **total**: an unusable token yields a fresh
session with a `session-restarted` notice (E-24, AT-48). Totality is universally quantified, so AT-48
— one undecodable token — samples it rather than pins it; the anchor that can fail on a non-total
implementation is the TSPEC **Test Strategy** property row for `decodeLoopState`/`encodeLoopState`
(round-trip over arbitrary well-formed `SessionState`, plus totality over non-base64, non-JSON,
non-object, wrong-`v` and truncated input), and both are cited in **Traceability**.

**Constraints that forced this shape.** FSPEC E-24 requires "state lost mid-run ⇒ behave as a fresh
session"; a durable file makes that a rule to enforce, a token makes it the default outcome. FSPEC
BR-19 separately forbids the driver a queue-row write, so `QUEUE.md` was never a candidate carrier.

**Reversibility.** Easy in one direction, hard in the other. Adding a durable cache later is
straightforward; removing one after operators have learned to inspect and edit it is not — the wave
ledger is the standing example.

**Re-evaluation triggers.** (a) The `/loop` runtime stops preserving arbitrary caller state across
iterations, making echo impossible; (b) **truncation-by-growth becomes observable**: a `session-restarted`
notice (E-24) occurs on an iteration whose *predecessor* decoded its token successfully — the one
signal that distinguishes a token the host truncated from ordinary session loss, which is benign and
expected. The previous wording ("state grows past the token's size bound") named no threshold and
nothing at HEAD or in the TSPEC measures or emits the encoded token's length, so no test or monitor
could ever detect it; the growth *rate* is bounded instead (**Data Model** §3, "Bound on token
growth"), and this trigger fires on the bound being exceeded in practice rather than on an
unmeasured number. Should a numeric ceiling later be wanted, it arrives with
`encodeLoopState`'s byte length on the per-iteration line, which is the change that would make the
original wording testable; (c) a requirement appears for state to survive a deliberate
operator interruption — at which point the *durability* is the feature, and the staleness rule must
be designed, not inherited.

### DEC-LOOP-02: The session waits; the engine process does not

**Decision.** Backoff intervals are honoured by the `/loop` session between invocations. Each
iteration is a single-pass `pdlc queue` process that returns a `continue` directive carrying
`waitMinutes`. The in-engine `--loop` path (`runQueueLoop`, `LOOP_STOP_REASONS`) is left exactly as
shipped: this feature neither uses nor retires it, and the divergence between the two loop layers is
stated rather than resolved (REQ AC-1.5, REQ-LOOP-02 preamble).

**Constraints that forced this shape.** REQ AC-1.5 requires the two paths to diverge observably on
`halted` (AT-04). The engine loop has no wall clock and no `halted` stop reason; the session loop's
whole purpose is waiting out wall-clock time for a human merge. Holding a Node process and an
authenticated adapter through a 60-minute interval is a resource cost with no operator-visible
progress.

**Reversibility.** Easy. Nothing in the engine is modified, so unifying the layers later is a
green-field change rather than an unwind.

**Re-evaluation triggers.** (a) `--max-iterations`/`maxPasses` semantics are extended with wall-clock
waiting for an unrelated reason, making one loop layer able to serve both; (b) the `/loop` runtime
stops letting the driving prompt choose each interval (assumption A-T-01), which is the load-bearing
premise of session-side waiting; (c) a decision to retire one of the two loop layers is taken —
this decision should be revisited *as part of* that retirement, not before it.

### DEC-LOOP-03: `corpusState` is derived from contributing blocks, and this feature owns the change

**Decision.** `parseEscalations`' `corpusState` becomes `empty` when no block contributed a key and
`present` otherwise, replacing the raw `^## ` block count. This feature owns the change and its blast
radius — no feature flag, no staged release. The PLAN task that lands the derivation re-runs and,
where they move, updates **three** test files in the same commit (T-Q-02):
`pdlc/workflows/__tests__/consolidationAdvisory.test.js`, `consolidationPass.test.js` and
`consolidationOperatorChannels.test.js` — the third asserting the value through its rendered string
(`"corpus present"` / `"corpus absent"`) rather than through the identifier, and expected to stay
green for the reason recorded in **Options Considered**.

**Constraints that forced this shape.** FSPEC BR-12a / AT-20 assert the calibration's **whole
output** is identical with and without non-advisory entries; four of the five outputs already are,
so nothing short of changing the fifth satisfies the assertion. The affected oracles belong to a
completed feature (`pdlc-consolidation-agent`, QUEUE row 2) with no active owner to coordinate with —
a shared literal with no named owner is a hazard this repo has already paid for, so ownership is
named here at the moment the coupling is created.

**Accepted behaviour change.** One pre-existing behaviour changes, and it is **operator-visible**, not
merely internal: a *malformed advisory* block — present but missing `| Feature |` or `| Seam |` — no
longer lifts an otherwise-empty corpus from `empty` to `present`. The change therefore reaches three
surfaces: `state.reasons` (`advisory-corpus-empty` now raised where it previously was not),
`seamCandidates`' short-circuit, and the consolidation report's item 7 — a repo in that state now
reads `7. advisory: corpus empty` where it previously read `corpus present`
(`renderAdvisoryItem`, `pdlc/workflows/consolidate-learnings.js`). This is a correction, not a
regression, but it is recorded because it is observable in operator-facing prose and was not
requested by any acceptance criterion. Whether the rendered line's change should also be ratified as
a one-line consequence of FSPEC BR-12a rather than living only here is a product question, raised as
PM Q-03 and left to the FSPEC's author; nothing in this decision depends on the answer.

**Reversibility.** Easy — a one-expression derivation with a three-file oracle surface (two asserting the identifier, one the rendered line).

**Re-evaluation triggers.** (a) **A consumer needs the raw `^## ` block count** — observable as a new
read of `blocks.length` (which `parseEscalations` keeps as a local today and would have to start
returning), or as a consumer asserting `present` for a corpus that contributed no key. The trigger is
false at HEAD and can therefore be observed becoming true; the earlier wording ("a third consumer of
`corpusState` appears") had already fired the moment it was written, since `renderAdvisoryItem` is
that third consumer. The remedy under this trigger is unchanged: read the block count explicitly, do
not re-purpose `corpusState`. (b) the
escalation log's block grammar changes such that "contributed a key" is no longer the right notion
of a countable entry.




### DEC-LOOP-04: `readLoopConfig` extends the provenance precedent, diverging from the five workflow-side readers only, confined to a `case` field

**Decision.** `readLoopConfig` returns the same defaults-plus-flags shape the five shipped
workflow-side readers return, **plus** a discriminator naming which of FSPEC BR-02's **four** states
applied: `absent-section` (parsed object has no own `loop` property), `explicit-default` (`loop`
present as an object with ≥1 in-domain key), `malformed-section` (`loop` present but not a plain
object, or an object every one of whose keys is out-of-domain), and `absent-file` (the read seam
returned `null` — file absent or unreadable — or `JSON.parse` threw). State (d), `absent-file`, is
named explicitly and is **not** collapsed into `absent-section`: it is the first-adoption case a repo
with no `.claude/pdlc.config.json` at all lands in, which REQ AC-2.5 calls supported and tested and
FSPEC E-01 / AT-10 assert. A three-valued discriminator could not report it. The config *values* are
identical to what the sibling shape would produce; only the provenance field is new. The five sibling
readers are not touched.

**The field is named `case`, not `state` (TE Q-01, decided here).** `readEngineConfig`
(`pdlc/engine/lib/run.mjs`) already ships a `{state: "absent"|"unreadable"|"no-pin"}` provenance key
over the same config file, so the vocabulary question is real and is answered rather than left for a
future reader to rediscover: `readLoopConfig` keeps a distinct `case` field with BR-02's four values.
The reason is that the shipped triple cannot carry BR-02's four states — its `absent` folds
*file absent* into *section absent*, which is exactly the (d)-vs-(a) split this decision exists to
make — and `no-pin` names a version-pin concept with no `loop`-side counterpart. Recording the choice
means a future convergence is a **rename** of two named fields onto one vocabulary, not a redesign;
alternative D in **Options Considered** prices it.

**Constraints that forced this shape.** REQ AC-2.5 states the distinction as a requirement and FSPEC
BR-02 elaborates it to four states, and the workflow-side sibling precedent physically cannot express
it — `parseAdvisoryConfig` returns `degraded(false)` for
`text == null`, for a `JSON.parse` throw, and for an absent section alike. Cite-and-reuse is the
default rule; this is the bounded exception, taken because the precedent is *insufficient*, not
because it was inconvenient.

**Reversibility.** Easy. The divergence is additive — a new field on one new reader — so converging
later means deleting a field, not unpicking a shape.

**Re-evaluation triggers.** (a) A sibling feature needs the same four-state distinction, at which
point the discriminator should be promoted into a shared helper and the readers converged in **one**
owned change rather than drifting apart further; (b) `docs/_constraints/DOMAIN-CONSTRAINTS.md` gains
a rule making a provenance discriminator mandatory for every config reader — stated over REQ AC-2.5's four
states, not over a triple, since a triple cannot distinguish an absent file from an absent section —
at which point this decision becomes the migration's reference implementation, not an exception, and
`readEngineConfig` is the reader to converge *toward* by widening its `state` triple, since it is the
only other reader of this file that already names provenance at all.

### DEC-LOOP-05: The redactor matches published credential prefixes, not entropy

**Decision.** `redactEntryText` matches a run of `[A-Za-z0-9_\-]` carrying one of the published
credential prefixes `gh[pousr]_`, `ghs_`, `github_pat_`, `sk-`, `xox[baprs]-`, `AKIA`, and replaces
it with `[redacted:{n} chars]`. It is applied to every free-prose field on every escalation branch —
the **five** the TSPEC **Error Handling** section enumerates: the decision sentence, the **refusal
reason** (`disposition.reason`, rendered verbatim by `renderEscalationEntry`), the diagnosis, the
**proposed action**, and **each evidence line**. Refusal reason and proposed action are two fields,
not one; evidence lines are in scope, and AT-34 seeds its positive in the diagnosis *and* in the
evidence, so an implementation taking a four-field list as the contract reds AT-34 at best and ships
unredacted evidence at worst.

The redactor is applied to **no** closed-vocabulary field, and that exclusion set is enumerated so
the split can be asserted by set-equality over both lists rather than by an open-ended "no
closed-vocabulary field": `Feature`, `Seam`, `Source`, `Root cause`, the heading timestamp and
`Pipeline state`. Each is drawn from a name set the pipeline itself controls, and redacting any of
them would rewrite the calibration keys `parseEscalations` reads.

**Constraints that forced this shape.** REQ NFR-5 is itself scoped to what the redaction check
recognises: "Escalation entries carry no credential or secret that the redaction check recognises.
Material the check does not recognise is a documented residual, not a denial: an unconditional 'no
entry ever contains a secret' is not assertable by any check, so it is not asserted here." FSPEC
BR-18 therefore **implements** NFR-5 rather than narrowing it, and there is no REQ/FSPEC gap here for
a later reader to reconcile. Precision is the governing property, upstream and down: a false positive
destroys data in the operator's only durable record, while a false negative leaves a residual that is
*recorded* — which is the disposition NFR-5 itself prescribes.

**Accepted residual risks — two, in opposite directions.**

*(a) False negative.* A bare high-entropy secret with no recognised prefix is **not** redacted.
This is stated rather than papered over, and AT-34a exists to pin the trade in the other direction: a
40-character hex git oid and a valid `--loop-state` token, seeded into the same fields of an advisory
entry, must survive **unredacted** and render byte-identically to what HEAD's renderer produces.
Without that negative control nothing reds when a legitimate identifier is mangled.

*(b) False positive — added at v0.5.* Prefix-anchoring bounds the false-positive class but does not
empty it. A `--loop-state` token is plain base64url over `[A-Za-z0-9_-]` (TSPEC **Data Model** §3),
whose alphabet contains every character of every catalogue prefix; a token whose run **begins** with
`AKIA` (or with any other catalogue prefix at the run's start) is therefore matched, and the
operator's durable session record is replaced by `[redacted:{n} chars]` — data loss, not a missed
secret. This residual is **accepted** and named here so a later reader does not mistake it for a
defect in the pattern: the alternative is a token-shape exemption, which would have to be a *literal
carve-out for one input class* inside the redactor, and a redactor that exempts a shape is a redactor
an attacker can dress a secret in. The trade is priced by frequency: the collision needs a specific
four-character opening of a randomly-generated token, while a token-shape exemption is exploitable on
every entry. Note that this is **not** the residual REQ NFR-5 and FSPEC BR-18/Q-10 describe — those
are scoped to *material the check does not recognise*, i.e. residual (a) only. Residual (b) has no
upstream home, is not covered by NFR-5's recognises-scoped denial, and is recorded here as this
decision's own accepted cost; the upstream statement needs no change, because NFR-5 makes no claim
about false positives either way.

The consequence for testing is stated in TSPEC **Error Handling** and **Test Strategy**: AT-34a's `--loop-state` seeds are
pinned literals chosen to carry no catalogue prefix at a run-initial position, and the
`redactEntryText` non-firing property is quantified over tokens filtered to exclude catalogue
prefixes, precisely because a generator over *all* valid tokens would draw residual (b) and be flaky
against a correct implementation.

**Reversibility.** Easy — the prefix set is data. Widening it is a one-line change plus an AT-34
case, and *narrowing* it must not be: the six families are this decision's contract, so the
enumeration is pinned by **set-equality against the exported constant** plus one seeded positive per
family, and deleting `AKIA`, `sk-` or `xox…` reds. Without that, five sixths of the catalogue is
unfalsifiable — AT-34 as the TSPEC states it seeds a `ghp_`-prefixed token only. The obligation is
recorded in **Consequences**; the corresponding TSPEC gap is routed as an erratum, not folded in
here. Switching matching *strategies* — prefix-anchored to entropy-based — is not reversible in the
same cheap way, and would reopen this decision rather than extend it.

**Re-evaluation triggers.** (a) A credential family in real use ships a prefix outside the set — add
the prefix, do not switch to entropy; (b) an incident occurs in which a prefix-less secret reaches an
entry, which converts the recorded residual into evidence and justifies a second, *additive* rule;
(c) the `--loop-state` token stops being plain base64url (T-Q-03 reopened), removing one of the two
concrete counterexamples that rejected the entropy heuristic; (d) residual (b) is *observed* — an
operator reports a mangled `--loop-state` token — which converts an accepted cost into evidence and
justifies revisiting the token's encoding (cheaper) rather than the redactor's anchoring.

### DEC-LOOP-06: `cmdQueue`'s fail-closed refusal is left untouched; the policy asymmetry lives in the loop

**Decision.** `cmdQueue`'s `!startup.ok` branch is **not** made policy-aware. Under every value of
`loop.preflight`, and on every invocation — `pdlc queue`, `pdlc queue --loop`, and
`pdlc queue --loop-state <token>` alike — the branch prints exactly what it prints at HEAD (the
startup lines, `startup.reason`, the C-10 fail-closed line, `report: null`) and exits non-zero
without reaching `runQueue`; `cmdDev`'s mirrored branch is not touched at all. The only addition on
the `--loop-state` path is a `loop` block supplied to the already-existing `emitReport` seam.

`"off"` never suppresses a *check*, and it never suppresses the engine's dispatch refusal either.
It suppresses the **loop's own** refusal: under `"off"` a failing condition is still evaluated and
produces a warning naming the same condition and remediation a refusal would have named (AC-3.4,
BR-11b). Where the two conditions part company is what happens next — under BR-11's working-tree
condition the session proceeds to iteration 1; under BR-10's not-ok startup result it does not,
because the engine declines the invocation, and the session ends at zero iterations with FSPEC
§3.4's `engine-dispatch-refused` stop reason, distinct from `preflight-refused` because the refusal
is attributable to the engine rather than to the loop (E-19, AT-15a/AT-15b, AT-44).

**Constraints that forced this shape.** C-10 fail-closed is a project-level commitment carried in
prose and in the refusal string itself, and BR-11b makes it unconditional: "No value of
`loop.preflight` makes an unready engine run an iteration." Bending the branch for the loop path
would violate that sentence, so the requirement forces the branch to stay as shipped and forces the
`"off"`-vs-`"strict"` difference to be expressed in the loop's own output — a notice plus a distinct
stop reason — rather than in the engine's control flow.

**Reversibility.** Easy to keep, hard to reverse. Not modifying shipped behaviour costs nothing to
sustain; making the branch policy-aware later would be a security-relevant change to a fail-closed
gate and must be its own decision with its own review, and it would additionally require BR-11b to
be reopened upstream first.

**Re-evaluation triggers.** (a) BR-11b is amended so that some policy value is allowed to dispatch
against a not-ok startup result — the only condition under which alternative D becomes admissible;
(b) a requirement appears for the loop to *recover* from a not-ok engine rather than stop at zero
iterations, which would move the question from "does the engine refuse" to "who retries"; (c) C-10's
fail-closed commitment is itself revisited at the project level.

### DEC-LOOP-07: AT-52's installed-engine leg is not landed; the hazard it targeted is covered by the packed-tree importability conjunct

**Context.** PLAN **P7-03** specified appending to `legInstallUpgrade` (`pdlc/engine/scripts/
fixture-machine.mjs`) an installed-engine observation of AT-52's second half: install the packed
tarball, run `pdlc queue --loop-state new`, feed the emitted continue token into a second
`pdlc queue --loop-state <T1>`, and parse **that** invocation's stdout iteration line for index `2`,
with two pure helpers (`parseLoopIterationObservation` / `checkLoopIterationObservation`) unit-tested
in `fixture-machine.test.js` and `SKIP_INVENTORY`'s `npm-pack-install-upgrade` entry carrying `AT-52`
alongside `AT-2.4`. Phase CR found the row **unlanded at HEAD**: neither helper exists, the leg
carries no loop assertion, and the skip inventory still lists `AT-2.4` alone. The PLAN row therefore
described an assertion the shipped leg does not make (CR v2 PM F-03), and this entry records which
way that discrepancy is resolved.

**Decision.** The leg is **not landed**, and the row is marked descoped in the PLAN rather than left
reading as pending work. AT-52's installed-engine obligation is discharged by **P7-01(a)** — the
importability conjunct, which invokes `runPrepack` into a temp vendor tree built by
`packRealTarball()`'s own recipe and `import()`s the vendored `orchestrate-queue.js` **and both**
`lib/` modules through that tree, so an unresolvable vendored name fires `ERR_MODULE_NOT_FOUND`
there — together with the engine-side CLI oracles that pin the `--loop-state` dispatch, the emitted
`loop` block and the session summary over the real `cmdQueue`.

| Alternative | Verified cost / why rejected |
|---|---|
| **A. Land P7-03 as specified** | Rejected on producibility, not on value. The iteration line reads index `2` only after **two real queue passes**, and a real pass runs the `orchestrate-dev` pipeline against a repo with a ready REQ, a feature branch and a merge. The fixture machine has no such repo: `legInstallUpgrade` asserts *resolver and working-tree* state (`recordResolvedState`, `compareLegRecords`, the `git status --porcelain` before/after conjunct), never pipeline behaviour, and the leg runs inside a required CI check where a full pipeline pass is neither affordable nor deterministic. |
| **B. A reduced installed-engine assertion** — one `pdlc queue --loop-state new` against the installed binary, asserting a parseable `loop` block | Priced, not dismissed; deferred. On a temp prefix with no plugin resolved, that invocation takes `cmdQueue`'s shipped `!startup.ok` branch, which emits a zero-iteration summary — a real exercise of the vendored `lib/loop-session.mjs` through the installed binary, but of the **refusal** path, not the iterating path AT-52 names, and it duplicates P7-01(a)'s import over a genuinely packed tree while adding a second capability-gated leg. This is the first thing to build if a trigger below fires. |
| **C. No leg; record the coverage argument** | Chosen. What P7-03 was designed to catch is a **vendored module that resolves in the repo and not under an install prefix** — a resolution defect, which P7-01(a) observes at import time over the packed tree, one layer earlier and without a live pipeline. |

**Constraints that forced this shape.** The fixture machine's install/upgrade leg is capability-gated
on `npm-pack` and lives in a required check; every assertion it carries must be deterministic and
cheap. A two-iteration loop sequence is neither, because an iteration is *defined* as a pipeline
invocation (BR-04).

**Residual risk, stated rather than implied.** No CI check runs the loop path of a
packed-**and-installed** binary end to end. A defect that manifests only after `npm install` — and
only at *call* time rather than at *import* time — would escape both P7-01(a) and the engine-side CLI
oracles. That is the exposure this entry accepts.

**Reversibility.** Easy. Nothing about alternative B is foreclosed: the helper pair the PLAN already
names is the shape it would take.

**Re-evaluation triggers.** (a) Any packaging or vendoring escape that reaches an operator through
the loop path — the first one converts alternative B from deferred to owed; (b) the fixture machine
gains a queue-fixture repo for any other reason, which removes alternative A's producibility
objection; (c) a second consumer repo vendors the engine, since the resolution surface then stops
being this repo's alone.

## Consequences

### What these decisions cost, together

*(The table below covers DEC-LOOP-01…DEC-LOOP-06. DEC-LOOP-07 obliges nothing downstream — it
records work deliberately **not** done and the coverage argument that stands in for it; its cost is
the residual risk named in its own block.)*

| Decision | What it obliges downstream | Who pays |
|---|---|---|
| DEC-LOOP-01 | Every iteration must round-trip the token through the driving prompt; `decodeLoopState` must be **total** (never throw) and must emit `session-restarted` on an undecodable token | PLAN task landing `loop-session.mjs`; the TSPEC **Test Strategy** property row (totality + round-trip) as the anchor for the universal, with AT-48 as its worked example |
| DEC-LOOP-02 | The `/loop` runtime must let the driving prompt choose each interval (assumption A-T-01). If it cannot, `waitMinutes` degrades to a report field and AT-07 must be restated over the *requested* wait | E-25 already makes the gap observable via `{requestedMinutes, actualMinutes}` |
| DEC-LOOP-03 | Three sibling test files owned by a **completed** feature are re-run in this feature's landing commit (two assert the identifier, one the rendered string), and an operator-visible report line changes | PLAN task landing the derivation; `consolidationAdvisory.test.js`, `consolidationPass.test.js`, `consolidationOperatorChannels.test.js` |
| DEC-LOOP-04 | A **seventh** reader of `.claude/pdlc.config.json` ships: unlike the five workflow-side readers in naming provenance at all, and an *extension* of the sixth (`readEngineConfig`), which already names provenance over three states — REQ AC-2.5 records that this fourth distinction extends that precedent and needs no divergence from it. The departure is from the five workflow-side readers only, and a future reader must not "fix" it in either direction without reading this block | PLAN; `readLoopConfig` doc comment must point here and must name `readEngineConfig` as the other provenance-naming reader |
| DEC-LOOP-05 | A named residual risk ships knowingly; a **negative control** (AT-34a) is as load-bearing as the positive test (AT-34); and the six-family prefix catalogue must be pinned by **set-equality against the exported constant** plus one seeded positive per family, so deleting a family reds. The redacted-field set (five) and the excluded closed-vocabulary set (six) are likewise asserted by set-equality, not by containment | PROPERTIES / test-engineer; both directions must exist, and per-family coverage is part of "both" |
| DEC-LOOP-06 | The `"off"`-vs-`"strict"` difference must be carried entirely by the loop's own output — a `preflight-warning` notice naming condition and remediation, and a stop reason (`engine-dispatch-refused`) distinct from `preflight-refused` — because the engine's refusal is identical under both. The refusal's bytes and exit code must be asserted unchanged on the non-loop **and** the loop path | **Architecture** §2, §3; AT-15a, AT-15b, AT-33, AT-44 |

### Positive consequences

- **The engine is not destabilised.** Four of the six code-bearing decisions add code rather than changing shipped
  behaviour. Exactly two pre-existing behaviours change: `corpusState`'s derivation (DEC-LOOP-03,
  three oracle files and one rendered report line) and `cmdQueue`'s report payload on the `--loop-state`
  path only, which gains a `loop` block on the existing `emitReport` seam. The `!startup.ok` refusal
  itself is **not** among them (DEC-LOOP-06): it stays byte-identical under every policy value, and
  `cmdDev`'s mirrored branch is untouched. Everything else — `runQueueLoop`, `LOOP_STOP_REASONS`,
  the five sibling config readers, `renderEscalationEntry`'s existing `seam` branch — is left as
  shipped, with the one exception REQ §5's **Carve-out (in scope)** grants: `pdlc-engine-distribution`'s
  file enumerations, and the approved sibling tables they must keep agreeing with, widen to cover this
  feature's shipped files (TSPEC **Architecture §7**, D-1…D-6). That widening is the third change, and
  it is **assertion-preserving** — the same gates assert the same things over a larger file set — which
  is why the behaviour count above stays at two.
- **Failure modes are structural, not simulated.** The token (DEC-LOOP-01) makes "state lost ⇒ fresh
  session" fall out of the design, so E-24 needs no staleness heuristic that could itself be wrong.
- **The one place to look stays one place.** DEC-LOOP-03's rejected sidecar and DEC-LOOP-05's
  rejected omit-the-field both protect the same property: `docs/_queue/ESCALATIONS.md` remains the
  single operator surface REQ US-02 promises, and its contents remain readable.
- **Costs were counted, not estimated.** The two "cheaper" alternatives were measured against the
  files they touch — five readers and 62 `sectionMalformed` assertions across 14 test files for
  DEC-LOOP-04's alternative B; five `corpusState` identifier assertions across two files, plus two rendered-literal
  assertions in a third, for the option actually taken in DEC-LOOP-03. The rejected option was the more expensive one in both cases.

### Negative consequences, accepted

- **Two loop layers coexist.** The in-engine `--loop`/`runQueueLoop` path and the session-level loop
  both exist, with different stop vocabularies and different notions of "done" (DEC-LOOP-02). This is
  a stated divergence (REQ AC-1.5), not an oversight — but it is real surface area, and a future
  reader who finds `LOOP_STOP_REASONS` first may reasonably believe they have found *the* loop.
  Mitigation: `pdlc/OPERATIONS.md` documents the directive protocol and the two layers.
- **A seventh reader of `.claude/pdlc.config.json` names provenance in a third way** (DEC-LOOP-04):
  five workflow-side readers name none, `readEngineConfig` names a `state` triple, `readLoopConfig`
  names a `case` quadruple. Convergence pressure will recur at every future config-reader review.
  Mitigation: the departure from the five workflow-side readers is confined to one additive field;
  relative to `readEngineConfig` this is an extension of an existing provenance precedent rather than
  a divergence from it (REQ AC-2.5); the vocabulary choice is decided and
  recorded rather than incidental (TE Q-01); and the re-evaluation trigger names `readEngineConfig`
  as the reader to converge *toward*, by widening its triple to AC-2.5's four states.
- **A named, unmitigated residual in redaction** (DEC-LOOP-05): a prefix-less high-entropy secret
  passes through. Recorded here so that BR-18's bounded form is understood as the implementation of
  REQ NFR-5's own scoping — NFR-5 already states that unrecognised material is a documented residual,
  not a denial — rather than as a downstream weakening of an unconditional requirement.
- **A security-relevant fail-closed branch is deliberately left alone** (DEC-LOOP-06), which moves
  the cost rather than removing it: the policy distinction now has to be visible in the loop's
  notices and stop reasons, and an absence-only assertion ("no refusal happened") cannot show it.
  The obligation is positive conjuncts on both halves of AC-3.4's asymmetry, and any future edit that
  makes the refusal consult `loop.preflight` reopens this decision rather than extends it.
- **Two completed features' oracles are edited by this feature.** The first is
  `pdlc-consolidation-agent` (DEC-LOOP-03): correct and owned, but its test surface now has a second
  contributing feature in its history. The second arrived with REQ v1.8's §5 carve-out and is
  **larger**: `pdlc-engine-distribution`'s vendoring channel has six sites that must move together for
  `pdlc/workflows/lib/loop-session.mjs` and `lib/escalation-view.mjs` to reach an installed engine —
  `MODULE_NAMES` in `pdlc/engine/scripts/prepack.mjs` (plus a per-name parent-directory creation, since
  `runPrepack` `mkdirSync`s `vendorDir` once and would throw `ENOENT` on a path-bearing name);
  `WORKFLOW_MEMBERS` in `pdlc/engine/scripts/publish-preflight.mjs` (three members → five);
  `WORKFLOW_MEMBERS` and `tspecPackedCount`'s vendored class size in
  `pdlc/engine/__tests__/_tspec-packed-set.mjs` (`3` → `5`); the approved spec tables under
  `docs/completed/pdlc-engine-distribution/` (TSPEC §5.4's `PK-*` table, FSPEC §5.2's per-class counts,
  AT-3.8b's *"three members and not three modules"*); `WORKFLOW_MODULE_NAMES` in
  `pdlc/engine/scripts/fixture-machine.mjs`; and `WORKFLOW_MODULE_NAMES` / `packRealTarball()` in
  `pdlc/engine/__tests__/packaging.test.js`. TSPEC **Architecture §7** is the authoritative inventory
  (D-1…D-6) and the PLAN owns the tasks; this bullet exists so the blast radius is visible from the
  decision record, because the failure mode of a missed co-change is a **set-equality assertion going
  red inside a sibling feature's suite at packaging time**, which reads as a product defect rather than
  as a missed widening. **One** of the six is spec-side — D-4, the approved tables under
  `docs/completed/pdlc-engine-distribution/` — and it must land first; TSPEC §7 partitions the same
  six along a **different** cut — four in the shipped pipeline and two in the harnesses, the two
  being D-5 (`scripts/fixture-machine.mjs`) and D-6 (`__tests__/packaging.test.js`), so D-3 sits
  inside §7's *shipped pipeline* four rather than outside it. `_tspec-packed-set.mjs` (D-3) is a
  test fixture, not the second spec-side member: its own header orders it to *follow* the spec in the
  same change (*"Adding, removing or re-classing a member is a SPEC change first … **Never this file
  alone**"*), which is an ordering constraint on a fixture, not a spec-side classification
  (TE v8 F-02). Every one of the six is additive: no gate's assertion changes, which is the whole
  content of the carve-out's permission.

### Traceability

| Decision | Requirements / spec items | TSPEC anchor | Test anchors |
|---|---|---|---|
| DEC-LOOP-01 | FSPEC §3.1, BR-19, E-22, E-24 | **Architecture** §2; **Data Model** §3 | **Test Strategy** property row for `decodeLoopState`/`encodeLoopState` (round-trip + totality) — the anchor for the universal; AT-48 as its example |
| DEC-LOOP-02 | REQ AC-1.5, REQ-LOOP-02; FSPEC BR-04, E-25 | **Architecture** §2 | AT-04, AT-07, AT-49 |
| DEC-LOOP-03 | FSPEC BR-12a, E-09; T-Q-02 | **Architecture** §5 | AT-20 (`parseEscalations`' five outputs); plus the three re-run sibling oracles named in **Consequences**, of which `consolidationOperatorChannels.test.js`'s `"corpus present"`/`"corpus absent"` assertions are the rendered-report surface AT-20 does not cover |
| DEC-LOOP-04 | REQ AC-2.5; FSPEC BR-01…BR-03, E-01, E-02 | **Data Model** §1 (`ConfigCase`) | AT-10 (BR-02's `case`, and BR-01's defaults), AT-38 (BR-03's `invalidKeys`), AT-46 (the example config). Required oracle shape: **set-equality** over the four `case` values against BR-02's four states — not containment, which passes on three of four — so deleting or renaming a case reds |
| DEC-LOOP-05 | REQ NFR-5 *(scoped upstream to what the check recognises; BR-18 implements it)*; FSPEC BR-18, Q-10 | **Error Handling**, Redaction | AT-34 (positive), AT-34a (negative control). Required oracle shape: set-equality over the five redacted fields, over the six excluded closed-vocabulary fields, and over the six-family prefix constant, plus one seeded positive per family — AT-34 as the TSPEC states it seeds `ghp_` only |
| DEC-LOOP-06 | REQ AC-3.3, AC-3.4; FSPEC BR-11b, E-20 *(FSPEC carries one undivided E-20; the `(a)`/`(b)` sub-case split is the TSPEC's)* | **Architecture** §2, §3 | AT-15a, AT-15b, AT-33, AT-44 — matching the obligations table above; FSPEC retired bare `AT-15` in v0.6 |

### Not decided here

One question this document previously left implicit is now decided rather than deferred: whether
`readLoopConfig`'s discriminator adopts `readEngineConfig`'s shipped `state` vocabulary (TE Q-01) —
it does not, and DEC-LOOP-04 records why. `T-Q-03` (token opacity) and `A-T-01` (the `/loop` runtime's per-iteration interval control) remain
open in the TSPEC with defaults the PLAN may proceed on; neither is converted into a decision by this
document. The upstream errata the TSPEC raises are likewise untouched here — they are routed, not
absorbed. At TSPEC HEAD there are **two** of them, and both originate against the **REQ** — item 2 is applied
to FSPEC BR-21 as well, because BR-21 restates the REQ sentence verbatim, so "REQ, not FSPEC" is too
flat a summary (PM v8 F-02): (1) narrowing REQ AC-4.4's rationale clause, which attributes the decision record to
`pdlc-consolidation-agent`'s confidence calibration that FSPEC BR-12a scopes to advisory entries
only; and (2) a clarity narrowing of REQ §5's exclusivity clause, copied to FSPEC BR-21 because
BR-21 restates the sentence verbatim. Three further items carried in TSPEC v0.3 (BR-14's *who
decided*, E-20/AT-44's `"off"` half, AT-32's untracked-configuration subject) are recorded there as
**withdrawn**, FSPEC HEAD having closed all three.

