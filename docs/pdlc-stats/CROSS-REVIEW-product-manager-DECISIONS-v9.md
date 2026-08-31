# Cross-Review: product-manager — DECISIONS (delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-stats/DECISIONS-pdlc-stats.md` (v1.6, unchanged)
**Base reviewed at v8:** `7adc9666196cca6357174fcbb513b6a6f597af2f`
**Upstream HEAD:** REQ `5f3e8051…` (v1.6) · FSPEC `c7d2c832…` (v1.7) · TSPEC `3742216…` (v1.6)
**Date:** 2026-08-31
**Iteration:** 9 (delta confirmation, decision freeze)

## Context

**The document did not move this round. Its upstream did.**
`git diff 7adc9666..HEAD -- docs/pdlc-stats/DECISIONS-pdlc-stats.md` is empty: zero commits touch
the file since the bytes I approved at v8. There is no author delta to confirm. What changed is
everything above it — REQ v1.4 → v1.6, FSPEC v1.5 → v1.7, TSPEC v1.4 → v1.6 — all landed after the
commit this document last grounded on.

That inverts the usual delta question. The v8 round asked "did the edit land cleanly". This round
asks the only question a frozen, unedited document can fail: **is any load-bearing claim in it now
false, because upstream moved underneath it?** Under decision freeze that is also the only thing
that may block — a defect the revision introduced (there was no revision) or a factual contradiction
with the repository at HEAD or an upstream document.

**Upstream movement, measured not assumed.** The document's v1.6 changelog attests "TSPEC HEAD is
v1.4 (`sha256:cb351bb3…`) and FSPEC HEAD is v1.5 (`sha256:25af3c47…`) … REQ HEAD (v1.4) matches its
pin". I checked whether that attestation was true when written rather than assuming either way:

| File | Hash at `7adc9666` | Hash at HEAD | Verdict on the attestation |
|---|---|---|---|
| REQ | `60a516fb…` (v1.4) | `5f3e8051…` (v1.6) | True when written; stale now |
| FSPEC | `25af3c47…` (v1.5) | `c7d2c832…` (v1.7) | True when written; stale now |
| TSPEC | `cb351bb3…` (v1.4) | `3742216…` (v1.6) | True when written; stale now |

This matters because TSPEC v1.6 spent its round correcting exactly the opposite failure in itself:
its v1.5 changelog attested "neither moved" while FSPEC and REQ had in fact moved, because it cited
a current hash instead of diffing against the previously grounded one. **DECISIONS did not make that
mistake.** Its three hashes were the real HEAD values at the moment it wrote them. The staleness
here is the ordinary consequence of being reviewed after upstream advanced, not a false attestation.

**What I re-verified mechanically, rather than trusting the v8 result:**

| Claim | How checked | Result |
|---|---|---|
| `c8.include` holds seven entries at HEAD | read `pdlc/workflows/package.json` | seven `**/`-anchored entries |
| `REQUIRED_INCLUDES` holds four | `pdlc/workflows/__tests__/coverageInstrumentation.test.js:37-46` | four; literal is `4 + 1 + 2` = seven |
| TSPEC §2.1 still says *six → seven* | `git diff` on the TSPEC row | row untouched by v1.5/v1.6 |
| P-1's title as DECISIONS quotes it | `learningsPremises.test.js:78` | "MODULE_NAMES is exactly the four canonical workflow modules" — DECISIONS' quote is a faithful substring |
| The ten-site set matches TSPEC's ten | row-by-row compare of both tables | identical membership |

I did **not** re-open `DEC-STATS-01`'s chosen option, `DEC-STATS-02`, `DEC-STATS-03`, the option
table, K-1 through K-9, or the standing-cost bullets. None of them changed; all were approved on
their merits across v5–v8.

## Options Considered

Three readings of "an unedited document under moved upstream" were open. The choice decides the
verdict, so I state it rather than leaving it implicit.

**Reading 1 — upstream moved three revisions, so the document is stale and must re-ground before
approval.** Rejected, on evidence rather than on convenience. Staleness is only a defect where it
changes something. I walked the three upstream diffs looking for anything DECISIONS decides,
compresses or cites, and found the movement lands entirely outside this document's subject matter:

- **REQ v1.5–v1.6** withdraws REQ-STATS-05's harvested halt state, restores a measured `0`, rescopes
  NG-6 to the two families harvest actually removes, and rewords REQ-STATS-06's predicate. DECISIONS
  contains no reference to halts, harvested states or NG-6 — I grepped for all of them and the only
  neighbouring claim is line 178's "REQ-STATS-02 requires the JSON document's top-level key set to be
  set-equal to the printed metric set", which REQ v1.6 *reinforces* ("never as extra top-level keys").
