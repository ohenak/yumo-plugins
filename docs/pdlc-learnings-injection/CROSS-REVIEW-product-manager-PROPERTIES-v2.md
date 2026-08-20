# Cross-Review: product-manager — PROPERTIES

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/PROPERTIES-pdlc-learnings-injection.md`
**Date:** 2026-08-20
**Iteration:** 2

## Verification

Delta scope: `git diff e2ccaa8..HEAD` on the document — 326 changed lines over ten commits
(`ffb05bd3` … `f10dbd43`). Only the changed sections were re-read. Every measured claim the delta
introduces was re-measured against the repository at HEAD on `feat-pdlc-learnings-injection`, not
read off a document.

| Claim the delta introduces | Re-measured at HEAD |
|---|---|
| §F.3: FSPEC BR-6's five names are `Cross-Feature Patterns`, `Non-Convergences`, `Rejected Proposals (with rationale)`, `Process Learnings`, `Open Items for Consolidation`, plus never-injected `Approval Record` | Verbatim match against FSPEC §BR-6's priority table (`FSPEC-pdlc-learnings-injection.md`, "BR-6 — What is injected from a document") — all six names and the `**never**` marker |
| §F.3 / PROP-BOUND-08: all 9 corpus documents carry the five headings in the `## N. Title` form, **9 of 9** for each; **0 of 9** carry a bare `Rejected Proposals` or bare `Open Items` | Exact-line `grep -qxF` over the 9 paths `LS_FILES_ARGV`'s two globs return: `## 1. Non-Convergences` 9, `## 2. Cross-Feature Patterns` 9, `## 3. Rejected Proposals (with rationale)` 9, `## 4. Process Learnings` 9, `## 5. Open Items for Consolidation` 9, `## 6. Approval Record` 7. The v1 measurement is now correct in both directions |
| PROP-DISPATCH-08: `dispatchAndVerify` has exactly two call sites — `reviewLoop`'s `wrapped` closure and `main()`'s `wrappedDispatch` | `grep -n "dispatchAndVerify("` returns three hits in `orchestrate-dev.js`: the definition, plus the `const wrapped = (…) => dispatchAndVerify({` closure inside `export async function reviewLoop({`, and `const episode = await dispatchAndVerify({` inside `async function wrappedDispatch({…})`. Exactly two call sites, both as named |
| PROP-DISPATCH-08: the wave path calls `agentFn("se-implement", waveImplementPrompt(task, featureName), …)` directly, and `PHASE_DISPATCH`'s comment names the four families sitting outside | Both hold: the direct `agentFn("se-implement", waveImplementPrompt(task, featureName)` call exists, and the comment above `PHASE_DISPATCH`'s constants reads *"four dispatches sit outside it — the ship-pr rebase/PR calls, the wave-mode se-implement and se-author calls, the DOD verify/remediate pair and the harvest distil call"* — the four families the property excludes, named by the module itself |
| §O.7: the per-document bound binds **9 of 9** locally, documents running 19,340–50,695 bytes of source against a 6,000-byte `maxBytesPerDocument` | `wc -c` over the 9 corpus paths returns exactly 19,340 … 50,695. Stronger than stated: extracting only the five priority sections leaves 13,196 … 41,180 bytes per document, so the bound binds 9 of 9 on **material** too, not only on source. The upper figure matches FSPEC BR-5's own "max 41,180" |
| §Fixtures: `BYTES-BINDING` = 8 documents × 7,000 injectable bytes under §4.1's declared values, expected split 3 contributing / 5 `RSN-BYTES` / 0 `RSN-COUNT` | REQ §4.1 declares `maxDocuments` 5, `maxBytesPerDocument` 6,000, `maxTotalBytes` 20,000. Each document bounds to 6,000; 3 × 6,000 = 18,000 ≤ 20,000 and a fourth would reach 24,000 — the split is arithmetically forced, and 3 < `maxDocuments` is exactly PROP-BOUND-02's claim |
| §C.4: 69 properties; fourteen new test files over fourteen PLAN manifest rows | 69 distinct `PROP-` bullets in `## Properties`, no duplicate id, matching §Overview and §C.4. PLAN §File-ownership manifest's arithmetic paragraph states "fourteen test rows over fourteen files"; the twelve suites plus `helpers/learningsFixtures.js` and `fixtures/learnings-baseline/` enumerated in §C.4 are those fourteen, and `ls pdlc/workflows/__tests__ \| grep -i learnings` is still empty at HEAD |
| §Overview pyramid: 16 / 3 / 16 = 35, `learningsRecord.test.js` straddling | TSPEC §T.5's table sums 2 + 9 + 3 + 3 + 6 + 12 = 35 with AT-20/AT-22 marked L3 — so L3 = 12 + 2 + 2 = 16, L2 = 3, L1 = 9 + 3 + 4 = 16. The document's figure and TSPEC's now agree |
| §Properties: `F-O-8` removed from PROP-BOUND-01's trace | Correct removal, not a coverage loss: `F-O-8` appears **nowhere** in FSPEC, TSPEC or PLAN — the v1 trace cited an id that does not exist upstream |

