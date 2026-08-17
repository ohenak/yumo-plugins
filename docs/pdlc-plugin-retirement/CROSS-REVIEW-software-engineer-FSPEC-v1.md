# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-plugin-retirement/FSPEC-pdlc-plugin-retirement.md`
**Date:** 2026-08-17
**Iteration:** 1
**Scope:** technical lens — feasibility, implementability, gate decidability, literal fidelity against HEAD

## Literal verification pass

Every pinned literal and every repo path this FSPEC names was diffed against the working tree at
`feat-pdlc-plugin-retirement` HEAD before findings were written. Results are in **Positive
Observations**; only divergences and undecidable oracles are raised as findings.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **The consumer cleanup's expected/unexpected predicate has no surviving source of truth.** §3.5 step 2 classifies an entry as *expected* when it matches "what that channel would have written". The only artifact that carries that expectation is `pdlc/workflows/dist/distribution-manifest.json`, whose rows hold `consumerPath` + `pluginSha1` per entry (verified: `pdlc/workflows/dist/distribution-manifest.json` rows `consolidate-learnings`, …) — and **that file is M-6, deleted by class 7**. Three consequences the FSPEC does not address: (a) at the moment an operator runs the cleanup, the installed plugin is post-sweep and ships no manifest; (b) a consumer's copy was written by whatever *older* plugin version they last synced, so even a retained manifest would mismatch on `pluginSha1`, making every entry "unexpected" and the tool refuse by construction; (c) a consumer who never enabled the drift hook has a `.claude/workflows/` copy but no drift-state record, so §3.5 step 1's second input is absent. As written, BR-CLN-3 refuses for the exact population G-4 targets. The FSPEC must pin the observable classification rule — most plausibly *expected = basename ∈ a pinned literal filename set, contents not compared* (and then say so, because it weakens BR-CLN-3's byte-level guarantee), or *expected = matches the drift-state record the channel itself left, absent record ⇒ refuse*. | §3.5 (1–3); BR-CLN-3; BR-CLN-4; AT-4.1; AT-4.3 |
| F-02 | High | Local | **BR-SWEEP-4 is contradicted by §3.1's own class order, in at least three concrete places.** BR-SWEEP-4: "A reference to a deleted artifact is removed in the same commit as the artifact or earlier; never later." But class 12 ("Documentation … **last** of the deletion classes") structurally makes every documentation reference lag its subject. Grounded instances at HEAD: class 4 deletes `check-workflow-drift.sh` while `CLAUDE.md:104`'s hooks-table row naming `hooks/scripts/check-workflow-drift.sh` survives to class 9/12; class 1 deletes the `fresh-clone-bootstrap` job (`.github/workflows/pr-tests.yml:148`) while `CLAUDE.md`'s `### Fresh-clone bootstrap` section (`CLAUDE.md:81`) survives to class 12; class 5 deletes `sync-workflows.sh` while `CLAUDE.md:58`'s Plugin-channel bullet naming it survives to class 12. This cannot be repaired by simply moving the doc edits earlier: `documentOracles.test.js:747` asserts `claudeMd` **contains** `check-workflow-drift.sh`, so removing that row before class 9 reds the L-9 gate — a live conflict between BR-SWEEP-4 and BR-SWEEP-2. Resolve by scoping BR-SWEEP-4 to *gate-relevant* references (its own stated rationale is C-7 greenness) and stating that documentation references are governed by class 12 instead, **or** by binding M-11f's oracle removal into class 4. | BR-SWEEP-4; §3.1 preamble, classes 1/4/5/9/12 |
| F-03 | High | Local | **AT-1.8's "each commit's diff belongs to exactly one class" is not decidable from §3.1.** The classes are not a partition over the edited files. CLAUDE.md is edited by class 1 (`### Continuous integration` table + count word), class 9 ("the CLAUDE.md prose it guards", M-11f), class 10 ("their CLAUDE.md documentation" for the wave-gate values) and class 12 ("CLAUDE.md's bootstrap/sync/drift/worktree/distribution-channel prose"), with prose-scoped boundaries that overlap: `CLAUDE.md:53`'s `### Workflow scripts and the runtime build` contains both the `sync-workflows.sh` mention class 9 owns and the distribution-channel prose class 12 owns. Likewise M-11l is split between class 1 (OPERATIONS.md CI count word/named files) and class 12 (OPERATIONS.md retired sections), and M-11e between class 2 (`consumer-ac12/`) and class 9 (`covered-violations/`). Since AT-1.8 is an *oracle*, not a guideline, §3.1 needs a stated decision procedure — per-file-and-section ownership, or an explicit "a class owns the named headings; anything else in that file belongs to class 12". | AT-1.8; BR-SWEEP-1; §3.1 classes 1, 2, 9, 10, 12 |
| F-04 | High | Local | **AT-1.2's subtraction set is unpinned and mutable, so AC-1.2's gate has an open escape hatch.** L-2 pins the seven terms as a set-equality (correct, and E-12 defends it), but AT-1.2 subtracts "A-1's path globs" — a list that lives only in `docs/_constraints/pdlc-retirement-baseline.md` §*A-1 retired-name allow-list*, a file §3.0 step 2 explicitly **updates in place** during the sweep. Nothing in this FSPEC constrains growth of A-1, so an implementer facing a red search can green it by adding a glob rather than sweeping the dependent — the exact failure mode E-12 forbids on the other side of the same expression. E-25 forecloses one instance (future features' PLANs) but not the general case, and BR-SWEEP-5's "empty remainder, never a total" removes the count-based tripwire that would otherwise catch it. Pin A-1's glob list as a literal in §4.2 with the same rule L-2 carries (a glob added between authoring and the sweep fails rather than slipping through), or require every A-1 addition during the sweep to carry a per-file disposition recorded in this FSPEC. | AT-1.2; L-2; L-3; BR-SWEEP-5; E-12; E-25 |
| F-05 | Medium | Local | **`A-1` denotes two different things inside this one document.** §7.1's assumption row A-1 is "the `fixture-machine.yml` check survives the sweep unchanged"; everywhere else — §3.0 step 2, L-3, BR-DOC-3, BR-DOC-5, AT-1.2, E-1, E-2, E-3, E-25 — `A-1` is the baseline's retired-name allow-list. The FSPEC also never states where that allow-list lives, so a reader who resolves `A-1` locally lands on the wrong referent for the document's central gate. Renumber the assumptions (A-1…A-4 → e.g. ASM-1…ASM-4) and cite the allow-list once as `docs/_constraints/pdlc-retirement-baseline.md` §*A-1 retired-name allow-list*. | §7.1; §4.2 L-3; §6.1 AT-1.2 |
| F-06 | Medium | Local | **AT-1.3's L-6 clause is vacuously true as the FSPEC stands.** L-6 names no modules — it says "their names are fixed at re-measurement time" and O-E routes placement to the TSPEC. AT-1.3 then asserts "each L-6 module is present and passing", which is a set-quantifier over the empty set: it passes today and would pass even if the re-homed queue-triage and hook-manifest assertions were silently dropped. Say explicitly that AT-1.3 is **blocked, not satisfied**, until L-6 carries at least two literal module names, and pair it with the positive assertion that names the re-homed assertion titles (currently in `queueDriftGate.test.js` and `hookCompatibility.test.js`) so the check is a re-homing check rather than a presence check. | L-6; AT-1.3; O-E |
| F-07 | Medium | Local | **AT-4.4/BR-CLN-6's "report set-equals that of the same run in a repo with no leftovers" is not achievable as stated, and diverges from AT-5.2's careful wording.** AT-5.2 correctly separates *field-set* equality from value equality and enumerates the value classes allowed to differ (feature name, timestamps, ids, paths). AT-4.4 says "set-equals" of the reports themselves; two runs of the same feature never produce equal reports (timestamps, ids). Restate AT-4.4 and BR-CLN-6 in AT-5.2's shape, and add the positive half the criterion actually needs: the run *completes to its configured final phase* in the leftovers repo (present) **and** no report field or output line names a leftover path (present) — the pairing is right, only the equality predicate is wrong. | AT-4.4; BR-CLN-6; cf. AT-5.2 |
| F-08 | Medium | Local | **AT-3.3 contradicts §6's own preamble.** §6 opens "none is satisfied by an agent reporting success", but AT-3.3 requires that "each skill in the set loads and runs when invoked" (15 skills) "and every hook in L-4's surviving set fires" — with no observable named for either half. The set-equality against L-10 is mechanically checkable and good; the rest is agent self-report. Narrow AT-3.3 to (a) the `pdlc/skills/*/SKILL.md` set-equality against L-10 and (b) a named observable per surviving hook — the guard's block message, the scope-field warning text, the REQ-size warning text, and the consolidation nudge line — each asserted from a hook invocation, not from a session narrative. | AT-3.3; §6 preamble; L-4; L-10 |
| F-09 | Medium | Local | **The cleanup's target paths are never pinned as literals, so AT-4.1 has no anchor.** §3.5 and AT-4.1 speak of "`.claude/workflows/`" and "the drift-state record"; the record's actual path is `.claude/workflows/.pdlc-drift-state.json` (`pdlc/hooks/scripts/lib/pdlc-drift.sh:1562`). Given that §4.2 pins far less consequential literals (the dist listing, the hook table, the skill listing), the two paths the cleanup deletes belong there too — an implementer should not have to reconstruct them from a script this sweep deletes. | §3.5 (1); AT-4.1; §4.2 |
| F-10 | Low | Local | **The L-series is split across two sections and out of order.** L-1…L-6, L-9 and L-10 sit in §4.2 *Pinned literals*; L-7 and L-8 sit in §4.3 *Documentation and CI rules* interleaved with BR-DOC rows. Since §1.1's scope table and §2's traceability table both route readers to "§4.2 (L-n)", the two strays are easy to miss. Either move L-7/L-8 into §4.2 or have §4.3 say up front that it carries two literals. | §4.2; §4.3 |
| F-11 | Low | Local | **E-9 attributes a comment block to the wrong file.** E-9 says of `.worktreeinclude` that "a deleted row's explanatory comment block goes with it", but `.worktreeinclude` at HEAD is a single line, `.claude/workflows/`, with no comment. The rationale comment block is `.gitignore:13–32`, guarding `/.gitignore:33`'s `/.claude/workflows/` row — which is what §3.1 class 8 correctly says. Move the comment-block clause from E-9 to E-8 (or to a `.gitignore` row of its own). | E-9; §3.1 class 8 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | The manifest's rows carry a `"retires": []` field — the sync channel already ships a mechanism for removing obsolete consumer paths. Was it considered as the shape for §3.5's classification (an entry is *expected* iff a shipped row ever claimed its `consumerPath`), and rejected? If it was rejected because the manifest dies with the sweep, that reasoning belongs in §4.5 next to BR-CLN-4, which already cites the sync tooling for the exit convention. |
| Q-02 | §3.1 class 13 says the cleanup "may land any time". Given F-01, does it in fact have to land **before** class 7, so it can be authored and tested against a live manifest? If yes, that is an ordering obligation, not an independence. |
| Q-03 | BR-GATE-2 requires a stale `distribution.checkEnabled` to be "ignored silently". After class 3 removes the key's reader, is there any config-schema validator in the engine or queue path that would reject an unknown key? If so, BR-GATE-2 needs a disposition row of its own; if not, saying so once makes the rule free. |
| Q-04 | AT-1.4's CI half requires the sweep PR itself to be green. `Fixture machine (…)` is path-filtered over `pdlc/engine/**` (`pdlc/OPERATIONS.md:66`), so it is skipped-as-success on PRs touching neither. Class 2 does touch `pdlc/engine/__tests__/`, so the whole-sweep PR will run it — but is that intended to be relied on, or should L-7's post-sweep set be asserted from the workflow files' `on:` triggers rather than from an observed PR run? |

## Positive Observations

Every pinned literal in this FSPEC checks out against the tree. That is unusual and worth
recording, because most of the document's gates rest on them:

- **L-1** — `pdlc/workflows/dist/` holds exactly the five named entries; no sixth.
- **L-3** — the expected-empty command is **byte-identical** to
  `docs/_constraints/pdlc-retirement-baseline.md:182`, and the eight-alternation sweep recipe at
  `:157` is genuinely its superset. The "delta 4 paths at `b73fb4de`" claim matches the baseline's
  own delta table (`:189`–`:193`).
- **L-4** — `pdlc/hooks/hooks.json` registers exactly the five entries listed, with the matchers as
  transcribed, including the two separate `SessionStart` entries. The insistence on set-equality
  here (and E-14) is the right call: an absence check on the drift reporter alone really would
  admit deleting the whole event.
- **L-5** — `pdlc/workflows/__tests__/*.test.js` counts **119**; all 21 named M-8 modules and
  `runtimeProvenanceWiring.test.js` exist as files; 119 − 22 = **97** is arithmetically sound, and
  A-2 correctly names the one assumption that could move it.
- **L-7** — the six check names render exactly as transcribed:
  `pr-tests.yml:28` + matrix `os: [ubuntu-latest]` / `node: ['20']`, `pr-tests.yml:88` + matrix
  `os: [ubuntu-latest]`, `pr-tests.yml:122`, `:148`, `:206`, and `fixture-machine.yml:44`.
  `pdlc/OPERATIONS.md:59` does read "six checks", exactly where BR-DOC-1 says it does.
- **L-10** — `pdlc/skills/*/SKILL.md` is exactly the fifteen named directories.
- **BR-VER-1** — `pdlc/.claude-plugin/plugin.json:4` is `0.23.1`,
  `pdlc/engine/package.json:18` is `"pdlcPluginCompat": "^0.23.0"`, and
  `pdlc/engine/lib/handshake.mjs:93` `satisfiesRange` is real. The `0.24.0`-is-an-outage analysis
  is correct and is the most valuable thing in §4.6.
- **BR-CLN-4** — the cited exit convention is accurate:
  `pdlc/hooks/scripts/sync-workflows.sh:718` exits `2` on any `local-edit`/`unverified` row and
  `:722` exits `1` otherwise.
- **BL-04** / **A-4** — `checkGuardCarrier` is at `pdlc/engine/lib/startup.mjs:149`, and
  `pdlc/engine/bin/pdlc.mjs` exists.
- **BR-SWEEP-5** is the sharpest rule in the document. "Empty remainder, never a total" plus the
  explicit statement that an empty remainder proves no *unknown* swept path (not a complete
  inventory) is exactly the right epistemics, and naming `ci-arrangement.test.js` and
  `.worktreeinclude` as the two search-unreachable instances is honest about the method's limit.
- **§7.2's erratum against the REQ is correct and I confirm it independently.** `REQ` AC-1.1
  (`REQ-pdlc-plugin-retirement.md:276`–`283`) requires M-6 not to exist *and* `dist/` to set-equal
  `{M-9}`, while O-3 (`:543`–`:550`) leaves open "whether the manifest survives for that one row".
  Both cannot hold. Raising it rather than papering over it in L-1 was the right handling.
- Routing O-3/O-4 to the TSPEC and keeping AC-1.3's literals here (§1.2) respects the altitude
  boundary cleanly — this FSPEC states outcomes and declines to design seams.

## Recommendation

**Needs revision**

Four High findings. Concretely, the next revision must:

1. Pin §3.5's expected/unexpected predicate to a source of truth that survives class 7, and say
   what happens when the drift-state record is absent (F-01).
2. Scope BR-SWEEP-4 to gate-relevant references, or move M-11f's oracle removal into class 4, so
   BR-SWEEP-4 and BR-SWEEP-2 stop contradicting each other on `CLAUDE.md:104` (F-02).
3. Give §3.1 a stated ownership rule per file and heading so AT-1.8's exactly-one-class oracle has
   a decision procedure for CLAUDE.md and `pdlc/OPERATIONS.md` (F-03).
4. Pin A-1's path-glob list with L-2's widening rule, so AC-1.2's gate cannot be greened by
   growing the subtraction set (F-04).

The Medium findings (F-05…F-09) are cheap and mostly editorial-with-teeth; F-06 and F-07 are the
two that would otherwise ship a vacuous or unachievable acceptance test.

## Verdict

VERDICT: Needs revision
{"high": 4, "medium": 5, "low": 2}
