# Cross-Review: software-engineer — FSPEC (upstream-cascade confirmation)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/FSPEC-pdlc-advisory-wave-gate.md
**Date:** 2026-08-20
**Iteration:** 4 (upstream-cascade confirmation; FSPEC bytes unchanged since the v3 approval)

## Scope of this round

Upstream-cascade confirmation, not a re-review. I approved this FSPEC at v3 (`APPROVAL-HASH:
sha256:91ef2557…`, `REVIEWED-COMMIT: 0361675e`) against `UPSTREAM-STATE: REQ
sha256:c62cfc35…` — REQ v1.15. REQ has since moved to sha256:f97f4f66… (v1.16), so the approval was
taken against an upstream version that no longer exists. FSPEC's own bytes are unchanged: `git log`
shows its last commit as `9f80247a`, before the REQ edit.

The single question answered here: **is FSPEC still a faithful compression of REQ as it now stands?**
Per DEC-ERR-03 I measured the document against the upstream text at HEAD, not against the routed item
list — anything FSPEC cites that REQ no longer says, or now says differently, is in scope whether or
not it was routed. Settled decisions from rounds v1–v3 are not reopened, and unchanged FSPEC sections
whose upstream text the delta did not touch were not re-read.

## Upstream delta examined

`git diff 0cef7148..30d8bf7b -- docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md` —
12 insertions, 2 deletions, in exactly two places:

| # | REQ site | Change |
|---|----------|--------|
| 1 | Version row + changelog | `1.15` → `1.16`; a v1.16 changelog paragraph describing the round as landing one item, DEC-A6-03's operator-facing halt-message obligation, routed since round 5 and previously unlanded |
| 2 | **AC-6.3** | Two sentences appended: where the halt report points the operator at a captured pre-A6 tree state, it also warns **in the same place** that re-running this feature overwrites that capture, so an operator intending to inspect it preserves it first (DEC-A6-03). The capture's name and storage form stay TSPEC's (O-1) |

No other AC, business rule, constraint, obligation, NFR or measured-fact id moved. I diffed the
whole file, not just the routed hunks: nothing FSPEC compresses outside AC-6.3 changed in this round.
The added text is stated as an operator-visible outcome and defers the ref name and storage form to
O-1, so it does not import TSPEC-altitude material into the REQ — the altitude is right.

## Does FSPEC still hold against REQ at HEAD?

**Not entirely.** One conjunct of the AC this FSPEC claims to cover is now unrepresented anywhere in
the document.

**What I traced.** FSPEC's §2 concordance maps `FSPEC-AWG-06` to `REQ-AWG-06 (AC-6.1…AC-6.4)`, so
FSPEC asserts total coverage of AC-6.3. Its compression of AC-6.3 lives in three places, all of which
I re-read at HEAD:

- **BR-14** (§4) — "the pipeline halts with the same reason it emits today … the halt report carries
  the diagnosis and its root-cause class, so the operator's turn starts with the diagnosis on the
  halt path, not only in a file they must find." Cites `(AC-5.2, AC-6.3)`.
- **AT-06-4** (§6.6) — *Then* the halt report "carries the diagnosis and its root-cause class."
  Cites `(BR-14, AC-6.3)`.
- **E-30** (§5.5) — keeps the halt report "carrying BR-14's diagnosis and root-cause class" when the
  escalation-log write fails.

All three transcribe AC-6.3's **first** sentence faithfully. None carries the second: the
preservation warning that must ride **in the same place** as the pointer to the captured pre-A6 tree
state. `grep -n "overwrit"` over the FSPEC returns nothing; the word does not appear in the document.

**Why the gap is real rather than vacuous.** AC-6.3's new obligation is conditional — it binds only
where the halt report points at a captured pre-A6 state. Two facts make that condition live for this
feature rather than hypothetical, so FSPEC cannot discharge it by silence:

- FSPEC already specifies capture as an observable of the halting path: E-34 (§5.4) has the
  escalation *name the capture* as the cause when capture fails, E-28 has the halt name a failed
  restoration, and E-23 fixes the restored tree as what the run ends on.
- `DECISIONS-pdlc-advisory-wave-gate.md` DEC-A6-03 — the decision REQ v1.16 now cites by id — states
  that "the halt message must print the ref name", that a re-run of a halted feature overwrites
  `refs/pdlc/a6-snapshot-1`, and that the documented operator remedy is to copy the ref before
  re-running. The pointer AC-6.3 conditions on is therefore specified to exist.

So the halt report *does* point the operator at a captured state, and the warning that must accompany
it has no behavioural rule, no edge-case row, and no acceptance test in this FSPEC. Downstream
(TSPEC/PROPERTIES/implementation) reads FSPEC §4 and §6 for what to build and §2 for what is covered;
as it stands the concordance overclaims and the obligation would be built by nobody.

**Altitude of the fix.** Small and REQ-shaped, not TSPEC-shaped. FSPEC needs the conditional
observable — *where the halt report names a captured pre-A6 tree state, the same report also states
that re-running this feature overwrites it* — as a clause on BR-14 and a *Then* conjunct on AT-06-4,
with the ref name, its storage form and its lifetime left where §7 O-1 already leaves them. No seam
signature, no ref-naming algorithm, no field layout enters the FSPEC.

