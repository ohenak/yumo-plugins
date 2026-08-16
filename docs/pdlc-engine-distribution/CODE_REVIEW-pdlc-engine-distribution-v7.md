# CODE REVIEW — pdlc-engine-distribution (v7)

| Field | Detail |
|---|---|
| Feature | pdlc-engine-distribution |
| Branch | feat-pdlc-engine-distribution |
| Review version | 7 |
| Date | 2026-08-16 |
| Verdict | Findings |
| Branch coverage (lowest new module) | 86.52% (`pdlc/workflows/build-runtime.mjs`, carried from v4 — no production module changed this round) |
| Requirements traced | 26/30 |

**On the version number.** The dispatch named `v2`. `CODE_REVIEW-…-v1.md` through `-v6.md` are
**tracked on this branch** (`0a771e4d`, `0a2e071f`, `539b1637`, `101b349d`, `65ac6abc`,
`fd4f1611`); review history is append-only, so writing `v2` would have destroyed five committed
rounds. The next free integer is `v7`. This is the fourth consecutive stale-version dispatch —
v4, v5 and v6 recorded and resolved it the same way. **Scope is the delta re-verification**,
measured against `v6`, the actual predecessor.

**Remediation window.** Exactly two commits since v6 (`fd4f1611..HEAD`), both remediation:

- `c2388ec2` — `fix(...): correct publish.yml's stale five-check comments (CODE_REVIEW v6 §3-1)`
- `1db643bb` — `fix(...): complete the engine-v0.2.0 binding (CODE_REVIEW v6 §3-2, §3-3)`

Five files, +141/−4: `.github/workflows/publish.yml`, `docs/_queue/QUEUE.md`,
`pdlc/RELEASE-CHECKLIST.md`, and two test files. **No production module changed**, so criterion 4
has nothing new to measure and v4's floor stands. The window is unusually tight and every line in
it is traceable to a v6 finding.

**Suites executed this round.** `pdlc/engine` `npm test`: **835 tests, 833 pass, 0 fail, 2
skipped** (`PDLC_LIVE=1` opt-ins) — up 5 from v6's 830, matching the three tests and their
subtests that the remediation added. `documentOracles.test.js`'s `coveredViolations` red is the
same untracked-local-state noise recorded in every prior round (`.serena/`,
`.claude/settings.json`, `.claude/pdlc-wave-state.json` untracked at HEAD); green in CI.

---

## §1 Prior-Finding Re-Verification

Every v6 finding was traced to a production-side fix **and** to a guard, and every guard was
mutated to confirm it is load-bearing rather than assertion-free. The tree was restored and
re-run green after each mutation.

| # | v6 finding | Fix | Guard | Mutation applied | Result | Status |
|---|---|---|---|---|---|---|
| 1 | §3-1 `publish.yml:5` transcribes "five rendered check names" (V-18 enumerates six) | `publish.yml:5` → "six" | `ci-arrangement.test.js:665` subtest 1 (count-word equality vs `EXPECTED_RENDERED_BY_JOB`) | reverted the word to `five` | **RED** (`not ok 8`) | **Remediated** |
| 2 | §3-1 `publish.yml:24` gate comment claims it re-runs "the five PR-gate jobs' commands" | `:24-29` rewritten to the union over every `pull_request`-triggered file, naming both, and stating the count is T49-derived | `ci-arrangement.test.js` subtest 2 (gate-job comment names every `PR_GATE_FILES` key) | deleted `fixture-machine.yml` from the gate comment | **RED**, independently of mutation 1 | **Remediated** |
| 3 | §3-2 `QUEUE.md:85` names `pdlc/.github/workflows/publish.yml`, a path that does not exist | corrected to `.github/workflows/publish.yml` | `deferral-binding.test.js` "§3-2: every workflow path the binder documents name resolves" | restored the `pdlc/`-prefixed path | **RED** (`not ok 3`) | **Remediated** |
| 4 | §3-3 `RELEASE-CHECKLIST.md` §7 schedules the tag but not the publish-evidence record | new checklist item naming a tracked `EVIDENCE-*.md` per BR-3.9/T52 | `deferral-binding.test.js` "§3-3: …schedules the publish evidence and the follow-on version bump" | deleted the evidence item | **RED** (`not ok 4`) | **Remediated** |
| 5 | §3-3 …nor the `version-skew` ratchet bump that the evidence forces | new checklist item bumping `pdlc/engine/package.json` to `0.3.0` **in the same change** | same test, second assertion | deleted the bump item only | **RED**, independently of mutation 4 | **Remediated** |

