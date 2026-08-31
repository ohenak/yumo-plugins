# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-stats/TSPEC-pdlc-stats.md` (v1.1)
**Date:** 2026-08-31
**Iteration:** 2
**Scope:** product lens — requirements traceability, scope compliance, acceptance-criteria fidelity
**Delta base:** `6bc0f0931` (the commit my v1 was written against) → `HEAD`; nine TSPEC commits,
+352/−37 lines, touching §3.3, §3.4, §4.1, §4.2.1 (new), §4.3, §4.4, §6.1, §6.2, §6.3, §6.4, §6.5,
§6.6, §7.1, §8.2, §8.3, §8.4. Sections unchanged by the delta — §1, §2, §3.1–§3.2, §3.5, §5, §7.2 —
were approved in v1 and are not re-litigated here.

## Prior findings — disposition

| v1 finding | Disposition | Evidence |
|---|---|---|
| F-01 High — `schemaVersion` absent from the design | **Resolved.** New §4.2.1 declares `const SCHEMA_VERSION = 1`, states it as a `renderJson` obligation rather than a `StatsReport` field (with the reason: keeping a JSON-only concern out of the value the human renderer also reads), hoists it identically into all three documents per BR-30, and §6.3 carries a `=== 1` conjunct. §7.1 gives BR-24 its own row. | §4.2.1, §6.3, §7.1 |
| F-02 High — JSON top-level key sets never stated | **Resolved, and correctly transcribed.** §4.2.1's `SingleDocument`/`FleetDocument`/`ErrorDocument` types and its four-row key-set table are byte-faithful to FSPEC BR-21 ("exactly five top-level keys: `schemaVersion`, `reviewRounds`, `dodRounds`, `halts`, `byteRatio`"), BR-23 and BR-30 ("`error` is an object with exactly `reason` and `message`"; `feature` `null` on a fleet-mode root failure). I checked all three against the FSPEC's own sentences rather than against the TSPEC's summary. The projection-not-serialisation framing is the right one: it names `FeatureStats.feature` and `.dir` as the two keys that must not reach the wire. | §4.2.1 vs FSPEC BR-21/BR-23/BR-30 |
| F-03 High — `NON_FEATURE_DIRS` never asserted set-equal | **Resolved.** §6.4 adds a fifth oracle with a superset half and a subset half, and maps AT-19's set-equality leg onto it explicitly. I ran the oracle by hand: all eight names are present as directories at `docs/`, and every other directory at that root (thirteen feature directories, `orchestrate-dev-workflow` through `pdlc-two-axis-dod`) satisfies the artifact-naming witness. The oracle is green today and would go red on a ninth. | §6.4 |
| F-04 High — catalogue oracle probed an invalid role slug | **Resolved, and over-delivered.** The probe now spells `CROSS-REVIEW-software-engineer-{T}-v1.md`; `parseReviewFilename` validates against `REVIEWER_ROLE_SLUGS = Object.freeze(Object.values(MAP))` (`pdlc/workflows/orchestrate-dev.js:10044`) and returns `bad_role` before the doc-type check (`:10143`), so the old probe would indeed have been red-for-the-wrong-reason. The oracle also became set-equality over a probed candidate set, which closes the seventh-accepted-type hole RK-3 names. | §6.4, `orchestrate-dev.js:10037-10044`, `:10142-10144` |
| F-05 Medium — BR-11 misquoted | **Resolved.** §4.3 now cites REQ-STATS-04 for the grammar-matching reading, states BR-11's looser wording, names the directory shapes on which the two disagree, and routes the divergence as an FSPEC erratum in §8.3. | §4.3, §8.3 |
| F-06 Medium — BR-16 reading taken silently | **Resolved.** §4.3 states the grammatical reading, grounds it on REQ C-4's "every file matching the documented … grammars", names `docs/completed/pdlc-advisory-wave-gate/`'s four out-of-catalogue files as the shape that discriminates, pins a fixture on the boundary, and routes the ambiguity as an FSPEC erratum. | §4.3, §8.3 |
| F-07 Medium — discovery predicate shipped as settled | **Resolved.** §4.4 marks the predicate provisional, separates it from the non-provisional `NON_FEATURE_DIRS`, and tabulates the observable each possible FSPEC answer implies with its blast radius. RK-5 is updated to match. | §4.4, §8.2 |
| F-08 Low — §7.1 collapsed BR-21…BR-24 | **Resolved.** BR-21, BR-22, BR-23, BR-24, BR-25, BR-26 and BR-30 each have their own row, each pointing at a named contract and a named oracle. | §7.1 |

No prior finding is open.

## Findings

