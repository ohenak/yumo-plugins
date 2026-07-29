# Cross-Review: software-engineer — Final Codebase Review (Phase CR)

**Reviewer:** software-engineer
**Document reviewed:** the remediated implementation at `62c9bf8` (`feat-pdlc-workflow-distribution`), against `CROSS-REVIEW-se-codebase-v1.md` and its orchestrator adjudication log
**Date:** 2026-07-29
**Iteration:** 2
**Scope:** Local — `pdlc/hooks/scripts/check-workflow-drift.sh`, `pdlc/hooks/scripts/sync-workflows.sh`, `pdlc/hooks/scripts/lib/pdlc-drift.sh`, `pdlc/workflows/lib/document-oracles.mjs`, `pdlc/workflows/__tests__/` (the four new suites `driftC1Absent`, `driftMessageSplit`, `driftRelpath`, `worktreeInclude`, plus the changed `driftSync`, `documentOracles`, `bootstrap`, `helpers/driftHarness.js`, `helpers/bin/lib-probe.sh`, `helpers/bin/backup-grammar.sh`), `.gitignore`, `.worktreeinclude`, and the four spec documents `REQ` v17.1 / `FSPEC` v5.2 / `PROPERTIES` v2.2 / `PLAN`. **Not** in scope: the orchestrate-dev/queue pipeline modules and their suites, which this feature did not touch.

**Method.** Every round-1 finding was re-read at source and its claimed fix checked against the
adjudication log. Where the fix ships a test, the test was subjected to a **vacuity probe**: the
production code it claims to guard was broken and the suite re-run. Probes are labelled
**(measured)**; inferences from reading are labelled **(reasoned)**. Every mutated file was restored
byte-for-byte and verified with `shasum`; `git status --short` is empty at the time of writing.

**Baseline, independently re-measured.** Full suite: `Test Suites: 35 passed, 35 total`,
`Tests: 70 skipped, 961 passed, 1031 total` (177.7 s). `node pdlc/workflows/build-runtime.mjs --check`
→ exit 0. On the live root: `coveredViolations` → `[]`, `packagingViolations` → `[]`,
`advertisedVersionViolation` → `{skipped: S_NOTHING_STAGED}`. `EXEMPTIONS` is still the frozen
4-member literal; `COVERED_PATTERNS` is still five fragment-assembled literals. No pattern was
narrowed and no exemption was added to make round 1's remediation green — checked explicitly,
because that is the failure mode this project has form for.

---

## Part 1 — do the round-1 remediations hold?

Summary of the 19: **16 hold outright**, 2 hold with a residual defect carried forward as a new
finding (**F-01** → G-02, **F-05** → G-01), and 1 (**F-15**) is present but repaired a false
statement with a still-false statement (→ G-04). The two contested adjudications, F-03 (partially
rejected) and F-18 (closed by measurement), are both **agreed with** — see "Adjudications" below.

