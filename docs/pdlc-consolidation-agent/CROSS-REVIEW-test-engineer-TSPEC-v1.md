# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/TSPEC-pdlc-consolidation-agent.md` (v1.0)
**Date:** 2026-08-06
**Iteration:** 1
**Scope:** Testing lens only — testability, oracle falsifiability, test-double leakage, level
assignment, property coverage, completeness of the traceability map. Not architecture, not product.
Standing decisions applied: `DEC-LAYER-01` (`docs/_decisions/DECISIONS-spec-layer-boundary.md`) —
fixtures and set-equality domains are PROPERTIES', so their absence here is not a finding;
`DEC-SEV-02` (`docs/_decisions/DECISIONS-review-severity-bars.md:40-54`) — a falsified
bookkeeping-completeness assertion with no downstream observable is Low. Every citation below was
re-verified against the file at HEAD, never against the TSPEC's prose.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | `_listFiles` cannot see subdirectories, so `enumerateCorpus` cannot run — and the test double hides it | §7.1, §5.1 |
| F-02 | High | Local | `_listFiles`'s return type is mis-stated as `Promise<string[]>`; the real four-member failure union has no row in the §10.3 table | §5.1, §10.3 |
| F-03 | High | Local | Writing inside the temp clone is asserted to need "no new capability"; the shipped `_writeFile` transport is repo-root-relative, and §11.6 exempts it from test | §9.2, §11.6 |
| F-04 | High | Local | §12.3 maps ATs by range, which cannot express the FSPEC's suffixed ids: AT-C1b, AT-Q7b and AT-Q7c are assigned to no file (91 of 94) | §12.3 |
| F-05 | High | Local | AT-P7 — T-08's sole falsifier — has no obtainable oracle: the hook emits a count, not a set, and emits nothing below its threshold | §7.1, §11.1, §11.3 |
| F-06 | Medium | Local | The `await` audit is a frozen name list; the two seams this feature invents are not on it and §11.3(c) does not add them | §11.3(c) |
| F-07 | Medium | Local | `takeMarker` has no read-back, and `_writeFile` reports nothing — a failed marker take is unobservable and absent from §10.3 | §7.3, §10.3 |
| F-08 | Medium | Local | §9.3 folds `read-remote` into `read-object`, which is the mis-classification §13.1 row 9 says it rejected | §9.3, §13.1 |
| F-09 | Medium | Local | The AT-Q7 spy re-implements the domain half of the classifier, and the `clone` call defeats the argv-prefix rule the spy would use | §9.3, §11.3(a) |
| F-10 | Medium | Local | T-07's falsifier is a maintainer check, not a test; the `.gitignore` text can drift green | §12.2, §3.3 |
| F-11 | Medium | Local | §11.4's two determinism properties are invariance-only oracles — a constant function satisfies them | §11.4 |
| F-12 | Medium | Cross-Feature | §11.3(b) compares the module's catalogues against a hand-copied transcription of the vocabularies file, never against the file — the oracle can drift with the module | §11.3(b) |
| F-13 | Low | Local | `_now` is listed as a `runtime-adapter.js` seam; the adapter supplies none, and the resulting calendar is the workflow host's | §5.1, §7.2 |
| F-14 | Low | Local | §3.3's justification rests on a `.consolidation-lock` fixture §11 never says it creates | §3.3, §11.2 |
| F-15 | Low | Local | The resolver's doc comment is cited as `:1819-1826`; it begins at `:1820` | §8.1 |

### F-01 — `_listFiles` cannot see subdirectories (High)

§7.1: "`enumerateCorpus` issues exactly two directory walks — `docs/*` and `docs/completed/*` —
through `_listFiles`, filters each child directory's entries by `/^LEARNINGS-.*\.md$/`".

At HEAD the seam cannot do this. `rtListFiles` (`pdlc/workflows/runtime-adapter.js:905`) transports

```
ls -p -A "${d}" | grep -v '/$'
```

