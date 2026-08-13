# Cross-Review: test-engineer — TSPEC (delta confirmation, erratum round)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-engine-distribution/TSPEC-pdlc-engine-distribution.md (v0.10)
**Date:** 2026-08-13
**Iteration:** 10
**Scope:** Erratum delta confirmation — the seven raised items, plus upstream fidelity of the
edited text (REQ v0.10, FSPEC v0.2, sibling DECISIONS v0.3 at HEAD). Not a whole-document
re-review; nothing settled in rounds 1–8 is re-opened here.

## Item disposition

Diff read: `a3d3489a..HEAD` on this file (seven commits, `046f0c58`…`85ecb399`). Every edit is
additive except D-5's row (§4), §6.5's closing paragraph and two §12.1 rows.

| # | Raised item | Landed? | Note |
|---|---|---|---|
| 1 | §5.1 must name O-8 blocker 1 as closed by this feature | **Yes** | §5.1's manifest row for `private` plus the new paragraph (`:216-222`); PF-3 (§8.3, `:1199`) asserts `private` absent at publish time; blockers 2/3 named as the only operator-owned ones. `"private": true` at `pdlc/engine/package.json:4` verified at HEAD |
| 2 | §5.1/§5.2 must create `pdlc/engine/.npmignore` | **Yes** | Inventory row (§5.1) and the §5.2 paragraph scheduling it in the same task as the `vendor/` git-ignore rule; "never a packed member" stated, PK-* set explicitly unchanged |
| 3 | D-5's wording reconciled to a shipped `.npmignore` | **Yes** | §4's D-5 row now reads "decides the packed set" and cites DEC-EDIST-05 + DEC-EDIST-01; §5.4 carries the two consequences (never packed, cannot widen). Matches DECISIONS §6 (`:415-421`) |
| 4 | §6.2 must *decide* the signalled child, not name signal handling | **Yes** | `128 + signum` per DEC-EDIST-06 (DECISIONS §7, register row `:812`), with an exact-number leg (`130` for `SIGINT`) replacing what a `!== 0` would have let `null`-coerced-to-0 satisfy; §12.1's fixture-machine row carries it |
| 5 | §6.5's "covers it for free" claim must be withdrawn as false at HEAD | **Partly** | The withdrawal is correct and its citations verified (below). The *replacement* oracle is named at a level that cannot observe half of what it asserts — F-45 |
| 6 | AC-5.6 needs a named path-level oracle | **Partly** | Same as 5; and DECISIONS §5's second assertion has no counterpart here — F-46 |
| 7 | §5.2's repo-change list must schedule the file | **Yes** | Same §5.2 paragraph; the two files are stated to be authored in one task, which keeps the PLAN's ownership manifest to one row |

Upstream re-grounding: REQ is v0.10 and FSPEC v0.2 at HEAD, and neither has moved since before
the approval anchor `a3d3489a` (last REQ/FSPEC commits `c38feb61`, `10e71331`, `b87c06f2` all
precede it). The changelog's "nothing to absorb" is true. One upstream citation in the new text
is not, however, supported by REQ at HEAD — F-47.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-45 | High | Local | **AC-5.6's new path-level oracle is not writable against the seam this TSPEC specifies.** §6.5 (`:650-655`) names "a unit test over `resolvePluginRoot`" that asserts both (a) the returned root is the discovered one and (b) "the run's notices contain the entry by catalogue id, with its rendered text". At HEAD `resolvePluginRoot` returns `{ok, root, source, reason, tried}` (`pdlc/engine/lib/skills.mjs:204-231`, JSDoc `:200-201`) — there is **no notices channel on it**; §3.1's change table places the ignored-env notice in a *different* module (`:101`, "startup gains … the ignored-env notice"), while the `skills.mjs` row (`:102`) says only that the function "gains a `devDeclared` input"; §10.1 has no seam row for it. So (a) and (b) are observable in two different units, and an implementer must choose the shape before they can write the test — the choice the erratum was raised to remove. Sibling DECISIONS §5 already decides it the other way: assertion 1 there says `resolvePluginRoot({devDeclared: false, env: …})` "**returns a notice list** containing the `env.plugin-root-ignored` id". The fix is the discipline this document already applies to S-2 (`:1631-1638`, "the shipped function's shape, extended"): state the extended return shape (e.g. `{…, notices: string[]}`), reconcile §3.1's `:101`/`:102` rows to whoever renders it, and add or extend the §10.1 row. Without it the likely resolution is to assert (b) one level up, where §6.5's own two paragraphs have just finished explaining that the observation is path-blind | §6.5, §3.1, §10.1 |
| F-46 | Medium | Local | **The honour-direction assertion decided in DECISIONS §5 has no counterpart in the new text.** DECISIONS' assertion 2 requires the `devDeclared: true` × variable-set row to assert the variable **is** honoured, "so a regression that ignores it unconditionally is caught too". §6.5's new paragraph pays only the absence half — "the three other rows assert **no** such notice" — and absence of a notice is satisfied by an implementation that ignores the variable unconditionally and stays quiet, which is precisely the regression DECISIONS names. Add the positive row-1 assertion (resolved root `===` the env value, `source` unchanged) to §6.5 and to §12.1's unit row, so the four-row oracle is falsifiable in both directions rather than in one | §6.5, §12.1 |
| F-47 | Medium | Local | **`AC-1.4's exit-code contract` cites an authority that does not exist upstream.** §6.2 (`:461`) and the v0.10 changelog both justify the signalled-child decision by saying exiting 0 "collides with AC-1.4's exit-code contract". REQ v0.10's AC-1.4 (`REQ:266-270`) is the *version-triple query* and says nothing about exit codes; REQ carries no exit-code statement anywhere (`grep` for `exit` in REQ returns only §'s bootstrap rows `:434-435`), and the "exits non-zero" statements are FSPEC's refusal paths (`FSPEC:93`, `:300`, `:600`), which a signalled child is not. This TSPEC's own §11 rows even give AC-1.4 exit code **0**. The decision itself is well-grounded — DEC-EDIST-06 carries it and the oracle is exact — so the repair is one clause: attribute the collision to DEC-EDIST-06 / §11's exit-code table (or state it plainly as a TSPEC-level decision about a hop REQ does not specify), not to AC-1.4 | §6.2, changelog v0.10 |