- **FSPEC v1.6–v1.7** re-scopes BR-16's `docs/completed/pdlc-advisory-wave-gate/` citation to the
  malformed basename *shape*, corrects a count two → four and adds an AT-15 trace row. DECISIONS
  mentions neither BR-16 nor that directory.
- **TSPEC v1.5–v1.6** is the one that could have bitten, and is treated as its own reading below.

**Reading 2 — TSPEC v1.6's new REQ-versus-FSPEC conflict is an unabsorbed decision, so DECISIONS
owes a round.** Rejected on the strongest available evidence: **TSPEC itself says otherwise.** §8.4,
*Questions for DECISIONS*, is unchanged across both revisions and still reads "Three load-bearing
alternatives were weighed and rejected and belong in `DECISIONS-pdlc-stats.md`" — the new erratum was
routed to §8.3 as an open upstream item, not promoted into §8.4. That is the correct routing and it
is TSPEC's call to make: the REQ-STATS-06-versus-BR-16 dispute is about whether a grammatical
basename outside the driver's catalogue is a survivor, which decides AT-17's fourth-leg expected
value. It is a REQ-versus-FSPEC reconciliation owed at the owning phase. It is not a module-boundary,
seam or co-change question, and DECISIONS decides only those. **No decision is owed here**, and
opening one would be exactly the freeze violation this round exists to prevent.

**Reading 3 — confirm the document's load-bearing claims still hold at HEAD, and route what does
not.** Adopted. This is what a frozen round can honestly test, and it is the test the document
passes.

**Where TSPEC v1.5 moved, it moved *toward* this document, not away.** This is the finding I most
expected to go the other way and it did not. TSPEC v1.5 corrected §1 and RK-1, which had joined the
sibling-feature carve-out to the ten sites with "including" — placing inside the ten an edit that
§2.1 and RK-1 place outside it. Both now read "and … that sits **outside** that ten". DECISIONS had
already partitioned it that way since v1.5: its own ten-site table (`:213-223`) lists exactly the
ten in-repo sites and no sibling-document row, and K-7 owns the two sibling-document edits as a
separate obligation. I compared the two tables row by row — `prepack.mjs`, `publish-preflight.mjs`,
`fixture-machine.mjs`, `_tspec-packed-set.mjs`, `package.json`, `loop-distribution.test.js`,
`coverageInstrumentation.test.js`, `run.test.js`, `learningsPremises.test.js`, `pdlc/README.md` —
and the membership is identical. The v6 High that forced this alignment stays closed, and upstream
has now converged on the same partition from its side.

**The one carried divergence survives the round unchanged.** TSPEC §2.1's
`coverageInstrumentation.test.js` row still describes P9-02's title as moving *six → seven*. I
re-measured at HEAD rather than inheriting my own v8 arithmetic: `REQUIRED_INCLUDES` holds four
entries (`orchestrate-dev.js`, `orchestrate-queue.js`, `build-runtime.mjs`,
`scripts/check-wave-resume-delta-coverage.mjs`), so P9-02's literal is `4 + 1 + 2` = **seven**, and
`c8.include` in `pdlc/workflows/package.json` holds seven entries today. This feature makes it
**eight**. DECISIONS carries the correct arithmetic and books the repair as owed upstream. Neither
of TSPEC's two revisions touched that row, so the item is inherited, unchanged, and still non-gating
— it is a defect in TSPEC's bytes, not in the document in front of me.

## Decision

**Approved with minor changes.** Zero High. Two Low, both inherited and nonlocal, neither actionable
inside this document.

The bar for this round was narrow and explicit: only a defect the revision introduced, or a factual
contradiction with the repository at HEAD or an upstream document, may block. There was no revision,
so the first limb is vacuous. On the second limb I tested every load-bearing claim I could reach
mechanically, and they hold:

| Load-bearing claim | Status at HEAD |
|---|---|
| `pdlc/workflows/package.json`'s `c8.include` holds seven entries | True — seven `**/`-anchored entries |
| P9-02's literal is `REQUIRED_INCLUDES` + capture script + two `lib/` modules = seven | True — `REQUIRED_INCLUDES` is four (`coverageInstrumentation.test.js:37-46`) |
| The feature moves that set to eight | True — one added member |
| The ten co-change sites are the ten in `DEC-STATS-01`'s table | True — set-equal to TSPEC §2.1's ten |
| The two sibling-document edits sit outside the ten, owned by K-7 | True, and TSPEC v1.5 now agrees explicitly |
| `pdlc/README.md`'s prose enumeration is the tenth site, pinned by no oracle | True — TSPEC §2.1 carries the same "pinned by no oracle" residue at `RK-1` |
| P-1's title pins the count | True — `learningsPremises.test.js:78` matches the quoted phrase |
| REQ-STATS-02's top-level key set is set-equal to the printed metric set | True, and strengthened by REQ v1.6 |

