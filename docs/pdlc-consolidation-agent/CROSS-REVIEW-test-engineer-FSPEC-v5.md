# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/FSPEC-pdlc-consolidation-agent.md` (v5.0)
**Date:** 2026-08-06
**Iteration:** 5
**Scope:** Testing lens only, delta re-review. Baseline for the diff is `d0ee225` (the commit v4 was
written against); the revision is six commits, `d07ead6`…`7ad57c9`, +122/−33 lines. Prior finding
H-06 and questions Q-01…Q-03 are verified for disposition; new findings are drawn **only** from
changed sections. Product framing, architecture choice and prose style remain out of scope.

## Prior findings — disposition

The single v4 finding is **resolved**, and all three v4 questions are answered in the document. Each
was checked against the revised text and, where it made a claim about this repository, against HEAD.

| v4 ID | Sev | Disposition | Evidence in v5 |
|----|---|---|---|
| H-06 | Medium | **Resolved**, in the form the finding asked for | §13.7 gains **AT-F19**, and it is the row I specified rather than a weaker cousin. Its Given is a constructed `.consolidation-log.md` spanning all four arms of §8.4 step 1's predicate in one run — id `A` `retire` at `route: constraints`, id `B` `retire` at `route: degraded`, id `C` `promote`-only, id `D` `revise`-only — and its Then is a **set-equality** against the literal `{B, C, D}`, with the reason set-equality is load-bearing stated in the row ("an implementation returning every id ever recorded satisfies containment, and that degenerate list is the *limit* O-C7 accepts, never the implementation"). Both directions are named to a specific defect: `A` absent pins the `route != degraded` conjunct, `B` present pins that a `degraded` retirement does not close an id. The expected value is transcribed from §8.4, not derived from anything. Traceability landed too: §15.1's AC-5.2 row now reads `…, AT-F16, AT-F19 (§8.4 step 1's open-promotion list, set-equal over all four arms)`, and the rule got its own home as **BR-33c**, which restates the predicate and closes with "The computed list is exactly that set — not a superset" |
| Q-01 | — | **Answered, and the answer is an AT** | I asked whether the eight-field record wanted a field-set-equality row or whether it was TSPEC's. §13.7 gains **AT-F20**: one pass writing records on each of the three §5.2 kinds plus one `degraded` record, asserting each record's field-name set is set-equal to §8.1's eight names, with the serialisation explicitly left to §14.1 T-01. Verified the eight against §8.1's table at `FSPEC:1060-1095`: `failure-mode-id`, `phase`, `symptom`, `artifact`, `target`, `passId`, `action`, `route` — the AT's list and the table's are the same set. It is listed on AC-5.1 and on BR-33/BR-33a |
| Q-02 | — | **Answered**, with the mechanism named rather than asserted around | I asked whether S-11 and S-11b reach "step 11 never ran" by one path or two. AT-M4's row now says: the same path — "§10.2 order 3's 'step 11 never ran' — and not by two arms: step 8 is one step, and every way of leaving it early leaves it before step 11" — and then adds the absent-table conjunct to AT-M4 **anyway**, with the reason ("the two Givens differ … and an implementation could special-case one"). That is the right resolution of a "which is it" question: answer it, and still pin both Givens |
| Q-03 | — | **Answered** | AT-Q7c's Given is now pinned to a pass that terminates **`promoted`** (§12.1 S-02) with the §5.4 commit made, and the row states why in its own text: "a pass that promotes nothing observes `∅` everywhere and would satisfy a containment-only reading vacuously, leaving the row with nothing to falsify." The invoking-tree conjunct is now two-sided — contains `{add, commit}`, contained in `{add, commit, read-branch, read-status}` — which is what the §6.5 read-verb change made necessary |

## Findings

