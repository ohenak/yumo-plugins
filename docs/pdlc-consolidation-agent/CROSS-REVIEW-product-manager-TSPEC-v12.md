# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-consolidation-agent/TSPEC-pdlc-consolidation-agent.md
**Date:** 2026-08-10
**Iteration:** 12
**Mode:** Delta re-review (`b4addcdd..HEAD`, TSPEC v2.1 → v2.2)
**Scope:** The v2.2 diff (106 insertions / 31 deletions) and the claims it newly asserts. Sections
unchanged since v10's approval are not re-litigated, except where a v2.2 claim reaches into them —
which the re-taken upstream version pin does, by construction.

## What changed, and what I checked

v2.2 makes five corrections and one of them is not bookkeeping: **§1's upstream pin is re-taken to
`FSPEC v11.6` and `REQ v2.5`, described as "the versions it has actually absorbed"**. That sentence
is a product claim, so I checked it the only way it can be checked — against the two upstream
documents at HEAD, not against the TSPEC's prose. The four re-derived/mechanical claims verify:

| v2.2 claim | Measured at HEAD | Verdict |
|---|---|---|
| (a) "The FSPEC is no longer cited by line anywhere" | `grep -nE "FSPEC[^ ]*:[0-9]+"` over the TSPEC returns nothing | Holds |
| (b) register is **99** ids, set-equal to §12.3 both ways with an empty diff | FSPEC §13 (`:2099-2249`) carries 99 register rows, 99 distinct ids; §12.3 carries the same 99; `diff` both ways is empty | Holds |
| (c) `rtCheckFile`'s catch-all routes any unrecognised reply to `file_missing`; the double does not | `runtime-adapter.js:817-831`, fall-through `return { ok: false, reason: "file_missing" }` at `:830`; `__tests__/helpers/seams.js:292-306` returns `file_missing` only on a genuinely absent key | Holds |
| (d) `parseMarker` property row; T-09 count "five" | §11.4 now carries five T-09 rows plus the two determinism rows; §12.2's T-09 row states the count | Holds |
| (e) T-13 and the release-set case pin `_now` in the shape the shipped suites use | `advisoryDodSeams.test.js:129` (`_now: fakeClock._now`), `:1116` and `advisoryDisabled.test.js:276` (`_now: () => 0`) | Holds |

Upstream anchors spot-checked against FSPEC HEAD: §4.3 *"Release, and what each terminal status
does"* (`:551`), §13.5 *"The PR route and idempotence"* (`:2166`, AT-Q13 at `:2184`), §13.4 (`:2153`,
AT-R7 at `:2164`), §13.2 (`:2120`, AT-P1 at `:2124`), §6.5's seam-domain verb table (`:1024+`),
BR-09/BR-15 in §18 (`:2598`, `:2610`). All correct except the one named in F-04.

