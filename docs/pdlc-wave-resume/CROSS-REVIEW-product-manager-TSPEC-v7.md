# Cross-Review: product-manager — TSPEC (delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-wave-resume/TSPEC-pdlc-wave-resume.md (v1.4)
**Date:** 2026-08-23
**Iteration:** 7 (delta confirmation, erratum round 5 — Phase PR)
**Scope:** Delta confirmation. Previously approved v6 (TSPEC v1.3); re-confirming the round-5 erratum edit against upstream REQ v1.7 / FSPEC v1.2 at HEAD (DEC-ERR-03).

## Scope

This is a **delta confirmation**, not a review. I approved this TSPEC at round v6 with three
non-gating findings. Round 5's erratum edit has since landed as eight commits (`730d8deb`,
`14a41739`, `48cf9810`, `ce3c867e`, `f82560b9`, `0c3bb682`, `57c5948c`, `31df4eda`), 29 insertions
against 12 deletions in a 950-line document. The two items this dispatch names were the two that
were re-emitted at v2 and were still unactioned; both now land.

| Routed item | Raised by | Landed? |
|---|---|---|
| §5.7 left the generative run count at "fast-check's default" while PLAN T-08 pins `numRuns: 500` and PROPERTIES follows PLAN | pm-review (me), te-author | **Yes** |
| §5.8 said `c8.include` carries three modules where `pdlc/workflows/package.json` carries four, the fourth being `**/scripts/capture-learnings-baseline.mjs` | pm-review (me), te-author, se-review | **Yes** |

The same edit also discharges all three of my own v6 findings, which were not in this dispatch's
item list but sit inside the same delta:

| My v6 finding | Where it landed | Confirmed |
|---|---|---|
| F-01 (Medium, inherited) §2.5 called the operator-pointed write "unspecified upstream" after FSPEC §3.4 landed | `730d8deb` — §2.5 restated as a ratification, quoting the clause | ✓ |
| F-02 (Medium, inherited) §6.3 still read "raised, not fixed here" after all four errata landed | `14a41739` — §6.3 rewritten as a resolved ledger with current version labels, and no `ERRATUM:` line re-emitted | ✓ |
| F-03 (Low, inherited) §6.2 OB-F1 re-raise justification and §1.3's stale REQ citation | `48cf9810` — re-raise struck, §1.3 repointed at REQ OB-1's HEAD framing; OB-F1's substance (BL-04 unmet, AT-14 red, wave sequencing) untouched | ✓ |

**Beyond the item list (DEC-ERR-03).** The items landing is necessary, not sufficient. I re-read the
upstream text this TSPEC leans on at its current version — REQ v1.7, FSPEC v1.2 — and re-measured
the two repo facts the delta now asserts. One finding follows, on new bytes.

## Design

Neither routed item is a product decision, and neither edit takes one. Both are fidelity
corrections to statements about the repository the TSPEC compresses. What matters from the product
lens is that the correction does not move an acceptance criterion, a threshold, or an obligation,
and that the corrected statement now agrees with the downstream document that executes it.

**§5.7, the generative run depth.** Before the edit, TSPEC said the suite runs at fast-check's
default; PLAN T-08 and PROPERTIES PROP-LAW-01…04 both pin `numRuns: 500`. The implementer reading
TSPEC and the implementer reading PLAN would have built suites of different depth from the same
requirement. After the edit TSPEC pins 500 explicitly and says all four laws P-1…P-4 take the pin.
The laws themselves are byte-identical — P-1 round trip, P-2 reader totality, P-3 classifier
totality, P-4 hash discrimination, with P-4's bounded-corpus caveat intact. Test depth increased
against the previously stated position; nothing was weakened.

**§5.8, the coverage floor's include set.** The floor itself — per-file 85% branch, enforced at
merge, closed inside Phase I by PLAN T-10 as round 4 established — is unchanged in threshold, owner
and backstop. What changed is the description of *what else* the same c8 config measures. The new
text adds that the fourth entry is external to `pdlc/workflows/`, that this is why the config sets
`allow-external: true`, that it covers no code this feature touches, and that `--per-file` therefore
keeps a red there off this feature's module. That last clause is the product-relevant one: it stops
a future operator reading a red in an unrelated script as a failure of this feature's floor.

**No scope movement.** The delta touches no `REQ-WVR-*` outcome, no `BR-*`, no `EC-*`, and no `AT-*`
oracle except AT-05, which *gained* a conjunct (write-side assertion, with §5.5 mutation 5 to match)
— a strengthening I raised at v5 and which is additive. Nothing in the delta adds behaviour the REQ
does not ask for, and nothing drops behaviour the REQ requires.

## Interfaces

