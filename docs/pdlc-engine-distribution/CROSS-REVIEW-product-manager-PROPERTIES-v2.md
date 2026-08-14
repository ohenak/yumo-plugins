# Cross-Review: product-manager — PROPERTIES

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-engine-distribution/PROPERTIES-pdlc-engine-distribution.md` (v0.3)
**Date:** 2026-08-14
**Iteration:** 2
**Scope:** Product lens only — requirements traceability, scope compliance, acceptance-criteria fidelity. Delta re-review against v0.2 (reviewed at `7858f1e3`); only the changed sections were re-read.

## Prior findings — disposition

`git diff 7858f1e3 HEAD` on the document is 62 insertions / 20 deletions across §1, §2.1, §2.2, §2.4, §2.5, §2.7, §3, §4, §5 and §7. Every changed row was re-read and every repository claim in it re-checked against HEAD.

| Prior | Severity | Status | Evidence |
|---|---|---|---|
| F-01 — `AT-1.1`/`AT-1.2`/`AT-1.3` mapped to properties about a different refusal axis | High | **Resolved** | New **PROP-LAUNCH-9** (`:88`) carries AT-1.1 with one positive conjunct per clause of FSPEC:646-649 — declared range verbatim, the exact literal `not found`, exit with the refusal code *plus* dispatch count `=== 0`, and a byte-identical consumer tree against a **non-empty** pre-state. §4's AT-1.1 row (`:276`) re-points to PROP-LAUNCH-9; PROP-LAUNCH-1 is re-traced to AC-5.5 and explicitly disclaims the handshake half; PROP-LAUNCH-4 (`:83`) gains AT-1.3's two plugin-handshake refusal states per PLAN T15(f) (PLAN:146, subitem (f) verified present). The new §2.1 paragraph "The two refusal axes are not the same axis" states the distinction the mapping now honours. Line citations check out: `handshake.test.js:113` is `assert.equal(out.pluginVersion, "not found")`, `:110-118` is the missing-plugin test pinning range/`not found`/`Remedy:`/`PDLC_PLUGIN_ROOT`. |
| F-02 — PROP-LAUNCH-2 stated on the engine pin, not the declared range | High | **Resolved** | PROP-LAUNCH-2 (`:81`) is restated on AT-1.2's actual subject — the *installed* plugin version against `pdlcPluginCompat` — and names the seam correctly: `checkCompat(engineCompatRange, pluginVersion)` is verified at `pdlc/engine/lib/handshake.mjs:144`. The row now says explicitly that this is **not** the T-5 consumer pin, which PROP-VER-5 carries, closing the duplication I raised. The cited HEAD anchor `handshake.test.js:120-126` is the out-of-range test and asserts version-found, range and `Remedy:`. |
| F-03 — AC-1.4's triple asserted only as a three-way equality | Medium | **Resolved** | PROP-LAUNCH-5 (`:84`) now pins each member by content — engine version against the packed manifest's `version` (T-1a), the range against `pdlcPluginCompat` (T-3), the plugin version against `readPluginVersion` or the literal `not found` — and states outright that "a triple of non-empty strings" is not the oracle. Three placeholders no longer pass. |
| F-04 — PROP-VER-14 rewrites shipped operator copy with no non-regression conjunct | Medium | **Resolved, and more accurately than I stated it** | PROP-VER-14 (`:200`) names the only HEAD assertions on `REMEDY`'s *content* (`handshake.test.js:116-117`, `:125`) and shows the new text keeps both substrings, so no unowned file reddens. I re-derived the file set: six `__tests__` files mention `PDLC_PLUGIN_ROOT` (`report-engine`, `startup-ladder`, `cli`, `exit-loop`, `handshake`, `skills`), so **five** besides `handshake.test.js` — the document's number, not my v1 "six", is right; my list wrongly included `startup`. `grep -rn REMEDY` over `pdlc/engine/` returns only `lib/handshake.mjs:131,164,177`, confirming the "none reads `REMEDY`" clause. The row also states the escalation path if a future wording drops a substring. |
| F-05 — `ci-arrangement.test.js` given an executed-only floor | Medium | **Resolved** | PROP-REGR-1 (`:234`) now carries the dual floor (≥ 6 executed from ≥ 2 sites) and §1's floor list follows. I re-measured: `node --test __tests__/ci-arrangement.test.js` reports `1..2` and `# tests 6` — exactly the stated numbers. The added counting-method clause (a site is a top-level `test(` call, excluding `.test(` regex predicates and comments) is also load-bearing and correct: `grep -c 'test(' __tests__/skills-composition.test.js` returns **20** at HEAD, as the row says. |
| Q-02 — is AC-1.5 manual-only? | — | **Answered** | §4 gains a paragraph stating PROP-PUB-9/PROP-PUB-10 as primary mechanical evidence and T52's `[manual]` record as confirmation on the real channel. That is the reading I said was correct; it now survives the round. |

