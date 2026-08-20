# Cross-Review: product-manager — DECISIONS

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/DECISIONS-pdlc-learnings-injection.md` (v0.1)
**Upstream read:** REQ v0.9, FSPEC v0.7, TSPEC v0.5, `docs/_constraints/DOMAIN-CONSTRAINTS.md`, `docs/_decisions/`
**Date:** 2026-08-19
**Iteration:** 1

## Verification performed

Every code claim the document makes was re-run against this branch at HEAD, not read back out of the
document. What checked out, in the document's own order:

| Claim | Where the document states it | Verified |
|---|---|---|
| G-A: engine vendors exactly two workflow modules | §Context, DEC-LI-01, DEC-LI-04 | `const MODULE_NAMES = ["orchestrate-dev.js", "orchestrate-queue.js"]`, `pdlc/engine/scripts/prepack.mjs` — **holds** |
| G-B: four `dispatchKind: "authoring"` sites, all funnelling through `dispatchAndVerify` | §Context, DEC-LI-03 | three object-literal sites (phase creator, erratum author, erratum land-proof retry) plus `reviewLoop`'s positional `"authoring"` to `runWrapped`; `wrapped` calls `dispatchAndVerify` — **holds** |
| G-C: Phase CR reaches `dispatchAndVerify` with `docType: null` | §Context, DEC-LI-03 | Phase CR passes `docType: null` explicitly; `roundDocType = docType === undefined ? docTypeFromPath(doc) : docType` therefore keeps `null` and `wrapped` forwards it — **holds, and it is the load-bearing one**: the single-conjunct gate really would admit `se-author` remediating shipped code |
| G-D / DEC-LI-04: `LS_FILES_ARGV` is the shipped corpus predicate | §Context, DEC-LI-04 | frozen argv in `consolidate-learnings.js`, consumed by `enumerateCorpus(_git)` — **holds** |
| Corpus yields 9 documents at HEAD | §Context | re-ran the predicate: **9** — holds |
| `defaultListFiles` is non-recursive and returns basenames | DEC-LI-04 | one `readdirSync`, `.filter(!isDirectory).map(entry.name)` — **holds**, and the "different predicate wearing C-3's name" reading is fair |
| Prompt composition is `${basePrompt}\n\n${PACING_CONTRACT_CLAUSE}\n\n${opener}` | DEC-LI-05 | verbatim in `dispatchAndVerify` — **holds**, so `prompt + block` really is identity when `block === ""` |
| Runtime read cache: shared, 2 MiB, oldest-inserted eviction | DEC-LI-06 | `RT_READ_CACHE_MAX_BYTES = 2097152` and the eviction loop in `runtime-adapter.js` — **holds**, including the "residency not guaranteed to this corpus" caveat |
| `ADVISORY_DEFAULTS.enabled === false`; `parseImplementationConfig` is the fail-open precedent | DEC-LI-07 | `ADVISORY_DEFAULTS` is `{enabled: false, …}`; `IMPLEMENTATION_DEFAULTS` + reader confirm the nearer precedent — **holds**, and the sibling-shape / sibling-default distinction is drawn correctly |
| `git check-ignore -v .baseline-worktree` exits non-zero; `WALK_SKIP_DIRS = new Set([".git", "node_modules"])` | DEC-LI-09 | both re-run/re-read at HEAD — **hold**; the leftover-worktree hazard is real and is this repo's known `coveredViolations` footgun |
| `orchestrate-dev.js` is the largest module | DEC-LI-01 | 15,169 lines vs 2,727 next — **holds** |

Configuration semantics were checked against **current** upstream, not against TSPEC: REQ v0.9
AC-5.1a ("there is no second gate beyond this key (G-1)", absent section reads as §4.1 defaults),
AC-5.1b, AC-5.1c and AC-4.4, and FSPEC v0.7 `BR-14`/`D-1`. DEC-LI-07's five-row table reproduces
those five states exactly, including `NTC-MALFORMED` / `NTC-KEYTYPE` and the "no injection key at
all" report shape. This is the single most important thing in the document and it is right.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | **DEC-LI-07 binds IMPL against a rule the still-standing TSPEC contradicts, and the promised erratum is nowhere in the document.** The header says "the divergence is raised as a TSPEC erratum rather than resolved silently", but no erratum id, no section and no obligation row records it. TSPEC v0.5 still builds the injector only when `present && config.enabled && !sectionMalformed` (§I.3) and still carries `OQ.2`/`ERR-4` as open, while DEC-LI-07 decides `config.enabled` alone. `D-O-5` protects IMPL from re-introducing the `present` gate — but PROPERTIES and the AT authors read **TSPEC**, so `AT-31`/`AT-32` written from §I.3 would red a correct implementation, which is exactly the two-readings hazard TSPEC's own `ERR-7` names. **Fix:** add an obligation row (e.g. `D-O-6`) naming the TSPEC erratum this document raises, the sections it corrects (§I.3, §OQ.2, `ERR-4`, the `LEARNINGS_DEFAULTS` row), and stating that until it lands, DEC-LI-07 is the binding reading for both IMPL **and** test authors. | REQ G-1, AC-5.1a/b/c; FSPEC `BR-14` |
| F-02 | Medium | Local | **DEC-LI-04's alternative set never closes REQ G-6's second clause, so a future agent will re-open it.** G-6 says the feature "reads the LEARNINGS corpus … **and, where they exist, the project-level artifacts consolidation produced**". `LEARNINGS_CORPUS_ARGV` enumerates `LEARNINGS-*.md` only; nothing under `docs/_constraints/` or `docs/_decisions/` ever becomes a corpus member. C-3 and FSPEC settle the corpus as LEARNINGS-only, so the design is not wrong — but this is the document whose stated purpose is that "a future agent reading only the code would otherwise reconsider it confidently and at cost", and "widen the enumeration to include consolidation's project-level artifacts" is precisely the alternative such an agent reaches for. **Fix:** add it as a rejected alternative under DEC-LI-04 with the one-line reason (C-3 defines the corpus by reference to consolidation's *pass-side* predicate; the authoring roles already read `docs/_constraints/` from their own skill prompts, so G-6's second clause needs no corpus member). | REQ G-6, C-3 |
| F-03 | Medium | Cross-Feature | **DEC-LI-04's "check `ok`, not `catch`" rests on a seam contract the runtime channel does not enforce, and G-4/C-7 are unconditional.** The claim `_git` "never throws on either channel" is true of `defaultGit` (its `catch` returns `{ok:false,…}`) and is the contract `orchestrate-dev.js` states for itself, but `rtGit` (`runtime-adapter.js`) is a bare `await RT.agent(…)` with no guard — its sibling `rtReadFile` on the same transport demonstrably rethrows, which is why DEC-LI-02 gives `_readFile` a `try` in the first place. C-7 says "no corpus state produces an exception, a halt … or a changed convergence outcome", and a transport throw out of the enumeration would breach it in the fail-open path this feature exists to guarantee. TSPEC `P-7` carries the same claim, so this is a shared assumption rather than a new one. **Fix:** state the residual in DEC-LI-04 and let the shell's existing `try` cover **both** seam calls, not only the reads — one `catch` around a twelve-line shell is cheap insurance for an unconditional goal, and it costs nothing on the plain-Node channel where the contract does hold. | REQ C-7, G-4 |
| F-04 | Low | Local | **"the erratum raised below" (§Decisions deliberately NOT taken, AC-3.3 row) points at nothing in this document.** The erratum it means is TSPEC `ERR-6`, already routed to REQ. As written a reader scans to the end of the file for an erratum section that does not exist. **Fix:** cite `TSPEC ERR-6` by name. | REQ AC-3.3 |
| F-05 | Low | Local | **`DC-18` is miscited twice** (DEC-LI-08 "Constraints that forced the shape", and the §Decisions-deliberately-NOT-taken threshold row). `DC-18` is *"A claim carried by N documents needs an N-document guard"* — an oracle-surface rule about glob-ranged guards over transcribed prose. It says nothing about product owning tunable values. The claim the document is making ("engineering owns the mechanism, product owns the numbers") is sound and is REQ §4.1's own statement; it needs no borrowed authority. TSPEC §Out-of-scope carries the same miscitation, so this is inherited rather than introduced. **Fix:** cite REQ §4.1 directly, or `DEC-LAYER-01` if a layer-boundary authority is wanted, and drop `DC-18`. | REQ §4.1 |
| F-06 | Low | Local | **C-8's acknowledged weak satisfaction has no obligation row.** DEC-LI-08 states plainly that C-8's second half is met only in the "bounded a priori" sense, and names the conditions under which it would be revisited — good, honest work. But the obligations table hands downstream only read-cost reporting (`D-O-4`); the C-8 gap itself has no owner, so nothing carries it to the operator who runs REQ O-1. **Fix:** extend `D-O-4`, or add a row, making "report whether realised prompts crowd the §4.1 caps, as the input to C-8's second half" an explicit O-1 deliverable. | REQ C-8, O-1 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | DEC-LI-07 ships the feature **on** in every consumer repository that upgrades, with no opt-in step. That is exactly what G-1 asks for, and REQ v0.9 settled it deliberately — but is the operator of each consumer repository going to *learn* that before their first surprising authoring dispatch? Nothing in this document or TSPEC hands `pdlc/OPERATIONS.md` or the release notes an obligation. If the answer is "the run report's injection rows are the notification", say so somewhere. |
| Q-02 | DEC-LI-06's cost paragraph is candid that the re-read is the unbounded term. On the Claude Code channel each re-read is at minimum a model-mediated probe per corpus document per authoring dispatch. With 9 documents and a long review loop, is there a point at which the *probe* count alone becomes the operator-visible cost, independent of bytes? Worth naming as a second measurement in `T-O-3`'s report if so. |
| Q-03 | DEC-LI-03's re-evaluation trigger "a fifth authoring code site appears that does not funnel through `dispatchAndVerify`" is the right trigger, but nothing mechanical fires it. Is `AC-1.2`'s set-equality oracle over the run that happened enough to catch it, given the document itself argues (correctly, under the four-call-site alternative) that such an oracle cannot notice its own omission? |

## Positive Observations

- **The document re-grounded itself on current upstream instead of inheriting TSPEC's stale reading.**
  TSPEC v0.5 was authored against REQ v0.7 while REQ contradicted itself about the shipping default;
  REQ v0.9 settled it, and DEC-LI-07 follows the settled product decision rather than the convenient
  inherited one. Concretely it prevents the feature shipping **off** in this very repository — no
  config section, 9 corpus documents — which is the exact case G-1 exists to serve. That is the
  single highest-value paragraph in the document.
- **DEC-LI-03's rejection of the single-conjunct gate is argued from behaviour, not taste, and the
  behaviour is real.** I re-traced `docType: null` from Phase CR's call through `roundDocType` to
  `dispatchAndVerify`; the "simpler" gate would inject into `se-author` remediating shipped code,
  which NG-5 and C-1 exclude. "The single-conjunct gate is not simpler in effect; it is wrong" is
  earned.
- **DEC-LI-05 converts an acceptance criterion into a structural fact.** AC-4.1 / AC-5.1a byte-identity
  holding by construction — appending `""` is identity — rather than by a test someone must keep
  re-running is the kind of design choice that keeps costing nothing for years.
- **Costs are stated where they hurt, not buried.** DEC-LI-06's "the read cost is unbounded where the
  injection is bounded", DEC-LI-08's weak-sense C-8, DEC-LI-01's "PLAN is nearly serial" consequence,
  and DEC-LI-09's "hard to reverse" all name the bill before someone else discovers it. The
  Consequences section's split into *made cheap* / *made expensive* / *handed downstream* is a format
  worth reusing.
- **Every rejected alternative I spot-checked was rejected against something real** — the vendoring
  list, the `defaultListFiles` predicate, the advisory reader's opposite default, the stale-worktree
  behaviour of `rm -rf`. No alternative was dismissed on preference wearing a cost's clothes.

## Recommendation

**Approved with minor changes**

No High finding. Nothing in the document narrows, reinterprets or silently drops a REQ acceptance
criterion; where it departs from TSPEC it does so to *restore* a settled product decision, and it
says so. The three Medium findings are all about **carrying** decisions to the people downstream who
need them — an erratum that is promised but not recorded (F-01), an alternative left open for a
future agent to re-litigate (F-02), and a fail-open assumption that holds on one channel and is
unguarded on the other (F-03) — not about the decisions themselves, which I would ship as they
stand. Address F-01 before PLAN authoring, since PLAN and PROPERTIES both read TSPEC.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 3, "low": 3}
