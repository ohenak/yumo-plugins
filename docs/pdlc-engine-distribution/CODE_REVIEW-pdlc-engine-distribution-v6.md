# CODE REVIEW — pdlc-engine-distribution (v6)

| Field | Detail |
|---|---|
| Feature | pdlc-engine-distribution |
| Branch | feat-pdlc-engine-distribution |
| Review version | 6 |
| Date | 2026-08-16 |
| Verdict | Findings |
| Branch coverage (lowest new module) | 86.52% (`pdlc/workflows/build-runtime.mjs`, carried from v4 — no production module changed this round) |
| Requirements traced | 26/30 |

**On the version number.** The dispatch named `v1`. `CODE_REVIEW-…-v1.md` through `-v5.md`
already exist and are **tracked on this branch**; review history is append-only, so writing
`v1` would have destroyed five committed rounds. The next free integer is `v6`. This is the
third consecutive stale-version dispatch (v4 and v5 recorded and resolved it the same way).
**Scope is the delta re-verification**, measured against `v5` (the actual predecessor).

**Remediation window.** One fix commit since v5 (`65ac6abc`):

- `f02d5156` — `fix(pdlc-engine-distribution): bind the engine-v0.2.0 successor cut (CODE_REVIEW v5 §3-1)`

The other 47 commits in the window are Phase-R/F/T/P/PT document churn (REQ v0.12, FSPEC
v0.8, TSPEC v0.14, PLAN v0.18, PROPERTIES v0.9 and their cross-reviews). **No production
file changed since v5** — the diff touches docs, `pdlc/RELEASE-CHECKLIST.md` and one test
file. That does not make the window inert for this review: spec edits can falsify code-side
transcriptions, and §3-1 below is exactly that class.

**Suites executed this round.** `pdlc/engine` `npm test`: **830 tests, 828 pass, 0 fail,
2 skipped** (`PDLC_LIVE=1` opt-ins) — up 1 from v5's 829, matching the one test the
remediation added. `node pdlc/workflows/build-runtime.mjs --check` exits **0**, all five
artifacts in-sync. `documentOracles.test.js`'s `coveredViolations(LIVE_ROOT)` red is the
same untracked-local-state noise recorded in every prior round (`.serena/`,
`.claude/settings.json`, `.claude/pdlc-wave-state.json` are untracked at HEAD); green in CI.

---

## §1 Prior-Finding Re-Verification

| # | v5 finding | Fix path | Guard | Mutation applied | Result | Status |
|---|---|---|---|---|---|---|
| 1 | §3-1 unbound deferral (successor tag `engine-v0.2.0` named nowhere binding) | `docs/_queue/QUEUE.md` row 23 `pdlc-engine-v0.2.0-release` (`blocked`, `Depends-On pdlc-engine-distribution`) + note; `pdlc/RELEASE-CHECKLIST.md` §7 engine-channel section | `__tests__/deferral-binding.test.js` test 2 | (a) renamed the queue row to `pdlc-XXX-release`; (b) restored, then renamed every `engine-v0.2.0` in the checklist | **RED** on both, independently (`not ok 2`); green on restore | **Remediated** |
| 2 | §2 rows 1–2 AC-2.1/AC-2.2 registry residue | unchanged (structurally cannot land pre-merge, C-7) | — | — | now **bound** by finding 1's fix | **Narrowed, still open** |
| 3 | §2 row 3 AC-4.4 revert half | unchanged | unchanged | — | carried forward | **Spec-acknowledged** (PLAN §2 AT-4.4) |
| 4 | §2 row 4 AC-6.2 bundle-side run-bound | unchanged | unchanged | — | carried forward | **Spec-acknowledged** (TSPEC §7.3) |

The new guard is neither assertion-free nor stub-backed, and it is **not vacuous on this
tree**: its trigger substring `"successor tag is cut"` is present at `pdlc/README.md:157`,
so the early return is not taken, and both binders are load-bearing — mutating either one
alone reds it. It is correctly conditional rather than unconditional: once the tag is cut
and the README caveat is rewritten, the binder requirement lapses with it, which is the
right lifecycle for a deferral guard.

