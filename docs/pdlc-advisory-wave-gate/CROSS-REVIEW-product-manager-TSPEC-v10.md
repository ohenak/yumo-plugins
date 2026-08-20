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
