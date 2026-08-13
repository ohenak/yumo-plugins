# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/REQ-pdlc-engine-distribution.md` (v0.7)
**Date:** 2026-08-13
**Iteration:** 2
**Scope:** Testing lens, delta only. Round-1 High findings re-checked at HEAD; changed sections
scanned for new issues. Unchanged, already-approved sections not re-reviewed.

## Round-1 disposition

All eight round-1 High findings are resolved. Each was verified against the working tree, not
against the REQ's own account of the fix.

| Prior | Resolution in v0.7 | Verified at HEAD |
|---|---|---|
| F-01 stale four-check count | O-B now says **five** and delegates the names to M-ENG-10 | `pr-tests.yml` has 5 jobs (`:28`, `:78`, `:112`, `:138`, `:196`) |
| F-02 AC-3.4 not set-equality, names not literal | AC-3.4 restated as set-equality over M-ENG-10's enumerated literals; deletion, rename **and** unreviewed addition all fail | M-ENG-10 rows 1–5 transcribe the `name:` strings **byte-exactly**, including `Generated artifacts are in sync` (the repo's own CLAUDE.md gloss drops "are"; the baseline does not) |
| F-03 false "corpus embedded in `orchestrate-dev.js`" | Clause deleted from NG-1 and O-1, with the deletion stated rather than silently made | `grep engineVersion pdlc/workflows/orchestrate-dev.js` → no match; module holds no prompt text. **Upstream copy still live** — erratum re-raised below |
| F-04 AC-3.6 named the wrong version | O-7 splits T-1a/T-1b; AC-3.6 compares the tag against **T-1a only** and says the plugin number is never a tag subject | `pdlc/engine/package.json:3` `0.1.0` vs plugin `0.22.0` (M-ENG-11) — two records, as O-7 now says |
| F-05 AC-4.2 carrier structurally absent | AC-4.2 keeps the observable outcome, names the impossibility explicitly, routes the layering decision to **O-9** | M-ENG-13 verified: `report.mjs:77-78` carries the pair; workflow layer carries none and has no `process`/`fs` to obtain one |
| F-06 absence-only install oracles | AC-2.3 and AC-2.5 now require the positive on the **same run** (CLI resolves at the new version *and* its install location changed; both channels dispatch positively) | — |
| F-07 AC-1.3 containment-shaped | Restated as member-for-member set equality: an added file fails, not just a missing one | — |
| F-08 O-8 recorded one publish blocker | O-8 now names three, **in the order `npm publish` fails on them** | `package.json:4` `private: true`, `:2` unscoped `pdlc-engine`, `:11` `UNLICENSED` |

The six Mediums and three Lows are likewise addressed: AC-3.3 asserts positively on both permitted
branches, AC-6.1 transcribes the two bootstrap commands literally, AC-4.4 became a change-and-revert
check (a hardcoded constant that matches once fails the second observation), AC-5.1 puts the
newer-version probe behind an injectable seam, AC-5.3 enumerates exactly four artifact kinds and
names the two deliberately excluded, AC-5.6 converts the T-6 tension into an AC, and T-3 names
`pdlcPluginCompat` (`package.json:9`, verified). New material — R-5, O-9, O-10 — is grounded:
M-ENG-12's anti-fork claim holds at `run.mjs:52-54` and `run.test.js:51,67`.

## Findings

