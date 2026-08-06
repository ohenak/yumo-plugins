# CODE REVIEW — pdlc-advisory-tier (v2)

Scope: Round-2 **delta** Definition-of-Done re-verification of branch `feat-pdlc-advisory-tier`
after the v1 remediation. Per the v2+ protocol this is not a fresh six-criteria scan: every v1
finding is re-traced to a production path **and** a test that would fail if the fix broke, and the
remediation diff itself (`git diff 56a5ae0..HEAD`, commits `78fa9ba` + `59625ba`) is scanned for
newly introduced stubs, mock data, unwired integrations, weakened oracles and adjacent-surface
falsifications. Read-only: no production file, test, document or generated artifact was modified by
this review. Line citations are against the branch tip (`git rev-parse --abbrev-ref HEAD` →
`feat-pdlc-advisory-tier`; working tree clean but for the untracked `.claude/`).

| Field | Detail |
|---|---|
| Feature | pdlc-advisory-tier |
| Branch | feat-pdlc-advisory-tier |
| Review version | 2 |
| Date | 2026-08-05 |
| Verdict | **Findings** (one, low) |
| Branch coverage (lowest new module) | 89.34% (`orchestrate-dev.js`); `orchestrate-queue.js` 89.46% |
| Requirements traced | 55/56 |

Remediation commits reviewed:

| Commit | Contents |
|---|---|
| `78fa9ba` | `fix(pdlc-advisory-tier)`: terminal catch → `terminate()`, one rung ladder, `refusalReasonFor` wired, adapter append prompt, AC-4.6 / AC-1.x oracles, CLAUDE.md wording |
| `59625ba` | `chore(pdlc-advisory-tier)`: rebuilt `pdlc/workflows/dist/` |

Gate re-run by this verifier:
`cd pdlc/workflows && npm test -- --testPathIgnorePatterns '/node_modules/' '/__tests__/helpers/' '/__tests__/fixtures/' 'documentOracles'`
→ **82 suites passed / 82 total; 3452 passed, 70 skipped, 3522 total.** Exit 0.
`node pdlc/workflows/build-runtime.mjs --check` → all four artifacts `in-sync`, exit 0.

---

## §1 Resolution of the v1 findings

