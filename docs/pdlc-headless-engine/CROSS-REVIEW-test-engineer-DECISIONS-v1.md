# Cross-Review: test-engineer — DECISIONS

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-headless-engine/DECISIONS-pdlc-headless-engine.md` (v1.1)
**Date:** 2026-08-11
**Iteration:** 1

**Scope:** first review of DECISIONS through the testing lens only — whether each entry's
re-evaluation triggers are observable, whether any decision forecloses a testing approach
PROPERTIES will need, and whether the claimed costs and rejected alternatives are stated
precisely enough that an oracle can be written against them. Architecture and product
judgement are the SE and PM reviews' lens, not mine. Every factual claim below is grounded
in HEAD source on `feat-pdlc-headless-engine` and cited `file:line`.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **The no-bare-literal guard DEC-ENG-05 accepts as its cost cannot be written as a falsifiable test at HEAD.** The closed allow-list is stated as "today exactly the reviewer-role map keys at `orchestrate-dev.js:6229-6231`". But HEAD dispatches through bare literals at *dispatch* sites in at least seven places: `_agent("ship-pr", …)` (`orchestrate-dev.js:8008`, `:8112`), `_agent("se-implement", …)` (`:8064`), `_agent(\n "dod-verify", …)` (`:8034-8036`), `agentFn("se-implement", …)` (`:10142`), `agentFn("se-implement", …)` (`:10250-10251`), `agentFn("harvest-learnings", …)` (`:10542`), plus `skill: "harvest-learnings"` (`:10448`) and `ADVISORY_RUNG_SKILL = "se-review"` (`:1797`). A test forbidding bare literals with only `:6229-6231` allowed is **red at HEAD**; the two repairs both defeat the purpose — rewriting those call sites falsifies DEC-ENG-07's two-row-diff C-4 claim, and widening the allow-list to cover all of them leaves an oracle that polices nothing (every current dispatch literal is exempt, so the "new bare literal at a new dispatch site" it exists to catch is indistinguishable from an allowed one). The decision must say which of these the design takes, and what the guard actually asserts, before PROPERTIES can write it. | DEC-ENG-05, "The cost this decision accepts" |
| F-02 | High | Local | **DEC-ENG-03 assigns the interpreter-capability probe to "startup rung-5", which conflicts with the closed rung table upstream and makes two contradictory tests derivable.** FSPEC's six-rung table fixes rung 5 as **billing posture**, passing when "the startup auth mapping of §5.1 does not land on the refusal row" and failing with `auth.api-key-refused` (`FSPEC-pdlc-headless-engine.md:283-292`); TSPEC deliberately says only "the ladder's **rung 5 neighbourhood**" (`TSPEC-pdlc-headless-engine.md:1306-1307`) and pins `RungRecord` to `rung: 0..5` with "always all six" (`:834`, `:840`). DECISIONS §8's consequence row hardens that to "startup rung-5 capability probe + catalogue id". On a host with clean auth and no usable interpreter, an FSPEC-derived test asserts rung 5 **pass** and a DECISIONS-derived test asserts rung 5 **fail** — same fixture, opposite expectations, and `doctor`'s rung report (BR-START-2 totality) cannot name which capability failed from `{rung, name, state}` alone. State the rung identity explicitly: a distinct rung (which is an FSPEC/TSPEC change, not a DECISIONS-local one), or rung 5 redefined to a two-predicate rung with per-cause catalogue ids that the AT-ENG-43 oracle asserts. | DEC-ENG-03, §8 consequences |
| F-03 | Medium | Local | **DEC-ENG-05's "wrong in both directions (17 names against a derived 10)" is not true of HEAD, and an oracle transcribing it would be red.** `startup.mjs:20-37` holds 17 entries = **15 skill identifiers + 2 `se-implement` supplement entries**, and the derived-10 set (`pm-author`, `pm-review`, `se-author`, `se-review`, `te-author`, `te-review`, `se-implement`, `ship-pr`, `dod-verify`, `harvest-learnings`) is a strict **subset** of those 15 — every dispatchable identifier is already listed. HEAD is wrong in exactly **one** direction (it over-lists the five operator-invoked-only skills, which is precisely what REQ AC-3.5 records: "5 further operator-invoked skills present in the plugin and outside the set", `REQ:499-516`). The comparison also mixes units (17 = identifiers + prompt files, against 10 identifiers over 12 files). Restate as an over-listing defect, or name the identifier HEAD is missing. | DEC-ENG-05, Alternatives; §7 table row |
| F-04 | Medium | Local | **The scanner-alternative's measured evidence understates HEAD, and its derived set is wrong.** "Only three of the ten identifiers sit at a literal `_agent("…")` call site" and "a scanner honouring 'literals at dispatch sites' derives `{ship-pr, se-implement}`" do not agree with each other (three identifiers cannot derive a two-member set) and neither agrees with HEAD: **four** identifiers sit at literal dispatch call sites — `ship-pr` (`:8008`, `:8112`), `se-implement` (`:8064`, `:10142`, `:10250`), `dod-verify` (`:8034-8036`), `harvest-learnings` (`:10542`) — so a faithful scanner derives a **four**-member set. The rejection survives the correction (4 of 10 is still incomplete), but expected values in a test must be literal transcriptions of the spec, and this one is false. Note also that `dod-verify` and the second `se-implement` site are multi-line calls, which is itself evidence for the rejection and worth carrying. | DEC-ENG-05, Alternatives |
| F-05 | Medium | Local | **DEC-ENG-04's gate has no stated key, so neither its red fixture nor its green fixture can be constructed — and one plausible key makes CI red on a dependency resolution.** The row is `date \| platform \| transport \| sdkVersion \| denyFired` (TSPEC §6.5), the lookup granularity is deferred to O-ENG-T4 and the off-matrix case to O-ENG-T5, yet the decision commits the hermetic suite to failing when "no row for the running platform" exists. A test needs the exact key now: a fixture baseline with a row that must be green and a fixture that must be red. If `sdkVersion` participates, the caret pin `"@anthropic-ai/claude-agent-sdk": "^0.3.226"` (`pdlc/engine/package.json`) means any clean install resolving 0.3.227 turns a hermetic, offline suite red with no code change — a gate that fires on `npm i` teaches maintainers to ignore it, which is the same oracle erosion DEC-ENG-04 exists to prevent. Say which columns are the key, and what the gate does when the SDK moves within the range. | DEC-ENG-04 |
| F-06 | Medium | Local | **DEC-ENG-10's suite-wide assertions are only defined over a full run, and the decision does not say so — so a filtered run is a false red.** Step 4 asserts set-equality of accumulated observations against the closed catalogues (AC-4.1, AC-6.4, AC-3.3). Any partial invocation (`--test-name-pattern`, a single file, a `--test-only` debugging pass) populates the run directory with a subset, and the registered-⊆-emitted direction fails for reasons unrelated to the change under test. Combined with "step 4 on success only", the everyday developer experience becomes "red step 4 means nothing" — the mechanism's authority is what makes it worth the filesystem hop. State that step 4 runs only for an unfiltered run, and that a filtered run reports step 4 as **skipped-with-reason** rather than passing or failing. | DEC-ENG-10 |
| F-07 | Medium | Local | **DEC-ENG-11's mis-built-configuration counterpart is itself an absence-only oracle.** The deny clause is properly paired (allow arm + real deletion), and the survival clause is properly paired. But the reason-text clause is paired with "a deliberately mis-built configuration (matcher `"Write"` instead of `"Bash"`, or a hook path pointing at no script) **must produce no deny**" — a pure negative. That passes when the harness never invoked the hook at all, when the fixture command never matched the guard's scope regex (`guard-harvest-before-delete.sh:35`, `:37`), or when an error was swallowed. Require the mis-built arm to assert positively on the same path: the callback returns an explicit **allow** verdict *and* the deletion the well-built arm blocks actually completes (the `CROSS-REVIEW-*` file is gone afterwards). | DEC-ENG-11 |
| F-08 | Low | Local | **The model-map oracle's "defined Phase-I wave set" is a second hand-maintained declaration, of exactly the kind DEC-ENG-05 removes.** DEC-ENG-07 correctly prices the V-wave wrinkle (`orchestrate-dev.js:10248` announces `"Phase PT"` while `:10253` pins `MODEL_IMPLEMENTATION`) and moves the oracle onto a wave set defined in the test. That set drifts silently when a fourth sonnet-pinned site appears, and the drift direction is toward green (an unlisted descriptor is simply not partitioned). Deriving the set from the code under test would be an implementation echo and is not the fix; instead state the maintenance rule and the failure mode — e.g. the oracle asserts set-equality between "descriptors in the declared Phase-I wave set" and "descriptors carrying `sonnet`", so a new sonnet site not added to the set fails rather than passes unnoticed. | DEC-ENG-07 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | DEC-ENG-04: when the M-ENG-09 measurement returns `denyFired: no`, the pre-committed branch moves the guard to `canUseTool`. Does the *hermetic* guard-parity suite (§6.3, DEC-ENG-11) survive that move unchanged, or do all of its clauses need re-derivation against a different carrier? If the latter, that is a PLAN sequencing fact worth recording here — the parity tests would be written twice. |
| Q-02 | DEC-ENG-03: the engine refuses startup when no interpreter is available. How does a hermetic test *produce* that state on a host that has `python3` — a scrubbed `PATH` in the child environment, or an injected probe seam? If it is `PATH` scrubbing, note that the guard script probes by executing `"$cand" -c "import sys"` (`guard-harvest-before-delete.sh:16`), so the fixture must defeat all three candidates (`python3`, `python`, `py`), and the assertion should be on the catalogue id, not on the message text. |
| Q-03 | DEC-ENG-12 asserts "the value reaching the transport equals the value in the report". Which end does the test read the transport-side value from — the `dispatchOpts` object the adapter builds (`adapter.mjs:278-281`) or a recording transport double? The first is closer to an implementation echo; the second is the falsifiable one, since `transport.mjs:152` destructures `timeoutMs` with its own default and a mis-wired stamp would still look right upstream of it. |

## Positive Observations

- **DEC-ENG-10 asserts its own mechanism, and does it the right way round.** Requiring that two
  deliberately separate test files land one record each in **exactly one** run directory turns the
  env-inheritance property into an assertion instead of an assumption — the property was silently
  false in an earlier draft, and this is the shape that would have caught it. The rejection of
  "mint the id in the bootstrap on first use" is grounded in a real measurement of `node --test`
  child-process semantics (TSPEC §7.0), not in intuition.
- **DEC-ENG-11 names the falsification requirement as a design rule, not a review preference.**
  "Each clause is asserted together with a counterpart that must fail" is the single most
  transferable line in this document; the survival-clause pairing (same fixture, same deletion
  step, allow verdict, file gone) is exactly the form that catches a test passing because nobody
  tried.
- **DEC-ENG-09's layering argument is a testability argument, and correctly so.** Rejecting
  "classify in the adapter, beside the retry machine" because it would make the taxonomy's
  totality assertable only through a dispatch is the right reason — a policy-free layer-0 module
  makes the six-member set-equality (AC-4.1) a direct, cheap, offline oracle.
- **The costs sections are honest about oracles that would otherwise be quietly weak.** DEC-ENG-12's
  `maxTurns` asymmetry (containment plus two required keys, not set-equality) and DEC-ENG-07's
  `null` phase for pre-`_phase` dispatches are both stated as asserted facts rather than assumed
  away; both check out against `adapter.mjs:278-281` and `orchestrate-dev.js:9516`+14 further
  `phaseFn` call sites (15 total, as claimed).
- **DEC-ENG-02's evidence-integrity framing is testable as stated.** Because the report pins
  `transport: "agent-sdk"` as a scalar (`report.mjs:50`), a failover would make the run's carrier
  unattributable — that is a property a test can pin today, not a philosophical position.

## Recommendation

**Needs revision**

Two High findings. F-01 and F-02 are both cases where a decision commits the design to a test
obligation that cannot yet be written as a falsifiable assertion: the no-bare-literal guard has
no implementable form at HEAD (its allow-list either leaves the suite red or exempts every site
it exists to police), and the interpreter probe's rung identity contradicts FSPEC's closed
six-rung table, so two derivable tests disagree on the same fixture. Both are resolvable inside
this document — F-01 by stating what the guard asserts and which sites are exempt and why,
F-02 by naming the rung explicitly and, if it is a new one, filing the upstream change rather
than implying it.

The five Medium findings are corrections and completions, not redesigns: three false or
imprecise claims about HEAD (F-03, F-04), one undefined gate key (F-05), one undefined scope
for the suite-wide step (F-06), and one absence-only counterpart (F-07). The document's
underlying instinct — that a decision is only recorded once its cost and its falsification are
both written down — is right, and most of it already does this well.

**Upstream erratum filed (not edited here):** TSPEC §6.4 places the guard-capability probe in
"the ladder's rung 5 neighbourhood" while FSPEC's rung table fixes rung 5's pass predicate as
the auth mapping alone; the neighbourhood wording is what DECISIONS hardened into F-02.

## Verdict

VERDICT: Needs revision
{"high": 2, "medium": 5, "low": 1}
