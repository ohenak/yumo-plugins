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

## Positive Observations

## Recommendation

## Verdict
