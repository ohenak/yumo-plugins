# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-headless-engine/TSPEC-pdlc-headless-engine.md` (v1.5)
**Upstream read:** `REQ-pdlc-headless-engine.md` (AC-3.1, AC-3.3), `FSPEC-pdlc-headless-engine.md` (BR-MODEL-3, `:654-656`), `docs/_constraints/pdlc-engine-baseline.md` (M-ENG-07)
**Prior review:** `CROSS-REVIEW-product-manager-TSPEC-v5.md` (1 High, 1 Medium, 1 Low)
**Diff reviewed:** `1854026a~1..HEAD` on TSPEC (+140/−34)
**Date:** 2026-08-11
**Iteration:** 6
**Scope:** delta re-review — v5 findings and what v1.5 changed; unchanged sections not re-litigated

## Disposition of v5

| v5 | What v1.5 does | Status |
|---|---|---|
| F-01 (High) — row 4's terminal conjuncts unsatisfiable, because §7.0's accumulator is append-only and the line was written at composition | §4.1 gains the write-timing bullet (`TSPEC:781-792`): the descriptor is **stamped** at composition and **written** at settlement, one line per *attempt*, carrying that attempt's `outcome`/`errorText`. §7.0 states the same rule at the accumulator (`:1425-1431`), §7.4's seam cell restates it (`:1546`), row 4 declares `F` a **settlement line** (`:1589`), and §8.3's `adapter.mjs` row carries the append (`:1904`). | **Resolved.** The predicate is now decidable from the file: the line row 4 reads exists after `outcome` exists. |
| F-02 (Medium) — the fifth suite-wide row named no filter field, so "run-shaped test" was not computable from the records | §4.1 (`:741-744`) and §7.4 (`:1548`, `:1723-1729`) name `corpusRun != null` as the scope, with `corpusRun` documented as harness-supplied (`:1576-1577`) and the excluded unit tests spelled out. | **Resolved.** |
| F-03 (Low) — the fifth row's predicate was written over a report key, not over records | The predicate is now **no record with `corpusRun != null` has `phase === null`**, with `byPhase["(no phase)"]` demoted to an explicit reader-facing gloss (`:1548`, `:1720-1725`), and §8.3's checklist row matches (`:1909`). | **Resolved.** |

Both remaining Mediums/Lows from v5 are closed, so nothing carries forward. Citations added in this
round were re-checked at HEAD and are exact: `transport.mjs:98` (`classifyThrown`) with the
unrecognised arm at `:123` returning `TransportError`, which §5.1's table (`TSPEC:1076`) maps to
`transport-contract-violation`; `adapter.mjs:273` (`composePrompt(skill, prompt)` inside `_agent`);
`bin/pdlc.mjs:173` inside `emitDryRun` over `inertTransport()` and `:205` inside `liveAdapter`
(`:196-197`, "Build the live adapter"); `cmdDoctor` at `:157` constructing no adapter and printing
"doctor: all checks passed. No dispatch was performed." at `:162`; `recoverVerdict`
(`orchestrate-dev.js:7454`) dispatching `{ model: "haiku" }` at `:7463`, called at `:5992` and
`:6001`; `dispatchAt` closing over one `prompt` at `:1840-1842`.

## Findings

