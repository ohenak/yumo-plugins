# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-headless-engine/FSPEC-pdlc-headless-engine.md` (v1.5)
**Date:** 2026-08-11
**Iteration:** 6
**Scope:** delta re-review of `d98c7e88..HEAD` (commit `74d29bda`, +15/−7 on the FSPEC: the
v1.5 change note and one clause in §6.3). v5's single High (F-01) is the subject. The two
non-gating findings carried from v4 are re-checked for status only, not re-argued.

## Disposition of prior findings

| Prior finding | Severity | Status | Evidence at HEAD |
|---|---|---|---|
| v5 F-01 — §6.3's preamble still attributed §7.3's model-map coverage to the dry-run surface, the exact claim BR-MODEL-3 had just denied | High | **Resolved** | `FSPEC:581-585` now reads "…checkable without billing a token; the model map of §7.3 is exercised over descriptors recorded by hermetic fixture-driven runs, not over this surface (BR-MODEL-3)". This is the recommended fix verbatim in substance: the false clause is gone, the replacement names the surface that actually produces the corpus, and it cites BR-MODEL-3 rather than being cited *by* it — the circularity is broken. §7.3's BR-MODEL-3 (`:670-674`) is byte-identical and consistent with it |
| v4 F-01 — BR-REP-0a's "HEAD already behaves this way" parenthetical over EC-CLI-1/2/5 | Medium | **Open, unchanged** | `FSPEC:1157-1160` still cites `pdlc/engine/bin/pdlc.mjs:243-247` for all three. At HEAD `readFlag` returns `argv[i + 1] ?? ""` (`bin/pdlc.mjs:51`), so EC-CLI-5 is red, not green; the unknown-command path is `bin/pdlc.mjs:348-350`, the missing-positional block `:243-248`. Non-gating, carried forward |
| v4 F-02 — EC-CLI-1's no-report-line half is pinned by no AT | Low | **Open, unchanged** | `FSPEC:276` still enumerates `EC-CLI-2…EC-CLI-7`. AT-ENG-01 (`:272`) covers EC-CLI-1's usage/exit-1 half but not the report-line half BR-REP-0a asserts. Non-gating, carried forward |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | Carried forward unchanged from v4 F-01 — BR-REP-0a's HEAD-behaviour parenthetical marks EC-CLI-5 green when `bin/pdlc.mjs:51` makes it red, and the cited line range is not the range of either genuinely-green path. Test consequence unchanged: AT-ENG-05's EC-CLI-5 case gets scheduled as a characterisation test when it is red-to-green work. Not re-argued this round; recorded so it is not lost | §12.1 (BR-REP-0a), §3.4 |
| F-02 | Low | Local | Carried forward unchanged from v4 F-02 — AT-ENG-05's enumeration starts at EC-CLI-2, leaving EC-CLI-1's "no report line" half untested | §3.5 (AT-ENG-05), §12.1 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | None. The delta resolves the round's one blocking item; the two carried items need no clarification, only an edit whenever §12.1/§3.5 are next opened |

## Positive Observations

- The fix is the minimal one and it is the *correct* minimal one. The clause was not merely
  deleted (which would have left the reader with no account of where the corpus comes from) —
  it was requalified to name the real source, so a test author reading §6.3 now schedules
  AT-ENG-29's corpus as fixture-driven runs and cannot derive the "sweep the map with
  `--dry-run --dry-run-skill …`" plan that made EC-DISP-6's unreachable-row case unfireable.
- The change note's completeness claim holds under check, and it is stated as set-equality over
  the full enumeration rather than by example. I grepped every `dry.run` occurrence in the
  document (18 sites: `:114, 177, 187, 198, 203, 233, 265, 266, 297, 334, 338, 392, 579, 616,
  626, 1122, 1417, 1432`). None of the remaining sites attributes model-map coverage to the
  surface. The nearest candidate, `:203`, points §6.3 at "the every-member assertion of §6.4",
  and §6.4 (`:598-605`) ranges over the *dispatchable skill set*, not the model map — a
  different assertion, so it is not a third site of the claim.
- The claim's ground truth still holds at HEAD: `bin/pdlc.mjs:190` prints exactly one skill's
  composed prompt per invocation, and `inertTransport()` (`:98-104`) throws on any dispatch —
  so "at most one row, never the corpus's source" is falsifiable and true, not merely asserted.
- Nothing previously settled was reopened. AT-ENG-29 (`:709`), EC-DISP-6 (`:700`), BR-MODEL-1/2/3
  and the whole of §7.3 are byte-identical across `d98c7e88..HEAD`; the diff introduces no new
  AC, AT, EC, or BR id, and the set-equality oracle's both-directions wording is untouched.

## Recommendation

**Approved with minor changes**

The round's one High is resolved at the site that carried it, and the document no longer
contradicts itself about what `--dry-run` demonstrates. The two remaining findings are the
Medium and Low carried from v4; neither gates convergence, and both are one-clause edits that
can ride along with the next revision of §12.1 and §3.5.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}
