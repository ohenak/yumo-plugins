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

§5.2 H-1 says: *"`makeLedgerArgs` gives `runCommand` and `git` two **independent** call logs; nothing records their interleaving."* `makeLedgerArgs` does not supply either double — it takes `git` from the caller and defaults `runCommand` to an inline green stub (`waveExecution.test.js:2204-2232`), and `makeGit(calls)` pushes into a caller-supplied array (`:144-159`). A test that wants ordering can pass a `_git` and a `runCommand` that both append tagged entries to one array it owns, with no harness change at all.

H-2 is a different matter and is correctly argued: `makeLedgerArgs`'s `_writeFile` is a fixed capture with no failure scripting (`:2228-2230`), and the shipped throwing-write test does bypass it with a hand-rolled `makeArgs`/`extra` (`:2685-2700`). That one is a real extension.

This is Low because the design outcome is defensible either way — an `events` option shared by the whole ledger `describe` is arguably better than each test rolling its own — and because it changes no AT's oracle. It is filed because §5.2's justification is the reason the PLAN will be asked to schedule H-1 as owned work on a shared file, and that reason should be true. *What to change:* restate H-1's rationale as a reuse/consistency choice ("one ordered sink for the whole block, rather than per-test ad-hoc pairs") rather than as an expressiveness limit, or drop H-1 and let AT-04's test own its doubles.

### F-03 (Low, Local) — duplicated clause in §3.2

Line 469: *"Keeping the field on the decision on the decision is what lets that line be rendered from the decision…"*. Delete the repetition. The paragraph's substance is correct and verified: the skip line's shipped text is `Wave 1/3: skipped (wave ledger: waves 1–1 already green)` (rendered at `orchestrate-dev.js:15373-15379`, pinned whole-string at `waveExecution.test.js:2293`), so `lastGreenWave` on the `resume` decision does have the named reader the section claims.

## Questions

| ID | Question |
|----|---------|
| Q-01 | §5.4 AT-16 oracle (i) reads *"the queue's `_runPipeline` is left at its default and that fact is asserted — checked by asserting the module's delegation is not overridden anywhere on the default path."* Oracles (ii) and (iii) are mechanical and I can see the test; (i) I cannot. Is (i) meant to be anything more than "the test calls `main()` without an `_runPipeline` override", which is a property of the test's own call rather than of the queue? If not, saying so plainly would keep AT-16's honesty — the section's whole virtue this round — intact, and would put all of the discriminating weight where it actually sits, on (ii)'s `Object.keys(arg)` equality. |
| Q-02 | §6.2 OB-F4 says the promoted `M-WVR-1` records "the replay cost: 7 no-op dispatches over waves 1–3 of a 16-wave plan". That number is a measurement from a run I cannot re-derive from this tree (the baseline file is not here) and it is not carried in §1.1's verification table. When the rebase lands, is the promotion task expected to re-measure it, or to transcribe it as a historical observation with its date? Either is fine; the constraint file's Measured-by column makes the difference visible to a later reader, so the PLAN task should say which. |

## Positive Observations

