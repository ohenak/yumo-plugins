# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md (v1.9)
**Date:** 2026-08-19
**Iteration:** 8
**Scope:** Delta re-review of v7. Decision freeze in force — only delta-introduced defects and
factual contradictions with HEAD can block. Changed sections only; unchanged sections not re-litigated.

## Delta under review

Two commits touch the REQ since v7 (`8911d217..HEAD`): `680efb0c` (restores the five round-3 sites
reverted by the rebase, v7 F-01..F-05) and `e619b6d6` (v1.9 bump, §1 ledger citations, NFR-4, v7
F-06/F-07). Net **+34 / −8** lines. Every one of v7's four High findings is closed at HEAD:

| v7 finding | Site | State at HEAD | Verified |
|---|---|---|---|
| F-01 High | §5 C-2 (`REQ:237`, `:239`) | default is `1`; gloss reads "operator decision recorded under Q-1 (2026-08-13); the earlier proposal of `2` is superseded" | Resolved — now agrees with R-3 (`:525`), Q-1 (`:575`), and the three approved downstream docs pinning `1` |
| F-02 High | §8 (`REQ:558`) | O-7 restored verbatim, owner `pdlc-engineering-loop` (queue row 6), with the "must not be modelled as a widened A6" scope constraint | Resolved — AC-1.2 (`:270`), Q-2 (`:576`) and the v1.3 changelog (`:72`) now cite a live obligation |
| F-03 High | Header Upstream row (`REQ:11`) | `docs/completed/pdlc-advisory-tier/REQ-pdlc-advisory-tier.md` | Resolved — path exists at HEAD (26.7 K) |
| F-04 High | §1 M-WG-6 row (`REQ:109`) | row rewritten; no longer restates the claim the correction paragraph beneath retracts | Resolved — see F-01 below for a residual precision point, non-gating |
| F-05 Medium | §1 (`REQ:154`–`:166`) | 2026-08-11 `iv-snapshot-store-postgres` incident restored in full | Resolved — §6's reference and D-AWG-06 (`:615`) again have a referent |
| F-06 Medium | §1 (`REQ:114`–`:122`) | line anchors replaced by exported `WAVE_STATE_PATH` / `parseWaveLedger` and the "Notice: the wave ledger … was ignored" string; `scriptGate` described rather than cited | Resolved and verified against source (below) |
| F-07 Medium | NFR-4 (`REQ:503`–`:505`) | "the window closes at the attempt's verdict, and the gate runs after that verdict" replaces "the gate runs between attempts" | Resolved — consistent with AC-4.1's *applies*/*resolves* split, where the re-gate follows the repair |

## Source verification of the rewritten §1 citations

Every symbol the new §1 text names exists at HEAD and behaves as described:

- `WAVE_STATE_PATH` — exported, `pdlc/workflows/orchestrate-dev.js:11322`.
- `parseWaveLedger` — exported, `orchestrate-dev.js:11375`.
- "Notice: the wave ledger … was ignored" — emitted at `orchestrate-dev.js:14221`, inside the resume block.
- `scriptGate` "requires both `implementation.testCommand` and a `_runCommand` transport" — exact:
  `const scriptGate = Boolean(implConfig.testCommand) && typeof runCommandFn === "function"` (`:14147`).
- "The write sits inside the `if (scriptGate)` branch" — confirmed: the sole `writeWaveLedger` call
  (`:14450`) is lexically inside `if (scriptGate)` (`:14364`). A self-report-gate run records nothing.
- `implementation.startWave` — real config key (`:173`, `:235`–`:250`), documented at `:166` as the
  resume knob after a wave-gate halt.

