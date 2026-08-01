---
feature: pdlc-rcv-finding-quality
ready: true
depends-on: [pdlc-rcv-budget-stop]
---

# REQ — pdlc-rcv-finding-quality

| Field | Value |
|---|---|
| Shared baseline | `docs/_constraints/pdlc-rcv-baseline.md` — the measured run, the non-convergence analysis, the measured facts `M-*`, the declared thresholds and the shared non-goals `N-*`. **Read it first.** Facts are cited by id (`M-6a`) and are not restated here. |
| Shared catalogue | `docs/_constraints/pdlc-rcv-catalogue.md` — the family vocabulary (§1), the closed catalogue `S-1 … S-17` (§2) and the run-report row schema (§3). Terms and ids are used by reference and never restated. |
| Predecessor | `docs/discarded/pdlc-review-convergence/REQ-pdlc-review-convergence.md` v1.8 (**superseded 2026-08-01**) — this REQ carries its REQ-RCV-05 and REQ-RCV-06 unchanged in substance. |
| Siblings | `docs/pdlc-rcv-budget-stop/REQ-pdlc-rcv-budget-stop.md` (REQ-RCV-01) — **the dependency**; `docs/pdlc-rcv-fixed-point-stop/REQ-pdlc-rcv-fixed-point-stop.md` (REQ-RCV-02); `docs/pdlc-rcv-panel-topology/REQ-pdlc-rcv-panel-topology.md` (REQ-RCV-03, REQ-RCV-04) |
| Upstream | `docs/completed/pdlc-review-loop-hardening/POSTMORTEM-R-pdlc-review-loop-hardening.md` (v1.0) root cause 1 and recommendations R-5, R-6; operator direction of 2026-07-29 |
| Downstream | `FSPEC-pdlc-rcv-finding-quality.md` |
| Targets | a new library under `pdlc/workflows/lib/`; the three review SKILLs (`pm-review`, `se-review`, `te-review`) and the three author SKILLs (`pm-author`, `se-author`, `te-author`). **No change to `pdlc/workflows/orchestrate-dev.js` is required by AC-6**; AC-5.4's extraction is the one loop-side change. |
| Citation baseline | Commit **`9486c81`** on `main`, per the shared baseline. Citations are repo-root-relative and name the enclosing symbol and a distinctive literal. Re-baselining is a mechanical fix, not a finding. |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude + operator | 1.0 | 2026-08-01 |

## 1. Problem

This REQ carries the two defects of the shared baseline's §1.2 that are about **what a finding is allowed to be**:

- **P-3 — findings that only a measurement can close are filed as blocking prose findings.** The primary root cause. Generator classes A and B never closed across five rounds because both
  turn on properties of the workflow runtime that nobody had measured. Every candidate answer was a guess about unobservable behaviour, every guess was falsifiable by a
  reviewer-constructed scenario, and the author's only moves were to guess differently or to convert the defect into an accepted risk. That process has **no fixed point** below the point
  where the fact gets measured. The measurements were cheap. They were never the REQ's job — and filing them as blocking REQ findings is what made them the REQ's job.
- **P-4 — mechanically checkable defects consume review rounds.** `file:line` citation accuracy was filed at round 1, answered with a dedicated `Citation baseline` header row and a
  symbol-plus-literal drift-proofing convention, and *reappeared at round 5* as two off-by-two line numbers **at the very sha the header row named**, plus a function cited in call form
  that does not exist at HEAD. POSTMORTEM R-6 already ruled it *"verifiable by a script"* that *"should never consume a review round again"*. It then consumed part of every round anyway.
  That is sufficient evidence that prose discipline does not fix it. The remedy is a program.

Sibling `pdlc-rcv-budget-stop` carries the stop; `pdlc-rcv-panel-topology` carries the panel and the revision-size bound.

## 2. Users and value

