# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md` (v1.2)
**Upstream read:** `REQ-pdlc-advisory-wave-gate.md` v1.8, `FSPEC-pdlc-advisory-wave-gate.md` v1.3
**Prior review:** `CROSS-REVIEW-product-manager-TSPEC-v2.md` (iteration 2)
**Date:** 2026-08-20
**Iteration:** 3
**Scope:** Product lens only — requirements traceability, scope compliance, acceptance-criteria fidelity.

## Grounding note

Delta protocol followed. `CROSS-REVIEW-product-manager-TSPEC-v2.md` re-read first, then
`git diff 13c9a390..HEAD -- docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md`
(162 insertions, 51 deletions) taken as the change set: the changelog block, §2.5, §3.1–§3.3,
§3.5, §4.5, §5.1, §5.2, §5.5, §5.6 and §6's OQ-9…OQ-11. Only those sections were scanned for new
issues; sections approved in round 2 were not re-litigated.

Every behavioural claim added this round was checked against shipped code rather than against the
document's prose:

- `ADVISORY_REFUSAL_REASONS` is still the frozen eight-member catalogue
  (`pdlc/workflows/orchestrate-dev.js:2297-2306`) — no ninth member, as §2.5 now promises.
- `renderAdvisoryEntry`'s null-verdict fallbacks are exactly as §2.5 transcribes them: Confidence
  `n/a`, Envelope `n/a`, Diagnosis `no verdict was produced`, and a bare `escalated` Disposition
  when `reason` is falsy (`:2926-2934`).
- `renderEscalationEntry` renders a null reason as `n/a` and carries the caller's `decision`
  sentence verbatim (`:3059`, `:3065`) — so the diagnostic-prose route §2.5 chose really is
  available.
- `gatherEvidence` is called inside the driver's `while (true)` attempt loop (`:3393-3396`) and
  `verifyGate`'s `consumesAttempt: true` re-enters that loop (`:3545-3568`). The document's
  correction — that the `__preDispatch` escape (`:3401-3410`) is unreachable before the driver is
  entered, and that capture must therefore run at the call site — is right, and the
  one-snapshot-per-wave argument for it is right.
- `appendAdvisoryEntry({feature, disposition, _appendFile, _now})` (`:2965`) and
  `appendEscalationEntry({disposition, ctx, _appendFile, _now})` (`:3090`) have the signatures
  §2.5 names, and `ADVISORY_ESCALATIONS.seam({seam, feature, reason})` (`:1578-1580`) really does
  put free message text in the `reason` slot.
- The record-write / escalation-write asymmetry §2.5 mirrors is the shipped one (`:3331-3345`).
- `ADVISORY_SEAM_PHASES` today has five members, A1…A5 (`:3108-3114`), so §3.1's "gains
  `A6: {id: "I", outcome: "halted"}`" is an addition the document owns, correctly stated as one.

## Prior findings — disposition

| Prior | Severity | Status | Evidence |
|---|---|---|---|
| F-01 `snapshot-unavailable` occupied the reason position, extending a closed set REQ AC-3.4 forbids extending | High | **Resolved** | §2.5's field table now reads "no refusal reason — `reason: null`"; the word survives only as prose in the escalation decision sentence, the notice and §4.5's `diagnosis`. §5.6's AT-03-7 row still asserts eight members in shipped order, and a companion assertion pinning the catalogue is added to §5.2's fixture. The remedy is exactly the one AC-3.4 and BR-15 name |
| F-02 the `__preDispatch` escape was named as the capture-failure carrier, but capture precedes the driver | Medium | **Resolved, and better than asked** | §2.5, §3.2 step 4 and §3.5 now agree on one answer: capture runs at the call site, the escape is explicitly unavailable, and `runWaveGateSeam` writes the record entry, the escalation entry and the notice itself in a stated order. The reason given — capture inside `gatherEvidence` would re-capture on attempt 2 and destroy the one-snapshot-per-wave invariant — is verifiable at `:3393` and `:3554-3568`, and it is a stronger reason than the one I had |
| F-03 §4.5's halt-fields row did not say what the four fields hold on the capture-failure path | Low | **Resolved** | §4.5 gains a four-row literal table: `rootCause` `"unclassified"`, a fixed `diagnosis` sentence, `repairApplied` `false`, `repairPaths` `[]` — transcribable values, not derived ones, which is what lets §5.5 assert them |
| Q-01 does Phase T hold for the BR-9 erratum? | — | **Answered** | §6 OQ-9: no. Both dependent cases are marked upstream-pending and PLAN mints them with the expected value named as pending |
| Q-02 promote the trailing-slash trap to the constraint corpus? | — | **Answered** | §6 OQ-10: recommended, routed to Phase H for promotion, with this feature's PLAN carrying the slash as a Phase P authoring requirement |
| Q-03 does the ignored-path-only refusal stand independent of OQ-7? | — | **Answered** | §6 OQ-11: yes, in either direction |

