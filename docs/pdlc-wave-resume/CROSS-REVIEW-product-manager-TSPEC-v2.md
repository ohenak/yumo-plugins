# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-wave-resume/TSPEC-pdlc-wave-resume.md (v1.1)
**Date:** 2026-08-21
**Iteration:** 2
**Scope:** Delta re-review. Product lens only — requirements traceability, scope compliance, acceptance-criteria fidelity. Attention is scoped to what changed between `583804fd` (the commit v1 reviewed) and HEAD; unchanged sections already approved are not re-litigated. Every claim about shipped behaviour is re-verified against `origin/main` at `345ae358`, the base this document names, because this branch is still 1,637 commits behind and carries neither the mechanism nor the wave-gate baseline (REQ BL-04, OB-F1 — unchanged).

## Prior-round disposition

All nine v1 findings are closed. Each row below states what I re-derived from the repository, not what the revision history claims.

| v1 finding | Disposition | Evidence I re-derived |
|---|---|---|
| F-01 (M) `⏭` row's compatibility claim was false | **Resolved, and better than asked.** §2.4 now puts the token outside the parenthesis (`… recorded green (wave ledger) (provenance: automatic)`), keeps the "keeps passing" claim only where it is true, and adds a whole subsection enumerating the three shipped assertions that genuinely change. | The `⏭` assertion is `expect(row.detail).toContain("recorded green (wave ledger)")`, `waveExecution.test.js:2682` — an appended clause leaves it green. I re-swept every assertion in the ledger `describe` that could see an appended clause: `:2113`, `:2294`, `:2618`, `:2163`, `:2658`, `:2348`, `:2440-2442`, `:2470`, `:2541`, `:2572` are all `startsWith` / `toContain` / `includes` and are untouched; the only whole-string equality assertions on a Phase I detail in the file are `:538`, `:592`, `:1947`, `:2117-2119`, of which only `:2117` sits on a resuming run. §2.4's "exactly three change, no other assertion in the ledger `describe` changes" is **correct as written**. |
| F-02 (M) AT-06's baseline unsatisfiable | **Resolved.** AT-06 now compares `CONFIG_WITH_TEST_COMMAND` + `startWave: 1` against `CONFIG_WITH_TEST_COMMAND` with the key omitted, and states that both resolve `scriptGate === true`. | `const CONFIG_WITH_TEST_COMMAND = JSON.stringify({ implementation: { testCommand: "npm test" } })` (`waveExecution.test.js:2220-2222`); `startWave: 1` leaves `explicitPointer` false (`orchestrate-dev.js:15236`), so the record is still consulted, which is what the added positive conjunct (resume banner at wave 2, `dispatchedTaskIds` = `["T2","T3"]`) pins. Only one input now varies. |
| F-03 (M) AT-16 asserted an oracle no double can carry | **Resolved by honest re-scoping**, not by weakening. AT-16 is now shape-and-payload (`Object.keys(arg)` `toEqual(["reqPath"])`), the residual gap is stated in the AT itself, and DEC-WVR-07 records why each of the three workarounds — including the seam-forwarding one I suggested — was rejected. | `report = await runPipelineFn({ reqPath: entry.reqPath })`, `orchestrate-queue.js:1582`, with `_runPipeline: runPipelineFn = realMain` at `:1240`: the payload is exactly one key, so the falsification arm (mutate the queue to forward a second key) really does red. The named fixtures are real preconditions — the drift gate runs before `QUEUE.md` is read (`orchestrate-queue.js:1272` comment and the gate above it) and `distribution.checkEnabled: false` is the shipped opt-out (`pdlc/engine/__tests__/smoke.test.js:431-433`). |
| F-04 (M) IG-6 arm absence-only, six-cause closure homeless | **Resolved.** AT-02 now pairs the negative with a positive conjunct (all three waves dispatched from wave 1, no resume banner, outcome (a) resolved) and names `parseWaveLedger`'s three-arm unit assertion as the home of IG-6's membership in the closed six, with `null` / `""` / `"{}"` transcribed as literals. | The three-arm behaviour is the shipped one (V-2, re-verified in v1); no unit block exists for it today (`parseWaveLedger` has zero occurrences under `pdlc/workflows/__tests__/` on `origin/main`), which is precisely why §5.3 owes it. |
| F-05 (M) eager ancestry probe was an unstated behavioural delta | **Resolved, and promoted to a contract.** §2.2 keeps the probe lazy via an optimistic first classification plus `ANCESTRY_INDEPENDENT_CODES`, §1.2 lists the laziness under "explicitly not changed", V-19 records the shipped ordering, DEC-WVR-08 records the rejected alternative, and AT-03/AT-11 assert `merge-base` call counts with `toEqual` rather than containment. §5.5 item 4 names the eager-probe mutation. | `orchestrate-dev.js:15299` (feature guard), `:15305` (planHash guard), `:15307` (`await headCorroborated(recorded.head)` — the third arm): a mismatch record issues zero `merge-base` calls, exactly as V-19 states. `headCorroborated`'s two fail-open returns (`:15281`, `:15283`) make AT-11's zero-probe no-`head` conjunct true. The shipped ancestry assertion really is containment (`expect(calls).toContainEqual([...])`, `:2446`), so the matcher choice is load-bearing as claimed. |
| F-06 (M) A-2 cited a `computePlanHash` unit block that does not exist | **My finding was wrong, and the revision refutes it with evidence rather than deferring to me — the right outcome.** | `describe("computePlanHash — the ledger's plan fingerprint")` is at `waveExecution.test.js:2717` on `origin/main`, with the determinism arm at `:2724-2725` and three sensitivity arms at `:2730`, `:2735`, `:2739`. My v1 grep ran against this branch's stale tree, which predates the mechanism entirely. §5.3's "extended in place, never duplicated" and the preserved D-5 scope are both accurate. |
| F-07 (L) DC-08 miscitation | **Resolved.** §5.2 drops the id and cites the behaviour, naming the confusion explicitly. | This repo's `DC-08` is *"An unresolved item needs a named successor surface, not prose intent"* (`DOMAIN-CONSTRAINTS.md:216`), and the preamble's warning about `DC-07 / DC-08 / DC-09` pointing into a different consuming repo is at `:12-14`. Both quoted correctly. |
| F-08 (L) five BRs uncited | **Resolved.** §2.6 gains a business-rule column; BR-04, BR-05, BR-12, BR-14, BR-16 are bolded and each names the component carrying it. FSPEC §4 coverage is now checkable by column. |
| F-09 (L) baseline citations unversioned | **Resolved.** Every `M-WG-*` citation now carries `Version | 1.2 · 2026-08-20`. | The file at `origin/main` reads `| Version | 1.2 · 2026-08-20 |` (`docs/_constraints/pdlc-wave-gate-baseline.md:7`), with sections through `## 4` and ids through `M-WG-14` — so OB-F4's "append a new `## 5`, bump to 1.3" recipe is re-derived correctly. |