Both edits are factual claims about files outside this feature's documents, so I re-measured every
one of them at HEAD rather than accepting the erratum's own account.

| Claim in the delta | Where made | Verified against | Result |
|---|---|---|---|
| `c8.include` has **four** entries | §5.8, revision row 1.4 | `pdlc/workflows/package.json` `c8.include` | ✓ four |
| The four entries are `**/pdlc/workflows/orchestrate-dev.js`, `**/pdlc/workflows/orchestrate-queue.js`, `**/pdlc/workflows/build-runtime.mjs`, `**/scripts/capture-learnings-baseline.mjs` | §5.8 | same | ✓ transcribed exactly, `**/`-anchoring included |
| The fourth entry is outside `pdlc/workflows/` and is why `allow-external: true` is set | §5.8 | `package.json`'s `//c8` note: "production tooling that lives above this package, so it needs `allow-external`" | ✓ |
| `test:coverage` is `c8 npm test -- --runInBand && c8 report --check-coverage --per-file --branches 85 …` | §5.8 | `package.json` `scripts.test:coverage` | ✓ verbatim |
| `--per-file` applies the floor to the external script independently | §5.8 | `//c8-per-file` note: stage 2 enforces branch ≥ 85 "on EVERY included module" | ✓ |
| `.github/workflows/pr-tests.yml` runs `npm run test:coverage` in the `Unit tests` job | §5.8 (unchanged bytes) | project CI table | ✓ still true |
| PLAN T-08 and PROPERTIES carry `numRuns: 500` | §5.7 | PLAN T-08; PROPERTIES PROP-LAW-01…04 and its run-depth paragraph | ✓ all pin 500 |
| The precedent block declares `const runs = { numRuns: 500 }` in `describe("PROP-CTR-05 (generative): citesGateOutput …")` | §5.7 | `advisoryHelperProperties.test.js:260-261` | ✓ |
| The precedent "applies it at **every** `fc.assert` site in that block" | §5.7 | same file, block spans `:260-387` | ✗ — see F-01 |

