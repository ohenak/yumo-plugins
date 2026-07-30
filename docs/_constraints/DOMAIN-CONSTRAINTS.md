# DOMAIN CONSTRAINTS — yumo-plugins

Standing invariants every feature in this repo must respect. Each entry was **promoted** from the
LEARNINGS of completed features by `/pdlc:consolidate-learnings`, not authored directly. Read by
`pm-author` (before REQ/FSPEC), `se-author` (before TSPEC/DECISIONS/PLAN), `te-author` (before
PROPERTIES), and all three review skills (before issuing a recommendation).

To add an entry: run `consolidate-learnings`. A constraint reaches this file only when it recurred
across ≥2 unrelated features, or a single occurrence stated an invariant that obviously generalizes.

> **Numbering caveat — read before following a `DC-NN` citation in a SKILL.md.** Several `pdlc`
> skill prompts cite "`docs/_constraints/DOMAIN-CONSTRAINTS.md` DC-07 / DC-08 / DC-09" — those are
> citations into a **different consuming repo's** constraint file, written before this file existed.
> They are **not** cross-references into this document, and this document's DC-07/08/09 are
> unrelated to them. Disambiguating those citations is proposed in
> `CONSOLIDATION-PROPOSAL-2026-07-29.md` row P-9.

---

## DC-01: A contract that crosses a component boundary is closed and total

**Constraint:** Any string, record, or trailer that crosses the boundary between two components —
workflow script ↔ skill, script ↔ operator, producer ↔ machine parser — must be specified as a
**closed catalogue** on the emitting side and a **total function** on the receiving side, before
FSPEC authoring:

- **Emit side.** Every operator- or machine-visible string has a catalogue id and is registered in
  the test harness's table. No ad-hoc `stderr` regex, no string emitted outside the catalogue — a
  structured harness view silently drops uncatalogued lines, so a message the operator sees becomes
  invisible to every test.
- **Receive side.** The REQ must state the behaviour for **absent, malformed, and truncated** input,
  with an exact fallback and an observable log signal. A parser specified only for well-formed input
  is an incomplete requirement, not an implementation detail.
- Say explicitly whether the contract is **native to the skill** (all callers get it) or **injected
  by one caller** (caller-scoped). Universality of benefit is the deciding criterion: a shared parse
  target belongs in SKILL.md, a single caller's structured return does not.

**Origin:** promoted 2026-07-29 from LEARNINGS of `orchestrate-dev-workflow` (the `VERDICT:` trailer
format and malformed-output fallback consumed 2+ REQ iterations; REQ-GATE-05 existed only because a
TE cross-review demanded the negative path) and `pdlc-workflow-distribution` (two operator-visible
strings emitted outside the FSPEC notice/warning catalogue, asserted only by an ad-hoc `/^pdlc: /m`
regex, in direct contradiction of the harness's own stated rule).

**Applies to:** REQ authoring, FSPEC, all reviews

---

## DC-02: A stated platform or runtime fact must be measured, on every supported platform

**Constraint:** Any predicate a specification, test, or document asserts about the runtime or the
platform must be **measured against the actual tree/runtime and recorded with the command that
measured it** — never inferred from documentation, naming, or reasoning. Two specific obligations:

- **Runtime API surface.** Before writing file-access or process logic in a workflow script, verify
  and state the available primitive list in the REQ Assumptions. The Claude Code workflow runtime
  exposes no `fs`, no `process`, no `import()`, no `fetch` (see `DECISIONS-plugin-distribution.md`).
- **Every supported platform, separately.** Green on one platform says nothing about another when
  the shell dialect or the filesystem differs. Two production defects in this repo were invisible on
  macOS and fatal on Linux: `${#ARR[@]:-0}` (not a defaulting expansion — bash 3.2 tolerates it,
  bash 5 aborts the script as `bad substitution`), and a bare inode-number comparison used as an
  unlink-vs-in-place oracle (APFS allocates monotonically, ext4/overlayfs recycles a freed number
  immediately). Reproduce the other platform locally — a non-root `node:20` container for Linux —
  rather than iterating through CI pushes.

A document that asserts a mechanism which does not exist is a defect even when no test encodes the
claim: the next reader acts on it.

**Origin:** promoted 2026-07-29 from LEARNINGS of `orchestrate-dev-workflow` (`fs.existsSync` written
into TSPEC v1.0 for a runtime that exposes no `fs` — DEC-ODW-03 records it as a draft error; the
open item asked for exactly this constraint) and `pdlc-workflow-distribution` (a whole blocking-finding
class across the 16 REQ rounds was "a measured platform fact contradicting a stated predicate";
codebase F-15/G-04 found a `.gitignore` rationale false twice over at four sites; and the two
Linux-only failures above).

**Applies to:** REQ Assumptions, TSPEC, PLAN, implementation, all reviews

---

## DC-03: Every load-bearing assertion is falsified before it is trusted

**Constraint:** An assertion is **load-bearing** when its failure would be the only signal of a
defect. Every load-bearing assertion must pass the falsification cycle, and the cycle must be
recorded in the feature's `FALSIFICATION-LEDGER.md`:

1. **Name the mutation in writing before the run** — which line, changed to what.
2. Observe it **red**, and record the test ids that went red.
3. Revert and re-verify **green**.
4. An assertion with **no nameable mutation** is filed as a **Residual** with its reason. It does
   not count toward the property total and is not reported as covered.

**The domain is every load-bearing assertion, not the enumerated property set.** This is the
correction the evidence forces: `pdlc-workflow-distribution` applied the ledger rigorously to all 63
`PROP-*` properties and it worked — yet every dead oracle found in Phase CR and Phase DOD was
*outside* that enumeration, because nothing obliged anyone to falsify an assertion with no `PROP-*`
id. The four that were dead: the artifact-freshness gate the entire "rebuild `dist/` in the same
commit" discipline rests on (run only on an already-fresh tree, asserting exit 0 — neutralising both
staleness assignments left all 997 tests green); the run-wide skip comparator (described in the PLAN,
never written, and structurally vacuous even where the PLAN put it); exemption clause (iii) (shadowed
by clause (i), so never decisive); and a release-checklist existence check.

