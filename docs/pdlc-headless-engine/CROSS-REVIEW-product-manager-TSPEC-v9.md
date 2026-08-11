# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-headless-engine/TSPEC-pdlc-headless-engine.md` (v1.7)
**Upstream read:** `REQ-pdlc-headless-engine.md` (v0.10 — AC-3.5 `:502-512`, C-11 `:284`), `FSPEC-pdlc-headless-engine.md` (v1.6 — ladder `:293-301`, EC-START-10/11 `:406-407`, BR-GUARD-6 `:918-924`, AT-ENG-11a `:967`, BR-START-4 `:382-392`)
**Prior review:** `CROSS-REVIEW-product-manager-TSPEC-v8.md` (0 High, 2 Medium, 1 Low)
**Diff reviewed:** `fd3cc0d1^..HEAD` — TSPEC +236/−47 across eight commits
**Date:** 2026-08-11
**Iteration:** 9
**Scope:** delta re-review — disposition of v8's three findings, then the changed sections only

## 1. Disposition of prior findings

All three resolved, and two of the three resolved by a stronger edit than I asked for.

| Prior | Disposition |
|---|---|
| **F-01 (Medium)** — §9.2's three CI-related open questions still reasoned from a two-platform matrix §7.6 had already corrected | **Resolved** (`150f3244`). O-ENG-T1 now says "a fifth job on the existing matrix, which is **one platform** at HEAD — `os: [ubuntu-latest]` (`pr-tests.yml:40`)" (`:2369-2375`), verified against HEAD: `pr-tests.yml:40` is `os: [ubuntu-latest]`, single value ✓. O-ENG-T4's "two values, matching §7.6's matrix" gloss is gone, replaced by "takes a distinct value per host the suite runs on — and deliberately does **not** track §7.6's matrix, which is one platform" (`:2384-2385`) — which is the more accurate statement, not just the non-false one. O-ENG-T5 re-based on "the one platform §7.6's matrix runs (`ubuntu-latest`) and on the maintainer's macOS" (`:2394-2395`). The premise now matches §7.6 in all three places. |
| **F-02 (Medium)** — §5.3's engine-fatal reconciliation stated in the present tense against a `catch` that does not exist at HEAD | **Resolved in four places, not the two I named** (`426556e6`). §5.3 now reads "the engine **gains** a top-level catch … **this is designed behaviour, not observed: at HEAD `pdlc/engine/lib/run.mjs` contains no `catch` clause at all**, only the `try` at `:159`" (`:1333-1340`); §7.4 row 4 carries the same marking (`:1912-1917`); §8.1's AC-4.4 row now reads "(the catch this feature adds there, §8.3)" (`:2198`); §8.3's `run.mjs` row leads with it (`:2228`). Re-verified at HEAD: `grep -n catch pdlc/engine/lib/run.mjs` returns nothing; the only `try` is `:159`; `runDev` `:187` and `runQueue` `:228` are declarations ✓. The document's own designed-vs-observed discipline is now applied to its own load-bearing claim. |
| **F-03 (Low)** — §5.3 anchored a producer claim on the consumer's line | **Resolved.** §5.3 now reads "**returned** … (constructed and returned at `orchestrate-dev.js:1847` and `:1857`; the caller reads it at `:3143-3149`)" (`:1341-1343`), which is both halves rather than the swap I suggested, and it matches §7.4's parallel bullet. |

## 2. What else changed, and what I checked

This round also folds in TE F-40/41/42/43 and answers Q-18/Q-19. The bulk of the new material is
§3.3's rewritten guard and the new §7.8. I re-grounded the load-bearing claims against HEAD rather
than reading them:

- **§3.3's PHASE_DISPATCH role-field census (class 2, "28")** — measured independently over
  `orchestrate-dev.js:3337-3437`: 5 non-null `creator`, 7 `optimizer`, 7 two-member `reviewers`
  arrays = 14, 1 `verifier`, 1 `remediator` → **28 ✓**, and the cited range ends exactly at `:3437` ✓.
  Class 4's eleven dispatch call sites I verified individually in v8; unchanged this round.
- **§3.3's "no string predicate exists" argument** — the decisive case checks out: `:6229-6231`
  carries keys `"se-review"`/`"pm-review"`/`"te-review"` and values `"software-engineer"`/
  `"product-manager"`/`"test-engineer"` on the same three lines, syntactically indistinguishable ✓.
  The `meta.name` counter-examples at `orchestrate-dev.js:3316` and `orchestrate-queue.js:45` are
  real ✓. The structural reframing is the right repair, and it is argued from measurement.
