# Cross-Review: test-engineer — DECISIONS (delta re-review)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/DECISIONS-pdlc-advisory-wave-gate.md` (v1.4)
**Previous review:** `CROSS-REVIEW-test-engineer-DECISIONS-v5.md` (v1.3)
**Delta reviewed:** `082be248..HEAD` (one commit, `ff07bc84`, DECISIONS only — 56 insertions, 30 deletions)
**Date:** 2026-08-19
**Iteration:** 6

## Context

Both v5 findings were non-gating (one Medium, one Low) and both lived in the same bullet pair. The
round spent one commit, `ff07bc84`, rewriting that pair — and it did more than close my two: it
re-derived the **seam** half of the enumeration too, which PM v5 F-01 had opened and which no
previous round had measured at HEAD. Scope held to the delta: `git diff 082be248..HEAD` touches this
file only, no decision line altered, no verdict or supersession text moved.

Four things in the delta are checkable against the repository, and I checked all four: the seam
literal's surviving-site claim, the envelope's five-transcription enumeration and its
"none of these is an oracle" characterisation, the seven already-migrated sites, and the two TSPEC
§1.3 quotations the bullets lean on. I re-read only the changed passages and re-grounded every
anchor in HEAD source rather than in the upstream documents' description of HEAD.

## Options Considered

The delta's substantive choice was how far to re-derive. My v5 findings asked only that the
envelope enumeration stop saying "still moves" about five sites that no gate touches — a two-clause
fix. The author could have made exactly that edit and left the seam half alone, which is what v1.3
did in the other direction (re-deriving the envelope half only). The revision took the wider option
and says why in-line: v1.2 sized the seam half "against a pre-`e3b9d5a3` repository", so the two
literals "read in two different tenses inside one paragraph, the seam list reading as checked
because its neighbour had been". That diagnosis is correct and the wider option was the right one —
the seam half was six times wrong, not slightly wrong (six sites claimed, one survives).

The cost of the wider option is the one this review has to price: a paragraph re-derived in a single
pass inherits whatever was wrong in the *reviews* it is closing, and one of my own v5 findings was
under-measured. F-01 below is that inheritance.

## Decision

**Both v5 findings are resolved, no High finding is open, and the delta's headline claim — the seam
literal survives at one site, not six — is true at HEAD.** Two new Medium findings are recorded; both
are corrections inside the re-derived paragraph, neither changes its conclusion.

| v5 finding | Disposition | Evidence re-verified at HEAD |
|---|---|---|
| F-01 (Medium) — enumeration framed as "a count of what still moves" when five of the sites are inputs that stay green | **Resolved.** A dedicated bullet now states it outright: "None of those five transcriptions is an oracle … all five stay green and no gate demands their edit", names the one oracle that does fail on drift, and reframes the five as hand-*copy* surfaces where "a stale copy silently re-scopes a fixture instead of reddening a suite" — with an explicit note that an implementer sizing A6 off v1.3's wording "would budget five edits no gate asks for" | All five re-confirmed as inputs: `advisoryDisabled.test.js:136` (`disabledConfig()` fixture), `:623` (inline config JSON), `advisoryHarvest.test.js:203` (config fixture), `helpers/advisoryDoubles.js:325` (`ADVISORY_DEFAULTS_SHAPE`), `:423` (generator shuffle). The one drift oracle is `advisoryEnvelope.test.js:284`, `[...devModule.ENVELOPE_DEFAULTS].sort()` against a six-member literal, red against `orchestrate-dev.js:1942`'s four members |
| F-02 (Low) — "both assert against a production default that still has four members" was true of one site only | **Resolved as to the claim I filed**, and the correction landed verbatim: "Only the first of those two asserts against production and is therefore red today". See F-01 below — the *second* half of that sentence, which I supplied in v5, is wrong at HEAD | `advisoryConfig.test.js:51` carries the six-member literal; `orchestrate-dev.js:1948` still resolves `envelope: ENVELOPE_DEFAULTS` |

