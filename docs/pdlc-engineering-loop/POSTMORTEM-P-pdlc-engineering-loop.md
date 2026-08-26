# POSTMORTEM — Phase P (TSPEC erratum, delta confirmation) — pdlc-engineering-loop

**Date:** 2026-08-24
**Phase:** P (PLAN phase; halt raised by the Phase P **TSPEC erratum** channel)
**Failure mode:** ERRATUM-PROTOCOL — delta confirmation did not pass; follow-up budget spent
**Document at halt:** `docs/pdlc-engineering-loop/TSPEC-pdlc-engineering-loop.md` v0.7 (`511bfa62b`)
**Non-approving:** `te-review` (VERDICT: Needs revision, round 10)
**Approving:** `pm-review` (VERDICT: Approved with minor changes, round 10)

RESOLVED: yes

## Phase

Phase P opened the TSPEC erratum channel: while authoring PLAN, the phase raised
`ERRATUM: TSPEC` items against `TSPEC-pdlc-engineering-loop.md`, all clustered on the
**Architecture §7** channel added at v0.6 — the packed/vendored path that must carry this feature's
two new `pdlc/workflows/lib/` modules (`loop-session.mjs`, `escalation-view.mjs`) — plus three
inherited carry-overs (DEC-LOOP-05's residual, Q-07's BR-24 attribution, the document-wide version
pins).

The channel ran its full budget:

