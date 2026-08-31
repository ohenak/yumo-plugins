# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-stats/FSPEC-pdlc-stats.md` (v1.2)
**Date:** 2026-08-31
**Iteration:** 3

## Verification

Delta re-review against `128b9cfb4` (the commit carrying the bytes I reviewed at v2). The document
moved under seven commits, `826d8d6ff`…`c3ee2c0ef`, 107 insertions / 40 deletions. I re-checked each
v2 finding, then scanned only the changed sections for new issues, and re-verified every
repository-path claim the round touched in one pass.

| v2 finding | Disposition |
|---|---|
| F-01 High — `docs/`-root failure had no defined stdout in `--json` mode | **Resolved, and better than asked.** BR-20 is restated as always-but-one ("every path but a usage error"), with the reason the enumeration form was the wrong shape — a later failure path with no stdout decision silently breaks the guarantee. BR-30 grew from prose into a pinned three-key shape (`schemaVersion`, `error`, `feature`) with a two-value `reason` enum (`not_found`, `no_docs_root`), EC-09 names which value it emits, flow step C3 now routes refusals through the serializer explicitly, and AT-27's root leg asserts stdout's *content*, not its non-report-ness. The hole is closed at the rule, the edge case, the flow and the test. |
| F-02 Medium — EC-09 departed from REQ-STATS-09 with neither decision nor erratum | **Resolved.** D-9 records the question, the decision and the reason (§3.1 A2 exits before A3 can resolve a feature; "there is no `docs/` root here" beats a spelling-check invitation), and §7.3 raises the REQ wording as an erratum. The §2.1 coverage row now reads `AT-27 (root leg, per D-9)`, so the divergence is visible from the traceability table rather than only from prose. |
| F-03 Medium — AT-24 tested no token BR-01 actually singles out | **Resolved.** `--dev` and `--plugin-root` are now the leading rejected tokens, with the failure mode named in the test text: a `FLAGS_BY_COMMAND` row copied from `doctor` accepts both and still refuses `--dry-run`. I re-confirmed `doctor`'s row is `["plugin-root","cwd","allow-api-key-billing","dev"]` at `pdlc/engine/bin/cli.mjs:184`. The test can now fail in the one way the rule exists to prevent. |
| F-04 Medium — BR-27's narrowing unreconciled with REQ-STATS-07 | **Resolved.** BR-27 carries the reconciling sentence (missing artifacts are a measured row, only unreadability is a gap, nothing the criterion protects is lost), and §7.3 raises the wording. |
| F-05 Low — EC-21 cited AT-27, which exercises no such failure | **Resolved.** EC-21 now maps to AT-20, and EC-21's own text ("one unreadable feature never suppresses the fleet report") is exactly AT-20's Given. |
| F-06 Low — AT-15's link member made the enumeration probe platform-skippable | **Resolved by the cheaper fix.** Rather than splitting the test, AT-15 now states that the link leg alone may be skipped and that the enumeration and removal-probe legs run with a regular file in that member's place. The set-equality probe survives a platform that cannot carry links, which was the point. |

Claims introduced or moved this round, checked at HEAD:

