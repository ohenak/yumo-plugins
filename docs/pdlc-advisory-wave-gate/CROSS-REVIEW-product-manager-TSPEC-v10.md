# Cross-Review: product-manager — TSPEC (delta re-review)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md (v1.9)
**Date:** 2026-08-19
**Iteration:** 10
**Scope:** Local

## Re-grounding on upstream HEAD

This is the check the round's own changelog claims to have performed, so I ran it first and
independently rather than reading the claim.

| Upstream | HEAD sha256 | Anchor carried in v1.9's changelog / my v9 `UPSTREAM-STATE` | Match |
|---|---|---|---|
| REQ | `817b6745…8a7a8` | `a10396e8…d9645` | **differs** |
| FSPEC | `82f74a2d…61c3e` | `82f74a2d…61c3e` | identical |

FSPEC has not moved. REQ has: it is at **v1.9** at HEAD, advanced by commit `e619b6d6`
*"docs(req): v1.9 — §1 ledger, NFR-4 (v7 F-06, F-07)"*. That commit is inside this review's range
and, by author timestamp, landed at **16:42:31**, roughly fifteen minutes **before** the five
TSPEC v1.9 commits (`12f506bd` 16:57:27 → `3f5a65f9` 16:59:52). The re-grounding assertion was
therefore already false at the moment it was written, not merely stale by drift. That is F-01.

I then checked whether the movement costs the design anything, because a false basis and an owed
absorption are different sizes of problem:

- REQ v1.9's own changelog says *"Restoration, not decision … No decision reopened."* Four of the
  seven items are restorations of previously approved wording reverted by a rebase.
- The one item that touches this round's subject matter — §5 C-2's `advisory.waveBudgetPerRun`
  default `1` per Q-1 (`REQ:237`, `:239`) — **agrees** with TSPEC §4.4's default `1`.
- NFR-4's revision (`REQ:500`–`:506`) changes the *rationale* for excluding gate-command time (the
  window now "closes at the attempt's verdict" rather than the gate "running between attempts")
  and explicitly preserves the conclusion: no subtraction, no carve-out. TSPEC cites NFR-4 nowhere,
  so nothing in it contradicts the new wording.

So no substantive absorption is owed, and I am not asking for design work. What is owed is an
honest basis: the document currently offers a byte-identity claim as its evidence that it re-grounded,
and that evidence is false. Given how much of this feature's convergence has rested on the
re-grounding ritual, a changelog that certifies an upstream state that HEAD contradicts is worth one
correcting round.

## Disposition of my v9 finding

**v9 F-01 (Medium, `Local`) — §4.4/§5.1 claimed the example config "teaches" E-33's
`waveBudgetPerRun: 0`-with-`enabled: true` affordance, while the literal shows neither `0` nor
`enabled: true`. RESOLVED.** The claim is withdrawn in all four places I named, and the replacement
is more honest than the minimum fix I asked for:

| Site | HEAD wording | Verified |
|---|---|---|
| §4.4 key table (`:1098`) | `0` is the "**intended operator configuration** (honoured, not documented anywhere operator-facing this feature ships)" | Yes — the "documented operator affordance" phrasing is gone |
| §4.4 example paragraph (`:1126`–`:1138`) | "That literal is the **shipped-default pairing and nothing more** … It does **not** teach E-33's … affordance, and this TSPEC does not claim it does" | Yes |
| §4.4 README close (`:1148`) | "The `0` affordance therefore has **no documentation carrier in this feature at all**; it is carried by behaviour and its test" | Yes |
| §5.1 example row (`:1262`) | "The literal is the shipped-default pairing only — it does not teach E-33's `0`-with-`enabled: true` affordance, which has no documentation carrier in scope" | Yes |
| §7 OQ (`:1650`) | Same withdrawal carried into the open-questions restatement | Yes |

The behavioural substitute checks out where it points: FSPEC `E-33` (`FSPEC:296`) requires the key
validate as a non-negative integer so an explicit `0` is "honoured as written", and `AT-07-2b`
(`FSPEC:456`) pins the companion case "`0` in yields `0` back, and the key is absent from the
invalid-key report", with the literal transcribed from spec to test and never the reverse. So the
affordance is genuinely asserted even though it is undocumented, which is exactly the end state my
Q-01 asked someone to state out loud rather than leave implied.

My v9 Q-01 is also answered, and answered in the right register: §4.4 now says whether operators
should be *told* about the affordance in prose "is a product decision that would need its own
REQ/FSPEC requirement naming a carrier … it is deliberately not decided here." That is a TSPEC
declining to make a product decision it has no mandate for and naming the carrier that would own
it. Correct call; I am closing Q-01 rather than re-asking it.

## Verification of the round's other two repairs