- **§7.8's upstream anchors** — every one lands: `FSPEC:299` is the rung 4a ladder row ✓; `:406` is
  EC-START-10 ✓; `:407` is EC-START-11, and its "the next candidate decides, and rung 4a refuses only
  if none runs" is faithfully rendered as "rung 4a **passes**" in the branch table ✓; `:918-921` is
  BR-GUARD-6's candidate set `python3, python, py` plus "never widens or narrows that set
  independently" ✓; `:922-924` is "by **running** a candidate, not by finding it on `PATH`" ✓;
  `:967` is AT-ENG-11a, and it carries **both** branches, which is why §7.8 owing two tests is right ✓.
  `REQ:284` is C-11 ✓.
- **§7.8's seam argument** — `_runCommand` is supplied to the workflow modules from `run.mjs:88` and
  appears nowhere in `lib/startup.mjs` ✓, so "not on the startup path and cannot be reached from
  `lib/startup.mjs`" is true, and declaring `probeGuardInterpreter({runProbe})` is not a redundant
  seam. `spawnSync(candidate, ["-c", "import sys"])` matches the shipped script's probe verbatim
  (`guard-harvest-before-delete.sh:16`) ✓ — the command is right; only its line anchor is not (F-01).
- **§6.4's rung disambiguation** — "runs with the ladder's billing-posture rung (5)" checks out:
  `FSPEC:301` is rung 5 = **billing posture** ✓. Separating EC-GUARD-4 from rung 4a in §6.4, §8.3 and
  §4.3 closes the one place a reader could have conflated two different refusals.
- **§7.5's sixth conjunct and §8.3's count** — §8.3's `_assert-suite-wide.mjs` row now says "six
  suite-wide assertions (four set-equality properties + the pre-phase predicate, + §7.5's
  corpus-scoping conjunct)" = 4+1+1 = **6 ✓**, internally consistent with §7.5's text. The conjunct
  itself is set-equality, not containment, and it fails in both directions (unnamed sixth
  configuration red; corpus configuration that recorded nothing red) — which is what Q-18 asked for.
- **§7.8's "nothing dispatched" oracle** — asserted positively (`accumulator.length === 0` on a run
  that reached the ladder) and paired with a companion control asserting a dispatching run records a
  non-zero count. That is the absence-only oracle rule applied without being asked ✓.
- **§6.5's M-ENG-09 clause (Q-19)** — presence **and** consistency, with all three cases spelled out
  (`yes` + hook shipped green; `no` + hook shipped red; `no` after tightening green). No longer green
  on a negative measurement the code has not answered ✓.

## 3. Findings

