# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/REQ-pdlc-decision-ledger.md` (v1.9)
**Date:** 2026-08-28
**Iteration:** 10
**Scope:** delta confirmation over the erratum edit `0fdbe5862..4f03479e1`. The REQ diff is
**one line** — `REQ:33`, the v1.8 erratum note's cascade pointer. The same commit also edits
`docs/_constraints/pdlc-decision-corpus-baseline.md` (Cited-by row, FSPEC half). Decision freeze:
nothing new is decided here. Unchanged sections already approved are not re-litigated.

## Delta Verification — the corrected pointer is right

v1.8's note read `FSPEC §3.3's recital of the default cascades`. v1.9 retypes it to name
`§3.1's defaults sentence and §7 A-1, not §3.3, which carries no bound literal`. That is three
separate factual claims about FSPEC at HEAD, and I checked each against the file rather than
against the commit message:

| Claim in the corrected pointer | Verified at HEAD |
|---|---|
| §3.1 carries a defaults sentence with the bound literal | **True.** `FSPEC:127` — ``Defaults are `enabled` `false`, `maxEntries` `70`, `maxBytes` `12500` (REQ C-5).`` §3.1 spans `FSPEC:106-128`, so the line is inside it. |
| §7 A-1 recites the same bound | **True.** `FSPEC:562` — ``maxEntries` (70) from `M-6b`/`M-6c`, `maxBytes` (12500) from `M-7b`/`M-7c``. §7 *Assumptions* opens at `FSPEC:558`, so A-1 is inside it. |
| §3.3 carries no bound literal | **True.** §3.3 spans `FSPEC:155-186`; a scan of that range for `maxBytes`, `maxEntries`, `70`, `12500`, `8000` or any backticked numeral returns nothing. It is the fail-open path, which degrades without restating a size. |

