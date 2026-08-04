# Cross-Review: test-engineer — DECISIONS

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-tier/DECISIONS-pdlc-advisory-tier.md
**Date:** 2026-08-03
**Iteration:** 1
**Scope:** Testing lens — are the re-evaluation triggers observable, does any decision foreclose a testing approach PROPERTIES will need, and is the stated reversibility consistent with how the design is actually testable.

## Verification performed

I re-read every `file:line` this document cites rather than trusting the grounding pin. **All of them
verify.** This is unusually good and it is worth recording, because the findings below are about what
the document says *around* those citations, never about the citations themselves.

| Claim in DECISIONS | Verified how | Result |
|---|---|---|
| 5 dev halts (`dev:7635/7650/7673/7695/8498`), 1 queue halt (`queue:1012`), 2 queue blocks (`queue:794/847`) | `grep -n 'outcome: "halted"\|"blocked"'` over both modules | exact, no extras |
| Line counts 8,642 / 1,587 / 383 | `wc -l` | exact |
| `MODEL_DEFAULT` `dev:1578`, `MODEL_IMPLEMENTATION` `dev:1621`, `MODEL_QUEUE` `queue:69` | `grep -n` | exact |
| `parseMergeConfig:101`, `parseImplementationConfig:181`, `classifyPrState:380`, `effectiveGuardPaths:708`, `guardVerdict:731`, `decideMerge:835`, `phaseMerge:1361`, `gitWithLockRetry:6862`, `commitPaths:6905`, `buildFinalReport:8595` | `sed -n` at each line | exact |
| `DOD_MAX_ITERATIONS = 3` at `dev:25`, used `dev:6275` | `sed -n` | exact |
| Harvest `dev:8307` precedes Phase PUB `dev:8363` (DEC-ADV-07's load-bearing ordering fact) | `sed -n` on both banners | exact — the rejection of "re-verify DoD in PUB" stands |
| `commitPaths` / `gitWithLockRetry` are module-private | `grep -n 'export async function commitPaths'` ⇒ no match | **confirmed private** — DEC-ADV-03's erratum is real |
| `guardVerdict` semantics: `startsWith`, case-sensitive, position-0, `/`-delimited, no globbing, fail-closed on `ok !== true` | read `dev:706-740` | exact, all four properties present |
| `MERGE_GUARD_DEFAULTS` frozen at `dev:47-52`; `mergeMode: "off"` `dev:60`; skip at `dev:1407` | `sed -n` | exact |
| Both bundles inline `devModule` **and** `queueModule`; ordering-hazard comment at `build:285-287`; 3 rows from the `bundles` array | read `build:278-297` | exact |
| `AWAIT_SCAN_SOURCES` is a hand-written 2-element literal at `bundleTest:997`, driven at `:1011` | `grep -n` | exact |
| `advertisedVersionViolation` at `document-oracles.mjs:575`; plugin at `0.20.2` | `sed -n`, `grep -n` | exact |
| D-6 pin: `26c3f1c` ancestor of HEAD; `4d5e4dc` ancestor of `26c3f1c`; `raisePrAndVerifyCi` at `26c3f1c:6222` (4 hits); 8,527 lines at `26c3f1c` | `git merge-base --is-ancestor`, `git show`, `git grep -c` | all four exact |
| DC-01 / DC-03 / DC-04 / DC-08, DEC-DIST-01 / DEC-DIST-02 | read the cited headings in `docs/_constraints/DOMAIN-CONSTRAINTS.md` and `docs/_decisions/DECISIONS-plugin-distribution.md` | all exist and say what is claimed |

Two cost claims were re-derived rather than accepted:

- **The fourth-build-source cost (DEC-ADV-01).** Confirmed against the files it would touch:
  `build.mjs` would need one `readFileSync` (precedent `cliSource`, `build:256`), one `wrapModule`
  call, prelude additions to **both** existing calls (`build:87-95`, `build:96-103`), and two
  `contents`-array insertions (`build:281`, `build:288`). The document's "roughly a dozen lines, not
  two" is honest, and its refusal to inflate the cost ("Rejected on that balance, not on an inflated
  cost") is correct.
- **The manifest claim.** Confirmed the document is right and TSPEC §16.1 is wrong: rows are per
  artifact from the `bundles` array (`build:278-297`), so a fourth *source* adds no row. Routed as an
  erratum below.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | DEC-ADV-08's Context is false against FSPEC at HEAD — FSPEC C-2 already reconciles C-2 with D-5/S-4 in exactly the way this entry decides. The entry routes a spurious erratum and frames the resolution as a *deviation*, which will produce a test asserting a deviation instead of a test of C-2. | DEC-ADV-08; "Decisions deliberately NOT taken here" ¶2 |
| F-02 | High | Local | The both-modules-in-both-bundles inlining that DEC-ADV-01 and DEC-ADV-05 both rest on has **no falsifying test**, so DEC-ADV-01's re-evaluation trigger 3 has no detector and the failure mode is a runtime undefined-identifier during a queue run. | DEC-ADV-01 trigger 3; DEC-ADV-05 alt 1 |
| F-03 | Medium | Cross-Feature | Standing obligations 3, 4 and 5 have no mechanical detector, while 1 and 2 do. Obligation 4 is guaranteed by the *absence* of a reader — an absence-only guarantee with no positive mechanism. Cheap detectors exist and the repo already has the precedent. | Consequences → "Standing obligations", items 3–5 |
| F-04 | Medium | Local | DEC-ADV-04 mis-cites AC-1.3 and the misquote implies the wrong oracle. AC-1.3 is a three-conjunct positive oracle about a *run on the fallback rung vs a run on the intended rung*, not a claim that the advisory rung differs from `MODEL_DEFAULT`. The entry also leaves AC-1.4's branch unreachable-by-construction without saying so. | DEC-ADV-04 |
| F-05 | Low | Local | DEC-ADV-06's re-evaluation trigger 2 is not observable by any test or monitor — it is a judgement about intent, with no signal that fires. | DEC-ADV-06 trigger 2 |
| F-06 | Low | Local | The grounding pin names HEAD `22b310e`; HEAD is now `6703b20`. `22b310e` is an ancestor and every citation still resolves (verified above), so this is bookkeeping, not drift — but the pin should name the commit or say it is a floor. | "Grounding pin" |

### F-01 (High) — DEC-ADV-08 argues against a conflict FSPEC no longer has, and routes a spurious erratum

DEC-ADV-08's Context states: *"FSPEC never reconciles the two."* It does. `FSPEC-pdlc-advisory-tier.md:145`, C-2, reads:

> The substitution is reported on the run report **only when the resolved configuration leaves the
> tier enabled** — a bad value that resolves the tier to disabled (e.g. a malformed `advisory.enabled`)
> produces a disabled run, which carries **no** advisory content on its report at all (§12 D-5,
> §10.3 S-4), this substitution notice included.

That is the same resolution DEC-ADV-08 reaches, stated in the upstream document, naming the same
example (`advisory.enabled`) and citing the same two rules (D-5, S-4). FSPEC went through five review
rounds; this looks like an entry written against an earlier FSPEC revision and not re-grounded.

Two consequences, and the second is the one in my lens:

1. The entry says the conflict "is routed upstream as an erratum against FSPEC". An erratum against a
   resolved defect costs an erratum round and, per the bounded one-round-per-doc-per-phase rule, can
   halt the phase to a POSTMORTEM. **I am deliberately not emitting that erratum.**
2. The entry frames its own decision as "the TSPEC-side resolution that unblocks implementation either
   way" — i.e. as a deviation from FSPEC pending an upstream fix. That framing has already propagated:
   `TSPEC-pdlc-advisory-tier.md:1238` describes the behaviour as *"§3.2's deliberate C-2 deviation"*.
   A test author reading either document will write the oracle as *"our behaviour differs from C-2
   here, and here is the difference"* — a test pinned to a supposed deviation, which goes red the
   moment someone reconciles the phantom conflict. The correct oracle is a straight test **of** C-2:
   given a malformed `advisory.enabled`, assert (a) `parseAdvisoryConfig(...).invalidKeys` contains
   `enabled` — the parser stays unconditional — **and** (b) the emitted report carries no substitution
   notice **and** no other advisory content. Conjunct (a) is what makes (b) falsifiable rather than
   absence-only: without it, "no notice" passes for a parser that silently dropped the key.

**To resolve:** rewrite DEC-ADV-08's Context to say FSPEC C-2 already fixes the *observable*
(report-only-when-enabled) and that the decision records *where* the suppression lives (the emit, not
the parser) and why — which is a genuine, well-argued engineering choice and should survive intact.
Remove the erratum routing, and remove C-2/D-5 from the "Two upstream defects are recorded but not
decided here" paragraph, leaving only the A2-6 / R-2 one, which I confirmed is real.

### F-02 (High) — the decision's load-bearing bundling fact has no falsifying test

DEC-ADV-01 rests on: *"both shipped bundles already inline `devModule` **and** `queueModule`"*. I
verified it is true today (`build:281`, `build:288`). DEC-ADV-05 rejects a module-level memo on the
same fact. DEC-ADV-01's re-evaluation trigger 3 says the quiet part out loud:

> Any change that stops inlining `devModule` into the queue bundle — that would delete the mechanism
> this decision rests on and force a re-decision immediately.

**Nothing detects that change.** `runtimeBundle.test.js` names the bundles at `:23` but never loads,
evaluates, or scans one for unresolved free identifiers — there is no `new Function`, no `eval`, and no
assertion that `queueModule`'s prelude references resolve against `devModule`'s export list (grep for
`realMain` in that file returns only `:446`, inside a `stripModuleSyntax` unit case on an unrelated
string). Today's prelude, `const realMain = __dev.main;`, is not itself proof: it is a *shipped*
binding, so a composition change breaks it at **runtime, in a queue run, in the consumer's untracked
copy** — and after this feature lands, at the moment the first advisory seam fires, which is the worst
possible discovery point for a tier whose entire purpose is to handle the moment a run goes wrong.

This matters more after this feature than before it. The prelude grows from one binding to the whole
advisory core (the document says so itself in the Consequences table). Every one of those bindings has
the same failure mode, and the blast radius is the seam layer.

The reversibility claim compounds it. DEC-ADV-01 is marked **easy** to reverse, and DEC-ADV-05 is
**easy**, but both easinesses are conditional on a build fact that no test pins. An "easy to reverse"
decision whose premise can be deleted silently is not easy to reverse — it is easy to *break*.

**To resolve:** name the detector in the entry, so the trigger becomes observable and the reversibility
claim becomes defensible. Cheapest form that actually falsifies, in the shape this repo already uses:
extend the bundle test with a scan asserting that every `__dev.<name>` referenced by any bundle's
prelude appears in that bundle's `devModule` export list, and that `devModule` precedes `queueModule`
in both `contents` arrays. Mutation check for whoever writes it: delete `devModule` from the queue
bundle's `contents` array and confirm the new test goes **red** — if it stays green it is not the
detector this trigger needs. A pure "the bundle file contains the substring `__dev`" assertion is not
sufficient: it passes on a bundle where the binding is present but the definition is not.

### F-03 (Medium) — three of five standing obligations have no detector; obligation 4 is an absence-only guarantee

The Consequences section lists five standing obligations. Two carry real, mechanical enforcement, and
I verified both:

- Obligation 1 (await discipline) — `AWAIT_SCAN_SOURCES` at `bundleTest:997`, driven at `:1011`. Real.
- Obligation 2 (version bump on `dist/`) — `advertisedVersionViolation` at
  `pdlc/workflows/lib/document-oracles.mjs:575`. Real.

The other three are prose:

**Obligation 4 — "The escalation log stays writer-only."** DEC-ADV-09 states the guarantee explicitly
as an absence: L-1's immutability and T-09-8's asymmetry are *"guaranteed **by the absence of a
reader** — there is no code path that opens the file for anything but append"*. The reasoning is sound
and I agree with the decision. But an invariant guaranteed by an absence, with no positive mechanism
asserting the absence, is precisely the absence-only oracle shape this project treats as unfalsifiable:
nothing goes red when the first `readFile` against `docs/_queue/ESCALATIONS.md` appears, and the entry
itself says that first read *"converts both from structural facts into behaviour that can be wrong"* —
silently. The fix is one source scan in the shape of `AWAIT_SCAN_SOURCES`: over both modules, assert
the set of seams applied to the escalation path is exactly `{_appendFile}` — **set-equality over the
enumerated seam set, not "does not contain `_readFile`"**, so a seam nobody anticipated also fails.

**Obligation 3 — the D-6 fixture re-pin.** The entry says a refresh without a stated reason *"silently
destroys the property D-6 asserts"*, and DEC-ADV-10 calls regeneration *"a reviewed act with a recorded
reason, never a routine one"*. Nothing enforces that. A one-line literal oracle does: assert the
fixture's provenance header commit equals the literal string `26c3f1c`. Any regeneration then fails a
test and must be accompanied by a deliberate edit to that literal — which is exactly the "reviewed act"
the decision wants, made mechanical. Note this expectation must be a **literal transcription**, never
read from the fixture it is checking.

**Obligation 5 — X-e and Phase MERGE share one matcher, permanently.** The entry's own rejection
rationale is that a fork lets the tier permit a change Phase MERGE then refuses to merge — *"the
pipeline contradicting itself, discovered at the last phase"*. That is a **differential** property and
should be tested as one: over a shared changed-file corpus (including the adversarial cases the entry
names — `pdlc/workflowsX/`, a case-shifted `PDLC/workflows/`, and a non-`ok` observation), assert X-e's
refusal decision and Phase MERGE's guard decision agree **on every input**, rather than asserting each
against its own independently-written expectation. Two independent expectation tables can drift
together with the implementations; a differential oracle cannot.

**Scope note:** tagged `Cross-Feature` because the lesson generalises — a standing obligation with no
detector is documentation, not an obligation — and because obligations 1 and 2 in this same list are
the counter-example that proves the repo already knows how to build these cheaply.

### F-04 (Medium) — DEC-ADV-04 mis-cites AC-1.3, and the misquote implies the wrong oracle

The entry rejects aliasing the fallback to `MODEL_DEFAULT` with:

> AC-1.3 requires the advisory rung to be "always distinguishable" from the pipeline default.

AC-1.3 (`REQ-pdlc-advisory-tier.md:76-80`) does not say that. It says the pipeline (a) emits an
explicit `ADVISORY_MODEL_FALLBACK` warning **naming the unresolvable value and the substitute**,
(b) records the substitution in the advisory record and in the report's advisory summary, and (c)
proceeds — *"A run on the fallback rung is therefore always distinguishable from **a run on the
intended rung**"*. The distinguishability is between two **runs**, carried by three named observables.
It is not a claim about the fallback literal differing from `MODEL_DEFAULT`.

The testing consequence is concrete. An oracle written from the entry's paraphrase is
`expect(MODEL_ADVISORY).not.toBe(MODEL_DEFAULT)` — a constants-comparison unit test that (i) asserts
something AC-1.3 never required, and (ii) is **structurally incapable of falsifying** what AC-1.3 does
require, because none of the three observables is on that path. Worse, it is an absence-only oracle:
it says two strings differ and nothing about what the pipeline emits. The oracle AC-1.3 actually
demands has three positive conjuncts on the fallback path — the warning text contains both the
unresolvable value **and** the substitute; the advisory record carries the substitution row; the report's
advisory summary carries it — plus the pipeline proceeding (a positive terminal outcome, not merely
"did not halt").

The decision itself is still right, and it should survive: a separate constant is defensible because an
aliased one would make the warning in conjunct (a) name whatever `MODEL_DEFAULT` later becomes, which
is a real silent-drift risk. That is a **stronger** argument than the misquote, and it is grounded in
AC-1.3's actual wording. Restate the rationale on that ground.

One more thing the entry should say out loud, because PROPERTIES will otherwise write an untestable
test: with `MODEL_ADVISORY_FALLBACK = "opus"` and `MODEL_DEFAULT = "opus"` (`dev:1578`, verified),
**AC-1.4's branch — "neither rung resolves, run fails loudly" — is unreachable end-to-end**. If `"opus"`
does not resolve, no phase of the pipeline runs at all, so no advisory seam is ever reached to fail
loudly. AC-1.4 is therefore only testable at the classifier/driver unit level with an injected
double, never through a run. Saying so in the entry saves a reviewer from filing it as missing coverage
and stops someone attempting a whole-pipeline test that cannot be built.

### F-05 (Low) — DEC-ADV-06 trigger 2 has no signal

> `MERGE_GUARD_DEFAULTS` gaining a path that should not bind advisory changes, which would be the first
> real evidence the two concepts are not one.

`MERGE_GUARD_DEFAULTS` is frozen at `dev:47-52` (verified). A path being *added* is observable; whether
it "should not bind advisory changes" is a judgement no test or monitor can make. Compare trigger 1 in
the same entry, which is observable (X-e needing globs or per-seam guard sets shows up as a failing
requirement). Suggest restating trigger 2 as the observable event — *any* change to
`MERGE_GUARD_DEFAULTS` re-opens this entry for a one-line judgement — which the differential test in
F-03 would surface automatically.

### F-06 (Low) — grounding pin names a stale HEAD

The pin says every citation was read at HEAD `22b310e`; `git rev-parse HEAD` is now
`6703b202a853badb660e5981bee94a94af44b18f`. `22b310e` is an ancestor (`git merge-base --is-ancestor`
⇒ true) and all citations still resolve, so nothing is wrong — but the document invites verification
against a commit that is no longer HEAD. Either name the commit as a floor ("read at or after
`22b310e`") or refresh it in the same edit that addresses the findings above.

## Questions

| ID | Question |
|----|---------|
| Q-01 | DEC-ADV-10 pins the D-6 fixture to a **commit** but never to a **run scenario**. Two created-file sets are only comparable if the runs that produced them had the same inputs — the same REQ path, the same agent doubles, the same config, the same phases reached. What pins those? If the baseline capture and the disabled-run comparison differ in scenario, the oracle goes false-red on scenario drift, or vacuously green if the scenario is narrowed to the phases that create nothing. I have routed this as a TSPEC erratum against §11.2 since that section owns the fixture's provenance header, but DEC-ADV-10 should say that scenario identity is part of what makes the comparison valid — it is the entry that argues the oracle is sound. |
| Q-02 | DEC-ADV-03 defines `apply` as "everything up to but not including the irreversible act" and `verifyGate` as "perform the irreversible act, then run the gate". For the three seams whose act is **not** irreversible (A1, A3, A4), what does `verifyGate` do — and is there a test that the split is honoured rather than merely documented? Concretely: is there an assertion that no `_git` commit/push seam is invoked from any `apply`? Without it, the R-2 revert guarantee ("a step-7 failure reverts a working-tree edit only") is a convention, and the first seam that commits inside `apply` breaks it silently. |
| Q-03 | DEC-ADV-07 says `dodVerifiedCommit` is captured by `git rev-parse HEAD` "at the moment `dodResult.passed` becomes true". When A5 never fires — the common case — `dodHeadUnverified` is derived as false. Is there a positive oracle for that case, or only for the divergent one? A test suite that asserts `dodHeadUnverified === true` after an A5 push and asserts nothing on the non-divergent path leaves the derivation half-covered; the equal-heads case needs its own positive assertion (`dodHeadUnverified === false` **and** `dodVerifiedCommit === <the head>`), not silence. |
| Q-04 | DEC-ADV-05 threads the memo as a parameter partly so that M-4 is *"directly assertable: pass one `_state` through two seams, assert one classification."* Does "one classification" mean one *resolution attempt* (a call-count oracle on the injected dispatch) or one *resulting value*? Only the first falsifies a memo that re-resolves and happens to get the same answer. Please state which, since the entry offers this assertability as part of the justification. |

## Positive Observations

- **The grounding discipline is the best I have reviewed in this feature.** Every one of ~40 `file:line`
  citations resolves, including the four `git` facts behind the D-6 pin, which I re-ran independently.
  The instruction to *"verify a citation by symbol name; the line number is a navigation hint"* is the
  right contract for files that churn, and it held.
- **Cost claims are re-derived, not asserted.** DEC-ADV-01's fourth-source analysis explicitly walks
  back its own case — *"the fourth source is feasible and modest in `build.mjs`"*, *"Rejected on that
  balance, not on an inflated cost"* — and correctly identifies that the real price is a **test-coverage**
  seam (`AWAIT_SCAN_SOURCES`), not line count. A decision record that argues down its own rejection is
  far more trustworthy than one that piles on reasons, and this is exactly the class of claim I was
  asked to check hardest.
- **DEC-ADV-10 is a model oracle-design decision.** It rejects the tautological baseline, rejects the
  one-sided subset relation (*"D-6 is an equality claim in both directions, so the oracle must be too"*),
  rejects the self-refreshing fixture, and rejects pinning at a HEAD that already contains the feature.
  Those are the four ways this oracle could have been false-green, and all four are named and closed.
  The "easy mechanically, one-way in spirit" reversibility split is an honest and useful distinction.
- **DEC-ADV-09 correctly identifies that an absence can be stronger than a check** — L-1 and T-09-8 are
  structural facts precisely because there is no reader. F-03 asks for a detector for that absence; it
  does not dispute the reasoning, which is right.
- **DEC-ADV-03 surfaces a defect against its own plan.** The entry discovers, mid-decision, that
  `commitPaths` is module-private and that TSPEC §6.4.1's "reuse verbatim" is therefore not yet true —
  and says so plainly under a heading that names it (*"one thing the TSPEC assumes that is not true
  today"*), rather than quietly assuming the PLAN will notice. I verified the claim: neither
  `commitPaths` (`dev:6905`) nor `gitWithLockRetry` (`dev:6862`) carries `export`.
- **The "Decisions deliberately NOT taken here" table is genuinely useful** and correctly separates
  runtime facts (BL-05/BL-06, the `"fable"` alias) from choices. Naming the capability probes and their
  degradations as the design's obligation — rather than assuming the capability — is the right response
  to an unresolvable blocker.
- **Reversibility grades are mostly consistent with testability.** The "easy / hard-in-consequence"
  formulation on DEC-ADV-06 and DEC-ADV-09 captures something real: mechanically reversible, but
  reversal re-opens an invariant. That distinction is what F-03's detectors would make enforceable.

## Recommendation

**Needs revision**

Two High and two Medium findings. This is a strong document — the grounding is exemplary and every
decision is a real decision — and none of the four findings asks for a different decision. All four ask
for the same class of change: make the reasoning survive contact with a test.

Exactly what must change:

1. **F-01** — Rewrite DEC-ADV-08's Context against FSPEC at HEAD: C-2 (`FSPEC:145`) already specifies
   report-only-when-enabled, so the entry records *where* the suppression lives, not a deviation.
   Remove the FSPEC erratum routing and the C-2/D-5 half of the "two upstream defects" paragraph.
   Ripple: TSPEC §11.3's "deliberate C-2 deviation" wording is routed as an erratum below.
2. **F-02** — Name a mechanical detector for the both-modules-in-both-bundles fact in DEC-ADV-01
   (a bundle-composition assertion, mutation-checked by deleting `devModule` from the queue bundle's
   `contents` array), so trigger 3 is observable and the "easy" reversibility grade is defensible.
   DEC-ADV-05 should cite the same detector, since its rejection of a module-level memo rests on it.
3. **F-03** — Give standing obligations 3, 4 and 5 the detectors sketched above: a literal `26c3f1c`
   provenance assertion, a set-equality seam scan over the escalation path, and a differential
   X-e/Phase-MERGE oracle over a shared corpus. Obligations 1 and 2 already have theirs.
4. **F-04** — Restate DEC-ADV-04's rejection of the aliased fallback on AC-1.3's actual wording (the
   warning must name the substitute, so an aliased constant lets the declared substitution drift), and
   record that AC-1.4's branch is unreachable end-to-end and is a unit-level obligation.

F-05 and F-06 are Low and can ride along with the above.

Nothing here blocks the PLAN's shape. The decisions themselves — the seam layer over a new skill, one
driver over five, RECORD before the irreversible act, the hand-reviewed D-6 fixture — are the right
calls and are argued from verified facts.

## Verdict

VERDICT: Needs revision
{"high": 2, "medium": 2, "low": 2}
