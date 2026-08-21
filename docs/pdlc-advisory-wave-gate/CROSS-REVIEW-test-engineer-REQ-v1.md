# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md` (v1.11)
**Date:** 2026-08-20
**Iteration:** 1

## Verification Basis

Every code path and existing-behaviour claim the REQ names was re-run against the working tree at
HEAD of `feat-pdlc-advisory-wave-gate`, not taken from the document. Anchors below are symbol- or
content-anchored per DEC-DOC-01.

| REQ claim | Site verified | Result |
|---|---|---|
| AC-1.1 / AC-3.1 — catalogue gains a sixth seam and two envelope members | `ADVISORY_SEAMS` and `ENVELOPE_DEFAULTS` in `pdlc/workflows/orchestrate-dev.js` | Holds. Both frozen literals now carry six members (`A1`…`A6`; `E-1`…`E-6`) |
| AC-2.2 — closed, ordered four-class root-cause set | `ADVISORY_ROOT_CAUSES` | Holds. Exactly `plan-ordering-defect`, `wave-internal-defect`, `environmental`, `unclassified`, in the REQ's order |
| AC-2.2 — receiving side is total, out-of-set reads as `unclassified` | the `ADVISORY_ROOT_CAUSES.includes(value) ? value : "unclassified"` normaliser | Holds |
| AC-3.3 — the four added exclusions (f)–(i) | `A6_PROHIBITIONS` (`["f","g","h","i"]`) | Holds |
| AC-3.4 — the refusal-reason set stays at eight and A6 adds no ninth | `ADVISORY_REFUSAL_REASONS` | Holds. Eight members; no A6-specific addition |
| C-2 — shipped defaults `attemptBudget: 3`, `seamBudgetMinutes: 10`, `waveBudgetPerRun: 1` | the advisory defaults literal | Holds for all three |
| AC-4.4 — one gate-sequence implementation shared by first pass and re-gate; ordered `invocations` | `runWaveGateSequence` | Holds. Pushes `"post-wave"` / `"test"` immediately before each `runCommandFn`, so the ordered-sequence oracle is observable and truncates at the first failing command |
| AC-1.2 — post-wave command runs once, failure halts immediately | `runWaveGateSequence`'s `failed: "post-wave"` early return and the wave loop's `haltError` on it | Claim holds; **the REQ's line anchor for it does not** — see F-02 |
| M-WG-3 — script-owned gate gated on both a test command and a transport | the `scriptGate` computation and its `if (scriptGate)` branches in the wave loop | Holds |
| M-WG-12 / AC-4.6 — per-wave commit covers only this wave's owned paths | `groupPromotedPaths`, which filters repair paths to those a **later** wave's `task.files` own | Holds, and is the mechanism O-8 anticipated |
| §1 — the wave ledger exists but is untracked and ignored | `WAVE_STATE_PATH` / `parseWaveLedger`; `.gitignore` carries `/.claude/pdlc-wave-state.json`; `.claude/pdlc-wave-state.json` is present on disk and reported by no `git status` entry | Holds exactly as v1.11 re-measured it. The v1.11 changelog's correction of v1.10 is the accurate one |
| M-WG-6 — no Phase I approval skip | `FORCE_PHASE_TOKENS`, a frozen six-member list carrying no `I` | Holds |
| C-5 — REQ inside the size budget | `pdlc/hooks/scripts/check-req-size.sh` (`LINE_LIMIT=700`, `BYTE_LIMIT=61440`) vs. the document at 636 lines / ~51 KB | Holds, with headroom |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | No acceptance criterion covers `waveBudgetPerRun: 0`, a shipped and intentional operator mode with an observable distinct from AC-1.4's inertness | C-2, AC-2.4 |
| F-02 | Low | Process | AC-1.2's raw `file:line` anchor is stale and resolves to unrelated helpers at HEAD | AC-1.2 |
| F-03 | Medium | Local | E-6's first conjunct has no decidable predicate and no named downstream owner, though the column promises one | AC-3.1, O-4 |
| F-04 | Low | Local | AC-4.1/AC-4.5/AC-3.5 pin fixture construction and oracle strength at REQ altitude | AC-4.1 |

### F-01 (Medium, Local) — `waveBudgetPerRun: 0` is a shipped mode with no requirement behind it

C-2 declares `advisory.waveBudgetPerRun` with default `1` and the meaning "how many distinct waves A6
may resolve in one run; exceeded ⇒ escalate". AC-2.4 phrases the budget only as an exceedance rule.
Neither states the knob's admissible range, and nothing in the REQ mentions `0`.

