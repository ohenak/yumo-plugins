# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-headless-engine/FSPEC-pdlc-headless-engine.md` (v1.1)
**Date:** 2026-08-11
**Iteration:** 2
**Scope:** delta re-review of v1.0→v1.1 (`git diff d31c3ebf..HEAD`) — verification of the twelve
v1 findings, and new-issue scan over changed sections only (§0 change note, §2, §3.1–§3.5,
§4.1/§4.4/§4.6, §5.1/§5.3/§5.5/§5.6, §6.3/§6.6, §7.4/§7.5, §8.1/§8.2/§8.6, §9.1/§9.3/§9.4,
§10.2/§10.3/§10.5, §12.1–§12.6, §13, §14, §15, §16, §17.3, §18)

## Prior findings — disposition

| v1 finding | Sev | Status | Evidence in v1.1 |
|---|---|---|---|
| F-01 closed command set falsified by shipped CLI | High | **Resolved** | BR-CMD-1 (§3.1) names `hello`/`spike:sdk` as exempt diagnostics with no obligation, and fixes AT-ENG-01's red state as a *third* name; §3.2 adds the two missing flag rows with HEAD citations. Verified at `pdlc/engine/bin/pdlc.mjs:41`, `:83`, `:172`, `:303-307` — all four citations correct. AT-ENG-01 now asserts both directions ("each command in §3.1 is accepted; a command outside the set …"), so a deleted row fails |
| F-02 no order over `{0,2,1}` for the loop's exit | High | **Resolved** | BR-EXIT-3 states the total order `1 > 2 > 0` and works the halt-then-refuse case through explicitly; §3.3's `2` row now reads "halted **or was blocked**", which closes the EC-PAR-3/AT-ENG-48 gap; §18.3 pins the order as a transcribable table |
| F-03 "logged-in settings state" had no observable | High | **Resolved** | BR-AUTH-0 (§5.1) fixes it as `~/.claude.json` carrying an `oauthAccount` record, cites **M-ENG-08**, and states the fixture recipe (`HOME` at a scratch dir). M-ENG-08 exists and says what §5.1 says it says (`docs/_constraints/pdlc-engine-baseline.md:132-146`). AT-ENG-13 updated to name the fixture; EC-AUTH-8 gives row 5 its two recourses. See F-05 below for a residue in the cited authority, not in this document |
| F-04 guard asserted outside the production posture | High | **Resolved** | BR-PERM-2 (§7.4) and BR-GUARD-5 (§9.1) require the guard dispatch to be composed exactly as §6.2/§7.4 compose a real one, `bypassPermissions` included; AT-ENG-41 carries the clause; O-2 (§13.2) now leads with "does any PreToolUse-style guard fire at all under bypass". Posture verified at `transport.mjs:89`, `:170-175` |
| F-05 two set-equalities had no observable | High | **Resolved** | BR-FAIL-1 gains an inspectable member set plus a six-fixture provocation corpus; BR-MSG-1 gains an emission seam with suite-wide id accumulation and explicitly refuses an exemption list; §18.3 now names the observable beside each set-equality. (One residue on the forward direction — F-03 below.) |
| F-06 dry run vs every-member assertion | High | **Resolved** | BR-SKILL-6 (§6.3) fixes one invocation per member, parameterised over the startup-derived set, "a member with no invocation is a failing test, not a smaller sample"; AT-ENG-20 updated |
| F-07 parity expectation derived from the run under test | Medium | **Resolved** | BR-PARITY-6 moves clause 1(ii)'s expectations onto the fixture with literal transcription, and asserts the report separately against the same fixture. BR-PARITY-5 additionally closes a vacuity I had not caught (a write-less double), with AT-ENG-45's self-test |
| F-08 AC-2.3 has no M-ENG-06 row | Medium | **Resolved** | §2 states AC-2.3's red/green directly (green for single dispatch, red for BR-ENV-3's quantifier) and raises O-ENG-4. Citations `transport.mjs:159`, `:168` verified |
| F-09 BR-READ-1 "reachable" stronger than observed | Medium | **Resolved** | Reworded to "opens or reads no path", with the `MERGE_GUARD_DEFAULTS` non-read reference named and cited (`orchestrate-dev.js:48-53`, `:52` — verified) and the wrong reading explicitly ruled out |
| F-10 network clause had no mechanism | Medium | **Resolved** | BR-VER-1 names a socket-level trap and requires the trap itself be tripped by a deliberate attempt; AT-ENG-63 asserts trap-fires *and* no-other-test-attempts, so the negative half is paired |
| F-11 no expected delay sequence | Medium | **Resolved** | BR-RETRY-3 adds the ladder and a three-row pause table. Re-derived against `adapter.mjs:57-93`: retry-after wins → resetsAt remainder → `base * 2^attempt`, `min(cap)` then `+jitter` — the document's "cap is a floor-of-the-capped-case" is exactly right. One wording residue, F-06 below |
| F-12 wrong AT citation in §3.1 | Low | **Resolved** | Now AT-ENG-24 |