## Findings

Two, both new, both in changed sections, neither blocking. No prior finding is re-opened and no unchanged section was re-litigated.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-06 | Low | Local | **PROP-LAUNCH-1's new home in AC-5.5 is a neighbouring criterion, not its own.** The re-trace (`:83`) moves PROP-LAUNCH-1 off AC-1.1 — correctly, that was F-01's fix — and onto AC-5.5. But AC-5.5 (REQ:427-429) is *"a pin naming a version that is not installed … refuses with a message naming **the pinned version and what is installed**"*, whereas PROP-LAUNCH-1 asserts the store-root path, the id `store.empty` and the exit code, for the different state *no version installed at all*. Neither of AC-5.5's two named conjuncts appears in the property. This creates **no coverage hole** — AC-5.5 is squarely carried by PROP-VER-5 (`:191`, which pins the requested version, the installed enumeration and `version.pin-missing`), and reinforced by PROP-VER-6, -9, -11 — so the criterion is not resting on this row. The residue is that the same mapping-looseness pattern F-01 named survives in miniature. *Fix (one clause):* trace PROP-LAUNCH-1 to **TSPEC §6.2 and DEC-EDIST-03/AC-5.5's neighbourhood** with a half-sentence saying it asserts the `store.empty` *precondition* state that AC-5.5's pin case sits downstream of, rather than presenting it as an AC-5.5 carrier. | AC-5.5, AC-1.1 |
| F-07 | Low | Local | **§4's "no `AT-` row" paragraph claims an observation the `AT-` table does not record.** The paragraph (`:311-313`) says PROP-LAUNCH-1 "is observed inside AT-5.5's and AT-1.3's legs on the same fixtures", but §4's AT-5.5 row (`:307`) lists PROP-VER-5, -6, -9, -10, -11 and not PROP-LAUNCH-1, and the AT-1.3 row (`:278`) lists PROP-LAUNCH-4 alone. A reader reconciling prose against table gets two answers. The table is the artifact that carries §4's set-equality against FSPEC §8, so it should not be edited casually — the cheaper fix is the prose. *Fix:* drop the "observed inside AT-5.5's and AT-1.3's legs" clause, or qualify it as *fixture* sharing rather than criterion coverage, which is what is actually true. | AC-5.5, AT-1.3, AT-5.5 |

## Questions

| ID | Question |
|----|---------|
| Q-03 | Two errata are raised to upstream documents from this round (see the trailer), both consequences of F-01's fix rather than defects in this document: PLAN T15's lettered work items now have no leg for AT-1.1's plugin-compat refusal (they cover (a)–(c) resolution states, (d) AT-1.2, (e) AT-1.4, (f) AT-1.3, (g) AT-1.6), and FSPEC AT-1.6 quotes the placeholder `"none"` where the shipped code and PROP-LAUNCH-5/-9 pin `not found`. Neither changes a property row here; both want a one-line upstream edit. Flagging so the author does not pre-emptively edit this document in response. |
| Q-04 | PROP-LAUNCH-9's fourth conjunct — byte-identical consumer tree against a non-empty pre-state — is the same oracle shape §3 gives a row to for `postinstall` (PROP-NEG-3). §3 makes no exhaustiveness claim, so this is not a finding, but is the omission deliberate (§3 audits only the properties whose *headline* is negative) or would a PROP-NEG row for AT-1.1's "no file changed" be worth its line? |

## Positive Observations

