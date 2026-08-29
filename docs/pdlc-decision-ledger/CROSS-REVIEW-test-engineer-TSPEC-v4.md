# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/TSPEC-pdlc-decision-ledger.md` (v0.4, 2026-08-28)
**Date:** 2026-08-28
**Iteration:** 4

Delta re-review. Diff from `64cb78029` (the v3 base) to HEAD: five commits
(`6d5a7b00c`, `c461200ca`, `1f6f59564`, `e905b0e21`, `8361a481a`) touching §2.3, §3.6, §7.3,
§7.5, §9.1's D-10 row and ERR-2. v3 left one High (F-01, §7.5's superseded model sentence),
one Medium (F-02, D-10's vacuous `omitted[]` conjunct) and two Lows. **All four are resolved.**
I re-read only the changed sections and re-executed the numbers the revision moved.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | D-10's whole-fixture build is described as "all 141 in-scope records, project-level and feature-level, **which is what a real dispatch gathers**". No dispatch gathers that set: §3.1 defines the in-scope set as project-level ∪ **one** feature directory, and states "No other feature's directory is in scope, which is what AT-01's *a build rendering all 100 feature-level ids fails* pins". So the assertion whose stated purpose is to exercise the shipped configuration runs it over an input the production gather can never produce, and the sentence contradicts the document's own defined term. The fix costs one substitution and keeps every property of the whole-fixture build: run it over the **largest reachable** in-scope set — project-level (41) ∪ `pdlc-headless-engine` (22) = `M-6b`'s 63-line floor, 10,859 index bytes against a 6,800-byte allowance. The bound still binds, `omitted[]` is still non-empty and still all-feature-level, conjunct (3) still reddens under a reversed drop order, and the input is now one a dispatch on that feature actually produces | §7.3:940–941, §7.3:953–954, §3.1:277–279 |
| F-02 | Low | Local | §7.3's "does not pin how many survive" note says "Under the shipped bound roughly **two** do", citing §3.6 — but the same revision corrected §3.6 (and ERR-2) to say **three** at the measured mean, two at the largest observed line. The two figures were made inconsistent in one round by the two halves of the same fix | §7.3:963–965, §3.6:435–437 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | At 141 records `maxEntries` 70 binds *before* `maxBytes` does — 71 records must be dropped on the entry cap alone, before any byte arithmetic runs. §7.3's justification names only the byte bound ("At 141 records the byte bound **binds** — the drop loop must run"). Under F-01's 63-record set, `maxEntries` 70 is slack and `maxBytes` is the sole binding constraint, which is the regime §3.6's arithmetic actually describes. Is that the regime the assertion means to pin? If the whole-fixture build is kept deliberately, the paragraph should say which bound is doing the cutting, since the two produce different `omitted[]` sets |

## v3 findings disposition

| v3 ID | Status | Evidence |
|---|---|---|
| F-01 (High) — §7.5 still carried the superseded "the model is built from the production line renderer" sentence four lines above the paragraph proving that makes the no-truncation conjunct unfalsifiable | **Resolved** — deleted, in exactly the shape asked for | §7.5:1118–1120 now reads "The model applies its **own** formatter (below) per record, not a re-implementation of the drop loop, so a bug in the loop cannot be mirrored into the oracle." The own-formatter paragraph below it (`:1122–1128`) is unchanged, the four-row mutation table is unchanged, and the section now says one thing about the model instead of two incompatible things. Commit `6d5a7b00c` deletes the clause rather than adding a third statement about it — the durable point of v3's Process tag |
| F-02 (Medium) — D-10's `omitted[]` conjunct was empty-by-construction on the project-level-only slice | **Resolved, and re-argued more sharply than I asked** | §7.3:937–961 now builds over the whole fixture, splits the assertion into three numbered conjuncts, and adds the positive counterpart I offered as optional: conjunct (1) is a **set-equality** over the 41 project-level ids, not a containment. Conjunct (3) is now `omitted[]` non-empty **and** every id in it `origin === "feature"` — an origin partition, not a bare absence. D-10's rejected-alternative column records *why* the project-level-only build was rejected, in the vacuity terms, so the next author cannot re-adopt it by accident. My F-01 above is about the input set chosen, not about this structure, which is right |
| F-03 (Low) — 12,059 attributed to `pdlc-headless-engine` rather than to the 63-line in-scope set | **Resolved** | ERR-2 (§9.2:1309–1312) now reads "The largest feature directory is `pdlc-headless-engine` at **22 lines / 4,553 bytes**; the in-scope set that directory produces — project-level plus itself, which is `M-6b`'s 63-line floor — is 10,859 index bytes, and **12,059** with framing charged". Both figures are now attached to the objects that carry them |
| F-04 (Low) — "~495 bytes ≈ two feature-level lines" was retired arithmetic | **Resolved in §3.6 and ERR-2, and this is what F-02 above is about** | §3.6:435–437 and ERR-2:1305–1308 both say three at the mean, two at the largest observed line. §7.3's new note still says two |
| Q-01 — should §2.3 say that "sentinel region" names two different regions? | **Answered in place** | §2.3:176–184 is new and it answers by citing the mechanism, not by reassurance: `advisoryDisabled.test.js:718–719` matches `"// === LEARNINGS INJECTION REGION START ==="` by exact string, not by sentinel *shape*, so this feature's `DECISION LEDGER WIRING` sentinels are invisible to PROP-DIS-06's slice and the wiring stays inside its `/\.enabled\b/` count. I verified both operands: `sourceExcludingParser` at `pdlc/workflows/__tests__/advisoryDisabled.test.js:718–719` uses `source.indexOf` on the two full literals, and `orchestrate-dev.js:2184` / `:2892` are the only sentinel pair in the file today |

## F-01 in detail — and it is partly my own wording coming back

My v3 F-02 said: "Run the assertion over the **whole** frozen fixture — project-level plus
feature-level, as a real dispatch gathers — at shipped defaults." The revision adopted that
faithfully, including the clause that is wrong. §3.1 is unambiguous about what a dispatch gathers:

> **In-scope set** = every record recognised under `docs/_decisions/` (project-level, always),
> **union** every record recognised in the single directory belonging to the feature whose document
> is under review … No other feature's directory is in scope, which is what AT-01's "a build
> rendering all 100 feature-level ids fails" pins.
> — §3.1:283–289

141 records is 41 + all 100 feature-level ids: the exact set AT-01 exists to red on. The D-10
assertion does not go through the gather — it builds the block from a record set — so it does not
*violate* AT-01. But two things follow that are worth one edit:

1. **The gap D-10 exists to close is not closed by an unreachable input.** §7.3's own framing is
   "AT-01 deliberately runs with the bounds non-binding, so without this the shipped configuration
   is never exercised anywhere." Exercising `maxEntries: 70` / `maxBytes: 8000` over a 141-record
   set exercises the shipped *constants* over an input no dispatch can present. The reachable
   maximum already binds, so nothing is bought by leaving the reachable space.
2. **"In-scope" is a defined term in this document, and §7.3 uses it for a set §3.1 excludes.**
   An implementer reading §7.3 first could reasonably build the fixture gather over all four globs
   at once — which is the state AT-01 pins as a failure.

**The substitution.** Build over project-level ∪ `pdlc-headless-engine` — `M-6b`'s 63-line floor,
which §3.6's own table already sizes at **10,859** index bytes. Everything the whole-fixture build
was chosen for survives:

| Property D-10 needs | 141-record build | 63-record build (`M-6b`'s floor) |
|---|---|---|
| Byte bound binds | yes (10,859 → 6,800 also cuts, but `maxEntries` 70 cuts first) | yes — 10,859 against 6,800, and `maxEntries` 70 is slack, so `maxBytes` is the sole cutter |
| `omitted[]` non-empty | yes | yes — 22 feature-level lines compete for ~495 bytes |
| Conjunct (3) reddens under reversed drop order | yes | yes |
| Conjunct (1)'s 41 ids / 6,305 bytes unchanged | yes | yes |
| Input is one a real dispatch produces | **no** | yes — it is AT-01's own largest case |

If the whole-fixture build is deliberate for some reason I have not seen, then the fix is smaller
still: strike "which is what a real dispatch gathers" and say plainly that the input is a
**synthetic super-set of any reachable in-scope set, chosen so the drop loop is forced**, in the
same spirit §3.4 already uses a constructed two-file corpus for the precedence rule. That is an
honest description and it stops the sentence contradicting §3.1. What should not stay is a
falsehood about the production gather sitting inside the one assertion that claims to pin the
shipped configuration.

Severity Medium, not High, and deliberately: the assertion as written still fails on the mutation
it exists to catch, still pins 6,305 by transcription, and still asserts set equality over the 41
ids. Nothing in it is unfalsifiable. What is wrong is the input's provenance and one sentence's
claim about it.

## Numbers re-executed in the changed sections

| Claim | Verified |
|---|---|
| The corpus totals 141 records (41 project-level + 100 feature-level) | §3.5's table: 41 project-level distinct ids, 100 feature-level summed over directories. The arithmetic in §7.3's "141" is right; only its description as an in-scope set is not |
| `pdlc-headless-engine` is 22 lines / 4,553 bytes; the 63-line in-scope set is 10,859 index bytes and 12,059 with framing | 6,305 + 4,553 + 1 joining newline = 10,859; 10,859 + 1,200 = 12,059. ERR-2's re-attribution is exact, including the newline the join contributes |
| ~495 bytes ≈ three feature-level lines at the mean | 8,000 − 1,200 − 6,305 = 495; 495 / 183 = 2.7 → three at the smallest directory mean, 495 / 261 = 1.9 → two at the largest observed line. §3.6 and ERR-2 are now both right; §7.3's note is the one place still carrying the retired figure (F-02) |
| On a 63-record build the byte bound, not the entry cap, is the cutter | 63 ≤ `maxEntries` 70 (slack); 10,859 > 6,800 (binds). On the 141-record build both bind and the entry cap cuts first — Q-01 |
| `advisoryDisabled.test.js` matches the learnings sentinels by exact literal | `:718–719` — two `source.indexOf` calls on the full comment strings; no shape match, no regex. §2.3's new paragraph is accurate |
| `orchestrate-dev.js` carries exactly one sentinel pair today | `:2184` START, `:2892` END — the only two occurrences in the file, which is also what §7.3's census paragraph asserts |

## Positive Observations

- **The High was fixed by deletion, which is the lesson v3 tagged `Process`.** Two consecutive
  rounds had corrected a rule by adding the correction beneath the superseded sentence. This round
  the superseded clause is gone (`6d5a7b00c`) and §7.5 now reads as one instruction. The section is
  the strongest argument in the document again, and this time it does not have to be read past a
  sentence that contradicts it.
- **D-10's fix went beyond the finding on the two axes that matter.** I asked for a binding
  `omitted[]`; the revision also converted conjunct (1) into a **set equality** over the 41
  project-level ids, added the non-empty guard explicitly, and partitioned `omitted[]` by origin
  rather than asserting a bare absence. Conjunct (3) now names what *does* happen instead of only
  what does not — the shape this pipeline's oracle checks ask for everywhere.
- **The "what conjunct (3) deliberately does not say" note is exactly the right restraint.** Pinning
  the surviving feature-line *count* would churn on any line-format change without naming a defect.
  Saying so, and locating the falsifier in the origin partition, tells the implementer where the
  test's value lives — the kind of note that keeps a suite from accreting brittle assertions.
- **PM Q-01's answer is stated as a prohibition, not a reassurance.** "Both transcribed literals …
  hand-transcribed from the fixture, never derived at test time from the renderer or from a
  manifest", with the reason (deriving 6,305 defeats the drift pin, deriving the ids echoes the code
  under test) and the manifest exclusion the §7.4 baseline guard already established. That is a
  no-implementation-echo rule an implementer can obey mechanically.
- **§2.3's answer to my Q-01 cites the slicer, not the intent.** It could have said "the regions are
  different"; instead it names the exact-literal `indexOf` calls and draws the consequence in both
  directions — the wiring stays inside PROP-DIS-06's count, §7.3's own census excludes it — and
  closes with the warning to a future reader. Both operands verify at HEAD.
- **ERR-2's correction moved a number onto the object that owns it.** 12,059 was a fact about the
  63-line in-scope set the whole time; attributing it to a directory made the directory look twice
  its size. The corrected form now also states the directory's own 4,553, so the upstream reader
  gets both quantities rather than a corrected one.
