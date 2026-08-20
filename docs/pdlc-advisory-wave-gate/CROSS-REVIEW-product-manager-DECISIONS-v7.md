# Cross-Review: product-manager — DECISIONS

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-advisory-wave-gate/DECISIONS-pdlc-advisory-wave-gate.md (v1.5)
**Upstream re-read:** docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md (v1.10, HEAD)
**Date:** 2026-08-19
**Iteration:** 7 (delta re-review)

## Scope

Delta re-review of the two commits that landed since I reviewed at `ff07bc84`: `96e4d08a`
"correct envelope oracle count to two, re-derived at HEAD (v6 F-01)" and `6e80e476` "apply
prose-site rule to seam half, three-column sizing (v6 F-02)". `git diff ff07bc84 HEAD` on the
document is confined to the metadata header (version 1.4 → 1.5, two cross-review rows) and the
same "Consequences / sizing" bullet block reviewed in v5 and v6. The four decisions
(DEC-A6-01 … DEC-A6-04) are byte-identical to the round I approved on substance; I did not
re-litigate them.

I read my v6 cross-review first, then re-derived every claim in the changed block against HEAD
rather than against the document's own prose: I ran `advisoryConfig.test.js` and inspected the
five `PROP-CFG-02` diffs, ran `advisoryEnvelope.test.js`, `advisoryHarvest.test.js` and
`advisoryDriver.test.js -t PROP-GATE-06`, read the eleven newly enumerated seam prose sites in
context, and grepped the seam and envelope literals repo-wide for sites the new enumeration does
not name. The blocking v6 finding is resolved, and resolved unusually well — the round measured
the thing rather than re-asserting it. The round's own new material, the three-column sizing, is
where this review lands: column (2) is presented as exhaustive and is not.

## Prior-Round Disposition

