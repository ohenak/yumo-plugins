# Cross-Review: test-engineer — DECISIONS

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/DECISIONS-pdlc-engine-distribution.md`
**Date:** 2026-08-13
**Iteration:** 2
**Scope:** Testing lens only, delta-scoped. Round-1 findings (TE F-01…F-08) verified as
resolved or not; only sections changed between `f8dfa56b` and HEAD re-read for new defects.
Unchanged sections already reviewed in v1 are not re-litigated.

## Round-1 finding disposition

Delta read: `git diff f8dfa56b..HEAD` over the document, eight commits
(`668483f1`…`8f3d6a1e`). Every re-derived cost claim the revision *added* was checked against
HEAD rather than accepted from the changelog.

| v1 ID | Sev | Status | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved** | §5 no longer claims the catalogue equality covers the branch. The new accounting is accurate at HEAD: `catalogue.test.js`'s `messageIds()` vs `Object.keys(MESSAGES)` deep-equal is module-against-itself (`pdlc/engine/__tests__/catalogue.test.js:71-74`), its header disclaims the cross-process equality (`:4-6`), and the biting one is `checkMessageCatalogue` (`_assert-suite-wide.mjs:196-210`) driven forward at `assert-suite-wide.test.js:165` and in reverse at `:183` — the reverse direction is correctly described as *an obligation to emit*, not as coverage. The two replacement assertions are positive in both directions (resolved root **is** the discovered one **and** the notice id **is** present; the `devDeclared: true` row asserts the variable **is** honoured), and both assert rendered text, not only the id |
| F-02 | High | **Resolved** | §7 now decides the signalled child rather than naming it: `status === null` → exit `128 + signum`, with the oracle asserting **equality with the decided value** and explicitly rejecting `!== 0` as non-distinguishing. That is the exact-value positive oracle the finding asked for, and the AC-1.4 collision (1 = crash, 2 = halt) is reasoned rather than asserted by fiat |
| F-03 | Medium | **Resolved** | §2 states AF-2's `prepack`-into-temp precondition inline and corrects Reversibility to "AF-1 remains correct; **AF-2 is deleted along with the vendor step**", with `TSPEC:256` and `TSPEC:1782` cited for both halves |
| F-05 | Medium | **Resolved, and upgraded** | The `vendor/`-git-ignored × `files`-allow-list interaction is now named in *both* §2 and §6, and §6 states the anti-erosion reason explicitly ("a cheaper way to satisfy the first reason silently removing the only cover for the second"). The revision went further than asked and *decided* the inclusion mechanism — see F-02 below for the oracle that decision now needs |
| F-06 | Medium | **Resolved** | §8's Reversibility is a three-row state table; row (c) is the corrupt-config-under-`doctor` composition, and §9's carve-out table gained the matching fourth row cross-referencing it. Row (c) is stated as observable behaviour (branch 0's parse-error text, the file named, store root, installed versions, exit 0) rather than as a policy sentence |
| F-07 | Low | **Resolved** | Header `Version` cell is `0.3`, changelog carries the `0.3` row |
| F-08 | Medium | **Resolved** | §3's AC-6.2 bullet now says **N-1**, cites `TSPEC:1948`, and names N-3 as BL-03's unrelated operator item so the next reader does not re-make the slip |
| Q-01 | — | **Answered** | §5 restates the trigger as an operator report and says so honestly, naming why no mechanical observation exists (no telemetry, NG-3) |
| Q-02 | — | **Answered** | §2's trigger now names the CI mechanism: AF-2's two-member set-equality turns red the moment a third vendored file lands |
| Q-03 | — | **Answered** | §8 row (a) compares the **two observed outputs** (launcher `--version` stdout vs the report's engine block), with the two-read-paths rationale and `bin/pdlc.mjs:323-325` cited |

New cost claims introduced by the revision, all re-derived at HEAD and all accurate:
`build-runtime.mjs:94-97` (four `readFileSync(resolve(HERE, …))` calls) and `:531-533`
(`QUEUE_SOURCES`/`DEV_SOURCES`/`CONS_SOURCES`); `MERGE_GUARD_DEFAULTS` with the literal
`"pdlc/workflows/"` at `orchestrate-dev.js:48-53`; the four-member set-equality at
`consolidationRoute.test.js:108-110`; the banner pin at `runtimeBundle.test.js:593-595`; and
the correction that `build-runtime.mjs:19` is a usage comment while `:48-49` is generated
banner text — both verified verbatim. The nine-import count is exact: three `node:` builtins
at `bin/pdlc.mjs:22-24`, six local modules at `:26-31`.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **The revision's own consistency pass missed §13's DEC-EDIST-09 row: the register still prices the rejected alternative at "six imports", the count §10 was corrected away from.** §10 now reads "**nine** static imports (`pdlc/engine/bin/pdlc.mjs:22-31`)" and the breakdown is exact at HEAD. §13's DEC-EDIST-09 row still reads "ESM static imports evaluate first, so **six** imports throw before its first statement". The v0.3 changelog claims the pass covered "§13's rows for DEC-EDIST-01 and DEC-EDIST-04" — DEC-EDIST-09 was not on that list, so the miss is systematic rather than a typo: the register was updated where a *decision* changed, not where a *cited count* changed. This matters for the same reason the revision itself gives in §12 for adding the O-8 note — "a reader consulting this table alone" is a supported reading mode, and the register is the surface a PLAN or PROPERTIES author transcribes from. A transcribed "six" re-seeds the wrong number into a downstream document where nobody re-derives it. **Fix:** set the DEC-EDIST-09 register row to nine, and add a changelog clause naming it so the correction is auditable rather than silent | §13 (DEC-EDIST-09) vs §10 |
| F-02 | Medium | Local | **The revision decided a new shipped artifact — `pdlc/engine/.npmignore` — and nominated no oracle that goes red if it is missing; PF-4 cannot be that oracle, by the entry's own argument.** §2 decides "the inclusion is made explicit rather than inferred — `pdlc/engine/.npmignore` is shipped for this one purpose, carrying a negation for `vendor/workflows/`", and §6 names PF-4's real pack as what "would catch that mechanism failing". PF-4 runs under exactly one npm major — the one on the CI runner. The entry's stated hazard is that precedence between `files` and an ignore-file fallback *has varied across npm majors*: on a runner whose npm resolves `files`-wins, deleting the `.npmignore` leaves PF-4 **green**, and the tarball breaks only on a consumer whose npm resolves the other way. That is the shape this document's own §13 closing principle rejects — an oracle that cannot detect the failure it is nominated against — and it is the identical defect v1 F-01 raised against §5, now reappearing one entry over, introduced by the fix to F-05. Note the asymmetry that makes it easy to miss: PF-4 catches the mechanism failing *on the tested npm*, which is real coverage, just not coverage of the cross-major guarantee the decision claims. **Fix:** two clauses, no redesign. (a) Nominate a repo-shape assertion in the AF-family — `pdlc/engine/.npmignore` exists and contains the `vendor/workflows/` negation — so the guard file's deletion is a red row rather than a silent one; a positive assertion on the file's content, not merely on its existence. (b) State plainly that PF-4 is single-npm-major evidence, so the cross-major claim rests on the shipped `.npmignore` and not on the pack test. Also needs an erratum against TSPEC: §5.2's repo-change set does not create this file and D-5 records the opposite (`TSPEC:151`) — raised below | §2 (DEC-EDIST-01), §6 (DEC-EDIST-05) |
| F-03 | Low | Local | **Read alone, §13's DEC-EDIST-05 row now tells a reader the opposite of what §2 and §6 decided.** The row's rejected-option cell says "An `.npmignore` deny-list — a forgotten entry **ships** what should not", and §6's heading is "A `files` allow-list, not an `.npmignore` deny-list". Both were true before this round and both are still true *as stated* — the rejection is of a deny-list *strategy*, and the shipped file is a negation, which §2 is careful to distinguish. But the register exists to be read without the body, and a future reader doing precisely the tidy-up this document keeps warning about ("`.npmignore` was rejected; why is one in the tree?") deletes the file that F-02 shows nothing catches. **Fix:** one clause in DEC-EDIST-05's register row — the allow-list governs the packed set; a one-line `.npmignore` negation ships solely to pin `vendor/workflows/`'s inclusion across npm majors, and is not a deny-list | §13 (DEC-EDIST-05) |

## Questions

| ID | Question |
|----|---------|
| Q-01 | §2's Reversibility now says AF-2 is deleted with the vendor step. Does the *reversal* then leave the two-file vendored set unasserted in any form, or is AF-1's tracked-ness reading intended to be the whole assertion in a repo that vendors nothing? The entry reads as the latter, which is right — a one-clause confirmation would close it, since a future reverser reading "delete AF-2" and nothing else may reasonably wonder what replaces it. |
| Q-02 | §7's `128 + signum` mapping is decided launcher-side. Is the fake target's self-kill signal in the nominated oracle fixed by the test (so the expected exit number is a literal transcription, e.g. SIGTERM → 143), or derived from the observed signal at assert time? Only the literal form avoids the implementation echo — deriving `128 + observed` passes even if the launcher and the test share a wrong mapping. |
| Q-03 | §5's assertion 2 covers `devDeclared: true` with the variable set. Is the fourth row of §6.5's table — `devDeclared: true`, variable **unset** — also asserted, or does the pair (1) + (2) leave the flag's no-op case to §6.5's own coverage? The entry names two rows of a four-row table as this decision's own, which may be exactly right; it is not stated either way. |

## Positive Observations

- **Both High findings were fixed at the level they were raised, not papered over.** §5 could
  have kept its conclusion and added a test sentence; instead it retracted the coverage claim
  in writing ("that was checked against HEAD and it is wrong in two ways"), explained the
  reverse direction as an *emitter obligation*, and named path-blindness as the specific
  reason registration is not coverage. §7 likewise did the hard half: it did not just promise
  a signal test, it **decided the number** (`128 + signum`) so the test has a literal to
  transcribe. A decision record that leaves the expected value undecided guarantees an
  implementation-echo oracle later; this one closed that door.
- **The oracle prose now rejects weak assertions by name, in the document's own voice.** "A
  positive assertion on the id, not 'no override was applied', which would also pass if the
  variable had never been set" (§5) and "a positive assertion on the exact number, not merely
  `!== 0`, since a passing `!== 0` would not distinguish the decided mapping from an accidental
  crash" (§7) are absence-only-oracle rejections written by the author rather than imposed by
  review. That is the standard propagating into the artifact, which is where it survives.
- **The relocation cost got *worse* under re-derivation, and the entry says so.** Three
  consumers became five, two of the original citations turned out to point at a comment and a
  generated banner, and consumer 4 — `MERGE_GUARD_DEFAULTS`'s literal `"pdlc/workflows/"` —
  is the one that does not go red but silently stops covering a path. Discovering that the
  rejected alternative is *more* expensive than first priced, and publishing the correction
  with a table, is the opposite of the usual drift; I re-derived all five and they hold.
- **Q-03's answer changed an oracle, not just a sentence.** §8 row (a) now compares launcher
  stdout against the report's engine block rather than each against the pinned literal, with
  the two-read-paths reason (`--version` reads the store entry's `package.json`; the block is
  built from `pkg.version` in the child, `bin/pdlc.mjs:323-325`). Comparing observed outputs to
  each other is strictly more falsifying than comparing both to a constant, and the entry now
  explains why in a form a test author can act on.
- **Row (c) is written as observable state.** "Prints branch 0's parse-error text, names the
  file, prints the store root and the installed versions, exit 0" is four conjuncts a test can
  assert, with the reason it exists (it is the only route out of branch 0) attached. The §9
  carve-out table's new fourth row closes the loop from the other side, so neither table can be
  edited into inconsistency without the other looking wrong.

## Recommendation

**Approved with minor changes** — no High findings remain.

Both round-1 High findings are resolved at the level they were raised: §5 retracted the
"covers it for free" claim and replaced it with two assertions that are positive in both
directions and cover rendered text, and §7 decided the signalled-child exit value instead of
naming signal handling and paying for two behaviours out of three. Every Medium is resolved
too, and each of the three round-1 questions is answered in the document rather than in a
reply — Q-03's answer changed an oracle's shape, which is the outcome a question is for.

The three findings here are all register-and-oracle bookkeeping on the *new* material, none of
them blocking. F-01 and F-03 are single-clause corrections to §13 rows the consistency pass
did not reach. F-02 is the one worth the author's attention: fixing round-1's F-05 introduced
a shipped artifact (`pdlc/engine/.npmignore`) whose absence no nominated oracle detects,
because PF-4 is single-npm-major evidence and the decision's claim is cross-major. It needs a
repo-shape assertion and a scope sentence, not a redesign — and it needs the TSPEC erratum
below, since §5.2 does not create the file and D-5 (`TSPEC:151`) records the opposite choice.

The revision did not break anything reviewed in round 1. The one pattern worth carrying
forward: a fix that *decides a new mechanism* inherits the obligation to nominate the oracle
for it, and both of this round's substantive findings are that same obligation, once met (§7's
`128 + signum`) and once missed (§2's `.npmignore`).

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 1}
