# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/FSPEC-pdlc-consolidation-agent.md` (v7.0)
**Date:** 2026-08-06
**Iteration:** 7
**Scope:** Testing lens only, delta re-review under the structural freeze declared in
`POSTMORTEM-F-pdlc-consolidation-agent.md` §Resolution step 2 and under `DEC-LAYER-01`
(`docs/_decisions/DECISIONS-spec-layer-boundary.md`). Baseline for the diff is `87a6cb7` — the commit
v6 was written against; the revision is six commits, `92740b1`…`27eeab1`, +50/−18 lines. Prior
findings L-01, L-02, L-03 are verified for disposition; new observations are drawn **only** from
changed text.

## Prior findings — disposition

All three v6 findings are **resolved**, and both v6 questions are answered in the document. Each was
checked against the revised text and, where it made a claim about this repository, against HEAD.

| v6 ID | Sev | Disposition | Evidence in v7.0 |
|----|---|---|---|
| L-01 | Low | **Resolved**, in the form the finding asked for | The parenthetical "(and, on a kind-3 merge, the `target` with it)" is gone from §8.2's third note (`:1296-1307`) and from AT-R6b's fixture-2 text. Both now say what the fixture can actually assert — the `artifact` half — and both name the kind-3 case as PROPERTIES-owned: "that fixture is kind 2 on both sides, where `target` is a function of the id and the id is invariant under the tie-break … the clause's own motivating case — a colliding-subject merge of **two process learnings**, where precedence returns kind 3 — has no fixture here and is named **PROPERTIES-owned per DEC-LAYER-01**". Better than a deletion: the note also states the observable the deferred owner owes ("`artifact` and `target` are the same path on the merged record"), so the PROPERTIES author inherits an oracle, not a gap |
| L-02 | Low | **Resolved** | E-12b's AT cell (`:2504`) is split exactly as asked: "**AT-F21** for the `route` and `target` arms. The `artifact` arms (§8.3's row emitted with an unavailable path rather than dropped, §8.5's refusal to guess a `retirement`) have **no fixture at this layer** and are named PROPERTIES-owned per DEC-LAYER-01 — the rule and its observables are stated in §8.1's reader table; the fixture that pins them is not claimed here". The row no longer reads as if all three indexed fields were covered, and it names both wrong outcomes the deferred fixtures must kill |
| L-03 | Low | **Resolved for `F`'s existence, and this is where my new Medium sits** | AT-F21's conjunct (3) is rewritten as "the positive downstream state, asserted for **both** short records", and `F` now has its own arm. The asymmetry the finding named is gone. But the arm it gained turns on two fields of `F`'s record that the Given still does not fix, and reads against the Given's own new clause — see M-01 below. The finding is closed; what replaced it is a different defect, filed on its own merits |
| Q-01 | — | **Answered, in the row** | AT-R6b's Given now opens "**five fixtures — five separate passes over five separate logs**" and spells why the single-pass reading is wrong: "Fixtures 3, 4 and 5 share one subject and one phase and so derive one id; they are not one pass, and building them as one would collide all three merges onto a single record and make the per-fixture assertions below unstateable" (`:2032`). That is the answer plus its reason |
| Q-02 | — | **Answered, closed** | §6.5 (`:937-946`) now separates the two questions I conflated: the closed set is scoped to the **git** rows ("The PR seam has its own read verb, `read-pr`, in its **obliged** column … a `gh pr list` resolves there and is not an example of the class excluded here" — verified against the table, `read-pr` is in the PR seam's obliged column at `:916`), and ownership is stated: "'Made here' is a statement about which layer owns the **decision** … under DEC-LAYER-01 the seam verb permitted-sets are TSPEC's to transcribe and, with a recorded reason, to widen — this table is the frozen statement TSPEC inherits". The third-verb example list was corrected to git verbs (`git log`, `git diff`, `git show`), which is the repair the scoping required |

## Findings

Four findings, all new, all inside text this revision introduced. No unchanged section was
re-litigated. One is **Medium**: it is not a fixture-strength deferral of the class `DEC-LAYER-01`
places below this layer, but a Given that under-determines its own Then — the AT cannot be written as
stated, and one reading of it is red on conforming behaviour. The other three are Low.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| M-01 | Medium | Local | **AT-F21's `F` arm asserts an outcome that two unfixed fields of `F`'s record decide, and one clause of it contradicts the Given.** The revision fixed `E`'s deciding field on purpose — "`action: retire`, … `retire` is the action on which the missing value decides both readers" — and then left `F`'s `action` and `route` unstated while asserting a downstream outcome that turns on exactly those two. Trace it: (a) `F` is short of `target` only, so its `failure-mode-id`, `action` and `route` are all present, which are precisely the three fields §6.4's carrier indexes (§8.1 reader table `:1143`); (b) BR-25 (`:2433`) makes the pair `(F, action)` **`enacted`** when the record's `route` is anything other than `degraded`, and `absent` otherwise. So if `F`'s record carries `route: constraints`, the pass's re-derivation of `F` is **suppressed** — correctly, it landed — and conjunct (3)'s "its promotion is re-proposed on a later pass" is false; if it carries `route: degraded`, the pair reads `absent`, the promotion is re-proposed **this** pass, and a fresh proposal's `target` is a function of its kind (§5.2, §5.1 `:522-525`), not of the short record — so the pass routes it and writes it, and conjunct (3)'s "**not routed** — no write is made on its behalf" is red on conforming behaviour. Neither branch is the one the row asserts. The Given makes this worse rather than better by adding "and **re-derives `F`'s promotion**": a re-derived promotion carries its own `target`, so "no `route` is guessed for it" has no subject — nothing needed to guess. The one clause of the arm that survives every branch is the last one, "§8.6 likewise routes no remediation for it", which reads the **stored** record's `target` (§8.6 `:1476-1478`) and is genuinely undecidable when it is missing. A test author cannot build this fixture: two conforming implementations disagree on conjunct (3) depending on a byte the Given does not write. **FSPEC-layer repair, no new AT and no new BR:** fix `F`'s record in the Given the way `E`'s was fixed — `action: promote`, `route: degraded` (so §6.4 reads `absent` and the re-derivation is live) — and scope the arm to what the missing `target` actually blocks: **§8.6 routes no remediation for `F` and no `target` is guessed for it**, dropping "not routed / no write is made on its behalf", which describes the fresh proposal rather than the short record | §13.7 AT-F21 `:2060`, §8.1 reader table `:1141-1143`, BR-25 `:2433`, §8.6 `:1476-1478` |
| L-01 | Low | Local | **§8.1's new set-equality lead points at a paragraph that does not contain the four readers it attributes to it.** `:1133-1137` reads "The table is set-equal to the readers this document names — **the four in the paragraph below** (§5.1, §6.4, §8.4 step 1, §8.6) plus §10.2 order 2, §8.3 and §8.5". There is no paragraph below — the next block is the table itself. The paragraph *above* (`:1120-1131`) names two of the four, §6.4 and §8.4 step 1, and neither §5.1 nor §8.6. The seven-member set is right (I counted the table: §5.1, §8.6, §6.4, §8.4 step 1, §10.2 order 2, §8.3, §8.5 — seven rows, set-equal to the seven named), so the claim is true and independently checkable; what is broken is the audit trail the claim offers for itself, which is the one thing a reviewer of an enumeration follows. **Repair:** "the four routing/carrier readers named above and below" → name them without the pointer, or fix the direction | §8.1 `:1133-1137` |
| L-02 | Low | Local | **AT-F21's new self-citation is stale by the shift this revision introduced.** Conjunct (3) cites "§8.1's reader table, `:1131`". At v7.0 `:1131` is the last line of the *preceding* paragraph ("extra harvest question, the failure direction O-C7 accepts)"); the reader table now starts at `:1139` and the §5.1 row the conjunct means is `:1141`. The table moved +12 lines when this revision inserted the §8.6 row and the set-equality lead, and the citation was carried over unchanged from v6.1 (where `:1129` was correct). Same class as the v5 L-01 I filed and this document fixed; it recurs because the document cites its own line numbers, which every edit invalidates | §13.7 AT-F21 `:2060`, §8.1 `:1141` |
| L-03 | Low | Local | **§8.2's new action-scoping paragraph states a positive behaviour no fixture covers and, unlike the two other unfixtured claims this revision added, names no owner for it.** `:1232-1235`: "a `promote` and a `revise` over one subject at one phase are two keys, no merge fires, precedence never runs, and **both writes happen — including a guard-set one**". That last clause is the load-bearing one: it says a single pass can open a guard-set PR *and* write a consuming-repo target for one subject at one phase — the one configuration in which consequence 2 ("a mixed-kind merge never takes the PR route") does **not** bound the PR route. No row in §13 has two actions over one subject in one pass: AT-R6b's five fixtures are all single-action by construction, and AT-Q7/AT-Q7c partition on PR-opening vs not, not on action multiplicity. Every other unfixtured claim this revision introduced names its owner (§8.2's kind-3 tie-break case, E-12b's `artifact` arms — both "PROPERTIES-owned per DEC-LAYER-01"); this one does not, so it reads as covered when it is not. **Repair, one clause:** name the two-action-one-subject pass PROPERTIES-owned per DEC-LAYER-01 and state its observable — two records under two keys, both writes made, the guard-set one as a PR | §8.2 `:1232-1235`, §13.4, §13.5 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | AT-F21's conjunct (3) for `E` now says the open-list membership is "asserted as a set-equality over this fixture's ids in AT-F19's form, not as containment". This fixture's ids are `{E, F, well-formed}` — but the open list is over *promotions*, and `E`'s only record is an `action: retire`. Is the asserted set literally `{E, F, W}`, or `{E, F}`, or something the fixture's `action` values decide? AT-F19 fixes this by giving each of its four ids a stated action; this row does not (for `F` and the well-formed record). If M-01's repair pins `F`'s `action`, please pin the well-formed record's too and write the expected set as a literal — a set-equality whose expected side is described rather than transcribed is the containment problem one level up. |
| Q-02 | §8.1's §8.3 row now says the unavailable path cell is "the **observable**, not a literal this document pins — the spelling of that cell is TSPEC's, per DEC-LAYER-01, and §15.2's lexicon owns no such value". I read that as consistent with the layer decision and I am not filing on it. The check I want on record for the TSPEC author: the observable as stated is "carries **no path** and is rendered as an explicit unavailable statement rather than as an empty cell or a guessed path", of which two thirds are negative. Does the TSPEC intend to pin a literal (which makes the positive conjunct mechanical), or to assert "non-empty ∧ not a repository path"? The second is assertable but weaker, and it is the reading a PROPERTIES author will default to if the TSPEC stays silent. |

