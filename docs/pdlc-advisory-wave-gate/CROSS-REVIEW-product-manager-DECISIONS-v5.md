# Cross-Review: product-manager — DECISIONS

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-advisory-wave-gate/DECISIONS-pdlc-advisory-wave-gate.md (v1.3)
**Upstream re-read:** docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md (v1.10, HEAD)
**Date:** 2026-08-19
**Iteration:** 5 (delta re-review)

## Scope

Delta re-review of the six v4 findings and of the four commits that landed them (`048c1637`,
`96d9d66a`, `c074d849`, `082be248`), taken as `git diff 9a569157 HEAD` on the document — 56
insertions, 27 deletions, the four decisions untouched in substance. I re-read my v4 cross-review
first, then re-derived every repo claim the round added or left standing in a changed bullet against
the repository at HEAD rather than against the document asserting it: the envelope literal's live
sites under `pdlc/workflows/`, the seam literal's live sites, `pdlc/engine/__tests__/advisory-config-example.test.js`,
`.claude/pdlc.config.example.json`, and TSPEC v1.10 §1.3, §4.4, §5.1, §5.2, §5.6. I did not
re-litigate anything settled in rounds 1–4.

All six v4 findings are resolved, including the blocking one, and the envelope enumeration was
re-derived from HEAD exactly as asked — I re-grepped it and it is now set-equal to the repository.
What blocks is that the re-derivation stopped at the paragraph's midpoint: the **seam** literal
enumeration in the same bullet, three sentences above the re-derived envelope one, still describes a
repository that `e3b9d5a3` moved. Five of the six sites it names have already migrated to the
six-member value; one has not.

## Verification performed (measured at HEAD)

| Claim in the document (changed bullets only) | Measured | Verdict |
|---|---|---|
| Upstream pin `TSPEC … v1.10` still correct | `TSPEC…md:12` reads `1.10`; no TSPEC revision since | holds |
| Revisions 1.0/1.1 carried `2026-08-20`; 1.2 corrected it to `2026-08-19` | `git show c3c75264:` → `1.0 \| 2026-08-20`; `3b92096e`, `b1370915`, `c05f497f` → `1.1 \| 2026-08-20`; `9a569157` → `1.2 \| 2026-08-19` | holds |
| Capture oracle is §5.2's | `TSPEC…md:1383`, `:1419` sit inside §5.2 (`:1333`–`:1467`) | holds (F-06 closed) |
| AT-04-5 test-mapping row is in §5.6 | `TSPEC…md:1659`, inside §5.6 (`:1612`–`:1687`) | holds (F-05 closed) |
| `ci-arrangement.test.js` is *not* the home; §5.1 assigns a new file | `TSPEC…md:1176`, `:1330` — "**not** in `ci-arrangement.test.js`" and the file-ownership row, verbatim | holds |
| The engine expectation is authored and **red** because the example carries no `advisory` section | `pdlc/engine/__tests__/advisory-config-example.test.js` on disk (2.5k, 57 lines); its own header says "expected RED until the example gains it"; `json.load(...).keys()` → `['dispatch', 'implementation']` | holds |
| `ci-arrangement.test.js` contains zero occurrences of `advisory` | `grep -c advisory` → `0` | holds |
| Envelope: production definition is `ENVELOPE_DEFAULTS` in `orchestrate-dev.js` | `orchestrate-dev.js:1942`, four members | holds |
| Envelope: **five** test-side four-member transcriptions — two `advisoryDisabled`, one `advisoryHarvest`, two `advisoryDoubles` | `advisoryDisabled.test.js:136,623`; `advisoryHarvest.test.js:203`; `helpers/advisoryDoubles.js:325,423` — exactly five, set-equal | holds |
| Envelope: a sixth site in prose (the `advisoryDoubles` hand-sync comment) | `helpers/advisoryDoubles.js:317` | holds |
| Envelope: `advisoryEnvelope.test.js` and `advisoryConfig.test.js` are already at six members and need no edit | `advisoryEnvelope.test.js:284` → `{E-1…E-6}`; `advisoryConfig.test.js:51` → `{E-1…E-6}`, deep-equalled against production output at `:135`, `:143` | holds |
| Seam: the five-member literal `["A1" … "A5"]` "is transcribed at **six** sites", named as `advisoryEnvelope`, two in `advisoryRecord`, `advisoryHarvest`, `consolidationProperties`, `advisoryDoubles` | `grep` at HEAD: **one** five-member site survives (`advisoryRecord.test.js:496`). The other five already read `["A1" … "A6"]` — `advisoryEnvelope.test.js:317`, `advisoryRecord.test.js:544`, `advisoryHarvest.test.js:580`, `consolidationProperties.test.js:250`, `helpers/advisoryDoubles.js:354` | **fails** (F-01) |
| "TSPEC §1.3 records them as drift rows" (of both already-migrated envelope sites) | `TSPEC…md:303` records the `ENVELOPE_DEFAULTS` assertion row; `TSPEC…md:304` records `advisoryConfig`'s literal on `waveBudgetPerRun: 1`, not on the envelope | **partly fails** (F-02) |
| Whole-feature sizing "roughly a dozen transcriptions" | 1 seam site + 5 envelope transcriptions + 1 comment + 2 production constants ≈ 9 at HEAD | follows from F-01 |

