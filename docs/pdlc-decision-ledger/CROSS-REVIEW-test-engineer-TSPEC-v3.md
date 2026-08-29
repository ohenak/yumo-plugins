# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/TSPEC-pdlc-decision-ledger.md` (v0.3, 2026-08-28)
**Date:** 2026-08-28
**Iteration:** 3

Delta re-review. Diff taken from `a874d5948` (the tree v2 read) to HEAD: +157/−25 lines across seven
commits (`7493418b1`, `28b806205`, `9a08be0cb`, `047ba901f`, `c59eb73a5`, `1081b6f2f`, `64cb78029`).
v2 left one High (F-01, §7.4 clause (b)) and one Medium (F-02, §3.6's unpinned corpus promise).
**Both are resolved, and both fixes are the right shape.** I re-read only the changed sections and
re-executed every number the revision touched against the repository.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Process | §7.5 still carries the pre-correction sentence "The model **is built from the production line renderer** applied per record" (line 1063) immediately above the paragraph that forbids exactly that ("The model does not reuse the renderer, or the no-truncation conjunct would be an echo", line 1067). Two incompatible instructions for one oracle, and the wrong one is stated first. This is the **same failure mode as v2's F-01**: the round-1 fix added the correction (`4352d6d8c`) without deleting the sentence it superseded (`76f28dde4`) | §7.5:1063–1065 vs §7.5:1067–1076 |
| F-02 | Medium | Local | §7.3's new shipped-default assertion (D-10) is built over **the project-level-only block**, where nothing is omitted at all (6,305 + ≤1,200 = ≤7,505 < 8,000; 41 < `maxEntries` 70). Its third conjunct — `omitted[]` contains no `origin === "project"` id — is therefore **vacuously true for every possible drop order**, contradicting the stated purpose "what fails if a future change re-orders the drop loop so a project-level line goes first". The byte conjunct is sound; the order conjunct is not | §7.3:910–919, §3.6:420–428 |
| F-03 | Low | Local | §9.2's "The largest feature directory (`pdlc-headless-engine`, `M-6b`'s 63-line floor) would need **12,059** bytes to render whole" attributes to one feature directory a number that is project-level + that directory (41 + 22 = 63 lines; 6,305 + 4,553 + 1 = 10,859, + 1,200 framing = 12,059 — all four verified). The directory alone is 22 lines / 4,553 bytes | §9.2:1255–1258 |
| F-04 | Low | Local | §3.6 and ERR-2 both say ~495 bytes is "roughly **two** feature-level lines", now under a re-measured 152–261 range whose means are 183/191/206 — 495/183 ≈ 2.7. "Two" was the right word under the retired 137–160 figure; under the corrected one it reads as three at the mean, two only at the largest observed line | §3.6:411, §9.2:1253–1256 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | §7.3's census now excludes the `main()` wiring as a run between two new literal sentinel comments (`// === DECISION LEDGER WIRING START/END ===`). §2.3 depends on this feature's symbols landing **outside** the *learnings* sentinel region so PROP-DIS-06's `/\.enabled\b/` count stays live over them. The two regions are differently named and the learnings slicer matches its own literals, so I read this as safe — is that also your reading, and is it worth one sentence in §2.3 saying so, given a future reader may see "sentinel region" and assume the slice applies? |

## v2 findings — disposition