Three, all introduced by this round's edit, all Medium. None gates.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | **§6.5's scratch-prefix exclusion narrows AT-21's FSPEC-fixed *Given*, and the deviation is not routed upstream.** FSPEC AT-21 fixes the snapshot as "every path under the repository root except `.git/`", and D-1 decides that scope explicitly ("It spans every path under the repository root except `.git/` — untracked paths included"). §6.5 now skips `.git/`, `node_modules/` **and** any segment matching a declared scratch prefix (`.tmp-*`). The flake is real and I verified it — `learningsCaptureScript.test.js` does `mkdtempSync(path.join(SCRATCH_ROOT, ".tmp-capture-driver-"))` with `SCRATCH_ROOT = path.resolve(__dirname, "..")`, i.e. inside `pdlc/workflows/`, and `pdlc/workflows/package.json`'s `test` script runs jest with no `--runInBand` while only `test:coverage` serialises — so the engineering judgement is sound. What is not sound is the paperwork: §6.5 asserts "AT-21/AT-22 are FSPEC-fixed, so their assertion is not narrowed; the *snapshot* is scoped instead", but scoping the snapshot **is** narrowing the observable — a write under a `.tmp-*` path would now go undetected — and §8.3 routes three FSPEC errata, none of them this one. REQ-STATS-08's read-only guarantee is P0; a change to the scope of its only behavioural oracle is a product decision that belongs upstream, not a note in a test-strategy section. The guarantee is not left undefended (§6.4's four-key no-write-capability oracle forecloses a write structurally, which is why this is Medium and not High), but the FSPEC and the TSPEC now disagree about what AT-21 asserts. **Fix:** route the exclusion as an FSPEC erratum against AT-21/AT-22's *Given* (raised below), and have §6.5 cite it the way §4.3 and §4.4 cite theirs, rather than deciding it locally. | REQ-STATS-08, FSPEC AT-21/AT-22, D-1 |
| F-02 | Medium | Local | **§6.5's guard conjunct does not bound the exclusion it exists to bound.** The stated guard is that "the excluded-prefix constant is non-empty and that no path under it existed *before* the run that `stats` could have been asked to read". Non-emptiness is the wrong direction — the hazard is the constant **growing**, not shrinking, and a constant widened to `.t*` or `*` satisfies "non-empty" perfectly. The second half is also not a bound on the exclusion: it constrains the fixture, not the prefix list. So the mechanism §6.5 offers as the thing that "keeps the exclusion from becoming a hole" (RK-6's mitigation column says exactly that) cannot detect the hole it names. **Fix:** make the guard a set-equality against a literal transcription of the declared prefixes — `[".tmp-"]` today — so that adding a second prefix is a deliberate, reviewed edit rather than a silent widening, and pair it with a positive conjunct that a real write under an excluded prefix, injected by the test, still fails the oracle. That second conjunct is what proves the exclusion is a filter on *test* writes rather than a blanket amnesty. | REQ-STATS-08, FSPEC BR-28 |
| F-03 | Medium | Local | **§4.3's halt-matcher change is defended by an absence-only test.** The matcher moved from `.+?` to `[^-]+`, and the reasoning is correct — I checked it: every construction site in the driver spells `docs/${feature}/POSTMORTEM-${phaseId}-${feature}.md` (`orchestrate-dev.js:8618`, `:9402`, `:10600` in the exported `checkPostmortem`, `:15293`, `:18243`), and every phase id in the archive is hyphen-free (`D`, `F`, `I`, `P`, `PR`, `R`, `T`). The change also makes the matcher FSPEC-faithful in a way `.+?` was not: EC-15 requires a foreign-feature post-mortem to contribute nothing, and `.+?` would have let `POSTMORTEM-D-pdlc-stats.md` report a phantom `D-pdlc` halt under feature `stats`. The problem is the proof. The named test is "under feature `stats`, a directory containing `POSTMORTEM-D-pdlc-stats.md` yields **no** halt entry" — a pure absence assertion, on a metric whose correct answer is very often the empty list (BR-13). An implementation whose matcher never fires at all passes it, and REQ-STATS-05's actual promise is that halts *are* surfaced. **Fix:** assert the negative and the positive on the same invocation — one directory holding both `POSTMORTEM-D-pdlc-stats.md` and `POSTMORTEM-D-stats.md`, run under feature `stats`, yielding **exactly one** halt entry with phase `D`. That fixture falsifies the phantom-match bug and a dead matcher with one assertion, and it is the shape §6.1's AT-13 row already uses for the foreign-feature file. | REQ-STATS-05, FSPEC BR-12/BR-13, EC-15 |

**Scope-tag note.** All three are `Local`: each is repairable inside this TSPEC (plus one upstream
erratum, raised through the erratum channel rather than folded in here), and none restates a
`DOMAIN-CONSTRAINTS.md` entry or a promoted decision.