| v1 | Verdict | Evidence |
|----|---------|----------|
| F-01 | **Holds in effect, partially untested** | `check-workflow-drift.sh:43` is now `trap 'exit 0' ERR EXIT`, and a 16-name `declare -F` gate (`:77-80`) exits 0 with a catalogued-style message (`:87`) before any classification. All 8 `driftC1Absent` tests pass. But the `EXIT` arm itself is not covered — see **G-02** (measured). |
| F-02 | Holds | `sync-workflows.sh` sources C1 with `|| true` and gates on 18 names (`:60`), `exit 3` at `:68`. `driftC1Absent` asserts exit 3 for `--check`, plain and `--force` across both C1 cases. Exit 1 is unreachable on this path (reasoned; the only `exit 3`s on the failure path are `:66-68`). |
| F-03 | **Holds** (harness half) | `lib-probe.sh`'s top-level `export LC_ALL=C; export LANG=C` is gone; the export now lives inside `percent_encode()`, whose sole call site is at `:125` inside a `$( )` subshell, so it cannot leak. **Measured:** the v1 repro now yields `ok 0 C` from C1's own export, and with C1's `export LC_ALL=C` commented out the same probe yields `ok 0 en_US.UTF-8` — the caller's injected locale genuinely reaches the subject now. See "Adjudications". |
| F-04 | **Holds — genuine detector** | `driftHarness.js` `splitStderrLines` classifies against the real `MESSAGES` table by `N-`/`W-` id prefix. **Measured vacuity probe:** reverting to the old token heuristic turns **2 of 3** `driftMessageSplit` tests red. All 3 run (none skipped) on this machine. |
| F-05 | **Partially holds** | The unparseable-JSON path (`document-oracles.mjs:217-221`) and the neither-known-shape path (`:316-325`) now return `6.2(a)` violations, with 4 exact-value tests. But `packagingViolations` still **throws** on several parseable-but-malformed manifests — see **G-01** (measured). |
| F-06 | **Holds — genuine detector** | The post-run re-seat loop at `sync-workflows.sh:558-565` re-reads `PDLC_STATE` for each retired id after `pdlc_classify_all "post-run"`, so `supersedingState` is now the recorded pass, per the adjudication's ruling that production (not PROPERTIES) was wrong. PROP-MTM-04 conjunct 1 was widened from 5 agreement cases to 7, adding two `artifact-copy-corrupt` **divergence** compositions, and conjunct 3 gained `not.toBe(postCopy…)`. **Measured:** deleting the re-seat loop turns **4 tests red across 2 conjuncts**. This is the strongest fix in the set — the detector fails for exactly the right reason. |
| F-07 | Holds | `worktreeInclude.test.js` asserts `.worktreeinclude` exists and lists `.claude/workflows/`. Trivially falsifiable by deletion (reasoned — the assertion is a direct read of the file). |
| F-08 | Holds | `CLAUDE.md` now documents `unverified` and the `--force` upgrade path, including the backup-before-overwrite guarantee. Verified at source that `--force` does back up first: `pdlc_backup` precedes `pdlc_copy_artifact` at `sync-workflows.sh:367-385`. |
| F-09 | Holds | PLAN L-06's recovery is now path-scoped (13 explicit paths), not `git checkout -- .`. |
| F-10 | **Holds — genuine detector** | `backup-grammar.sh` uses `split_tab_fields()`. **Measured:** reverting to `IFS=$'\t' read -r` turns 1 test red. |
| F-11 | Holds | PLAN §6.2 now says nine files. Re-counted: nine. |
| F-12 | Holds | PLAN L-03 now says three mode changes; `git show 05739f3 --raw` confirms three. |
| F-13 | Holds | The `documentOracles.test.js` comment now says 13 (7 + 6). |
| F-14 | Holds | Threshold/marker addressed; `orchestrateDevSkill.test.js` green. |
| F-15 | **Present but still wrong** | The anchoring claim was edited, but the retained "turning AT-23's `== 7` into `== 0`" rationale is still false at four sites. See **G-04** (measured). |
| F-16 | **Holds — genuine detector** | `bootstrap.test.js` restores `pristineBytes` in `try/finally` and adds falsifier "assertion 7b". **Measured:** removing the restore body (keeping the `finally` keyword) turns 7b red. |
| F-17 | Holds | `_pdlc_c3_relpath` now quotes the `#` operand: `printf '%s' "${p#"${PDLC_REPO_ROOT}/"}"`. `driftRelpath.test.js` extracts the function from the shipped script text and evaluates it under 5 metacharacter-bearing roots. Extraction-from-source means it cannot drift from the shipped code (reasoned). |
| F-18 | **Holds — agreed** | PLAN L-09 records the measured `{skipped: S_NOTHING_STAGED}`. Re-measured on the live root: identical. |
| F-19 | Holds | `advertisedVersionViolation`'s final comparison is wrapped in try/catch returning `{skipped: S_PLUGIN_JSON_UNREADABLE}`, with 3 exact-value tests. |

### Adjudications I was asked to weigh

