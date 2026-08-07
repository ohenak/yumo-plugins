# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-consolidation-agent/TSPEC-pdlc-consolidation-agent.md (v2.0)
**Date:** 2026-08-07
**Iteration:** 10
**Type:** Delta re-review
**Scope:** the diff `569578d0..HEAD` (the v1.8 bytes I reviewed at v9 → the v2.0 mechanism change).
Sections outside that diff are not re-reviewed and stand approved from v8/v9.

## 1. Prior findings — disposition

Each was checked against the sources it turns on, not against the document's account of them.

| ID (v9) | Sev | Disposition | Evidence I re-derived |
|---|---|---|---|
| F-01 | High | **Resolved — at the mechanism, not by disclosure** | §7.3 adopts the `RELEASED:` sentinel. `parseMarker` now accepts two forms and returns a `state` discriminant (`TSPEC:943-955`); `markerVerdict` maps `released` ⇒ `free` **without consulting the age** (`:956-961`); `releaseMarker` writes `RELEASED: {passId} {ISO-8601}` (`:977`). Both AT-M11 fixtures are now satisfiable at this layer and the erratum raised from §12.3's cell is withdrawn (`:2497`). The upstream is exactly as cited: `FSPEC:2585` BR-14a ("in-place write of `RELEASED: …` — never by removing the file … taken like an absent one, at any age, with no reason code"), `FSPEC:2679` E-11b, `FSPEC:2678` E-11, `FSPEC:435-436` the lifetime rows, `FSPEC:476` the `RELEASED:` outcome row. §7.3's approved premise survives untouched — `grep -c "unlink\|rm -f\|rmdir" pdlc/workflows/runtime-adapter.js` is still `0`, and a sentinel write needs no unlink. |
| F-02 | Medium | **Resolved** | §13.3's marker bullet is re-cast as closed (`:2645-2660`): it names BR-14a / E-11b / E-11, states the product answer in terms (*must the log witness a pass that died inside its own take? — yes*), and tells the PLAN not to re-raise the erratum. The companion §13.1 row 13 (`:2590`) is re-decided in the same direction, and §13.3's DECISIONS bullet (`:2608-2612`) restates row 13's new alternative set. No text anywhere in the document still hands the question downstream — I grepped `zero-byte`, `empty marker`, `file_empty`, `row 4a` and `released form` and every hit is on the new side. §10.3's rows 4/4a are collapsed into one reclaim row (`:1940`) with no dangling cross-reference left to 4a. |
| F-03 | Medium | **Resolved, and the arithmetic now closes** | §12.2's `CLAUDE.md` row (`:2450`) names the exclusion — the enumeration **minus `distribution-manifest.json` itself**, set-equal to the manifest's `rows[]` read as `pdlc/` + `pluginPath`. Verified at HEAD: `rows[].id` is exactly `orchestrate-dev`, `orchestrate-queue`, `pdlc-cli`, and `pluginPath` is repo-relative-minus-`pdlc/` (`workflows/dist/orchestrate-dev.bundle.js`), so the stated join is the right one. Post-feature both sides are four members — §3.2's row (`:170`) adds both the `consolidate-learnings.bundle.js` bullet and the missing `pdlc-cli.mjs` one, and this feature's `bundles` row adds the matching manifest row (`:162`). Set equality is achievable on correct code, and it stayed set equality rather than degrading to containment. |

Two structural properties of a mechanism change this size, checked because they are what such a
change usually gets wrong:

- **Nothing downstream of §7.3 still assumes the old form.** T-13's conjunct (ii) (`:1881`), §12.2's
  release-across-the-status-set row (`:2447`) and §10.1's step-16 comment (`:1856`) all now read the
  sentinel; the take-side read-back conjunct gained `parsed.state === "in-progress"` and added a
  `RELEASED:` line to its failed-take list (`:1067-1068`, `:1079`). No oracle in the document is
  stated against `""` any more.
- **The register was not perturbed.** I re-extracted the `AT-…` ids from FSPEC §13 and from §12.3
  and diffed both directions: **empty, 99 each side**. The delta re-labels prose and retires two
  `(no FSPEC AT)` cases into ids already assigned; it mints, moves and drops nothing.

## 2. Findings