The shipped validator admits it deliberately: `waveBudgetPerRun` is validated with `nonNegativeInt`
where its two sibling budgets use `positiveInt` / `positiveNumber`. The TSPEC is explicit about why
— its config table calls `0` "a legal configured value (E-33), not a misconfiguration: it is the
**intended operator configuration** … 'keep the tier on, keep A6 off' — every red wave escalates with
no dispatch and the sixth summary row reads zero, which is observably different from
`advisory.enabled: false`, where the report carries no `advisory` key at all."

That last clause is a black-box observable at exactly REQ altitude — a named surface, a stated count,
and a stated contrast with the AC-1.4 baseline — so it is expressible here without any test or seam
mechanics. As the REQ stands, the mode traces to no AC, which means US-03's "hard, declared boundary"
has a second, weaker-but-distinct off switch that no acceptance criterion constrains, and a reviewer
of the PROPERTIES has no upstream oracle to check the `0` behaviour against.

Resolving change: add a conjunct to AC-2.4 (or a sibling AC under REQ-AWG-02) stating that
`waveBudgetPerRun` accepts any integer ≥ 0; that at `0` with the tier enabled every red wave
escalates with no dispatch; and that this is distinguishable from AC-1.4 inertness on the run report
— the per-seam A6 row is present and reads zero, where under `advisory.enabled: false` the advisory
section is absent altogether. That gives the `0` boundary a positive oracle rather than leaving it as
an absence.

### F-02 (Low, Process) — AC-1.2's line anchor no longer resolves

AC-1.2's "Correction, 2026-08-13" cites `orchestrate-dev.js:12331-12343` for the claim that the
post-wave command runs exactly once and its failure halts immediately. At HEAD that range contains a
`setTimeout` sleep helper and `defaultReadFile` — nothing to do with the post-wave command.

**The claim itself is true**, and I verified it independently: `runWaveGateSequence` runs
`implConfig.postWaveCommand` once and returns `{ failed: "post-wave" }` on a non-zero result, and the
wave loop turns that into an immediate `haltError` carrying the command line and an output tail. Only
the anchor is wrong.

DEC-DOC-01 fixes this as a `Process`, Low finding rather than a style nit: a raw `file:line` anchor is
permitted only where position itself is the claim under test, which is not the case here. Note that
§9's BL-06 already discloses positional-recipe drift in the baseline's §1–§2 — this anchor sits in
the REQ's own body and is not covered by that disclosure.

