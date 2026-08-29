# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-decision-ledger/PLAN-pdlc-decision-ledger.md` (v0.5, se-author)
**Date:** 2026-08-29
**Iteration:** 5 (delta re-review)
**Scope:** Local

## Overview

Delta re-review of `PLAN-pdlc-decision-ledger.md` **v0.5** against my v4 delta confirmation
(`CROSS-REVIEW-product-manager-PLAN-v4.md`, verdict *Needs revision*, reviewed at `36cd34d4d`).

Two commits touched the document since:

| Commit | Time | What changed |
|---|---|---|
| `4950ea00c` | 08:10 | PLAN v0.5 operator pass — lands the erratum items my v4 found unlanded (`RESOLVED: yes`) |
| `a408375a6` | 08:51 | Names T-19's terminal `102` control in the per-phase file-ownership manifest |

Aggregate `git diff 36cd34d4d..HEAD`: **19 insertions / 12 deletions**, one file. Sections
changed: the header Upstream row, the revision-history block, rows **T-00a**, **T-11**, **T-12a**,
**T-19**, one row of §Per-phase file-ownership manifest, and two §Definition of Done bullets.
Everything else is byte-unchanged and is not re-litigated here.

**All three of my v4 findings are resolved** — the High (F-01, terminal `102` ownership), the
Medium (F-02, transposed `DECISIONS` pin) and the Low (F-03, T-11's orphaned second operand). The
landing is clean and I verified each mechanically; detail in §Batches and §Dependencies.

**What this round nonetheless cannot approve is not the edit — it is the ground under it.** The
approved upstream `TSPEC` advanced from **v0.8** to **v0.9** at 08:37–08:38, *after* the v0.5
operator pass at 08:10, and v0.9 rewrote §7.3 — the exact section this edit newly cites in T-11.
The PLAN's header still pins `TSPEC` **v0.8**, and T-11's census contract now contradicts approved
`TSPEC` v0.9 in two load-bearing ways. Both are pre-round bytes overtaken by upstream movement, so
both are tagged `inherited`: this is a re-grounding pass owed to the PLAN's ordinary revision loop,
not a defect the operator pass introduced, and not an erratum against `TSPEC` (the `TSPEC` is
right; the PLAN is stale). No `ERRATUM:` lines this round.

## Batches

**F-01 (High, v4) is resolved — the terminal `102` control now has exactly one named owner.** My
v4 High was that T-00a paired a batch-1 acceptance with a conjunct only evaluable at batch 9, and
pointed at T-12a, which explicitly disclaimed it — so the terminal count was homeless, and had
already misdirected PROPERTIES (PROP-DISC-07). The v0.5 edit closes it at **four** consistent
sites, and I checked all four on disk:

1. **T-00a (`PLAN`:117)** now reads "Acceptance is **one-sided and evaluable at batch 1**: the
   exclusion lands and the pre-existing suite is green at `102`", followed by a forward pointer —
   "the **terminal** re-check … is **owned by T-19** (batch 9, the first point at which it is
   evaluable)". The unevaluable conjunct is gone from the batch-1 obligation; the pointer names a
   task, not a vacancy.
2. **T-12a (`PLAN`:131)** replaces its bare disclaimer with an attributed one: "It is a set, not a
   count — the terminal `102` *count* assertion is **T-19's obligation**, not this task's". The v4
   contradiction (two rows disclaiming the same obligation) is gone.