**Guard quality.** None is stub-backed and none is vacuous on this tree. The §3-2 path guard is
non-vacuous because both binder documents do name a workflow path today (mutation 3 proves the
loop body executes). The §3-3 guard derives its bump target from `pdlc/engine/package.json`
(`0.2.0` → `0.3.0`) rather than transcribing it, and is correctly conditional on `pdlc/README.md`
still carrying the `"successor tag is cut"` caveat — so the obligation lapses with the deferral
instead of outliving it. Two of the five guards would have passed if the other had been the only
one written; all five mutations red **independently**, which is the property that matters.

**Criteria 1–3 on the remediation diff.** Clean. The added lines contain no `TODO`/`FIXME`/
`NotImplementedError`, no mock or seed data, no placeholder URL or `Math.random()`, and no unwired
import. `publish.yml`'s gate job body was not touched — only its comments — so no gating behaviour
moved this round.

---

## §2 Requirements Traceability (carried forward from v6; nothing this round touched a criterion)

| # | Source | Criterion / AC | Implementation path | Test path | Gap? | Severity | Scope |
|---|---|---|---|---|---|---|---|
| 1 | REQ AC-2.1 | Documented one-command install ⇒ CLI on `PATH`, AC-1.4 triple, handshake reached | `pdlc/README.md:153-162`; `pdlc/engine/package.json@0.2.0`; bound by `QUEUE.md` row 23 + `RELEASE-CHECKLIST.md` §7 | `fixture-machine.mjs:459-507` (locally packed HEAD tarball); `version-skew.test.js`; `deferral-binding.test.js` | **YES** (bound) | medium | Local |
| 2 | REQ AC-2.2 | Documented upgrade ⇒ consumer repos execute N+1 | `pdlc/README.md:154`; same binders | `fixture-machine.mjs:510` `upgradeInstall` (local tarball) | **YES** (bound) | medium | Local |
| 3 | REQ AC-4.4 | Anti-echo: revert half | `lib/handshake.mjs` | `version-doctor.test.js:359` (change half); `EVIDENCE-AT-4.4.md` (one-time) | **YES** | medium | Local |
| 4 | REQ AC-6.2 | Bundle-side run-bound load root | `lib/provenance.mjs`, `lib/run.mjs` | `run.test.js`, `workflow-roots.test.js`; `EVIDENCE-AT-6.2.md` | **YES** | medium | Local |

Rows 5–30 unchanged from v4/v5/v6 and not re-scanned, per delta-round scope. `req_gaps` stays 4.

**Rows 1–2 are strictly better bound than in v6 and still not delivered.** v6 asked §7 to schedule
the whole discharge act; it now does, including the `version-skew` ratchet that would otherwise
have been discovered as a red default branch after the publish. The operator-visible artifact is
unchanged: `npm i -g @kaneho/pdlc-engine@latest` still resolves `0.1.0`. That closes when row 23
discharges, not before, and cannot close pre-merge (C-7, PF-1). Severity stays medium.

**Rows 3–4 remain spec-acknowledged** (PLAN §2 AT-4.4; TSPEC §7.3), unchanged since v1.

---

## §3 Integration-Boundary Findings (criterion 6, delta only)