## Prior findings (v4) — disposition

| v4 ID | Severity | Disposition | Evidence |
|---|---|---|---|
| F-01 DEC-A6-04's bullet opens by assigning the engine expectation to `ci-arrangement.test.js` | High | **Resolved** (`c074d849`) | The lead sentence now reads "**`pdlc/engine` must gain a new expectation over it, in a file of its own** (named below)", and the two `ci-arrangement` facts are explicitly relabelled "cited here as **evidence that nothing relocates**, not as guidance about where the new expectation belongs". The directive an implementer acts on first now points at the channel, and the file upstream rules out is named only as the non-home. This is the fix I asked for and it is better than the wording I proposed |
| F-02 engine-channel premises measured against a pre-branch repo | Medium | **Resolved** (`c074d849`) | A new bullet states the ordering at HEAD ("the engine channel is the one waiting on the config edit, not the other way round"), names it as a correction of v1.2, and then does the thing Q-01 asked about: "This record deliberately stops restating that status: TSPEC §5.1's status caveat and §1.3 are the carriers of repo state." Verified against the test file's own header and the example's key set |
| F-03 envelope hand-sync enumeration not set-equal to HEAD | Medium | **Resolved** (`082be248`) | Re-derived and now set-equal: one production definition, five test-side transcriptions, one prose comment — all seven verified by grep at HEAD. The two already-migrated sites gained their own bullet, including the admission that "v1.2 wrongly listed" `advisoryEnvelope` as four-member. The "seven, not six" correction survived, as asked |
| F-04 `e3b9d5a3`'s commit-message fidelity | Low | **Carried to harvest as requested** | No edit to this document was asked for and none was made. Still worth a harvest note; not re-raised here |
| F-05 `TSPEC §7` → `§5.6` | Low | **Resolved** (`96d9d66a`) | Line 183 reads "TSPEC §5.6's test-mapping row for AT-04-5"; row verified at `TSPEC…md:1659` |
| F-06 `§5.5` → `§5.2` | Low | **Resolved** (`96d9d66a`) | Line 133 reads "§5.2's oracle is an **argv-sequence** assertion"; oracle verified at `TSPEC…md:1383`, `:1419` |
| F-07 version bump moves the date backwards | Low | **Resolved** (`048c1637`) | The header note reconciles it in the open, and the git history confirms every claim it makes about which revision carried which date. The added resolution-vintage convention ("a finding is resolved against upstream at the time of the edit, not against the upstream version the finding cited") is a genuine improvement I did not ask for |

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Local | **The seam-literal enumeration in the same bullet as the re-derived envelope one was not re-derived, and five of the six sites it names have already migrated.** Lines 354–360: "The five-member seam literal `[\"A1\", \"A2\", \"A3\", \"A4\", \"A5\"]` is transcribed at six sites under `pdlc/workflows/__tests__/` — the `ADVISORY_SEAMS` set-equality in `advisoryEnvelope`, a report-row assertion and a `test.each` table in `advisoryRecord`, a harvest-row assertion in `advisoryHarvest`, a generator pick in `consolidationProperties`, and a `SEAMS` constant inside the shared `advisoryDoubles` helper." Measured at HEAD, exactly **one** of those six still carries the five-member literal: `advisoryRecord.test.js:496` (`rows.map((r) => r.seam)`). The other five already read `["A1" … "A6"]` — `advisoryEnvelope.test.js:317`, `advisoryRecord.test.js:544`, `advisoryHarvest.test.js:580`, `consolidationProperties.test.js:250`, `helpers/advisoryDoubles.js:354`. This is the identical defect I raised at v4 F-03 for the envelope half, uncorrected for the seam half three sentences earlier in the same bullet, and it is now worse than the envelope version was: five of six wrong rather than one of six. Three things compound it. First, it contradicts the document's own cited upstream on a fact upstream states in a table row — TSPEC §1.3 (`TSPEC…md:302-305`) records "`advisoryEnvelope.test.js` already asserts the six-member list", "already carry six members", and singles out `advisoryRecord`'s `rows.map` equality as "**the one test-side literal not yet transcribed**". Second, the round's new "Two envelope sites are already at the post-A6 six-member value" bullet implies by contrast that the seam list above it *is* current, so a careful reader is actively misled rather than merely under-informed. Third, this paragraph exists to size the task for PLAN — its own words, "the PLAN must be sized against the counterparts" — and the sizing it hands down ("roughly a dozen transcriptions", line 383) is inflated by five sites that need no edit, while the one that does need an edit is the one whose neighbourhood upstream flags as easy to miss. Re-derive the seam list from HEAD the way the envelope list now is: one surviving five-member site (`advisoryRecord.test.js:496`), five already migrated, and fold the already-migrated seam sites into the existing "already at the post-A6 value" bullet so both literals are described in the same tense | Traceability (Team Principle 3); TSPEC §1.3 |
| F-02 | Low | Local | **"TSPEC §1.3 records them as drift rows" is true of one of the two named sites on the envelope dimension, not both.** Lines 371–378 say `advisoryEnvelope.test.js`'s `ENVELOPE_DEFAULTS` set-equality and `advisoryConfig.test.js`'s re-declared `ADVISORY_DEFAULTS` literal are already six-member, "which is why TSPEC §1.3 records them as drift rows rather than as work". §1.3's `ENVELOPE_DEFAULTS` row (`TSPEC…md:303`) does exactly that. Its `ADVISORY_DEFAULTS` row (`TSPEC…md:304`) records a *different* drift — "already carries `waveBudgetPerRun: 1`", against "production default key absent" — and says nothing about that file's envelope member. The DECISIONS claim about the envelope member is nonetheless correct and I verified it (`advisoryConfig.test.js:51` is six-member, deep-equalled against production output at `:135` and `:143`); only the attribution to §1.3 over-reaches. Either cite §1.3 for the `ENVELOPE_DEFAULTS` row alone and state the `advisoryConfig` envelope observation as this document's own, or ask upstream to widen that row | — |
| F-03 | Low | Local | **"Seven, not six (TE v2 F-03)" now holds over a differently-composed seven.** Lines 369–371 close the re-derived enumeration with "the envelope's hand-sync surface is **seven, not six** (TE v2 F-03): one definition, five transcriptions, one comment". The arithmetic is right and the point TE raised — that a comment restating a set-equality literal is a maintenance site — still carries. But v1.2's seven was *six code sites plus prose, excluding the production definition*, and this seven *includes* the production definition while dropping `advisoryEnvelope`; the two sevens are different sets that coincide in size. Carrying TE v2 F-03's headline number through a full re-derivation without noting the recomposition invites a later reader to conclude the enumeration never changed. One clause — "the count is unchanged at seven, though the members are not: the production definition enters as the already-migrated assertion leaves" — preserves the trail the rest of this document is unusually good at keeping | — |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Q-01 of my v4 asked whether this record should re-ground repo state itself or point at TSPEC §1.3/§5.1 as the single carrier and stop asserting it. The round answered "the second" for the engine channel, explicitly and well — and then, in the whole-feature paragraph, kept asserting a site-by-site enumeration for both literals. F-01 is the cost of holding both policies at once in one document. Would you consider applying the engine-channel answer to the whole-feature paragraph too: state the *shape* of the sizing risk (two transcribed literals, one shared helper, a comment that restates a literal, a partial edit reddening files that never mention the constant) and defer the live counts to §1.3's two tables? The sizing argument does not depend on the counts being exact; it depends on the counterparts outnumbering the constants, which will stay true however `e3b9d5a3` is unwound. That would make this the last round in which repo drift can invalidate a decision record. |
| Q-02 | `pdlc/workflows/dist/pdlc-cli.mjs:1951` carries the four-member envelope literal too, and `:2801`, `:2869`, `:2886` carry `E-1` branches. It is correctly outside the "hand-sync surface" — the bundle is generated, and the wave gate's `postWaveCommand` rebuilds and stages it (CLAUDE.md, DEC-08) — so I am not asking for it to be counted. But a PLAN reader sizing "which tracked files change when A6 lands" will see `dist/` in the diff. Is it worth one clause saying the bundle moves by regeneration, not by edit? Not a finding; the omission is defensible as written. |
| Q-03 | The four decisions are unchanged in substance for a second round, and I re-verified each against v1.10: DEC-A6-01's dangling-commit capture, DEC-A6-02's separate `commitPaths` call, DEC-A6-03's wave-scoped ref, DEC-A6-04's `nonNegativeInt`. No rejected option became reachable. OQ-7 remains the one live upstream dependency, unchanged since v3. No action requested. |