Both were raised by test-engineering, and both are in scope for me only insofar as they must not
break product claims. I checked them against the tree rather than against the changelog.

**TE F-01 — §5.1 vs §1.3 set-equality replaced by containment.** The old text asserted set-equality
in both directions and was false in both. The new invariant is **§5.1 ⊇ §1.3** over test-side files.
I extracted both lists mechanically and diffed them: every one of §1.3's eight test files
(`advisoryConfig`, `advisoryDisabled`, `advisoryDriver`, `advisoryEnvelope`, `advisoryHarvest`,
`advisoryQueueSeams`, `advisoryRecord`, `consolidationProperties`) now appears in §5.1, with no
residue. The containment holds in the direction claimed, and §5.1's extra behavioural homes
(`advisoryWaveGate`, `waveExecution`, `advisoryEscalationLog`, plus the two engine-channel files)
are the asymmetry the new prose openly declares. Naming the weaker true invariant instead of the
stronger false one is the right repair.

**TE F-02 — line pins re-anchored to stable content per DEC-DOC-01.** The three `.enabled` pins were
the load-bearing ones, since PROP-DIS-06 counts occurrences and requires exactly three. At HEAD,
`grep -n '\.enabled\b'` over both files returns exactly three sites, and each matches its new symbol
anchor:

| §3.2 / §1.3 anchor | HEAD | Verified |
|---|---|---|
| `runAdvisorySeam`'s disabled-tier early return | `orchestrate-dev.js:3262`, `if (!config \|\| config.enabled === false)`, inside `runAdvisorySeam` (opens `:3228`) | Yes |
| run-level `const advisoryTierOn = advisoryConfigResult.config.enabled` | `orchestrate-dev.js:13682` | Yes |
| `orchestrate-queue.js`'s `finish` closure | `orchestrate-queue.js:1265`, inside `const finish = (fields) => …` | Yes |

The changelog's drift claim also checks out: the old pins `:3258`, `:13678`, `:1318` had indeed
moved to `:3262`, `:13682`, `:1265`, so the count of three is unchanged while all three numerals had
rotted. Re-anchoring to symbols was overdue and is the durable fix.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Local | FINDING: High \| delta \| local \| §Changelog v1.9 (`:41`–`:43`) — The round's re-grounding claim is false at HEAD. It states REQ and FSPEC "are unchanged from the state v1.8 was authored against and from the `UPSTREAM-STATE` anchors on both v8 cross-reviews, so nothing upstream was decided this round and no absorption is owed." FSPEC is indeed unchanged (`sha256:82f74a2d…`), but REQ is at **v1.9** at HEAD with `sha256:817b6745…`, not the anchored `sha256:a10396e8…`; it was advanced by `e619b6d6` at 16:42:31, ~15 minutes **before** this round's first TSPEC commit (`12f506bd`, 16:57:27). The claim was false when written, not drifted. **Fix:** restate the v1.9 changelog's re-grounding paragraph against REQ v1.9 — record the true HEAD hash, note that REQ v1.9 is restoration plus two corrections with "No decision reopened", and state the two conclusions I verified independently and which the document may adopt: §5 C-2's restored `waveBudgetPerRun` default `1` agrees with §4.4's default `1`, and NFR-4's rewording preserves its conclusion and is uncited by this TSPEC, so no absorption is owed. The conclusion survives; only its evidence must become true. | REQ §5 C-2, NFR-4 |
| F-02 | High | Local | FINDING: High \| delta \| local \| §5.1's new `advisoryQueueSeams.test.js` row (`:1236`) — The row states the remaining work is `expect(report.advisory.rows).toHaveLength(5)` "becomes `6`. Transcription only". At HEAD that assertion already reads `6` (`advisoryQueueSeams.test.js:634`), and it is **red**: `ADVISORY_SEAMS` is still `["A1","A2","A3","A4","A5"]` (`orchestrate-dev.js:1951`), so `advisorySummaryRows` yields five rows and the suite fails `Expected length: 6 / Received length: 5`. The same premature flip hit all four sites §1.3 `:268` enumerates — `advisoryDisabled.test.js:629`, `advisoryHarvest.test.js:578` and `:733` — all four committed by `e3b9d5a3`, and I confirmed by running the suites that three further tests fail there (2 suites failed, 3 tests failed). So both §5.1 `:1236` and the inherited §1.3 `:268` describe a pre-edit tree that no longer exists, and a downstream implementer told to "change 5 to 6" will find `6`, change nothing, and inherit four red assertions whose cause is an unshipped production constant. **Fix:** restate both rows against HEAD — the transcription is already applied and is red pending A6's addition to `ADVISORY_SEAMS`, so the owned work is to make it green, not to make the edit. | AC-6.1, FSPEC S-1 |
| F-03 | Medium | Process | FINDING: Medium \| inherited \| nonlocal \| Repository state, not the TSPEC — Commit `e3b9d5a3`, titled `docs(cross-review): se REQ v7 — High findings`, also committed the four source-test edits in F-02 **and** 14 tracked `.claude/workflows/.pdlc-backups/*.bak` files totalling **4.7 MB**. Per the project's own standing note, `coveredViolations` in `pdlc/workflows/lib/document-oracles.mjs` walks the entire tree under `root`, skipping only `.git/` and `node_modules/`, so tracked tool-cache backups are exactly the class of file that perturbs document oracles and DoD scans. A docs-labelled commit carrying production-test edits also defeats the round-history reading this pipeline depends on. No TSPEC edit is required; this belongs to whoever owns branch hygiene before Phase I. | — |
| F-04 | Low | Local | FINDING: Low \| delta \| local \| §3.2 step 2 (`:628`–`:630`) — The re-anchored third `.enabled` site is quoted as `advisoryConfig.config.enabled ? advisorySummaryRows(...) : undefined`, but the shipped expression at `orchestrate-queue.js:1265` guards two conjuncts first: `advisoryConfig && advisoryConfig.config && advisoryConfig.config.enabled ? … : undefined`. The elision does not affect the occurrence count PROP-DIS-06 constrains, and the symbol anchor (`finish` closure) is correct, so nothing downstream misreads. Worth an ellipsis or the full conjunction next time the paragraph is touched. | PROP-DIS-06 |

