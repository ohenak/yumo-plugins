# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-plugin-retirement/FSPEC-pdlc-plugin-retirement.md` (v0.6)
**Date:** 2026-08-17
**Iteration:** 7

**Scope:** delta re-review against `CROSS-REVIEW-test-engineer-FSPEC-v6.md`. Delta under scan is
`git diff be41c1d7^..b6f0516b -- docs/pdlc-plugin-retirement/FSPEC-pdlc-plugin-retirement.md`
(45 insertions, 57 deletions) across two commits: `be41c1d7` (retire §7.2, repoint citations at
REQ v0.11) and `b6f0516b` (eight run-variable collections in AT-5.2/E-21, survivor-positive
AT-4.3). Unchanged sections already approved were not re-litigated.

## Resolution of round-6 findings

| Prev | Status | Evidence |
|---|---|---|
| F-01 (High) — §7.2 claimed three live REQ defects that REQ v0.11 had already fixed; four in-document pointers sent implementers at a defunct authority | **Resolved** | §7.2 is now a three-row *resolution log* titled "Upstream errata — resolved" (:812–822), stating the defects were closed in REQ v0.11 and that no criterion was relaxed in FSPEC to work around them. Upstream pin is `v0.11` at :9 and restated at :75. The four pointers are repointed: class-7 row now cites "REQ O-3" not TSPEC's O-3 (:159); BR-CLN-3a cites "REQ AC-4.3 (v0.11) … (REQ C-9)" (:512–513); E-16a cites "REQ AC-4.3 and C-9 (v0.11)" (:575); AT-5.2 cites "REQ AC-5.2's enumerated allowed-difference set at v0.11" (:782–784). O-C is narrowed to "Which surviving directory holds the probe CLI's build" and records the manifest branch as settled (:793) — which is exactly what REQ O-3 says at `REQ-pdlc-plugin-retirement.md:558–566` ("The manifest does **not** survive for that one row … AC-1.1's set-equality … holds without exception"). Grep confirms no surviving `v0.9` pin outside the historical narrative in §7.2. |
| F-02 (High) — AT-5.2 and E-21 named five run-variable collections where REQ AC-5.2 enumerates eight exhaustively, so a literal AT-5.2 test would value-compare `authSources`, `startup` and `loop` and red on a correct sweep | **Resolved** | AT-5.2 clause 2 (:773–781) and E-21 (:581) now both name all eight literally — `authSources`, `startup`, `dispatches`, `retries`, `pauses`, `denials`, `loop`, `outcomes` — matching REQ AC-5.2 (`REQ-…:466–476`) word for word, and both retain the two version-provenance fields separately. The eight names are real fields of the engine report block at HEAD: `pdlc/engine/__tests__/report-engine.test.js:40–50` lists them in the TARGET key set and `:66–79` shows each populated per run (`authSources` rows, `startup` ladder, `loop: null` for a non-loop run, `outcomes` counts). AT-5.2 also adds the closure sentence that the excluded set is *exactly* REQ's, in both directions (:783–784). |
| F-03 (High) — AT-4.3's oracle was absence-shaped: nothing required an expected entry to be *present*, so a fixture holding only the unexpected file passed vacuously | **Resolved** | AT-4.3 (:733–747) now reuses AT-4.1's construction — the directory holds **every** L-11 entry **plus** one unexpected file — and states four conjuncts: (a) every L-11 entry still present and byte-identical, with the falsifying case named ("a run that deleted some expected entry before refusing reds this test"); (b) unexpected file still present and byte-identical; (c) path named on stderr; (d) exit status exactly `3`. The rationale sentence names the vacuity it closes. `3` remains the right literal at HEAD: `pdlc/hooks/scripts/sync-workflows.sh:695`, `:699`, `:714` exit `3`, `:718` → `2`, `:722` → `1`, `:725` → `0`, `:687`/`:691` → `4`. The round-5 Medium (E-16b unpinned) is also closed: AT-4.3's second construction is the `.pdlc-tmp.<pid>.<rand>` residue, refused on the same four clauses. |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **"presence and shape" is a wider comparison than REQ AC-5.2's "presence", and `loop` can legitimately change shape between two correct runs.** AT-5.2 clause 2 (:781) and E-21 (:581) say the eight exempt collections are "compared for presence and shape, never for value", while REQ AC-5.2 says each "is compared for presence, not for content" (`REQ-…:475–476`). `shape` is undefined in the FSPEC, and at least one member varies in shape, not merely in content, between correct runs: `pdlc/engine/__tests__/report-engine.test.js:78` carries `loop: null` for a completed non-loop run, whereas a `/loop`-driven run carries a loop record object; `retries` is `[]` in a zero-retry run (`:168–169`) and a populated array otherwise. A TSPEC author reading "shape" as structural equality writes a comparison that reds on a correct sweep — the same unpassable-gate class the v6 F-02 erratum removed — and one reading it as "presence of a same-typed field" writes something else, so the AT does not yet fix a single oracle. This is inherited text, not introduced by this delta, but it sits inside the section this delta rewrote. Fix is one clause: either drop "and shape", or define it as the field's JSON kind with `null` and the empty collection admitted as the same kind as their populated forms. | §6.5 AT-5.2 clause 2; §5 E-21 |
| F-02 | Low | Process | **The header's Cross-Reviews field stops at v4 and no longer lists the reviews that drove v0.5–v0.6.** :11 enumerates SE v1/v3/v4 and TE v1–v4, while `docs/pdlc-plugin-retirement/` holds TE FSPEC v5 and v6 (and this v7). The provenance trail a later reader follows to see why AT-4.3 and AT-5.2 read as they do is incomplete. Append the missing filenames. | Header table, :11 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Carried v3–v6, still open at TSPEC level, recorded not re-raised: AT-3.3's consolidation-nudge entry does not name the stale-LEARNINGS count at which the nudge fires. `pdlc/hooks/scripts/nudge-consolidation.sh:25` sets `THRESHOLD=5` and `:81` gates on `n >= THRESHOLD`, so a four-file fixture yields silence and an absence-shaped false green. Fixture construction is TSPEC's lens; flagged here only so it is not lost. |