## Positive Observations

- **The F-01 fix is better than the fix I asked for.** I proposed a wording swap; the round did the
  harder thing and separated *directive* from *evidence* in the reader's mind — "Both facts are
  cited here as **evidence that nothing relocates**, not as guidance about where the new expectation
  belongs". That sentence means a future reader cannot re-make the mistake even if they skim, which
  is more than a corrected pointer would have bought.
- **The engine-channel bullet stops asserting repo state, and says that it is stopping.** "This
  record deliberately stops restating that status: TSPEC §5.1's status caveat and §1.3 are the
  carriers of repo state for this feature" is the right architectural answer to v4's Q-01, and it is
  reached by naming what v1.2 got wrong rather than by quietly deleting it. Decision records earn
  their keep over months; this is the sentence that will still be doing work then.
- **The date note reconciles the history in the open, and every claim in it checks out.** I walked
  `c3c75264`, `3b92096e`, `b1370915`, `c05f497f` and `9a569157`: 1.0 and 1.1 did carry `2026-08-20`,
  1.2 did silently correct it. A less honest fix would have been to change the number and move on.
  The resolution-vintage convention bundled with it — resolve against upstream at the time of the
  edit, and say which version you landed on — is a genuinely reusable rule that nobody asked for.
- **The envelope re-derivation is set-equal to the repository.** I grepped all seven sites and found
  no eighth. The bullet admitting "v1.2 wrongly listed" `advisoryEnvelope` as four-member, and the
  explanation of why a reader would otherwise "go to either expecting a four-member literal to edit
  [and] find an assertion already at its target", is exactly the kind of correction that stops the
  next reader from wasting an hour. F-01 asks for nothing more than the same treatment applied three
  sentences earlier.