| v1 # | Severity | Finding | Status | Evidence (branch tip) |
|---|---|---|---|---|
| F-1 | medium | Two rung ladders — `resolveAdvisoryRung` exported and tested with zero production callers, `dispatchViaRungLadder` shipped and untested | **Resolved** | `dispatchViaRungLadder` no longer exists in any production source (repo-wide grep hits only `advisoryRung.test.js:6`'s historical header note and the v1 review itself). The one ladder is `resolveAdvisoryRung` (`pdlc/workflows/orchestrate-dev.js:1833`), and the driver's DIAGNOSE step calls it directly: `orchestrate-dev.js:3132` — `resolveAdvisoryRung({ _agent, _log: log, _state: rungState, prompt: promptText })`. The discarded-output probe is gone with it: `ADVISORY_RUNG_PROMPT` no longer exists anywhere in the repo, and the caller's own prompt is what goes out (`dispatchAt` at `:1840-1842` passes `prompt`). Both dist bundles carry the same single ladder (`dist/orchestrate-dev.bundle.js:1994`, `dist/orchestrate-queue.bundle.js:1970`). Tests are now on the shipped symbol at both levels: unit (`advisoryRung.test.js:243, 256, 297, 359, 406, 450, 466`) and **through `runAdvisorySeam`** (`:313`, `:374`, `:419`, `:473`, `:497`, `:526`). |
| F-2 | medium | `refusalReasonFor` had zero production callers; every refusal reason was a hard-coded literal, so the catalogue's declared order governed nothing on the live path | **Resolved** | Single resolver wired via the `refuse()` closure at `orchestrate-dev.js:2994-2997` (`lastReason = refusalReasonFor(signals) ?? "budget-exhausted"`). **Every** escalating `terminate` call in the driver now routes through it: `:3138`, `:3154`, `:3191`, `:3232`, `:3240`, `:3250-3253`, `:3281`, `:3285`. The three former straight-line precedence decisions are now catalogue-derived: the gate computes all three conditions before any refuses (`:3225-3232`, `prohibited` / `!gateResult.inside` / `lowConfidence` folded into one signal set), and the malformed-vs-exhausted ternary became `refuse({ "malformed-verdict": attempts === 1, "budget-exhausted": true })` (`:3190`). Falsifying oracle: `advisoryDriver.test.js:788-843` — three cases in which two catalogue members genuinely hold, each asserting the reported reason equals `earlierInCatalogue(a, b)` **read off `dev.ADVISORY_REFUSAL_REASONS` at runtime** (`:790-797`), so re-ordering the catalogue moves the expectation while a re-hard-coded literal would not. |
| F-3 | **high** | Terminal `catch` built its disposition as an object literal, bypassing `terminate()` — no ADVISORY record (AC-9.1), no `ESCALATIONS.md` entry (AC-10.1), no notice (AC-10.5), and `reason: "unclassified-error"` outside the closed catalogue | **Resolved** | `orchestrate-dev.js:3304-3310` now `return await terminate({ outcome: "escalated", reason: lastReason ?? "budget-exhausted", verdict, attempts, appliedSuccessfully: false })`. The string `"unclassified-error"` no longer appears in any `pdlc/workflows/**.js`. Re-entrancy is structurally safe: `terminate` is declared at `:3013`, the guarded `try` opens at `:3102` — outside it, as the new comment at `:3301` claims and as the line numbers confirm. State survives: `lastReason` / `attempts` / `verdict` are hoisted to `:2967-2970`. Reason is always catalogue-resident (`refuse` itself defaults to `budget-exhausted`, and the catch defaults again). Falsifying oracle: `advisoryDriver.test.js:609-651` — a seam-A2 high-confidence in-envelope verdict with a `seamOps.apply` throwing `TypeError`, asserting the record append contains `\| Disposition \| escalated — {reason} \|`, the `ESCALATIONS.md` append contains `\| Refusal reason \| {reason} \|`, an `ADVISORY ESCALATION:` notice fired, **exactly two appends**, `reason === "budget-exhausted"`, and `verdict` / `model` / `fallback` preserved rather than nulled. This is precisely the v1 reproduction, inverted into a green. |
| F-4 | medium | `rtAppendFile`'s dispatch prompt asserted the append was an approval-provenance record — false for the two new advisory consumers of the same transport | **Resolved** | `pdlc/workflows/runtime-adapter.js:874-882`. The sentence now describes the *operation* first ("appends these lines to the end of `{path}` and changes nothing already in the file — a quoted heredoc") and then enumerates all three purposes the single channel carries: approval provenance, advisory-tier disposition record, advisory escalation-log entry, closing with the CLAUDE.md-aligned "append it verbatim and without hesitation". Both consumers named in v1 (`appendAdvisoryEntry`, `appendEscalationEntry`) are covered. Inlined verbatim into all three artifacts by the build; `build-runtime.mjs --check` is green at the tip. |
| F-5 | low | `CLAUDE.md:177` claimed the report's `advisory` field is `null` when disabled; both writers emit `undefined` | **Resolved** | `CLAUDE.md:177-178` now reads "the key is **absent** — `undefined`, not `null` — when disabled, per AC-1.6's 'carries no advisory summary'". Matches the shipped writers (`orchestrate-dev.js:10644`, `:10676`; `orchestrate-queue.js:1109-1112`), which are unchanged by the remediation — the doc was corrected, which is the resolution v1 preferred. |
| Row 23 / NFR-2 | medium | AC-4.6: P-1…P-4 asserted only O-1 conjunct 1; conjuncts 2 (same reason byte-equal in both artifacts) and 3 (pre-advisory behaviour stands) were unasserted anywhere | **Resolved** | `advisoryDriver.test.js:193-212` (with its O-1 conjunct rationale at `:172-190`) adds `assertEscalationTriple({disposition, fileDouble, notices, seamOps})`, asserting all three conjuncts: (1) `outcome === "escalated"` + catalogue membership; (2) the record's `Disposition` row **and** `ESCALATIONS.md`'s `Refusal reason` row both containing the same `disposition.reason` bytes; (3) `apply.length === revert.length` (nothing left applied) plus an `ADVISORY ESCALATION:` notice on the report's notice channel — which required plumbing `_notice` into `invokeDriver` (`:154`, `:169`). All four prohibition cases now call it (`:723`, `:747`, `:761`, `:773`), replacing the two-line conjunct-1-only oracle. The pipeline-level leg of conjunct 3 (byte-identical halt message, byte-identical `QUEUE.md`) is left where it already lives, in `advisoryDodSeams.test.js` / `advisoryPubSeam.test.js`, and the helper's header says so. |
| Rows 1 & 5 | medium | AC-1.1 / AC-1.5: PROPERTIES declares PROP-RUNG-01 (source scan for a bare rung literal) and PROP-RUNG-09 (workflow-level no-fallback positive control); neither existed | **Resolved** | **PROP-RUNG-01** — `advisoryRung.test.js:175-214`: five cases over the real module sources read from disk (`DEV_SOURCE`, `QUEUE_SOURCE` at `:59-60`), including a self-falsifiability case that plants a second `"fable"` and asserts the scan catches it (`:187-192`), a one-occurrence positive control on `orchestrate-dev.js` (`:194-197`), a zero-occurrence assertion on `orchestrate-queue.js` (`:203-206`), and a pin that both ladder dispatch sites pass the constants, not literals (`:208-213`). **PROP-RUNG-02** also added (`:217-247`), including the `MODEL_DEFAULT`-repointing mutation. **PROP-RUNG-09** — `:525-553`: driven at the workflow level through `runSeam` → `runAdvisorySeam`, asserting the disposition's `model`/`fallback`, the summary produced by the same `advisorySummaryRows` the report calls, the five-row shape, and the record's `\| Model \| fable \|` row byte-equal, plus a zero-count on fallback dispatches — two positive conjuncts, not an absence oracle. |
| Rows 2, 3, 4 | high | AC-1.2 / AC-1.3 / AC-1.4 were tested against the unwired copy; the shipped fallback/halt branches were uncovered | **Resolved** | Each now has a `runAdvisorySeam`-level leg against the shipped ladder: AC-1.3 at `advisoryRung.test.js:313-342` (seam proceeds on the substituted rung; disposition, `ADVISORY_MODEL_FALLBACK` log, record `\| Model \| opus (fallback) \|`, and report summary all show the substitution); AC-1.4 at `:374-393` (the halt **propagates**, is never mapped to an escalation, exactly two dispatches, nothing applied); AC-1.2 negative control at `:419-441` (a non-model rejection never enters the ladder, `fallback` stays false, every dispatch names `MODEL_ADVISORY`). Coverage moved with it: `orchestrate-dev.js` statements 96.87 → **97.16%**, branches 89.30 → **89.34%**. |
| Row 17 | high | AC-3.6 dual defect (terminal catch + unwired resolver) | **Resolved** | Both legs closed by F-2 and F-3 above; `ADVISORY_REFUSAL_REASONS` order (`orchestrate-dev.js:2019-2028`, `prohibited-action` first, `budget-exhausted` last) now decides the shipped precedence, and the catch's reason is catalogue-resident by construction. |
| Rows 43, 47, 51 | high/medium | AC-9.1 / AC-10.1 / AC-10.5 were "not total" — the terminal catch wrote no record, no escalation entry, no notice | **Resolved** | Totality restored by F-3: every terminal disposition, including the unclassified throw, goes through `terminate` (`:3013-3085`), which owns the record write (`:3027`), the escalation append (`:3056`) and the notice (`:3081`). Asserted on the previously-uncovered path by `advisoryDriver.test.js:609-651`. |

---

## §2 New findings from the remediation diff

Bounded scan of `git diff 56a5ae0..HEAD` only. **Criteria 1–3 clean**: the diff introduces no
`TODO`/`FIXME`/`HACK`/`XXX`, no `NotImplementedError`, no hollow function body, no
`mock*`/`fake*`/`dummy*` identifier in production code, and no new export at all — the only
production signature change is `resolveAdvisoryRung`'s (`-export async function
resolveAdvisoryRung({ _agent, _log, _state })` → `+export function resolveAdvisoryRung({ _agent,
_log, _state, prompt })`), and that symbol went from zero production callers to one. Net unwired
integrations introduced: **0**; net removed: **2**.

**Criterion 4 clean**: both changed modules remain above the bar and neither regressed —
`orchestrate-dev.js` 89.34% branch / 97.16% stmt / 93.11% func, `orchestrate-queue.js` 89.46% /
93.72% / 75.38% (unchanged; the remediation did not touch it).

**No oracle was weakened.** The one test-double capability the diff adds,
`makeFakeClock({ sleepResolvesOnMacrotask })` (`__tests__/helpers/advisoryDoubles.js:188-215`),
defaults to `false`, so every pre-existing consumer — including V-5 / T-02-5's genuinely-never-settling
dispatch in `advisoryDriver.test.js` — races exactly as before. It is opted into only by
`advisoryRung.test.js`'s `runSeam` (`:114`), where it is *required* for faithfulness: the ladder's
fallback re-dispatch settles a few microtask hops deeper than a synchronously-resolving `_sleep`,
so with the default double the shipped fallback branch would be unreachable from a workflow-level
test for reasons of hop-count rather than elapsed time. Production `_sleep` is a real timer, which
no microtask chain can beat, so the macrotask double is the more faithful model. Every other oracle
change in the diff is strictly strengthening (conjunct-1-only → the full O-1 triple).

One adjacent-surface falsification, introduced by the remediation itself:

| # | Criterion | Severity | File:Line | Problem | Required fix | Scope |
|---|---|---|---|---|---|---|
| 1 | Adjacent-surface falsification | low | `docs/pdlc-advisory-tier/TSPEC-pdlc-advisory-tier.md:315-319`; `docs/pdlc-advisory-tier/PROPERTIES-pdlc-advisory-tier.md:389`, `:404` | Reconciling the two ladders changed `resolveAdvisoryRung`'s **signature and return contract**, and the two spec documents still declare the pre-remediation one. TSPEC §3.4's signature block says `@param {{ _agent, _log, _state }}`, `@returns {Promise<{ model: string, fallback: boolean }>}` and `export async function resolveAdvisoryRung({ _agent, _log, _state }) { … }`. The shipped function (`pdlc/workflows/orchestrate-dev.js:1833`) is **not `async`** (deliberately — the hop-count note at `:1823-1831` makes that load-bearing for the `Promise.race`), takes a **fourth required parameter `prompt`**, and returns `{kind:"response", raw}` / `{kind:"dispatch-error", err}`; `{model, fallback}` now lives only in `_state.resolved`. Same falsification in PROPERTIES: PROP-RUNG-04(b) requires it "return `{ model: MODEL_ADVISORY_FALLBACK, fallback: true }`" (`:389`) and the §4.2 prose says it "reports `{ model: MODEL_ADVISORY, fallback: false }` (TSPEC §3.4, `TSPEC:316`, `:390`)" (`:404`). The behaviour those properties describe is fully delivered and tested (`advisoryRung.test.js:245`, `:300`, `:515` assert exactly those objects on `_state.resolved`), so this is a stale contract statement, not a behavioural gap — but TSPEC §3.4 was **true before this diff and is false after it**, and `TSPEC:363` makes JSDoc `@param`/`@returns` annotations a declared documentation convention, so the block is a contract surface rather than prose. No third document is affected: `DECISIONS:406` ("`_state` is a parameter threaded from `main()`") and `PLAN:686`/`:719` (inventory by name) remain true. | Update TSPEC §3.4's signature block to the shipped four-parameter, non-`async`, `{kind}`-returning contract (carrying the hop-count rationale, which is the reason it is not `async`), and restate PROP-RUNG-04(b) / the §4.2 prose in terms of `_state.resolved` — which is where the tests already assert them. Documentation-only; no production change. | Cross-Feature |

**Deferral binding (criterion 6b): unchanged and still clean.** The remediation introduces no new
deferral. D-ADV-01/03/05 remain bound to `docs/_queue/QUEUE.md` row `Order 15`; D-ADV-02/04 remain
declared Closed. BL-01 remains a dependency blocker bound at `pdlc/RELEASE-CHECKLIST.md:184-194`
(§4c) — and v1's sharpened worry about it is now **retired**: the ladder §4c would be discharged
against is the same ladder the suite is green on, because there is only one.

Per the v1 "do not re-open" list, this round did not re-litigate: `MANUAL-VERIFICATION` form (ii),
the `.tokensave/tokensave.db` environmental red in `documentOracles.test.js` AT-22 (excluded from
this round's gate by the orchestrator's own ignore pattern), `ESCALATIONS.md`'s specified
append-without-commit, `ADVISORY_SEAM_PHASES`' keying, or `runtime-adapter.js`'s 0% v8 reading
(a measurement artifact of the inline-by-build design).

---

## §3 Requirements Traceability — carried forward, `Gap?` updated

Rows not listed below are carried forward unchanged from v1 (all `Gap? = No`). Only the ten rows v1
recorded as gaps are restated.

| # | Source | Criterion / AC | Implementation path | Test path | Gap? | Severity | Scope |
|---|---|---|---|---|---|---|---|
| 1 | REQ AC-1.1 | `MODEL_ADVISORY` names the Fable rung | `orchestrate-dev.js:1652` | PROP-RUNG-01 source scan `advisoryRung.test.js:175-214`; PROP-RUNG-09 workflow-level control `:525-553` | No | — | — |
| 2 | REQ AC-1.2 | `MODEL_ADVISORY_FALLBACK` used only on non-resolution, never implicit | shipped ladder `orchestrate-dev.js:1833-1876`, called `:3132` | `advisoryRung.test.js:397-441` (unit + `runAdvisorySeam` leg); PROP-RUNG-02 `:217-247` | No | — | — |
| 3 | REQ AC-1.3 | Fallback emits `ADVISORY_MODEL_FALLBACK`, records, reports, proceeds | `orchestrate-dev.js:1856-1866` | `advisoryRung.test.js:288-342` — the `:313` case asserts disposition, log, record row and report summary | No | — | — |
| 4 | REQ AC-1.4 | Neither rung resolves ⇒ loud failure, no third fallback | `orchestrate-dev.js:1867-1871` (`haltError` naming both rungs) | `advisoryRung.test.js:346-393` — the `:374` case drives it through `runAdvisorySeam` | No | — | — |
| 5 | REQ AC-1.5 | One constant per rung, referenced by every dispatch site in both modules | `orchestrate-dev.js:1652-1653`; sole ladder `:1833` | PROP-RUNG-01 `advisoryRung.test.js:194-213` (both modules scanned) | No | — | — |
| 17 | REQ AC-3.6 | Every refusal ⇒ the same triple; closed **ordered** eight-reason set | `ADVISORY_REFUSAL_REASONS:2019`; `refusalReasonFor:2042` via `refuse():2994`; `terminate:3013-3085` | `advisoryDriver.test.js:788-843` (catalogue-order-derived), `:193-212` + `:609-651` (the triple) | No | — | — |
| 23 | REQ AC-4.6 | Each prohibition test asserts the AC-3.6 positive triple on the same path | — | `advisoryDriver.test.js:193-212` `assertEscalationTriple`, called from all four of P-1…P-4 (`:723`, `:747`, `:761`, `:773`) | No | — | — |
| 43 | REQ AC-9.1 | **Every** advisory invocation appends a record | `appendAdvisoryEntry:2656` via `terminate:3027`, now reached from the terminal catch `:3304` | `advisoryRecord.test.js:127-160`; totality pinned by `advisoryDriver.test.js:609-651` (exactly two appends) | No | — | — |
| 47 | REQ AC-10.1 | **Every** escalation appends an entry | `appendEscalationEntry:3056` inside `terminate` | `advisoryEscalationLog.test.js`; totality pinned by `advisoryDriver.test.js:609-651` | No | — | — |
| 51 | REQ AC-10.5 | Advisory notices under a distinct prefix sharing `ESCALATION:` | `ADVISORY_ESCALATIONS` notice emitted `:3081` | `advisoryEscalationLog.test.js:431-436`; the notice channel asserted on the catch path `advisoryDriver.test.js:639` and in every prohibition case via the triple helper | No | — | — |
| 53 | REQ NFR-2 | Every REQ-ADV-04 prohibition has an explicit failing test | `advisoryDriver.test.js:706-775` | Strengthened to the full triple — see row 23 | No | — | — |

**Traced: 55/56.** The single remaining gap is **not** a REQ acceptance criterion: it is the
criterion-6 documentation falsification in §2 (TSPEC §3.4 / PROPERTIES §4.2's stale contract
statement for a behaviour that is itself implemented and tested). Every REQ AC and NFR now traces
to both a production path and a test that could fail. `req_gaps = 0`, `boundary_gaps = 1`.

---

## Notes for the remediator

1. **One item, documentation-only, low.** Bring TSPEC §3.4's signature block and PROPERTIES §4.2's
   PROP-RUNG-04(b) + §4.2 prose into line with the shipped `resolveAdvisoryRung`. Nothing in
   `pdlc/workflows/` needs to change, so `pdlc/workflows/dist/` does **not** need rebuilding for it
   — `build-runtime.mjs --check` is green at the tip and must stay that way.
2. When rewriting TSPEC §3.4, carry the *reason* the function is not `async` (the `Promise.race`
   hop-count constraint documented at `orchestrate-dev.js:1820-1826`), not just the new shape. A
   future reader who "fixes" it back to `async`/`await` re-introduces a spurious-preemption bug that
   no test in the suite would catch on the default clock double.
3. Everything else on the v1 list is closed and verified. Do not re-open the five §3(a) items v1
   assessed and recorded, nor the `.tokensave` environmental red.

---

DOD_STATUS: failed
{"stubs": 0, "mock_data": 0, "unwired_integrations": 0, "coverage_below_threshold": false, "branch_coverage_pct": 89, "req_gaps": 0, "boundary_gaps": 1}
