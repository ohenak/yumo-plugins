# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-workflow-distribution/REQ-pdlc-workflow-distribution.md`
**Date:** 2026-07-27
**Iteration:** 3
**Scope:** testability, edge-case completeness, oracle falsifiability. Not product strategy, not architecture choice.
**Delta base:** working tree vs `e719fe7` (`docs(pdlc-workflow-distribution): REQ v2 addressing REQ-v1 cross-review`).

## Delta summary — the document did not change

The orchestrator dispatched this as iteration 1, but `CROSS-REVIEW-test-engineer-REQ-v1.md` and
`-v2.md` both exist on this branch, so this is iteration 3 and the delta protocol applies. The
diff of the document since v2 is **four lines, all in the header block**:

```
-| Cross-Reviews | `CROSS-REVIEW-software-engineer-REQ-v1.md`, `CROSS-REVIEW-test-engineer-REQ-v1.md` |
+| Cross-Reviews | ... v1 ..., ... v2 ... (all on `feat-pdlc-workflow-distribution`) |
-| pdlc | draft | Claude | 2.0 | 2026-07-27 |
+| pdlc | draft | Claude | 3.0 | 2026-07-27 |
```

No section §0–§9 changed. Every normative sentence cited in the v2 review is byte-identical at
HEAD+worktree. Therefore **all nine v2 findings (F-14…F-22) remain open**, re-filed below under
their original IDs so the disposition table stays traceable.

## Disposition of v2 findings

| v2 ID | Sev | Status | Evidence at current text |
|---|---|---|---|
| F-14 | High | **Open — unchanged** | AC-1.8(i) still declares `plugin bytes present/absent` in the input space; AC-1.1 still enumerates exactly seven states, none of which is "manifest row present, baseline resolved, `pluginPath` absent/unreadable". |
| F-15 | High | **Open — unchanged** | AC-4.1 row 1 still reads "older than the current session start"; AC-2.6's schema still carries only `generatedAtUtc`; §4 still lists no session-start source. |
| F-16 | Medium | **Open — unchanged** | AC-0.1 still says the manifest is the "**sole** enumeration authority" and "Directory globbing of `workflows/` is prohibited"; AC-1.5 still requires detecting unmanaged consumer files. |
| F-17 | Medium | **Open — unchanged** | AC-0.3's dogfooding sentence and AC-6.1's "keeping this repo's own `.claude/workflows/` consumer copies working" both stand verbatim. |
| F-18 | Medium | **Open — unchanged** | AC-3.3 still "writes nothing except the drift state file"; §4 still attributes that file to "written by hook only". |
| F-19 | Medium | **Open — unchanged** | AC-6.2 still predicates its oracle on "a plugin installed from the marketplace at version *V*"; BL-02 still gates all of REQ-DIST-03 on it. |
| F-20 | Low | **Open — unchanged** | AC-1.1 still says "the hash recorded by the last sync" while AC-1.6 records two hashes. |
| F-21 | Low | **Open — unchanged** | AC-2.6 still requires `pluginArtifactVersion` / `consumerArtifactVersion` with no specified emitted form or extraction mechanism under NFR-5's POSIX-shell constraint. |
| F-22 | Low | **Open — unchanged** | §0 row A′ still `.claude/workflows/{name}.bundle.js`; §1 diagram and AC-6.1 still `pdlc/workflows/dist/*.bundle.js`. |