The re-pin is where the product problem is. **REQ v2.1 decided the enumeration question this
document still hands upstream, and decided it against the choice §7.1 ships** — F-01 and F-02 below.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Local | **§7.1 keeps `--exclude-standard`; the REQ this document now pins to forbids it.** §1 declares absorption of `REQ v2.5`. REQ §3.1 step 1 (`REQ-…:141-146`) decides, by name: *"**A `.gitignore`d LEARNINGS file *is* corpus.** Membership is presence on disk under the two globs, not tracked-ness … The pass's enumeration therefore does **not** apply `--exclude-standard`."* The TSPEC decides the opposite and says so twice — §10.4: "`--exclude-standard` is **kept**" (`TSPEC:2051`), *"provisional"*, pending an upstream answer that has already been given — and the flag is baked into the literal argv §7.1 pins (`TSPEC:732`) and into AT-P1's element-by-element oracle (`:763`), the §9.3 permitted-call row (`:1792`) and §12.2's T-08 row. This is not a stale reference: it is a shipped behaviour divergence from a decided requirement, and the AT that would catch it is written to assert the forbidden argv, so the implementation would go green on it. The operator-visible harm is the one REQ names — the hook nags about an ignored LEARNINGS file the pass is forbidden to consume, and the nag never quiesces. **Fix:** drop `--exclude-standard` from §7.1's argv literal, AT-P1's pin, the §9.3 row and §12.2's T-08 row; rewrite §10.4 class (i) from "closable at a price, raised upstream" to "closed by REQ §3.1 step 1", keeping the reasoning as recorded history. (§10.4's own asymmetry note already identifies dropping it as the convergent direction, so the mechanism argument does not have to be re-fought — only the choice reversed.) | REQ-CONS-02 / REQ §3.1 step 1; AC-1.1, AC-1.2 (corpus feeds the volume count) |
| F-02 | High | Local | **The second decided class is not absorbed either: an index-only entry is enumerated as corpus.** Same REQ paragraph (`REQ-…:147-149`): *"**An index entry with no working-tree file is *not* corpus.** … the pass's enumeration is restricted to paths present in the working tree, which closes the second class."* §10.4 class (ii) still states the opposite as accepted residue — "a LEARNINGS file **staged but deleted from the worktree** is in the **pass's** set (`--cached` …)" (`TSPEC:2021`) — and §7.1 (`:805`) then routes it through the unreadable-body path, where §12.2's dedicated case *asserts* that it counts toward `\|un-consolidated\|` and enters the consumed pair. So a file the REQ says is not evidence would be counted toward the volume trigger and permanently marked consumed, with a passing test pinning that behaviour. **Fix:** state the working-tree restriction in §7.1 as an obligation (with the mechanism named — the `--cached` half is what admits these paths), retire class (ii) from §10.4's divergence set, and re-scope the §12.2 unreadable-body case to a genuinely unreadable *present* file, which is the case that still needs it. | REQ §3.1 step 1, second bullet; AC-1.2, AC-2.1 (evidence base) |
| F-03 | Medium | Local | **§13.3 asks upstream a question both upstream documents have answered, quoting text neither still carries.** The bullet "Upstream (REQ and FSPEC) — the enumeration relaxation, raised rather than absorbed" (`TSPEC:2749-2762`) quotes REQ step 1 as closing with *"keeping one enumeration as well as one predicate"*; REQ v2.1 struck exactly that clause and says so in place — *"The second half is not deliverable and is **withdrawn**"* (`REQ-…:131-133`). It also quotes AT-P7's *When* as "both the pass's enumeration and `nudge-consolidation.sh` are run over each case … the two sets are set-equal"; FSPEC v11.6's AT-P7 (`FSPEC-…:2130`) reads "the **two predicates** are evaluated over each case" and scopes itself "the predicate, and only the predicate". Both halves of the erratum this document raises are settled, in the direction the document argued for. §12.2's T-08 row repeats the stale framing ("§13.3 raises the relaxation of REQ `:115-116`'s 'one enumeration' upstream as an erratum rather than settling it here"). Left standing, a PLAN reader sees a live upstream dependency where there is none, and — worse next to F-01 — reads the un-absorbed choice as legitimately open. **Fix:** rewrite the bullet as absorbed-and-closed, citing REQ §3.1 step 1's two bullets and FSPEC AT-P7's re-scoped *When*, and correct T-08's clause with it. The third sub-question that rides in that batch (should the log row carry an `unread:` field?) is genuinely still open and should survive the rewrite. | REQ §3.1 step 1; FSPEC §13.2 AT-P7, BR-09 |
| F-04 | Low | Local | **AT-P7 is cited to the wrong register subsection — in a line the v2.2 rule was written to make right.** `TSPEC:2753` reads "(FSPEC §13.7 register, AT-P7…)". AT-P7 is a §13.2 row (*"The consumed predicate and the corpus (§3)"*, `FSPEC-…:2120-2136`, the row at `:2130`); §13.7 is *"Falsifiability (§8)"* and carries the AT-F family. The BR-09-in-§18 half of the same parenthesis is correct. Every other §-recast in this diff checks out, so this is a single slip, not a pattern — but §-plus-heading is the form the new rule prescribes precisely because a bare §-number is as guessable as a line number was; naming the heading would have caught it in the writing. **Fix:** "FSPEC §13.2 register, *The consumed predicate and the corpus*, AT-P7". | REQ-CONS-02 traceability |
| F-05 | Low | Process | **The citation rule was applied to the FSPEC and not to the REQ, and all four REQ line pointers are now stale.** §12.3's new rule is scoped to "this document's own citations of the FSPEC". The REQ is still cited by line four times, and REQ v2.1–v2.5 moved all of them: `REQ-…:113-114` for *"abandoned work is not evidence about a delivered pipeline"* (now `:128`); `REQ-…:115-116` for step 1's closing sentence (now `:129`, and the quoted second half is withdrawn — F-03); `REQ-…:155-156` twice for AC-1.3's *"in-place rewrites of a whole small file"* (now `:188-189`; `:155-156` is today the `skipped-cadence` step). The stalest one, `:155-156`, is cited as upstream authority for §13.1 row 13's shape decision, so a reader following it lands on unrelated text while checking a load-bearing row. **Fix:** widen §12.3's rule to *every* upstream document and re-cast the four pointers as §-plus-quoted-phrase. Worth carrying as a Process signal: a citation rule stated for one upstream document leaves the other's pointers looking sanctioned. | REQ-CONS-01, AC-1.3 |
| F-06 | Low | Local | **§12.2's provenance sentence under-scopes the register it quotes from.** "Every AT named above is described in the register's own words, taken from FSPEC §13.5's rows" (`TSPEC:2525`) — but the ATs named above it span AT-P7 (§13.2), AT-M3/AT-M11 (§13.3), AT-R7 (§13.4), AT-Q6/Q8/Q13 (§13.5), AT-L5 (§13.9) and AT-M4/AT-M6. The re-cast inherited the narrowness of the line range it replaced (`FSPEC-…:2064-2077`). The sentence's own argument — quoting is what makes a mis-bound row visible to a human, since the traceability test is blind to it — needs the whole register, not one subsection. **Fix:** "taken from the register rows of FSPEC §13 (§§13.1–13.9)". | REQ-CONS-03 traceability |

