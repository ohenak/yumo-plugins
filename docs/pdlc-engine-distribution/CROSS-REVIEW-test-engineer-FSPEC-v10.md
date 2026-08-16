# Cross-Review: test-engineer — FSPEC (delta re-review, round 10)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/FSPEC-pdlc-engine-distribution.md`
**Date:** 2026-08-16
**Iteration:** 10
**Scope:** Delta only. Diffed `e63bcad0` (v9's `REVIEWED-COMMIT`) → HEAD: three commits
(`c7267d28`, `063fdd39`, `730aa0b6`), 140 diff lines, version cell `0.7 → 0.8`. Unchanged
sections already approved in rounds 1–9 are not re-litigated. Decision-freeze round: only a
delta-introduced defect or a claim false at HEAD can block.

## Delta read, and what it resolves

Six regions moved. Every one is a carried-forward finding from v8/v9 being discharged:

- **Header + changelog** (`:9`, `:16-22`): version cell advances to 0.8 with a changelog
  paragraph; upstream pin re-cut to REQ **v0.12, `3605092b`**. Verified: `3605092b`'s REQ
  reads `| pdlc | … | 0.12 | 2026-08-16 |`, and `3605092b` is the newest commit touching REQ.
  Resolves v9 `F-01` and v8 `F-01`.
- **§3 F-5 baseline** (`:255-259`): the present-tense "holds exactly one file" is now dated —
  "existed at feature start (`89babe8e`, 2026-08-13)". Verified against the tree, not the prose:
  `git ls-tree --name-only 89babe8e .github/workflows/` returns exactly `pr-tests.yml`, and HEAD
  holds three. The claim is now true as written. Resolves v9 `F-02`.
- **§3 F-5 step 2** (`:262-266`): "absent" is defined against the path-filtered member — a
  member row 6's `paths:` never triggered is not absent, no poll or branch-protection rule may
  hold it pending, and at a tag the commands run directly. Verified at HEAD:
  `.github/workflows/fixture-machine.yml:19-23` is `on: pull_request` with a
  `pdlc/engine/**` path filter, and `publish.yml`'s `gate` job runs the fixture-machine leg
  itself (`:158-176`, `node scripts/fixture-machine.mjs`) rather than polling for it.
- **BR-7.1** (`:510-517`): the singular tail becomes `` `pr-tests.yml` carries ~16 ``, and "any
  addition" now reads "to **either file**". The rule's two-file scope and its sentence now agree.
  Resolves v8 `F-03`.
- **BR-7.6 / BR-7.7 order** (`:543-556`): BR-7.6 moved back above BR-7.7; numeric order restored.
  Body bytes unchanged — confirmed by reading the diff hunks, both sides are byte-identical.
- **BR-8.2 / E-22** (`:607`, `:689`): "workflow modules" → **Workflow members**, matching §5.2's
  class name (`:573`). Resolves v7 `F-02`.
- **AT-3.4** (`:781-786`) and **AT-1.6** (`:730-734`): see below.

## Testability verification (the two oracle-bearing deltas)

**AT-3.4's two added conjuncts are the right shape.** The file-column conjunct is a
*set-equality* over the `pull_request`-triggered files under `.github/workflows/`, not a
containment — a new PR-gating file cannot enter the repo without entering §5.1, and a deleted
row fails too. The carrier already exists and matches:
`pdlc/engine/__tests__/ci-arrangement.test.js:552` ("§5.1's file scope equals the PR-triggered
workflow files (BR-7.1)") re-derives the key set from the files' own triggers rather than
transcribing `PR_GATE_FILES` (`:64-67`), and `:666` carries the BR-7.7 gate-command
set-equality. §5.1's six rows transcribe the shipped `name:` keys exactly
(`ci-arrangement.test.js:69-76`; `fixture-machine.yml:1`). No count conjunct was introduced,
so REQ v0.12's "membership is trigger-derived, not a count" stays uncontradicted.

**AT-1.6's rewrite is a strict improvement.** Comparing the triple *as values* rather than as
rendered text is exactly right at HEAD: `handshake.mjs:207-211` renders the banner with its own
decoration, so a text-identity oracle would have been red on formatting alone. The rewrite
removes an implementation-echo attractor rather than adding one. One inaccuracy rode in with it
(F-01).

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | AT-1.6's new parenthetical "(the banner prefixes each with `v`)" is false of one of the three. At HEAD `pdlc/engine/lib/handshake.mjs:208-210` prefixes the **engine** version and the **plugin** version with `v`, but renders the declared range bare: `` (engine requires ${pluginCompat}) `` where `pluginCompat` is `^0.23.0` (`pdlc/engine/package.json:18`) — no `v`. Not load-bearing: the conjunct itself ("values, not rendered text") is correct and covers any decoration. But the gloss is the sentence a test author reads for *how* to normalise, and a transcriber who takes it literally writes `assert(banner.includes(\`v${range}\`))`, which is red at HEAD for a reason that has nothing to do with the behaviour under test. Fix: say the banner decorates the two version values with `v` and carries the range undecorated — or drop the parenthetical, since the value-comparison rule needs no example. | §8 AT-1.6 `:730-734` |
| F-02 | Low | Local | Rename residue: §2 `:103` still reads "the canonical workflow **modules**" while §5.2 `:573`, BR-8.2 `:607` and E-22 `:689` now say **Workflow members**. The round-8 rename was scoped to BR-8.2/E-22, so this is not a regression the delta introduced — but the class now has two spellings in one document, and §5.2's row is the one PROPERTIES traces. No oracle reads §2. Fix whenever §2 is next opened. | §2 `:103` vs §5.2 `:573` |

DEFERRED: `.github/workflows/publish.yml:24`'s comment still reads "Re-runs the five PR-gate jobs' commands" though the `gate` job now re-runs six jobs' commands (its own fixture-machine leg is at `:158-176`); a code-comment drift, outside FSPEC's bytes, for the implementation phase.
DEFERRED: F-5 step 2 forbids "no PR poll or branch-protection rule may hold it pending" — the falsifying test for the *branch-protection* half is not observable offline, so it will land as an FSPEC-level obligation rather than an AT conjunct; TSPEC should say which side of the line it falls on.

## Questions

| ID | Question |
|----|---------|
| Q-01 | Carried from v9, still open and still not blocking: on a docs-only PR, row 6 renders no check at all. AT-3.4 is offline and unaffected, but Phase PUB's `--json statusCheckRollup` tolerance for a member that legitimately never ran is asserted only by F-5 step 2's prose. Worth one PUB-level integration case in PROPERTIES. |

## Positive Observations

- Every v9 and v8 finding is discharged, and each was discharged by making a claim *true* rather
  than by deleting it — the baseline sentence got a date and a commit, not a hedge. Re-checked
  against the tree at `89babe8e`, not against the sentence.
- The upstream pin now carries both the current cut and the prior re-grounding
  (`v0.12, 3605092b; v0.11 re-grounded 2026-08-13, 01c27ee4`), which is what a later cascade
  adjudicator actually needs.
- AT-3.4 grew two conjuncts and both are set-equalities with live carriers at HEAD. This is the
  rare case where the spec's added obligation is already mechanically covered, so the round
  closes with the traceability gap (v8 `F-04`) shut rather than deferred.
- BR-7.1's "either file" is a one-word fix that closes a real false-green: under the old singular
  wording, an addition to `fixture-machine.yml` satisfied the rule's letter.

## Recommendation

**Approved with minor changes** — the delta resolves every open blocking-adjacent item from v9
and introduces no High. F-01 is a factual slip in an explanatory parenthetical, not in an
oracle; F-02 is naming hygiene. Neither changes a criterion, an oracle or a test, and both are
single-line edits whenever the document is next opened.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}

APPROVAL-HASH: sha256:5ffc38a7f6ff1b19d31250a7d54dce32c3498941723cfb3f35102d2004027b06
APPROVAL-HASH-NORMALIZED: sha256:99583385b0a12bf4e56d57a219427a65e3cfb8baee535777adf2453e90e6e43e
REVIEWED-COMMIT: 730aa0b6824e79ec22f5d21a22191a1979439db4
UPSTREAM-STATE: REQ sha256:44d0e18836f534cb68444f6e5a0b26eebf3d2aafe7f7630ce1f38fed78b1d00f
