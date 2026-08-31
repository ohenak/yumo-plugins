# DECISIONS — test oracle mechanics

Mechanical facts about the test tooling in this repo that determine **where** an assertion can live and
still be able to observe what it claims to observe. Distinct from `DOMAIN-CONSTRAINTS.md` DC-03/DC-04,
which state the *discipline*; these are the tool behaviours that make a well-intentioned assertion
structurally vacuous regardless of discipline.

Promoted by `/pdlc:consolidate-learnings` on 2026-07-29. Read by `se-author` (PLAN) and `te-author`
(PROPERTIES).

---

## DEC-ORACLE-01: A run-wide assertion cannot live at module level

**Decision:** An assertion that must observe **the whole test run** belongs in `globalTeardown` or a
custom reporter. It cannot live in a module-level structure in a test file.

**Rationale:** jest gives every test *file* its own module registry, and may fork workers. A
module-level set can therefore only ever hold that file's own contributions, so a "every registered X
is a member of inventory Y" check over such a set is **trivially true forever** — vacuous by
construction, not by oversight. The `pdlc-workflow-distribution` skip comparator was specified in the
PLAN against a module-level set and would have been vacuous even had it been written where the PLAN
said (DoD-02).

**Consequence for reading test output:** `globalTeardown` failures print **after** jest's summary and
are **not reflected in it**. Judge a run by its **exit code**, never by the summary line.

**Testability:** a run-wide check placed in `globalTeardown` is itself load-bearing and needs its own
falsification (DC-03) — and its transport needs one too. DoD-11 is the cautionary case: the record sink
feeding such a check swallowed every error by design and no test touched it, so a silently-stopped
sink would have left the run green with the check evaluating over an empty set.

---

## DEC-ORACLE-02: A subprocess is not instrumented — record it, never work around it

**Decision:** When a test harness deliberately spawns the code under test as a **child process**,
istanbul cannot attribute its execution, and the coverage number for that module will sit below the
floor permanently. This is recorded with its evidence — the mutations that go red and the test ids —
and the floor exemption is written down (DC-08, DC-10).

**Explicitly rejected:** adding an in-process duplicate of the subprocess logic to move the number.
`build-runtime.mjs` sits at 39.13% branch against an 85% floor while its branches are genuinely bound
(mutation reds 4 tests). Duplicating the `--check` logic in-process would have raised the number while
testing a copy of the code rather than the code, and deleting the subprocess harness to move the number
would have removed the only test that exercises the real invocation path. **Do not delete the
subprocess harness to move a coverage number.**

**Rationale:** for shell scripts and CLI entrypoints, the subprocess *is* the contract — exit codes,
stderr, argv handling, and the execute bit are only observable through a real spawn.

**Origin:** `pdlc-workflow-distribution` DoD rounds 2–3.

**Testability:** self-referential — the evidence *is* the mutation record. A floor exemption with no
recorded mutation is not an exemption, it is an unexplained number.

---

## DEC-ORACLE-03: A gate gets one canonical test double at a named path

**Decision:** Any entity acting as a **gate** — returning a structured ok/error response that callers
branch on — has exactly one test double, defined at a path named in the PLAN with a stated export
signature, imported by every test site. Per-test ad-hoc stubs are prohibited, and the prohibition is
carried by a PROPERTIES contract property rather than by convention.

**Rationale:** an ad-hoc stub silently diverges from the real component's return protocol, so the test
passes against a contract the production code does not implement. The divergence is invisible: nothing
fails.

**Origin:** `orchestrate-dev-workflow` DEC-ODW-03 (`createGuardAgentDouble`), reached via TE review.
Generalised here because `pdlc-workflow-distribution` hit the same class from the other direction — its
harness centralises `makeToolDir` / `sandboxEnv` / `runScript` precisely so no suite constructs its own
environment, and the one place a fixture was built ad hoc (a 1-deep fixture against a 16-deep probe
list) left 15 branches untested.

**Testability:** the prohibition is itself falsifiable — a PROPERTIES property asserting the canonical
double is the only one in use goes red when a suite introduces a local equivalent.

---

## DEC-ORACLE-04: When spec and code disagree, ask which error is more expensive to live with

**Decision:** A spec/code divergence is not automatically resolved in favour of the code. Ask which
error is more expensive to live with, fix that side, and then **widen the property to the compositions
where the divergence is actually observable**, plus a `not.toBe` pinning the wrong value out.

**Worked example** (named "the strongest fix in the set" by the round-2 reviewer): production's
`supersedingState` held a post-copy value while every other field of the same record was post-run.
Moving the FSPEC to match production would have made one field mean something different from its
neighbours — the more expensive error. **Production was moved instead**, the property was widened to
the two fault compositions where the two passes genuinely diverge, and four tests now go red on
removal.

**Related:** "no *behavioural* detector is constructible" does not imply "no detector is
constructible". Where no observable divergence exists on the available platform, fall back to a
**mechanism** detector — asserting the code sets the thing (e.g. that C1 exports `LC_ALL=C` under an
injected caller locale) is often one line, where proving the downstream collation change is unbuildable.

**Origin:** `pdlc-workflow-distribution` Phase CR adjudications, both upheld by the round-2 reviewer.

**Testability:** the widening is the testability — a divergence resolved without widening the property
to an observable composition leaves the same hole under a corrected value.

---

## DEC-ORACLE-05: A file-ownership manifest is reconciled against `git ls-tree`, not against prose (candidate)

**Context.** Recorded per `POSTMORTEM-PR-pdlc-learnings-injection.md` (2026-08-21) Recommendation
item 9. The PLAN's §File-ownership manifest was amended from an erratum's routed list ("four new
files, two second writers") instead of from the commit it described; `git show --name-status`
listed 45 paths, and every High in the halting round was a count a single `git` command settles.
This was the third document on that branch to carry a stale count of a set `git` can enumerate.

**Decision (proposed, pending promotion).** A manifest that claims completeness over the tree is
populated and re-verified **from the tree**: reconcile its rows against `git ls-tree` (or
`git show --name-status <sha>` for a commit-scoped amendment) over the feature's path globs, and
treat a tracked file matching the globs with no row as a defect. Propose the mechanical form as an
engine-side check. `pdlc/workflows/__tests__/learningsSuiteMap.test.js` already does the
directory-closure version of this for suites; the manifest version is the same idea one layer up.

**Testability:** the check is one shell command per claim today (prompt-level); the engine-side
oracle is the promotion target for `/pdlc:consolidate-learnings`.

---

## DEC-ORACLE-06: Byte-identical text from two review lenses is a generator signature, not independent agreement

**Decision.** When two review lenses (e.g. author-facing and reviewer-facing) emit byte-identical
finding text, that identity is evidence of a **shared generator**, not of two independent judgments
converging. A synthesized finding fed back into a downstream round must be marked
**machine-synthesized**, and downstream consumers must never treat two concurring machine-synthesized
judgments as independent corroboration.

**Rationale.** `pdlc-engineering-loop`'s Phase PR halted after 6 iterations of synthesized findings
being fed back to the author as if they were fresh reviewer judgment, inflating the apparent
consensus. `pdlc-learnings-injection` produced 6 consecutive approving rounds with zero `FINDING:`
lines — a fail-closed class the grammar gate should have caught, since an approving round with no
findings and no `FINDING:` line is a different thing from a round that actually re-derived its own
verdict.

**Origin.** Promoted 2026-08-27 from LEARNINGS of pdlc-engineering-loop (Phase PR halt: 6 iterations
feeding synthesized findings back to the author) and pdlc-learnings-injection (zero `FINDING:` lines
across 6 approving rounds — a fail-closed class).