(`runtime-adapter.js:913`) — `-p` appends `/` to directory names and the `grep -v` **deletes every
one of them**. The reply validator then rejects any line carrying a separator at all
(`runtime-adapter.js:925-929`: `if (!lines.every((l) => !/[\/\s]/.test(l) …)) return {ok:false,
reason:"unreadable"}`). So `_listFiles("docs")` returns the *files* directly under `docs/` and no
subdirectory names, and there is no other listing seam in the adapter (`_glob`, `_listDir`,
`_findFiles` — none exist). The feature subdirectories are therefore undiscoverable and
`enumerateCorpus` finds zero `LEARNINGS-*.md` in production, on every run.

The reason this is a *testing* finding and not only a mechanism one: **nothing in §11 can catch it.**
Every L1/L2 test drives `fakeListFiles` (§11.2), whose map form returns whatever the spec supplies
for a given `dirPath` (`__tests__/helpers/seams.js:132-166`) — including subdirectory names the real
seam structurally cannot emit. That is a leaky double: the fake models a capability the production
seam does not have, so the whole CONS-02 suite goes green against a corpus that is always empty in
production. This is the DC-07 "production path ≠ unit path" failure in its purest form.

**Required:** state the enumeration mechanism against the seam that exists — a `_git(["ls-files",
"--", "docs/*/LEARNINGS-*.md", "docs/completed/*/LEARNINGS-*.md"])` read (a `read-object`-class
non-mutating read §9.3 already widens for) is one candidate, and unlike `_listFiles` it returns
repo-root-relative *paths*, which is what `CorpusFile.path` needs anyway. Whatever is chosen, §11
must carry one test that pins the seam's own reply grammar (the sentinel set and the no-separator
rule), so the double cannot be more capable than the adapter.

### F-02 — `_listFiles`'s contract is open where the seam is closed (High)

§5.1 declares `_listFiles(dirPath): Promise<string[]>`. The seam returns
`{ok: true, files: string[]} | {ok: false, reason}` with `reason` drawn from a **closed four-member
set** — `dir_missing`, `not_a_directory`, `unreadable`, `bad_argument`
(`runtime-adapter.js:905-931`; the same set is frozen for the doubles as `LIST_FAILURE_VALUES`,
`__tests__/helpers/seams.js:58-63`).

Two consequences, both testable and both currently unspecified:

1. §10.3's twenty-row failure table has **no row** for a corpus listing failure. Row 1 covers the
   log being absent or unreadable; row 15 covers `ESCALATIONS.md` and correctly reasons that
   `null` must not be read as "empty" because "the two codes make different claims" (§7.7). The
   corpus enumeration gets neither treatment: an unreadable `docs/` would fall through as an empty
   corpus and terminate `no-op`, indistinguishable from a genuinely empty one. That is the same
   defect §7.7 explicitly refuses to commit, committed one section earlier.
2. An implementation reading `{ok:false,…}` as a truthy value and iterating it yields zero files
   with no error — so the bug is silent, and no absence-only assertion (`corpus is empty`) can tell
   the two apart. Any AT here needs the three positive conjuncts the review standard requires:
   exact terminal status, the named reason code, and the report-body notice that says which
   directory could not be listed.

**Required:** transcribe the real union into §5.1, add a §10.3 row per failure class (or one row
naming the closed set), and name the reason code the pass records. DC-01 obliges the closed/total
form on both sides.

### F-03 — the clone's writes rest on an untested and contradicted capability (High)

§9.2: "Writing a file **inside the clone** uses the same `_writeFile` seam with a path under `dir`;
the seam is path-addressed, so no new capability is needed."

`rtWriteFile` (`runtime-adapter.js:802-813`) dispatches the prompt

> `Write the following content to "${path}", relative to the repository root, replacing the file's
> current contents exactly.`

`dir` comes from `mktemp -d` (§5.3) and is an absolute path **outside** the repository. The seam's
own instruction says the opposite of what §9.2 needs, and `rtReadFile` (`:493`) is framed the same
way. Three things depend on this working: the guard-set edit committed in the clone (§9.2 row 2),
the PR body file, and with it the entire `--body-file` mechanism §9.2 calls "deliberate and
load-bearing for NFR-2/§7.4".

And §11.6 exempts exactly this from test — "The real `gh` and the real network … every PR-route test
drives `fakeGhRun`" — so the whole PR route is proven against doubles that accept any path. The
result is an AC-3.1/NFR-2 chain with no production-path evidence anywhere in the strategy.