The claim that survives this round is therefore the strong one, and it holds.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **M-WG-6's new first clause is narrower than HEAD.** The rewritten row says "a re-invocation carries no phase-level skip". HEAD does have one: with a *complete* ledger (`recorded.lastGreenWave === waves.length`, feature and planHash matching, recorded head an ancestor of HEAD) the run sets `startWave = waves.length + 1` and emits "Skipping Phase I (wave ledger …): all N waves of this plan were committed and recorded green by an earlier run" (`orchestrate-dev.js:14272`–`:14286`). The row's *second* clause — a human must re-invoke by hand rather than the pipeline resuming on its own — is true and is the load-bearing half (the queue row goes `halted`, M-WG-7). The correction paragraph three lines below already states the qualification correctly, and D-AWG-03b (`REQ:615`) restates it accurately, so the document does not contradict itself the way v7 F-04 flagged. Not gating: no AC or downstream test derives from this cell, and wave resume is explicitly out of scope (§4, `REQ:211`, routed to `pdlc-wave-resume` queue row 20). Repair (one clause): "no *approval-record* skip — the ledger's conditional skip aside (see the correction below), a human must re-invoke by hand". | §1 M-WG-6 row (`REQ:109`) |
| F-02 | Medium | Local | **AC-1.2 still carries a drifted raw line anchor.** `orchestrate-dev.js:12331-12343` (`REQ:267`) is offered as proof that "the post-wave command runs exactly once and its failure halts immediately". Those lines at HEAD are the DEC-ROUNDS-02 lifetime-round-cap comment block — unrelated. The *claim* is true: `implConfig.postWaveCommand` is invoked once per wave via `runCommandFn` and a non-pass throws `haltError` with no retry (`orchestrate-dev.js:14351`–`:14361`). So this is a stale anchor on a sound claim, not a false claim — inherited, untouched by the delta, and the same defect class v7 F-06 fixed for §1 but that was never routed for this site. Repair: replace the numeric range with the symbol, e.g. "(`orchestrate-dev.js`, the single `implConfig.postWaveCommand` invocation inside the wave loop; a non-pass throws `haltError` with no retry)". Per DEC-DOC-01 the raw `file:line` form is the underlying issue. | §6 AC-1.2 (`REQ:267`) |
| F-03 | Low | Local | **v1.9 changelog mislocates O-7.** The changelog says the restoration covers "§9's O-7" (`REQ:24`); O-7 sits in §8 Obligations (`REQ:558`), while §9 is Prerequisites (`REQ:582`). Cosmetic — the restoration itself is correct and complete. | v1.9 changelog (`REQ:24`) |

## Questions

| ID | Question |
|----|---------|
| Q-01 | None blocking. F-01's clause and F-02's anchor are both single-line edits that need no decision; either can ride the next erratum or be folded into the TSPEC-time citation sweep. |

## Positive Observations

- **The restoration is a true restoration, and in one place better than the bytes it restores.** All
  five reverted sites are back with their approved meaning, and the M-WG-6 row was not restored
  literally — round-3's bytes (`fe2d7426:89`) still carried the pre-correction claim that its own
  correction paragraph retracted three lines later. v1.9 rewrote the row so the row and the
  correction agree. That removes the self-contradiction v7 F-04 named at its root rather than
  reinstating it, which is the right call and is why F-04 does not reappear as a High here.
- **The §1 citation rewrite is exactly the durable fix.** Swapping `:9976`/`:12191-12280`/`:12345-12429`
  for exported symbols and a verbatim emitted string means the next rebase cannot silently falsify
  §1 again — a grep for `WAVE_STATE_PATH` or for the notice text will keep finding the mechanism no
  matter how far it moves. This is the citation form a TSPEC/PROPERTIES author can transcribe into a
  fixture without re-deriving anything. Worth promoting as the house style for engine citations.
- **NFR-4's new phrasing is falsifiable where the old one was not.** "The window closes at the
  attempt's verdict, and the gate runs after that verdict" names a measurable boundary — a test can
  assert the measured span ends at the verdict timestamp. "The gate runs between attempts" named an
  ordering that could not be observed from the budget's own instrumentation. The conclusion (no
  subtraction, no carve-out) is unchanged, so nothing downstream moves.
- **The C-2 repair re-aligns the whole chain with no downstream rework.** With `1` back in C-2, the
  approved TSPEC (`:523`, `:1069`), PROPERTIES (PROP-CFG-01/02/03, PROP-CTR-11) and PLAN (A6-05) are
  consistent with the REQ again. PROP-CFG-01's set-equality-plus-value oracle over `ADVISORY_DEFAULTS`
  would have gone red against an implementer reading `2`; that trap is closed.
- **Size stays inside budget:** 624 lines / 50,316 bytes, against the 700-line / 60 KB REQ bound.

## Recommendation

**Approved with minor changes**

All four v7 High findings are resolved and verified against HEAD source rather than against the
document's own account of itself. No delta-introduced defect and no factual contradiction with HEAD
remains. The two Medium findings and one Low are precision repairs on non-load-bearing text; none
gates, and none requires a decision.

DEFERRED: AC-1.2's stale `orchestrate-dev.js:12331-12343` anchor (F-02) — fold into the TSPEC-time citation sweep with the rest of the raw `file:line` anchors.
DEFERRED: M-WG-6's "no phase-level skip" clause (F-01) — tighten to "no approval-record skip" whenever §1 is next touched.

FINDING: Medium | inherited | local | §1 M-WG-6 row (`REQ:109`) | "carries no phase-level skip" is narrower than HEAD, which skips Phase I on a complete ledger (`orchestrate-dev.js:14272`-`:14286`); the correction paragraph below already qualifies it.
FINDING: Medium | inherited | nonlocal | §6 AC-1.2 (`REQ:267`) | raw anchor `orchestrate-dev.js:12331-12343` points at DEC-ROUNDS-02 round-cap prose; the real post-wave-command site is `:14351`-`:14361`. Claim true, anchor stale.
FINDING: Low | delta | local | v1.9 changelog (`REQ:24`) | says "§9's O-7"; O-7 is in §8 Obligations (`REQ:558`), §9 is Prerequisites.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 1}
