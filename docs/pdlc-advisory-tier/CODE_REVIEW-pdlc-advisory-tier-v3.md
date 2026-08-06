# CODE REVIEW — pdlc-advisory-tier (v3)

Scope: Round-3 **single-item scoped re-verify** of branch `feat-pdlc-advisory-tier` at tip
`dc3edba`. This is not a fresh six-criteria scan and not a full delta scan: v2 closed every v1
finding and left exactly one open item — the spec-contract drift in TSPEC §3.4 and PROPERTIES
PROP-RUNG-04(b)/§4.2 against the shipped `resolveAdvisoryRung`. This review re-verifies **only**
that item, sweeps `docs/pdlc-advisory-tier/` for any other surviving reference to the
pre-reconciliation contract, and runs the Phase-I wave gate. Read-only: no production file, test,
document or generated artifact was modified by this review, and nothing was committed.

| Field | Detail |
|---|---|
| Feature | pdlc-advisory-tier |
| Branch | feat-pdlc-advisory-tier |
| Tip reviewed | `dc3edba` |
| Review version | 3 |
| Date | 2026-08-05 |
| Verdict | **Findings** (one open, low — the v2 item is only partially resolved) |
| Wave gate | **green** — 82/82 suites, 3452 passed, 70 skipped |
| Working tree | clean but for untracked `.claude/` and `pdlc/workflows/coverage/` |

---

## 1. The v2 item — partially resolved

v2 finding (boundary gap 1, low): commit `dc3edba` claims to fix TSPEC §3.4's JSDoc block and
PROPERTIES PROP-RUNG-04(b)/-09's prose.

### 1.1 Shipped contract (the oracle)

`pdlc/workflows/orchestrate-dev.js:1833`:

```js
export function resolveAdvisoryRung({ _agent, _log, _state, prompt }) {
```

- **Not `async`**, `.then`-chained (rationale at `:1820-1826` — `Promise.race` hop-depth).
- Takes **one** parameter: a deps bag with **four** properties, `prompt` among them.
- Returns `Promise<{kind:"response", raw} | {kind:"dispatch-error", err}>` (`:1846-1847`,
  `:1854`, `:1857`, `:1864`, `:1867`).
- The `{model, fallback}` decision is written to `_state.resolved` (`:1853`, `:1863`), never
  returned.
- M-3 halt on both rungs rejected: `throw haltError(...)` at `:1868-1871`.
- Sole production call site, one object argument: `orchestrate-dev.js:3132` —
  `resolveAdvisoryRung({ _agent, _log: log, _state: rungState, prompt: promptText })`.

### 1.2 PROPERTIES — **resolved**