**Required:** either (a) state the widened `_writeFile`/`_readFile` contract explicitly (absolute
paths permitted, prompt text amended, and an adapter-level assertion listed in §11 alongside the
`_envPresent` prompt review), or (b) route the clone's writes through `_git`/a heredoc in the clone
domain, which §9.3 already classifies. Either way §11.6's exemption list must stop covering it: a
capability the feature invents is not in the same class as "the real `gh` accepts these flags".

### F-04 — the AT map is containment, not set-equality (High)

§12.3 assigns acceptance tests to files by **range**: `AT-C1 … AT-C8`, `AT-Q1 … AT-Q12`,
`AT-M1 … AT-M6b`, and so on. Range notation cannot express the suffixed ids the FSPEC actually
carries. Enumerating the FSPEC gives 94 distinct ids; §12.3's ranges cover 91. The three with no
home are **AT-C1b**, **AT-Q7b** and **AT-Q7c** — and §11.3(a) names AT-Q7b and AT-Q7c by hand two
sections earlier as the ones needing the seam-verb spy, so the document knows they exist and still
gives them no file.

This is not a bookkeeping assertion in the DEC-SEV-02 sense: §12.3 is a **downstream observable**.
The TSPEC's own §13.3 hands the PLAN a file-ownership manifest keyed on these files, and §12.3 is
what tells the PLAN which ATs a task owes. An AT with no file is an AT the PLAN will not name and
the implementation will not write, and nothing goes red.

**Required:** replace the ranges with an explicit enumeration (or a stated set-equality assertion
against the FSPEC's AT register that a test can run), so that adding or deleting an AT upstream
fails this table rather than passing it.

### F-05 — AT-P7's oracle is unobtainable through the hook's interface (High)

T-08 is decided in favour of **two implementations** (§7.1, §13.1 row 6), and the entire weight of
that decision rests on one test: "the two are therefore written separately to one stated algorithm
and pinned by AT-P7's differential harness, which runs both over one fixture table and asserts set
equality (§11.3)."

Two problems, and the second is fatal to the decision as argued:

1. **§11.3 does not specify AT-P7.** §11.3 says "Four assertions … are specified here" and names
   (a) the seam-verb spy, (b) the vocabulary set-equality, (c) the `await` audit, (d) the
   `parseAdvisoryConfig` parity test. AT-P7 is not among them. §7.1 forwards the reader to a
   mechanism that is not there — and §11.1's L4 row describes only *where* the harness runs and how
   it degrades, never what it asserts.
2. **The hook cannot emit a set.** `nudge-consolidation.sh` prints one JSON object whose
   `additionalContext` is a prose message carrying a **count** (`:44-48`), and it prints it only
   when `n >= THRESHOLD` with `THRESHOLD = 5` (`:25`, `:43`); below five it prints nothing and exits
   0 (`:49`). So set equality against the shipped hook is not observable at all, and even count
   equality is blind for every fixture with fewer than five pending files — which is every
   discriminating fixture §7.1 introduces: the truncated block (E-04), the stray closer (E-05), the
   basename collision (E-09), the legacy/block boundary. A harness that can only compare counts
   above five would pass unchanged if the hook's two-region logic were deleted entirely.

**Required:** state AT-P7's oracle. If the harness is to assert set equality it must observe the
set, which means the hook's edit (§7.1's "minimal and mechanical") has to expose one — e.g. an
opt-in env-gated debug line listing pending basenames, itself asserted. If that is refused, then
T-08's "held equal by a differential test" is not true and the decision must be re-argued on the
evidence a count-above-threshold oracle can actually supply.

### F-06 — the `await` audit exempts the two new seams (Medium)

§11.3(c) names the compensating control for the sync-double/async-adapter hazard: "the shipped one —
the L3 suite's source scan, extended to `consolidate-learnings.js`: every call to an injected seam
identifier must be syntactically `await`ed."

The scan is real (`__tests__/runtimeBundle.test.js:626`, `RLH-SCAN-01`; sources at `:1040`,
`AWAIT_SCAN_SOURCES = ["orchestrate-dev.js", "orchestrate-queue.js"]`). But what it scans *for* is a
frozen name list, `AT19_SEAM_NAMES` (`:215-223`): `_agent`, `_readFile`, `_writeFile`, `_appendFile`,
`_checkFile`, `_listFiles`, `_git`, `_checkCi`, `_mergeWorktree`, `_recordQueueRow`,
`_rebaseOntoDefault`, `_dodVerifyLoop`, `_raisePrAndVerifyCi`, `_ghRun`, `_runCommand`.
`_envPresent` and `_makeTempDir` are not on it, and §11.3(c) says only to extend the *source* set.

