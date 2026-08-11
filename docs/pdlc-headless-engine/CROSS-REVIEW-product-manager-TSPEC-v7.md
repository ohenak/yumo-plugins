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

## Questions

## Positive Observations

## Recommendation

## Verdict
