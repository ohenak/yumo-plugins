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

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Cross-Feature | **Option B's corrected price is still short by one literal, in a file the document already names.** The re-pricing three → four is right as far as it goes, and the `publish-preflight.mjs` correction is the important half of it. But `loop-distribution.test.js` holds the engine `lib/` class size **twice**, not once: `:161`'s `4 + 15 + 5 + 1` (the one the document names) and `:186`'s `const vendoredClassSize = tspecPackedCount({ licence: false }) - (4 + 15 + 1)`. Under B the class goes 15 → 16, so `tspecPackedCount` returns 26 while `:186` still subtracts 20 — `vendoredClassSize` computes as **6**, and three assertions in `P7-02` red: `:205`'s `assert.equal(vendoredClassSize, 5, …)`, and both document oracles, which would then grep the two sibling `pdlc-engine-distribution` documents for the word *"six"* that B never writes. So B pays a fifth literal, and — worse for the comparison's shape — a B that stopped at four sites would drag K-7's sibling-document edits behind it, which the document elsewhere treats as A's cost alone. **Why Medium and not High:** the verdict is untouched and the document says so itself in the right place (*"the verdict was never carried by the site count"*; B's disqualifier is the absent coverage gate), the chosen option is unaffected — under A, `:186` correctly derives 6 with no edit, and K-8 already owns `:205`'s literal and the word map — and no K-row changes. It is an accuracy defect in a rejected option's price, not a decision defect. **Why Cross-Feature anyway:** this is the second consecutive round in which B's price moved, and the reason is the same both times — the sweep's unit is the **file**, so a file already on the list is never re-read for a *second* occurrence of the same constant. The repo-scoped `git grep -l` fixed the scope but not that. If K-9's promoted rule is going to be the durable artifact of this feature, it should say *every occurrence*, not *every file*: `git grep -n` over the class's literal, not `-l` over a probe name. **Fix:** price B at five sites, naming `:186`; add the occurrence-not-file clause to K-9's promoted constraint text. | REQ O-2, REQ C-5 |
| F-02 | Medium | Local | **The 25 files partition into 24.** *What the sweep found* now states 25 hits, of which nine transcribe a member list *"rather than importing a module, which is what the other fifteen do"*, then names two further hits that survive the grep and fail the predicate. 9 + 15 = 24. I classified all 25 at HEAD: the complement of the nine sites is **sixteen** files, and two of those sixteen are not importers at all — `pdlc/README.md` is prose (the document's own tenth transcription, six paragraphs later) and `pdlc/workflows/lib/escalation-view.mjs` is the probed module itself, a hit on its own path. Either reading leaves a number wrong: if README counts as a transcriber the transcribers are ten, not *"exactly the nine"*; if it does not, the complement is sixteen, not fifteen. This is the one paragraph in the document whose entire warrant is that a reader can re-run the command and reproduce the partition, and a reader who does exactly that lands on an unexplained 25th file — the precise anxiety (*did the tool drop one?*) that the same section's NUL note exists to settle. **Fix:** state the partition so it closes over 25 — nine transcribing sites, one non-falsifying prose transcription (`README.md`), the probed module and its two dispatchers, and the remainder importers, two of which fail the predicate. | REQ O-2 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | On F-01: is `escalation-view` still the right probe for the *engine* `lib/` class at all? It probes the vendored workflow class; B's cost lives in `LIB_MODULES_AT_HEAD`, a different class that the probe reaches only incidentally, through files that happen to hold both. That is why B's price has been derived by reading rather than by query in all five rounds, and it is a live question for K-9's promoted rule, not for this feature's chosen option. |
| Q-02 | On F-02: does the tenth transcription deserve a name in the constraint, not just in K-9's task? *Non-falsifying co-change obligation* is a useful category — an edit that is owed, drifts silently, and is caught by review or not at all — and this feature is the second to hit one. Naming the category in `DOMAIN-CONSTRAINTS.md` would let the next PLAN author ask for the list rather than rediscover it. |

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Section anchor |
|----|----------|------------|----------|----------------|
| F-01 | Medium | delta | local | *Corrected cost claim* / option table row B — B priced at four sites, omitting `loop-distribution.test.js:186`'s second `15` |
| F-02 | Medium | delta | local | *What the sweep found* — nine transcribers plus "the other fifteen" does not close over 25 hits |

FINDING: Medium | delta | local | Corrected cost claim / option table row B | Option B is priced at four sites; `loop-distribution.test.js:186`'s `- (4 + 15 + 1)` is a fifth occurrence of the engine `lib/` class size, so under B `vendoredClassSize` computes 6 and P7-02's `assert.equal(…, 5)` plus both document oracles red. Verdict unaffected — B's disqualifier is the absent coverage gate — and the chosen option A needs no edit at that line.
FINDING: Medium | delta | local | What the sweep found | The stated partition of the 25 sweep hits is nine transcribers plus "the other fifteen", which sums to 24; the complement is sixteen, and two of those (`pdlc/README.md`, `lib/escalation-view.mjs`) are prose and the probed module itself, not importers.

## Positive Observations

- **The round fixed the instrument, not just the number it produced — for the second round running.** I raised a missing tenth transcription and a tool that drops NUL-containing files. The revision could have added a row and swapped a command. Instead it identified that both of my findings had a *single* cause — a sweep scoped to two `__tests__/` directories — and restated the sweep over tracked sources, which then independently surfaced the mispricing of option B that no reviewer had asked about. That is the difference between closing findings and closing the class they came from.
- **It published a correction that makes its own chosen option look worse, and said whose error it was.** Option B moves three → four sites, narrowing the gap the document uses to justify A, and the paragraph names v1.3's own claim as the wrong one (*"the last of which this document itself got wrong in v1.3"*) rather than quietly restating. It then explains why the miss was structural rather than careless — a test-directory query could not have surfaced a production script — which is the part a reader can learn from. Verified at HEAD: `publish-preflight.mjs:200-219` is a deliberate second copy, and PF-4 runs it at publish time, so the correction is materially right and not merely conservative.
- **The `__tests__/`-scope note picks the strongest possible worked example.** Of the files a narrow query missed, `publish-preflight.mjs` is the one that runs at publish time rather than in CI — so the miss's cost is a red *after* the tag is cut. Choosing that file as the example K-9's constraint carries forward means the next reader inherits the argument, not just the rule.
- **K-9's falsifier cell answers TE Q-02 with an asymmetry rather than a preference.** *"K-3's pair is under `Unit tests (ubuntu-latest, node 20)` on both sides, so a partial edit reds one check twice rather than two checks once"* — a task-boundary rule an implementer can apply to the next pair without asking. I verified both halves of K-3 sit in that one suite and that `run.test.js` and `learningsPremises.test.js` straddle two.
- **The README obligation is placed where it will actually be done, and honestly labelled.** Declining to make it a tenth site-table row keeps the table's meaning intact (every row reds on a partial edit) while still putting the edit in K-9's task and in *Standing costs accepted*, flagged as corrected by review rather than by a red. Both reviewers reached the same placement from opposite directions and the document records that, which is the right way to close a two-reviewer disagreement.
- **v1.4's changelog is a genuine reading aid.** It separates *scope*, *tool* and *the one cost claim that depended on both*, and states what did **not** move (option A's nine sites, the site table, K-1's partition, DEC-STATS-01/02/03). A reviewer arriving at iteration 5 can find the delta without diffing.

## Recommendation

**Approved with minor changes**

No High findings. The three decisions are unchanged and remain the right calls, and both of my v4 Mediums plus the Low are closed by a mechanism rather than by a patch. The two findings above are accuracy items on material this round introduced: neither changes the option chosen, neither changes a K-row, and neither affects the chosen option's implementation obligations — under A, `loop-distribution.test.js:186` derives correctly with no edit and K-8 already owns the assertion beneath it. Phase D is not blocked.

Suggested next touch of the document, in priority order:

1. **F-01 (Medium).** Price option B at **five** sites, naming `loop-distribution.test.js:186`'s `- (4 + 15 + 1)` and the P7-02 assertions it reds; add the *occurrence, not file* clause to K-9's promoted constraint text.
2. **F-02 (Medium).** Restate *What the sweep found*'s partition so it closes over 25 rather than 24, with `pdlc/README.md` and `lib/escalation-view.mjs` explicitly placed.

Unchanged and not re-reviewed: DEC-STATS-01's Context and chosen option, DEC-STATS-02, DEC-STATS-03, the site table, K-1, K-2, K-4, K-5, K-6, K-7, K-8, the *What these decisions do not decide* section, and the project-level decisions.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 0}

APPROVAL-HASH: sha256:04267ef0e06ddea0a0fc22b85525b79aa55c1bf43024aa5814db1547e0657287
APPROVAL-HASH-NORMALIZED: sha256:6ac77133dfc63ec823369986dfacb584ffdcb45a4c69c469ccf000d240a709d1
REVIEWED-COMMIT: 42cf8850d7366d1fd4cdba498efa280fe63bdfdd
UPSTREAM-STATE: REQ sha256:60a516fb2ede925b2428dca1bc8e4e61587c52827ea55b9e4965ea57b9a8f1c9
UPSTREAM-STATE: FSPEC sha256:0b8864d624cad46274ccb98a80e5da2672370bead258311446f6b482918017b0
UPSTREAM-STATE: TSPEC sha256:db285ea2f1eb0267f2a49392979eade2e78ead59a1f243ec7e0438aeb3c4b5be