None of the four v2 questions (Q-01…Q-04) is answered in the document.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-14 | High | Local | **AC-1.8's totality property is unsatisfiable against AC-1.1's state table.** AC-1.8(i) declares the input space to include `plugin bytes present/absent`, but AC-1.1 has no state for "manifest row exists, baseline resolved and readable, but `pluginPath` is absent/unreadable". `unknown` is scoped by AC-1.2 to the *baseline*, `missing` solely to `consumerPath absent`, `not-managed` to the *absence* of a manifest row. A property test asserting "every input combination maps to exactly one of seven states" fails by construction; the test author must either weaken the property or invent an unauthorised state. AC-3.1's copy loop is also undefined for that row (neither copy set nor skip set). Resolution: add an eighth state (e.g. `plugin-missing`) and place it in AC-3.3's exit precedence and AC-4.1's queue precedence, **or** narrow AC-1.8(i)'s input space and add an AC routing an absent `pluginPath` to `unknown` with its own reason code. | AC-1.8(i) vs AC-1.1, AC-1.2; AC-3.1 |
| F-15 | High | Local | **AC-4.1's first precedence row has no falsifiable trigger.** "drift state file … older than the current session start → `blocked`" requires the queue to observe the session-start instant, but NFR-1 states the runtime has no `fs`/`process`, that the queue performs **one** injected read, and that it "makes no classification decision". No source for that instant exists: not in AC-2.6's schema (`generatedAtUtc` is the other side of the comparison), not a second injected read, not a queue parameter, not in §4 (whose preamble forbids ACs citing values absent from it). With no input to vary there is no RED case — the branch ships as dead code or an always-pass guard. Resolution: make freshness an input the test can set (e.g. hook-written per-session nonce delivered through an existing injection point), or drop the clause and specify the "hook did not run at all" case, which today is covered only as "absent / unparseable". Also reconcile the wording: comparing timestamps *is* a classification decision. | AC-4.1 row 1; NFR-1; AC-2.6; §4 |
| F-16 | Medium | Local | **`not-managed` is unproducible under AC-0.1 as written; if producible, the consumer state files pollute every report.** Detecting `not-managed` requires enumerating the consumer's `.claude/workflows/`, which AC-0.1 appears to prohibit ("sole enumeration authority", "globbing of `workflows/` is prohibited" — unscoped as to side). If enumeration does happen, §4's closing sentence makes `.pdlc-sync-manifest.json`, `.pdlc-drift-state.json` and `.pdlc-backups/` `not-managed` rows — including the drift state file listing itself, whose content changes every run, making AC-3.7's byte-identity assertion and any golden-output oracle self-referential. State: (a) is the consumer directory enumerated, (b) what exclusion rule keeps `.pdlc-*` out of reported rows, (c) does `not-managed` appear in AC-2.6's `rows` array or only in human-facing output. Each answer changes the fixture materially. | AC-0.1 vs AC-1.1/AC-1.5; §4 closing paragraph; AC-2.6 |
| F-17 | Medium | Local | **`yumo-plugins`' own `--check` can never reach exit 0, so AC-3.3's exit-0 row and AC-2.2's silence row have no real host.** AC-0.3 makes this repo an ordinary consumer; AC-6.1 keeps `build-runtime.mjs` writing its `.claude/workflows/` copies. Build-written copies get no sync-manifest entry (AC-1.6 records only on sync-write), so any difference is `unverified` (AC-1.7) ⇒ exit 2 (AC-3.3) — and they will differ, since the working tree is ahead of the released cache by construction (§0 facts 5–7). The suite's only real host structurally cannot exercise the green path, and the SessionStart hook warns every session forever. State the resolution: a documented opt-out (note `distribution.checkEnabled` today gates only the queue, not the hook or `--check`), or have the build write the sync manifest, or drop this repo from the managed path. | AC-0.3 vs AC-6.1; AC-1.6, AC-1.7, AC-3.3, AC-2.2, AC-4.3 |
| F-18 | Medium | Local | **Two normative statements disagree on who writes `.pdlc-drift-state.json`, and AC-4.1's blocking decision rests on the answer.** AC-3.3: `--check` "writes nothing except the drift state file". §4: "written by **hook** only". AC-2.6 assigns the write to the hook. Open questions the tests must encode: may a mid-session `--check` overwrite the hook's state, and is the result "current" for AC-4.1? Does a `--force` sync refresh it, or does the queue keep blocking on rows the operator just fixed (a false-block clearable only by restarting the session)? Pick one writer contract; the current text supports three distinct integration tests (hook→queue, sync→queue, sync→hook→queue). | AC-3.3 vs §4 table vs AC-2.6; AC-4.1 |
| F-19 | Medium | Local | **AC-6.2 has no oracle that can run before a release — the only time it could fail.** Its inputs (a published marketplace version, an installed cache dir) exist only after the packaging decision it guards has shipped, yet BL-02 gates all of REQ-DIST-03 on it. Add a pre-release surrogate the in-repo suite can execute: assert over the packaged file set that every `distribution-manifest.json` `pluginPath` resolves inside it, on every commit, plus a post-install smoke check. As written, an implementation reviewer will mark AC-6.2 satisfied by inspection, and packaging exclusions — precisely the failure §0 fact 3 documents — break silently between releases. | AC-6.2; BL-02 |
| F-20 | Low | Local | AC-1.1's `stale` / `local-edit` rows both say "the hash recorded by the last sync", but AC-1.6 records two hashes (`consumerHash`, `pluginHash`), equal only at t=0. Name `consumerHash` explicitly in both rows — this is the single comparison the whole discriminator rests on. | AC-1.1; AC-1.6 |
| F-21 | Low | Local | AC-2.6 requires `pluginArtifactVersion` / `consumerArtifactVersion`, i.e. extracting `meta.version` from a generated bundle with POSIX shell plus a hash utility (NFR-5). No emitted literal shape, extraction mechanism, or failure mode beyond AC-5.3's "renders as `unknown`" is specified. Since AC-5.1 makes `build-runtime.mjs` responsible for propagating the value, state the emitted form precisely enough for a `grep`/`sed` oracle asserted by `__tests__/runtimeBundle.test.js`. | AC-2.6; AC-5.1, AC-5.3; NFR-5 |
| F-22 | Low | Local | Node A′ has two addresses: §0's grounding table places it at `.claude/workflows/{name}.bundle.js`, §1's diagram and AC-6.1 at `pdlc/workflows/dist/*.bundle.js`. §0 is the section a fixture author copies paths from. Label the §0 row as pre-feature state, or align it. | §0 row A′ vs §1 diagram, AC-6.1 |
| F-23 | Medium | Process | **A document was resubmitted for cross-review with only a version-header bump and no content change.** The v3 header claims version `3.0` and adds the v2 cross-reviews to the Cross-Reviews row, but no finding was addressed — the six blocking items from the v2 recommendation are verbatim intact. The optimizer loop consumed a full review iteration for zero delta, and the version number now overstates the document's maturity to every downstream reader (FSPEC/TSPEC authors will read "3.0, four cross-reviews" as converged). Two process guards are warranted: (i) the author phase must not bump the version row unless the body changed; (ii) the orchestrator should pass the true iteration index (this was dispatched as "iteration 1" despite v1 and v2 review files existing on the branch), since a wrong index defeats the delta re-review protocol that caught this. | Header block; workflow phase R |