Three findings, all **new**, all inside text this revision introduced. No unchanged section was
re-litigated; I read every changed hunk of the six commits and nothing else.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| M-01 | Medium | Local | **BR-33a's reader-side half is a new behavioural rule with no falsifier, and the two ATs it cites do not test it.** §8.1's new paragraph states a receive-side contract in normative terms — "**a record missing a field the reader indexes is reported as a parse notice and skipped for that contract — never a halt, never a guessed default, and never an in-place repair**" — and BR-33a restates it and lists `AT-F20, AT-F16` as its evidence. Neither row has that Given. AT-F20's Given is *one pass writing* records on four paths and its Then is a writer-side field-set-equality; it constructs no short record and cannot observe a reader at all. AT-F16's Given is "a LEARNINGS carrying a `failure-mode-id` that matches **no** record in the log" — an unmatched **id**, not a **malformed record**; an implementation that halts on a truncated record passes AT-F16 unchanged. I checked the whole enumeration rather than a sample: `grep`ping the FSPEC for `parse notice` returns AT-F16, AT-A7 (the `ESCALATIONS.md` entry with no `Feature` row, §9.2), BR-35b and E-12 — the sibling rule for the corpus reader has both an AT **and** an error-table row (E-12/AT-A7), and this one has neither; no `E-` row covers a truncated failure-mode record either. The gap is not cosmetic. The rule has two named consumers, §6.4's consuming-repo carrier and §8.4 step 1, and the paragraph itself states the observable consequence at each ("§6.4 fails to suppress and the promotion is re-proposed … §8.4 step 1 leaves the id open") — so it is testable exactly as written, at this layer, over a file fixture with no agent in it, which is the same standard AT-F19 just met. Without a row, the three prohibited behaviours are the ones an implementation reaches for first: a halt on `undefined`, a `route ?? "degraded"` default (which would make a legacy record *close* an id and re-open H-06's unsafe direction by another door), or a silent in-place repair that §10.2's append-only grammar forbids. What is needed is one AT whose Given is a log carrying a record missing an indexed field — `route` for §6.4/§8.4 and `target` for §5.1 are the two that matter — asserting all three conjuncts on one path: (i) the pass reaches its terminal status and does **not** halt, (ii) the notice is reported naming the record, and (iii) the positive downstream state — the proposal is re-proposed (not suppressed) and the id is present in AT-F19's open list — plus the negative that the log's bytes for that record are unchanged. List it on BR-33a in place of the two rows that do not test it, and give it an `E-` row beside E-12 | §8.1 (reader paragraph), §18.7 BR-33a, §13.7, §19 |
| M-02 | Medium | Local | **§8.2's kind-precedence rule is a three-member total order and only one of its three ordered pairs is fixtured — and the untested pair is the one whose wrong answer produces the outcome §8.2 says can never happen.** The rule is new here and is stated as an enumeration: a three-row precedence table (1 constraints, 2 decisions, 3 the subject file) plus consequence 3's "a total order over a three-member set, so it is decidable on every merge". Its only test is AT-R6b's third fixture, whose Given is a process learning (rank 3) merged with an AC-2.1 domain invariant (rank 1). The pairs (1, 2) and **(2, 3)** are untested, and (2, 3) is not an academic omission: consequence 2 asserts "**A mixed-kind merge never takes the PR route**" over *both* kinds that outrank a process learning, and only the rank-1 half of that claim has a falsifier. An implementation whose rule is "constraints wins, otherwise keep whichever proposal arrived first" is green on every row in §13 today, and on a decisions+process-learning merge it keeps the guard-set `target`, opens a PR (§5.1 routes that `target` to the PR route) and writes a skill prompt — precisely the three observables the third fixture was written to forbid, one rank down. This is the completeness-by-set-equality problem in its usual clothing: an enumerated contract sampled at one member. The fix is small and does not need a new row — extend AT-R6b with a **fourth** fixture, the same colliding subjects proposed as an AC-2.2 decision and a process learning, asserting `target = docs/_decisions/DECISIONS-{failure-mode-id}.md`, `route = decisions`, **no** guard-set path written, **no** PR opened, one `symptom` naming both, and the elided kind named in the report body (§10.4 item 4) — and say in the row that the two fixtures together range over every pair the order admits, so a deleted or transposed rank fails one of them. BR-33b should then name both fixtures | §8.2 (precedence table, consequences 1–3), §13.4 AT-R6b, §18.7 BR-33b, §14.2 O-C8 |
| L-01 | Low | Local | **§6.5's new read-verb paragraph cites the branch-guard read at a line that carries an error string, not the read.** The paragraph grounds the precedent as "`parseAbbrevRef`, `pdlc/workflows/orchestrate-dev.js:3491-3496`; the branch-guard read at `:3585`". The first citation holds (JSDoc at `:3491`, `function parseAbbrevRef(result)` at `:3492`, body through `:3496`), and `gitWithLockRetry` `:8617` and `commitPaths` `:8669` are both exact. `:3585` is not a read: it is the template-literal fragment `` `(git rev-parse --abbrev-ref HEAD failed: ` `` inside `ensureFeatureBranch`'s `haltError`. The guard's actual read is `const head = await readHeadBranch(git);` at `:3580`, and the seam call it wraps is `result = await git(["rev-parse", "--abbrev-ref", "HEAD"]);` at `:3524`. Since the paragraph's whole job is to show that a conforming pass emits a read verb *through the seam*, `:3524` is the citation that carries the argument and `:3580` the call site. Low because the claim is true and the fix is two characters of line number; filed because §14.1 T-04 and TSPEC will follow these citations to the seam | §6.5 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | §10.4 item 10 adds "the **number** of open promotions in the list §8.4 step 1 hands to the harvest prompt" to the report body, and AT-F19's Then asserts "The list's **length** is asserted present in the report body". Present is weaker than correct: a report emitting a constant, or the count of *all* recorded ids, satisfies "present". AT-F19 already knows the expected number on its own fixture — it is `3`, since the expected set is `{B, C, D}`. Should the row assert the literal `3` rather than mere presence, so the reported count and the computed list cannot drift apart? That would make item 10 a second, cheap oracle on the same fixture rather than a formatting obligation. |
| Q-02 | §6.5's permitted column now names two read verbs, `read-branch` and `read-status`, and AT-Q7/AT-Q7c assert neither presence nor absence of them. That is right for the two the table lists — but the permitted set is now the union of an obliged column and a column that enumerates *specific* reads, so a pass that read something else non-mutating (`git log`, `git diff`, `gh pr list`) would be **red** under containment even though the paragraph's own justification ("reads are non-mutating in both trees, so admitting them costs the oracle nothing") applies to it equally. Is the permitted read set meant to be the closed two-member enumeration the table spells, or the open class "any non-mutating read"? The first is testable as written and I am not filing it; the second needs the table to say so, because a test author will transcribe the closed set. |
| Q-03 | ER-5 is routed correctly and its shipping assumption is ER-2's, so no AT changes today. One consequence is not stated where a test author would look: AT-L5 compares field **names** and §15.2's free-form row now carries the exception, but if the widened §1 row lands mid-feature, `suppressed-by:`'s value grammar becomes vocabulary-owned and a value-level check becomes available. Is that a deliberate non-goal (values stay outside AT-L5's domain permanently), or an "if the erratum lands" delta like the ones ER-2 and ER-4 spell out for AT-M6 and AT-K6? The other two errata each say what changes on landing; this one says "no AT changes", which reads as the permanent answer and may not be. |