| Claim | Checked against | Result |
|---|---|---|
| `docs/completed/pdlc-headless-engine/` carries `POSTMORTEM-{D,F,I,T}-pdlc-headless-engine.md` — four post-mortems, four distinct phases (AT-14b) | directory listing | Confirmed, exactly four, no fifth |
| `docs/completed/pdlc-wave-resume/` carries exactly one post-mortem, `POSTMORTEM-PR-…` (AT-13) | directory listing | Confirmed — which is why AT-13's move to a copied temp root is right: the second file it needs is added to the copy, never to the repository |
| `doctor`'s flag row is `["plugin-root","cwd","allow-api-key-billing","dev"]` (AT-24) | `pdlc/engine/bin/cli.mjs:184` | Confirmed |
| Lexicographic ascending over `D, F, I, T` yields `D, F, I, T`, and over `P, PR` yields `P, PR` (AT-14b, BR-13) | BR-13's stated collation | Confirmed; the second leg is the one that can fail |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **AT-27's root leg says "all four runs" but names three axes, so the leg it does not cover is unknowable.** The rewritten leg runs "over a tree whose `docs/` root is absent, and again over one where it cannot be read", then asserts stderr clauses, then asserts stdout "under `--json`", then asserts `feature` `null` "in the fleet runs". The cells implied are {absent, unreadable} × {single, fleet} × {human, `--json`} — eight, not four. Whatever four an implementer picks, two of EC-09's own claims go untested: EC-09 says the root message appears "in both modes and in both conditions", and BR-30's single-feature root failure carries a non-null `feature`. A TSPEC author will pick a set, and there is no way to tell from the text whether they picked the intended one. Say which axis the four span (my read: two conditions × two invocation shapes, both under `--json`, with the human-mode message asserted on one condition) or state eight. | AT-27 root leg, EC-09, BR-30 |
| F-02 | Medium | Local | **BR-30's non-null `feature` on a root failure has no oracle.** BR-30 fixes `feature` as "the name the caller supplied, `null` where none was (a fleet-mode root failure)". Three of the four combinations are pinned: AT-23 asserts `feature` is the supplied name on `not_found`, AT-27 asserts `null` on the fleet root failure. The fourth — `pdlc stats {feature} --json` in a repository with no `docs/` root, where `reason` is `no_docs_root` **and** `feature` is the supplied name — is asserted nowhere, and it is the combination an implementation is most likely to get wrong, because the natural implementation raises the root failure before it has looked at the feature argument at all and will emit `null`. That path is also D-9's whole subject: the operator who typed a feature name and needs to learn the repository is the problem. One conjunct in AT-27's root leg (`feature` is the supplied name in the single-feature runs) closes it. | BR-30, AT-27 root leg, D-9 |
| F-03 | Low | Local | **§7.3 now has an intro that says "two" followed by three bullets.** The new block opens "Two more are raised by this round's cross-reviews" and carries its two bullets; the pre-existing REQ-STATS-02 / REQ-STATS-08 bullet, previously the third item under "Two further errata are raised by this round's cross-reviews" (itself already a miscount), now sits below the new block separated by a blank line, so it reads as a third item under an intro claiming two. §7.3 is the section an orchestrator reads to route errata to the REQ author; a reader counting items against the intros gets a different total each way they parse it. Give the trailing bullet its own one-line intro, or fold it into the preceding block and fix the count word. | §7.3 |
| F-04 | Low | Local | **The EC matrix edit narrowed EC-14 to a single one of its three conditions.** EC-14 enumerates a `RESOLVED:` marker that is "absent, duplicated, or unparseable", all three tagged `open`. The matrix row changed from `AT-14, AT-13` to `AT-14`, and AT-14's Given carries only the duplicated-marker case. Dropping AT-13 was right — its companion fixture is `RESOLVED: no`, which is a parseable *no*, not EC-14 at all — but that leaves absent and unparseable with no oracle while the matrix reports the EC covered. Since fail-closed classification is exactly where an implementation reads a missing marker as `resolved`, add the absent-marker and unparseable-marker files to AT-14's Given as two more legs; the assertion form is already there. | §6.11 EC matrix, EC-14, AT-14 |
| F-05 | Low | Local | **BR-29's exit-1 enumeration says "unreadable `docs/` root" where the round settled on "missing or unreadable".** EC-09 covers both conditions, §3.1 A2 branches on readability in a way that folds absence in, and BR-20/BR-30 now name the `no_docs_root` reason for both. BR-29 is the exit-code catalogue an implementer reads first and it lists only the unreadable half. One word ("missing or unreadable"). | BR-29, EC-09, §3.1 A2 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | (Carried from v1/v2, still open and now cheaper to answer.) BR-13 names lexicographic collation and AT-14b pins `P, PR` as the case that depends on it. Is the comparison byte-wise, or locale-sensitive? AT-14b's literal is stable either way for these inputs, so the test will not catch the difference — but a locale-sensitive comparison is a run-to-run stability risk that BR-13's own stability claim is about. One clause in BR-13 ("byte-wise, locale-independent") retires it. |
| Q-02 | BR-30 declares the error object "a released shape under REQ R-5" governed by BR-24's increment rule. Does that mean the success document and the error object share one `schemaVersion` counter, so adding a `reason` value bumps the version a consumer of the success document also reads? If they share, the enum is effectively frozen; if they do not, `schemaVersion` means two things. TSPEC material, but the answer shapes BR-24's wording. |
| Q-03 | AT-14b and AT-13 measure real archived directories; AT-14b's `D, F, I, T` literal holds only while `docs/completed/pdlc-headless-engine/` carries exactly those four. §6's preamble permits re-measurement when the archive moves. Is there an intended signal to the next author that these four literals are measured-from-HEAD rather than invented — a comment convention in the test, or a line in the fixture list? |

