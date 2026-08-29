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

| ID | Question |
|----|---------|
| Q-01 | On F-01: the REQ's v1.8 erratum note (`REQ:26`) says "FSPEC §3.3's recital cascades; nothing moves." I cannot reproduce that scoping — §3.3 carries no bound literal (grep for `8000`/`maxBytes` puts the recitals at `:111` and `:545`, and §3.3 holds neither). Was §3.3 a mis-citation for §3.1, and was §7 Assumptions simply missed? If the erratum author walked only §3.3, that explains why both live sites survived, and the same walk should be re-run against the anchor list rather than from memory. |
| Q-02 | On F-03: is `maxBytes` `0` intended to be reachable at all, or is non-negativity on `maxBytes` only a symmetry with `maxEntries` that nobody means to exercise? Either answer is fine and cheap to state; what I cannot do today is write the bounds property over "any resolved bounds" without knowing which. |
| Q-03 | On F-01's downstream: TSPEC ERR-2 already derived `12,500` independently and the REQ then adopted it, but TSPEC `:496`/`:760`/`:942` still carry `8000`. Is the TSPEC's own correction already queued in its erratum channel, or does fixing the FSPEC leave those three sites to be caught separately? I raise it only so it is not assumed handled by this round — it is outside this document. |

## Positive Observations

- **The cascade was contained where it counts.** Baseline v1.2 added measurement rows without moving `Verified at` or re-deriving `M-1d`/`M-2e`. That discipline — additive bump, frozen commit — is why every corpus fixture and all of AT-01's arithmetic survives untouched, and why this confirmation is four small edits rather than a re-review. `M-7d` saying out loud that substance bytes are "a floor, not a rendering" and leaving framing to the consuming TSPEC is the same good boundary-keeping.
- **The REQ erratum improved testability in exactly the way I would have asked for.** Retyping to non-negative because "*positive* rejected `0`, which FSPEC E-7 requires as a valid admits-nothing `maxEntries`" is upstream being corrected *by* a downstream edge case — E-7 was right and the type was wrong. That is the cascade working in the healthy direction.
- **R-5 got better, not just shorter.** Replacing "the bound is an unmeasured analogy" with "the bounds are measured but at one commit, and the corpus grows" swaps an unfalsifiable worry for a monitorable one with named evidence (`M-6d`/`M-7d`) — a re-evaluation trigger something could actually observe.
- **`12500` is derived and shown, not asserted.** C-5 carries the whole chain — 9,296 over 63 records, clears by 3,204, 50 bytes per record of framing allowance. A reviewer can re-check the arithmetic without leaving the row, which is what let me confirm the number rather than take it.

## Recommendation

**Needs revision**

Two open High findings, both `delta` — the FSPEC's own bytes did not change, but the REQ moved out from under two of its sentences. F-01 leaves the definition site of the shipped defaults naming the one value the REQ documents as day-one-lossy, under a `(REQ C-5)` attribution that no longer holds, and TSPEC `:942` has already turned that number into an assertion that would go green on the wrong build. F-02 leaves §7 asserting a retired risk under the words "carried unchanged", in front of an operator whose veto is invited before TSPEC authoring.

Neither is expensive: one literal at `:111`, one restated assumption at `:545`. F-03 (one clause extending E-7 to both bounds) and F-04 (three version labels plus one Baseline anchor) are non-gating and can ride the same edit. Nothing in my v2 approval of the FSPEC's structure, flows, edges or test design is disturbed — the document is right about everything it decides for itself, and wrong only where it quotes.

I want to be explicit that this is not a re-opening of settled ground: after these four edits I expect to confirm without further findings.

## Delta-Confirmation Findings

All four are **delta**: the FSPEC's own bytes are unchanged since my v2 approval, and each defect
exists only because the REQ erratum moved and its cascade was not carried into this document.
F-01/F-02 are **local** — they sit in the recitals the erratum's own subject matter (C-5, §7 A-1,
§6 R-5) propagates into. F-03/F-04 are **nonlocal** — the retyping and the Baseline bump reach
sections the erratum never recites.

| ID | Severity | Provenance | Locality | Description | Section anchor |
|----|----------|------------|----------|-------------|----------------|
| F-01 | High | delta | local | §3.1 `:111` recites `maxBytes` `8000` "(REQ C-5)"; C-5 now says `12500` and records `8000` as below the `M-7b` floor, dropping lines day one | §3.1 `:111` |
| F-02 | High | delta | local | §7 Assumptions `:545` recites the retired `learningsInjection` analogy as "carried from REQ §7 unchanged"; A-1 and R-5 both retired it | §7 Assumptions `:545` |
| F-03 | Medium | delta | nonlocal | Non-negative retyping makes `maxBytes: 0` a valid value with no stated outcome; E-7 covers `maxEntries` only | §5 E-7 `:317` |
| F-04 | Low | delta | nonlocal | Header/§1/§6 pin Baseline `v1.1`, REQ now pins `v1.2`; no fixture impact (`Verified at` unmoved) | §1 `:11`, `:43`; §6 `:331` |

FINDING: High | delta | local | §3.1 `:111` | The shipped-defaults recital states `maxBytes` `8000` and attributes it to REQ C-5, which now specifies `12500` and records `8000` as sitting below the `M-7b` standing floor and dropping lines on day one; TSPEC `:496`/`:760`/`:942` have already propagated `8000`, including an AT asserting it as "C-5's shipped defaults", so the stale literal is a live false-green oracle.

FINDING: High | delta | local | §7 Assumptions `:545` | §7 states "Carried from REQ §7 unchanged" and then recites A-1 as "`maxBytes` (8000) is a `learningsInjection` analogy and is not measured", but REQ A-1 `:378` now records both bounds re-derived and measured (`70` from `M-6b`/`M-6c`, `12500` from `M-7b`/`M-7c`) and R-5 `:327` retired the analogy in favour of the commit-growth risk; the content is stale and the "unchanged" provenance claim is false in front of an operator veto point.

FINDING: Medium | delta | nonlocal | §5 E-7 `:317` | REQ C-5 retyped both bounds to non-negative, so `maxBytes: 0` is now a valid operator value rather than a wrong-typed one falling back, but E-7 names only `maxEntries` `0` and no section states the `maxBytes` `0` outcome; it is derivable via E-8 then E-6 but unstated, leaving O-8's bounds property unwritable on the `maxBytes` axis.

FINDING: Low | delta | nonlocal | §1 `:11`, `:43`; §6 `:331` | FSPEC pins Baseline `v1.1` while REQ v1.8 depends on `v1.2`; no test is affected because v1.2 left `Verified at` (`8c673a09f`), `M-1d` and `M-2e` byte-identical, but the Baseline `Cited by` row (`baseline:6`) still omits §7 Assumptions, which is why the v1.2 bump failed to route to the site that went stale in F-02.

## Verdict

VERDICT: Needs revision
{"high": 2, "medium": 1, "low": 1}