My two v1 questions were both answered in the document rather than in a reply: Q-01 in §2.4's halted-run subsection (verified: both wave-mode `recordPhase("I", …)` calls sit after the wave loop, `orchestrate-dev.js:15615` and `:15623`, so a halt produces neither row — as claimed), and Q-02 in §2.5 (the record gains no `provenance` field; announcement-only).

## Findings

Three findings, all new, none blocking. Scanning was scoped to the changed sections (§1 header/revision history, §1.1 V-18/V-19, §1.2, §2.2, §2.3, §2.4, §2.5, §2.6, §3.1-§3.2, §5.1-§5.8, §6.1, §6.2, §6.4, §6.5).

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | §5.8 / RT-7 place the 85% branch floor on "the last implementation wave's `postWaveCommand`", a per-wave command the shipped config surface cannot express; set globally, it halts wave 1 | REQ OB-2 / §5.8, new this round |
| F-02 | Low | Local | §5.2's H-1 justification overstates what the shipped harness cannot express: `_git` and `_runCommand` doubles are caller-supplied, so their interleaving is observable today | FSPEC AT-04 |
| F-03 | Low | Local | §3.2 duplicated clause — "Keeping the field on the decision on the decision" (line 469) | — |

### F-01 (Medium, Local) — the coverage floor is placed on a hook that is not per-wave

§5.8 closes with: *"It is named as an obligation of the **last implementation wave's `postWaveCommand`** (TE Q-05: yes), so the floor is a wave-level gate rather than a PUB-level surprise."* RT-7 repeats it as the mitigation.