## Positive Observations

- **§7.2's inversion from open-defect list to resolution log is the right shape.** A reader now sees what was raised, what REQ HEAD says instead, and — in row 1 — precisely which sliver stayed open (which directory holds the build, O-C/TSPEC). No criterion was relaxed in the FSPEC to absorb the errata, which is what the section claims and what the diff shows.
- **AT-4.3 is now a four-conjunct positive oracle with its own falsification narrated.** "A run that deleted some expected entry before refusing reds this test" tells the implementer exactly which mutation must go red, and reusing AT-4.1's nine-member fixture keeps the cost at one construction rather than a new one.
- **The eight-name transcription is literal, not paraphrased, in both places it appears.** AT-5.2 and E-21 agree with each other and with REQ AC-5.2 name for name, so a TSPEC comparison list can be built by transcription with no judgement call — and every name checks out against the live report block in `report-engine.test.js:40–50`.
- **AT-1.1 already covers both AC-1.1 branches** (:594–598: `dist/` set-equals `{pdlc-cli.mjs}`, or `dist/` absent with the CLI at the single surviving path the TSPEC names), so O-C's narrowing to "which directory" leaves no untestable gap behind it.

## Recommendation

**Approved with minor changes**

All three round-6 High findings are resolved and verified against REQ v0.11 and against code at HEAD (`report-engine.test.js`, `sync-workflows.sh`), not against the documents alone. The revision introduced no new blocking defect. One Medium remains — "shape" is a term the FSPEC uses but does not define, and one exempt collection (`loop`) genuinely changes shape between correct runs — and one Low header-hygiene item. Neither gates the phase; both are cheap to fold into the next edit or to hand to the TSPEC comparison list.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}
