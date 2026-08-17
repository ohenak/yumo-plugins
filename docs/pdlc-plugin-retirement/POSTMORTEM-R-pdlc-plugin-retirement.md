# POSTMORTEM — Phase R (REQ cross-review) — pdlc-plugin-retirement

**Date:** 2026-08-17
**Phase:** R (REQ cross-review)
**Rounds used:** 5 of 5 (budget exhausted with one open High)
**Document at halt:** `REQ-pdlc-plugin-retirement.md` v0.8 (`f89736fb`)

RESOLVED: yes

## Round history

| Round | SE verdict | TE verdict | Revision that followed |
|---|---|---|---|
| 1 | Needs revision (7 High) | Needs revision (5 High) | v0.5 — baseline relocated to `docs/_constraints/pdlc-retirement-baseline.md`, M-10/M-11 added |
| 2 | Needs revision (3 High: F-19/F-20/F-21) | Needs revision (1 High: allow-list) | v0.6 + `63166245` (restored CLAUDE.md CI section, engine suite green again) + baseline errata |
| 3 | Needs revision (1 High: F-22 skills inventory) | Approved with minor changes | v0.7 + baseline M-11n (engine-authored round) |
| 4 | Needs revision (1 High: F-27 partition remainder incl. live wave-gate parser) | Approved with minor changes | v0.8 + baseline partition closure (M-11o/M-11p, M-8/M-11e/M-11h restated) |
| 5 | **Approved with minor changes** (0 High; F-29 Medium, F-30 Low) | **Needs revision** (1 High, 2 Medium, 1 Low) | — budget exhausted |

Note: rounds interleaved two orchestrators — a hand-orchestrated session and a live
`@kaneho/pdlc-engine` run that picked the queue row at 09:48 and exited after
committing v0.7. Round derivation being content-addressed, the rounds composed
without conflict.

## The open High (TE v5)

The by-construction term-set paragraph added to AC-1.2 in v0.8 declares the
search-term set "never contains a surviving identifier", then enumerates
`build-runtime.mjs` and `pdlc/workflows/dist/` as terms. Both name survivors:
M-7 (`build-runtime.mjs`) is dispositioned **reduced**, not deleted, and AC-1.1
itself requires `pdlc/workflows/dist/pdlc-cli.mjs` to survive. As written the
required-empty search is red on 12 tracked paths no M-row, M-11 row or A-1 glob
owns (`runtime-adapter.js`, `pdlc/workflows/package.json:21`, four surviving
test modules, two helpers, `bin-guard-structure.test.js`, two live feature
REQs, `pdlc-rcv-baseline.md`). The narrow reading also fails: the literal
`node pdlc/workflows/build-runtime.mjs` appears inside M-9 itself.

Non-gating leftovers recorded in the v5 reviews: SE F-29 (M-11o split leaves
`orchestrate-queue.js:5–6` banner owned by an M-11i row whose text covers only
the drift gate), SE F-30 / TE Low (`driftGenerators.js` importer count and
two-class partition cell), TE Mediums (pinned recipe grep at `baseline:148`
vs AC-1.2 enumeration differ by −4/+17 paths with no reconciling clause; the
enumeration is an upper bound, not set-equality, so the lazy-implementer
narrowing game survives).

## Recommendation

The fix is local and both v5 reviewers agree the structural decisions
(M-11h scoping, partition mechanism) are correct:

1. Drop the two survivor terms (`build-runtime.mjs`, `pdlc/workflows/dist/`)
   from AC-1.2's term set; the retired-artifact terms that remain (three
   scripts' names as deletion targets, three bundle names, manifest,
   drift-state record, `distribution.checkEnabled`, wave-gate *values*) are
   each fully owned by M-rows.
2. Pin the term set as a **set-equality** transcribed at C-6 re-measurement
   time (closing TE's upper-bound Medium), and reconcile it against the
   pinned recipe grep at `baseline:148` with an explicit clause.
3. Sweep in SE F-29/F-30 and TE's Low in the same revision (one-line each).
4. Re-run one delta round (both lenses) on the resulting v0.9.

If accepted, flip `RESOLVED: no` above to `RESOLVED: yes` and re-run Phase R
(or instruct the orchestrator to run the single revision + delta round).