There is no per-wave `postWaveCommand`. `IMPLEMENTATION_DEFAULTS` carries one `postWaveCommand: null` for the whole run (`pdlc/workflows/orchestrate-dev.js:169-174`), parsed once from the `implementation` section (`:248`), and the wave loop runs that single command after **every** wave (`runWaveGateSequence`, `:3322-3324`; the per-wave call site and its success notice at `:15408-15419`). Nothing in the config surface — the four keys §3.5 itself enumerates — indexes it by wave.

The consequence is not cosmetic, and it is the failure mode this document already knows how to name. A post-wave command that does not pass halts the wave:

```js
if (gateOutcome.failed === "post-wave") {
  throw haltError(`Error: Wave ${waveNum} post-wave command failed — …`);
}
```
(`orchestrate-dev.js:15409-15414`)

So configuring `npm run test:coverage` as `postWaveCommand` means every wave — starting with wave 1, long before this feature's branches exist, let alone are covered — runs a `--per-file --branches 85` check and halts Phase I when it fails. That is exactly the "in wave mode a red gate halts the wave and every wave after it" reasoning §6.2 uses to make AT-14 a PLAN sequencing precondition; it applies here with equal force and is not drawn.

The product consequence is a self-inflicted halt of the phase this feature exists to make recoverable — an operator's first experience of the shipped feature would be a wave-1 halt on a coverage floor unrelated to the wave's work. The document's own backstop clause in RT-7 (per-arm unit coverage plus the §5.7 laws, floor degrades to a PUB-time finding) is sound and needs no change.

*What to change (any one of these closes it):* (i) make the floor a **PLAN task in the last wave** — a task whose own gate/verification runs `npm run test:coverage`, which is expressible today and is genuinely last-wave-scoped; or (ii) state it as a **Phase DOD / `CODE_REVIEW` criterion**, which is where a merge-gate floor naturally sits and which still precedes PUB; or (iii) keep `postWaveCommand` but say plainly that it applies to **every** wave and accept the cost, in which case §5.8 must also say why an early wave will not red — which I do not think it can. Whichever is chosen, §5.8 and RT-7 must say the same thing, and the `file:line` for the per-run (not per-wave) key belongs in the sentence.

### F-02 (Low, Local) — H-1's "the shipped harness cannot express it" is stronger than the code supports

§5.2 H-1 says: *"`makeLedgerArgs` gives `runCommand` and `git` two **independent** call logs; nothing records their interleaving."* `makeLedgerArgs` does not supply either double — it takes `git` from the caller and defaults `runCommand` to an inline green stub (`waveExecution.test.js:2204-2232`), and `makeGit(calls)` pushes into a caller-supplied array (`:2180-2195`). A test that wants ordering can pass a `_git` and a `runCommand` that both append tagged entries to one array it owns, with no harness change at all.

H-2 is a different matter and is correctly argued: `makeLedgerArgs`'s `_writeFile` is a fixed capture with no failure scripting (`:2228-2230`), and the shipped throwing-write test does bypass it with a hand-rolled `makeArgs`/`extra` (`:2686-2700`). That one is a real extension.

This is Low because the design outcome is defensible either way — an `events` option shared by the whole ledger `describe` is arguably better than each test rolling its own — and because it changes no AT's oracle. It is filed because §5.2's justification is the reason the PLAN will be asked to schedule H-1 as owned work on a shared file, and that reason should be true. *What to change:* restate H-1's rationale as a reuse/consistency choice ("one ordered sink for the whole block, rather than per-test ad-hoc pairs") rather than as an expressiveness limit, or drop H-1 and let AT-04's test own its doubles.

### F-03 (Low, Local) — duplicated clause in §3.2

Line 469: *"Keeping the field on the decision on the decision is what lets that line be rendered from the decision…"*. Delete the repetition. The paragraph's substance is correct and verified: the skip line's shipped text is `Wave 1/3: skipped (wave ledger: waves 1–1 already green)` (rendered at `orchestrate-dev.js:15373-15379`, pinned whole-string at `waveExecution.test.js:2293`), so `lastGreenWave` on the `resume` decision does have the named reader the section claims.

## Questions

## Positive Observations

## Recommendation

