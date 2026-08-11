# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-headless-engine/TSPEC-pdlc-headless-engine.md` (v1.4)
**Date:** 2026-08-11
**Iteration:** 5
**Scope:** delta re-review of v1.4 — whether v4's four findings (F-26 High, F-27 Medium,
F-28/F-29 Low) are resolved and whether the revision broke anything previously approved.
Diffed `41ac095d..HEAD` (the commit carrying the v4 review); unchanged sections were not
re-reviewed. Every claim below is grounded in HEAD source on `feat-pdlc-headless-engine`
and cited `file:line`.

## Prior findings disposition

All four v4 findings are resolved, and I re-derived each against HEAD rather than reading the
changelog.

| v4 finding | Disposition | Verification |
|---|---|---|
| F-26 High — row 4's discriminator ("recorded within the same advisory-seam invocation") was not computable from any recorded field, so the witness degraded to "some `se-review` ran on Opus" | **Resolved, and resolved in the data rather than in the prose.** `DispatchDescriptor` gains `outcome` and `errorText` (§4.1), the accumulator tuple gains those plus `attempt` and `promptHash` (§7.4), and row 4 becomes a pair `(F, B)` over recorded fields only. I checked the falsification directly: `dispatchAt` closes over one `prompt` (`orchestrate-dev.js:1840-1842`) and both rungs go out through it, so `F.promptHash === B.promptHash` really does hold; delete `:1851`→`:1861` and the caller's attempt loop re-enters `resolveAdvisoryRung` with `_state.resolved` still `null` (`:3132`, dispatch-error arm `:3143-3157`), which re-dispatches at `MODEL_ADVISORY` = `"fable"` (`:1652`), never at `"opus"` (`:1653`) — so no `B` exists, the pair is empty and the row is red. That is the falsification the residue predicate did not have | `:1840-1842`, `:1851`, `:1861`, `:3132`, `:1652-1653` |
| F-27 Medium — §4.6's effective-timeout oracle compared two surfaces fed from one source, and was green on the default | **Resolved with the stronger fixture, not with more prose.** Run i's `.claude/pdlc.config.json` pins `dispatch.timeoutMinutes: 7` (§7.4), and §4.6 asserts the literal `420000` at the transport boundary on every dispatch of that run and the literal `7` in the report. Both sides are spec literals, neither derived from the code under test. The reason the default is indistinguishable is now stated in the document with the same citations I verified it from | `DEFAULT_TIMEOUT_MS = 30 * 60 * 1000` `transport.mjs:64`, constructor default `:139`, applied per dispatch `:152` |
| F-28 Low — the quoted wave-mode predicate was not HEAD's | **Resolved, verbatim.** §7.4 now transcribes `const waveMode = Boolean(iOwnership) && iContract !== null && iContract.ok === true;`, character-for-character HEAD, and keeps the note that the elided conjunct was implied — so the transcription discipline the section argues for is now observed by the section itself | `orchestrate-dev.js:9995`, `iContract` assignment `:9994` |
| F-29 Low — the suite-wide assertion count disagreed (four in one place, a fifth in prose) | **Resolved.** The pre-phase bucket is a fifth row of §7.4's property table, and §8.3's `_assert-suite-wide.mjs` row reads "§7.4's five suite-wide assertions … one per row of that section's table". Table, edit surface and module now enumerate the same five (see F-33/F-35 for two seams in the new row's wording) | TSPEC §7.4 table, §8.3 |

Q-11 and Q-12 are both answered in the design rather than deferred. Q-11's answer (a
`dispatchTimeoutMs` constructor option on `createAdapter`) is the right shape and I verified the
precedent it leans on — `maxRateLimitPauses` (`adapter.mjs:224`) and `retryBackoffBaseMs` (`:225`)
are exactly that shape, and `:278-281` is where the option lands on `dispatchOpts` — but the two
call sites it names are mis-attributed (F-31). Q-12's answer is correct on the `haiku` PLAN-DAG
dispatch and incomplete on one other `haiku` site (F-34).

## Findings