Mechanical checks over the whole document, since the delta rewrote the coverage matrix: all 25 REQ
acceptance criteria still carry ≥1 property after the five padded rows were struck; every property
in `## Properties` appears in §C.3's red/green ownership table (allowing for its range notation), so
the "Properties with **no** owning task | 0" row still holds at 69; and the new bidirectionality rule
§C.2 declares holds on 22 of its 25 rows (the three exceptions are F-01 below).

## Disposition of v1 findings

| v1 | Severity | Status | Evidence |
|----|----------|--------|----------|
| F-01 | High | **Resolved** | §F.3 now transcribes the five names from FSPEC BR-6's table verbatim, including `Rejected Proposals (with rationale)` and `Open Items for Consolidation`, states the numbered `## N. Title` form BR-6 calls out, and replaces the falsified sentence with the true measurement (9 of 9 for each of the five; 0 of 9 for the bare forms) — which I re-measured and confirm. PROP-BOUND-05's third name is corrected. The structural half is closed too: **PROP-BOUND-08** drives `extractInjectableMaterial` over a real corpus document read from the live `LEARNINGS_CORPUS_ARGV` output, asserts the returned section set equal to the intersection of BR-6's names with the headings that document carries, requires that set non-empty, and asserts the document's own heading lines present in the fixture text. That is exactly the arm a fixture-and-matcher pair drifting to a common wrong spelling cannot green. It is owned red LI-08 / green LI-17 and carries no AT id, so §T.5's 35-member partition and `LI-T-SUITEMAP`'s disjointness are untouched |
| F-02 | High | **Resolved** | **PROP-META-06** now mechanises AC-6.1's first clause: over PROP-META-05's static directory walk, every enumerated `learnings*.test.js` file must be shown to construct a scripted double and none may reference a live transport symbol, asserted as set equality over the enumerated files with the walk's non-empty file set as positive control. §C.2's AC-6.1 row is rewritten clause by clause — clause 1 to PROP-META-06, clause 2 to PROP-ORDER-05's two-process comparison — and the misattributed "PROP-META-01 (no live-run comparison)" is gone. PROP-ORDER-05's text does assert what clause 2 requires (two compositions, two separate process invocations); only its trace line still omits the AC id (F-01 below, Low) |
| F-03 | Medium | **Resolved** | §Overview reads **69 properties** and §C.4 reads 69 with its provenance ("66 at v1, plus PROP-DISPATCH-08, PROP-BOUND-08, PROP-META-06"). I counted 69 distinct bullets, no duplicates |
| F-04 | Medium | **Mostly resolved** | All five padded rows are struck, the strike is declared in §C.2's preamble with the bidirectionality rule stated as a rule, and no AC lost its last property — I checked all 25. Three rows still violate the newly declared rule; refiled as F-01 below at Low, since the rule is now written down and the residue is trace-line bookkeeping, not a coverage hole |
| F-05 | Medium | **Resolved** | PROP-RECORD-09 is now instrumented on the same static walk, with the enumerated file set asserted non-empty and set-equal to PROP-META-05's operand as its positive control, and re-homed to LI-14 green-on-authoring (§C.3 updated on both sides: LI-10/LI-19 no longer claim it). §O.1 gains rows for all three static-scan absences plus a paragraph naming their shared vacuity mode. §G.2.3 keeps the prose as commentary rather than as the only home |
| F-06 | Low | **Resolved** | §C.4 now enumerates fourteen rows over fourteen files and says "fourteen", matching PLAN §File-ownership manifest's own arithmetic paragraph, and separately names the two existing files no task edits |
| F-07 | Low | **Resolved** | The pyramid reads 16 / 3 / 16 = 35 with the suite-by-suite derivation and an explicit note that `learningsRecord.test.js` straddles. Matches TSPEC §T.5 |
| F-08 | Low (Process) | **Resolved** | §F.4's four raw `file:line` anchors are gone, replaced by symbol names and, for the probe pattern, the verbatim import line. I found no new raw anchors anywhere in the delta — PROP-DISPATCH-08 states its HEAD measurement by symbol and by quoted comment text |