**The seam re-derivation is the strongest item in the delta and it holds.** The record now claims
`["A1", "A2", "A3", "A4", "A5"]` is carried at exactly one place under `pdlc/workflows/__tests__/`.
Grepping HEAD returns exactly one such five-member array in that tree:
`advisoryRecord.test.js:496`, `expect(rows.map((r) => r.seam)).toEqual([...])`, and it does sit
inside `PROP-SUM-01` (`describe` at `:492`). The five sites v1.2 listed beside it are all at the
six-member value: `advisoryEnvelope.test.js:317`, `advisoryRecord.test.js:544` (`test.each`),
`advisoryHarvest.test.js:580`, `consolidationProperties.test.js:250`,
`helpers/advisoryDoubles.js:354`. The commit boundary the record blames for v1.2's staleness checks
out too: `git log -S'"A1", "A2", "A3", "A4", "A5", "A6"'` over those files returns exactly one
commit, `e3b9d5a3`, whose diffstat touches `advisoryHarvest.test.js`,
`consolidationProperties.test.js` and `helpers/advisoryDoubles.js`.

**Both TSPEC quotations are verbatim and correctly anchored.** "the one test-side literal not yet
transcribed" is `TSPEC:305`'s per-seam-report-rows drift row, and it is that row's own words for
`advisoryRecord`'s `rows.map` equality. The claim that §1.3's `ADVISORY_DEFAULTS` row "records a
*different* drift … and says nothing about that file's envelope member" is accurate: `TSPEC:304`
names only `waveBudgetPerRun: 1` against an absent production key. "Three production constants" is
backed by `TSPEC:274`, which names `ADVISORY_SEAMS` / `ENVELOPE_DEFAULTS` / `ADVISORY_DEFAULTS` as
the three surfaces BL-06 requires to move together.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **"`advisoryConfig`'s six-member envelope is never compared to anything" is false at HEAD — and this is my v5 F-02's error, transcribed faithfully.** The bullet enumerates only PROP-CFG-01's three assertions (key set `advisoryConfig.test.js:105-107`, `waveBudgetPerRun` `:111`, key-set equality `:117`) and concludes the envelope members are never asserted. PROP-CFG-02 is the missing one: `expect(config).toEqual(ADVISORY_DEFAULTS)` at `:135` (a four-case `test.each`) and again at `:143` deep-equals the *parsed production config* against that file's local literal — and `toEqual` on the object compares `envelope` member-for-member. Production returns `ADVISORY_DEFAULTS.envelope` = `ENVELOPE_DEFAULTS` (`orchestrate-dev.js:1948` → `:1942`, four members), so `advisoryConfig.test.js:51`'s six-member literal **is** a production-comparing oracle and **is** red today, exactly like `advisoryEnvelope.test.js:284`. The sentence "Only the first of those two asserts against production and is therefore red today (TE v5 F-02)" should read "Both of those two assert against production and are red today", with `advisoryConfig.test.js:135` / `:143` cited. The bullet's conclusion is unaffected — both sites are already at the post-A6 value and neither needs an edit — but the record currently tells an implementer that one of the two six-member literals is un-oracled, which is the opposite of the property that makes it safe: it cannot silently drift, because PROP-CFG-02 reddens if it does | "Seven sites across both literals are already at the post-A6 value" bullet |
| F-02 | Medium | Local | **The prose-site rule is applied to the envelope half and not to the seam half.** The record establishes the rule and rests seven-not-six on it: "A comment that restates a set-equality literal is a maintenance site like any other" — counting `advisoryDoubles.js:317`'s comment. Measured at HEAD, the seam side carries the same class of surface and the enumeration counts none of them. The survivor literal at `advisoryRecord.test.js:496` sits directly under a comment and two titles that all restate the count: `:488-489` ("always emits five rows, one per ADVISORY_SEAMS member"), `:492` (`describe` "always emits five rows"), `:493` (`test` "all five seams"). Four more sit elsewhere: `advisoryDisabled.test.js:617`, `:620`, `:621` ("five zero rows"), and `advisoryHarvest.test.js:542-544` plus `:571` ("all five seams", "five rows always"). None is gate-demanded — a stale title is exactly the "what a later editor reads" surface the record says it wants counted — so by its own rule the hand-copy total is not six but roughly sixteen, and the *seam* half's hand-copy count is not zero. Either count the seam prose alongside the envelope comment, or narrow the rule to "a comment that restates the literal itself" and say why a `describe` title asserting the same cardinality is out of scope | "None of those five transcriptions is an oracle" and shared-double sizing bullets |