Scoped to text added or changed in v1.4. No High findings: the fallback witness is now
falsifiable, which was the whole of last round's block. The three Mediums are all one-sentence
edits, and none of them is a false-green — each fails closed.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-30 | Medium | Local | **The point at which a descriptor record is *appended* is unspecified, and §7.0's medium is append-only.** §4.1 stamps `outcome`/`errorText` "when the dispatch settles" and types them `null` "only in flight", while every other field is stamped at composition — the document says so explicitly. But §7.0's writer appends JSON lines to `${PDLC_TEST_RUN_DIR}/{pid}.jsonl` (TSPEC:1372), a medium with no update: a line written at composition can never gain a terminal `outcome`. An implementer who reads §7.4's "the adapter records each `DispatchDescriptor`" as recording at composition — the reading four rounds of this document support — writes `outcome: null, errorText: null` on every line, and row 4's pair is unsatisfiable. The failure is loud, not silent (row 4 goes permanently red), but the tempting repair under time pressure is to weaken row 4 back to the residue predicate, which is the F-26 spiral. One clause fixes it: **the record is appended when the dispatch settles, one line per attempt, carrying that attempt's terminal `outcome`** — which is also what §4.1's "one descriptor per attempt under a shared `seq`" already implies. | §4.1, §7.0 (TSPEC:1372), §7.4 |
| F-31 | Medium | Local | **The two `createAdapter` sites named in the Q-11 answer are mis-attributed, and `doctor` constructs no adapter at all.** §3.4 says the resolved value is supplied "by the two construction sites, both in `bin/pdlc.mjs` (`:173` for the run path, `:205` for `doctor`)", and §4.6 and §8.3 repeat the pair. At HEAD `:173` is inside `emitDryRun`, the AC-3.1 inspection surface, built over `inertTransport()` — it never dispatches, so no timeout it receives is ever observable at a transport boundary; `:205` is inside `liveAdapter` ("Build the live adapter: real SDK transport, consumer cwd"), which *is* the run path. `doctor` builds no adapter: its arm prints "doctor: all checks passed. No dispatch was performed." and returns. The wiring instruction survives (both sites are enumerated, so both get the option), but two derived claims do not: "where the `tunables` report block (§4.5) is built" is true of neither site — §4.5's block is the run report's — and `doctor`'s own projection (§4.3, TSPEC:798-809) is left with no stated resolution point, which is the one hole in §4.6's "one resolution point" totality. Swap the labels and name where `doctor` reads its tunables. | §3.4 (TSPEC:519), §4.6 (TSPEC:976), §8.3 (TSPEC:1800) |
| F-32 | Medium | Local | **Row 4's `F.outcome !== "ok"` is absence-shaped where the exact member is determinable.** It is paired with a positive conjunct on the same path (`F.errorText` containing the injected literal), so it is not an absence-only oracle and it does not block — but it passes for any non-`ok` member, including a fixture that regressed into a `timeout` or an `auth-failure` and never exercised model-resolution at all. §5.1's table makes the value derivable from the spec, not from the code: a model-resolution rejection is not one of the four transport classes, so `classifyThrown` maps it to `TransportError` (`transport.mjs:123`) and `classifyOutcome` returns `transport-contract-violation`. Pin that literal in the row (or state the member run iv's injection is specified to produce) so the conjunct is a transcription rather than a complement. | §7.4 row 4, §5.1 (TSPEC:1019-1026) |
| F-33 | Low | Local | **§7.4's new lead sentence contradicts its own table and its own closing paragraph on the accumulator count.** The lead says "Four are properties with their own accumulator; the fifth … rides the model-map accumulator"; table row 4 says dispatchable skills is "not an accumulator — computed once from imported data"; and the closing paragraph says "The first three properties … write through §7.0's observation seam …; the fourth is computed from imported data and the fifth reads the third's records". Three accumulators, not four. Since this section is the checklist `_assert-suite-wide.mjs` is built from, the count should be right in the sentence that introduces it. | §7.4 (TSPEC:1474-1478, 1662-1664) |
| F-34 | Low | Local | **"Zero descriptors with `model === "haiku"` in run i" rests on a second site the paragraph does not mention.** The Q-12 answer justifies the claim entirely from the PLAN-DAG fallback (`orchestrate-dev.js:9968`, taken only when `parsePlanTasks` yields no tasks, `:9959-9962`), and that reasoning is correct. But HEAD has a second `haiku` dispatch — verdict recovery, `const recovered = await _agent(reviewer, recoveryPrompt, { model: "haiku" })` (`:7463`) — which the same paragraph elsewhere acknowledges (§7.4's row 6/7 note cites both `:7463` and `:9968`). The assertion therefore also requires run i's fixture to produce well-formed `VERDICT:` trailers throughout, which is true (run v(a) is the malformed fixture) but unstated, and the run-i assertion is stronger than the justification offered for it. One clause naming `:7463` closes it. | §7.4 wave-set note, `orchestrate-dev.js:7463` |
| F-35 | Low | Local | **The fifth row's seam column and assertion column name different fields.** Seam: "the same model-map accumulator, read on its `phase` field"; assertion: "`byPhase["(no phase)"]` absent or `0`". `byPhase` is §4.4's *report* projection; the accumulator records carry `phase: string|null` (§4.1), and `"(no phase)"` is the key the report substitutes for `null`. The assertion an implementer can write over the enumerated record shape is "no record has `phase === null`" (equivalently, the projection of the accumulator by `phase` has no `null` bucket). Stating it over a key that never appears in the record shape is the small version of the mis-mechanisation F-26 was about, in the row F-29 asked for. | §7.4 fifth row, §4.1, §4.4 |

## Questions

| ID | Question |
|----|---------|
| Q-13 | `promptHash` is "sha-256, first 16 hex" of the composed prompt, and composition is `composePrompt(skill, prompt)` (`adapter.mjs:273`), which loads the skill file from `pluginRoot`. That makes the hash stable within a run by construction, which is all row 4 needs — but is the hash computed over the *composed* prompt or the module's raw `prompt`? §7.4 says composed; §4.1's `prompt` field is also the composed one. Both work for row 4 (the fallback re-dispatches the same raw prompt under the same skill, so both hashes match), so this is a clarity question, not a defect — one word makes it unambiguous for the implementer. |
| Q-14 | Row 4's pair is existential over the whole of run iv. If the advisory tier fires more than one seam in that run, several `fable` failures could each produce a pair, and the row is satisfied by any one of them — which is right. Is there any value in additionally asserting the *count* of `fable`-with-non-`ok`-outcome descriptors matches the number of injections the fixture makes? I lean no (it would couple the row to seam scheduling, which is the flakiness TE F-23 removed), and I raise it only so the decision is recorded rather than rediscovered next round. |

## Positive Observations

- **F-26 was fixed at the level it was filed at.** The available cheap repair was to keep the
  prose pairing and add an assertion that "looks" stronger; instead `outcome` and `errorText`
  became recorded fields, and the row became a predicate over them. I checked the resulting
  falsification by hand rather than taking the document's word — deleting `:1851`→`:1861` leaves
  `_state.resolved` null, so the caller's dispatch-error arm (`:3143-3157`) re-enters at `fable`
  and no `opus` sibling with a matching `promptHash` can appear. The row goes red. That is the
  property a witness has to have and the previous two versions did not.
- **The `promptHash` pairing is a better discriminator than the one I asked for.** I asked for a
  stamped seam identity; the revision found something the engine already has — the fallback
  re-dispatches the *same* prompt, `dispatchAt` closing over one binding (`:1840-1842`) — and paired
  on that instead. It needs no new stamp, no workflow-module edit, and so §8.3's boundary claim
  survives untouched. That is a strictly better answer than the one the finding proposed.
- **The three explicit "why this witness holds" bullets are the right artifact.** Naming that
  `B.seq > F.seq` is a direction rather than an adjacency, and that `errorText` is matched against
  the fixture's own injected literal rather than imported from `MODEL_ERROR_RE`
  (`orchestrate-dev.js:1780`), pre-empts exactly the two "improvements" that would reintroduce
  TE F-23's flakiness and make the test agree with the module by construction.
- **F-27's fixture answer is worth more than the finding asked for.** Pinning `timeoutMinutes: 7`
  gives two independently red failure modes (dropped stamp → 1 800 000 at the boundary; config
  never read → 30 in the report), and the document explains why the default hid both. It also puts
  the fixture value in §7.4 next to the wave-mode config rather than leaving it in §4.6 alone, so
  one fixture description now serves both sections.
- **The Q-12 answer declined the tempting generalisation in writing.** Widening rows 1/2 to the
  corpus is the obvious "strengthening" a future author reaches for, and it is red on correct code
  because `:9968` composes after `phaseFn("Phase I: Implementation")` (`:9951`). Recording that
  beside the wave-set definition is the same move as the memoisation note, and it is the kind of
  paragraph that saves a round two revisions from now.

## Recommendation

**Approved with minor changes**

Last round's High is gone and gone properly: row 4 now discriminates on recorded fields, and I
verified the discrimination against HEAD's control flow rather than against the changelog. Nothing
in v1.4 broke a previously approved section — §8.3's "no file under `pdlc/workflows/` is modified
beyond declared exports" survives because both new fields land in `pdlc/engine`, and the two new
descriptor fields are stated to be read by nothing but §7.4.

The three Mediums are all one- or two-sentence edits and none is a false-green: F-30 (name the
record-append point as settlement, since §7.0's medium is append-only), F-31 (`:173` is the inert
dry-run surface and `:205` is the live run path — the labels are swapped, and `doctor` builds no
adapter, so its tunables projection needs a stated resolution point), F-32 (pin the exact outcome
member instead of the complement of `ok`). F-33/F-34/F-35 are one edit each. None needs another
review round to confirm; fold them in with the next revision.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 3, "low": 3}
