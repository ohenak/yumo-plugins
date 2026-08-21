# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-wave-resume/REQ-pdlc-wave-resume.md
**Date:** 2026-08-21
**Iteration:** 1
**Scope:** Technical lens — feasibility, implementability, existing-code claim verification.
**Base verified:** branch `feat-pdlc-wave-resume` @ `d1ebb22f`; claims cross-checked against `main` @ `345ae358`.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Cross-Feature | This branch is 1637 commits behind `main`, and the REQ it authors is a from-scratch **regression of a document that already exists on `main` at v1.2** (410 lines, amendments dated 2026-08-13). Landing it re-introduces every staleness `main` already corrected. | Whole document |
| F-02 | High | Local | The "exists at HEAD" claims in §1 and BL-01/BL-03 are **false at this branch's HEAD** and misdescribe where the mechanism lives: it is merged to `main`, not sitting on the `pdlc-consolidation-agent` branch. | §1 ¶4–5, §5 BL-01/BL-03 |
| F-03 | High | Local | REQ-WVR-05 ("no resume state survives") **contradicts shipped behaviour**, which deliberately *retains* the complete ledger so a post-Phase-I re-invocation can skip Phase I. As written the AC mandates deleting state the shipped design depends on. | §7 REQ-WVR-05, §2 G-4 |
| F-04 | High | Local | REQ-WVR-06's absolute "does not consult commit presence" **forbids the shipped `head` ancestry corroboration**, which is exactly the control R-1 (history rewrite) relies on. The AC over-generalises OF-2 from *task commits as completion evidence* to *any git observation*. | §7 REQ-WVR-06, §8 R-1 |
| F-05 | Medium | Cross-Feature | BL-02's baseline file already exists on `main` and already carries `M-WG-1…M-WG-14`, including the three facts OF-1..3 restate. OF-1..3 are inline measured facts in a REQ where the bar is **cited `M-*` ids**; OB-2's promotion obligation is already discharged. | §4 OF-1..3, §5 BL-02, §9 OB-2 |
| F-06 | Medium | Local | The AC set is **not set-equal to the shipped/intended outcome catalogue**: there is no acceptance criterion for the "all waves recorded green ⇒ skip Phase I entirely" outcome, which is a distinct operator-visible resume outcome with its own announcement and its own report row. | §7 (REQ-WVR-01..07) |
| F-07 | Medium | Local | OQ-1 leaves the escape-hatch *form* open although the shipped mechanism already ships and announces one (delete the ledger file), and `startWave: 1` provably cannot express "force a full run". Leaving it open invites a second, divergent hatch. | §9 OQ-1, §7 REQ-WVR-04 |
| F-08 | Low | Local | C-1 (consumer-local untracked state) is already satisfied at HEAD-of-`main` by an anchored `.gitignore` entry; the constraint should cite it rather than state it as an unmet requirement. | §4 C-1 |
| F-09 | Low | Process | OF-1..3 are asserted "dated and reproducible from the cited run" but carry no reproducible anchor — no commit sha, run-report path, or POSTMORTEM id. As written they cannot be re-verified by a reviewer. | §4 preamble |

### F-01 — the document already exists on `main` at v1.2 (High, Cross-Feature)

Verification:

- `git rev-list --count HEAD..main` → **1637**; `git rev-list --count main..HEAD` → 5.
- `git merge-base --is-ancestor HEAD main` → false; merge-base is `c8aa22a4`.
- `git show main:docs/pdlc-wave-resume/REQ-pdlc-wave-resume.md | wc -l` → **410** lines, `Version | 1.2`,
  carrying two dated amendment blocks (2026-08-13) and inline `**Correction, 2026-08-13.**` paragraphs
  that fix precisely the staleness F-02, F-03 and F-07 report below.
- The queue row and the traceability rows this branch adds already exist on `main`
  (`main:docs/_queue/QUEUE.md:95`; `main:docs/requirements/traceability-matrix.md:133-136`),
  so four of the five commits on this branch are re-additions.

This is not a merge-conflict nit: the v1.0 text on this branch *asserts* things v1.2 explicitly
records as corrected. Whichever way the merge resolves, a reviewer downstream cannot tell which
statement is current. **Required change:** rebase this branch onto `main` and continue from the
existing v1.2 document (an amendment round), or state in writing why v1.2's amendments are being
reverted. Do not proceed to FSPEC from the v1.0 text.

### F-02 — HEAD claims are false on this branch and mislocated on `main` (High, Local)

§1 ¶4 says "A manual resume pointer now exists (`implementation.startWave`…)" and BL-01/BL-03
say the pointer and the interim mechanism "exist at HEAD", gated on "`pdlc-consolidation-agent`
PR merged".

- At **this branch's HEAD** neither exists: `grep -c startWave pdlc/workflows/orchestrate-dev.js` → **0**
  (this tree's `orchestrate-dev.js` is 11,003 lines).
- On **`main`** both exist, and the gating condition is already satisfied — the mechanism merged in
  `87d9c6ad` ("feat(pdlc): consolidation agent … (#50)"), and the feature is archived at
  `main:docs/completed/pdlc-consolidation-agent/`. `main:pdlc/workflows/orchestrate-dev.js` is
  16,336 lines and carries:
  - `WAVE_STATE_PATH = ".claude/pdlc-wave-state.json"` at `:12214`, under a block comment headed
    `INTERIM: the wave ledger…` at `:12196`;
  - `parseWaveLedger` at `:12267`, `formatWaveLedger` at `:12325`, `computePlanHash` above them;
  - the read/resolve site at `:15228-15346` and the per-wave write at `:15590-15605`.
- §1 ¶5 places the interim mechanism "at HEAD of the pdlc-consolidation-agent branch". It is on
  `main`. BL-01/BL-03's gating logic ("Must exist at HEAD before FSPEC authoring") is therefore
  already met, and this feature's `ready: false` on those two prerequisites is stale.

**Required change:** rebase (F-01), then restate §1 ¶4–5 and BL-01/BL-03 against `main`, and
re-evaluate `ready:` in the frontmatter against the merged prerequisites.

## Questions

_(pending)_

## Positive Observations

_(pending)_

## Recommendation

_(pending)_