Three of my four v1 questions are answered in the delta as well: Q-01's framing-byte conflict and
Q-03's mutation-ledger ownership are both now stated as declared gaps in §G.2 (Q-03 explicitly names
PROP-META-04's three-step proof as a one-time **human** procedure recorded in LI-06's completion
note, which is the right place for a reader auditing residual risk), and Q-04's re-capture rule is
now pointed at from §G.2.4 as well as §F.2. Q-02 remains open and is restated below.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Low | Local | §C.2 declares a bidirectionality rule this revision introduced, then breaks it on three of its own rows: AC-1.4 lists PROP-BOUND-07, AC-6.1 lists PROP-META-05 and PROP-ORDER-05, and none of those three properties' trace lines carries the AC id it is credited under | AC-1.4, AC-6.1 |
| F-02 | Low | Local | PROP-BOUND-08's operand is "the first path in UTF-8 byte order" of the live corpus, so the property's non-empty conjunct is hostage to whichever LEARNINGS document happens to sort first; the document does not say what the test does when that document legitimately carries no priority section | AC-2.3, BR-6 |

### F-01 (Low) — the new bidirectionality rule is broken by three of its own rows

§C.2's new preamble states the rule plainly: *"An AC may list a property only if that property's own
trace line carries the AC id; a property whose trace names only `BR-`, `E-`, `C-` or `§` ids is
covered by the BR/AT matrices, not padded into an AC row here."* I applied that rule mechanically to
all 25 rows. Twenty-two pass. Three do not:

| Row | Property credited | Its trace line | Gap |
|---|---|---|---|
| AC-1.4 | PROP-BOUND-07 | *"AC-2.3, AC-2.4, TSPEC §D.5"* | no AC-1.4 |
| AC-6.1 | PROP-META-05 | *"TSPEC §T.5 closure, DoD 1"* | no AC-6.1 |
| AC-6.1 | PROP-ORDER-05 | *"AC-2.5, AT-14"* | no AC-6.1 |

The AC-6.1 rows are the ones worth acting on, and they are cheap. PROP-ORDER-05 **is** the discharge
of AC-6.1's second clause — REQ AC-6.1 requires that *"determinism (AC-2.5) is asserted by comparing
two compositions rather than by inspection"*, and PROP-ORDER-05 asserts two compositions in two
separate process invocations produce byte-identical blocks. The property genuinely earns the row; its
trace line simply never learned about it, which is the exact shape of the v1 F-02 defect one level
down. Add `AC-6.1` to PROP-ORDER-05's trace and the row becomes rule-compliant on the spot.
PROP-META-05's row is honestly labelled in prose ("supports both by keeping the suite set closed"),
but under the rule as written a supporting property still needs the id in its trace — either add it
or move the support claim into the row's prose without naming it in the property list. AC-1.4's
PROP-BOUND-07 is the last of the v1 padding: AC-1.4 keeps PROP-BLOCK-01 and PROP-DISPATCH-05 either
way, so striking the entry costs nothing, and adding `AC-1.4` to the trace is equally acceptable if
the byte-accounting claim really is part of what AC-1.4 asks for.

Filed Low rather than Medium because no AC is left uncovered and the rule that catches this is now
written down in the document itself — a future reviewer can re-run the same check in one pass.

### F-02 (Low) — PROP-BOUND-08's real-corpus operand has an unstated failure mode

