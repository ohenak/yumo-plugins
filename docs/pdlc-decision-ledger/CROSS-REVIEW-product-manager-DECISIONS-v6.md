# Cross-Review: product-manager — DECISIONS

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-decision-ledger/DECISIONS-pdlc-decision-ledger.md` (v1.5)
**Date:** 2026-08-30
**Iteration:** 6
**Scope:** Local

## Round shape

Frozen delta round. Base for the diff is my v5 `REVIEWED-COMMIT: 6b328e16a`; the document has moved
since, over four commits (`29cd33a64`, `63f205e89`, `106531d42`, `420edb564`), **+50 / −12 lines**.
The edit touches exactly four places, and the v1.5 changelog's *"no other section moves"* claim is
true against `git diff`:

1. the `Version:` field (1.4 → 1.5) and the new v1.5 changelog entry;
2. DEC-DECLEDGER-16's narrative in `## Context`;
3. DEC-DECLEDGER-16's `## Decision` row;
4. the `PROPERTIES` row in `## Consequences` and DEC-DECLEDGER-16's re-evaluation trigger.

Substantively the round restates DEC-DECLEDGER-16's provenance rule from a **positional** form
(*"only on the larger side of an inequality"*) to a **directional** one (a ceiling may enter a claim
only where substituting the true, smaller drafted value preserves the claim), and adds an explicit
scope predicate: assertions and pinned expected values, plus prose stating a figure as a standing
fact; prose recounting a retired figure or a labelled worst-case upper bound is out of scope.

Upstream at HEAD: REQ `sha256:ce6b133f…3c7b7c` and FSPEC `sha256:2bd5c3ef…5aed39` are **unmoved**
from my v5 anchors. TSPEC has moved again — v5 reviewed it at `sha256:b1b603a8…18d31a0`, HEAD is
`sha256:fc57bc56…4c27504`, and its header now reads **v1.2** (`TSPEC-pdlc-decision-ledger.md:18`).
Because the delta's central factual claim is *about* TSPEC HEAD, I re-verified it there rather than
relying on the v5 re-verification.

I scanned only the changed sections for new issues. No decision is re-litigated below and I open no
new decision; the one item that would be a decision is recorded as `DEFERRED:`.

## Re-verification of the delta's factual claims (TSPEC v1.2 / PROPERTIES at HEAD)

The narrative's new conformance paragraph makes four checkable claims about the repository. All four
hold at HEAD:

| Claim (`DECISIONS:338-344`) | Verdict at HEAD |
|---|---|
| TSPEC "pins the subtraction form (`10,859 ≤ maxBytes − 1200`, §7.3's conjunct pair and §3.6)" | **Holds.** `TSPEC:1351` (§7.3 conjunct (6): *"`10,859 ≤ maxBytes − 1200` — at C-5's resolved default, `10,859 ≤ 11,300`, whose difference is …"*) and `TSPEC:731` (§3.6, same arithmetic, same 441) |
| TSPEC "asserts no addition form anywhere" | **Holds.** The literal `10,859 + 1,200` occurs exactly twice in TSPEC, at `:253` and `:745`, both prose; no conjunct, expected value or pinned literal carries an addition form |
| `10,859 + 1,200 = 12,059` survives "only as prose recounting `M-6b`'s worst standing case (§3.6, and the revision history's recital)" | **Holds, and the section attribution is exact.** `TSPEC:745` sits under `### 3.6 Omission order under a bound` (heading at `:646`); `TSPEC:253` sits above the first heading, i.e. in the revision history, and reads as a recital of the v0.5 erratum's re-measurement |
| "§7.3 stat[es] in terms that the block total is deliberately *not* an equality and pin[s] the two halves of `12,059 ≤ 12,500` separately where each is measurable" | **Holds.** `TSPEC:1344-1353` states it in those words; `TSPEC:732-734` says the same at §3.6 altitude |