**Everything else holds.** The rest of FSPEC's compression of REQ is unaffected by this delta: the
REQ text behind §3, §4 (BR-1…BR-13, BR-15, BR-16), §5, §6.1–§6.5, §6.7 and §7 is byte-identical to
the version I approved at v3, and I re-confirmed that by diffing the whole REQ rather than the routed
hunks. The three v3 Medium/Low findings (BR-9 domain rationale, upstream version pin, §2 phrasing,
Cross-Reviews row) remain open and remain non-gating; the version pin is restated below only because
this round widened its distance from HEAD.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | High | delta | local | REQ v1.16 appended a second conjunct to AC-6.3 — where the halt report points at a captured pre-A6 tree state it must warn, in the same place, that re-running the feature overwrites that capture. FSPEC compresses only AC-6.3's first sentence (BR-14, AT-06-4, E-30); the warning appears in no business rule, edge-case row or acceptance test, while §2's concordance still claims `FSPEC-AWG-06` covers AC-6.1…AC-6.4. Fix: add the conditional observable as a clause on BR-14 and a *Then* conjunct on AT-06-4, leaving the ref's name, storage form and lifetime to §7 O-1. | §4 BR-14 / §6.6 AT-06-4 / §2 concordance |
| F-02 | Medium | inherited | nonlocal | FSPEC §1 still pins its upstream as "`REQ-pdlc-advisory-wave-gate` v1.13" (and the v1.5/v1.6 changelog entries ground against REQ v1.13). REQ is now v1.16 — three erratum rounds on, two of which edited text this FSPEC compresses (AC-5.1, AC-1.1, R-5, and now AC-6.3). Raised as v3 F-02 and still open; this round widens the gap. Fix: re-ground the pin to v1.16 in the same edit that lands F-01. | §1, upstream pin |

FINDING: High | delta | local | §4 BR-14 / §6.6 AT-06-4 / §2 concordance | REQ v1.16's new AC-6.3 conjunct — the halt report must warn, in the same place it points at a captured pre-A6 tree state, that re-running the feature overwrites that capture (DEC-A6-03) — is compressed nowhere in FSPEC: BR-14, AT-06-4 and E-30 carry only AC-6.3's diagnosis-and-root-cause sentence, `overwrit` does not occur in the document, and DEC-A6-03 confirms the halt message does print the ref name so the condition is live rather than vacuous; §2's concordance therefore overclaims coverage of AC-6.3, and the obligation would reach no downstream author. Fix at FSPEC altitude: a conditional clause on BR-14 plus a *Then* conjunct on AT-06-4, with the ref name and storage form left to §7 O-1
FINDING: Medium | inherited | nonlocal | §1 upstream pin | FSPEC §1 pins its upstream at "REQ-pdlc-advisory-wave-gate v1.13" while REQ is now v1.16; the pin no longer names the version this document is a compression of, and should be re-grounded in the same edit that lands F-01

## Questions

| ID | Question |
|----|---------|
| Q-01 | AC-6.3's warning is conditional on the halt report pointing at a captured state. Should FSPEC state the conditional form (silent when no capture exists, e.g. E-34's capture-failure branch), or does the author intend the warning to be unconditional wherever a capture was attempted? My reading — and the one F-01's proposed fix assumes — is the conditional form, which keeps E-34's no-capture branch clean. |
| Q-02 | DEC-A6-03 records a "documented operator remedy: copy the ref before re-running a halted feature." Is that remedy sentence itself part of the halt report's observable, or is only the overwrite warning in scope for AC-6.3? FSPEC should say which, since the two produce different AT-06-4 oracles. |

## Positive Observations

- The REQ edit is well-scoped and stays at requirements altitude: it states the operator-visible
  outcome, names DEC-A6-03 as provenance, and explicitly leaves the capture's name and storage form
  to O-1 — so landing it in FSPEC does not force any TSPEC-altitude text into either document.
- The delta is genuinely one hunk plus a changelog entry. Nothing else FSPEC compresses moved, which
  made this confirmation cheap and kept the blast radius to a single AC.
- FSPEC's existing coverage of AC-6.3's first sentence is precise and multiply anchored (BR-14,
  AT-06-4, and E-30's failed-log-write carrier), and E-34's capture-failure branch is already
  specified — so the gap F-01 names is an addition to a sound structure, not a rework.
- The v1.16 changelog is honest about the item being routed since round 5 and previously unlanded,
  which is exactly the provenance a cascade reviewer needs to bound the scope of this round.

## Recommendation

**Needs revision**

FSPEC no longer holds as a faithful compression of REQ at HEAD. One High finding (F-01): AC-6.3's
new preservation-warning conjunct is unrepresented in §4, §5 and §6, while §2's concordance still
claims full coverage of AC-6.1…AC-6.4. The fix is bounded and FSPEC-shaped — one clause on BR-14, one
*Then* conjunct on AT-06-4, and the §1 upstream pin re-grounded to v1.16 (F-02) in the same edit.
Nothing else in the document needs to move, and no settled decision is reopened.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 1, "low": 0}
