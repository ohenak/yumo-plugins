# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-stats/FSPEC-pdlc-stats.md` (v1.1)
**Date:** 2026-08-31
**Iteration:** 2
**Previous review:** `CROSS-REVIEW-test-engineer-FSPEC-v1.md` (3 High, 6 Medium, 3 Low) — *Needs revision*
**Delta reviewed:** `git diff 7cc090a84..HEAD -- docs/pdlc-stats/FSPEC-pdlc-stats.md` (220 insertions, 62 deletions)

## Prior Findings — Disposition

| Prior | Sev | Status | Evidence in the revision |
|---|---|---|---|
| F-01 — the six-type catalogue swallows the pipeline's own `REVIEW` cross-reviews; a first run over this repo reports four pipeline-authored artifacts as malformed with no rule saying so | High | **Resolved** | The disposition is now *stated* rather than left to be discovered. BR-06 gains an explicit paragraph naming `CROSS-REVIEW-{role}-REVIEW-v{N}.md` as in-catalogue-failing, EC-05 folds "a document type outside BR-09's six" into its grammar-failure list, D-7/D-8 record the decision and its cost, §7.3 raises it as a REQ erratum rather than repairing it downstream, and A-3 is narrowed so the role catalogue is inherited while the document-type catalogue is not. Crucially the test now pins it: AT-09 gains a real-path half over `docs/completed/pdlc-advisory-wave-gate/` with three literal conjuncts — all four basenames named as malformed, no row counting them, and the TSPEC row still `6`. Verified against the tree: exactly four `CROSS-REVIEW-{product-manager,test-engineer}-REVIEW-v{1,2}.md` files, and the highest grammatical TSPEC index in that directory is `6` (`CROSS-REVIEW-{product-manager,test-engineer}-TSPEC-v6.md`). |
| F-02 — EC-10's unclassified entry had no slot in the two-key fleet JSON document; AT-19 named no JSON expectation | High | **Resolved** | BR-23 now specifies three top-level keys (`schemaVersion`, `features`, `unclassified`) and explains why `unclassified` is a sibling of `features` rather than an entry inside it. BR-18 gives the human-mode carrier (a marked row in the same list, in the same order, like a gap row). EC-10 names both carriers. AT-19 splits into a human half and a JSON half whose oracle is a set-equality on the literal key set ("exactly `schemaVersion`, `features`, `unclassified` — three, no more") plus `unclassified` set-equal to `["{that directory}"]` and `features` carrying no key of that name. That is transcribable and it fails on a deleted case. |
| F-03 — AT-13's expectation was an implementation echo ("the resolution the pipeline's own rule yields"), on the one AC covering the feature's load-bearing constraint | High | **Resolved** | AT-13 now transcribes the literal — `{phase: "PR", resolution: "resolved"}`, explicitly "the literal, not a re-derivation" — grounded in the fixture's line-leading marker, verified on disk at `docs/completed/pdlc-wave-resume/POSTMORTEM-PR-pdlc-wave-resume.md:3` (`RESOLVED: yes`; the only other occurrence, `:185`, is mid-line and so outside the line-leading rule). The falsifying companion I asked for is present: the same file with `RESOLVED: no` expecting `open`, with the reason stated — a constant-classifier implementation passes either half alone and fails the pair. The §6 preamble generalises the rule for all real-path tests ("a literal, never 'whatever the mechanism derives'"), which is the durable half of the fix. |
| F-04 — BR-22's universal "each metric's value is an object carrying `state`" was falsified by its own `halts` example | Medium | **Resolved** | BR-22 now scopes the object-with-`state` form to the three metrics that can hold a non-numeric state and states the `halts` exception with its reason (BR-13 makes emptiness expressible as `[]`). |
| F-05 — fleet human mode quietly narrowed the metric set REQ-STATS-07 requires, with no test scoped to fleet | Medium | **Resolved** | D-7 records the reduction as deliberate and bounds it at exactly two (malformed as a count; halts as `{n} ({r} resolved)`), BR-18 restates it with the malformed-count column added, and AT-06 gains a fleet half asserting the two permitted differences "and in no other way". |
| F-06 — seven edge cases had no AT and there was no EC→AT traceability table | Medium | **Resolved** | §6.10 adds AT-25 (EC-06), AT-26 (EC-03), AT-27 (EC-09, EC-11, EC-21) and AT-28 (EC-16, the deliberate asymmetry); AT-18 absorbs EC-17, EC-18 and EC-20; AT-15 absorbs EC-19. §6.11 adds an EC→AT table covering EC-01…EC-21 with no gaps, alongside the BR table now covering BR-01…BR-30. |
| F-07 — AT-15's fixture satisfied BR-14 by containment, so an omitted enumeration member stayed green | Medium | **Resolved** | AT-15 now requires all six spec documents and all three process families at distinct sizes, and adds the per-member removal probe ("removing any one of the nine changes its side's total by exactly that file's size") that converts containment into set-equality. |
| F-08 — AT-02's oracle was absence-shaped ("no metric equals the sum") | Medium | **Resolved** | Replaced with the byte-identity form, with the merged-read-deduplicates-by-basename reasoning stated inline. |
| F-09 — AT-10/AT-12 expected "the measured index" rather than a literal | Medium | **Resolved** | AT-10 reads exactly `13` (verified: `docs/completed/pdlc-headless-engine/` carries `CROSS-REVIEW-software-engineer-TSPEC-v13.md` as its only cross-review, alongside `LEARNINGS-pdlc-headless-engine.md`); AT-12 names `CODE_REVIEW-{feature}-v4.md` and reads exactly `4`. The §6 preamble adds the re-measurement licence for archive drift. |
| F-10 — BR-01's closed flag set silently diverged from the surface it cited | Low | **Resolved** | BR-01 now states the divergence in one clause: `stats` takes the mechanism, not the flag lists, so `pdlc stats foo --dev` is a usage error though `pdlc doctor --dev` is not. |
| F-11 — EC-19 did not decide `lstat` vs `stat` | Low | **Resolved** | EC-19 decides the link's own size, with the rationale (a link into a large document cannot inflate a side), and AT-15 carries a symbolic-link member as a fixture conjunct. |
| F-12 — §7.4 A-3 claimed inheritance BR-09 cannot deliver | Low | **Resolved** | A-3 is split: the role catalogue is inherited, the document-type catalogue is not, and D-8's `REVIEW` case is cited as the instance. |