**F-03 — partial rejection: I agree.** The adjudication accepted the harness fix and rejected the
proposed follow-up (a test that C1's own `export LC_ALL=C` changes sort/collation behaviour) as
unbuildable, on the grounds that no observable divergence exists on the available libc. I
independently re-measured the harness half and confirm the injected locale now reaches C1
(`ok 0 en_US.UTF-8` once C1's export is removed), which is what F-03 actually asked for. The
rejection of the *behavioural* detector is sound: I could not construct one either. One correction
to the adjudication's wording, recorded as **G-05 (Low)**: it states no detector exists *at all*. A
**mechanism** detector now does exist and is one line — assert that C1 sets `LC_ALL=C` under an
injected caller locale. That is exactly what my probe did.

**F-18 — closed by measurement: I agree, unreservedly.** `dist/` is committed, `git status
--porcelain` is empty, the oracle short-circuits. Re-measured; the recorded value is the value the
DoD line will see.

**F-06 escalation to High, with production ruled wrong: I agree.** Moving FSPEC to match a
production accident would have made `supersedingState` mean "post-copy" in a record whose every
other field is post-run, which is the more expensive error. The remediation moved production, and
the widened test fails on removal.

---

## Part 2 — fresh review of the new surface

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| G-01 | Medium | Local | **`packagingViolations` still throws `TypeError` on parseable-but-malformed manifests, and this is inconsistent with the skip-loudly ruling made for `advertisedVersionViolation` in the same commit.** | `pdlc/workflows/lib/document-oracles.mjs:232-325` |
| G-02 | Medium | Local | **The `EXIT` arm of the hook's new `trap 'exit 0' ERR EXIT` is not a tested behaviour — all 8 `driftC1Absent` tests stay green with it removed.** | `pdlc/hooks/scripts/check-workflow-drift.sh:43`; `__tests__/driftC1Absent.test.js` |
| G-03 | Medium | Local | **The two new C1-availability messages are outside the FSPEC §8.2/§8.3 catalogue and are asserted only by an ad-hoc `/^pdlc: /m`, in direct contradiction of the harness's own stated rule.** | `check-workflow-drift.sh:87`; `sync-workflows.sh:66`; `__tests__/driftC1Absent.test.js:129`, `:156`; `__tests__/helpers/driftHarness.js` (header rule) |
| G-04 | Low | Local | **F-15's edit left the false half of the claim in place at four sites: `.gitignore` cannot affect AT-23's count by any mechanism, anchored or not.** | `.gitignore:9-14`; TSPEC:1773, :2421; `PLAN` L-01 |
| G-05 | Low | Local | **The gate's function list is 16 names deep but the corrupt-C1 fixture defines only the first probed name, so 15 of the 16 entries are untested; and `pdlc_msg_w7`'s status as "C1's last definition" — the gate's whole rationale — is pinned by a comment, not an assertion.** | `check-workflow-drift.sh:69-80`; `__tests__/driftC1Absent.test.js:108-117`; `lib/pdlc-drift.sh:1952` |
| G-06 | Low | Local | **The hook's array-seeding loop uses `eval "declare -a ${_pdlc_hook_arr}=()"` — a dynamic-name `eval` on data that is a local literal today but is exactly the construct a future edit turns into an injection.** | `check-workflow-drift.sh` (availability-gate seeding block) |
| G-07 | Low | Process | **Four new suites, zero new red-first evidence in the PLAN.** The four fixes with genuine detectors were proven so by *my* probes, not by a recorded red-first step. | `PLAN-pdlc-workflow-distribution.md` (L-0x remediation rows) |

### G-01 — `packagingViolations` throws on malformed-but-parseable manifests (Medium)

F-05 asked the oracle to stop returning `[]` for manifests it had not actually checked. The fix
covers *unparseable* JSON and *neither-known-shape* JSON. It does not cover the shapes that pass the
`Array.isArray` gate and then dereference a non-object element.

**Measured** — four inputs, each written to a temp root's manifest path and passed to
`packagingViolations`:

| Input | Result |
|---|---|
| `null` | `TypeError` thrown |
| `{"rows":[null]}` | `TypeError` thrown |
| `{"entries":[null]}` | `TypeError` thrown |
| `{"rows":[{}]}` | `TypeError` thrown |

`null` is especially poor: `JSON.parse("null")` succeeds, `Array.isArray(null.entries)` throws
before either the `entries`/`rows` branches or the new `else` at `:316` can run, so the new
neither-known-shape violation is unreachable for it.

A throw is not automatically wrong — it is loud, which is better than a false `[]`. The problem is
**inconsistency decided in the same commit**: F-19's remediation ruled that the sibling oracle
`advertisedVersionViolation` must *not* throw on a bad `plugin.json` and must return
`{skipped: S_PLUGIN_JSON_UNREADABLE}` instead. Two oracles, called from the same DoD checklist,
now have opposite contracts for the same class of input. Whichever contract is right, one of them is
wrong. Given the RELEASE-CHECKLIST calls these in sequence, a throw in the first aborts the run
before the second is reached (reasoned).

Resolution: either extend the `6.2(a)` violation to cover non-object rows/entries and `null` (cheap
— a `typeof row !== "object" || row === null` guard inside each loop, plus a `manifest === null`
guard before the branches), or give `packagingViolations` a documented skip reason mirroring F-19's.
Do not resolve it by adding a try/catch that returns `[]` — that reinstates exactly F-05.

### G-02 — the new `EXIT` trap arm is not a tested behaviour (Medium)

`check-workflow-drift.sh:43` changed from `trap 'exit 0' ERR` to `trap 'exit 0' ERR EXIT`. The
stated reason (correct, and I agree with it) is that under `set -u` a fatal unbound-variable error
does **not** fire the `ERR` trap, only `EXIT`.

**Measured vacuity probe.** I reverted line 43 to `trap 'exit 0' ERR` and ran
`npm test -- __tests__/driftC1Absent.test.js`: **all 8 tests stayed green.** The suite that was added
to close F-01 does not detect the removal of half of F-01's fix. The reason is structural: the new
availability gate returns *before* any code that could hit a `set -u` fatal, so in both `C1_CASES`
the script exits 0 via the gate's own `exit 0` and the trap is never consulted.

The `EXIT` arm is therefore correct-by-reasoning and green-by-accident — the exact pattern this
project's non-vacuity rule exists to catch.

**A detector is constructible, and I built one (measured).** With a C1 that defines all 16 gated
names *and* `pdlc_load_manifest() { unset PDLC_ROWS_ID; }`, the hook reaches the classification
block, hits a `set -u` fatal on the unset array, and exits **1** under `ERR`-only and **0** under
`ERR EXIT`. That is a one-fixture, one-test addition to `driftC1Absent.test.js` and it makes the
`EXIT` arm falsifiable. Note this fixture also exercises the "C1 present and complete but
semantically broken" class, which nothing currently covers.

### G-03 — the two new messages bypass the catalogue and the harness rule (Medium)

`check-workflow-drift.sh:87` and `sync-workflows.sh:66` emit new operator-facing strings
("workflow drift was not checked this session — the plugin library %s is missing or incomplete…" /
"cannot check or sync workflows — …"). Neither has an id in FSPEC §8.3's notice catalogue or §8.2's
warning catalogue, and neither is registered in the harness `MESSAGES` table.

The consequence is a rule violation the codebase states explicitly. `helpers/driftHarness.js`
carries the rule "this is the only sanctioned route to stderr; no test greps stderr with an ad-hoc
regex" — and `driftC1Absent.test.js:129` and `:156` assert on these messages with exactly such an
ad-hoc regex, `expect(run.stderr).toMatch(/^pdlc: /m)`. That assertion passes for *any* stderr line
beginning `pdlc: `, so it does not pin the message's content, its identity, or which of the two
scripts produced it (reasoned — the regex is literal).

This also weakens F-04's fix in a way worth naming: `splitStderrLines` now classifies against
`MESSAGES`, so an uncatalogued line falls into *neither* `notices` nor `warnings` and is silently
dropped from `RunResult`. Two messages the operator sees are invisible to the harness's structured
view.

Resolution: give both messages catalogue ids (they are notices — the session/sync is unaffected in
the hook's case, terminal in sync's) and register them in `MESSAGES`, then replace the two `/^pdlc: /m`
assertions with `expectHookSilent`-style structured assertions.

### G-04 — the AT-23 `.gitignore` rationale is still false (Low)

F-15 flagged two claims: (a) an unanchored `.claude/workflows/` matches at every depth, and (b) the
resulting match would turn AT-23's `== 7` into `== 0`. The remediation corrected (a) and **retained
(b)** at `.gitignore:9-14`, TSPEC:1773, TSPEC:2421 and PLAN L-01.

**(b) is false, for two independent reasons, both measured.**

1. `listAllFiles(root)` in `document-oracles.mjs` walks the tree with `readdirSync`. It never
   consults git. No `.gitignore` pattern, anchored or not, can change what it returns.
2. Even at the git layer the claim fails for a tracked fixture. In a throwaway repo I added
   `workflows/` to `.gitignore` with a tracked file beneath a `workflows/` directory: the file
   remains tracked, `git ls-files` still lists it, and a fresh clone still materialises it. Ignore
   rules do not apply to already-tracked paths.

The implemented `/.claude/workflows/` anchoring is correct and must stay. Only the prose is wrong.
Low, because — as v1 established and I re-verified — **no test encodes the claim**, so nothing is
vacuous; this is documentation asserting a mechanism that does not exist.

### G-05 — the gate's list is 16 deep, its fixture is 1 deep, and its rationale is uncommitted (Low)

Two related weaknesses in an otherwise good gate.

**Fixture depth.** `driftC1Absent.test.js:113-116`'s corrupt C1 is
`'PDLC_DRIFT_LIB_SOURCED=1\npdlc_load_manifest() { :; }\n'`. `pdlc_load_manifest` is the *first*
name in the hook's probe list (`check-workflow-drift.sh:77`), so the loop trips on the second name
and the remaining 15 entries are never exercised. Deleting any of names 2-16 from the gate list is
undetectable by this suite (reasoned; the loop short-circuits on first miss). A second fixture
defining names 1-15 and omitting only `pdlc_msg_w7` would pin the far end of the list, which is the
end the design actually depends on.

**Uncommitted rationale.** The gate's comment (`:69-74`) explains that `pdlc_msg_w7` is probed
precisely because it is C1's **last definition**, making it the witness that C1 loaded to
completion. I **measured** that this is true today — `pdlc_msg_w7` is at `lib/pdlc-drift.sh:1952`
and is the final function definition in the file. Nothing enforces it. Appending one function to C1
silently demotes the witness to a mid-file probe and the gate quietly stops detecting truncation
past that point. A one-line assertion in `driftC1Absent` — that the last `^pdlc_[a-z0-9_]*()` match
in C1's text is `pdlc_msg_w7` — converts a comment into a guard.

I also note and endorse the deliberate exclusion of `pdlc_fault_active` from the probe list to avoid
minting a PROP-SEAM-02 token, with `pdlc_fault_unrecognised_seen` standing in for the same layer
(`:74`, `:77`). That is careful work.

### G-06 — dynamic-name `eval` in the seeding loop (Low)

The gate's array-seeding loop builds a declaration by string interpolation:
`eval "declare -a ${_pdlc_hook_arr}=()"`. Today `_pdlc_hook_arr` iterates a local literal list of
`PDLC_ROWS_*` names, so this is safe. It is flagged only because it is the standard shape that stops
being safe the moment someone sources the list from a manifest or an environment variable, and
bash 3.2's lack of namerefs makes that temptation likely. Under `set -u` the alternatives are
awkward, so I am not asking for a rewrite — a comment at the site stating that the iterated list
must remain a literal is sufficient.

### G-07 — no recorded red-first evidence for the four new suites (Process)

Four fixes ship genuine detectors (F-04, F-06, F-10, F-16) and I proved each one red by mutation.
That evidence exists only in this review; the PLAN's remediation rows record the fixes and the green
suite, not a red-first step. Given this feature's history of green-for-the-wrong-reason tests, and
given that **one** of the round-1 fixes (G-02) turned out to have exactly that defect and was found
only by probing, the cheap durable rule is: a remediation row that claims a detector records the
mutation used and the test ids that went red. Two lines per row.

---

## Positive observations

- **F-06's remediation is exemplary.** It moved production rather than weakening the property,
  widened the case list to include the compositions where the two passes *diverge* (which is the
  only place the bug was observable), and added a `not.toBe` that pins the post-copy value out. Four
  tests go red on removal. This is what the rest of the set should look like.
- **No pattern narrowing, no exemption widening.** `EXEMPTIONS` remains the frozen 4-member literal;
  `COVERED_PATTERNS` remains five fragment-assembled literals. Round 1 asked for nine document sites
  to be corrected and they were corrected by **rephrasing the documents**, which is the sanctioned
  route. Checked specifically because the alternative is the cheapest way to fake this fix.
- **`driftRelpath.test.js` extracts the function under test from the shipped script's own text**
  rather than reimplementing it, so it cannot drift from production. Good pattern; worth reusing.
- **The C1 availability gate is a better fix than F-01 asked for.** F-01 only demanded exit 0; the
  gate additionally converts a raw bash diagnostic into an operator-actionable sentence and refuses
  to record a fabricated "everything in sync" result. `RAW_BASH_DIAGNOSTICS` asserting the *absence*
  of `unbound variable` / `command not found` / `No such file or directory` is a genuinely good
  negative assertion.
- The `splitStderrLines` fix replaced a placeholder with a table-driven classifier rather than a
  second heuristic, and it is falsifiable.

## Questions

- **Q-01 (G-01):** which contract is intended for the oracles — throw, or skip with a reason? F-19
  chose skip; `packagingViolations` throws. Please pick one and apply it to both.
- **Q-02 (G-03):** are the two C1-availability messages intended to be catalogued, or deliberately
  outside §8.2/§8.3 because they describe a state in which the catalogue's own library is absent? If
  the latter, that reasoning belongs in FSPEC §8 and the harness rule needs an explicit exception —
  otherwise the next reviewer files this again.

## Files mutated during this review and restored

All restored byte-for-byte, verified with `shasum`; `git status --short` was empty afterwards.

| File | shasum after restore |
|---|---|
| `pdlc/hooks/scripts/check-workflow-drift.sh` | `fb7beb7d5235972b9909cdb9f55af40324c91101` |
| `pdlc/hooks/scripts/sync-workflows.sh` | `1da2fb95cc253d877ee656f186b3b593d394fb26` |
| `pdlc/hooks/scripts/lib/pdlc-drift.sh` | `604199b7758da8a4e09356ec65ad8442a4387e3f` |
| `pdlc/workflows/__tests__/helpers/driftHarness.js` | `6d0c444c6a9c3b43e5b7de361fee385c526d4e93` |
| `pdlc/workflows/__tests__/helpers/bin/backup-grammar.sh` | `3bfe9be0de7048e7a9d9340da773108cc4a8fa04` |
| `pdlc/workflows/__tests__/bootstrap.test.js` | `02638f00143d50cd03caa21b35f45ab44fd83362` |

`pdlc/workflows/lib/document-oracles.mjs` was **not** mutated — G-01 was measured by calling the
exported function against temp-directory fixtures, leaving the source untouched
(`c487d14416304c6091349d704dda63a831d5593c`).

---

## Recommendation

Round 1's remediation is substantially sound. Sixteen of nineteen findings are closed cleanly, four
of them with detectors I proved genuine by mutation, and the highest-risk fix (F-06) is the best
piece of work in the change. Nothing in the remediation was achieved by weakening an oracle, a
pattern or an exemption — the thing most worth checking, and it checks out.

The residual findings are all narrow and none of them makes the shipped behaviour wrong. G-02 is a
missing test for correct code, G-01 is an inconsistency between two oracles' error contracts, G-03
is a catalogue-registration gap, and the remainder are documentation and test-depth. None blocks the
feature; all four should be booked as follow-up work, with **G-02 first** — it is the one that
leaves a P0-absolute guarantee (AC-2.4, "the hook exits 0 always") resting on reasoning rather than
measurement, and its detector is one fixture away.

**Verdict: approved.**

**Finding counts (new, this iteration): 0 High / 3 Medium / 4 Low.**
Round-1 disposition: 16 closed, 2 closed with residual (F-01 → G-02, F-05 → G-01), 1 incompletely
corrected (F-15 → G-04). Both contested adjudications (F-03 partial rejection, F-18 closure) are
agreed with.
