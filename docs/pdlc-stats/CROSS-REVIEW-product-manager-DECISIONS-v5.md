# Cross-Review: product-manager — DECISIONS

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-stats/DECISIONS-pdlc-stats.md` (v1.4)
**Date:** 2026-08-31
**Iteration:** 5

Delta re-review. Diffed `234595ce8` (the tree v4 reviewed) against HEAD `42cf8850d`: the document moved
across six commits, `9284dbc95` → `42cf8850d`, +106/−22 lines. I re-read my v4 findings first, diffed the
document, re-ran every new factual claim against the tree at HEAD, and scanned only the changed sections
for new issues. Sections the revision did not touch are not re-litigated.

## Prior findings disposition

| v4 finding | Severity | Status | Evidence |
|---|---|---|---|
| F-01 — `pdlc/README.md:231` is a tenth transcription the `__tests__/`-scoped sweep could not see | Medium | **Resolved, and resolved better than I asked** | I asked for a tenth site-table row; the revision declines that and gives a reason I accept: the table is a table of *falsifiers*, and nothing pins that line (`documentOracles.test.js` reads `pdlc/README.md` at `:316`/`:672` but pins `workflows/dist/` and the absence of seam-count prose, never the member list). The edit is instead owned by K-9 and recorded under *Standing costs accepted* as a place the number drifts silently. Verified at HEAD: `pdlc/README.md:231` names exactly the four members of `prepack.mjs:20-25`'s `MODULE_NAMES`, so both its count word and its list go stale under option A |
| F-02 — the quoted `grep -rln` silently drops NUL-containing files | Medium | **Resolved** | The sweep is restated as `git grep -l`, and the divergence is recorded as a standing clause rather than silently repaired. Verified: `git grep -l "escalation-view" -- . ':!docs/' ':!*/dist/*'` returns **25**, the `grep -r` form returns **23**; both dropped files (`loopProperties.test.js`, `lib/escalation-view.mjs`) contain NUL bytes and are classified `data` by `file(1)`. The caveat travels into K-9's promoted constraint text, which is where it protects the next feature |
| F-03 — K-3 lacked K-8's message-string clause | Low | **Resolved, and the quotes are accurate** | K-3 now carries the clause. Checked every string it quotes: `coverageInstrumentation.test.js:264`'s title does say *"exactly the six modules the feature owns"*; `:261`'s comment does say *"REQUIRED_INCLUDES' three entries"*; `REQUIRED_INCLUDES` at `:37-45` holds **four** entries; `pkg.c8.include` holds **seven**. The row's claim that the literal is seven-not-six today and eight after this feature is exactly right |
| Q-01 — should the probe's assumption be stated? | — | **Answered in the document** | A *Note on the probe* section states the predicate and the re-pick rule, and K-9's promoted text carries it |
| Q-02 — is `loopProperties.test.js:370`'s NUL literal an issue in its own right? | — | **Answered by scoping** | Treated as a property of the tree the sweep must tolerate, not as work this feature takes on. Right call |

Three of three prior findings resolved. No prior finding is carried forward.

## HEAD verification of the revision's new claims

Every claim the revision added rests on the tree, so I checked each one rather than the prose.

| Claim | HEAD | Verdict |
|---|---|---|
| `git grep -l "escalation-view" -- . ':!docs/' ':!*/dist/*'` → 25 files | 25 | Confirmed |
| `grep -rln` → 23, dropping `loopProperties.test.js` and `lib/escalation-view.mjs` | 23; both files contain NUL bytes (644 and 355 matches respectively) | Confirmed |
| The nine transcribers are the five enumeration holders plus `loop-distribution.test.js`, `coverageInstrumentation.test.js`, `run.test.js`, `learningsPremises.test.js` | All nine present in the 25 | Confirmed |
| `publish-preflight.mjs:205-219` holds its own `LIB_MODULES_AT_HEAD` (12) + `LIB_MODULES_FROM_THIS_FEATURE` (3) | `LIB_MODULES_AT_HEAD` is a 12-name array; `LIB_MODULES_FROM_THIS_FEATURE = ["resolve-version", "store", "provenance"]` | Confirmed |
| Its `:200-203` comment calls the duplication *"a deliberate second, production-side copy of the same TSPEC §5.4 table, run for real at publish time"* | Quoted verbatim | Confirmed |
| That pair feeds `expectedPackedSet()`, which PF-4 compares both directions at publish time | `expectedPackedSet()` at `:232`; PF-4 at `:247-261` reports both *unexpected* and *missing* | Confirmed |
| `loop-cli.test.js` has six references on `:122`, `:637`, `:652`, `:681`, `:827`, `:852`, all import paths and comments | Exactly those six lines; `:827`/`:852` are the `escalation-view` pair that makes it a hit | Confirmed |
| `pdlc/engine/bin/cli.mjs` `:114`/`:117` is the same shape, a dynamic `import()` path | `:114` comment, `:117` `import(pathToFileURL(…"lib", "escalation-view.mjs"))` | Confirmed |
| `pdlc/README.md:231` states the class in prose, matching `MODULE_NAMES` | Line 231; four members, identical to `prepack.mjs:20-25` | Confirmed |
| K-3's quoted title, comment, `REQUIRED_INCLUDES` count and include length | `:264`, `:261`, four, seven | Confirmed |
| **Option B pays `publish-preflight.mjs`; v1.3 was wrong to list it among the files B does not pay** | The engine `lib/` class is duplicated in `publish-preflight.mjs`, and a B that moved only `_tspec-packed-set.mjs` would red PF-4 at publish time | Confirmed — the correction is right, and the self-incriminating framing is right |
| **Option B's total is four sites** | Four named; a fifth literal exists — see F-01 | **Not confirmed** |
| **The 25 files partition as nine transcribers plus "the other fifteen"** | 9 + 15 = 24 | **Not confirmed** — see F-02 |

Thirteen claims checked; eleven hold, two do not, both of them counts rather than mechanisms.