3. **T-19 (`PLAN`:139)** carries the obligation as its own acceptance text: "**Terminal `102`
   positive control (T-00a's deferred conjunct, owned here):** with all twelve `decisionLedger*`
   modules on disk, `documentOracles.test.js`'s `*.test.js` census still counts `102`".
4. **§Per-phase file-ownership manifest (`PLAN`:205)** — the `documentOracles.test.js` row for
   T-19 now reads "9 (un-skip; also the terminal `102` positive control)", so the manifest and the
   task table agree, and **§Definition of Done (`PLAN`:450–454)** splits the checkbox into the two
   owners it always had: exclusion "landed by T-00a at batch 1", count "with all twelve modules on
   disk (the terminal positive control, owned by T-19)".

No double-counting and no orphan: exactly one task asserts the count, exactly one asserts the
exclusion, and T-12a's twelve-name **set** census is preserved as the distinct obligation it is.

**The underlying facts check out in code.** `pdlc/workflows/__tests__/documentOracles.test.js`:415–418
carries exactly the four exclusions T-00a names (`learnings`, `waveResume`, `loop`,
`escalationView`) and `:420` pins `expect(count).toBe(102)` — so both the literal and the
exclusion shape the tasks describe are real, not aspirational. The "twelve modules" the terminal
control and T-12a's set census both quantify over is exact: §Per-phase file-ownership manifest
(`PLAN`:162–226) names twelve distinct `decisionLedger*.test.js` modules and no more
(`decisionLedgerBaselineGuard`, `Bounds`, `Census`, `Config`, `Corpus`, `FixtureGuard`,
`Injector`, `Loop`, `Main`, `Preflight`, `Recognise`, `Render`). Every file the changed rows name
either exists at HEAD (`documentOracles.test.js`, `orchestrate-dev.js`,
`.claude/pdlc.config.example.json`, `pdlc/OPERATIONS.md`, `pdlc/README.md`, `CLAUDE.md`) or is
tagged `[new]`.

**F-03 (Low, v4) is resolved.** T-11's second census operand is a full sentence again — "The
census's second operand: `orchestrate-dev.js`'s source **minus** four owned regions …" — no longer
a lowercase-`and` fragment stranded behind a full stop.

**Nothing I previously approved is broken.** T-00a keeps its saturation arithmetic (154 files, 102
after exclusions), its TE F-03 "what the positive control does and does not prove" paragraph and
its "not a re-pin of the literal" rationale; T-12a keeps every derived-not-transcribed and
set-equality conjunct and the ~:625 confinement discipline; T-19 keeps the whole re-pinning budget
paragraph, and its new sentence is strictly additive. The batch and dependency columns of all four
changed rows are untouched.

**What the changed T-11 row no longer matches is upstream** — see §Dependencies. That is the one
open item.

## Dependencies

**Upstream re-derivation at HEAD.** The v0.5 revision history claims the `DECISIONS` pin "is
re-derived mechanically from `shasum -a 256`". I re-measured all four upstream pins the header
carries (`shasum -a 256`, first-8 + last-6, the abbreviation convention the header itself uses):

| Upstream | Header pin (`PLAN`:9) | Measured at HEAD | |
|---|---|---|---|
| `REQ` v1.9 | `ce6b133f…3c7b7c` | `ce6b133f…3c7b7c` | ✓ |
| `FSPEC` v1.3 | `2bd5c3ef…5aed39` | `2bd5c3ef…5aed39` | ✓ |
| `DECISIONS` | `13aba061…4fb89a` | `13aba061…4fb89a` | ✓ |
| `TSPEC` **v0.8** | `28d25518…32cb49` | `eef45ef3…0623c8` (**v0.9**) | ✗ |

**F-02 (Medium, v4) is resolved.** The `DECISIONS` pin's transposed suffix (`4bb89f`) is corrected
to the measured `4fb89a` and now verifies exactly. That was the whole of my Medium.

**But the `TSPEC` pin is now stale, and it is stale in a way that matters (F-01).**
`TSPEC-pdlc-decision-ledger.md`:17 reads **v0.9**; its changelog at :19–26 names the sections
touched — "§5.4, §7, §7.2, §7.3, and this changelog". The v0.9 commits landed at 08:37–08:38
(`588f4323e`, `4b28af44a`, `5189b73fb`) — **after** the PLAN v0.5 operator pass at 08:10, and
`TSPEC` v0.9 was approved with anchors recorded at 08:44 (`6b328e16a`, `sha256:eef45ef3…0623c8`).
The PLAN's own last commit is 08:51, and the sibling `DECISIONS` reviews of 08:47–08:50 already
record the move ("TSPEC moved v0.7 to v0.9", `6f1cb1415`). So the PLAN is the only document in the
phase still asserting a `TSPEC` v0.8 grounding.

This is not a citation hygiene point. **`TSPEC` v0.9's §7.3 rewrote precisely the census contract
T-11 compresses, and T-11 now contradicts it in two load-bearing ways:**

1. **The token set-equality operand.** T-11 (`PLAN`:135) says `DECISION_LEDGER_CENSUS_TOKENS`'s six
   members are "held to **set equality** against the module's exported decision-ledger symbol
   names". `TSPEC` §7.3 now names that exact comparison as the wrong one: *"Not set equality
   against all of the module's decision-ledger exports — that comparison is red by construction,
   since §3.1/§4.1/§4.2/§4.4/§5.2 declare roughly a dozen and only six are data-carrying."* The
   contract v0.9 specifies instead is a **partition**: `DECISION_LEDGER_CENSUS_TOKENS` ∪
   `DECISION_LEDGER_CENSUS_EXEMPT` = `DECISION_LEDGER_OWNED_DECLS`, with the two sub-sets
   **disjoint**. As written, an implementer following T-11 writes a set-equality that cannot go
   green.
2. **The scanned-source operand.** T-11 says the second operand is the source "**minus** four owned
   regions — three sliced by brace-matching from their declarations … and the `main()` wiring run".
   `TSPEC` v0.9 §7.3 requires the source minus the body of **every** member of
   `DECISION_LEDGER_OWNED_DECLS` (§4.1/§4.2/§4.4's top-level functions plus §3.1's
   `DECISION_CORPUS_ARGV`, §3.2's `DECISION_HEADING_RE`, §4.1's `DECISION_LEDGER_DEFAULTS`, §4.3's
   `DECISION_LEDGER_PREAMBLE` / `DECISION_LEDGER_RULE_TEXT`, §5.2's frozen catalogues), plus the
   sentinel-bounded wiring run — and says in terms that slicing "every owned declaration, not a
   hand-picked three, is what makes the census satisfiable". The hand-picked-three form T-11 still
   specifies is the form v0.9 diagnosed as unsatisfiable.

`TSPEC` v0.9 also introduces two frozen catalogues T-11 and the file-ownership manifest never
mention — `DECISION_LEDGER_CENSUS_EXEMPT` and `DECISION_LEDGER_OWNED_DECLS` — so no task in this
PLAN owns creating them, and no manifest row assigns them a batch. That is the completeness half
of the same gap: BR-11 / REQ NG-4's falsifiable proof is the census, and the PLAN currently plans a
census the approved design says cannot pass.

**The one thing the edit did land here is a partial re-point in the right direction.** T-11 and the
§Definition of Done census bullet (`PLAN`:471) both move their citation from `TSPEC` §5.5 to §7.3,
and that is substantively correct — v0.9's §5.4 (`TSPEC`:948–953) does say `report.decisionLedger`
"is deliberately **not** a census token — §7.3 records why", and points the field's whole proof at
§7.2's live composition-root arm, which is T-10a. The behavioural-discharge argument in T-11 and
the DoD bullet is faithful to v0.9. Only the *version label* on the citation ("TSPEC v0.8 §7.3")
and the surrounding census contract are stale.

## Verification

Traceability of the changed rows to the requirements they serve, and the test-shape bar applied to
the assertions they specify.

**The terminal `102` control is a genuine positive control, and it is now positioned where it can
run.** T-19's new conjunct pairs an absence-shaped obligation (the `decisionLedger` namespace is
excluded from the census) with a positive assertion on the same path (the complement still counts
`102` once all twelve modules exist). That is the paired-oracle bar, and T-00a's retained TE F-03
paragraph is honest about the limit — the complement pin cannot detect a *dropped* `decisionLedger*`
module, which is exactly why T-12a's twelve-name **set equality** exists alongside it. Set equality,
not containment and not a count, so a deleted case fails and names itself. Both halves survive the
edit intact.

**No implementation echo introduced.** T-12a's disclosure assertions remain "derived from the
production constants, never transcribed" for the three catalogues (`DECISION_LEDGER_OMIT_REASONS`,
`DECISION_LEDGER_NOTICES`, `DECISION_LEDGER_DEFAULTS`) while T-12a's namespace census and T-19's
`102` are transcribed literals — the right split, since the former assert *agreement between
document and code* and the latter assert a *spec figure*. The DoD bullet (`PLAN`:450–454) preserves
the "derived … rather than restated" wording.