| ID | User story |
|---|---|
| **US-03** | *As the operator*, I want the run report to tell me what remains unsettled, so that I can act on a halt without reading ten cross-review files. |
| **US-04** | *As an authoring agent*, I want a clear rule for which findings I am expected to answer in prose and which I must not, so that I stop producing 25 KB of speculative mechanism per round in answer to questions that only a measurement can close. |
| **US-06** | *As a maintainer of these documents*, I want `file:line` citation accuracy checked by a program, so that a class of defect a machine can find never consumes a human or agent review round again. |

**Value.** This REQ is the only one of the three that attacks the *generator* of findings rather than the loop around them. Its saving is not a dispatch count: it is the removal of a
whole class of round that cannot converge (P-3) and a whole class of finding that never should have been blocking (P-4). Neither is claimed as a percentage, because neither was isolated
in the measured run; what is claimed is that both classes become **non-blocking and visible** rather than blocking and invisible.

**Operator-visible surfaces.** A `## Measurement Required` section in the cross-review, carried into the run report and counted in the phase outcome line; a CLI the operator can run by
hand, with an exit code and a list of bad citations.

## 3. Prerequisites

| # | Dependency | Resolution form | Gating logic |
|---|---|---|---|
| **BL-01** | Feature `pdlc-review-loop-hardening` merged to the default branch | Directory `docs/completed/pdlc-review-loop-hardening/` exists on the default branch with that feature's artifacts. **Satisfied at `9486c81`**. | Must hold at HEAD before FSPEC authoring |
| **BL-05** | `pdlc/workflows/lib/` exists as a home for non-bundled production libraries | Directory present, containing `document-oracles.mjs` (M-6a) | Must exist at HEAD — AC-6's library is a sibling of that file and inherits its "not in the bundle" classification (M-6b) |
| **BL-10** | `scanLines` — the shipped helper that scopes a line scan to **outside fenced blocks**, so *"a quoted example anchor cannot fabricate an ambiguity"* | Symbol present (M-7d) | Must exist at HEAD — AC-6.4's exempt-region rule adopts that existing rule rather than inventing a second one |
| **BL-11** | The workflow test suite is jest under `--experimental-vm-modules`, and `build-runtime.mjs` is import-unsafe | M-6c, M-6d | Must hold at HEAD — AC-6.7 adds no tooling, and AC-6.2 is stated because the builder in this same repo already violates it |

### 3.1 One cross-REQ prerequisite

| # | Owed by | What this REQ needs | Behaviour until it ships |
|---|---|---|---|
| **X-04** | `pdlc-rcv-budget-stop` (the `depends-on`) | AC-5.5 states that `## Measurement Required` is **not** part of the cross-review completeness criterion, and that criterion is *"the trailing `## Verdict` section and its single `VERDICT:` line, plus the count trailer"*. The trailer clause is `pdlc-rcv-panel-topology` AC-3.4's; the reader that consumes it is `pdlc-rcv-fixed-point-stop` AC-2.7(b). | AC-5.5's exclusion is stated over whatever the criterion is at the time, and is unaffected by either. The dependency on `pdlc-rcv-budget-stop` exists so the family shares one definition of *unavailable* / *malformed* (`docs/_constraints/pdlc-rcv-catalogue.md` §1) and one report surface (§3), **not** because any AC here reads the window, the anchors or the panel. |

**This REQ is otherwise independent.** AC-5 is a SKILL change plus a section extraction; AC-6 is a standalone library and CLI with no caller inside the runtime bundle. Neither reads
`W`, the reset region, the anchors, or the panel shape.

## 4. This REQ's share of the closed catalogue

The family's closed catalogue lives in `docs/_constraints/pdlc-rcv-catalogue.md` §2, and its
vocabulary in §1; neither is restated here. This REQ **owns exactly one** of the seventeen ids —
**S-7**, the section heading `## Measurement Required`, emitted by the three review SKILLs and the
verifier (AC-5.2) and consumed by AC-5.4's extraction. Its receive side is total on every input,
which is why nothing downstream of the extraction is gated: absent or empty contributes nothing
and is never an error; an unparseable body is carried **verbatim** into the report under its round
and role; two or more such sections in one file are concatenated in document order. **FSPEC may not
add an eighteenth id to the catalogue.**