DEFERRED: Whether §1.3's `:268` row-count table should carry current per-site truth (which of the four assertions are applied-but-red) rather than a pre-edit snapshot — a structural question about what §1.3 is for, not decidable in a frozen round.
DEFERRED: Whether the four premature test edits should be reverted so Phase I opens on a green branch, or carried forward as an already-applied RED step — a PLAN/Phase-I sequencing decision, not a TSPEC one.

## Questions

| ID | Question |
|----|---------|
| Q-01 | *(v9 Q-01 — **closed**.)* §4.4 now answers it: the `0` affordance is honoured and asserted but deliberately undocumented, and a prose carrier would need its own REQ/FSPEC requirement. No further answer needed. |
| Q-02 | Does anything in this feature's scope add `"A6"` to `ADVISORY_SEAMS` (`orchestrate-dev.js:1951`), or does §3.1's exported-list change depend on a task owned elsewhere? Four assertions at HEAD are already red waiting on exactly that constant, so the answer determines whether Phase I opens green or red. Non-gating for the TSPEC's own correctness. |

## Positive Observations

- The PM F-01 repair went past the minimum. I asked for one overclaiming clause to be dropped; the
  round withdrew it in five places, named what actually carries the `0` affordance (behaviour plus
  `nonNegativeInt` and AT-07-2b), and then said plainly that the affordance has *no* documentation
  carrier in scope. Documents rarely volunteer "we do not cover this"; that sentence is worth more
  to a downstream reader than the claim it replaced.
- Declining to decide the discoverability question, and naming the REQ/FSPEC requirement that would
  own it, is the TSPEC staying inside its mandate. That is the behaviour I want to see repeated: a
  product gap recorded and routed, not quietly closed by an engineering document.
- Replacing a false set-equality with a true containment is the harder and better choice. §5.1 ⊇ §1.3
  is a weaker statement, and it is checkable — I checked it mechanically and it holds with no residue.
  A weaker invariant that is true beats a stronger one that was false in both directions.
- Re-anchoring the `.enabled` pins to symbols proved its own worth inside one round: all three
  numerals had already drifted (`:3258`→`:3262`, `:13678`→`:13682`, `:1318`→`:1265`) while the
  symbols and the exactly-three constraint held. Every re-anchored claim resolved on first check.

## Recommendation

**Needs revision**

Two High findings, both narrow and both correctable in prose without reopening any decision:

1. **F-01** — Restate the v1.9 changelog's re-grounding paragraph against REQ v1.9 (`sha256:817b6745…`).
   The conclusion "no absorption is owed" is correct and I verified it independently; only the
   byte-identity evidence offered for it is false.
2. **F-02** — Restate §5.1 `:1236` (and, while adjacent, inherited §1.3 `:268`) against HEAD: the
   `5`→`6` transcription is already applied at all four sites and is red pending `"A6"` joining
   `ADVISORY_SEAMS`. The owned work is to make it green, not to make the edit.

Neither requires a design change, a new decision, or upstream absorption. F-03 is repository
hygiene owned outside this document, and F-04 is a wording nicety; neither gates.

Everything I blocked on in v9 is resolved, and the three repairs this round shipped are each
correct where they point. The document is close; it is the two current-state claims, not the design,
that are behind the tree.

## Verdict

VERDICT: Needs revision
{"high": 2, "medium": 1, "low": 1}