**The count reconciliation still holds after upstream moved.** The v8 round's repair — both
breakdowns naming the tenth site, agreeing with the site table, K-1's partition, K-9's ownership and
*Standing costs accepted* — is undisturbed. Three decompositions, one number, and upstream's ten now
matches it from the other side.

**No new decision is opened here**, per the freeze. Two observations that would otherwise have been
questions are recorded as deferred items instead:

DEFERRED: The document's v1.6 grounding line reads in the present tense ("TSPEC HEAD **is** v1.4") and is now three upstream revisions stale; a future round may prefer version-scoped past tense in changelog attestations so a superseded pin cannot be misread as live.

DEFERRED: TSPEC §8.3's REQ-STATS-06-versus-BR-16 conflict decides AT-17's fourth-leg expected value; if its reconciliation ever reaches the parser-catalogue seam, `DEC-STATS-03`'s bundle identity oracle is the place to re-check, though nothing today makes that likely.

## Consequences

**For Phase D / PLAN.** Not blocked. The PLAN author reads a document whose ten-site table, K-row
partition and falsifier column are all intact and now agree with TSPEC's ten from both sides. The
co-change set partitions mechanically: ten in-repo rows, four K-rows covering them without overlap,
two sibling-document edits owned separately by K-7 and explicitly outside the ten, and one site
(`pdlc/README.md`) flagged as having no red behind it.

**For the implementer.** Unchanged from v8. The purity detector, the array-equality warning on
`c8.include` (P9-02 asserts `toEqual`, so position matters, not just membership), the
`MODULE_NAMES`-versus-packed-class distinction (4 → 5 copied, 5 → 6 packed — different numbers that
must not be synchronised to each other), and K-9's third site going green-but-undone all survive
this round untouched. The document names that last risk rather than hiding it.

**For upstream (TSPEC).** One erratum stays owed and is now two revisions old: §2.1's
`coverageInstrumentation.test.js` row still says *six → seven* where HEAD measures seven already.
The product risk is direction-of-travel, not arithmetic: the pin says TSPEC is authoritative, so a
later reader could "correct" DECISIONS into agreement with a number that is known wrong, and a task
sized off that row would ship a passing test whose title misstates its own assertion by two. K-3's
clause naming the divergence and its direction remains the strongest mitigation a downstream
document can apply unilaterally.

**For upstream (REQ / FSPEC).** Nothing owed from this document. Their movement was real and
substantial, but it lands in halt states, harvested-family scoping and BR-16's basename shape — none
of which DECISIONS decides or cites. That is a healthy sign about the seam: a document confined to
module boundaries and co-change cost should be able to sit through three upstream revisions of
predicate semantics without owing a round, and this one did.

**For harvest.** One signal from this round looks durable beyond the feature. I flag it for
`docs/_constraints/DOMAIN-CONSTRAINTS.md` rather than inflating a severity here:

- **Citing a current upstream hash is not the same check as diffing it against the previously
  grounded one.** TSPEC v1.6 diagnosed this in itself in plain terms, and it is the more general
  lesson of this round: an attestation that reads "upstream did not move" is only sound if the round
  compared *two* hashes. A round that reads one current hash and calls it agreement will skip
  re-grounding and not know it did. The `Process` shape of the fix belongs in the erratum checklist —
  record the previously grounded hash alongside the current one — not in a domain constraint.

**On the stale dispatch pin (carried from v7 and v8).** Two consecutive rounds cited a TSPEC hash
(`sha256:512a9fcf…`) matching no revision on the branch; this round the dispatch names no DECISIONS
delta at all because there is none. The document handled the earlier case correctly by re-grounding
on HEAD under `DEC-ERR-03`. It remains a pipeline observation rather than a document defect, and
stays a question.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Section anchor | Description |
|----|----------|-----------|----------|----------------|-------------|
| F-01 | Low | inherited | nonlocal | K-3 / `DEC-STATS-01` site table, `coverageInstrumentation.test.js` row | TSPEC §2.1's row still states P9-02's title moves *"six → seven"*. Re-measured at HEAD: `REQUIRED_INCLUDES` holds four entries, so the literal `4 + 1 + 2` is seven and `c8.include` holds seven today; this feature makes it eight. DECISIONS carries the correct arithmetic and records the divergence. The repair belongs upstream in **TSPEC** and must not be matched into agreement. Carried from v6 F-05 / v7 F-02 / v8 F-01; untouched by TSPEC v1.5 and v1.6. |
| F-02 | Low | inherited | nonlocal | v1.6 changelog, upstream grounding line | The grounding attestation reads in the present tense — "TSPEC HEAD **is** v1.4 … FSPEC HEAD **is** v1.5 … REQ HEAD (v1.4) matches its pin". Verified true at the commit where it was written (`7adc9666`), but all three upstreams have since moved (REQ v1.6, FSPEC v1.7, TSPEC v1.6), so the sentence is false as read at HEAD. Not a defect in any decided content and not gating — a changelog records the document at its own version, the convention this document has applied consistently since v1.4 — but the present tense invites a later reader to take a superseded pin as live. |

