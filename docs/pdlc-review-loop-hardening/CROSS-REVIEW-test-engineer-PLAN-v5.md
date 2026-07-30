# Cross-Review — Test Engineer — PLAN v1.4 (Round 5, delta, iteration cap)

- **Reviewer:** test-engineer (te-review)
- **Document:** `docs/pdlc-review-loop-hardening/PLAN-pdlc-review-loop-hardening.md` @ v1.4
- **Round:** 5 of 5 (iteration cap — non-convergence here writes a POSTMORTEM and halts)
- **Branch:** `feat-pdlc-review-loop-hardening`
- **Delta under review:** `51b6a28..1a7fb32` — 75 insertions / 7 deletions, PLAN only
- **Scope:** Local — confined to `docs/pdlc-review-loop-hardening/` and the two workflow sources it scans (`pdlc/workflows/orchestrate-dev.js`, `pdlc/workflows/orchestrate-queue.js`). No cross-feature or process finding is filed. Three non-blocking observations are routed to Harvest below.
- **Verdict:** **Approved** — 0 High / 0 Medium / 0 Low.

This is a delta re-review. Content passed in rounds 1–4 was not re-reviewed (R-5: bound by surface; the surface is the delta). Every claim below is measured, not inferred (DC-02). Citation/`file:line` drift was treated as a mechanical check, never a finding (R-6).

---

## 1. Findings closure table

| # | Round-4 finding | Status | Evidence (measured) |
|---|---|---|---|
| F-01 | §9.2 item 3(c) fail-open: the backward-only test exempts any call whose nearest preceding token is `=>` or `return`, regardless of what follows, so an unawaited promise consumed by `&&`, `\|\|`, `+`, `?:` or `?.` is silently exempted | **Closed** | Item 3(c) now requires **both** halves: backward token ∈ {`=>`, `return`} **and** the first non-whitespace token after the call's matching `)` (found by walking the same bracket-depth stack forward to depth zero) ∈ {`;`, `,`, `)`, `}`, EOL}. If the forward walk cannot reach a matching `)` at depth zero the site is **unclassified** and fails loudly. Independently re-implemented (§2 below): on the real sources the rewritten rule reproduces **35 sites / 5 non-awaited / 0 unclassified**, and on fixtures it **refuses** both shapes named in the finding. |
| F-02 | §4.1's site-count assertion could be satisfied vacuously over an empty scan set (a scanner that finds nothing trivially "has no non-awaited sites") | **Closed** (ruling in §3) | §4.1's blocking row now carries a lower-bound conjunct: the scan must report **at least one** site in `orchestrate-dev.js` **and** at least one in `orchestrate-queue.js`; a scan reporting none in either file fails the gate. Explicitly "a lower bound, never an equality… a bound of one cannot drift upward." The vacuous-truth path the finding named is closed. |
| F-03 | `endIndex` span derived from the first following `^}` line lands on `}) {`, truncating the guarded span and letting a real regression pass | **Closed** | §11.5 and §12.3 now both specify the first following line matching **`^}\s*$`** — a column-0 line that is a **lone** `}`. Measured at HEAD in `orchestrate-dev.js`: `reviewLoop` declared `:532`; `^}`-matching lines in 490–690 are `515`, **`542` (= `}) {`)**, `669`, `688`; `^}\s*$`-matching lines are `515`, `669`, `688`. Old rule → span `:532–542`, leaving `:543–669` unguarded. New rule → span `:532–669`. `checkConverged` `:496→:515` under both rules (unchanged). `grep -c MAX_REVIEW_ROUNDS orchestrate-dev.js` = **0**, so `RLH-LOOP-03`'s count conjunct genuinely reds at HEAD. |
| F-04 | §2.2's batch-gate definition omitted the skip clause, so a batch could pass with an `RLH-*` assertion skipped rather than run | **Closed** | §2.2 (line 97) now states: a batch gate passes when the suite shows no *new* failures against §2.1's baseline **and no `RLH-*` or `RLH-AT-*` assertion is skipped; skips stay at the baseline's 70. A skip is neither a failure nor a pass.** The added paragraph names **§12.2 step 2** as operator/owner. §12.2 step 2 (line 1121) reads `1038 passed / 1 failed / skipped exactly 70` — one authoritative numeric statement, no duplication. |

---

## 2. Scanner re-run (F-01) — independent re-implementation of §9.2 item 3

I re-implemented §9.2 item 3 from the PLAN text alone (masking → fixed-point scan set → bracket-depth classification), including the new forward half, and ran it against the real sources at HEAD.

### 2.1 Real sources

| File | Scan-set names | Call sites | Non-awaited | Unclassified |
|---|---|---|---|---|
| `pdlc/workflows/orchestrate-dev.js` | 20 | 27 | 4 | 0 |
| `pdlc/workflows/orchestrate-queue.js` | 17 | 8 | 1 | 0 |
| **Total** | — | **35** | **5** | **0** |

The five non-awaited sites and their rulings:

