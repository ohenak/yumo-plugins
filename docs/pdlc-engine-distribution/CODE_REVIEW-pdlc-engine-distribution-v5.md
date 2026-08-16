# CODE REVIEW — pdlc-engine-distribution (v5)

| Field | Detail |
|---|---|
| Feature | pdlc-engine-distribution |
| Branch | feat-pdlc-engine-distribution |
| Review version | 5 |
| Date | 2026-08-16 |
| Verdict | Findings |
| Branch coverage (lowest new module) | 86.52% (`pdlc/workflows/build-runtime.mjs`, carried from v4 — no new production module this round) |
| Requirements traced | 26/30 |

**On the version number.** The dispatch named `v2`. `CODE_REVIEW-…-v2.md`, `-v3.md` and
`-v4.md` already exist and are **tracked on this branch**; review history is append-only,
so writing `v2` would have destroyed a committed round. The next free integer is `v5`.
This is the same stale-version dispatch v4 recorded and resolved the same way. **Scope is
the delta re-verification the dispatch asked for**, measured against `v4` (the actual
predecessor), not against `v1` (the file the dispatch named).

**Remediation window.** Two commits since v4 (`101b349d`):

- `3605092b` — `fix(engine): bump past the published 0.1.0 and guard the skew (CR v4 §2-1/§2-2, §3-1, §3-2)`
- `3720ee98` — `fix(queue): bind the halt-hardening follow-ups deferral to a queue row (CR v4 §3-3)`

**Suites executed this round.** `pdlc/engine` `npm test`: **829 tests, 827 pass, 0 fail,
2 skipped** (`PDLC_LIVE=1` opt-ins) — up 4 from v4's 825, matching the 4 tests the
remediation added. `documentOracles.test.js`: 60 pass, **1 fail**, the same
`coveredViolations(LIVE_ROOT)` red as every prior round, re-confirmed mechanically as
local-environment noise — all three offending paths (`.claude/workflows/orchestrate-dev.js`,
`.serena/cache/typescript/raw_document_symbols.pkl`, `.tokensave/tokensave.db`) return
`untracked` under `git ls-files --error-unmatch`. Not a defect; green in CI.
`node pdlc/workflows/build-runtime.mjs --check` exits **0**, all five artifacts in-sync.

---

## §1 Prior-Finding Re-Verification

Every v4 finding traced to a production path **and** to a test that goes RED if the fix is
reverted. Redness was established by mutation, not by reading the assertion.

| # | v4 finding | Fix path | Guard | Mutation applied | Result | Status |
|---|---|---|---|---|---|---|
| 1 | §3-1 adjacent-surface falsification (manifest claims published `0.1.0`) | `pdlc/engine/package.json` `version` 0.1.0 → **0.2.0**; `package-lock.json` both sites 0.2.0 | `__tests__/version-skew.test.js` tests 1–2 | reverted `version` to `0.1.0` | **RED** (`not ok 1`, `not ok 2`) — and green again on restore | **Remediated** |
| 2 | §3-2 sibling omission (headless-engine README block lacks the pre-merge caveat its sibling carries) | `pdlc/README.md:157-162` adds the caveat + `npm i -g ./pdlc/engine` HEAD path | `__tests__/version-skew.test.js` test 3 | stripped the caveat line | **RED** (`not ok 3`) | **Remediated** |
| 3 | §3-3 unbound deferral (`docs/ideas/halt-hardening-followups.md`) | `docs/_queue/QUEUE.md` row 22 `pdlc-halt-hardening-followups`, `blocked`, + prose note naming the file | `__tests__/deferral-binding.test.js` | deleted row 22 **and** redacted the path from the prose note | **RED** (`not ok 1`) | **Remediated** |
| 4 | §2-3 AC-4.4 revert half | unchanged | unchanged | — | carried forward | **Spec-acknowledged** (PLAN §2 AT-4.4) |
| 5 | §2-4 AC-6.2 bundle-side run-bound | unchanged | unchanged | — | carried forward | **Spec-acknowledged** (TSPEC §7.3) |

None of the three guards is assertion-free or stub-backed. `deferral-binding.test.js`
carries a `if (ideas.length === 0) return;` vacuity guard, but it is not vacuous on this
tree — two files are tracked under `docs/ideas/`, and the oracle discriminates: it reds
when the binder text stops naming the path, not merely when the file exists.

**Criteria 1–3 on the remediation diff.** Clean. The diff touches six tracked files plus
two new test files: no `TODO`/`FIXME`/`NotImplementedError`, no mock or seed data, no
placeholder URL, no unwired import. No production module was added, so criterion 4's
per-module floor has nothing new to measure; v4's measured floor stands.

---

## §2 Requirements Traceability (carried forward from v4, updated only where remediation touched)

| # | Source | Criterion / AC | Implementation path | Test path | Gap? | Severity | Scope |
|---|---|---|---|---|---|---|---|
| 1 | REQ AC-2.1 | Documented one-command install ⇒ CLI on `PATH`, AC-1.4 triple, handshake reached | `pdlc/README.md:153-162`; `pdlc/engine/package.json@0.2.0` | `fixture-machine.mjs:459-507` (locally packed HEAD tarball); `version-skew.test.js` | **YES** (narrowed) | medium (was high) | Local |
| 2 | REQ AC-2.2 | Documented upgrade ⇒ consumer repos execute N+1 | `pdlc/README.md:154` | `fixture-machine.mjs:510` `upgradeInstall` (local tarball) | **YES** (narrowed) | medium (was high) | Local |
| 3 | REQ AC-4.4 | Anti-echo: revert half | `lib/handshake.mjs` | `version-doctor.test.js:359` (change half); `EVIDENCE-AT-4.4.md` (one-time) | **YES** | medium | Local |
| 4 | REQ AC-6.2 | Bundle-side run-bound load root | `lib/provenance.mjs`, `lib/run.mjs` | `run.test.js`, `workflow-roots.test.js`; `EVIDENCE-AT-6.2.md` | **YES** | medium | Local |

