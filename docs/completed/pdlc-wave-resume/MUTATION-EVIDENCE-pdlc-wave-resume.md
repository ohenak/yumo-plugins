# MUTATION EVIDENCE — pdlc-wave-resume

| Field | Value |
|---|---|
| Feature | pdlc-wave-resume |
| Branch | `feat-pdlc-wave-resume` |
| Version | 1.0 |
| Date | 2026-08-24 |
| Discharges | **PROP-COV-03** (TSPEC §5.5's five mutations), **PROP-PARITY-04** (the queue-parity falsification arm) |
| Upstream | `PROPERTIES-pdlc-wave-resume.md`, `TSPEC-pdlc-wave-resume.md` §5.5, `PLAN-pdlc-wave-resume.md` §4.3 |

## Why this file exists

PROP-COV-03 and PROP-PARITY-04 are **process duties**: each requires a mutation to be
*applied, observed RED against its named oracle, reverted, and its failure output recorded*.
Both properties said the recording lives "in the owning task's report" — an agent transcript,
which is not in the repository, so nothing on the branch could show the duty had been
discharged (CODE_REVIEW v1 §2, findings 14 and 15). This file is that tracked home. A duty
whose evidence has no durable home is a duty nobody can check after the fact.

Everything below was executed in this working tree on **2026-08-24**, at the branch tip, by
applying the mutation to the production source, running the named suites, capturing the
output, and restoring the file (`git diff --stat` clean after each). Runner in every case:

```
cd pdlc/workflows && node --experimental-vm-modules node_modules/jest/bin/jest.js <pattern>
```

Baseline before and after the whole exercise: `waveExecution waveResume` → **212 passed,
0 failed**; `waveResumeQueueParity` → **6 passed, 0 failed**.

## PROP-COV-03 — TSPEC §5.5's five mutations

| # | Mutation | Named oracle (TSPEC §5.5) | Observed | Result |
|---|---|---|---|---|
| 1 | Delete the ancestry guard | AT-02 set equality + AT-11 | 3 failed / 209 passed | **KILLED** |
| 2 | Move the record write outside the transport branch | AT-09's empty-`ledgerWrites` assertion | 2 failed / 210 passed | **KILLED** |
| 3 | Record a run-relative wave number | AT-18 | 2 failed / 210 passed | **KILLED** |
| 4 | Resolve the ancestry probe eagerly | AT-03 / AT-11 `merge-base` call-count | 2 failed / 210 passed | **KILLED** (see the note below — it survived first) |
| 5 | Suppress the record write while `explicitPointer` is true | AT-05's write-side conjunct only | 1 failed / 211 passed | **KILLED** |

### Mutation 1 — delete the ancestry guard

Guard 5 (`IG-5`) removed from `classifyWaveLedger` in `pdlc/workflows/orchestrate-dev.js`.
Three tests red; the `head-unreachable` code disappears from the classifier exactly as §5.5
predicts, and the end-to-end arm goes with it.

```
● classifyWaveLedger — the ordered guard table, all eight rows › guard 5 (IG-5): an unreachable head classifies full-run, code head-unreachable

    expect(received).toBe(expected) // Object.is equality

    Expected: "full-run"
    Received: "resume"

    > 279 |     expect(d.outcome).toBe("full-run");
      280 |     expect(d.code).toBe("head-unreachable");
      at Object.<anonymous> (__tests__/waveResume.test.js:279:23)
```

Also red: `AT-03 (unit half), PROP-DISREGARD-06: a record failing BOTH ancestry and over-count
classifies head-unreachable, never over-count` and `… a complete ledger whose commit is NOT an
ancestor of HEAD is ignored, and every wave runs`.

### Mutation 2 — record on a green gate rather than on a commit

`writeWaveLedger(…)` hoisted above the `if (waveGit)` block, so a run with no transport records
waves it never committed.

```
● Phase I — the wave ledger resumes a halted run unattended › writes no ledger at all when there is no git transport to commit with

    expect(received).toEqual(expected) // deep equality
    - Expected  - 1
    + Received  + 23
    > 2722 |     expect(ledgerWrites(writes)).toEqual([]);
```

Also red: `stamps the commit each recorded wave landed on` — the hoisted write cannot stamp a
commit that has not happened, so every `head` reads `undefined`:

```
      Array [
    -   "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",  (×3)
    +   undefined,                                    (×3)
      ]
```

### Mutation 3 — record a run-relative wave number

`formatWaveLedger(featureName, planHash, waveNum - startWave + 1, waveHead)`.

```
● Phase I — the wave ledger resumes a halted run unattended › an explicit implementation.startWave outranks the ledger

    expect(received).toBe(expected) // Object.is equality

    Expected: 3
    Received: 1

    > 2844 |     expect(JSON.parse(recorded[recorded.length - 1]).lastGreenWave).toBe(3);
      at Object.<anonymous> (__tests__/waveExecution.test.js:2844:69)
```

Also red: `completion accumulates across invocations: a third run skips exactly the waves
earlier runs recorded` — AT-18, the oracle §5.5 names as the only one that kills this.

### Mutation 4 — resolve the ancestry probe eagerly

The `!(outcome === "full-run" && ANCESTRY_INDEPENDENT_CODES.includes(code))` condition replaced
by `if (true)`.

**This mutation SURVIVED on first application** (212 passed, 0 failed), which is a finding
about the suite, not about the mutation. `headCorroborated` returns early when the record
carries no `head`, and every ancestry-independent fixture in the AT-03/AT-11 table was written
without one — so the zero-probe conjunct had nothing to be about and an eager build was
indistinguishable from a lazy one. Two fixtures (`a record for another feature`, `a plan hash
that no longer matches`) now carry `head: DISREGARDED_HEAD` while keeping their expected
`merge-base` call list at `[]`. Re-applied against the strengthened fixtures:

```
● Phase I — the wave ledger resumes a halted run unattended › a record for another feature is ignored with a notice, and every wave runs

    expect(received).toEqual(expected) // deep equality
    - Expected  - 1
    + Received  + 8

    - Array []
    + Array [
    +   Array [ "merge-base", "--is-ancestor", "cccc…cccc", "HEAD" ],
    + ]

    > 2952 |     expect(gitCalls.filter((a) => a[0] === "merge-base")).toEqual(expectedMergeBaseCalls);
```

This is exactly the load-bearing-matcher point §5.5 makes: `toEqual` on the filtered call list
is what fails; `toContainEqual` would not have.

### Mutation 5 — suppress the record write while `explicitPointer` is true

`writeWaveLedger` returns early on operator-pointed runs.

```
● Phase I — the wave ledger resumes a halted run unattended › an explicit implementation.startWave outranks the ledger

    expect(received).toBeGreaterThan(expected)

    Expected: > 0
    Received:   0

    > 2843 |     expect(recorded.length).toBeGreaterThan(0);
      at Object.<anonymous> (__tests__/waveExecution.test.js:2843:29)
```

Exactly one test red — AT-05's write-side conjunct, the oracle §5.5 names as the only one that
kills it. AT-07, AT-15 and AT-18 drive automatic-provenance runs and stayed green, confirming
the "killed only by" claim rather than merely asserting it.

## PROP-PARITY-04 — the queue-parity falsification arm

Two arms, both executed.

**(a) In-suite arm.** `waveResumeQueueParity.test.js`'s `PROP-PARITY-04` case runs
PROP-PARITY-02's own oracle against a delegation call carrying `{reqPath, startWave}` and
asserts it throws. It passes in the ordinary run — the falsification is executed on every CI
run, not merely asserted possible.

**(b) Production-side arm.** `orchestrate-queue.js:1582` mutated to
`runPipelineFn({ reqPath: entry.reqPath, startWave: 2 })`. Run over
`waveResumeQueueParity waveExecution waveResume waveResumeProperties`: **1 failed, 211 passed**
— PROP-PARITY-02 alone, with PROP-RESUME-01 … PROP-OVERRIDE-01 all still green, which is the
discrimination PROP-PARITY-04 asks for.

```
● PROP-PARITY-02 — the delegation payload carries only reqPath › Object.keys(arg) toEqual(['reqPath']) on the spy _runPipeline is called with

    expect(received).toEqual(expected) // deep equality
    - Expected  - 0
    + Received  + 1

      Array [
        "reqPath",
    +   "startWave",
      ]

    > 137 |     expect(Object.keys(arg)).toEqual(["reqPath"]);
```

The source was restored after each arm; `git diff --stat orchestrate-dev.js
orchestrate-queue.js` is empty at the commit this file lands in.