**Coverage claims check out against the current suite layout.** `documentOracles.test.js` exists and
carries the census at :398–420; `pdlc/engine/__tests__/` is the home of the engine-side
`node:test` check T-12 targets, consistent with the `Engine tests (ubuntu-latest)` required check.
The four required PR checks the PLAN's landing task (T-20) re-runs are unchanged by this edit.

**The open item is a verification gap, not a wording gap.** BR-11 / REQ NG-4 is the requirement that
"no driver-side computation takes a decision id as input", and the PLAN gives it exactly one
falsifying instrument: T-11's source census. Because T-11 now specifies the census in the two forms
`TSPEC` v0.9 §7.3 explicitly ruled out (§Dependencies F-01), the instrument as planned cannot go
green, and the two catalogues v0.9 requires it to be built from (`DECISION_LEDGER_CENSUS_EXEMPT`,
`DECISION_LEDGER_OWNED_DECLS`) are unowned by any task and unlisted in the file-ownership manifest.
A P0-adjacent non-goal therefore has no landable proof in the plan. That is why F-01 is High rather
than a re-pin nit.

What I am **not** raising: the two v4 Medium/Low findings that predate this loop (T-03's shell-pipe
escaping, and the delta-coverage instruction's delivery across batches 3–8) remain open in the
ordinary loop and are unaffected by this edit; I do not re-raise them here.

## Positive Observations

- **The `102` ownership fix landed at every site that carried the ambiguity, not just the one the
  erratum named.** The dispatch asked for T-00a; the edit also corrected T-12a's disclaimer, T-19's
  acceptance, the file-ownership manifest row and the DoD checkbox. Four sites now tell the same
  story, which is what makes the fix durable rather than local — and it retires the ambiguity that
  had already misdirected PROPERTIES (PROP-DISC-07).
- **The one-sided/terminal split is the right product framing.** "Evaluable at batch 1" versus
  "first evaluable at batch 9" states *why* the obligation moved, not merely *that* it moved, so a
  future reader cannot re-merge them by accident.
- **The `DECISIONS` pin was re-derived, not patched.** The revision history says `shasum -a 256`
  and the measured value agrees to the character. Three of four pins now verify exactly; the fourth
  fails for upstream movement, not transcription — a different and more legible failure than v4's.
- **The §5.5 → §7.3 re-point is substantively correct.** It reads the current `TSPEC` accurately on
  why `report.decisionLedger` is not a census token and where its proof lives (T-10a). The author
  was reading the right section — the pass simply predates v0.9 by 27 minutes.

## Recommendation

**Needs revision**

One open High finding — the PLAN is no longer grounded on the approved `TSPEC`. All three of my v4
findings are resolved and the operator pass broke nothing. Exactly what must change:

1. **Header (`PLAN`:9):** re-pin `TSPEC` to **v0.9** `sha256:eef45ef3…0623c8` (measured at HEAD),
   and re-verify the other three pins in the same pass.
2. **T-11 (`PLAN`:135) — the token operand:** replace "set equality against the module's exported
   decision-ledger symbol names" with `TSPEC` v0.9 §7.3's partition:
   `DECISION_LEDGER_CENSUS_TOKENS` ∪ `DECISION_LEDGER_CENSUS_EXEMPT` = `DECISION_LEDGER_OWNED_DECLS`,
   the two sub-sets disjoint. Mirror the same correction in the §Definition of Done census bullet
   (`PLAN`:469–472), which restates the superseded form.
3. **T-11 — the scanned-source operand:** replace "minus four owned regions — three sliced by
   brace-matching" with the source minus **every** member of `DECISION_LEDGER_OWNED_DECLS` plus the
   sentinel-bounded wiring run, per §7.3.
4. **Ownership of the two new catalogues:** give `DECISION_LEDGER_CENSUS_EXEMPT` and
   `DECISION_LEDGER_OWNED_DECLS` an owning task (T-13/T-18-era) and a §Per-phase file-ownership
   manifest row, so BR-11 / REQ NG-4's only falsifying instrument is landable.
5. **Citation labels:** the two "TSPEC v0.8 §7.3" citations become v0.9 once the pin advances.

## Delta-Confirmation Findings

## Verdict