## Recommendation

**Needs revision** — one High finding (F-01).

Every v4 finding is resolved, including the blocking one, and two of the fixes improve on what I
asked for. The four decisions remain a faithful compression of TSPEC v1.10: no rejected option
became reachable, no chosen mechanism lost its upstream basis, and nothing in this round touched a
decision's substance. What blocks is narrow and mechanical: the round re-derived the envelope half of
the whole-feature sizing paragraph from HEAD and left the seam half describing a repository that
`e3b9d5a3` moved out from under it. Five of the six seam sites the document sends an implementer to
are already at the six-member value; the one that is not is the one TSPEC §1.3 singles out as easy to
miss. Because the round's new "already migrated" bullet covers only the envelope, the stale seam list
now reads as though it had been checked.

Exactly what to change:

1. **F-01 (blocking)** — lines 354–360: re-derive the seam enumeration from HEAD. One surviving
   five-member site, `advisoryRecord.test.js:496`'s `rows.map((r) => r.seam)` equality; five already
   migrated (`advisoryEnvelope.test.js:317`, `advisoryRecord.test.js:544`,
   `advisoryHarvest.test.js:580`, `consolidationProperties.test.js:250`,
   `helpers/advisoryDoubles.js:354`). Fold the migrated five into the existing "already at the
   post-A6 six-member value" bullet so both literals are described in one tense, and re-state line
   383's "roughly a dozen transcriptions" against the re-derived total.
2. **F-02** — lines 371–378: attribute the §1.3 drift-row claim to the `ENVELOPE_DEFAULTS` row
   (`TSPEC…md:303`) alone; `advisoryConfig`'s row (`:304`) records `waveBudgetPerRun`, not the
   envelope.
3. **F-03** — lines 369–371: one clause noting that the seven's members changed even though its size
   did not.

Q-01 offers an alternative that would close F-01 and retire the whole class: describe the sizing risk
and defer the live counts to TSPEC §1.3. Either route clears the block.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 0, "low": 2}
