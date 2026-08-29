# Cross-Review: product-manager — TSPEC (delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-decision-ledger/TSPEC-pdlc-decision-ledger.md (v0.6)
**Date:** 2026-08-28
**Iteration:** 7 (erratum delta confirmation)
**Upstream at dispatch:** REQ v1.9 `sha256:ce6b133f…3c7b7c`, FSPEC v1.3 `sha256:2bd5c3ef…5aed39` — both verified equal to HEAD's bytes.

## Scope of this round

Delta confirmation only. I re-read the TSPEC at HEAD, diffed it against the bytes I reviewed at v6
(`b2f176c88..HEAD`, +90/−19 across §0 changelog, §3.6, §4.1, §6.1 F-13, §7.3, §7.6 AT-14, §9.2, §9.4,
D-10), and confirmed each routed item against REQ/FSPEC rather than against the author's summary of them.

## Routed-item disposition

| Item | Routed by | Landed | Evidence |
|---|---|---|---|
| §3.6 retired-default clause tensed to `8000` | PM F-01 (v6) | **Yes** | "at the `8000` default then current, `maxBytes` **bound** first in every case… That conclusion is retired with the default it was computed against" — the false present-tense "binds first in every case" is gone and its retirement at `12500` is stated |
| §7.3 `M-6b`-slice shipped-default assertion | TE F-01 (High) | **Yes** | New conjuncts (4)–(6): `omitted[]` empty + 63 ids set-equal; total pinned at transcribed **12,059**; margin as arithmetic `12,059 ≤ 12,500`. §3.6 and D-10 now both say which pin carries which claim (~4,995 whole-fixture vs 441 live) |
| §7.3 whole-fixture drop-loop rationale | TE F-02 | **Yes** | Staged "`maxEntries` 70 binds first, forcing 71 omissions" replaced by the or-conditioned single loop — both bounds exceeded at 141 records from the outset, byte bound setting the terminal survivor count. Consistent with the paragraph below it (41 + ~24 survivors < 70) |
| §9.4 A-1 veto windows closed | TE F-03 | **Yes** | "still operator-vetoable" dropped; windows now transcribed correctly — REQ A-1 *before FSPEC authoring* (REQ:388), FSPEC A-1 *before TSPEC authoring* (FSPEC:560); revision re-routed to the erratum channel |
| §9.2 ERR-2 pre-resolution argument past-tensed | TE F-04 | **Yes** | "this may equally be resolved by leaving C-5 alone" → "That alternative is no longer available on its own terms… REQ v1.8 took the raise instead", with the A-1 appeal corrected to the windowed wording |
| E-7/AT-14 `maxBytes` `0` re-grounding | absorbed, self-declared | **Yes, faithful** | §4.1, §6.1 F-13 and §7.6 AT-14 now read `0` on **either** threshold; matches FSPEC v1.3 E-7 (FSPEC:331) and AT-14's "all three cases" (FSPEC:473–480) verbatim in substance |

No approved decision was re-litigated; no section outside the declared list moved; upstream pins (REQ v1.9 / FSPEC v1.3) are accurate.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Section anchor | Finding |
|----|----------|-----------|----------|---------|---------|
| F-01 | Medium | delta | local | §3.6 "Rationale, and the measurement that governs it" | The newly added retired-default arithmetic reads false against the table directly beneath it. "8,000 less ≤1,200 of framing left under 6,800 bytes for lines, **below the project-level set alone**" holds only under the *retired long line format* (project-level alone 9,371), not under the shipped form the next table bolds (**6,305**) — at 6,305 the project-level set fits inside 6,800, so `maxBytes` would not have bound on that case. The sentence tenses only the default ("at the `8000` default then current") and leaves the equally retired line format unnamed, so a reader checking the claim against the adjacent table finds a contradiction. Name both retired inputs, e.g. "at the `8000` default and the long `§ {heading}` form then current… below the project-level set alone (9,371)". Traces to REQ C-5 / DEC-DECLEDGER-03's measurement history. |
| F-02 | Medium | delta | local | §7.3 "The `M-6b`-slice assertion", conjunct (5) | Conjunct (5) asserts the block "**is** the transcribed literal **12,059** bytes", but 12,059 is derived as 10,859 + the *full* 1,200-byte framing **ceiling** (§0:46, §3.6:531). §4.3 is explicit that "**1,200 is a budget the rule text must be drafted to fit, not a measurement of drafted text** (the constants do not exist yet)" and pins framing at **≤ 1,200**, not at 1,200. So an equality assertion on 12,059 passes only if the constants happen to render to exactly the ceiling; drafted under budget — the expected case — the assertion reds on day one and the implementer must either pad the rule text or silently reinterpret the pin. Conjunct (6)'s inequality is unaffected and correctly conservative. State (5) against the measured block size at fixture re-capture (transcribing whatever framing actually renders), or as `≤ 12,059` with the exact index half (10,859) pinned separately. Traces to REQ-DECLEDGER-07 via D-9/D-10. |

FINDING: Medium | delta | local | §3.6 "Rationale, and the measurement that governs it" — the retired-default arithmetic sentence | "8,000 less ≤1,200 of framing left under 6,800 bytes for lines, below the project-level set alone" is true only under the retired long line format (9,371), false against the shipped form the adjacent table bolds (6,305 < 6,800). The clause tenses the default but not the equally retired line format; name both retired inputs.
FINDING: Medium | delta | local | §7.3 "The `M-6b`-slice assertion", conjunct (5) | The exact pin "is the transcribed literal 12,059 bytes" is computed as 10,859 + the full 1,200 framing *ceiling*, but §4.3 pins framing at ≤1,200 and calls 1,200 "a budget… not a measurement of drafted text (the constants do not exist yet)", so the equality can only pass by coincidence. Pin the measured block size at re-capture, or state (5) as `≤ 12,059` with 10,859 pinned separately.

## Questions

| ID | Question |
|----|---------|
| Q-01 | §7.3 now names four transcribed literals re-measured "together" at the same re-capture moment. Once F-02 is settled, is the framing size a fifth literal that must move with them — i.e. does a rule-text edit inside the ≤1,200 budget re-open the 12,059 pin, and is that the intended trigger? |

## Positive Observations

- All five routed items landed, and each landed as a *correction of the claim* rather than as hedging prose — §7.3's drop-loop rewrite in particular replaces a wrong mechanism story ("binds first, forcing 71 omissions") with the actual or-conditioned loop, and stays consistent with the survivor-count paragraph below it.
- The `M-6b`-slice assertion is exactly the gap TE F-01 named: it separates the ~4,995-byte whole-fixture headroom from the 441 bytes the live inertness claim actually rests on, and D-10 now records *why* it is a second assertion rather than a restatement. This is the difference between a claim that expires silently and one that reddens.
- §9.4's rewrite is the right product call: closing the veto windows and re-routing revisions to the erratum channel removes a standing invitation the pipeline could no longer honour, and it transcribes REQ A-1 and FSPEC A-1's differing windows accurately instead of collapsing them.
- The E-7 widening was absorbed and *declared* in the changelog rather than smuggled in — and it is faithful to FSPEC v1.3 in all three places it touches.

## Recommendation

**Approved with minor changes**

Both findings are Medium and neither is a High, so this confirmation does not halt the phase. Both are new (delta) and sit inside sections this round edited: F-01 is a wrong sub-claim introduced by the fix for my own v6 F-01, and F-02 is an unsatisfiable-as-written pin introduced by the fix for TE F-01. Neither changes a threshold, an acceptance criterion, or a requirement's meaning — both are internal accuracy defects that should be corrected before implementation reads §7.3 literally.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 0}