Q-01…Q-04 are all answered in v1.1: BR-FAIL-2 makes `agent-reported-failure` terminal-and-budget-free (Q-01); §5.3 fixes both policy sets literally, matching `bin/pdlc.mjs:93`, `:201-203` (Q-02); AT-ENG-X3 and §3.2 settle transport symmetry as a fixture-level obligation with no live fallback run (Q-03); BR-REP-0 fixes the report's shape and EC-REP-1 its refusal case (Q-04, with the residue in F-01 below).

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **Rung 0 makes usage errors part of the startup ladder, but §3.4 and §12.1 disagree about what a usage error *emits*, so AT-ENG-05 and AT-ENG-68 overlap on an undefined case.** BR-REP-0 says the report "is always exactly one line and always the last" and that "a refusal still emits the line (EC-REP-1)"; AT-ENG-68 asserts it "on a completed run and on a startup refusal alike". Rung 0 is now a rung (§4.1), so EC-CLI-2 (`dev` with no REQ path), EC-CLI-3 and EC-CLI-5 are startup refusals — yet all three say only "usage printed, exit `1`", and at HEAD a usage error prints usage and returns without any report (`bin/pdlc.mjs:236-237` is reached only from the report path). A test author writing AT-ENG-05 cannot tell whether `pdlc dev` with no path leaves a JSON line as the last line of stdout. EC-CLI-1 (no command at all) is worse: it never reaches the ladder, so BR-REP-0's "a refusal still emits the line" may or may not reach it. Fix: one clause in §12.1 or §3.4 stating which refusal classes emit the report block — my reading of the document's own logic is "every refusal from rung 0 onward emits it; an unrecognised command does not, because no invocation was resolved" — and a matching cell in EC-CLI-2/3/5. | §12.1, §3.4, §4.1 |
| F-02 | Medium | Local | **BR-START-2's totality is not stated for rung 0, so AT-ENG-06/09/12 are underdetermined on a rung-0 failure.** BR-START-2 requires the ladder to report *every* rung, not the first failure, and AT-ENG-06 fixes the shape for a rung-1 failure (rungs 2/4 "skipped-with-reason, never passing"). Rung 0's failure mode is described as "usage error or refusal", which reads like an immediate abort — but rungs 1–4 are independent of argv validity and could all be evaluated and reported. Both readings are defensible from §4.1 as written, and they produce different expected outputs for EC-CLI-3 and EC-DISP-5. `doctor` inherits the ambiguity: BR-START-0 tells me rung 0's REQ-path half reports "not applicable", but not whether a *failing* working-directory half stops the other five rungs from being reported. Fix: extend AT-ENG-06's clause to rung 0 explicitly (one sentence in BR-START-0 or BR-START-2). | §4.1, §4.6 |
| F-03 | Medium | Local | **BR-FAIL-1's forward direction is corpus-scoped where BR-MSG-1's equivalent is suite-scoped, and the weaker of the two is the one guarding the taxonomy.** The rule reads "the classifier's own member set is an inspectable value … and every classification asserted over the corpus below is a member of it". That catches a declared enumeration with seven entries; it does not catch a classifier that *returns* a seventh value on some path the six-fixture corpus never provokes — exactly the failure BR-START-4 warns about ("a declaration no check ties to the modules"). BR-MSG-1 solved the identical problem two sections later with a seam plus suite-wide accumulation. Fix: reuse it — every classification the whole suite observes accumulates, and the accumulated set is compared to the declared six for equality, not containment. That also makes the reverse direction fall out of the same observation rather than needing its own corpus bookkeeping. | §8.1, §18.3 |
| F-04 | Medium | Local | **EC-GUARD-4's new message contract has no acceptance test.** v1.1 gives the row real content: on the primary transport the refusal "names the missing capability, names the fallback as the known alternative, and states that selecting it is not yet available (O-1/O-2)" — three assertable strings, and the operator's whole recourse. AT-ENG-43 still asserts only "a transport that cannot carry the guard configuration refuses to dispatch", and AT-ENG-44 covers EC-GUARD-1 and EC-GUARD-5 only. As it stands the only clause an operator depends on is the one clause no named test pins, and BR-MSG-1's catalogue check would flag the id as unprovoked. Fix: extend AT-ENG-43 with the three message obligations (or add the row to AT-ENG-44). | §9.3, §9.4 |
| F-05 | Medium | Cross-Feature | **M-ENG-08's closing sentence contradicts §5.1 row 5, and it is the sentence a test author lands on when fixturing BR-AUTH-0.** §5.1 row 5 and BR-AUTH-0's second bullet say: `ANTHROPIC_API_KEY` present, no flag, no inspectable evidence ⇒ **refusal** `auth.api-key-refused` — matching REQ AC-2.1 row 5 (`REQ-pdlc-headless-engine.md:389`). M-ENG-08 ends "a run on a host where no such evidence is readable is `auth.unknown` (AC-2.1 row 6), never a refusal — see FSPEC §5.1 BR-AUTH-0" (`docs/_constraints/pdlc-engine-baseline.md:144-146`). That is true only when the key is *absent*; with the key present the same state is row 5. Since AT-ENG-13's row-5 fixture is precisely "key present, scratch `HOME` with no `oauthAccount`", the two documents predict opposite outcomes for the fixture the FSPEC just introduced. The defect is upstream (the measurement doc is the REQ author's, pm-author §5e), so it is raised as an erratum rather than fixed here; §5.1 needs no change. | §5.1, M-ENG-08 |
| F-06 | Low | Local | **AT-ENG-37 reads as an equality against BR-RETRY-3's table, but every cell is jittered.** The prose is precise — "a jitter of at most 1 s is added (never subtracted)" — and matches HEAD (`adapter.mjs:91-92`: `min(cap)` then `+ jitterFn`). But the table's cells say "30 s (+jitter)" while AT-ENG-37 says "the delays match BR-RETRY-3's table", which a test author will write as `assertEqual(30_000, delay)` and watch flake 1 run in 30. Fix: state the assertion form once — either the interval `[d, d+1000]`, or an injected zero-jitter seam for the transcription test with one separate test that the jitter is within bounds. | §8.2, §8.6 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | BR-PARITY-5 requires the double to "replay each dispatch's file writes from its fixture", which makes the fixture the source of both the artifact bytes and the expected filenames (BR-PARITY-6). Does anything then still falsify a *module* that stopped composing a path into its prompt — i.e. is the fixture keyed to the prompt the module actually emitted, or to the phase name? One sentence would rule out the double writing files the run never asked for. |
| Q-02 | AT-ENG-63's third clause ("no other test attempts one") is a whole-suite property like BR-MSG-1's. Is it asserted the same way — one end-of-suite check over the trap's observations — or per test? The former is writable; the latter is a convention. |

