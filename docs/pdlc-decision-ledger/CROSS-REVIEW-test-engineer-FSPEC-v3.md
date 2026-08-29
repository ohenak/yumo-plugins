# Cross-Review: test-engineer — FSPEC (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/FSPEC-pdlc-decision-ledger.md` (bytes unchanged since v2 approval)
**Upstream under re-measurement:** `docs/pdlc-decision-ledger/REQ-pdlc-decision-ledger.md` v1.8 (sha256:3eb52deb…)
**Previous round:** `CROSS-REVIEW-test-engineer-FSPEC-v2.md` (0 High, 4 Medium, 1 Low — Approved with minor changes)
**Date:** 2026-08-28
**Iteration:** 3

## Scope of this round

Upstream-cascade confirmation, not a re-review. My v2 approval was taken against REQ
**v1.7** (`UPSTREAM-STATE: REQ sha256:c18b7e88…`, `REVIEWED-COMMIT: a8175794`). That version of
the REQ no longer exists. Three erratum commits landed on top of it — `4e197abe5`
(§4 C-5), `0756cefed` (§6 R-5, §7 A-1), `273d0ce00` (v1.8 header, Baseline pin) — and the
Baseline it rests on moved `1.1` → `1.2` in `efbf3dad9`.

I re-read the REQ text the FSPEC leans on at its current version and asked one question: is the
FSPEC still a faithful compression of it? I did **not** re-litigate settled sections, and I did not
re-open the five v2 findings — those remain open as filed, non-gating, and are untouched here.

What actually moved upstream, and what each change obliges of the FSPEC:

| Upstream change | REQ now says | FSPEC dependent |
|---|---|---|
| `maxBytes` default | **`12500`**, measured from Baseline `M-7c`; `8000` is recorded as *below* the `M-7b` floor and "drops lines on day one" (`REQ:173`) | §3.1 `:111` recites `8000` — **F-01** |
| `maxEntries` / `maxBytes` type | **non-negative** integer, `0` a valid admits-nothing value (`REQ:172`–`:173`) | §5 E-7 covers `maxEntries` `0` only — **F-03** |
| §6 R-5 | analogy claim retired; risk is now the commit-growth model (`M-6d`/`M-7d`) | §7 Assumptions still recites the analogy — **F-02** |
| §7 A-1 | both bounds re-derived and measured, `70` and `12500` | §7 Assumptions still recites "not measured" — **F-02** |
| Baseline pin | `v1.2` | FSPEC header pins `v1.1` — **F-04** |

**Two checks that came back clean, and they matter more than the findings.** First, Baseline v1.2
did **not** move `Verified at` (still `8c673a09f`); the v1.1→v1.2 diff adds only the `M-7*` byte-floor
rows. So every frozen-fixture pin in §6 (`:331`) still resolves to the same tree, and none of my v2
arithmetic re-derivation needs redoing. Second, `M-1d` and `M-2e` are byte-identical across the bump,
so AT-01's 45 and 48 still hold, and the corpus ATs are unaffected. The cascade damage is confined to
recited **constants and provenance claims**, not to any test's expected set.

## Findings