All three blocking findings are resolved, and resolved at the level that matters for this lens — each
one landed a rule *and* the oracle that can fail on it.

## Claims Verified

Every repository claim introduced or changed by this round's edit was checked against HEAD, not
against the document.

| New/changed claim | Verdict | Evidence |
|---|---|---|
| AT-09: `docs/completed/pdlc-advisory-wave-gate/` holds four `CROSS-REVIEW-{role}-REVIEW-v{N}.md` files written by Phase CR | **Holds** | `CROSS-REVIEW-{product-manager,test-engineer}-REVIEW-v{1,2}.md`, exactly four; produced by `reviewFileType = roundDocType \|\| "REVIEW"` (`pdlc/workflows/orchestrate-dev.js:9245`) through `crossReviewPath` (`:9364`) |
| AT-09: that directory's TSPEC row "still reads `6`" | **Holds** | Highest grammatical TSPEC index there is `v6` (`CROSS-REVIEW-product-manager-TSPEC-v6.md`, `CROSS-REVIEW-test-engineer-TSPEC-v6.md`); BR-05's across-role maximum makes `6` the literal |
| BR-06/EC-05: a `REVIEW` doc type is rejected by the driver's own parse, not by a rule this document invents | **Holds** | `REVIEW_DOC_TYPES` is exactly the six (`pdlc/workflows/orchestrate-dev.js:10105-10112`); `parseReviewFilename("CROSS-REVIEW-test-engineer-REVIEW-v2.md")` → `{ok:false, reason:"bad_doc_type"}` |
| AT-10: `docs/completed/pdlc-headless-engine/` TSPEC row reads exactly `13`, other five `harvested` | **Holds** | Directory carries `CROSS-REVIEW-software-engineer-TSPEC-v13.md` as its only cross-review, plus `LEARNINGS-pdlc-headless-engine.md` |
| AT-13: the fixture's line-leading marker reads `RESOLVED: yes`, so the literal is `resolved` | **Holds** | `docs/completed/pdlc-wave-resume/POSTMORTEM-PR-pdlc-wave-resume.md:3`; `parseResolvedMarker` lowercases and maps `yes` → `{ok:true, resolved:true}` (`pdlc/workflows/orchestrate-dev.js:7611-7615`). The second occurrence (`:185`) is mid-line and correctly outside the rule |
| BR-12: `POSTMORTEM-I-pdlc-headless-engine.md` exists on disk though the driver's force-phase token list omits `I` | **Holds** | That file is present; the FSPEC uses it correctly to justify holding no phase-id catalogue |
| EC-17/AT-18: `docs/pdlc-halt-hardening/` carries only a PLAN | **Holds** | Single file `PLAN-pdlc-halt-hardening.md` |
| AT-15: `SIZING-*.md` is a real on-neither-list basename | **Holds** | `docs/completed/pdlc-advisory-wave-gate/SIZING-pdlc-advisory-wave-gate.md` |
| BR-01: `stats` deliberately does not join the `--plugin-root` / `--allow-api-key-billing` common set | **Holds as a decision** | The common set is real (`pdlc/engine/bin/cli.mjs:169-185`); the FSPEC now states the divergence rather than implying inheritance |
| BR-22/AT-25: `collidingRole` is a defined key, not one AT-25 invents | **Holds** | §4.4's document renders `"collidingRole"` on every `reviewRounds` entry and BR-22 states it is `null` outside `unmeasurable`, so AT-25's expectation is transcribable |
| §6.11: the BR and EC tables are complete enumerations | **Holds** | BR-01…BR-30 and EC-01…EC-21 each appear exactly once; a deleted rule row would be visible against §4/§5 |

