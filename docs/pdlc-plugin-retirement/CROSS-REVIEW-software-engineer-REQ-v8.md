# Cross-Review: software-engineer — REQ (delta confirmation)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-plugin-retirement/REQ-pdlc-plugin-retirement.md
**Date:** 2026-08-17
**Iteration:** 8 (erratum delta-confirmation round)

## Scope of this round

Delta confirmation only. Three routed erratum items, the erratum diff
(`06fb8361..HEAD`, +17/-9 on the REQ), and a re-read of the REQ at HEAD to check that the
three edits did not break anything the approved version held. Nothing outside the erratum's
reach is re-litigated.

## Erratum item dispositions

| Item | Routed defect | Landed edit | Disposition |
|---|---|---|---|
| 1 | AC-1.1's `dist/` set-equality with `{M-9}` vs O-3 leaving the manifest's survival open | O-3 (`REQ:553`–`:560`) now decides: the manifest does **not** survive, because it is a retired term of AC-1.2; only *which* surviving directory holds the probe CLI's build stays open for TSPEC | **Resolved.** The two clauses now agree, and the decision is the one the rest of the document already forced: `distribution-manifest` is an enumerated member of AC-1.2's set-equal term list (`REQ:293`), so a surviving copy would red AC-1.2 permanently. The implication is carried, not orphaned — `pdlc/workflows/build-runtime.mjs` writes that name today, and AC-1.2's required-empty search over tracked files reaches it, so the reduced M-7 is obliged to stop emitting it without a new criterion. No engine-side consumer is stranded: at HEAD the only `pdlc/engine/**` occurrences of the name are the two `__tests__/fixtures/consumer-ac12/` files that AC-1.2's §6.1 prose already deletes with their consumer. |
| 2 | AC-5.2's allowed-difference set omitted `engineVersion`/`pluginVersion` and `dispatches`/`outcomes`, so the criterion fails on a correct sweep | AC-5.2 (`REQ:462`–`:466`) now names the provenance version values and the dispatch/outcome collections, compared for presence not content | **Partially resolved — see F-01.** The four named values are correctly exempted and the code claims re-verify (`pdlc/engine/lib/provenance.mjs:11`–`:12`; `pdlc/engine/lib/report.mjs:21`, construction at `:84`–`:104`). But the enumeration was widened by four members rather than converted to a rule, and the same engine block carries six more values in exactly the same class. The criterion read literally still fails on a correct sweep. |
| 3 | AC-4.3 required detecting a *hand-modified* file that no post-sweep artifact can detect | AC-4.3 (`REQ:440`–`:447`) now scopes to an **unexpected entry** — one the cleanup's expected set does not name — states the exclusion and its reason, and keeps the "exits non-zero" refusal status | **Landed at AC-4.3, but the constraint it cites was not carried — see F-02.** The criterion text is now decidable and matches FSPEC §3.5/E-16a. The residue is C-9, the constraint AC-4.3 cites as its authority, which still holds the cleanup to the retired sync tooling's conservatism toward hand-edited files. |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Cross-Feature | **AC-5.2's widened allowed-difference set is still an incomplete enumeration over the engine block, so the criterion read literally still fails on a correct sweep — the exact defect erratum 2 was raised to close.** The edit added `engineVersion`, `pluginVersion`, `dispatches` and `outcomes`. `buildEngineBlock()` (`pdlc/engine/lib/report.mjs:84`–`:104`) returns fourteen more values, of which at least six vary between two *correct* runs and are outside every enumerated allowance: `retries` (`:98`, a row per retry — nondeterministic, depends on transient API failure), `pauses` (`:99`, the adapter's rate-limit pause log — depends on live rate limiting), `denials` (`:100`), `authSources` (`:91`, one `{skill, phase, attempt, apiKeySource}` row per dispatch, so it moves whenever `retries` moves), `startup` (`:93`, the six-rung ladder), and `loop` (`:102`, `{iterations, …}` for `pdlc queue --loop`). BL-08's baseline is a *different* run of a *different* feature, so equality on these is not merely unlikely, it is unattainable. Fix: stop enumerating members and state the class — field-set equality still binds every field, and content equality is waived for feature name, timestamps, ids, paths, the provenance version values, and the run-variable per-run logs and counters of the engine block, which are compared for presence and shape only. A class rule also survives the next field the engine adds; a member list reds the day it lands. | §6.5 AC-5.2 (`REQ:462`–`:466`) |
| F-02 | High | Local | **AC-4.3 dropped the hand-modified case but C-9 — the constraint AC-4.3 cites as its authority — still requires it, so the REQ now contradicts itself in the direction of consumer data loss.** C-9 (`REQ:262`–`:264`) reads: "the cleanup step is at least as conservative as the retired sync tooling was toward a hand-edited or unattributable file." The retired tooling was demonstrably conservative there: `pdlc/hooks/scripts/sync-workflows.sh:9` overwrites `local-edit`/`unverified` entries only under `--force`. AC-4.3 as edited, and FSPEC E-16a which it now agrees with, delete a hand-modified file at an expected name without refusal. A TSPEC author reading AC-4.3 and C-9 together gets opposite instructions about deleting a file the operator hand-edited (NG-6). The fix belongs in C-9, not in AC-4.3 — the detection C-9 presumes died with the sync manifest that held the hashes. Restate C-9's second clause as the conservatism that is still achievable post-sweep: the cleanup removes only entries its own expected set names, refuses and exits non-zero on anything else, and reports every path it removed, so a hand-edited expected entry is reported rather than silently lost. Cross-referencing note: the same sentence in C-9 is what FSPEC §7.2's erratum text is written against, so both documents settle once C-9 moves. | §5 C-9 (`REQ:262`–`:264`) vs §6.4 AC-4.3 (`REQ:440`–`:447`) |
| F-03 | Low | Local | **AC-5.2's new rationale sentence miscounts its own referent and misstates why two of the four exemptions are needed.** "Those last three vary between two *correct* runs" follows a list whose tail is four values across two noun phrases, so "three" resolves to nothing on the page. And `engineVersion`/`pluginVersion` do not vary between two correct runs of the same installed pair — they vary between the BL-08 pre-sweep baseline and the post-sweep run *because the sweep moves the plugin's version* (BL-07's declared range makes that explicit). Two distinct exemption reasons are being carried by one clause. Suggested: drop the count word, and separate the two rationales — provenance versions differ because the sweep changes them by design, run logs differ because they are run-variable. Normative content is unaffected; the enumerated set is what binds. | §6.5 AC-5.2 (`REQ:464`–`:466`) |

FINDING: High | delta | local | §6.5 AC-5.2 | Widened allowed-difference set is still an incomplete enumeration; `retries`, `pauses`, `denials`, `authSources`, `startup`, `loop` are in the same class and remain unexempted, so the criterion still fails on a correct sweep.
FINDING: High | delta | nonlocal | §5 C-9 vs §6.4 AC-4.3 | AC-4.3's hand-modified carve-out contradicts C-9, the constraint it cites, which still holds the cleanup to the retired sync tooling's conservatism toward hand-edited files.
FINDING: Low | delta | local | §6.5 AC-5.2 rationale | "Those last three" has four referents, and the provenance versions differ for a different reason than the run-variable collections do.

## Questions

| ID | Question |
|----|---------|
| Q-01 | F-01's fix waives content equality on the run-variable collections. Is "present, and of the declared shape (array vs object)" the intended residual assertion, or presence of the key alone? The former is barely more expensive and catches a collection that silently degrades to `null` with the deleted machinery, which is what NG-3 is guarding. |
| Q-02 | With the manifest decided retired (erratum 1), the reduced `build-runtime.mjs` loses its `--check` mode's comparison basis. AC-1.2 forces the name out of tracked files, but no criterion states whether the surviving build keeps a self-check at all. Intentionally TSPEC material, or an AC-1.1 clause that went missing with the manifest? |

## Positive Observations

- **All three errata were addressed at the right altitude, and none was absorbed by weakening a criterion.** Erratum 1 resolved an open question by deriving the answer the rest of the document already forced, rather than choosing freely; erratum 3 removed an undecidable obligation and *said why* in the criterion, which is what stops a later reader re-adding it.
- **Erratum 1's decision is verified against the tree, not just internally consistent.** No surviving `pdlc/engine/**` code reads `distribution-manifest`; the only occurrences are fixtures already scheduled for deletion. The manifest can retire without stranding the engine channel.
- **Erratum 2's code claims re-verify exactly as cited**, and AC-5.2 keeps field-set equality binding while waiving only content — the right shape for the criterion. F-01 is about the membership of the waived set, not the design.
- **The erratum stayed inside its blast radius.** The diff is +17/-9 across three sections; the re-read found no unrelated edit and no collateral change to AC-1.2's term set, A-1, or the C-6/C-7 baselines.


## Recommendation

**Needs revision**

Two High findings, both cheap and both textual — no re-derivation, no re-measurement. F-01 replaces AC-5.2's member list with a class rule; F-02 amends C-9's second clause so the constraint matches the criterion that cites it. F-03 can ride along in the same edit. Neither High reopens anything the approved REQ settled: F-01 is the unfinished half of erratum 2, and F-02 is erratum 3's landing site one sentence upstream. A third erratum round is the right vehicle if the orchestrator has one; both fixes are single-paragraph.


## Verdict

VERDICT: Needs revision
{"high": 2, "medium": 0, "low": 1}