No High findings. Four Mediums and two Lows, all in newly written text.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Cross-Feature | **AC-3.4's set-equality is stated in one alphabet but consumed in another, and the gap is exactly a matrix rename.** M-ENG-10's authoritative literals are the workflow file's *template* strings (`Unit tests (${{ matrix.os }}, node ${{ matrix.node }})`, `Engine tests (${{ matrix.os }})`); Phase PUB polls GitHub's *rendered* check names (`Unit tests (ubuntu-latest, node 20)`). A test written off the YAML `name:` values satisfies AC-3.4 in full while a matrix edit (node `'20'` → `'22'`, or adding an os) silently breaks every PUB poll — the template set is unchanged, the rendered set is not. Say which alphabet the equality is over, and require **both**: template set-equality against M-ENG-10, and rendered set-equality after matrix expansion against the names PUB matches. | AC-3.4; T-7; §1.1 O-B |
| F-02 | Medium | Local | **O-5 and AC-5.6 rest on a citation that does not contain the fact.** Both attribute the shipped `PDLC_PLUGIN_ROOT` / `--plugin-root` selector to **M-ENG-06**; that id holds neither string (`grep -n 'PDLC_PLUGIN_ROOT\|plugin-root' docs/_constraints/pdlc-engine-baseline.md` → zero hits). M-ENG-06 is the *upstream* headless-engine REQ's per-AC red/green table, so its `AC-1.1`/`AC-4.5` ids collide with this REQ's own ids — a verifier following the pointer lands on a table about a different feature and may re-derive AC-5.6's baseline from the wrong criterion. The claim itself is true and is separately cited correctly (`handshake.mjs:134`, verified: the `REMEDY` string names the variable). Repoint to the code, or add the selector as a numbered fact in the baseline. | §7 O-5; AC-5.6 |
| F-03 | Medium | Local | **AC-4.5's exclusion set is still unnamed, so the oracle has no decidable comparison set** (round-1 Q-03, carried). "Every file under `docs/{feature}/` that existed before the run hashes identically after it, **except those the run itself authors as part of its normal phase work**" — a verifier snapshotting hashes before the run cannot decide membership of the exception without a list. Name the carrier: the changed-file set must be a subset of the artifacts the run's own report enumerates as authored (and say so if the report must start enumerating them, since that is then new work like AC-4.2's). | AC-4.5 |
| F-04 | Medium | Local | **AC-6.2 identifies the bundle channel by an absence and calls it positive.** "Its channel is identified **positively by the engine's absence of an engine provenance block**, which is itself asserted" — the asserted thing is still the absence. A run that crashed before emitting anything, or an engine run whose provenance block regressed away, both satisfy it. The honest constraint is real (C-4 forbids touching the bundle path to add a marker), and the fix is a conjunction, not a marker: on the same run assert (1) the run completed and emitted its own named output/artifacts, (2) that output carries no engine provenance block, (3) the write root touched is the plugin's `.claude/workflows/`. The third conjunct is already half-stated in the disjoint-write-roots clause; bind all three to one run. | AC-6.2; C-9 |
| F-05 | Low | Local | **AC-1.3 presumes a declaration M-ENG-11 records as absent.** It reads "the file list the package **declares** it ships" and "decidable from the package's own declared contents", but `pdlc/engine/package.json` has no `files` field (M-ENG-11), so today there is no declared list — only whatever `npm pack` would sweep up. Either require the `files` field as part of the outcome, or name the offline enumeration (`npm pack --dry-run --json`) the set-equality is computed over. | AC-1.3; §1.1 O-G |
| F-06 | Low | Local | **AC-2.1's "transcribed verbatim from `README.md`'s install section" does not yet resolve to one place.** Two READMEs exist, and the only install section on disk (`pdlc/README.md:132`, "Install in another repo") documents the *plugin* marketplace install, not the engine — the repo-root `README.md:113` heading is inside a fenced example. Name the file and the heading the engine install command will live under, so the transcription source is unambiguous when the AC is tested. | AC-2.1 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | AC-1.1 now says "any **pipeline** command", which reads as excluding `pdlc doctor` — the diagnostic that exists to explain a refusal. Is that the intent? If `doctor` also refuses, the operator loses the tool needed to diagnose the refusal; if it does not, say so once so the test knows which side of the gate `doctor` sits on. (Round-1 Q-02, narrowed but not closed.) |
| Q-02 | AC-5.3 excludes cross-review and CODE_REVIEW files from the dev-mode mark because "they are authored by dispatched agents, not by the run harness". A dev-mode run dispatches agents reading the *checkout's* prompts, so those files are the ones most affected by dev mode. Is the exclusion a statement about feasibility (the harness cannot mark what it does not write) or about intent? The set-equality check is only as strong as the reason for its boundary. |

## Positive Observations

- The fix to F-01/F-02 is better than what I asked for. I asked for the literal names in the AC;
  the revision instead put them in one numbered fact (M-ENG-10), made **the enumeration, not the
  count**, authoritative in T-7, and added "Adding or removing a member is a change to M-ENG-10
  first". The count that went stale can no longer go stale in two places, which is the actual
  failure mode that produced F-01.
- M-ENG-10 transcribes the check names byte-exactly — including `Generated artifacts **are** in
  sync`, which the repo's own CLAUDE.md renders without the "are". Someone re-read the YAML instead
  of copying the prose. That is the difference between a set-equality test that works and one that
  fails on day one.
- AC-4.4's anti-echo half is now a change-and-revert observation rather than an adjective
  ("never hardcoded"). Two observations with a revert between them is a mutation check written at
  REQ altitude, and it is falsifiable by a test engineer without any implementation detail.
- F-05 and F-07 were answered by *raising new obligations* (O-9, O-10) rather than by wording that
  makes the problem read as solved. AC-4.2 explicitly says "this does not hold by construction
  today". A REQ that states which of its own criteria have no implementation path yet is doing the
  job; the alternative is discovering it in Phase I.
- R-5 is the strongest new section: it names three resolutions, and for the cheapest one states
  plainly that it turns a shipped green anti-fork assertion red and that a weakened anti-fork
  oracle is exactly the guard being traded away. Pricing the test-integrity cost of an
  implementation choice, in the REQ, before anyone has chosen — that is the review this document
  would otherwise have needed later.

## Recommendation

**Approved with minor changes**

Every round-1 High is resolved, and resolved at the source rather than at the wording: stale
premises were re-measured into one cited baseline, absence-only oracles gained positive conjuncts
on the same run, two containment checks became set-equality, and the two criteria that had no
implementation path (AC-4.2, AC-1.3) now say so and carry named obligations (O-9, O-10). The
acceptance layer is derivable — a test engineer can write a failing test from each AC without
asking a question, which is the bar this document missed in round 1.

The four Mediums are all in text written this round and none of them blocks. F-01 is the one to
fix before FSPEC: AC-3.4's set-equality is currently satisfiable in the alphabet PUB does not read,
so a matrix edit passes the check and breaks the poll. F-02 is a citation repoint. F-03 and F-04
are one clause each — name AC-4.5's comparison set, and bind AC-6.2's three conjuncts to one run.

One erratum against the upstream decision doc is raised below: the false "copies embedded in
`pdlc/workflows/orchestrate-dev.js`" clause the REQ correctly deleted from NG-1 and O-1 is still
live at `docs/_decisions/DECISIONS-plugin-distribution.md:127`, where it is stated as a *reason*
for rejecting the private-registry channel.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 4, "low": 2}
