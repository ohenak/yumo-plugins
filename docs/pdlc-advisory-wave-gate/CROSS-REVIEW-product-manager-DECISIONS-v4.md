# Cross-Review: product-manager — DECISIONS

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-advisory-wave-gate/DECISIONS-pdlc-advisory-wave-gate.md (v1.2)
**Upstream re-read:** docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md (v1.10, HEAD)
**Date:** 2026-08-19
**Iteration:** 4 (delta re-review)

## Scope

Delta re-review of the five v3 findings and of the six commits that landed them
(`c35fef8d`, `76ae0225`, `1a082d48`, `54e979ac`, `f13bf956`, `9a569157`), taken as
`git diff b06db2c0 HEAD` on the document — 110 changed lines, four decisions untouched in
substance. I re-read my v3 cross-review, then verified every factual claim the round added
against the repository at HEAD rather than against the documents that assert it: TSPEC v1.10's
§1.1 O-8 row, §1.3, §4.4, §4.5, §5.1, §5.2, §5.6; `defaultGit` in `pdlc/workflows/orchestrate-dev.js`;
the envelope and seam literals under `pdlc/workflows/__tests__/`; `.claude/pdlc.config.example.json`;
and `pdlc/engine/__tests__/`. I did not re-litigate anything settled in rounds 1–3.

All five v3 findings are resolved. What the round did not do is re-ground the document's
*present-tense claims about the repository* the way TSPEC v1.10 §1.3 and §5.1 re-grounded theirs.
Three of the round's own edits state a repo fact that was true before this branch's early-landed
test edits (`e3b9d5a3`) and is false at HEAD, and one bullet now contradicts itself about where an
engine expectation belongs — naming the file upstream explicitly rules out.

## Verification performed (measured at HEAD)

| Claim in the round's edits | Measured | Verdict |
|---|---|---|
| Upstream pin `TSPEC … v1.10` | `TSPEC…md:12` reads `1.10` | holds |
| O-8 row quoted verbatim, cites DEC-A6-02's rejected option A | `TSPEC…md:262` matches the quote word for word, including "the rejected option A of `DECISIONS-pdlc-advisory-wave-gate.md`'s DEC-A6-02" | holds |
| §4.5's snapshot-ref row qualifies "never overwritten" as asserted on a two-red-wave run | `TSPEC…md:1225` | holds |
| §5.2 carries the two-A6-wave `update-ref` set-equality fixture | `TSPEC…md:1437-1444` | holds |
| §5.2 carries the enabled-tier `waveBudgetPerRun: 0` behaviour arm with the present-and-zero conjunct | `TSPEC…md:1427-1436` | holds |
| `defaultGit` runs `execFileSync("git", args, { stdio: "pipe", encoding: "utf8" })` with no `input` | `pdlc/workflows/orchestrate-dev.js:11658-11668` — exact | holds |
| A `-m`-less `commit-tree` exits `0` with an empty message rather than failing | Run against real git in a scratch repo: `git commit-tree {tree} -p HEAD </dev/null` → exit `0`, object printed, `cat-file commit` shows a blank message body | holds (measured, not reasoned) |
| Example config carries exactly `dispatch` and `implementation`, no `advisory` | `json.load(...).keys()` → `['dispatch', 'implementation']` | holds |
| `ci-arrangement.test.js` contains zero occurrences of `advisory` | `grep -c advisory` → `0` | holds |
| §5.1 assigns the expectation to a new file `advisory-config-example.test.js`, not `ci-arrangement.test.js` | `TSPEC…md:1330` | holds |
| The four-member envelope literal is transcribed at six code sites, one of them `advisoryEnvelope`'s `ENVELOPE_DEFAULTS` set-equality | Five sites carry it (`advisoryDisabled.test.js:136,623`; `advisoryHarvest.test.js:203`; `helpers/advisoryDoubles.js:325,423`). `advisoryEnvelope.test.js:284` now transcribes the **six**-member `{E-1…E-6}`, and `advisoryConfig.test.js:51` carries an unnamed sixth transcription | **fails** (F-03) |
| The engine-channel expectation is work to be authored | `pdlc/engine/__tests__/advisory-config-example.test.js` is on disk at HEAD (57 lines, `e3b9d5a3`), red pending the example section — as TSPEC §5.1's status caveat (`TSPEC…md:1305-1311`) records | **fails** (F-02) |
| `TSPEC §7`'s test-mapping row for AT-04-5 | TSPEC v1.10 has sections 1–6 only; the row is `TSPEC…md:1659` in §5.6 | **fails** (F-05) |
| `§5.5`'s argv-sequence oracle (`commit-tree === 1`, `update-ref`) | That oracle is §5.2's (`TSPEC…md:1383`, `:1419`); §5.5 (`:1520-1611`) carries the prohibition table and the fixed `diagnosis` comparison | **fails** (F-06) |