## Positive Observations

- **BR-20's rewrite fixed the rule's *shape*, not just the missing case.** I asked for a sentence
  covering the `docs/`-root path. The document instead restated the rule as always-but-one and said
  why: "the enumeration is what rots: a failure path added later with no stdout decision silently
  breaks the guarantee this rule exists to give". That is the durable form — the next failure path
  inherits a decision instead of creating a hole — and it is the second time this round the author
  chose the invariant over the patch.
- **BR-30 grew a shape, and the shape carries the distinction the rule was written for.** Three keys
  set-equal, `error` with exactly `reason` and `message`, a two-value enum, `schemaVersion` hoisted
  as BR-21 hoists it. A caller can now separate "no such feature", "no `docs/` root here" and "this
  feature has no artifacts" without touching a message string, and AT-23 asserts exactly that by
  comparing key sets against AT-26's empty directory rather than by reading prose.
- **AT-14b is the test I did not think to ask for.** BR-13's collation had a stated rationale (`PR`
  is the two-character id whose position depends on the choice) and no oracle that could fail. AT-14b
  asserts a literal *sequence*, states in the test text why a set-shaped oracle is worthless here
  ("an implementation ordering by directory-listing or insertion order passes any set-shaped
  oracle"), and adds the `P, PR` leg so the rule's stated reason for naming a collation is itself
  under test. The four-phase fixture is real: I confirmed `POSTMORTEM-{D,F,I,T}-…` in
  `docs/completed/pdlc-headless-engine/`.
- **AT-13's fixture moved into a temp root without being asked.** The v2 text added two files
  alongside a real archived directory; the new text copies the directory and adds them to the copy,
  with the reason stated — the `resolved` literal stays carried from real bytes while the real
  directory stays exactly as AT-09, AT-10 and AT-18 measure it. That is a test-isolation defect
  caught by the author, in a document under review for something else.
- **AT-25's "the other five rows read exactly `3`, `2`, `5`, `1`, `4`" is the right instinct
  generalised.** The v2 text said "unchanged", which is a tautology no implementation can fail. The
  new text transcribes literals and names the risk it makes falsifiable — one role's collision
  poisoning rows it does not own. Nobody asked for this; it came from applying §6's literal-oracle
  rule to a conjunct that had escaped it.
- **AT-24 explains its own token choice.** Naming `--dev` and `--plugin-root` was the ask; writing
  down *why* they are the tokens (the copied-`FLAGS_BY_COMMAND`-row failure mode, cited to
  `cli.mjs:184`) is what stops a future author from "simplifying" the list back to `--dry-run` and
  quietly deleting the test's only teeth.

## Recommendation

**Approved with minor changes**

The one v2 High is closed at four levels — rule, edge case, flow step and test — and closed by
restating BR-20 as an invariant rather than by patching the one missing path. All three Mediums and
both Lows are closed too, several of them more thoroughly than the finding asked: D-9 records the
REQ-STATS-09 departure with its reasoning and §7.3 raises it, BR-27 reconciles its narrowing in
place, AT-24 names the tokens BR-01 singles out and the implementation slip they catch, EC-21 moves
to the test that actually exercises it, and AT-15's enumeration probe is now explicitly
non-skippable. Nothing in the round regressed a section I had approved.

What remains is two Mediums about test coverage of shapes this round introduced, not about the
shapes themselves — no behavioural decision is open. F-01: AT-27's root leg says "four runs" while
naming three axes that multiply to eight, so which cells are covered is an implementer's guess.
F-02: the one combination BR-30 is subtlest about — single-feature mode, `no_docs_root`, non-null
`feature` — has no oracle, and it is the combination the natural implementation gets wrong. Both are
one conjunct each in AT-27's root leg. The three Lows are records and wording: §7.3's "two" over
three bullets, EC-14 marked covered while two of its three conditions lost their oracle, and BR-29's
exit catalogue naming only the unreadable half of the root failure.

Every claim this round introduced was checked at HEAD and holds: the four `pdlc-headless-engine`
post-mortems, the single `pdlc-wave-resume` post-mortem, `doctor`'s flag row, and BR-13's collation
over both literal sequences.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 3}