Resolving change: replace the range with the symbol anchor (`runWaveGateSequence`'s
`failed: "post-wave"` early return, and the wave loop's `haltError` on it), which survives unrelated
edits to the file.

### F-03 (Medium, Local) — E-6's symbol conjunct is not decidable, and no downstream owner is named

AC-3.1 presents its two new members under a column headed **"Decidable rule"**. E-6's rule is a
conjunction:

1. "the gate output names a symbol or artifact that a later task's PLAN row already undertakes to
   produce", **and**
2. "every path the proposal would change is a member of that later task's owned-path set".

Conjunct 2 is decidable, and O-4 names TSPEC as the owner of how the owned-path sets are computed and
compared. Conjunct 1 has neither: "undertakes to produce" is not given a predicate, and no obligation
routes it downstream. The shipped grouping is purely path-based — `groupPromotedPaths` decides
promotion membership from `task.files` alone — so conjunct 1 is in practice left to model judgement,
which is precisely the judgement E-6 exists to bound.

Per DEC-LAYER-01, a rule that states neither the observable nor a downstream owner remains blocking at
its own layer; the two other envelope rules in the same table do carry one, so this is an omission
rather than a deliberate deferral.

Resolving change: either extend O-4 to cover the symbol/artifact conjunct explicitly ("how the gate
output is matched against a later PLAN row's undertaking is TSPEC's"), or state the black-box
observable — that E-6 admission requires a later PLAN row naming the symbol, and that a proposal
whose paths are covered but whose symbol is named by no later row is refused `out-of-envelope`. The
first is the cheaper fix and matches how E-5 is handled.

### F-04 (Low, Local) — fixture construction is pinned at REQ altitude

Three criteria carry test-design contracts rather than observable outcomes: AC-4.1's "the observable is
three positive conjuncts, each on a run of its own, **so three fixtures**" and "its fixture mutates
the shipped control flow to drop the re-gate"; AC-4.5's "each has a failing test"; AC-3.5's "asserted
by its own test". DEC-LAYER-01 assigns "fixture construction and oracle strength (what a test's Given
builds, which ordered pairs a fixture set ranges over, set-equality domains)" to PROPERTIES / the AT
layer.

I grade this Low, not Medium, because the substance is right and the conjuncts themselves are proper
black-box observables — AC-4.1's three positive conjuncts are exactly the fix for the unbounded
negative the v1.8 changelog records retiring, and I would not want that reversed. The finding is only
that the fixture count, the mutation technique and the per-test decomposition are PROPERTIES' to
choose and re-stating them here creates checkable claims at a layer that cannot falsify them.

Resolving change: keep the conjuncts; drop "so three fixtures", "its fixture mutates the shipped
control flow to drop the re-gate", and "by its own test", replacing the last with a pointer to
PROPERTIES. AC-4.1's conjunct (iii) can state the outcome ("an applied repair followed by no gate
invocation halts the wave") and leave the unreachability argument to PROPERTIES.

## Questions

| ID | Question |
|----|---------|
| Q-01 | At `waveBudgetPerRun: 0` with the tier enabled, does A6 still *classify* a red wave (producing a root-cause class on the escalation) or does it escalate with no dispatch at all? The TSPEC says "no dispatch", which implies no classification — but AC-6.4's countability of `plan-ordering-defect` then silently loses its input in that mode. Which does the REQ intend? |
| Q-02 | AC-1.5 scopes the notice population to runs "that reach Phase I and evaluate wave mode". A run that reaches Phase I, evaluates wave mode, finds both prerequisites present, and *then* halts on a dispatch-level failure (M-WG-1) before any gate runs is inside the population and A6 applies — so the criterion demands zero notices. Is that the intent, and is there a fixture that defeats the earlier dispatch-halt branch to prove the zero is a real zero rather than an unreached assertion? |
| Q-03 | AC-4.4 admits a truncated sequence `[post-wave, test, post-wave]` when the re-gate's post-wave command fails. Since AC-1.2 excludes post-wave failure from A6's trigger entirely, is the re-gate's post-wave failure classified, or does it escalate unclassified? The two criteria are consistent but the outcome is not stated in either. |

## Positive Observations

- **The oracle discipline in this document is the strongest I have reviewed in this repo.** AC-4.4's
  ordered-sequence oracle explicitly rejects set equality with the reason stated inline ("it collapses
  the duplicates and admits a resolution declared on one invocation, the defect this criterion
  excludes"). That is the completeness-by-set-equality principle applied *and* correctly refused where
  sequence is the unit — a distinction most specs get wrong in the other direction.
- **AC-4.1's three positive conjuncts are a textbook repair of an absence-only oracle.** The v1.8
  changelog records replacing an unbounded negative with three positive conjuncts, and AC-4.5
  generalises the rule ("each such test asserts the corresponding positive outcome on the same path
  … because a negative assertion alone is satisfied by accident"). Every prohibition in REQ-AWG-04
  is paired with what happens instead.
- **Both closed catalogues are asserted by set-equality, and the REQ says so at the point of
  definition.** AC-2.2 ("a deleted or invented class fails the suite") and AC-3.1 ("set-equality over
  member ids alone") both hold at HEAD, and AC-1.1 and R-5 are honest that this makes the change
  non-additive rather than pretending otherwise.
- **The totality rule in AC-2.2 is precisely disambiguated against AC-2.1.** An unclassifiable verdict
  escalates *without* consuming an attempt because no repair was attempted; a malformed verdict
  consumes one; and where both could read, the specific rule is named as winning. The shipped
  normaliser implements exactly the stated default.
- **§1's corroborating-evidence paragraph withdraws a stronger claim the author had previously made.**
  v1.11 re-measures the wave ledger, finds it untracked and gitignored, and explicitly records that
  the v1.10 statement was the opposite and is withdrawn. I verified the current state and v1.11 is
  correct. A document that narrates its own retraction is doing the thing that makes measured
  baselines trustworthy.
- **BL-06 pre-discloses its own recipe drift.** Rather than leaving reviewers to discover that the
  baseline's positional `sed -n` recipes no longer resolve, §9 names the drift, scopes it to every
  positional recipe in §1–§2, and separates "the facts re-verified true, the recipes did not". F-02
  exists only because one anchor in the REQ's own body sits outside that disclosure.

## Positive Observations

## Recommendation

**Approved with minor changes**

No High findings. Every existing-behaviour claim the REQ makes about the pipeline verified true
against the working tree at HEAD — the six-member catalogues, the four-class root-cause set, the
eight-member refusal set, the three budget defaults, the shared gate-sequence implementation, the
per-wave commit scope, and §1's re-measured ledger state. The two Medium findings are additive:
F-01 asks for an AC behind a shipped operator mode that currently traces to none, and F-03 asks E-6's
first conjunct to either become decidable or name its downstream owner as its sibling rules do. The
two Low findings are a stale line anchor (F-02) and three sentences of fixture design that belong to
PROPERTIES (F-04).

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 2}