The FSPEC does **not** still hold. Two Highs, and neither is a pedantic version-label nit: both are
places where the FSPEC states a number or a claim, attributes it to the REQ, and the REQ now says the
opposite. Both are cheap to fix — two literals and one sentence — but they are load-bearing for test
authoring, which is why they gate rather than ride along.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| **F-01** | High | Local | **§3.1 ships the one `maxBytes` value the REQ now documents as harmful, and cites the REQ for it.** `:111` reads "Defaults are `enabled` `false`, `maxEntries` `70`, `maxBytes` `8000` (REQ C-5)." REQ C-5 (`:173`) now reads `12500`, and gives its reason in the same row: `8000` "sits *below* `M-7b` and drops lines on day one". So the FSPEC does not merely lag — it names a default the upstream explicitly rejected, under a `(REQ C-5)` attribution that no longer supports it. This is the definition site every downstream author reads for the shipped defaults. **The damage is already downstream and visible:** TSPEC carries `8000` in eight places, including the type declaration (`TSPEC:496` `// non-negative integer, default 8000`), the config fixture (`:760`), and — worst — an acceptance test that asserts "**C-5's shipped defaults** (`maxEntries: 70`, `maxBytes: 8000`)" (`:942`). That AT is a false-green generator: it pins the build to `8000`, so a build shipping the value REQ calls day-one-lossy passes, and the correct build fails. Note the TSPEC itself already spotted the measurement problem in its own erratum ERR-2 (`:1302`) and reached `12,500` (`:1319`) — the REQ was then fixed, and the FSPEC in between was skipped. Fix: `8000` → `12500` at `:111`. | §3.1 `:111`; REQ C-5 `:173` |
| **F-02** | High | Local | **§7 Assumptions restates a claim the REQ deleted, while asserting it was carried unchanged.** `:544`–`:546` reads "Carried from REQ §7 **unchanged** … **A-1** `maxEntries` (70) is measured against the Baseline (`M-6b`/`M-6c`), `maxBytes` (8000) is a `learningsInjection` analogy and is not measured". REQ's erratum retired exactly this: A-1 (`REQ:378`) now records both bounds as re-derived and cited by id — `70` from `M-6b`/`M-6c`, `12500` from `M-7b`/`M-7c` — and R-5 (`REQ:327`–`:331`) no longer mentions an analogy at all, having been re-aimed at the commit-growth model (`M-6d`/`M-7d`). Two defects in one sentence: the content is stale, and the provenance claim "carried unchanged" is now false, which is the more dangerous half — a reader auditing assumptions trusts that phrase and stops. This assumption is operator-vetoable *before TSPEC authoring*, so a stale copy invites a veto decision against a risk that no longer exists. Fix: restate A-1 in v1.8's terms and re-aim the R-5 recital at growth, or drop the recital and cite `REQ §7 A-1` by reference so it cannot skew again. | §7 Assumptions `:545`; REQ A-1 `:378`, R-5 `:327` |
| **F-03** | Medium | Local | **Retyping to non-negative admits `maxBytes: 0`, whose outcome no section states.** Under v1.7's *positive integer*, `0` was wrong-typed and fell back per §3.1's table. Under v1.8 (`REQ:173`, "Non-negative as above") `0` is a **valid operator value** for `maxBytes`, so it is no longer reachable through the wrong-typed row — it flows to step 5 as a real bound. FSPEC names only the `maxEntries` counterpart: E-7 (`:317`) is `maxEntries` `0`, and AT-14 exercises `maxEntries` `0`. For `maxBytes` `0` the outcome is *derivable* — every line exceeds it, E-8 omits each whole, E-6 follows — but derivable is not stated, and a PROPERTIES author writing the bounds property over "any resolved bounds" (O-8, `:517`) will hit `0` on the `maxBytes` axis immediately and have no oracle to check against. Note the REQ has the same gap, so the cheapest fix may be a one-clause extension of E-7 to both keys ("either bound resolving to `0`"), which also keeps O-8's universally-quantified property total. | §5 E-7 `:317`, E-8 `:316`; §7 O-8; REQ C-5 `:173` |
| **F-04** | Low | Local | **Header and §1/§6 pin Baseline `v1.1`; the REQ now depends on `v1.2`.** `:11`, `:43` and `:331` all name v1.1. No test is affected — I verified `Verified at` (`8c673a09f`), `M-1d` and `M-2e` are byte-identical across the bump — so this is a label, not a fixture drift, and I am filing it Low rather than inflating it. But it is the same version-skew mechanism my v2 F-03 flagged: the Baseline's `Cited by` propagation row (`baseline:6`) now lists FSPEC anchors, yet still omits **§7 Assumptions** — the exact site that went stale in F-02. Had that anchor been listed, the v1.2 bump would have routed to it. Fix `:11`/`:43`/`:331` to v1.2 and add §7 Assumptions to the Baseline row in the same edit. | §1 `:11`, `:43`; §6 `:331`; `baseline:6` |

## Questions

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