All three sit in sections this round changed. Nothing previously approved regressed, and no
requirement lost coverage.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | **§3.3's class-3 site census counts 1 where HEAD holds 5, and by the section's own rule the four it omits are failures, not skips.** The guard defines site class **(3)** as "a `skill:` object field" with no further scoping (`:490-495`), and the census asserts "1 `skill:` field (`:10448`)" (`:526-527`). At HEAD `grep -n "skill:" orchestrate-dev.js` returns **five** `skill:` object fields: `:5909` (`{ skill: reviewers[0], … }`), `:5910` (`reviewers[1]`), `:9288` (`skill: authorSkill`), `:9528` (`skill: dispatch.creator`) and `:10448` (`skill: "harvest-learnings"`, the one counted). Each of the four uncounted ones names a skill identifier at runtime, so they are class-3 sites under the definition as written; none resolves to a string literal or to a module-level constant — `reviewers[0]` and `dispatch.creator` resolve to a *class-2 site's value*, statically unreachable, and `authorSkill` is a parameter. The section's own rule is "a site the extractor cannot resolve to either is a **failure**, never a skip" (`:494-495`). So the guard as specified is **red at HEAD on four sites**, and the census figure it is conjoined with is red too — which is precisely the failure mode TE F-40 was raised (High) to remove this round, reproduced one class over. This is a design defect, not a citation slip: an implementer following §3.3 literally cannot make the suite green without either narrowing class 3 or inventing the exemption DEC-ENG-05 forbids. The product consequence is a Phase I wave that goes red for a reason no code change caused. **Fix (one clause plus one number):** scope class 3 the way classes 1/3/4 are evidently meant — a `skill:` field **whose value is a string literal or a module-level constant reference**, i.e. a *declaration* site rather than a *record-construction* site — and say so, since the four uncounted ones construct report/verdict records from values that already came *from* class-2 sites and so cannot escape the derivation. Then either keep the census at 1 with that scoping stated, or restate it against the scoped enumeration. Note the same scoping question applies to class 4 if any dispatch call passes a computed first argument. | AC-3.5, C-4 |
| F-02 | Medium | Local | **§9.3's "incidental note" corrects an upstream citation that is not wrong, and states line numbers that are.** §9.3 says FSPEC's citation of the shipped script as `guard-harvest-before-delete.sh:14-21` "is a line off at each end — the candidate loop is `:14-19` and the fail-open is `:20`. §7.8 cites the precise lines" (`:2358-2361`). Measured at HEAD: `:14` is `PY_BIN=""`, the loop is **`:15-20`** (`for cand in python3 python py; do` … `done`), and the fail-open is **`:21`** (`[ -z "$PY_BIN" ] && exit 0`). FSPEC's `:14-21` therefore spans exactly the initialisation, the loop and the fail-open — it is a correct range, and the correction is the thing that is off by one at each end. §7.8 inherits the same slip twice: it cites the probe command as `guard-harvest-before-delete.sh:15` (`:37`, `:2141`) when the probe `"$cand" -c "import sys"` is at **`:16`**, and cites `:14` as "the loop; fail-open at `:20`" (`:2147`) when those are `:15-20` and `:21`. The command quoted is verbatim-correct — only the anchors are wrong — so this costs nothing at implementation time, but it is the one place this revision reaches upstream to say a sibling document is imprecise, and doing that from a wrong measurement is the kind of claim that gets copied forward into an erratum nobody re-measures. **Fix:** delete the incidental note (FSPEC needs no correction), and re-anchor §7.8's two citations to `:16` for the probe command and `:15-20` / `:21` for the loop and fail-open. | C-11, C-5 |
| F-03 | Low | Local | **§3.3's census is labelled "at HEAD … each figure measured" but class 1 is a post-edit projection.** The sentence reads "At HEAD, after the edit §8.3 specifies, the four classes hold **7 / 28 / 1 / 11 = 47** sites" (`:522-523`), and the changelog compresses this to "7 / 28 / 1 / 11 = 47 at HEAD, each figure measured" (`:29`). Classes 2 and 4 are measurable at HEAD and I measured them ✓. Class 1 is not: HEAD holds **one** module-level skill constant, `ADVISORY_RUNG_SKILL = "se-review"` (`orchestrate-dev.js:1797`); the other six (and `SKILL_TRIAGE` in `orchestrate-queue.js`) are created *by* the edit, and `grep -nE "^const (SKILL_[A-Z_]+\|ADVISORY_RUNG_SKILL)"` returns nothing in `orchestrate-queue.js` at HEAD. "At HEAD, after the edit" is self-contradictory on its face, and the changelog line drops the qualifier entirely. The arithmetic is sound as a post-edit projection and I have no quarrel with 7 — the document has been scrupulous elsewhere about separating designed from observed (F-02's fix last round is exactly that discipline), and this is the one new sentence that blurs it. **Fix:** "after the edit §8.3 specifies, the four classes hold 7 / 28 / 1 / 11 = 47 sites — classes 2 and 4 measured at HEAD, class 1 counted from the edit" and match the changelog line. | C-4 |

## 4. Questions

| ID | Question |
|----|---------|
| Q-01 | F-01 is written from the product lens — a red-at-HEAD suite is a delivery risk to Phase I — but whether the class-3 scoping defect is *blocking* is a test-design judgement I am deliberately leaving to the test-engineer review rather than pre-empting with a severity of my own. If TE reads it as the same class of defect as F-40 (which was High), I will not argue the point; I have tagged it Medium because AC-3.5's set-equality is carried by the derivation test, which is sound, and this second guard is a supplementary escape check. |
| Q-02 | §3.3 says class 4's eleven sites "hold constant *references* after the edit, which is why the extractor must resolve references rather than match literals" (`:521-523`). Does any of the eleven pass a *computed* first argument today, or does the edit make all eleven plain constant references? I checked the eleven line anchors in v8 and they were literals then; if any becomes computed, F-01's scoping question applies to class 4 as well and the census figure moves with it. No finding — I could not answer it from the document and it may already be settled in the author's head. |

## 5. Positive Observations

- **F-02 last round was fixed in four places when I named two.** I asked for §5.3's catch to be
  marked as designed rather than observed and pointed at two lines; the revision marked it in §5.3,
  §7.4 row 4, §8.1's AC-4.4 row and §8.3's `run.mjs` row, and added the negative evidence in the
  document's own voice — "at HEAD `pdlc/engine/lib/run.mjs` contains no `catch` clause at all, only
  the `try` at `:159`". A reader now cannot construct the wrong mental model from any entry point.
  That is the sweep discipline this document has now demonstrated twice running (v1.6 did the same
  with the `--dry-run` branch).
