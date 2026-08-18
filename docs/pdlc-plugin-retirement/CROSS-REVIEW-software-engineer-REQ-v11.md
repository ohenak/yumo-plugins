# Cross-Review: software-engineer — REQ (delta confirmation, decision freeze)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-plugin-retirement/REQ-pdlc-plugin-retirement.md
**Date:** 2026-08-18
**Iteration:** 11

## Scope of this round

Delta confirmation only, under decision freeze. Diff reviewed: `cc009367..HEAD` on the REQ —
four commits (`76591d1e`, `134fec23`, `0a5e6a15`, `a5cb6322`), +39/-9, touching three body
sites (§5 C-5 wave-gate commit-class entry `REQ:232`–`:239`; §6.1 AC-1.2 wave-gate term
`REQ:323`–`:331`; §A-1 skill-file paragraph `REQ:337`–`:344`), one new obligation
(§Obligations O-8, `REQ:616`–`:633`) and changelog rows v0.13–v0.15.

Every load-bearing claim the delta adds was checked against the repository at HEAD, not
against the previous round's summary of it.

## Delta claim verification

| Claim added by delta | Verified at HEAD | Verdict |
|---|---|---|
| `postWaveCommand`/`postWavePathspecs` survive the sweep; parser and config value both stay | `pdlc/workflows/orchestrate-dev.js:168` (`Object.freeze([])` default), `:218`–`:245` (parse/validate), `:14416` (use); `.claude/pdlc.config.example.json:1` carries both values verbatim | Accurate |
| Reduced build step still emits M-9 into `pdlc/workflows/dist/` under O-3 | `pdlc/workflows/dist/` at HEAD holds the five measured files incl. `pdlc-cli.mjs` (M-9); `pdlc/workflows/__tests__/consolidationPreflight.test.js:207`–`:208` pins both settings | Accurate |
| M-11h is a prose-and-assertion edit class, not a mechanism deletion | Consistent with `docs/_constraints/pdlc-retirement-baseline.md:34`–`:39`, `:78`, `:149`–`:151` after the same erratum re-measurement | Consistent |
| `consolidate-learnings/SKILL.md` names a retired bundle with no surviving host | `pdlc/skills/consolidate-learnings/SKILL.md:8`–`:14` names `pdlc/workflows/dist/consolidate-learnings.bundle.js` and states the skill delegates rather than performs | Accurate |
| Queue Order 24 `pdlc-consolidation-rehost` exists, raised before the first deletion commit | `docs/_queue/QUEUE.md:86` (row 24, status `pending`), rationale note `:88`–`:93` | Accurate |
| Named successor REQ exists and ships `ready: false` | `docs/pdlc-consolidation-rehost/REQ-pdlc-consolidation-rehost.md:3` (`ready: false`), `:12`, `:69` restate the gate; O-1 records the operator question | Accurate |
| The operator's veto is *mechanically* enforced by the draft-pickup gate | `pdlc/workflows/orchestrate-queue.js:257` (`ready: true|false` — gate), `:268` (default `{ready:false}`), `:284`–`:296` (parse; only literal `true` admits), `:24` header contract | Accurate — the claim is machinery-backed, not prose-backed |
| Option (a) rests on recorded direction, not a fresh ruling | `docs/completed/pdlc-headless-engine/REQ-pdlc-headless-engine.md:13`, `:45`, `:273` record the 2026-08-08 operator direction; NG-5's carve-out at `REQ:195` | Accurate |

The O-8 edit closes what v9/v10 could only note as an unbound deferral: the obligation now
names a queue row, a REQ path and a gate that refuses pickup, all three of which exist at HEAD.
Nothing in the delta widens sweep scope — the engine-side re-host stays outside this feature
per NG-5, and A-1's paragraph explicitly hands "what the pass then is" to O-8 rather than
deciding it inside the sweep, so §A-1 and O-8 do not contradict each other.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Cross-Feature | **Inherited, unchanged since v9, delta did not touch it.** C-9 (`REQ:279`–`:282`) still says no post-sweep artifact records hashes. `.claude/workflows/.pdlc-sync-manifest.json` carries per-row `consumerHash` (written `pdlc/hooks/scripts/sync-workflows.sh:505`, `:527`; read `:139`) in a tree the sweep never reaches. The scope decision is sound; only the stated reason is wrong — deliberate choice, not impossibility. | §5 C-9 |
| F-02 | Medium | Local | **Inherited, unchanged since v9, delta did not touch it.** AC-4.1's observable removal names two artifacts where the directory holds four after a real sync (`.pdlc-sync-manifest.json` `sync-workflows.sh:464`, `.pdlc-backups/` `:611`), and AC-4.3 turns the expected-entry set into a guaranteed refusal. Single-sentence fix whenever the document is next opened. | §6.4 AC-4.1 / AC-4.3 |
| F-03 | Low | Local | Changelog row v0.15 (`REQ:20`) and O-8 (`REQ:616`–`:633`) restate the same binding at near-full length; the obligation is the single source and the changelog row could cite it. Cosmetic. | §Changelog |

No High findings. Both Mediums are inherited/nonlocal — they sit in sections the delta did not
edit and were already recorded non-gating in v9 and v10. Nothing the delta introduced broke
behaviour that worked before, and no claim it adds contradicts the repository at HEAD.

DEFERRED: successor REQ `docs/pdlc-consolidation-rehost/REQ-pdlc-consolidation-rehost.md` §4 is a placeholder AC set — correct for a `ready: false` draft, but it must be authored in full before that row can be picked up.
DEFERRED: row 24's `Depends-On` names `pdlc-headless-engine`, which is no longer in the queue table; it resolves through Phase-0 readiness triage against the base branch, as rows 4/5/6/19/20 already do.

## Questions

| ID | Question |
|----|---------|
| Q-01 | Carried from v8–v10, still non-gating: AC-5.2 compares eight run-variable collections — is the enumeration set-equality-checked anywhere, or containment-checked? A deleted collection should fail the check. |

## Positive Observations

- **The veto claim is machinery-backed, not asserted.** O-8 says the operator's veto is
  mechanically enforced, and `orchestrate-queue.js:268`/`:284`–`:296` do enforce it: a REQ
  without literal `ready: true` degrades to not-pickable by default, so the draft cannot be
  picked up by accident even though its row reads `pending`.
- **Both halves of the binding were raised before the first deletion commit**, which is what
  makes O-8 a bound obligation rather than a promise — the queue row and the REQ file both
  exist at HEAD.
- **Delta radius clean.** The three body sites plus O-8 are the whole change; AC-1.1's
  set-equality terms, C-7's held-class paragraph, C-8 and the §6.4 text are byte-identical to
  what I reviewed at v10, which I re-read rather than assumed.

## Recommendation

**Approved with minor changes**

Under decision freeze, neither blocking condition is met: the delta introduced no defect, and
no claim it adds is false against the repository at HEAD — all nine load-bearing claims were
checked against source files and hold. The two inherited Mediums and one Low are
single-sentence corrections that change no criterion's verdict.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 1}
