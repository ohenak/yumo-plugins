# POSTMORTEM — Phase D (erratum protocol) — pdlc-advisory-wave-gate

| Field | Value |
|---|---|
| Upstream | `REQ → FSPEC → **TSPEC** → DECISIONS` |
| Downstream | `PLAN`, `PROPERTIES`, `IMPL` |
| Cross-Reviews | `CROSS-REVIEW-product-manager-TSPEC-v3.md`, `CROSS-REVIEW-test-engineer-TSPEC-v3.md` (delta confirmation, erratum round v1.11 → v1.12) |
| LEARNINGS | `docs/pdlc-advisory-wave-gate/LEARNINGS-pdlc-advisory-wave-gate.md` |

**Date:** 2026-08-20
**Halt class:** `ERRATUM-PROTOCOL`
**Halt text:** Phase D halted — the delta confirmation of the TSPEC erratum round did not pass;
non-approving lenses: `[pm-review, te-review]`.
**Document at halt:** `TSPEC-pdlc-advisory-wave-gate.md` v1.12 (`0f2a9710`, content `sha256:4de9cd6b…`)

RESOLVED: no

---

## 1. Phase

**Phase D (design), erratum channel, on the TSPEC.** This was not a review round and not a
re-authoring: it was the delta confirmation of a targeted erratum round that took
`TSPEC-pdlc-advisory-wave-gate.md` from v1.11 (`efeb798e`) to v1.12 (`0f2a9710`, nine commits). The
round was opened with a routed list of seven mechanical items — the retired
`pdlc/workflows/dist/orchestrate-dev.bundle.js` runtime premise in §1.2 and §3.4, §1.1's O-8
`commitPaths` shape, §1.2's `.claude/workflows/` sync premise, §2.5's stray `git add -A --`, two
falsified red-reason caveats in §5.1, and an eighth item reporting DEC-A6-03's snapshot-ref
halt-message obligation as still unlanded upstream.

**What the round did with that list.** It re-grounded on upstream at HEAD before touching the items
(DEC-ERR-03) and found the eighth item **inverted**: the obligation had landed in REQ v1.16 (AC-6.3's
second conjunct) and FSPEC v1.7 (BR-14, §3 Step 10, E-34, AT-06-4 conjunct (3) and its companion
AT-06-4b). Rather than re-route a settled question — DEC-ERR-01's anti-pattern — the round absorbed
it: §2.5 and §4.5 stopped describing the overwrite warning as an operator-runbook remedy this feature
does not carry, and named a mechanism instead (a fifth halt field, `snapshotRef`, non-`null` exactly
when a capture succeeded, from which the halt report renders the ref name and the co-located
overwrite sentence; `null` renders neither).

**What halted it.** Both lenses confirmed all seven mechanical items landed, verified against the
shipped tree rather than against the item list, and confirmed the absorption was the right call. Both
then refused the round for the same reason: the absorption landed in the document's **design** half
(§2.5, §4.5) and never reached its **oracle** half (§5). `git diff efeb798e..HEAD` shows no edit
below §5.1's status caveat except the two re-measured red-reason sentences. §5.6's AT-06-4 row still
reads "carries the root-cause class" — conjunct (2) alone — and FSPEC v1.7's AT-06-4b has no row at
all.

The halt is therefore not a disagreement about the design. It is an **incomplete traversal**: a
routed obligation whose mechanism half landed and whose proof half did not, in a document whose §5.6
is the table PLAN mints red-test tasks from.

## 2. Iterations

## 3. Reviewers

## 4. Pattern of Disagreement

## 5. Best-Guess Root Cause

## 6. Recommendation

## Appendix A — prior Phase D halt (review-cap, resolved)

---

**Provenance**

- Engine version: 0.2.0
- Plugin version: 0.23.0
- Plugin compat: ^0.23.0
- Channel: engine
- Mode: latest (pin: n/a)
- Load root: /Users/kaneho/.local/share/mise/installs/node/20.20.1/lib/node_modules/@kaneho/pdlc-engine/vendor/workflows