## Questions

Carried forward unanswered from v2:

| ID | Question |
|----|---------|
| Q-01 | Is the consumer's `.claude/workflows/` enumerated at all (F-16)? If not, `not-managed` is documentation-only and should be labelled as such rather than appearing in a state table tests must cover. |
| Q-02 | After a successful `--force` sync mid-session, what refreshes `.pdlc-drift-state.json` so the queue stops blocking (F-18)? |
| Q-03 | Does `distribution.checkEnabled: false` gate only AC-4.1, or also the SessionStart hook and `--check`? §4 and AC-4.3 say queue-only; F-17's dogfooding case needs the broader form. |
| Q-04 | AC-4.1 routes `unverified` to *proceed* while AC-3.3 routes it to exit **2** (worse than `stale`'s 1). Is that asymmetry deliberate? It deserves a sentence — the two seams will be tested against each other. |

New:

| ID | Question |
|----|---------|
| Q-05 | Was a revised body intended for this iteration and lost (uncommitted elsewhere, wrong worktree), or was the version bump the whole change? If the former, re-dispatch with the real content and this review is void. |

## Positive Observations

The v2 strengths stand unchanged and are worth restating so the revision does not regress them:

- §0 Grounding with measured hashes, named paths and an explicitly withdrawn superseded premise — this should become the FSPEC's fixture spec.
- AC-1.6/AC-1.7: sync manifest replacing mtime, with `unverified` as a distinct always-surfaced state rather than a default into `stale` or `local-edit`.
- AC-3.3's precedence table plus the gloss "exit 0 asserts every managed row was compared against a resolved baseline and matched" — a falsifiable oracle, not a slogan.
- AC-3.5 (restore ⇒ byte-identical) as the un-false-greenable oracle for AC-3.4, and AC-3.6/AC-3.7 giving convergence and idempotence first-class status.
- REQ-DIST-04's preamble declaring the queue check secondary and unusable for first adoption.
- NFR-2's explicit prohibition on wall-clock assertions.
- §4's single table of every configured value with location, default and owner.

## Recommendation

**Needs revision**

Blocking changes required before FSPEC — unchanged from v2, none addressed:

1. **F-14** — define the state for a manifest row whose `pluginPath` is absent/unreadable, and place it in AC-3.3 and AC-4.1 precedence; or narrow AC-1.8(i) to match the table.
2. **F-15** — give AC-4.1's freshness guard an observable input a test can vary, or remove the clause and specify the "hook never ran" case.
3. **F-16** — resolve AC-0.1's glob prohibition against `not-managed`'s consumer-side enumeration and state the `.pdlc-*` exclusion rule.
4. **F-17** — state how `yumo-plugins` behaves under its own check so AC-3.3 exit 0 and AC-2.2 silence are reachable on real inputs.
5. **F-18** — fix the single writer contract for `.pdlc-drift-state.json` and say whether a sync refreshes it.
6. **F-19** — supply a pre-release, in-CI oracle for AC-6.2's packaging guarantee.
7. **F-23** — do not bump the version row without a body change; re-dispatch with the correct iteration index.

Low findings F-20–F-22 fold into the same revision but do not independently gate.

VERDICT: Needs revision
{"high": 2, "medium": 5, "low": 3}