All three prior findings are genuinely closed. The two findings below are **delta** — both were
introduced by this round's edits, in the sections that fixed the prior findings — and one Medium is
a rendering defect in how this round's new prose was attached to existing tables.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Local | §3.2 step 6's new ledger-growth rule, read literally, refuses a genuine resolution reached on attempt 2 or later — the case the attempt budget exists for | REQ AC-4.1 (i); AC-4.6; E-20 |
| F-02 | Medium | Local | Three load-bearing clauses added this round are appended past their table row's final pipe, so a GFM renderer drops them | REQ AC-4.1 (iii); AC-7.x (NFR-3) |
| F-03 | Medium | Local | The capture-failure record entry's `Model` cell has no specified value, and the shipped renderer will print `undefined` into an operator-facing record | REQ AC-6.1 |

### F-01 — the step-6 ledger check discards a multi-attempt resolution (High, delta, local)

§3.2 step 6 now reads (`TSPEC-pdlc-advisory-wave-gate.md:437-440`):

> `resolved: true` requires **both** `outcome === "resolved"` **and** the wave's `invocations`
> ledger (§2.4) having grown, since dispatch, by the wave's own gate sequence — the ordered
> `["post-wave", "test"]` pair, or `["test"]` when no post-wave command is configured.

The rule itself is right and I am glad it exists: TE F-14 was correct that §5.5's mutation fixture
needed a stated rule to falsify, and BR-7 is the right authority for it. The defect is in the
quantity the rule names. "Grown, since dispatch, by the ordered pair" is an equality over the whole
growth since dispatch, and on any run that takes more than one attempt the growth since dispatch is
**not** one pair.