**Doc-claim verification (this round's real exposure).** PROPERTIES v0.9 and TSPEC v0.14
both assert things about shipped code. Each was checked against the code rather than read:

- PROP-PUB-7's widening to BR-7.7 ("`publish.yml`'s gate job set-equals the union of *every*
  PR-gate file's gate jobs") — **true at HEAD**: `ci-arrangement.test.js:686` builds
  `expectedCommands` by iterating every `PR_GATE_FILES` entry. Document caught up to code.
- PROPERTIES §5's declared gap 4 ("shipped and red-able in T17's carrier, but named by no
  §2 property") — **accurate**: `ci-arrangement.test.js:552` (file-scope set-equality) and
  `:566` (rendered alphabet across all PR-gate files) both exist and run. An unnamed
  carrier, not an untested rule, exactly as declared.
- TSPEC §6.5 / §10.1 S-7's `notices` channel — **implemented**: `lib/skills.mjs:226-295`
  returns `notices` on every leg, `lib/startup.mjs:376,503` surfaces it, `formatStartup`
  (`:521`) renders it, covered by `plugin-root-notice.test.js` and `startup-announce.test.js`.
- TSPEC v0.14's F-52 scoping of "one render site" to the five `formatStartup` call sites,
  with `cmdDoctor` printing its own copy — **true at HEAD**, and correctly scoped rather
  than asserted, so no oracle was authored against a false singleness claim.

**Criteria 1–3 on the remediation diff.** Clean. No `TODO`/`FIXME`/`NotImplementedError`,
no mock or seed data, no placeholder URL, no unwired import in the window's `pdlc/` diff.
No production module was added or changed, so criterion 4 has nothing new to measure and
v4's floor stands.

---

## §2 Requirements Traceability (carried forward from v5, updated only where remediation touched)

| # | Source | Criterion / AC | Implementation path | Test path | Gap? | Severity | Scope |
|---|---|---|---|---|---|---|---|
| 1 | REQ AC-2.1 | Documented one-command install ⇒ CLI on `PATH`, AC-1.4 triple, handshake reached | `pdlc/README.md:153-162`; `pdlc/engine/package.json@0.2.0`; bound by `QUEUE.md` row 23 + `RELEASE-CHECKLIST.md` §7 | `fixture-machine.mjs:459-507` (locally packed HEAD tarball); `version-skew.test.js`; `deferral-binding.test.js` | **YES** (bound) | medium | Local |
| 2 | REQ AC-2.2 | Documented upgrade ⇒ consumer repos execute N+1 | `pdlc/README.md:154`; same binders | `fixture-machine.mjs:510` `upgradeInstall` (local tarball) | **YES** (bound) | medium | Local |
| 3 | REQ AC-4.4 | Anti-echo: revert half | `lib/handshake.mjs` | `version-doctor.test.js:359` (change half); `EVIDENCE-AT-4.4.md` (one-time) | **YES** | medium | Local |
| 4 | REQ AC-6.2 | Bundle-side run-bound load root | `lib/provenance.mjs`, `lib/run.mjs` | `run.test.js`, `workflow-roots.test.js`; `EVIDENCE-AT-6.2.md` | **YES** | medium | Local |

Rows 5–30 unchanged from v4/v5 and not re-scanned, per delta-round scope.

**Rows 1–2: bound, not delivered — and the distinction is the whole point.** v5 asked for a
binding and got a good one: a queue row with a named discharge act, a RELEASE-CHECKLIST
section with a tag command and an owner, and a test that reds if either disappears while the
caveat stands. What has *not* changed is the operator-visible artifact: `npm i -g
@kaneho/pdlc-engine@latest` still resolves `0.1.0`, bytes that predate this branch's pin
ladder, doctor routing and launcher hop. The AC's final artifact is the published package,
not the tree, and no test pins the published package — `fixture-machine.mjs` packs HEAD
locally, which is the strongest offline oracle available and still not the artifact the AC
names. Severity stays medium: the residue is disclosed in four places, mechanically guarded
in two, and cannot close pre-merge (C-7, PF-1). It closes when row 23 discharges.

---

## §3 Integration-Boundary Findings (criterion 6, delta only)

| # | Kind | Severity | File:Line | Problem | Required fix | Scope |
|---|---|---|---|---|---|---|
| 1 | Adjacent-surface falsification | medium | `.github/workflows/publish.yml:5`, `:24` | Two comments in the publish workflow still transcribe the **five**-check gate that this feature's own row-6 widening retired. `:5` says "so **V-18's five rendered check names** stay untouched" — V-18 at `TSPEC:80` now enumerates **six** (five `pr-tests.yml` jobs plus `fixture-machine`), and `TSPEC:1237` was swept to "V-18's six rendered check names" in the same round. `:24` says the gate job "Re-runs the **five** PR-gate jobs' commands" — but that job re-runs the union over **every** `PR_GATE_FILES` entry, which is what `ci-arrangement.test.js:666` (T49) asserts and what `publish.yml`'s own fixture-machine legs implement. TSPEC v0.14's F-51 sweep fixed the four count references *inside the TSPEC* and stopped at the document boundary; these are the same claim, in the file the claim is about, and they are now false. A maintainer reading `:24` before editing the gate job is told the wrong invariant by the file itself. | Correct both comments to the six-member, trigger-derived, `PR_GATE_FILES`-derived rule (TSPEC §8.5, BR-7.7). Consider whether the count belongs in a comment at all, given that T49 derives it. | Local |
| 2 | Adjacent-surface falsification | low | `docs/_queue/QUEUE.md:85` | Row 23's discharge evidence instructs the operator to "verify **`pdlc/.github/workflows/publish.yml`** runs green". No such path exists — `pdlc/.github/` is not a directory; the workflow is at repo-root `.github/workflows/publish.yml`. The sibling binder got it right (`RELEASE-CHECKLIST.md:241` names the correct path), so the two halves of one binding disagree, and the wrong one is in the artifact a queue reader consults first. Introduced by this round's own remediation. | Correct the path to `.github/workflows/publish.yml`. | Local |
| 3 | Unbound successor step (deferral binding, incomplete) | medium | `pdlc/RELEASE-CHECKLIST.md:230-249` | §7 is the operator's script for discharging row 23, and it stops one step short of a green tree. `version-skew.test.js` harvests published versions from tracked `EVIDENCE-*.md` by `@{name}@X.Y.Z` and `engine-vX.Y.Z` patterns and asserts HEAD's manifest version is **strictly ahead** of every one. BR-3.9/T52 require a real publish to be recorded as dated evidence — that is why `EVIDENCE-BR-3.9.md` exists for `engine-v0.1.0`. So following §7 exactly and then recording the `engine-v0.2.0` publish the way its predecessor was recorded turns the engine suite **red** on `main` until `pdlc/engine/package.json` bumps to `0.3.0`; conversely, never writing the evidence keeps it green by leaving the publish record unwritten. §7 names neither the evidence step nor the bump. v5's note 3 flagged the ratchet as "recorded so it is not debugged twice"; now that a checklist section owns the act, the omission is that section's defect, not a reader's surprise. | Add two checklist items to §7: record the publish in a tracked `EVIDENCE-*.md` (per BR-3.9/T52's precedent), and bump `pdlc/engine/package.json` to `0.3.0` in the same change, so the ratchet's forcing function is scheduled rather than discovered. | Process |

