# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-headless-engine/TSPEC-pdlc-headless-engine.md` (v1.5, unchanged)
**Upstream read:** `REQ-pdlc-headless-engine.md` (AC-3.1, AC-3.3), `FSPEC-pdlc-headless-engine.md` (v1.5 — BR-MODEL-3 `:670-674`, §6.3 `:580-585`)
**Prior review:** `CROSS-REVIEW-product-manager-TSPEC-v6.md` (0 High, 1 Medium, 1 Low)
**Diff reviewed:** `22eb0b3b..HEAD` — **TSPEC is byte-identical**; the round's change is upstream (FSPEC v1.4/v1.5 erratum)
**Date:** 2026-08-11
**Iteration:** 7
**Scope:** delta re-review — v6 findings, plus the effect of the FSPEC erratum on this document

## What changed this round

`git diff 22eb0b3b..HEAD -- docs/pdlc-headless-engine/TSPEC-pdlc-headless-engine.md` is **empty**.
The document under review did not change between v6 and v7. What moved is the document it derives
from: FSPEC went v1.3 → v1.5 across two erratum edits (`d98c7e88`, `74d29bda`), and both edits were
about the exact claim my v6 F-01 named.

FSPEC v1.4 rewrote BR-MODEL-3 (`FSPEC:670-674`):

> A descriptor exists when a dispatch is composed, so the whole corpus is reachable from hermetic
> fixture-driven runs and no row of the map depends on billed traffic. **The dry-run surface is not a
> way to reach it**: one invocation composes one skill's prompt and dispatches nothing (§6.3,
> BR-SKILL-5/6), so it exercises at most one row and is never the corpus's source.

FSPEC v1.5 then requalified §6.3's preamble to match (`FSPEC:583-585`).

So the upstream half of my v6 F-01 is **resolved, and resolved in the direction I argued**. The
downstream half is not: the five TSPEC sites that state the opposite are untouched, and they now
contradict an approved upstream rule rather than merely contradicting HEAD. That, plus the line-number
drift the erratum introduced into this document's citations, is the whole of this round's findings.

## Disposition of v6

| v6 finding | Status in v1.5 | Note |
|---|---|---|
| F-01 (Medium, Local) — the "composed but never executed" branch cites a path that composes no dispatch at all | **Half resolved, upstream.** FSPEC BR-MODEL-3 now says the dry-run surface "is **not** a way to reach it" (`FSPEC:672-674`). The five TSPEC sites (`:25-26`, `:789-791`, `:1430-1431`, `:1546`, `:1904`) are unchanged and still assert the branch. | Re-raised as F-01 below, same severity, stronger evidence: it is now a contradiction with an approved upstream rule, not only with HEAD. |
| F-02 (Low, Local) — row 4's pinned outcome member is derivable only if run iv injects at the transport | **Not addressed.** `:1698-1706` and `:772` are unchanged; §7.4 still says only "run iv's fixture injects the model-resolution rejection" without naming `queryFn`. | Re-raised as F-03 below, unchanged severity. |

Both were explicitly non-gating in v6 and the document converged without them; carrying them forward
is a record, not a re-litigation.

