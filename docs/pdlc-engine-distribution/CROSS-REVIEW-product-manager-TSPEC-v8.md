# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-engine-distribution/TSPEC-pdlc-engine-distribution.md` (v0.8)
**Upstream read:** `REQ-pdlc-engine-distribution.md` (AC-2.1, AC-5.3), `FSPEC-pdlc-engine-distribution.md` (§5.2)
**Prior review:** `CROSS-REVIEW-product-manager-TSPEC-v7.md` (Approved with minor changes — 0 High, 2 Medium)
**Diff reviewed:** `24141260..HEAD` on the TSPEC (seven commits, v0.7 → v0.8)
**Date:** 2026-08-13
**Iteration:** 8
**Scope:** Delta re-review. v7's two findings and Q-01, plus this round's own new work (§7.2's relocated identity assertion, §9.3's red-first split task and default-`deps` pin, §12.1's named test file). Sections settled in rounds 1–6 are not re-litigated.

## 1. Disposition of v7's findings

| v7 ID | Severity | Status | Evidence in v0.8 |
|---|---|---|---|
| F-01 | Medium | **Resolved** | §12.3's merge-fixture precondition list now addresses guards 17–18 at `:1232-1255`, and says out loud that `:1152-1175` was a transcription slip naming the CLOSED-PR/CI-rule span (`:1639-1650`). Every corrected address checks out against `pdlc/workflows/orchestrate-dev.js`: guard 2 `:1076`, guard 4 `:1092`, guards 7–8 `:1128`/`:1141`, guard 11 `:1169`, guards 12/14/15 `:1184`/`:1200`/`:1212`, guards 17–18 `:1232`/`:1242`, guards 19–21 `:1256`/`:1259`/`:1273`. Guard 4's `:1090` → `:1092` nudge landed too. Recording the wrong range *as* wrong, rather than silently swapping digits, is the version of this fix a later reader can audit |
| F-02 | Medium | **Resolved** | §9.3 now states the signature as `main(argv = process.argv, deps = …)` with `const [, , cmd, ...rest] = argv` and the two-element skip explicitly retained (`:1269-1282`), grounded on HEAD's `const [, , cmd, ...rest] = process.argv` (`bin/pdlc.mjs:479`); it names the failure a sliced array produces (the `default:` branch at `bin/pdlc.mjs:498-501`, `USAGE`, `process.exitCode = 1`, recorder uncalled) and names the tempting-but-wrong fix. §12.1's leg carries the concrete array `["node", "pdlc", "queue", "--loop", "--max-iterations", "2"]`, which destructures to `cmd = "queue"`, `rest = ["--loop", …]` — the shape `cmdQueue`'s `readFlag`/`hasFlag` calls read (`bin/pdlc.mjs:410`, `:419`, `:425`) — and says the bound is recorded, not executed, since the recorder stands in for `runQueueLoop`. `--max-iterations` really is captured as `maxPasses` at `bin/pdlc.mjs:425-439` |
| Q-01 | — | **Answered** | §9.3 (`:1295-1303`) picks the **declared floor** reading: `engines.node: ">=20"` is a field this feature adds (so the citation is forward-looking, which also disposes of the §5.1-says-absent tension I raised), the seam must work across the whole admitted range, and Node 20 has no `mock.module`. The clause I asked for — "a newer admitted runtime does not make it optional" — is present, with the one condition that would re-open it (floor raised above 22.3) |

Both v7 findings are closed without narrowing, and Q-01's answer is written where a
future simplifier would read it. Nothing settled in rounds 1–6 was re-opened: the seven
commits touch §3.1, §7.2, §9.3, §12.1, §12.3, §12.4, §14.1 and the changelog only.

## 2. Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | **The identity assertion moved legs but kept the other leg's key name: `captured[i].provenance` is the runner-argument key, while the leg it now lives on captures the *seam* object, whose key is `_provenance`.** §7.2 still states the assertion form as "`captured[i].provenance === p` (plus `Object.isFrozen`)" (`:807`), and then relocates it to the injection-level leg (`:815-834`), where the recording **workflow module**'s `main()` is what captures — i.e. the object built by `devInjection`/`queueInjection`, which this feature gives a key named **`_provenance`**, not `provenance` (§3.1 `:102`, §7.2's carrier table `:795-797`, S-6 `:1446`; `run.mjs:80-91`, `:114-123`). `provenance` is correct only on the *process-entry* leg, where the recorded object is `runQueueLoop`'s argument object (`bin/pdlc.mjs:434`, forwarded as `...args`, `run.mjs:478`). §12.1 says "the two captured **seam** objects" (`:1589`), so the prose knows which object it means; only the transcribable assertion form disagrees. A task author who copies it literally gets `undefined === p` and a red test — recoverable, but the plausible "fix" is to add a second `provenance` key to the injection, which `PROP-PARITY-12`'s no-more-no-less seam-set equality (`seam-contract.test.js:47-63`, §7.2 `:852-867`) then turns red as well, so the cost is two false starts on the one leg that carries AC-5.3's loop claim. Fix: one clause distinguishing the two keys — `captured[i]._provenance === p` for the injection-level leg, `captured[i].provenance === p` for the process-entry leg's runner-argument assertion | AC-5.3 |
| F-02 | Medium | Local | **The process-entry leg names `argv` and `deps` but not the two gates that stand between `main()` and any runner, and its own three-key `deps` pin means neither gate can be injected.** In HEAD's bodies a runner is reached only after (1) `startupFor(argv)` passes — `runStartupChecks` over `--plugin-root`, engine/plugin compat and an `apiKeyPolicy` of `["none"]` (`bin/pdlc.mjs:139-146`), with `cmdQueue` returning early on `!startup.ok` (`:397-408`) and `cmdDev` likewise (`:362-374`) — and (2) `liveAdapter(argv, startup)` builds a real transport and adapter (`:279-298`, `:417`). The leg's stated fixture is an argv array with no `--plugin-root` and a `deps` object pinned by set-equality to exactly `{runDev, runQueue, runQueueLoop}` (§12.1 `:1589`, §9.3 `:1305-1315`), so the startup rung is reachable only through argv flags and ambient `process.env` — and the api-key rung is env-sensitive (`startup.mjs:36-38`, `auth.api-key-refused` / `ANTHROPIC_API_KEY`), which is why the shipped subprocess tests scrub it (`cli.test.js:25`, `env: {...process.env, PDLC_PLUGIN_ROOT: "", ...env}`) and always pass `--plugin-root PLUGIN_ROOT` (`:34`, `:63`, `:71`). Transcribed as written, the leg lands in the refusal branch with the recorder uncalled — loudly red, but on a developer machine that happens to export an API key it is red *intermittently*, which is the worse variant. This is the same class of omission §12.3 fixed for the merge fixture in v0.7 and v0.8, and it deserves the same treatment: one clause naming the preconditions (a `--plugin-root` pointing at this repo's `pdlc/`, an `ANTHROPIC_API_KEY`-free env for the duration, and the fact that `liveAdapter` is exercised for real because the `deps` seam deliberately does not cover it) | AC-5.3, AC-2.1 |

## 3. Questions

| ID | Question |
|----|---------|
| Q-01 | §9.3's new red-first assertion 1 says the import is inert, "asserted positively": `process.exitCode` unchanged (captured **before** the import) and no `USAGE` on `stderr` (`:1338-1342`). Both observations are per-*process*, not per-import, and §12.1 now puts the wiring task's process-entry leg in the **same file** (`provenance-path.test.js`, `:1589`) — where later tests call `main()` with a deliberately malformed-arg case (§9.3's `default:`-branch discussion, `bin/pdlc.mjs:498-501`) or hit a startup refusal, either of which sets `process.exitCode = 1` and writes `USAGE`/refusal text to `stderr` for the rest of the run. Is the intent that the inert-import test must therefore (a) capture and restore `process.exitCode` and a `console.error` spy around a **dynamic** `await import()`, and (b) be the first-registered test in the file, or (c) that the two shape assertions live in their own file after all, with only the process-entry and injection-level legs sharing `provenance-path.test.js`? One clause would keep TE Q-20's "one named file" answer from turning into cross-test interference that only shows up when the wiring task's batch lands. |

## 4. Positive Observations

- **The round found and removed a vacuity in its own previous round's answer.** v0.7 answered TE Q-18 by putting `maxPasses: 2` on the process-entry leg. v0.8 states plainly that recorders in `deps` mean the real `runQueueLoop` never runs, so `captured` holds exactly one entry and the per-pass assertion "is true of every implementation — including one that rebuilds provenance on each pass" (`:815-822`). That is the honest reading, and it checks out: `bin/pdlc.mjs:434` calls the injected `runQueueLoop`, so the loop body at `run.mjs:486-509` is never entered. Retiring a fix I had already approved, because it turned out to prove nothing, is exactly the behaviour that keeps a green suite meaningful.

- **The relocated leg comes with the three preconditions that make "two passes" true, each grounded.** `{outcome: "ran"}` as the recorder's return is the one continuation row that falls through (`run.mjs:509`, with `blocked` at `:501` and `idle`/`no-queue` at `:505` stopping on pass 1); `startup: null` makes `refusalFor` yield `null` (`:331-335`); an `_agent`-carrying adapter stub is what `requireAdapter` demands (`:319-323`). All three read correctly against the code. This is the difference between a fixture description and a fixture a task author can actually build.

- **The `--max-iterations` / `maxPasses` note closes a naming trap before anyone falls into it.** The observation that no argv-driven fixture can set the bound by that name — the CLI flag is `--max-iterations` (`bin/pdlc.mjs:39`, `:425`) and `cmdQueue` converts it to `maxPasses` (`:426`, `:439`) — is a second, independent reason the ≥2-pass leg belongs at the injection level. Two reasons that agree, from different directions, is how a decision survives a later refactor.

- **The default-`deps` pin is a genuine gap closure, not defensive test-writing.** "Production behaviour is unchanged because the defaults *are* the static imports" was a claim nothing observed; a mis-wired `runQueueLoop: runQueue` would have stayed green, and the shipped subprocess tests really do stop short of a real runner (`cli.test.js` `--dry-run` returns, `--max-iterations` refusals before the loop, startup-rung refusals). Pinning the key set by set-equality **and** each value by `===` against `run.mjs`'s exports covers both the dropped-key and the aliased-value failure, which is the right pair for a three-row contract.

- **Red-first is applied to the split task's own behaviour change, and the red is demonstrated rather than asserted.** The two assertions fail against HEAD's shape for reasons the document verifies — zero `^export` lines and a bare `main().catch(…)` at `bin/pdlc.mjs:505`, so importing today prints `USAGE` and sets `process.exitCode = 1`. And the inertness assertion is written as an observation of a value and a captured stream, explicitly because "'nothing happened' stated as an absence would pass against a file that does not exist". That is the absence-only-oracle rule applied by the author, unprompted.

- **v7's F-01 is corrected by naming the wrong range as wrong.** `:1152-1175` is recorded in the text as the CLOSED-PR/CI-rule span and a transcription slip, rather than quietly replaced. A future reader who finds the old range in a PLAN task can now tell which of the two is stale without re-deriving the guard ladder.

## 5. Recommendation

**Approved with minor changes** — no open High findings. Two Medium findings
are recorded and are not gating; both are one-clause edits that can fold into
the next touch of the document or into the PLAN task that consumes §12.1.

Both of v7's Mediums are closed, and Q-01 is answered in the section where a
later simplifier would look. More than that, this round retired one of its own
earlier answers: the `maxPasses: 2` fixture I approved in v0.7 sat on a leg
whose recorder is called once, and v0.8 says so plainly and moves the per-pass
identity claim onto the leg that drives the real `runQueueLoop`. The
product-relevant consequence is that AC-5.3's `pdlc queue --loop` provenance
hole is now claimed by a test that can actually falsify a per-pass rebuild,
rather than by one that was green for free.

Every HEAD claim added this round checks out: `bin/pdlc.mjs:30`, `:39`,
`:352`, `:396`, `:425-439`, `:479`, `:498-501`, `:505`, and zero `^export`
lines; `lib/run.mjs:319-323`, `:331-335`, `:381`, `:422`, `:478`, `:486-509`,
`:491`, `:509`; `__tests__/cli.test.js:25`, `:70-78`, `:86`, `:102`, `:114`,
`:149-156`; and the corrected merge-ladder addresses in
`pdlc/workflows/orchestrate-dev.js` (guard 4 `:1092`, guards 7–8
`:1128-1150`, guard 11 `:1169`, guards 12/14/15 `:1184-1226`, guards 17–18
`:1232-1255`, guards 19–21 `:1256-1284`).

The two Mediums are both fixture-precision gaps in this round's own new work,
in a leg whose *semantics* are right:

1. **F-01** — §7.2's transcribable assertion form still reads
   `captured[i].provenance` after the assertion moved to the leg that captures
   the seam object, whose key is `_provenance` (§3.1, `run.mjs:80-91`).
   Distinguish the two keys per leg.
2. **F-02** — §12.1's process-entry leg does not name the startup and adapter
   preconditions (`bin/pdlc.mjs:139-146`, `:397-408`, `:279-298`) that stand
   between `main()` and any runner, and its own three-key `deps` pin means
   they cannot be injected — only supplied through argv and env.

Neither changes a product decision, narrows an acceptance criterion, nor
affects whether AC-5.3's loop-mode provenance hole stays closed at all three
call sites and at process entry — which, seven rounds in, it does.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 0}
