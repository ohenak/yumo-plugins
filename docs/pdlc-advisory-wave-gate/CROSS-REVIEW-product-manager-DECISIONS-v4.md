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
