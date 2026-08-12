# Cross-Review: test-engineer — DECISIONS

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-headless-engine/DECISIONS-pdlc-headless-engine.md` (v1.6)
**Date:** 2026-08-11
**Iteration:** 5

**Scope:** Delta re-review only. `git diff f6634427^..f6634427` on the document is the whole
change surface since v4: the header/§0 upstream pin, the v1.6 change note, DEC-ENG-05's rule
blockquote and census paragraph, DEC-ENG-13's boundary paragraph, and the §8 DEC-ENG-05 row.
Sections already approved are not re-litigated. Every claim below is grounded at HEAD on
`feat-pdlc-headless-engine` with `file:line`.

## Round-4 disposition

| Prior finding | Severity | Status | Evidence at HEAD |
|---|---|---|---|
| F-01 (DEC-ENG-05 transcribed TSPEC v1.7's superseded rule and a 47-site census) | **High** | **Resolved** | The blockquote now states **three outcomes** — literal/module-constant resolves, **indirect dispatch is neither a site nor a failure**, and only a class 3/4 position that is neither syntactic form *and* not indirect is a failure (`DECISIONS:432-446`). That is a faithful transcription of TSPEC §3.3 at v1.8 (`TSPEC:26-36`, `:570-591`). The census now reads **7 / 28 / 1 / 12 = 48 direct plus 11 indirect** and names **TSPEC §3.3 as the enumeration of record**, citing rather than restating (`DECISIONS:466-472`). The twelfth direct site checks out: `const ADVISORY_RUNG_SKILL = "se-review"` (`orchestrate-dev.js:1797`) dispatched as `_agent(ADVISORY_RUNG_SKILL, prompt, { model })` (`:1841`) — a module-level constant reference, a site under the rule and not an omission. The eleven indirect positions are real and correct at HEAD: `skill: reviewers[0]`/`[1]` (`:5909`, `:5910`), `skill: authorSkill` (`:9288`), `skill: dispatch.creator` (`:9528`), and seven variable-argument dispatches (`:5573`, `:5579`, `:5585`, `:5876`, `:7124`, `:7463`, `:9244`). Under the v1.5 wording each of these was a *failure*; under v1.6 none is. The guard is no longer red on correct code. |
| F-02 (§8 row listed five members under a "four enumerated site classes" quantifier) | Medium | **Resolved** | The row now enumerates exactly four, numbered, with the `DISPATCHABLE_SKILLS` member declaration folded into class 1 where it is in fact declared (`DECISIONS:975`). Set-equality against TSPEC §3.3's four classes (`TSPEC:571-579`) holds member-for-member, and the row carries the class 3/4 argument restriction and the separate indirect count. |
| F-03 (DEC-ENG-13's exemption stated as a predicate with no pinning rule for the two oracle-bearing strings) | Medium | **Resolved (with one residue, F-01 below)** | The paragraph adds "**Catalogue-free is not assertion-free**", names both strings as oracle-bearing under DEC-ENG-10, and requires the expected text pinned **once beside the runner in `_run-suite.mjs`** with both assertions matching that definition rather than duplicating a literal per test (`DECISIONS:865-870`). The gap the finding named — nothing said where the expected text lives — is closed. |
| F-04 (v1.5 pinned TSPEC v1.7 while HEAD was v1.8) | Low | **Resolved** | Header table and §0 both read TSPEC **v1.8** (`DECISIONS:9`, `:92`), matching `TSPEC:16`. The v1.6 change note states the pin move explicitly. |

All four round-4 findings are closed, including the High. Nothing in the revision reverses a
decision or re-opens a rejected alternative — the diff touches only the rule and the numbers the
test copies, which is what the fix was scoped to.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Cross-Feature | **DEC-ENG-13's new pinning clause is readable as an implementation echo, and the wording does not say which side of the seam the expected text is transcribed from.** "PLAN pins their expected text **once, beside the runner in `_run-suite.mjs`**, and both assertions match that single definition exactly" (`DECISIONS:866-869`) most naturally reads as: export the strings from `_run-suite.mjs`, import them into the tests. A test that imports its expected value from the module under test cannot fail on a wording change — both sides move together — which is the echo the review contract forbids. The oracle does not collapse entirely (what proves the detector fired is *which* line appears, not its wording, and DEC-ENG-13 has just exempted these strings from operator-visible catalogue status), so this is not the falsifiability loss the paragraph is defending against — hence Medium, not High. But PLAN will implement whichever reading it finds first, and the two readings differ in what the test can catch. One clause settles it: state that the strings are pinned as a constant *and* that the assertions' falsifiable content is line presence under the two run modes, not the wording — or, if the wording is meant to be pinned, transcribe it in the spec and let the test carry the literal. Cross-Feature because "pinned once beside the code, imported by the test" is a shape that recurs whenever a diagnostic doubles as an oracle. | DEC-ENG-13, DEC-ENG-10 |
| F-02 | Medium | Local | **The rule now has three outcomes, but only two of them have a namable fixture — the failure outcome is defined by exclusion and no concrete failing form is given anywhere in the chain.** The blockquote closes with "only a class 3/4 position that is neither of those two syntactic forms *and* is not indirect dispatch is a **failure**, never a skip" (`DECISIONS:443-445`); TSPEC §3.3 says the same by exclusion (`TSPEC:26-36`). Literal, module-constant, parameter, local and member expression are all now accounted for as *non*-failures, so the residual set is real but unnamed — a call expression (`_agent(pickSkill(), …)`), a template literal, a conditional expression. A red fixture for the failure branch is what stops "cannot resolve ⇒ failure" from being dead code that no test ever enters, and PROPERTIES needs to name one form to write that row. Naming one example in the entry (or asking TSPEC to name it) is a sentence and removes a guess from the test author. Not gating: the decision is unaffected either way and the omission predates this round's edit, but it is now the only outcome of the three without an observable. | DEC-ENG-05 rule blockquote |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Answered from my side, recorded rather than asked again: v4's Q-01 proposed that DECISIONS cite TSPEC §3.3 rather than hold a second copy of figures that move each round. v1.6 does exactly that (`DECISIONS:466-468`), and this round's desync therefore cannot recur through this document. The remaining copy is test-side, which is where the census is meant to be transcribed (`TSPEC:591`). |
| Q-02 | Carried from rounds 2–4, still open, still not blocking: whether a mis-built hook path yields an explicit `allow` verdict or an execution error (DEC-ENG-11's mis-built-configuration arm), and whether DEC-ENG-04's red fixture reads the running platform/transport pair or in-process fixture data. Both become unavoidable when PROPERTIES rows are written; neither changes a decision here. |
| Q-03 | Not a finding against this document, and filed as an erratum instead: TSPEC v1.8 still pins **FSPEC v1.6** (`TSPEC:9`) and its changelog raises the BR-START-1 "no probe of any kind" erratum as outstanding (`TSPEC:21`, `:2448-2452`), but FSPEC landed that fix at **v1.7** — "no *billable* probe of any kind" — at 17:07, six minutes after TSPEC's last commit at 17:01. DECISIONS is correct on both pins (FSPEC v1.7, TSPEC v1.8, `DECISIONS:9`), so a reader following the chain downward hits the staleness one layer below this document, not in it. |

## Positive Observations

- **The fix disambiguated the two elevens instead of quietly reusing the number, and the
  disambiguation is true at HEAD.** The cost paragraph now says the eleven bare literals are "the
  pre-edit **class-4 literals** this feature replaces with constants, a different set from the eleven
  **indirect-dispatch positions** the census counts separately" (`DECISIONS:428-431`). I counted both
  sets independently: the scanner alternative's literals are `ship-pr` (`:8008`, `:8112`),
  `dod-verify` (`:8035`), `se-implement` (`:8064`, `:10028`, `:10068`, `:10142`, `:10251`),
  `se-author` (`:9964`, `orchestrate-queue.js:1216`), `harvest-learnings` (`:10542`) — eleven, all
  string literals; the indirect eleven are the parameter/member-expression positions listed above,
  and the two sets are disjoint. Two different elevens sitting a page apart is precisely the
  coincidence that produces a wrong test literal, and the entry now blocks it in prose.
- **The census moved from a restatement to a citation, which retires the failure mode rather than
  fixing this instance of it.** "TSPEC §3.3 is the enumeration of record and the figures are
  normative there, not here" plus "a later re-measurement is a TSPEC edit and not a DECISIONS round"
  (`DECISIONS:466-472`) is the structural answer to a number that has now moved twice in two rounds.
  The decision the entry actually owns — containment conjoined with a census so it cannot pass
  vacuously — is stated separately and survives any recount.
- **The indirect-count assertion turns a disappearance into a movement, and the entry says so in
  oracle terms.** "A direct site rewritten to dispatch through a variable moves one count from the
  direct total into the indirect one rather than vanishing from both" (`DECISIONS:473-475`) is the
  right shape: without the second count, converting a site to indirect dispatch would silently
  shrink the extraction and containment would pass over less code with no test going red.
- **DEC-ENG-13's boundary now carries a positive obligation, not just an exemption.** The earlier
  paragraph said only what the two strings are *not* (catalogue members). "Catalogue-free is not
  assertion-free" (`DECISIONS:865`) restores the positive half, and names both directions of
  DEC-ENG-10's pairing as what the strings prove. F-01 above is about how the pin is implemented,
  not about whether the paragraph is right to demand one.

## Recommendation

**Approved with minor changes**

The round-4 High is resolved at its root, not patched. DEC-ENG-05's rule blockquote now carries
TSPEC v1.8's three-outcome resolution verbatim in substance, the census reads 7 / 28 / 1 / 12 = 48
direct plus 11 indirect with TSPEC §3.3 named as the normative home, and I re-derived both the
twelfth direct site (`orchestrate-dev.js:1797`, dispatched `:1841`) and all eleven indirect
positions against HEAD rather than against the spec. A test written from this document is now green
on correct code, which is the whole content of the finding. The three carry-forwards are closed too:
the §8 row enumerates four classes under its four-class quantifier, DEC-ENG-13 says where the
runner's diagnostics are pinned, and the upstream pin reads TSPEC v1.8.

Two Medium findings remain, neither gating and both one clause each. F-01: state which side of the
seam DEC-ENG-13's pinned strings are transcribed from, so PLAN does not write a test that imports its
expected value from the module under test. F-02: name one concrete failing form for the rule's third
outcome, so the failure branch has a red fixture instead of being defined only by exclusion.

One erratum is raised against TSPEC and is emitted in the dispatch message rather than folded here:
TSPEC v1.8 pins FSPEC v1.6 and still records the BR-START-1 probe erratum as outstanding, but FSPEC
landed that fix at v1.7 six minutes after TSPEC's last commit. DECISIONS itself pins both upstreams
correctly and needs no edit for it.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 0}