**Adjacent-surface sweep, delta.** The window's doc edits were swept for code-side
transcriptions they falsify. `grep -n "five"` across `.github/workflows/`, `pdlc/engine/lib`,
`pdlc/engine/bin` and `pdlc/engine/scripts` returns 13 hits; 11 are correctly scoped (five
`pr-tests.yml` jobs at `fixture-machine.yml:4`, five seams, five tunables, five templates,
five skill directories, five `formatStartup` call sites, five-key record) and two are
finding 1. `CLAUDE.md`'s CI section still describes the six-check gate and its own oracle
(`ci-arrangement.test.js:614`) is green. `EVIDENCE-BR-3.9.md` correctly untouched again.

**Sibling-surface check on the new binding.** The engine channel gained a release-act
binding this round; its sibling, the plugin channel, does **not** need one — `pdlc` is
distributed from the `ptah` marketplace on the resolved branch (`pdlc/README.md:134-141`),
so plugin `0.23.1` ships by merging, with no tag to cut. §6's "Release 0.23.0" heading is a
dated record of that release, not a claim about HEAD's manifest. No sibling omission.

**Deferral binding, remainder.** All five deferrals stay bound: N-1 → `pdlc-plugin-retirement`
(row 5), D-DIST-06 → `pdlc-release-ci` (row 8), D-DIST-07 → `pdlc-engineering-loop` (row 6),
`halt-hardening-followups` → row 22, and — newly — `engine-v0.2.0` → row 23 plus
RELEASE-CHECKLIST §7. Finding 3 is not a missing binding but an incomplete one.

---

## Notes for the remediator

1. **All three findings are text, not logic.** No production module changes. Findings 1 and
   2 are one-line corrections; finding 3 is two checklist items. None should move an
   assertion, and none should touch `pdlc/engine/package.json`'s version **now** — the
   `0.3.0` bump belongs *after* the `engine-v0.2.0` publish evidence lands, which is
   precisely what finding 3 asks §7 to schedule.
2. **Do not widen `PROP-PUB-6` or `deferral-binding.test.js`'s conditional** while fixing
   finding 1. PROP-PUB-6's `pr-tests.yml` scoping is what lets PROP-GATE-5 discriminate row
   6 (PROPERTIES §5, declared gap 4), and the caveat-conditional guard is correct lifecycle
   design, not a vacuity hole.
3. **PROPERTIES' declared gap 4 is correctly declared and is not counted as a finding here.**
   The rule ships and is red-able in T17's carrier; only the §2 carrier row is missing, and
   minting it is blocked by the Phase CR count freeze. It closes as `PROP-PUB-11` when the
   freeze lifts, per that document's own plan.
4. **§2 rows 3–4 remain spec-acknowledged**, unchanged from v1–v5. Standard criterion
   applies; these are not careless work.
5. **The `documentOracles.test.js` red is environmental.** Do not "fix" it in code — remove
   the untracked `.serena/`, `.claude/settings.json` and `.claude/pdlc-wave-state.json`
   local state, or read the result in CI.