The shipped driver re-enters its attempt loop on a red re-gate: `verifyGate` returning
`{passed: false, consumesAttempt: true}` reverts, increments `attempts` and `continue`s
(`pdlc/workflows/orchestrate-dev.js:3545-3568`), with `attemptBudget` defaulting to `3`
(§3.1's `ADVISORY_DEFAULTS`). So the ordinary shape of a *successful* two-attempt repair is:
dispatch, apply, red re-gate (`[post-wave, test]` appended), revert, second dispatch, apply, green
re-gate (`[post-wave, test]` appended again). Growth since dispatch is four tokens. §2.4's own
worked table says as much for a single consumed attempt — `[post-wave, test, post-wave, test]`
(`TSPEC:187`) — and its second row, `[post-wave, test, post-wave]`, shows growth need not even
consist of whole pairs.

Under the literal reading of step 6, that green, gate-verified wave is reported `{resolved: false}`,
the wave budget is not incremented, and "the caller rethrows the first pass's halt". The product
consequences are all bad and none of them are visible to the operator as what they are:

1. **REQ AC-4.1 conjunct (i) is violated** (`REQ-pdlc-advisory-wave-gate.md:386-388`): a green
   re-gate must yield a resolved wave, with the re-gate recorded as an invocation. Here the re-gate
   ran, was green, and was recorded — and the wave is reported unresolved anyway.
2. **The repair is left in the working tree while the run halts.** BR-9's three restoration
   triggers are refusal, budget exhaustion and red re-gate (`FSPEC:198`, `REQ:441`); none fired, so
   nothing is reverted. The operator gets a halt whose message is the first pass's
   `Wave N test gate failed` literal, on a tree that now contains a machine-authored change that
   *passed* the gate. FSPEC's own §BR-9 note (`FSPEC:209`) says the operator must never be told a
   change was reverted when it was not; this is the mirror failure — the operator is told the gate
   failed when it passed.
3. **The feature's headline benefit is lost on exactly the runs it was bought for.** A repair that
   lands first try is the easy case; the attempt budget exists because the second attempt is common.

I do not think the author intends the literal reading — the sentence is plainly aimed at the
`{passed: true}`-without-running mutation. But this document is PLAN's and Phase I's transcription
source, and step 6 is written as a normative call-site rule with an exact expected value, so it will
be transcribed as written.

**To resolve:** state the quantity so it holds for every attempt count. The property that actually
distinguishes the mutation is *the last `verifyGate` before the resolution appended the wave's gate
sequence* — e.g. "the ledger's final tokens, since dispatch, are the wave's own gate sequence, and
the ledger grew by at least one such sequence per attempt taken". Reconcile §3.2 step 6, §3.3's
`verifyGate` row and §5.5's mutation-fixture bullet (`TSPEC:1019`) to one wording, and add a
positive companion case to §5.5's fixture: a two-attempt run whose second re-gate is green is
reported **resolved**, with the ledger showing `[post-wave, test, post-wave, test]`. Without that
companion the mutation fixture passes on an implementation that resolves nothing at all, which is
the same absence-only shape §5.5 elsewhere works hard to avoid.

### F-02 — this round's new clauses are appended outside their tables (Medium, delta, local)

Four clauses added this round were attached by extending an existing table row *past its final
pipe*, so the row carries one more cell than the header declares. GFM discards the surplus cell,
which means the text does not render:

- `TSPEC:459` — §3.3's `gatherEvidence` row, header `| Member | Behaviour |` (2 columns), row has 4
  pipes / 3 cells. The dropped cell is the one saying `gatherEvidence` deliberately does **not**
  take the snapshot, and that the step-3 `__preDispatch` escape is not a per-attempt hazard
  (TE Q-01).
- `TSPEC:466` — §3.3's `verifyGate` row, same table, same shape. The dropped cell is the one saying
  its append to `invocations` is what step 6 reads.
- `TSPEC:1004` and `TSPEC:1005` — §5.5's `(g)` and `(h)` rows, header 4 columns, rows have 6 pipes
  / 5 cells. The dropped cells are TE Q-02's "the fixture's repo **has** a config file on disk
  before the run" (without which the byte-identity oracle is satisfied by absence) and TE F-17's
  "the dispatch options object carries no key beyond the shipped seam's" (the premise that makes
  `(h)`'s negative falsifiable).

The prose is in the file, so this is not a lost decision — but it is invisible in every rendered
view, and two of the four cells are the *only* statement of an oracle premise a test author must
transcribe. The `(g)` clause in particular is the difference between a real test and one that
passes vacuously, and it is exactly the class of defect §5.5 was written to prevent.

**To resolve:** move each clause inside its row's final cell (or below the table as a labelled
note). Mechanical check: every row in a table should have exactly `columns + 1` pipes.

### F-03 — the capture-failure record entry's `Model` cell is unspecified (Medium, delta, local)

§2.5's table specifies the capture-failure record entry as
`appendAdvisoryEntry({feature, disposition, _appendFile, _now})` with `verdict: null`, and credits
the renderer's null-verdict fallbacks for Confidence, Envelope and Diagnosis (`TSPEC:262`). Those
fallbacks exist and are exactly as described. `Model` has no fallback:
`renderAdvisoryEntry` computes `modelValue` as the fallback-suffixed `model` or the bare `model`,
and interpolates it unguarded (`orchestrate-dev.js:2934`, `:2947`). On this path no model was resolved —
§2.5 says so itself, "no `_agent` call, no rung resolution, no driver entry at all" — so the
disposition object has no `model`, and the operator's `ADVISORY-{feature}.md` gets
`| Model | undefined |`.

AC-6.1 requires a record entry for every A6 invocation that an operator can read and act on. An
`undefined` cell is the kind of detail that reads as a bug in the tier rather than as "no model was
involved", and it will be the first thing anyone notices on the one path where the operator is
already dealing with a failure they did not expect.

**To resolve:** name the literal `Model` value for this path in §2.5's table alongside the other
fields — `n/a` matches the Confidence/Envelope fallbacks and needs no renderer change if the
disposition simply carries `model: "n/a", fallback: false`. Add it to §5.2's capture-failure fixture
assertions, which already transcribe the other cells.

## Questions

| ID | Question |
|----|---------|
| Q-01 | §6 OQ-7's erratum on FSPEC BR-9 / AT-05-1 and REQ AC-5.1 still has not landed — REQ is v1.8 and FSPEC v1.3, unchanged since round 1. I have re-emitted the erratum lines this round. OQ-9's ruling that Phase T need not hold is right and I accept it; the question I want recorded is what PLAN does if the erratum is still open when Phase I reaches AT-05-1's task. Does the pending expected value become a skipped test, or a task that blocks its wave? |
| Q-02 | §3.1 says `ADVISORY_SEAM_PHASES` gains `A6: {id: "I", outcome: "halted"}`. On the capture-failure path the phase outcome recorded in `ESCALATIONS.md` is therefore `halted`, which is true of the wave — but the escalation is written *before* the halt is thrown (§2.5's stated order). Is there any run shape where A6 escalates and the phase does not go on to halt, making the constant's fixed `halted` a false record? I could not construct one, and if the author cannot either, saying so in §3.1 closes the question permanently. |

## Positive Observations

- **F-01 was fixed by finding a better reason than the one I gave.** I asked for the reason position
  to be `null` because AC-3.4 forbids a ninth member. The document does that, and then explains
  *why* `null` is a first-class value the shipped tier already handles — `reason: pre.reason ?? null`
  at `:3406`, the bare-`escalated` render at `:2926`, `n/a` in the escalation entry at `:3065`. I
  checked all three; they hold. The word `snapshot-unavailable` now lives in exactly the three
  free-text slots the document names and nowhere else.
- **The F-02 correction is the rarest kind: the document says it was wrong.** "The shipped
  `__preDispatch` escape is **not** available on this path, and the earlier draft's claim that it
  was is corrected here." Then it gives the mechanical reason — `gatherEvidence` sits inside the
  attempt loop, `consumesAttempt: true` re-enters it, so capture there would re-capture over the
  tree attempt 1 already changed. That reason is better than my finding: I only noticed the escape
  was out of reach, not that putting capture in reach would break the invariant.
- **§4.5's four literal halt-field values are transcribable, and the `diagnosis` sentence is
  honest.** "snapshot capture failed (snapshot-unavailable); no repair was proposed and none was
  applied" — AC-6.3 asks for a diagnosis and the honest one here is that none could be obtained.
  `repairPaths: []` rather than `undefined`, justified by halt-report shape consistency, is the kind
  of detail that stops a Phase I author inventing an answer.
- **§5.1 dropped the arithmetic instead of updating it.** "The earlier draft's parenthetical
  arithmetic ('seven here, ten there') was itself the drift it was warning about." Replacing a
  count with a set-equality rule against a named authoritative list is the correct fix, and it
  generalises.
- **§5.6's AT-07-1 oracle became a set-equality with a named literal.** `BR-1…BR-16` minus the
  proposable set must equal the transcribed non-proposable set, so a rule that silently becomes
  proposable reddens the test. That is the completeness discipline stated as an executable rule
  rather than as an intention, and AT-06-1's field-set equality does the same for the record schema.
- **§6 grew three rows that answer rather than defer.** OQ-9, OQ-10 and OQ-11 each carry a ruling —
  including OQ-10 routing the trailing-slash trap to Phase H for promotion to the constraint corpus
  with a Phase P lint named as the eventual enforcement point. That is the right home for it, and a
  better answer than the one I asked for.
- **§5.2's new one-snapshot-per-wave call-count assertion is the right proof for the right claim.**
  `captureTreeSnapshot` called exactly once across a two-attempt run, asserted as a call count on
  the `_git` double — because that invariant is precisely what forced the capture out of
  `gatherEvidence`. The design decision and its test are the same statement.

## Recommendation

**Needs revision** — one High finding (F-01).

All three prior findings are resolved, two of them more thoroughly than I asked. The single blocker
is a quantity in a rule that is otherwise a genuine improvement, and it is a small edit:

1. **F-01** — restate §3.2 step 6's ledger condition so it holds for any attempt count (the last
   `verifyGate` before the resolution appended the wave's gate sequence), reconcile §3.3's
   `verifyGate` row and §5.5's fixture bullet to the same wording, and add the positive companion
   case: a two-attempt run with a green second re-gate is reported **resolved**.

Then, not gating but worth doing in the same pass:

2. **F-02** — move the four appended clauses inside their table rows; three of them are the only
   statement of an oracle premise.
3. **F-03** — name the `Model` cell's literal value on the capture-failure path.

One note for the erratum channel rather than for this document: the BR-9 `.gitignore` boundary
(OQ-7) is still open upstream after two rounds. I have re-emitted it.


## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 2, "low": 0}
