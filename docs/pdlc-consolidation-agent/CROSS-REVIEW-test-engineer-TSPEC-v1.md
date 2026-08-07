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

## Questions

_(filled below)_

## Positive Observations

_(filled below)_

## Recommendation

_(filled below)_