| F-07 | Low | Local | **The `nudge-consolidation.sh` row was left at its pre-edit line while the two SKILL.md rows in the same table were re-measured.** v2.2 correctly re-measured §3.2's SKILL rows to the post-edit file (`consolidate-learnings/SKILL.md:56`, `:62` — both confirmed at HEAD), but the hook row still reads "`:28`'s single `os.path.join` glob replaced by a named two-literal `CORPUS_GLOBS` tuple". At HEAD the hook already carries `CORPUS_GLOBS` at `:60-61` and `pending` at `:73`, so the row describes a pre-edit file for an edit that has landed, in a table whose neighbours were updated in the same commit. No obligation changes — the row's *content* (named tuple, two literals, `pending` fall-through, env-gated stderr) is right. **Fix:** re-measure the row's locators the way the SKILL rows were, or drop them in favour of the symbol names, which is what §7.1 already requires the oracle to locate by. | REQ §5 (files in scope) |

## Questions

| ID | Question |
|----|---------|
| Q-01 | F-01's fix direction looks forced by the REQ, but I want the trade-off named out loud once more before it is written, because §10.4 argues the *opposite* case well: an ignored LEARNINGS file is one "its own repository has said is not part of its record", and consolidating it promotes evidence into `DOMAIN-CONSTRAINTS.md` from a source no reviewer sees in a diff. REQ §3.1 step 1 weighed that and decided the other way, on the nag-that-never-quiesces argument, so the TSPEC must follow — but if the SE believes REQ's decision was made without §10.4's promotion-provenance argument in front of it, the correct move is an erratum against the REQ, not a second round of "provisional" in the TSPEC. Which is it: absorb, or raise? Either answer closes F-01; leaving it open a third round is the only outcome that does not. |
| Q-02 | §12.2's unreadable-corpus-entry case currently rests part of its motivation on the staged-but-deleted fixture (`TSPEC:805`, `:2381` notes the harness cannot construct one). If F-02 removes that class from the corpus, does the case still have a real production trigger — a present file whose body genuinely cannot be read — or does the row shrink to a defensive branch? I think it survives (a file present with an unreadable body is reachable on permissions alone), but the row should say which trigger it now models rather than inheriting the old one. |