No High and no Medium. Three Lows, all raised against text this delta changed.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| L-01 | Low | Local | **The register measurement is pinned at "FSPEC v11.3" and the FSPEC is now v11.4.** `TSPEC:2494`'s preamble and the v1.8/v2.0 changelog entries (`:15`, `:35`) all name v11.3; `FSPEC:12` reads `11.4`. I checked the consequence before raising it and there is **none for coverage**: I re-extracted both id sets and they are still 99-for-99 with an empty diff both ways, and v11.4's two content commits (`d13c9ea8`, `99aff9bc`) touch BR-13's narrowing, E-12b and AT-P7's observation channel, none of which mints or retires an id. So this is a stale label, not a stale measurement — and §12.3 already sites the guarantee in `consolidationTraceability.test.js`'s run-time re-derivation, which is why a fourth drift of this number should red rather than need a fifth erratum. Fix by re-pinning the three version strings, or by dropping the version qualifier entirely and letting the test own the claim. | §12.3 (`:2494`), `FSPEC:12` |
| L-02 | Low | Cross-Feature | **The presence probe's production catch-all is now verdict-deciding, and no double can reach it.** §7.3 decision 2 (`:985-995`) now rests on `file_missing` being *the* absent reason. In production `rtCheckFile` returns `{ok:false, reason:"file_missing"}` not only for a genuinely missing file but as the **fall-through for any unrecognised agent reply** (`runtime-adapter.js:827-830`: `OK` ⇒ ok, `EMPTY` ⇒ `file_empty`, *everything else* ⇒ `file_missing`), whereas `fakeFs.checkFile` returns it only when the key is genuinely absent (`__tests__/helpers/seams.js:292-306`). So a garbled or failed probe reply reads as *no marker*, the pass takes the lock, and AC-1.3's mutual exclusion is fail-**open** on that path — and no L2 fixture can construct the state, because the double has no failure member (`CheckReply` is a three-value union with none, `TSPEC:318`). This is not a regression the delta introduced (v1.8 routed the same reply to `free` too) and it is consistent with the posture §11.6 already takes for `_envPresent` ("an agent prompt … reviewed, not executed"), which is why it is Low rather than Medium. But §5.1's new comment now asserts the two implementations "agree exactly on the one state this layer reads" (`:316`), which is true of the *file states* and not of the reason's provenance. Ask: one sentence in §11.6 (or §10.4's residue list) naming the conflation, so the fail-open is disclosed rather than implied by an agreement claim. | §5.1 (`:305-318`), §7.3 decision 2 (`:985-995`), §11.6 |
| L-03 | Low | Local | **`parseMarker` is a two-form parser and §11.4 still lists no property for it.** The delta widened the grammar from one accepted line to two plus a `state` discriminant (`:943-955`), which makes "anything else yields `null`" a wider claim than it was at v1.8; §11.4's six strategies cover the two-region predicate, `passId`, config parse, escalation count, `mergeProposals` and `effectivenessTable`, and none covers the marker parser. A strategy is cheap and states itself (over random text: `parseMarker` is total; it returns non-`null` iff the text is exactly one line matching one of the two verbs; on a well-formed line the `state`, `passId` and `at` round-trip the generated triple). I am **not** escalating this to the Medium my own parameterisable-component rule would otherwise give it: §11.4 is outside this delta and I approved it at v8 with `parseMarker` already a parser, so raising it now would re-litigate a section this revision did not touch. Recorded so the choice is deliberate — either add the strategy or exempt it by name in §11.6. | §11.4 (`:2343`), §7.3 (`:943-955`) |

No finding is raised against §7.3's rewritten body, §10.3 row 4, §12.2's marker row, §12.3's
`consolidationPass.test.js` row, §13.1 row 13 or §13.3's two re-cast bullets: I checked each cited
line, each upstream authority, and each oracle's falsifiability, and all of them hold.

## 3. Questions

| ID | Question |
|----|---------|
| Q-01 | T-13's conjunct (ii) and §12.2's release-set row both assert the marker's last recorded contents "match `RELEASED: {passId} {ISO-8601}`". The `{passId}` half is checkable — §7.2 derives it deterministically from the fixture log, so a test can transcribe it from the input rather than read it off the produced record. The `{ISO-8601}` half is a clock read. Is the intended oracle a **shape** match (verb + this pass's own id + any well-formed timestamp), or is `_now` pinned in those two cases? Both are fine; the two rows should say which, or the implementer will pick per-case and one of them will read the timestamp off the record it is meant to be checking. |
| Q-02 | L-02's fail-open path — a garbled `_checkFile` reply on the marker read as absent — is invisible to every double. Is that worth one L3 source-text assertion over `rtCheckFile`'s three-branch mapping (the shape §11.3(e) already uses for `rtWriteFile`'s prompt), so at least the *adapter's* classification is pinned against a later prompt edit that drops the `EMPTY` branch? That edit would silently turn every truncated marker into an absent one and delete E-11's arm from production while all of §12's L2 fixtures stay green. |

## 4. Positive Observations

- **The absorb decision is the right one and is argued from the premise rather than around it.**
  §7.3's approved reasoning was "no seam can unlink"; the new text shows the sentinel satisfies that
  premise unchanged and only retires the `file_empty ≡ absent` equivalence that was scaffolding on
  top of it (`:1020-1026`). That is why a mechanism change this large needed no re-review of §7.3's
  foundation — the load-bearing claim did not move, and I re-verified it at HEAD (`grep -c` for any
  removal verb in `runtime-adapter.js` is still `0`).
- **Three observations, three outcomes, one case.** §12.2's marker row (`:2446`) holds AT-M3's two
  fixtures and AT-M11's two in a single case *because the pairing is the oracle*, and it says so.
  That is the strongest form available here: an implementation that reclaims on every take fails
  AT-M11, one that never reclaims fails AT-M3, and neither conjunct is absence-only — AT-M11 carries
  "taken, a normal terminal status" alongside its two negatives, AT-M3 carries the positive
  `reclaimed-stale-lock` with abandoned id `unknown`. The v1.8 `(no FSPEC AT)` case asserted the
  *opposite* of what this one asserts, and it was retired rather than left to contradict the ids.
- **The withdrawal is recorded, not erased.** §13.1 row 13, §12.3's `consolidationPass` row and
  §12.2's marker row all keep the old decision as history and mark it superseded, and the changelog
  annotates the v1.8 entry in place rather than rewriting it (`:39-40`). A future agent reading row
  13 gets both arms of the trade and the reason the loser lost, which is exactly what DECISIONS is
  for — and §13.3 already flags row 13 as DECISIONS-warranted with a `Testability:` line owed.
- **The `CLAUDE.md` oracle's exclusion is named in the same shape as its sibling's.** The `BUNDLES`
  half of that case already excluded `.mjs`; the manifest half now excludes the manifest's own row
  and states *why* (the authority carries no row for itself — which I confirmed at HEAD). It stayed
  set equality in both directions, and the row names the exact drift containment would have passed:
  `pdlc-cli.mjs`, tracked and stamped and unadvertised.
- **No hand-carried number was left to go stale, and I could confirm the one that remains.** 99 ids
  on both sides, empty diff both directions, at a FSPEC one minor revision newer than the one the
  document names. The only defect left in that area is the label (L-01), which is the difference
  between the third erratum round on this table and this one.

## Recommendation

**Approved with minor changes.**

All three v9 findings are resolved, and F-01 is resolved at the mechanism rather than by the
disclosure I would also have accepted: §7.3 adopts FSPEC BR-14a's `RELEASED:` sentinel, so AT-M3's
truncated arm and both of AT-M11's fixtures are satisfiable against this layer's own behaviour and
the PLAN task that writes them is no longer red on arrival. The revision broke nothing I previously
approved — I traced every consumer of the old release form (T-13, §12.2's release-set row, §10.1's
step-16 comment, §10.3, §12.3, §13.1 row 13, §13.3) and each reads the sentinel; §12.3's register is
still 99-for-99 set-equal to FSPEC §13 with an empty diff in both directions; §7.3's load-bearing
premise is unchanged and still true at HEAD.

The three Lows are corrections, not blockers: re-pin the FSPEC version label (L-01), disclose the
presence probe's catch-all conflation now that its reason decides a verdict (L-02), and either add a
`parseMarker` property strategy or exempt it by name (L-03). Q-01 is worth answering in the same
pass — it costs one clause in two cells and removes the only place an implementer could accidentally
read an expected value off the record under test.

## Verdict

VERDICT: Approved with minor changes
