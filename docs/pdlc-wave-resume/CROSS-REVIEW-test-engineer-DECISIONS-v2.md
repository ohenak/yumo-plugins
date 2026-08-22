# Cross-Review: test-engineer — DECISIONS

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-wave-resume/DECISIONS-pdlc-wave-resume.md (v1.1)
**Date:** 2026-08-21
**Iteration:** 2
**Scope:** delta re-review — my v1 findings, the sections the v1.1 diff changed, and nothing else.

## Verification Method

Delta scope: `git diff 2819618b..HEAD -- docs/pdlc-wave-resume/DECISIONS-pdlc-wave-resume.md`
(111 insertions, 35 deletions), where `2819618b` is the commit carrying my v1 review. The branch
still carries neither the mechanism nor the wave-gate baseline, so — as in v1, and as the document's
own Verification frame states — every counted claim was re-derived against `origin/main` at
`345ae358` (`git cat-file -t 345ae358` -> `commit`), citing by exported symbol, enclosing test or
comment text per DEC-DOC-01, with line numbers as locators only.

**Every counted claim the revision restates now re-derives.** These are the claims my v1 Highs and
Mediums were about; each was re-run, not read:

| Restated claim (v1.1) | Command / anchor at `origin/main` `345ae358` | Result |
|---|---|---|
| Regression net is **26 cases (18 / 4 / 4)**, `it.each` members counted individually | `describe("Phase I — the INTERIM wave ledger resumes a halted run unattended")`: 14 `it` + one four-member `it.each` = 18; `describe("Phase I — implementation.startWave resumes a halted run")`: 4 `it`; `describe("computePlanHash — the ledger's plan fingerprint")`: 4 `it`. 23 statements / 26 cases | correct |
| The `implementation.startWave` block is the pointer's own four cases, and `it("an explicit implementation.startWave outranks the ledger")` lives in the ledger `describe` | the four titles are skip-before-pointer, past-the-end, default, invalid; the interaction test sits inside the ledger block | correct — the v1 mischaracterisation is gone |
| The decision chain is **48 lines** | `if (ledger.reason) {` at `:15297` through the final `else`'s closing brace at `:15344` = 48 | correct |
| The enclosing read block is **84 lines** | `if (!explicitPointer) {` `:15263` through its close `:15346` = 84 | correct — **and it corrects my own v1 figure of 81**, which was three short |
| `main()` destructures **36 parameters, 34 of them injected seams** | the destructured list at `export default async function main({` `:12992`: `reqPath`, `forcePhases`, then 34 underscore-prefixed entries ending `_provenance` | correct; the "35th seam / 37th parameter" denominator in O-3 and DEC-WVR-02 follows |
| `orchestrate-dev.js` is the largest tracked **source module**, second overall behind generated `dist/pdlc-cli.mjs` | `git ls-tree -r -l origin/main \| sort -k4 -n -r \| head -3` -> 738,924 `dist/pdlc-cli.mjs`; 734,711 `orchestrate-dev.js`; 314,472 a document | correct |
| `formatWaveLedger` always emits `{version, feature, planHash, lastGreenWave}` (+ `head`) | `:12325-12331`, the two literal record shapes | correct |
| `parseWaveLedger` never reads `parsed.version`; well-formedness is over `feature`, `planHash`, `lastGreenWave` only | `:12281-12295` | correct — DEC-WVR-05's new "written, not gated on" sentence is exact |
| `over-count` is **not** in `ANCESTRY_INDEPENDENT_CODES`, so an over-count record re-classifies to `head-unreachable` | TSPEC `:168` and `:445-447` list `{null, "unreadable-json", "not-an-object", "wrong-shape", "feature-mismatch", "plan-changed"}`; shipped guard order puts ancestry `:15307` above over-count `:15313` | correct |