## Prior findings (v3) — disposition

| v3 ID | Disposition | Evidence |
|---|---|---|
| F-01 DEC-A6-02 quotes superseded O-8 text | **Resolved** (`54e979ac`) | The supersession paragraph now reads "Upstream now states this shape, and cites this entry for the rejection", quotes v1.10's row verbatim, and closes "What remains is one, not two". Verified against `TSPEC…md:262` |
| F-02 DEC-A6-03 "stated but not falsifiable" | **Resolved** (`76ae0225`) | Now "is falsifiable at TSPEC v1.10", citing §5.2's two-red-wave set-equality and §4.5's qualified row. Both verified |
| F-03 DEC-A6-04 "no AT falsifies the collapse … passes the suite" | **Resolved** (`f13bf956`) | Now "The collapse is falsified upstream at TSPEC v1.10", transcribing the arm's conjuncts including present-and-zero. Verified against `TSPEC…md:1427-1436` |
| F-04 upstream pin stale at v1.5 | **Resolved** (`c35fef8d`) | Pin reads v1.10 — ahead of the v1.6 I asked for, and correct for HEAD. The cross-review list also gained v2/v3 for both reviewers |
| F-05 "mirrors the same claim in §7" | **Resolved** (`f13bf956`) | The parenthetical is gone from DEC-A6-04. A *different* §7 citation survives in DEC-A6-02 and is recorded below as F-05 (new) |

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Local | **DEC-A6-04's consequence bullet still opens by assigning the engine expectation to `ci-arrangement.test.js`, the one file upstream rules out — and then, four sentences later, rules it out itself.** Line 294 reads "`.claude/pdlc.config.example.json` gains the key, and `pdlc/engine`'s `ci-arrangement` test **must gain a new expectation over it**"; line 302 (added this round) reads "§5.1's file-ownership map assigns the expectation to a **new file**, `pdlc/engine/__tests__/advisory-config-example.test.js` — deliberately *not* to `ci-arrangement.test.js`". Both sentences are in the same bullet. The round appended the correction without retiring the directive it corrects, and the directive is the sentence an implementer acts on first. It is not a harmless duplicate: `TSPEC…md:1330` states the product cost of following it — "a config-schema assertion parked there would let an unrelated example edit redden the delivery-blocking `Engine tests (ubuntu-latest)` check under a scope that names no such concern". A record whose lead sentence directs work into a shape upstream explicitly rejected is the same defect class as v1's O-8 problem, which this document itself escalated. Rewrite line 294 to name the channel, not the file — "`pdlc/engine` must gain a new expectation over it, in a file of its own (below)" — and leave the `ci-arrangement` mentions where they belong, as the *evidence* that nothing moves | REQ C-2, FSPEC E-33; TSPEC §4.4/§5.1 |
| F-02 | Medium | Local | **The same bullet's engine-channel premises are measured against a pre-branch repository and are false at HEAD.** Lines 299–301 say the second channel's work "is *authoring a new expectation*" and that adding the key "requires no engine edit to stay green". At HEAD `pdlc/engine/__tests__/advisory-config-example.test.js` is already on disk (57 lines, landed in `e3b9d5a3`) and already **red**, precisely because the example carries no `advisory` section — so the expectation has been authored and the engine channel is currently the thing waiting on the config edit, not the other way round. TSPEC v1.10 re-grounded on exactly this and says so in its status caveat (`TSPEC…md:1305-1311`: "both on disk, the latter red because `.claude/pdlc.config.example.json` carries no `advisory` section at HEAD"); this document did not. The *decision* is unaffected and the product reason for the affordance still stands — restate the two premises in the tense HEAD supports, and cite §5.1's caveat rather than re-deriving the state | REQ C-2, FSPEC E-33 |
| F-03 | Medium | Local | **The envelope hand-sync enumeration added this round is not set-equal to the repository it enumerates.** Lines 341–348 name six code sites for the four-member literal `["E-1", "E-2", "E-3", "E-4"]` — "`advisoryEnvelope`'s `ENVELOPE_DEFAULTS` set-equality, two in `advisoryDisabled`, one in `advisoryHarvest`, and two in `helpers/advisoryDoubles.js`" — plus a seventh in prose. Measured at HEAD, five of the six hold (`advisoryDisabled.test.js:136,623`; `advisoryHarvest.test.js:203`; `helpers/advisoryDoubles.js:325,423`) and the prose site holds (`helpers/advisoryDoubles.js:317`). The named `advisoryEnvelope` site does not: `advisoryEnvelope.test.js:284` now transcribes `["E-1", … , "E-6"]`, having moved in `e3b9d5a3`. And an unnamed site exists: `advisoryConfig.test.js:51` re-declares `ADVISORY_DEFAULTS` with its own envelope literal — TSPEC §1.3 lists it (`TSPEC…md:304`, `:325`), this enumeration does not. This paragraph's whole job is to size a task against its counterparts (PM F-02's lineage), and an enumeration that names one moved site and omits one live one invites the partial edit the set-equality discipline exists to catch. Re-derive the list from HEAD, or state it as the pre-`e3b9d5a3` baseline and point at TSPEC §1.3 for the current split. The "seven, not six" correction the round was landing (TE v2 F-03) is right in kind and should survive the re-derivation | Traceability (Team Principle 3); TSPEC §1.3 |
| F-04 | Low | Process | **`e3b9d5a3` is titled "docs(cross-review): se REQ v7 — High findings" and carries A6 test-side implementation edits plus ~168k lines of `.pdlc-backups`/bundle output.** The early-landed edits themselves are known and routed — TSPEC §1.3 and §5.1 record them and leave the revert-or-re-derive call to PLAN — but nothing records that they reached the branch under a commit message describing a cross-review document. That is the reason three claims in this round's edits went stale unnoticed: `git log` on the docs path does not reveal that the repository moved underneath them. Worth a harvest note on commit-message fidelity for doc-phase rounds; no edit to this document is requested | — |
| F-05 | Low | Local | **DEC-A6-02's reversibility paragraph cites "TSPEC §7's test-mapping row for AT-04-5"; TSPEC v1.10 has no §7.** Line 174. The claim is correct and the row exists — `TSPEC…md:1659`, in §5.6 "Every FSPEC acceptance test has a home", identifying the promotion commit "by the `message` literal and its pathspec" — so only the pointer is wrong. It matters slightly more than an ordinary typo because the sentence's point is that the caveat rests on *that specific* oracle. Repoint to §5.6 | — |
| F-06 | Low | Local | **DEC-A6-01's rewritten paragraph attributes the capture argv-sequence oracle to §5.5; it is §5.2's.** Line 122: "§5.5's oracle is an **argv-sequence** assertion over the `_git` double's recorded argv (`commit-tree === 1`, plus an `update-ref` on the snapshot ref)". At HEAD that oracle is stated at `TSPEC…md:1383` and `:1419`, both inside §5.2; §5.5 (`:1520-1611`) owns the prohibition/paired-positive table and the fixed `diagnosis` comparison. Inherited pointer, carried through a sentence the round otherwise rewrote correctly. Repoint to §5.2 | — |
| F-07 | Low | Local | **The version bump moves the date backwards.** Line 12 reads `1.2 | 2026-08-19`; v1.1 was dated `2026-08-20`. One of the two is wrong (today is 2026-08-19, so v1.1's is the likelier error), but as it stands the header says revision 1.2 predates revision 1.1, which is exactly the provenance a re-read months later leans on. Reconcile both rows in one edit | Traceability (Team Principle 3) |

## Questions

| ID | Question |
|----|---------|
| Q-01 | TSPEC §5.1's status caveat leaves "whether the early-landed edits are reverted or PLAN's batches are re-derived around them" to PLAN. Whichever way that lands, DEC-A6-04's engine-channel bullet and the whole-feature sizing paragraph are the two places in this record that assert repo state, so both will need one more pass after PLAN decides. Is the intent that this document re-grounds now (F-02/F-03 as written) and again after PLAN, or that it points at TSPEC §1.3/§5.1 as the single carrier of repo state and stops asserting it itself? I would prefer the second — it removes a whole class of staleness from a record whose value is that it stays readable for months — but the choice is the author's and either is coherent. |
| Q-02 | The four decisions are unchanged in substance this round, and I re-verified each against v1.10: DEC-A6-01's dangling-commit capture, DEC-A6-02's separate `commitPaths` call, DEC-A6-03's wave-scoped ref, DEC-A6-04's `nonNegativeInt`. No rejected option became reachable. Flagging only that OQ-7 remains the one live upstream dependency this document is exposed to, unchanged since v3. No action requested. |

## Positive Observations

- **The `-m`-less `commit-tree` correction is the strongest thing in this round.** v1.1 said the
  omission would *block* against the argv-only transport; that was a plausible-sounding claim nobody
  had run. The rewrite replaces it with a measured one — empty stdin, exit `0`, a valid commit with
  an empty message — and then draws the product consequence, which is the one that matters: the
  operator who later opens `refs/pdlc/a6-snapshot-{waveNum}` finds an object with nothing on it
  saying which wave it belongs to. I re-ran it against real git and it reproduces exactly. Trading a
  loud-failure story for a silent-corruption story is a strictly better record, and admitting v1.1
  was wrong in the same sentence is what makes it trustworthy.
- **The three closure edits are honest in both directions.** Each of DEC-A6-02, -03 and -04 now says
  what it claimed, that the claim was routed upstream, and that it landed — rather than quietly
  deleting the old text. "This entry's v1.1 revision recorded the rejection as 'stated but not
  falsifiable' … It landed" preserves the reasoning trail a later reader needs to judge whether the
  closure is real. That is the difference between a record and a changelog.
- **The pin overshot my ask in the right direction.** I asked for v1.6; the round pinned v1.10 and
  re-verified against it, which is why F-01–F-03 of v3 could be closed with citations that still
  resolve four TSPEC revisions later.
- **Every finding below High is a pointer or a count, not a decision.** After four rounds the four
  decisions have not needed a substantive correction since v1.1. The residue is bookkeeping on a
  document that has been right about mechanism throughout.

## Recommendation

**Needs revision** — one High finding (F-01).

The four decisions remain a faithful compression of TSPEC v1.10: no rejected option became
reachable, no chosen mechanism lost its upstream basis, and the three closure edits this round
landed are accurate where I could check them against upstream *and* against the code. What blocks is
narrower and specific: DEC-A6-04's consequence bullet still opens by telling an implementer to hang
the example-config expectation on `ci-arrangement.test.js`, which upstream rules out by name and for
a stated delivery-blocking reason, and only rules it out itself four sentences later in text this
round appended. A reader who acts on the first sentence does the thing TSPEC §5.1 was corrected to
prevent.

Exactly what to change:

1. **F-01 (blocking)** — line 294: replace "`pdlc/engine`'s `ci-arrangement` test must gain a new
   expectation over it" with a channel-level statement ("`pdlc/engine` must gain a new expectation
   over it, in its own file — below"), keeping the later `ci-arrangement` sentences as evidence and
   as the explicit non-home.
2. **F-02** — lines 299–301: restate the engine-channel premises in the tense HEAD supports (the
   expectation is authored and red pending the example section) and cite TSPEC §5.1's status caveat
   rather than re-deriving repo state.
3. **F-03** — lines 341–348: re-derive the envelope enumeration from HEAD (five four-member code
   sites, plus `advisoryConfig.test.js:51`, plus the `advisoryDoubles` prose site), or label it as
   the pre-`e3b9d5a3` baseline and defer to TSPEC §1.3. Keep the "seven, not six" correction.
4. **F-05** — line 174: `§7` → `§5.6`.
5. **F-06** — line 122: `§5.5` → `§5.2`.
6. **F-07** — line 12: reconcile the v1.1/v1.2 dates.

F-04 asks for no edit to this document.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 2, "low": 4}
