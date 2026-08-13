# POSTMORTEM — Phase T — pdlc-engine-distribution

| Field | Value |
|---|---|
| Upstream | `REQ` → `FSPEC` → `TSPEC` → **POSTMORTEM-T** |
| Downstream | operator decision; `LEARNINGS-pdlc-engine-distribution.md` at harvest |
| Cross-Reviews | `CROSS-REVIEW-{product-manager,test-engineer}-TSPEC-v{1..5}.md` (10 files) |
| LEARNINGS | `docs/pdlc-engine-distribution/LEARNINGS-pdlc-engine-distribution.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | halted | Claude (se-author) | 1.0 | 2026-08-13 |

RESOLVED: no

## Phase

**Phase T — TSPEC authoring and cross-review. The halt is round-budget exhaustion:
`MAX_REVIEW_ROUNDS = 5` rounds were spent, every round closed every prior finding, and every
round's own new work carried one new High. The revision answering round 5 (`v0.6`) is written
and committed but was never read by a reviewer.**

| | |
|---|---|
| Document | `docs/pdlc-engine-distribution/TSPEC-pdlc-engine-distribution.md` — **v0.6 at HEAD**, 1668 lines |
| Branch | `feat-pdlc-engine-distribution` |
| Halt reason | review-round budget exhausted (5 of 5), last read version `v0.5` non-approving from both reviewers |
| Round budget | `MAX_REVIEW_ROUNDS = 5` — **exhausted**. `MAX_LIFETIME_ROUNDS = 15` — **5 used, 10 remain**, so a re-invocation opens rounds 6–10 with headroom to spare |
| Last verdicts | PM `Needs revision {1, 1, 1}` (`2c90003c`), TE `Needs revision {1, 1, 2}` (`251262ec`), both against `v0.5` |
| Terminal state | **not a disputed document.** Both round-5 blockers are one-clause edits, both landed in `v0.6` (`c9466b29`…`4f90b960`, six commits, 02:47–02:50), along with both reviewers' Mediums, Lows and all three open questions |
| Not yet done | the three upstream errata §14.4 declares (FSPEC §5.2's packed set, FSPEC's `[blocked on O-9]` marking of AT-4.5, REQ AC-5.3's kind-4 wording confirmation) have had **no erratum round** — FSPEC is still `v0.2`. Phase T halted before the protocol ran |

The distinction that governs the fix: nothing in round 5 says the design is wrong, and neither
reviewer re-opened anything settled in rounds 1–4. Both reviewers said the round's own new work —
the production-carrier table and the production-path test level — closed a real
`builder-not-wired` hole that would otherwise have shipped AC-5.3 green in the suite and broken
for every operator. The blockers are defects *inside this round's new prose*, and the budget ran
out before the round that would have confirmed their repair.

## Iterations (5 — limit reached)

| Round | TSPEC version | PM verdict | TE verdict | Prior findings resolved | New Highs, and where they came from |
|---|---|---|---|---|---|
| 1 | v0.1 | Needs revision `{4, 3, 2}` (`F-01…F-09`) | Needs revision `{7, 4, 2}` (`F-01…F-13`) | — | initial draft |
| 2 | v0.2 | Needs revision `{3, 1, 1}` | Needs revision `{2, 5, 1}` (`F-14…F-21`) | **9 / 9 PM, 13 / 13 TE** | `bin/cli.mjs` (created by round 1's §9.3 rewrite) missing from §5.4's packed set; kind 4's "one helper" claim, introduced by round 1's four-kind table |
| 3 | v0.3 | Needs revision `{2, 1, 1}` | Needs revision `{2, 3, 1}` (`F-22…F-27`) | **all** | the three `lib/*.mjs` round 2's §3.1 created, absent from round 2's own enumerated packed set; class 11's `artifactPaths` push, asserted by round 2's §7.4 table, does not exist at HEAD |
| 4 | v0.4 | Needs revision `{1, 1, 1}` | Needs revision `{1, 2, 1}` (`F-28…F-31`) | **all** | `F-28`: round 3 routed the seam to five helpers in two modules, and nothing routed a real `Provenance` *into* either module |
| 5 | v0.5 | Needs revision `{1, 1, 1}` | Needs revision `{1, 1, 2}` (`F-32…F-35`) | **all** | `F-32`: round 4's carrier table names the chain from `main()` outward, not from process entry inward — `bin/cli.mjs`'s three call sites unnamed. PM `F-01` / TE `F-33`: round 4's new zero-`await` clause 3 goes red against the header comment §9.3 itself mandates |
| **6** | **v0.6** | **not run** | **not run** | **8 / 8 round-5 findings + Q-01, Q-15, Q-16** | **the halt** |

Six commits landed after the round-5 reviews and before the halt:

| Commit | What it closed |
|---|---|
| `c9466b29` | TE `F-32` — §7.2 gains the *hand off (process entry)* row naming all three `bin/cli.mjs` sites (`:785`) |
| `50e770e5` | PM `F-02` — `PROP-PARITY-12`'s edit scope corrected; `PROP-PARITY-15` named as third reader (`:814`) |
| `3d82ea37` | PM `F-01` / TE `F-33`, `F-34`, `F-35` — clause 3 scoped to **non-comment** source (`:1222`), stale closing claim and `node --test` citation fixed |
| `968405a8` | TE `F-32` / PM `F-03` — production-path level extended to the three call sites; "two suites" → "two **runners**", citing `PROP-PARITY-10` (`:1449`) |
| `acfdec59` | TE `F-32` in S-6, oracle 2 and §13's sequencing rule (`:1306`, `:1502`); PM `Q-01` answered as named risk `R-E` (`:1623`) |
| `4f90b960` | TE `Q-16` — provenance pinned by identity and `Object.isFrozen`, not structural equality (`:1449`); K-3 repriced |

I verified each of these is present at HEAD at the cited line, not merely claimed in the
changelog row.

## Reviewers

| Role | Round-5 verdict | Blocking finding | Character of the review |
|---|---|---|---|
| `pm-review` (product-manager) | **Needs revision** `{1, 1, 1}` | `F-01` (High): §9.3's clause 3 forbids **any** `await` token in `bin/pdlc.mjs`'s raw source while the same section mandates a header comment stating the Node-12.17 subset *and its reason* — a reason §9.3 itself states as "top-level `await` is a Node 14.8+ parse-level feature". The faithful implementation is the red one | Delta-scoped and grounded: re-verified every number in the new carrier table against `run.mjs` at HEAD (`devInjection:80` seven keys, `queueInjection:114` five, `runDev:392`, `runQueue:450-453`), re-grepped the document for surviving `E-nn` collisions and found none. Named the fix in the document's own vocabulary — clause 2 already says "non-comment" |
| `te-review` (test-engineer) | **Needs revision** `{1, 1, 2}` | `F-32` (High): the carrier chain is named from `main()` outward but not from process entry inward. Measured at HEAD there are **three** `cli.mjs` call sites, not two — `runDev` (`bin/pdlc.mjs:385`), `runQueueLoop` (`:434`) and `runQueue` (`:457`) — and `runQueueLoop` forwards `{maxPasses, ...args}` (`run.mjs:478`, `:491`), so it carries provenance only if `cli.mjs` put it there. Omit `:434` and `pdlc queue --loop` emits `NO_PROVENANCE` with every §12 oracle green | Falsifiability lens throughout: scored the round's fix as "resolved *for the hop it named*" rather than resolved, then did the measurement the document had not — counting call sites in the file rather than trusting the table. Both questions (`Q-15` per-run vs per-pass provenance, `Q-16` identity vs structural equality) are the two ways the fix could be written and still be hollow |

**The two reviewers did not split on severity so much as on *which* defect they measured.** PM did
not raise the `cli.mjs` hop at all; TE ranked the clause-3 contradiction Medium (`F-33`) where PM
ranked it High. Each reviewer's High was invisible or non-blocking to the other, and the union —
two findings, both one-clause edits — is what `v0.6` had to close. Neither reviewer disputed the
other's finding once written; the disagreement is about scope of attention, not about facts.

Both reviews are unusually complimentary about the work they are blocking. PM: the production
carrier section "closes a gap that would have shipped every oracle green and AC-5.3 broken in
production … the fix for it is a test level, not a promise". TE: "F-28's fix went *through* the
seam contract, not around it". This is the signature of a document converging on substance while
the round counter runs out on residue.

## Pattern of Disagreement

Five rounds, roughly 59 findings, **100% prior-round disposition in every round**, and not one
re-litigation of a settled decision. The loop was not stuck. It was walking.

The walk has one shape, and it is visible in the Iterations table's last column: **every round's
blocking finding is a defect in the previous round's own fix.**

| Round | Fix written | Defect the next round found in it |
|---|---|---|
| 1 | §9.3 moves the guard body to a new `bin/cli.mjs` | round 2: `bin/cli.mjs` is not in §5.4's packed set, so PF-4's both-directions equality is red by construction |
| 2 | §3.1 creates three `lib/*.mjs` modules | round 3: §5.4's enumerated packed set omits all three |
| 3 | kind 3's mark moves inside `rewriteStatus`; the commit-helper set closes at five | round 4: nothing routes a real `Provenance` from the engine *into* either module |
| 4 | §7.2 names `devInjection` / `queueInjection` as the production carriers | round 5: the chain is named from `main()` outward, not from `cli.mjs` inward |
| 4 | clause 3 becomes a parser-free zero-`await` scan | round 5: the mandated header comment contains the forbidden token |

Two chains account for the entire five-round spend:

- **The provenance carrier chain**, chased one hop at a time: which helpers write (r2) → which
  call routes reach them (r3) → which engine object carries the seam (r4) → which process-entry
  call sites populate it (r5). At each round the document named the next hop outward and stopped
  there. TE's round-5 recommendation says so in as many words: §7.2 was "corrected one level in —
  `cli.mjs` is process entry, and closing there ends the recursion."
- **§9.3's structural clause 3**, respecified three times: an unmechanised "parses under an
  ES-2020 parser" (r3 `F-24`) → a parser-free zero-`await` token scan (r4 `F-30`) → the same scan
  over **non-comment** source (r5 `F-33` / PM `F-01`). Each version was a genuine improvement and
  each was under-scoped by exactly one qualifier.

The reviewers were never the constraint. Round 5's two Highs together are a `+12/−3`-scale edit,
and the author landed them plus four Mediums/Lows and three questions in eleven minutes across
six commits. What ran out was the round counter, which counts *rounds* and not *defect mass*.