## Findings

Scanned only the sections this round changed (§1's classification-boundary paragraph, §2's coverage
rows, §3.2 B5, §3.3 C3, BR-01, BR-05, BR-06, BR-09, BR-12, BR-13, BR-18, BR-20, BR-22, BR-23,
BR-27, EC-05, EC-09, EC-10, EC-15, EC-19, §6's preamble, AT-02, AT-06, AT-09, AT-10, AT-12, AT-13,
AT-15, AT-18, AT-19, the new §6.10 and §6.11, D-7, D-8, §7.3, A-3). No High finding, old or new.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **BR-13's ordering claim was made checkable this round and is still not checked; §6.11 reports it as covered.** The edit names the collation — halt entries "ordered lexicographically by phase identifier, ascending" — precisely so the determinism claim has an oracle, and cites the two-character `PR` as the case whose position depends on the choice. But no AT exercises a feature with more than one halt: AT-13's fixture yields exactly one entry (its second post-mortem is the foreign-feature probe that contributes nothing), and AT-14's two features have one post-mortem and none. §6.11 lists `BR-13 → AT-14`, which reads as coverage of a rule whose only falsifiable content — the order — nothing asserts. A wrong collation (insertion order, or a `PR`-before-`P` codepoint slip) ships green. Fix: give AT-14 or a new AT a multi-halt fixture and assert the rendered sequence as a literal list. `docs/completed/pdlc-headless-engine/` is the real instance and makes the literal checkable today: it carries `POSTMORTEM-{D,F,I,T}-pdlc-headless-engine.md`, so the expectation is the literal sequence `D, F, I, T`. | BR-13, AT-14, §6.11 |
| F-02 | Medium | Local | **AT-27's root-error oracle contradicts the EC-09 wording landed in the same edit, so the assertion cannot be transcribed.** EC-09 now requires "one message, naming the root **and whether it was absent or unreadable**" — the absent/unreadable distinction is part of the message. AT-27's new *And* clause asserts that over an absent root and over an unreadable root "both modes exit 1 carrying **the same root message**". A test author must choose: two byte-identical strings (which falsifies EC-09's distinction) or two strings differing in that clause (which falsifies AT-27's literal reading). The trailing "— not a not-found message" suggests the intent is the weaker contrast against EC-01, but the sentence as written asserts identity. Fix: state the oracle as the pair EC-09 actually promises — both messages name the root, both carry the correct absent/unreadable clause, neither is EC-01's not-found message — so all three conjuncts are positive and no two of them fight. | AT-27, EC-09 |
| F-03 | Medium | Local | **AT-13's fixture names a real repository path and then requires a file that is not in it, with no statement of how the two reconcile.** The *Given* is "`docs/completed/pdlc-wave-resume/`, which carries `POSTMORTEM-PR-pdlc-wave-resume.md` … **alongside a copied** `POSTMORTEM-P-some-other-feature.md`", and the companion half is "the same file with `RESOLVED: no`". Neither file exists in that directory at HEAD (its contents are the eight artifacts plus the one post-mortem), and REQ-STATS-08 forbids the command writing — but nothing forbids the *test* writing, which is exactly the trap: a test author reading this literally may add fixtures under `docs/completed/` and pollute the tree the other real-path ATs (AT-09, AT-10, AT-18) measure. The §6 preamble makes real paths "checkable against a tree that already exists", which this fixture is not. Fix: say it explicitly — the directory is copied into a temporary root and the two extra files are added to the copy, with the `resolved` literal carried over from the real bytes. One clause; the falsifying-pair design is right as it stands. | AT-13, §6 preamble |
| F-04 | Medium | Local | **BR-20 now promises a JSON document on the not-found path, but no rule gives that document a shape, and AT-23's oracle is a distinguishability claim rather than a key set.** The edit widened BR-20 from "in `--json` mode, stdout is exactly one well-formed JSON document" to "on any path that produces a report **or a not-found result**". BR-30 and AT-23 — unchanged this round — describe that payload only as "a well-formed error object" the caller "can distinguish from a feature with no artifacts". There is no literal to transcribe: BR-21's five-key set-equality governs the success document only, so a test can assert nothing stronger than "parses, and isn't the success shape" — an absence-shaped oracle on the one JSON path a machine consumer hits when it is wrong. Under REQ-STATS-02's stability requirement this is the shape most likely to drift unnoticed. Fix: give the error object its own key set in §4.4 (e.g. exactly `schemaVersion`, `error`, `feature`) and make AT-23's JSON half a set-equality on it. | BR-20, BR-30, AT-23, §4.4 |
| F-05 | Low | Local | **AT-25's five-row conjunct has no baseline, in a section whose own preamble demands literals.** The *Given* places "the other five document types … at known indices" and the *Then* asserts they "carry their measured indices unchanged" — unchanged against nothing the test can read. The fixture is constructed, so the author picks the indices; naming them makes the conjunct a transcription rather than a tautology, and makes the real risk falsifiable: an implementation that lets one role's collision poison the whole metric. Fix: state the five indices as literals in the *Given* and repeat them in the *Then*. | AT-25 |
| F-06 | Low | Local | **§6.11's EC table credits EC-14 to AT-13, which carries no EC-14 case.** EC-14 is the absent, duplicated or unparseable `RESOLVED:` marker. AT-13's two halves both carry a single well-formed marker (`yes`, then `no`); the duplicated-marker case lives in AT-14 alone, which the row already names. The extra credit is harmless to behavior but overstates coverage in the table this round added precisely to stop that. Fix: drop `AT-13` from the EC-14 row. | §6.11, EC-14 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Is the "same root message" in AT-27 meant as byte-identity across the absent and unreadable conditions, or as "a root message rather than a not-found message"? EC-09's absent/unreadable clause makes the two readings mutually exclusive. (F-02) |
| Q-02 | Does the `--json` not-found error object have a fixed key set, and if so is it hoisting `schemaVersion` like the success document does? A caller that must branch on `error` needs the same stability guarantee REQ-STATS-02 gives the success shape. (F-04) |
| Q-03 | Is AT-13's fixture a copy of `docs/completed/pdlc-wave-resume/` into a temporary root, or the real directory with the two extra files somehow supplied out of band? (F-03) |