The real-corpus arm is the right answer to v1 F-01 and I want it kept. But its subject is chosen from
live repository state: *"read from the live `LEARNINGS_CORPUS_ARGV` `git ls-files` output (first path
in UTF-8 byte order, not a synthetic fixture)"*. Today that resolves to
`docs/completed/pdlc-advisory-tier/LEARNINGS-pdlc-advisory-tier.md`, which carries all five headings
— I verified all 9 do, so the property is green for the right reason today.

What the document does not say is what happens when the first-sorted document is one that
legitimately carries no priority section — a freshly harvested LEARNINGS for a feature with no
cross-feature patterns and no non-convergences is a real product outcome, and BR-6 has `RSN-NO-MATERIAL`
precisely because such documents exist (PROP-BOUND-06 covers that path deliberately). In that state
the "observed set **must** be non-empty" conjunct reds, and it reds for a reason that has nothing to
do with the matcher this property exists to pin. A reader hitting that red is one commit away from
"fixing" it by relaxing the non-empty conjunct — the change that would silently retire the whole arm.

One sentence resolves it: state the selection rule as *the first path in byte order that carries at
least one BR-6 heading*, with the assertion that at least one such path exists in the corpus as the
enclosing positive control. That keeps the fixture-and-matcher-drift property exactly as strong —
the matcher still faces a real document written by the real harvest skill — while making the red mean
only what it should mean.

## Questions

| ID | Question |
|----|---------|
| Q-01 | (Carried from v1 Q-02, still open.) PROP-CORPUS-03 pins `docs/discarded/LEARNINGS-x.md` as **injected** while `docs/discarded/{p}/LEARNINGS-{p}.md` is excluded, because `LS_FILES_ARGV`'s globs happen to admit the direct child. The property is right to pin what the predicate does; the *product* question — should a discarded feature's learnings reach an author's prompt at all? — still has no home in FSPEC BR-2, and today's answer is discoverable only by reading a glob. Is that intentional faithfulness, or a decision nobody has taken yet? |
| Q-02 | PROP-META-06 asserts every enumerated suite constructs its agent through "a `_agent` injection or `makeAgentDouble`-shaped helper". The expected side of that assertion is a *shape*, not a literal — what stops it from being satisfied by a future helper that is `makeAgentDouble`-shaped in name and live in behaviour? A named allow-list of double constructors, transcribed by hand and asserted set-equal, would be the same discipline §F.3 applies to the three catalogues. |
| Q-03 | §C.3 now hangs three properties (PROP-META-05, PROP-META-06, PROP-RECORD-09) on LI-14's single directory walk, and §C.4's "no property has no owning task" row counts them as owned. PLAN's LI-14 row describes only `LI-T-SUITEMAP`. Routed as a PLAN erratum below — but is the intent that LI-14 grows two assertions inside the existing suite, or that they become two additional `LI-T-*` tests? The suite-map closure keys on `LI-AT-` titles only, so either shape is safe for the partition; the PLAN row should say which. |

## Positive Observations

- **The F-01 fix went past the transcription to the mechanism.** Correcting five names would have
  satisfied the letter of the finding. Adding PROP-BOUND-08 — a real corpus document, the section set
  as an intersection rather than a fixed expectation, the heading lines asserted present, and the
  explicit statement that *"a synthetic fixture structurally cannot falsify it"* — closes the failure
  mode the wrong names were only a symptom of. This is the arm that stops the feature shipping green
  and inert, and it costs no AT id.
- **PROP-DISPATCH-08 converts four unfalsifiable conjuncts into one falsifiable invariant.** The v1
  PROP-DISPATCH-03 asserted byte-identity for dispatch families whose path never reaches the
  composition site — true by construction, therefore not an oracle. Scoping PROP-DISPATCH-03 to the
  population the `_recordDocType` probe actually observes, and asserting the call-graph fact
  separately as a two-member set equality, is the right split. The follow-on sentence is the valuable
  half: *"if a later change routes implementation or DoD through `dispatchAndVerify`, this property
  reds and someone must decide whether those dispatches inherit injection."* That is a product
  decision being routed to a human by a test, which is what these properties are for.