**AC-6's citation grammar is a second closed catalogue, of a different kind** — it classifies
*tokens inside a reviewed document*, not strings crossing a component boundary — and is fixed in
AC-6.4 as C-1 … C-4 with a total, accumulating receive side. It is named here so a reader looking
for this REQ's catalogues finds both.

## 5. Acceptance criteria

Two requirements. Every acceptance criterion is in Who / Given / When / Then form and is stated over an in-band observable named in the shared baseline §2.

---

### REQ-RCV-05 — Findings that require a measurement are routed, not answered in prose

**Priority:** P0 · **Source:** US-04, US-03 · **Depends on:** BL-01

**AC-5.1 — The test a reviewer applies.**
*Who:* a reviewer (full panel or verifier). *Given:* a finding they are about to file. *When:* they classify it. *Then:* if **resolving** the finding requires a measurement against the
real workflow runtime — a fact about what the runtime does that is not established at HEAD — it is **not** a blocking finding. The test is about the *resolution*, not the topic: "this
clause contradicts that one" is answerable from the document and blocks; "this clause depends on what an exhausted retry returns, which nobody has measured" is not answerable from the
document and does not block.

**AC-5.2 — Where it goes.**
*Who:* a reviewer. *Given:* such a finding. *When:* they write their cross-review file. *Then:* it goes in a section headed exactly `## Measurement Required` (S-7), one item per
finding, each naming: the fact to be measured, how it could be measured, and what it would settle. The section is **non-blocking** — it does not contribute to the `high`/`medium` counts
the fixed-point rule reads, and its presence alone never prevents an `Approved` verdict.

**AC-5.3 — Authors must not answer these in prose.**
*Who:* an authoring agent. *Given:* a `## Measurement Required` item on its document. *When:* it addresses the round's findings. *Then:* it **does not** invent a mechanism, choose an
unobservable, or convert the item into an accepted risk. It may record the item and its status; it may not resolve it. Answering such an item in prose is precisely the act that produced
R-9, R-10 and R-12 on the predecessor — three "resolutions" that name the failure the design tolerates rather than removing it.

**AC-5.4 — The loop carries them into the report.**
*Who:* the review loop. *Given:* a round's cross-review files. *When:* the round completes. *Then:* the loop extracts each file's `## Measurement Required` section and carries the items
into the run report, attributed to their round and role. The operator therefore ends every phase — converged or halted — with a list of the measurements the phase is waiting on, without
opening a cross-review file.

**An approval reached with items outstanding says so.** The phase outcome in the run report reads `approved, {n} measurements outstanding` when `n > 0`, and plain `approved` when `n =
0`. AC-5.2 makes the section non-blocking on purpose, but a terminal approval that leaves unsettled measurements recorded only inside a cross-review file is a state the operator should
see named. The count is a **report field only**: it is not an approval condition, changes no verdict, and never gates the phase.

**AC-5.5 — An absent section is normal.**
*Who:* the review loop. *Given:* a cross-review file with no `## Measurement Required` section. *When:* extraction runs. *Then:* it contributes nothing and is not an error. Most rounds
will have none. The section is optional and its absence is never a halt, a warning, or a completeness failure — it is **not** part of the cross-review completeness criterion, which
remains the trailing `## Verdict` section and its single `VERDICT:` line, plus the count trailer `pdlc-rcv-panel-topology` AC-3.4 adds (X-04).

**Receive side (DC-01 totality) for `## Measurement Required` (S-7):** absent ⇒ contributes nothing, never an error; present but empty ⇒ contributes nothing; present with a body the
loop cannot parse into items ⇒ the body is carried **verbatim** into the report under its round and role, never dropped and never an error; two or more such sections in one file ⇒ their
bodies are concatenated in document order. **There is no input on which extraction fails**, because nothing downstream of it is gated.

**Observability.** The presence and content of a named markdown section in files on disk; a list in the run report; one outcome string. Note the self-application: the shared baseline §5
names the two unmeasured facts this family declines to depend on, which is exactly what AC-5 asks every reviewer and author to do.

