# Cross-Review: product-manager — TSPEC (round 14, frozen round)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-engine-distribution/TSPEC-pdlc-engine-distribution.md (v0.14)
**Date:** 2026-08-16
**Iteration:** 14
**Scope:** Delta only, against `c1d7f0e7` (the v0.13 bytes I reviewed in round 13). Decision freeze respected — no new decision opened here.

## 1. Scope confirmation

Four TSPEC commits since `c1d7f0e7` (`778f2dc1`, `a9dd9cc1`, `d06d0a8c`, `d6df5015`),
64 insertions / 23 deletions, touching: the lineage version row, the v0.14 changelog row,
§3.1's handshake/startup row, §5.1 (one new paragraph, the owed-absorption owner), §6.5's
render-site paragraphs, §8.1's `gate` row, §8.2's opening and its third reason, §8.5's
gate-command bullet, §10.1's S-7 and §14's K-1.

Nothing outside those sections moved. §5.4 is byte-unchanged, as the changelog says.

## 2. Grounding the delta at HEAD

Every load-bearing claim the delta adds, checked against code rather than against the prose:

| Claim | Evidence at HEAD |
|---|---|
| §8.5: T49's expected side is **derived** by iterating `PR_GATE_FILES`, not a hand-maintained five | `ci-arrangement.test.js:685-689` builds `expectedCommands` over `Object.entries(PR_GATE_FILES)`; `:64-66` maps both files; compared with `assertSetEqual` (`:694-696`), both directions |
| §8.5 / §8.2: `publish.yml`'s `gate` carries `fixture-machine.yml`'s legs | `publish.yml:170` (`Launcher real-spawn legs`), `:174` (`Fixture-machine legs`) |
| §8.5: the smaller equality would drop AT-2.3…AT-2.6 (AC-2.2…AC-2.5) | `FSPEC:551` row 6, `FSPEC:749-761`; the same reason is written at `ci-arrangement.test.js:661-663` |
| §8.5's cited test name is exact | `ci-arrangement.test.js:666` — `T49: ci arrangement — publish.yml/PR-gate gate-command set-equality (§8.2, §8.5)` |
| §8.1 / §8.2 / §14 K-1: six PR-gate jobs at HEAD (five + one) | `GATE_JOB_IDS` `:47`, `FIXTURE_MACHINE_JOB_IDS = ["fixture-machine"]` `:55`; `fixture-machine.yml:42-43` declares exactly one job |
| §8.2: "adds none to `fixture-machine.yml` either", so V-18's **six** rendered names are untouched | job-set set-equality at `ci-arrangement.test.js:508-521`, rendered-name equality `:523-533`, file-scope trigger derivation `:552-564` — an added job reddens, so the claim is oracle-backed, not asserted |
| §6.5 / §3.1 / §10.1: **five** `formatStartup` call sites in `bin/cli.mjs` | `bin/cli.mjs:491`, `:655`, `:669`, `:689`, `:704` — five, exactly |
| §6.5: `cmdDoctor` flattens `result.notices` on its own path | `bin/cli.mjs:458` (`typeof notice === "string" ? notice : notice.text`), inside `cmdDoctor` (`:451`) |
| §6.5: the notice reaches the operator on `doctor` too (no user harm) | same line — it is printed, not swallowed |

Round-13's PM F-01 (Medium) is **resolved**: the "single render site" claim is now scoped to
the pipeline surfaces in all three places that carried it (§3.1, §6.5, §10.1 S-7), and
`cmdDoctor`'s own copy is named. No §12.1 oracle keyed on the singleness, so nothing went red
in the spec's test text — checked.

Round-13's PM F-02 and F-03 (both Low, both on §5.4) are correctly **not** addressed: §5.4 was
frozen this round.

## 3. Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | **§5.1's new owed-absorption paragraph assigns the debt to work that is already finished at HEAD.** It says the remainder is "owned by the PLAN task that builds §8.5's arrangement oracle (the task that edits `ci-arrangement.test.js`)" and that "that task's Definition of Done includes transcribing the six-row set and BR-7.7 into this section". The two PLAN tasks that edit that file are **T17 and T49, both `✅` at HEAD** (`PLAN:190`, `:220`), the file exists and carries T49 (`ci-arrangement.test.js:666`), and Phase I is complete. The stated fallback — "if Phase T re-opens this TSPEC for any other reason **before Phase P**" — is also unreachable, since Phase P closed long ago. So the paragraph reads as tracking, but names no owner who can act: the debt is, in fact, unowned. No acceptance-criterion exposure (the substantive re-grounding of §5.1's six rows landed this round in §3.2's V-18/V-19 and §8.5), which is why this is not gating. One-line fix when a round next opens §5.1: name Phase DOD's verifier, or this feature's LEARNINGS harvest, as the holder | AC-1.3 / BR-7.7 (REQ-EDIST-01) |
| F-02 | Low | Local | **§6.5's "five call sites" sentence enumerates six surfaces.** "`dev`, `queue`, `queue --loop`, both `--dry-run` surfaces and the refusal path are the **five `formatStartup` call sites**" — the *total* is right (`:491`, `:655`, `:669`, `:689`, `:704`) but the mapping is not one-to-one: both `--dry-run` surfaces share **one** site (`emitDryRun`, `:491`), and the refusal path is **two** (`:655` in `cmdDev`, `:689` in `cmdQueue`). A reader checking the enumeration against the file finds six names over five sites and has to re-derive which is which. Say "five call sites serving those six surfaces" | AC-5.6 (REQ-EDIST-05) |
| F-03 | Low | Local | **v13 F-02 carried unchanged.** §5.4's derivation still merges a four-member manifest-adjacent/`bin/` bucket where FSPEC §5.2 counts three classes as 1 + 1 + 2 (`FSPEC:509-511`). §5.4 was untouched this round, correctly so under the freeze | AC-1.3 (REQ-EDIST-01) |
| F-04 | Low | Local | **v13 F-03 carried unchanged.** §5.4's line-anchor into FSPEC §5.2 no longer covers the `23/24` value it points at. Nothing false; the pointer is imprecise. Frozen section, not touched | AC-1.3 (REQ-EDIST-01) |