| ID | Finding | HEAD status |
|---|---|---|
| v6 F-01 (High) | "Only one envelope oracle fails on drift"; `advisoryConfig`'s six-member envelope "is never compared to anything" | **Resolved and independently verified** (`96e4d08a`). Lines 378–384 now say the drift oracles are **two**, naming `advisoryEnvelope.test.js`'s `[...ENVELOPE_DEFAULTS].sort()` under `T-03-8` (`advisoryEnvelope.test.js:284`) and `advisoryConfig.test.js`'s `expect(config).toEqual(ADVISORY_DEFAULTS)`. Lines 396–402 replace the false "only the first asserts against production" with "**Both** … and both are red today, measured at HEAD". I ran it: `PROP-CFG-02`'s five cases are red and **every** diff drops `"E-5"`, `"E-6"` **and** `"waveBudgetPerRun": 1`, exactly as written. The `PROP-CFG-01` sentence (key set, `waveBudgetPerRun` value, key-set equality against `parseAdvisoryConfig(null)` — `advisoryConfig.test.js:103`–`:125`) is preserved and still accurate, and the v5 F-02 §1.3 attribution fix is intact |
| v6 F-02 (Low, Process) | Third consecutive round shipping a repository claim a grep falsifies; counts belong in TSPEC §1.3, cite rather than restate | **Not actioned as a document edit** (correctly — it was raised as a harvest note). The round did the opposite of the note's suggestion: it added *more* re-derived counts rather than citing §1.3. That is a legitimate choice, but it re-took the risk, and F-01 below is where it landed again — see F-05 |
| v6 Q-01 (three-column hand-off) | Would the closing size line name the "flips red→green with no edit" category explicitly? | **Answered by adopting it** — lines 419–433 are now three explicit columns, and the document says in-line that column (2) "is the one the record previously lost (PM v6 Q-01)". The structure is right and is a real improvement; its membership is what F-01 disputes |
| v6 Q-02 (`dist/pdlc-cli.mjs`) | Carried from v5, still unanswered | Still open. `pdlc/workflows/dist/pdlc-cli.mjs:1951` and `:1957` carry their own copies of `ENVELOPE_DEFAULTS` and the four-member comment. See F-02 |
| v6 Q-03 (OQ-7) | Re-checked, needs no action | Closed |

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Local | **Column (2) is presented as a closed set of two and is not set-equal at HEAD: three more oracles flip red→green with no edit, all on the seam half, all red today.** Lines 422–424 give column (2) as exactly `advisoryEnvelope.test.js`'s `T-03-8` `ENVELOPE_DEFAULTS` set-equality and `advisoryConfig.test.js`'s `PROP-CFG-02` deep-equal, and line 382 says "the envelope's drift oracles are **two**, not one". Scoped to the *envelope*, both statements are true and I verified them. But column (2) is not scoped to the envelope — it is one of three columns sizing the whole A6 task, sitting beside column (1)'s "three production constants plus one test-side literal", which is the seam and envelope halves together. Read as the sizing it is, it omits every seam-side member. At HEAD I ran three that are red now, already carry the six-member value, and demand no edit: (a) `advisoryEnvelope.test.js:317` — `expect(devModule.ADVISORY_SEAMS).toEqual(["A1","A2","A3","A4","A5","A6"])`, red against production's five-member `orchestrate-dev.js:1951`; (b) `advisoryHarvest.test.js:579`–`:580` — `expect(result.advisory.rows).toHaveLength(6)` then `expect(seamNames).toEqual([…"A6"])` over the rows production actually built, red at HEAD (`T-08-6`); (c) `advisoryDriver.test.js:845`–`:849` — `PROP-GATE-06`, `expect(new Set(Object.keys(GATE_EXCLUSIVITY_REGISTRY))).toEqual(new Set(dev.ADVISORY_SEAMS))`, whose registry at `:221`–`:228` already carries its `A6` row; running it at HEAD gives a one-line diff, `+ "A6"`. So column (2) is five, not two. The cost is the exact one the column was introduced to prevent: an implementer sizing A6 off this record expects two suites to go green for free, lands the seam growth, and watches three more flip that no column predicted — the same surprise, in the other half of the feature, that v6 F-01 was raised about. Note also that (c) makes the registry itself an already-migrated, gate-covered site the record never names anywhere in the three columns. | TSPEC §1.3, §3.1; PLAN A6-05 |
| F-02 | Medium | Local | **Column (3)'s "seventeen, not six" is itself not set-equal — the prose-site rule is applied evenly across the two *halves* but not across the two *surfaces*, and it stops at the test tree.** The eleven seam prose sites are individually correct: I read all eleven in context (`advisoryRecord.test.js:436`, `:488`, `:492`, `:493`; `advisoryDisabled.test.js:617`, `:620`, `:621`; `advisoryHarvest.test.js:542`, `:543`, `:544`, `:571`), and the two exclusions the bullet argues for hold — `advisoryDisabled.test.js:54`'s A-15 capture note does use "five seams" in the unrelated sense claimed, and `pipelineWiring.test.js:469`–`:499`'s "exactly five of the added names" is about the five injected `_`-prefixed seams (`NEW_SEAMS`), a different notion of seam entirely, correctly uncounted. What the enumeration misses is (i) `advisoryDriver.test.js:30`–`:31`, "the five per-seam gate-exclusivity cases, one per `ADVISORY_SEAMS` member (PROP-GATE-01…05)", and `:230`'s header restating the same "(PROP-GATE-01…05)" — hand-written five-counts in exactly the class the rule counts, and note `:214`'s header already says "PROP-GATE-01…06", so the file is internally split; and (ii) the production tree, which the column ignores although a later editor reads it first: `orchestrate-dev.js:1940` ("The members are FSPEC E-1…E-4 verbatim"), `:1948` ("`// the four-member literal above`"), `:2162` (`@property {"A1"|"A2"|"A3"|"A4"|"A5"} seam`, an ungated hand-copy of the seam enumeration in a typedef) and `:14825` ("A1-A5 seams authored it"). `:1948` is the sharpest: on A6-02 it becomes an actively false comment sitting on the changed line. Column (3) is explicitly de-weighted in the bullet ("its tail is long and will stay long"), which is why this is Medium and not High — but a number offered as a re-derived count should be re-derived over both trees or scoped in words to the one it covers. | TSPEC §1.3 |
| F-03 | Medium | Local | **The new oracle citation `PROP-CFG-02` resolves, in PROPERTIES, to a different property than the one the record means.** PROPERTIES line 164 defines `PROP-CFG-02` as "`waveBudgetPerRun` must validate through a `nonNegativeInt` sibling of the shipped `positiveInt`" — and `advisoryConfig.test.js:194` carries exactly that, `describe("PROP-CFG-02 (A6-02) — waveBudgetPerRun validates through nonNegativeInt (E-33)")`. The deep-equality oracle the record cites four times is the *other* describe wearing the same id, `advisoryConfig.test.js:127`, "PROP-CFG-02 — absent/unreadable/malformed input yields ADVISORY_DEFAULTS (T-01-1)" — a shipped-tier property whose id the A6-02 work re-used. (`PROP-CFG-01` collides the same way, `:76` against `:103`.) Every factual claim the record attaches to the citation is true of `:127`; only the label misroutes. A PLAN reader who follows `PROP-CFG-02` to PROPERTIES lands on the `nonNegativeInt` property and cannot reconcile "deep-equals the whole literal for five inputs" with it. Fix is one clause, not a re-derivation: cite the oracle by file and line (`advisoryConfig.test.js:127`'s `T-01-1` deep-equality, asserted at `:135` and `:143`) and note the id collision once, since it will mislead the implementer at the bench too. | PROPERTIES §, `PROP-CFG-02` |
| F-04 | Low | Local | **`A-17` resolves nowhere in this feature's documents.** Line 406–408's split-schedule sentence — the genuinely useful part of the round — reads "`advisoryEnvelope`'s equality goes green on A6-02's envelope growth alone; `PROP-CFG-02` needs A-17's `ADVISORY_DEFAULTS` — `waveBudgetPerRun` included — as well". The behaviour is verified: the five `PROP-CFG-02` diffs each drop `waveBudgetPerRun: 1` alongside `E-5`/`E-6`, so the two oracles genuinely do not clear together. But `A-17` appears in no other file under `docs/pdlc-advisory-wave-gate/` — not PLAN, not TSPEC — and PLAN's task ids for this wave are `A6-00`, `A6-01`, `A6-04`, `A6-05`, `A6-06`, `A6-08`, with `orchestrate-dev.js` owned by `A6-08` (PLAN:241). `A6-02` at least resolves in PROPERTIES:388. Since this sentence is addressed to PLAN by name ("One consequence worth handing PLAN"), name the task PLAN carries. I carried `A-17` in my own v6 table without checking it — the mistake is not the author's alone. | PLAN §, task map |
| F-05 | Low | Process | **Fourth consecutive round in which the same bullet block's surrounding prose ships a live-repository enumeration that a grep or a test run falsifies** (v4 F-03 envelope sites, v5 F-01 seam sites, v6 F-01 envelope oracles, now F-01 seam oracles). The pattern is now specific enough to name precisely: each round re-derives the half it was asked about and carries the adjacent half over on memory. v6 F-02 proposed citing TSPEC §1.3 instead of restating counts; this round instead added a third column, which is a better *structure* and took the same *risk*. Worth carrying to harvest as a rule with teeth: a decision record may state a category, but any enumeration inside it must either be re-derived in the same edit across every surface the category spans, or be replaced by a pointer to the sibling doc that regenerates. | — |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Column (2)'s value to PLAN is that it converts "suites are red" into "suites that clear themselves". Now that F-01's three seam members join it, the column carries a second-order fact worth one clause: the seam oracles and the envelope oracles clear on **different** production edits, so at no point in A6 is the suite uniformly green — `advisoryEnvelope.test.js:317` and `advisoryHarvest.test.js:580` and `PROP-GATE-06` clear on `ADVISORY_SEAMS` growth, `advisoryEnvelope.test.js:284` on `ENVELOPE_DEFAULTS` growth, `advisoryConfig.test.js:127`'s deep-equal only when `ADVISORY_DEFAULTS` carries `waveBudgetPerRun` too. Would you state that as the column's closing line? It is the same insight the split-schedule sentence already has for the envelope pair, generalised — and it is what stops an implementer mid-task from reading a still-red suite as a regression. |
| Q-02 | Carried a third time from v5 Q-02 / v6 Q-02, and F-02 now gives it a second reason to land: `pdlc/workflows/dist/pdlc-cli.mjs:1951` and `:1957` carry their own `ENVELOPE_DEFAULTS` and their own "the four-member literal above" comment. Per CLAUDE.md (DEC-08) that file is generated and never hand-edited, and the wave gate's `postWaveCommand` regenerates it. One clause saying so would keep both column (1) and column (3) honest without adding sites to either — right now a PLAN reader who greps the constant finds `dist/` and has nothing in the record telling them to leave it alone. |

## Positive Observations

- **The blocking finding was closed by measurement, not by rewording.** v6 F-01 asked for two oracles instead of one; the round ran the suite and came back with more than was asked — that all five `PROP-CFG-02` diffs drop `waveBudgetPerRun: 1` as well as `E-5`/`E-6`. I re-ran it and the diffs are exactly as transcribed, key for key. A record that reports the shape of a failure it observed, rather than the failure it predicted, is the standard worth holding this document to.
- **The split-schedule sentence is the most useful thing in the block.** "An implementer who lands A6-02 and sees `advisoryConfig` still red has not regressed anything" is a decision record doing its actual job: pre-empting a false alarm that would otherwise cost someone an afternoon of bisecting. It is also the only sentence in the sizing that reasons about *time* rather than counts, and F-01 does not touch it.
- **The round adopted v6 Q-01's three-column structure and said in-line why the third column existed** ("it is the one the record previously lost"). Naming the omission as a category, not just fixing the sentence, is what makes an omission structurally hard to repeat — the structure is right, and my F-01 is about who belongs in column (2), not about whether column (2) should exist.
- **The retraction is explicit and sourced.** Lines 397–399 name TE v6 F-01 as retracting the second half of TE v5 F-02 "the claim v1.4 transcribed", rather than quietly replacing the sentence. A reader who remembers the old wording learns it was wrong and who found it — the same honesty the v6 review credited for the "roughly a dozen transcriptions" correction, applied again.
- **The prose-site rule was applied to the seam half in the same edit that stated it**, and the two exclusions were argued rather than assumed. I checked both and both hold — `advisoryDisabled.test.js:54`'s "five seams" really is a different referent, and `pipelineWiring.test.js`'s `NEW_SEAMS` really is a different notion of seam. Getting the *exclusions* right is the harder half of an enumeration and this round got it right.

## Recommendation

**Needs revision** — one High finding (F-01).

The v6 blocking finding is resolved, and resolved by measurement: the envelope's two oracles, the
five red `PROP-CFG-02` cases, and the `waveBudgetPerRun` half of each diff all reproduce at HEAD
exactly as the document states. The four decisions remain a faithful compression of TSPEC v1.10 and
are untouched. What blocks is the round's own new material. Column (2) is written as a closed set of
two, both on the envelope half, but it is a column of a whole-task sizing whose other columns span
both halves — and the seam half has three of its own, all red at HEAD, all already at six, none
needing an edit.

Exactly what to change:

1. **F-01 (blocking)** — lines 422–424: state column (2) as **five**, not two, and split it by what
   clears each one: on `ENVELOPE_DEFAULTS` growth, `advisoryEnvelope.test.js:284`'s `T-03-8`
   set-equality; on `ADVISORY_DEFAULTS` gaining `waveBudgetPerRun` as well, `advisoryConfig.test.js:127`'s
   deep-equal; on `ADVISORY_SEAMS` growth, `advisoryEnvelope.test.js:317`, `advisoryHarvest.test.js:580`
   (`T-08-6`) and `advisoryDriver.test.js:849` (`PROP-GATE-06`, over the already-six
   `GATE_EXCLUSIVITY_REGISTRY` at `:221`). Either widen line 382's "the envelope's drift oracles are
   two" to the whole task, or leave it and mark it explicitly envelope-scoped so the column below is
   read as the superset it needs to be. Keep the split-schedule bullet at 404–408 — it is correct and
   generalises cleanly.
2. **F-02, F-03, F-04 (non-blocking)** — worth taking in the same edit since they are one clause
   each: scope or complete column (3)'s seventeen (`advisoryDriver.test.js:30`–`:31`, `:230`; the four
   production sites, `orchestrate-dev.js:1948` in particular); cite the deep-equality oracle by
   file:line and note the `PROP-CFG-02` id collision; replace `A-17` with the PLAN task that owns
   `orchestrate-dev.js`.
3. **F-05** — harvest note only, no document edit required.

Nothing else in the changed block needs to move. The metadata bump, the retraction sentence, the
five-input enumeration, the eleven seam prose sites and their two exclusions, and the closing
"column (1)'s four is the number an implementer must not get wrong" all verified clean at HEAD.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 2, "low": 2}

