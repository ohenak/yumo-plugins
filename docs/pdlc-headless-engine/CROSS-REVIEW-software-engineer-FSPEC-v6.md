# Cross-Review: software-engineer — FSPEC (delta re-review)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-headless-engine/FSPEC-pdlc-headless-engine.md
**Date:** 2026-08-11
**Iteration:** 6
**Scope:** Delta only — commit `74d29bda` against my v5 review base `d98c7e88`. Convergence check on
my one open High (F-24) plus a regression scan of the changed section. No re-review of sections
already approved in v1–v5.

## Delta Under Review

`git diff d98c7e88..74d29bda` touches exactly two hunks of the FSPEC:

1. Version row `1.4 → 1.5` plus a v1.5 change note recording this one-clause resolution.
2. §6.3's opening paragraph (`FSPEC:581-585`): the trailing clause that attributed §7.3's model-map
   coverage to the dry-run surface is requalified — the map "is exercised over descriptors recorded
   by hermetic fixture-driven runs, not over this surface (BR-MODEL-3)".

Nothing else in the document changed. AT-ENG-29 and EC-DISP-6 are byte-identical, as the change note
claims — the diff confirms it rather than relying on the note's assertion.

## Verification of F-24 (my one open High)

F-24 was: §6.3's preamble and §7.3's BR-MODEL-3 asserted opposite things about whether the dry-run
surface is a source for M-ENG-07's corpus. I checked both sites at HEAD:

| Site | Text at HEAD | Consistent? |
|---|---|---|
| §6.3 preamble (`FSPEC:583-585`) | model map "exercised over descriptors recorded by hermetic fixture-driven runs, **not over this surface**" | yes |
| §7.3 BR-MODEL-3 (`FSPEC:670-674`) | "the dry-run surface is **not** a way to reach it … exercises at most one row and is never the corpus's source" | yes |

The two sites now agree, and they agree in the same direction the erratum settled. This is the
reviewers' Option B applied as written: one clause requalified, no content added, no decision
reopened, the positive statement (where the corpus *does* come from) retained rather than the false
half merely deleted.

**The "only two sites" claim is true at HEAD.** I re-ran the search independently rather than
trusting the change note: `grep -n "dry.run\|dry run\|--dry"` returns 24 body occurrences
(`FSPEC:114, 177, 187, 198, 203, 208, 233, 265-266, 297, 334, 338, 392, 579-591, 616, 626, 672,
1122, 1288, 1417, 1432`). Intersecting those with model/corpus/descriptor/map wording leaves only
line 672 — BR-MODEL-3 itself, the corrected statement. The nearest neighbour, §3.2's flag row
(`FSPEC:203`), routes to §6.3 for **§6.4's every-member skill assertion**, which is a different
assertion and is correctly reached "one invocation per member" under BR-SKILL-6 (`FSPEC:590-596`);
it makes no model-map claim. The claim is gone from the document, not relocated.

## Regression scan of the changed section

- **§6.3's other rules unaffected.** BR-SKILL-5 (dry-run inertness asserted, not assumed) and
  BR-SKILL-6 (one skill per invocation, `pdlc/engine/bin/pdlc.mjs:172`, `:189-191`) are untouched and
  still consistent with the requalified preamble: the surface's one-row reach is exactly what
  BR-SKILL-6 already implies.
- **Downstream anchors still resolve.** EC-DISP-6 (`FSPEC:700`) still fails the set-equality when a
  map row is unreachable in the corpus and still routes the fix to M-ENG-07's corpus or map, never a
  loosened oracle — the correct direction now that the corpus's source is unambiguous. BR-MODEL-2's
  both-directions set-equality (`FSPEC:663-668`) is unchanged, so completeness is still set-equality,
  not containment.
- **Cited authority exists.** M-ENG-07 is a real section —
  `docs/_constraints/pdlc-engine-baseline.md:105`, "Pinned model map and the corpus that exercises
  every row" — so the FSPEC is not citing a nonexistent authority.
- **No new code claims introduced.** The delta cites only in-document anchors (§7.3, BR-MODEL-3);
  the code citations in the surrounding paragraph were verified at HEAD in my v5 review and are
  unchanged.
- **AC traceability intact.** AC-3.3 and AC-6.1 remain BR-MODEL-3's anchors; the requalified §6.3
  sentence no longer creates a second, contradicting reading for an implementer scoping AT-ENG-29.

No regression found. Nothing previously approved was disturbed.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| — | — | — | None. F-24 resolved; no new issues in the changed section. | — |

My non-gating findings from earlier rounds (F-22, F-23) remain as recorded and are unaffected by
this delta.

## Questions

| ID | Question |
|----|---------|
| — | None. |

## Positive Observations

- The fix is the minimum that closes the contradiction and keeps the reader informed: the sentence
  still tells you where the map *is* exercised, so §6.3 does not become an absence-only statement
  pointing at §7.3.
- The change note names the audit it performed and lists the sections read (§3.1, §3.2, §4.1–4.2,
  §6.4, §7.3, §16). That claim survived an independent grep, which is what makes an audit note worth
  carrying — it made this confirmation cheap and checkable rather than asking for trust.
- Calling out AT-ENG-29 and EC-DISP-6 as byte-identical is the right disclosure for an erratum
  resolution: it tells the next reader precisely where the blast radius stopped.

## Recommendation

**Approved**

The delta resolves my one open High (F-24) at the site I named, in the form I recommended, and the
duplicated claim is verifiably gone from the whole document. §6.3 and §7.3 now agree, downstream
anchors (AT-ENG-29, EC-DISP-6, BR-MODEL-2) are untouched and still correct, and the cited authority
M-ENG-07 exists. No open High findings remain from my lens; the FSPEC is technically implementable
as written and ready to hand to Phase T.

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}

APPROVAL-HASH: sha256:ac1ce7a6b4797ed24ac683ddea75b6725b6dc6eadf2be2adaabc96cafe9ef902
REVIEWED-COMMIT: 74d29bda0b1b259575d690370d513c5b07681ae4