A repo-wide grep for the bound literal in FSPEC returns exactly three sites — `FSPEC:28`
(the FSPEC's own change note), `FSPEC:127` (§3.1) and `FSPEC:562` (§7 A-1). The corrected
pointer names both live recitals and no others, so the enumeration is complete, not merely
non-false. **The old pointer was wrong and the new one is right** — this delta fixes a real
defect in the sweep record rather than reshuffling wording.

The `12500` cascade itself had already landed at both named sites (confirmed in round 9 at
`FSPEC:120`/`FSPEC:554-555`, same lines as `FSPEC:127`/`FSPEC:562` here after the note's
insertion shifted numbering). So the note now describes what the tree actually contains.

**Baseline half.** The commit adds `§7 Assumptions A-1` to the Baseline's *Cited by* row
(`baseline:6`) and holds `Version` at `1.2`. Holding the version is correct: the row's own rule
binds a bump to a *new citation being minted*, and no measured value moved — `M-1`…`M-7` and the
`Verified at` commit `8c673a09f` are byte-identical to the v1.2 I re-derived in round 9. This
resolves the FSPEC half of my round-9 F-01.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Description | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Low | delta | local | The rewrite consumed the sentence's only verb; the pointer is now a fragment that names the sites but no longer asserts the cascade landed | v1.8 note (`REQ:33`) |
| F-02 | Medium | inherited | nonlocal | Baseline *Cited by* row: the FSPEC half was fixed by this very edit, the REQ half still omits `§6 R-5`, `§7 A-1`, `§7 O-6` | `baseline:6` vs `REQ:339`, `REQ:378`, `REQ:386` |
| F-03 | Medium | inherited | nonlocal | §4 C-5's `maxBytes` rationale still reads its 3,204-byte clearance as per-record framing allowance; TSPEC's re-measure leaves ~441 B | §4 C-5 (`REQ:182`) |
| F-04 | Medium | inherited | nonlocal | AC-01 asserts equality over the rendered line while the cited `M-*` ids supply ids only | §5 REQ-DECLEDGER-01 (`REQ:202-206`) |
| F-05 | Low | inherited | nonlocal | v1.9 note names the re-pinned sites "§1 and §5"; the first pin sits in §2 G-1 (`REQ:93`) | v1.9 note (`REQ:23`) |
| F-06 | Low | inherited | nonlocal | Header *Cross-Reviews* row still enumerates `v{1,2,3,4,5,6}`; v7–v9 exist and v10 lands with this file | Header (`REQ:13`) |

**F-01 (delta, local).** v1.8 read `FSPEC §3.3's recital of the default cascades` — where
`cascades` was the finite verb ("the recital cascades"). The correction promoted the sites into
an em-dash apposition and the verb went with the old subject, leaving:
`FSPEC's recitals of the default cascade — §3.1's defaults sentence and §7 A-1, not §3.3, which
carries no bound literal; nothing else moves.` That is a noun phrase and a semicolon clause with
no predicate joining them. Nothing downstream is wrong — I verified both recitals do carry
`12500` — but under DEC-ERR-01 this note *is* the sweep record, and the sweep record now names
the swept sites without stating they were swept. A future reader re-deriving the cascade cannot
tell from this sentence whether §3.1 and §7 A-1 were updated or merely identified. One verb
fixes it (e.g. `… are already retyped; nothing else moves`). Non-gating under the freeze, and
strictly better than the false pointer it replaces.

**F-02 (inherited, nonlocal).** Round 9's F-01, now half-resolved. The edit added
`§7 Assumptions A-1` on the FSPEC side of `baseline:6` but left the REQ side reading
`§2 G-1, §4 C-5, §5 REQ-DECLEDGER-01, §5 REQ-DECLEDGER-04, §7 O-1, §7 O-5`. At HEAD, `REQ:339`
(§6 R-5) cites `M-6b`/`M-6c` and `M-7b`/`M-7c`, `REQ:378` (§7 O-6) cites `M-4e`, and `REQ:386`
(§7 A-1) cites the Baseline's named commit. All three restate measured facts and none appear in
the propagation path, so a future `Version` bump routes past them. Worth noting that the edit
which fixed this exact class on the FSPEC side is the one that left the REQ side — the symmetry
is the argument for folding it into the next edit that touches the Baseline.

**F-03, F-04, F-05, F-06 (inherited, nonlocal).** Carried unchanged from round 9 (F-02, F-03,
F-04, F-05 there), all outside this erratum's one-line scope, none touched by the delta. Recorded
for continuity only; the TSPEC-side re-measure that F-03 depends on remains routed to se-author.

## Questions

| ID | Question |
|----|---------|
| Q-01 | On F-02: is the Baseline *Cited by* row meant to name every site that restates a measured value, or only the sites whose *literal* would go stale on a bump? I have read it as the former both rounds. If it is the latter, `§6 R-5` and `§7 A-1` still qualify — both restate numbers, not just ids — and only `§7 O-6` is arguable. |

## Positive Observations

- **The correction was verified, not asserted.** v1.8 named a section that carries no bound
  literal at all. Catching that required reading §3.3 rather than trusting the note — and the
  replacement names both live recitals and stops there, which I confirmed by grepping the
  literal across the whole FSPEC. A pointer that is complete as well as true is the harder thing
  to get right.
- **The Baseline edit held the version.** The tempting move was to bump `1.2` → `1.3` because
  the file changed. The edit correctly distinguished a *citation added to the propagation path*
  from a *measured value moving*, kept `Verified at 8c673a09f`, and so left every `M-*` id in
  REQ and FSPEC resolving at the version they pin. Round 9's re-derivation still stands
  unchanged; I did not have to redo it.
- **The commit message routes to the findings it answers.** It names SE-FSPEC-v3 F-04 and the
  propagation half of TE-FSPEC-v3 F-04 — including the word *half*, which is an accurate
  self-description rather than an overclaim. The unaddressed half is exactly my F-02.
- **Scope discipline held for a tenth round.** One line in REQ, one line in the Baseline, both
  named in the message. Under a decision freeze this is the shape an erratum should have.

## Recommendation

**Approved with minor changes** — no High findings.

The delta fixes a factually wrong pointer with a factually right one; I verified all three of its
claims against FSPEC at HEAD and found no contradiction with the repository. Nothing the revision
introduced is broken except F-01, a dropped verb in the same sentence — Low, cosmetic, and still
an improvement over the false pointer it replaces. The four inherited findings are untouched by
this edit and were already non-gating in round 9; F-02 is now half-resolved by this very commit.
No new decision is opened here.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 3, "low": 3}
