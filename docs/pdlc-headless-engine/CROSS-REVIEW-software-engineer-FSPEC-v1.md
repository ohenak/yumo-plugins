# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-headless-engine/FSPEC-pdlc-headless-engine.md`
**Date:** 2026-08-11
**Iteration:** 1
**Scope:** technical lens — feasibility, implementability, integration boundaries, oracle derivability

## Grounding

Every claim below was checked against HEAD on `feat-pdlc-headless-engine`, not against the REQ's
own text. What verified clean is in *Positive Observations*; what did not is in *Findings*.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **AT-ENG-45's oracle cannot run hermetically as written.** §10.5 asserts §10.2's five structural clauses "over one hermetic fixture run", and BR-VER-1 fails the suite on any real transport construction. But every artifact those clauses observe is written by the *dispatched agent's* tool calls, not by the modules: `orchestrate-dev.js:5828` and `:7377`/`:9312` only compose the `CROSS-REVIEW-{role}-{doc}-v{N}.md` path *into a prompt*; no module code writes that file, the verdict line, or the approval anchors. With the transport stubbed, no such file is created, so clauses 1–3 have nothing to observe and pass vacuously. Fix by stating what the hermetic double must emulate (a transport double that performs the agent's writes from fixtures, so the oracle sees creation events) or by routing clauses 1–3 to AT-ENG-65's live smoke and leaving clauses 4–5 hermetic. As written, a passing AT-ENG-45 proves nothing. | §10.2, §10.5 AT-ENG-45, §12.4 BR-VER-1 |
| F-02 | High | Local | **Transport selection is unspecified, and the run does not report which transport it used.** §3.2 is presented as the operator-visible flag surface and carries no transport selector; §12.2's report fields carry no transport field. Yet §6.1 BR-SKILL-2, §9.1 BR-GUARD-1, §12.4 BR-VER-2, AT-ENG-43 and AT-ENG-X3 all condition behaviour on "whichever transport the run uses", and EC-FAIL-5 classifies "SDK fails" as an engine failure (exit `1`) rather than as a reason to reach the declared fallback. At HEAD only the SDK path exists (`pdlc/engine/lib/transport.mjs:19`, `createTransport`; no `claude -p` spawn, no selector in `pdlc/engine/bin/pdlc.mjs`). An operator therefore cannot choose a transport and cannot tell after the fact which one ran — which makes every per-transport obligation unverifiable in the field. Fix: name the selection surface (flag or config key) and add a `transport` field to §12.2 — or state explicitly that the fallback is fixture-only in this feature and that §16.2's "both transports or neither" is a *test-level*, not runtime-level, obligation. | §3.2, §12.2, §16.2, EC-FAIL-5 |
| F-03 | High | Local | **The run report has no delivery surface.** §12.1 calls it "the only artifact an operator reads when a cron'd run finishes at 4 a.m.", but no section says where it is emitted — stdout, a file, which path, which format. BR-READ-3/NG-7 forbids writing an engine-owned file into the consumer repo, closing the one location a reader would guess, and §13 records no open question for this. AT-ENG-58/59/60 and EC-REP-1 cannot be derived without asking where to read. At HEAD the engine stamps the modules' report object and prints (`pdlc/engine/lib/report.mjs:70` `stampReport`; `bin/pdlc.mjs` console output), so the answer exists — it just is not specified. Name the surface, and if it is stdout, say so plainly and note the cron implication. | §12.1, §12.2, §10.3 BR-READ-3 |
| F-04 | Medium | Local | **BR-START-1 and §4.2/EC-START-4 contradict each other.** BR-START-1 states unconditionally that "a failure at any rung ends the invocation with exit `1`"; §4.2 and EC-START-4 carve out rung 5 under `--dry-run`, which "reports rung 5's finding, not fatal". Two tests transcribing these two statements disagree on the same fixture. Qualify BR-START-1 (rungs 1–4 unconditionally; rung 5 except on the dry-run path) so the exception lives in the rule, not only in the prose two subsections later. | §4.1 BR-START-1, §4.2, EC-START-4 |
| F-05 | Medium | Local | **Two operator-visible refusals sit outside the ladder BR-START-2 declares total.** EC-CLI-3 (REQ path absent under `--cwd`) and EC-DISP-5 (`--cwd` not a git repository) are engine refusals with exit `1`, but neither is a rung of §4.1 and BR-START-3 makes `doctor` "the same ladder". `doctor` therefore answers "will a run start here?" without checking the working directory it would run in — the exact dishonesty BR-START-3 exists to prevent. Either add argument/`cwd` validation as an explicit pre-ladder stage that `doctor` also runs, or state that these two are argument validation outside the ladder and that `doctor` does not cover them. | §3.4 EC-CLI-3, §4.1, §7.5 EC-DISP-5 |
| F-06 | Medium | Local | **§5.3's allowed policy set is not transcribable.** The table gives `"none"` on the primary transport but "the fallback's equivalent" for the fallback, and "the API-key-backed sources as well" under the opt-in flag. Neither is an enumeration, while C-8/BR-MSG-2 demand a total parse over a closed value set and AT-ENG-17 needs a literal set to place a fixture outside. Pin the primary set literally (`apiKeySource == "none"`, per M-ENG-04), and for the other two say explicitly that the enumeration is owed by O-1 and that until it lands *every* unrecognised value is outside the set (BR-AUTH-4 already implies this — say it in the table so the fail-closed direction is the transcribed one). | §5.3, §12.3 BR-MSG-2 |
| F-07 | Medium | Local | **`--max-iterations` is missing from §3.2's flag table.** BR-LOOP-2 says "the shipped CLI exposes one" bound and EC-Q-5 specifies its `0`/non-numeric behaviour, but the flag has no row in the table that §3.1–§3.2 present as the closed operator-visible surface. It is shipped (`pdlc/engine/bin/pdlc.mjs:39`, parsed at `:303`, rejected at `:306-307` — matching EC-Q-5). Add the row; an enumeration that an edge case references but does not contain is exactly the drift §12.3 is trying to prevent for strings. | §3.2, §11.2 BR-LOOP-2, EC-Q-5 |
| F-08 | Medium | Local | **What a mid-run engine-fatal stop leaves behind is unstated.** `auth-failure` (§8.4) and `transport-contract-violation` (§8.1) stop the run at exit `1` with no module halt: no POSTMORTEM, no `halted` row, and the queue row stays `in-progress` (EC-Q-4 defers recovery to the module's own lifecycle). Combined with F-03 that leaves an unattended operator with no on-branch witness at all for a run that consumed real dispatches. §8.3 spells out both halves of the *exhaustion* case in this detail; the fatal cases deserve the same sentence — even if the answer is deliberately "nothing but the report". | §8.1, §8.4, §11.3 EC-Q-4 |
| F-09 | Medium | Cross-Feature | **EC-GUARD-4 makes the feature's viability contingent on an unmeasured capability with no operator move.** If a transport cannot carry the guard configuration, "the engine refuses to dispatch". O-2 records that no hook/settings wiring exists in `pdlc/engine/lib/` at HEAD (confirmed — the directory holds `adapter/handshake/report/run/skills/startup/transport.mjs` only) and that SDK-side hook injection is unmeasured. If the *primary* transport turns out not to carry it, that rule renders the engine unusable, and F-02 leaves no way to switch to the fallback. State the operator's move for that branch (fall back, or refuse with a message naming the fallback and how to select it), so the outcome is a decision rather than a dead end. | §9.3 EC-GUARD-4, §13.2 O-2 |
| F-10 | Low | Local | **§14.2 omits G-2 and NG-2…NG-5.** G-2 (canonical modules, unmodified) is the goal §10.1 exists to honour and has no row, while §14.3 claims both directions are checked. Add the G-2 row (→ §10.1) and either add or explicitly exclude NG-2…NG-5 with one line saying why they need no section. | §14.2, §14.3 |
| F-11 | Low | Local | **`pdlc doctor` is an operator-visible command with no upstream authority.** The REQ never names it; §14.1/§14.2 trace no AC or constraint to it, so it reaches coverage only via AT-ENG-01's "each command in §3.1". It is shipped (`pdlc/engine/bin/pdlc.mjs:40`, `:154-165`), so this is a REQ gap rather than an invention here — worth an erratum so the command has a requirement to answer to. | §3.1, §4.1 BR-START-3, §14 |
| F-12 | Low | Local | **§12.2 carries eight report fields; AC-4.5 enumerates six.** "Effective dispatch tunables" (BR-CLI-3) and "permission posture in force" (BR-PERM-1) are additions this FSPEC makes under AC-4.5's "in addition to" clause — legitimate, but AT-ENG-58 reads as an AC-4.5 transcription. Mark the two as FSPEC-added so a test author does not go looking for them in the REQ. | §12.2, AT-ENG-58 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | §4.4 Direction A asserts over "every skill identifier a module can dispatch", and BR-START-4 forbids expressing it as a frozen list or a count. How is that set derived at startup? The modules name skills as string literals scattered through `PHASE_DISPATCH` and the wave/DoD paths; deriving them without executing the module is the implementable question, and if the answer is "a constant in the engine", that *is* a frozen list and BR-START-4 needs rewording rather than the implementation needing heroics. |
| Q-02 | §4.1 rung 4 says "every prompt file **the run can need**" while §4.4 Direction A says "every identifier **a module can dispatch**". For `pdlc dev` these differ (queue-only skills). Which is the gate — per-command need, or the union across both modules? |
| Q-03 | BR-SKILL-4 reads prompt bytes at dispatch time, but EC-RUN-1 says a run continues "against the approved plugin's already-read bytes where it can". Are bytes read once per run or per dispatch? §6.1 defers caching to TSPEC, yet EC-RUN-1's observable behaviour differs between the two. |
| Q-04 | BR-CLI-3 puts the retry tunables in "engine configuration" while O-3 leaves that location open. Is the *effective* value reported (§12.2) enough for this FSPEC, or does an operator need to know which file supplied it? A reported value whose source is unknowable is half an answer at 4 a.m. |

## Positive Observations

- The two literal oracles this document transcribes from the REQ are exact, and I checked them
  cell by cell: §5.1's six auth rows against AC-2.1, and §8.2's eight retry sequences against
  AC-4.2 — same rows, same order, same terminal classifications, including the `retryable`,
  `timeout`, `timeout` cap row. A test can be written from either table alone.
- Citation-by-id is disciplined and correct. M-ENG-07 really does carry seven map rows over five
  named configurations (`docs/_constraints/pdlc-engine-baseline.md:92-108`), so §7.3 BR-MODEL-2's
  "five-configuration corpus that exercises every one of its rows" is accurate and not re-derived.
  §2's M-ENG-01/04/05/06/07 and A-ENG-01 all exist as cited.
- BR-READ-1 is right where it matters: `orchestrate-dev.js` has no drift gate of any kind (grep
  for the drift-state path returns hits only in `orchestrate-queue.js:64`, `:1072`, `:2068`), so
  clause (c) really is unconditional for a dev run and the O-ENG-2 erratum against AC-1.2's
  attribution is well founded rather than pedantic.
- G-5's count is right: 15 `SKILL.md` files under `pdlc/skills/` plus
  `se-implement/SKILL-typescript.md` and `SKILL-python.md` = 17, and BR-START-4 correctly refuses
  to make the number the assertion.
- §9's guard classes match the shipped hook exactly — `CROSS-REVIEW`, `CODE_REVIEW`, `ADVISORY`
  (`pdlc/hooks/scripts/guard-harvest-before-delete.sh:43`), and BR-GUARD-3's "asserted with no pdlc
  hooks registered" is the only provenance oracle that actually proves anything.
- §17.3 ("the direction unhandled cases fall") is the single most useful paragraph for an
  implementer: it converts a long edge-case catalogue into one invariant a reviewer can apply to a
  case the document never listed.
- Raising O-ENG-1/2/3 as errata rather than quietly resolving them upstream is the right call, and
  each row records the interim behaviour so the exposure is legible.

## Recommendation

**Needs revision**

This is a strong FSPEC — the transcribed tables are exact, the citations hold at HEAD, and the
errata against the REQ are the right instinct. Three things block it, and all three are additive:

1. **F-01** — say what the hermetic double must emulate for AT-ENG-45, or move clauses 1–3 of the
   parity oracle to the live smoke. Right now the headline parity test passes on an empty
   `docs/{f}/` because nothing in a stubbed run creates the files it checks.
2. **F-02** — name the transport selection surface and add a `transport` field to §12.2, or say
   the fallback is fixture-only in this feature and scope §16.2's parity rule to tests.
3. **F-03** — name where the run report is emitted.

F-04…F-09 are cheap edits to statements that already have a clear intended reading; F-10…F-12 are
table hygiene. Nothing here asks the document to descend into TSPEC territory — each fix is a
sentence about something an operator or a test author observes.

## Verdict

VERDICT: Needs revision
{"high": 3, "medium": 6, "low": 3}