---

### REQ-RCV-06 — Citation accuracy is checked by a program

**Priority:** P1 · **Source:** US-06 · **Depends on:** BL-01, BL-05, BL-10, BL-11

**AC-6.1 — A new library, and where it lives.**
*Who:* a maintainer. *Given:* the repo. *When:* they look for the checker. *Then:* it is a module under `pdlc/workflows/lib/`, a sibling of `document-oracles.mjs` (M-6a).

**AC-6.2 — Import-safe.**
*Who:* anything importing it. *Given:* the module. *When:* it is imported. *Then:* **nothing happens** — no filesystem access, no argument parsing, no output, no process exit. Every
export is a pure function of its arguments. This is the same discipline `document-oracles.mjs` states in its own header, and it is stated as an AC because `build-runtime.mjs` in this
same repo is *import-unsafe* and that has already cost a finding (M-6c). A module that acts on import cannot be unit-tested, and cannot be called from a second caller.

**AC-6.3 — A CLI entry.**
*Who:* a reviewer, an author, or a human at a terminal. *Given:* one or more document paths and a repo root. *When:* they run the CLI. *Then:* it reports every bad citation with the
file and line it was found at, what was expected and what was found, and exits **non-zero** if any citation is bad, zero otherwise. The CLI is a separate entry point from the library
(AC-6.2), not a side effect of it.

**AC-6.4 — The citation grammar is a closed catalogue, and the checker is total over it.**
*Who:* the checker. *Given:* a markdown document. *When:* it runs. *Then:* it extracts citations matching **exactly these forms, and no others**:

| id | Form | Example | Resolution |
|---|---|---|---|
| **C-1** | repo-root-relative path + `:` + line | `pdlc/workflows/orchestrate-dev.js:52` | the path, resolved against the repo root |
| **C-2** | repo-root-relative path + `:` + range | `pdlc/workflows/orchestrate-dev.js:2215-2217` | same; both endpoints checked |
| **C-3** | bare basename + `:` + line or range | `orchestrate-dev.js:1436` | **reported as a grammar defect, not resolved.** A basename is ambiguous under the repo root and the checker does not guess. |
| **C-4** | bare `:` + line or range, no path | `` `:1574` `` | **reported as a grammar defect, not resolved.** There is no anchor to resolve it against; "nearest preceding full path" is a heuristic that fails silently on the exact defect this checker exists to catch. |

**Range separator:** the ASCII hyphen `-` only. An en-dash range (`2215–2217`) is form C-3/C-4's sibling defect and is **reported as a grammar defect** with the fix ("use `-`") named.
One separator, stated in one place, so the document and the checker cannot disagree.

**Exempt regions: a quoted example is not a citation.** Before extraction the checker excludes two regions, and reports nothing from either:

1. **Fenced code blocks**, exactly as `scanLines` already excludes them so that *"a quoted example anchor cannot fabricate an ambiguity"* (M-7d). This REQ adopts that existing rule rather
   than inventing a second one.
2. **A table row whose first cell is an id in the C-1 … C-4 catalogue**, i.e. the catalogue's own `Example` column above. Such a cell is a *specimen* of a form, not a claim about a file.

Without exemption 2 this document is a permanent counter-example to its own rule: the C-3 and C-4 rows above contain the only two non-C-1/C-2 tokens in the file, they are illustrative
by construction, and AC-6.5 tells an author to fix reported items **without a round of discussion** — so an author following both ACs would delete the catalogue's examples and leave the
catalogue unable to show what it forbids. Exemption 2 is stated at REQ altitude, not left to FSPEC, because it decides the checker's output on a real corpus.

**Unparseable input is reported, never silently skipped.** Outside the exempt regions, a token that looks like a citation — any `:` followed by digits inside backticks — but matches
none of C-1 … C-4 is reported as `unparseable` with its file and line. The checker never fails, never throws, and never exits on a parse problem; it **accumulates**. This is the
receive-side totality DC-01 requires.