## Positive Observations

- BR-PARITY-5 is the strongest addition in this round, and it is one I did not ask for: I filed the *expectation* vacuity (clause 1(ii) deriving from the run under test) and the author found the deeper one — that a response-returning double leaves `docs/{f}/` empty, so clauses 1–3 pass on nothing. Making "a write-less double fails this test" AT-ENG-45's *first* obligation is a mutation check written into the FSPEC, which is exactly the device that keeps an oracle honest.
- Every code citation added in v1.1 is correct at HEAD. I checked all fourteen: `bin/pdlc.mjs:41/83/93/172/189-191/201-203/215-221/236-237/303/306-307/332/335`, `transport.mjs:89/159/168/170-175`, `adapter.mjs:58-59/75-95`, `startup.mjs:20/102`, `orchestrate-dev.js:48-53/52`. The retry ladder in particular is described in the order the code evaluates it, cap-then-jitter included.
- BR-FAIL-3 answers a question I had not thought to ask — what an engine-fatal stop *leaves behind* — and answers it with three positive conjuncts plus the queue row's residual state, rather than "no POSTMORTEM is written". AT-ENG-67 and the §15.2 row make it transcribable, and the "should know it means the host stopped, not the pipeline is still thinking" framing is the operator-visible consequence a reviewer can check.
- The two new errata (O-ENG-4, O-ENG-5) were raised rather than absorbed, including one — `doctor` having no upstream authority at all — that no reviewer asked for and that a lesser revision would have quietly left in §14.1.
- BR-CMD-1 and the §3.2 flag table together turn the closed-set claim into something with a red state, and the `--dry-run-skill` row cross-references §6.3, so the two findings that touched the same surface (F-01, F-06) were fixed as one decision rather than two patches.
- §18.3 now names the observable beside each set-equality and closes with "No set-equality in this document is left to a reviewer's reading of the source" — the exact sentence a suite-obligations section should be able to make.

## Recommendation

**Approved with minor changes**

All six High findings from v1 are resolved, and resolved at the mechanism level rather than by
rewording: named observables (BR-AUTH-0/M-ENG-08, BR-FAIL-1's corpus, BR-MSG-1's seam), a total
order for exit codes, the production permission posture folded into the guard assertion, and a
one-invocation-per-member rule for the dry run. Nothing in the revision broke a section that was
sound in v1.0 — the changed sections' citations all hold at HEAD, and the AT set stayed contiguous
(AT-ENG-01…68) with §14.1 and §18.1 both updated.

The six remaining findings are Medium and Low and none of them gates: two are gaps opened by rung
0's arrival in the ladder (what a usage error emits, and whether totality applies to it), one asks
the taxonomy to reuse the catalogue's own suite-wide device, one adds a missing test for a message
contract this round introduced, one is an upstream contradiction in M-ENG-08 raised as an erratum,
and one is a jitter-vs-equality wording nit in AT-ENG-37.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 5, "low": 1}