| Site | Shape | Ruling |
|---|---|---|
| `orchestrate-dev.js:615` | `_agent(reviewers[0], reviewerPrompt1),` inside `await _parallel([ … ])` | Awaited combinator argument |
| `orchestrate-dev.js:616` | `_agent(reviewers[1], reviewerPrompt2),` inside the same array | Awaited combinator argument |
| `orchestrate-dev.js:1569` | `const agentFn = (skill, prompt, opts) =>\n  rawAgentFn(…);` | Returned promise (back `=>`, fwd EOL) |
| `orchestrate-dev.js:1867` | `batch.map((task) => agentFn(…))` inside `await parallelFn(…)` | Returned promise (back `=>`, fwd `)`) |
| `orchestrate-queue.js:524` | `const agentFn = (skill, prompt, opts) =>\n  rawAgentFn(…);` | Returned promise (back `=>`, fwd EOL) |

This is exactly §4.1's advisory row (35 / 5), and it satisfies §4.1's new lower bound in both directions: dev ≥ 1 (27) and queue ≥ 1 (8).

**Masking robustness.** The run was repeated under two independent masking resolutions — a smart regex-vs-division heuristic (a `/` is a regex only when the previous significant char is not in `[A-Za-z0-9_)\]]`) and a naive "every `/` starts a regex" reading. **Both produce 35 / 5 / 0.** The classification is not sensitive to the masking ambiguity §9.2 leaves open (that residual under-specification is routed to Harvest, per §14.4).

### 2.2 Fixture behaviour — the two shapes the rewritten rule must refuse

| Fixture | Backward half | Forward half | Result |
|---|---|---|---|
| `() => _agent(a) && other` | passes (`=>`) | first token after matching `)` is `&` | **UNCLASSIFIED — refused** ✅ |
| `return _checkFile(p) \|\| fallback;` | passes (`return`) | first token after matching `)` is `\|` | **UNCLASSIFIED — refused** ✅ |
| `return _readFile(p) + suffix;` | passes | `+` | UNCLASSIFIED — refused |
| `() => _checkFile(p) ? a : b` | passes | `?` | UNCLASSIFIED — refused |
| `return _listFiles(d)?.length;` | passes | `?` | UNCLASSIFIED — refused |

Under the round-4 backward-only rule all five of these were exempted. Under v1.4's rule all five fail loudly. The fail-open path is closed.

### 2.3 Fixture behaviour — legitimate exempt shapes must NOT be rejected

| Fixture | Forward token | Result |
|---|---|---|
| `() => _agent(a, b) // trailing comment` | EOL (comment masked first) | Exempt ✅ |
| Multi-line call whose `)` closes then newline | EOL | Exempt ✅ |
| `[ _agent(a), _agent(b) ]` inside `await _parallel(…)` | `,` | Exempt (combinator argument) ✅ |
| `return _writeFile(p, s);` | `;` | Exempt ✅ |
| `{ return _git("x"); }` | `;` | Exempt ✅ |
| `map((t) => agentFn(t))` | `)` | Exempt ✅ |

No legitimate exempt shape present at HEAD is rejected. Concatenated / ASI-terminated shapes resolve to EOL and are exempted correctly; trailing comments are removed by step (a)'s masking before the forward walk, so they never reach the token test.

---

## 3. Ruling on F-02's lower bound: is "≥1 per file" sufficient?

**Ruling: adequate. It discharges the finding as filed, and it is the strongest bound available that cannot red on correct source.**

Reasoning, measured:

1. **The finding as filed is closed.** The failure mode named in round 4 was vacuous truth over the empty set — "no non-awaited sites" being satisfied by a scanner that found nothing at all. `≥1 in each of the two files` makes the empty scan a gate failure. That path is gone.

2. **A weaker failure mode survives: partial blindness.** A scanner that reports a strict non-empty subset — say 2 sites of the true 35 — still passes the bound. This is real, and I judge it non-blocking rather than a defect in the delta:
   - `RLH-SCAN-01` fixture-tests the classifier and alias resolution against a known oracle, which is where a partially-blind scanner actually gets caught. The §4.1 gate is not the only net.
   - Crucially, **any tighter bound would red on correct source.** Measured: `orchestrate-queue.js` has **17 scan-set names but only 8 call sites**, so at least 9 names legitimately have zero sites — a per-name lower bound is arithmetically impossible. And an equality (`exactly 35`) is precisely the count-drift that rounds 2–4 were spent removing; the PLAN says so in terms ("a lower bound, never an equality… a bound of one cannot drift upward"), and I agree.
   - So the choice is between one-per-file and nothing. One-per-file is correct.

3. **"Proves the scan ran, cannot drift" is the right characterisation.** The bound's job is liveness of the scan, not completeness of the scan; completeness is `RLH-SCAN-01`'s job. The PLAN assigns them to the right places.

Residual partial-blindness gap → **Harvest**, non-blocking (see §6).

---

## 4. Nothing else changed

