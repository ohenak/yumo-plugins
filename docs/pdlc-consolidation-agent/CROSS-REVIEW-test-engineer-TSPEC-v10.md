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

## 4. Positive Observations

## Recommendation

## Verdict