## Positive Observations

- **Every one of the three blocking findings was closed with a rule *and* an oracle, not a rule alone.** F-01 could have been answered with D-8's paragraph; it also landed AT-09's real-path half with three literal conjuncts. F-02 could have been answered with BR-23's third key; it also landed AT-19's "three, no more" set-equality plus the `unclassified` ↔ marked-rows agreement in AT-06's fleet half. That is the difference between a document that has decided something and a document a test can be written from.
- **The §6 preamble generalises F-03's fix instead of patching the one AT.** "A real-path test states its expectation as a **literal**, never as 'whatever the mechanism derives' — an expectation computed by the code under test agrees with a wrong implementation" is the rule, and the re-measurement licence beneath it ("permitted to be re-measured when the archive changes; what is not permitted is replacing the literal with a derivation to avoid re-measuring it") anticipates exactly the pressure that would otherwise erode it when `docs/completed/` next moves. Both AT-10 and AT-12 were converted in the same edit, so the rule ships with its instances.
- **AT-13's companion fixture states *why* the pair falsifies.** "An implementation that returns one classification for every input passes either half alone and fails the two together" is the reasoning a test author usually has to reconstruct, written down where it will survive into the TSPEC. AT-15's removal probe carries the same explanation for set-equality versus containment, and AT-02's byte-identity replacement names the failure mode it defeats (a merged read deduplicating by basename).
- **§6.11's two tables turn coverage into a mechanical check.** BR-01…BR-30 and EC-01…EC-21 each appear exactly once, with the one deliberate non-coverage (EC-03 as a rule-only edge) called out rather than silently omitted. A rule added to §4 without an AT is now visibly a missing row, which is what made F-01 and F-06 above cheap for me to find — the document does the enumeration work its reviewer would otherwise do by hand.
- **§7.3 routes the upstream half of F-01 as an erratum instead of quietly fixing it downstream.** D-8 follows REQ-STATS-03 literally, records the cost in the same breath ("a pipeline-authored artifact reading as 'malformed'"), and hands the wording decision back to the REQ. Inventing a third bucket here would have been an independent parsing rule and a C-5 divergence in one move; the document declines both and says so.

