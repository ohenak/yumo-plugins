# Cross-Review: test-engineer — TSPEC (erratum delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/TSPEC-pdlc-engine-distribution.md` (v0.12)
**Date:** 2026-08-14
**Iteration:** 12
**Scope:** Erratum delta confirmation only — the round-10 Phase-F items (PM, SE), plus the
DEC-ERR-03 upstream-fidelity re-check of REQ v0.11 / FSPEC v0.2 at HEAD. Rounds 1–9 are not
re-litigated.

## Delta verified

| # | Raised item | Landed? | Evidence |
|---|---|---|---|
| 1 | §5.4's second copy of the 23/24 count needs to be derived, not authored | **Yes** | `:387-393` — the size is now the sum of the `PK-*` rows above it (4 + 15 + 3 + 1 + 0/1), with 23/24 shown as that sum's *value*, not as an independent total |
| 2 | §5.4 carries no reciprocal co-change obligation against FSPEC §5.2 | **Yes** | `:395-402` — any `PK-*` row added, removed or re-classed updates FSPEC §5.2's per-class counts in the same change; per-class counts named as the change-control point (a cross-class move leaves the total invariant); PF-4's both-directions equality named as what turns a missed co-change red |

The derivation is arithmetically faithful to the `PK-*` table and to FSPEC §5.2's own
per-class counts: PK-1/PK-2/PK-4/PK-4b = manifest 1 + package README 1 + CLI entry 2 = 4;
PK-5…PK-19 = engine modules 15; PK-20…PK-22 = workflow modules 3; PK-23 = install script 1;
PK-3 = licence 0 before N-2, 1 after. 4 + 15 + 3 + 1 + 0/1 = 23/24. Both sides agree.

## Upstream fidelity (DEC-ERR-03)

REQ moved **v0.10 → v0.11** since the v11 approval. The whole of that move is (a) AC-1.3
re-worded to the classes-and-per-class-counts / member-names ownership split and (b) a prose
citation fix, `FSPEC F-3 step 5` → `F-4 step 2`, in the v0.10 changelog row (`01c27ee4`).

- The AC-1.3 split is **absorbed ahead of the raised items** in the v0.12 changelog row and is
  what the §5.4 edit is built on — DEC-ERR-01's ordering is satisfied, and the lineage header's
  REQ cell now reads v0.11.
- The `F-3 step 5` correction has **no TSPEC surface**: neither string appears in the TSPEC or
  in the sibling DECISIONS (grepped). Nothing to propagate.
- FSPEC is unchanged at v0.2; its §5.2 still declares the member *count* per class and in total
  and still routes member *names* to TSPEC §5.4's `PK-*` table, so the TSPEC remains a faithful
  compression of both upstreams.
- No previously approved oracle is weakened: PF-4 (`:1247`) still reads §5.4's literal `PK-*`
  set against a real `npm pack`, AT-3.8a still asserts the count against the transcribed list
  rather than the tarball's own length, and AT-3.8b's workflow-module sub-assertion is untouched.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-49 | Medium | Local | The edit shifted the arithmetic it drift-proofs out from under the line window that points at it. FSPEC §5.2 cites `TSPEC:386-389` as carrying "the same arithmetic"; after this edit `:386-389` ends at "four manifest-adjacent and `bin/` members" and the 23/24 conclusion now sits at `:392-393`. §5.4 `:399` then **reproduces that same stale window** when naming FSPEC's reciprocal obligation. Neither oracle depends on it (PF-4 reads the table, not the window), so this is navigational, not falsifying — but a round whose whole purpose was to stop two copies drifting should not leave a third pointer already drifted. Cite the anchor by name (`§5.4`'s `PK-*` table / the derived-size paragraph) rather than by line window, as REQ v0.9 already did when it replaced O-5's line window with the `REMEDY` symbol | §5.4 `:399`; FSPEC §5.2 `:512` |
| F-50 | Low | Local | The derivation groups into **five** terms (4 / 15 / 3 / 1 / 0-1) while FSPEC §5.2 owns **seven** per-class counts (manifest 1, README 1, CLI entry 2, modules 15, workflow 3, install 1, licence 0/1). The same paragraph names per-class counts as the change-control point, so the two sides are one bucket short of being comparable term-by-term: a member re-classed between manifest, package README and CLI entry moves an FSPEC count while leaving the TSPEC's "four manifest-adjacent and `bin/`" bucket invariant. The prose obligation covers this case ("re-classes … updates FSPEC §5.2's per-class counts"), so it is a legibility gap, not a hole. Writing the sum as 1 + 1 + 2 + 15 + 3 + 1 + 0/1 makes the mirror mechanical to check | §5.4 `:388-393` |

## Questions

| ID | Question |
|----|---------|
| Q-27 | Is any test expected to assert the FSPEC↔TSPEC co-change obligation itself (e.g. a doc-oracle over the two counts), or is it, as I read it, an authoring rule whose only mechanical consequence is PF-4 going red on the packed side? The answer decides whether F-49's stale window is purely editorial or is a future oracle's input. |

## Positive Observations

- Deriving the size from the `PK-*` rows rather than restating a total is the right shape: the
  number now has exactly one authoring site per side, and the TSPEC's side is the table an
  implementer already has to edit. There is no longer a copy that can be edited alone.
- The obligation is stated with the correct change-control point. Naming *per-class* counts —
  and explicitly noting that a cross-class move leaves the total invariant — is the non-obvious
  half, and it matches FSPEC §5.2's own reasoning about the merge/split swap.
- The paragraph names **what turns a missed co-change red** (PF-4's both-directions equality)
  instead of leaving the obligation as unenforced prose. That is the distinction between a
  convention and a testable rule, and it is on the right side of it.
- Upstream re-grounding was done before the raised items, the absorbed REQ decision is recorded
  in the changelog, and the raised items are then framed as consequences of it — DEC-ERR-01's
  ordering followed as written, not asserted after the fact.

## Recommendation

**Approved with minor changes**

Both raised items land, and the delta is sound at HEAD against REQ v0.11 and FSPEC v0.2. Nothing
previously approved is broken: no oracle is weakened, no round 1–9 decision is re-opened, and no
scope is added. The two findings are a stale line-window citation (F-49, Medium) and a
bucketing mismatch that costs legibility but not coverage (F-50, Low); neither gates.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}

APPROVAL-HASH: sha256:5bef8afa3b9d6af5a72d58dfbc41b028a65e72c4c6ffb5972288690d111e75ad
APPROVAL-HASH-NORMALIZED: sha256:e4e99b5bc9b36a8fc4c8cc8065f0884a1d293d393281a40ba1f4cdbc3eb35cbb
REVIEWED-COMMIT: a9f1584b25dcc111f9e6e3dcdfb9fdf95521fecd