DEFERRED: §5.1's owed FSPEC v0.3–v0.7 section-by-section re-grounding still has no reachable owner (F-01) — route to Phase DOD or harvest rather than to a closed PLAN task.
DEFERRED: `PLAN:220`'s T49 row still describes `gate` as "the five PR-gate job bodies duplicated", which is now the smaller set this TSPEC round just corrected and which `publish.yml` does not implement (it carries six). PLAN is downstream of this document, so this is for PLAN's own round, not an erratum against it here.
DEFERRED: §5.4's `1 + 1 + 2 + 15 + 3 + 1 + 0/1` re-spelling and its FSPEC line-anchor (F-03, F-04), for whenever a round next opens §5.4.

## 4. Questions

| ID | Question |
|----|---------|
| Q-01 | Round 13's Q-01 is answered in §6.5 — routing `cmdDoctor` through `formatStartup` is cheap but unscheduled, since no criterion requires it. I accept that answer and am not re-raising it. |

## 5. Positive Observations

- **The blocking finding was fixed at the rule, not at the sentence.** TE F-51 could have been
  closed by changing "five" to "six" in §8.5. Instead the equality is now stated over §5.1's
  trigger-derived set with the expected side explicitly **derived from `PR_GATE_FILES`** — which
  is what the shipped test actually does (`ci-arrangement.test.js:685-689`), and which means the
  next PR-gating workflow cannot be gated on weaker evidence at the tag than at the PR.
- **All four repetitions of the smaller set were brought along.** §8.1's `gate` row, §8.2's
  opening and third reason, and §14's K-1 all moved in the same round, plus §8.1's dangling
  "V-18's five rendered check names" → six. A count corrected in one section and left standing
  in four is the drift this document has been paying for; this round did not add another.
- **TE Q-28 is answered with a word, then with its consequence.** "Derived" — and then: a future
  PR-gating workflow is a **two-file** edit and T49 goes red until the second lands. That is a
  falsifiable statement about the oracle, and it holds at HEAD.
- **The `doctor` scoping is honest rather than tidy.** The easy move was to delete the
  inconvenient sentence. §6.5 instead names the divergence, says why it harms no operator, says
  why AC-5.6 is not exposed, and says explicitly what oracle a later reader must *not* author
  from it. That is the sentence that stops a correct `doctor` going red in six months.
- **The reason travelled from the code review into the spec intact.** §8.5 now carries the same
  argument as `ci-arrangement.test.js:661-663` — fixture-machine's legs carry AT-2.3…AT-2.6, so
  a tag gated without them is gated on weaker evidence *with the suite green*. Spec and oracle
  saying the same thing in the same words is what makes both auditable.

## 6. Recommendation

**Approved with minor changes.**

The round's blocking finding is fixed in the strongest available form, and I re-derived it from
the workflows and the test rather than from the changelog: six PR-gate jobs across two
trigger-derived files, a derived expected set, both-directions set-equality, and `publish.yml`'s
gate carrying the fixture-machine legs. The scoping of the render-site claim is accurate against
`bin/cli.mjs`'s five call sites and names `cmdDoctor` honestly.

Nothing previously approved was broken. One Medium — an ownership assignment pointing at PLAN
tasks that are already `✅` — and three Lows, two of them carried forward on a section this
round correctly did not touch.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 3}

APPROVAL-HASH: sha256:440711317830ec2cc111e58be51a5610ba174906eb1cd6c206e68e508b703833
APPROVAL-HASH-NORMALIZED: sha256:e44d553fcde903dd98c94d46b42d4091a7e9337c47aff045d7549bef03589495
REVIEWED-COMMIT: d6df50155749164a70935dc50a32ed48438785b2
UPSTREAM-STATE: REQ sha256:44d0e18836f534cb68444f6e5a0b26eebf3d2aafe7f7630ce1f38fed78b1d00f
UPSTREAM-STATE: FSPEC sha256:5ffc38a7f6ff1b19d31250a7d54dce32c3498941723cfb3f35102d2004027b06