## Questions

| ID | Question |
|----|---------|
| Q-01 | §6.4's exclusion-set subset half accepts "carries no files at all" as a feature witness, to keep EC-03's readable-but-empty feature row green. RK-5 correctly names the residue — an *empty* bare-named non-feature directory still reports as a feature with zero-state metrics. Is that residue acceptable to ship, or should the FSPEC erratum's answer be treated as a release blocker for REQ-STATS-07? My reading is that it is acceptable (an empty directory carries no misleading numbers, only a zero row), but the call is the FSPEC's, not this document's. |
| Q-02 | §6.4's candidate set for the doc-type probe includes `CODE_REVIEW`. That token contains an underscore, so `CROSS-REVIEW-software-engineer-CODE_REVIEW-v1.md` will almost certainly fail the strict pattern's *shape* rather than its doc-type membership, returning `trailing_junk` rather than `bad_doc_type`. The oracle still behaves correctly (the token is not collected either way), but the candidate is doing no work. Worth replacing with a token that actually reaches the membership check, so the candidate set's size is honest about its coverage. |
| Q-03 | §6.1's AT-18 row is stated as invariants rather than counts, with the reasoning that "a literal that every routine archival falsifies buys nothing". I agree, and it is the right answer to the `doc-moves-break-pinned-tests` pattern this repository has already been bitten by. One check: FSPEC §6 requires literal, non-derived expectations on real paths (RK-4 cites this). Does stating AT-18 as invariants need the FSPEC's blessing, or is "exactly once, never `completed`" already a literal in the sense §6 means? Raised as a question rather than a finding because I read it as the latter. |

## Positive Observations

- **Every measured literal in the new §6.1 baseline table is correct.** I re-derived all six against
  the tree at HEAD rather than trusting the prose: `docs/completed/pdlc-advisory-wave-gate/` tops out
  at `CROSS-REVIEW-{product-manager,test-engineer}-TSPEC-v6.md` and holds exactly four
  `-REVIEW-v{1,2}.md` files (AT-09 = `6`, four malformed); `docs/completed/pdlc-headless-engine/`
  holds one surviving cross-review at `v13` **and** a `LEARNINGS-pdlc-headless-engine.md`, so AT-10's
  "`13`, other five `harvested`" is right in both halves; `docs/completed/pdlc-loop-economics/`
  carries `CODE_REVIEW-…-v{1,2}.md` (AT-11 = `2`, and the `3` the mutation table names is exactly
  what dropping the `- 1` produces); `POSTMORTEM-PR-pdlc-wave-resume.md` line 3 reads
  `RESOLVED: yes`; `docs/completed/pdlc-headless-engine/` carries exactly `POSTMORTEM-{D,F,I,T}`,
  lexicographically `D`, `F`, `I`, `T` per BR-13. Turning v1's inventory into asserted values with a
  re-measurement command per literal is precisely what RK-4 needed and did not have.
- **The vendoring oracle's `+ 1` is derived from a real asymmetry, not invented to make a number
  work.** `MODULE_NAMES` in `pdlc/engine/scripts/prepack.mjs:20-25` lists four modules;
  `WORKFLOW_MEMBERS` in `pdlc/engine/__tests__/_tspec-packed-set.mjs:51-57` lists five, the extra
  being `vendor/workflows/VENDOR-MANIFEST.json` — which `runPrepack` writes rather than copies, so it
  has no `MODULE_NAMES` entry. `MODULE_NAMES.length + 1` is therefore the honest invariant, and it
  ties the hand-written `5` in `tspecPackedCount` to its source. This is the `EXPECTED_TEST_COMMAND`
  lesson applied correctly, and it is the difference between an oracle and a second transcription.
- **PROP-3's restatement is the single best change in this revision.** v1's "two calls produce
  byte-identical stdout" was green by construction — JavaScript object keys are insertion-ordered
  and `Set` iteration is too, so a deterministic implementation whose row order came entirely from
  the filesystem passed it. Permuting the generated listing and pinning the order to
  `REVIEW_DOC_TYPE_ROWS` rather than to "stable" makes BR-09, BR-13 and BR-18 falsifiable for the
  first time. The document says so in its own words rather than quietly swapping the property.
- **The mutation table names its killer per mutation, and each one is a real discriminator.** The
  two `- 1` mutations are killed by literals that already exist (`3` vs `2`, `7` vs `6`, `14` vs
  `13`). More impressively, the two branch-order mutations are killed by fixtures the document
  *constructs* because it noticed the existing ATs do not discriminate: AT-25's *Given* does not name
  `LEARNINGS`, so the `unmeasurable`/`harvested` swap needs a unit fixture that adds it, and the
  document says so instead of claiming the AT covers it. "Some test goes red" is exactly the
  unfalsifiable claim this table refuses to make.
