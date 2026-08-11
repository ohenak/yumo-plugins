# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-consolidation-agent/TSPEC-pdlc-consolidation-agent.md
**Date:** 2026-08-10
**Iteration:** 15
**Mode:** Delta re-review (`1dbd824d..HEAD`, TSPEC v2.4 → v2.5)
**Scope:** 119 insertions / 51 deletions since round 14. Both round-14 findings verified against
HEAD (REQ text, and the two helper files at HEAD line-for-line), not against the changelog.
Changed sections scanned for new issues; unchanged sections not re-litigated.

## What changed, and what I measured

**F-01 (High) — REQ §4b absorbed, in mechanism and everywhere it propagates. Resolved.**
The absorption is complete and faithful, and the quotes are verbatim:

- §7.1 arm 2 (`TSPEC:969-985`) now decides **omission**, quoting REQ §4b's own words
  (*"is instead **not consumed** — it is omitted from the `<!-- pdlc:consumed {passId} -->` pair"*,
  `REQ-…:614-616`) and quoting REQ's *reason* — the one-directional bias toward
  `prevented`/`insufficient-evidence` corrupting REQ-CONS-05's falsifiability loop (`REQ-…:616-619`).
  The superseded convergence argument is **answered rather than deleted** ("REQ answered that
  argument rather than overlooking it"), which is what DEC-ERR-01 asks for.
- Observable 1 is unchanged and now double-anchored to REQ's own sentence
  (`TSPEC:966-968` ≡ `REQ-…:623-624`, *"stays in the un-consolidated set and so still counts toward
  AC-1.2's volume trigger"*).
- §12.2's `(no FSPEC AT)` row (`:2798`) and §12.3's `consolidationPass.test.js` row (`:2871`) both
  now assert conjunct (2) as *names the readable basename and **not** the unreadable one* — the
  readable member kept as the positive half, so the conjunct cannot green on an implementation that
  renders an empty pair. Positive-and-negative on the same path, as required.
- §13.3 (`:3060-3086`) is re-cast to **answered upstream and absorbed**, keeps the falsifier, and
  its residue list is set-equal with §10.4's (nested repository + the retryable unreadable entry).
- `PassState.consumed` (`:693-696`) was re-stated as the read subset rather than the step-2
  enumeration — a consequential edit the round made unprompted, and the right one: AC-3.2's PR-body
  citations derive source LEARNINGS from `state.consumed` (`:1637`), and an unreadable file must not
  be cited as the source of a promotion it contributed nothing to.

**F-02 (Low) — anchors corrected and now exact at HEAD. Resolved.** `seams.js:405-406` is the
`typeof script === "function"` branch, `:407-408` the `Array.isArray(script)` branch carrying
`script[Math.min(index, script.length - 1)]` verbatim, `:389` the `fakeGit` declaration, `:421-426`
the `invocations`/`calls`/`commands`/`callCount` block; `mergeDoubles.js:209` is the
`{ ok: true, stdout: "", stderr: "" }` fall-through. Every anchor in the changed passage checks.

**§11.1's new measured claims check, exactly as written.** Built a scratch tree the way the fixture
specifies (`.gitignore` naming the directory, written before `git add -A`): plain
`git status --ignored --porcelain` and `--ignored=matching` both print `!! docs/ign/`; only `-uall`
prints `!! docs/ign/LEARNINGS-ign.md`; `ls-files --cached` omits it; `ls-files --error-unmatch`
exits **1** with the stderr text quoted; `check-ignore -v` exits 0 printing
`.gitignore:1:docs/ign/`. The document's four measurements are all reproducible.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | **The all-unreadable pass is a REQ-decided positive behaviour that this round files under "deliberately not handled" and binds to no oracle.** The omission decision creates a case that could not exist before v2.5: a pass that consumes *nothing*. REQ §4b decides its full observable — *"A corpus that is entirely unreadable therefore still fires the trigger and still terminates… That pass's terminal status is `no-op`"*, with no status and no reason code added, and with a stated discriminator against a quiet week: *"AC-7.1's LEARNINGS consumed by basename is empty while the un-consolidated set is non-empty, whereas a quiet week has both empty"* (`REQ-…:625-631`). TSPEC carries only the first half, in one clause at the tail of a §10.4 bullet (`:2218-2219`), i.e. inside **What is deliberately not handled** — the wrong home for behaviour the pass is required to exhibit. Three consequences: (a) §10.3's failure table has no row for it, while row 1a two lines up says emphatically *"Never `no-op`"* for the unlistable corpus (`:2179`) — an implementer generalising that to "read nothing ⇒ `failed`" contradicts REQ and reds nothing; (b) no §12.2 row and no AT asserts it (AT-R7 fixture (b) is an all-*suppressed* `no-op`, reached by the other route, `:2795`); (c) the quiet-week discriminator — consumed empty **and** un-consolidated non-empty — appears nowhere in TSPEC, so the operator-facing difference REQ relies on is unbound. **Fix:** move the sentence out of §10.4 into §10.3 as its own row (failure: *every enumerated body unreadable*; mechanism: the omission rule leaves `consumed` empty; observable: `no-op`, no reason code, un-consolidated non-empty, basenames named in the report body), and give §12.2 a conjunct — either extend the existing unreadable-corpus case with an all-unreadable fixture asserting terminal status `no-op` **against the mixed fixture as control**, or add one row. §10.4 keeps only the genuinely-accepted part (the entry is re-offered until the operator fixes it). | REQ §4b (`REQ-…:625-631`), AC-1.4, AC-7.1 |
| F-02 | Low | Local | **Observable count disagrees across the sections this round rewrote: §7.1 says two, §12.2/§12.3 say three.** `TSPEC:961-962` now reads *"Its **two** observables are fixed"* — the rewrite folded "named in the report body" into arm 2's sentence — while §12.2 (`:2798`) and §12.3 (`:2871`) both still say *"three observables (counted, omitted from the consumed pair, named in the report body)"*. Same set, two arities. This matters only because the §12.2 case is a three-conjunct oracle whose completeness a PLAN task will check by counting. **Fix:** restore §7.1's enumeration to three numbered observables (count / omission / report-body naming), which also stops the report-body obligation living inside a sub-clause of the omission arm. | §12.2, §12.3 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | If F-01 lands, does PROPERTIES owe a matching property for the all-unreadable pass, or is the §12.2 conjunct enough at this layer? PROP-COR-09 is scoped to the mixed fixture and PROP-COR-11 (`PROPERTIES:400`) covers the pair's completeness *when emitted*; neither reaches a pass whose pair is empty. Not a TSPEC defect either way — asking so the answer is recorded once rather than rediscovered in Phase PT. |

## Positive Observations

- **The absorption quotes REQ's reason, not just REQ's verdict.** The rewrite could have said "REQ
  decided omission" and moved on. Instead it names why inclusion was wrong (one-directional bias in
  the effectiveness loop) and explicitly answers this layer's own superseded argument. That is what
  makes the decision unreopenable by the next author, which is exactly the DEC-ERR-01 failure the
  last two rounds were spent on.
- **Conjunct (2) was re-stated without becoming an absence-only oracle.** The obvious repair —
  "the pair does not contain the unreadable basename" — would have passed on an empty pair. Both
  §12.2 and §12.3 keep the readable member as the positive half and say why in the row itself.
- **`PassState.consumed` was chased down.** The field comment was not in any finding; the author
  noticed that changing what "consumed" means changes what AC-3.2's PR-body citations derive from,
  and fixed the type comment in the same round. That is the kind of consequence-tracing that keeps
  a spec internally true rather than locally patched.
- **§11.1's `-uall` repair states the cheapest wrong repair.** Naming the trap ("weaken it back to
  the state this member was added to escape") beside the measurement is what stops a future red
  guard being fixed in the direction that destroys it.

## Recommendation

**Approved with minor changes**

Both round-14 findings are resolved in mechanism, and the REQ §4b absorption is faithful to the
letter and the reasoning of the upstream decision. Nothing blocks. Two non-gating items for the
next revision:

1. **F-01 (Medium)** — move the all-unreadable pass's `no-op` observable out of §10.4 into §10.3,
   and bind it in §12.2 with the mixed fixture as its control; carry REQ's quiet-week discriminator.
2. **F-02 (Low)** — §7.1 says "two observables", §12.2/§12.3 say three; restore three.

One **ERRATUM: PROPERTIES** is re-emitted unchanged from round 14 — PROP-COR-09's conjunct (2)
(`PROPERTIES:386-387`) still reads *"contains **both** basenames"* against its own title, and
§O-5's parenthetical (`:299`) still reads *"in the consumed pair"*. TSPEC is now correct on both
sides of that boundary, so the disagreement is entirely downstream.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}