| v2 ID | Status | Evidence |
|---|---|---|
| F-01 (High) — §7.4 clause (b) still specified the non-hermetic `git merge-base origin/main HEAD` computed at test time, contradicting the corrected "Baseline identity" bullet | **Resolved** | Clause (b) (§7.4:1027–1033) now reads "asserted equal to a **hand-transcribed** `EXPECTED_MERGE_BASE_SHA` literal in the test file — never read from the manifest it is checking", keeps `--is-ancestor {recorded sha} HEAD` as the documented weaker second signal, and **names the excluded form and why**: a test-time `git merge-base origin/main HEAD` "makes a required check depend on the local `origin/main` ref being current, so it can red on an unrelated push to `main` and needs a fetch to be meaningful in CI". That is the shipped shape, matching `pdlc/workflows/__tests__/loopEconomicsBaselineGuard.test.js:239–253`, and the excluded-form sentence makes the clause proof against the next re-write |
| F-02 (Medium) — §3.6's "every reviewer receives the whole project-level corpus, always" was an unpinned, corpus-dependent promise | **Resolved, and over-delivered** | Three separate moves: the claim is hedged to what the mechanism actually does (the order "**prioritises** the promoted corpus … It does not *guarantee* the project-level set is admitted whole"); the residual fact is scoped to the Baseline commit and given a number ("at ~44 promoted records the headroom is spent"); and it is **pinned** by §7.3's shipped-default assertion with 6,305 transcribed, recorded as D-10 with the rejected alternative. The byte half of the pin is exactly the discharge I asked for. Its third conjunct is over-claimed — F-02 above |

