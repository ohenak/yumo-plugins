# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md
**Date:** 2026-08-10
**Iteration:** 19 (delta re-review over the v2.3 anchor re-measurement wave)
**Scope:** Delta only — the eight commits `0cca9502..c93f5032` that landed the v2.3 erratum. Untouched sections not re-reviewed, except where the delta's own new universal claim ("every `file:line` below is measured after `b22834b7`") puts them in range.

## Delta examined

`git diff 39001869..HEAD -- docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md` — one version bump, an erratum-note rewrite (v2.1/v2.2 retired, v2.3 recorded, plus a new **"Code anchors: one epoch"** note), a citation re-measurement wave across five named families, REQ-CONS-01's pre-T09 quotes moved to past tense, AC-3.8b's cause list set-equalised with AC-3.4's, and §4b's new unreadable-basename decision.

## Prior findings (v18) — disposition

| v18 | Status | Evidence at HEAD |
|---|---|---|
| F-01 stale `nudge-consolidation.sh` / `orchestrate-dev` cites mid-sentence | **Resolved** | `:73-74` is the pending filter, `:60-61` is `CORPUS_GLOBS` + its glob, `:2060` is `resolveAdvisoryRung` — all verified by reading the lines |
| F-02 uniform +227 shift on the `orchestrate-dev.js` family | **Partly resolved** — see F-01 below | `:959`, `:1879-1880`, `:1896`, `:2060`, `:2086`, `:2935`, `:9476`, `:9497` all now land exactly; five siblings did not move |
| F-03 sweep by cited file, not extension | **Resolved in method** | `.sh`, `.js`, `.md` and `runtime-adapter.js` all re-measured this round |
| F-04 changelog no longer describes the document | **Resolved** | v2.3 row + erratum note enumerating the five families and the three substantive edits |
| F-05 no anchor epoch declared | **Resolved, well** | The "one epoch" note pins `b22834b7` (verified: that sha is the T09 hook-edit commit) and states the past-tense convention; REQ:81-84 now applies it correctly — `SKILL.md:56` supports a past-tense sentence while pointing at today's line for that role |
| F-06 AC-3.8b vs AC-3.4 cause set | **Resolved** | REQ:318 now carries `AC-6.3 — set-equal to AC-3.4's causes` |
| F-07 `orchestrate-queue.js:1576` | **Resolved** | `:1583` is `commitQueueRow`, `:1584` the `add --`, `:1587-1592` the pathspec-scoped commit, `:1622` `commitAdvisoryRecord` |

## Verification performed

Every `file:line` in the document read at HEAD, bare `:NNN` continuations resolved to their governing file. Correct: `QUEUE.md:11,:304`; `hooks.json:3,:14,:29`; `nudge-consolidation.sh:4,:25,:60-61,:63,:67-68,:73-74,:85-87`; `consolidate-learnings/SKILL.md:56,:64,:75`; `harvest-learnings/SKILL.md:70-79`; `runtime-adapter.js:941,:951`; `orchestrate-dev.js:48-53,:61,:959,:1879-1880,:1896,:2060,:2086,:2935,:9476,:9497`; `orchestrate-queue.js:1583,:1584,:1587-1592,:1622`; `DOMAIN-CONSTRAINTS.md:245`. Six do not resolve — F-01 and F-03.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **The `orchestrate-dev.js` family was swept as a paragraph, not as a set — five anchors remain at the pre-shift epoch, four of them in the same sentence as a fixed one.** REQ:304 correctly re-measured `guardVerdict` `:732`→`:959`, but its own continuation clauses did not move: `effectiveGuardPaths` `:709` (HEAD `:709` is a **blank line**; the export is `:936`), Phase MERGE's ladder `:899-900` (HEAD is `const primaryRaw = …`; the `effectiveGuardPaths`/`guardVerdict` call pair is `:1126-1127`), the advisory-envelope check `:2143` (HEAD is a bare `*` comment line; the envelope's `guardVerdict` call is `:2370`), and the `mergeMode: "off"` refusal `:838` (HEAD is a doc comment about `observeCi`; the refusal is `:1065`, reason `:1070`). All four are the same uniform **+227**, i.e. the exact shift v18 F-02 named. Separately, REQ:328's `gitWithLockRetry` `:8670` resolves to `if (ready.length === 0) break;`; the function is `:9424` (its two call sites `:9477`, `:9497`). Note `:61` (`mergeMode: "off"`) *is* correct — the constant did not move — so this is not a blanket offset to apply blind: each of the five needs reading. This falsifies the delta's own new universal claim that every `file:line` below is measured after `b22834b7`. | AC-3.8 (REQ:304-306), AC-3.8b (REQ:328), erratum note (REQ:18-20) |
| F-02 | Medium | Local | **§4b's new all-unreadable case is reachable and terminal but its terminal status is unnamed.** REQ:616-619 now decides that an unreadable basename *stays* in the un-consolidated set and counts toward AC-1.2's volume trigger, so a wholly-unreadable corpus fires the trigger, runs a pass and consumes nothing. But AC-1.4 admits `no-op` only when the un-consolidated set is **empty** or every promotion was duplicate-suppressed — neither holds here (the set is non-empty, nothing was suppressed), and AC-7.1's status set is asserted to be total ("one stated outcome per status, so no status is unmapped"). "Reporting its terminal row" does not say which row. Fix: name the status this case takes from the existing catalogue (`no-op` reads right, with AC-1.4's condition widened to "no promotion was made", keeping AC-5.3/AC-5.5's streak rule keyed on consumed-set emptiness as it already is). | §4b (REQ:616-619) vs AC-1.4 (REQ:222-229) |
| F-03 | Medium | Local | **`build-runtime.mjs:465` is stale and outside the five swept families.** REQ:396 claims `:465` "mints the fourth" tracked output; HEAD `:465` is a blank line inside the string/brace scanner. The `pdlc-cli.mjs` artifact row is `:564-567`. Minor in itself, but it is the counter-example to sweeping by *family*: the families were enumerated from v18's finding text rather than from a repo-wide grep of the REQ's own citations, so a file named in exactly one place was missed. A single `grep -oE '[A-Za-z0-9_./-]+\.(md\|js\|sh\|mjs)\:[0-9]+'` over the REQ (plus the bare `:NNN` continuations) produces the whole set in one pass. | REQ:396 |
| F-04 | Medium | Local | **A permanently-unreadable LEARNINGS makes every subsequent tick run a model-billed pass with no forward progress, and nothing distinguishes it.** By F-02's same new text the file never leaves the pending set, so once the count is at threshold the volume trigger fires on *every* tick, each pass taking the marker, resolving an advisory rung (AC-1.5) and writing a row, forever. Termination per pass is stated; termination of the *loop* is not, and no reason code marks "ran, consumed nothing, because the corpus is unreadable" — so this is indistinguishable in the log from an ordinary quiet pass. Cheapest fix that keeps the decision: a reason code on the row (e.g. `corpus-unreadable`, with the count) so the condition is greppable and an operator can act; a retry bound would need new state and is not worth it. | §4b (REQ:616-619), AC-1.2 (REQ:177-180) |
| F-05 | Low | Process | **The re-anchor tax has now been paid five times** (v2.1, DOD G/H/J, v2.3) and F-01 shows it is still not converging. The v2.3 epoch note is the right half of the fix — it makes anchors falsifiable — but the durable half is v18's Q-01: measured facts belong in `docs/_constraints/pdlc-consolidation-vocabularies.md` with `M-*` ids, measured once at a pinned sha, cited by id from the REQ. Not blocking, and not for this round; worth a DECISIONS row so the next REQ does not inherit the habit. | REQ-wide |

