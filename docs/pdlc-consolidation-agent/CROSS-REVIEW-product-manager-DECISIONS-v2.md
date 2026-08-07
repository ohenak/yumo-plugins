# Cross-Review: product-manager — DECISIONS

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-consolidation-agent/DECISIONS-pdlc-consolidation-agent.md`
**Date:** 2026-08-06
**Iteration:** 2
**Scope:** Local (per-finding tags in the table)

## Delta scope

Re-review of the revision `9b9067e..HEAD` (five commits: `7e9044b`, `ab84ce7`, `89e3aa3`, `c60b3d2`,
`9b05e97`). I read my v1 cross-review, diffed the document against the commit I reviewed, and confined
this pass to the changed spans plus the three findings I raised. Unchanged sections I approved at v1
— §10's dispositions, DEC-CONS-02's body, DEC-CONS-04's decision, the two upstream errata I endorsed —
were not re-litigated.

Changed spans: §2's index row for DEC-CONS-01; DEC-CONS-01's second rejection, residual paragraph and
Testability; DEC-CONS-02's two citation fixes; DEC-CONS-03's Testability (two-domain → three-domain);
DEC-CONS-04's new observability paragraph; DEC-CONS-05's post-edit-hook paragraph, the three-change
hook cost, and its Testability; DEC-CONS-06's Testability; DEC-CONS-07's second accepted cost and the
six-status enumeration; §11.1 row 6; §11.2's new deliberately-unasserted table; §11.3's third erratum.

## Prior findings — disposition

| Prior | Severity | Status | Evidence in the revision |
|---|---|---|---|
| F-01 | High | **Resolved** | "the module has no boundary to scrub" is explicitly withdrawn; a new **Residual** paragraph records the inbound channel with the citations checked below, states that non-disclosure holds "by construction outbound and by implementation discipline inbound", says in terms that no arm of the Testability line observes it, and lists it in §11.2's unasserted table. The Testability line is rewritten to three numbered arms and drops the "the protocol's type has no string channel" claim, which was untrue of a codebase with no type system. |
| F-02 | Low | **Resolved** | §2's DEC-CONS-01 row now reads "NFR-2, AC-4.2, **AC-4.3, AC-3.5**". |
| F-03 | Low | **Resolved** | DEC-CONS-07 now carries a second accepted-cost paragraph: the permanent zero-byte marker, `.gitignore`d, visible only to a literal `ls docs/_decisions/`, with the AC-1.3 inversion stated (`TSPEC:962-966`, `TSPEC:2522` both verified). |
| Q-01/Q-02/Q-03 | — | Answered | Q-03's ask landed as §11.2's unasserted table; Q-02's scope question is answered by `REQ:115` (verified below), which already makes the glob edit in-scope. |

## Verification of the changed sections

Every new `file:line` and every new measurement in the revision was re-run against HEAD rather than
read as given. All of the following verified exactly as written:

- **The inbound channel (DEC-CONS-01's residual).** `rtGit` asks for "the LAST 300 characters of its
  **combined output**" at `pdlc/workflows/runtime-adapter.js:951`; `rtParseTransportReply` is declared
  at `:967` and assigns `stderr` at `:977`; `rtGhRun` at `:995` asks for "the LAST 300 characters of
  its **stderr**" at `:1000` and parses through the same function at `:1006`. The revision's sharpening
  — that the *combined-output* arm is `rtGit`'s alone and `rtGhRun` asks for stderr only — is correct
  and is a genuine narrowing of my v1 finding, not a hedge.
- **The `rtShellQuote` claim, which is the load-bearing one.** `function rtShellQuote(arg)` at `:668`
  returns `'${String(arg).split("'").join("'\\''")}'` (`:668-670`) — POSIX single-quote wrapping of
  every argv element. A `$VAR` written into a `_git` argv element is therefore transported literally
  and never expanded, exactly as §11.3 item 3 states, and `rtGit` maps every element through it
  (`:949`). `rtGhRun` by contrast interpolates a fully-built command **string** (`:995-998`), so a
  `GH_TOKEN="$VAR" gh …` prefix does expand. The asymmetry the erratum rests on is real.
- **DEC-CONS-03's "red on correct code" claim.** `TSPEC:1536` and `TSPEC:1679` both issue
  `_git(["clone", "--depth", "1", "--single-branch", remote, dir])` — no `-C` prefix, mutating verb.
  The v1 two-domain predicate would indeed have failed on correct code; the three-domain partition,
  with the clone pinned positionally by last-argument identity rather than exempted, fixes it without
  opening a hole.
- **DEC-CONS-02's two citation corrections.** `ADVISORY_RUNG_SKILL = "se-review"` is at
  `orchestrate-dev.js:1797` (not `:1796`) and "there is no second, private copy of this ladder
  anywhere" is at `:1802` (not `:1800-1801`). `git log -- pdlc/workflows/orchestrate-dev.js` shows no
  commit on this branch, so the file is unchanged since `bb99f89` — my v1 citations were off by one
  and the revision's are right. I note this explicitly because a "citation fix" is exactly the kind of
  edit a reviewer should suspect of introducing drift, and this one does not.
- **The "no type system" withdrawal.** `git ls-files 'pdlc/**/*.ts' 'pdlc/**/tsconfig.json'` returns
  **nothing** tracked. The retraction is correct and the runtime `typeof` oracle that replaces the
  structural claim is a real assertion.
- **DEC-CONS-05's post-edit-hook paragraph, reproduced command-for-command.** At HEAD
  `nudge-consolidation.sh:28` is a single `glob.glob(os.path.join(proj, "docs", "*", "LEARNINGS-*.md"))`;
  run against this repository it returns **2** paths, while the pass's two `:(glob)` pathspecs return
  **5** — the three `docs/completed/*` entries plus `docs/orchestrate-dev-workflow` and
  `docs/pdlc-advisory-tier`, exactly the set named. The paragraph's point stands: stating the
  divergence set against the pre-edit hook would compare the pass to a hook this feature does not ship.
- **The three-change hook cost, and its in-scope status.** `REQ:115` reads "Widening makes
  `nudge-consolidation.sh:28` an in-scope edit (§5), keeping one enumeration as well as one
  predicate" — so the glob widening was already in scope and my v1 Q-02 is answered from the REQ
  itself. `TSPEC:117` carries all three edits (`:28`'s glob, `:41`'s predicate, the env-gated
  `PDLC_PENDING:` line). §7's bullet and §11.1 row 6 now state the same three, and row 6 is in fact
  the sixth data row of §11.1 — the cross-reference is accurate.
- **The six terminal statuses.** `docs/_constraints/pdlc-consolidation-vocabularies.md:38-43` are
  exactly `promoted`, `promoted-degraded`, `no-op`, `skipped-cadence`, `refused`, `failed`, in that
  order, under a table whose own preamble says downstream completeness is "checkable by
  **set-equality against this table**". Naming that file as the oracle's source of truth is the right
  move: a seventh status added there fails the assertion instead of being silently excluded.
- **AC-4.2's three values** are at `REQ:320-322` (`present (redacted)` / `absent` / `local-gh`), and
  the REQ itself already frames them as a closed set with a positive conjunct — so DEC-CONS-01's
  set-equality arm transcribes the spec rather than deriving its expectation from the code.
- **The hook parity differential is end-to-end.** `TSPEC:1926` declares the L4 row as a "real
  `python3`/`bash` subprocess" in `consolidationHookParity.test.js`, so the "one predicate" claim is
  falsifiable rather than tested against a re-implementation.

I found **no** false or overstated citation among the additions.

## Findings

No High or Medium finding is open — my v1 High is resolved and I found none in the changed spans.
Three Low findings, all one-line carries, none gating.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-04 | Low | Local | **DEC-CONS-06's new positive half pins one of the two read-path prompts.** The pairing is a real improvement and it closes the absence-only defect: the negative ("no `relative to the repository root` clause in the read prompt") now runs conjoined with two positives on a prompt the test demonstrably found. But the read path interpolates `${path}` into **two** prompts, not one — `rtReadProbe` (`runtime-adapter.js:369`, prompt `:374`, shell forms `:375-378`), which the entry pins, and `rtReadRange` (`:280`), which it does not: `sed -n '{first},{last}p' "${path}" \| ${RT_SHA_CMD}` under "Run these two exact commands from the repository root" (`:280-282`). Both are cwd instructions and neither carries a resolution clause, so the entry's *conclusion* is right; what is narrower than claimed is the durability, since "a future symmetry edit fails a test rather than passing review" holds only for the probe. The entry's own measurement is already file-wide — `grep -n "relative to the repository root"` returns exactly one line, `:805`, which I re-verified — so the fix is to state the negative arm as that file-wide grep (or to name `rtReadRange` alongside `rtReadProbe`), which makes the oracle set-equal to the read-path prompt set rather than a containment check over one member of it. | AC-3.5, NFR-5 |
| F-05 | Low | Process | **Three additions cite reviewer questions by bare number** — "(reviewer Q-01)" in DEC-CONS-03, "(Reviewer Q-02: three changes, one file, one owning task.)" in §7, "(reviewer Q-03)" in DEC-CONS-05's Testability. All three refer to the **test-engineer's** questions, but this feature has two reviewers whose question tables both run Q-01…Q-03 with different content (mine are about PLAN sequencing for the DEC-CONS-05 flag, REQ §5's in-scope sentence, and §11.2's unasserted list), so an unqualified "Q-02" resolves to two different questions. Worse for a durable document: `CROSS-REVIEW-*` files are **deleted at harvest** (`guard-harvest-before-delete`), so all three references will dangle against artifacts that no longer exist. Either qualify the role (`test-engineer Q-02`) or, better, drop the reference and keep only the sentence that answers it — each of the three reads fine without it. | Process/harvest |
| F-06 | Low | Local | **§2's one-line summary of DEC-CONS-01 is now the only place the git half reads as settled.** The row still says "the secret reaches `git`/`gh` only by shell expansion", while §11.3 item 3 — added in this revision, and verified above — establishes that for `git` it *cannot*, since `rtShellQuote` single-quotes every argv element. §11.3's preamble does say the corresponding entry is provisional, so a reader who reaches §11 is not misled; a reader who traces from §2's index is. One parenthetical on the row (`gh` half settled; `git` half pending the §11.3 item-3 erratum) closes it. This is the same shape as my v1 F-02 and is the last place the two halves disagree. | NFR-2, AC-4.2 |

## Questions

| ID | Question |
|----|---------|
| Q-04 | §11.3 item 3 is, on my reading, not only a documentation defect but a **functional** one: if the credentialed push cannot reach `git` by shell expansion and the module may not hold the value, then AC-4.2's `present (redacted)` path has no shipped mechanism at all until the TSPEC picks a lane (a command-string seam for the push, or `gh` for both). The entry handles this correctly for its own layer. My question is for sequencing, not for this document: does the PLAN need the erratum answered **before** the task that implements `rtEnvPresent` and the push, or can that task be written against either lane? I would rather the dependency be stated in the ownership manifest than discovered in Phase I. |
| Q-05 | DEC-CONS-04's new observability paragraph names a forensic signature — two `.consolidation-log.md` records with distinct `passId`s carrying the same `(failure-mode-id, action)` key — and says nothing computes it. That is the honest call and I am not asking for a counter. The question is whether that signature belongs in the operator-facing release note beside the drift-gate row §11.1 already flags, so the one human who could ever notice it knows what to look for. Not a finding; a suggestion for the same row that "no AC owns". |

## Positive Observations

- **The revision withdrew two claims by name rather than quietly rewriting them.** "The earlier
  wording 'the module has no boundary to scrub' is withdrawn" and "an earlier draft's 'the protocol's
  type has no string channel to carry one' is withdrawn" — both say what was wrong and why, in the
  document that will outlive this review. That is the rarer half of addressing feedback: a revision
  that silently deletes the sentence leaves a future reader unable to tell a considered retraction
  from an accident.
- **F-01 came back narrower than I raised it, and the narrowing is correct.** I claimed the
  combined-output channel for both `rtGit` and `rtGhRun` on the strength of the "reply shape is
  rtGit's, verbatim" doc comment. The revision checked the actual prompt and found `rtGhRun` asks for
  **stderr only** (`:1000`) while sharing the *parser* (`:1006`) — so the residual is `rtGit`'s alone.
  A revision that had simply agreed with me would have recorded a slightly wrong residual.
- **DEC-CONS-03's own testability was found red on correct code, by the author, and the fix is a
  partition rather than an exemption.** The v1 two-domain predicate would have failed on the clone
  argv the entry's own Decision issues. The three-domain form pins the clone by last-argument
  identity — destination character-identical to `_makeTempDir`'s reply, source character-identical to
  the `remote get-url` reply — and states the partition is total by construction, so a fourth kind of
  call fails rather than slipping through unclassified. "The clone belongs to no verb set — it is its
  own case, and what pins its destination is the last-argument identity, not a permission" is the
  right distinction and it is the one that keeps AC-3.8 honest.
- **The three-change hook cost is stated because it would otherwise corrupt a comparison, and the
  document says so.** "an understated accepted cost would corrupt the comparison" — DEC-CONS-05's
  rejection of the shared-implementation alternative turns on relative cost, so inflating the taken
  path's cheapness is the specific way that rejection could have been laundered. I checked the three
  changes against the file they land in and against `TSPEC:117`; the cost is now honest in the
  direction that makes the taken path look *worse*, which is the direction almost never corrected.
- **§11.2's unasserted table gives the PROPERTIES author the absences as a first-class inheritance.**
  Three rows, each with a why and a where-recorded, and each traceable to the entry that decided it.
  A property author reading §11.2 alone now knows which two behaviours are out of bounds by decision
  rather than by oversight — and, critically, the table says "none should be closed by writing a test
  that appears to cover it", which is the failure mode DEC-ORACLE-02 exists to prevent.
- **The set-equality upgrades are anchored to a file, not to a prose list.** DEC-CONS-07's six
  terminal statuses now cite `pdlc-consolidation-vocabularies.md:38-43` as the assertion's source of
  truth, and DEC-CONS-01's `credential:` arm cites `REQ:320-322`. Both are literal transcriptions from
  upstream documents rather than values derived from the module under test, and both are stated as
  exact set equality with the deletion case named. That is the bar for an enumerated contract and this
  revision hits it in two places it previously only gestured at.
- **DEC-CONS-05's new paragraph refuses a flattering baseline.** It would have been easy to leave the
  divergence set stated against HEAD's hook, where two classes look small. Stating it against the
  post-edit hook, and disclosing that the HEAD gap (2 vs 5) "is larger than classes (i) and (ii)
  combined", makes the entry harder on itself. I reproduced both numbers.

## Recommendation

## Verdict