## Recommendation

**Approved with minor changes**

No open High findings. All three of v1's blocking findings are resolved, each with the rule and the
falsifiable oracle, and the revision broke nothing I had approved: the coverage tables added this
round are complete, the new ATs (AT-25 through AT-28) close the seven previously untested edge
cases, and the real-path literals I re-measured against HEAD (four `REVIEW` files and TSPEC `6` in
`pdlc-advisory-wave-gate`, TSPEC `13` in `pdlc-headless-engine`, `RESOLVED: yes` at line 3 of the
`pdlc-wave-resume` post-mortem, PLAN-only `pdlc-halt-hardening`) all hold.

The four Mediums are single-clause edits and none contests a decision the FSPEC was right to make.
Two are ordinary oracle hygiene on material this round introduced (BR-13's newly-named collation has
no multi-halt fixture, F-01; AT-25 asserts "unchanged" against no baseline, F-05). Two are worth
landing before TSPEC because they are the kind of ambiguity that becomes an arbitrary implementation
choice: AT-27 and EC-09 disagree about whether the absent and unreadable root messages are the same
string (F-02), and BR-20's newly widened promise of a JSON document on the not-found path meets a
payload with no defined key set (F-04) — the one machine-readable shape a consumer hits when
something is wrong, and the only JSON path whose oracle is currently absence-shaped. F-03 is a
fixture-construction clause that also protects the other real-path ATs from a polluted tree.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 4, "low": 2}