The new `## Consequences` PROPERTIES row is likewise consistent with the downstream document as
written: `PROPERTIES:578-582` already carries the "block total is deliberately not asserted as an
equality" rationale and the two-halves pinning, and `PROPERTIES:1012` carries `12,059` only inside a
risk-table narrative — the labelled-worst-case shape the new scope clause explicitly admits. The row
therefore describes PROPERTIES at HEAD rather than requiring a change to it.

The re-evaluation trigger's new sentence — that re-classing the ceiling is "not licence to restore
`12,059`", because 1,200 is the ceiling and not the measured framing size — is the answer my v4 Q-01
asked for, and it lands the point that v4 could only infer from *"re-classes to a measurement with a
fixture source"*. That question is closed.

## Prior findings

| Prior ID (v5) | Status |
|---|---|
| F-01 (Medium) — `## Context` and the D-10/-12 trigger pin TSPEC-derived claims "at HEAD (TSPEC **v0.7**)" | **Not addressed; carried forward as F-02 below, now one version further stale.** `DECISIONS:98` and `:398` still read `TSPEC v0.7`; TSPEC HEAD is **v1.2** (`TSPEC-pdlc-decision-ledger.md:18`). I re-verified the substantive discharge list at v1.2 and it still holds — `TSPEC:252` (`12500 − 1200 = 11,300`, ~4,995 headroom), `:691-692` (the same at §3.6), `:727` and `:731-732` (`M-6b`'s 441), `TSPEC:1820` (**ERR-2 (RESOLVED upstream — REQ v1.8)**), and every surviving `8000` tensed as retired (`:658-659`, `:689`, `:745`, `:1821-1824`). So the label is stale, the claim is not |
| F-02 (Medium) — DEC-16's "byte literal" prohibition was broader than `POSTMORTEM-D`'s carve-out; scope it to asserted/pinned figures | **Resolved.** The new scope predicate at `DECISIONS:325-327` binds "assertions and pinned expected values, plus prose that states a figure as a standing fact" and puts "prose that recounts a retired figure, or that names a worst case as an explicitly labelled upper bound" outside it. That is the carve-out the finding asked for, and it is the one TSPEC actually relies on at `:253` and `:745` |
| Q-01 (v4) — re-classing the ceiling must not re-admit `12,059` | **Closed** by the re-evaluation trigger's new sentence (`DECISIONS:400`) |
| Q-02 — D-13's "~154-byte mean" vs §3.6's 153 | Still open, still rounding-only, still non-blocking; the round did not touch it and I do not press it in a frozen round |

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Section anchor | Finding | Requirement ref |
|----|----------|-----------|----------|----------------|---------|-----------------|
| F-01 | Medium | delta | local | `## Context` DEC-16 narrative (`:323-327`, `:335-337`) and `## Decision` DEC-16 row (`:372`) | The restatement drops the word **asserted** from the equality prohibition — v1.4 read *"never as a term in an **asserted** equality"*, v1.5 reads *"A ceiling may therefore never be a term in an equality"* (`:324`) and the row now reads *"never as a term in an equality"* (`:372`) — while the new scope clause simultaneously **widens** binding prose to "prose that states a figure as a standing fact" (`:325-326`). Applied to one real site, the two clauses disagree: `12500 − 1200 = 11,300` is an equality with the ceiling as a term, and it appears in TSPEC prose as a standing fact (`TSPEC:252`, `:691`, `:731`), so the scope clause pulls it in and the equality ban refutes it — yet the same paragraph declares it *"likewise sound as an upper allowance and cannot go green falsely"* (`DECISIONS:336-337`). That is the one site the round's own success criterion — *"every site has one answer"* (`:328-329`) — is not met on. The substance is not in doubt (the figure is a definitional restatement of the allowance and is only ever *used* as an upper bound, where substitution preserves the claim); the fix is a wording restoration, e.g. "never as a term in an **asserted** equality, nor in prose stating an implementation's size as a standing fact", or an explicit line saying a ceiling-derived **allowance** may be stated as an identity because it is only ever used as an upper bound | REQ-DECLEDGER-07; REQ C-5 |
| F-02 | Medium | inherited | nonlocal | `## Context` (`:98`) and the D-10/-12 re-evaluation trigger (`:398`) | Carried unresolved from v5 F-01 and now one version further stale: the document still pins its TSPEC-derived discharge list "at HEAD (TSPEC **v0.7** …)" while TSPEC HEAD is **v1.2** (`TSPEC-pdlc-decision-ledger.md:18`). Every substantive claim in that list re-verifies at v1.2 (see Prior findings), so this is a provenance label, not a false derivation — but `:398` is precisely the row a future reader consults to decide whether a one-pass re-measurement is owed, and a self-dating "at HEAD" phrase two versions behind is the wrong thing for that row to say. Re-stamp both literals to v1.2 in the next non-frozen touch | REQ-DECLEDGER-07; REQ C-5 |

Both findings are Medium, so neither gates. Under the frozen-round bar the only admissible blocking
findings are a defect this revision introduced or a load-bearing claim falsified by the repository at
HEAD. F-01 is delta-introduced but is a wording defect in a rule whose operative test (substitution)
is stated correctly and whose worked verdicts on every TSPEC site are correct; nothing in the
document is falsified by the repository, and no decision changes either way. F-02 is inherited and
non-gating by construction.

## Questions

| ID | Question |
|----|---------|
| Q-01 | The new PROPERTIES `## Consequences` row (`:387`) now describes PROPERTIES **as it already reads at HEAD** (`PROPERTIES:578-582`, `:1012`) rather than requiring a change to it. That is the right outcome, but it means the row currently generates no downstream work — is that intentional (a recorded conformance) or does te-author still owe a property that mechanises the rule? Non-blocking, and explicitly **not** a request to open a decision in a frozen round. |
| Q-02 | Carried from v2/v3/v4/v5, still open and still non-blocking: D-13's *"~154-byte mean line"* (`6,305 / 41 = 153.8`) against §3.6's project-level mean of **153**. Rounding only; no conclusion turns on it. |

## Positive Observations

- **The round did exactly one thing and said so truthfully.** The v1.5 changelog enumerates three
  carrying sites plus the trigger and claims "no other section moves"; `git diff` over
  `6b328e16a..HEAD` shows precisely the version field, the changelog, `:316-341`, `:372`, `:387` and
  `:397`. In a frozen round that verifiability is worth as much as the content.
- **The directional restatement is a genuinely better product rule, not a reword.** The old
  positional form admitted `10,859 ≤ 12,500 − 1200` and rejected the algebraically identical
  `10,859 + 1,200 ≤ 12,500`; the new form's substitution test explains *why* both are safe
  (`:333-336`), which is what makes it promotable to `DOMAIN-CONSTRAINTS.md` without binding future
  features to reject sound arithmetic. The trigger's closing sentence naming the directional form as
  the one that promotes (`:400`) closes the loop on that.
- **The conformance paragraph was written against the repository, not from memory.** Every one of its
  four claims about TSPEC re-verified at v1.2 — including the section attribution of the two
  surviving `10,859 + 1,200 = 12,059` sites, which is exact.
- **The re-evaluation trigger now forecloses the failure mode it used to invite.** "Any block total
  must be re-derived from the new measurement and re-transcribed, never un-retired as written"
  (`:400`) is the sentence that stops round 6/7's defect class from walking back in through the
  re-measurement door.

## Recommendation

**Approved with minor changes**

No High finding is open. The revision resolved v5's F-02 (the over-broad prohibition), closed v4's
Q-01, broke nothing, and its factual claims about TSPEC HEAD re-verify at v1.2. Two Mediums stand:
one delta-introduced wording contradiction on the `11,300` site (F-01) and one carried stale version
label (F-02). Both should land in the next non-frozen touch; neither gates the phase.

DEFERRED: restore "asserted" (or add an allowance-identity carve-out) to DEC-DECLEDGER-16's equality
prohibition so `12500 − 1200 = 11,300` has one answer under the scope clause.
DEFERRED: re-stamp the two "TSPEC v0.7" literals at `:98` and `:398` to TSPEC v1.2.
DEFERRED: reconcile D-13's "~154-byte mean" with §3.6's 153 at consolidation.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 0}
