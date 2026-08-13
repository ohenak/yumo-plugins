# Cross-Review: product-manager — DECISIONS

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-engine-distribution/DECISIONS-pdlc-engine-distribution.md` (v0.1/0.2, Phase T)
**Date:** 2026-08-13
**Iteration:** 1
**Scope:** Product lens only — requirements traceability, AC fidelity, scope compliance, and the
accuracy of the cost claims each rejected alternative is priced with. Grounded against HEAD:
every `file:line` in the document below was opened and checked.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Cross-Feature | DEC-EDIST-01's **"Verified cost"** for the relocation alternative is materially incomplete, and its citations point at comments rather than at the code that addresses the tree. See detail below. | R-5, C-4, NG-5 |
| F-02 | Medium | Local | DEC-EDIST-03 §4 Context attributes AC-5.2's criterion to **AC-5.1**: "the REQ asks for two things at once: `pdlc` runs the **latest** installed engine by default (AC-5.1)". At `REQ:397-405` AC-5.1 is the *pinned* criterion (project pinned to X while Y is latest ⇒ X executes, the run announces the pin, plus an injectable "newer version exists" probe). The "no pin ⇒ latest installed, and the absence of a pin is as visible as its presence" criterion is **AC-5.2** (`REQ:406-409`), which is cited nowhere in this document. The jointly-unsatisfiable argument against a single global install survives the correction untouched — AC-5.1's own wording ("X executes while Y is the latest installed") already forces side-by-side residency — so this is a citation fix, not a reasoning fix. Restate the pair as AC-5.2 + AC-5.5, keep AC-5.1 as the residency forcer, and the entry becomes traceable. | AC-5.1, AC-5.2, AC-5.5 |
| F-03 | Medium | Local | §12 accounts for **two of O-8's three** publish blockers and never says what became of the third. N-2 is labelled "O-8 blocker 3" (licence) and N-6 "O-8 blocker 2" (scope); blocker 1 is `"private": true` (`pdlc/engine/package.json:4`) — per FSPEC §9 Q-8, "the one npm itself refuses". It *is* decided (TSPEC §5.4's manifest table row `private → removed`, asserted by PF-3), but §12 is the table a reader consults for "what still blocks the first publish", and read alone it leaves the blocker set unaccounted. One clause — in the N-2 row or in §12's preamble — naming blocker 1 as closed by TSPEC §5.4/PF-3 closes it. | AC-3.1, FSPEC Q-8 |
| F-04 | Medium | Local | DEC-EDIST-04 claims the notice "is a catalogue entry (TSPEC §10.3), so `lib/catalogue.mjs`'s shipped registered-message set-equality **covers it without a bespoke test**". Verified at HEAD: the suite-wide catalogue row is bidirectional — forward (`__tests__/assert-suite-wide.test.js:165`) and reverse, "a registered id never emitted fails the step" (`:183`). So (a) registering the id with no test that *emits* it turns the gate **red**, i.e. an emitter is required work, not covered work; and (b) neither direction asserts the ignore-branch **trigger** (`devDeclared === false` **and** the variable set ⇒ discovery proceeds as if unset) or the **rendered text** — which is the entire operator-visible deliverable AC-5.6 specifies. TSPEC v0.2's own changelog already schedules "catalogue registration with emitters and paired with rendered-text assertions (§10.3, §12.4)", so the record contradicts its own mechanism. Fix: say the catalogue equality covers *registration*, and that the trigger and rendered text carry their own assertion. | AC-5.6, BR-8.1 |
| F-05 | Low | Local | Version cell disagrees with the changelog. The header row reads `| pdlc | Draft (Phase T) | Claude | 0.1 | 2026-08-13 |` while the changelog carries a **0.2** row whose content is present in the file (§1 retitled, §13 register added). The erratum protocol re-grounds downstream authors by diffing the upstream `Version` cell against the version they last approved against, so a cell that lags its own changelog silently defeats that diff. Bump the cell to 0.2. | Artifact convention |
| F-06 | Low | Local | DEC-EDIST-09 says "the shipped launcher carries **six** static imports (`pdlc/engine/bin/pdlc.mjs:22-30`)". HEAD has **nine** static imports spanning `:22-31` — three `node:` builtins (`:22-24`) and six local modules (`:26-31`); the cited window excludes `report.mjs` at `:31` and silently includes the builtins. The argument is unaffected (nine imports make the evaluation-order point stronger, not weaker), but this document stakes its authority on exact citation. Correct to "nine static imports (`:22-31`), six of them local". | AC-2.4 |

### F-01 detail

The entry prices relocating the modules under the package root as a "three-consumer edit, not a
`git mv`", naming `build-runtime.mjs`, `sync-workflows.sh` and `run.test.js:45-46`. Checked at HEAD:

- **A fourth consumer, and a safety-relevant one, is missing.** `MERGE_GUARD_DEFAULTS`
  (`pdlc/workflows/orchestrate-dev.js:47-52`) carries the literal `"pdlc/workflows/"` at `:49` —
  Phase MERGE's self-modification guard path set. Relocating `orchestrate-{dev,queue}.js` out of
  that prefix means a PR touching the workflow modules at their new path **no longer trips the
  guard**, i.e. the pipeline may auto-merge a PR that edits its own semantics. That consequence
  belongs in the entry, not just the file count.
- **A fifth: the guard set is pinned by a test.** `pdlc/workflows/__tests__/consolidationRoute.test.js:109`
  asserts the four-member set literally, so widening or re-pointing the guard is a second edit.
- **The two `build-runtime.mjs` citations are comments.** `:19` is the usage line of the file's
  header comment (`* Usage:  node pdlc/workflows/build-runtime.mjs [--check]`) and `:48-49` is the
  *generated banner* text. The code that actually addresses the tree by path is
  `:94-97` (`readFileSync(resolve(HERE, "orchestrate-dev.js"))` and siblings) plus the source-name
  arrays at `:531-533`. The banner strings at `:48-49` are separately pinned by
  `__tests__/runtimeBundle.test.js:593-595`, which is a further edit site.
- **Consequently the entry's own re-evaluation trigger is dead on arrival.** "A third consumer of
  `pdlc/workflows/` appearing (raises the relocation cost further)" describes a condition that is
  **already true at HEAD** — there are at least five — so the trigger can never fire and cannot
  serve as the signal it is written to be.

Why this is High rather than a citation nit: `pdlc-plugin-retirement` is named in this entry as the
feature that inherits the relocation, and this cost list is the checklist it will inherit. A
checklist that omits the merge-safety guard hands a downstream feature a silent regression. The
decision itself is unchanged — the true cost is *higher*, so deferral is if anything better
supported. What must change is the enumeration, the two comment-line citations, and the trigger
(e.g. "a **sixth** consumer" or, better, "any new literal `pdlc/workflows/` path outside the tree
itself", which is a condition an oracle could actually check).

## Questions

| ID | Question |
|----|---------|
| Q-01 | AC-5.1's "the run **announces** the pin" and AC-5.2's "the absence of a pin is as visible as its presence" are operator-facing halves of the pinning story. DEC-EDIST-07 settles `mode` reporting for `--version` and `doctor` only; DEC-EDIST-03 settles the ladder. Is the *run's* pin announcement (banner + report) purely TSPEC §6.4 mechanism with no decision in it, or is there a choice here (announce in the banner only vs. banner + report + commit rows) that a later reader would have to reconstruct? If the latter, it wants a line in DEC-EDIST-03. |
| Q-02 | AC-5.1's "a newer version exists" probe is required to be behind an injectable seam that never fails or blocks. DEC-EDIST-03 puts resolution in the launcher and hands off to the child. Which process observes the probe — the launcher (which knows the store) or the resolved child (which prints the report)? The answer is a decision about the launcher's surface, and it is not stated in either entry. |

## Positive Observations

- **The citations that are load-bearing are, with the F-01 exception, exact.** Spot-checked and
  confirmed at HEAD: `report.mjs:54`/`:110`; `run.mjs:52-55`, `:58-62`, `:80-91`, `:114-123`,
  `:160`, `:185-192`, `:196-203`; `skills.mjs:212`; `handshake.mjs:131-134`; `startup.mjs:319`,
  `:453`; `package.json:2`, `:6-8`, `:11` and the `^0.3.226` SDK pin; `bin/pdlc.mjs:208`, `:479`,
  `:489-491`, `:505`; `seam-contract.test.js:47-63` (seven dev members and five queue members,
  exactly as claimed); `run.test.js:45-46`; `cli.test.js:13,22`; `orchestrate-dev.js:7342`/`:7354`
  with consumption at `:6211-6212` and `:10655`; and — the one I most expected to be loose —
  `artifactPaths`' **sole** push site at `:11507`, returned at `:13088`. `pr-tests.yml` does carry
  five gate jobs and nine step-level `uses:`, so DEC-EDIST-10's job-level/step-level distinction is
  measured, not asserted. A decision record that survives this much checking is rare.
- **§12's "why N-2 and N-6 are asserted against a decision record rather than against the tree"** is
  the single best paragraph in the document from a product standpoint. It names the exact failure —
  losing `LICENSE` to a bad merge shrinks both sides of the equality and the package publishes
  unlicensed — and fixes the expectation to the operator's own decision. That is the right place for
  a product-owned string to live.
- **DEC-EDIST-08 does not hide its operator-visible break.** The carve-out table states the
  newly-refusing row (unparseable file, no pin ever declared) as its own asserted case rather than
  letting a reader assume the benign reading. Making the one behaviour change that costs an existing
  consumer explicit, with a re-evaluation trigger keyed on field reports, is exactly how a product
  decision with a blast radius should read.
- **§13's governance ordering is stated rather than left ambiguous** — register → entry → TSPEC, with
  the TSPEC governing. An index that declares itself non-authoritative cannot become a second
  source of truth by accident.
- **The two recurring shapes named at the end** ("prefer the failure caught offline"; "an oracle that
  cannot detect the failure it is nominated against is not a mitigation") turn ten entries into two
  reusable principles. That is durable signal worth promoting at harvest.

## Recommendation

**Needs revision** — one High finding (F-01).

Exactly what to change:

1. **F-01** — re-enumerate DEC-EDIST-01's relocation cost to include `MERGE_GUARD_DEFAULTS`
   (`orchestrate-dev.js:47-52`) and its pinned test (`consolidationRoute.test.js:109`); name the
   merge-guard consequence; repoint the `build-runtime.mjs` citations from `:19,48-49` to the
   path-addressing code at `:94-97`/`:531-533` (keeping `:48-49` only as the banner site that
   `runtimeBundle.test.js:593-595` pins); and restate the "third consumer appearing" trigger to a
   condition not already satisfied at HEAD. Mirror the corrected cost in §13's DEC-EDIST-01 row.
2. **F-02** — correct DEC-EDIST-03's Context to attribute the default-to-latest criterion to AC-5.2
   and keep AC-5.1 as the side-by-side residency forcer.
3. **F-03** — add one clause to §12 stating that O-8's blocker 1 (`"private": true`) is closed by
   TSPEC §5.4/PF-3, so the table accounts for all three.
4. **F-04** — replace "covers it without a bespoke test" in DEC-EDIST-04 with the accurate claim:
   the catalogue equality covers registration (and requires an emitter); the ignore-branch trigger
   and the rendered notice text carry their own assertion, per TSPEC §10.3/§12.4. Update §13's
   DEC-EDIST-04 "consequence carried" cell to match.
5. **F-05** — bump the version cell to 0.2.
6. **F-06** — correct the import count/range in DEC-EDIST-09 to nine at `:22-31` (six local).

Nothing above asks for a different decision. All ten decisions trace to a criterion or constraint I
can find in the REQ or FSPEC, no entry decides a product question the REQ has not already delegated,
and I found no scope creep — DEC-EDIST-08's newly-refusing row is the only behaviour change beyond
the ACs and it is declared as such.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 3, "low": 2}