- **The doc-type oracle's residue is bounded and the boundary is named.** Recovering a module-private
  catalogue behaviourally can only ever be set-equality *over the probed candidates*, and rather than
  paper over that, §6.4 states the residue, prices the alternative (exporting `REVIEW_DOC_TYPES` from
  the sibling's frozen surface), rejects it against §2.1's already-priced co-change cost, and leans
  on FSPEC §7.4 A-3 for the rest. That is the shape a real trade-off writes up as.
- **The provisional-predicate table is a model for how an engineering artifact should hold an open
  product question.** Three possible FSPEC answers, the observable each implies, and the blast radius
  of each — plus the containment argument (nothing but `discoverFeatures` and its unit tests depends
  on the classification). It ships the feature without pretending the question is closed, and it
  makes adopting any answer a bounded edit. §4.4 is now the clearest section in the document.
- **`cmdStats`' `try`/`catch` is written rather than described, and for the stated reason.** §5's
  last row and the code sketch can no longer disagree, `cwd` is resolved once at the edge so nothing
  below reads ambient process state, and the document names which function the injected-throw test
  drives (`cmdStats`, not `runStats`). Exporting `statsParsers` so §6.4's identity oracle has a real
  referent — plus the second conjunct that the bundle `cmdStats` passes to `runStats` is that same
  object — is the builder-not-wired sweep done pre-emptively: the recording double can never become
  the production path.
- **The parallel-worker flake is diagnosed from the actual suite, not hypothesised.** I confirmed
  every load-bearing fact: the in-tree `mkdtempSync` under `SCRATCH_ROOT`, the comment explaining why
  it must live inside jest's `rootDir`, and the `test` / `test:coverage` split where only the latter
  passes `--runInBand`. Weighing and rejecting serialisation on cost, in writing, is the right call
  and the right record of it. My F-01 and F-02 are about how the resulting decision is *governed*,
  not about whether it is correct.

## Recommendation

**Approved with minor changes.**

All four v1 High findings are closed, and closed properly rather than acknowledged: the JSON key
sets are a stated contract transcribed from the FSPEC's own sentences and asserted by set-equality
against literals (§4.2.1, §6.3); `schemaVersion` exists, is hoisted into all three documents, and is
pinned to the literal `1` rather than to the module constant; the exclusion set has an oracle that I
ran by hand against the real `docs/` root and found green-today, red-on-a-ninth; and the doc-type
probe now uses a role slug that `parseReviewFilename` actually accepts, upgraded from containment to
set-equality in the same edit. The four Medium/Low findings are closed too. REQ-STATS-02's two
observable guarantees — top-level key-set equality and a schema-version field — are now each named,
each typed, each oracled, and each given their own traceability row.

The three remaining Mediums are all in §6.5/§4.3's test *governance*, not in the product surface:

1. **F-01** — route the `.tmp-*` snapshot exclusion as an FSPEC erratum against AT-21/AT-22's
   *Given* (raised below) and have §6.5 cite it, rather than deciding a P0 oracle's scope locally.
2. **F-02** — make §6.5's guard a set-equality against the literal prefix list, and add the positive
   conjunct that an injected production write under an excluded prefix still fails the oracle.
3. **F-03** — pair §4.3's halt negative test with a positive on the same invocation: one directory,
   `POSTMORTEM-D-pdlc-stats.md` and `POSTMORTEM-D-stats.md`, feature `stats`, **exactly one** halt
   entry with phase `D`.

None of these blocks. Each is a small, local edit to a test-strategy paragraph, and the product
guarantees they concern are independently defended — REQ-STATS-08 by §6.4's four-key no-write
capability oracle, REQ-STATS-05 by AT-13's and AT-14b's real-path literals, which I verified.

Nothing in §1, §2, §3, §4.1, §4.2, §5, §7 or §8 needs further change. The document is
implementation-ready once the three test-strategy edits land.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 3, "low": 0}

APPROVAL-HASH: sha256:db285ea2f1eb0267f2a49392979eade2e78ead59a1f243ec7e0438aeb3c4b5be
APPROVAL-HASH-NORMALIZED: sha256:9cacb8e90736834554649f30fcafcae8a79c7d62150d31215686374cefcf2d16
REVIEWED-COMMIT: 66c4049ac93d74f8226284dea745a16cdb70a30b
UPSTREAM-STATE: REQ sha256:c4588c8b08d3138b1d2498adda75aa9896f5cd3dee9eb8ed4d1b7c5d92376126
UPSTREAM-STATE: FSPEC sha256:c142bfa852edaecb088d72a93de0ab58c39be5d53a2735e7bd27c621ca5558c4