## Questions

| ID | Question |
|----|---------|
| Q-23 | Which unit *emits* the ignored-env notice — `resolvePluginRoot` (returning it, as DECISIONS §5 assumes) or `startup.mjs` (as §3.1's `:101` row says)? Answering this inside §6.5 resolves F-45 and fixes the test level in one sentence. |
| Q-24 | Does the signalled-child leg call `message()`/the catalogue at all, or is `128 + signum` a bare `process.exit`? If the launcher emits nothing on that path, the suite-wide reverse equality is unaffected; if it does, the id needs a §10.3 row. |
| Q-25 | Shipping any `.npmignore` suppresses npm's `.gitignore` fallback for the whole package, not just for `vendor/`. Is any expected `PK-*` row's *exclusion* currently relying on that fallback rather than on the `files` allow-list? If not — and §5.4 reads as though it is not — saying so in one clause would close the question permanently, since PF-4's real pack is the only thing that would catch it. |

## Positive Observations

- The withdrawal in §6.5 is correct in every particular I could check at HEAD:
  `__tests__/catalogue.test.js:71-74` does compare `messageIds()` with `Object.keys(MESSAGES)`
  (module against itself), its header `:4-6` does disclaim the emitted-ids equality, and
  `checkMessageCatalogue` (`_assert-suite-wide.mjs:196-210`) does run both directions over
  emitted records with no notion of *which* path emitted. Naming the reverse direction as an
  emission **obligation** rather than as coverage is the right reading, and it is the reading
  that keeps the suite-wide step honest as a backstop.
- §6.2's signalled leg is specified as an **exact-number** assertion on a literal, with the
  reason stated: a `!== 0` would have been satisfied by the very `null`-coerced-to-0 defect
  being closed. That is the falsifiability standard this document has been holding elsewhere,
  applied to a new leg without being asked twice.
- The `.npmignore` addition is priced with its own oracle accounting rather than left as a
  file: never a packed member, PK-* unchanged, cannot widen the set. And PF-4's both-directions
  equality over a real `npm pack` is exactly what falsifies the "never packed" claim if some npm
  major disagrees — the claim is covered by a shipped oracle, not by assertion.
- O-8 blocker 1's closure is tied to an existing assertion (PF-3, §8.3) rather than announced,
  so "closed by this feature" is a testable statement, and the two remaining blockers stay
  visibly operator-owned.

## Recommendation

**Needs revision**

Five of the seven raised items land cleanly and nothing previously approved is broken — the
delta is additive, the D-5 and §5.4 rewordings are faithful to DECISIONS §6, and no round-1–8
decision is re-opened. The two AC-5.6 items are only half-landed: the false claim is correctly
withdrawn, but the oracle replacing it asserts a notice on a unit that has no notice channel
(F-45), and drops the honour-direction assertion its own decision record carries (F-46). Both
are repairable inside §6.5 plus two table rows, without touching anything else.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 2, "low": 0}