| # | Kind | Severity | File:Line | Problem | Required fix | Scope |
|---|---|---|---|---|---|---|
| 1 | Sibling omission | medium | `.github/workflows/fixture-machine.yml:2-6`; guard at `pdlc/engine/__tests__/ci-arrangement.test.js:665` | The v6 §3-1 fix corrected the count word in `publish.yml` and guarded **that file only** (`readText(publishWorkflowPath)`), leaving the same-shape sibling unhandled. `fixture-machine.yml`'s own header says this is "a NEW, additive workflow file — not `pr-tests.yml`, **whose five rendered check names are BR-7.5's contract**". BR-7.5 at HEAD (FSPEC v0.8:537-542) says the opposite: "**The exclusion reason is the trigger, not the filename** — a workflow file other than `pr-tests.yml` that declares `on: pull_request` *is* a PR gate and *is* in the set (row 6)." The contract BR-7.5 names is the six-member trigger-derived set, and the file making the five-member claim **is row 6 itself** — it declares `on: pull_request` at `:2`. The claim is self-falsifying, and it is the same defect class, in the same family (PR-gate workflow headers), that v6 raised one file over. The header also still defers to "the erratum raised against TSPEC §12.1", which TSPEC v0.13/v0.14 closed. | Correct `:2-6` to attribute the five-member count to `pr-tests.yml` alone and BR-7.5's contract to the trigger-derived six-member set; drop the settled-erratum caveat. Then widen the new guard from `publishWorkflowPath` to every `PR_GATE_FILES` key plus `publish.yml`, so the family is covered rather than one member. | Local |
| 2 | Adjacent-surface falsification (latent — guard vacuity) | medium | `pdlc/engine/__tests__/ci-arrangement.test.js:678-681` | The count-word guard added for v6 §3-1 matches on a **single-line** regex: `/\b(five|six|…)\b[\s-]+(?:rendered\s+check\s+names?\|PR-gate\s+jobs?'?s?\|PR\s+checks?)/`. `commentText` is built by joining comment lines **with their `#` prefixes intact**, so a count word at end-of-line never reaches its noun across the `\n# ` boundary and the assertion silently finds nothing to check. Verified by mutation: re-wrapping `publish.yml:5` so the comment reads `V-18's five` / `# rendered check names …` leaves the suite **green (31 pass, 0 fail)** on a claim that is false. The guard therefore protects the exact byte layout it was written against, not the rule — and the sibling in finding 1 is wrapped in precisely that way, which is part of why it went unseen. A future comment re-flow, which no reviewer would think of as behavioural, disarms the oracle without a red. | Strip the leading `#` and collapse whitespace before matching (e.g. `commentText.replace(/^\s*#\s?/gm, "").replace(/\s+/g, " ")`), so the count word and its noun are adjacent regardless of wrapping. Re-run the wrap mutation above as the acceptance check: it must go red. | Local |

**Adjacent-surface sweep, delta.** Repo-wide, every ``​`…/.github/workflows/*.yml`​`` path named in a
tracked `.md` was resolved against the filesystem. Exactly one does not exist —
`pdlc/.github/workflows/publish.yml` — and its sole remaining occurrence is inside
`CODE_REVIEW-…-v6.md`, where it is the **quoted text of the defect being recorded**. That is a
correct historical record and must not be "fixed"; the §3-2 guard's scoping to the two binder
documents is what keeps it from reding on its own audit trail. Correctly scoped, not narrow.
`publish.yml`'s rewritten gate comment was checked against the code it describes: the gate job
does carry the fixture-machine legs, and `ci-arrangement.test.js:64-67`'s `PR_GATE_FILES` does
iterate both files, so the comment is true at HEAD.

**Sibling-surface check on the new binding.** `pr-tests.yml`'s header carries no count claim about
the gate set and needs no correction. The plugin channel still needs no release-act binding
(marketplace-distributed, no tag to cut), as established in v6.

**Deferral binding.** All five stay bound: N-1 → `pdlc-plugin-retirement` (row 5), D-DIST-06 →
`pdlc-release-ci` (row 8), D-DIST-07 → `pdlc-engineering-loop` (row 6),
`halt-hardening-followups` → row 22, `engine-v0.2.0` → row 23 + `RELEASE-CHECKLIST` §7. The v6
§3-3 gap is closed: §7 now names the evidence record and the `0.3.0` bump as one commit, and the
guard reds if either disappears. **No unbound deferral this round**, and no new deferral
introduced.

---

## Notes for the remediator

1. **Both findings are one fix each, and they belong together.** Finding 2 is why finding 1 was
   invisible; fixing the regex without fixing the comment leaves a red, and fixing the comment
   without fixing the regex leaves the next re-wrap unguarded. Address in one commit.
2. **Do not widen `PROP-PUB-6` or `deferral-binding.test.js`'s README-conditional** while doing
   this. PROP-PUB-6's `pr-tests.yml` scoping is what lets PROP-GATE-5 discriminate row 6
   (PROPERTIES §5, declared gap 4), and the caveat-conditional is correct deferral lifecycle.
3. **Do not touch `pdlc/engine/package.json`'s version now.** The `0.3.0` bump belongs *after* the
   `engine-v0.2.0` publish evidence lands — that is exactly what §7 now schedules, and bumping
   early would make the §3-3 guard demand `0.4.0`.
4. **§2 rows 3–4 remain spec-acknowledged**, unchanged from v1–v6. Not careless work.
5. **The `documentOracles.test.js` red is environmental.** Remove the untracked `.serena/`,
   `.claude/settings.json` and `.claude/pdlc-wave-state.json`, or read the result in CI.