**Re-grounded against HEAD (not against the TSPEC's prose):**

- `emitDryRun` (`pdlc/engine/bin/pdlc.mjs:170-192`) builds an adapter with `inertTransport()` at
  `:171-176`, then calls `adapter.composePrompt(skill, …)` directly at `:190`. `composePrompt`
  (`lib/adapter.mjs:259`) is a separate entry point from the dispatch path, which composes at
  `:273`; the accumulator append is on the dispatch path only (`lib/adapter.mjs:376`, "Append-only
  record of dispatches through the tool `_agent`"). No descriptor is stamped and no `.jsonl` line is
  produced on the dry-run path. `inertTransport().dispatch()` (`:98-104`) is never called by
  `emitDryRun`.
- `cmdDoctor` (`bin/pdlc.mjs:156-169`) constructs no adapter and prints "doctor: all checks passed.
  No dispatch was performed." (`:161`) — §8.3's v1.5 correction still holds.
- `classifyThrown` (`lib/transport.mjs:98`) maps an unrecognised rejection to `TransportError`
  (`:123`) — row 4's pinned `transport-contract-violation` still derives from §5.1 as written.

## Findings

**No High findings.** Nothing in this round's upstream change breaks an acceptance criterion this
document carries, and no previously-approved section regressed — the document did not change. The two
Mediums below are both consequences of the erratum landing upstream without a downstream pass.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | **The TSPEC now states the negation of an approved FSPEC rule, in five places, and carries it into the edit surface.** FSPEC v1.4 fixed BR-MODEL-3 to read "The dry-run surface is **not** a way to reach it: one invocation composes one skill's prompt and dispatches nothing … and is never the corpus's source" (`FSPEC:672-674`), and v1.5 requalified §6.3 to match (`FSPEC:583-585`). The TSPEC still says the opposite at `:25-26`, `:789-791` ("A dispatch that is **composed but never executed** — the inert transport behind `--dry-run` (`bin/pdlc.mjs:173`, §3.4) — has no settlement, so its line is appended at composition with both terminal fields `null`"), `:1430-1431`, `:1546` (the §7.4 seam cell) and `:1904` (§8.3's `adapter.mjs` row). HEAD agrees with the FSPEC, not with the TSPEC: `emitDryRun` calls `composePrompt` at `bin/pdlc.mjs:190`, never the dispatch path, so no descriptor is stamped and `adapter.mjs:376`'s accumulator is never appended to on that path. Two costs, both real but neither user-facing: (1) `:1904` puts the branch in the **edit surface**, so Phase I is directed to build a composition-time append with `null` terminals for a case that cannot occur; (2) §7.4 itself says that line is one "which no row's predicate matches" (`:1750-1751`) — the design specifies an unreachable branch and simultaneously declares it untestable. Note the TSPEC's citation for the guarantee, `FSPEC:654-656` at `:792`, quotes the **pre-erratum** wording. **Fix (one edit, no mechanism change):** state the timing rule plainly — one line per dispatch *attempt*, appended when the attempt settles — and delete the dry-run clause at all five sites plus the `:1904` edit-surface parenthetical. The rule survives intact: `--dry-run-skill` composes without dispatching and produces no record, which is what `:1476-1477` already says and what BR-MODEL-3 now says. | AC-3.1, AC-3.3, BR-MODEL-3 |
| F-02 | Medium | Process | **Every `FSPEC:{line}` citation in this document is stale by ~18 lines after the erratum, and the erratum round did not re-anchor them.** FSPEC v1.4/v1.5 inserted two change notes at `:15-27` (+23/−5), shifting everything below. All five citations now land on unrelated text: `TSPEC:601` cites `FSPEC:193-196` for "every real run uses the primary transport" — that range is now the flags table; the claim is at `FSPEC:209-211`. `TSPEC:792` cites `FSPEC:654-656` for BR-MODEL-3 — now `:670-674`, and, per F-01, the wording changed too. `TSPEC:942` cites `FSPEC:1149-1160` for the §12.2 row-by-row — §12.2 now begins at `:1165`; `:1149-1152` is EC-REP-1 prose. `TSPEC:1096` cites `FSPEC:709` for "the dispatch ran and the agent reported failure" — that line is now AT-ENG-31; the quoted row is at `:727`. `TSPEC:1753` cites `FSPEC:190` for what `--dry-run-skill` prints — `:190` is now a blank line; the flag row is at `:203`. These citations are the document's own traceability instrument, and the reviewer checklist asks every claim to be checkable at a cited location — right now none of the five is. **Fix:** re-anchor the five, ideally to section anchors (`FSPEC §7.3, BR-MODEL-3`) with the line as a secondary hint, so the next upstream insertion does not rot them again. Tagged `Process` because the rot is mechanical and general: a versioned upstream edit shifts every downstream `file:line`, and per DEC-ERR-01 an erratum round already re-reads HEAD — re-anchoring downstream citations belongs in that same pass. | AC-3.3, DEC-ERR-01 |
| F-03 | Low | Local | **Row 4's pinned outcome member is derived correctly, but the derivation depends on an injection point row 4 does not name.** Unchanged from v6 F-02. `F.outcome === "transport-contract-violation"` (`TSPEC:1589`) is sound *provided* run iv's rejection enters through the transport, where `classifyThrown` (`transport.mjs:98`) routes everything unrecognised to `TransportError` (`:123`). §7.1 builds transports via `createTransport({ queryFn })` (`TSPEC:1457-1459`), but §7.4's witness bullet says only "run iv's fixture injects the model-resolution rejection" (`:772`, `:1698-1706`). A fixture that substituted a transport double instead would bypass `classifyThrown` and make the pinned literal red on correct code — the failure mode TE F-32 asked the pin to prevent. **Fix:** one clause in the row-4 bullet saying run iv injects at `queryFn`, per §7.1's construction rule. | AC-3.3 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | On severity for F-01: I have now recorded this at Medium three rounds running, and I want to be explicit rather than quietly consistent. It is a false statement about an approved rule, propagated into the edit surface — the shape that usually earns High. I am holding it at Medium because the product-lens test is user impact, and the worst case is a small dead branch and a misleading paragraph: no acceptance criterion narrows, no user-facing behavior changes, and §7.4's oracle is unaffected because no row reads that line. If the SE author reads it as a design commitment rather than an illustration, say so and I will escalate on the next round rather than argue severity here. |
| Q-02 | §6.5's hermeticity guard: does the live path ever run under `--import=./__tests__/_bootstrap.mjs`? §7.5 says the live path installs no observation writer, so `errorText` never reaches disk outside the hermetic suite (`TSPEC:1775-1781`). Carried forward unanswered from v6 Q-02 — not gating, and it becomes moot if F-01's fix removes the composition-time append entirely. |

## Positive Observations

- **The erratum went to the right document, and it went further than I asked.** My v6 F-01 offered
  two ways out — drop the illustration, or re-ground it. The author took neither shortcut: they
  traced the claim to its source in FSPEC BR-MODEL-3, corrected it there, and then found the *second*
  site at §6.3 that the first edit had missed (POSTMORTEM-T v2.0, Option B). FSPEC v1.5's change note
  even records the sweep — "§6.3 and §7.3 were the only two sites of the claim; every other dry-run
  mention (§3.1, §3.2, §4.1–4.2, §6.4, §7.3, §16) was read in full and attributes no model-map
  coverage to the surface" — which is exactly the completeness argument I would have asked for. That
  is a finding fixed at the root instead of at the symptom.
- **The corrected BR-MODEL-3 is stronger than the original.** v1.3 asserted a reachability claim that
  was false; v1.5 asserts the true one *and* names the bound — "it exercises at most one row and is
  never the corpus's source". A reader can now check the dry-run surface's reach against the code in
  one hop (`bin/pdlc.mjs:190`, one `composePrompt` call, one skill). The rewrite closed a gap rather
  than deleting the sentence that exposed it.
- **AT-ENG-29 and EC-DISP-6 were held byte-identical, and the change note says so.** The erratum
  touched the prose that was wrong and nothing that was approved. That is the discipline that makes a
  late upstream edit safe to accept without re-reviewing the whole FSPEC, and it is why this round
  costs one delta pass instead of a full re-read.
- **The mechanism I most cared about is untouched.** v5's High — the record's write timing — is still
  pinned at settlement, one line per attempt, in all four places v1.5 put it (`:781-792`, `:1425-1431`,
  `:1546`, `:1589`). The upstream churn did not loosen row 4 or reopen the accumulator's contract.

**Traceability:** AC-3.3's two directions are unchanged and remain decidable from the recorded file.
AC-3.1's dry-run inspection surface is unchanged in intent — F-01 is about a description of that
surface, not a change to it, and the FSPEC correction moved the description toward AC-3.1's actual
shape. BR-MODEL-3's composed-not-billed guarantee survives the correction intact, since the corpus's
settlements are fixture transports (§7.2) and none is billed. No scope creep, no requirement dropped,
and no product decision was taken in the erratum.

## Recommendation

**Approved with minor changes**

The TSPEC did not change this round, so nothing previously approved regressed, and the one v6 finding
that mattered was resolved — at its root, in the FSPEC, which is where it belonged. No High finding is
open. From the product lens this document is done: every P0/P1 requirement it carries traces, AC-3.3's
two directions are decidable from a recorded file, and AC-3.1's surface is unchanged.

Three non-gating edits to fold into the next touch of this file, all single-clause, none reopening a
decision:

1. **F-01 (Medium)** — delete the "composed but never executed / inert transport behind `--dry-run`"
   clause at `:25-26`, `:789-791`, `:1430-1431`, `:1546` and `:1904`, and update the BR-MODEL-3 quote
   at `:792` to v1.5's wording. The timing rule stands on its own without the example.
2. **F-02 (Medium)** — re-anchor the five `FSPEC:{line}` citations (`:601`, `:792`, `:942`, `:1096`,
   `:1753`), preferably to section anchors so the next upstream insertion does not rot them.
3. **F-03 (Low)** — name `queryFn` as run iv's injection point in §7.4's row-4 bullet.

F-02 is worth a line in harvest as a `Process` signal: an erratum round that edits an upstream
document should re-anchor the downstream `file:line` citations it invalidates, in the same pass that
already re-reads HEAD under DEC-ERR-01.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 1}

APPROVAL-HASH: sha256:2ac2592d7f0085a64caf2e4d6080743fccaba7f9aa9e928ddbbbce5010a7965d
REVIEWED-COMMIT: 68810c411c52da9e19943cabfc73306e37e26162