- `PROPERTIES-pdlc-advisory-tier.md:389` (PROP-RUNG-04(b)) now reads "**record**
  `{ model: MODEL_ADVISORY_FALLBACK, fallback: true }` on `_state.resolved` (v1.1 — the decision
  rides the per-run memo; the function's return value is the dispatch outcome, TSPEC §3.4)". This
  is exactly `orchestrate-dev.js:1863`, and exactly what the tests assert
  (`__tests__/advisoryRung.test.js:300`).
- `:404-405` (the PROP-RUNG-09 explanatory paragraph) now reads "`resolveAdvisoryRung` **records**
  `{ model: MODEL_ADVISORY, fallback: false }` on `_state.resolved` (TSPEC §3.4, v1.1 contract)",
  matching `orchestrate-dev.js:1853`. The stale `TSPEC:316`/`:390` line citations are gone.
- No residual "return `{ model, fallback }`" claim anywhere in PROPERTIES.

**PROPERTIES leg: closed.**

### 1.3 TSPEC §3.4 — **still falsified, on the signature line**

`TSPEC-pdlc-advisory-tier.md:310-330` is correct on three of the four axes the v2 finding named —
non-`async` (with the `Promise.race` rationale carried, per v2 remediator note 2), the `{kind}`
return union, and the decision riding `_state.resolved`. It is **still wrong on the parameter
shape**:

| Surface | TSPEC §3.4 (v1.1) | Shipped |
|---|---|---|
| `@param` | `{{ _agent, _log, _state }} deps` **plus** a second `@param {string} prompt` (`:324-325`) | one deps bag, four properties (`:1828-1829`) |
| signature | `export function resolveAdvisoryRung({ _agent, _log, _state }, prompt) { … }` (`:329`) | `export function resolveAdvisoryRung({ _agent, _log, _state, prompt })` (`:1833`) |

v2's remediation instruction was explicit — "update TSPEC §3.4's signature block to the shipped
**four-parameter**, non-`async`, `{kind}`-returning contract". The rewrite moved `prompt` out of
the deps bag and made it a **second positional parameter**, which is a shape the shipped function
does not accept. This is not cosmetic: a caller written against §3.4 as it now stands passes the
prompt positionally, the shipped destructuring yields `prompt === undefined`, and `dispatchAt`
(`:1840-1842`) dispatches `_agent(ADVISORY_RUNG_SKILL, undefined, { model })` — a silent
wrong-prompt dispatch, not a throw. The declared contract is still false against the shipped one;
the falsehood has moved, not gone.

Behaviour is unaffected — the single production call site and all seven unit call sites
(`advisoryRung.test.js:243, 256, 297, 359, 406, 450, 453, 466`) pass the one-object form and are
green. This remains **documentation-only, low**.

**TSPEC leg: open.**

---

## 2. New observation in the same section (low, informational)

Not part of the v2 item; found while re-reading §3.4, and recorded rather than fixed.

`TSPEC-pdlc-advisory-tier.md:340` prints the classification regex as:

```js
const MODEL_ERROR_RE = /\b(unknown|unrecognis|unrecogniz|invalid|unsupported)\b[^\n]*\b(model|alias)\b/i;
```

The shipped constant (`orchestrate-dev.js:1780-1781`) is:

```js
/\b(unknown|unrecognis\w*|unrecogniz\w*|invalid|unsupported)\b[^\n]*\b(model|alias)\b/i
```

The `\w*` suffixes are load-bearing and their absence changes the language matched: with a bare
`unrecognis` followed by `\b`, the string `unrecognised model` does **not** match, because there is
no word boundary between `unrecognis` and `ed`. The comment at `:1778-1779` exists precisely to
explain this ("boundary land where the word actually ends, matching both the British and American
spellings the test suite scripts"). The TSPEC snippet as printed would fail
`advisoryRung.test.js`'s British/American cases. Same class as §1.3: a §3.4 code block declaring a
contract the implementation does not have.

Also noted, non-gating: `TSPEC:354` cites the M-3 halt as `dev:1755`; the halt is at
`orchestrate-dev.js:1868` (`:1755` lands inside `readAdvisoryConfigSafely`'s JSDoc). Line-number
citations drift routinely and this one was not introduced by `dc3edba`; recorded for the next
document pass, not raised as a finding.

---

## 3. Sweep — no other stale reference

`grep -n "resolveAdvisoryRung\|§3.4" docs/pdlc-advisory-tier/*.md` over every feature document.
Every hit outside the two files above is either a name-only inventory reference or a statement that
is still true at the tip:

| File | Hits | Assessment |
|---|---|---|
| `DECISIONS-pdlc-advisory-tier.md:342`, `:406` | classification-of-the-real-dispatch; "`_state` is a parameter threaded from `main()`" | true at `:1811-1818`, `:1804-1809` |
| `PLAN-pdlc-advisory-tier.md:255`, `:269`, `:285`, `:686`, `:719` | task rows + ownership/export inventory, by name | no contract claim |
| `FSPEC-pdlc-advisory-tier.md:1087` | T-01 test-count row | true |
| `MANUAL-VERIFICATION-*.md:4`, `:33` | "which branch of the §3.4 ladder fired" | branch-level, contract-agnostic |
| `TSPEC:134`, `:146`, `:399`, `:464`, `:522`, `:705`, `:1196`, `:1270`, `:1295`, `:1366-1367`, `:1479`, `:1487`, `:1647` | export list, bundle probe, report/lifecycle/error-catalogue rows | none restates the signature or return shape |
| `PROPERTIES:456` (PROP-LIFE-01) | "returns before … `resolveAdvisoryRung`" | true (`:3132` is inside the enabled path) |
| `CODE_REVIEW-*-v1.md`, `-v2.md`, `CROSS-REVIEW-*-PROPERTIES-v2/v3.md` | quote the **old** contract | historical review records; correctly describe the state at their own time and are not restated contracts |

No third document requires an edit. The residue is confined to `TSPEC-pdlc-advisory-tier.md:324`,
`:329` (§1.3) and `:340` (§2).

---

## 4. Wave gate

```
cd pdlc/workflows && npm test -- --testPathIgnorePatterns '/node_modules/' \
  '/__tests__/helpers/' '/__tests__/fixtures/' 'documentOracles'
```

```
Test Suites: 82 passed, 82 total
Tests:       70 skipped, 3452 passed, 3522 total
Time:        58.359 s
```

**82/82 as expected — green.** `node pdlc/workflows/build-runtime.mjs --check` is also green (all
four `pdlc/workflows/dist/` rows in-sync), consistent with `dc3edba` touching only documents.

One environmental note for whoever runs the *unfiltered* suite: `pdlc/workflows/coverage/` is now
present and untracked in the working tree. `coveredViolations` walks the entire tree under `root`
skipping only `.git/` and `node_modules/`, so the document oracles — deliberately excluded from
this gate's pattern list — may be red locally for that reason alone. Not a branch defect; do not
remediate code for it.

---

## 5. Requirements traceability

Unchanged from v2 and not re-derived: **55/56**, `req_gaps = 0`. The single outstanding item is a
criterion-6 documentation falsification, not a REQ acceptance criterion — the behaviour §3.4
describes is implemented (`orchestrate-dev.js:1833-1876`) and tested at both unit
(`advisoryRung.test.js`) and driver (`runAdvisorySeam`) level. `boundary_gaps = 2` (§1.3 signature
shape, §2 regex snippet), both low, both documentation-only, both in one file.

---

## Notes for the remediator

1. **One file, two edits, no production change.** In `TSPEC-pdlc-advisory-tier.md`:
   - `:324-325` → a single `@param` for the deps bag carrying all four properties
     (`{{ _agent: Function, _log: Function, _state: {resolved: {model,fallback}|null},
     prompt: string }} deps`); delete the second positional `@param`.
   - `:329` → `export function resolveAdvisoryRung({ _agent, _log, _state, prompt }) { … }`.
   - `:340` → restore the `\w*` suffixes: `unrecognis\w*|unrecogniz\w*`.
   Optionally repoint `:354`'s `dev:1755` at `orchestrate-dev.js:1868`.
2. `pdlc/workflows/dist/` does **not** need rebuilding — `--check` is green at the tip and must
   stay that way.
3. Do not re-open anything else. Every v1 finding is closed (v2 §1), the PROPERTIES leg of the v2
   item is closed (§1.2 above), and the wave gate is green.

---

DOD_STATUS: failed
{"stubs": 0, "mock_data": 0, "unwired_integrations": 0, "coverage_below_threshold": false, "branch_coverage_pct": 89, "req_gaps": 0, "boundary_gaps": 2}