For each citation that resolves (C-1, C-2) the checker performs three checks:

| # | Check | Fails when |
|---|---|---|
| 1 | **Path existence** | the cited path does not exist under the repo root |
| 2 | **Line-range validity** | the cited line, or either end of the cited range, is beyond the end of the cited file, or the range is inverted |
| 3 | **Nearby symbol presence** | the citation's surrounding prose names a backticked symbol or literal that does not appear in the cited file within a tolerance window around the cited line |

**Why the grammar had to be fixed here rather than in the FSPEC.** Measured over v1.0 of the superseded parent, 3 citations were C-1, 13 were bare basenames and 14 were bare `:NNN` — so
a checker specified without this grammar would have reported the 13 as nonexistent paths and never seen the 14 at all, i.e. been false-positive or blind on ~82% of the corpus it exists
to check. The recurring P-4 defect lived precisely in those two forms. Every citation in this family's documents is normalised to C-1/C-2 and the headers state the convention; **C-3 and
C-4 remain in the catalogue as named defects** so that a document which drifts back to them is told so, rather than passing vacuously.

**Check 3's window has a stated direction.** It catches the defect that actually recurred — a line number that drifted by two while still pointing inside a real file — so the window
must be **wide enough that the motivating two-line drift passes on symbol presence, and narrow enough that a symbol belonging to a different function fails**. Concretely: materially
wider than 2 lines, materially narrower than a typical function's separation in this module. The exact value is a tuning parameter with no product consequence and remains an FSPEC
decision (§6, O-6); the **direction is fixed here** so the AC determines the outcome of its own motivating example.

**AC-6.5 — Output is mechanical fixes, not findings.**
*Who:* a reviewer. *Given:* the checker's output on a document under review. *When:* they write their cross-review. *Then:* bad citations are reported as **mechanical fixes** — a list
to be applied — and are **not** filed as blocking findings, do not contribute to the `high`/`medium` counts the fixed-point rule reads, and never prevent an `Approved` verdict on their
own. An author fixes them without a round of discussion. Both the reviewer SKILLs and the author SKILLs are amended to run the checker and to treat its output this way (O-9).

**AC-6.6 — Not in the runtime bundle.**
*Who:* the build. *Given:* the new library. *When:* `build-runtime.mjs` runs. *Then:* the library is **not** inlined into `orchestrate-dev.bundle.js` or `orchestrate-queue.bundle.js`.
It is the same class as `document-oracles.mjs` (M-6b): production code that runs under Node, called by SKILLs and by humans, never by the workflow runtime. The runtime's structural
constraints (no `import`, no `fs`, no `process`) therefore do not apply to it, and **it must not acquire a caller inside the bundle**.

**AC-6.7 — Tested by the existing suite.**
*Who:* CI. *Given:* the new library. *When:* `npm test` runs in `pdlc/workflows`. *Then:* the library's tests run with it, under the existing jest configuration and with no new tooling
or dependency (M-6d).

**AC-6.8 — Advisory, never a gate.**
*Who:* the pipeline. *Given:* a non-zero exit from the checker. *When:* a phase is running. *Then:* the pipeline does **not** halt. The checker's status is advisory: it produces a fix
list. Making it a gate would convert a mechanical nuisance into a pipeline halt, which is the opposite of the change (N-8).

**Observability.** A program, its stdout, and its exit code.

---

## 6. Declared thresholds

The shared table is `docs/_constraints/pdlc-rcv-baseline.md` §3. This REQ **owns** two of its rows and changes none of the others; a threshold used here and absent there is a defect.

| Name | Default | Note |
|---|---|---|
| `## Measurement Required` | that exact heading | S-7. Emitted by the three review SKILLs and the verifier (AC-5.2). Follows the existing `## Verdict` convention: an exactly-named top-level section the loop extracts. Deliberately **not** part of the completeness criterion (AC-5.5). |
| Symbol-proximity window (AC-6.4 check 3) | **±25 lines**, FSPEC may tune | Owner: the new `pdlc/workflows/lib/` module. AC-6.4 fixes the *shape* (presence within a window, not exact-line match), its reason, and its **direction** — wide enough that the motivating two-line drift passes, narrow enough that a symbol in a different function fails. ±25 lines is a stated default satisfying both bounds against this module's function sizes; **O-6 may change the number, not the direction**, and may not leave it unset. |