- **PROP-BOUND-07 now names the identity it refuses to write.** *"`bytesInjected ===
  Buffer.byteLength(material)` where `material` is what the extractor returned is an identity no
  implementation can fail"* — and the fix is not just "use literals" but *state the framing cost as
  its own literal so the test proves the two numbers differ*. That is the no-implementation-echoes
  discipline stated precisely enough for the next author to apply it without me.
- **The premise table is now honestly labelled capture-time.** Naming the two rows this PLAN's own
  tasks will falsify on schedule, and tying that to why PROP-META-01 forbids absence assertions, turns
  a table that would have rotted into one whose rot is specified.
- **The 87-of-89 figure is now sourced rather than asserted.** Marking it inherited from FSPEC BR-5's
  two-repository measurement, noting a divergent re-derivation is on record, and then standing the
  argument on the locally checkable 9-of-9 instead is the right move: I re-measured the local claim
  and it holds on material bytes as well as source, which the document does not even need to claim.
- **§O.1's new paragraph names the shared vacuity mode of the three static scans.** *"Their vacuity
  mode is not an unexercised branch — it is a scan that located nothing"* is the sentence that keeps
  PROP-FOOTPRINT-04's planted-token negative control from looking like belt-and-braces.

## Recommendation

**Approved with minor changes**

Both v1 High findings are resolved, and resolved at the mechanism rather than at the wording: BR-6's
names are now FSPEC-verbatim with a re-measurement I confirmed 9 of 9, and PROP-BOUND-08 gives the
recognition rule a real-corpus arm a synthetic fixture cannot false-green; AC-6.1's first clause is
mechanised by PROP-META-06 and its second correctly attributed to PROP-ORDER-05, with the
misattribution struck. All four Medium/Low findings are addressed, one of them (F-04) with a residue
I refile at Low. Nothing in the delta broke what I approved at v1: all 25 REQ acceptance criteria
still carry at least one property, all 69 properties still carry an owning task, the AT partition is
still 35 with no property claiming an AT id it should not, and the pyramid now agrees with TSPEC §T.5
where at v1 it did not.

Worth taking in the next pass, neither gating:

1. **F-01** — add `AC-6.1` to PROP-ORDER-05's trace line (it earns the row), and either add the id to
   PROP-META-05's trace or drop it from the property list in that row; strike or justify AC-1.4's
   PROP-BOUND-07 entry. Three one-line edits that make §C.2's own rule true of §C.2.
2. **F-02** — restate PROP-BOUND-08's subject as the first corpus path in byte order **that carries at
   least one BR-6 heading**, so its non-empty conjunct cannot red for a reason unrelated to the matcher.

One upstream item is routed as an erratum in this dispatch's final message and is **not** counted
against this document: PLAN's LI-14 row mandates only `LI-T-SUITEMAP`, while this revision hangs
PROP-META-06 and PROP-RECORD-09 on that task's directory walk. The properties name the right owner;
the PLAN row has to grow the two assertions or an implementer following the PLAN will not write them,
and AC-6.1's only mechanised oracle would go missing. The four upstream defects routed at v1 remain
open and are recorded in §G.3.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 2}

APPROVAL-HASH: sha256:fe50242a965b21b7e8d5c9482c22c1baa43aa159f41eca3447000fbc95baa9c8
APPROVAL-HASH-NORMALIZED: sha256:fe50242a965b21b7e8d5c9482c22c1baa43aa159f41eca3447000fbc95baa9c8
REVIEWED-COMMIT: f10dbd43e6eded4f6ecbb7f9b7ae8bc2b7a53e89
UPSTREAM-STATE: REQ sha256:ff605dd373ded6dce3ee18212ecd44c0ad38dd1e669fe6100ba29f6dd92e84dd
UPSTREAM-STATE: FSPEC sha256:fb18dbda1cef8497143e931894d09b83871657b9c8108305948cc03566b0727c
UPSTREAM-STATE: TSPEC sha256:f629d29d23386297f5e3ec490530f7ed6b697ec63c56acf6711d7fee14a530d5
UPSTREAM-STATE: DECISIONS sha256:85888c03f8ee43c2e50dd26bea040d3a1716180f17dd1f582dc86e0ac736d5b6
UPSTREAM-STATE: PLAN sha256:20f574e24e8e390b6d495e3d1e4c56c1b1a2a54374e24b90c0f175f34ba4d508