- **§3.3's rewrite argues from measurement rather than from assertion, and it argues against its own
  previous draft.** "54 hyphenated literals in `orchestrate-dev.js` and 24 in `orchestrate-queue.js`,
  including `"command-failed"`, `"dispatch-error"`, `"rev-parse"`" is the kind of number that ends an
  argument, and the reviewer-role map case — keys and values indistinguishable on the same three
  lines, so **no string predicate can separate them** — is a genuinely decisive observation, not a
  rationalisation. Replacing a shape predicate with four closed syntactic classes is the right
  repair, and "unresolvable is a failure, never a skip" is the correct default. F-01 is a scoping
  gap inside a good idea, not a quarrel with the idea.
- **BR-START-4 is reconciled honestly rather than routed around.** The paragraph at `:533-545`
  distinguishes a hand-maintained declaration *in production, beside the dispatch sites* (forbidden,
  because it can disagree with the run) from a test-side transcription (required, because it is the
  spec asserting what production must derive, and it goes red rather than silently governing). That
  reading matches `FSPEC:382-392`, which forbids "a declaration **no check ties to the modules**" —
  and it makes §3.3 and §7.4's M-ENG-07 treatment agree where they previously chose oppositely. The
  document noticed its own inconsistency and resolved it in the direction of the stricter test.
- **§7.8 is the section this feature most needed and did not have.** Rung 4a arrived from FSPEC with
  two branches, an AT and no oracle; §7.8 gives it a seam that did not exist (`probeGuardInterpreter
  ({runProbe})`, correctly argued as unreachable from `_runCommand`), a hermetic test per branch, a
  positively-asserted "nothing dispatched", a companion control so a never-installed accumulator
  cannot score the refusal green, and a `RungRecord.detail` rule that stops `pdlc doctor` and the gate
  disagreeing about which interpreters were tried. C-11 goes from a constraint with a ladder row to a
  constraint with a falsifiable design in one round.
- **§8.1 names its own omissions.** "Two upstream obligations are constraint-borne rather than
  AC-borne and so have no row here … named so the omission is deliberate rather than invisible"
  (`:2216-2219`), listing C-11/EC-START-10/EC-START-11/AT-ENG-11a and C-10/rung 3. A traceability
  table that explains its gaps is worth more than one that quietly has none, and it is the direct
  answer to the standing product question of whether anything upstream fell through.

**Traceability:** AC-3.5's set-equality is unchanged and still carried by the derivation test, now
strengthened with the ten-identifier transcription (TE F-42) — deletion of a `PHASE_DISPATCH` role
field goes red where it previously stayed green in both directions. C-11 now reaches an owning
component (`lib/startup.mjs`, §7.8) with per-branch tests, and is carried in §8.2's constraint table.
C-9's per-platform obligation is stated accurately in §7.6 and §9.2 alike after last round's sweep.
AC-4.4's owning component is honest about being partly new work. No scope creep, no P0/P1 requirement
dropped, no product decision taken inside a technical section.

## 6. Recommendation

**Approved with minor changes**

All three v8 findings are resolved, two of them more thoroughly than asked. The new material —
§3.3's structural guard, §7.8's rung 4a design, §6.4's rung disambiguation, §7.5's sixth conjunct,
§6.5's consistency clause — I grounded against HEAD wherever it claims repository state: roughly
twenty citations checked individually this round, with the PHASE_DISPATCH census, the guard script,
`run.mjs`, `pr-tests.yml:40`, `_runCommand`'s reach and every FSPEC/REQ anchor measured rather than
read. Nothing previously approved regressed.

From the product lens the document is done: every P0/P1 requirement traces, C-11 now has an owning
component and two falsifiable branches where last round it had a ladder row and a promise, and §8.1
states its own deliberate omissions instead of leaving them to a reviewer to find.

**No High finding is open.** Three edits to fold into the next touch of the file, in priority order:

1. **F-01 (Medium)** — scope §3.3's site class 3 to declaration sites (literal or module-level
   constant reference) and reconcile the census figure. As written the guard is red at HEAD on four
   `skill:` fields (`orchestrate-dev.js:5909`, `:5910`, `:9288`, `:9528`), which is the same failure
   mode TE F-40 removed this round, one class over. One clause and one number.
2. **F-02 (Medium)** — drop §9.3's incidental note (FSPEC's `:14-21` is correct) and re-anchor
   §7.8's two script citations to `:16` and `:15-20` / `:21`.
3. **F-03 (Low)** — say which census figures are measured at HEAD and which are counted from the
   edit, in §3.3 and in the changelog line.

F-01 is the one worth doing carefully; F-02 and F-03 are single-sentence corrections. None of the
three changes what the design decides — only what it claims about the tree it is written against.

**No erratum is raised by this round.** I re-measured the one upstream defect this revision
alleges (§9.3's note about FSPEC's script citation) and found the upstream text correct; that is
F-02, a finding against this document, not against FSPEC.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 1}
