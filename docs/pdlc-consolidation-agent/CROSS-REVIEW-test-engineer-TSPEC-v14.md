# Cross-Review: test-engineer — TSPEC (delta, round 14)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-consolidation-agent/TSPEC-pdlc-consolidation-agent.md
**Date:** 2026-08-10
**Iteration:** 14
**Scope:** Local — delta re-review of v2.4 only (`58ece0eb..HEAD`, TSPEC commits `5ce157d5`,
`ead10627`, `16d0754c`, `fd08df20`, `880c2cbe`). v13 was *Needs revision* on one High. This round
verifies the four v13 findings, re-measures every new mechanical claim against HEAD and against real
git, and reads only the sections v2.4 changed.

## 1. v13 findings status

| v13 | Subject | Status | Evidence at HEAD |
|---|---|---|---|
| F-01 (**High**) | The mandated `_git` double (`mergeDoubles.js`'s `fakeGit`) keys its script by subcommand, so §7.1's two `ls-files` reads answer identically, the `--deleted` set equals the enumeration set, the corpus is always empty, and AT-P1's conjuncts 2–3 red on correct code | **Resolved** | §11.2's `_git` row is re-pointed at `seams.js`'s `fakeGit` and a decision paragraph states why. Re-measured: `seams.js:389` accepts a **function** script `(args, index)` (`:406`), an **array** indexed per call with the last entry repeating (`:407-408`), a subcommand map (`:409-413`), and exposes `.invocations` (`:421`), `.calls` / `.commands` / `.callCount` (`:423-425`). `mergeDoubles.js`'s version does key on the subcommand after skipping `-C`/`-c` pairs (`:203-207`) and falls through to `{ok:true, stdout:""}` (`:209`), exactly as the document now says. Map form is ruled out for corpus **and** clone fixtures with the reason stated; the T-13 `asAsync(fakeGit)` inconsistency is reconciled in the same paragraph (`mergeDoubles.js`'s factory is `async` and returns `{calls, _git}`, `:193-211`) |
| F-02 (Med) | §13.1 row 6 presented a settled decision as erratum-pending and pinned a struck REQ line range | **Resolved** | Row 6 now closes with *"The round trip on this is closed, and this row records a settled shape, not a contingent one"*, naming REQ §3.1 step 1's withdrawal and FSPEC v11.6's re-scope. `grep` finds **zero** remaining `REQ-…:NNN` line pointers in the document — §12.3's widened citation rule is now satisfied by the whole file, not just by its newest rows |
| F-03 (Med) | Six hook locators were stale in the same revision that forbade line-index locators | **Resolved** | The document now carries exactly **one** `nudge-consolidation.sh:NNN` pointer (`:2171`, `CORPUS_GLOBS`, `:60-61`) and that one is accurate at HEAD. Every other locator is a symbol, and each symbol exists: `THRESHOLD` (`:25`, and the `n >= THRESHOLD` test `:81`), `region_split` (`:29`, used `:72`), `pending` (`:73`), `PDLC_PENDING:` (`:78`, over `sorted(set(…))` `:77`), the `PY_BIN` probe loop (`:14`) and its `[ -z "$PY_BIN" ] && exit 0` guard (`:20`), `proj` from `CLAUDE_PROJECT_DIR` (`:58`) — and "immediately above the `CORPUS_GLOBS` declaration" is literally true (`:58` then `:60`). §3.2's hook row is past-tense and agrees with §10.4 |
| F-04 (Low) | `ls-files` output order unspecified, no oracle said so | **Resolved** | §7.1 (`:860-865`) records the measurement (`--cached --others` returned the untracked path ahead of the tracked ones) and states that every corpus oracle is a **set** oracle; §11.1's real-git case is bound by it |

## 2. New claims in v2.4, measured

| # | v2.4 claim | Verification | Result |
|---|---|---|---|
| 1 | `seams.js`'s `fakeGit` can script two calls sharing a subcommand | read `pdlc/workflows/__tests__/helpers/seams.js:389-426` | **Confirmed**; function and array forms both discriminate by call index |
| 2 | `seams.js` keys its map on raw `args[0]` and does **not** skip `-C`/`-c`, so clone-domain tests must use the function form | `seams.js:409-413` vs. `mergeDoubles.js:200-207` | **Confirmed** — an accurate statement of the one respect in which the other helper is more convenient |
| 3 | The `unread:` field question is closed with a re-evaluation trigger rather than handed up | §13.3's rewritten bullet | **Confirmed** and well-formed: the trigger ("the same unreadable basename on two consecutive passes") is observable from the log the feature already writes, which is what DC-10-style reversibility asks for |
| 4 | §11.1's ignored fixture needs a build-order guard, asserted rather than assumed | scratch repo `/tmp/sc1`: `.gitignore` written before `git add -A` ⇒ `ls-files --cached --others -- ':(glob)docs/*/LEARNINGS-*.md'` returns the ignored member **and** the tracked one; `ls-files --error-unmatch` on the ignored path exits 1 | **Confirmed as a hazard, partly mis-specified as an oracle** — see F-01 |

## 3. Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **§11.1's new build-order guard names a `git status` invocation that reds on correct code.** The case is told to assert that the ignored path "is reported by `git status --ignored --porcelain` as ignored (`!!`)". Measured on a scratch repo built exactly as §11.1 describes it (`.gitignore` naming the feature directory, written before `git add -A`): `git status --ignored --porcelain` prints **`!! docs/ign/`** — the *directory*, collapsed — not `docs/ign/LEARNINGS-ign.md`. `--ignored=matching` prints the same collapsed directory. Only `git status --ignored --porcelain -uall` prints the file path (`!! docs/ign/LEARNINGS-ign.md`); `git check-ignore -v {path}` is the other exact answer (exit 0, naming `.gitignore:1`). A fixture author transcribing the sentence as written gets a red on a correct build, and the cheapest wrong repair is to delete the guard — which restores the wrong-reason-green this paragraph was added to escape. This is **not** blocking, because the paragraph's load-bearing premise is already carried by its *other* guard conjunct: absence from `ls-files --cached` is exactly the "not committed as a tracked file" premise, and it is correct as written. Repair is one flag or one command name | §11.1's L4 git case, ignored-member bullet |
| F-02 | Low | Local | **`ls-files --error-unmatch` is described as a listing to be absent from; it is an exit-status probe.** Same bullet: "appears in **neither** `ls-files --cached` nor `ls-files --error-unmatch`". Measured: `git ls-files --error-unmatch docs/ign/LEARNINGS-ign.md` writes `error: pathspec … did not match any file(s) known to git` to **stderr** and exits **1** — its result is a status, not an empty set. The intended assertion is sound; only its spelling would confuse an author writing the conjunct as a membership check against stdout. State it as "exits non-zero" | §11.1's L4 git case |
| F-03 | Low | Local | **§11.2's function-form pointer is two lines off.** The row cites the per-call function form at `seams.js:404`; at HEAD `:404` is `const index = git.invocations.length;` and the function branch is `:406` (`value = script(args, index)`), inside the `if (typeof script === "function")` at `:406`. The array (`:406-408` cited, `:407-408` actual) and map (`:409-413`) ranges overlap correctly and the records range (`:421-426`) is right. Cosmetic, but this document holds itself to precise pointers and the surrounding paragraph is the one an implementer will read most literally | §11.2's `_git` decision paragraph |

## 4. Questions

| ID | Question |
|----|---------|
| — | None. F-01 supplies two measured alternatives rather than asking which is wanted. |

## 5. Positive Observations

- **F-01 (v13) was repaired at the level it was raised, not below it.** The fix is a decision
  paragraph — which double, why the other cannot express the mechanism, which script forms are
  admissible for which fixture families, and why the map form is *ruled out as a rule rather than a
  preference*. No factory was added, no shipped helper widened, and the T-13 `asAsync` commitment
  that was quietly inconsistent with the old row is reconciled in the same breath. Every mechanical
  claim in it survived independent reading of both helpers.
- **The `unread:` question closed with a falsifiable trigger instead of a hand-off.** "No field, and
  here is the observation that would reverse the answer" is a better artifact than either minting the
  field or leaving it open a sixth round — and the reasoning is honest about *why* the class shrank
  (the `--deleted` subtraction removed the routine population, leaving transient faults).
- **The build-order guard is exactly the right instinct.** "A fixture whose premise is untested is an
  oracle that reports on the fixture rather than on the code" is the sentence this round should be
  remembered for; F-01 above is a flag on one command, not a disagreement with the reasoning.
- **The citation sweep is complete, not partial this time.** Zero `REQ-…:NNN` pointers, one hook line
  pointer and it is accurate, every symbol anchor present at HEAD. The previous two rounds each left
  a residue; this one did not.

## 6. Recommendation

**Approved with minor changes**

No High. The v13 blocker is genuinely closed — the mandated double can now express the two-read
subtraction, so AT-P1's conjuncts and every L2 corpus fixture are runnable against a correct
implementation. The three findings here are one mis-specified `git status` flag, one loose spelling of
an exit-status probe, and a two-line pointer drift; all three are inside the paragraphs v2.4 added,
none changes a decision, and none is worth another round on its own. Fix them in the pass that writes
the PLAN tasks for §11.1.

## 7. Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 2}