## 7. Non-goals and out of scope

The shared list is baseline §4; **N-1, N-2, N-4, N-5, N-7, N-9 and N-10 apply unchanged** and are not restated. Four bear directly on this document:

| # | Not in scope | Why |
|---|---|---|
| **N-3** | Changing the cross-review file grammar. | `## Measurement Required` is an **addition**, not a change: it is a section no existing reader looks for, and AC-5.5 keeps it outside the completeness criterion. The one grammar *change* in the family is `pdlc-rcv-panel-topology` AC-3.4's, not this REQ's. |
| **N-6** | Taking the two measurements the baseline §5 names. | They are genuinely worth taking, and they are not this REQ's deliverable. AC-5 is what stops them consuming review rounds in the meantime; it does not settle them. R-4 binds the successor. |
| **N-8** | Applying AC-6's checker as a merge or pipeline gate. | AC-6.8: advisory only. Making it a gate would convert a mechanical nuisance into a pipeline halt. |
| **N-13** | Deciding, mechanically, whether a reviewer applied AC-5.1's test correctly. | There is no oracle for "should this have been a measurement?" — R-5 accepts it as the family's weakest control. What *is* mechanised is the extraction (AC-5.4) and the report line, so a misrouted item is at least visible. A finding that AC-5.1 is unenforceable is **correct and known** — file it as Low. |

## 8. Downstream obligations

| # | Obligation | Owner |
|---|---|---|
| **O-6** | Specify the checker's **implementation and output format** against AC-6.4's closed grammar (C-1 … C-4), and tune the symbol-proximity window if ±25 lines proves wrong. **The grammar, the range separator, the exempt regions, the unparseable-input behaviour and the window's direction are not open** — AC-6.4 and §6 fix them. | FSPEC → TSPEC |
| **O-7** | Specify **how** the `## Measurement Required` section is located and rendered in the report, and where the `approved, {n} measurements outstanding` outcome string is composed (AC-5.2, AC-5.4). Its receive-side behaviour on absent, empty, unparseable and duplicated sections is fixed by AC-5.5 (S-7) and is not open. | TSPEC |
| **O-9** | Write the SKILL amendments: **(a)** the three review SKILLs — AC-5.1, AC-5.2 and AC-6.5; **(b)** the three author SKILLs — AC-5.3 and AC-6.5; **(c)** where the checker is invoked in each, and the statement that its output is a mechanical-fix list rather than a findings source. | FSPEC → implementation |
| **O-10** | Properties and tests for both requirements, including the negative cases named explicitly: an **absent** `## Measurement Required` section contributing nothing and **not** failing completeness; an **empty** one contributing nothing; an **unparseable body** carried **verbatim** into the report rather than dropped; **two** such sections in one file concatenated in document order; a terminal approval with `n > 0` rendering `approved, {n} measurements outstanding` and with `n = 0` rendering plain `approved`, with **neither** changing a verdict or gating the phase; and for AC-6, each of **C-3, C-4, an en-dash range and an unparseable token being *reported* rather than skipped or fatal**; **AC-6.4's own C-3/C-4 example cells producing no report item** (exemption 2) and a citation inside a fenced block likewise; a citation whose path does not exist, whose line is beyond end-of-file, and whose range is inverted each failing their check; **the motivating two-line drift passing check 3 while a symbol from a different function fails it** (the window's stated direction); a non-zero exit **not** halting the pipeline (AC-6.8); and the library **importing with no side effect** (AC-6.2) and **acquiring no caller inside the bundle** (AC-6.6). | PROPERTIES |
| **O-11** | If any workflow source changes for AC-5.4's extraction, rebuild `pdlc/workflows/dist/` in the same commit and honour the runtime constraints: no new `import` into the bundle, and **every injected IO call `await`ed**. AC-6's library must acquire no caller inside the bundle. | implementation |