## Positive Observations

- **The two deferrals this revision added are the good kind: owner named, observable stated.** §8.2's
  kind-3 tie-break case does not merely say "PROPERTIES-owned" — it says what the deferred fixture
  must assert ("`artifact` and `target` are the same path on the merged record") and what a defective
  implementation looks like ("applying the tie-break to `artifact` while keeping proposal order for
  `target` disagrees with itself"). E-12b's `artifact` arms do the same, naming §8.3's verdict move
  and §8.5's guessed `retirement` as the two outcomes the deferred fixtures kill. A deferral that
  hands the next layer an oracle is not a coverage gap; it is a routing decision. My L-03 is that a
  third unfixtured claim in the same revision did not get this treatment.
- **AT-F21's prohibited-behaviour mapping is now stated per conjunct, and it is right.** "Which
  conjunct catches which prohibited behaviour, stated exactly because the mapping is not symmetric"
  is the sentence that turns a five-conjunct list into an oracle. I checked the `E` half against the
  rules rather than against the prose: a `route ?? "constraints"` default makes BR-33c (`:2455`)
  close `E` — its predicate is `action: retire` with a `route` other than `degraded`, which is
  exactly satisfied — and makes BR-25 (`:2433`) read the pair `enacted`, suppressing the
  re-proposal; both are red on conjunct (3). And the row is honest about the case its own conjuncts
  do **not** discriminate: `route ?? "degraded"` "is **not** unsafe on either reader … so it is
  caught by (2) alone". Naming a defect your strong conjuncts cannot see, and pointing at the weak
  one that can, is rarer than it should be.
- **The tie-break's comparison domain is now unambiguous, and the ambiguity it removed was real.**
  "byte order over the **canonical** root-relative paths of §8.1, i.e. each candidate's `artifact`
  value **as written**, before any slug substitution. ('Normalised' is §8.1's word for the slug-side
  transform, under which the candidates are identical by construction — that is why they merged — so
  it is not the comparison meant here.)" Under the old wording a literal-minded implementer compares
  the slugs, which are equal, and the tie-break is undefined on its only input. The fix explains why
  the wrong reading is wrong instead of just replacing the word.
- **The subject-axis loss is now compensated on the same channel as the kind-axis loss, and all four
  places agree.** §10.4 item 4 gains the obligation ("any promotion whose merge invoked §8.2's
  subject tie-break names, beside the surviving `artifact`, every canonical subject path the
  tie-break elided"), BR-33b carries it as a rule, O-C8 corrects its own compensation claim ("It is
  **not** carried by the merged `symptom`, which §8.1 pins as one non-keying line"), and AT-R6b
  fixture 2 asserts the literal elided path `pdlc/skills/a/b.md`. Rule, price, report row and
  fixture all four moved together — the previous version had the price pointing at a channel that
  could not carry it.
- **Every repository claim in the changed text holds at HEAD.** `MERGE_GUARD_DEFAULTS` is
  `pdlc/workflows/orchestrate-dev.js:48-53` and is the frozen four-member array AT-R6b fixture 3
  relies on for `pdlc/workflows/` being a guard-set path (`Object.freeze` at `:48`, members `:49-52`,
  close `:53`). §6.5's `read-pr` is in the PR seam's obliged column at `:916`, which is what the new
  scoping paragraph claims. The only citation defect I found is the document's citation of **itself**
  (L-02).

## Recommendation

**Needs revision**

All three v6 Lows are resolved — two of them in a stronger form than the finding asked for, by naming
the deferred owner *and* the observable it owes — and both v6 questions are answered in the document
rather than in a reply. Nothing in this revision re-opens a settled decision, and nothing in it broke
a section I had previously approved. Every repository claim in the changed text holds at HEAD.

The verdict is Needs revision on **M-01 alone**. I want to be precise about why it is not a Low
deferral like the others: `DEC-LAYER-01` assigns *fixture construction and oracle strength* below
this layer, and I have applied that consistently — L-03 is a missing fixture and is Low for exactly
that reason. M-01 is not a missing fixture. AT-F21 **is** the fixture, it is stated at this layer,
and as stated its Given does not determine its Then: with `F`'s `route` unwritten, BR-25 decides
whether the re-derivation is suppressed or live, and the two branches falsify different halves of
conjunct (3). One of the two readings makes the conjunct **red on conforming behaviour**, which is a
false-red an implementer will resolve by weakening the oracle. That is an FSPEC-layer defect in a row
this document owns, not a deferral.

The repair is one clause in one cell and adds no new rule, BR or AT, so it is admissible under the
freeze:

1. **M-01** — fix `F`'s record in AT-F21's Given as `E`'s was fixed (`action: promote`,
   `route: degraded`, so §6.4 reads the pair `absent` and the re-derivation is live), and scope
   conjunct (3)'s `F` arm to what a missing `target` actually blocks: §8.6 routes no remediation for
   `F` and no `target` is guessed for it. Drop "not routed / no write is made on its behalf" — that
   clause describes the freshly derived proposal, whose `target` is a function of its kind and is not
   missing.
2. **L-01** — fix the pointer in §8.1's set-equality lead; the set is correct, the reference is not.
3. **L-02** — `:1131` → `:1141` in AT-F21's reader-table citation.
4. **L-03** — name the two-action-one-subject pass PROPERTIES-owned per DEC-LAYER-01, with its
   observable, as this revision already does for its two other unfixtured claims.

Taking (1) clears the verdict. (2)–(4) are Low and, per `DEC-LAYER-01`, may be carried as tracked
deferrals; I would not re-file them.

## Verdict

VERDICT: Needs revision
{"high": 0, "medium": 1, "low": 3}