## Questions

| ID | Question |
|----|---------|
| Q-01 | F-01 and F-02 point the sizing sentence in opposite directions — one oracle more than the record claims, and roughly ten hand-copy surfaces more — and they cancel to within noise of "one task". Is the final sentence's three-way split (three production constants / one gate-demanded literal / six hand-copy surfaces) still the shape worth carrying, or is the durable claim simply "two gate-demanded literal edits and a long tail of prose that must move with them"? I read the three-way split as still worth it — the gate-demanded count is what an implementer must not get wrong, and it is small — but the "six" is the fragile number and it has now been re-derived in three consecutive rounds. |

## Positive Observations

- **The round fixed a claim I did not file against.** My v5 findings were both about the envelope
  half. The delta re-derived the seam half as well, found v1.2 had claimed six carrying sites where
  HEAD has one, and named the commit that made the difference. That is a five-sixths error in a
  sizing input, caught by a reviewer lens I was not applying and by an author re-measuring rather
  than re-reading. The one-tense diagnosis — "the seam list reading as checked because its
  neighbour had been" — is the generalisable part: partial re-derivation launders the unmeasured
  half.
- **The oracle/input distinction I asked for in v5 Q-01 landed as its own bullet, not as a clause.**
  I suggested one clause "next time the file opens". The revision gave it a heading-weight bullet
  that states the mechanism ("a stale copy silently re-scopes a fixture instead of reddening a
  suite"), names the single failing oracle, and explicitly retracts the older framing with its cost
  ("would budget five edits no gate asks for"). A record that names what its own previous revision
  would have caused is cheaper to trust than one that quietly overwrites.
- **The seven-count is now honest about its churn.** "The count is unchanged at seven since v1.2 but
  its members are not — the production definition enters as the already-migrated `advisoryEnvelope`
  assertion leaves." A stable total across a changed membership is the single most misleading shape
  a re-derived enumeration can take, and the record calls it out rather than banking the coincidence.
- **The `advisoryConfig` observation is correctly attributed as this record's own.** The bullet
  checks §1.3's `ADVISORY_DEFAULTS` row, finds it records a different drift, and says so instead of
  claiming upstream cover it does not have. `TSPEC:304` confirms it. Even with F-01's correction to
  the observation's content, the sourcing discipline is right.

## Consequences

- No High finding, old or new, so DECISIONS is not blocking on this lens and phase D can proceed.
- Both Medium findings sit inside the same two bullets and resolve in two sentences: one citation
  correction (`advisoryConfig.test.js:135`/`:143` makes both six-member literals oracles) and one
  rule-scope decision on prose sites. Neither earns its own round; both should ride the next edit
  that opens this file, and the envelope literal's own migration to six members during A6 will force
  the paragraph open anyway.
- One item for the implementer rather than for this record, unchanged from v5 and now better
  supported: with F-01's correction, **two** oracles fail on envelope drift and **five** copies
  cannot. Converting the five inputs to read from a single exported constant would collapse the
  hand-copy tail the record keeps having to re-count. That is a PROPERTIES/TSPEC call, not a
  DECISIONS one, and I am not filing it here.
- One upstream item is routed as an erratum rather than folded into this verdict: TSPEC §1.3's
  drift table (`TSPEC:303-305`) records `advisoryConfig.test.js`'s drift as `waveBudgetPerRun` only,
  and does not record that the same file's envelope literal is six-member and asserted against
  production by PROP-CFG-02. The DECISIONS bullet was right that §1.3 does not carry it; §1.3 should.

## Recommendation

## Verdict