Rows 5–30 unchanged from v4 and not re-scanned, per delta-round scope.

**Rows 1–2 narrowed, not closed — and the reason matters.** v4's required fix had three
parts: bump the manifest, qualify the README, **and cut a successor tag so `@latest`
resolves feature-complete bytes**. The first two landed and are guarded. The third did
not, and *cannot* land pre-merge: `publish.yml` is tag-triggered, and C-7 makes the
registry hold only what a tag cut. So the in-tree half of these ACs is now complete and
mechanically defended — HEAD can no longer claim a number that names older immutable
bytes — while the operator-visible half still resolves to `0.1.0`, which predates this
branch's pin ladder, doctor routing and launcher hop.

That residue is honestly disclosed rather than hidden (README caveat, REQ NG-5 note,
TSPEC §5.1 row), which is why severity drops from high to medium. It is **not** closed,
because an operator running the documented command today still does not get this
feature's engine. The actionable work left is not more code — it is the binding in §3-1.

---

## §3 Integration-Boundary Findings (criterion 6, delta only)

| # | Kind | Severity | File:Line | Problem | Required fix | Scope |
|---|---|---|---|---|---|---|
| 1 | Unbound deferral | high | `pdlc/README.md:157-158`; `docs/pdlc-engine-distribution/REQ-…:191-201`; `TSPEC-…:205` | The remediation resolves v4 §3-1 by **deferring** the actual delivery: "*Until this work merges and its successor tag is cut, `@latest` resolves to `0.1.0`*". That successor tag is named **nowhere binding**. `grep` for `engine-v0.2.0` across `docs/`, `pdlc/` and `.github/` returns **zero** hits: no `docs/_queue/QUEUE.md` row, no successor REQ, no `pdlc/RELEASE-CHECKLIST.md` item (its §6 covers plugin release 0.23.0; the engine channel has no section). Criterion 6(b) is explicit that prose — including a README caveat and a REQ note — is not a successor. Row 8 `pdlc-release-ci` does not cover it either: it is `blocked`, `Depends-On pdlc-engine-distribution`, and its D-DIST-06 remainder is release *automation*, not this one-off cut. Post-merge the caveat also goes stale in its own first clause while its substance silently becomes permanent. | Bind the cut: a `QUEUE.md` row (or a `pdlc/RELEASE-CHECKLIST.md` engine-channel section) naming `engine-v0.2.0` as the tag that discharges AC-2.1/AC-2.2, so §2 rows 1–2 have a dated owner rather than a conditional sentence whose condition nothing schedules. | Local |

**Adjacent-surface sweep, delta.** The version bump's blast radius was swept for stale
co-references: `grep '0\.1\.0'` over `pdlc/engine/__tests__/`, `pdlc/engine/scripts/` and
`PROPERTIES-…md` returns **nothing**, so no transcribed count, packed-member assertion or
preflight fixture was silently falsified by the bump; `package-lock.json` moved in step at
both sites (root and the self-referential package entry), so `npm ci` cannot reintroduce
the old number. `EVIDENCE-BR-3.9.md` correctly left untouched — it is a dated record of
what was published, not a claim about HEAD. v4 §3-2's own fix did not falsify its sibling:
the `## Install in another repo` caveat is still present and is pinned by test 3's
`siblingCaveat` assertion.

**Deferral binding, remainder.** The four deferrals this feature previously owned all stay
bound: N-1 → `pdlc-plugin-retirement` (row 5), D-DIST-06 → `pdlc-release-ci` (row 8),
D-DIST-07 → `pdlc-engineering-loop` (row 6), and — newly, this round —
`halt-hardening-followups` → row 22. Finding 1 is the one deferral the remediation
*created* while discharging v4 §3-1.

---

## Notes for the remediator

1. **Finding §3-1 is a binding, not a code change.** One queue row (or one
   RELEASE-CHECKLIST section) closes it. Do not attempt to publish from the branch to
   make §2 rows 1–2 green — C-7 and PF-1 both forbid it, and v4 §3-1 exists precisely
   because someone reached for the registry too early.
2. **Do not edit `EVIDENCE-BR-3.9.md`** — unchanged guidance from v4, and correctly
   honoured this round.
3. **`version-skew.test.js` is a ratchet, by design.** Once `engine-v0.2.0` publishes and
   its evidence file lands, the oracle reds until `package.json` bumps to `0.3.0`. That is
   the intended forcing function, not a bug — but the release operator should expect it,
   because the test's header comment ("a tag commit is never red on account of its own
   release") is true only *at* the tag commit, not at the first commit after the evidence
   is written. Not recorded as a finding; recorded so it is not debugged twice.
4. **§2 rows 3–4 remain spec-acknowledged**, unchanged from v1–v4 (PLAN §2 AT-4.4's
   one-time observation; TSPEC §7.3's C-4 statement). Standard criterion applies; these are
   not careless work.
5. **The `documentOracles.test.js:246` red is environmental.** Do not "fix" it in code.
   Remove the untracked `.serena/`, `.tokensave/` and `.claude/workflows/` local state, or
   read it in CI.