## 9. Risks, assumptions and deferrals

| # | Assumption | If false |
|---|---|---|
| **A-4** | Reviewers can apply AC-5.1's test — "does resolving this require a measurement?" — consistently. | Findings are misrouted. Misrouting *toward* `## Measurement Required` weakens the loop; misrouting *away* from it reproduces the predecessor's failure. This is a prompt-quality risk with no mechanical control, and it is **the weakest of the family's six changes**. R-5. |

| # | Risk | Disposition |
|---|---|---|
| **R-5** | **AC-5.1, AC-5.2 and AC-5.3 are prompt clauses, so they are directive rather than enforced.** An agent that ignores them is not detected. | Accepted and stated rather than implied. AC-5's mechanical half is only the extraction (AC-5.4) and the outcome line, which at least make a routed item visible. A finding that AC-5 is unenforceable is **correct and known** — file it as Low (N-13). |
| **R-4** | **The two unmeasured runtime facts (baseline §5) remain unmeasured**, so the predecessor's generator classes A and B stay open. | Out of scope by N-6. AC-5 is what stops them consuming review rounds in the meantime; it does not settle them. Successor: `docs/pdlc-runtime-measurement-spike/REQ-pdlc-runtime-measurement-spike.md` (`ready: false`, no dependencies — it is measurable today), which carries both facts with a proposed method and what each would settle. |
| **R-10** | **The checker is advisory (AC-6.8), so a document can ship with bad citations.** | Accepted deliberately: P-4's cost was that citation defects consumed *review rounds*, not that they shipped. Moving them to a mechanical-fix list (AC-6.5) removes that cost whether or not every item is applied. Making the checker a gate is N-8 and is not asked for here. |
| **R-11** | **Check 3 is a heuristic and can be wrong in both directions** — a symbol legitimately absent near a correct line reports a false positive; a symbol that happens to appear inside a wide window hides a real drift. | Accepted, Low. The window's **direction** is fixed by AC-6.4 so the motivating case is determined, and the output is a fix list, never a gate (AC-6.8), so a false positive costs an author one glance. O-6 may retune the number against real corpora. |

**Deferrals and their binding.** R-4 and N-6 are bound to `docs/pdlc-runtime-measurement-spike/REQ-pdlc-runtime-measurement-spike.md`, which exists on this branch and is `ready: false`.
DC-08 asks for a **checkable successor surface**, not for scheduled work; adding a queue row remains an operator action.

## 10. Traceability

| Requirement | Baseline measured facts | Baseline defect | User story | Obligations |
|---|---|---|---|---|
| REQ-RCV-05 | *(no code seam — a SKILL change plus a section extraction; the extraction rides the existing per-round file read, M-3e)* | P-3 (the primary root cause) | US-04, US-03 | O-7, O-9, O-10, O-11 |
| REQ-RCV-06 | M-6a, M-6b, M-6c, M-6d; M-7d (the fenced-region scoping AC-6.4 adopts) | P-4 | US-06 | O-6, O-9, O-10, O-11 |

REQ-RCV-05 is **P0** — it addresses the post-mortem's primary root cause. REQ-RCV-06 is **P1** and the only P1 in the family: real but smaller, because the defect class it removes was
recurring and never blocking. There is **no ordering constraint between the two**, and none between this REQ and `pdlc-rcv-panel-topology`; the `depends-on` is `pdlc-rcv-budget-stop` so
the three documents share one definition of *unavailable* / *malformed* and one report surface (X-04).

**Round-by-round history is deliberately not restated here.** The nine review rounds that produced this material live in `docs/discarded/pdlc-review-convergence/CROSS-REVIEW-*-REQ-v{1..9}.md`
alongside the superseded parent; those files remain the record of which finding produced which clause. This REQ traces to the *measured facts*, not to the review history.