The last row is the one finding. The `PROP-CTR-05` block contains **seven** `fc.assert` sites; five
pass `runs` and two do not — the `FLOOR` property and the `EMPTY / NON-ARRAY evidence` property both
call `fc.assert(fc.property(…))` with no options argument, so they run at fast-check's default. PLAN
T-08 states this correctly ("applied at five `fc.assert` sites … the file's other properties are at
fast-check's default"), and PROPERTIES states it correctly too ("applies it at five `fc.assert`
sites"). The TSPEC's new sentence is the only one of the three that overstates it, and it closes
with "so the three documents agree" — which is true of the figure 500 and of the four laws, and not
true of this sub-claim.

## Data Model

No type, record shape, or catalogue moved in this delta. `WAVE_IGNORE_REASONS` (seven codes),
`RESUME_OUTCOMES`, `RESUME_PROVENANCE`, `IMPLEMENTATION_DEFAULTS` (four keys), the `ParsedWaveLedger`
three-arm shape and the ledger record's fields are byte-identical to the version I approved. §3.1's
interpolated-value count (five, `e75295b6`) predates this round and was already in the bytes at v6;
the 1.4 revision row records it retrospectively, which is bookkeeping rather than a change.

## Verification

**Upstream re-read at the current version (DEC-ERR-03).** The dispatch names REQ v1.7 and FSPEC
v1.2; both are at those versions at HEAD, and every place this TSPEC compresses them still says what
the TSPEC says it says:

| TSPEC location | Upstream text it leans on | State at HEAD |
|---|---|---|
| §2.5, ratification of the operator-pointed write | FSPEC §3.4 "An operator-pointed run records exactly as any other run does … in the same high-water form counted from the plan's first wave", bounded by BR-10, "No record content distinguishes the two provenances." | ✓ present; the TSPEC's quotation is faithful, including the BR-10 bound and the no-distinguishing-content clause |
| §6.3 item 2 / §6.2 OB-F1 | FSPEC OB-F1: "REQ BL-04 is **not met** … Raised as an erratum against the REQ, which now records BL-04 as open and unmet in §5 and §10 (v1.7)." | ✓ consistent with the REQ; the inconsistency this row formerly re-raised is genuinely closed |
| §6.3 item 3 | FSPEC v1.2's erratum note records the §3.4 clause landing | ✓ |
| §6.3 item 4 and §1.3 | REQ OB-1's worktree conclusion no longer rests on `.worktreeinclude` (no occurrence anywhere in REQ v1.7) | ✓ the citation defect is closed; the fail-open conclusion both documents draw is unchanged |
| §6.2 OB-F1 substance | REQ BL-04 still open and unmet | ✓ still unmet — the sequencing precondition (no wave carrying AT-14 dispatched before the rebase) remains live and is correctly still stated as such |

**Coverage-floor obligation, product view.** Unchanged across the delta and re-checked: threshold 85%
per-file branch; owner PLAN T-10; closes inside Phase I; backstop §5.3 per-arm unit coverage plus
§5.7's generative suite. The §5.8 rewrite added text around this and altered none of it.

**Test depth, product view.** The delta raises the stated depth of the generative suite from
"default" to 500 runs across four laws and adds a fifth mutation (§5.5 item 5) that AT-05's new
write-side conjunct kills. Both are increases in what the suite proves. The one thing I cannot
confirm from the delta is the precedent's own internal application, which is what F-01 records.

## Open Questions

| ID | Question |
|----|---------|
| Q-01 | PROPERTIES still carries a "Note the divergence, routed and resolved here" paragraph saying "TSPEC §5.7's convention paragraph says fast-check's default", plus an erratum-ledger row routing it as `ERRATUM: TSPEC`. That divergence is now discharged by this edit. It is a downstream bookkeeping item, not a TSPEC defect, so I have not raised it as a finding — but PROPERTIES and PLAN's erratum ledgers should retire those rows the next time either document is touched, so a later reader does not go looking for an open route that no longer exists. |

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Section anchor | Description |
|----|----------|------------|----------|----------------|-------------|
| F-01 | Medium | delta | local | §5.7 convention paragraph | The new sentence overstates the precedent: the `PROP-CTR-05` block applies `runs` at five of its seven `fc.assert` sites, not at every one |

FINDING: Medium | delta | local | §5.7 convention paragraph | The erratum's new text says the precedent block in `advisoryHelperProperties.test.js` "applies it at every `fc.assert` site in that block". It does not: the `describe("PROP-CTR-05 (generative): citesGateOutput …")` block spans seven `fc.assert` sites and passes `runs` to five of them — the `FLOOR` property and the `EMPTY / NON-ARRAY evidence never cites` property both call `fc.assert(fc.property(…))` with no options argument and therefore run at fast-check's default. PLAN T-08 and PROPERTIES both state the precedent correctly as five sites with the file's other properties left at the default, so the paragraph's closing claim that "the three documents agree" holds for the figure 500 and the four laws but not for this sub-claim — reintroducing, in miniature, the TSPEC-vs-PLAN divergence this erratum was routed to close. Non-gating: the load-bearing instruction (all four laws P-1…P-4 pinned at `numRuns: 500`) is unambiguous, correct and matches PLAN and PROPERTIES, so no implementer is misdirected about what to build. Fix: replace "at every `fc.assert` site in that block" with "at five of that block's `fc.assert` sites, the file's remaining properties being left at fast-check's default" — matching PLAN T-08's wording. Scope: Local. Requirement ref: TSPEC §5.7 / PLAN T-08 / REQ-WVR test-depth obligation.

## Positive Observations

- **Both routed items land in the strong form, not the minimal one.** §5.7 could have changed four
  words; instead it names the precedent file, the precedent's `describe` block, the declaration
  form, and states that PLAN and PROPERTIES carry the same figure — so the next reader can check the
  agreement rather than trust it. That is what let me find F-01 at all, which is the point of
  writing claims checkably.
- **§5.8 answers the question the correction raises rather than just fixing the count.** Going from
  three to four entries invites "so is this feature now measured against a script it does not
  touch?" — and the new text answers it in place: external, hence `allow-external`, covers nothing
  this feature touches, and `--per-file` keeps a red there off this module. A three-to-four
  correction that left that unanswered would have been technically complete and operationally worse.
- **All three of my v6 findings are discharged, and each was discharged at the right altitude.**
  §6.3 became a resolved ledger rather than being deleted, so the erratum chain stays
  reconstructable; §6.2 OB-F1 had its re-raise justification struck while its live substance —
  BL-04 unmet, AT-14 red, no wave carrying AT-14 before the rebase — was explicitly preserved and
  flagged as unaffected. That distinction was the whole risk in that finding, and the edit names it.
- **The round-5 revision row is honest about attribution.** It credits each correction to the lenses
  that raised it (PM, TE, SE) and states plainly that no decision was re-litigated and no scope
  changed — which my own read of the diff confirms.

## Recommendation

**Approved with minor changes**

Both routed items land correctly and completely, all three of my v6 findings are discharged, upstream
REQ v1.7 and FSPEC v1.2 still say at HEAD what this TSPEC compresses them as saying, and no
acceptance criterion, threshold or obligation moved. The single Medium finding is a factual
overstatement inside one new sentence in §5.7; it does not gate. Fold F-01's one-line correction
into the next touch of this document — no separate erratum round is warranted for it.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 0}