New claims introduced by the revision, all re-derived and all accurate: the invalid-value notice is
emitted by a **key-generic** loop (`for (const key of implParsed.invalidKeys)` at `:15093` and
`:15185`, one templated `emit` shared by every `implementation` key) and `parseImplementationConfig`
replaces a rejected `startWave` with `IMPLEMENTATION_DEFAULTS.startWave` (`:234-242`), so
`const explicitPointer = startWave > 1` (`:15236`) is **false** by the time the ledger block runs;
the past-the-end path keeps `explicitPointer` **true** because it is computed before the clamp; and
`describe("Phase I — the script-owned test gate")` really does carry two whole-string `phaseDetail`
equalities on wave-1 runs (`All 1 waves complete (wave mode, script-owned gate)` and
`(wave mode, self-report gate)`), which the `N > 1` condition is what keeps green. TSPEC §2.4's
report-row table already carries the same `N > 1` condition ("Executed from wave 1, no resume …
unchanged"), so the decision and its upstream agree rather than diverge.

## Resolution of v1 Findings

| v1 ID | Severity | Status | Evidence in v1.1 |
|---|---|---|---|
| F-01 | High | **Resolved** | The Context row and O-1 both read **26 test cases (18 / 4 / 4)**, the counting rule is stated explicitly ("test *cases*, with `it.each` members counted individually — the same three blocks are 23 `it` statements"), and the command that produces it is given (`npm test -- __tests__/waveExecution.test.js --verbose` from `pdlc/workflows`, which is a real script: `pdlc/workflows/package.json` defines `test`). The `git grep -l` closure argument for "26 is the whole net" is stated rather than assumed. The mischaracterised parenthetical is replaced with the correct one: the four `implementation.startWave` cases are named, and the interaction test is located in the ledger `describe` where it is counted. |
| F-02 | High | **Resolved** | DEC-WVR-03 and O-5 now bound "each announcing outcome" by a stated criterion — *a notice carries a token iff the resume decision emits it about a resolved start point* — and exclude the invalid-`startWave` config notice under it. The exclusion is grounded in the mechanism rather than in taste, and every limb of that grounding re-derives (key-generic `invalidKeys` loop shared by all four `implementation` keys, two call sites, default substitution making `explicitPointer` false). The count stays three, and — the half I asked for — Consequences now carries the closing oracle: **set equality** over the announcements observed to carry a token against TSPEC §2.4's announcing rows, with the excluded notices enumerated as literals, so a fifth announcement reds an assertion instead of passing containment. The Risks entry is split into its loud half (an assertion that changes; suite-gated) and its silent half (an announcement left untouched; oracle-gated), which is exactly the asymmetry v1 said had no detector. |
| F-03 | Medium | **Resolved** | 48 lines, with the boundary that produces it, and the 84-line enclosing read block named separately with the four things it contains that DEC-WVR-02 does not extract. The revision is more accurate than my own finding was. |
| F-04 | Medium | **Resolved** | Restated as "largest tracked **source module** … second-largest tracked file overall", with all three sizes and the sort command, and the Risks bullet restated to match. The revision also makes the point v1 only gestured at: the largest tracked file is a build output *of* the file this feature edits, which is why the `postWavePathspecs` risk exists. |
| F-05 | Medium | **Resolved**, with one residual precision defect | The write-side consequence is now positive-first — every observed write parses to an object whose key set is **exactly** the four (plus `head`), with the absence of `{}`/`""` as a derived conjunct, and the row says in terms why an absence-only oracle would not do. One conditional inside it over-specifies the code; see F-01 below, which is a Medium against the new text, not a re-opening of the old one. |
| F-06 | Medium | **Resolved** | DEC-WVR-08 now prescribes **three** call-count equalities, the third being the over-count-with-unreachable-head fixture, and states what it pins that the other two do not (laziness *and* guard order together). The trigger is bidirectional and names the concrete regression — `over-count` being added to `ANCESTRY_INDEPENDENT_CODES` — with the reason nothing else would red. |
| F-07 | Low (Process) | **Resolved** | DEC-WVR-05's trigger is given its observable form (contiguous ascending run of executed wave numbers from `startWave`) and DEC-WVR-02's is explicitly marked a design aspiration with its observable half delegated to DEC-WVR-06's trigger. Marking an unobservable trigger *as* unobservable is the right disposition; see F-02 below for the one thing the observable one still lacks. |
| Q-01 | — | **Answered** | The invalid-pointer notice takes no token, by a stated criterion. |
| Q-02 | — | **Answered** | The 32/8 basis is abandoned rather than reconstructed, and the new figure carries its rule. |
| Q-03 | — | **Answered** | DEC-WVR-05's Consequences row makes the freeze mechanical: set equality over `formatWaveLedger`'s emitted keys in both shapes, with the read-side indifference to `version` stated in the decision. |
| Q-04 | — | **Answered** | DEC-WVR-03's Consequences row adds the exclusivity conjunct: no run emits a Phase I detail matching both `✅` shapes, and a wave-1 run's detail is asserted equal to the shipped literal. |

## Findings

No High findings. All four are against text the v1.1 diff introduced; none blocks Phase P.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | DEC-WVR-04's new write-side oracle conditions `head`'s presence on "when a transport is injected", but the shipped write site makes `head` present only when a transport is injected **and** `rev-parse HEAD` returns `ok` — a `waveHead` of `null` is a reachable shipped outcome with a transport present. Transcribed as written, the key-set equality reds on a legitimate fixture. | Consequences, DEC-WVR-04 row |
| F-02 | Medium | Local | DEC-WVR-05's new observable trigger names a detector (contiguity of executed wave numbers) that no Consequences row obliges anyone to write. An observable trigger with no observer never fires. | DEC-WVR-05 trigger vs. its Consequences row |
| F-03 | Low | Local | The criterion's parenthetical describes the past-the-end notice as "emitted **inside** the resume decision"; in the shipped module it is emitted above the ledger block, in the pointer-resolution segment. The discriminant that actually holds is subject-matter plus `explicitPointer`, not code location — and after DEC-WVR-02's extraction the location reading gets worse, not better. | DEC-WVR-03; O-5 |
| F-04 | Low | Local | The revision-history row ends "No decision, alternative disposition or downstream obligation changed", but four downstream obligations were **added**. A PLAN author who reads that sentence as "Consequences is unchanged" skips the four rows that grew. | Revision history, v1.1 row |

### F-01 (Medium) — the `head` conditional over-specifies the shipped write site

The new row prescribes: *every observed ledger write parses to an object whose key set is exactly
`{version, feature, planHash, lastGreenWave}` (plus `head` when a transport is injected)*. The
positive-first shape is right, and set equality rather than containment is right. The parenthetical
is one clause too strong.

At the write site, `waveHead` starts `null` and is filled only through a successful probe:

```js
let waveHead = null;
if (waveGit) {
  try {
    const rev = await waveGit(["rev-parse", "HEAD"]);
    if (rev && rev.ok === true) waveHead = String(rev.stdout ?? "").trim() || null;
  } catch { waveHead = null; }
}
await writeWaveLedger(formatWaveLedger(featureName, planHash, waveNum, waveHead), …);
```

(`orchestrate-dev.js` `:15590-15602`, inside the `if (waveGit)` branch of the wave loop.) A transport
that answers commits but returns `ok: false` — or throws — on `rev-parse` writes the **four-key**
shape with a transport injected, and `formatWaveLedger` `:12325-12331` renders exactly that: the
`head` key is omitted, not set to `null`. The shipped comment above the site says as much ("Omitted
(null) when no git transport was injected" is the *other* case it names, but the code's own
`catch { waveHead = null; }` is the third).

Why it matters for a test rather than for prose: this row is the oracle a PROPERTIES author
transcribes. Written as a biconditional on transport injection, the assertion is falsified by a fixture
the feature must keep working — a git fake whose `rev-parse` fails while its commits succeed, which is
precisely the fail-open behaviour the ledger's `head` field is designed for. The author then either
weakens the set equality to containment (losing the whole point of the row) or edits a shipped
behaviour to satisfy a document.

**Required change (one clause).** State the two admissible shapes and assert membership in the set of
two: *every observed write's key set is exactly `{version, feature, planHash, lastGreenWave}` or
exactly that set plus `head`; `head` is present iff a transport was injected **and** its
`rev-parse HEAD` returned `ok`; and no observed write is `{}` or `""`.* That keeps set equality,
keeps the positive-first shape, and covers the reachable third case.

### F-02 (Medium) — the observable trigger has no observer

DEC-WVR-05's trigger now reads: *the executed wave numbers of a run ever fail to form a contiguous
ascending run from `startWave` — … and that a test asserting contiguity over the dispatched wave
numbers reds the day it stops holding.* The property is real: the serial loop
`for (let waveIndex = 0; waveIndex < waves.length; waveIndex++)` with the single `if (waveNum <
startWave)` cut-off (`orchestrate-dev.js` `:15368-15372`) is what makes the completed set necessarily
a prefix, and that is the whole warrant for rejecting O-7.

But the sentence describes a test in the conditional — "a test asserting contiguity … reds the day
it stops holding" — and DEC-WVR-05's Consequences row obliges only the key-set equality over
`formatWaveLedger`'s output. No row obliges the contiguity assertion. Compare DEC-WVR-08, whose
trigger names a regression **and** whose Consequences row commissions the third call-count fixture
that catches it; and DEC-WVR-03, whose trigger is backed by the catalogue set-equality oracle. Those
two are the pattern; this one names the observation and stops.

**Required change.** Add the conjunct to DEC-WVR-05's Consequences row: on a resumed run, the
dispatched wave numbers are asserted **equal** to the contiguous ascending sequence
`startWave..waves.length`, paired positively with the skipped numbers asserted equal to
`1..startWave-1` (both set equalities, so a dropped or reordered wave reds rather than passing a
containment). One assertion, and the trigger acquires the observer it claims.

### F-03 (Low) — "inside the resume decision" is a location reading of a subject-matter criterion

The criterion is sound and the exclusion it produces is correct; this is about the sentence a test
author will apply it with. The document justifies the past-the-end notice's inclusion by saying it is
"emitted **inside** the resume decision, from a valid pointer that resolved to a full run, with
`explicitPointer` **true**". In the shipped module the past-the-end `emit` is at `:15237-15242`, in
the pointer-resolution segment that begins `let startWave = implConfig.startWave;` `:15230` — *above*
`if (!explicitPointer) {` `:15263`, i.e. outside the block DEC-WVR-02 extracts into
`classifyWaveLedger`. Read by location, the past-the-end notice sits with the excluded notice, not
with the included ones; read by subject matter plus `explicitPointer`, it sits exactly where the
document puts it. Only the second reading survives the extraction, since afterwards "the resume
decision" names a pure classifier that emits nothing at all.

**Suggested change.** Drop the location clause and let the two conjuncts the criterion already has do
the work: *a notice carries a token iff it announces a resolved start point for this run — the
pointer-resolution and ledger-classification notices do (`explicitPointer` true and false
respectively); notices about a config key's validity, emitted by the shared `invalidKeys` loop before
any start point is resolved, do not.*

### F-04 (Low) — "no downstream obligation changed" undersells four added obligations

The v1.1 revision-history row closes: "No decision, alternative disposition or downstream obligation
changed." Nothing was *removed* or weakened, which is the true and useful half. But four obligations
were added, all of them oracles a PLAN or PROPERTIES author must carry: the catalogue set-equality
plus exclusivity conjunct (DEC-WVR-03), the positive write-side key-set equality (DEC-WVR-04), the
both-shapes key-set equality (DEC-WVR-05), and the third call-count fixture (DEC-WVR-08).

**Suggested change.** "No decision or alternative disposition changed; no downstream obligation was
removed or weakened, and four were **added** — see the Consequences rows for DEC-WVR-03, -04, -05
and -08."

## Questions

## Positive Observations

## Recommendation

## Verdict
