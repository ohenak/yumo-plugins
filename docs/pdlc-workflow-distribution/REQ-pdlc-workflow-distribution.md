---
feature: pdlc-workflow-distribution
ready: true
depends-on: []
---

# REQ — pdlc-workflow-distribution

| Field | Value |
|---|---|
| Upstream | `docs/design/MASTER-PLAN-engineering-loop.md` (Break 3, order 1) |
| Downstream | `pdlc-merge-phase`, `pdlc-consolidation-agent`, `pdlc-engineering-loop` |
| Cross-Reviews | `CROSS-REVIEW-{software-engineer,test-engineer}-REQ-v{1..11}.md` — twenty-two files, all on `feat-pdlc-workflow-distribution` |
| LEARNINGS | `docs/pdlc-workflow-distribution/LEARNINGS-pdlc-workflow-distribution.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude | 12.0 | 2026-07-28 |

> **v12.0 is a content revision** addressing the v11 SE review (1H/2M/4L) and v11 TE review
> (2H/4M/2L); see §10 for the finding-by-finding disposition. The six blocking answers this
> revision settles:
>
> 1. **The classify-before-create oracle is stated at the layer that implements it — bash — and the
>    JS-seam wording is retracted.** v11 mandated a call-order spy "over the seams the runtime adapter
>    already injects (`_checkFile`, `_readFile`, `_writeFile` and the directory-creation seam)".
>    Measured at HEAD: `runtime-adapter.js`'s `rtDevInjections` has no `_writeFile`, the queue's
>    injection block has no `_checkFile`, and **no directory-creation seam exists anywhere in the JS
>    layer** (zero `mkdir` hits in `.claude/workflows/orchestrate-queue.bundle.js`); and decisively,
>    NFR-5 puts the classifier and every probe in bash, which a jest double cannot observe
>    (SE v11 F-01, TE v11 F-02). AC-2.9(4) now declares **two test-only environment seams the scripts
>    own** — `PDLC_TRACE_FILE` (append one line per probe and per directory creation, inert when
>    unset) and `PDLC_FAULT` (a closed two-token set forcing one named operation to report failure) —
>    and AC-6.5's oracle is the **trace**, with a `PATH`-front-loaded `mkdir` shim as the permitted
>    alternative. AC-0.5 step 2's guard oracle is restated over the same seams. Both are declared in
>    §4 with owner and default.
> 2. **The invalidation ladder is re-derived for the world it actually runs in, and its dead rung is
>    given a reachable fixture.** Measured at v12: a temp-sibling + `mv` replace over an *unwritable
>    file* in a **writable** directory **succeeds** (`mv rc=0`), so v11's test (b) fixture never
>    entered the ladder at all, and `unlink` in an unwritable directory fails (`rm rc=1`) — so under
>    pure permission fixtures step 2 was unreachable and one of four mandated falsifying tests was
>    unsatisfiable (TE v11 F-01). AC-2.9(2a) now carries the reachability derivation with its
>    measurements, scopes step 2 to **non-permission** replace failures (`ENOSPC`/quota, an immutable
>    file, a directory at the path), and rebuilds test (b) on `PDLC_FAULT=drift-state-replace`.
> 3. **The invalidation record's emitter is named, it survives `json-tool-absent`, and it no longer
>    discards the run's `writeFailures`.** Step 1 emits through the JSON tool when one was discovered
>    — carrying the entries already collected this run, so AC-4.1 row 3 still names them — and
>    otherwise through a **`printf` of a fixed literal** interpolating four scalars, none of them a
>    path or free text, so it needs no escaping and does not violate NFR-5's ban on hand-rolled JSON
>    serialisation. The `json-tool-absent` fallback's empty `writeFailures` is a stated residual
>    (TE v11 F-04, SE v11 F-04, SE v11 F-05).
> 4. **`drift-state-invalidated`'s top-of-precedence claim gets an overlap fixture, and the ladder's
>    two failure lines are assertable.** New mandated test **(e)** — fixture (a) plus a malformed
>    manifest — falsifies "reports the upstream reason instead", which every isolated fixture passed
>    (TE v11 F-04). Steps 1 and 2 gain **failure** lines beside their success lines, and tests (b) and
>    (c) must assert the preceding failures in order, so a run that never attempted the earlier rungs
>    is no longer observationally identical to one that did (TE v11 F-08).
> 5. **`readBytes_json` is renumbered out of CPython's reserved range, one form is normative, and its
>    exit is declared at *every* call site.** CPython exits `2` on a usage error (measured), so a
>    mis-invoked or stubbed `$PY_BIN` was indistinguishable from "unreadable" — the one outcome that
>    is permission-derived and therefore already unverifiable at uid 0 (TE v11 F-07). The contract is
>    now `0` / **`10`** unreadable / **`11`** absent / **`12`** malformed, all four re-measured at v12,
>    with the heredoc the normative form. AC-4.3 and AC-1.6 now state their exit-`10` outcome instead
>    of enumerating three (TE v11 F-05), and the *directory-at-the-path* half of `10` is called out as
>    non-permission-derived — so it is the one unreadable fixture that runs at uid 0 (SE v11 F-06).
> 6. **The uid-0 rule's skip row carries the same "name what you did not verify" discipline as its
>    filter row, and its checklist stops re-describing fixtures it can cite.** v11's example row
>    swallowed the whole invalidation ladder and the `checkEnabled`-escape proof with no aggregate
>    residual (TE v11 F-06); and its Write row described tests (a) and (b) with their permissions
>    **inverted** and counted three where there were four, so a fixture built from the checklist could
>    not exercise the rung it was named for (SE v11 F-02). The checklist now cites AC-2.9(2a)'s five
>    mandated tests by reference, and a skipping runner must print one residual list and is declared
>    **not** the surface the 85% branch floor is measured on.
>
> **Also settled**: AC-1.8(iv)'s axis 2 is **conditioned** on axis 5 and read at
> `<resolved repoRoot>/pdlc/workflows/build-runtime.mjs`, with the {marker present, root unresolved}
> cell given an explicit expectation, so totality is stated over a satisfiable sub-product
> (SE v11 F-03, TE v11 F-03).
>
> ---
>
> **Carried forward from v11.0**, which addressed the v10 SE review (2H/2M/4L) and v10 TE review
> (1H/3M/3L); see §10. The seven blocking answers **v11.0** settled:
>
> 1. **An invalidated drift state file is a *record*, not an absence — so the `checkEnabled` escape
>    survives a permanently unwritable consumer.** v10's ladder landed both of its outcomes on
>    AC-4.1 **row 1**, which is evaluated *above* the `checkEnabled` row, so a consumer whose
>    `.claude/workflows/` is populated but never writable (hardened checkout, root-owned `.claude/`,
>    `noexec,ro` bind mount on the D-DIST-06 runners) was blocked on every future invocation with
>    AC-0.3b's documented escape unreachable — the very consequence AC-2.9(1) rejected its
>    alternative for (SE v10 F-01). AC-2.9(2a) step 1 now writes a **schema-valid invalidation
>    record** (`schemaVersion 1`, `baselineStatus` `unresolved`/**`drift-state-invalidated`**,
>    carrying the flag this run resolved), which blocks through AC-4.1 **row 4** and leaves row 2
>    reachable; the unlink becomes step 2, the fallback for the narrower case (file unwritable,
>    directory writable). AC-1.0 gains `drift-state-invalidated` as an eighth member at the top of
>    its precedence, and a fourth mandated test (d) falsifies the escape claim.
> 2. **`readBytes_json` has an executable form and a four-way exit-code contract, and the citation
>    it carried was false.** Measured at HEAD: the shipped `pdlc/hooks/scripts/*.sh` loop is
>    interpreter *discovery* and reads no path, and the one shipped JSON read is
>    `json.load(sys.stdin)` under a bare `except Exception` that **collapses** absent, unreadable and
>    malformed — the exact conflation AC-1.0's precedence, AC-0.4 and AC-2.4 need three members for
>    (SE v10 F-02, TE v10 F-06). AC-1.1a now mandates the read, its exit codes (`0` parsed / `2`
>    unreadable / `3` absent / `4` malformed, all four re-measured at v11) and the rule that the
>    discovery loop is what is reused, never the read.
> 3. **Classify-before-create is pinned by a call-order spy at the injected IO seam.** v10's
>    assertion was conditional on a `situation` field AC-2.6's schema does not have, and both orders
>    are observationally identical on every mandated fixture, so a P0 ordering constraint three ACs
>    depend on had no falsifying oracle (TE v10 F-01). AC-6.5 and AC-2.9(1) now mandate one: **no
>    directory-creation call before the last classification probe of the last row**, over the
>    `_checkFile` / `_readFile` / `_writeFile` seams the runtime adapter already injects. No schema
>    change.
> 4. **AC-1.8(iv)'s `baselineReason` generator gains the AC-0.3a marker as a fifth axis.** With the
>    maintainer marker present, `${CLAUDE_PLUGIN_ROOT}` is not consulted and its being unset is *not
>    an error* (AC-0.4) — so the deciding input for two of the axis values was not an axis and the
>    totality assertion was false on half the generated space; and this repo, the only verification
>    surface (§0 fact 10), is itself marker-present (TE v10 F-03). AC-1.0's overlap fixture is
>    scoped marker-absent for the same reason.
> 5. **The uid-0 rule is stated over *any* permission-bit fixture, read-side or write-side.** v10
>    enumerated five read-side states and then mandated five write-side `chmod` fixtures two ACs
>    away, which under root go red for an environment reason — the same noise the rule exists to
>    prevent (TE v10 F-04). The rule now has a mechanical predicate, a checklist table with both
>    sides, and AC-2.9(2)/(2a)'s fixtures explicitly in the skip row (a read-only mount is permitted,
>    not mandated). AC-0.4's `plugin-root-unreadable` and AC-0.5's untraversable-root case are now in
>    **both** rows — example fixtures skip, AC-1.8(iv)'s axis values filter — with the two
>    precedence pairs only they generate added to the unverified list (SE v10 F-03).
> 6. **AC-2.9(2a)'s own writes have tokens and verbatim lines.** `operation` grows to **nine**
>    members (`drift-state-invalidate`, `drift-state-unlink`, both stderr-only), each ladder step has
>    a mandated verbatim message, and each mandated test asserts one — the gap this REQ had just
>    closed for `operation` one AC earlier (TE v10 F-02, SE v10 F-06).
> 7. **AC-6.5 assertion (a) is conditional and globbed.** Measured: `git ls-files -s` on an untracked
>    path prints nothing and exits `0`, so v10's unconditional wording was **red**, not vacuous,
>    during the RED phase the `--others` fixture source exists to support (SE v10 F-04); and the
>    assertion now globs `pdlc/hooks/scripts/*.sh` so §0 fact 15's class fix covers all five scripts
>    (SE v10 F-07). Its live-checkout scope is stated, since (b) is the fixture-local half.
>
> **Also settled**: NFR-6 carries its two exceptions in its own sentence (TE v10 F-05); AC-0.5 step
> 2's `traverse` guard has a named injected-`traverse` unit oracle instead of a "cannot happen in
> practice" note (TE v10 F-07); and AC-6.5's `git init -q` evidence is relabelled onto step 1's
> actual (a)/(b)/(c), with `traverse(F)` covering (b) (SE v10 F-05).
>
> ---
>
> **Carried forward from v10.0**, which addressed the v9 SE review (2H/4M/1L) and v9 TE review
> (2H/3M/3L); see §10. The eight blocking answers **v10.0** settled:
>
> 1. **A drift-state write that fails never leaves a *believable* old file behind.** AC-2.9(2) gave
>    the failed `mkdir`/replace an exit code and a stderr line but left the previous run's file on
>    disk — with `writeFailures: []` and possibly every row `in-sync` — and the queue's only input is
>    that file's contents, so it mapped to *proceed silently* on a run whose drift could not be
>    recorded: the false green this feature exists to eliminate, one layer up (SE v9 F-01).
>    AC-2.9(2a) adds a mandatory **invalidation ladder** — unlink the stale file, else truncate it in
>    place to `{}` (which AC-4.1 row 1 already blocks on, `schemaVersion != 1`), else print and accept
>    a *stated* residual — and AC-4.1's "No freshness clause" paragraph is re-derived with that case
>    in it instead of asserting it cannot happen.
> 2. **The execute bit is mandated in the working tree, not only in the git index.** Measured here:
>    after `git update-index --chmod=+x s.sh`, `git ls-files -s` reports `100755` while `ls -l`
>    reports `-rw-r--r--` and `./s.sh` exits **126**. So v9's `git ls-files -s` pin went green while
>    AC-6.5's bare-path invocation — whose fixture copies *worktree* modes — went red, on two
>    different objects (SE v9 F-02, TE v9 F-08). §6 now mandates `chmod +x`, §4 requires both bits,
>    AC-6.5 asserts `[ -x ]` on the copied path as well as the index mode, and §0 fact 15's error
>    code is corrected from `EACCES` to **exit 126**.
> 3. **`readBytes` is parameterised by its reader, and the manifest's reader is the JSON tool.**
>    v9 defined `readBytes(p)` as "the content-hash utility exits `0`" and then applied it to AC-0.4's
>    manifest read, so removing `shasum`/`sha1sum` made a perfectly readable manifest report
>    `plugin-root-unreadable` with `rows: []` — contradicting §4, AC-1.1, AC-1.2, AC-1.8 and NFR-5,
>    and making `hash-tool-absent`, the top member of v9's new row-reason precedence, unreachable
>    (TE v9 F-01, SE v9 F-03). AC-1.1a now defines `readBytes_hash` and `readBytes_json` separately,
>    every call site names its reader, and **AC-1.0 gains a declared precedence over its seven
>    manifest-level reasons** so the overlap v9 introduced has one answer.
> 4. **Exit `4` means a write was *attempted and failed*; `repo-root-unresolved` is exit `3`.**
>    AC-3.3 row 1 read "or the drift state file could not be written at all", which AC-2.6 says is
>    exactly what `repo-root-unresolved` produces — so AC-3.8's third population had two mandated exit
>    codes (TE v9 F-02). The distinction *failed write* vs *no write target* is now stated at AC-3.3,
>    AC-4.1, AC-2.4, AC-2.6 and AC-2.9(2).
> 5. **Classification happens before creation.** AC-2.9(1) had every read-only surface `mkdir -p` the
>    directory whose absence AC-1.1 classifies on, with the order unstated — so `parent-absent`, which
>    AC-1.8(i) mandates as first-class and which AC-6.5 and AC-3.8 both derive their required
>    classification from, was reachable only under one of two readings, and AC-6.5 could pass for a
>    reason other than the one it gives (TE v9 F-03). The order is now normative: the whole drift
>    computation is evaluated against the filesystem **as observed before this run created anything**.
> 6. **`writeFailures[].operation` is a closed seven-member set and `stage` is deleted.** Both were
>    printed to the operator and read by the queue with no domain and no oracle, in a document where
>    every other operator-visible set is enumerated (SE v9 F-04, TE v9 F-04).
> 7. **AC-6.5's fixture is `git init -q` and nothing more.** Measured: on a commitless `git init`
>    directory, `git worktree list --porcelain` prints the worktree with no `bare` line,
>    `git rev-parse --git-dir` exits `0` and `--show-toplevel` returns the same path — AC-0.5 step 1
>    (a)–(c) all pass. v9's added `add -A && commit` bought nothing and could fail the feature's only
>    end-to-end oracle on a container with no git identity or a maintainer with `commit.gpgsign`
>    (SE v9 F-05).
> 8. **The uid-0 rule is stated separately for the property test.** "Each such test skips" is written
>    for example-based fixtures; two of the five permission-only fixtures are *axis values* of
>    AC-1.8's property test, so the rule as written either skipped the whole totality/precedence
>    property under root or narrowed the cross product with no marker. It now **filters the affected
>    axis values, prints the reason once, asserts the remainder, and names the invariants left
>    unverified** (TE v9 F-05).
>
> **Also settled**: `enumerate(D)` has one definition (`[ -r D ] && [ -x D ]`) in both places it
> appears (SE v9 F-06); AC-0.5 step 2's root carries the same `traverse` check as step 1(b), so
> AC-1.1's `A(p)` termination argument covers both resolution routes (TE v9 F-06); and AC-3.3's
> normative Then admits the directory AC-2.9(1) creates (TE v9 F-07).
>
> ---
>
> **Carried forward from v9.0**, which addressed the v8 SE review (2H/3M/2L) and v8 TE review
> (1H/4M/2L); see §10. The eight blocking answers **v9.0** settled:
>
> 1. **Every writer in this feature creates `.claude/workflows/` when it is absent, and every
>    mandated write has a defined failure outcome.** New **AC-2.9** decides both. v8 mandated the
>    drift-state write on *every* drift computation (AC-2.4, AC-2.6, AC-2.7) while specifying
>    directory creation only for sync (AC-3.4, AC-3.8) — so on the population AC-0.3b calls universal
>    at rollout the mandated write had no defined target, and AC-0.3b's own interim escape
>    (`checkEnabled: false`) was unreachable because the flag travels only through a file that was
>    never created (SE F-01). AC-2.9 also supplies what the REQ had nowhere: a `writeFailed` outcome —
>    `writeFailures[]` in the drift state file, exit `4` in AC-3.3, a queue block in AC-4.1 — and makes
>    **every delete and every overwrite conditional on a re-read-and-compare-verified backup**, closing
>    the path in which AC-3.9's "backup then delete" destroyed the only loadable artifact (SE F-02).
> 2. **The permission predicate is stated operationally, and it is *search* (`x`), not *read* (`r`).**
>    New **AC-1.1a** defines the three probes the whole feature is written in terms of (existence,
>    traverse, read-bytes), names the syscall/`test` form of each, and records the measurement that
>    makes the substitution a defect and not a quibble: a directory at mode `0111` establishes absence
>    while `[ -r ]` is false, and a directory at `0444` makes `[ -r ]` true while every child probe
>    fails — the two predicates err in opposite directions and v8 used the wrong one in AC-1.1,
>    AC-1.2, AC-1.8(i), AC-0.5 step 1(b) and AC-1.0's `plugin-root-unreadable` (SE F-03, TE F-03).
> 3. **AC-1.1's upward-ancestor rule is now stated the same way in all four places that encode it**,
>    in terms of *the first existing ancestor* rather than *the parent*, and the disagreeing case has
>    its own generated axis value — `ancestor-untraversable` (TE F-02, TE F-06). AC-1.8(i)'s
>    `consumerPath` axis is therefore **five-valued**, and `present-unreadable` no longer secretly
>    covers an absent path.
> 4. **AC-1.2's four row reasons have a declared precedence** — `hash-tool-absent` >
>    `plugin-artifact-missing` > `plugin-artifact-unreadable` > `consumer-artifact-unreadable` — and
>    AC-1.8 gains clause **(iv)** asserting reason totality and determinism the way (i)–(iii) do for
>    states. AC-1.8(i)'s axes generate rows satisfying three reason conditions at once, and three
>    golden-output oracles choose their remediation *by reason*, so evaluation order was the de-facto
>    spec (TE F-04).
> 5. **AC-1.8(i)'s mapping table is qualified against (ii)'s precedence** — it states states given a
>    present hash tool and a present-readable `pluginPath`, and the two dominating rows are named — so
>    the cell `{hash tool absent} × {pluginPath absent} × {parent-absent}` has one answer (SE F-04).
> 6. **AC-6.5's fixture is a git work tree, built from tracked *and* untracked-not-ignored files,
>    with modes preserved.** The two constructions v8 offered as "equivalent" are not: a plain file
>    copy is not a git repository, so AC-0.5 step 1 never applies, step 2 finds no `.claude/` anchor,
>    and the only end-to-end bootstrap oracle in the feature resolved `repo-root-unresolved` and
>    failed all three of its assertions (TE F-01). `git ls-files` also lists the *index* only, so the
>    files under test during the RED phase were invisible (SE F-05) — the source is now
>    `--cached --others --exclude-standard`.
> 7. **The two scripts this feature ships are mode `100755`, pinned by a test, and the three existing
>    sibling scripts are corrected in the same landing step.** §0 fact 15 records the measurement:
>    every shipped script is `100644` today while `hooks.json` invokes them as bare paths, so
>    AC-6.5's bare-path invocation of `sync-workflows.sh` would have failed `EACCES` for a reason
>    unrelated to its assertions (SE F-05).
> 8. **AC-2.8's `--force` message names both backups, keyed by the artifact each belongs to.** R's
>    bundle is backed up under `{R.id}`, the retired path `p` under `{basename(p)}` (AC-3.9), and the
>    row that exists to tell the operator what happens to `p` named only the first (TE F-05).
>
> **Also settled**: AC-3.8's Given restated with the two populations for which it is satisfiable and
> the non-git-consumer-with-no-`.claude/` case answered (TE F-01, second half); the builder's
> node-builtins-only dependency recorded as a constraint so AC-6.5's fixture provably needs no
> install step (SE F-06, §0 fact 16); and the `id -u == 0` degradation named, with skip-with-reason
> mandated so five permission fixtures cannot silently flip to the wrong branch under a containerised
> runner (TE F-07).
>
> ---
>
> **Carried forward from v8.0**, which addressed the v7 SE review (0H/4M/3L) and v7 TE review
> (2H/1M/4L);
> see §10 for the finding-by-finding disposition. The six blocking answers **v8.0** settled:
>
> 1. **The fresh-consumer bootstrap classifies as `missing`, not `unknown`.** AC-1.1's `missing`
>    condition is now "absence is **established**" — the path is absent and its parent is either
>    readable **or itself absent**. v7's "parent directory readable" made the case where
>    `.claude/workflows/` does not exist at all — AC-3.8's Given and AC-6.5's entire premise, both
>    P0 — fall to `unknown`, which AC-3.1 refuses to copy: two P0 ACs and the only end-to-end
>    bootstrap oracle in the feature were unreachable. AC-1.8(i)'s `consumerPath` axis is
>    correspondingly **four-valued** (`parent-absent` / `absent` / `present-unreadable` /
>    `present-readable`) so the case is generated rather than assumed (TE F-02).
> 2. **AC-2.8's `in-sync` row has a real remediation** — plain `sync-workflows.sh`. v7 declared it
>    "not reachable", which is true only of a drift state file written *by a sync run*; the hook and
>    `--check` never copy, so an all-`in-sync` consumer still holding
>    `.claude/workflows/orchestrate-dev.js` is the feature's **primary and universal-at-rollout**
>    case, and AC-2.8's own closing paragraph mandates warning in it. "Not reachable" is now scoped
>    to `generatedBy: "sync"` (TE F-01).
> 3. **AC-6.5's fixture is built from the working tree, not `git clone` of `HEAD`.** A clone copies
>    committed history, so the only bootstrap test would be red for the whole implementation batch
>    (TDD) and green-on-stale-content afterwards — both failure modes invisible from the suite. The
>    invariant it proves is now stated: *the bootstrap works against the code in this checkout*
>    (SE F-03, TE F-03).
> 4. **`plugin-artifact-unreadable` is a fourth member of AC-1.2's closed row-reason set.** v7 gave
>    the consumer side a dedicated reason and left the plugin side widened, so a present-but-
>    unreadable plugin-cache file was reported *missing* and the operator told to reinstall — which
>    cannot fix a permission bit. The four reasons now differ exactly where their remediations do
>    (SE F-01).
> 5. **The backup-`id` namespace rule is stated once and completely**: `{row ids} ∪ {retired
>    basenames}` pairwise distinct **and** every member matching the `id` charset. v7's three
>    narrower rules left `basename(p) == R.id` legal and left retired basenames unconstrained in the
>    filename position (SE F-02).
> 6. **AC-2.8 prints a backup *directory plus filename pattern*, never a concrete path** — `{stamp}`
>    is generated by the future `--force` run and does not exist when the warning is printed, so a
>    golden oracle had two readings and one of them was unimplementable (SE F-04).
>
> **Also settled**: AC-6.2's "no test runs the builder" qualified against AC-6.5's isolated fixture
> (SE F-05); AC-2.8's unreachable `baselineStatus unresolved` clause deleted, with AC-2.5a named as
> its owner (SE F-06, TE F-04); §4's `git` row and AC-0.5's rationale now state the residual
> wrong-root risk when `git` is absent and pin what that fixture asserts (TE F-05); AC-4.2's
> remediation list split by level (TE F-06); AC-2.6's `retiredPresent` described as a projection with
> a per-surface measurement point for `supersedingState` (TE F-07).
>
> ---
>
> **Carried forward from v7.0**, which addressed the v6 SE review (1H/2M/5L) and v6 TE review
> (1H/3M/3L):
>
> 1. **AC-6.4's RED fixture has a legal home, stated two ways so neither door is closed.** The
>    mandated fixture root is a **non-git temp tree** under `os.tmpdir()` (the house pattern —
>    `pdlc/workflows/__tests__/fixtures/tmpGitFixture.js` already builds fixtures that way), so the
>    directory-walk discovery branch is the one exercised and no fixture is ever tracked; and
>    `**/__tests__/**` is added as a **fourth exemption rule** so that any in-repo test fixture or
>    golden-output datum quoting the superseded convention cannot make
>    `coveredViolations(repoRoot) == ∅` permanently red. Without both, the only implementation green
>    on both mandated assertions is the one whose RED case cannot fire (SE F-01, TE F-01).
> 2. **Repo-root resolution derives the *work tree*, never the parent of a git directory**
>    (AC-0.5 step 1, rewritten to `git worktree list --porcelain`). The v6 rule silently resolved a
>    submodule or `--separate-git-dir` consumer to `<super>/.git/modules` — a readable directory that
>    is neither `$HOME` nor `/`, so every declared guard passed on a bogus root. Inside a git work
>    tree, a failed derivation now goes **straight to `repo-root-unresolved`**, never to the upward
>    walk: a wrong root is worse than a refusal (SE F-02, TE F-04).
> 3. **`git` is declared as the third external tool in §4**, with a minimum version (2.7.0, for
>    `git worktree list --porcelain`) and a stated behaviour when it is absent, older, or the
>    repository is bare. NFR-5's "exactly two external tools" is corrected (TE F-04).
> 4. **A present-but-unreadable `consumerPath` has a state and a reason.** AC-1.2's closed row-reason
>    set gains `consumer-artifact-unreadable`, AC-1.1's `missing` is narrowed to *absent with a
>    readable parent*, and AC-1.8(i)'s two byte-presence axes become three-valued
>    (`absent` / `present-unreadable` / `present-readable`). Previously the only reachable answer was
>    `missing`, which sync copies over with no backup (SE F-03, TE F-05).
> 5. **The `retiredPresent` remediation is conditioned on the superseding row's state.** AC-3.9's
>    guard means a plain sync provably cannot clear `retiredPresent` when the superseding row is
>    `local-edit`/`unverified`; AC-2.8(iv) and AC-4.2 now name the remediation that can actually fix
>    each case, so the golden-output oracle for that state has one correct answer (TE F-02).
>
> AC-6.5 names its verification surface, its isolation and its queue observable (v6 TE F-03).
>
> Rules adopted in v4 and still in force: **the version row is bumped only when the body changed**,
> and the review iteration index is derived from the highest cross-review file on the branch.

> **Scope in one line.** Ship the executable workflow artifact inside the plugin package, detect
> drift between it and the runtime-loaded consumer copy, and give the operator one explicit
> command to repair it — so a merged workflow improvement actually executes.

## 0. Grounding

This REQ is grounded against commit **`5630d58`** on `feat-pdlc-workflow-distribution`, with a
**clean working tree** — every hash and enumeration below is of committed content, re-measured for
v7.0 (the tree is unchanged from `3dab335` apart from committed cross-review documents, so every
v5.0 hash still holds; fact 14's enumeration was re-derived from scratch at `5630d58`, and its
output grew by two paths purely because two more cross-review documents were committed — all of
which AC-6.4's exemption rule removes, so the covered-violation set is unchanged). v1 of this REQ was grounded against `cb5e5f7` and modelled the ES
module as the distribution unit; the concurrent bundle work (untracked at v1, landed in `3991b4d`)
has superseded that. All hashes below are `sha1`, measured 2026-07-27 in
`/Volumes/T9/workspace/yumo-plugins`. **Facts 15 and 16 were added at v9.0 and measured at the
current branch `HEAD`** (`git ls-files -s pdlc/hooks/scripts/` and `build-runtime.mjs:23-25`); both
are properties of files unchanged since `5630d58`.

| Node | Path | `orchestrate-dev` | `orchestrate-queue` |
|---|---|---|---|
| A. Repo source (ES module) | `pdlc/workflows/{name}.js` | `2cfc66c1…` | *(unmodified at HEAD)* |
| A′. Repo generated bundle (tracked) | `.claude/workflows/{name}.bundle.js` | `ae2e586f…` | `b2dd0f74…` |
| A″. Legacy repo copy (tracked, superseded) | `.claude/workflows/{name}.js` | `b8815b28…` | `192974cd…` |
| B. Installed plugin cache | `~/.claude/plugins/cache/yumo-plugins/pdlc/0.10.0/workflows/{name}.js` | `b8815b28…` | `192974cd…` |
| C. Consumer runtime copy | `.claude/workflows/{name}.js` | `b8815b28…` | `192974cd…` |

In this repo A″ and C are the same files (this repo is also a consumer). `git ls-files .claude/`
returns all four paths — **both** the bundles and the legacy `.js` copies are tracked today.

Facts this REQ must respect, each verified above:

1. **The executing artifact is the bundle, not the module.** `CLAUDE.md` and
   `pdlc/workflows/build-runtime.mjs` both state the runtime allows no `import`, no second
   `export`, no `fs`/`process`. `pdlc/workflows/orchestrate-dev.js` imports `fs`; it is not
   loadable. `.claude/workflows/orchestrate-dev.bundle.js` is.
2. **The bundle is a transform of its sources, never byte-equal to them.** Module syntax is
   stripped, bodies are IIFE-wrapped, `runtime-adapter.js` is inlined. Node A and node A′ hashes
   above differ by construction, so "byte-identical to the plugin source" is only a meaningful
   oracle when both sides are the *same kind* of artifact.
3. **The installed plugin package contains no bundle.** `…/pdlc/0.10.0/workflows/` holds
   `orchestrate-dev.js`, `orchestrate-queue.js`, `package.json`, `package-lock.json`, `__tests__/`
   — no `*.bundle.js`, no `build-runtime.mjs`, no `runtime-adapter.js`. A consumer holding only
   the installed plugin can neither copy nor regenerate the executing artifact. This is the
   premise BL-01 must prove, and REQ-DIST-06 is what makes it true.
4. **The installed layout has no `pdlc/` segment.** It is `${CLAUDE_PLUGIN_ROOT}/workflows/…`.
   The `pdlc/workflows/…` form is the *repo* layout only.
5. **The plugin version does not identify workflow content.** Cached `0.9.0` and `0.10.0` ship
   byte-identical `orchestrate-dev.js` (`b8815b28…` both). Any drift signal keyed on plugin
   version would assert a difference that does not exist.
6. **Two plugin versions are cached concurrently** (`0.9.0`, `0.10.0`). "The installed plugin" is
   not singular on disk and must be resolved, never globbed.
7. **Live, *committed* drift exists in this repo today.** Node C (`b8815b28…`) differs from node A
   (`2cfc66c1…`). The working tree is clean at `3dab335`, so this is not an uncommitted edit
   someone forgot to sync — it is drift that has been merged and archived, which is the stronger
   form of the argument: an uncommitted edit would be dismissible as work-in-progress. The v1 claim
   that a spot-checked consumer was "byte-identical, last synced five days earlier" was not
   reproducible and is withdrawn; the table above replaces it.
8. **Two artifacts claim the same workflow name in one directory.** `.claude/workflows/` currently
   holds `orchestrate-dev.js` **and** `orchestrate-dev.bundle.js` (likewise for the queue). Both
   declare `meta.name: "orchestrate-dev"`. Which one the workflow runtime resolves is not
   documented anywhere in this repo and is not assumed by this REQ — it is **BL-05**. Whatever the
   answer, shipping a stale `.js` beside a fresh `.bundle.js` is the exact failure mode this
   feature exists to prevent, so the legacy copies must be retired, not merely ignored (AC-0.7,
   AC-3.9).
9. **`build-runtime.mjs` hand-writes each bundle's `meta`; it does not propagate the module's.**
   `pdlc/workflows/build-runtime.mjs:84-85` says so explicitly — "`meta` must be a pure literal and
   the first statement, so each bundle carries its own hand-written copy rather than re-exporting
   the module's" — and `DEV_META` / `QUEUE_META` are string constants inside the builder. Neither
   literal has a `version` key. Correspondingly, `export const meta` is **not** the first statement
   or only export of the *modules*: in `orchestrate-dev.js` it is at line 43, preceded by
   `import * as fs from "fs"` (line 15), and is one of 20 `export`s. The first-statement/only-export
   rule constrains the emitted **bundle**, never the source module. v3's AC-5.1 asserted the
   opposite; §REQ-DIST-05 is rewritten accordingly.
10. **There is no CI on this repo.** `.github/` does not exist and no other CI configuration is
    present. The only automated verification surface that exists today is
    `cd pdlc/workflows && npm test` (jest; `pdlc/workflows/__tests__/` holds **15** `*.test.js`
    files plus `fixtures/` and `helpers/`, including `__tests__/runtimeBundle.test.js` which
    already asserts bundle freshness against `.claude/workflows/` at `:22-25` and `:77-79`). Every
    AC in this REQ addresses that surface; standing up hosted CI is deferred and bound (D-DIST-06).
11. **The sibling hooks are bash, not POSIX `sh`, and already solve JSON parsing.** All three of
    `pdlc/hooks/scripts/*.sh` start `#!/usr/bin/env bash` and each carries the same
    Python-interpreter discovery loop (probe `python3`, `python`, `py` by executing them; never
    block if none is found). This feature parses and writes four JSON files, so it reuses that
    mechanism rather than reinventing one (NFR-5, §4).
12. **The plugin package root is `pdlc/`.** `.claude-plugin/marketplace.json` declares
    `"source": "./pdlc"`. Nothing outside `pdlc/` can ship to a consumer — which is why the built
    bundles cannot be shipped from `.claude/workflows/` and REQ-DIST-06 moves the build output to
    `pdlc/workflows/dist/`. Combined with fact 4, an artifact built to `pdlc/workflows/dist/X`
    installs at `${CLAUDE_PLUGIN_ROOT}/workflows/dist/X` — the `pdlc/` segment is dropped, the
    `dist/` segment is **not**.
13. **`build-runtime.mjs` has exactly one output directory today.**
    `pdlc/workflows/build-runtime.mjs:29` declares a single
    `OUT_DIR = resolve(REPO_ROOT, ".claude", "workflows")`; `:170` is `mkdirSync(OUT_DIR, …)` and
    the **only content write is `writeFileSync(path, contents, "utf8")` at `:184`**, inside the
    `for (const { file, contents } of bundles)` loop at `:172-186`. AC-6.1 **retargets** that
    constant; it does not add a second one. The builder is not, and does not become, a writer of
    `.claude/workflows/`, of the sync manifest, or of the drift state file.
14. **The superseded distribution convention is stated in exactly five files that are neither
    generated nor archived spec history.** This is measured with the **same command AC-6.4's test
    runs** — a union of four literal patterns, no prose qualifier — at `5630d58`:

    ```
    git grep -l -E '\.claude/workflows/(orchestrate-dev|orchestrate-queue|\*)\.js|managed manually'
    ```

    Verbatim output, pasted unaltered — 27 lines, in the order `git grep -l` emits them (SE v6
    F-04; v6 collapsed the cross-reviews into brace expressions and moved
    `docs/PLAN-pdlc-integration-boundary-gates.md` out of position while calling the result
    "verbatim", so a reader who pasted the command got a diff on the one fact whose purpose is
    mechanical re-derivability):

    ```
    .claude/workflows/orchestrate-dev.bundle.js
    .claude/workflows/orchestrate-dev.js
    .claude/workflows/orchestrate-queue.bundle.js
    .claude/workflows/orchestrate-queue.js
    docs/PLAN-pdlc-integration-boundary-gates.md
    docs/_queue/QUEUE.md
    docs/design/MASTER-PLAN-engineering-loop.md
    docs/orchestrate-dev-workflow/DECISIONS-orchestrate-dev-workflow.md
    docs/orchestrate-dev-workflow/FSPEC-orchestrate-dev-workflow.md
    docs/orchestrate-dev-workflow/LEARNINGS-orchestrate-dev-workflow.md
    docs/orchestrate-dev-workflow/PLAN-orchestrate-dev-workflow.md
    docs/orchestrate-dev-workflow/PROPERTIES-orchestrate-dev-workflow.md
    docs/orchestrate-dev-workflow/REQ-orchestrate-dev-workflow.md
    docs/orchestrate-dev-workflow/TSPEC-orchestrate-dev-workflow.md
    docs/pdlc-workflow-distribution/CROSS-REVIEW-software-engineer-REQ-v1.md
    docs/pdlc-workflow-distribution/CROSS-REVIEW-software-engineer-REQ-v2.md
    docs/pdlc-workflow-distribution/CROSS-REVIEW-software-engineer-REQ-v3.md
    docs/pdlc-workflow-distribution/CROSS-REVIEW-software-engineer-REQ-v4.md
    docs/pdlc-workflow-distribution/CROSS-REVIEW-software-engineer-REQ-v5.md
    docs/pdlc-workflow-distribution/CROSS-REVIEW-software-engineer-REQ-v6.md
    docs/pdlc-workflow-distribution/CROSS-REVIEW-test-engineer-REQ-v1.md
    docs/pdlc-workflow-distribution/CROSS-REVIEW-test-engineer-REQ-v4.md
    docs/pdlc-workflow-distribution/CROSS-REVIEW-test-engineer-REQ-v5.md
    docs/pdlc-workflow-distribution/CROSS-REVIEW-test-engineer-REQ-v6.md
    docs/pdlc-workflow-distribution/REQ-pdlc-workflow-distribution.md
    pdlc/workflows/orchestrate-dev.js
    pdlc/workflows/orchestrate-queue.js
    ```

    **This output is not stable and is not required to be.** Every cross-review round adds one or
    two `docs/pdlc-workflow-distribution/CROSS-REVIEW-*` lines (25 at `1075e7d`, 27 here) — all of
    which the exemption rule removes. What is stable, and what AC-6.4 asserts, is the difference.

    Subtracting AC-6.4's exemption **rule** (generated trees `.claude/workflows/**` and
    `pdlc/workflows/dist/**`; per-feature artifact directories — any `docs/<dir>/` containing a
    `REQ-*.md`, which is exactly `docs/orchestrate-dev-workflow/` and
    `docs/pdlc-workflow-distribution/` today; test trees `**/__tests__/**`, which contribute no hits
    today) leaves the **covered violations**, five files:

    | Covered file | Superseded text at | Correction |
    |---|---|---|
    | `docs/_queue/QUEUE.md` | `:41-42` (`.claude/workflows/*.js`, "managed manually") | name `.claude/workflows/*.bundle.js`, synced by `sync-workflows.sh` |
    | `docs/design/MASTER-PLAN-engineering-loop.md` | `:82-83` (same two forms) | same |
    | `docs/PLAN-pdlc-integration-boundary-gates.md` | `:134`, `:184` | same |
    | `pdlc/workflows/orchestrate-dev.js` | `:5` header comment | same |
    | `pdlc/workflows/orchestrate-queue.js` | `:5` header comment | same |

    Three further normative files already name `.bundle.js` and therefore **do not appear in the
    grep output at all** — `CLAUDE.md:58-59`, `pdlc/skills/orchestrate-dev/SKILL.md:90`,
    `pdlc/skills/orchestrate-queue/SKILL.md:175`. They are not part of AC-6.4's oracle; they need
    the `dist/` path update, which §6 carries as an ordinary in-scope edit. v5's fact 14 listed them
    inside a table framed as the grep's output, which is what made the table sum to more rows than
    the command returns (SE v5 F-06, TE v5 F-03).

    v2–v5 each maintained this list by hand and each was wrong. AC-6.4 is restated so that no list
    is maintained at all: the covered set **is** `grep(patterns) − exemptionRule(path)`, both halves
    machine-computable.
15. **Every shipped hook script is mode `100644`, yet `hooks.json` invokes them as bare paths — and
    the fix must reach the *working tree*, not only the git index.** Measured at `HEAD`:

    ```
    $ git ls-files -s pdlc/hooks/scripts/
    100644 … pdlc/hooks/scripts/check-scope-field.sh
    100644 … pdlc/hooks/scripts/guard-harvest-before-delete.sh
    100644 … pdlc/hooks/scripts/nudge-consolidation.sh
    ```

    while `pdlc/hooks/hooks.json` registers each as
    `"\"${CLAUDE_PLUGIN_ROOT}\"/hooks/scripts/<name>.sh"` — a bare-path invocation, which the shell
    refuses on a file with no execute bit: the `execve` fails `EACCES` and the **shell exits `126`**
    with `permission denied` (measured on this platform; v9 stated the exit as `EACCES`/1, which no
    test could match — SE v9 F-02). This is a **pre-existing latent defect of
    the three shipped hooks**, not something this feature introduces, and it is load-bearing twice
    over: AC-6.5's command block invokes `pdlc/hooks/scripts/sync-workflows.sh` as a bare path, and
    the "exact remediation command" every warning AC prints is that same bare path (§4). This feature
    therefore ships its two scripts executable, pins **both** bits with a test, and corrects the
    three siblings in the same landing step (§6; SE v8 F-05). The pinning assertion is written over
    the **globbed directory**, not over the two new scripts, because that is what makes this a class
    fix rather than one instance of it (AC-6.5 assertion (a); SE v10 F-07).

    **The index mode and the working-tree mode are two different objects, and v9 mandated only the
    first (SE v9 F-02, TE v9 F-08).** Measured here in a fresh `git init` directory:

    ```
    $ git update-index --chmod=+x s.sh
    $ git ls-files -s s.sh      → 100755 …            # index says executable
    $ ls -l s.sh                → -rw-r--r-- …        # working tree does not
    $ ./s.sh                    → permission denied; exit 126
    ```

    So a `git ls-files -s` assertion can be green in the very checkout where the bare-path
    invocation fails — and AC-6.5's fixture is a copy of the **working tree**, so the working-tree
    bit is the one its invocation depends on. The landing step therefore runs `chmod +x` (which, with
    `core.fileMode` true — the default on this platform — also records `100755` in the index; the
    explicit `git update-index --chmod=+x` remains as the belt-and-braces form for a checkout with
    `core.fileMode false`), and AC-6.5 asserts the index mode **and** `[ -x ]` on the copied path.
16. **`build-runtime.mjs` depends on node builtins only.** `pdlc/workflows/build-runtime.mjs:23-25`
    imports `fs`, `path` and `url` and nothing else; it reads no `package.json` and requires no
    `node_modules/`. AC-6.5's fixture tree therefore needs **no install step**, which is what makes
    the bootstrap sequence (`node pdlc/workflows/build-runtime.mjs` in a bare copied tree) runnable
    at all. This is a constraint on the builder, not an accident: a future builder dependency breaks
    AC-6.5 and must add an install step to its fixture in the same commit (SE v8 F-06).

## 1. Problem

`SKILL.md` files load live from the installed plugin — `CLAUDE.md` states it: "edit them here
and both interactive Claude Code sessions and the Ptah engine pick up the change automatically
(no copies to sync)." Workflow scripts do not. Both orchestrator SKILLs record the same
convention:

> Canonical plugin source: `pdlc/workflows/orchestrate-dev.js`
> Runtime-loaded consumer copy: `.claude/workflows/orchestrate-dev.js`
> … Until a formal `pdlc install` mechanism exists, this copy is managed manually.

"Managed manually" means: a workflow improvement can be authored, reviewed, merged and archived
in `yumo-plugins`, and never run anywhere, because no consumer copied it. There is no check, no
warning, and no symptom. The pipeline keeps working — on the old script.

The bundle work makes this strictly worse. There are now **three** nodes in the chain, not two:

**Today** (measured, §0):

```
A. repo  pdlc/workflows/*.js  --build-runtime.mjs-->  A′. .claude/workflows/*.bundle.js   [tracked]
                                                          |
                                                     (no channel)
                                                          X
                                    B. ${CLAUDE_PLUGIN_ROOT}/workflows/   ships *.js only,
                                                                          no bundle at all
                                                          |
                                                  (manual copy today)
                                                          v
                                       C. consumer .claude/workflows/*.js  [legacy, stale]
```

**After this REQ** (the change REQ-DIST-06 makes — note A′ moves):

```
A. repo  pdlc/workflows/*.js  --build-runtime.mjs-->  A′. pdlc/workflows/dist/*.bundle.js
                                                          + dist/distribution-manifest.json
                                                          |          [tracked; sole build output]
                                          (plugin publish/update, version-pinned)
                                                          v
                                    B. ${CLAUDE_PLUGIN_ROOT}/workflows/dist/*.bundle.js
                                                          + workflows/dist/distribution-manifest.json
                                                          |
                                               (sync-workflows.sh, explicit)
                                                          v
                                       C. consumer .claude/workflows/*.bundle.js  [untracked]
                                          (legacy consumer .js retired — AC-3.9)
```

In the **maintainer** repo the plugin root is substituted (`<repoRoot>/pdlc`, AC-0.3a) so the same
`sync-workflows.sh` run copies A′ → C directly, without a published release in between. That is the
only difference between the maintainer repo and any other consumer; the path joins are identical.

Today node A′ sits at a path the plugin package cannot reach (§0 fact 12), node B ships no bundle
at all (§0 fact 3), and node C is maintained by a human's memory. Every later feature in the
engineering-loop plan ends with "and then the improved pipeline runs" — which is false while any of
those links is unmechanised.

This REQ closes A′→B (REQ-DIST-06: build to a shippable path and ship it) and B→C (detection +
explicit sync), and retires the A″/C legacy `.js` copies. Node A→A′ is already closed by
`build-runtime.mjs --check` and `__tests__/runtimeBundle.test.js`. Refreshing node B from the
marketplace is Claude Code's own plugin-update mechanism and is out of scope (D-DIST-05).

## 2. User stories

- **US-01** — As the operator, I want to be told at session start when a consumer repo is running
  a stale workflow artifact, so I never debug behavior that the source no longer describes.
- **US-02** — As the operator, I want a single command to bring a consumer repo's workflow copies
  up to date.
- **US-03** — As the operator, I want the drift check to tell me *which direction* the drift runs,
  because a consumer copy edited locally is a different problem from a consumer copy left behind,
  and I want that answer to be deterministic rather than an artifact of when files were checked out.
- **US-04** — As the consolidation agent, I want a merged workflow change to be published in the
  plugin package and to reach the consumers it was written for, otherwise my promotion is a no-op.

## 3. Requirements

### REQ-DIST-00 — Managed set and comparison baseline

- **AC-0.1** — Who: any drift check. Given the plugin ships a distribution manifest at
  **`<pluginRoot>/workflows/dist/distribution-manifest.json`** — where `<pluginRoot>` is
  `${CLAUDE_PLUGIN_ROOT}` in a consuming repo (AC-0.3) and `<repoRoot>/pdlc` in the maintainer repo
  (AC-0.3a) — When the check enumerates **the managed set**, Then that manifest is the sole
  authority for it: one row per managed artifact,
  each row `{ id, pluginPath, consumerPath, artifactVersion, pluginSha1, retires }`, with
  `pluginPath` relative to **`<pluginRoot>`** and `consumerPath` and every member of `retires`
  relative to the consumer repo root.

  `retires` is an array (possibly empty, never absent) of the consumer-relative paths this row
  **supersedes** — the data that makes AC-3.9's delete guard computable. At v1,
  `orchestrate-dev.bundle.js` carries `retires: [".claude/workflows/orchestrate-dev.js"]` and
  `orchestrate-queue.bundle.js` carries `retires: [".claude/workflows/orchestrate-queue.js"]`. No
  path may appear in two rows' `retires`, and no `retires` member may equal any row's
  `consumerPath`.

  **The backup-`id` namespace rule, stated once and completely (SE v7 F-02).** AC-3.4's retention
  and parse `id` set is the union of the managed rows' `id` values and the basenames of the
  manifest's `retired` array, so those two populations share one namespace and one filename
  interpolation position. The manifest is therefore well-formed only when

  > the multiset **`{ R.id : R ∈ rows } ∪ { basename(p) : p ∈ any row's retires }` is pairwise
  > distinct**, **and every member of it matches the `id` charset**
  > `^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$`.

  Violation of either clause ⇒ the manifest is malformed — `baselineStatus` `unresolved` with reason
  `manifest-malformed`, which is **AC-1.0's** closed manifest-level set (AC-2.4 is only the hook's
  exit behaviour for it; SE v6 F-06).

  v7 stated this as three narrower rules (no shared path, no `retires` member equal to a
  `consumerPath`, no two `retires` members sharing a basename) and bound the charset to row `id`s
  only, which left two holes in the same namespace. **(i)** `basename(p) == R.id` for some retired
  path `p` and some managed row `R` — e.g. row `id` `orchestrate-dev` with a retired path
  `.claude/legacy/orchestrate-dev` — was legal, and it collapses exactly what TE v6 F-06 closed: one
  retention group, one backup namespace, `{id}.{stamp}.bak` ambiguous on restore (AC-3.5), and the
  newest-5-per-`id` property test with no well-defined grouping key. **(ii)** A retired basename
  entered the filename position unconstrained, so a leading dot, a 200-character name, or a name
  itself ending in `.{stamp}.bak` produced a backup filename AC-3.4's regex mis-parses or never
  prunes. Stating the rule over the union closes both, and it subsumes the pairwise-basename rule it
  replaces. The `id` values at v1 are
  literally **`orchestrate-dev`** and **`orchestrate-queue`** (TE v5 F-08) — golden-output and
  backup-filename fixtures pin those strings.

  There is exactly one manifest location and it is written the same way in AC-0.2, AC-0.3a, AC-5.1,
  AC-6.1, AC-6.2, AC-6.2a and §4: built at `pdlc/workflows/dist/distribution-manifest.json`,
  installed at `${CLAUDE_PLUGIN_ROOT}/workflows/dist/distribution-manifest.json` (§0 facts 4 + 12 —
  the `pdlc/` segment is dropped on install, the `dist/` segment survives), read in the maintainer
  repo at `<repoRoot>/pdlc/workflows/dist/distribution-manifest.json`. All three are the same
  `<pluginRoot>`-relative path `workflows/dist/distribution-manifest.json`. Any AC, table row or
  fixture that writes it without the `dist/` segment is wrong.

  Globbing a directory to *discover managed rows* is prohibited. The `id` charset
  `^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$` — no `/`, no `..`, no leading dot — exists because AC-3.4
  interpolates the value into a backup filename, and it is applied to **every member of the union
  above**, not to row `id`s alone; a manifest with any non-conforming member is treated as malformed
  (AC-1.0, reason `manifest-malformed`). *(P0)*
- **AC-0.2** — Who: any drift check. Given the manifest, When it is read, Then it contains exactly
  the two runtime-loadable bundles at v1 —
  `workflows/dist/orchestrate-dev.bundle.js → .claude/workflows/orchestrate-dev.bundle.js` and
  `workflows/dist/orchestrate-queue.bundle.js → .claude/workflows/orchestrate-queue.bundle.js` —
  and **no** ES module source, `runtime-adapter.js`, `build-runtime.mjs`, `package.json`,
  `package-lock.json`, `.gitignore`, `__tests__/` or `node_modules/` entry. Those are build
  inputs or tooling and must never be copied into a consumer. The manifest additionally carries a
  top-level `retired` array, **defined as the union of every row's `retires`** (AC-0.7).
  A manifest whose top-level `retired` is not exactly that union is malformed — `baselineStatus`
  `unresolved`, reason `manifest-malformed` (**AC-1.0**; AC-2.4 governs only the hook's exit code
  for that condition, SE v6 F-06) — it is a
  convenience index, never an independent source of truth. *(P0)*
- **AC-0.3** — Who: any drift check in a **consuming** repo. Given the comparison baseline, When
  `<pluginRoot>` is resolved, Then it is **node B**, the installed plugin root addressed via
  `${CLAUDE_PLUGIN_ROOT}` — the same mechanism all three shipped hooks in `pdlc/hooks/hooks.json`
  already use. A consumer machine generally has no `yumo-plugins` working tree, so a checked-out
  source tree is never a baseline for a consuming repo. *(P0)*
- **AC-0.3a — Maintainer-repo plugin-root substitution.** Who: any drift check in the **maintainer**
  repo. Given the resolved repo root contains `pdlc/workflows/build-runtime.mjs` (the unambiguous
  maintainer-repo marker), When `<pluginRoot>` is resolved, Then

  > **`<pluginRoot>` := `<repoRoot>/pdlc`** — the *package root* (§0 fact 12), not
  > `${CLAUDE_PLUGIN_ROOT}` and not `pdlc/workflows/dist/`.

  and **everything downstream joins onto it unchanged**: the manifest is read from
  `<pluginRoot>/workflows/dist/distribution-manifest.json`, and each row's `pluginPath` (AC-0.2:
  `workflows/dist/orchestrate-dev.bundle.js`) resolves to
  `<repoRoot>/pdlc/workflows/dist/orchestrate-dev.bundle.js`. This is the whole substitution: one
  variable, one binding, no second path-composition rule to get wrong. v4 phrased this as "the
  baseline is `pdlc/workflows/dist/`", which double-nests the join into
  `pdlc/workflows/dist/workflows/dist/…` and therefore resolved every maintainer-repo row to
  `unknown` / `plugin-artifact-missing` — the exact failure the AC exists to remove (TE v4 F-02).

  Rationale, and this is a correctness requirement not a convenience: the maintainer repo's tree is
  ahead of the last published release **by construction** (§0 facts 5–7), so treating it as an
  ordinary consumer of the released cache would (i) report every row `missing`/`unverified`
  forever, (ii) block the queue on its own repo, and (iii) on the first release that ships bundles,
  overwrite freshly built bundles with stale released ones. With this AC the maintainer repo's
  green path is **build → sync → everything `in-sync`** (see AC-6.1: the builder writes `dist/`
  only; `sync-workflows.sh` is what populates `.claude/workflows/`), which is what makes AC-3.3
  exit 0 and AC-2.2 silence reachable on real inputs and therefore testable at all. *(P0)*
- **AC-0.3b — The pre-manifest consumer.** Who: a consumer whose installed plugin predates this
  feature — at first release, that is **every** consumer, since no cached version ships a manifest
  today (§0 fact 3). Given `<pluginRoot>/workflows/dist/distribution-manifest.json` does not exist,
  When any surface runs, Then **`baselineStatus` is `unresolved` with reason `manifest-absent`
  (AC-1.0), `rows` is `[]`, and `retiredPresent` is `[]` meaning *not evaluated*** — and every
  surface reacts to the manifest-level status, not to the (empty) row set: the SessionStart hook
  warns (AC-2.5a) and exits `0` (AC-2.4), `--check` exits `3` (AC-3.3's `baselineStatus unresolved` row), sync copies nothing
  and retires nothing (AC-3.1, AC-3.9), and the queue reports `blocked` (AC-4.1's `baselineStatus unresolved` row). This is
  correct, not a bug — nothing has been verified, so nothing may be claimed.

  **`retiredPresent: []` here means "not evaluated", not "none present".** Retirement is
  manifest-derived (AC-0.7), so with no manifest the retired set is unknowable — and §0 fact 8 shows
  the paths really are present in this very repo. A reader must never treat `[]` as evidence of
  absence; `baselineStatus` is what carries the meaning, and it is `unresolved` (TE v5 F-04).

  **The single documented escape is to update the plugin** to a release that ships the manifest;
  AC-2.5a's warning and AC-4.2's report must therefore name plugin update as the remediation
  whenever the reason is `manifest-absent`, not `sync-workflows.sh` (which cannot help).

  **The interim escape is two-step, and the test must assert both steps.** Setting
  `distribution.checkEnabled: false` in `.claude/pdlc.config.json` does not by itself unblock the
  queue: AC-4.1 row 1 (drift state file absent/unparseable) is evaluated *above* the `checkEnabled`
  row, and the queue never opens the config file (AC-4.3). The flag reaches the queue only through
  the drift state file, so the sequence is **write the config → run the hook or `--check` (the shell
  writer resolves the flag and records it) → the queue proceeds**. A one-step fixture that writes
  the config and runs the queue blocks, correctly (TE v5 F-09).

  This state is expected to be transient and universal at rollout; the test suite asserts it as a
  first-class path rather than treating it as an error case. *(P0)*
- **AC-0.4** — Who: any drift check. Given multiple plugin versions are cached (today `0.9.0` and
  `0.10.0`), When `<pluginRoot>` is resolved in a consuming repo, Then resolution uses
  `${CLAUDE_PLUGIN_ROOT}` verbatim and never enumerates, sorts, or version-compares cache
  directories. Given `${CLAUDE_PLUGIN_ROOT}` is unset **or empty**, Then `baselineStatus` is
  `unresolved` with reason `plugin-root-unset` (AC-1.0) and no cache directory is guessed. Given it
  is set to a path that is not a **traversable** directory — `traverse(p)` false, **AC-1.1a** — or
  the manifest at `<pluginRoot>/workflows/dist/distribution-manifest.json` exists but its bytes
  cannot be read **by the reader that reads it** (`readBytes_json` fails, AC-1.1a), Then the reason is
  `plugin-root-unreadable`, whose
  remediation is the environment/permissions fix (AC-2.5a, AC-4.2) and never a plugin reinstall. The
  two reasons are separated on exactly the axis their remediations differ on, which is the same
  argument AC-1.2 makes on the row side.

  **The manifest's reader is the JSON tool, never the content-hash utility (TE v9 F-01, SE v9 F-03).**
  v9 wrote this clause as "`readBytes` fails" while AC-1.1a defined `readBytes` as *the content-hash
  utility exits `0`*. Composed on the one fixture NFR-5 requires — neither `shasum` nor `sha1sum` on
  `PATH` — a perfectly readable manifest then failed the probe, so the baseline was `unresolved` with
  reason `plugin-root-unreadable` and `rows: []`, the operator was shown a permissions fix for a
  missing utility, and `hash-tool-absent` — a **row** reason, and the top member of AC-1.2's
  precedence — became unreachable, taking AC-1.8(iv)'s single-valuedness assertion with it. Three
  statements are therefore normative here: this probe is `readBytes_json`; **hash-tool absence is
  never a manifest-level reason** (with no hash tool the baseline still resolves and every row is
  `unknown`/`hash-tool-absent`, §4, AC-1.2, NFR-5); and AC-1.0's eight reasons now carry a declared
  precedence for the remaining overlaps.

  This AC applies only when AC-0.3a's maintainer-repo marker is absent; when
  it is present, `${CLAUDE_PLUGIN_ROOT}` is not consulted at all and its being unset is not an
  error — **including for the invocation path of the sync script itself**, which is
  `<pluginRoot>/hooks/scripts/sync-workflows.sh` under the same binding (REQ-DIST-03 preamble,
  AC-6.5), i.e. `pdlc/hooks/scripts/sync-workflows.sh` in the maintainer repo. Every surface that is
  required to print "the exact remediation command" (AC-2.1, AC-2.5, AC-2.5a, AC-2.8, AC-4.2)
  prints that expansion of `<pluginRoot>`, so the command is always runnable in the repo the reader
  is standing in. *(P0)*
- **AC-0.5** — Who: any drift check. Given the process starts in an arbitrary subdirectory, When
  the consumer repo root is resolved, Then resolution is, in this order:
  1. **`git` is on `PATH` and `git rev-parse --git-dir` succeeds** (i.e. we are inside *some* git
     repository or its git directory). Then the root is the **main worktree's work-tree path**,
     read as the `worktree` value of the **first** record of

     ```
     git worktree list --porcelain
     ```

     `git worktree list` always emits the main worktree first and always prints absolute paths, and
     it returns the main worktree even when the process is inside a linked worktree or inside the
     `.git` directory itself (verified at `5630d58`: from `/Volumes/T9/workspace/yumo-plugins/.git`
     it still prints `worktree /Volumes/T9/workspace/yumo-plugins`). The result is accepted only if
     **(a)** the first record carries no `bare` line, **(b)** the printed path is a directory with
     **traverse permission** — `[ -d p ] && [ -x p ]`, the `traverse(p)` probe of **AC-1.1a**, *not*
     `[ -r p ]`: every subsequent operation resolves paths *through* this directory rather than
     enumerating it, and `[ -r ]` both rejects a usable `0111` root and accepts an unusable `0444`
     one (SE v8 F-03) — and **(c)** `git -C <path> rev-parse --show-toplevel` returns that same path.
     If step 1 applies but any of (a)–(c) fails, resolution goes **straight to step 3** — never to
     step 2.
  2. Only when step 1 does **not** apply — `git` is absent from `PATH`, or `git rev-parse --git-dir`
     fails because this is not a git repository at all — walk upward from `$PWD` to the nearest
     ancestor containing `.claude/`, **stopping before** `$HOME` and before `/`. The result is
     accepted only if it satisfies the **same** `traverse(p)` check as step 1(b) — `[ -d p ] && [ -x p ]`,
     AC-1.1a; a walk result that fails it goes to step 3. (TE v9 F-06: the check was written into
     step 1 only, while AC-1.1's `A(p)` termination argument cites "the repo root, which exists and is
     traversable by AC-0.5 step 1(b)" for roots produced by **either** route — including the non-git
     population of AC-3.8's second row. Extending the check to step 2 is the cheaper of the two
     repairs and makes the termination argument true of both routes. In practice the walk can only
     return a directory it traversed to find `.claude/` in, so this check fails only under a
     concurrent permission change — but the guarantee must be stated, not inferred. **Its oracle is
     named rather than left as a "cannot happen in practice" note (TE v10 F-07), and it is named at
     the bash layer (TE v11 F-02):** the branch is unreachable through a filesystem fixture and would
     otherwise ship uncovered against the 85% branch floor, so it is driven by **AC-2.9(4)'s
     `PDLC_FAULT=repo-root-traverse`** seam, which forces this `traverse(p)` check to return false
     without touching the filesystem. The test asserts `baselineStatus` `unresolved` /
     `repo-root-unresolved` **and, from the `PDLC_TRACE_FILE` trace, that no `create` line was
     emitted**. v11 stated this as "inject a `traverse` that returns false", which is a JS
     dependency-injection idiom the bash writer does not have — the same defect as v11's
     classify-before-create spy, and it is repaired the same way.)
  3. Otherwise `baselineStatus` is `unresolved` with reason `repo-root-unresolved` (AC-1.0).

  **Why the work tree and not the parent of the git directory (SE v6 F-02, TE v6 F-04).** v6 read
  `git rev-parse --path-format=absolute --git-common-dir` and took its **parent**. That is correct
  only for the ordinary `<root>/.git` layout. For a **submodule** the same command returns
  `<super>/.git/modules/<name>`, whose parent is `<super>/.git/modules`; for a clone made with
  `--separate-git-dir` it returns the external git directory. In both cases the parent is a readable
  directory that is neither `$HOME` nor `/`, so **every guard this AC declares passes on a bogus
  root** and AC-3.8 then *creates* `.claude/workflows/` inside a git directory — the same failure
  class the `$HOME` rejection exists to prevent, one layer along. `git worktree list --porcelain`
  returns a *work tree* by construction, and check (c) re-derives it independently, so a path that
  is not a work-tree root cannot be accepted.

  **Why a failure inside a git repo refuses instead of walking (TE v6 F-04).** Step 2's bounded
  `.claude/` walk can terminate at a subdirectory that happens to contain a stray `.claude/`,
  silently producing the wrong consumer root with every downstream state computed against it. A
  wrong root is strictly worse than a refusal — that is the same argument that makes `$HOME` a
  rejection rather than a fallback — so once we know we are inside a git repository, the only two
  outcomes are the verified work-tree root or `repo-root-unresolved`. The walk exists for the
  genuinely non-git consumer.

  **That guarantee is conditional on `git` being installed, and the REQ says so (TE v7 F-05).**
  "We know we are inside a git repository" is itself derived from `git rev-parse --git-dir`. On a
  machine with **no `git` binary** that nonetheless holds a git repository, step 1 never applies, the
  walk runs, and the stray-`.claude/` hazard this paragraph calls "strictly worse than a refusal" is
  live. That is an accepted residual risk, not an oversight: refusing without `git` would strand
  every genuinely non-git consumer, which is the population step 2 exists for. Behaviourally the
  answer is decided — **walk** — and the required `git`-absent fixture (§4) therefore asserts the
  walk result, never `repo-root-unresolved`.

  **Minimum git version and absence.** `git worktree list --porcelain` has existed since **git
  2.7.0** (2016), which §4 declares as the minimum; v6's `--path-format` required 2.31 and had no
  declared minimum, no owner and no default. On git older than 2.7.0 the sub-command fails, which is
  a step-1 (a)–(c) failure ⇒ `repo-root-unresolved`, never a silent demotion to the walk. `git`
  absent from `PATH` entirely is *not* a failure of step 1 — step 1 never applies — so a non-git
  consumer machine still resolves via step 2, exactly as before. All three cases (`git` absent,
  `git` present but older than 2.7.0, present but the repository is bare) have a stated answer and
  are required fixtures.

  **A linked git worktree is not a distinct consumer.** `pdlc/workflows/orchestrate-dev.js:1869`
  dispatches every Phase-I implementation agent with `{ isolation: "worktree" }` and `:1882` merges
  the `feat-{feature}-{task}-worktree` branch back, so linked worktrees are created routinely by
  this pipeline. A bare `git rev-parse --show-toplevel` (v5's step 1) returns the *linked worktree's* path,
  which — after AC-3.9's landing step untracks and gitignores `.claude/workflows/` — is a directory
  where the managed artifacts do not and should not exist: every row would be `missing`, the hook
  would warn on every implementation-agent session, `--check` would exit 1 and the queue would block
  (SE v5 F-05). Resolving the **main** worktree instead means all worktrees of one clone share one
  `.claude/workflows/`, one sync manifest and one drift state file, which is also the only reading
  under which AC-2.7's "the drift state on disk reflects post-sync truth" holds across a Phase-I
  batch. If a future runtime is shown to load workflow artifacts per-worktree, per-worktree sync is
  D-DIST-07 — it is not in this feature.

  A resolved root equal to `$HOME` or to `/` is **always** rejected as `unresolved` **with reason
  `repo-root-unresolved`**, regardless
  of which step produced it — including when step 1 succeeded. Rationale: `~/.claude/` exists on every machine running Claude Code (it
  is where the plugin cache AC-0.3 depends on lives), so a naive upward walk from a non-`.claude`
  consumer terminates at `$HOME` and sync then creates `$HOME/.claude/workflows/`,
  `$HOME/.claude/workflows/.pdlc-sync-manifest.json` and `$HOME/.claude/workflows/.pdlc-backups/`,
  polluting global config. No operation in this feature ever writes under `$HOME/.claude/`. *(P0)*
- **AC-0.6** — Who: any drift check producing a human-facing report. Given the consumer's
  `.claude/workflows/` directory, When the **report** (not the managed set) is produced, Then the
  directory is enumerated once — this is the **only** operation in the feature that needs
  `enumerate(D)` = `[ -r D ] && [ -x D ]` rather than `traverse(D)` alone (AC-1.1a — one definition,
  stated identically here, in AC-1.1a's table and in §4; SE v9 F-06), because it is the only one that
  reads directory *entries*; when it fails the report says so and no row state changes — to list
  files with no manifest row as `not-managed`, excluding every
  entry whose basename begins with `.pdlc-` (which covers `.pdlc-sync-manifest.json`,
  `.pdlc-drift-state.json` and the `.pdlc-backups/` directory). `not-managed` appears **only** in
  human-facing output; it never appears in the `rows` array of `.pdlc-drift-state.json` (AC-2.6),
  so no state file describes itself and no golden-output oracle is self-referential. This
  enumeration is read-only: it stats names, never contents (NFR-3). *(P0)*
- **AC-0.7 — Retirement is per-row, not global.** Who: the maintainer. Given the migration from
  `.js` consumer copies to `.bundle.js` consumer copies, When the manifest is authored, Then each
  superseding row carries its predecessors in its own `retires` array (AC-0.1) —
  `orchestrate-dev` → `[".claude/workflows/orchestrate-dev.js"]`,
  `orchestrate-queue` → `[".claude/workflows/orchestrate-queue.js"]` — and the top-level `retired`
  array is exactly their union.

  **Why per-row rather than a flat list (TE v5 F-02).** AC-3.9's delete guard is "delete a retired
  path only after the row that supersedes it is in place". A flat array carries no key back to a
  row, and basename matching cannot recover one (`orchestrate-dev.js` and
  `orchestrate-dev.bundle.js` share no basename; a "strip `.bundle`" rule is an unauthorised
  inference that breaks on the third managed artifact). With `retires` the guard is a per-row
  relation a fixture can state and a test can falsify: *row A `unknown`/`plugin-artifact-missing`,
  A's `retires` path present, sync runs ⇒ that path still exists afterwards.*

  A retired path is **not** a managed row (it is never compared, never a state in AC-1.1) and is
  **not** `not-managed` (it is not left alone); it is a path sync quarantines under AC-3.9. This
  exists because §0 fact 7 — the only live drift this repo can demonstrate — is on exactly those
  two files, and under AC-1.5 alone they would be permanently untouchable. *(P0)*

**Comparison semantics for a generated artifact (resolves the "in-sync means what?" question).**
Both sides of the comparison are the *same* generated bundle: node B ships the bundle that
`build-runtime.mjs` emitted at publish time, and node C holds a copy of it. "In-sync" is therefore
plain byte equality of two bundles — not source-vs-generated, and not a consumer-side rebuild
(consumers have neither `build-runtime.mjs` nor `runtime-adapter.js`, and this REQ does not add
them). The source→bundle relation stays where it already lives: `build-runtime.mjs --check` and
`__tests__/runtimeBundle.test.js`, run by `cd pdlc/workflows && npm test` (§0 fact 10 — there is
no hosted CI on this repo today).

### REQ-DIST-01 — Drift detection

- **AC-1.0 — Baseline resolution is a precondition, evaluated before any row quantifier.** Who:
  every surface in this feature. Given a drift computation begins, When it runs, Then it first
  produces a **manifest-level** outcome

  > `baselineStatus ∈ { resolved, unresolved }`, and when `unresolved`, a `reason` from the closed
  > set `plugin-root-unset`, `plugin-root-unreadable`, `repo-root-unresolved`, `manifest-absent`,
  > `manifest-malformed`, `json-tool-absent`, `manifest-empty`, `drift-state-invalidated`

  and only when it is `resolved` does it evaluate rows at all. `manifest-empty` is the case "the
  manifest parsed but declares zero managed rows"; it is `unresolved` because a managed set of size
  zero can satisfy any universally quantified claim without verifying anything.

  **`drift-state-invalidated` is the one member no classification ever produces (SE v10 F-01).** It is
  written **only** by AC-2.9(2a) step 1, into a drift state file whose real contents could not be
  written, and it means exactly "nothing in this file is a measurement of this run". It is a member of
  this set because AC-4.1 blocks on `baselineStatus == unresolved` and names `baselineReason` when it
  does, so the value the operator is shown must come from a declared set like every other; and it is
  excluded from AC-1.8(iv)'s generator codomain for the same reason it is in this set — the writer,
  not the classifier, produces it (AC-1.8(iv), AC-2.9(2a)).

  **`baselineReason` is a single scalar too, so these have a declared precedence (SE v9 F-03,
  TE v9 F-01).** v9 gave AC-1.2's four *row* reasons a precedence and left this set with none while
  *adding* an overlap to it (AC-0.4's manifest-read clause). Highest first:

  > **`drift-state-invalidated` > `json-tool-absent` > `plugin-root-unset` > `plugin-root-unreadable` >
  > `repo-root-unresolved` > `manifest-absent` > `manifest-malformed` > `manifest-empty`.**

  `drift-state-invalidated` tops the order trivially rather than interestingly: it is the only member
  that can coexist with *every* other one (the run that failed to write may have failed for any
  upstream reason), and when it is present the file's other fields are by definition not this run's
  measurements, so no lower member could be reported truthfully. Two things make that claim
  falsifiable rather than decorative (TE v11 F-04): the coexistence with **`json-tool-absent`** is
  mechanically real because AC-2.9(2a) step 1 emits its record through a `printf` of a fixed literal
  when no interpreter was found, so the top member does not depend on the tool whose absence is the
  member below it; and the precedence itself is asserted by AC-2.9(2a)'s mandated test **(e)** — a
  failed drift-state write *over* a malformed manifest, expecting `drift-state-invalidated` and not
  `manifest-malformed`. Without (e) every isolated fixture would also pass an implementation that
  reported the upstream reason.

  The rationale is the same as AC-1.2's — remediation order, environment-global before per-artifact,
  and each member is a strictly later step of the same pipeline than the one above it: with no JSON
  reader nothing downstream is measurable at all; then the plugin root must be named, then readable;
  then the consumer root must resolve; only then can the manifest be absent, then malformed, then
  empty. Two consequences are normative rather than inferred:

  - **`hash-tool-absent` is not in this set and never becomes a `baselineReason`.** It is a *row*
    reason (§4, AC-1.2): with no content-hash utility the baseline still resolves — the manifest is
    read by the JSON tool — and every row is `unknown`/`hash-tool-absent`. AC-0.4's `readBytes_json`
    scoping is what makes that true of the probe as well as of the prose.
  - The precedence is **declared, not evaluation order**, and is asserted the way AC-1.2's is: by a
    fixture that satisfies several conditions at once — no JSON tool **and** `${CLAUDE_PLUGIN_ROOT}`
    unset **and** a non-git tree with no `.claude/` — whose expected `baselineReason` is
    `json-tool-absent` alone. That fixture is only valid **with AC-0.3a's maintainer-repo marker
    absent**, and it must be built that way explicitly: with the marker present an unset
    `${CLAUDE_PLUGIN_ROOT}` is not an error at all (AC-0.4), so two of the three conditions the
    overlap is made of disappear and the fixture stops being an overlap (TE v10 F-03). The same
    scoping applies to any fixture pairing `plugin-root-unset` or `plugin-root-unreadable` with a
    lower member. AC-1.8(iv) extends its three reason properties to `baselineReason` over
    this set, with the marker as its second generator axis.

  **Every green outcome in this feature is guarded by `baselineStatus == resolved`, a non-empty
  row set, and an empty `writeFailures` (AC-2.9)**, and each of the three seams states it explicitly: hook silence (AC-2.2), `--check`
  exit `0` (AC-3.3's last row), queue proceed-silently (AC-4.1's last row). Conversely each seam has a
  dedicated non-green outcome for `unresolved`: the hook warns (AC-2.5a), `--check` exits `3`, the
  queue blocks.

  This AC exists because v5 expressed all six manifest-level failures as *per-row reasons* while the
  conditions they name are precisely what prevents rows from existing. Under v5's wording the
  manifest-absent state — which AC-0.3b says is **every** consumer at first release — made
  "every managed row is `in-sync`" vacuously true, so a conforming implementation was silent at the
  hook, exited `0` from `--check` and proceeded in the queue, having verified nothing. That is the
  exact false green this feature exists to eliminate, reachable on the universal rollout state
  (TE v5 F-01). `baselineStatus` and its `reason` are top-level fields of the drift state file
  (AC-2.6), and `rows` is `[]` whenever `baselineStatus` is `unresolved`. *(P0)*
- **AC-1.1** — Who: the operator. Given **a manifest row** — any row, with no precondition on
  either side existing — When the check runs, Then it reports exactly one of the six states in the
  table below, using content hashes and the sync manifest (AC-1.6) where both sides are readable.
  The Given carries no existence qualifier deliberately: three of the six states (`missing`,
  `unknown`, and `unverified` on a never-synced repo) are *defined by* something being absent, so
  a Given that presupposed presence would contradict its own Then (TE v4 F-06). *(P0)*

  | State | Condition | Meaning |
  |---|---|---|
  | `in-sync` | consumer bytes == plugin bytes | nothing to do |
  | `stale` | differ; consumer hash == this row's `consumerHash` in the sync manifest | consumer is behind; safe to sync |
  | `local-edit` | differ; consumer hash != this row's `consumerHash` in the sync manifest | consumer was edited after sync; syncing destroys work |
  | `unverified` | differ; no sync-manifest entry for this row | never synced by this tool; direction unknown |
  | `missing` | `consumerPath`'s **absence is established** — `established-absent(consumerPath)` per **AC-1.1a**: the existence probe returns a definite negative and the **first existing ancestor** on the path is traversable | consumer has no copy |
  | `unknown` | this row's `pluginPath` is absent or present-but-unreadable, this row's `consumerPath` is present but unreadable, or `consumerPath` is absent while its **first existing ancestor is not traversable** so absence cannot be established, or no hash tool (AC-1.2) | nothing was verified for this row |

  Six states, one per manifest row. `not-managed` (AC-0.6) is deliberately **not** in this table:
  it is a property of files that have no manifest row, is report-only, and is never a row state.

  **`missing` is narrowed deliberately (SE v6 F-03, TE v6 F-05).** `missing` is the one non-`unknown`
  state that sync *copies over*, with no backup (AC-3.1, AC-3.4). If it also absorbed
  "present but unreadable", a consumer file that exists — possibly a real local edit behind a
  permission bit, a dangling symlink, an unreadable mount — would be silently overwritten and
  unrecoverable. Absence must therefore be *established*, not merely inferred from a failed read,
  which is why the parent clause is part of the condition rather than an implementation note.

  **An absent ancestor directory establishes absence; only an *existing but non-traversable* ancestor
  defeats it (TE v7 F-02, restated in AC-1.1a's vocabulary at v9).** v7 wrote the clause as "absent
  **and its parent directory readable**".
  Read literally that makes the fresh-consumer and fresh-clone bootstrap — the case where
  `.claude/workflows/` does not exist at all, which is AC-3.8's Given and AC-6.5's whole premise —
  classify as `unknown`, because a non-existent directory is not a readable directory. The
  consequences were that AC-3.8's mandated exit `1` became `3` (AC-3.3's `any row unknown` row), AC-3.1 refused to
  copy the rows AC-3.8 requires it to copy, and AC-6.5's `in-sync` / exit-`0` / *proceed-silently*
  assertions became unreachable — two P0 ACs and the only end-to-end bootstrap oracle in the
  feature, flipped on an undefined axis value. The three-way distinction is therefore explicit:

  **The rule is written over the *first existing ancestor*, and all four statements of it say so
  (TE v8 F-02).** v8's prose applied the test upward to the first existing ancestor while its own
  state table, its three-way table and AC-1.8(i)'s axis table each said "parent absent ⇒ `missing`"
  unconditionally — so the one fixture that distinguishes them (`chmod 000 .claude` with
  `.claude/workflows/` absent) had two correct answers, and the property generator had no axis value
  to produce it with. The upward rule is the surviving reading, because the hazard it guards is real:
  a file can be hidden under an untraversable ancestor at any depth, not only directly under the
  parent. Let `A(path)` be the **first existing ancestor** of `path` — the nearest proper ancestor
  directory that exists, found by walking upward and stopping at the AC-0.5 repo root, which exists
  and is traversable **by whichever of AC-0.5's two routes produced it** — step 1(b) for the git
  route, step 2's identical `traverse` check for the walk route (added at v10; TE v9 F-06) — so the
  walk always terminates. Then, using AC-1.1a's probes:

  | `consumerPath` situation | Absence established? | State |
  |---|---|---|
  | path absent, `A` is the existing parent and `traverse(A)` | yes | `missing` |
  | path absent, parent absent, `A` is a higher existing ancestor and `traverse(A)` (fresh consumer, fresh clone) | yes — nothing can be hiding under a directory that does not exist, and the highest existing ancestor is visible | `missing` |
  | path absent, `A` exists and **not** `traverse(A)` — whether `A` is the parent or a higher ancestor | no — a file could be there and we cannot see it | `unknown` / `consumer-artifact-unreadable` |
  | path present, `readBytes_hash(path)` fails | n/a | `unknown` / `consumer-artifact-unreadable` |

  The table is total over the four situations and each maps to exactly one state; AC-1.8(i)'s
  `consumerPath` axis has one value per row of it (`absent`, `parent-absent`,
  `ancestor-untraversable`, `present-unreadable`) plus `present-readable`, so every row here is
  generated rather than assumed.

  `stale` and `local-edit` are discriminated by the single comparison
  `sha1(consumerPath bytes) == syncManifest[id].consumerHash`. `pluginHash` (AC-1.6) is recorded
  for reporting and for detecting a re-published plugin; it is never the discriminator. The two are
  equal only immediately after a sync.

- **AC-1.1a — The filesystem probes, stated operationally (SE v8 F-03, TE v8 F-03).** Who: the
  implementer and the fixture author. Given that AC-1.1, AC-1.2, AC-1.8(i), AC-0.4 and AC-0.5 are
  written in terms of paths being "readable" or "unreadable", When any of those ACs is implemented or
  a fixture for it is built, Then exactly these four probes are meant, named here once and cited
  everywhere else. Each is a bash one-liner and each is directly assertable, so no AC in this feature
  depends on the ordinary English sense of "readable": *(P0)*

  | Probe | Definition | bash form | Used by |
  |---|---|---|---|
  | `exists(p)` | a definite positive from the existence probe on `p` | `[ -e "$p" ]` true | AC-1.1's present/absent split |
  | `traverse(D)` | **search permission** on directory `D` — the right to resolve a path *through* it and to `stat` a named child | `[ -d "$D" ] && [ -x "$D" ]` | AC-1.1's `established-absent`, AC-0.5 step 1(b), AC-1.2's ancestor clause |
  | `enumerate(D)` | **read permission** on directory `D` — the right to list its entries — **and** traversal, since a listing that yields names still needs `stat` on each of them | `[ -r "$D" ] && [ -x "$D" ]` | AC-0.6's `not-managed` listing, and nothing else |
  | `readBytes_hash(p)` | the **content-hash utility** (§4 — `shasum`\|`sha1sum`) reads `p`'s bytes and exits `0` | `shasum "$p" >/dev/null 2>&1` | AC-1.1's `present-unreadable`, AC-1.2's two `*-unreadable` row reasons — i.e. **managed-artifact content comparison only** |
  | `readBytes_json(p)` | the **JSON tool** (§4 — the discovered Python interpreter) opens, reads and parses `p`, returning **one of four** outcomes — `parsed`, `unreadable`, `absent`, `malformed` — as its **exit code** (`0`, `10`, `11`, `12`); the **normative form is the heredoc block below**, and it is the only form an implementation may ship | see the mandated block below, exit `0`\|`10`\|`11`\|`12` | AC-0.4's manifest read, and every other read of the four JSON files (AC-1.6, AC-2.6, AC-4.3) |

  **`readBytes` is parameterised by its reader, and that is not a quibble (TE v9 F-01, SE v9 F-03).**
  v9 had one `readBytes`, defined as the hash utility's exit status, and listed AC-0.4's manifest read
  among its callers. Composed on NFR-5's required no-hash-tool fixture that made a readable manifest
  report `plugin-root-unreadable` with `rows: []`, contradicting §4, AC-1.1, AC-1.2, AC-1.8(i)/(iv)
  and NFR-5, and making `hash-tool-absent` — the top member of AC-1.2's precedence — unreachable.
  The general form is: **`readBytes_R(p)` is "the reader `R` that this artifact is actually read by
  exits `0` on `p`"**, and every AC that cites it names `R`. There are exactly two readers in this
  feature, and they fail independently: the hash utility can be absent while the JSON tool works
  (⇒ baseline `resolved`, every row `unknown`/`hash-tool-absent`) and the JSON tool can be absent
  while `shasum` works (⇒ baseline `unresolved`/`json-tool-absent`, no rows at all).

  **`readBytes_json`'s operational form is mandated, and it is not the shipped hook code
  (SE v10 F-02, TE v10 F-06).** v10 gave this probe the prose meaning "distinguishing *absent* from
  *unreadable* from *malformed*" and cited "the same interpreter probe already shipped in
  `pdlc/hooks/scripts/*.sh`" as its form. Measured at HEAD, that citation is wrong on both halves:
  the shipped loop (`check-scope-field.sh:13-20`, `guard-harvest-before-delete.sh`,
  `nudge-consolidation.sh`) is **interpreter discovery** — `command -v "$cand" && "$cand" -c "import
  sys"` — and reads no path at all; and the one shipped JSON read
  (`check-scope-field.sh:22-30`) is `json.load(sys.stdin)` inside a bare `except Exception:
  print("")`, which **collapses** absent, unreadable and malformed into one indistinguishable empty
  result. That is precisely the conflation §4 says the JSON tool exists to prevent and that AC-1.0's
  precedence needs three separate members for. So the four other probes each carried an executable
  `test` form while the one probe AC-0.4, AC-2.4 and AC-1.0 all rest on carried a false citation and
  no oracle. What is reused is the **discovery loop only** (`$PY_BIN`); the read itself is new, and
  **must not** use a bare `except Exception`. Its mandated form and exit-code contract — every row
  measured on the maintainer machine at **v12** with `python3 3.12.12`, uid 501:

  | Outcome | Trigger in the read | Exit | Caller maps it to |
  |---|---|---|---|
  | `parsed` | `open(p,'rb').read()` succeeds and `json.loads` succeeds | `0` | proceed |
  | `unreadable` | `OSError` other than `FileNotFoundError` — `PermissionError`, **and `IsADirectoryError`** | **`10`** | AC-0.4's `plugin-root-unreadable` (manifest); AC-2.4's unreadable case; **AC-4.3**'s `checkEnabled` ⇒ `true` + warning; **AC-1.6**'s sync manifest ⇒ every row `unverified` + warning |
  | `absent` | `FileNotFoundError` | **`11`** | AC-0.4/AC-1.0's `manifest-absent` |
  | `malformed` | bytes read but `json.JSONDecodeError` / `UnicodeDecodeError` | **`12`** | AC-1.0's `manifest-malformed` |

  ```
  "$PY_BIN" - "$p" <<'PY'
  import sys, json
  try:
      b = open(sys.argv[1], 'rb').read()
  except FileNotFoundError:
      sys.exit(11)
  except OSError:
      sys.exit(10)
  try:
      json.loads(b.decode('utf-8'))
  except Exception:
      sys.exit(12)
  sys.exit(0)
  PY
  ```

  Measured at v12, in one pass: `0` on a valid file, `11` on an absent path, `12` on a file
  containing `x`, `10` on a `chmod 000` file, `10` on a **directory**. The two-valued readings
  elsewhere in this REQ ("`readBytes_json` fails ⇒ `plugin-root-unreadable`") are shorthand for
  **exit `10`**; every call site that needs the split cites this table, and no call site may
  re-derive it by composing `exists(p)` with a parse step, because the composition is racy and was
  the ambiguity this paragraph removes.

  **Why `10`/`11`/`12` and not `2`/`3`/`4` (TE v11 F-07(ii)).** Measured: CPython itself exits **`2`**
  on a command-line/usage error and `1` on an unhandled exception. v11's `2` therefore collided with
  the interpreter's own reserved code, so a mis-invoked, stubbed or shadowed `$PY_BIN` produced
  exactly the `unreadable` outcome — a **false green on the one exit that is permission-derived and
  therefore already skipped at uid 0** (the uid-0 rule below), i.e. the failure would have been
  invisible on both runners. Moving the feature's codes out of the interpreter's range is cheaper
  than an "and stderr was empty" conjunct on every call site and needs no second observation. `10`,
  `11` and `12` are also disjoint from `sync-workflows.sh`'s own exit codes `0`–`4` (§4, AC-3.3), so
  a probe's exit can never be mistaken for a script's.

  **One form is normative (TE v11 F-07(i)).** The heredoc block above is it; any `-c` rendering is
  illustrative only. Both put the path at `sys.argv[1]` (measured: `"$PY_BIN" - "$p"` ⇒
  `sys.argv[1] == "$p"`), so the choice is not cosmetic for one reason only: the heredoc **redirects
  the child's stdin**, and the SessionStart hook's payload arrives on the *parent's* stdin — as the
  sibling `check-scope-field.sh` shows. The rule that makes this safe is stated rather than left to
  the implementer: the hook **reads and buffers its own stdin payload before the first
  `readBytes_json` call**, and no `readBytes_json` invocation may be placed in a pipeline that
  consumes the payload. A golden exit-code test is written against the heredoc form.

  **The directory case is folded into `unreadable` knowingly, and it is the one unreadable fixture
  that runs at uid 0 (SE v11 F-06).** A directory sitting where one of the four JSON files should be
  is a broken package or a broken consumer tree, not a permission bit; it exits `10` (measured) and
  is reported as `plugin-root-unreadable` / the caller's unreadable case like any other. The
  remediation text AC-2.5a and AC-4.2 print for that reason must therefore be **generic enough to
  cover it** — "the environment / permissions fix on the named path" rather than "the permission bit
  on the plugin cache path"; the AC-0.3b *plugin update* branch is not claimed for it, because the
  writer cannot tell the two causes apart from the exit code alone and a wrong instruction is worse
  than a general one. The compensation is a coverage one: because `IsADirectoryError` is **not**
  permission-derived, the directory fixture does **not** fall under the uid-0 rule and is a required
  fixture on *every* runner — so exit `10` has at least one assertion that survives on a root runner,
  which no `chmod` fixture does.

  and the composite the state table uses:

  > **`established-absent(p)`** := `! exists(p)` **and** `traverse(A(p))`, where `A(p)` is the first
  > existing ancestor of `p` (AC-1.1). Its negation on an absent path — `! exists(p)` and
  > `! traverse(A(p))` — is *absence not established*, i.e. `unknown` /
  > `consumer-artifact-unreadable`.

  **Why search and not read, with the measurement (SE v8 F-03).** The two bits are independent and
  err in opposite directions; both directions are reachable and were measured on the maintainer
  machine with a `/tmp` fixture as a non-root user:

  | Fixture | `[ -r dir ]` | `[ -e dir/known-present ]` | `[ -e dir/absent ]` | Consequence of using `[ -r ]` |
  |---|---|---|---|---|
  | `chmod 111 dir` (`--x`) | **false** | **true** | false | absence *is* establishable, yet v8 classified the row `unknown` / `consumer-artifact-unreadable` and blocked the queue for no reason |
  | `chmod 444 dir` (`r--`) | **true** | **false** | false | a consumer artifact that really exists reports **absence established** ⇒ `missing` ⇒ AC-3.1 copies over it with no backup. Only AC-2.9's verified-backup rule and the copy's own failure now stand between that and data loss |

  The second row is the serious one: it is a silent-overwrite path through the very state AC-1.1's
  `missing` was narrowed to prevent. Every axis-value name in AC-1.8(i) matches these probes.

  **Running as uid 0 (TE v8 F-07, TE v9 F-05, TE v10 F-04).** The rule is stated over **every test in
  this feature whose fixture is built from a permission bit** — `chmod`, ownership, or a read-only
  mount — and not over an enumeration, because v10 enumerated five read-side states and then mandated
  five further permission-derived *write-side* fixtures two ACs away, leaving them with no defined
  behaviour on the root runner D-DIST-06 introduces (TE v10 F-04). The predicate is mechanical: *if
  removing a permission bit is what makes the fixture's expected outcome differ from the
  all-permissions outcome, this rule applies.* The known members, kept as a checklist rather than as
  the definition:

  | Side | Fixtures |
  |---|---|
  | **Read** | AC-1.2's `plugin-artifact-unreadable` and `consumer-artifact-unreadable`; AC-1.1's `ancestor-untraversable`; AC-0.4's `plugin-root-unreadable`; AC-0.5's untraversable-root case; `readBytes_json` exit `10` **when its fixture is a `chmod` one** — the *directory-at-the-path* fixture for the same exit is **not** permission-derived and does not skip (above); AC-4.3's present-but-unreadable config fixture; AC-1.6's present-but-unreadable sync-manifest fixture |
  | **Write** | AC-2.9(2) row 1's `mkdir` and `drift-state-replace` failure fixtures (`EACCES`); **AC-2.9(2a)'s five mandated ladder tests (a)–(e)**, cited by reference and deliberately not re-described here |

  **The checklist cites, it does not re-describe (SE v11 F-02).** v11's Write row said "three
  mandated ladder tests (*(a)* unwritable **file**, *(b)* unwritable **file** + unwritable
  directory, *(c)* both denied)" while AC-2.9(2a)'s own table said (a) unwritable **directory** /
  writable file, (b) the file unwritable, (c) both — and had **four** tests, not three. An
  implementer building fixtures from the checklist would have given (a) an unwritable file, which
  makes step 1 fail and produces (b)'s outcome: the one test that verifies the invalidation record is
  ever written could not pass, and the SE v10 F-01 argument would ship unfalsified. Two statements of
  the same fixture set drift; one statement and a citation cannot. AC-2.9(2a)'s table is the single
  authority for what each ladder fixture is, this row names only *how many* and *where*.

  Under `id -u == 0` `chmod` denies nothing: every read-side fixture reads
  successfully and takes the wrong branch, indistinguishably from a regression, and every write-side
  fixture *succeeds* so its assertion goes red for an environment reason — which is the same noise,
  arriving as a red suite instead of a false green, and is how careless skip rules get added later.
  §0 fact 10 says
  the only verification surface today is a local `npm test`, but D-DIST-06 brings hosted CI into the
  plan and containerised runners commonly run as root, so the marker is what keeps that
  transition honest. An alternative unreadability mechanism (an unreadable mount, an immutable
  attribute) is *not* mandated. The required behaviour differs between the two kinds of test, and
  v9's single sentence covered only the first (TE v9 F-05):

  | Test kind | Required behaviour under `id -u == 0` |
  |---|---|
  | **Example-based** — a fixture that *is* the permission case and asserts one outcome: every fixture in the checklist table above, read-side and write-side (AC-2.9(2) row 1 and AC-2.9(2a) tests (a)–(e) included) | the test **skips with a printed reason** naming uid 0, **and the run prints one aggregate residual list** (below). Never a silent pass, never the non-root assertion, and never a red for the environment. A read-only *mount* is an acceptable substitute an implementer **may** use for the write-side fixtures where the runner offers one, but it is **not mandated** — the mandated behaviour is the skip (TE v10 F-04) |
  | **Property-based** — a generator axis whose *values* are permission-derived while its other combinations are not: AC-1.8(i)'s `ancestor-untraversable` and `present-unreadable`, and AC-1.8(iv)'s `${CLAUDE_PLUGIN_ROOT}` `set-untraversable` value and its untraversable-repo-root value | **filter, do not skip.** Those values are removed from the generator, the reason is printed **once** per run, and the remaining cross product is asserted in full — totality, mutual exclusivity, determinism and AC-1.8(iv)'s reason properties all still run, over both codomains |

  The two rows are about the same fixture in two roles, and a value can be in both: AC-0.4's
  `plugin-root-unreadable` and AC-0.5's untraversable-root case each have a dedicated example fixture
  (row 1 ⇒ skip) **and** appear as axis values of AC-1.8(iv)'s `baselineReason` generator (row 2 ⇒
  filter). v10 listed them in row 1 only, which left an implementer reading the two ACs together
  either skipping AC-1.8(iv) wholesale — surrendering the totality and single-valuedness assertions
  that are the whole point of AC-1.0's precedence — or filtering with no marker and no named residual
  (SE v10 F-03).

  Skipping AC-1.8 wholesale under root would surrender the classifier's entire invariant suite, and
  the coverage floor with it, at exactly the surface D-DIST-06 introduces; filtering silently would
  leave the totality property claiming a state space it no longer covers. The filtered run must
  therefore **name the invariants it did not verify**, and they are exactly these five:
  (a) `ancestor-untraversable ⇒ unknown`/`consumer-artifact-unreadable`; (b) `pluginPath`
  present-but-unreadable ⇒ `plugin-artifact-unreadable` rather than `plugin-artifact-missing`;
  (c) AC-1.2's precedence of `hash-tool-absent` over `consumer-artifact-unreadable` — the pair whose
  overlap only the permission-derived row values generate; and, from AC-1.8(iv)'s codomain,
  (d) AC-1.0's precedence of `plugin-root-unreadable` over `repo-root-unresolved` and
  (e) over `manifest-absent` — the two pairs only the `set-untraversable` value generates
  (SE v10 F-03). Under non-root all five are verified by the
  same property run, which is why the local `npm test` of §0 fact 10 remains the authoritative
  surface until D-DIST-06 lands a non-root runner.

  **The skip row carries the same discipline, because it now hides more than the filter row does
  (TE v11 F-06).** v11 required the *property* row to name the invariants it did not verify and left
  the *example* row with only its per-test printed reasons — while extending that row to cover every
  write-side fixture, i.e. **the whole invalidation ladder and the entire `checkEnabled`-escape
  proof**. Six or more separately-skipped tests are not the same signal as one stated coverage hole,
  and this is exactly the surface D-DIST-06's root runner introduces. A run under `id -u == 0` must
  therefore print, **once**, a residual list naming what the skips cost, and it is exactly these four:

  1. AC-2.9(2a) **step 1** — a failed drift-state write leaves a schema-valid invalidation record
     (tests (a), (e));
  2. AC-2.9(2a) **step 2** — the record's fallback unlink (test (b));
  3. AC-2.9(2a) **step 3** — the announced stale-file residual, and with it NFR-6's claim that
     fail-closed is what a failed write produces (test (c));
  4. **AC-0.3b's `checkEnabled` escape on a permanently unwritable consumer** (test (d)) — the
     falsifying test for the whole SE v10 F-01 argument.

  And the coverage floor is scoped rather than assumed: the **85% branch floor is asserted on a
  non-root runner only** (§0 fact 10's local `npm test`). A skipping runner may report coverage but
  its number is not the gate, because the skipped set is precisely the feature's write-failure
  branches; D-DIST-06 must land a non-root runner before hosted CI can carry that gate, and that
  dependency is recorded there rather than discovered when the number drops.

- **AC-1.2** — Who: the operator. Given `baselineStatus` is `resolved` (AC-1.0) but an individual
  row cannot be evaluated — **the row's `pluginPath` is absent inside an otherwise-resolvable plugin
  root**, **the row's `pluginPath` exists but `readBytes_hash` fails on it** (AC-1.1a), **the row's
  `consumerPath` exists but `readBytes_hash` fails on it, or is absent while its first existing ancestor is
  not traversable so its absence cannot be established** (AC-1.1, AC-1.1a), or no content-hash utility
  is available — When the check runs,
  Then that row is `unknown` and carries a machine-readable `reason` from this closed set:
  `plugin-artifact-missing`, `plugin-artifact-unreadable`, `consumer-artifact-unreadable`,
  `hash-tool-absent`. It is never reported `in-sync` — absence of evidence is not evidence of sync.

  **`consumer-artifact-unreadable` mirrors the plugin side, and it is not cosmetic (SE v6 F-03).**
  v6 covered unreadability on the plugin side only ("does not exist / is unreadable") while
  AC-1.1's `missing` was defined as bare absence, so a present-but-unreadable consumer artifact had
  either no state at all — violating AC-1.8(i)'s "no undefined fall-through" — or was classified
  `missing`, the one state AC-3.1 copies over without a backup. The closed reason set could not
  express the correct answer, so it gains the member rather than widening an existing one. A row
  with this reason is `unknown`: not copied (AC-3.1), exit `3` (AC-3.3), queue `blocked` (AC-4.1),
  remediation "fix the permissions on `consumerPath`" (AC-2.5, AC-4.2).

  **`plugin-artifact-unreadable` applies the identical argument to the plugin side (SE v7 F-01).**
  v7 gave the consumer side a dedicated member and then left the plugin side *widened*:
  `plugin-artifact-missing` covered "does not exist **/ is unreadable**" while AC-1.8(i)'s
  `pluginPath` axis was already three-valued, so two distinct generated inputs collapsed onto one
  reason and no property could distinguish them. The consequence was operator-visible, not cosmetic:
  AC-4.2 routes `plugin-artifact-missing` to a **plugin update** ("not `sync-workflows.sh`"), so an
  operator whose plugin-cache file is present but unreadable — a permission bit, an unreadable
  mount, a dangling symlink inside the cache — was told the artifact was *missing* and to reinstall,
  when the file is right there and the fix is the permissions fix AC-4.2 already names for
  `consumer-artifact-unreadable`. The two plugin-side reasons are therefore separate members with
  separate remediations:

  | Reason | Condition | Remediation named (AC-2.5, AC-2.8, AC-4.2) |
  |---|---|---|
  | `plugin-artifact-missing` | `pluginPath` absent under a resolvable `<pluginRoot>` | **plugin update** — the package does not contain the artifact |
  | `plugin-artifact-unreadable` | `exists(pluginPath)` and `readBytes_hash(pluginPath)` fails (AC-1.1a) | **environment / permissions fix** on the plugin cache path — reinstalling does not fix a permission bit |
  | `consumer-artifact-unreadable` | `exists(consumerPath)` and `readBytes_hash(consumerPath)` fails, or `consumerPath` absent with a non-traversable first existing ancestor (AC-1.1a) | **environment / permissions fix** on `consumerPath` (or the offending ancestor directory, which the message names) |
  | `hash-tool-absent` | neither `shasum` nor `sha1sum` runs (§4) | install a content-hash utility |

  All four are `unknown`, all four are not copied (AC-3.1), exit `3` (AC-3.3) and block the queue
  (AC-4.1); they differ only in the remediation, which is exactly why AC-2.5 requires every member
  of the set to be distinguishable in the output.

  **`reason` is a single scalar, so the four members have a declared precedence (TE v8 F-04).**
  `rows[].reason` is one string (§4, AC-2.6), and AC-1.8(i) generates inputs that satisfy several
  conditions at once by construction — "no hash tool **and** `pluginPath` absent **and**
  `consumerPath` present-unreadable" is in the cross product of every run. AC-1.8(ii) fixes precedence
  over the six *states* only; three golden-output oracles (AC-2.5's distinguishability, AC-2.8's
  `unknown` row, AC-4.2's per-row block) and one property oracle choose a **remediation by reason**, so
  without a rule each implementer's evaluation order becomes the spec. The rule is a *declared*
  precedence, deliberately not "the first failure encountered" (which is an artefact of code order and
  is not assertable from the outside):

  > **`hash-tool-absent` > `plugin-artifact-missing` > `plugin-artifact-unreadable` >
  > `consumer-artifact-unreadable`.**

  Rationale, in remediation order — the operator is shown the fix that must happen first.
  `hash-tool-absent` is environment-global and makes *every* row unevaluable, so no per-artifact
  finding beneath it is even measurable; the plugin side outranks the consumer side because with no
  readable baseline bytes there is nothing to copy or compare *to*, and fixing the consumer side first
  changes nothing observable. This ordering is not the same as AC-1.8(ii)'s state precedence and does
  not interact with it: reason precedence is evaluated **only** after the state is already `unknown`.

  **Row reasons and manifest reasons are disjoint sets, and so are their precedences (SE v9 F-03).**
  AC-1.0 now declares a precedence over its own set; the two orderings never compete,
  because a row `reason` exists only when `baselineStatus == resolved` and a `baselineReason` exists
  only when it is `unresolved`. The one apparent overlap v9 created — hash-tool absence reported as
  `plugin-root-unreadable` — was a probe error, not a precedence gap, and is fixed at AC-0.4 and
  AC-1.1a by naming the manifest's reader. The six conditions v5 listed here as row
  reasons — plugin root unset/unreadable, repo root unresolved, manifest absent/malformed, JSON tool
  absent — are *manifest-level* and live in AC-1.0's `baselineStatus.reason`, because each of them
  is what prevents rows from existing at all and none of them is assignable to a row (TE v5 F-01).
  A row `reason` is only ever one of the four above. The
  `plugin-artifact-missing` / `plugin-artifact-unreadable` pair is what covers "manifest row present,
  consumer bytes present, but nothing to compare them to"; that case has a defined state, a defined
  exit code (AC-3.3 exit 3), a defined queue outcome (AC-4.1 `blocked`), and a defined copy-loop
  behaviour (AC-3.1: not copied). *(P0)*
- **AC-1.3** — Who: the operator. Given a consumer bundle byte-identical to the plugin's shipped
  bundle, When the check runs, Then the result is `in-sync` regardless of file timestamps. No
  state in AC-1.1 is decided by mtime; mtime is never read. *(P0)*
- **AC-1.4** — Who: the operator. Given multiple manifest rows, When the check runs, Then each is
  reported independently; one `stale` row does not mask a second `stale` row, and one `unknown`
  row does not suppress the states of the others. *(P0)*
- **AC-1.5** — Who: the operator. Given a file in `.claude/workflows/` that has no manifest row and
  is not in `retired` (a workflow the consuming repo authored for its own domain), When any
  operation in this feature runs, Then it is reported `not-managed` per AC-0.6 and is never read
  for comparison, never overwritten, and never deleted. *(P0)*
- **AC-1.6** — Who: `sync-workflows.sh` — **the only writer of *managed artifacts* into
  `.claude/workflows/`, in every repo including the maintainer's** (AC-6.1). The qualifier is
  load-bearing: the SessionStart hook also writes into that directory (the drift state file,
  AC-2.6) and sync writes `.pdlc-backups/` (AC-3.4), so an unqualified "only writer of
  `.claude/workflows/`" contradicts AC-2.6 and would make a conforming implementation fail a test
  written against the literal claim (SE v5 F-02). Given a managed
  artifact is written into `.claude/workflows/`, When the write completes, Then the writer records
  `{ id, consumerHash, pluginHash, artifactVersion, pluginVersion, syncedAtUtc }` for that row in
  the **sync manifest** at `.claude/workflows/.pdlc-sync-manifest.json` in the consumer repo.
  `consumerHash` and `pluginHash` are `sha1` of the bytes written and of the baseline respectively
  (equal at write time). This file is the sole provenance source for the `stale` / `local-edit` /
  `unverified` discrimination in AC-1.1, replacing mtime entirely.

  **Reading it has four outcomes, not two (TE v11 F-05).** AC-1.1a names this AC as a
  `readBytes_json` call site, and AC-1.7 states only the *absent* and *no-entry* cases. The complete
  mapping, all of it fail-safe in AC-1.7's direction — never `stale`, never `local-edit`, never
  `in-sync`-by-provenance:

  | `readBytes_json(.pdlc-sync-manifest.json)` | Effect on every row |
  |---|---|
  | `0` parsed | per-row entry lookup, AC-1.6/AC-1.7 as stated |
  | `11` absent | no entry for any row ⇒ `unverified` where bytes differ (AC-1.7) |
  | `12` malformed | as absent, plus the verbatim line `pdlc: could not parse .claude/workflows/.pdlc-sync-manifest.json — provenance unknown, rows reported unverified` |
  | **`10` unreadable** | as absent, plus the verbatim line `pdlc: could not read .claude/workflows/.pdlc-sync-manifest.json — provenance unknown, rows reported unverified` |

  It is deliberately **not** a `baselineReason`: the manifest-level reasons are about the *plugin's*
  distribution manifest and the environment (AC-1.0), and an unreadable *sync* manifest costs
  provenance for rows that still classify — degrading them to `unverified`, which surfaces at every
  surface and requires `--force` to sync (AC-1.7, AC-3.2), is both the safer and the already-specified
  answer. *(P0)*
- **AC-1.7** — Who: the operator on a repo that has never synced. Given no sync manifest exists,
  or it exists with no entry for a row, When that row's bytes differ, Then the state is
  `unverified` — never `stale` and never `local-edit`. `unverified` is always surfaced (AC-2.5),
  its remediation is "diff, then sync", and sync requires `--force` (AC-3.2). This is the common
  first-run case and it must be safe in both directions: it must not silently overwrite a real
  local edit, and it must not silently hide a real staleness. *(P0)*
- **AC-1.8** — Who: the test author. Given the classifier, whose domain is **one manifest row of a
  manifest whose `baselineStatus` is already `resolved`** (AC-1.0 — the classifier is never invoked
  otherwise, which is why "baseline resolvable" is no longer an axis) and
  whose codomain is the **six** states of AC-1.1, Then it satisfies, as requirements and not as
  test detail:
  - **(i) totality** — every combination of the axes {hash tool present/absent} ×
    {`pluginPath`: **absent / present-unreadable / present-readable**} ×
    {`consumerPath`: **parent-absent / absent / ancestor-untraversable / present-unreadable /
    present-readable**} ×
    {bytes equal /
    unequal} × {sync-manifest entry: absent / `consumerHash` matches / `consumerHash` differs}
    maps to exactly one of the six states, with no undefined fall-through. Combinations that cannot
    co-occur (e.g. "equal" with one side absent) are enumerated and mapped explicitly, not left
    implicit.

    **The presence axes are multi-valued deliberately (SE v6 F-03, TE v6 F-05.)** v6 wrote them as
    two-valued `present/absent` while AC-1.2's condition already read "does not exist **/ is
    unreadable**". A property test generating over a two-valued axis satisfies totality without ever
    generating the unreadable case — so `plugin-artifact-unreadable` and
    `consumer-artifact-unreadable` would never be exercised.

    **The `consumerPath` axis has five values, and no value's name asserts anything its fixture does
    not do (TE v7 F-02, TE v8 F-02, TE v8 F-06).** v7's three values folded an
    *absent parent directory* into `present-unreadable`, which is the fresh-consumer and fresh-clone
    bootstrap — AC-3.8's and AC-6.5's Given, both P0 — so the generator never produced the case those
    ACs are about and the disagreement between AC-1.1's literal wording and AC-3.8's requirement was
    unfalsifiable by the property suite. v8 then split `parent-absent` out but left
    `present-unreadable` *defined* to also cover an absent path beneath an unreadable parent — so a
    generator author implementing the value by its name produces only the present half and the nested
    absent case, which is what AC-1.1's whole ancestor rule is about, is again never generated. The
    five values are one per row of AC-1.1's situation table plus the readable case, each named for
    exactly what its fixture builds, all in AC-1.1a's probe vocabulary:

    | Axis value | Fixture | State |
    |---|---|---|
    | `absent` | `consumerPath` absent, parent exists, `traverse(parent)` | `missing` |
    | `parent-absent` | `consumerPath` absent and its parent does not exist; the first existing ancestor is traversable — the whole subtree is absent | `missing` |
    | `ancestor-untraversable` | `consumerPath` absent and its **first existing ancestor** exists but `! traverse(A)` — whether `A` is the parent (`chmod 000 .claude/workflows`) or higher (`chmod 000 .claude` with `workflows/` absent) | `unknown` / `consumer-artifact-unreadable` |
    | `present-unreadable` | `exists(consumerPath)` and `readBytes_hash(consumerPath)` fails | `unknown` / `consumer-artifact-unreadable` |
    | `present-readable` | bytes obtainable | decided by the remaining axes |

    **The mapping column is conditional, and the two dominating rows are named (SE v8 F-04).** The
    states above hold **given the hash tool is present and `pluginPath` is `present-readable`**;
    otherwise (ii)'s state precedence governs and AC-1.2's reason precedence picks the reason. The two
    dominating rows, stated so the totality property is not written from the table alone:

    | Dominating condition | State, for **every** `consumerPath` axis value | Reason |
    |---|---|---|
    | hash tool absent | `unknown` | `hash-tool-absent` |
    | `pluginPath` `absent` or `present-unreadable` (hash tool present) | `unknown` | `plugin-artifact-missing` / `plugin-artifact-unreadable` |

    So the cell `{hash tool absent} × {pluginPath absent} × {consumerPath parent-absent}` — which the
    generator produces on every run — is `unknown` / `hash-tool-absent`, one answer. v8's table stated
    `parent-absent ⇒ missing` unconditionally, which contradicted both (ii) and AC-1.2 there; the two
    revisions before it each shipped a defect of exactly this shape (TE v7 F-02, SE v7 F-01), so the
    conditionality is stated in the table rather than left to a reader to infer from precedence.

    The generator must produce `parent-absent` and `ancestor-untraversable` as first-class values; a
    suite that only ever creates `.claude/workflows/` before generating is not exercising the bootstrap
    path AC-6.5 asserts, and one that only ever `chmod`s the immediate parent is not exercising the
    ancestor rule AC-1.1 states. Under `id -u == 0` the two permission-derived `consumerPath` values
    and the `pluginPath` `present-unreadable` value are **filtered out of the generator** — not
    skipped as a whole property — with the reason printed once and the three consequently unverified
    invariants named; AC-1.1a's uid-0 table states the rule and the list (TE v9 F-05).

    **The generator observes the filesystem as it finds it, and the classifier never creates
    anything (TE v9 F-03).** The `parent-absent` and `ancestor-untraversable` fixtures are only
    meaningful if nothing under test has already created `.claude/workflows/`; AC-2.9(1) mandates
    that every writer classifies **before** it creates, so the axis value the generator built is the
    one the classifier sees. That ordering is **not** asserted by this property — both orders yield
    the same state here — and is pinned instead by the **`PDLC_TRACE_FILE` call-order assertion**
    (AC-2.9(4)) named in AC-6.5 (TE v10 F-01; moved from the injected JS seams to the bash trace at
    v12 — SE v11 F-01, TE v11 F-02), which is the document's single oracle for it.
  - **(ii) mutual exclusivity** — the six states are disjoint; no input yields two. Precedence when
    conditions could overlap is fixed and stated: `unknown` > `missing` > `in-sync` >
    `unverified` > `stale` > `local-edit`.
  - **(iii) determinism** — the same filesystem inputs yield the same state on repeated runs within
    and across processes, with no dependence on clock, mtime, environment ordering or directory
    iteration order. "The same filesystem inputs" is literal: a *surface* that creates
    `.claude/workflows/` (AC-2.9(1)) changes the inputs between run 1 and run 2, so the same fixture
    legitimately reports `consumerPath` axis value `parent-absent` then `absent` — both `missing`, so
    the **state** is stable, which is what this clause constrains. Determinism is asserted against a
    fixed tree, and the two-run behaviour of the writers is AC-3.7's idempotence claim, not this one
    (TE v9 F-03).
  - **(iv) reason totality and determinism (TE v8 F-04)** — the same three properties hold of
    `rows[].reason`, not only of the state: **total** — every generated input whose state is `unknown`
    carries exactly one reason from AC-1.2's four-member closed set, and every input whose state is
    *not* `unknown` carries `reason: null` (§4); **single-valued and ordered** — when several of the
    four conditions hold at once, the recorded reason is the highest by AC-1.2's declared precedence
    (`hash-tool-absent` > `plugin-artifact-missing` > `plugin-artifact-unreadable` >
    `consumer-artifact-unreadable`), asserted against the generated overlap rather than against a
    hand-picked example; **deterministic** — repeated runs on the same inputs record the same reason.
    Without (iv) the reason set is generated but unasserted, which is the position AC-1.2's four
    operator-visible remediations cannot afford.

    **(iv) extends to `baselineReason` over AC-1.0's set (SE v9 F-03).** The same three
    properties — totality (`unresolved` ⇒ exactly one member; `resolved` ⇒ `null`), single-valuedness
    against AC-1.0's declared precedence on a generated overlap, and determinism — hold of the
    manifest-level reason. Its generator axes are **five**:

    | # | Axis | Values | Sampled when |
    |---|---|---|---|
    | 1 | JSON tool | present / absent | always |
    | 2 | **AC-0.3a maintainer-repo marker**, read at **`<resolved repoRoot>/pdlc/workflows/build-runtime.mjs`** | **present / absent** | **only when axis 5 is `resolves`** — see below |
    | 3 | `${CLAUDE_PLUGIN_ROOT}` | unset / set-untraversable / set-traversable | always |
    | 4 | manifest | absent / malformed / empty / valid | always |
    | 5 | repo root | resolves / does not | always |

    **Axis 2 is conditioned on axis 5, and the marker is read from the resolved root — not "from the
    fixture" (SE v11 F-03, TE v11 F-03).** AC-0.3a's Given is "**the resolved repo root** contains
    `pdlc/workflows/build-runtime.mjs`", so marker presence is *defined relative to a resolved repo
    root* and is not an observable at all when axis 5 says the root does not resolve. v11's flat
    five-axis cross product therefore declared 24 of its 96 cells — every {marker present, root
    unresolved} pair — while stating an expectation for none of them, which is the same defect
    (a totality claim over a space the document does not define) that TE v10 F-03 raised against the
    four-axis list, one cell over. Two rules, both normative:

    - **The generator samples axis 2 only in the `resolves` branch.** Totality, single-valuedness and
      determinism are asserted over the stated sub-product — 48 cells with axis 2 present plus 24 with
      the root unresolved and the marker **unread** — never over the flat 96.
    - **In the unresolved branch the expectation is `repo-root-unresolved`, whatever is on disk at the
      marker path.** An implementation that reads a `build-runtime.mjs` it has no resolved root to
      join it onto and reports `resolved`, or reports `plugin-root-unset`, is wrong: AC-1.0's
      precedence puts `plugin-root-unset` above `repo-root-unresolved`, but with the marker present
      `${CLAUDE_PLUGIN_ROOT}` being unset **is not an error at all** (AC-0.4), so no `plugin-root-*`
      member is in play and the root failure is the only reason left. This is stated because it is
      cheap to get wrong in the resolution order and no cell asserted it.

    The two readings of "in the fixture" and "at the resolved root" coincide only because AC-6.5
    `git init`s its fixture root `F` — which is an **AC-6.5 fact, not an AC-1.8 one** — so the axis is
    written against the resolved root and AC-6.5's construction is what makes its own tree agree.

    **Axis 2 is not optional, and v10's four-axis list made the totality assertion false on half the
    space (TE v10 F-03).** AC-0.4 states in terms that it "applies only when AC-0.3a's maintainer-repo
    marker is absent; when it is present, `${CLAUDE_PLUGIN_ROOT}` is not consulted at all **and its
    being unset is not an error**", and AC-0.3a binds `<pluginRoot> := <repoRoot>/pdlc` on the marker's
    presence. So the deciding input for whether two of the axis-3 values are errors at all was not an
    axis, and the two cells

    - {`${CLAUDE_PLUGIN_ROOT}` unset, **marker present**, valid manifest under `<repoRoot>/pdlc`} ⇒
      `baselineStatus: resolved`, `baselineReason: null`, and
    - {`${CLAUDE_PLUGIN_ROOT}` unset, **marker absent**} ⇒ `plugin-root-unset`

    were indistinguishable to the property as specified. Both expectations are now normative here.
    Marker-present also makes axis 3's `set-untraversable` value a **non-event** (the variable is not
    consulted), which is a third distinct expectation the axis buys. This matters more in this repo
    than it would elsewhere: §0 fact 10 makes the local `pdlc` checkout the only verification surface
    and it *is* a marker-present tree, so an author who builds fixtures by copying it (AC-6.5's
    construction) gets marker-present by default and would never have generated the `plugin-root-unset`
    expectation at all.

    The five axes produce the multi-condition overlaps the precedence exists
    to break. `hash-tool-absent` is **not** in this codomain (AC-0.4, AC-1.1a). `drift-state-invalidated`
    **is** in AC-1.0's set but is **not** in this generator's codomain: it is written by AC-2.9(2a),
    never produced by a classification, so totality here is stated over AC-1.0's seven *classifier*
    reasons and the eighth member is asserted by AC-2.9(2a)'s own mandated tests instead (AC-1.0) —
    **including its precedence**, which is test **(e)**'s overlap fixture and not this generator's
    (TE v11 F-04).
    Under `id -u == 0` axis 3's `set-untraversable` value and axis 5's untraversable-root value are
    **filtered** — not skipped — per AC-1.1a's uid-0 table, with the two consequently unverified
    precedence pairs named there (SE v10 F-03).

  `not-managed` is outside this classifier's codomain by construction (AC-0.6), so the totality
  property is satisfiable as stated rather than requiring an unauthorised state. *(P0)*

### REQ-DIST-02 — SessionStart warning

- **AC-2.1** — Who: the operator. Given a `SessionStart` hook and any managed row in state `stale`
  or `missing`, When the session starts, Then a warning names the row `id`, the state, and the
  exact remediation command. *(P0)*
- **AC-2.2** — Who: the operator. Given **`baselineStatus` is `resolved` (AC-1.0)**, **the managed
  row set is non-empty**, every managed row is `in-sync`, no retired path is present (AC-3.9,
  AC-2.8), **no mandated write failed (`writeFailures` is `[]`, AC-2.9)**, and any `not-managed` files
  are ignored, When the session starts, Then
  the hook emits nothing. Silence means a resolved baseline declaring at least one row, every one of
  them verified in-sync, **and no retired artifact remaining** — it never means "some rows could not
  be checked" and it can never mean "there were no rows" (AC-1.0; TE v5 F-01). The warning ACs below
  are exhaustive over the conditions that break silence: AC-2.1 (`stale`/`missing`), AC-2.3
  (`local-edit`), AC-2.5 (`unknown`/`unverified`), AC-2.5a (`baselineStatus` `unresolved`, which
  includes the empty managed set), AC-2.8 (retired path present), AC-2.9 (a mandated write failed).
  There is no silent non-silent state. *(P0)*
- **AC-2.3** — Who: the operator. Given state `local-edit`, When the warning is emitted, Then it
  is textually distinct from `stale` and explicitly does **not** recommend the plain sync command,
  because syncing would discard the local edit; it names `--force` and the backup location instead.
  *(P0)*
- **AC-2.4** — Who: the operator. Given the hook fails for any reason (missing manifest, unreadable
  plugin root, malformed JSON, hashing tool absent), When the session starts, Then the hook exits
  `0` with the failure written to stderr **and** to the drift state file (AC-2.6) — as
  `baselineStatus: "unresolved"` with `baselineReason` when the failure is manifest-level (AC-1.0),
  or as `unknown` rows with their row `reason` when it is per-row (AC-1.2). It exits `0` **while
  still warning** (AC-2.5a): exiting 0 is about not blocking the session, never about staying quiet.
  A broken drift check must never block a session from starting. *(P0)*

  **The two cases in which the hook writes no drift state file at all are AC-2.9's, and only those**,
  and they are different in kind — the distinction decides the exit code of `--check`/sync on the same
  fixture (AC-3.3, TE v9 F-02):

  | Case | Was a write attempted? | Hook | `--check` / sync |
  |---|---|---|---|
  | **No write target** — the repo root did not resolve (`repo-root-unresolved`), so there is no defined location to write to and nothing anywhere is created | **no** | stderr + warn (AC-2.5a), exit `0` | exit **`3`** (`baselineStatus unresolved`) |
  | **Write attempted and failed** — `mkdir -p` or the atomic replace was performed and refused (`EACCES`, read-only fs, `ENOSPC`, failed `mv`) | **yes** | stderr + warn, exit `0` | exit **`4`** |

  In the second case the writer must additionally **invalidate any pre-existing drift state file**
  before it exits (AC-2.9(2a): an in-place invalidation record, else an unlink, else the stated
  residual) — otherwise the previous run's file, which says `writeFailures: []`
  and may say every row `in-sync`, is the only thing the queue reads. Everywhere else the write is
  unconditional, including on every manifest-level failure this AC lists — AC-2.9 is what makes that
  reachable on a consumer that has no `.claude/workflows/` directory yet.
- **AC-2.5** — Who: the operator. Given state `unknown` or `unverified` on any managed row, When
  the session starts, Then the hook **warns** — it is never silent — the message carries the
  resolution-failure reason (`unknown`) or the "no sync provenance" reason (`unverified`), and each
  is distinguishable in the output from `stale`, from `local-edit`, and from each other. All **four**
  members of AC-1.2's closed reason set are distinguishable in the output — including
  `consumer-artifact-unreadable` and `plugin-artifact-unreadable`, whose remediation is a permissions
  fix and **not** a sync and **not** a plugin update. This is
  what makes AC-1.2 operative rather than decorative. *(P0)*
- **AC-2.5a — Unresolved baseline warns, without any row.** Who: the operator. Given
  `baselineStatus` is `unresolved` (AC-1.0) — including `manifest-empty` — When the session starts,
  Then the hook **warns**, the message carries the manifest-level `reason` verbatim, and it is
  textually distinct from every row-level message (AC-2.1, AC-2.3, AC-2.5) and from AC-2.8's. The
  warning names the remediation that can actually fix the reason: **plugin update** for
  `manifest-absent` / `manifest-malformed` / `manifest-empty` (AC-0.3b), the environment fix for
  `plugin-root-unset` (set or re-install so `${CLAUDE_PLUGIN_ROOT}` is exported) and
  `plugin-root-unreadable` (**the environment / permissions fix on the named path** — deliberately
  generic, because `readBytes_json` exit `10` also covers a *directory* sitting where the manifest
  should be, which is not a permission bit and which the exit code cannot distinguish; naming "the
  permission bit, never a reinstall" would be the wrong instruction there, and a general instruction
  beats a confidently wrong one — AC-0.4, AC-1.1a, SE v11 F-06), **for `repo-root-unresolved` the specific fix that applies: create `.claude/` at the
  intended repo root, or run from inside a git work tree** (AC-0.5 steps 1–2, AC-3.8's third
  population), and installing a Python
  interpreter for `json-tool-absent` (§4). The hook still exits `0` (AC-2.4). This AC is the hook's
  half of AC-1.0: without it, the manifest-absent state — universal at rollout — reaches the
  operator as silence, because every row-quantified warning has no rows to quantify over. *(P0)*
- **AC-2.6** — Who: **the shared drift-state writer routine** (AC-2.7) — i.e. the SessionStart hook
  or `sync-workflows.sh`; never `orchestrate-queue`, which only ever reads this file (AC-4.1).
  Given **any** drift computation completes — the
  SessionStart hook, `sync-workflows.sh --check`, or a `sync-workflows.sh` run that copied files —
  When it exits, Then it has written the full per-row result to
  `.claude/workflows/.pdlc-drift-state.json` as:

  ```
  { schemaVersion: 1,
    generatedAtUtc,               // ISO-8601 Z; reporting only, never a queue input
    generatedBy,                  // "hook" | "check" | "sync"
    baselineStatus,               // "resolved" | "unresolved"   (AC-1.0) — evaluated before rows
    baselineReason,               // null when resolved; else one of AC-1.0's closed reason set
    pluginVersion,                // context only (AC-5.4)
    checkEnabled,                 // resolved by the writer from .claude/pdlc.config.json (AC-4.3)
    retiredPresent,               // array of { path, supersededBy, supersedingState } — the
                                  //   consumer-relative retired paths found present, each carrying
                                  //   the `id` of the row R whose `retires` contains it and R's
                                  //   state, because AC-2.8/AC-4.2's remediation is conditioned on
                                  //   that state (TE v6 F-02). Emptiness is still the signal
                                  //   AC-4.1's `retiredPresent` row tests.
    writeFailures,                // array (never absent, `[]` normally) of
                                  //   { path, operation } — every mandated write this run
                                  //   *attempted* and could not complete (AC-2.9). `operation` is
                                  //   one of a closed nine-member set (AC-2.9(2), §4); v9's third
                                  //   field `stage` is deleted — it was never defined, printed or
                                  //   asserted anywhere (SE v9 F-04, TE v9 F-04). Non-empty ⇒ the
                                  //   run's exit is 4 (AC-3.3) and the queue blocks (AC-4.1).
    rows: [ { id, state, reason, pluginHash, consumerHash,
              pluginArtifactVersion, consumerArtifactVersion } ] }
  ```

  **When the file itself is not written (AC-2.9).** "Every drift computation has written it on exit"
  holds with exactly two stated exceptions, both of which are AC-2.9's and neither of which is a
  silent one: **no write target** (the repo root did not resolve — `repo-root-unresolved`, nothing
  anywhere is created, the failure goes to stderr, `--check`/sync exit `3`), or the write was
  **attempted and failed** (creating `.claude/workflows/` or replacing the file refused — the failure
  goes to stderr, `--check`/sync exit `4`, and AC-2.9(2a)'s invalidation ladder runs so the queue
  blocks on an *invalidation record* (row 4) or an *absent* file (row 1) rather than on the previous
  run's stale contents). The two cases differ in exit code, which is why AC-3.3 row 1 is scoped to *attempted*
  writes (TE v9 F-02). `writeFailures` records failures of
  *other* mandated writes — copies, backups, sync-manifest updates — which do not prevent this file
  from being written and must therefore be visible in it; the four operations that *do* prevent it
  (`mkdir`, `drift-state-replace`, and AC-2.9(2a)'s `drift-state-invalidate` and
  `drift-state-unlink`) are reported on stderr only, because there is no file of ours to record
  them in.

  When `baselineStatus` is `unresolved`, **`rows` is `[]` and `retiredPresent` is `[]` meaning *not
  evaluated*** (AC-0.3b) — `baselineStatus` is what carries the meaning, and no reader may infer
  "nothing is stale" or "nothing is retired" from the empty arrays (TE v5 F-01, F-04). When it is
  `resolved`, `rows` contains exactly one entry per manifest row and nothing else (no `not-managed`
  entries — AC-0.6, no retired paths — AC-0.7), and `retiredPresent` is a **projection** (not a
  subset — the members are objects, not paths) over those members of the manifest's `retired` union
  (AC-0.7) that exist in the consumer: one entry per such path, carrying
  `supersededBy` and `supersedingState`, with `[]` meaning genuinely none present.

  **When `supersedingState` is measured, per surface (TE v7 F-07).** It is the state of row R **at
  the moment this file is written**, which differs by writer and the REQ says so rather than leaving
  a golden test to discover it:

  | `generatedBy` | `supersedingState` reflects |
  |---|---|
  | `"hook"` | R's state as observed at session start — nothing has been copied |
  | `"check"` | R's current state — `--check` copies nothing (AC-3.3) |
  | `"sync"` | R's **post-copy** state (AC-2.7). A row that was `stale` before the run is `in-sync` here, AC-3.9's guard then retired `p`, and `retiredPresent` is correspondingly `[]` |

  Consequence a test author must plan for: **the same fixture yields different golden output at
  different surfaces** — `supersedingState: "stale"` from the hook, and an empty `retiredPresent`
  after the sync that fixed it. AC-2.8's and AC-4.2's golden outputs are therefore surface-specific
  by construction, not by accident.

  **The states recorded here are the states observed *before* this run created anything (AC-2.9(1),
  TE v9 F-03).** Every writer completes the whole drift computation — row states, reasons,
  `retiredPresent` — against the filesystem as it found it, and only then creates `.claude/workflows/`
  and writes this file. So on a fresh consumer the file records `missing` rows classified through
  AC-1.1's `parent-absent` case even though the directory exists by the time the file lands in it.

  Retired paths are carried in the **separate top-level
  `retiredPresent` array**, because a retired path is not a manifest row and forcing it into `rows`
  would break AC-2.6's one-entry-per-row invariant and AC-1.8's codomain. All three arrays (`rows`,
  `retiredPresent`, `writeFailures`) are
  written by the same routine in the same atomic write, and are never absent, so a reader never has
  to distinguish "empty" from "this writer predates the field". This file is the queue's only input
  (AC-4.1) and is what keeps classification out of the workflow runtime. *(P0)*
- **AC-2.7 — Single writer contract.** Who: the operator remediating mid-session. Given
  `.claude/workflows/.pdlc-drift-state.json`, Then there is exactly **one** writer routine, shared
  by the hook and `sync-workflows.sh`, and it is invoked at the end of **every** drift computation
  in either surface. The write is whole-file and atomic (write to a sibling temp file in the same
  directory, then `mv`), so a reader never observes a partial file and there is no merge rule to
  specify: last complete write wins. Consequently, after `sync-workflows.sh` copies a stale row,
  the drift state on disk reflects the post-sync truth **within the same session**, and the queue
  (AC-4.1) stops blocking without a session restart. Without this AC the operator's remediation
  loop is closed only by restarting the session, which is the defect v3 SE F-05 / TE F-18 filed.

  **The writer list is exhaustive and `build-runtime.mjs` is not on it.** The maintainer's
  remediation loop is "queue blocks on a `stale` row → rebuild → **run `sync-workflows.sh`** → the
  queue unblocks", and the sync run is what refreshes this file. Because the builder never writes
  `.claude/workflows/` at all (AC-6.1, §0 fact 13), it cannot leave the drift state describing a
  filesystem that has since changed underneath it. Any future change that gives a third process
  write access to **the drift state file** must add it to this list in the same commit. The forward
  rule is scoped to that file deliberately: `.claude/workflows/` as a *directory* already has more
  than two writers by design — sync writes managed artifacts (AC-1.6) and `.pdlc-backups/`
  (AC-3.4), the hook writes the drift state — so a rule counting writers of the directory would be
  miscounted from the start, and an implementer reading it as "the hook must not write under
  `.claude/workflows/`" would break AC-2.6 (SE v5 F-02). *(P0)*
- **AC-2.8 — Retired artifact present.** Who: the operator on a consumer that **has updated the
  plugin to a manifest-shipping release but has not yet synced** — retirement is manifest-derived,
  so it is not evaluated at all while `baselineStatus` is `unresolved` (AC-1.0, AC-0.3b), and v5's
  "a consumer that predates this feature" named a population for which this warning can never fire
  (TE v5 F-04). Given `baselineStatus` is `resolved` and at least one path in the manifest's
  `retired` union (AC-0.7) exists in the
  consumer, When the session starts, Then the hook **warns**, and the warning: (i) carries the
  reason token `retired-present` — a *hook-message* token, deliberately **not** a member of
  AC-1.2's closed `reason` set nor of AC-1.0's, since neither a manifest row nor the baseline is
  involved; (ii) is textually distinct from the `stale`, `local-edit`,
  `unknown` and `unverified` messages; (iii) names each retired path individually **together with
  the `id` and state of the row R that supersedes it**; and (iv) names, **per path, the remediation
  conditioned on R's state** per the table below.

  **The remediation must be conditioned on R, because a plain sync provably cannot clear every case
  (TE v6 F-02).** AC-3.9's guard removes `p ∈ R.retires` **iff** R's post-copy state is `in-sync`.
  So for R in `local-edit` — the operator edited the consumer bundle — a plain `sync-workflows.sh`
  re-runs the same guard, retires nothing, reports `retire-skipped` again, and AC-4.1's `retiredPresent` row blocks
  the queue again: a non-converging loop whose named remedy cannot clear it. v6 named the plain
  command unconditionally here and in AC-4.2, which also left a test author writing the AC-4.2
  golden output for the `retire-skipped` + `local-edit` fixture with two mutually exclusive correct
  answers.

  | R's state | Remediation named for `p ∈ R.retires` |
  |---|---|
  | `in-sync` | `sync-workflows.sh` (no flags) — R is already `in-sync`, so AC-3.9's post-copy guard passes on the first run and `p` is backed up and retired. **This is the feature's primary case, not an unreachable one** — see below |
  | `stale`, `missing` | `sync-workflows.sh` (no flags) — the copy makes R `in-sync`, the guard then passes |
  | `local-edit`, `unverified` | `sync-workflows.sh --force`, **naming the backup directory `.claude/workflows/.pdlc-backups/` and *both* backup filename patterns the run will write, each keyed to the artifact it belongs to**: `{R.id}.{stamp}[-N].bak` for R's overwritten bundle (AC-3.2, AC-3.4) and `{basename(p)}.{stamp}[-N].bak` for the retired path `p` itself (AC-3.9), with `{R.id}` and `{basename(p)}` expanded and `{stamp}`/`[-N]` left literal, and stating that the local edit is preserved under the first and `p`'s content under the second, both restorable (AC-3.5). This is the only sanctioned automatic escape; a manual delete of `p` is *not* recommended, because it leaves R still diverged |
  | `unknown` (any reason) | **plugin update** (AC-0.3b) for `plugin-artifact-missing`; the environment/permissions fix for `plugin-artifact-unreadable`, `consumer-artifact-unreadable` and `hash-tool-absent` (AC-1.2). Sync cannot help, and must not be named |

  **The table is total over R's state, and `in-sync` is its most common entry (TE v7 F-01).** v7's
  fourth row read "`in-sync` → not reachable — the guard passed, so `p` was retired and is not
  present". That is true only of a drift state file **written by a sync run**. AC-2.8's surface is
  the SessionStart hook, which never copies and never retires, and AC-3.3's exit-`1` row reports the same
  condition from `--check`, which "copies nothing" — so a consumer whose managed rows are all
  `in-sync` (bundles already synced, or hand-copied) while `.claude/workflows/orchestrate-dev.js` is
  still on disk is both reachable and **universal at rollout**. It is also the exact configuration
  AC-2.8's own closing paragraph mandates a warning for. Declaring it unreachable left the
  highest-value fixture in the feature with no expected string, left AC-4.1's `retiredPresent` row's most common
  block with no remediation in AC-4.2, and invited the natural `case`-with-a-missing-arm
  implementation that emits nothing — reintroducing the hole AC-2.8 exists to close (TE v4 F-03).
  "Not reachable" is scoped to what it is actually true of: **in a drift state file with
  `generatedBy: "sync"`, an entry in `retiredPresent` whose `supersedingState` is `in-sync` cannot
  occur** (AC-2.6, AC-3.9 — the guard passed in that same run, so `p` was deleted). At
  `generatedBy: "hook"` and `"check"` it occurs freely.

  **`baselineStatus` `unresolved` is deliberately not a row of this table.** When the baseline is
  unresolved, AC-2.6 and AC-0.3b fix `retiredPresent` at `[]` *meaning not evaluated*, so there is no
  path `p` for the table to assign a remediation to and the clause v7 attached to the `unknown` row
  could never fire (SE v7 F-06, TE v7 F-04). That case is owned end to end by **AC-2.5a**, whose
  message names the manifest-level reason and its remediation. A test author looking for a fixture
  for it will not find one here, correctly.

  **The printed backup path is a directory plus a pattern, never a concrete filename (SE v7 F-04).**
  `{stamp}` is generated by the *future* `--force` run (AC-3.4), possibly with an `-N` collision
  suffix, and the hook and `--check` print this warning before any backup exists — so a message
  naming a concrete path would name a file that does not exist, and a golden-output oracle would
  have to regex-match a string the implementation cannot determine. The message therefore names the
  directory `.claude/workflows/.pdlc-backups/` and the literal pattern `{id}.{stamp}[-N].bak` with
  only the `{id}` position expanded, which is fully determined at print time and assertable verbatim.

  **And it names *both* backups, because a `--force` run on this row writes two, under two ids
  (TE v8 F-05).** The `id` position is not one value here: R's overwritten bundle is backed up under
  `{R.id}` (AC-3.2 → AC-3.4) while `p` is backed up under `{basename(p)}` (AC-3.9's explicit
  "`id` = the retired basename"), and §4's `managed row id values` row exists precisely to keep those
  two namespaces distinct — at v1, `orchestrate-dev.{stamp}.bak` and
  `orchestrate-dev.js.{stamp}.bak`. v8 mandated printing `{id}` expanded to *R's* `id` inside the row
  whose whole purpose is to tell the operator what happens to `p`, so a golden-output author could not
  tell whether naming only R's backup was compliant, nor which artifact "the local edit is preserved
  there" referred to. Both names are printed, each labelled with the artifact it holds, and the
  sentence about restorability is stated per artifact.

  This holds independently of the managed rows' states — a consumer whose
  every managed row is `in-sync` but which still holds `.claude/workflows/orchestrate-dev.js` is
  warned, because §0 fact 8 makes that the exact configuration in which the runtime may execute the
  stale artifact. Without this AC, AC-2.2's silence precondition would be observable only as the
  absence of an assertion and the natural implementation — an `else` branch emitting nothing —
  would satisfy every warning AC while violating AC-2.2 (TE v4 F-03). *(P0)*
- **AC-2.9 — Directory creation and the write-failure contract.** Who: every writer in this feature —
  the SessionStart hook, `sync-workflows.sh --check`, and `sync-workflows.sh`. Given a mandated write,
  When it is performed, Then it follows the three rules below. This AC exists because v8 mandated the
  drift-state write on *every* drift computation (AC-2.4, AC-2.6, AC-2.7) while specifying directory
  creation for sync only (AC-3.4, AC-3.8) and specified **no** failure path for any write at all
  (SE v8 F-01, F-02). *(P0)*

  **(1) Who creates `.claude/workflows/` — every writer does, and only after it has classified.**
  Given the AC-0.5-resolved repo root
  and `.claude/workflows/` absent beneath it, When any of the three writers is about to write the
  drift state file, Then it creates the directory with `mkdir -p`, creating at most `.claude/`
  and `.claude/workflows/` and nothing else, at the process umask (the mode is not asserted). The
  guards are AC-0.5's, unchanged: no creation when the reason is `repo-root-unresolved`, and never
  under `$HOME` or `/`.

  **The order is normative: classify first, create second (TE v9 F-03).** Every writer completes the
  entire drift computation — every row's state and reason, `retiredPresent` — **against the filesystem
  as observed before this run created anything** — and only then does it `mkdir -p` and write. v9 said
  the directory is created "first", which read against the drift-state write is correct but read
  against the *classifier* would destroy the very axis value the feature's two bootstrap ACs depend
  on: with `.claude/workflows/` created before classification, AC-1.8(i)'s `parent-absent` value is
  unreachable at the hook and at `--check`, the fixture silently realises `absent` instead, and
  AC-6.5's stated invariant chain ("the first existing ancestor of
  `.claude/workflows/orchestrate-dev.bundle.js` is the fixture root, and it is traversable — so
  absence is established") becomes false of the run that asserts it: the assertion still passes,
  because the state is `missing` either way, but it passes for a different reason than the AC gives —
  a false green on the reasoning, which is the shape AC-1.1's ancestor rule was rewritten to make
  falsifiable. Two consequences a test author must plan for and may assert:

  - the drift state file records **pre-creation** states (AC-2.6), so the first run on a fresh
    consumer reports `parent-absent`-derived `missing` rows in a file that lives in a directory the
    same run created;
  - across two consecutive hook runs on an untouched consumer the recorded *state* is `missing` both
    times while the underlying `consumerPath` situation moves from `parent-absent` to `absent`. That
    is a change in the inputs, not non-determinism: AC-1.8(iii) is scoped to a fixed tree, and
    AC-3.7's idempotence claim is about sync's effects, not about this axis.

  **The oracle for this order is the *trace* mandated by AC-2.9(4) and asserted in AC-6.5, and it is
  the only one (TE v10 F-01, SE v11 F-01, TE v11 F-02).** Because both orders produce the same
  `state`, the same `reason`, the same exit code and the same queue outcome on every fixture in this
  REQ, no assertion over the drift state file's contents can falsify a create-first implementation.
  The mandated assertion is therefore over the writer's own call sequence: **no `create` line appears
  in the trace before the last `probe` line of the last row.** AC-2.6's schema is deliberately left
  unchanged — adding a recorded situation field would also work, and was rejected as the more
  expensive of the two repairs.

  **The oracle is at the *bash* layer, and v11's injected-JS-seam wording is retracted
  (SE v11 F-01, TE v11 F-02).** v11 mandated a jest spy "over the seams the runtime adapter already
  injects (`_checkFile`, `_readFile`, `_writeFile` and the directory-creation seam)". Three facts,
  all measured at HEAD, make that unimplementable: (i) **there is no directory-creation seam anywhere
  in the JS layer** — `grep -n "mkdir\|_mkdir\|makeDir"` over `.claude/workflows/orchestrate-queue.bundle.js`
  and `pdlc/workflows/runtime-adapter.js` returns zero hits; (ii) the four named seams exist at no
  single call site — `rtDevInjections` (`runtime-adapter.js:181-190`) supplies `_agent, _parallel,
  _pipeline, _phase, _log, _checkFile, _readFile, _checkCi, _mergeWorktree` with **no `_writeFile`**,
  while the queue's injection block supplies `_agent, _readFile, _writeFile, _log, _phase,
  _runPipeline` with **no `_checkFile`**; and (iii) decisively, the classifier and the `mkdir -p` are
  **not JS at all** — NFR-5 mandates bash for `pdlc/hooks/scripts/`, AC-2.6 names the writer as the
  SessionStart hook or `sync-workflows.sh` and says *never* `orchestrate-queue`, and §4/BL-04 scope
  the queue to **one** injected read of an already-computed file. A jest double cannot observe a bash
  subprocess's `[ -e ]`, `[ -d ] && [ -x ]`, `shasum` and `mkdir -p` calls; the only observations
  jest has of the script are its exit code, its stdout/stderr and the resulting tree — which is
  exactly the observation set this paragraph has just proved cannot separate the two orders. So
  the wording accepted TE v10 F-01 in words and left the P0 ordering with **no working oracle**. The
  seams the oracle is actually stated over are AC-2.9(4)'s, they are the script's own, and no future
  JS re-implementation is implied.

  This is the *read-only surfaces create a directory* reading, chosen deliberately over the
  alternative. The alternative — skip the write when the directory is absent — violates AC-2.4,
  AC-2.6 and AC-2.7 on the population AC-0.3b calls **universal at rollout**, leaves AC-4.1 row 1
  (file absent) blocking the queue **permanently**, and makes AC-0.3b's only documented interim escape
  unreachable, because `checkEnabled: false` reaches the queue *only* through a file that would never
  be created. The cost of the chosen reading is bounded and cheap: one empty directory in the
  operator's repo, at a path the workflow runtime already requires to exist in order to load anything
  at all, under the same wrong-root guards that protect every other write. AC-3.8's sync-side creation
  is now the special case of this rule, not a separate one.

  **(2) Every mandated write has a failure outcome, and it is observable.** Given a write in this
  feature is **attempted** and fails for any reason — `EACCES`, a read-only filesystem, `ENOSPC`, a
  failed `mkdir`, a
  failed `mv` in AC-2.7's atomic replace, a copy that ends short — When the run continues, Then:

  | Failing write (`operation` token) | Behaviour |
  |---|---|
  | `mkdir` — `mkdir -p` of `.claude/workflows/` — or `drift-state-replace` — the atomic replace of the drift state file itself | No drift state file **written** this run, and **(2a)'s invalidation ladder runs** so no *old* one is left believable. The failure is printed to stderr naming the path and the `operation` token. The **hook exits `0`** (NFR-6, AC-2.4); **`--check` and sync exit `4`**. Neither token can ever appear in `writeFailures` — there is no file to record it in — so the array's closed set is asserted from the five rows below, while these two and (2a)'s two are asserted on stderr. The queue then blocks on AC-4.1 row 1 (no file at all, or (2a) step 2 removed it), row 4 ((2a) step 1's invalidation record) or row 3 (that record carrying this run's earlier `writeFailures`, SE v11 F-05), which is the correct outcome and **not** a spurious block: `.claude/workflows/` is where the runtime loads its bundles from, so a repo in which it cannot be created cannot host this pipeline. The only remediation is the permissions/filesystem fix, and it is the one printed |
  | `artifact-copy` (AC-3.1), `backup` (AC-3.4), `backup-verify` (AC-2.9(3)), `retire-delete` (AC-3.9), `sync-manifest-update` (AC-1.6) | The run **continues to the next row** (rows are independent, AC-1.4), the affected row's sync-manifest entry is **not** written or updated, and an entry `{ path, operation }` is appended to `writeFailures` in the drift state file (AC-2.6). The run's exit code is **`4`** and the queue blocks (AC-4.1) |

  **`operation` is a closed nine-member set and there is no `stage` (SE v9 F-04, TE v9 F-04,
  TE v10 F-02).** The
  members are exactly the tokens above plus (2a)'s two: **`mkdir`, `drift-state-replace`,
  `drift-state-invalidate`, `drift-state-unlink`, `artifact-copy`, `backup`,
  `backup-verify`, `retire-delete`, `sync-manifest-update`** — stderr-only for the first four,
  `writeFailures` members for the other five. v9 declared `{ path, operation, stage }` and then
  printed `operation` at three operator-visible surfaces (AC-2.9(2)'s stderr line, AC-4.1's block
  message, AC-4.2's `Run` block) with no domain, while `stage` appeared nowhere else in the document —
  no domain, no print site, no oracle. Every other operator-visible set in this REQ is enumerated
  (AC-1.0's eight baseline reasons, AC-1.2's four row reasons, AC-1.1's six states, AC-3.3's five exit
  codes) and that enumeration is what makes each golden output assertable; `stage` is deleted rather
  than defined, because nothing needed it.

  **This is not a `repo-root-unresolved` clause.** When the root does not resolve there is **no write
  target**, nothing is attempted, `writeFailures` is not reachable (no file), and the outcome is the
  baseline one: warn (AC-2.5a), `--check`/sync exit **`3`** (AC-3.3 row 2), queue blocked on row 1.
  Exit `4` means *we tried to write and could not*, which is a strictly different fact and a different
  remediation (TE v9 F-02).

  `writeFailed` is a *run-level* outcome carried in `writeFailures`, deliberately not a fifth member
  of AC-1.2's row-`reason` set: it is not a classification of the row (the row's state was computed
  fine — the write is what failed), and widening a closed set whose four members are pinned by three
  golden oracles and AC-1.8(iv) would be a worse trade than one new top-level array.

  **(2a) A failed drift-state write must invalidate the previous run's file.** Given the `mkdir` or
  `drift-state-replace` of row 1 above failed **and** a drift state file from an earlier run is still
  on disk, When the writer exits, Then it first performs the following ladder, stopping at the first
  step that succeeds, and prints the step's mandated line verbatim:

  | # | Action | `operation` token | Permission it needs | Printed line on success (verbatim) | Printed line on **failure** (verbatim) | What the queue then reads |
  |---|---|---|---|---|---|---|
  | 1 | overwrite the existing `.pdlc-drift-state.json` **in place**, truncating, with the **invalidation record** below | `drift-state-invalidate` | **write on the file** (not on the directory) | `pdlc: drift state invalidated in place at <path>` | `pdlc: could not invalidate the drift state file in place at <path>` | parses, `schemaVersion` is `1`, `baselineStatus` is `"unresolved"` and `baselineReason` is `"drift-state-invalidated"` ⇒ AC-4.1 **row 4** (or **row 3** when the record carries `writeFailures`) ⇒ `blocked` — **and row 2 (`checkEnabled`) is still reachable** |
  | 2 | if that fails: `unlink` the existing file | `drift-state-unlink` | **write on the directory** | `pdlc: drift state file removed at <path>` | `pdlc: could not remove the drift state file at <path>` | absent ⇒ AC-4.1 **row 1** ⇒ `blocked` unconditionally |
  | 3 | if both fail: print the residual explicitly and exit `4` (`0` for the hook) | — | — | `pdlc: the drift state file on disk is stale and could not be invalidated at <path>` | — | the stale file. **Stated residual**, see below |

  Steps 1 and 2 print their failure line **before** the next step is attempted, so the printed
  sequence is itself the record of which rungs were tried (TE v11 F-08). Both lines carry the same
  `operation` token as the success line.

  The **invalidation record** written by step 1 is a schema-valid AC-2.6 document, and it is the whole
  of the file:

  ```
  { "schemaVersion": 1,
    "generatedAtUtc": "<this run's instant>",
    "generatedBy": "hook" | "check" | "sync",
    "baselineStatus": "unresolved",
    "baselineReason": "drift-state-invalidated",
    "pluginVersion": <as resolved, else null>,
    "checkEnabled": <the flag this run resolved, AC-4.3>,
    "retiredPresent": [], "writeFailures": <this run's collected entries, see below>, "rows": [] }
  ```

  Every field is AC-2.6's, in AC-2.6's shape — this is a valid drift state file that happens to
  report "unresolved because this run could not record itself", which is why it needs no new queue
  logic and no schema change.

  **Who emits it, and why it must survive `json-tool-absent` (TE v11 F-04(i), SE v11 F-04).** Step 1
  is an in-place truncating write — deliberately *not* AC-2.7's temp-file-and-rename, since that is
  what just failed — and AC-1.0's own rationale for putting `drift-state-invalidated` at the top of
  the precedence is that it can coexist with **every** other member, `json-tool-absent` included. So
  the REQ declares reachable a state in which this record must be emitted with no JSON tool, and the
  emitter is therefore named rather than inferred from §4:

  | Condition | Emitter | `writeFailures` in the record |
  |---|---|---|
  | a JSON tool was discovered (§4) | the JSON tool, as for every other write | **this run's collected entries**, verbatim |
  | no JSON tool was discovered (`json-tool-absent`), or the tool itself fails on this write | a `printf` of the **fixed literal above** | `[]` — **stated residual**, see below |

  The fallback is not a violation of NFR-5's ban on hand-rolled shell JSON handling: it interpolates
  exactly **four scalars** — an ISO instant the writer generates, one of three literal `generatedBy`
  tokens, a version that renders as a JSON number-or-`null`, and a boolean — none of them a path and
  none of them free text, so there is nothing to escape and no parser to hand-roll. The ban is about
  *parsing* untrusted JSON and about serialising arbitrary strings; a constant template with four
  closed-domain holes is neither. **Step 1 never depends on the JSON tool** is the property, and it is
  what makes the top-of-precedence claim true rather than aspirational.

  **The record carries the run's `writeFailures` rather than discarding them (SE v11 F-05).** A run
  can fail an `artifact-copy` or a `backup` — both `writeFailures` members, exit `4` — and *then* fail
  the drift-state replace, which is what triggers this ladder. v11 hard-coded `writeFailures: []`, so
  those per-path failures survived only on stderr, which this AC's own "Why this exists" paragraph
  argues is **not** an input the operator's downstream surface sees; the queue would have blocked on
  row 4 naming `drift-state-invalidated` with nothing to print per path. The entries are already in
  memory and already in AC-2.6's shape, so they are carried, and the two facts are both recorded:
  `baselineReason` stays `drift-state-invalidated` and AC-4.1 blocks on **row 3**, naming each
  `{ path, operation }`. On the `printf` fallback path that carry is not available (the array is
  variable-length and would need real serialisation), and **that loss is the stated residual**: the
  entries are printed to stderr per AC-2.9(2) and the block message names the baseline reason alone.

  **Why a schema-valid record rather than `{}` (SE v10 F-01).** v10's step 2 wrote the two bytes `{}`
  and its step 1 unlinked, so **both** outcomes landed on AC-4.1 **row 1** — the row that is evaluated
  *above* the `checkEnabled` row. On any consumer where the drift-state write fails on **every** run —
  `.claude/workflows/` present and populated but not writable: a hardened or read-only-mounted
  checkout, a root-owned `.claude/` under a non-root user, a `noexec,ro` bind mount in the
  containerised runners D-DIST-06 introduces — the queue would then be blocked on every future
  invocation with `distribution.checkEnabled: false`, the documented escape (AC-0.3b), **permanently
  unreachable**, because row 1 fires first. That population is not the one (2) row 1 argues about: the
  directory exists, the bundles are there, `--check` can classify every row `in-sync`, and the runtime
  — which only *reads* bundles — can host the pipeline perfectly. And it is the *same* consequence
  (2)'s rejected alternative was rejected for ("makes AC-0.3b's `checkEnabled` escape unreachable"), so
  accepting it here would have been incoherent. The record repairs it at no cost to the fail-closed
  property: it needs only file-write permission (the same as `{}`), it blocks every default consumer
  through AC-4.1's `unresolved` row, and it leaves row 2 reachable for an operator who has explicitly
  opted out. Step 1 and step 2 are therefore **ordered record-first**: an absent file is strictly less
  informative than an invalidation record and is equally blocking, so unlinking is the fallback, not the
  preferred outcome. v11 justified the order by calling step 2 "the fallback for the narrower case,
  the file itself unwritable while its directory is not" — which the reachability derivation below
  shows is a case the ladder **never runs in**, because a temp-sibling + `mv` replace succeeds there.
  The ordering conclusion is unchanged and the correct narrower case is stated below instead
  (TE v11 F-01).

  Steps 1 and 2 are *writes*, and they are the ladder's own failure surface, so their tokens
  **`drift-state-invalidate` and `drift-state-unlink`** join AC-2.9(2)'s `operation` set — bringing it
  to **nine** members, four of them stderr-only. Neither can ever appear in `writeFailures` (there is
  no file of ours to record it in), exactly as `mkdir` and `drift-state-replace` cannot. v10 mandated
  these two writes and three operator-visible lines with no token and no verbatim text, which is the
  gap this REQ had just closed for `operation` one AC earlier (TE v10 F-02, SE v10 F-06).

  **Why this exists (SE v9 F-01).** v9's row 1 argued that a failed drift-state write is safe because
  "the queue then blocks on AC-4.1 row 1 (file absent)". That holds only on the *first-run*
  population. On any consumer where an earlier run wrote the file successfully, the old file is still
  there — with `writeFailures: []`, `baselineStatus: resolved`, possibly every row `in-sync` — and the
  queue's only input is that file's **contents** (`_readFile`, no stat metadata, AC-4.1). So it mapped
  to *proceed silently* on a run whose drift computation could not be recorded at all: the false green
  this feature exists to eliminate, one layer up, on a path the REQ itself specified. The failure is
  also **asymmetric to the operator** — stderr from a SessionStart hook is not an input to the queue —
  so nothing downstream would have noticed.

  The two steps need *different permissions*, and that is why there are two: `O_TRUNC` on an existing
  file needs write on the **file**, while `unlink` needs write on the containing **directory**.
  Neither step needs a new queue rule: step 1 lands on AC-4.1's existing `unresolved` row (or its
  `writeFailures` row) and step 2 on its existing absent row.

  **Which worlds actually reach this ladder — the rungs are derived, not assumed (TE v11 F-01).** The
  Given is "the `mkdir` **or** `drift-state-replace` of row 1 failed **and** an earlier file is still
  on disk". AC-2.6/AC-2.7 fix the primary write as a temp sibling in the same directory plus `mv`, so
  it needs **write on the directory** and *nothing* on the pre-existing file. Three measurements on
  the maintainer machine at v12, uid 501, decide the reachability of every rung:

  | Measurement | Result |
  |---|---|
  | `mv` a temp sibling over a `chmod 444` file in a **writable** directory | **succeeds** (`rc=0`, content replaced) |
  | `rm` a file in a `chmod 500` directory | **fails** (`Permission denied`, `rc=1`) |
  | `: > f` (in-place truncate) on a writable file in a `chmod 555` directory | **succeeds** (`rc=0`, size 0) |

  Row 1 is why v11's ladder was partly dead. In a **file-unwritable / directory-writable** consumer
  the primary replace *succeeds*, so the ladder's Given is never satisfied — v11's mandated test (b)
  built exactly that fixture, and the assertion "the file is absent afterwards" would have been
  **red against a correct implementation** (the file exists, freshly written). Generalising with rows
  2 and 3: every world that reaches the ladder through a *permission* failure is one in which the
  directory is unwritable (or `mkdir` failed — in which case there is no directory, hence no
  pre-existing file, and the ladder is N/A), and that is precisely the bit `unlink` needs. Under
  permission fixtures alone, **step 1 covers the whole reachable space** and step 2 is squeezed to
  zero. v11's own justification for ordering record-first — "unlink is the fallback for the narrower
  case, the file unwritable while its directory is not" — named a case in which the ladder never runs.

  Step 2 is kept, and **re-scoped to non-permission replace failures**, because those are real and
  AC-3.3 already lists them: `ENOSPC`/quota (the temp write fails; an in-place truncate may fail for
  the same reason while `unlink`, which frees space, succeeds), an immutable-attribute or
  append-only file, and a *directory* sitting at the drift-state path. In each of those the directory
  is writable, so the unlink is exactly the right fallback. What it is **not** is a permission case,
  and a read-only *mount* is not one either — there `unlink` fails too and step 3 is the outcome. The
  rungs' correct reading is therefore: **step 1 for the permission world, step 2 for the
  non-permission world, step 3 for the intersection**, and each has a satisfiable fixture below.

  Inducing `ENOSPC` in a unit test needs a size-capped image or a `tmpfs` mount — platform-specific
  and root-requiring on Linux, which is the opposite of what a fixture for this feature can assume.
  Test (b) is therefore built on the declared `PDLC_FAULT=drift-state-replace` seam of **AC-2.9(4)**,
  which makes the replace report failure without attempting it, standing in for the whole
  non-permission class. That is the third option this REQ takes over deleting the rung: a rung with a
  named, cheap, deterministic fixture is worth more than one with a real-but-uninducible trigger.

  **The residual is stated rather than glossed.** Step 3 is reachable only when the writer can neither
  write to the file nor remove it — a file and a directory that both deny writes while a previous
  file exists. In that configuration the queue may proceed on stale contents, and this REQ accepts it
  because the alternative is a queue-visible input that does not exist at that seam (the runtime
  offers contents only). It is bounded, it is announced on stderr at every drift computation, and the
  remediation is the same permissions fix. AC-4.1's "No freshness clause" paragraph and NFR-6 both
  state the same residual rather than asserting the case away, and the mandated falsifying tests are:

  | # | Fixture | Assertions |
  |---|---|---|
  | (a) | pre-existing all-`in-sync` file, **unwritable directory**, writable file (⇒ the replace fails, step 1 succeeds) | the file parses, `baselineStatus` is `"unresolved"`, `baselineReason` is `"drift-state-invalidated"`, `rows` is `[]`, `checkEnabled` equals the flag this run resolved; the line `pdlc: drift state invalidated in place at <path>` is printed verbatim; AC-4.1 applied to the file yields `blocked` naming `drift-state-invalidated` |
  | (b) | pre-existing file, **`PDLC_FAULT=drift-state-replace`** (AC-2.9(4)), **unwritable file**, **writable** directory (⇒ the replace is forced to fail, step 1 fails, step 2 succeeds) | the file is **absent** afterwards; **both** lines are printed verbatim and **in this order** — `pdlc: could not invalidate the drift state file in place at <path>` then `pdlc: drift state file removed at <path>`; AC-4.1 yields `blocked` on row 1 |
  | (c) | pre-existing file, **both denied** | the file is byte-identical to before; **all three** lines are printed verbatim and in order — step 1's failure line, step 2's failure line, then the residual line; the exit is `4` (`0` for the hook) |
  | (d) | fixture (a) plus `distribution.checkEnabled: false` in `.claude/pdlc.config.json` | the record carries `checkEnabled: false` and AC-4.1 therefore reaches **row 2** and *proceeds with the skip noted* — the escape hatch of AC-0.3b is reachable on a permanently-unwritable consumer (SE v10 F-01) |
  | (e) | **overlap**: fixture (a) plus a **malformed** distribution manifest (so this run's own classification would have reported `manifest-malformed`) | the record's `baselineReason` is `"drift-state-invalidated"` — **not** `manifest-malformed` — and AC-4.1's block message names it; this is the fixture that falsifies AC-1.0's top-of-precedence claim for the eighth member |

  Test (d) is the falsifying test for the whole of the SE v10 F-01 argument; without it the record's
  only observable difference from `{}` is unasserted.

  **Why (c) and (b) assert the *preceding* lines and not only the outcome (TE v11 F-08).** Step 3 is
  defined as "if both fail", but a run that never attempted step 1 or step 2 at all produces the
  identical filesystem observation — a byte-identical stale file and exit `4`. That is a
  precedence-chain false green of the kind this REQ removed elsewhere: the fixture defeats both
  earlier branches, but without the failure lines the oracle never checks that they were tried. The
  failure lines added to the ladder table exist for exactly this, and the ordering assertion is what
  makes them an oracle rather than decoration.

  **Why (e) exists (TE v11 F-04(ii)).** `drift-state-invalidated` is declared the **top** member of
  AC-1.0's precedence on the grounds that it coexists with every other one, and it is excluded from
  AC-1.8(iv)'s generator codomain because the writer produces it — so its precedence was asserted
  nowhere: fixtures (a)–(d) are all built on an otherwise-healthy tree, each asserting the reason in
  isolation, which any implementation that reports the upstream reason instead would also pass. A
  top-of-precedence claim with no overlap fixture is an unfalsifiable ordering. `manifest-malformed`
  is chosen for the overlap because it reaches the writer (unlike `repo-root-unresolved`, which has
  no write target at all) and because it is the cheapest of the seven to build.

  Every fixture here except the `PDLC_FAULT` half of (b) is built from permission bits, so all five
  are **example-based** under AC-1.1a's uid-0 rule — they **skip with a printed reason** at uid 0, and
  the run prints the aggregate residual list that rule now requires (TE v10 F-04, TE v11 F-06).

  **(3) No delete and no overwrite happens before its backup is verified.** Given AC-3.4 must
  preserve content that AC-3.9 or a `--force` copy is about to destroy, When the backup is written,
  Then it is **re-read and its `sha1` compared to the `sha1` of the source bytes**, and only on
  equality does the destroying operation proceed. On inequality or on any failure of the backup write:
  the original is left untouched, the operation is reported skipped (`retire-skipped` for AC-3.9,
  copy-skipped for AC-3.2's `--force` path), a `writeFailures` entry is recorded, and the exit is `4`.

  v8 stated AC-3.9 as "the retired file's content is backed up under AC-3.4's rules … and the file is
  then deleted", with the delete **unordered with respect to the backup's success** — so a silently
  failed backup followed by a successful delete loses exactly the content AC-3.4 exists to preserve,
  which is the failure mode AC-3.9's own closing sentence names ("deleting the loadable artifact and
  leaving nothing"). Re-read-and-compare, rather than trusting the writer's exit code, is required
  because a short write on a full filesystem can exit `0`; it is also the same oracle AC-3.5 already
  mandates for restore, so it needs no new mechanism. A `mv` of the original into the backup
  directory is an acceptable implementation of the retirement case, since it is atomic within one
  filesystem and leaves nothing to verify — the requirement is the *property*, not the copy.

  **(4) Two test-only environment seams, owned by the scripts and declared in §4
  (SE v11 F-01, TE v11 F-01, TE v11 F-02).** Who: the two bash writers (the SessionStart hook and
  `sync-workflows.sh`). Given the classifier, the directory creation and the invalidation ladder are
  bash (NFR-5) and the jest suite is the only verification surface (§0 fact 10), When a test needs to
  observe *call order* or to reach a rung no filesystem fixture can reach, Then the scripts honour
  exactly these two variables and no others:

  | Variable | Default | Behaviour |
  |---|---|---|
  | `PDLC_TRACE_FILE` | **unset** | When set to a writable path, the writer **appends** one line per classification probe and per directory creation, in call order, and nothing else: `probe <exists\|traverse\|enumerate\|readBytes_hash\|readBytes_json> <path>` and `create <path>`. When unset, no trace is produced and no trace code path executes. A failure to open or append to the trace file is **ignored** — a diagnostic seam may never change an outcome |
  | `PDLC_FAULT` | **unset** | A comma-separated set drawn from the **closed two-member** set `drift-state-replace`, `repo-root-traverse`. Each forces exactly one named operation to report failure **without attempting it**: `drift-state-replace` makes AC-2.7's atomic replace fail (⇒ AC-2.9(2) row 1 ⇒ the (2a) ladder), `repo-root-traverse` makes AC-0.5's `traverse(p)` check on the resolved root return false (⇒ step 1(b)/step 2's guard ⇒ `repo-root-unresolved`). An **unrecognised** token is a usage error: the script prints `pdlc: unknown PDLC_FAULT token <t>` and exits `4`, so a typo can never silently disable the fault it was meant to inject |

  Three constraints make these seams safe to ship in production scripts:

  1. **Inert by default and asserted to be.** A mandated test runs one drift computation twice on the
     same fixture, once with both variables unset and once with `PDLC_TRACE_FILE` set, and asserts
     the drift state file, stdout, stderr and exit code are **identical** — the trace file being the
     only difference. Nothing in this feature reads either variable outside the two behaviours above.
  2. **Neither is a config surface.** They are absent from §4's config-file rows, they are not read
     from `.claude/pdlc.config.json`, and no AC's outcome depends on them except the tests that set
     them. `PDLC_FAULT` is the only way to make a *correct* implementation fail a write, which is
     precisely why it may not be reachable from a file an operator could edit.
  3. **NFR-1 and NFR-3 are untouched** — the trace records probes the run already performs and the
     fault forces an outcome the run already has a specified behaviour for; neither reads or writes
     an unmanaged file, and neither involves an agent.

  **Why a seam rather than a spy or a tracer.** The alternatives were considered and rejected in
  order: a jest spy over injected JS seams cannot see a bash subprocess (AC-2.9(1)); a syscall tracer
  (`strace`/`dtruss`) is unavailable or root/SIP-gated on the maintainer's platform and on the
  containerised runners D-DIST-06 introduces; and a `PATH`-front-loaded `mkdir` shim — which **is**
  a permitted alternative implementation of the `create` half of the trace, since the scripts invoke
  `mkdir` by bare name — covers directory creation but not the probes, so it cannot express "before
  the last probe of the last row". The script-emitted trace is the only mechanism that observes both
  halves of the ordering at the layer that performs it, and it costs two lines in the two functions
  the probes already go through.

### REQ-DIST-03 — Sync action

**Delivery vehicle.** Sync is a bash script (NFR-5) shipped in the plugin at
**`<pluginRoot>/hooks/scripts/sync-workflows.sh`** — the *same* `<pluginRoot>` binding as every
other path in this feature (AC-0.1, AC-0.3, AC-0.3a). It expands to
`${CLAUDE_PLUGIN_ROOT}/hooks/scripts/sync-workflows.sh` in a consuming repo and to
**`<repoRoot>/pdlc/hooks/scripts/sync-workflows.sh`** in the maintainer repo, i.e.
`pdlc/hooks/scripts/sync-workflows.sh` from the repo root — which is what makes the script runnable
in a fresh clone with no plugin installed (AC-6.5). v5 pinned the invocation to
`${CLAUDE_PLUGIN_ROOT}` while AC-0.4 stated that variable is not consulted in the maintainer repo,
leaving "the exact remediation command" with no expansion in the repo that develops the feature
(SE v5 F-01). It is invoked directly by the operator. It is
**not** an LLM prompt: every `/pdlc:*` surface today is a `SKILL.md`, and an LLM-driven file copy
is neither deterministic (NFR-1) nor auditable. A thin `skills/sync-workflows/SKILL.md` may exist
as a discoverability affordance, but its only permitted action is to run that script verbatim and
relay its output; it makes no classification or copy decisions of its own.

- **AC-3.1** — Who: the operator. Given `sync-workflows.sh` with no flags **and `baselineStatus`
  `resolved`** (AC-1.0 — when it is `unresolved` sync copies nothing, retires nothing, prints the
  manifest-level reason and its remediation, and still rewrites the drift state file), When it runs,
  Then every
  managed row in state `stale` or `missing` is copied from `pluginPath` to `consumerPath`, each
  copy is reported with both hashes, and the sync manifest (AC-1.6) is updated for each copied row.
  Rows in `local-edit`, `unverified` or `unknown` are not copied — including `unknown` with reason
  `plugin-artifact-missing` or `plugin-artifact-unreadable`, which have no readable bytes to copy. Every manifest row falls in exactly one of
  the copy set or the skip set; there is no undefined row. The drift state file is rewritten before
  exit (AC-2.7).

  **Each copy is atomic per row, and a failed copy does not abort the loop (AC-2.9).** A row is
  written to a sibling temp file in `.claude/workflows/` and `mv`d into place — the same mechanism
  AC-2.7 mandates for the drift state file — so `consumerPath` is never observed half-written and a
  crash mid-loop leaves each row either fully copied or untouched. Rows are independent (AC-1.4), so a
  row whose copy fails is recorded in `writeFailures`, its sync-manifest entry is **not** written, the
  loop continues with the next row, and the run exits `4`. v8 specified none of this: "a partially
  completed copy loop" had no stated behaviour, and continue-versus-abort was the implementer's
  choice (SE v8 F-02). *(P0)*
- **AC-3.2** — Who: the operator. Given a row in state `local-edit` or `unverified`, When sync runs
  without `--force`, Then it is **not** overwritten, it is reported with the reason, and the
  command's exit code reflects it (AC-3.3). Given `--force`, Then it is overwritten after a backup
  (AC-3.4). *(P0)*
- **AC-3.3** — Who: the operator, and the `pdlc/workflows` jest suite (`npm test`) — the only
  automated verification surface that exists (§0 fact 10). Given `--check`, When it runs, Then it
  reports drift, copies nothing, writes nothing except the drift state file and, per AC-2.9(1), the
  directory containing it (AC-2.7; the qualifier is normative — AC-3.8 *requires* `--check` to create
  `.claude/workflows/` on a fresh consumer, so a "the tree is unchanged apart from the drift state
  file" assertion written from v9's sentence failed on the AC-3.8 fixture — TE v9 F-07), and exits per
  this complete table — highest applicable code wins, so the exit code is never green while
  anything is unverified: *(P0)*

  | Condition (evaluated in this precedence order) | Exit |
  |---|---|
  | **a mandated write was *attempted and failed* this run — `writeFailures` non-empty, or the `mkdir`/`drift-state-replace` of the drift state file itself failed (AC-2.9(2))** | **4** |
  | **`baselineStatus` is `unresolved` (AC-1.0), for any reason including `manifest-empty`** | **3** |
  | any row `unknown` | 3 |
  | any row `local-edit` or `unverified` | 2 |
  | any row `stale` or `missing`, or any retired path present (AC-3.9) | 1 |
  | `baselineStatus` `resolved`, the row set is non-empty, all rows `in-sync`, no retired path present, `writeFailures` empty (`not-managed` files present or not) | 0 |

  Exit `0` therefore asserts "the baseline resolved, it declared at least one managed row, and every
  one of them was compared against it and matched" — the automated form can never go green having
  verified nothing, which is AC-1.0 enforced at the exit code. Row 1 exists because rows 2–4 are all
  existential over `rows` and row 6 was universal over it: with no manifest, `rows` is `[]`, rows 3–5
  are unsatisfied and row 6 vacuously true, so v5's table returned `0` in precisely the state
  AC-0.3b says every consumer is in at rollout (TE v5 F-01).

  **Exit `4` is new in v9 and sits above everything (SE v8 F-02).** v8's table was total over drift
  *states* and silent on IO errors, so an implementation that failed to write a backup, failed to
  copy a row, or could not create `.claude/workflows/` at all had no defined exit code — and the two
  plausible readings were exit `0` ("no drift was found") and a crash. `4` is above `3` because
  "we could not perform the repair we were asked to perform" dominates "we could not verify"; the
  same precedence appears at the queue seam (AC-4.1) and in the drift state file
  (`writeFailures`, AC-2.6). `--check` can reach `4` too: it writes the drift state file, and
  AC-2.9(1) may have to create the directory for it.

  **`4` is *attempted and failed*; `repo-root-unresolved` is `3` (TE v9 F-02).** v9's row 1 read "or
  the drift state file could not be written at all", which is literally what AC-2.4 and AC-2.6 say
  happens when the root does not resolve — so AC-3.8's third population (a non-git tree with no
  `.claude/`) had **two** mandated exit codes: `4` from this row and `3` from AC-3.8, AC-2.5a and
  AC-1.0. One required fixture, one expected exit code: the missing distinction is *failed write* vs
  *no write target*, AC-2.9(2)'s own table only ever names `mkdir` and the atomic replace as failing
  operations, and this row is now scoped to them. `repo-root-unresolved` falls to row 2 (`3`), and
  AC-4.1's rows 1 and 3 carry the same scoping at the queue seam.

  **On the `unverified` asymmetry** (`--check` exits 2, but AC-4.1 lets the queue proceed): it is
  deliberate. `--check` is an assertion surface — its job is to be red whenever provenance is
  missing. The queue is a *work* surface — blocking a feature run on "we cannot tell which
  direction the divergence runs" would strand every consumer that adopted this feature by copying
  files by hand, which is all of them at first adoption. The two seams optimise for opposite
  errors, and the test suite must assert both, not reconcile them.
- **AC-3.4** — Who: the operator recovering a mistake. Given a sync overwrites any existing file,
  When the copy happens, Then the pre-sync **content** is first written to
  `.claude/workflows/.pdlc-backups/{id}.{UTC-ISO8601-compact}.bak`, where the stamp is
  `YYYYMMDDTHHMMSSZ` — fixed width, zero-padded, UTC. `id` is filename-safe by AC-0.1.
  Backups are never overwritten: if that exact filename already exists (two syncs inside one
  second), `-2`, `-3`, … is appended before `.bak` until the name is free. The **newest 5 per
  `id`** are retained; selection for pruning is `LC_ALL=C` **lexicographic descending sort of the
  filenames**, keep the first 5, delete the rest. The fixed-width UTC stamp makes lexicographic
  order equal chronological order, and the `-N` suffix breaks ties deterministically. Pruning is
  **never** mtime-based — that would contradict AC-1.3 and NFR-2 — and never touches a file whose
  name does not match `{id}.{stamp}[-N].bak` for an `id` **in the manifest's `id` set**. That set is
  defined as the union of the managed rows' `id` values **and the basenames of the manifest's
  `retired` array** (AC-0.7), so retirement backups (AC-3.9) are inside the retention rule rather
  than accumulating unprunably outside it, and the newest-5-per-`id` invariant a property test
  asserts over `.pdlc-backups/` holds over every file the tool ever writes there.

  **Parsing a backup filename when the `id` contains dots.** At v1 that set is
  `{ orchestrate-dev, orchestrate-queue, orchestrate-dev.js, orchestrate-queue.js }` (AC-0.1's row
  `id`s plus AC-0.7's retired basenames), so `orchestrate-dev` is a proper prefix of
  `orchestrate-dev.js` and a naive split on the first `.` misattributes every retirement backup
  (TE v5 F-08). The rule is: match the **POSIX ERE**

  ```
  ^(.+)\.([0-9]{8}T[0-9]{6}Z)(-([0-9]+))?\.bak$
  ```

  with a **greedy** first group — the fixed-width stamp is what anchors the split, so the `id` may
  contain any number of dots — taking `id` from `BASH_REMATCH[1]` and the stamp from
  `BASH_REMATCH[2]`, and then require the captured `id` to be a member of the set. A filename whose
  captured `id` is not a member, or which does not match at all, is never touched. Retention is
  grouped by the captured `id`, so `orchestrate-dev` and `orchestrate-dev.js` keep five backups
  each, independently. AC-0.1's namespace rule — **`{row ids} ∪ {retired basenames}` pairwise
  distinct, every member matching the `id` charset** — is what makes that grouping key well-defined
  across the whole manifest and what keeps every interpolated value filename-safe (TE v6 F-06,
  SE v7 F-02). Without the charset half, a retired basename with a leading dot or one already ending
  in `.{stamp}.bak` produces a filename this regex mis-parses or never prunes; without the
  distinctness half, a retired basename equal to a row `id` collapses two retention groups into one
  and makes restore (AC-3.5) ambiguous.

  **Positional groups, not named ones (SE v6 F-05).** v6 pinned
  `^(?<id>.+)\.(?<stamp>…)(-(?<n>…))?\.bak$`. `(?<name>…)` is PCRE/JS syntax; NFR-5 mandates bash
  with `[[ =~ ]]`, `grep -E` and `sed -E`, all of which are POSIX ERE with positional groups only,
  and `grep -P` is unavailable on the BSD grep this feature is measured on. The semantics were
  right and are unchanged — only the notation was unimplementable in the shell the REQ requires.

  The backup directory is created if absent — by AC-2.9(1)'s rule, under the same guards, and a
  failure to create it is AC-2.9(2)'s `writeFailed` outcome, not an unspecified one. **Every backup is
  verified before the operation it protects proceeds** (AC-2.9(3)): re-read, `sha1`-compared to the
  source bytes, and only then is the overwrite or delete performed. A recorded hash is **not** an
  acceptable substitute for the backup itself — a digest is one-way and cannot restore content. *(P0)*
- **AC-3.5** — Who: the operator. Given `--force` overwrote a `local-edit` or `unverified` row,
  When the newest backup for that `id` is restored to `consumerPath`, Then the file is
  byte-identical to its pre-sync content. Restore is the only oracle for AC-3.4 that cannot be
  false-greened. *(P0)*
- **AC-3.6** — Who: the operator. Given a sync completes, When `--check` is run immediately after
  with no intervening edit, Then every row the sync copied reports `in-sync`, and every row the
  sync skipped reports the same state it held before the sync. *(P0)*
- **AC-3.7** — Who: the operator. Given a sync completes, When sync is run a second time with the
  same flags and **no intervening change to `.claude/workflows/` from any source**, Then it copies
  nothing, writes no new backup, leaves the sync manifest byte-identical, and exits `0`. Sync is
  idempotent.

  **Version-control caveat (AC-3.9).** "No intervening change" includes version-control operations:
  a `git checkout`, branch switch or `git stash pop` that **resurrects a retired, still-tracked
  file** is an intervening change, and the next sync will correctly retire it again, writing a
  second backup. That is the specified behaviour, not a violation of idempotence — but it means the
  idempotence test must run with the retired paths untracked, which AC-3.9's landing step
  guarantees for this repo. A test that asserts AC-3.7 while `git ls-files` still returns the
  retired paths is asserting a property of the git index, not of sync. *(P0)*
- **AC-3.8** — Who: the operator on a fresh consumer **whose repo root AC-0.5 resolves**. Given the
  consumer repo has no
  `.claude/workflows/` directory at all, When `--check` runs, Then every managed row is `missing`
  (this is not a distinct state), the drift state file is written into a `.claude/workflows/` the run
  itself creates (AC-2.9(1)), and exit is `1`; When sync runs, Then the directory is created —
  **under the repo root resolved by AC-0.5, which is never `$HOME`** — and every row is copied.

  `missing`, not `unknown`, is the required classification here, and AC-1.1's `parent-absent` case is
  what supplies it: the parent directory does not exist, its first existing ancestor is traversable,
  so nothing can be hiding under it and absence *is* established (TE v7 F-02). **The classification is
  taken before the run's own `mkdir -p`** — AC-2.9(1) makes that order normative, which is what keeps
  `parent-absent` (rather than `absent`) the axis value realised here even though the same run creates
  the directory (TE v9 F-03). This AC and AC-6.5 are
  the two places the distinction is
  load-bearing — read the other way, `--check` would exit `3`, AC-3.1 would refuse to copy, and the
  bootstrap would be unreachable.

  **Which populations this Given is satisfiable for (TE v8 F-01, second half).** AC-0.5 resolves a
  root by one of two routes, and the Given here removes one of the two anchors, so the qualifier in
  this AC's *Who* is a real restriction, not boilerplate:

  | Consumer | Root resolves? | This AC |
  |---|---|---|
  | a git work tree with no `.claude/` at all | **yes** — AC-0.5 step 1 (`git worktree list --porcelain`) needs no `.claude/` | applies; the run creates `.claude/workflows/` |
  | a non-git tree that has `.claude/` but not `.claude/workflows/` | **yes** — step 2's upward walk finds the `.claude/` anchor | applies; the run creates `.claude/workflows/` |
  | a non-git tree with **no `.claude/` at all** | **no** — step 1 does not apply and step 2 has no anchor to find ⇒ `repo-root-unresolved` | does **not** apply. `--check` exits **`3`** (AC-3.3 row 2 — *no write target*, so no write is attempted and row 1's exit `4` does not apply; TE v9 F-02), the hook warns the environment fix (AC-2.5a), nothing is created anywhere (AC-2.9(1)), and the queue blocks on row 1 |

  The third row is the decided answer, not a gap: with neither a git repository nor a `.claude/`
  directory there is no non-arbitrary way to pick which directory in the tree becomes the consumer
  root, and AC-0.5's whole argument is that a **wrong root is worse than a refusal**. The remediation
  is one `mkdir .claude` (or `git init`) at the intended root, which AC-2.5a's message names. v8 left
  this population implicit, which read as though AC-3.8 covered every fresh consumer.  *(P0)*
- **AC-3.9 — Legacy artifact retirement.** Who: the operator on a consumer holding a superseded
  artifact. Given `baselineStatus` is `resolved` (AC-1.0 — retirement is manifest-derived and is
  **not evaluated at all** when the baseline is unresolved) and a path in some row R's `retires`
  array (AC-0.1, AC-0.7) exists in the consumer, When `sync-workflows.sh` runs (not `--check`),
  Then the retirement of that path is gated on **row R specifically**:

  > **Guard.** After the copy loop completes, a path `p ∈ R.retires` may be removed **if and only
  > if row R's post-copy state is `in-sync`.** If R is in any other state — including `local-edit`,
  > `unverified` and every `unknown`, the three classes AC-3.1 skips — `p` is left in place and the
  > run reports `retire-skipped` for `p` naming R's state.

  When the guard passes, the retired file's content is backed up under AC-3.4's rules with
  `id` = the retired basename, **the backup is verified by re-read and `sha1` comparison against the
  source bytes (AC-2.9(3)), and only then is the file deleted** — the delete is conditional on the
  backup, in that order, and a failed or mismatching backup leaves `p` in place with
  `retire-skipped`, a `writeFailures` entry and exit `4`. v8 left the two operations unordered with
  respect to the backup's *success*, which is a specifiable path to the exact loss the closing
  sentence of this AC names (SE v8 F-02). `--check`
  reports retired paths present as `retired-present` in the human-facing report and contributes
  exit code `1` (same class as `stale`: a real, sync-fixable divergence). Retirement is reported
  per path, is idempotent (a second run finds nothing to retire and writes no backup, satisfying
  AC-3.7), and never runs before its replacement is in place — the failure mode to avoid is
  deleting the loadable artifact and leaving nothing.

  **Why the guard is per-row (TE v5 F-02).** v5 said "only after the managed row that supersedes it
  has been written or confirmed `in-sync`" over a *flat* `retired` array, which named a relation the
  schema could not express: no fixture could state which row supersedes which path, so the guard was
  unfalsifiable and the natural implementation — "delete all retired paths once the copy loop
  finishes" — was green on every authorised test while deleting the last loadable artifact whenever
  the corresponding copy was skipped. `retires` supplies the missing key, and the mandated falsifying
  test is: *`R.pluginPath` absent ⇒ R is `unknown`/`plugin-artifact-missing` ⇒ sync runs ⇒
  `R.retires` paths still exist and `retire-skipped` was reported.* Rationale: §0 facts 7–8; `.claude/workflows/`
  currently holds both `orchestrate-dev.js` and `orchestrate-dev.bundle.js`, both declaring
  `meta.name: "orchestrate-dev"`, and leaving the stale one in place is precisely the bug this
  feature exists to eliminate.

  **Version control.** `git ls-files .claude/` returns all four paths today (§0), so a naive delete
  leaves a dirty tree that any branch switch undoes. Two rules, and they are different in kind:

  1. **In this repo, once: a maintainer step, not a script step.** Landing this feature includes a
     commit that `git rm`s `.claude/workflows/orchestrate-{dev,queue}.js` and
     `.claude/workflows/orchestrate-{dev,queue}.bundle.js`, and adds `.claude/workflows/` (except
     `.gitignore`-worthy exclusions) to `.gitignore` — the bundles are no longer a tracked
     generated tree (AC-6.1 makes `pdlc/workflows/dist/` the tracked one) and the legacy `.js`
     copies are gone for good. This is in scope (§6) and is what makes AC-2.2's silence, AC-3.3's
     exit 0 and AC-3.7's idempotence stably reachable here.
  2. **In any consumer, always: sync reports, it does not commit.** `sync-workflows.sh` never runs
     a VCS command. When it retires a path that is tracked in the consumer's VCS (detected by a
     best-effort `git ls-files --error-unmatch`, treated as "untracked" if git is unavailable), it
     performs the backup and delete as specified and **additionally prints a one-line manual
     action** naming the path and telling the operator to commit the removal, because otherwise
     the next checkout resurrects it (AC-3.7's caveat). Detection failure never blocks retirement.
  *(P0)*

### REQ-DIST-04 — Pipeline integration (defense-in-depth)

**Primary detector is the hook, not the queue.** The SessionStart hook (REQ-DIST-02) ships from the
plugin and executes regardless of what the consumer's workflow copies contain; the queue check
lives *inside* the artifact whose staleness it is detecting. A consumer whose `orchestrate-queue`
bundle predates this feature contains no queue check and will never report itself stale via
AC-4.1 — the first and worst instance of the problem is covered only by the hook. REQ-DIST-04 is
therefore explicitly secondary, and the first-adoption story is: **install/update the plugin → the
hook ships with it and fires on the next session start → the operator runs sync → the queue check
exists from that point onward.** No AC in REQ-DIST-04 may be relied on for first adoption.

- **AC-4.1** — Who: `orchestrate-queue`. Given the queue begins an invocation, When it starts,
  Then it performs **one** injected file read of `.claude/workflows/.pdlc-drift-state.json`
  (AC-2.6) — it does not hash, enumerate or classify anything itself — and maps the states it
  finds to an outcome per this complete table: *(P0)*

  | Condition, in this precedence order | Queue outcome |
  |---|---|
  | the read returns absent, or the content is unparseable JSON, or `schemaVersion` != 1, **or `baselineStatus` is absent** — this row catches the `repo-root-unresolved` case, where no file was ever written, and AC-2.9(2a) **step 2** (the stale file was unlinked). It deliberately does **not** catch step 1's invalidation record, which is schema-valid and lands on row 4 below, so that row 2 stays reachable (SE v10 F-01) | `blocked` |
  | `checkEnabled` is `false` | proceed, skip noted in the report (AC-4.3) |
  | **`writeFailures` is a non-empty array** — i.e. a write this run *attempted and failed* (AC-2.9(2)); a run with **no write target** produces no file at all and is caught by row 1, not here (TE v9 F-02). AC-2.9(2a) step 1's invalidation record **carries this run's collected entries** when a JSON tool was available, so a run that failed a copy *and* then failed the drift-state write blocks **here**, with `baselineReason` still `drift-state-invalidated` in the file (SE v11 F-05) | `blocked`, naming each `{ path, operation }` — `operation` from AC-2.9(2)'s closed nine-member set |
  | **`baselineStatus` is `unresolved`** (AC-1.0), for any reason including `manifest-empty` and **`drift-state-invalidated`** (AC-2.9(2a) step 1) | `blocked`, naming `baselineReason` |
  | any row `unknown` | `blocked` |
  | any row `missing` | `blocked` |
  | any row `stale` | `blocked` |
  | `retiredPresent` is a non-empty array | `blocked` |
  | any row `local-edit` or `unverified` | proceed, with the rows named in the run report |
  | **`baselineStatus` `resolved`, `rows` non-empty**, all rows `in-sync`, `retiredPresent` `[]`, `writeFailures` `[]` | proceed silently |

  Row 3 (`writeFailures` non-empty) and row 4 (`baselineStatus` `unresolved`) sit immediately
  **below** `checkEnabled` so that AC-0.3b's
  interim escape still works, and **above** every row-quantified condition so that the
  manifest-absent state — universal at rollout — cannot fall through to the last row. With
  `rows: []`, every existential row is unsatisfied and the final universal row is true of nothing,
  so v5's table proceeded silently on a pipeline where nothing had been verified (TE v5 F-01).

  `local-edit` and `unverified` proceed because they represent a deliberate or unknown operator
  divergence that blocking would strand; `unknown` blocks because AC-1.2's rule applies at the
  queue seam too, and an `unresolved` baseline blocks because AC-1.0's does.

  **Why `retiredPresent` blocks, and why it is a top-level field rather than a row.** A retired
  path present beside a fresh bundle is the one configuration in which §0 fact 8 says the runtime
  may execute the **stale** artifact — and until BL-05 is answered we do not know that it does not.
  A queue that reported all-clear in that configuration would reintroduce, one layer up, the exact
  false green this feature exists to prevent (TE v4 F-05). It blocks in the same class as `stale`
  because it is sync-fixable by the same command (AC-3.9), matching `--check`'s exit `1` (AC-3.3).
  It cannot be a row in `rows`: AC-2.6 fixes `rows` at exactly one entry per manifest row, and a
  retired path is expressly not a manifest row (AC-0.7) — so the fact travels in its own field,
  which the queue reads from the same single file it already reads (no second read, NFR-1 intact).

  **No freshness clause.** v2/v3 required the file to be "not older than the current session
  start". That is deleted, not deferred: the queue runs in the restricted runtime with no `process`
  and no `fs`, its only seam is the injected `_readFile` (contents, not stat metadata), and nothing
  in this REQ produces a session-start instant the queue could read — so the clause had no input a
  test could vary, and would have shipped as dead code or an always-pass guard. What replaces it is
  observable, and the argument is stated with its one failure case in it rather than around it
  (SE v9 F-01):

  1. AC-2.7 makes *every* writer refresh the file, so on every path where a write **succeeds** a
     stale snapshot cannot outlive the operation that invalidated it.
  2. The "hook never ran" and "no write target" cases leave no file, which row 1 blocks on.
  3. The remaining case — a write **attempted and failed** over a pre-existing file — is exactly
     where v9's justification was false of v9's own AC-2.9(2): the old file survived, said
     `writeFailures: []`, possibly said every row `in-sync`, and this table's last row therefore
     read *proceed silently* on a run that recorded nothing. AC-2.9(2a) closes it at the writer: the
     stale contents are replaced by an **invalidation record** (`baselineStatus` `unresolved` /
     `drift-state-invalidated` ⇒ **row 4** above, or **row 3** when the record carries this run's
     earlier `writeFailures`), or — in the non-permission failures AC-2.9(2a) scopes step 2 to, where
     the directory is still writable — the file is unlinked (⇒ **row 1**). All three block; the
     record additionally preserves the operator's resolved
     `checkEnabled`, so a consumer that is *permanently* unwritable can still be opted out through
     row 2 rather than being blocked forever with no escape (SE v10 F-01).
  4. The residual AC-2.9(2a) step 3 names — neither the file nor the directory is writable — is a
     case in which the queue can still proceed on stale contents. It is accepted, stated here, at
     AC-2.9(2a) and in **NFR-6** itself, and announced on stderr at every drift computation; closing
     it would need a queue-visible input the restricted runtime does not offer (contents only, no
     stat metadata).

  `generatedAtUtc` remains in the schema for the human report only, and
  the queue never compares it to anything — comparing timestamps would be a classification
  decision, which NFR-1 forbids at this surface.
- **AC-4.2** — Who: the operator. Given AC-4.1 blocks, When the report is written, Then it names
  each blocking row `id`, its state, its reason, and the exact remediation command, so the
  operator's next turn is one command rather than an investigation. When the block came from
  `baselineStatus`, it names `baselineReason` instead of rows, since there are none.

  **The report is split by level, because the two reason sets are (TE v7 F-06).** AC-1.2 states that
  manifest-level and row-level reasons are disjoint by construction and §4 carries a row for each; a
  single flat remediation list made it impossible for a golden-output author to tell which block a
  reason like `consumer-artifact-unreadable` is printed in. The remediation named must actually be
  able to fix the reason:

  | Level | Reason | Remediation named |
  |---|---|---|
  | **Manifest** (AC-1.0; printed in the baseline block, with no rows) | `manifest-absent`, `manifest-malformed`, `manifest-empty` | **plugin update**, not `sync-workflows.sh` (AC-0.3b) |
  | Manifest | `plugin-root-unset`, `plugin-root-unreadable`, `repo-root-unresolved`, `json-tool-absent` | the corresponding environment fix (§4) |
  | Manifest | **`drift-state-invalidated`** (AC-2.9(2a) step 1 — this run's drift could not be recorded) | the **permissions / filesystem fix** on `.claude/workflows/` and the drift state file, the same message the writer printed to stderr; never `sync-workflows.sh`, which will fail the same way |
  | **Row** (AC-1.2; printed per row, with the row `id` and state) | `plugin-artifact-missing` | **plugin update** — the package does not contain the artifact |
  | Row | `plugin-artifact-unreadable`, `consumer-artifact-unreadable`, `hash-tool-absent` | the corresponding environment or permissions fix (§4, AC-1.2) |
  | Row (states, not reasons) | `stale`, `missing` | `sync-workflows.sh` |
  | **Run** (AC-2.9; printed in its own block, one line per `writeFailures` entry, naming `path` and `operation` — `operation` is one of AC-2.9(2)'s closed nine tokens, so the line is assertable verbatim) | a mandated write was attempted and failed | the **permissions / filesystem fix** on the named path — never `sync-workflows.sh`, which will fail the same way. When the drift state file itself could not be written the queue sees either row 4 (AC-2.9(2a) step 1's invalidation record) or row 1 (step 2's unlink, or no file at all), so the message the operator acts on is the one the hook and `--check` printed to stderr |

  When several row reasons hold at once, the reason printed is the one AC-1.2's declared precedence
  selects, so this table has one applicable row per printed row (TE v8 F-04).

  And **for a non-empty `retiredPresent` it is whatever AC-2.8's per-path table
  names for the state of the row R that supersedes each path** — plain sync when R is `in-sync`,
  `stale` or `missing`, `--force` with the backup directory and filename pattern named when R is
  `local-edit`/`unverified`,
  plugin update or an environment fix when R is `unknown`. v6 named the plain command
  unconditionally, which for an R in `local-edit` names a command that re-runs AC-3.9's guard,
  retires nothing and blocks the queue again (TE v6 F-02); the report must therefore carry R's
  `id` and state alongside each retired path, so the conditioning is visible in the output a golden
  test asserts. Every
  printed command is the `<pluginRoot>`-expanded path of AC-0.4, so it is runnable as printed in the
  repo the operator is standing in. *(P0)*
- **AC-4.3** — Who: the consuming-repo operator. Given the consumer file
  `.claude/pdlc.config.json` with key `distribution.checkEnabled`, When a drift computation runs,
  Then **the shell writer** (hook, `--check`, or sync) resolves the flag and encodes the resolved
  boolean into the drift state file as `checkEnabled` (AC-2.6). The queue reads that field from the
  one file it already reads and, when it is `false`, skips the AC-4.1 state evaluation and notes
  the skip in its report. Given `.claude/pdlc.config.json` is absent, unparseable, or the key is
  absent, Then the resolved value is `true`.

  **All four `readBytes_json` outcomes have a stated value here, exit `10` included
  (TE v11 F-05).** v11 enumerated three cases — absent, unparseable, key absent — while AC-1.1a's
  probe is four-valued and names AC-4.3 as a call site, so a **present-but-unreadable** config (a
  root-owned `.claude/` under a non-root user, or a directory at the path) had **no defined
  `checkEnabled`** at the one seam where the difference is `blocked` versus `proceed`. The mapping is
  complete and fail-closed:

  | `readBytes_json(.claude/pdlc.config.json)` | Resolved `checkEnabled` |
  |---|---|
  | `0` parsed, key present | the key's boolean |
  | `0` parsed, key absent | `true` |
  | `11` absent | `true` |
  | `12` malformed | `true`, and the writer prints `pdlc: could not parse .claude/pdlc.config.json — drift checks stay enabled` |
  | **`10` unreadable** | **`true`**, and the writer prints `pdlc: could not read .claude/pdlc.config.json — drift checks stay enabled` |

  `true` is the fail-closed answer in every degraded case: the flag exists to *disable* a safety
  check, so an unreadable file must never be read as an opt-out. The two warning lines are distinct
  and verbatim so a golden test can tell them apart, and the `10` fixture is added to AC-1.1a's uid-0
  checklist (its `chmod` form skips at root; the directory form does not). The queue **never** opens
  `.claude/pdlc.config.json` — that would be a second injected read, which AC-4.1's "one read" and
  NFR-1 both forbid. Scope of the flag: it gates the **queue** only. The SessionStart hook still
  warns and `--check` still exits non-zero, because those are the surfaces an operator can ignore
  at will; the queue is the one that halts work. The flag deliberately does **not** live in the
  workflow source, because a flag inside the drifting artifact would make an operator's toggle a
  `local-edit`. *(P1)*

### REQ-DIST-05 — Version stamping (reporting only)

**The version never lives inside the bundle.** v2/v3 required `meta.version` on each module,
propagated by `build-runtime.mjs` into the emitted bundle. §0 fact 9 shows that is the opposite of
how the builder works and of what the runtime permits: the builder hand-writes each bundle's `meta`
*because* the runtime demands a pure first-statement literal, and a shell script would then have to
extract a JS object field from a 92 KB generated file. Version stamping is therefore moved to
**data the builder emits alongside the bundles**, which is trivially readable by the same JSON tool
the rest of the feature already uses (§4).

- **AC-5.1** — Who: `build-runtime.mjs`. Given a build, When the bundles are emitted, Then the
  builder also emits `pdlc/workflows/dist/distribution-manifest.json` (the sole manifest location —
  AC-0.1) containing, for each row,
  `artifactVersion` (the plugin's `plugin.json` `version` at build time, e.g. `0.10.0`) and
  `pluginSha1` (the sha1 of the emitted bundle). No module and no bundle gains a `version` field;
  `meta` literals are untouched, so the runtime's pure-literal/first-statement constraint and
  `__tests__/runtimeBundle.test.js` are unaffected. *(P1)*
- **AC-5.2** — Who: the operator. Given the content hash and the version stamp disagree (a
  hand-edited manifest, a rebuilt bundle under an unbumped plugin version — which §0 fact 5 shows
  really happens), When the state is decided, Then the **content hash is authoritative and the
  version is reporting-only**. No state in AC-1.1 is ever decided by a version comparison, and
  versions are compared for **equality only** — never ordered. Nothing in this feature needs a
  semver comparator or `sort -V`, and none is declared in §4. *(P1)*
- **AC-5.3** — Who: the operator reading a drift report. Given a row is not `in-sync`, When the
  report is produced, Then `pluginArtifactVersion` is read from the shipped
  `distribution-manifest.json` and `consumerArtifactVersion` from the sync manifest's
  `artifactVersion` for that row (AC-1.6). Given either is absent — no sync-manifest entry, or a
  pre-feature plugin whose manifest lacks the field, which is the entire first-run population —
  Then it renders as `unknown` and no state, exit code or queue outcome changes as a result.
  Absence of a stamp is never an error.

  **Both version lines are labelled "not a drift signal".** `artifactVersion` is the plugin version
  at build time, and AC-6.3 requires bundles to be rebuilt on every source change while the plugin
  version bumps only at release — so many distinct bundle contents legitimately share one
  `artifactVersion`, and a report showing `plugin 0.10.0 / consumer 0.10.0` beside a hash mismatch
  is correct, not contradictory. The report must therefore label the `artifactVersion` line the way
  AC-5.4 already labels `pluginVersion`, and print the two `sha1` values (AC-2.6 `pluginHash` /
  `consumerHash`) as the discriminating evidence.

  **Both version lines are required in the report, not optional.** v5 permitted an implementer to
  drop `artifactVersion`; that made every report oracle conditional — a golden-output test asserting
  the line fails on a conforming implementation that omitted it, and a test not asserting it cannot
  catch an accidental regression that drops it (TE v5 F-10). The report is a human-facing surface
  with golden-output tests, so the field is **present, labelled, and asserted**. *(P1)*
- **AC-5.4** — Who: the operator. Given the plugin's `plugin.json` version, When the report is
  produced, Then it is included as **context only**, explicitly labelled as not a drift signal:
  cached `0.9.0` and `0.10.0` ship byte-identical workflow files (§0 fact 5), so plugin version
  demonstrably does not identify workflow content. *(P2)*

### REQ-DIST-06 — Publish the executable artifact in the plugin package

This is the requirement US-04 traces to, and the precondition for every copy AC above: today there
is nothing in the plugin package to copy (§0 fact 3).

- **AC-6.1 — One canonical build output.** Who: the maintainer. Given
  `node pdlc/workflows/build-runtime.mjs`, When it runs, Then it writes
  **`pdlc/workflows/dist/` and nothing else**: it emits `dist/*.bundle.js` and
  `dist/distribution-manifest.json` there, both tracked and committed, and it writes **no** file
  under `.claude/workflows/` — no bundle, no sync-manifest entry, no drift state. Mechanically this
  is a retarget of the single `OUT_DIR` constant at `build-runtime.mjs:29`, whose only content write
  is at `:184` inside the `:172-186` loop (§0 fact 13), not the
  addition of a second output target. `build-runtime.mjs --check` compares `dist/` only.

  **Standing constraint: the builder depends on node builtins only** (§0 fact 16 — `fs`, `path`, `url`
  at `:23-25`, nothing else). AC-6.5's bootstrap runs it in a copied tree with no `node_modules/` and
  no install step, so this is load-bearing rather than incidental: a change that gives the builder a
  package dependency must add an install step to AC-6.5's fixture in the same commit (SE v8 F-06).

  **`.claude/workflows/` is populated by `sync-workflows.sh`, in this repo exactly as in any other
  consumer.** The maintainer's loop is **build → sync**, two commands, and the second one is the
  same script every consumer runs, invoked at `<pluginRoot>/hooks/scripts/sync-workflows.sh` =
  `pdlc/hooks/scripts/sync-workflows.sh` here (REQ-DIST-03 preamble, AC-6.5), with AC-0.3a
  substituting `<pluginRoot>` so it finds `dist/` locally.
  Consequences, all of which were ambiguous in v4 (SE v4 F-04, F-05): there is exactly one writer
  of **managed artifacts** into `.claude/workflows/` (AC-1.6 — the hook and the backup writer also
  write into that directory, which is why the qualifier is not optional), exactly two writers of the
  drift state file (AC-2.7), and the
  maintainer-repo remediation loop closes in-session because the sync run that fixes the drift is
  the same run that rewrites the drift state. `.claude/workflows/*.bundle.js` cease to be a second
  *tracked* generated tree — they are gitignored, untracked consumer copies after AC-3.9's landing
  step. One generated tree is authoritative (`dist/`), one is a consumer copy, and no process
  writes both. *(P0)*
- **AC-6.2 — Packaging oracle, executable before release.** Who: the `pdlc/workflows` jest suite.
  Given the set of files that would be packaged for the plugin (`.claude-plugin/marketplace.json`
  declares `source: ./pdlc`, so: everything under `pdlc/` minus the repo's ignore rules), When
  `npm test` runs on any commit, Then a test asserts that (a) every `pluginPath` in
  `dist/distribution-manifest.json` resolves to a file inside that packaged set, (b) each such
  file's `sha1`, **recomputed from the bytes on disk**, equals that row's `pluginSha1`, (c) the
  manifest's top-level `retired` array equals the union of the rows' `retires` (AC-0.2), and (d) the
  manifest
  itself is at `pdlc/workflows/dist/distribution-manifest.json` inside that set — the packaged
  path, joined as `workflows/dist/distribution-manifest.json` under `<pluginRoot>`, is what AC-0.1
  reads, so a path regression is caught here and not by a consumer.

  **AC-6.2 does not rebuild; freshness is AC-6.3's job.** v5's clause (b) — "byte-identical to the
  freshly built bundle" — is a self-comparison unless the test invokes the builder, because the file
  it reads *is* the build output; the most likely implementation was therefore a tautology
  (TE v5 F-07). This AC is now membership + hash-integrity + manifest-shape only. The
  source→bundle freshness relation is asserted exactly once, by `__tests__/runtimeBundle.test.js`
  under AC-6.3, and **no test in this feature runs the builder in a way that writes into *this
  repository's* `pdlc/workflows/dist/`** — the suite never mutates its own tracked inputs. The
  qualifier is not decorative: AC-6.5's bootstrap test *does* run
  `node pdlc/workflows/build-runtime.mjs`, which by AC-6.1 emits into `pdlc/workflows/dist/` — **of
  its isolated fixture tree under `os.tmpdir()`**, never of the work tree. v7 stated the prohibition
  absolutely, which AC-6.5 (added in the same revision) falsifies as written and which an
  implementer could cite while deleting the bootstrap test (SE v7 F-05).

  **Build inputs in the package are tolerated, not asserted away.** No ignore rule under `pdlc/`
  other than `node_modules/` applies (the repo-root `.gitignore` also ignores `.tokensave/`,
  `.claude/settings.local.json` and `.claude/.headroom_wrap_marker.json`, none of which touch the
  `pdlc/` subtree, and AC-3.9's landing step adds a fourth root rule for `.claude/workflows/`; state
  the claim as "no rule under `pdlc/` other than `node_modules/`" so it does not drift — SE v5 F-08).
  So the packaged set today also contains `pdlc/workflows/__tests__/`,
  `package.json`, `package-lock.json`, `build-runtime.mjs` and `runtime-adapter.js`. That is
  accepted: shipping them is harmless (nothing reads them consumer-side) and AC-0.2 already bars
  them from being *copied into a consumer repo*, which is the property that matters. AC-6.2
  therefore asserts no converse of the form "no build input is packaged" — such an assertion would
  be a packaging-hygiene requirement this REQ does not make, and writing it would immediately go
  red on the current tree.

  This is the pre-release surrogate: the failure §0 fact 3 documents — the artifact being excluded
  from the package — is caught on **every commit**, not first observed by a consumer after
  publication. *(P0)*
- **AC-6.2a** — Who: a consumer. Given a plugin installed from the marketplace at version *V*, When
  `${CLAUDE_PLUGIN_ROOT}/workflows/dist/` is listed, Then it contains exactly the bundles named in
  the distribution manifest **plus the manifest itself** — AC-0.1/AC-5.1/AC-6.1 place
  `distribution-manifest.json` in that same directory, so v5's unqualified "exactly the bundles" was
  falsified by its own manifest location (SE v5 F-09). This is the post-install smoke check; it is verified by a manual
  release-checklist step until D-DIST-06 automates it, and AC-6.2 is what actually gates
  development. *(P1)*
- **AC-6.3 — A→A′ freshness, on the surface that exists.** Who: the `pdlc/workflows` jest suite.
  Given a commit changes any of `orchestrate-dev.js`, `orchestrate-queue.js` or
  `runtime-adapter.js`, When `cd pdlc/workflows && npm test` runs, Then
  `__tests__/runtimeBundle.test.js` fails unless the committed `dist/` bundles were rebuilt in the
  same commit, so node A→A′ can never drift. That suite already asserts bundle freshness against
  `.claude/workflows/`; this feature repoints it at `dist/` per AC-6.1. There is no CI on this repo
  today (§0 fact 10), so this AC is addressed to `npm test` and nothing in this REQ is verifiable
  only by a hosted runner. Standing up hosted CI to run `npm test` on every push is D-DIST-06.
  *(P0)*
- **AC-6.4 — No *normative* document contradicts the manifest.** Who: the maintainer, and the
  `pdlc/workflows` jest suite. Given the migration from `.js` copies to `.bundle.js` copies and
  AC-6.1's move of the build output to `dist/`, When this feature lands, Then no file in the
  **covered set** states a workflow-distribution convention contradicting the shipped distribution
  manifest, and a test asserts it.

  **The oracle is one expression, with nothing hand-listed:**

  > `coveredViolations(root) := grep(root, PATTERNS) − { p : exempt(p) }`, and the assertion is
  > `coveredViolations(repoRoot) == ∅`.

  **`PATTERNS` — four literal, qualifier-free alternatives**, exactly as the test runs them:

  | # | Pattern (POSIX ERE) |
  |---|---|
  | 1 | `\.claude/workflows/orchestrate-dev\.js` |
  | 2 | `\.claude/workflows/orchestrate-queue\.js` |
  | 3 | `\.claude/workflows/\*\.js` |
  | 4 | `managed manually` |

  v5 wrote pattern 4 as "the phrase *managed manually* **in a distribution context**". No grep can
  evaluate "in a distribution context", so an implementer had to either drop it (silently changing
  what the test matches) or hand-curate the hits — the hand-maintained list that was wrong in v2,
  v3, v4 and v5. The qualifier is **deleted**: measured at `5630d58`, every hit it was meant to
  exclude (`docs/orchestrate-dev-workflow/TSPEC-*.md`, this feature's own documents) is already
  excluded by `exempt`, so it separated nothing (SE v5 F-03, TE v5 F-03). Patterns 3 and 4 are also
  the *only* way `docs/_queue/QUEUE.md` and `docs/design/MASTER-PLAN-engineering-loop.md` — the two
  most live normative surfaces — enter the set at all; v5's §0 fact 14 measured with pattern 1|2
  alone and therefore printed a table the cited command does not produce.

  **`exempt(p)` — a rule over paths, not a list.** The covered set is *everything else*, so the two
  provably partition the tree and no file can be in neither (TE v5 F-05):

  | Rule | Matches today | Why |
  |---|---|---|
  | `p` is under a **generated tree**: `.claude/workflows/**`, `pdlc/workflows/dist/**`, any `node_modules/**` | the 4 tracked `.claude/workflows/*` artifacts; `dist/` once AC-6.1 lands | Generated, not documentation. `dist/*.bundle.js` inlines the module headers this AC corrects, so on the first commit after the correction and before a rebuild it still contains the superseded string — a covered-set reading would go RED on a file no human writes (SE v5 F-04). |
  | `p` is under a **per-feature artifact directory**: any `docs/<dir>/` containing a `REQ-*.md` | `docs/orchestrate-dev-workflow/`, `docs/pdlc-workflow-distribution/` | A shipped feature's REQ/FSPEC/TSPEC/PLAN/PROPERTIES record what was true when it shipped; rewriting them falsifies history. This feature's own documents quote the superseded form in order to retire it. The rule is computable — `docs/design/`, `docs/_queue/`, `docs/_constraints/`, `docs/_decisions/` and `docs/*.md` contain no `REQ-*.md` and are therefore covered. |
  | `p` is a `distribution-manifest.json`, for its `retired`/`retires` values | none tracked yet | AC-0.7 **requires** those to contain the superseded paths. Subsumed by rule 1 today (manifests live under `dist/`), stated separately so a future manifest location does not silently go RED. |
  | `p` is under a **test tree**: any `**/__tests__/**` | nothing today (no `__tests__` file matches `PATTERNS` at `5630d58`) | Fixtures and golden-output data are **inputs to the oracle, not instructions to a reader**. This AC corrects documents that *tell* a maintainer the wrong convention; a fixture that states the superseded convention exists precisely so the checker can be shown going RED, and a golden output naming `.claude/workflows/orchestrate-dev.js` exists because AC-2.8 requires each retired path to be named individually. Without this rule the two mandatory assertions below contradict each other — see the note. |

  Files in neither set do not exist by construction: `README.md`, `pdlc/README.md`,
  `pdlc/hooks/scripts/*.sh`, `docs/_constraints/**` and future `docs/design/*.md` are all **covered**,
  which is the intended answer — adding `docs/design/MASTER-PLAN-v2.md` stating the superseded
  convention must go RED.

  **Why rule 4 exists (SE v6 F-01).** v6's exemption set had exactly three members and declared "the
  covered set is *everything else*", which put `pdlc/workflows/__tests__/**` in the **covered** set.
  That made the AC's own two mandatory assertions unsatisfiable together: the mandated RED fixture,
  once committed, is itself a covered violation, so `coveredViolations(repoRoot) == ∅` is
  permanently red. The same collision hits every AC-3.4 backup-filename fixture
  (`orchestrate-dev.js.…bak`), every AC-0.7 `retires` fixture not literally named
  `distribution-manifest.json` (rule 3 is keyed on the filename), and every AC-2.8 golden output.
  The implementer's only escape was to narrow `PATTERNS` or drop the real-root assertion — precisely
  the degradation this AC exists to prevent.

  **On pattern 4's breadth (TE v6 F-07).** Pattern 4 is the unqualified English phrase
  `managed manually`, and the exemption set is purely path-based, so a future *covered* document
  using that phrase in an unrelated sense (a runbook saying a secret is "managed manually") goes RED
  with no exemption available. **The sanctioned resolution is to rephrase the document; narrowing
  the pattern is never sanctioned.** The qualifier-free pattern is the whole point — every attempt
  to qualify it (v2–v5) produced a hand-curated list that was wrong. If the phrase genuinely needs
  to survive in a covered document, the change is to `PATTERNS` **and to this AC**, in one commit,
  with the measurement re-derived.

  **The checker is a pure function of a root directory** — `coveredViolations(root)` takes the root
  (or an explicit file list) and returns the violating paths; it never reads `process.cwd()` and
  never hardcodes repository paths. This is what gives the mandated falsifying case an injection
  seam, and exactly **one** additional
  assertion binds the function to the real repository root. Without the seam, exercising RED would
  require writing into tracked normative directories during `npm test` — polluting the working tree,
  racing parallel suites, and leaving the repo dirty on a throw — so the falsifying case would be
  dropped as unimplementable and the assertion would degrade to the one-directional grep this AC
  exists to prevent (TE v5 F-06). File discovery inside `root` is `git ls-files` when `root` is a
  git work tree and a directory walk otherwise, so a fixture tree needs no git.

  **Where the fixture tree lives — the REQ picks one (TE v6 F-01, SE v6 F-01).** The fixture root is
  a **non-git temporary tree created by the test under `os.tmpdir()` and removed by the test**,
  matching the house pattern already in `pdlc/workflows/__tests__/fixtures/tmpGitFixture.js`
  (`mkdtempSync(join(tmpdir(), …))`). It is **never inside the repository work tree**. This is
  load-bearing in both directions:

  - *It makes the discovery branch deterministic.* Inside the repo work tree, discovery is
    `git ls-files` — tracked files only — so a fixture written at test time is **untracked**,
    `coveredViolations` returns `∅`, and the "RED" case passes while proving nothing. That is the
    assertion-that-cannot-fail this AC was written to prevent, one level down (TE v4 F-04,
    v5 F-06). A temp tree is not a git work tree, so the directory-walk branch runs and the fixture
    is always discovered.
  - *It keeps the repo-root assertion satisfiable.* Nothing the RED case writes is ever a tracked
    file at a covered path, so `coveredViolations(repoRoot) == ∅` stays independent of the fixtures.

  Exemption rule 4 (`**/__tests__/**`) is the belt to this braces: it exists so that *other* test
  data which must legitimately quote the superseded string — AC-3.4 backup-filename fixtures,
  AC-0.7 `retires` fixtures, AC-2.8 golden outputs, all of which are naturally committed — cannot
  make the repo-root assertion red either. Both mechanisms ship; neither alone is sufficient.

  **Falsifying case (mandatory, two-directional):** in the temp fixture tree, a file at a covered
  path stating the superseded convention ⇒ **RED**; the identical text under each of the four exempt
  rules ⇒ **GREEN**. Both
  directions ship, or the implementer facing a red grep will narrow the pattern until it passes and
  the assertion will prove nothing (TE v4 F-04).

  Measured at `5630d58` (§0 fact 14), `coveredViolations(repoRoot)` is exactly five files —
  `docs/_queue/QUEUE.md`, `docs/design/MASTER-PLAN-engineering-loop.md`,
  `docs/PLAN-pdlc-integration-boundary-gates.md`, `pdlc/workflows/orchestrate-dev.js`,
  `pdlc/workflows/orchestrate-queue.js` — and correcting them is what makes the assertion green.
  `CLAUDE.md`, `pdlc/skills/orchestrate-dev/SKILL.md` and `pdlc/skills/orchestrate-queue/SKILL.md`
  already name `.bundle.js` and do **not** appear in the grep output; their `dist/` path update is an
  ordinary in-scope edit (§6), not part of this oracle. This measurement is a *measurement*: the test
  recomputes it, and §6's in-scope item is "whatever `coveredViolations` returns", never a file list.
  *(P1)*
- **AC-6.5 — Fresh-clone bootstrap.** Who: **the `pdlc/workflows` jest suite (`npm test`)** — the
  only automated verification surface that exists (§0 fact 10) — standing in for a maintainer on a
  clean clone of
  `yumo-plugins` with **no pdlc plugin installed and `${CLAUDE_PLUGIN_ROOT}` unset**. Given
  AC-3.9's landing step has untracked and gitignored `.claude/workflows/`, so a fresh clone contains
  no runtime-loadable artifact at all, When the maintainer runs

  ```
  node pdlc/workflows/build-runtime.mjs      # writes pdlc/workflows/dist/ only (AC-6.1)
  pdlc/hooks/scripts/sync-workflows.sh       # <pluginRoot>/hooks/scripts/…, AC-0.3a substitution
  ```

  Then `.claude/workflows/*.bundle.js` exist, every managed row is `in-sync`, `--check` exits `0`
  and the queue proceeds — with no published release, no installed plugin and no network. Both
  commands are documented in `CLAUDE.md` and `pdlc/README.md` as the bootstrap sequence (in scope,
  §6).

  **Surface, isolation and observables (TE v6 F-03).** v6 named "a maintainer (or a CI runner)" and
  no surface at all, while every sibling AC states one (AC-6.2/6.3: the jest suite; AC-6.2a:
  explicitly a manual release-checklist step until D-DIST-06) — so a test author could not tell
  whether to write a jest test or a checklist line, and D-DIST-06 means "a CI runner" names a
  surface this feature does not have. This AC is **automated in the jest suite**, and the three
  things that decide whether it is writable at all are specified here rather than left to the
  implementer:

  | Concern | Requirement |
  |---|---|
  | Isolation | The test builds its fixture tree, in this exact order, then runs both commands with that directory as cwd and no network: **(1)** `mkdtemp` a fresh directory `F` under `os.tmpdir()`; **(2)** copy into `F`, **preserving mode bits**, every path listed by `git ls-files -z --cached --others --exclude-standard` at `<repoRoot>` — tracked files **plus** untracked-not-ignored ones; **(3)** `git init -q F` — **and nothing else**: no `add`, no `commit` (see the next row), which is already enough to make `F` **a git work tree**. It never runs in place: `sync-workflows.sh` in place would write the developer's real `.claude/workflows/`. `F` is removed in teardown. |
  | Why `git init -q` alone, with no commit (SE v9 F-05) | Measured on a commitless `git init` directory, mapped to AC-0.5 step 1's clauses **by name** (SE v10 F-05 corrected v10's mislabelling, which offered `rev-parse --git-dir` as evidence for check (b) when it is step 1's *applicability precondition*): the precondition `git rev-parse --git-dir` **exits `0`** ⇒ step 1 applies; `git worktree list --porcelain` prints `worktree <F>` with **no `bare` line** ⇒ check **(a)**; `[ -d <F> ] && [ -x <F> ]` holds trivially for an `mkdtemp` directory owned by the test user ⇒ check **(b)**, `traverse(F)` (AC-1.1a); `git rev-parse --show-toplevel` returns `<F>` ⇒ check **(c)**. So the precondition and all three checks pass, which is everything the next row needs. v9 additionally mandated `add -A && commit`, which buys nothing and adds two failure modes to the feature's only end-to-end oracle: `git commit` needs an identity (auto-derived from gecos on the maintainer machine, but `fatal: unable to auto-detect email address` on the containerised runners D-DIST-06 introduces, where the hostname is frequently `(none)`), and a maintainer with `commit.gpgsign = true` gets a signing prompt or a failure — the "Child environment" row pins `HOME` for the *child commands*, not for fixture construction. Both would make the bootstrap red for reasons unrelated to its assertions, and committing the whole copied tree is a needless per-run cost. If a future need for a commit appears it must be `git -c user.name=… -c user.email=… -c commit.gpgsign=false commit`; today there is none |
  | Why `F` must be a git work tree | AC-0.5 resolves a repo root by step 1 (`git rev-parse --git-dir` succeeds ⇒ `git worktree list --porcelain`) or step 2 (an upward walk for a `.claude/` **anchor**). A plain file copy under `/var/folders/…` is neither: step 1 does not apply, and step 2 finds no `.claude/` — this AC's own Given says the fixture has none, and after AC-3.9's landing step **no file under `.claude/` is tracked at all**, so nothing copies one in. The copy-only fixture therefore resolves `repo-root-unresolved` ⇒ `--check` exits `3`, AC-3.1 copies nothing, the queue blocks, and all three assertions below fail. Step (3) is what makes step 1 apply. v8 offered the copy and the clone as "equivalent"; they differ on exactly this point, which is why the construction is mandated rather than illustrated (TE v8 F-01) |
  | Why `--cached --others --exclude-standard` | `git ls-files` alone lists the **index**. During the implementation batch that orders this test first (TDD), `pdlc/hooks/scripts/sync-workflows.sh`, the SessionStart hook script and the manifest emission are newly authored and not necessarily `git add`ed — so a `--cached`-only fixture is red for "no such file", a reason unrelated to the assertions, and the cheapest fix an implementer finds is to repoint the fixture. `--others --exclude-standard` adds untracked-not-ignored files, which removes the precondition entirely rather than documenting it (SE v8 F-05) |
| Script invocation and mode bits | The command block below invokes `pdlc/hooks/scripts/sync-workflows.sh` as a **bare path**, which is the form `hooks.json` uses and therefore the form that must work. **Two** assertions, because the index mode and the working-tree mode are different objects (§0 fact 15, SE v9 F-02, TE v9 F-08): **(a)** — read against the maintainer's **live checkout at `<repoRoot>`**, not against the fixture; every other clause of this row is fixture-local — for **every** `pdlc/hooks/scripts/*.sh`, *if* `git ls-files -s <p>` produces output then its mode field is `100755`. The **conditional form is mandatory** (SE v10 F-04): measured, `git ls-files -s` on an untracked path prints **nothing and exits `0`**, so an unconditional "the output reports `100755`" assertion is **red**, not vacuous, during exactly the RED phase the `--cached --others --exclude-standard` fixture source was chosen to support — the defect class of SE v8 F-05, where a test is red for a reason unrelated to its subject and the cheapest fix is to weaken it. The set is computed by globbing the directory rather than enumerated, so it covers the two scripts this feature ships **and** the three siblings the landing step corrects, which is what makes §0 fact 15's class claim true rather than one-instance-true (SE v10 F-07; AC-6.4 already prefers a computed set to an enumerated one). **(b)** `[ -x ]` holds for both copied paths **inside `F`**, which is what the bare-path invocation actually depends on — step 2 copies *working-tree* modes. Without (b), a `100755` index entry over a `chmod -x` working copy passes (a) and fails the invocation with exit **126**, which is the failure this row exists to prevent (SE v8 F-05) |
  | No install step | The fixture has no `node_modules/` (`--exclude-standard` ignores it) and none is created. This is sound only because `build-runtime.mjs` imports node builtins alone (§0 fact 16); that is a **constraint on the builder**, and a future builder dependency must add an install step here in the same commit (SE v8 F-06) |
  | Invariant it proves | **The bootstrap works against the code in this checkout** — not against `HEAD`. This is what the fixture source is chosen to guarantee, and it is stated so an implementer cannot satisfy the AC against committed content. |
  | Path comparison | Any assertion about the fixture root (including AC-0.5's resolution of it) compares paths after `realpath`. On macOS `os.tmpdir()` returns `/var/folders/…` while both `git worktree list --porcelain` and `git rev-parse --show-toplevel` return `/private/var/folders/…`; the two git commands agree with each other, so AC-0.5 check (c) is safe, but a raw string comparison against `os.tmpdir()` is not. |
  | Child environment | `CLAUDE_PLUGIN_ROOT` **unset** (this is the AC's Given, and AC-0.3a's maintainer marker `pdlc/workflows/build-runtime.mjs` is what must supply `<pluginRoot>` instead), and `HOME` pinned to a *separate* temp directory that is not an ancestor of the fixture, so AC-0.5's `$HOME` rejection is exercised as a non-event rather than accidentally triggered. |
  | Observable for "the queue proceeds" | The queue is runtime-loaded and jest cannot invoke it, so the asserted proxy is **AC-4.1's mapping applied to the drift state file the sync run wrote** into the fixture: `baselineStatus == "resolved"`, `rows` non-empty, every row `in-sync`, `retiredPresent == []`, `checkEnabled` true ⇒ AC-4.1's last row, *proceed silently*. The other two claims are asserted directly: `.claude/workflows/*.bundle.js` exist in the fixture, and `sync-workflows.sh --check` exits `0`. |

  **Why the working tree and not `git clone` of `HEAD` (SE v7 F-03, TE v7 F-03).** v7 pinned the
  fixture to `git clone --local --no-hardlinks <repoRoot> <tmp>`. `git clone` copies committed
  history, never the working tree — and the artifacts this AC exercises
  (`pdlc/hooks/scripts/sync-workflows.sh`, `pdlc/workflows/build-runtime.mjs`,
  `pdlc/workflows/dist/**`) are exactly the files an implementer is editing when they run
  `npm test`. Both failure modes surface as a *passing or failing suite for the wrong reason*, so
  neither is detectable from the AC as written:

  - **Unrunnable in the red phase.** The PLAN orders this test before `sync-workflows.sh` exists
    (TDD; §6 lists both as in-scope items). Until the script and the manifest emission are
    *committed*, the clone contains neither and the test fails with "no such file" for a reason
    unrelated to its assertions — red for the whole implementation batch, with the cheapest fix
    being to repoint the fixture or `skip` it.
  - **False-green afterwards.** Once committed, every later edit to the sync script, the builder or
    the manifest emitter is invisible until it too is committed, so a green `npm test` means "the
    bootstrap worked at `HEAD`", not "the bootstrap works with the code I just wrote". At DoD, where
    this is the only oracle proving a no-plugin consumer can bootstrap at all, that is a coverage
    claim about the wrong tree.

  Building from the working tree keeps every other property the row states (temp directory, no
  network, teardown) and makes the RED phase a genuine RED — and `git init -q` on the copy restores the
  one property the clone had and the copy did not (a resolvable repo root), rather than reverting to
  the clone. Nothing beyond `git init -q` is needed for that, and nothing beyond it is mandated
  (SE v9 F-05).

  **The `.claude/workflows/` directory does not exist in the fixture, and must classify as
  `missing`.** AC-3.9's landing step gitignores it, so it is not among the files copied in — which is
  the AC's Given ("a fresh clone contains no runtime-loadable artifact at all"). AC-1.1's
  `parent-absent` case (TE v7 F-02) is what makes every row `missing` rather than `unknown` there:
  the fixture root resolves via AC-0.5 step 1, the first existing ancestor of
  `.claude/workflows/orchestrate-dev.bundle.js` is that root, and it is traversable — so absence is
  established. Without it AC-3.1 would refuse to copy and none of the three assertions above could
  hold. The directory itself is created by the sync run (AC-2.9(1), AC-3.8).

  **This chain is only true because AC-2.9(1) classifies before it creates (TE v9 F-03), and the test
  must pin that — with a *call-order* oracle, not a state assertion (TE v10 F-01).** If the `mkdir -p`
  ran first, `.claude/workflows/` would exist at classification
  time, the realised axis value would be `absent` rather than `parent-absent`, and the assertions
  above would still pass — for a different reason than the one this paragraph gives. A pipeline that
  is green for the wrong reason is precisely what AC-1.1's ancestor rule was rewritten to expose.

  v10 stated the required assertion as "the first `--check` records the rows as `missing` and, **when
  the implementation exposes the situation**, as `parent-absent`-derived". That is not falsifiable:
  AC-2.6's schema is `rows: [{ id, state, reason, pluginHash, consumerHash, pluginArtifactVersion,
  consumerArtifactVersion }]` and carries no situation or axis-value field, no AC requires one, and
  the two orders are observationally identical everywhere else on this fixture — pre-creation
  `parent-absent` and post-creation `absent` both map to `missing`, the same `reason: null`, the same
  exit code, the same queue outcome; and on the `chmod 000 .claude` fixture both orders end at exit
  `4` with no file. Leaving the choice to the implementer means it is not exposed and the ordering
  ships unasserted. This REQ therefore picks the cheaper of TE v10 F-01's two repairs and **mandates
  a call-order oracle**, with no schema change — and, correcting v11, it mandates it **at the bash
  layer, where the classifier and the `mkdir -p` actually live** (SE v11 F-01, TE v11 F-02):

  > The test runs one drift computation on the fresh-consumer fixture with **`PDLC_TRACE_FILE`**
  > (AC-2.9(4)) set to a path inside the test's temp directory, then reads the trace and asserts that
  > **no `create` line appears before the last `probe` line of the last row** — equivalently, that the
  > index of the first `create` exceeds the index of every `probe`. The assertion fails on a
  > create-first implementation and passes on a classify-first one, which is precisely the
  > distinction no filesystem-state assertion can make. A `PATH`-front-loaded `mkdir` shim that
  > appends to the same trace is a permitted implementation of the `create` half; the `probe` half is
  > always script-emitted.

  v11 stated this oracle over `_checkFile` / `_readFile` / `_writeFile` "and the directory-creation
  seam — the seams the runtime adapter already injects". That was wrong on three counts, each
  measured at HEAD and recorded in AC-2.9(1): there is **no directory-creation seam in the JS layer
  at all**, the four named seams are not injected at any single call site, and the classifier is bash
  — which no jest double observes. The trace replaces it; nothing in this AC implies a future JS
  writer.

  AC-6.5 keeps its state assertion as well — the first `--check` on the untouched fixture records
  every row `missing` with `reason: null` — but that one is *not* the ordering oracle and is not
  claimed to be. AC-1.8(i)'s "generator observes the filesystem as it finds it" paragraph cites the
  same trace, so the ordering has exactly one named oracle in the document.

  This AC exists because v5 composed three changes into a bootstrap hole: it untracked
  `.claude/workflows/`, forbade the builder from writing there, and pinned the only remaining writer
  to `${CLAUDE_PLUGIN_ROOT}` — which AC-0.4 says is not consulted in this repo. The repo that
  develops the pipeline could then neither run it nor print a runnable remediation command
  (SE v5 F-01, and v1 F-05's bootstrap paradox one layer down). The fix is the `<pluginRoot>`
  substitution already in AC-0.3a, applied to the script's own path. *(P0)*

## 4. Declared thresholds, flags and locations

Every configured value this REQ's ACs depend on, with default and owner. No AC may cite a value
absent from this table.

| Name | Location | Default | Owner | Notes |
|---|---|---|---|---|
| `distribution.checkEnabled` | `.claude/pdlc.config.json` (consumer repo; new file, absent ⇒ defaults) | `true` | consuming-repo operator | AC-4.3. Resolved by the shell writer, delivered to the queue via the drift state file. Gates the queue only, not the hook or `--check`. |
| distribution manifest | **`<pluginRoot>/workflows/dist/distribution-manifest.json`** — one path, three bindings of `<pluginRoot>`: consumer `${CLAUDE_PLUGIN_ROOT}`, maintainer `<repoRoot>/pdlc`, build output `pdlc/workflows/dist/…` | 2 managed rows + 2 `retired` paths (AC-0.2, AC-0.7); **absent on every pre-feature install** ⇒ AC-0.3b | pdlc maintainer, emitted by `build-runtime.mjs` | AC-0.1. Sole authority for the managed set. The `dist/` segment is part of the path everywhere. |
| sync manifest | `.claude/workflows/.pdlc-sync-manifest.json` (consumer) | absent ⇒ all rows `unverified` | written by `sync-workflows.sh` only — **never** by `build-runtime.mjs` (AC-6.1) | AC-1.6, AC-1.7. |
| drift state file | `.claude/workflows/.pdlc-drift-state.json` (consumer) | absent ⇒ queue `blocked` | **one shared writer routine**, invoked by the hook, by `--check`, and by sync (AC-2.7); whole-file atomic replace, last complete write wins | AC-2.6, AC-2.7, AC-4.1. When the write is attempted and fails, any pre-existing copy is **invalidated** — overwritten in place with a schema-valid invalidation record (`baselineStatus` `unresolved`/`drift-state-invalidated`, carrying the resolved `checkEnabled` **and this run's collected `writeFailures` where a JSON tool was available**), else unlinked — so the queue never reads a stale snapshot **and the `checkEnabled` escape stays reachable** (AC-2.9(2a), SE v9 F-01, SE v10 F-01, SE v11 F-05). The unlink rung is reachable only for **non-permission** replace failures (`ENOSPC`, an immutable file, a directory at the path), because a temp-sibling + `mv` replace needs the same directory bit the unlink does — measured at v12 (TE v11 F-01). |
| backup dir | `.claude/workflows/.pdlc-backups/` (consumer) | created on demand | sync script | AC-3.4, AC-3.9. |
| backup retention | same | newest **5** per `id`, selected by `LC_ALL=C` lexicographic descending filename sort | pdlc maintainer | AC-3.4. Never mtime-based. |
| backup stamp format | backup filename | `YYYYMMDDTHHMMSSZ`, collisions suffixed `-2`, `-3`, … | pdlc maintainer | AC-3.4. Fixed width so lexicographic order == chronological order. |
| `id` charset | manifest row | `^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$` | pdlc maintainer | AC-0.1. Filename-safety for AC-3.4; violation ⇒ manifest malformed. |
| content-hash utility | `shasum` \| `sha1sum`, resolved by probing | first that runs | pdlc maintainer | Both absent ⇒ every row `unknown`, reason `hash-tool-absent` (AC-1.2) — a **row-level** reason, since rows exist whenever the baseline resolved. It is **never** a `baselineReason`: the manifest is read by the JSON tool (`readBytes_json`, AC-1.1a), so hash-tool absence cannot make the baseline `unresolved` (TE v9 F-01). |
| row `reason` set | drift state file, `rows[].reason` | `null` for any state other than `unknown` | pdlc maintainer | AC-1.2. Closed set of **four**: `plugin-artifact-missing` (⇒ plugin update), `plugin-artifact-unreadable` (⇒ permissions fix on the plugin cache path), `consumer-artifact-unreadable` (⇒ permissions fix on `consumerPath`), `hash-tool-absent`. Disjoint from AC-1.0's manifest-level set by construction; each member is separately distinguishable in every human-facing surface (AC-2.5, AC-4.2). |
| JSON read/write utility | Python interpreter, whose **discovery loop** is the identical one already shipped in all three `pdlc/hooks/scripts/*.sh`, reused verbatim; the **read** is new (AC-1.1a's mandated heredoc `readBytes_json` form, exit `0`\|`10`\|`11`\|`12` — outside CPython's own reserved `1`/`2` and outside `sync-workflows.sh`'s `0`–`4`, TE v11 F-07) and must **not** reuse the shipped `json.load(sys.stdin)`-under-bare-`except` read, which collapses absent/unreadable/malformed (SE v10 F-02) | first candidate that executes `import sys` successfully | pdlc maintainer | Reads/writes all four JSON files and is what distinguishes *malformed* from *absent* from *unreadable* (AC-2.4, AC-1.1a). None found ⇒ `baselineStatus` `unresolved`, reason `json-tool-absent` (a **manifest-level** reason — with no JSON reader there are no rows), hook warns (AC-2.5a) and still exits 0 (NFR-6). **One write does not depend on it**: AC-2.9(2a) step 1's invalidation record falls back to a `printf` of a fixed literal, so the ladder survives `json-tool-absent` (TE v11 F-04). |
| `PDLC_TRACE_FILE` (test-only seam) | process environment of the two bash writers | **unset** ⇒ inert, no trace, no trace code path | pdlc maintainer | **AC-2.9(4)**. Set ⇒ one appended line per classification probe (`probe <kind> <path>`) and per directory creation (`create <path>`), in call order. The **only** oracle for AC-2.9(1)'s classify-before-create ordering (AC-6.5) and for AC-0.5 step 2's no-`mkdir` guard. Never read from a config file; a mandated test asserts every other observable is byte-identical with it set and unset. |
| `PDLC_FAULT` (test-only seam) | process environment of the two bash writers | **unset** ⇒ no fault injected | pdlc maintainer | **AC-2.9(4)**. Closed two-member token set: `drift-state-replace` (forces AC-2.7's atomic replace to fail ⇒ AC-2.9(2a)'s ladder, the only way to reach step 2's non-permission world — TE v11 F-01) and `repo-root-traverse` (forces AC-0.5's root `traverse(p)` false). Unrecognised token ⇒ `pdlc: unknown PDLC_FAULT token <t>` and exit `4`. Never reachable from `.claude/pdlc.config.json`. |
| sync script invocation path | **`<pluginRoot>/hooks/scripts/sync-workflows.sh`** — consumer `${CLAUDE_PLUGIN_ROOT}/hooks/scripts/sync-workflows.sh`, maintainer `pdlc/hooks/scripts/sync-workflows.sh` | — | pdlc maintainer | REQ-DIST-03 preamble, AC-0.4, AC-6.5. This is the expansion every "exact remediation command" prints; it is runnable with no plugin installed. |
| `baselineStatus` / `baselineReason` | top-level fields of the drift state file | `resolved` / `null` only when the manifest resolved and declares ≥1 row | the shared drift-state writer (AC-2.7) | AC-1.0. Reason set of **eight**: `plugin-root-unset`, `plugin-root-unreadable`, `repo-root-unresolved`, `manifest-absent`, `manifest-malformed`, `json-tool-absent`, `manifest-empty`, and `drift-state-invalidated` — the last written **only** by AC-2.9(2a) step 1 and never by a classification, so AC-1.8(iv)'s generator codomain is the other seven (SE v10 F-01). Evaluated before any row quantifier at all three seams. |
| drift-check latency budget | NFR-2 fixture | p95 ≤ 500 ms | pdlc maintainer | Observation, not a gate — see NFR-2. |
| `<pluginRoot>` resolution | `${CLAUDE_PLUGIN_ROOT}` in a consuming repo; **`<repoRoot>/pdlc`** when `pdlc/workflows/build-runtime.mjs` is present (AC-0.3a) | set by the harness | Claude Code / pdlc maintainer | AC-0.3, AC-0.3a, AC-0.4. Unset with no maintainer marker ⇒ `unknown`, reason `plugin-root-unset`. Every `pluginPath` joins onto `<pluginRoot>` unchanged. |
| repo-root resolution | first `worktree` record of `git worktree list --porcelain` (the **main** worktree's *work tree*, so a linked worktree is not a distinct consumer), validated non-bare / readable / `rev-parse --show-toplevel`-confirming; only when `git` does not apply at all, a bounded upward `.claude/` walk | — | pdlc maintainer | AC-0.5. Inside a git repo, a failed derivation goes straight to `repo-root-unresolved` and never to the walk. `$HOME` and `/` are always rejected, reason `repo-root-unresolved` (manifest-level, AC-1.0). |
| `git` (third external tool) | `PATH` | **minimum version 2.7.0** (`git worktree list --porcelain`, released 2016); measured on the maintainer machine at `2.50.1` | pdlc maintainer | AC-0.5 step 1, AC-3.9 rule 2, AC-6.5's fixture build. **Absent from `PATH`** ⇒ AC-0.5 step 1 does not apply, the bounded walk runs, and AC-3.9's tracked-path detection treats every path as untracked. **Present but older than 2.7.0, or the repository is bare** ⇒ step 1 applies and fails ⇒ `baselineStatus` `unresolved`, reason `repo-root-unresolved` — never a silent demotion to the walk, because a wrong root is worse than a refusal. All three cases are required fixtures (TE v6 F-04). **Residual risk, stated rather than glossed (TE v7 F-05):** on a machine with no `git` binary that *is* nonetheless a git repository, step 1 cannot apply, step 2 walks, and the stray-`.claude/` wrong-root hazard is live — AC-0.5's "inside a git repository the only two outcomes are the verified work-tree root or `repo-root-unresolved`" is a guarantee **conditional on `git` being installed**. The REQ accepts that (refusing to work at all without `git` would strand every non-git consumer), so the required `git`-absent fixture asserts **the walk result**, never `repo-root-unresolved`. |
| retired-path key | each manifest row's `retires` array; top-level `retired` is their union | `orchestrate-dev` → `[".claude/workflows/orchestrate-dev.js"]`, `orchestrate-queue` → `[".claude/workflows/orchestrate-queue.js"]` | pdlc maintainer | AC-0.1, AC-0.7, AC-3.9. The per-row key is what makes the delete guard computable. |
| managed row `id` values (v1) | manifest rows | `orchestrate-dev`, `orchestrate-queue` | pdlc maintainer | AC-0.1. Backup filenames are parsed by the stamp-anchored regex in AC-3.4, so `orchestrate-dev` and the retired basename `orchestrate-dev.js` never collide. |
| plugin version (`pluginVersion`) | `<pluginRoot>/.claude-plugin/plugin.json`, key `version` — i.e. `${CLAUDE_PLUGIN_ROOT}/.claude-plugin/plugin.json` for a consumer, `<repoRoot>/pdlc/.claude-plugin/plugin.json` under AC-0.3a | `0.10.0` at `3dab335` | pdlc maintainer | AC-2.6, AC-5.4. File or key absent/unreadable ⇒ renders as `unknown` in the report and as `null` in the drift state file; it is context only, so no state, exit code or queue outcome depends on it. |
| retired paths | each row's `retires` array; the manifest's top-level `retired` is their union | 2 paths (AC-0.7) | pdlc maintainer | AC-0.7, AC-2.8, AC-3.9. Present-in-consumer set is reported as `retiredPresent` in the drift state file (AC-2.6) and blocks the queue (AC-4.1). |
| `.claude/workflows/` creation | consumer repo, beneath the AC-0.5-resolved root | **created on demand by every writer** — hook, `--check`, sync — with `mkdir -p`, **after classification, never before it** (TE v9 F-03), at the process umask; at most `.claude/` and `.claude/workflows/`, never under `$HOME` or `/`, never when the reason is `repo-root-unresolved` | pdlc maintainer | **AC-2.9(1)**. v8 specified creation for sync only while mandating the drift-state write everywhere, which left the write with no target on the rollout-universal population (SE v8 F-01). |
| `writeFailures` | top-level array of the drift state file | `[]` | the shared drift-state writer (AC-2.7) | **AC-2.9(2)**. Entries `{ path, operation }` — v9's `stage` is **deleted** (undefined, unprinted, unasserted; SE v9 F-04, TE v9 F-04). Non-empty ⇒ exit `4` (AC-3.3) and queue `blocked` (AC-4.1). Populated only by writes that were *attempted and failed*; `repo-root-unresolved` produces no file at all and is exit `3` (TE v9 F-02). Deliberately **not** a fifth member of the row-`reason` set — the failure is of the write, not a classification of the row. |
| `writeFailures[].operation` | each entry of that array, and the stderr line of AC-2.9(2) | — (closed set, no default) | pdlc maintainer | **AC-2.9(2)**. Closed **nine**-member set: `mkdir`, `drift-state-replace`, `drift-state-invalidate`, `drift-state-unlink` (all four stderr only — there is no file of ours to record them in; the last two are AC-2.9(2a)'s ladder steps, TE v10 F-02), `artifact-copy`, `backup`, `backup-verify`, `retire-delete`, `sync-manifest-update` (all five appear in `writeFailures`). Printed at three surfaces (AC-2.9(2) stderr, AC-4.1's block message, AC-4.2's `Run` block), so the enumeration is what makes those golden outputs assertable. |
| `sync-workflows.sh` exit codes | process exit | `0` in-sync / `1` sync-fixable / `2` `local-edit`\|`unverified` / `3` unverified-or-unresolved (**including `repo-root-unresolved` — no write target**) / **`4` a write was attempted and failed** | pdlc maintainer | AC-3.3. Highest applicable code wins; `4` is above `3` because "could not repair" dominates "could not verify" (AC-2.9). The `3`/`4` boundary is *attempted* vs *no target* (TE v9 F-02). |
| shipped script mode | **both** the git index and the working tree, `pdlc/hooks/scripts/*.sh` | index `100755` **and** `[ -x ]` on disk | pdlc maintainer | §0 fact 15, SE v9 F-02, TE v9 F-08. The two are independent objects: `git update-index --chmod=+x` sets the index bit and leaves the file `-rw-r--r--`, where bare-path invocation exits **126**. The landing step therefore runs `chmod +x` (which also records `100755` under the default `core.fileMode true`), and AC-6.5 asserts both. `hooks.json` and every printed remediation command invoke a bare path, which needs the execute bit; all shipped scripts are `100644` today. Pinned by a **conditional** `git ls-files -s` assertion over every globbed `pdlc/hooks/scripts/*.sh` — conditional because an untracked path prints nothing and exits `0` (SE v10 F-04), globbed so the class fix covers all five scripts rather than the two this feature ships (SE v10 F-07) — **and** an `[ -x ]` assertion on the fixture copy (AC-6.5), with the three siblings corrected in the landing step (§6). |
| filesystem probes | AC-1.1a | `exists` = `[ -e p ]`; `traverse(D)` = `[ -d D ] && [ -x D ]`; `enumerate(D)` = `[ -r D ] && [ -x D ]`; `readBytes_hash(p)` = the **content-hash utility** exits `0`; `readBytes_json(p)` = the **JSON tool**'s mandated heredoc read of `p`, exit `0` parsed / `10` unreadable (incl. a directory at the path) / `11` absent / `12` malformed (AC-1.1a's form; the shipped hook read is **not** it, SE v10 F-02; renumbered out of CPython's reserved range at v12, TE v11 F-07) | pdlc maintainer | **AC-1.1a**. Every call site states all four outcomes, AC-4.3 and AC-1.6 included (TE v11 F-05). Every "readable"/"unreadable" clause in AC-1.1, AC-1.2, AC-1.8(i), AC-0.4 and AC-0.5 resolves to one of these. Absence is established by **traverse**, never by read. `readBytes` is parameterised by its reader: managed-artifact comparison uses the hash utility, the manifest uses the JSON tool, so hash-tool absence is never `plugin-root-unreadable` (TE v9 F-01, SE v9 F-03). `enumerate` is stated identically here and at AC-1.1a (SE v9 F-06). Under `id -u == 0` the rule covers **every fixture built from a permission bit, read-side or write-side** (TE v10 F-04): example-based fixtures **skip with a printed reason** — including AC-2.9(2)/(2a)'s write-failure fixtures — and AC-1.8(i)/(iv)'s property tests **filter** the affected axis values and name the five invariants left unverified (TE v9 F-05, SE v10 F-03). |
| `baselineReason` precedence | `baselineStatus.reason`, when `unresolved` | `drift-state-invalidated` > `json-tool-absent` > `plugin-root-unset` > `plugin-root-unreadable` > `repo-root-unresolved` > `manifest-absent` > `manifest-malformed` > `manifest-empty` | pdlc maintainer | **AC-1.0**, AC-1.8(iv). Declared, not "first failure encountered", in remediation order — environment-global before per-artifact, and each member a strictly later step of the same pipeline than the one above. `hash-tool-absent` is a **row** reason and is never a member of this set (AC-0.4, AC-1.2). |
| row `reason` precedence | `rows[].reason`, when the state is `unknown` | `hash-tool-absent` > `plugin-artifact-missing` > `plugin-artifact-unreadable` > `consumer-artifact-unreadable` | pdlc maintainer | AC-1.2, AC-1.8(iv). Declared, not "first failure encountered"; AC-1.8(i)'s cross product generates the overlap on every run. |

No semver comparator and no `sort -V` appear in this table because no AC needs version *ordering* —
AC-5.2 compares versions for equality only.

All consumer-side state files and directories live under `.claude/workflows/` with a `.pdlc-`
basename prefix. They have no manifest row, so sync can never copy, compare or destroy them, and
AC-0.6's exclusion rule keeps them out of the `not-managed` report — including keeping the drift
state file from listing itself.

## 5. Non-functional requirements

- **NFR-1 — No LLM in the classification path.** Classification is content hashing plus JSON
  reads, executed by the bash scripts (NFR-5). Scoped per surface:
  - *Hook and `sync-workflows.sh`*: fully deterministic, no agent involvement whatsoever.
  - *Queue (AC-4.1)*: the workflow runtime has no `fs`/`process`; all IO reaches it through
    `runtime-adapter.js` as `agent()` calls. The queue therefore performs **one** injected read of
    an already-computed, deterministic JSON file and makes no classification decision. No hashing,
    enumeration or judgement happens in an LLM turn. This is the concrete mechanism that keeps
    NFR-1 true at a surface that cannot touch the filesystem directly.
- **NFR-2 — Latency, observed not gated.** Against a fixture of up to 8 managed artifacts totalling
  up to 512 KB — a **deliberate headroom margin**, roughly 4× the real managed set, which AC-0.2
  fixes at exactly 2 rows (~212 KB measured); the larger bound is an upper limit for future growth,
  not a second managed set — warm page cache, on the maintainer's reference machine, the check
  should complete at p95 ≤ 500 ms. This is a **non-gated observation**: no test asserts wall-clock time, because an
  unqualified timing assertion on shared or unspecified hardware is a coin flip. Exceeding it is a maintainer-owned
  performance bug, not a build failure. Anyone tempted to write a timing test should read this
  clause instead.
- **NFR-3 — Never touch unmanaged files.** The check and sync never read for comparison, modify,
  or delete any file without a distribution-manifest row (AC-1.5, AC-0.1).
- **NFR-4 — Detection automatic, modification explicit.** The sync operation never runs implicitly:
  not from the hook, not from the queue, not from a SKILL. Detection is automatic everywhere;
  modification is always an explicit operator command.
- **NFR-5 — Bash, matching the shipped hooks.** The SessionStart hook and `sync-workflows.sh` are
  `#!/usr/bin/env bash` with `set -uo pipefail`, matching all three existing scripts in
  `pdlc/hooks/scripts/` (§0 fact 11) — v2/v3 said "POSIX `sh`", which described neither the
  siblings nor what this feature can be written in. Beyond bash builtins and coreutils they depend
  on exactly **three** external tools, all declared in §4 with location, default/minimum version,
  owner and absence behaviour: a content-hash utility (`shasum`/`sha1sum`), a JSON read/write
  utility, and **`git`** (minimum 2.7.0). v6 said "exactly two" while AC-0.5 step 1 made `git` the
  *primary* repo-root resolver and AC-3.9 rule 2 used `git ls-files --error-unmatch`, so the
  degraded-environment fixtures for the third tool were undefined (TE v6 F-04). `git` is the one of
  the three whose absence is **not** a degradation of correctness: AC-0.5 step 1 simply does not
  apply, and AC-3.9's tracked-path detection is already specified as best-effort.
  The JSON tool is **the Python interpreter discovered by the identical probe loop the three
  sibling hooks already ship** (try `python3`, `python`, `py`; accept the first that actually
  executes) — the mechanism is reused, not reinvented, because JSON handling is now cross-cutting
  across four files in this feature and hand-rolled shell JSON parsing cannot distinguish malformed
  from absent (AC-2.4 requires that distinction). Absence of the hash utility degrades every row to
  `unknown`/`hash-tool-absent` (AC-1.2); absence of the JSON utility degrades the whole run to
  `baselineStatus: unresolved` / `json-tool-absent` (AC-1.0), since with no JSON reader there is no
  manifest and therefore no rows. Never a crash, and never `in-sync`. The two degradations are
  **independent**, which is what AC-1.1a's split of `readBytes_hash` from `readBytes_json` guarantees
  at the probe level: a missing hash utility can never make the baseline `unresolved`, and a missing
  JSON interpreter can never be reported as a row reason (TE v9 F-01, SE v9 F-03).
  Because the scripts are bash, the jest suite's only observations of them are exit code,
  stdout/stderr and the resulting tree — which is why **AC-2.9(4)'s two environment seams
  (`PDLC_TRACE_FILE`, `PDLC_FAULT`) are part of the scripts' contract**, not test scaffolding bolted
  on beside them: they are the only mechanism by which call order and a forced write failure become
  observable at this layer (SE v11 F-01, TE v11 F-01, TE v11 F-02). One JSON write is exempt from the
  interpreter dependency by design — AC-2.9(2a) step 1's `printf` fallback — because that record must
  be emittable on a `json-tool-absent` run; it interpolates four closed-domain scalars into a fixed
  literal and so is not the hand-rolled JSON handling this NFR bans (TE v11 F-04).
- **NFR-6 — Fail-open at the session seam, fail-closed at the queue seam.** The hook must never
  prevent a session from starting (AC-2.4); the queue must never run a feature on an unverified
  pipeline (AC-4.1) — **with exactly two stated exceptions, both of which are announced rather than
  silent**: (i) the operator's explicit `distribution.checkEnabled: false` opt-out (AC-0.3b, AC-4.3),
  and (ii) the **AC-2.9(2a) step-3 residual**, where neither the drift state file nor its directory is
  writable, so a stale file survives and the queue may proceed on its contents; that case prints the
  residual line at every drift computation. Both are carved out here, in the sentence an NFR-level
  property would be written from, so the absolute claim and its accepted exceptions are not in
  different sections with no cross-reference from the stronger one (TE v10 F-05).

  These opposite defaults are deliberate, and they are what makes AC-2.9(2a)
  mandatory rather than optional: a hook that fails to write the drift state file exits `0` (fail
  open) and must therefore leave the queue seam with **nothing believable** to read (fail closed),
  since stderr from a SessionStart hook is not a queue input (SE v9 F-01). Fail-closed does not mean
  *unescapable*: AC-2.9(2a) step 1's invalidation record preserves the resolved `checkEnabled` so that
  exception (i) stays reachable on a consumer whose drift-state write fails on every run — a
  permanent block with no opt-out would be a different property from the one this NFR states
  (SE v10 F-01).

## 6. Scope

**In scope:**

- **`build-runtime.mjs` changes** (AC-5.1, AC-6.1): retarget the single `OUT_DIR` constant
  (`:29`) to `pdlc/workflows/dist/` and emit `dist/distribution-manifest.json` with
  `artifactVersion` and `pluginSha1` per row. The builder gains **no** new write target: it does
  not write `.claude/workflows/`, the sync manifest or the drift state file. `meta` literals and
  the runtime's pure-literal constraint are **not** touched.
- **`__tests__/runtimeBundle.test.js` changes** (AC-6.2, AC-6.3): repoint freshness at `dist/`, add
  the packaging oracle, add the AC-6.4 covered-set/exempt-set grep with both a RED and a GREEN
  case — the RED/GREEN fixtures built in a **non-git `os.tmpdir()` tree** created and removed by the
  test, plus the single real-repo-root assertion (AC-6.4).
- **A jest test for the fresh-clone bootstrap** (AC-6.5): a fixture tree under `os.tmpdir()` built
  from `git ls-files -z --cached --others --exclude-standard` with **mode bits preserved** and then
  `git init -q`-ed (no `add`, no `commit`) so AC-0.5 step 1 resolves it, `CLAUDE_PLUGIN_ROOT`
  unset and `HOME` pinned outside it, `build` then
  `sync`, then assert the bundles exist, `--check` exits `0`, and AC-4.1's mapping over the written
  drift state file yields *proceed silently*. Plus **both** mode assertions: the *conditional*
  `git ls-files -s` = `100755` over **every** globbed `pdlc/hooks/scripts/*.sh` at the repo root
  (all five, so the class fix of §0 fact 15 cannot regress; conditional because an untracked path
  prints nothing and exits `0` — SE v10 F-04, F-07), and `[ -x ]` on the two copies inside the
  fixture. Plus the **`PDLC_TRACE_FILE` call-order assertion** that pins AC-2.9(1)'s
  classify-before-create (TE v10 F-01, repaired to the bash layer at v12 — SE v11 F-01, TE v11 F-02)
  and the `PDLC_FAULT=repo-root-traverse` test for AC-0.5 step 2's guard (TE v10 F-07).
- **The two test-only seams the bash writers own** (AC-2.9(4)): `PDLC_TRACE_FILE` (probe/create
  trace, inert when unset) and `PDLC_FAULT` (closed two-token fault injection), plus the mandated
  inertness test that asserts every other observable is identical with the trace on and off. They
  exist because the classifier, the `mkdir -p` and the invalidation ladder are bash and jest can
  otherwise observe only exit code, stderr and the resulting tree — an observation set that cannot
  separate classify-first from create-first, and cannot reach the ladder's non-permission rung at all.
- **Execute bits on the shipped hook scripts, in the working tree *and* the index** (§0 fact 15,
  SE v9 F-02): `chmod +x` — plus `git update-index --chmod=+x` for a checkout with
  `core.fileMode false` — on
  `pdlc/hooks/scripts/sync-workflows.sh` and the new SessionStart drift script, **and on the three
  existing siblings** (`nudge-consolidation.sh`, `check-scope-field.sh`,
  `guard-harvest-before-delete.sh`), all of which are `100644` today while `hooks.json` invokes them
  as bare paths. The index-only form is **not** sufficient: it leaves the file `-rw-r--r--` on disk,
  where a bare-path invocation exits `126`, which is the failure both `hooks.json` and AC-6.5's
  fixture would hit. Correcting the siblings has no behavioural risk and
  removes the class of defect rather than one instance of it.
- A distribution-manifest-driven managed set; six-state drift detection with hash-based provenance;
  report-only `not-managed` enumeration.
- The SessionStart warning hook, the shared drift-state writer routine, and the drift state file
  (including `retiredPresent`).
- `sync-workflows.sh` with `--check` / `--force`, backups, restore, and legacy retirement (AC-3.9).
- Queue integration as defense-in-depth; version stamping as reporting-only; classifier invariant
  tests.
- **Correcting whatever `coveredViolations(repoRoot)` returns** (AC-6.4) — five files at `5630d58`
  (§0 fact 14), plus the `dist/` path update to the three already-correct normative files
  (`CLAUDE.md`, the two orchestrator `SKILL.md`s), which are outside the oracle. Archived
  per-feature spec history under `docs/{other-feature}/` is explicitly **not** edited.
- **The fresh-clone bootstrap sequence** (AC-6.5): `pdlc/hooks/scripts/sync-workflows.sh` runnable
  with no plugin installed, documented in `CLAUDE.md` and `pdlc/README.md`.
- **A one-time version-control landing step** (AC-3.9): `git rm` the four tracked
  `.claude/workflows/*` paths and gitignore that directory's generated contents, so the tracked
  generated tree is `pdlc/workflows/dist/` alone and AC-3.7's idempotence is not coupled to the git
  index.

**Out of scope:** a full `pdlc install` package manager; distributing `SKILL.md` files (they
already load live); distributing `build-runtime.mjs` / `runtime-adapter.js` or rebuilding bundles
consumer-side; auto-syncing without operator action; syncing repo-local workflows; adding a
`version` field to any module's or bundle's `meta` literal (explicitly rejected — §REQ-DIST-05
preamble); standing up hosted CI (D-DIST-06); detecting that the *installed plugin cache itself* is
behind the marketplace (that is Claude Code's plugin updater — D-DIST-05).

## 7. Prerequisites

| # | Dependency | Resolution form | Gating logic |
|---|---|---|---|
| BL-01 | `${CLAUDE_PLUGIN_ROOT}` resolves to a readable plugin root from a consumer repo, for `SessionStart` specifically | Executable proof: a spike hook that echoes the resolved path, run in a consumer session | Must be demonstrated at HEAD before FSPEC authoring. All three shipped hooks in `pdlc/hooks/hooks.json` already assume it for `PreToolUse`/`PostToolUse`/`SessionStart`, which is strong evidence but not proof for the value being non-empty. |
| BL-02 | The plugin package contains the artifact to copy | **AC-6.1 + AC-6.2 merged and `npm test` green** — i.e. the in-repo packaging oracle passes. Deliberately *not* gated on AC-6.2a (an installed marketplace release), which cannot exist before the packaging decision it guards has shipped | Must exist before any AC in REQ-DIST-03 can be implemented. This is the premise §0 fact 3 shows is currently false; AC-6.2 is what makes it checkable on every commit rather than only post-publication. |
| BL-03 | `pdlc/hooks/hooks.json` accepts a second `SessionStart` entry alongside `nudge-consolidation.sh` | Both hooks observed firing in one session | Must be demonstrated before FSPEC authoring. |
| BL-04 | The workflow runtime's injected read (`_readFile` via `runtime-adapter.js`) can read `.claude/workflows/.pdlc-drift-state.json` and returns absence distinguishably from empty | **Discharged by citation, not a spike:** `pdlc/workflows/orchestrate-queue.js:483` documents `_readFile` as `async (path) → string\|null`, and `runtime-adapter.js`'s `rtReadFile` honours it | Re-verify the two citations at FSPEC authoring; no spike required. |
| BL-05 | Which artifact the workflow runtime resolves when `.claude/workflows/` holds both `orchestrate-dev.js` and `orchestrate-dev.bundle.js`, each declaring `meta.name: "orchestrate-dev"` (§0 fact 8) | Executable proof: place two distinguishable artifacts under both names, invoke the workflow, observe which ran | Must be answered before FSPEC authoring. If the legacy `.js` wins or the resolution is non-deterministic, AC-3.9's retirement is a **correctness fix and P0 blocking**; if the `.bundle.js` wins, AC-3.9 is cleanup and may be sequenced after AC-3.1. Either way the retirement ships in this feature; only its ordering depends on the answer. AC-2.8's warning and AC-4.1's `retiredPresent` block are **not** contingent on the answer — they are specified for the unfavourable case, which is the safe default while the question is open. |
| BL-06 | Whether the workflow runtime, executing inside a **linked git worktree**, loads `.claude/workflows/*` from that worktree or from the main worktree (AC-0.5 assumes the latter is sufficient; `pdlc/workflows/orchestrate-dev.js:1869` creates one worktree per Phase-I task) | Executable proof: run a workflow from a linked worktree with the artifact present only in the main worktree, observe whether it loads | Must be answered before FSPEC authoring. If it loads per-worktree, AC-0.5's main-worktree resolution is insufficient and D-DIST-07 is pulled forward into this feature; if it loads from the main worktree (or the pipeline only ever runs workflows from the main tree), AC-0.5 as written is correct. |

## 8. Deferrals

| ID | Deferred | Rationale | Binds to |
|---|---|---|---|
| D-DIST-01 | Full `pdlc install` mechanism | Drift detection plus an explicit sync closes the loop; a package manager is a larger, separate design | **`docs/_queue/QUEUE.md` row 6** (`pdlc-install-mechanism`, `blocked`) — the queue row is the authority; its REQ is not authored yet |
| D-DIST-02 | Loading workflows directly from the plugin path (no copy at all) | Would remove the problem entirely, but depends on runtime behavior not under this repo's control | **`docs/_queue/QUEUE.md` row 6** (`pdlc-install-mechanism`, `blocked`) — the queue row is the authority; its REQ is not authored yet |
| D-DIST-03 | Auto-sync on detection | Violates NFR-4; revisit only if drift proves chronic in practice | **`docs/_queue/QUEUE.md` row 6** (`pdlc-install-mechanism`, `blocked`) — the queue row is the authority; its REQ is not authored yet |
| D-DIST-04 | Multi-consumer fan-out (sync all known consuming repos at once) | One consumer today | `pdlc-engineering-loop` (queue row 5) |
| D-DIST-05 | Detecting that the installed plugin cache (node B) is behind the marketplace | Owned by Claude Code's plugin updater, not by pdlc; this REQ closes A′→B and B→C only | **`docs/_queue/QUEUE.md` row 6** (`pdlc-install-mechanism`, `blocked`) — the queue row is the authority; its REQ is not authored yet |
| D-DIST-07 | Per-worktree sync (treating each linked git worktree as its own consumer) | AC-0.5 resolves the **main** worktree, so all worktrees of a clone share one `.claude/workflows/`. Only if the workflow runtime is shown to load artifacts relative to a linked worktree does this become a real gap; BL-06 is the check | **`docs/_queue/QUEUE.md` row 6** (`pdlc-install-mechanism`, `blocked`) — the queue row is the authority; its REQ is not authored yet |
| D-DIST-06 | Hosted CI and release automation on `yumo-plugins` (run `npm test` on every push; automate AC-6.2a's post-install smoke check) | `.github/` does not exist (§0 fact 10). Standing up a CI/release host is a distinct workstream with its own secrets, runner and marketplace-publish concerns; every AC in this REQ is deliberately addressed to `cd pdlc/workflows && npm test`, which exists today, so nothing here is blocked on it | **`docs/_queue/QUEUE.md` row 7** (`pdlc-release-ci`, `blocked` on `pdlc-workflow-distribution`) — the queue row is the authority; its REQ is not authored yet |

**On the "Binds to" column (SE v6 F-07).** Every row above binds to a **queue row**, verified
present in `docs/_queue/QUEUE.md` at `5630d58` (rows 6 and 7, both `blocked`, both with an explanatory
paragraph beneath the table naming which deferrals they receive). v6 wrote the *file path* of the
successor REQ — `docs/pdlc-install-mechanism/REQ-…md`, `docs/pdlc-release-ci/REQ-…md` — and neither
directory exists in the tree; citing a nonexistent file as the receiving authority is exactly the
pattern the SE checklist flags as having shipped repeatedly. The REQ paths remain in the queue's own
`REQ Path` column as the *intended* location once each is authored; they are not cited here as
though they were artifacts.

## 9. Traceability

| User story | Requirements |
|---|---|
| US-01 | REQ-DIST-00 (AC-0.3a, AC-0.3b, AC-0.6), REQ-DIST-01 (AC-1.0–1.8, incl. **AC-1.1a**), REQ-DIST-02 (AC-2.1, 2.2, 2.5, 2.5a, 2.6, 2.8) |
| US-02 | REQ-DIST-00 (AC-0.4, AC-0.5), REQ-DIST-02 (AC-2.7, **AC-2.9**), REQ-DIST-03 (AC-3.1, 3.3, 3.6–3.9), REQ-DIST-06 (AC-6.5) |
| US-03 | REQ-DIST-01 (AC-1.1, 1.1a, 1.3, 1.6, 1.7), REQ-DIST-02 (AC-2.3, 2.5, **AC-2.9**), REQ-DIST-03 (AC-3.2, 3.4, 3.5), REQ-DIST-05 (AC-5.1–5.4) |
| US-04 | REQ-DIST-00 (AC-0.1, 0.2, 0.7), REQ-DIST-06 (AC-6.1–6.5), REQ-DIST-04 (AC-4.1–4.3) |

## 10. Disposition of cross-review findings

### Software-engineer v11 (1 High / 2 Medium / 4 Low)

| ID | Sev | Resolution |
|---|---|---|
| F-01 | High | **Accepted in full: the classify-before-create oracle moves to the bash layer, and the JS-seam wording is retracted.** Every measurement in the finding was reproduced before rewriting: zero `mkdir`/`_mkdir`/`makeDir` hits in `.claude/workflows/orchestrate-queue.bundle.js` and `runtime-adapter.js`; `rtDevInjections` (`runtime-adapter.js:181-190`) has no `_writeFile`; the queue's injection block has no `_checkFile`; and NFR-5 + AC-2.6 put the classifier and the `mkdir -p` in bash, invisible to a jest double. New **AC-2.9(4)** declares two test-only seams the scripts own — `PDLC_TRACE_FILE` (one appended line per probe and per create, inert when unset, failures ignored) and `PDLC_FAULT` (closed two-token set, unknown token ⇒ exit `4`) — with an inertness test, a "not a config surface" rule and an NFR-1/NFR-3 clearance. AC-6.5's oracle is now the trace (`no create line before the last probe line of the last row`), with a `PATH`-front-loaded `mkdir` shim permitted for the create half; AC-2.9(1) carries the retraction and its three measurements; AC-0.5 step 2's guard oracle is restated over `PDLC_FAULT=repo-root-traverse` plus the trace; §4 declares both seams with owner and default; §6 lists them. Answers **Q-01**: a script-emitted trace (shim permitted for `create`), and **no**, no future JS writer is implied. |
| F-02 | Medium | **Accepted: the uid-0 checklist now cites AC-2.9(2a) instead of re-describing it.** The finding is exactly right — (a) and (b) were inverted and the count said three where there were four, so a fixture built from the checklist could not make step 1 succeed, leaving the SE v10 F-01 repair unfalsified. The Write row now reads "**AC-2.9(2a)'s five mandated ladder tests (a)–(e)**, cited by reference and deliberately not re-described here", the example-based row points at the checklist rather than re-listing it, and a paragraph records why one statement plus a citation cannot drift where two statements do. (Five, not four: TE v11 F-04 adds the overlap test (e).) Answers **Q-02**: five tests, and the unwritable **file** is (b). |
| F-03 | Medium | **Accepted: AC-1.8(iv)'s axis 2 is conditioned on axis 5 and read from the resolved root.** The axis table gains a "Sampled when" column; axis 2 is sampled **only** in the `resolves` branch, so totality is asserted over a stated sub-product (48 marker-bearing cells + 24 unresolved-root cells with the marker unread) rather than a flat 96 with 24 unsatisfiable ones. The marker is read at `<resolved repoRoot>/pdlc/workflows/build-runtime.mjs`, and the note that fixture root and resolved root coincide only because AC-6.5 `git init`s `F` — an AC-6.5 fact, not an AC-1.8 one — is recorded. Answers **Q-03**: `repo-root-unresolved`, whatever is on disk at the marker path, with the reasoning (no `plugin-root-*` member is in play once the marker is present). |
| F-04 | Low | **Accepted, and merged with TE v11 F-04(i):** step 1's emitter is named in a two-row table — the JSON tool when one was discovered, otherwise a `printf` of the fixed literal — with the property stated as "**step 1 never depends on the JSON tool**" and a paragraph explaining why a constant template with four closed-domain scalar holes is not the hand-rolled JSON handling NFR-5 bans. Answers **Q-04**: `printf`. |
| F-05 | Low | **Accepted: the record carries the run's `writeFailures`.** The entries are in memory and already in AC-2.6's shape, so the JSON-tool path carries them verbatim; `baselineReason` stays `drift-state-invalidated` and AC-4.1 blocks on **row 3** naming each `{ path, operation }`, which is the per-path remediation the operator can act on. AC-4.1 row 3, §4's drift-state row and AC-2.9(2a) all say so. The `printf` fallback cannot carry a variable-length array without real serialisation, and **that** loss is stated as the residual rather than glossed. |
| F-06 | Low | **Accepted: the directory case is folded into `unreadable` knowingly, and it buys root-runner coverage.** AC-1.1a states that a directory at a JSON path exits `10` (re-measured) and is reported as the caller's unreadable case; AC-2.5a's remediation is generalised to "the environment / permissions fix on the named path" with the reason given (the exit code cannot distinguish the two causes, and a confidently wrong instruction is worse than a general one). The compensation is stated too: `IsADirectoryError` is **not** permission-derived, so the directory fixture does not skip at uid 0 and is the one exit-`10` assertion that survives on a root runner. AC-1.1a's uid-0 Read row now qualifies the exit-`10` entry accordingly. |
| F-07 | Low | **Not resolved here — out of this REQ's scope, escalation restated for the eleventh round.** Dispatched again as "iteration 4" with a `-v3` delta target and a `-v4` output name while SE/TE v1–v11 are committed and the REQ was at v11.0; both reviewers again filed correctly under v11. The defect is in `pdlc/skills/orchestrate-dev/SKILL.md` / `orchestrate-dev.js`'s review loop — derive the index from the highest `CROSS-REVIEW-{role}-{doc}-v{N}` on the branch — and belongs in `docs/_queue/QUEUE.md` as its own item. Recorded so it survives harvest; this REQ is not blocked on it. |

### Test-engineer v11 (2 High / 4 Medium / 2 Low)

| ID | Sev | Resolution |
|---|---|---|
| F-01 | High | **Accepted: the ladder is re-derived for the world it runs in, and step 2 is re-scoped rather than deleted.** All three decisive facts were re-measured at v12 and are now in AC-2.9(2a) as a table: `mv` over a `chmod 444` file in a writable directory **succeeds** (so v11's test (b) fixture never entered the ladder and its assertion was red against a correct implementation), `rm` in a `chmod 500` directory **fails**, and an in-place truncate of a writable file in a `chmod 555` directory **succeeds**. The generalisation is stated: every world reaching the ladder through a *permission* failure has an unwritable directory — the bit `unlink` needs — so step 1 covers the whole permission space and step 2 is empty there. Step 2 is kept and scoped to **non-permission** replace failures (`ENOSPC`/quota, immutable/append-only, a directory at the path), which is the repair-(a) branch of the finding; because those are platform-specific and root-requiring to induce, test (b) is rebuilt on **`PDLC_FAULT=drift-state-replace`** (AC-2.9(4)) with an unwritable file and a writable directory, and the choice of a declared seam over an uninducible real trigger is argued rather than assumed. §4's drift-state row carries the scoping. Answers **Q-01**: `ENOSPC`/quota and the other non-permission failures; the fixture is the fault seam; test (b) changes. |
| F-02 | High | **Accepted — same repair as SE v11 F-01.** AC-2.9(4)'s `PDLC_TRACE_FILE` is the mechanism, AC-6.5 asserts the ordering over the trace, AC-0.5 step 2's injected-`traverse` oracle is restated over `PDLC_FAULT=repo-root-traverse` plus the trace's absence of a `create` line, and NFR-5 records that the two seams are part of the scripts' contract because jest's only other observations of a bash script are exit code, stderr and the tree. The `PATH`-shim alternative the finding suggests is permitted for the `create` half and named as such; the `probe` half is always script-emitted, since a shim cannot express "before the last probe of the last row". Answers **Q-02**: bash; a script-emitted trace plus an optional `mkdir` shim; and AC-0.5 step 2's test is the same jest suite driving the script with the fault seam set. |
| F-03 | Medium | **Accepted — same repair as SE v11 F-03**, and the finding's own answer is the one adopted: axis 2 is declared conditional on axis 5 *and* the {marker present, root unresolved} expectation is stated explicitly as `repo-root-unresolved`, with the AC-0.4 reasoning (marker present ⇒ `${CLAUDE_PLUGIN_ROOT}` unset is not an error ⇒ no `plugin-root-*` member is in play). |
| F-04 | Medium | **Accepted in both halves.** (i) Step 1's emitter is named and the `printf` fallback makes the record independent of the JSON tool, so the coexistence with `json-tool-absent` that AC-1.0's precedence rests on is mechanically real (see SE v11 F-04). (ii) New mandated test **(e)** — fixture (a) plus a **malformed manifest** — asserts `baselineReason` is `drift-state-invalidated` and not the upstream reason, which is the overlap fixture the top-of-precedence claim had none of; `manifest-malformed` is chosen because it reaches the writer (unlike `repo-root-unresolved`, which has no write target) and is the cheapest of the seven to build. AC-1.8(iv)'s codomain exclusion now points at (e) as the precedence oracle. Answers **Q-03**: yes, via `printf`; and `drift-state-invalidated`. |
| F-05 | Medium | **Accepted: exit `10` is declared at every call site the probe table lists.** AC-4.3 gains a five-row mapping — parsed/key-present, parsed/key-absent, `11`, `12`, `10` — with `true` as the fail-closed answer in every degraded case and two distinct verbatim warning lines; the rationale is stated ("the flag exists to *disable* a safety check, so an unreadable file must never be read as an opt-out"). AC-1.6 gains the same four-row mapping, with unreadable and malformed both degrading every row to `unverified` (AC-1.7's direction) plus a verbatim line each, and a paragraph on why it is not a `baselineReason`. Both fixtures are added to AC-1.1a's uid-0 Read checklist. Answers **Q-04**: `true`, with a warning. |
| F-06 | Medium | **Accepted: the skip row gets the "name what you did not verify" discipline, and the coverage floor is scoped.** A uid-0 run must print **one** aggregate residual list, and the REQ enumerates exactly what it names: the ladder's three rungs (tests (a)/(e), (b), (c)) and AC-0.3b's `checkEnabled` escape (test (d)). Separately, the **85% branch floor is declared to be asserted on a non-root runner only** — a skipping runner may report coverage but its number is not the gate, because the skipped set is precisely this feature's write-failure branches, and D-DIST-06 must land a non-root runner before hosted CI can carry that gate. |
| F-07 | Low | **Accepted in both halves.** (i) The **heredoc is the normative form** and any `-c` rendering is illustrative; the stdin interaction is settled rather than noted — the heredoc redirects only the child's stdin, and the hook must read and buffer its own payload before the first `readBytes_json` call, with no `readBytes_json` invocation placed in a pipeline that consumes it. (ii) The exit codes are renumbered to `0`/`10`/`11`/`12`, out of CPython's reserved `1`/`2` (measured: `python3 --badflag` ⇒ `2`) and out of `sync-workflows.sh`'s own `0`–`4`; the false-green the collision would have produced is recorded, along with why renumbering beats an "and stderr was empty" conjunct at every call site. All four codes re-measured at v12, plus the directory case. |
| F-08 | Low | **Accepted: the ladder's failure lines are mandated and the tests assert them in order.** Steps 1 and 2 gain verbatim **failure** lines beside their success lines, carrying the same `operation` token, printed before the next rung is attempted. Test (c) asserts all three lines in order (step 1 failure, step 2 failure, residual) and test (b) asserts step 1's failure line before step 2's success line — so a run that never attempted the earlier rungs is no longer observationally identical to one that did. |

### Software-engineer v10 (2 High / 2 Medium / 4 Low)

| ID | Sev | Resolution |
|---|---|---|
| F-01 | High | **Accepted in full: AC-2.9(2a) step 1 now writes a schema-valid invalidation record, and the ladder is reordered record-first.** The finding is exactly right that v10 landed both ladder outcomes on AC-4.1 row 1, which precedes the `checkEnabled` row, so a populated-but-permanently-unwritable consumer was blocked forever with AC-0.3b's escape unreachable — and that this is the same consequence AC-2.9(1) rejected its alternative for. Step 1 is now the in-place record (`schemaVersion 1`, `checkEnabled` as resolved this run, `baselineStatus` `unresolved`/`drift-state-invalidated`, empty arrays), needing only file-write permission; step 2 is the `unlink`, the fallback for an unwritable *file* under a writable directory; step 3 is unchanged. `drift-state-invalidated` is added to AC-1.0's closed set as an eighth member at the **top** of its precedence (it can coexist with every other member and dominates them all), excluded from AC-1.8(iv)'s generator codomain because the writer and not the classifier produces it, and given an AC-4.2 remediation row. AC-4.1 row 1 no longer claims step 1's outcome, row 4 names the reason, the "No freshness clause" case 3 is rewritten, and NFR-6 states that fail-closed does not mean unescapable. A **fourth mandated test (d)** — fixture (a) plus `checkEnabled: false` ⇒ AC-4.1 reaches row 2 and proceeds — is what falsifies the whole argument. Answers **Q-01**: not blocked forever; the record carries the resolved flag. |
| F-02 | High | **Accepted: `readBytes_json` gets an executable form, an exit-code contract and a corrected citation.** Both halves of the finding were re-verified at HEAD before rewriting: the shipped loop in `check-scope-field.sh:13-20` (and the two siblings) is interpreter *discovery* — `command -v "$cand" && "$cand" -c "import sys"` — reading no path, and `check-scope-field.sh:22-30` is `json.load(sys.stdin)` inside a bare `except Exception: print("")`, collapsing the three outcomes. AC-1.1a now carries the probe's mandated heredoc form and a four-row outcome table — `0` parsed / `2` unreadable (`OSError`) / `3` absent (`FileNotFoundError`) / `4` malformed (`JSONDecodeError`/`UnicodeDecodeError`) — all four re-measured at v11 with `python3`; states that only the discovery loop is reused and the bare `except Exception` is forbidden; maps each exit to its caller's reason; and notes that exit `2` is permission-derived and therefore falls under the uid-0 rule. §4's JSON-utility and probes rows are corrected. Answers **Q-02**. *(Renumbered at v12 to `0`/`10`/`11`/`12` — the `2` collided with CPython's own usage exit; TE v11 F-07.)* |
| F-03 | Medium | **Accepted: AC-0.4's `plugin-root-unreadable` and AC-0.5's untraversable-root case now appear in *both* rows of AC-1.1a's uid-0 table.** They are example fixtures (⇒ skip) *and* axis values of AC-1.8(iv)'s generator (⇒ filter), and the table says so explicitly with a paragraph naming the two-roles reading v10 left open. The unverified-invariant list grows from three to **five**, adding the two precedence pairs only the `set-untraversable` value generates: `plugin-root-unreadable` over `repo-root-unresolved`, and over `manifest-absent`. AC-1.8(iv) cross-references the rule. Answers **Q-03**: filter, and these two pairs are declared unverified. |
| F-04 | Medium | **Accepted and re-measured: AC-6.5 assertion (a) is now conditional.** Reproduced independently — `git ls-files -s` on an untracked path prints nothing and exits `0` — so the unconditional wording was red, not vacuous, during the RED phase the `--others` source exists to support. The mandated form is "*if* `git ls-files -s <p>` produces output, its mode field is `100755`", the alternative (requiring `git add` before the batch) is named and rejected as contradicting the `--others` rationale, and the row now states that (a) reads the **live checkout at `<repoRoot>`** while every other clause is fixture-local. Answers **Q-04**: conditional. |
| F-05 | Low | **Accepted: the `git init -q` evidence is relabelled.** `git rev-parse --git-dir` exiting `0` is step 1's *applicability precondition*, not check (b); the row now maps each measurement to the clause it proves and adds the trivially-true `traverse(F)` observation so check (b) is actually covered. |
| F-06 | Low | **Accepted, and folded into TE v10 F-02's fix:** the ladder's steps 1 and 2 get `operation` tokens (`drift-state-invalidate`, `drift-state-unlink`) **and** verbatim printed lines, and every mandated test asserts one line. |
| F-07 | Low | **Accepted: AC-6.5 assertion (a) is globbed over `pdlc/hooks/scripts/*.sh`** rather than enumerated over the two scripts this feature ships, so all five — including the three siblings the landing step corrects — are pinned. §0 fact 15 and §4's shipped-script row state that this is what makes the claim a class fix. AC-6.4's computed-set style is the precedent. |
| F-08 | Low | **Not resolved here — out of this REQ's scope, escalation restated for the tenth round.** Dispatched again as "iteration 3" with a `-v2` delta target and a `-v3` output name while SE/TE v1–v10 are committed and the REQ was at v10.0. The defect is in `pdlc/skills/orchestrate-dev/SKILL.md` / `orchestrate-dev.js`'s review loop — the index must be derived from the highest `CROSS-REVIEW-{role}-{doc}-v{N}` present on the branch — and it belongs in `docs/_queue/QUEUE.md` as its own item. Both reviewers again filed correctly under v10 rather than following the dispatch. Recorded so it survives harvest; this REQ is not blocked on it. |

### Test-engineer v10 (1 High / 3 Medium / 3 Low)

| ID | Sev | Resolution |
|---|---|---|
| F-01 | High | **Accepted, repair (b) chosen: a call-order spy at the injected IO seam.** The finding is correct that AC-2.6 has no `situation` field, that no AC requires one, and that both orders are observationally identical on every mandated fixture including `chmod 000 .claude` — so "when the implementation exposes the situation" was unfalsifiable. AC-6.5 now mandates: over the `_checkFile` / `_readFile` / `_writeFile` and directory-creation seams the runtime adapter already injects, **no directory-creation call is issued before the last classification probe of the last row**. AC-2.9(1) states the same requirement and records that AC-2.6's schema was deliberately left unchanged (repair (a) was the more expensive option), and AC-1.8(i)'s "observes the filesystem as it finds it" paragraph cites the same spy so the ordering has exactly one named oracle. AC-6.5's state assertion is retained but explicitly *not* claimed to be the ordering oracle. Answers **Q-01**: the spy. *(Seam superseded at v12: there is no directory-creation seam in the JS layer, the four named seams are injected at no single call site, and the classifier is bash — the oracle is now AC-2.9(4)'s `PDLC_TRACE_FILE` trace; SE v11 F-01, TE v11 F-02. The ordering requirement itself is unchanged.)* |
| F-02 | Medium | **Accepted in full: `operation` grows to nine members and the ladder's three outcomes get verbatim lines.** `drift-state-invalidate` and `drift-state-unlink` join the set (stderr-only, like `mkdir` and `drift-state-replace`, since there is no file of ours to record them in), each ladder row carries its token and its exact printed string, and mandated tests (a)–(d) each assert one line verbatim in addition to the filesystem outcome. AC-2.9(2)'s paragraph, §4's `operation` row, AC-4.1 row 3 and AC-4.2's `Run` row all say "nine". Answers **Q-02**. |
| F-03 | Medium | **Accepted: {AC-0.3a maintainer marker present/absent} is AC-1.8(iv)'s second generator axis.** The axis list is now a five-row table, and both cells the finding names are stated as normative expectations: marker present + `${CLAUDE_PLUGIN_ROOT}` unset ⇒ `resolved`/`null`; marker absent + unset ⇒ `plugin-root-unset`. Marker-present also makes `set-untraversable` a non-event, a third expectation the axis buys. AC-1.0's overlap fixture is explicitly scoped marker-absent, as is any fixture pairing `plugin-root-unset`/`plugin-root-unreadable` with a lower member, and the §0-fact-10 hazard the finding names (this repo *is* marker-present, and AC-6.5 builds fixtures by copying it) is stated as the reason. Answers **Q-03**: `null`/`resolved`. |
| F-04 | Medium | **Accepted: the uid-0 rule is restated over any permission-bit fixture.** It now opens with a mechanical predicate — if removing a permission bit is what makes the expected outcome differ, the rule applies — followed by a read-side/write-side checklist table that lists AC-2.9(2) row 1's `mkdir`/`drift-state-replace` fixtures and AC-2.9(2a)'s tests (a)–(d) explicitly, plus `readBytes_json` exit `2`. The write-side behaviour is stated: they are example-based, so they **skip with a printed reason**; a read-only mount is permitted as a substitute but is **not** mandated. The paragraph also records why the write-side case matters even though it goes red rather than false-green. Answers **Q-04**: skip. *(v11's checklist described (a)/(b) with inverted permissions and counted three; corrected at v12 to a citation of AC-2.9(2a)'s five tests — SE v11 F-02. The skip row gained the aggregate-residual discipline at v12 — TE v11 F-06.)* |
| F-05 | Low | **Accepted: NFR-6 carries its exceptions in its own sentence** — the `checkEnabled: false` opt-out and the announced AC-2.9(2a) step-3 residual — so the property an NFR-level test would be written from is no longer falsified by a fixture this REQ mandates. |
| F-06 | Low | **Accepted, resolved by SE v10 F-02's fix**: the probe now has a shell form, an exit-code contract and an explicit outcome→reason mapping, and the two-valued call sites are declared shorthand for exit `2`. Re-deriving the split by composing `exists(p)` with a parse step is forbidden. |
| F-07 | Low | **Accepted: AC-0.5 step 2's `traverse` guard gets a named unit oracle** — inject a `traverse` that returns false for the walk result and assert `unresolved`/`repo-root-unresolved` with no `mkdir` — so the branch is covered against the 85% floor instead of shipping behind a "cannot happen in practice" note. *(Mechanism superseded at v12: dependency injection is a JS idiom the bash writer does not have; the oracle is now `PDLC_FAULT=repo-root-traverse` plus the trace — TE v11 F-02.)* |

### Software-engineer v9 (2 High / 4 Medium / 1 Low)

| ID | Sev | Resolution |
|---|---|---|
| F-01 | High | *(Ladder superseded at v11 by SE v10 F-01: step 1 is now an in-place schema-valid invalidation record and the unlink is step 2 — the mechanism below stands, the step order and sentinel do not.)* **New AC-2.9(2a): a failed drift-state write invalidates the previous run's file.** The finding is accepted in full — AC-4.1's "No freshness clause" justification was false of AC-2.9(2), because on any consumer where an earlier run succeeded the stale file survives with `writeFailures: []` and possibly all rows `in-sync`, and the queue reads contents only. The ladder is: **unlink** (needs directory write) → **truncate in place to `{}`** (needs only file write; AC-4.1 row 1 already blocks on `schemaVersion != 1`) → **print a stated residual**. Deliberately no new queue rule and no new queue input. AC-4.1's paragraph is re-derived as four numbered cases with the residual named rather than asserted away; AC-2.4, AC-2.6 and §4's drift-state row cite it, and three falsifying tests are mandated. Answers **Q-01**: the pre-existing file is removed or neutered, never believed. |
| F-02 | High | **The working-tree bit is now mandated alongside the index bit.** Re-measured here (`git update-index --chmod=+x` ⇒ index `100755`, `ls -l` `-rw-r--r--`, `./s.sh` ⇒ exit **126**) and recorded in §0 fact 15, whose `EACCES` error code is corrected to `126`. §6's landing step runs `chmod +x` (with `git update-index --chmod=+x` retained for `core.fileMode false`), §4's row requires both bits, and AC-6.5 now carries **two** assertions: `git ls-files -s` = `100755` at the repo root **and** `[ -x ]` on the copied paths inside `F` — which also closes TE v9 F-08's vacuous-index-assertion case for untracked RED-phase scripts. Worktree copy + real `chmod +x` was chosen over `git checkout-index`, exactly as the finding recommends, because the index-materialising construction reintroduces v8 F-05. Answers **Q-02**: both, and the worktree bit is the one AC-6.5 depends on. |
| F-03 | Medium | **`readBytes` is parameterised by its reader and AC-1.0 gains a precedence.** AC-1.1a now defines `readBytes_hash` (content-hash utility; managed-artifact comparison only) and `readBytes_json` (the JSON tool; the manifest and the other three JSON files), states the general form `readBytes_R`, and notes that the two readers fail independently. AC-0.4's manifest clause names `readBytes_json` and states that hash-tool absence is **never** a manifest-level reason. AC-1.0 declares `json-tool-absent` > `plugin-root-unset` > `plugin-root-unreadable` > `repo-root-unresolved` > `manifest-absent` > `manifest-malformed` > `manifest-empty` with the same remediation-order rationale AC-1.2 uses, AC-1.8(iv) extends its three reason properties to `baselineReason`, and §4 carries a `baselineReason` precedence row. Answers **Q-03**. |
| F-04 | Medium | *(Extended to nine members at v11 — TE v10 F-02.)* **`operation` is a closed seven-member set; `stage` is deleted.** Members: `mkdir`, `drift-state-replace` (stderr only — no file exists to record them in), `artifact-copy`, `backup`, `backup-verify`, `retire-delete`, `sync-manifest-update`. Applied at AC-2.6's schema, AC-2.9(2)'s table (each row now names its tokens), AC-4.1 row 3, AC-4.2's `Run` row, and a new §4 row. `stage` is removed rather than defined, since no surface printed it and no oracle read it. Answers **Q-04**. |
| F-05 | Medium | **AC-6.5's `add -A && commit` is dropped.** Re-measured: on a commitless `git init` directory `git worktree list --porcelain` prints the worktree with no `bare` line, `git rev-parse --git-dir` exits `0` and `--show-toplevel` returns the same path — AC-0.5 step 1 (a)–(c) all pass. A dedicated table row records the measurement and the two failure modes the commit would have added (no git identity on a D-DIST-06 container; `commit.gpgsign`), and names the `-c user.name=… -c commit.gpgsign=false` form should a commit ever be needed. §6's scope item and the closing "why the working tree" paragraph match. |
| F-06 | Low | **`enumerate(D)` = `[ -r D ] && [ -x D ]`** — one definition, stated identically at AC-1.1a, AC-0.6 and §4. |
| F-07 | Low | **Not resolved here — out of this REQ's scope, escalation restated.** This round was dispatched as "iteration 2" with an instruction to delta against `-v1` and write `-v2`, while SE/TE v1–v8 were committed and the REQ was at v9.0; both reviewers correctly filed v9 instead. The defect is in `pdlc/skills/orchestrate-dev/SKILL.md` / `orchestrate-dev.js`'s review loop (the index must be derived from the highest `CROSS-REVIEW-{role}-{doc}-v{N}` on the branch), it now also mis-specifies the delta target and the output filename, and it belongs in `docs/_queue/QUEUE.md` as its own item. Recorded so it survives harvest; this REQ is not blocked on it. |

### Test-engineer v9 (2 High / 3 Medium / 3 Low)

| ID | Sev | Resolution |
|---|---|---|
| F-01 | High | **Same fix as SE v9 F-03, and the fixture now has one expected outcome.** `readBytes` is split into `readBytes_hash` / `readBytes_json`; AC-0.4 names the JSON tool; AC-1.1a states that the hash utility can be absent while the JSON tool works and vice versa. Answers **Q-01**: with no `shasum`/`sha1sum`, `baselineStatus` is **`resolved`**, every row is `unknown`/`hash-tool-absent`, `--check` exits `3` via the *any row unknown* row, and `hash-tool-absent` wins AC-1.2's precedence on the overlap AC-1.8(iv) asserts against — §4, AC-1.1, AC-1.2, AC-1.8 and NFR-5 all agree, and `plugin-root-unreadable` is reachable only through a genuinely unreadable manifest or an untraversable plugin root. |
| F-02 | High | **AC-3.3 row 1 is scoped to writes *attempted and failed*.** `repo-root-unresolved` is *no write target* and exits **`3`** via row 2. Applied at AC-3.3 (row 1 plus a new paragraph deriving the boundary), AC-4.1 (row 1 now names the no-file cases explicitly, row 3 is scoped to attempted writes), AC-2.4 (a two-row table separating the cases with their per-surface exit codes), AC-2.6, AC-2.9(2) (an explicit "this is not a `repo-root-unresolved` clause" paragraph), AC-3.8's population row 3, and §4's exit-code row. Answers **Q-02**: `3`. |
| F-03 | Medium | **AC-2.9(1) mandates classify-then-create.** The whole drift computation is evaluated against the filesystem as observed *before* the run created anything; the two observable consequences are stated (the file records pre-creation states; the axis value moves `parent-absent` → `absent` across two runs while the *state* stays `missing`). AC-1.8(iii) is scoped to a fixed tree, AC-1.8(i) says the generator's value is the one the classifier sees, AC-2.6 states what the file records, AC-3.8 cites the order, and AC-6.5 gains the paragraph the finding asks for **plus** a required assertion on the written drift state file so the order is pinned rather than inferred. Answers **Q-03**: before. |
| F-04 | Medium | *(Extended to nine members at v11 — TE v10 F-02.)* Same as SE v9 F-04 — closed seven-member `operation` set, `stage` deleted, all three printing surfaces and §4 updated. Answers **Q-04**. |
| F-05 | Medium | **AC-1.1a's uid-0 rule is now a two-row table** separating example-based tests (**skip** with a printed reason) from AC-1.8's property test (**filter** the two permission-derived `consumerPath` values and `pluginPath present-unreadable`, print the reason once, assert the remaining cross product in full). The recommendation is adopted as written, and the three invariants left unverified under root are named: `ancestor-untraversable ⇒ unknown`, `pluginPath` present-unreadable ⇒ `plugin-artifact-unreadable`, and `hash-tool-absent` over `consumer-artifact-unreadable`. AC-1.8(i) cross-references it. Answers **Q-05**: filter. |
| F-06 | Low | **AC-0.5 step 2's result now carries the same `traverse` check as step 1(b)**, so AC-1.1's `A(p)` termination argument holds for both resolution routes; AC-1.1's citation is restated accordingly. |
| F-07 | Low | **AC-3.3's Then now reads "writes nothing except the drift state file and, per AC-2.9(1), the directory containing it"**, with the reason the qualifier is normative (AC-3.8 requires that creation). |
| F-08 | Low | Folded into SE v9 F-02: AC-6.5 asserts `[ -x ]` on the copied paths **inside `F`** alongside the index-mode assertion, and the row states why the index assertion alone is vacuous for untracked RED-phase scripts and passable-but-wrong for a `chmod -x` working copy. |

### Software-engineer v8 (2 High / 3 Medium / 2 Low)

| ID | Sev | Resolution |
|---|---|---|
| F-01 | High | **New AC-2.9(1) decides it: every writer creates `.claude/workflows/` with `mkdir -p`** when it is absent beneath the AC-0.5-resolved root, under the existing `$HOME`/`/`/`repo-root-unresolved` guards, creating at most `.claude/` and `.claude/workflows/`. The alternative reading is recorded with the reason it was rejected: it breaks AC-2.4/AC-2.6/AC-2.7 on the rollout-universal population, blocks the queue permanently on AC-4.1 row 1, and makes AC-0.3b's `checkEnabled` escape unreachable. `mkdir` failure is AC-2.9(2)'s `writeFailed` (hook exits `0` and warns; `--check`/sync exit `4`), and the resulting row-1 block is argued to be correct rather than spurious — the runtime loads bundles from that directory, so a repo where it cannot exist cannot host the pipeline. §4 carries a `.claude/workflows/` creation row; AC-2.4, AC-2.6, AC-3.8 and AC-6.5 all cite it. Answers **Q-01**. |
| F-02 | High | **New AC-2.9(2)–(3).** (2) A `writeFailed` outcome exists everywhere: `writeFailures[{path,operation,stage}]` in the drift state file (AC-2.6), **exit `4`** at the top of AC-3.3's table, a queue block in AC-4.1 below `checkEnabled`, and a run-level block in AC-4.2's report. (3) **Every delete and overwrite is conditional on a re-read-and-`sha1`-verified backup** — AC-3.9 now reads "backed up, verified, *then* deleted", with a failed or mismatching backup leaving `p` in place with `retire-skipped` and exit `4`; `mv` is named as an acceptable implementation. AC-3.1 states per-row atomic copy (temp sibling + `mv`) and **continue-on-error** across rows, with the failed row's sync-manifest entry not written. Answers **Q-02**. |
| F-03 | Medium | **New AC-1.1a defines the probes operationally** — `exists`, `traverse` (`[ -d ] && [ -x ]`), `enumerate` (`[ -r ]`, used only by AC-0.6's listing), `readBytes` (the hash utility exits `0`) — plus the composite `established-absent(p) := ! exists(p) ∧ traverse(A(p))`. The `0111` / `0444` measurement is tabulated with the opposite-direction consequences of each. Substitutions applied at AC-1.1's state table and situation table, AC-1.2's conditions and reason table, AC-1.8(i)'s axis values, **AC-0.5 step 1(b)** and **AC-0.4** (which now separates `plugin-root-unset` from `plugin-root-unreadable` on the same remediation axis). §4 carries a probes row. Answers **Q-03**: traverse, `[ -x ]`. |
| F-04 | Medium | **AC-1.8(i)'s mapping table is explicitly conditional** — "given the hash tool is present and `pluginPath` is `present-readable`" — and the **two dominating rows are tabulated** (hash tool absent ⇒ `unknown`/`hash-tool-absent` for every `consumerPath` value; `pluginPath` absent or unreadable ⇒ `unknown` with the matching plugin-side reason), with the named cell `{hash tool absent} × {pluginPath absent} × {parent-absent}` worked through to its single answer. |
| F-05 | Medium | **AC-6.5's fixture is fully mandated in three steps** and the "equivalently" is gone: `mkdtemp`, copy `git ls-files -z --cached --others --exclude-standard` **preserving mode bits**, then `git init && add && commit`. Two new table rows explain why the index-only source was wrong (the files under test are un-added during the RED phase) and why `F` must be a git work tree (TE v8 F-01). The mode-bit half is settled by shipping both scripts at `100755`, a `git ls-files -s` assertion, and §0 fact 15 recording that all three existing siblings are `100644` while `hooks.json` invokes bare paths — corrected in the landing step (§6). The command block keeps the bare-path invocation deliberately, so the shipped invocation form is what the bootstrap proves. Answers **Q-04**: yes to `--others --exclude-standard`, bare path with the execute bit. |
| F-06 | Low | **§0 fact 16** records the builder's node-builtins-only dependency with the line citation, AC-6.1 states it as a **standing constraint** ("a future builder dependency must add an install step to AC-6.5's fixture in the same commit"), and AC-6.5 has a "No install step" row citing both. |
| F-07 | Low | **Not resolved here — still out of this REQ's scope, and the escalation is now concrete.** This round was dispatched as "iteration 1" while sixteen cross-review files and a REQ at v8.0 sat on the branch; both reviewers again derived the correct index (v8) from the branch rather than from the dispatch, and this revision reads the v8 files and is v9.0. The defect is in `pdlc/skills/orchestrate-dev/SKILL.md` / `orchestrate-dev.js`'s review loop — it belongs in `docs/_queue/QUEUE.md` as its own item, which is the action this REQ can neither perform nor gate on. Recorded for harvest, seventh round. |

### Test-engineer v8 (1 High / 4 Medium / 2 Low)

| ID | Sev | Resolution |
|---|---|---|
| F-01 | High | **AC-6.5's fixture is mandated as a git work tree** (`git init` + `add` + `commit` after the copy), with a dedicated "Why `F` must be a git work tree" row tracing the copy-only form through AC-0.5 to `repo-root-unresolved` and the three failing assertions, and stating that the two v8 constructions are **not** equivalent. Second half: **AC-3.8's Who is qualified** ("whose repo root AC-0.5 resolves") and a three-row population table answers the non-git consumer — git work tree with no `.claude/` ⇒ applies; non-git with `.claude/` ⇒ applies; **non-git with no `.claude/` at all ⇒ `repo-root-unresolved`, nothing created anywhere, `--check` exits `3`, queue blocks**, with the remediation (`mkdir .claude` or `git init`) now named by AC-2.5a. That is the decided answer, on AC-0.5's own "a wrong root is worse than a refusal" argument. Answers **Q-01** and **Q-02**. |
| F-02 | Medium | **The upward rule survives and all four statements now say it.** AC-1.1 defines `A(path)` (first existing ancestor, terminating at the AC-0.5 root), its situation table is rewritten in those terms with the parent and higher-ancestor cases as separate rows, AC-1.2's condition says *first existing ancestor* rather than *parent*, and **AC-1.8(i) gains the axis value `ancestor-untraversable`** with both fixtures spelled out (`chmod 000 .claude/workflows` and `chmod 000 .claude` with `workflows/` absent), so the disagreeing case is generated. |
| F-03 | Medium | **AC-1.1a** — same fix as SE v8 F-03: the four probes, their `test` forms, the composite `established-absent`, the `0111`/`0444` measurement, and every axis-value name restated in that vocabulary. The `present-unreadable` fixture is now exactly `exists(p) ∧ ¬readBytes(p)` and the ancestor fixture is a `chmod` on a named directory, so both are buildable without guessing. |
| F-04 | Medium | **AC-1.2 declares a reason precedence** — `hash-tool-absent` > `plugin-artifact-missing` > `plugin-artifact-unreadable` > `consumer-artifact-unreadable` — with the rationale in remediation order and the note that it is evaluated only after the state is `unknown`, and **AC-1.8 gains clause (iv)**: reason totality (`null` for every non-`unknown` state), single-valuedness by that precedence asserted against the *generated* overlap, and determinism. AC-4.2 states that the printed reason is the precedence-selected one. §4 carries a precedence row. Answers **Q-03**: a declared precedence, not first-failure order. |
| F-05 | Medium | **AC-2.8's `local-edit`/`unverified` row names both backups**, keyed to the artifact each holds: `{R.id}.{stamp}[-N].bak` for R's overwritten bundle and `{basename(p)}.{stamp}[-N].bak` for `p` itself, with `{stamp}`/`[-N]` left literal and the restorability sentence stated per artifact. The "printed backup path" paragraph gains the reason (two backups, two ids, §4's distinct namespaces). Answers **Q-04**: both. |
| F-06 | Low | **`present-unreadable` no longer covers an absent path.** The axis is five-valued and every value is named for exactly what its fixture builds; the absent-beneath-untraversable-ancestor case is `ancestor-untraversable`, and the generator is instructed to produce both it and `parent-absent`. |
| F-07 | Low | **AC-1.1a's `id -u == 0` paragraph.** The five permission-only fixtures are enumerated, and the required behaviour is **skip with a printed reason** naming uid 0 — never a silent pass and never the non-root assertion. D-DIST-06's hosted CI is named as the reason this matters now. An alternative unreadability mechanism is explicitly not mandated. |

### Test-engineer v7 (2 High / 1 Medium / 4 Low)

| ID | Sev | Resolution |
|---|---|---|
| F-01 | High | **AC-2.8's `in-sync` row now names plain `sync-workflows.sh`**, and "not reachable" is rescoped to the only thing it is true of: an entry in `retiredPresent` with `supersedingState: "in-sync"` cannot occur in a drift state file with `generatedBy: "sync"` (the guard passed in that same run, so `p` was deleted). At `generatedBy: "hook"` and `"check"` — the two surfaces AC-2.8 actually serves — it occurs freely and is universal at rollout. The table is now total over R's state and the highest-value fixture (all rows `in-sync`, legacy `.js` present) has an expected string. Answers **Q-02**: yes, plain sync. |
| F-02 | High | **AC-1.1's `missing` re-stated as "absence is *established*"** — absent with a parent that is readable **or itself absent**; only an *existing but unreadable* parent yields `unknown`/`consumer-artifact-unreadable`, with the upward rule stated for nested absence. A four-row table fixes the mapping, **AC-1.8(i)'s `consumerPath` axis is now four-valued** (`parent-absent` / `absent` / `present-unreadable` / `present-readable`) with an explicit instruction to generate `parent-absent`, and AC-3.8 and AC-6.5 each state that this is what makes them reachable. Answers **Q-01**: `missing`. |
| F-03 | Medium | **AC-6.5's fixture is built from the working tree's tracked, non-ignored files** (`git ls-files -z` into a temp dir), not `git clone` of `HEAD`; a new "Invariant it proves" row states *the bootstrap works against the code in this checkout*, and both failure modes (red through the whole implementation batch; blind to working-tree regressions afterwards) are recorded so the fixture source cannot be relaxed back. Temp/network/teardown properties unchanged. §6's in-scope item updated. Answers **Q-03**: the working tree, deliberately. |
| F-04 | Low | The `baselineStatus unresolved` clause is **deleted** from AC-2.8's table, with a paragraph naming **AC-2.5a** as the owner of that case and stating why no fixture exists for it (AC-2.6/AC-0.3b fix `retiredPresent` at `[]` *meaning not evaluated*). |
| F-05 | Low | §4's `git` row and AC-0.5's rationale both now state the residual risk explicitly: the "verified work-tree root or `repo-root-unresolved`" guarantee is **conditional on `git` being installed**, and on a git repository with no `git` binary the walk runs with the stray-`.claude/` hazard live. The REQ accepts that, and the required `git`-absent fixture is pinned to assert **the walk result**. |
| F-06 | Low | **AC-4.2's remediation list is split by level** into a table — manifest-level reasons (AC-1.0) printed in the baseline block, row-level reasons (AC-1.2) printed per row with the row `id` and state — matching what AC-1.2 and §4's row-`reason` row already say. |
| F-07 | Low | AC-2.6 calls `retiredPresent` a **projection**, not a subset, and adds a per-surface table for when `supersedingState` is measured (`hook`/`check`: current state; `sync`: post-copy), with the consequence stated: golden outputs for AC-2.8 and AC-4.2 are surface-specific by construction. |

### Software-engineer v7 (0 High / 4 Medium / 3 Low)

| ID | Sev | Resolution |
|---|---|---|
| F-01 | Medium | **`plugin-artifact-unreadable` added as the fourth member of AC-1.2's closed row-reason set**, with a four-row reason→condition→remediation table: `plugin-artifact-missing` ⇒ plugin update, `plugin-artifact-unreadable` ⇒ permissions fix on the plugin cache path, `consumer-artifact-unreadable` ⇒ permissions fix on `consumerPath`, `hash-tool-absent` ⇒ install a hash utility. §4's row-`reason` row, AC-2.5 ("all four … distinguishable"), AC-2.8's `unknown` row and AC-4.2's per-level table all carry it. Answers **Q-01**: it was an asymmetry, now removed. |
| F-02 | Medium | **AC-0.1 states the namespace rule once and completely**: the multiset `{R.id} ∪ {basename(p) : p ∈ any retires}` is pairwise distinct **and** every member matches the `id` charset; either violation ⇒ `manifest-malformed`. It subsumes v7's pairwise-basename rule, closes `basename(p) == R.id`, and constrains retired basenames in the filename-interpolation position. AC-3.4 cites the union rule for both halves. Answers **Q-02**: no, it is not legal. |
| F-03 | Medium | Same fix as TE v7 F-03 — AC-6.5's fixture built from the working tree. The **`realpath` normalisation** this finding additionally asked for is a new row in AC-6.5's table (macOS `/var` vs `/private/var`), with the note that AC-0.5 check (c) is itself safe because both git commands return the canonical form. Answers **Q-03**: the working tree. |
| F-04 | Medium | **AC-2.8 prints the backup *directory* `.claude/workflows/.pdlc-backups/` plus the filename pattern `{id}.{stamp}[-N].bak` with only `{id}` expanded** — fully determined at print time and assertable verbatim by a golden test. The reason is recorded: `{stamp}` is generated by the future `--force` run, so a concrete path names a file that does not exist when the warning is printed. Answers **Q-04**: the pattern, with `{id}` expanded. |
| F-05 | Low | AC-6.2's prohibition qualified to "**this repository's** `pdlc/workflows/dist/`", naming AC-6.5's isolated `os.tmpdir()` fixture as the sanctioned exception, so the absolute cannot be cited while deleting the bootstrap test. |
| F-06 | Low | Same as TE v7 F-04 — the unreachable `baselineStatus unresolved` clause is deleted from AC-2.8's table and AC-2.5a is named as the owner. |
| F-07 | Low | **Not resolved here — still correctly out of this REQ's scope**, and now escalated per the finding's own recommendation. The iteration index is a defect of `pdlc/skills/orchestrate-dev/SKILL.md` / `orchestrate-dev.js`'s review loop, not of this document. Both v7 reviewers again filed correctly indexed reviews against a dispatch that said "iteration 5"; this revision reads the v7 files. The routing has now failed to land for six rounds, so it is recorded here for harvest **and** belongs in `docs/_queue/QUEUE.md` as its own item rather than as a §10 note. |

### Software-engineer v6 (1 High / 2 Medium / 5 Low)

| ID | Sev | Resolution |
|---|---|---|
| F-01 | High | **Exemption rule 4 added: `**/__tests__/**`.** v6's three-member exemption set put `pdlc/workflows/__tests__/**` in the *covered* set, so the mandated RED fixture — once committed — was itself a covered violation and `coveredViolations(repoRoot) == ∅` could never be green; the same collision hit AC-3.4 backup-filename fixtures, AC-0.7 `retires` fixtures and AC-2.8 golden outputs. Rule 4 is stated with its rationale (fixtures are *inputs to the oracle, not instructions to a reader*), and AC-6.4 additionally pins the RED/GREEN fixture root to a **non-git `os.tmpdir()` tree** so no fixture is ever tracked at all. Answers **Q-01**: yes, exempt — and the fixture also lives outside the work tree. |
| F-02 | Medium | **AC-0.5 step 1 rewritten to derive the *work tree*.** `git worktree list --porcelain`'s first record, validated non-bare, readable, and confirmed by `git -C <path> rev-parse --show-toplevel`. The parent-of-git-directory rule resolved a submodule to `<super>/.git/modules` and a `--separate-git-dir` clone to the external git dir, both passing every declared guard. A failure *inside* a git repository now goes straight to `repo-root-unresolved`, never to the bounded walk. Minimum git version **2.7.0** declared in §4 with the absent / too-old / bare behaviours, all three required fixtures. Answers **Q-02** and **Q-04**. |
| F-03 | Medium | **`consumer-artifact-unreadable` added to AC-1.2's closed set**, AC-1.1's `missing` narrowed to "`consumerPath` absent **and its parent directory readable**", and AC-1.8(i)'s two presence axes made three-valued. AC-2.5 and AC-4.2 name the permissions fix as its remediation. Answers **Q-03**. |
| F-04 | Low | §0 fact 14's listing re-run at `5630d58` and **pasted unaltered** — 27 lines, `git grep -l` order, no brace expressions, `docs/PLAN-pdlc-integration-boundary-gates.md` back in position 5. A note states the output is *expected* to grow by one or two lines per review round and that what AC-6.4 asserts is the difference, not the raw list. |
| F-05 | Low | AC-3.4's regex restated in **POSIX ERE with positional groups** — `^(.+)\.([0-9]{8}T[0-9]{6}Z)(-([0-9]+))?\.bak$`, `BASH_REMATCH[1]`/`[2]` — with the reason recorded (named groups are PCRE/JS; NFR-5 mandates bash, and `grep -P` is unavailable on BSD grep). Semantics unchanged. |
| F-06 | Low | AC-0.1 (twice) and AC-0.2 retargeted: `manifest-malformed` is **AC-1.0's** manifest-level reason; AC-2.4 is cited only for the hook's exit behaviour. |
| F-07 | Low | Every deferral's "Binds to" column now cites the **queue row** (`docs/_queue/QUEUE.md` rows 6–7), verified present, with a note explaining that the nonexistent REQ file paths were the citation defect. Applied to D-DIST-01/02/03/05/06/07, not only the new row. |
| F-08 | Low | **Not resolved here — correctly out of this REQ's scope.** The iteration-index defect is a defect of `pdlc/skills/orchestrate-dev/SKILL.md` (or `orchestrate-dev.js`'s review loop), not of this document; this REQ cannot fix it and has routed it since v4. Both v6 reviewers again filed the correct review as v6 rather than the dispatched v4, and this revision reads the v6 files. Recorded here so the routing survives harvest. |

### Test-engineer v6 (1 High / 3 Medium / 3 Low)

| ID | Sev | Resolution |
|---|---|---|
| F-01 | High | **Both doors opened, and the REQ picks the primary one.** The RED/GREEN fixture root is a **non-git temp tree** under `os.tmpdir()` created and removed by the test (matching `__tests__/fixtures/tmpGitFixture.js`), so the directory-walk discovery branch runs, no fixture is ever tracked, and neither the "committed fixture ⇒ permanently red" door nor the "untracked fixture ⇒ RED case is green" door is reachable. Exemption rule 4 (`**/__tests__/**`) ships as well, for the committed fixtures other ACs legitimately need. Answers **Q-01**. |
| F-02 | Medium | **AC-2.8 gains a per-path remediation table conditioned on the superseding row R's state**, and AC-4.2 defers to it: plain sync only when R is `stale`/`missing`; `--force` **with the backup path named** when R is `local-edit`/`unverified`; plugin update or an environment fix when R is `unknown`. AC-2.6's `retiredPresent` becomes `{ path, supersededBy, supersedingState }` so the conditioning is observable in the file a golden test asserts. Answers **Q-03**: `--force` is the sanctioned automatic escape; a manual delete is explicitly *not* recommended, since it leaves R diverged. |
| F-03 | Medium | **AC-6.5's surface, isolation and observables specified.** Surface: the `pdlc/workflows` jest suite. Isolation: `git clone --local --no-hardlinks` into `os.tmpdir()`, `CLAUDE_PLUGIN_ROOT` unset, `HOME` pinned to a temp dir that is not an ancestor of the clone. Queue observable: AC-4.1's mapping applied to the drift state file the sync run wrote (⇒ *proceed silently*). "a CI runner" removed from the Who, since D-DIST-06 means that surface does not exist. §6 carries the test as an in-scope item. Answers **Q-02**. |
| F-04 | Medium | **`git` declared as the third external tool** in §4 with minimum version 2.7.0 and the absent / too-old / bare behaviours; NFR-5's "exactly two external tools" corrected to three, with `git` distinguished as the one whose absence is not a correctness degradation. Per this finding's own recommendation, an unsupported-flag/too-old git **refuses** (`repo-root-unresolved`) rather than falling through to the walk. |
| F-05 | Low | Folded into SE F-03's fix: AC-1.8(i)'s `pluginPath` and `consumerPath` axes are now three-valued (`absent` / `present-unreadable` / `present-readable`), with a note that a two-valued axis satisfies totality without ever generating the unreadable case. |
| F-06 | Low | AC-0.1 gains "**no two `retires` members anywhere in the manifest may share a basename** ⇒ malformed", with the reason stated at both ends (AC-0.1 and AC-3.4): the retention grouping key for a retirement backup *is* the retired path's basename. |
| F-07 | Low | AC-6.4 states the intended resolution for a false positive on pattern 4: **rephrase the document; narrowing the pattern is never sanctioned**, and any change to `PATTERNS` is a change to this AC in the same commit with the measurement re-derived. |

### Software-engineer v5 (1 High / 4 Medium / 5 Low)

| ID | Sev | Resolution |
|---|---|---|
| F-01 | High | **Bootstrap hole closed.** The sync script's own path is now bound by the same `<pluginRoot>` substitution as everything else: `<pluginRoot>/hooks/scripts/sync-workflows.sh`, i.e. `pdlc/hooks/scripts/sync-workflows.sh` in the maintainer repo. Stated in the REQ-DIST-03 delivery-vehicle paragraph, in AC-0.4 (which also fixes "the exact remediation command" to that expansion for AC-2.1/2.5/2.5a/2.8/4.2), in AC-6.1, and end to end in new **AC-6.5 — Fresh-clone bootstrap** (`build` then `sync`, no plugin, no network, documented in `CLAUDE.md` and `pdlc/README.md`; §6 in scope). Answers **Q-01**. |
| F-02 | Medium | AC-1.6 and AC-6.1 restated as "the only writer of **managed artifacts** into `.claude/workflows/`", with the reason the qualifier is load-bearing (the hook writes the drift state, sync writes `.pdlc-backups/`). AC-2.7's forward rule rescoped from "write access to `.claude/workflows/`" to "write access to **the drift state file**". |
| F-03 | Medium | The "in a distribution context" qualifier is **deleted**. AC-6.4 now pins four literal ERE alternatives in a table and states the oracle as `grep(PATTERNS) − exempt(p)`. Measured evidence that the qualifier separated nothing is in §0 fact 14. Answers **Q-04**. |
| F-04 | Medium | `pdlc/workflows/dist/**` is **exempt**, by the generated-tree rule, alongside `.claude/workflows/**` and `node_modules/**` — with the day-one reason recorded (the bundles inline the very module headers this AC corrects). Answers **Q-03**. |
| F-05 | Medium | AC-0.5 step 1 changed to `git rev-parse --path-format=absolute --git-common-dir` → parent, i.e. the **main** worktree; a linked worktree is explicitly **not** a distinct consumer, with `orchestrate-dev.js:1869`/`:1882` cited as why worktrees are routine here. New **BL-06** is the executable check, **D-DIST-07** the bound deferral if the answer is unfavourable. §4's repo-root row updated. Answers **Q-02**. |
| F-06 | Low | §0 fact 14 rebuilt: it now prints the exact four-pattern command AC-6.4's test runs, its **verbatim 25-path output**, the exemption rule applied to it, and the resulting five covered violations. `CLAUDE.md` and the two `SKILL.md`s are stated as **not appearing in the grep output** and as an ordinary in-scope edit rather than table rows. |
| F-07 | Low | §0 fact 13 and AC-6.1 now cite `:29` (`OUT_DIR`), `:170` (`mkdirSync`) and `:184` (the only `writeFileSync`, inside the `:172-186` loop). |
| F-08 | Low | AC-6.2 restated as "no ignore rule under `pdlc/` other than `node_modules/`", listing the three root rules that exist and noting AC-3.9 adds a fourth. |
| F-09 | Low | AC-6.2a restated as "exactly the bundles named in the manifest **plus the manifest itself**". |
| F-10 | Low | Still routed to `pdlc/skills/orchestrate-dev/SKILL.md` (v4 F-11's disposition); this REQ does not restate an orchestration rule in prose. This revision was again dispatched as "iteration 3" while v5 reviews are committed, so the reviewers' filed indices (v5 → this v6) are authoritative. |

### Test-engineer v5 (3 High / 4 Medium / 3 Low)

| ID | Sev | Resolution |
|---|---|---|
| F-01 | High | **New AC-1.0** makes baseline resolution a manifest-level precondition with its own closed reason set (including `manifest-empty`), evaluated before any row quantifier. Every green outcome is now guarded by `baselineStatus == resolved` **and** a non-empty row set: AC-2.2 (silence), AC-3.3 row 1 + row 5 (exit 0), AC-4.1 rows 1–3 + last row (proceed). New **AC-2.5a** gives the hook a warning that needs no rows. AC-1.2 keeps only the two genuinely row-level reasons (`plugin-artifact-missing`, `hash-tool-absent`); the other six moved to AC-1.0. AC-2.6 gains `baselineStatus`/`baselineReason` and fixes `rows: []` when unresolved. Answers **Q-01**: `rows` is `[]` **with** a manifest-level status field. |
| F-02 | High | Row schema gains **`retires: [consumer-relative paths]`** (AC-0.1); top-level `retired` is defined as their union and checked by AC-6.2(c). AC-3.9's guard is now per-row and computable: *`p ∈ R.retires` is deleted iff R's post-copy state is `in-sync`*, else `retire-skipped` naming R's state. The mandated falsifying fixture is written out. Answers **Q-03**: retirement is skipped for exactly the rows the copy loop skipped. |
| F-03 | High | §0 fact 14 re-derived with the **same four-pattern command the test runs**, verbatim output pasted, exemption rule applied mechanically ⇒ five covered violations. AC-6.4's covered set is `grep − exempt`; nothing is hand-listed. Answers **Q-02**: yes, the literal phrase, no qualifier. |
| F-04 | Medium | Retirement is stated as manifest-derived and **not evaluated** when `baselineStatus` is `unresolved` (AC-0.3b, AC-2.6, AC-3.9). AC-2.8's Who is now "a consumer that has updated the plugin but not yet synced". AC-0.3b enumerates `retiredPresent: []` with its meaning (*not evaluated*, never "none present"). |
| F-05 | Medium | The exemption set is expressed as a **rule** over paths (generated trees; `docs/<dir>/` containing a `REQ-*.md`; manifest `retired`/`retires` values) and the covered set is "everything else", so the two partition the tree. `README.md`, `pdlc/hooks/scripts/*.sh`, `docs/_constraints/**` and future `docs/design/*.md` are covered — stated explicitly, with the `MASTER-PLAN-v2.md` case named as must-be-RED. |
| F-06 | Medium | AC-6.4's checker is required to be a **pure function of a root directory** (or explicit file list), with discovery via `git ls-files` when the root is a work tree and a directory walk otherwise. RED and GREEN run against `__tests__/fixtures/` trees; one additional assertion binds it to the real repo root. |
| F-07 | Medium | AC-6.2(b) no longer says "byte-identical to the freshly built bundle". It recomputes `sha1` from the bytes on disk and compares to `pluginSha1`; freshness is discharged **once**, by AC-6.3, and no test in this feature runs the builder into `dist/`. |
| F-08 | Low | `id` values pinned literally (`orchestrate-dev`, `orchestrate-queue`) in AC-0.1 and §4, and AC-3.4 gains the stamp-anchored filename regex with a greedy `id` capture, so `orchestrate-dev` and the retired basename `orchestrate-dev.js` are parsed and retained independently. |
| F-09 | Low | AC-0.3b states the escape is **two-step** (write config → run hook/`--check` so the writer records the resolved flag → queue proceeds) and names the one-step fixture as correctly blocking. AC-4.1's `checkEnabled` row sits above the `baselineStatus` row precisely so the escape still works. |
| F-10 | Low | AC-5.3: `artifactVersion` is **required** in the report, labelled and asserted; the permission to drop it is withdrawn. |

### Software-engineer v4 (3 High / 3 Medium / 5 Low)

| ID | Sev | Resolution |
|---|---|---|
| F-01 | High | AC-6.4 rewritten. The enumeration is re-derived by repo-wide grep at `3dab335` and recorded in **§0 fact 14** as a classified table (20 paths: 5 normative-and-wrong, 3 normative-and-correct, 7 archived, 4 generated/own-docs). AC-6.4 now states a **normative covered set and a normative exemption set** — archived `docs/{other-feature}/**` spec history is exempt by rule, so no shipped feature's REQ/FSPEC is in this feature's blast radius — plus a required RED/GREEN falsifying case. §6 in-scope restated as "the covered set", not a file list. Answers **Q-05**: no, rewriting the seven `docs/orchestrate-dev-workflow/*` files is *not* in scope. |
| F-02 | High | **One manifest path: `<pluginRoot>/workflows/dist/distribution-manifest.json`.** Stated once in AC-0.1 with a paragraph declaring every other occurrence a restatement, and made consistent in AC-0.2, AC-0.3a, AC-5.1, AC-6.1, AC-6.2(d), AC-6.2a and §4. §0 fact 12 extended to state the install transform explicitly: `pdlc/` is dropped, `dist/` survives. Answers **Q-01**. |
| F-03 | High | AC-0.3a rewritten as a **plugin-root substitution** (`<pluginRoot> := <repoRoot>/pdlc`), which moves the manifest source along with the byte baseline — one binding, no second composition rule. New **AC-0.3b** specifies the pre-manifest consumer end to end (all rows `unknown`/`manifest-absent`, hook warns and exits 0, `--check` 3, queue `blocked`), names **plugin update** as the only real remediation and `checkEnabled: false` as the interim escape, and requires the test suite to treat it as a first-class path. AC-4.2 amended so the remediation named can actually fix the reason. Answers **Q-02**. |
| F-04 | Medium | AC-6.1 says it once: **the builder writes `dist/` and nothing else**; `.claude/workflows/` is populated by `sync-workflows.sh`, in the maintainer repo exactly as in any other consumer. Mechanically a retarget of the single `OUT_DIR` at `build-runtime.mjs:29` (§0 fact 13). The in-builder sync and the builder-written sync-manifest entry are **dropped** from AC-0.3a, AC-1.6 and §6. Answers **Q-03**. |
| F-05 | Medium | Follows from F-04: with the builder writing nothing under `.claude/workflows/`, AC-2.7's two-writer list is exhaustive and true. AC-2.7 now says so explicitly and states the maintainer loop (**build → sync → unblocked, in-session**) plus the rule that any future third writer joins the list in the same commit. |
| F-06 | Medium | AC-3.9 gains a two-rule version-control story: (1) a one-time maintainer `git rm` + gitignore of the four tracked `.claude/workflows/*` paths, in scope in §6; (2) sync never runs a VCS command — it backs up, deletes, and **prints a manual action** when the retired path is tracked. AC-3.7's idempotence is caveated accordingly, with the note that a test asserting it against tracked retired paths is testing the git index, not sync. Answers **Q-04**. |
| F-07 | Low | §0 fact 7 restated: the tree is clean at `3dab335`, so this is **committed** drift — the stronger form of the argument. §0 preamble regrounded to `3dab335` / clean tree. |
| F-08 | Low | §0 fact 10 corrected to **15** `*.test.js` files plus `fixtures/` and `helpers/`, with `runtimeBundle.test.js:22-25`/`:77-79` cited. |
| F-09 | Low | (i) AC-2.6's Who is now the shared writer routine, with "never `orchestrate-queue`, which only reads" stated. (ii) AC-0.5 names `repo-root-unresolved` as the reason for a `$HOME`/`/` root, closing AC-1.2's set. (iii) NFR-2 labels its fixture bound a deliberate ~4× headroom margin over AC-0.2's 2 rows. |
| F-10 | Low | AC-5.3 gains a paragraph labelling **both** version lines "not a drift signal", explains why identical `artifactVersion` beside a hash mismatch is correct rather than contradictory, requires the two `sha1`s to be printed as the discriminating evidence, and permits dropping `artifactVersion` from the report entirely. |
| F-11 | Low | Accepted and **routed out of this REQ**: a rule stated in a feature REQ cannot change orchestrator behaviour. Filed against `pdlc/skills/orchestrate-dev/SKILL.md`'s review-loop dispatch, where the index must be derived from the highest `CROSS-REVIEW-{role}-{doc}-v{N}` on the branch. This REQ records the defect (v4 was again dispatched as "iteration 2") but does not attempt to fix it in prose. |

### Test-engineer v4 (2 High / 3 Medium / 4 Low)

| ID | Sev | Resolution |
|---|---|---|
| F-01 | High | Same fix as SE F-02 — one manifest location, `dist/` included, identical in AC-0.1, AC-0.2, AC-0.3a, AC-5.1, AC-6.1, AC-6.2, AC-6.2a and §4. The `manifest-absent` / `manifest-malformed` fixture now has a pinnable path, so the AC-2.4 false-green is closed. Answers **Q-01** jointly with SE Q-01/Q-02. |
| F-02 | High | AC-0.3a restated as **root = `<repoRoot>/pdlc`, `pluginPath` joins unchanged**, with the double-nesting failure named explicitly so it is not re-derived. This is what makes AC-3.3 exit 0 and AC-2.2 silence reachable on real inputs, which was v3 F-17's ask. |
| F-03 | Medium | New **AC-2.8**: retired-present warns, carries the reason token `retired-present`, is textually distinct from all four other warning classes, names each path, and names `sync-workflows.sh` (not `--check`) as the remediation — independent of the managed rows' states. AC-2.2 now lists AC-2.1/2.3/2.5/2.8 as exhaustive over the conditions that break silence, so the "silent `else`" implementation is excluded. |
| F-04 | Medium | AC-6.4's exemption set is now normative and exhaustive — including **the manifest's own `retired` array**, which AC-0.7 requires to contain the superseded string — and the AC mandates a two-directional falsifying case (covered ⇒ RED, exempt ⇒ GREEN) so the test cannot be narrowed into vacuity. |
| F-05 | Medium | `retiredPresent: [paths]` added as a **top-level** field of the drift state file (AC-2.6) — not a `rows` entry, which would break the one-entry-per-manifest-row invariant — always `[]` rather than absent when empty, and AC-4.1 gains a precedence row making a non-empty `retiredPresent` **block**, in the same class as `stale` and matching `--check`'s exit 1. The reasoning (BL-05 unresolved ⇒ the runtime may execute the stale artifact) is recorded in the AC. Still one injected read, so NFR-1 holds. |
| F-06 | Low | AC-1.1's Given reduced to "a manifest row", with a sentence stating why the existence qualifier had to go (three of six states are defined by absence). |
| F-07 | Low | AC-3.4's `id` set is now explicitly the union of managed-row `id`s **and retired basenames**, so retirement backups are inside the retention rule and the newest-5-per-`id` property holds over every file the tool writes. |
| F-08 | Low | §4 gains a `pluginVersion` row: location per baseline, default, owner, and the absent rendering (`unknown` in the report, `null` in the drift state, no effect on any outcome). A `retired paths` row was added alongside it. |
| F-09 | Low | Covered by SE F-06's rule (1): the one-time `git rm` + gitignore is named as a landing step in AC-3.9 and §6, and AC-3.7's caveat makes the fixture's independence from the git index explicit. Answers **Q-02** (bundles become untracked). |
| Q-03 | — | Answered in AC-6.2: build inputs in the packaged set are **tolerated, not asserted away** — harmless consumer-side, already barred from being copied by AC-0.2 — and no "no build input is packaged" converse is required, since it would go red on the current tree and encode a hygiene requirement this REQ does not make. |

### Software-engineer v3

| ID | Sev | Resolution |
|---|---|---|
| F-01 | High | This document. §10 records the delta; the version-bump rule is stated in the header. |
| F-02 | High | REQ-DIST-05 rewritten. `meta.version` abandoned — §0 fact 9 records why the v3 mechanism was backwards. Version stamping moves to builder-emitted manifest data (AC-5.1), so nothing greps a 92 KB bundle and the runtime's pure-literal constraint is untouched. Now in scope explicitly (§6). |
| F-03 | High | AC-0.7 (`retired` array) + AC-3.9 (backup-then-delete, only after the replacement is in place) + BL-05 (which artifact the runtime resolves) + §0 fact 8. The legacy copies are retired, not made permanently `not-managed`. |
| F-04 | High | AC-0.5 inverted: git-toplevel first, upward walk bounded below `$HOME` and `/`, and `$HOME`/`/` rejected as `unknown` regardless of path taken. AC-3.8 restated. No operation writes under `$HOME/.claude/`. |
| F-05 | High | AC-2.7: one shared writer routine invoked by hook, `--check` **and** sync; whole-file atomic replace; last complete write wins. The in-session remediation loop now closes. §4 corrected ("written by hook only" was wrong). |
| F-06 | High | Freshness clause **deleted**, with the reasoning recorded in AC-4.1 so it is not reintroduced. AC-2.7 supersedes it; row 1 (absent/unparseable/schema-mismatch) covers "hook never ran". |
| F-07 | High | §0 fact 10 states there is no CI. AC-3.3, AC-6.2, AC-6.3 re-addressed to `cd pdlc/workflows && npm test`. AC-6.2 becomes a pre-release packaging oracle running on every commit; AC-6.2a is the post-install smoke check. Hosted CI deferred as D-DIST-06, bound to queue row 7. |
| F-08 | Medium | AC-6.1: `pdlc/workflows/dist/` is the sole build output; `.claude/workflows/*.bundle.js` become sync targets with sync-manifest entries. One authoritative generated tree, so "which is canonical / what if they diverge" no longer arises. |
| F-09 | Medium | AC-0.3a: the maintainer repo's baseline is local `dist/`, not the released cache, detected by the presence of `build-runtime.mjs`; the builder writes the sync manifest. Rationale spelled out in the AC. |
| F-10 | Medium | AC-4.3 rewritten: the shell writer resolves `checkEnabled` into the drift state file; the queue keeps exactly one injected read. NFR-1 intact. |
| F-11 | Medium | NFR-5 rewritten to bash (§0 fact 11). JSON tool added to §4 with location, default, owner and absence behaviour, mandating reuse of the sibling scripts' interpreter-discovery loop. |
| F-12 | Medium | Semver ordering removed — AC-5.2 compares versions for equality only, and §4 states no comparator is declared because none is needed. AC-3.4 pins the backup stamp format, the `LC_ALL=C` lexicographic prune rule, the collision suffix, and an explicit prohibition on mtime. |
| F-13 | Low | §1 now shows two diagrams — today's measured state (A′ at `.claude/workflows/`, tracked) and the post-REQ state (A′ at `dist/`). |
| F-14 | Low | AC-6.4 restated as the invariant "no document contradicts the manifest", grep-asserted, with the list re-derived at `7534d11`. |
| F-15 | Low | (i) `id` charset constrained in AC-0.1 and §4. (ii) AC-1.8 scoped to one manifest row over six states; `not-managed` moved out of the codomain (AC-0.6), so totality is satisfiable. |
| F-16 | Low | Iteration-index guard stated above. |

### Test-engineer v3

| ID | Sev | Resolution |
|---|---|---|
| F-14 | High | Absent/unreadable `pluginPath` now maps to `unknown` with reason `plugin-artifact-missing` (AC-1.2), with defined exit code, queue outcome and copy-loop behaviour (AC-3.1). AC-1.8(i)'s axes rewritten to match, and the state count corrected to six. |
| F-15 | High | Same as SE F-06 — clause deleted, replaced by AC-2.7's always-refresh contract and the absent/unparseable row. |
| F-16 | Medium | AC-0.1 narrowed to "sole authority for the **managed set**"; AC-0.6 makes the consumer directory enumerated for the human report only, excludes `.pdlc-*`, and bars `not-managed` from the drift state `rows` array — so no oracle is self-referential. |
| F-17 | Medium | AC-0.3a makes the maintainer repo's green path reachable on real inputs, which is what makes AC-3.3 exit 0 and AC-2.2 silence testable. |
| F-18 | Medium | AC-2.7 single writer contract; §4 corrected. `--force` sync refreshes drift state, so no false-block survives the operation that fixed it. |
| F-19 | Medium | AC-6.2 is the pre-release, in-`npm test` oracle over the packaged file set; BL-02 re-gated on it rather than on an installed release. |
| F-20 | Low | AC-1.1 names `consumerHash` explicitly in both rows, with a paragraph stating it is the single discriminator and `pluginHash` is reporting-only. |
| F-21 | Low | Obsolete under the AC-5.1 rewrite — nothing is extracted from a bundle. |
| F-22 | Low | §0/§1 aligned; §0 row A′ labelled with its tracked, pre-feature path. |
| F-23 | Medium | Version-bump and iteration-index guards stated above. |
| Q-04 | — | Answered inline under AC-3.3: the `unverified` asymmetry is deliberate and the reasoning is recorded. |