## Questions

| ID | Question |
|----|---------|
| Q-01 | The epoch note pins `b22834b7` (T09). Anchors will shift again on the next commit to `orchestrate-dev.js` — is the intent that they are re-measured on every such commit, or that the note's "measured after T09" is read as a historical statement and staleness is tolerated after that point? The second reading is the honest one for a shipped REQ, but it needs saying, otherwise every future DOD round re-opens this same sweep. |

## Positive Observations

- **The "one epoch" note is the structural fix, not another patch.** It converts an unfalsifiable pile of anchors into a claim with a stated measurement point and a stated convention for past-tense sentences — v18 F-05 asked for exactly this and got more than it asked for.
- **The past-tense conversion in REQ-CONS-01 is done correctly.** REQ:81-84 says two definitions *existed and disagreed*, quotes the old predicate as "then …", and points `:73-74` and `SKILL.md:56` at today's lines for those roles. Both anchors verify; the sentence is true at HEAD and stays true as a history.
- **Naming the role beside the number is now consistent** — "the pending filter", "the whole-log read", "the fallback log line", "`CORPUS_GLOBS`", "`commitAdvisoryRecord`". Every one of those resolved on the first read. This is what makes an anchor self-repairing, and it is why F-01's five stragglers stand out: they carry numbers with no role name.
- **`{passId}` and the AC-3.8b set-equalisation both hold.** AC-3.8b's cause list is now set-equal to AC-3.4's, closing v18 F-06 without touching either AC's meaning.

## Recommendation

**Needs revision**

One High, and it is narrow and mechanical: the anchor wave fixed the anchors it was told about and left the ones sitting beside them. Four of the five stragglers are in a single sentence (REQ:304-306) where the neighbouring cite *was* corrected, and all four are the same +227 shift v18 already measured; the fifth (`:8670`) is a different offset and needs its own read. Nothing in the delta's substance is wrong — the epoch note, the past-tense conversion, the §4b decision and the AC-3.8b set-equalisation are all genuine improvements, and no acceptance criterion's meaning is in question.

Concretely, to clear this: set `:709`→`:936`, `:899-900`→`:1126-1127`, `:2143`→`:2370`, `:838`→`:1065` (refusal reason `:1070`), `:8670`→`:9424`, and `build-runtime.mjs:465`→`:564-567`; give each a role name so the next shift is survivable. F-02 wants one word — the terminal status the all-unreadable case takes — and F-04 one reason code. Re-derive the citation set with a grep over the REQ rather than from the previous review's finding list, and this is the last round that has to pay for it.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 3, "low": 1}