Corollaries with independent evidence:

- **A test double for a gate is canonical, never ad-hoc.** A per-test stub silently diverges from the
  real component's return protocol and produces false passes. Any entity acting as a gate gets one
  named double at a named path, imported by every test site, with a PROPERTIES contract property
  prohibiting per-test equivalents.
- **"Correct by reasoning" is not green.** A `trap 'exit 0' ERR EXIT` arm was correct for the right
  reason and still had no detector — reverting the `EXIT` arm left all 8 tests of the suite added to
  close that very finding green.
- **A rationale pinned by a comment is not pinned.** A 16-deep probe list had a 1-deep fixture, so 15
  entries were untested, and the gate's whole rationale lived in a comment rather than an assertion.

**Origin:** promoted 2026-07-29 from LEARNINGS of `pdlc-workflow-distribution` (§4a — "non-vacuity is
the dominant defect class in this codebase"; the ledger discipline and its four escapes) and
`orchestrate-dev-workflow` (ad-hoc guard-agent stubbing rejected in favour of a canonical
`createGuardAgentDouble` per DEC-ODW-03, for the same false-passing reason).

**Applies to:** PLAN, PROPERTIES, implementation, DoD, all reviews

---

## DC-04: An oracle is a pure function of an injected root

**Constraint:** An oracle whose root is **ambient** — `process.cwd()`, an `import.meta.url`-relative
path, an environment-derived location — cannot have a green fixture *and* a red fixture in one
process, so every acceptance test written for it is **one-directional**: an oracle that is
*unconditionally* red satisfies all of them, and so does one that is unconditionally green.

State each oracle as a pure function of an injected `root` argument, such that two roots can be
probed in one process without interference and both directions are constructible. Write both
directions.

**Origin:** promoted 2026-07-29 from LEARNINGS of `pdlc-workflow-distribution` (six FSPEC rounds
converged on this: TE FSPEC v1 F-10 found the one-directional tests, v2 F-19 found the cause — the
oracles were not stated as functions of an injectable root — and the structural fix was respecifying
`coveredViolations(root)`, `packagingViolations(root)`, `advertisedVersionViolation(root)`).
Corroborated by `orchestrate-dev-workflow`, whose ad-hoc stubs failed the same way from the other end.

**Applies to:** FSPEC, TSPEC, PROPERTIES

---

## DC-05: Every named behavioural branch has an acceptance test at FSPEC

**Constraint:** For every named behavioural branch in the FSPEC — each error flow, each explicitly
conditional path (PASS/FAIL, skip/full, crash/non-crash, timeout/no-timeout, enabled/disabled) — an
acceptance test must exist in the FSPEC's test section. **A branch with no AT is a High finding.**

This is the highest-leverage review debt in this pipeline, and it is the one pattern that has
recurred *verbatim* on every occasion the discipline lapsed. Missing ATs at FSPEC do not stay at
FSPEC: each becomes a PROPERTIES gap or an implementation coverage gap, and the gap surfaces at a
phase where it is far more expensive.

**Origin:** promoted 2026-07-29 from LEARNINGS of `orchestrate-dev-workflow` (§4a — TE FSPEC reviews
across all 5 iterations were dominated by this single pattern, with Low carries still open at
approval; then §6a, where adding Phase PUB without the discipline reproduced the exact predicted
failure — zero `AT-SHIP-*` tests for 9–10 behavioural branches — which the LEARNINGS itself calls
"strong validation of §4a as a standing risk, not a one-off") and `pdlc-workflow-distribution`.

**Applies to:** FSPEC authoring, `te-review` of FSPEC

---

## DC-06: A remediation is verified by mutation, not by reading the diff

**Constraint:** Confirming that a review finding, DoD finding, or code-review remediation actually
landed requires **re-running the falsification cycle on the fix** (DC-03). Reading the diff or the
commit message is not verification. A remediation row must record the mutation used and the test ids
that went red.

The specific hazard this closes is a **fix for a broken oracle that is itself a broken oracle**: a
High finding was remediated through a JSONL sink no test touched, which fires on no non-root runner,
so two of the comparator's three clauses evaluated over an empty record set every run — and the sink
swallows every error by design. Reading that diff would have passed it. Mutation caught it.

**Origin:** promoted 2026-07-29 from LEARNINGS of `pdlc-workflow-distribution` (DoD round 2 confirmed
7 of 10 fixes by mutation rather than by reading, which is how DoD-11 was found; Phase CR round 2 did
the same and found G-02 — "reading the diff would have passed both").

**Applies to:** `dod-verify`, all reviews, implementation

---

## DC-07: Work that skips a pipeline phase inherits zero review coverage

**Constraint:** Anything added to a feature outside its pipeline run — a phase appended after the
original PDLC cycle, or a commit landed on the feature branch during an open review window — has
**no review coverage at all**, and "tests pass" is not a substitute. Two obligations:

- **A phase or capability added after the cycle** must get its own mini cross-review cycle over the
  delta (REQ → FSPEC → TSPEC → PROPERTIES). An unreviewed addition whose tests were written by the
  same pass that wrote its code has correct happy-path behaviour and silent gaps at exactly the
  boundaries a fresh reviewer probes: timeout caps, skip paths, injection seams, traceability rows.
- **An out-of-band commit during an open review window** must be either (a) attributed to the feature
  and put through the phase it skipped, or (b) moved to the branch of the queue row that owns it.
  **Record the decision either way.** Never resolve the resulting document falsification by deleting
  the out-of-band change to make the specs true again. Prefer recording the correction in a
  **long-lived operator-facing document** (the queue) over the feature's spec documents, which do not
  survive Phase H.

**Live open instance:** the 206-line `.github/workflows/pr-tests.yml` landed out-of-band in `3ef6ac7`
during `pdlc-workflow-distribution`'s DoD round 3. It passed no pdlc phase and remains unspecified
and unreviewed even though it now demonstrably works. Tracked as DoD-15, awaiting human disposition.

**Origin:** promoted 2026-07-29 from LEARNINGS of `orchestrate-dev-workflow` (§6 — Phase PUB was
added after the harvest and shipped with five High-severity gaps that a retroactive mini-cycle
surfaced; §6d states the rule) and `pdlc-workflow-distribution` (§4c — one out-of-band commit made 11
statements across 5 documents false in the present tense, partially discharged a deferral whose
successor row still carried the old justification, and changed the next phase's gate under the
feature's feet).

**Applies to:** all phases, `dod-verify`, queue hygiene

---

## DC-08: An unresolved item needs a named successor surface, not prose intent

**Constraint:** An accepted residual, a declared deferral, a non-goal, or a Low finding carried
across rounds must be bound to a **named successor surface** — a queue row, a hand-off row, or a
follow-up REQ — not to prose. "This will change when X" with no row is read downstream as an
unhandled deferral.

Two specific rules:

- **Name the non-goal and its reason where the next reader looks.** A deliberate non-goal that is
  named, justified, and recorded does not read as a gap. `pdlc-workflow-distribution`'s deferral
  check passed three DoD rounds running *because* D-DIST-01/02/03/05/07 were bound to queue row 6 and
  D-DIST-06 to row 7.
- **Low-carry threshold.** A Low finding that survives **3 or more rounds** unresolved is escalated
  to a named surface. Individually each is correctly non-blocking, but the cumulative effect is that
  "Approved with minor changes" routinely ships 3–5 known deficiencies that accumulate across the
  pipeline and are never resolved.
- **A coverage floor knowingly unmet** records the mechanism and the mutation evidence, not just the
  number (see DC-10).

**Origin:** promoted 2026-07-29 from LEARNINGS of `pdlc-workflow-distribution` (PM TSPEC v2 F-03; the
three-round deferral-check pass; and the inverse case in §4c, where a row existed but its description
was false) and `orchestrate-dev-workflow` (§4f — four Low findings persisted 3–5 iterations, one of
them `OQ-05` for all 5, which is the open question `pdlc-workflow-distribution` finally answered).

**Applies to:** REQ, TSPEC, PLAN, all reviews, queue hygiene

---

## DC-09: A REQ stays at requirements altitude, and carries its own stopping rule

**Constraint:** A REQ states user need, scope, priority, and phasing. It does **not** specify trace
grammars, fault-injection token vocabularies, fixture construction, coverage floors, emitter
escaping, or property-generation axis tables — that material belongs to FSPEC, TSPEC, and PROPERTIES.
A REQ containing it has left its layer.

The review loop must therefore observe these stopping conditions:

- A round whose blocking findings are **all** implementability or oracle-falsifiability defects — none
  contesting user need, scope, priority, or phasing — means the REQ has met its bar. **Approve it and
  move the findings downstream** as named entry obligations for the receiving phase.
- A finding of the form "this AC has no oracle" must be closable by **deferring** the oracle to TSPEC,
  not only by writing one into the REQ. Otherwise the finding is closable only by adding prose that
  the next round reviews — the fix-begets-finding loop.
- **Two consecutive rounds with a non-decreasing blocking count is a fixed point, not slow
  convergence.** A round in which the document grows while the count does not fall is stronger
  evidence of the same. Distinguish plateau from **churn**: a non-decreasing count is not a fixed
  point when all prior findings closed and the new blockers are defects introduced by the latest
  revision — but say so explicitly and pre-commit to escalating if the next round does not close them.
- **Paste the stopping rule into the artifact under review.** This is the part that made the
  difference and the part that is easy to get wrong. A rule living only in a constraints file or a
  method document nobody loads does nothing; the same rule written into the REQ changed both
  reviewers' behaviour immediately — they cited it by name in all four converging rounds to justify
  routing findings downstream.

**Origin:** promoted 2026-07-29 from LEARNINGS of `pdlc-workflow-distribution` (§1a — the REQ loop hit
the 5-iteration ceiling **twice**, 16 rounds, blocking counts `9→12→11→12→7→7→10→10→8→9→9` while the
document grew 1,907→3,642 lines; **not one** of the 16 rounds' blocking findings contested user need,
scope, priority, or phasing. Reviewer discipline was not the cause — §4e re-tested that hypothesis
and found two strong reviewers and a responsive author all doing their jobs correctly, which is
precisely why the fix must be structural).

**Applies to:** REQ authoring, `pm-review` / `se-review` / `te-review` of REQ

---

## DC-10: The PLAN owns what downstream phases would otherwise invent or omit

**Constraint:** Each of the following belongs in the PLAN, named concretely, because the evidence is
that when the PLAN omits it the next phase either invents it inconsistently or silently drops it:

- **Test infrastructure per property.** For every Integration-level property in PROPERTIES, the PLAN
  names the fixture or harness that makes it runnable. For every canonical test double mandated by a
  DECISIONS entry, the PLAN names the file path and export signature and carries an AC prohibiting
  per-test ad-hoc equivalents.
- **`Testability:` on every decision.** Every DECISIONS entry carries a `Testability:` field, even if
  one sentence. A decision that forecloses or constrains a testing approach with no testability note
  is a **Medium** finding at review.
- **A lifecycle disposition for every tracked artifact the PLAN introduces.** One line: harvested and
  deleted, or deliberately retained and why. Phase H deletes only `CROSS-REVIEW-*` and `CODE_REVIEW-*`
  and the guard hook watches only those two patterns, so anything else sits in the feature directory
  forever with no way for a future reader to tell live signal from spent scaffolding.
- **Path-scoped halt-state recovery.** A recovery command in a multi-row uncommitted PLAN is scoped to
  the paths that row touched — **never `git checkout -- .`**, which destroys earlier rows' landed work.
- **A "why" column on any coverage floor knowingly unmet**, with the mutation evidence. Two legitimate
  reasons have appeared: subprocess execution (istanbul cannot attribute a child process) and
  fixture-construction error paths in test helpers that were never in scope. Both are fine; neither was
  written down, so every round re-litigated them. A floor plus a short list of recorded, evidenced
  exemptions costs two lines and saves a round — and stops the next reader either panicking at a bare
  39% against a stated 85% or weakening the test to move the number.
- **The full PROPERTIES document in the implementing agent's context**, not only the PLAN task table.

**Origin:** promoted 2026-07-29 from LEARNINGS of `orchestrate-dev-workflow` (§4c missing `Testability:`
on 3 of 4 decisions, cascading into PLAN and PROPERTIES gaps; §4d both PROPERTIES rounds found test
infrastructure the PLAN should have specified; §4e implementation skipped 3 High-severity
PLAN-tasked test-infrastructure items, likely because the dispatched agents lacked PROPERTIES in
context) and `pdlc-workflow-distribution` (§4g the ledger's missing disposition, PM PLAN v2 F-05; SE
codebase v1 F-09 the `git checkout -- .` recovery; §4b coverage floors with no "why").

**Applies to:** PLAN authoring, DECISIONS, `se-review` / `te-review` of PLAN, agent dispatch

---

## DC-11: Sibling oracles called from one checklist share an error contract

**Constraint:** Oracles invoked in sequence from a single checklist must agree on their error
contract — all throw, or all return a named skip reason. They cannot differ, because a throw in the
first aborts before the second runs, and the checklist then reports a partial result as a complete
one.

**Origin:** promoted 2026-07-29 from LEARNINGS of `pdlc-workflow-distribution` (in one commit,
`advertisedVersionViolation` was ruled must-not-throw while `packagingViolations` still threw
`TypeError` on `null` / non-object rows, and the release checklist calls them in sequence).

**Applies to:** TSPEC, implementation, `se-review`

---

## DC-12: A document-drift false positive is fixed by rephrasing the document

**Constraint:** When an oracle that scans documents reports a false positive, the sanctioned fix is
to **rephrase the document**, or to fix the oracle's **self-reference**. Never narrow the pattern and
never widen a frozen exemption set — both permanently blind the scan, and the blinding is invisible
afterwards.

Enforce it mechanically, not by convention: assemble pattern strings from fragments so the oracle
does not match its own source (provably not a narrowing when each assembled value is byte-identical
to the literal it replaces), and make the exemption set a frozen literal whose **set-equality and
cardinality are asserted**, so widening it is itself a red test.

**Origin:** promoted 2026-07-29 from LEARNINGS of `pdlc-workflow-distribution` (R-10 / TE F-10; a
fifth `EXEMPTIONS` entry was proposed and rejected because it would have permanently blinded the scan
to two real code files. Every DoD round and both codebase rounds checked this specifically, "because
that is the failure mode this project has form for"). Already encoded in
`pdlc/workflows/lib/document-oracles.mjs`.

**Applies to:** implementation, DoD, all reviews

---

## DC-13: Scope-tag accurately — an untagged repo-wide finding never reaches consolidation

**Constraint:** Every cross-review finding carries a `Scope:` tag, and a finding that names a
repo-wide mechanism, a sibling skill, or the pipeline itself is tagged `Process` or `Cross-Feature` —
never `Local`. The tag is the routing mechanism: `harvest-learnings` collects by scope and
`consolidate-learnings` promotes what it collects, so a mis-tagged finding is a finding that reaches
nothing, however many times it is correctly diagnosed.

The cost is measurable. Of 62 cross-reviews on one feature, only ~13 carried a `Cross-Feature` tag and
~18 a `Process` tag; the REQ rounds tagged almost everything `Local` even where the finding named a
repo-wide mechanism. The clearest instance is also the most expensive: the loop-harness iteration-index
defect was correctly diagnosed and correctly routed for **15 consecutive rounds** and produced **zero
code change** — it appears in one reviewer's files as `Process` and in the other's only as an untagged
preamble note. Tag under-use is a plausible reason the routing never fired.

**Origin:** promoted 2026-07-29 from LEARNINGS of `pdlc-workflow-distribution` (§4f, §1b). Promoted on
a single feature's evidence because it is an invariant of this consolidation mechanism itself: the
under-tagging is what suppresses the second occurrence that would otherwise justify promotion.

**Applies to:** all reviews, `harvest-learnings`