So the two seams this feature invents are precisely the two the audit will not check, and the scan
reports green. §5.1's "Every seam call is `await`ed without exception" would then be enforced for
every seam except the new ones. `_now` is likewise absent, though it is sync by contract and the
omission is harmless there.

**Required:** §11.3(c) must state that `AT19_SEAM_NAMES` gains `_envPresent` and `_makeTempDir`
alongside the source-set extension, and §11.1's L3 row should say the audit is a set over both axes.

### F-07 — `takeMarker` has no read-back, and the write reports nothing (Medium)

§7.3: "Take is `_readFile` then `_writeFile` — **read-then-write, not atomic**." The document prices
the *race* honestly (§10.4 item 1) but not the *write failure*. `rtWriteFile`
(`runtime-adapter.js:802-813`) awaits an agent dispatch and returns `undefined`; it inspects no
reply and surfaces no error. A marker write that does not land is therefore indistinguishable, in
the module, from one that does — and the pass proceeds through all sixteen steps believing it holds
the lock.

§10.3 rows 4 and 5 cover an *unparseable* and a *held* marker; there is no row for a take that
failed. AC-1.3's whole guarantee is that one pass at a time writes, and the only mechanism defending
it is a write whose success is unobserved.

**Required:** either a read-back conjunct in `takeMarker` (write, then `_readFile` and confirm the
parsed `passId` is this pass's) plus a §10.3 row and an AT, or an explicit statement in §10.4 that
this exposure is accepted, with the blast radius argued as §10.4 item 1 argues the race. As written
it is neither handled nor declared. Any AT here must be positive on both sides: the terminal status
*and* the marker's post-condition on disk, never "no second pass ran".

### F-08 — §9.3's `read-remote` fold contradicts §13.1 row 9 (Medium)

§13.1 row 9 records the decision as "Widen two §6.5 permitted sets (`read-auth`, `read-object`)
**rather than mis-classify into an existing verb**", rejecting "fold `gh auth status` and
`git cat-file -e` into `read-pr` / `read-status`". §9.3 then does the rejected thing to a third
call: "`git remote get-url origin` (§9.1 step 2) resolves to `read-remote`, which this layer folds
into `read-object` rather than adding a third verb", justified as "easier for a test author to
transcribe exactly".

Reading remote configuration is not reading the object database, and the stated reason is test
convenience — which is the weakest possible ground for widening a set whose entire purpose is to
make AT-Q7's containment assertion mean something. The cost is concrete: `resolveSeamVerb` becomes
lossy at the boundary, and an implementation that started issuing `git remote add` (or any other
`remote` subcommand a future edit reaches for) would classify as the already-permitted `read-object`
and pass containment.

**Required:** add `read-remote` as the third widened verb, or state why the two calls are the same
kind of read in a way that does not appeal to transcription cost. Either way §13.1 row 9's text must
stop asserting the opposite of §9.3.

### F-09 — the AT-Q7 spy re-implements the domain half, and `clone` defeats its rule (Medium)

§9.3 closes: "The classifier is a small exported pure function, `resolveSeamVerb(domain,
argvOrCommand)`, so the spy in §11.3 reads the contract's own classification rather than
re-implementing it."

It does not, on either count:

1. `domain` is an **input** to `resolveSeamVerb`, so the module classifies the verb but never the
   domain. §11.3(a) confirms the spy computes the domain itself — "bins it by domain, using the
   clone directory the test's `fakeMakeTempDir` returned as the discriminator". Half the contract
   is re-implemented in test code, which is the exact failure mode §9.3 says it avoided.
2. The discriminator does not cover the whole set. §9.3's rule is "`_git` whose argv begins
   `["-C", cloneDir]`, **plus the `clone` call itself**" — and the clone call is
   `_git(["clone", "--depth", "1", "--single-branch", remote, dir])` (§9.1 step 3), which carries no
   `-C` prefix. The spy therefore needs a hand-written special case for the one call that
   establishes the domain, and a special case in a test is a place where a mis-binned call can hide:
   binned into the invoking-tree domain, `clone` is not in that domain's permitted set and AT-Q7
   would go red for the wrong reason; binned nowhere, it disappears from both assertions.

**Required:** export the domain classifier too (`resolveSeamDomain(argvOrCommand, cloneDir)`), have
it return the clone domain for the `clone` call by name, and have §11.3(a) state that the spy calls
both. Then add the fourth assertion the current three lack: **every observed call is classified into
exactly one domain** — without it, a call that falls out of the partition is silently exempt from
containment, which is AT-Q7's whole subject.

### F-10 — T-07's falsifier is a maintainer check (Medium)

§12.2 discharges T-07 — the `.gitignore` text the FSPEC obliged to be exact — with "AT-M5's
accompanying maintainer check". A maintainer check is a human step; nothing goes red if the pattern
is later rewritten slash-free or `**/`-prefixed, which is the precise failure §3.3 spends a
paragraph arguing against.

The assertion is trivially automatable and the repo already does this class of thing (the tracked
`.gitignore`'s own anchoring comment records a measured claim, and `runtimeBundle.test.js` asserts
over source text at `:1573-1580`). One jest case reading `.gitignore` and asserting the comment line
and the pattern line verbatim closes it.

**Required:** name an automated test for T-07 in §12.2, or state in §11.6 that the `.gitignore` text
is deliberately unfalsified and why.

### F-11 — the two extra properties are invariance-only oracles (Medium)

§11.4's four T-09 strategies are well formed — each pairs a generator with an invariant that has a
positive conjunct (`invalidKeys` set-equal to the corrupted subset; the minted id strictly greater
than every parseable one; the attributed count equal to the number of complete entries). The two
added at the end of §11.4 are not:

> `failureModeId` is invariant under the *order* of two proposals that merge (§7.4), and
> `effectivenessTable` is invariant under the order in which two passes' records were appended when
> their dates are unchanged (§7.5).

Order-invariance alone is an unfalsifiable shape: a function returning a constant, an empty array, or
`null` satisfies both. These are the FSPEC's determinism claims, so they are worth having — but each
needs a paired positive conjunct on the same path: for `mergeProposals`, the folded proposal's
`kind`, `artifact`, `target`, `elidedKinds` and `elidedArtifacts` asserted against values transcribed
literally from §7.4's fold table for at least one ordering; for `effectivenessTable`, the row count
and each row's `verdict` asserted against §7.5's arms. Note also that §7.4's stated invariance
argument ("byte order is total over distinct strings, and a group's members are distinct by
construction") makes the *merge* order-invariant, not `failureModeId`, which takes no proposals at
all — the property as written names the wrong function.

**Required:** restate both properties with a positive conjunct, and fix the subject of the first.

### F-12 — the vocabulary oracle compares two copies, never the source (Medium, Cross-Feature)

§11.3(b): the harness "compares them against a transcription of vocabularies §1 at `Version` 1.4
held in `consolidationDoubles.js` as a literal table", and the third assertion compares §6.4's frozen
catalogues against that same transcription.

I verified the transcription in §6.1 is correct today — all twelve reason codes, six terminal
statuses, four routes and the thirteen-member phase catalogue are set-equal to
`docs/_constraints/pdlc-consolidation-vocabularies.md:38-65` at `Version` 1.4, in both directions.
That is the positive half, and it is why this is Medium rather than High.

The oracle nevertheless cannot detect drift in the direction that matters. Both operands are copies:
the module's frozen arrays and the doubles' literal table. If a future edit widens the module's
catalogue and the author updates the doubles' table in the same commit — the natural thing to do when
a test goes red — both assertions pass and the vocabularies file, which is the authority and is
version-pinned and change-controlled, is never consulted. §6's premise is "transcribed from
`pdlc-consolidation-vocabularies.md` §1 at `Version` 1.4 — **transcribed, never widened**", and no
test in §11 reads that file.

This is `Cross-Feature`: the same shape recurs for every feature that transcribes a project-level
shared reference, and the fix is reusable — parse the authority file's §1 table in the test (it is a
markdown table with a stable grammar, and DC-04 already obliges the oracle to be a pure function of
an injected root) and assert three-way set equality: catalogue ≡ transcription ≡ authority, plus an
assertion that the file's `Version` cell still reads `1.4`.

**Required:** add the authority-file leg to §11.3(b), including the `Version` pin.

### F-13 — `_now` is not a `runtime-adapter.js` seam (Low)

§5.1 groups `_now(): number` under "existing seams, contracts unchanged from `runtime-adapter.js`".
The adapter supplies no `_now`: `rtDevInjections` (`runtime-adapter.js:1086-1110`) lists `_agent`,
`_parallel`, `_pipeline`, `_phase`, `_log`, `_checkFile`, `_readFile`, `_hashFile`, `_checkCi`,
`_mergeWorktree`, `_writeFile`, `_appendFile`, `_listFiles`, `_git`, `_ghRun`, `_runCommand` and the
probe seams — no clock. The shipped pattern is a module-level default (`orchestrate-dev.js:1396`,
`_now = () => Date.now()`), which is what §5.5's row actually describes.

Worth fixing because §7.2 leans on it: "`today` is derived from `_now()` in the invoking
environment's local calendar". With no adapter seam, the calendar is the **workflow host process's**
timezone, not the operator's — which is a real observable for `mintPassId`'s `{YYYY-MM-DD}-{n}` and
for `cadenceDatum`'s comparisons near midnight. Say which it is, so a test author knows whether to
pin `TZ`.

### F-14 — §3.3's justification names a fixture §11 does not create (Low)

§3.3 argues the pattern must contain a separator because a slash-free form "would silently swallow a
fixture of the same name under `pdlc/workflows/__tests__/fixtures/` — which §11 does create." §11.2
enumerates this feature's fixture builders as a log builder, a corpus builder and an
`ESCALATIONS.md` builder; no `.consolidation-lock` fixture is named in §11, §12 or §13. The
conclusion is right on gitignore(5) grounds alone (and the shipped `/.claude/workflows/` entry's
comment block, verified as the last block of `.gitignore` at HEAD, does document anchoring) — the
supporting premise is the part that is not true. Per DEC-SEV-02 this is a bookkeeping claim with no
downstream observable, so: Low, and the preferred repair is deleting the clause.

### F-15 — off-by-one on the doc-comment citation (Low)

§8.1 point 4 cites `resolveAdvisoryRung`'s doc comment as `:1819-1826`. The "Deliberately NOT
`async`" block runs `orchestrate-dev.js:1820-1826`; `:1819` is the preceding blank comment line. The
substance of the claim is correct — I re-read `:1820-1826` and the hop-count argument is exactly as
described, and `:1833-1874` confirms the `.then` chain, the memoised path at `:1844-1849` and the two
rungs at `:1851`/`:1861`.

## Questions

| ID | Question |
|----|---------|
| Q-01 | §11.1's L4 row says the differential harness is "skipped with a recorded notice when no usable Python interpreter is found". Where is the notice recorded, and what asserts that a *skipped* L4 run is distinguishable from a passing one? A silently-skipped differential test is the one that will be skipped in CI on the platform where it matters. |
| Q-02 | §8.3 says `--check` "will report the new row as `missing` until the first sync, which is the designed signal, not a regression". `orchestrate-queue`'s drift gate refuses the whole invocation on a row that is `missing` (per the repo's queue contract). Does landing this feature therefore block the queue until an operator syncs, and is that stated anywhere a queue operator will read it? |
| Q-03 | §7.9 says `renderTerminalRow` returns the codes it dropped as illegal-with-this-status, and §6.4 says the renderer "drops the code and emits a notice". Which AT asserts a **dropped** code — i.e. what fixture produces a legal `(status, code)` pair on one run and an illegal one on another, so that the drop is observed rather than assumed? §12.3 assigns AT-L1…AT-L5 and AT-N1…AT-N4 to `consolidationReport.test.js` without naming this arm. |
| Q-04 | §11.2 asserts "Two new factories only", reusing `fakeGhRun`. I checked `matchKey` (`__tests__/helpers/mergeDoubles.js:45-60`) and both new surfaces do key cleanly (`gh pr list --json url,state,body`; `gh pr create`), so the claim holds — but `passingGh`'s defaults (`:93+`) cover only the six shipped surfaces. Do the consolidation tests build their own map, and is `GH_SURFACE_NAMES` (`:181`) expected to grow? |

## Positive Observations

- **The citations are unusually reliable.** I spot-checked roughly forty `file:line` references and
  found one off-by-one (F-15). `resolveAdvisoryRung` at `:1833`, `ADVISORY_RUNG_SKILL` at `:1797`,
  `dispatchAt` at `:1840-1842`, the memoised path at `:1844-1849`, `MERGE_GUARD_DEFAULTS` at `:48-53`,
  `ADVISORY_SEAMS` at `:1669`, `commitPaths`'s pathspec-free commit at `:8690`, `gitWithLockRetry`'s
  module-private declaration at `:8617`, `renderEscalationEntry`'s `| Feature |` / `| Seam |` rows at
  `:2782-2783` against the em-dash heading at `:2776`, `commitQueueRow`'s two-call form at
  `orchestrate-queue.js:1576-1585`, `build-runtime.mjs`'s `devModule` export list at `:87-105` and the
  queue prelude at `:113-122` — all correct, including the claim that `MERGE_GUARD_DEFAULTS`,
  `mergeCommandFor` and `gitWithLockRetry` are absent from that export list and must be added.
- **§6's vocabulary transcription is set-equal to the authority in both directions** (see F-12 for
  the oracle gap, not the data). Twelve reason codes, six statuses, four routes, thirteen phases,
  three credentials, three verdicts, two promo states — every one has a row in
  `pdlc-consolidation-vocabularies.md` §1 at the pinned `Version` 1.4, and §1 has no row the TSPEC
  omits. §12.4's three declared gaps (`rung:`, the §2.6 row-4 code, `suppressed-by:`'s grammar) are
  the FSPEC's errata and are correctly left unpatched.
- **`enactedByLog`'s inverted arm is expressed in the return type, not in a caller's conditional**
  (§7.6). "A record short of only `passId` **still enacts** … and returns `{enacted: true,
  passId: null}`" is exactly the right place to put an exception to a general rule — no caller can
  get it wrong, and the `null` forces §6.5's literal at the render site rather than allowing
  `pass:undefined`. This is the kind of decomposition that makes an oracle writable.
- **The `_log` tee (§8.4)** solves a genuinely hard capture problem without swallowing operator
  output, and pushing the `dispatch-error` message onto the same buffer means AT-M6/AT-M7/AT-M9 read
  one surface rather than three.
- **The boolean-only credential seam (§5.3, §13.1 row 1)** makes NFR-2 structural instead of
  reviewed — there is no code path on which the value is a JS string. Combined with `--body-file`
  over `--body` (§9.2) this is the strongest part of the document.
- **§4.1's pure-function decomposition is stated for the right reason** — "only assertable if the
  decision is reachable without standing up a pass" — and §7's per-function purity/totality
  annotations make the L1 level mechanically checkable rather than aspirational.
- **§10.3's twenty-row failure table** is the shape a test author wants: mechanism *and* observable
  per row. F-02 and F-07 are gaps in it, not objections to it.

## Recommendation

**Needs revision**

Five High and seven Medium findings are open. The blocking set, in the order I would fix it:

1. **F-01 / F-02** — the corpus cannot be enumerated with the seam the document names, and the fake
   that hides it is the one every CONS-02 test uses. Nothing else in the feature matters until the
   enumeration mechanism is stated against a seam that exists, with its closed failure union
   represented in §10.3.
2. **F-03** — the PR route's writes depend on a capability the shipped adapter's own prompt
   contradicts, and §11.6 exempts it from test.
3. **F-05** — T-08's decision rests on a test whose oracle is unobtainable through the hook's
   interface; either the hook exposes a set or the decision is re-argued.
4. **F-04** — three of the FSPEC's ATs are assigned to no file, and the range notation guarantees
   the next suffixed AT will be too.
5. **F-06 … F-12** — each is a specific, bounded repair to a named oracle.

The document is well built and the mechanism-per-observable discipline is real; the findings are
concentrated in the seams the feature invents and in the places where an oracle was named but not
specified.

## Verdict

VERDICT: Needs revision
{"high": 5, "medium": 7, "low": 3}