1. **Erratum round 1** — author edit v0.5 → v0.6 (absorbing REQ v1.8 / FSPEC v0.8, which added §5's
   carve-out, NFR-1's fifth authority, FSPEC BR-21 and AT-52). Delta confirmation = cross-review
   round **9**: `pm-review` approving, `te-review` **Needs revision** with one **High | delta |
   local** finding. Rule R3 applied (High-delta, all-local, follow-up budget unspent).
2. **Follow-up erratum round** (`MAX_ERRATUM_FOLLOWUP_ROUNDS = 1`) — author edit v0.6 → v0.7
   (`511bfa62b`), item list = round-9 confirmers' findings verbatim. Delta confirmation =
   cross-review round **10**: `pm-review` approving, `te-review` **Needs revision** with one
   **High | delta | local** finding.
3. Rule R4: High-delta remains and the follow-up budget is spent → `erratumPostmortemHalt`.

The halt is therefore **not** an iteration-cap exhaustion of the ordinary review loop (the TSPEC has
never been re-opened for a full round since v0.4) and **not** reviewer-versus-reviewer deadlock. It
is a bounded erratum channel that closed one defect per round while each round's edit exposed the
next instance of the *same* defect class.

## Iterations

Only the erratum-channel rounds are in scope for this halt; rounds 1–8 converged and are recorded in
the TSPEC's revision changelog.

| # | Doc version | Round type | pm-review | te-review | What the edit changed |
|---|---|---|---|---|---|
| 9 | v0.6 (`adc0b78c1`) | delta confirmation, erratum round 1 | Approved with minor changes (0H / 2M / 2L) | **Needs revision (1H / 2M / 1L)** | v0.6 added **Architecture §7** naming the packed channel and enumerating **four** sites D-1…D-4, absorbing REQ §5's carve-out, NFR-1, FSPEC BR-21 and AT-52 |
| 10 | v0.7 (`511bfa62b`) | delta confirmation, follow-up round | Approved with minor changes (0H / 1M / 2L) | **Needs revision (1H / 2M / 3L)** | v0.7 added **D-5** (`WORKFLOW_MODULE_NAMES` in `pdlc/engine/scripts/fixture-machine.mjs`) as a fifth site, made D-1's `mkdirSync` obligation explicit, gave AT-52 a level-and-home, named D-4's prover, and argued the c8 `include` widening as permitted under NFR-1 |

**High-severity trajectory: flat at 1, and the same clause each time.**

- Round 9, TE F-01 (High): Architecture §7 enumerates the channel as **four** members but HEAD has
  **five** — `fixture-machine.mjs`'s flat `WORKFLOW_MODULE_NAMES` literal. Landing D-1 without it
  reds every leg of the required `Fixture machine` check.
- Round 10, TE F-01 (High): v0.7's new D-5 row closes exactly that, and then asserts
  "`packaging.test.js` needs no row of its own" because its `WORKFLOW_MODULE_NAMES` derives from
  `WORKFLOW_MEMBERS`. The derivation is
  `WORKFLOW_MEMBERS.filter(…).map((member) => path.basename(member))`
  (`pdlc/engine/__tests__/packaging.test.js`), which **flattens the `lib/` segment**: once D-2 grows
  `vendor/workflows/lib/loop-session.mjs`, `packRealTarball()` copies from a non-existent
  `pdlc/workflows/loop-session.mjs` (ENOENT), and a naive repair still hands `prepack.mjs` a flat
  scratch tree. That is a **sixth** site, and it must land with D-1/D-2 or the required
  `Engine tests (ubuntu-latest)` check reds. Test Strategy's `Distribution` row, which "reuses that
  recipe", inherits the same error.

Both High findings are the same proposition — *the enumeration of sites that must co-change is
incomplete* — one site further out each round. Nothing was withdrawn as mistaken; both were verified
against HEAD by the reviewer, and both are correct.

The second live thread ran in parallel and converged **against** the document rather than for it. At
round 9 PM raised the two-widenings inconsistency as `Medium | inherited | nonlocal`, with the fix
routed **upstream**. v0.7 answered it **locally**, by reading REQ NFR-1 as an independent
kind-scoped grant. At round 10 *both* reviewers rejected that reading on a quotation check, PM at
Medium and TE at Medium — a rare instance of the two lenses landing the same finding independently.

## Reviewers

| Reviewer | Lens | Erratum rounds | Verdicts |
|---|---|---|---|
| `pm-review` (product-manager) | Requirements traceability, scope compliance, upstream fidelity of quoted clauses | 9, 10 | Approved with minor changes; Approved with minor changes |
| `te-review` (test-engineer) | Oracle falsifiability, constructibility of the named mechanism against HEAD code, test-level fit | 9, 10 | Needs revision; **Needs revision** |

Both reviewers scoped themselves correctly to the delta and re-grounded against **REQ v1.8 / FSPEC
v0.8 at HEAD** rather than against the dispatch's cited snapshot. Neither re-litigated a prior
approval. `te-review` is the sole non-approver at round 10; `pm-review`'s approval carries two Low
items and one Medium that overlaps `te-review`'s Medium, so the two lenses are **not** in conflict —
PM's verdict is approving because its own gating threshold was met, not because it disagrees with
the High finding, which is squarely inside the TE lens (constructibility of a named test recipe
against shipped code).

Round 10's findings, by provenance:

| Reviewer | Sev | Prov | Loc | Subject |
|---|---|---|---|---|
| te-review | High | delta | local | D-5's "`packaging.test.js` needs no row of its own" — `path.basename` flattening makes it a sixth site |
| pm-review | Medium | delta | local | NFR-1 quoted truncated at its deciding qualifier; upstream permits the c8 widening under neither clause as written |
| te-review | Medium | delta | local | Same clause, from the oracle side: the widening is *uncovered* by both NFR-1 and BR-21 rather than being a §5-vs-NFR-1 divergence; the narrowing must also route to FSPEC BR-21 |
| te-review | Medium | inherited | local | Coverage floor's "the two new entries are covered by an existing oracle" is false for **presence**: `coverageInstrumentation.test.js`'s `REQUIRED_INCLUDES` is a literal transcription of pre-existing entries and the resolution oracle iterates the include block *as found*, so the ≥85% per-file floor over the two new `lib/` modules has no falsifier |
| pm-review | Low | delta | local | Distribution row assigns AT-52's additive-only conjunct to D-5, but AT-52 scopes that conjunct to distribution/release-gate enumerations and approved `pdlc-engine-distribution` tables — `fixture-machine.mjs` is a CI harness literal, neither |
| te-review | Low | delta | local | AT-32 misquoted ("this repo's" vs "the repo's") in Data Model §2 / T-Q-01 |
| te-review | Low | delta | local | v0.7 changelog claims version pins dropped from every body citation; "the framing FSPEC v0.6 Q-03 decides" still carries one |
| pm-review / te-review | Low | delta | nonlocal | **Process:** the dispatch cites FSPEC `sha256:6bf027f4…`, which no commit on this branch produces (HEAD is `sha256:e9188c2f…`, v0.8, `9847882e2`). Recurrence of round 9's F-05. No edit owed to the document |

## Pattern of Disagreement

Three distinguishable patterns, none of them reviewer-versus-reviewer.

**1. Author-versus-HEAD-code: enumeration by inspection, one site per round.** The disagreement is
never about *what should happen* — everyone agrees the vendored-workflow channel must carry the two
new `lib/` modules and that no gate's assertion may change. It is about *how many places encode that
channel*. The TSPEC enumerated four (v0.6), then five (v0.7), and the sixth was found by the same
reviewer applying the same method: read the constant, follow its consumers, ask whether a
path-bearing name survives. Each round's enumeration was produced by inspection of the sites the
previous round's finding named, rather than by a mechanical sweep of the channel's transitive
consumers. A defect class that shrinks by one instance per round, against a budget of two rounds,
cannot converge.

The sixth site is also the *subtlest*, which is why it survived two rounds: `packaging.test.js`
does not carry a flat literal — it **derives** from `WORKFLOW_MEMBERS` and looks co-changing.
`path.basename` is the whole defect, and it is invisible unless the reader executes the map in their
head against a path-bearing member.

**2. Author-versus-upstream, resolved locally instead of routed.** PM's round-9 Medium was tagged
`inherited | nonlocal` with an explicit upstream fix ("restate §5 …, or name the coverage-include
enumeration alongside the distribution ones"). The v0.7 edit instead resolved it **inside the
TSPEC**, by asserting that REQ NFR-1 grants a kind-scoped exception independent of §5's carve-out
and quoting NFR-1's *"without changing what any gate asserts"*. At round 10 both reviewers checked
the quotation against HEAD and found it truncated at the deciding qualifier: NFR-1 reads
*"with the single exception §5's carve-out grants, which widens `pdlc-engine-distribution`'s file
enumerations without changing what any gate asserts"* — it **defers** to §5 and is scoped to that
feature's enumerations, which `pdlc/workflows/package.json`'s c8 block is not. FSPEC BR-21 restates
the same sentence verbatim. So the "two widenings, one kind" reconciliation is unsound as written,
and the widening is uncovered by *both* clauses rather than permitted by one of them.

This is the most expensive pattern in the round: a `nonlocal` finding was answered `local`, which
converted one Medium into two Mediums and burned the follow-up round that the High finding needed.

**3. Process defect, recurrent and non-actionable by the author.** The dispatch metadata's upstream
FSPEC hash (`sha256:6bf027f4…`) matches no commit on the branch, in both rounds 9 and 10. Both
reviewers measured against HEAD per the *upstream at HEAD* rule, so no conclusion changed — but the
round's upstream binding is not reproducible from its own record, and the pin-sweep now makes the
dispatch snapshot the document's version binding. This is engine-side, owed no document edit, and
correctly demoted to Low by both reviewers.

## Best-Guess Root Cause

**Proximate cause: the erratum channel was asked to close an open design question, not to correct a
document.** Architecture §7 is not a fix — it is a *new section*, introduced at v0.6 to absorb four
upstream decisions that arrived together in REQ v1.8 / FSPEC v0.8 (the §5 carve-out, NFR-1's fifth
authority, BR-21's additive-only bound, AT-52). A brand-new architectural section entering through a
one-round-plus-one-follow-up channel gets **two** review passes total, where an ordinary phase
review would give it up to five. Every finding in rounds 9 and 10 is against text less than two
rounds old. The channel behaved exactly as specified; the material was mis-sized for it.

**Root cause A — enumeration was authored by inspection, with no mechanical falsifier.** The
`co-change set` for the vendored-workflow channel is exactly the set of constants that name workflow
module files. At HEAD that set is discoverable in one command
(`grep -rn "WORKFLOW_MODULE_NAMES\|WORKFLOW_MEMBERS" pdlc/`, which returns five files: `prepack.mjs`,
`publish-preflight.mjs`, `fixture-machine.mjs`, `_tspec-packed-set.mjs`, `packaging.test.js`). The
TSPEC instead grew the list reactively. The deeper defect is that the *design itself* has no
falsifier for completeness: nothing at test time asserts "every constant naming a workflow module
agrees with `WORKFLOW_MEMBERS`". Until such an oracle exists, the enumeration's correctness rests on
a human sweep, which is precisely what failed twice.

**Root cause B — a routed-upstream item was closed by re-reading upstream more favourably.** The
v0.7 edit needed §5's carve-out to cover a second widening; §5 does not. Rather than raising the
one-line REQ/FSPEC erratum PM had already scoped, the edit found a sentence in NFR-1 that reads
permissively **when truncated**. This is the DEC-ERR-01 anti-pattern in mirror image: not re-raising
a settled question, but *settling* an unsettled one inside the wrong layer. The reviewers' check was
mechanical (quote the clause at HEAD in full) and therefore fast and unanswerable.

**Root cause C — an inherited Medium was carried across two rounds untouched.** The Coverage floor's
"the two new entries are covered by an existing oracle" claim was false for *presence* at v0.6 and
is still false at v0.7. `coverageInstrumentation.test.js`'s `REQUIRED_INCLUDES` transcribes
pre-existing entries and the resolution oracle iterates the include block as found, so adding two
entries adds no falsifier. Carrying an inherited finding through a **bounded** channel spends budget
without reducing risk.

**Not the cause.** Reviewer severity inflation (both round-10 Highs and Mediums are grounded in
HEAD-verified code or verbatim upstream text; none were withdrawn); reviewer disagreement (PM and TE
agree on every substantive point and differ only in verdict threshold); upstream churn (REQ v1.8 /
FSPEC v0.8 have been stable since before round 9, and the v0.7 changelog correctly records that
upstream decided nothing new); scope creep (no finding asks for behaviour outside the carve-out).

## Recommendation

The TSPEC is close: one High, three Mediums and three Lows, all local except the process item, and
every one of them names its own fix. The cheapest correct path is **not** a Phase P restart, and
**not** another erratum follow-up (its budget is spent by definition). It is: land the fixes below,
then flip this marker and re-run Phase P, which will re-open the TSPEC's approval anchor and give
the corrections a normal confirmation round.

**R-1 (blocking — te-review round 10, High).** Add `packaging.test.js` as a **sixth** site in
Architecture §7, and state the obligation, not just the site: `WORKFLOW_MODULE_NAMES` there is
derived from `WORKFLOW_MEMBERS` via `path.basename`, which flattens the `lib/` segment. The recipe
must preserve the member's relative path when building the scratch tree — copy
`pdlc/workflows/<relpath-after-vendor/workflows/>` to `buildWorkflowsDir/<same relpath>`, creating
parent directories — or `packRealTarball()` throws ENOENT and `prepack.mjs` receives a flat tree.
This site lands with D-1/D-2 in the **same task**, exactly as D-5 already does, or the required
`Engine tests (ubuntu-latest)` check reds. Correct Test Strategy's `Distribution` row, which
currently inherits the error via "reuses that recipe".

**R-2 (blocking — pm-review + te-review round 10, Medium; the same clause from two lenses).** Drop
the "NFR-1 is kind-scoped" argument entirely. NFR-1 at HEAD defers to §5 and is qualified to
`pdlc-engine-distribution`'s file enumerations; FSPEC BR-21 restates it verbatim. Re-argue the c8
`include` widening from **REQ §5's out-of-scope clause** — the prohibition is on *changing what any
gate delivered by orders 1–4 asserts*, and widening the file set a coverage gate ranges over does
not change the ≥85% per-file branch assertion — and restate the TSPEC's **upstream erratum 2**
premise accordingly (it currently claims a §5-vs-NFR-1 wording divergence that does not exist).
Route the same narrowing to **FSPEC BR-21**, not only to REQ §5, since BR-21 carries the sentence
too. Update the Traceability BR-21 row and Architecture §7's "The exception is a kind, not this one
site" paragraph to match.

**R-3 (blocking — te-review round 10, Medium, inherited).** Give the two new c8 `include` entries a
falsifier. `coverageInstrumentation.test.js`'s `REQUIRED_INCLUDES` is a literal transcription and
its resolution oracle iterates the block as found, so presence of `lib/loop-session.mjs` and
`lib/escalation-view.mjs` in the ≥85% per-file floor is currently unasserted. Either extend
`REQUIRED_INCLUDES` with the two entries (and say so in Test Strategy), or delete the false claim
that "the two new entries are covered by an existing oracle" and state the residual explicitly.

**R-4 (non-blocking, cheap — round 10 Lows).** (a) Mark the D-5 conjunct as **TSPEC-added beyond
AT-52**, or route a one-line FSPEC erratum naming the harness literal: AT-52 scopes its additive-only
conjunct to distribution/release-gate enumerations and approved `pdlc-engine-distribution` tables,
and `fixture-machine.mjs` is neither. (b) Fix the AT-32 quotation in Data Model §2 / T-Q-01 —
"the repo's", not "this repo's". (c) Drop the surviving version pin in "the framing FSPEC v0.6 Q-03
decides", or correct the v0.7 changelog's claim that all pins were dropped.

**R-5 (engine-side, no document edit — recurrence, rounds 9 and 10).** The erratum dispatch's
upstream snapshot cites an FSPEC hash no commit produces. Fix in the workflow: take each upstream
file's snapshot from its **committed HEAD** at dispatch time. This is now load-bearing rather than
cosmetic, because the pin sweep makes the dispatch snapshot the document's version binding. Track it
as a workflow defect independent of this feature's phase gate; it must not block R-1…R-4.

**Clearing the halt.** When R-1, R-2 and R-3 are on the branch, an operator or agent verifies each
against HEAD, flips `RESOLVED: no` to `RESOLVED: yes` in a commit that names what addressed each
finding, and re-invokes `/pdlc:orchestrate-dev docs/pdlc-engineering-loop/REQ-pdlc-engineering-loop.md`.
The workflow itself never writes `yes`.

## Provenance

| Field | Value |
|---|---|
| Branch | `feat-pdlc-engineering-loop` |
| Branch HEAD at halt | `c05d45032` |
| TSPEC at halt | v0.7, `511bfa62b` |
| FSPEC at HEAD | v0.8, `9847882e2` (`sha256:e9188c2f…`) |
| Dispatch-cited FSPEC | `sha256:6bf027f4…` — matches no commit on this branch (see R-5) |
| Engine version | 0.2.3 |
| Plugin version | 0.23.4 |
| Erratum rounds used | 1 of 1 (`MAX_ERRATUM_ROUNDS_PER_DOC`) + 1 of 1 follow-up (`MAX_ERRATUM_FOLLOWUP_ROUNDS`) |
| Confirmation rounds | cross-review 9 (v0.6), cross-review 10 (v0.7) |
| Halt rule | R4 — High-delta remains and follow-up budget spent → `erratumPostmortemHalt` |

**Provenance**
- Engine version: 0.2.3
- Plugin version: 0.23.4
- Plugin compat: ^0.23.0
- Channel: engine
- Mode: latest (pin: n/a)
- Load root: /Users/kaneho/.local/share/mise/installs/node/20.20.1/lib/node_modules/@kaneho/pdlc-engine/vendor/workflows