**Q-01 and Q-02 both answered in place.** Q-01 ("does anything exercise C-5's shipped default?") is
answered honestly in the negative and then fixed: §7.6's fourth note states that nothing in the AT
table does — AT-01 is non-binding by construction, AT-13/AT-15 are chosen examples, §7.5 quantifies
over generated bounds — "which is why it is specified there rather than left to fall out of an
example". Q-02 is answered with the per-conjunct mutation table in §7.5, and the answer names the
reason the generator range alone did not discharge it ("a drop loop that stops one line late still
lands inside that range for most draws"). That is the right level of answer: it converts my question
into an implementer obligation rather than a reassurance.

## Every number in the revision re-executed

I re-derived the corrected measurements from the repository rather than reading them, since the
revision moved them and §3.6's safety argument now rests on them:

| Claim | Verified |
|---|---|
| Project-level set: 41 lines / **6,305** bytes under §4.3's format | 41 records recognised by §3.2's `DECISION_HEADING_RE` over `docs/_decisions/*.md` with §3.3's last-wins; rendered lines joined by `\n` total **6,305** bytes exactly |
| Project-level per-line **109–200**, mean **153** | measured 109 / 200 / 153 |
| Feature-level per-line **152–261**; means **183 / 191 / 206** for `pdlc-advisory-wave-gate` / `pdlc-engineering-loop` / `pdlc-headless-engine` | measured 170–191 mean 183 (n=4), 152–235 mean 191 (n=7), 169–261 mean 206 (n=22) — range and all three means exact |
| `M-6b`'s 63-line floor; combined 10,859; 12,059 with framing | 41 + 22 = 63; 6,305 + 4,553 + 1 = 10,859; + 1,200 = 12,059 |
| "~44 promoted records" spends the headroom | 8,000 − 1,200 − 6,305 = 495; 495 / 153 = 3.2 lines; 41 + 3 = 44 |

The v2 figure this round retired (137–160 bytes/line) was indeed wrong, and the replacement is right
to the byte. I could not falsify a single number in the revision.

## F-01 in detail — the one thing blocking approval

§7.5's argument against implementation echo is, on its merits, the best paragraph in the document.
It says (1067–1072) that building the expected line by calling the production line renderer would
make the no-truncation conjunct true by construction — "a wrong line *format* … would appear on both
sides of the comparison and the conjunct could never fail" — and concludes that the model "carries
its **own** formatter, transcribed from §4.3's stated format … and independent of production code".
I agree with all of it.

Four lines above it, the section still says the opposite:

> The model is built from the production line renderer applied per record, not from a
> re-implementation of the drop loop, so a bug in the loop cannot be mirrored into the oracle.
> — §7.5:1063–1065

`git log -S` places the two on either side of the round-1 fix: the sentence above is original §7
draft text (`76f28dde4`), the correction was added by `4352d6d8c` in response to v1, and the
superseded sentence was never deleted. So the section now instructs the implementer to do the thing
the next paragraph proves would make the property vacuous — and states it **first**, in the
paragraph that reads like the specification of the model, with the correction framed as commentary.

**Why this is High rather than a wording nit.** The whole value of O-8's property is that
three of its four conjuncts are cheap and one is load-bearing. If the model calls the production
renderer per record, the no-truncation conjunct is an identity comparison, the two bounds conjuncts
are satisfied by an empty block, and only the prefix conjunct survives — which is precisely the
failure §7.5 itself names. An implementer who follows line 1063 ships a green property that cannot
red on a wrong line format, and no reviewer of the resulting test can point at the spec and say it
was wrong: the spec said both things.

**The change that resolves it.** Delete the first clause and keep the second, which is correct and
is doing separate work:

> The model applies its **own** formatter (below) per record, not a re-implementation of the drop
> loop, so a bug in the loop cannot be mirrored into the oracle.

Nothing else in §7.5 moves: the own-formatter paragraph, the four-row mutation table and the
"transcribed from data, never captured from the code under test" close are all correct as written,
and all three already presuppose the own-formatter shape.

**The Process tag is the point.** This is the second consecutive round in which a fix was applied by
*adding* the corrected statement while the superseded one stayed on the page — v2's F-01 was §7.4's
clause (b) sitting under a corrected "Baseline identity" bullet, and this is §7.5's model sentence
sitting above a corrected own-formatter paragraph. Both were found by reading the section top to
bottom rather than reading the diff, which is the durable lesson: **a revision that corrects a rule
must delete the sentence it supersedes, and a re-review of a corrected section has to read the whole
section, not the hunk.** Worth carrying to harvest; the erratum-and-addendum authoring style this
pipeline encourages makes it a recurring hazard, not a one-off.

## F-02 in detail

D-10 is the right instrument and I am glad it exists. The concern is one conjunct of three.

§7.3 specifies the assertion as: "build the project-level-only block over the frozen fixture at
**C-5's shipped defaults** (`maxEntries: 70`, `maxBytes: 8000`) and assert three things — the
rendered index-line bytes equal the transcribed literal **6,305**; that value is `≤ maxBytes − 1200`;
and `omitted[]` contains no id whose `origin` is `"project"`."

On a project-level-only input at those defaults, **nothing is omitted under any drop order**: 41
records against `maxEntries` 70, and 6,305 index bytes plus ≤1,200 framing against 8,000. `omitted[]`
is empty whichever end the loop drops from, so the conjunct the section calls "what fails if a future
change re-orders the drop loop so a project-level line goes first" cannot fail — for that mutation or
any other. It is an absence assertion over a set that is empty by construction: the shape §7.3
otherwise polices well (its own non-empty-slice guard for the census exists for exactly this reason).

**The cheap fix keeps all three conjuncts and makes the third real.** Run the assertion over the
**whole** frozen fixture — project-level plus feature-level, which is what a real dispatch gathers —
at the shipped defaults. Then the bound genuinely binds, `omitted[]` is non-empty and populated with
feature-level ids, and "no `omitted[]` id has `origin === "project"`" becomes the direct executable
statement of §3.6's promise, red under a reversed drop order. The byte conjunct survives unchanged if
it is stated over the rendered **project-level** lines within that block (still 6,305, still
transcribed), which also keeps the drift tripwire pointed at the corpus rather than at the fixture's
feature half. Optionally add the positive counterpart — the set of rendered project-level ids equals
the fixture's 41, set equality, not containment — and the promise is pinned from both sides.

If instead the project-only build is deliberate (to keep the byte pin independent of feature-level
fixture churn), then say so and drop the `omitted[]` conjunct's stated purpose: a conjunct that
cannot fail should not be advertised as a falsifier, and the drop-order claim can rest on §7.5's
prefix conjunct alone, which does falsify it.