## Positive Observations

- **The line-citation eradication is real and complete, not a gesture.** Twelve `FSPEC-…:NNNN`
  coordinates were re-cast as §-plus-heading-plus-id and the grep confirms zero remain. Three
  consecutive rounds had each spent a finding on one of those pointers; this diff removes the class,
  and §12.3 states the rule so the next author inherits it. F-04 and F-05 are the two spots the sweep
  did not reach — they do not diminish the sweep.
- **The corollary drawn from v11's F-01 is better than the fix I asked for.** I raised a
  self-invalidated aside in one changelog entry. v2.2 struck the aside *and* generalised it: an
  erratum entry cites what a pointer should name and never narrates what the stale one currently
  hits, because the insertion carrying the narration invalidates it in the same commit. That is a
  durable rule extracted from a Low finding, and it is the kind of thing the harvest should carry.
- **The `_checkFile` disclosure is honest in the direction that costs the author something.** §11.6
  now states that the shipped adapter's catch-all routes *any* unrecognised probe reply to
  `file_missing` (`runtime-adapter.js:830`), that this makes AC-1.3's mutual exclusion fail-open on
  that path, that no L2 fixture can reach it, and that §5.1's agreement comment must not be read as
  claiming otherwise. Both citations check out. A weaker document would have left the comment
  standing and the reader inferring.
- **T-13's clock is pinned rather than shape-matched, with the reason stated.** `{ISO-8601}` as a
  literal expected value — `_now` supplied through the injections in the shape three shipped suites
  already use — closes the hole a regex would leave: a release stamped with the take's instant now
  reds, and a wrong instant is exactly what corrupts a later pass's staleness arithmetic. The same
  oracle was carried across to the release-set case rather than stated once and forgotten.
- **The register re-derivation is a re-derivation.** 99 rows, 99 ids, set-equal to §12.3 with an
  empty diff in both directions — I measured it, and the document is right to demote the number to
  a reader's summary with `consolidationTraceability.test.js` as the mechanism.

## Recommendation

**Needs revision**

Two High findings, both the same root cause and both closable in one edit: **the re-pin to `REQ v2.5`
is asserted but not performed.** REQ §3.1 step 1 decides two corpus-membership rules — a
`.gitignore`d LEARNINGS file *is* corpus (so `--exclude-standard` must go), and an index entry with
no working-tree file is *not* — and §7.1/§10.4 still ship the first the other way round and record
the second as accepted residue. §13.3 then hands both questions upstream as an open erratum, quoting
REQ and FSPEC text that neither document still carries. What must change:

1. **F-01** — drop `--exclude-standard` from §7.1's argv literal, AT-P1's element-by-element pin,
   §9.3's permitted-call row and §12.2's T-08 row; rewrite §10.4 class (i) as closed by REQ, keeping
   the argument as history.
2. **F-02** — state the working-tree restriction as a §7.1 obligation, retire class (ii), and
   re-scope §12.2's unreadable-entry case to a present-but-unreadable file (see Q-02).
3. **F-03** — rewrite §13.3's enumeration bullet as absorbed-and-closed and correct T-08's clause;
   keep the genuinely open `unread:` sub-question.
4. **F-04 / F-05 / F-06 / F-07** — Low, fold into the same touch: AT-P7 is §13.2 not §13.7; widen
   §12.3's citation rule to the REQ and re-cast its four stale pointers; scope §12.2's provenance
   sentence to FSPEC §13 as a whole; re-measure the hook row's locators.

Everything else in the v2.2 diff I verified holds, and none of the mechanism, oracle-strength or
acceptance-criterion work approved at v10 is disturbed by these fixes.

## Verdict

VERDICT: Needs revision
{"high": 2, "medium": 1, "low": 4}