FINDING: Low | inherited | nonlocal | K-3 / DEC-STATS-01 site table, coverageInstrumentation.test.js row | TSPEC section 2.1 still states P9-02's title moves six to seven; re-measured at HEAD, REQUIRED_INCLUDES holds four entries and c8.include holds seven today, so this feature moves it seven to eight. DECISIONS carries the correct arithmetic and records the divergence; the repair belongs upstream in TSPEC and must not be matched into agreement with a number known wrong. Carried from v6 F-05, v7 F-02 and v8 F-01, and untouched by TSPEC v1.5 and v1.6.

FINDING: Low | inherited | nonlocal | v1.6 changelog upstream grounding line | The grounding attestation is written in the present tense and was true at the commit where it was written, but REQ, FSPEC and TSPEC have all moved since, so it reads false at HEAD; version-scoped past tense would prevent a superseded pin being misread as live. Not gating, since a changelog records the document at its own version.

## Positive Observations

- **The document survived three upstream revisions without owing a round.** REQ moved twice, FSPEC
  twice and TSPEC twice since this document was last written, and none of it reaches what DECISIONS
  decides. That is not luck — it is the seam holding. A decisions document scoped to module
  boundaries and co-change cost *should* be insensitive to upstream churn in predicate semantics,
  and this one demonstrably is. I looked for the coupling and could not find it.

- **Its grounding attestation was honest, and I verified that rather than assuming it.** TSPEC v1.6
  had just corrected a false "upstream did not move" claim in its own v1.5 changelog, which made the
  same claim in DECISIONS worth testing rather than reading past. I reconstructed the upstream hashes
  at `7adc9666` and all three matched what the document said it had grounded on. The document did the
  check it claimed to do.

- **Upstream converged on this document's partition, not the other way round.** TSPEC v1.5 corrected
  §1 and RK-1 to place the sibling-feature carve-out outside the ten — the scoping DECISIONS had
  already adopted at its own v1.5 and defended through the v6 High. The two documents now describe
  one co-change contract, from both directions, and PLAN reads a set that partitions the same way in
  either document.

- **The carried erratum is still carried honestly.** It would have been cheap, and invisible, to
  quietly restate TSPEC's *six → seven* and let the two documents agree. The document instead keeps
  the correct arithmetic, names the divergence, names its direction, names its owner, and says why
  TSPEC is not edited from this dispatch. Two rounds later that decision still looks right: I
  re-measured, and DECISIONS is the one holding the true number.

- **The freeze was respected from both sides.** TSPEC routed its new REQ-versus-FSPEC conflict to
  §8.3 as an open erratum rather than promoting it into §8.4's *Questions for DECISIONS*. That
  routing is what let this round stay a confirmation instead of reopening a decision, and it is
  worth naming as good upstream discipline rather than treated as the default.

## Questions

| ID | Question |
|----|---------|
| Q-01 | K-9 covers three sites, two with falsifiers and one (`pdlc/README.md`'s prose enumeration) without. Will PLAN's task carry an explicit review checkpoint for that edit? A green `run.test.js` and `learningsPremises.test.js` can read as "K-9 done" while the prose member list and its count word go stale in silence — the partial-co-change shape `RK-1` exists to prevent. Carried unanswered from v7 and v8. |
| Q-02 | Three consecutive rounds now, the dispatch's TSPEC pin has been either unresolvable (`sha256:512a9fcf…`, matching no revision on the branch) or absent. The document has handled it correctly by re-grounding on HEAD under `DEC-ERR-03`, but where is that hash produced? If it names a version that never existed rather than an older one, the staleness check is not lagging but broken, and no document-side discipline can compensate. Pipeline observation, not a document defect. |

## Recommendation

**Approved with minor changes.** No High findings. Two Low findings, both inherited and nonlocal:
one is an erratum owed upstream in TSPEC, the other a tense convention in this document's own
changelog. Neither is actionable inside a frozen round and neither blocks Phase D.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 2}