No High findings. My v5 High is closed in the mechanism I asked for, and the revision's new text
holds up against HEAD except for one illustration that is factually wrong about the `--dry-run`
surface — recorded as Medium because it misdirects the implementer without making any oracle wrong.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | **The "composed but never executed" branch cites a path that composes no dispatch at all, and the document contradicts itself about it.** The new timing rule is illustrated in five places by one example — "a dispatch composed but never executed — the inert transport behind `--dry-run` (`bin/pdlc.mjs:173`, §3.4) — has no settlement, so its line is appended at composition with both terminal fields `null`" (`TSPEC:789-791`, repeated at `:25-26`, `:1430-1431`, `:1546`, `:1750-1751`, `:1904`). At HEAD neither half is true. `emitDryRun` never dispatches: it builds the adapter at `:173` and then calls `adapter.composePrompt(skill, …)` directly at `bin/pdlc.mjs:190`, so no descriptor is composed and no line of any kind is produced — which §7.1 already says in the document's own words, "`--dry-run-skill` (`bin/pdlc.mjs:171-172`) composes a prompt without dispatching … the CLI's own surface is testable without a transport at all" (`TSPEC:1476-1477`). And if a dispatch *were* routed through that adapter, `inertTransport().dispatch()` **throws** (`bin/pdlc.mjs:98-104`, "dry run: dispatch attempted — the dry-run surface must not contact a model"), so the attempt would settle as a rejection and the line would carry `outcome: "transport-contract-violation"`, not `null` terminals. Two product risks, in order: an implementer reading `:789` literally may wire `_agent` into `emitDryRun` to make the branch reachable, which trips that throw and changes AC-3.1's inspection surface from a printed prompt into an error; or the branch ships as dead spec while §7.4's claim that "a composed dispatch that never executes … is appended at composition" (`:1750-1751`) reads as a live guarantee nobody tests. **Fix:** either drop the branch and state the rule plainly — one line per attempt, appended at settlement — or keep it and name a path that actually composes without settling; and reconcile `:789` with `:1476`. FSPEC BR-MODEL-3 ("a descriptor exists when a dispatch is composed … no row depends on billed traffic", `FSPEC:654-656`) survives either way, because the corpus's settlements are fixture transports (§7.2) and none is billed — the guarantee does not need this example to stand. | AC-3.1, BR-MODEL-3 |
| F-02 | Low | Local | **Row 4's pinned outcome member is derived correctly, but the derivation depends on an injection point row 4 does not name.** `F.outcome === "transport-contract-violation"` (`TSPEC:1589`) is sound *provided* run iv's rejection enters through the transport, where `classifyThrown` (`transport.mjs:98`) sends everything unrecognised to `TransportError` (`:123`). That holds today because §7.1 requires every test to build its transport through `createTransport({ queryFn })` (`TSPEC:1457-1459`), but §7.4's own witness bullet (`:1698-1706`) says only "run iv's fixture injects the model-resolution rejection" (`:772`). A fixture that instead substituted a whole transport double would bypass `classifyThrown`, and the pinned member — the very literal TE F-32 asked for — would be red on correct code for a reason no reader of §7.4 can see. **Fix:** one clause in the row-4 bullet: run iv injects at `queryFn`, per §7.1's construction rule. | AC-3.3 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Rows 1 and 2 are universals over run i's descriptors, and the corpus now records **one line per attempt**. A rate-limit retry appends a duplicate carrying the same `model` (`TSPEC:775-781`), which is why the duplicates are harmless — but a dispatch that exhausts its retry budget also settles, as `retryable` then a terminal failure. Does run i's fixture set guarantee no rung exhausts its budget, or is that simply out of reach for a healthy-path fixture? Not a finding: either way the recorded `model` is `opus`/`sonnet` and rows 1/2 stay true. |
| Q-02 | §7.5's new note says the live path installs no observation writer, so `errorText` never reaches disk outside the hermetic suite (`TSPEC:1775-1781`). That answers my v5 Q-01 cleanly. One forward-looking check: §6.5's guard measurement is a live test too — does it run under the same runner (and therefore under `--import=./__tests__/_bootstrap.mjs`), and if so does it inherit the writer? If it does, the "no records on the live path" claim needs the exception named. |

## Positive Observations

- **The fix landed where I asked and nowhere else.** F-01 was one hop — write timing — and v1.5
  states it once in §4.1, echoes it at the accumulator (§7.0), at the seam cell and at row 4, and
  carries it into §8.3's edit surface. The design did not grow a second mechanism to close a
  one-sentence gap, and row 4 was not loosened, which was the outcome I was most worried about.
- **The Medium was closed by strengthening, not by deletion.** The obvious cheap fix for the fifth
  row was to drop it back into prose. Instead `corpusRun != null` makes "run-shaped test" a computable
  property of the record, so the row is now the only one of the five whose scope a reader can check
  against a `.jsonl` line by eye.
- **Pinning `transport-contract-violation` is the right call and the reasoning is honest about why.**
  `!== "ok"` would have passed a fixture that regressed into injecting a timeout — a run that never
  exercised model resolution at all (`TSPEC:1702-1706`). The member is derived from §5.1's table
  rather than imported from the classifier, so the oracle still transcribes the spec instead of
  echoing the module.
- **TE F-34's answer strengthens run i rather than excusing it.** The "zero `haiku`" assertion now
  closes both sites — the PLAN-DAG fallback and `recoverVerdict` — by naming the fixture property
  that keeps the second one shut (`TSPEC:1621-1628`). I re-checked it at HEAD: `recoverVerdict`
  (`orchestrate-dev.js:7454`) fires only on a malformed trailer, from `:5992`/`:6001`, so
  "run i's reviewer fixtures emit well-formed trailers" is a real obligation on the fixture, not a
  restatement of the assertion.
- **TE F-31's correction is worth more than its severity suggests.** `doctor` constructs no adapter
  (`bin/pdlc.mjs:157`), and v1.4 had it as one of the two tunable resolution points. Getting that
  wrong would have put an effective-value oracle on a command that never dispatches.

**Traceability:** AC-3.3's two directions are unchanged and now decidable from the recorded file;
AC-3.1's dry-run surface is untouched in intent (F-01 is about an illustration of it, not a change to
it); BR-MODEL-3's composed-not-billed guarantee is preserved by the fixture transports. No scope
creep and no product decision is made in this revision.

## Recommendation

**Approved with minor changes**

My v5 High is resolved: the record's write timing is pinned in the design, row 4's `F` is a
settlement line, and the append-only accumulator can no longer make a correct implementation red. The
two Mediums/Lows are resolved as well. What remains is one wrong illustration (F-01) and one
unstated injection point (F-02) — neither gates the document, and both are single-clause edits the
next author can fold in without another round:

1. **F-01 (Medium, non-gating)** — drop or re-ground the "composed but never executed" branch; it
   contradicts `TSPEC:1476` and `bin/pdlc.mjs:98-104`, `:190`.
2. **F-02 (Low, non-gating)** — say that run iv injects at `queryFn`, so row 4's pinned member is
   derivable by a reader of §7.4 alone.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}

APPROVAL-HASH: sha256:2ac2592d7f0085a64caf2e4d6080743fccaba7f9aa9e928ddbbbce5010a7965d
REVIEWED-COMMIT: 22eb0b3b07624811224ed9759821c0c6d6f91fbf