| Check | Result |
|---|---|
| `git diff --name-only 51b6a28..1a7fb32` | `docs/pdlc-review-loop-hardening/PLAN-pdlc-review-loop-hardening.md` — **only file** |
| Diffstat | 75 insertions / 7 deletions |
| `git diff -U0` hunk headers | Exactly the seven declared sections: header version line, §2.2, §4.1 blocking row, §9.2 item 3(c), §11.5, §12.3 `endIndex` row, §14 changelog + new §14.4. **No fifth thing.** |
| §7.3 (permitted-red windows) | Untouched — no hunk intersects it. `RLH-AT-19`'s empty permitted-red window is intact, so this feature's own guards remain protected. |
| DAG / batch columns / task ledger | Untouched — **zero** `RLH-` task rows added, removed or renumbered in the delta. |
| §12.2 step 2 baseline figures | Unchanged text; §2.2's new prose cites it rather than restating the numbers. |

---

## 5. Measured baseline

Full suite re-run at HEAD (`cd pdlc/workflows && npm test`, 182.6 s):

```
Test Suites: 1 failed, 35 passed, 36 total
Tests:       1 failed, 70 skipped, 1038 passed, 1109 total
```

Single red: `__tests__/documentOracles.test.js › coveredViolations (§10, §10.1) › AT-22 [red-until-L-06]: coveredViolations(LIVE_ROOT) is empty post-landing`.

This reproduces §2.1/§12.2's baseline exactly — **1038 passed / 1 failed / 70 skipped, 1109 total, 36 suites**, with the one expected `red-until-L-06` failure. The exit criterion in §2.2 remains "no *new* failures", not absolute green, which is correct: the baseline is red-by-design until `L-06` lands, and §2.2's added skip clause pins skips at 70 so a batch cannot pass by skipping an `RLH-*` assertion.

---

## 6. Non-blocking observations — route to Harvest

Explicitly **not** findings. None blocks an implementer writing a correct red test, and none would let a real regression pass a gate at HEAD.

1. **Forward half accepts EOL, so a leading-operator line continuation would be exempted.** `() => _agent(x)\n  && other` presents EOL as the forward token and is exempted, though it is semantically the `&&` shape F-01 targets. Not reachable at HEAD (measured: zero such shapes in either source) and against the repo's prevailing formatting (prettier puts binary operators at end of line). Worth recording so the scanner's successor does not inherit a silent hole.
2. **Partial blindness survives the one-per-file bound** (§3.2). Recorded as an accepted, deliberate limit with the arithmetic that makes any tighter bound infeasible (queue: 17 names, 8 sites).
3. **Endorse §14.4's own three routings** — §14.3 restatement drift, masking under-specification in §9.2 step (a), and the cross-feature `_parallel` delegation. In particular: a §14 changelog row must never state a normative rule more precisely than the section that owns it; that is the mechanism that produced the round-2/round-3 contradiction.

---

## 7. §14.4 root-cause record — independently verified

§14.4 records that round 2's "three non-awaited sites" was **correct output from a contradictory contract**: TSPEC v1.6's alias phrasing ("the local name, **not** the `_`-prefixed one") removed `_agent` from the scan set wherever an alias existed, which put `orchestrate-dev.js:615`/`:616` outside the scan set entirely.

Reproduced by measurement: re-running the same scanner under v1.6's alias phrasing (drop an `_`-prefixed name once it has an alias) yields **24 sites / 3 non-awaited** — `dev:1569`, `dev:1867`, `queue:524`. That is round 2's number, derived exactly as §14.4 describes. TSPEC v1.7's reconciliation ("the local name **in addition to** the `_`-prefixed one") restores `:615`/`:616` and yields today's 35 / 5. The root-cause record is accurate.

One nuance already captured in §14.3/§14.4: even under v1.6 the queue had **one** non-awaited site, not zero, so PLAN v1.2's separate "the queue has none" claim was independently wrong. No new finding — it is recorded.

---

## 8. TDD readiness

Every task in the ledger admits a red test written first, `RLH-31` included:

- `RLH-31` (the scan): red is written against `RLH-SCAN-01`'s fixture corpus first — the fixtures in §2.2/§2.3 above are exactly the discriminating cases, and the rewritten 3(c) makes them decidable without a parser. The §4.1 gate's lower bound is a second, independent assertion.
- `RLH-LOOP-03` (`endIndex` single derivation): reds at HEAD today — `grep -c MAX_REVIEW_ROUNDS orchestrate-dev.js` = 0 — and the `^}\s*$` span rule makes the guarded region deterministic and non-truncating.
- `RLH-AT-19`: empty permitted-red window per §7.3 row 1, so it must be green from the moment it lands; §2.2's skip clause prevents it being neutralised by a skip.

No task requires a green-first step. The plan is TDD-ready.

---

## Verdict

**Approved.** All four round-4 findings are closed by measured evidence; the delta introduces no new defect; nothing outside the seven declared sections changed; the baseline reproduces. 0 High / 0 Medium / 0 Low. Three non-blocking observations are routed to Harvest.