- **The blocking pair was fixed at the root, not papered over.** The easy response to F-01 would have been to add `AT-1.1` to PROP-LAUNCH-1's `Traces` cell and move on. Instead the document separated the two refusal axes explicitly, wrote a new property whose four conjuncts are a clause-by-clause transcription of FSPEC:646-649, and re-homed the displaced property. The added §2.1 paragraph even states *why* the distinction matters in product terms — "a property set that asserted only the second half while claiming AC-1.1 would report REQ-EDIST-01 as covered with nothing asserting G-1's central promise" — which is my finding's reasoning carried into the document so the next reader does not have to rediscover it.
- **Every repository claim added this round is true.** I checked all of them rather than sampling: `checkCompat`'s signature (`lib/handshake.mjs:144`), the four `handshake.test.js` line anchors (`:113`, `:116-117`, `:120-126`, `:125`), the `REMEDY` reader set (three uses, all in `lib/handshake.mjs`), the five-file `PDLC_PLUGIN_ROOT` list, `ci-arrangement.test.js`'s `1..2` / `# tests 6`, the `grep -c 'test('` → 20 gotcha, and PLAN T15(f)'s existence. Not one was approximate. The F-04 row is even *more* accurate than my v1 finding was.
- **The arithmetic was carried through consistently.** Adding one property touched five counts and all five moved together: §2.1 now holds 9 PROP-LAUNCH rows, §2 holds 89 (counted: PACK 12, VER 16, CAT 4, PROV 19, LAUNCH 9, INSTALL 8, PUB 10, GATE 5, REGR 6), §7's Unit is 74 (12+16+4+18+8+5+3+3+5), Integration 9, Machine 12, column sum 95. §4 still carries all 35 `AT-` rows, so the set-equality the changelog promised to preserve is preserved.
- **PROP-NEG-13 was updated for a change it was only indirectly affected by.** PROP-LAUNCH-4 going from three states to five would have left §3's falsifiability row quietly stale at "all three states"; the follow-through commit (`16b022b3`) caught it. That is the kind of second-order consistency that usually slips.
- **The changelog is an honest, itemised account.** Nine findings across two reviewers are each named with what changed and why, including the two Lows, and the entry states its own restraint — no settled decision re-opened, no task-graph or ownership-manifest change. A reader auditing this round does not need the diff.

## Recommendation

**Approved with minor changes** — both round-1 High findings are resolved, all three Mediums are resolved, and nothing in the revision broke anything.

Both blocking findings concerned the same defect: REQ-EDIST-01 was reported fully covered while nothing asserted AC-1.1's plugin-compat half. That is closed. PROP-LAUNCH-9 asserts AT-1.1 clause for clause against FSPEC:646-649 with no absence-only conjunct (the tree-identity check is paired with a non-empty pre-state; the "refused" check is paired with a dispatch count of `=== 0`), PROP-LAUNCH-2 is on AT-1.2's real subject with the seam verified in code, and AT-1.3's diagnostic states follow. The `AT-` set-equality, the requirement-coverage table and the level distribution all moved with the change.

The two remaining findings are Low and independent of each other:

1. **F-06** — trace PROP-LAUNCH-1 to the `store.empty` precondition state rather than presenting it as an AC-5.5 carrier; AC-5.5 itself is carried by PROP-VER-5, so this is wording, not coverage.
2. **F-07** — drop or qualify §4's "observed inside AT-5.5's and AT-1.3's legs" clause, which the `AT-` table does not corroborate.

Both are one-clause edits in §2.1 and §4 respectively. Neither touches a property's assertions, the task graph, the ownership manifest or any count. They can land in the same edit as any SE-side Lows from this round.

Separately, two upstream errata are raised on the trailer (PLAN T15's missing lettered leg for AT-1.1; FSPEC AT-1.6's `"none"` placeholder versus the shipped `not found`). Both are downstream consequences of this document's fix being right, and are for their own authors — this document should not absorb either.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 2}

APPROVAL-HASH: sha256:5742146d078c333fea6a5b6bc06025a94689e3fe1c674e117c05b3abc8a1d9bb
APPROVAL-HASH-NORMALIZED: sha256:cb107783b3c07753b48ec3c54888ab77f06aae23027b78a3cf8678aeed76789a
REVIEWED-COMMIT: 16b022b3702c74a91d2e825cbeca9452c9d68cc1
