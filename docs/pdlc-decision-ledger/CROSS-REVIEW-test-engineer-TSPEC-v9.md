# Cross-Review: test-engineer — TSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/TSPEC-pdlc-decision-ledger.md` (v0.8)
**Date:** 2026-08-29
**Iteration:** 9 (delta confirmation on Phase P's five-item erratum)

## Overview

**Upstream: unmoved, and re-checked rather than assumed.** I recomputed both digests at HEAD:
REQ `sha256:ce6b133f…3c7b7c`, FSPEC `sha256:2bd5c3ef…5aed39`. Both are byte-identical to the
`UPSTREAM-STATE` anchors on my round-8 approval, so the compression question DEC-ERR-03 asks —
"does this document still say what upstream says?" — has the same answer it had at round 8 for
every section this delta did not touch, and for the sections it did touch I re-read the upstream
each new sentence leans on (FSPEC §6.1's failure table, REQ NG-4 / BR-11, REQ-DECLEDGER-02 / AT-04)
against the changed text. No citation in the delta attributes anything to upstream that upstream
no longer says.

**Scope of this round.** The delta is five TSPEC commits — `039555ea9`, `d462a9475`, `471d3a4b9`,
`396a7b0f3`, `cc2c09e53` — +153 / −13 against `277db8b27`, the commit I last reviewed. Every
insertion is inside §7 or the changelog; I confirmed by diff that no section outside §7 moved, so
§§1–6 and §§8–9 are not re-litigated here. I verified each landed claim against the shipped code it
cites rather than against the prose that asserts it: `pdlc/workflows/package.json`,
`pdlc/workflows/scripts/check-wave-resume-delta-coverage.mjs`, `orchestrate-dev.js`'s
`buildFinalReport` / `learningsInjectionField` sites, and `.claude/pdlc.config.example.json`.

**The one-line answer.** All five routed items landed, four of them in the strongest available form.
But the fix to item 5 was applied to a single member of a set whose siblings fail the *same*
satisfiability test the fix itself articulates, so §7.3's census remains an oracle that cannot go
green on conforming code. That is a High I did not catch in earlier rounds — it is inherited, not
introduced here — and it is why this confirmation does not approve.

## Architecture

Nothing in §§2–6 changed, and the delta introduces no new component, seam or dependency edge. What
it changes is *which evidence the design claims for the components already specified* — three
additions, each of which alters the test-obligation graph rather than the module graph:

1. **A live composition-root arm** is added to §7.2's category table and given a rationale
   paragraph. This is a new test level for `main()`, previously owed only §7.3's source census.
2. **Two properties** (`P-REC`, `P-LINE`) are promoted into §7.5, which previously carried only
   O-8's bounds invariant. Both target pure functions §7.1 already exercises, so no new seam and no
   new double: the addition is genuinely free at the architecture layer.
3. **One census token is removed**, narrowing §7.3's forbidden set from seven members to six.

The first two strictly enlarge the evidence the design claims; the third strictly narrows it. That
asymmetry is worth naming, because it is where this round's residual risk sits — a narrowing
justified by an argument that was not swept across the rest of the set.

## Interfaces

The seams the delta now leans on, each checked against HEAD rather than against the citation:

| Seam / contract the delta cites | Claim in the delta | Verified at HEAD |
|---|---|---|
| `npm run test:coverage` | "four `&&`-joined clauses" | ✅ `pdlc/workflows/package.json:9` — `c8 npm test` / `c8 report --reporter=json` / `node scripts/check-wave-resume-delta-coverage.mjs` / `c8 report --check-coverage --per-file --branches 85`. The ordinals the delta assigns (**third** = delta gate, **fourth** = percentage floor) are correct |
| `check-wave-resume-delta-coverage.mjs` `SUBJECT` | hard-coded to `pdlc/workflows/orchestrate-dev.js` | ✅ `export const SUBJECT = "pdlc/workflows/orchestrate-dev.js"` |
| its `resolveBase()` | "prefers the live `merge-base HEAD origin/main`", pinned sha only as fallback | ✅ it loops `["origin/main", "main"]` taking `git merge-base HEAD <ref>`, falling back to `PINNED_BASE_SHA` only when neither ref resolves. So on this branch the ranges are *this* feature's own delta, exactly as claimed |
| its fail-closed set | fail-closed on subject-absent-from-checkout and absent-from-report; empty range set is a **pass** | ✅ both `fail(...)` sites exist; the empty-range branch returns 0 with a "no delta in range" log. The delta's warning — "nothing this feature adds may rest on the empty-range reading" — is the right operational gloss |
| dirty-tree behaviour | *warns*, does not fail | ✅ `git diff --quiet HEAD -- SUBJECT` → `error(...)` then continues |
| wave gate `implementation.testCommand` | plain `npm test`, does **not** include the script | ✅ `.claude/pdlc.config.example.json` → `(cd pdlc/engine && npm test) && cd pdlc/workflows && npm test -- …`. So the delta's consequence — PLAN T-18 owes a per-wave manual run — is load-bearing, not belt-and-braces |
| c8 `include` list | names `**/pdlc/workflows/orchestrate-dev.js` as a single file | ✅ first entry of the `include` array |
| `main()`-driving precedent suites | `advisoryDisabled`, `advisoryWaveGateMain`, `anchorCascade`, `branchGuard`, "~20 further" | ✅ all four exist; 64 of the 156 suites reference a `main(` call, so "~20 further" is conservative |
| `learningsInjectionField` / `buildFinalReport` | field spread at "~six" call sites, all outside `main()`'s wiring sentinels | ✅ six `buildFinalReport(` call sites (`orchestrate-dev.js`:16725, 16742, 16767, 16791, 18294, 18326) and six `learningsInjection: learningsInjectionField` spreads. The routed item said *eight*; the TSPEC says *six* and the TSPEC is right — it did not copy the number it was handed |

Two things follow that I want to record as reviewed rather than assumed. First, the delta's central
factual claim — that the percentage clause is blind to this feature while the delta clause is not —
is *true and load-bearing*: the subject file measures 18,509 lines / 836,091 bytes, so §6.1's
fourteen failure rows could be wholly uncovered without moving the per-file ratio, while every one
of those same lines sits inside a post-image hunk range the third clause reads. Second, `SUBJECT`
being this feature's *only* production file is what makes the gate total rather than partial; D-6
carries that claim and §5.3/T-19's config and documentation edits are not source, so the claim holds.

## Data Model

The only data the delta moves is §7.3's two census **operands**, and that is where both Highs live.
No literal changed: 6,305 / 10,859 / 12,059 / 441 are unchanged at all sixteen sites, and I re-ran
the arithmetic once more (`12,500 − 1,200 = 11,300`; `11,300 − 10,859 = 441`) to be sure the token
edit did not disturb §7.3's conjunct pair. It did not.

**Operand 1 — the forbidden token set, after the edit.** Six members: `selectDecisions`,
`recogniseDecisionRecords`, `renderDecisionLedgerBlock`, `gatherDecisionCorpus`,
`DECISION_LEDGER_OMIT_REASONS`, `DECISION_LEDGER_CORPUS_OUTCOMES`.

**Operand 2 — the scanned source: everything minus four owned regions.** Three brace-matched
slices (`parseDecisionLedgerConfig`, `buildDecisionLedgerInjector`, and the
`selectDecisions`/`recogniseDecisionRecords`/`renderDecisionLedgerBlock` group) plus the
sentinel-bounded `main()` wiring run.

The edit's own test of satisfiability, stated in the new paragraph, is exactly right: *a token is
unsatisfiable when the conforming sites that mention it land in the scanned remainder.* Applying
that test to the surviving six against the declarations §4 and §5.2 actually specify:

| Token | Where conforming code declares / mentions it | Inside an owned region? |
|---|---|---|
| `selectDecisions` | own body (sliced); called inside `buildDecisionLedgerInjector` (sliced) | ✅ |
| `renderDecisionLedgerBlock` | own body (sliced); called inside `buildDecisionLedgerInjector` (sliced) | ✅ |
| `recogniseDecisionRecords` | own body (sliced) — **but §4.4 has `gatherDecisionCorpus` call it**, and `gatherDecisionCorpus` is not a sliced region | ❌ |
| `gatherDecisionCorpus` | **§4.4 declares it as a sixth top-level export.** Its declaration line and whole body are in none of the four regions | ❌ |
| `DECISION_LEDGER_OMIT_REASONS` | **§5.2 declares it as a top-level frozen literal**, outside all four regions | ❌ |
| `DECISION_LEDGER_CORPUS_OUTCOMES` | same | ❌ |

Four of the six therefore occur in the scanned remainder on a *correct* implementation, so
"zero occurrences of any member in the scanned remainder" cannot go green. This is F-01, and it is
the same defect class the round just repaired for `decisionLedger` — the fix named the principle
and applied it to one member without sweeping the set. The carve-out list enumerates five
declarations; §4 declares six functions and §5.2 three catalogues.

**The companion set-equality is red for the mirror reason (F-02).** It asserts
`DECISION_LEDGER_CENSUS_TOKENS` set-equal to "the module's exported decision-ledger symbol names".
Enumerating those from §3.1/§3.2/§4/§5.2 gives at least thirteen — `DECISION_CORPUS_ARGV`,
`DECISION_HEADING_RE`, `DECISION_LEDGER_DEFAULTS`, `parseDecisionLedgerConfig`,
`recogniseDecisionRecords`, `selectDecisions`, `renderDecisionLedgerBlock`, `gatherDecisionCorpus`,
`buildDecisionLedgerInjector`, `DECISION_LEDGER_OMIT_REASONS`, `DECISION_LEDGER_CORPUS_OUTCOMES`,
`DECISION_LEDGER_NOTICES`, `DECISION_LEDGER_CENSUS_TOKENS` itself — against a six-member set. The
new paragraph's closing clause, "the field name is not an exported symbol, so its removal also
keeps the companion set-equality check exact", is directionally true about `decisionLedger` and
does not make the check satisfiable: it was already unsatisfiable in the other direction, by seven
members. Both Highs are inherited — the pre-round bytes carried the same carve-out list and the
same four tokens — and both sit in the row this edit rewrote, so both are `inherited` + `local`.

The fix is small and belongs to the same author in the same section: name the predicate the census
actually wants. Either (a) restrict the token set to symbols whose *every* conforming mention is
inside an owned region — which is `selectDecisions` and `renderDecisionLedgerBlock`, and then say
so and drop the set-equality to a **subset** relation with a stated reason; or (b) keep the six and
extend the owned regions to `gatherDecisionCorpus`'s brace-matched body and §5.2's three catalogue
declarations, and restate the set-equality against the *distinctive* exported names rather than all
of them. (b) preserves more of BR-11's falsifying power and is the smaller edit to the table.

## Test Strategy

### Item-by-item

| Routed item | Landed | Evidence and verdict on the form |
|---|---|---|
| 1 & 3 — §7's coverage-gate claim omitted the delta-coverage clause (te-review, se-author) | **Yes, and in the better form** | TSPEC:989–1017. The old sentence is not softened, it is *bounded*: the percentage clause is still declared not-evidence, and the reason is stated numerically (one file, ~817 KB, fourteen rows could be uncovered without moving the ratio). Then the third clause is introduced as the evidence that *is* live, with `SUBJECT`, `resolveBase()`, the JSON-report read and the exit-1 condition each stated as the script implements them. The closing sentence is the one that matters — "the percentage clause is insensitive to this feature, and the delta clause is sensitive to nothing else in it" — because it converts two facts that look contradictory into a single coherent coverage story. Every claim in the paragraph checks out against the script (see **Interfaces**) |
| 1 & 3, consequences | **Yes** | The three bullets at TSPEC:1010–1017 are the operationally load-bearing half: fail-closed set enumerated (and correctly limited to the two genuinely broken readings), non-membership in `implementation.testCommand` with PLAN T-18 named as the owner of the per-wave manual run, and the commit-before-running rule with the reason (HEAD line numbers vs working-tree measurement). I checked the third against the script's `dirty` branch: it warns and continues, exactly as described. A spec that had only said "the delta gate covers us" would have left all three to discovery at batch 8 |
| 2 — no live composition-root arm (se-author, DC-07) | **Yes, in the exact form DC-07 requires** | TSPEC:1060 adds the category row; TSPEC:1066–1090 states the obligation. The rationale is the correct one and is stated as a falsifier list, not an assertion: a transposed argument, a seam under the wrong key, an un-`await`ed injector, or a wiring block placed after the last `reviewerPrompt` call each leave the census green and the feature dead. The three conjuncts are the shape my lens asks for — (1) a **call-count spy** on the scripted `_git` seam asserting `gatherDecisionCorpus`'s listing call fires **≥ 1** on the served flow, with the note that a fake of the outer interface cannot satisfy it (this is DC-07's runtime oracle, not a restatement of it); (2) **positive presence** — the prompt actually handed to a dispatch *ends with* the rendered block, explicitly not "differs from baseline"; (3) flag-off proved by **three positive conjuncts** against §7.4's committed recording as an independent referent, with `report` key set and notice set both asserted by **set equality** rather than by absence. There is no absence-only oracle anywhere in the arm. PLAN T-10a is named as owner and exists in PLAN v0.3 (:112) in the same shape |
| 4 — §7.5 owed two more properties (se-author) | **Yes** | TSPEC:1388–1425. `P-REC` quantifies §3.2's five conjuncts, the verbatim-substring claim and §3.3's last-wins resolution over arbitrary text, with a generator description that actually reaches the near-misses (wrong ATX depth, missing separator, empty statement, duplicate ids at varying distance, carrier markup mid-line) and **one falsifying mutation per conjunct**. `P-LINE` quantifies §4.3's one-physical-line-per-decision claim and — this is the part that makes it worth having — states *why* it is load-bearing: §7.3's "63 index lines joined by `\n` = 10,859 bytes" silently assumes 63 *physical* lines, so a statement carrying a newline moves both the count and the byte total with every test green. That is a real false-green channel closed. Both properties inherit O-8's independent-model discipline and cost no new seam or double |
| 5 — `decisionLedger` census token unsatisfiable (se-author) | **Yes for the token; the reasoning was not swept across its siblings** | TSPEC:1245–1260 drops the token and, better, writes down *why* — the `learningsInjectionField` analogue's six `buildFinalReport` sites sit outside the wiring sentinels, so conforming code would red the census. It also rejects the tempting alternative (carving out `buildFinalReport`) with the right reason: that carve-out blinds a far larger surface than the field name is worth. And it re-homes the field's obligation behaviourally onto §7.2's live arm and §7.6's AT rows rather than dropping it. My only objection is scope of application — see **Data Model**, F-01/F-02 |

### The obligation table, checked rather than skimmed

§7's `F-1…F-14` mapping (TSPEC:1023–1029) is the substitute the spec offers for a percentage floor,
so I checked it is total rather than illustrative: §6.1 carries fourteen rows, `F-14` is the
no-directory / zero-record row at :935, and the mapping names a test for each. It is checkable by
inspection and each named home exists in PLAN v0.3. The new closing sentence — the delta clause is
the *mechanical backstop* for this table, since a missing row's test leaves an uncovered line inside
the introduced ranges — is the honest statement of how the two evidences compose, and it is the
first time this spec has had a mechanical enforcer for a mapping it previously enforced by review.

### One measured figure is stale

The same paragraph says the per-file ratio is "dominated by ~17k lines of shipped code".
`orchestrate-dev.js` is **18,509** lines at HEAD. The argument is unaffected — at 18.5k the
denominator is larger and the blindness worse — but this spec's discipline elsewhere is that
measured figures are transcribed, not remembered, and the sibling figure in the same sentence
(~817 KB) is exact (836,091 bytes). Low, F-04.

### One downstream consequence of the fix

Dropping `decisionLedger` from the token set makes TSPEC §7.3 and **PLAN v0.3 T-11** disagree:
T-11 (PLAN:113) still transcribes the seven-member set including `decisionLedger`. The PLAN is
downstream of this document and the literal is hand-transcribed there, so unless it is re-pinned the
implementer writes the set the TSPEC just proved unsatisfiable. Filed Medium (F-03) as a delta
consequence rather than a PLAN review finding, because the erratum edit is what orphaned it.
Whoever fixes F-01/F-02 should re-pin T-11 in the same pass, since the token set will move again.

## Open Questions

| ID | Question |
|----|---------|
| Q-01 | For F-01, which repair do you want — (a) narrow the token set to symbols whose every conforming mention is inside an owned region, or (b) extend the owned regions to `gatherDecisionCorpus`'s body and §5.2's three catalogue declarations? I lean (b): it keeps `gatherDecisionCorpus` and the two catalogues watched everywhere they are *not* legitimately used, which is what BR-11 claims. Either way the answer should be written into §7.3 as the predicate, since this is the second round in which the census's satisfiability has been the finding |
| Q-02 | §7.2's conjunct (1) puts the call-count spy on `gatherDecisionCorpus`'s `_git` seam. Is there a reason to prefer `_git` over `_readFile`? `_git` fires once per dispatch regardless of corpus contents, so it proves the *listing* ran; a `_readFile` count additionally proves the corpus was actually opened. Not a finding — the `_git` conjunct is sufficient for DC-07 — but if the arm is cheap to extend, the pair is strictly stronger |
| Q-03 | The delta says the empty-range reading is the gate's "permanent post-merge state on `main`". After this feature merges, does anything re-point `SUBJECT`'s introduced ranges at the *next* feature, or does the gate go permanently quiet for `orchestrate-dev.js` until someone re-pins it? The script's live `merge-base` preference suggests it stays live for every later branch, which would be the good answer — worth one sentence in §7 so the next feature does not re-derive it |

## Positive Observations

- **The coverage paragraph was rewritten rather than patched.** The easy fix for items 1 and 3 was
  to append "…and there is also a delta-coverage script" to the existing sentence. Instead the
  section now explains why both clauses are true at once, which is the form that survives the next
  reader. Naming the ordinals (third, fourth) means a future `package.json` edit that reorders the
  clauses is visibly a spec-affecting change.
- **The three consequences bullets are the durable half of that fix.** Fail-closed set, absence from
  `implementation.testCommand`, and the commit-before-running rule are each things a team learns the
  hard way at PR CI. Writing them into the design, with PLAN T-18 named as owner of the per-wave
  run, is the difference between a gate that helps and a gate that ambushes batch 8.
- **§7.2's live arm is textbook DC-07.** A call-count spy on the dependency's seam, an explicit note
  that an outer-interface fake cannot satisfy it, positive presence rather than "differs from
  baseline", and set-equality on both `report` keys and notices rather than a `not in` check. I have
  filed the absence-only-oracle finding on this feature before; this arm has none.
- **The number that was handed to the author was checked, not copied.** The routed item said the
  `learningsInjectionField` analogue spreads at *eight* `buildFinalReport` sites. There are six.
  The TSPEC says six. That is the small discipline that keeps a spec's factual claims trustworthy.
- **`P-LINE` is the property I would have asked for if it had not landed.** It closes a false-green
  channel under §7.3's own literals: without it, "63 lines = 10,859 bytes" is an assumption the
  transcribed figures silently depend on. Promoting a stated-but-untested quantified claim to a
  property, with named falsifying mutations, is exactly the standard this project holds.
- **Item 5's rejected alternative is recorded.** Saying *why* `buildFinalReport` was not carved out
  is what stops a later author from "helpfully" carving it out and blinding the census.

## Recommendation

**Needs revision**

All five routed items landed, and four of them landed in the strongest available form — I have no
finding against items 1, 2, 3 or 4, and item 5's token removal is correct on its own terms. The
verdict turns on two inherited Highs in the same table row the edit rewrote: §7.3's census cannot
go green on a conforming implementation, because four of its six surviving tokens are declared in
the scanned remainder, and its companion set-equality compares a six-member set against thirteen
exported symbols. Both are `inherited` — they predate this delta and route back to this document's
ordinary revision loop rather than halting the phase — but they are unsatisfiable oracles, which is
the one thing this lens cannot pass. The repair is confined to one table row and one paragraph of
§7.3, plus a re-pin of PLAN T-11 (F-03) once the token set settles. F-04 and F-05 are cosmetic and
can ride along.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | High | inherited | local | §7.3's census cannot go green on conforming code: `gatherDecisionCorpus` (§4.4's sixth top-level export) and `DECISION_LEDGER_OMIT_REASONS` / `DECISION_LEDGER_CORPUS_OUTCOMES` (§5.2's top-level frozen literals) are declared outside all four owned regions, and `recogniseDecisionRecords` is called from `gatherDecisionCorpus`'s unsliced body — four of six tokens occur in the scanned remainder. The same satisfiability test this round used to drop `decisionLedger` was not swept across the surviving set | §7.3, "The census, specified the way the precedent actually works" — Scanned source / Forbidden token set rows |
| F-02 | High | inherited | local | §7.3's companion check asserts `DECISION_LEDGER_CENSUS_TOKENS` **set-equal** to "the module's exported decision-ledger symbol names", but §§3.1/3.2/4/5.2 declare at least thirteen such exports against a six-member set, so the check is red by construction. Restate it as a subset relation with a stated selection rule, or as equality against an explicitly *distinctive* subset | §7.3, Forbidden token set — "How it is kept honest" |
| F-03 | Medium | delta | nonlocal | Dropping `decisionLedger` desynchronises this section from PLAN v0.3 T-11, which still hand-transcribes the seven-member token set including `decisionLedger`; unless T-11 is re-pinned the implementer writes the set this round just proved unsatisfiable | §7.3 ↔ PLAN T-11 |
| F-04 | Low | delta | local | The coverage paragraph says the per-file ratio is dominated by "~17k lines of shipped code"; `orchestrate-dev.js` is 18,509 lines at HEAD. The argument is unaffected, but the sibling figure in the same sentence (~817 KB) is exact, and this spec transcribes measured figures | §7, "Coverage obligation, stated because the shipped percentage clause will not state it" |
| F-05 | Low | inherited | nonlocal | Round 8's F-01 is still open: the v0.6 changelog entry recites §7.3 as pinning "the transcribed 12,059, and `12,059 ≤ 12,500`" in the present tense — the only live-reading statement of the superseded pin left in the document. A "superseded in v0.7 by the 10,859 index pin" clause closes it | Changelog, v0.6 erratum entry |

FINDING: High | inherited | local | §7.3 census operands (Forbidden token set / Scanned source rows) | Four of the six surviving census tokens occur in the scanned remainder on a conforming implementation — `gatherDecisionCorpus` is §4.4's sixth top-level export and is not one of the four sliced regions, `DECISION_LEDGER_OMIT_REASONS` and `DECISION_LEDGER_CORPUS_OUTCOMES` are §5.2's top-level frozen literals, and `recogniseDecisionRecords` is called from `gatherDecisionCorpus`'s unsliced body — so "zero occurrences in the scanned remainder" can never be green; either narrow the token set to symbols whose every conforming mention is inside an owned region, or extend the owned regions to `gatherDecisionCorpus`'s brace-matched body and §5.2's catalogue declarations.
FINDING: High | inherited | local | §7.3 Forbidden token set, "How it is kept honest" | The companion set-equality between `DECISION_LEDGER_CENSUS_TOKENS` and "the module's exported decision-ledger symbol names" compares six members against at least thirteen exports declared by §§3.1/3.2/4/5.2 (`DECISION_CORPUS_ARGV`, `DECISION_HEADING_RE`, `DECISION_LEDGER_DEFAULTS`, `parseDecisionLedgerConfig`, `buildDecisionLedgerInjector`, `DECISION_LEDGER_NOTICES`, `DECISION_LEDGER_CENSUS_TOKENS` itself, …), so it is red by construction; restate it as a subset relation with an explicit selection rule.
FINDING: Medium | delta | nonlocal | §7.3 ↔ PLAN v0.3 T-11 | Dropping `decisionLedger` leaves PLAN T-11 hand-transcribing the superseded seven-member token set, so the implementer would write the set this round proved unsatisfiable — re-pin T-11 in the same pass that settles F-01/F-02.
FINDING: Low | delta | local | §7, coverage-obligation paragraph | The per-file ratio is described as dominated by "~17k lines of shipped code"; `orchestrate-dev.js` is 18,509 lines at HEAD, while the ~817 KB figure beside it is exact — transcribe the line count too.
FINDING: Low | inherited | nonlocal | Changelog, v0.6 erratum entry | Round 8's F-01 remains open: the v0.6 entry still states in the present tense that §7.3 pins "the transcribed 12,059, and `12,059 ≤ 12,500`", the only live-reading statement of the superseded pin left in the document; add a "superseded in v0.7 by the 10,859 index pin" clause.

## Verdict

VERDICT: Needs revision
{"high": 2, "medium": 1, "low": 2}