- **The `⏭`/assertion-compatibility finding was fixed at the root, not at the sentence.** I asked for the false compatibility claim to be struck. The revision struck it *and* did the harder thing: it enumerated the three whole-string assertions that genuinely change, gave each its replacement literal, and forbade relaxing the matcher (`toContain(exactString)` → `startsWith` is named as forbidden). I re-swept the ledger `describe` independently and the enumeration is exactly right. This turns an unreviewable improvisation inside an implementation wave into three reviewable literals — RT-2's regression net survives the round that touches it.
- **F-06 was refuted with evidence rather than absorbed.** My v1 claim that no `computePlanHash` unit block exists was an artefact of grepping this stale branch; the block is at `waveExecution.test.js:2717` on the base this document names. The revision said so, cited the block and its four arms precisely, and kept D-5 correct by scoping it to the resume decision instead of quietly rewriting it. A reviewer being wrong is normal; an author who checks rather than complies is what keeps the document trustworthy, and this is the second round in which the errata discipline has done that.
- **The lazy probe became a contract with a falsifier.** The fix could have been one sentence in §1.2. Instead: the laziness is in the not-changed list, V-19 records the shipped `else if` ordering, DEC-WVR-08 records the rejected eager alternative with its cost, §5.5 item 4 names the mutation, and AT-03/AT-11 assert `merge-base` call lists with `toEqual` — chosen precisely because the shipped test's `toContainEqual` cannot fail on an extra call. That last observation is the sharpest thing in this round: it names the matcher as load-bearing rather than stylistic, and REQ C-3's "no new capabilities, no new IO" now has an oracle instead of a claim.
- **AT-16 got honest instead of getting easier.** DEC-WVR-07 rejects all three ways of faking a delegated resume — including the seam-forwarding change I suggested — with a product reason (it would create queue-side resume configuration where FSPEC BR-16 says none exists), pins what the boundary *can* carry, and states plainly what is not proven. Naming the three fixtures a queue-driving test needs (`QUEUE.md` row, `distribution.checkEnabled: false`, a triage `_agent` double) is the difference between a test someone can write and a test someone will discover is `outcome: "blocked"`.
- **IG-6's closure was given a home, not a patch.** The positive conjunct answers the absence-only objection, but the better half is naming `parseWaveLedger`'s three-arm unit assertion as where IG-6's membership in the closed six lives, with `null` / `""` / `"{}"` transcribed as literals. REQ-WVR-02's six-cause enumeration is now discharged somewhere specific rather than everywhere in general.
- **AT-13's announcement-table set-equality is an addition nobody asked me for and I want kept.** Asserting the *set* of announcing rows equal to the five transcribed from §2.4, with IG-6's silence carried as the sixth row asserted positively, means a deleted announcement reds a set assertion instead of depending on some AT happening to name it. That is the same discipline §3.1 applies to the catalogues, applied to prose the catalogues do not cover.
- **§2.6's business-rule column and §2.4's halted-run subsection both answer "so what does the operator see".** The BR column makes FSPEC §4 coverage readable in one pass; the halted-run subsection answers Q-01 by pointing at where REQ-WVR-01's "run log and final report" is actually discharged on a halt (the log, plus the halt message naming the failing wave) and declines to add a report row the FSPEC never asked for. Declining is the product-correct answer, and it is argued rather than asserted.
- **Still no scope creep, in a round that added a property suite, a coverage floor, two decisions, a risk and two harness extensions.** Every addition traces upstream or to a reviewer finding; §3.5 still declines to add a config key; the record still gains no `provenance` field (§2.5, Q-02), and the reason given — new persisted state with its own staleness semantics, inviting a reader that distinguishes operator-asserted from pipeline-observed completion — is a product argument, not an engineering preference.

## Recommendation

**Approved with minor changes**

All six Medium and all three Low findings from round 1 are closed, and I re-derived each closure from `origin/main` rather than from the revision history. No High finding is open, old or new. Traceability is intact and improved: ten REQ criteria still carry a component in §2.6 — now with the business rules they discharge — and eighteen FSPEC acceptance tests still carry an oracle in §5.4, with AT-02, AT-03, AT-05, AT-06, AT-11, AT-12, AT-13, AT-14 and AT-16 strictly sharper than they were. Nothing was narrowed, reinterpreted or dropped to make a finding close; where I was wrong (F-06) the document said so with evidence, and where the oracle could not honestly be written (AT-16) the gap is named in the artifact instead of being papered over.

What remains is one Medium and two Lows, none of which blocks Phase T:

- **F-01** — move the 85% branch floor off `postWaveCommand` (a per-run key, not a per-wave one, whose failure halts the wave) onto a last-wave PLAN task or a DOD criterion, and make §5.8 and RT-7 agree. Worth closing before PLAN authoring, since se-author will otherwise write a PLAN obligation the config cannot express.
- **F-02** — restate H-1's rationale as a reuse choice rather than an expressiveness limit.
- **F-03** — delete the duplicated clause on line 469.

None of these is a reason to hold the phase. F-01 is the one I would most like closed in the same pass as the PLAN, because a coverage floor wired to the wrong hook halts wave 1 of the very phase this feature makes recoverable.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 2}

APPROVAL-HASH: sha256:3cd713c04963ac70131c7e7d93bdaa46e5ba702cb4684593f39a1207e0a53b94
APPROVAL-HASH-NORMALIZED: sha256:62cdb46cdd10a01fcd9f305d5473d478efffe8c2a09514574b7002288c0eca20
REVIEWED-COMMIT: 0c70e9004391c33833bda3d088125a2f8b4df80a
UPSTREAM-STATE: REQ sha256:ad68cd05baaa634d55b4ddcdf44aaa6e7146142b6efb1ff3cbffb620c4072518
UPSTREAM-STATE: FSPEC sha256:1c05f51159f8b6406621844448825f222e194b266ee3958681c6084e6647232d