## Positive Observations

- **AT-F19 is the row I asked for, written to falsify rather than to demonstrate.** Four arms in one
  fixture, a literal expected set, both directions asserted, and each direction tied in the row's own
  text to the specific defect it catches (`A` absent ⇒ the dropped `route != degraded` conjunct; `B`
  present ⇒ a `degraded` retirement wrongly closing an id). It also states the reason set-equality is
  not negotiable here — containment is satisfied by "every id ever recorded", which is O-C7's
  accepted *limit* and would otherwise quietly become the implementation. And the row names its own
  test level: "a pass-side arithmetic test over a file fixture with no agent in it". That is a test I
  could write today without asking a question.
- **The §6.5 read-verb repair is the right shape of answer to a false-red risk, and it did not weaken
  the oracle to get there.** The tempting fix was to drop the invoking-tree obligation. Instead the
  table grew a fifth column naming *which Given obliges each domain* — so the two git rows no longer
  share one Given — reads went into the permitted-but-not-obliged column with the reason stated, and
  AT-Q7c's invoking-tree conjunct became two-sided (contains `{add, commit}`, contained in
  `{add, commit, read-branch, read-status}`). BR-28 now closes with "Equality is asserted on no
  domain, on any Given", which is the sentence a test author needs. I verified the precedent the
  paragraph rests on at HEAD: `parseAbbrevRef` (`pdlc/workflows/orchestrate-dev.js:3492`),
  `gitWithLockRetry` (`:8617`) and `commitPaths` (`:8669`) are all where the document says, and the
  guard does read the branch through the same seam (`:3524`) — only the one line number in L-01 is
  off.
- **AT-F20 answers a question with an assertion instead of prose, and picks the harder half.** It
  asserts field-set-equality **per record on four different paths** (three §5.2 kinds plus a
  `degraded` record), not on one sample, and states both failure directions it catches — a dropped
  `target`/`route` invisible "until §6.4's consuming-repo carrier misreads it two passes later", and
  an invented ninth field. The eight names in the row are set-equal to §8.1's table as it stands
  (`FSPEC:1060-1095`), so the AT and the normative table cannot drift without one of them failing.
- **ER-5 is a divergence declared rather than absorbed.** The easy move was available and refused:
  §10.3 could have claimed `suppressed-by:`'s value under the free-form exemption and nobody would
  have noticed for a while. Instead §15.2's free-form row, §10.3's field table, BR-26 and §15.2's
  closing paragraph all say the same thing — the field *name* has a §1 row (which is what keeps
  AT-L5 exact), the *value grammar* here is wider than `:63`, and that is an erratum. Verified at
  HEAD: `docs/_constraints/pdlc-consolidation-vocabularies.md:63` reads
  `` `{id}:{action} → PR URL` entries, or empty ``, so the divergence and the citation are both real.
  §15.2's "so the table is not read as a clean bill" is the honest framing.
- **O-C8 and §10.4 item 4 make the merge's loss reportable instead of silent.** A precedence rule
  that elides a write is exactly the kind of mechanism that ships as an unstated tie-break; here the
  order is written down, the reason for the order is given (widest reach first, so the surviving
  write is never the narrower one), the elided kind is named in the report body so an operator can
  re-propose it by hand, and the trade it accepts — losing a write versus losing NFR-4's suppression
  key — is stated in O-C8 rather than assumed. My M-02 is about the fixture set, not about the rule.

## Recommendation

**Needs revision**

The v4 finding H-06 is resolved in the strong form, all three v4 questions are answered, and every
repository claim in the changed text holds at HEAD except one line number (L-01). Nothing in this
revision re-opens a settled decision. The approval bar is unchanged, and two Medium findings are
open — both in text this revision introduced, and both of the same shape the last two rounds have
had: a new mechanism arriving one step ahead of the artefact that pins it.

What must change:

1. **M-01** — §8.1's new reader-side rule (a record missing an indexed field ⇒ parse notice, skip,
   never halt / default / repair) and BR-33a have no falsifier; AT-F20 is writer-side and AT-F16's
   Given is an unmatched id, not a short record. Add one AT whose Given is a log carrying a record
   missing `route` (and/or `target`), asserting on one path: the pass reaches its terminal status and
   does not halt, the notice names the record, the positive downstream state (proposal re-proposed
   rather than suppressed; the id present in AT-F19's open list), and the record's bytes unchanged.
   Point BR-33a at it and give it an `E-` row beside E-12, which is the sibling rule's precedent.
2. **M-02** — §8.2's precedence order is a three-member enumeration tested at one pair. Add a fourth
   AT-R6b fixture for an AC-2.2 decision merged with a process learning, asserting
   `target = docs/_decisions/DECISIONS-{failure-mode-id}.md`, `route = decisions`, no guard-set write
   and no PR — the rank-2 half of consequence 2's "never takes the PR route", which nothing asserts
   today. Say in the row that the fixtures together range over every pair the order admits, and name
   both on BR-33b.

L-01 is a line-number correction and does not block on its own. The three questions are questions,
not findings: none of them blocks.

## Verdict

VERDICT: Needs revision
{"high": 0, "medium": 2, "low": 1}
