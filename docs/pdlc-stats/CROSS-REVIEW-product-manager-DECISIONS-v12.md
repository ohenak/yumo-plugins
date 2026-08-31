# Cross-Review: product-manager — DECISIONS (erratum-round delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-stats/DECISIONS-pdlc-stats.md` (v1.7)
**Base reviewed v11:** `930d65c49d6c308b73f1084da19b852bafe08887` (document at v1.6)
**Upstream at this round:** REQ `sha256:f75c348f…` (v1.7) · FSPEC `sha256:a493133f…` (v1.8) · TSPEC `sha256:f32d9cb5…` (v1.8)
**Date:** 2026-08-31
**Iteration:** 12 (erratum round 8 — decision freeze in force)

## Context

**This round the document did move.** `git diff 930d65c4..HEAD -- docs/pdlc-stats/DECISIONS-pdlc-stats.md`
is +51/−7 across three commits — `39d7d46f7` (K-3), `82a2f8ec7` (site-table preamble), `f3ab46e72`
(changelog) — taking DECISIONS v1.6 → **v1.7**. Unlike v9–v11, which were pure upstream-cascade
confirmations over frozen bytes, this is a real, bounded edit, and it is an edit that answers
findings I raised. So my job has two halves: did the two things it changed land correctly, and did
the edit break anything that held at v1.6.

**What changed, precisely — three hunks, all bookkeeping.**

1. **K-3's *Upstream divergence* clause is retired** (`39d7d46f7`). Through v1.6 the row routed
   TSPEC §2.1's *six → seven* description of P9-02's title as *"an erratum owed upstream, not
   resolved here (TE F-05)"*. It now records the route as discharged: *"Upstream divergence resolved
   in TSPEC v1.7 — no longer owed (retires TE F-05, PM F-01)."* This is the exact repair my **F-01**
   asked for at v6–v11.
2. **The site-table preamble's transposition is corrected** (`82a2f8ec7`). *"Four hold the
   enumerations; five pin them"* → *"**Five** hold the enumerations; **four** pin them."*
3. **A v1.7 changelog entry is added, and the v1.6 entry is marked version-scoped** (`f3ab46e72`) —
   *"(Version-scoped: the pins in this entry state upstream as it stood at v1.6, not at HEAD…)"*,
   plus a matching supersession marker on the v1.5 entry's carried-unresolved paragraph. This is the
   answer to my **F-02**.

**Upstream moved too, and the changelog's pins reconcile.** I checked all three against the branch
rather than trusting the entry: TSPEC HEAD is `f32d9cb5…` (**v1.8**) ✔, FSPEC HEAD is `a493133f…`
(**v1.8**) ✔, REQ HEAD is `f75c348f…` (**v1.7**) ✔. All three match what the v1.7 entry states. The
long-running non-resolving TSPEC dispatch pin, carried as DEFERRED since v8, is *also* addressed —
not by a document edit, which could not fix it, but by being named as a workflow-side defect and
routed to harvest. That is the right disposition and I record it as closed from this document's side.

**No decision is opened, re-opened or re-litigated.** Every chosen option, the ten-site table's rows,
K-1…K-9's substance, the falsifier column and the standing-costs bullets are byte-identical. The
freeze held.

## Options Considered

Under the freeze the only readings available are about whether the delta landed and whether it
contradicts the repository. I tested each against source, not against the document's own narration.

**Reading 1 — K-3's retirement is a claim about TSPEC, so verify it in TSPEC. It holds.** The row now
asserts that TSPEC v1.7 *"repaired that row onto the measurement this document already carried — the
set is seven at HEAD, so the feature moves the title seven → eight."* TSPEC §2.1's
`coverageInstrumentation.test.js` row now reads *"`4 + 1 + 2` = **seven** members measured today …
Adding `lib/stats.mjs` makes the set **eight**, so the title moves **seven → eight** (printed `six` →
`eight`)"*, and TSPEC's v1.7 changelog neutralises the superseded narration in its own v1.3 row
(*"wrong on HEAD's measurement and is corrected to seven → eight at v1.7; this row is left as the
record"*). The two documents now state the same move. **PM F-01 is genuinely closed**, not
re-labelled: the arithmetic in the row is unchanged, only the disagreement bookkeeping is gone.

**Reading 2 — the 5/4 preamble correction could itself be the transposition. It is not; the new
reading is the one three independent places already used.** I counted the table rather than trusting
either version. Rows 1–5 *hold* member lists: `prepack.mjs` (`MODULE_NAMES`),
`publish-preflight.mjs` (`WORKFLOW_MEMBERS`), `fixture-machine.mjs` (`WORKFLOW_MODULE_NAMES`),
`_tspec-packed-set.mjs` (`WORKFLOW_MEMBERS` + `tspecPackedCount`), and `pdlc/workflows/package.json`
(`c8.include`) — **five**. Rows 6–9 *pin* them from test files: `loop-distribution.test.js` and
`run.test.js` (`pdlc/engine/__tests__/`), `coverageInstrumentation.test.js` and
`learningsPremises.test.js` (`pdlc/workflows/__tests__/`) — **four**, across exactly the *"two other
packages"* the preamble names. Row 10 is `pdlc/README.md`'s prose, pinned by nothing. **5 + 4 + 1 =
10.** Three other places in the corpus already read it that way — this document's own sweep
narration (*"the five enumeration holders … the four test files that pin their membership or size …
and `pdlc/README.md`'s prose member list"*), its *Reversibility: hard* clause (*"the five
enumerations, the four test files"*), and TSPEC §7.3 (*"five enumerations, holding six symbols across
five files, plus four test files … and `pdlc/README.md`'s prose enumeration"*). The v1.6 preamble was
the lone outlier; it is now the only one that changed, and it changed *toward* the majority. The
follow-on clause is correspondingly repaired — *"a per-file scan of the holders reaches none of the
four"* — and matches the sweep's own account that round 1 scanned holders and found five.

**Reading 3 — accept the round's re-measurement attestation on its face. Rejected: I re-measured,
and one sentence overstates what is true at HEAD.** The v1.7 entry asserts *"Every count, option,
obligation and falsifier below re-measured true at HEAD."* The options, obligations and falsifiers
survive that test; the **counts do not**, because **this feature's implementation has already landed
on this branch**. At HEAD `pdlc/engine/scripts/prepack.mjs`'s `MODULE_NAMES` holds **five** entries,
the fifth being `lib/stats.mjs`; `pdlc/workflows/package.json`'s `c8.include` holds **eight**, the
eighth being `**/pdlc/workflows/lib/stats.mjs`; and `pdlc/workflows/lib/stats.mjs` is a tracked file
(22 KB), added by `c3acd694d` (T-16) at 15:32 with T-17…T-20 following by 15:51 — all of them
ancestors of the v1.7 changelog commit `f3ab46e72` (16:43). So the site table's *Members at HEAD*
column and K-3's *"`c8.include` is seven at HEAD to match; this feature makes it eight"* describe the
**pre-implementation baseline**, not HEAD as it stood when the attestation was written. This is the
one genuinely new observation of the round, and it is why F-01 below is `delta`.

**Reading 4 — treat that as a High and halt. Rejected, and I want to be explicit about why.** The
freeze bar admits two blocking limbs: a defect the revision introduced, or a factual contradiction
with repository HEAD on a **load-bearing** claim. The stale counts touch the second limb, but not on
a load-bearing claim, for three reasons. (a) The *decision content* is unaffected: the co-change set
is still ten sites, the partition across K-1/K-3/K-8/K-9 is unchanged, and every option's cost
ordering is unchanged — the numbers that moved are the deltas the feature was *supposed* to make, and
the implementer made exactly them (`4 → 5`, `7 → 8`), which is the design being confirmed, not
contradicted. (b) The claim has no live consumer: PLAN's task boundaries and PROPERTIES' oracles read
the site enumeration and the falsifier column, not the baseline digits, and the implementation those
digits were sizing is already committed. (c) A design document's *"at HEAD"* column is conventionally
the pre-feature baseline; reading it as a live assertion about the post-implementation tree would
make every DECISIONS document in the repo self-falsifying the moment its own feature merges. What is
genuinely wrong is narrower and is a **Medium**: the changelog's blanket *"every count … re-measured
true at HEAD"* claims a verification that was not available at the time it was written.

**Not re-opened:** `DEC-STATS-01`'s chosen option, `DEC-STATS-02`, `DEC-STATS-03`'s option table and
identity oracle, K-1 through K-9 on their merits, the standing-costs bullets, or the
*Relationship to project-level decisions* section. None moved; all approved across v5–v11.

## Decision

**Approved with minor changes.** Zero High, one Medium, two Low. The two findings I carried from v6
onward are **both closed by this round's edit**, which is the outcome the erratum channel exists for.

Both prior findings, re-verified rather than assumed closed:

| Prior finding (v11) | Status at v1.7 | Evidence |
|---|---|---|
| **F-01 (Low, carried v6–v11)** — K-3 still routed the include-count divergence upstream as *"owed in TSPEC, not resolved here"* after TSPEC v1.7 resolved it | **Closed** | K-3 now reads *"Upstream divergence resolved in TSPEC v1.7 — no longer owed"*; TSPEC §2.1 independently states the same *seven → eight*. Arithmetic in the row unchanged |
| **F-02 (Low)** — the v1.6 changelog's *"REQ HEAD (v1.4) matches its pin"* read as a live claim about a superseded pin | **Closed** | The v1.6 entry is now prefixed *"(Version-scoped: the pins in this entry state upstream as it stood at v1.6, not at HEAD; see the v1.7 entry for HEAD)"* and its tense moved to past. The v1.5 entry's carried-unresolved paragraph gets a matching *"(Discharged at v1.7 …)"* marker |

Every claim the delta makes about something outside itself, checked at the source:

| Claim introduced or changed at v1.7 | Status |
|---|---|
| TSPEC HEAD is v1.8, `sha256:f32d9cb5…` | **True** — matches the branch blob |
| FSPEC HEAD is v1.8, `sha256:a493133f…` | **True** |
| REQ HEAD is v1.7, `sha256:f75c348f…` | **True** |
| TSPEC v1.7 corrected §2.1's `coverageInstrumentation.test.js` row from *six → seven* to *seven → eight* | **True** — verified in TSPEC §2.1 and its v1.7 changelog row |
| REQ v1.7 / FSPEC v1.8 / TSPEC v1.8 withdrew REQ-STATS-06's out-of-catalogue *survivor* clause and pinned BR-16's `harvested` reading | **True** — FSPEC v1.8's entry states it in the same terms (*"absorbed, not open"*); TSPEC §4.3/§8.3 re-stamp it |
| That rule *"this document neither states nor depends on, so nothing is owed here"* | **True** — `grep` finds no `REQ-STATS-06`, `survivor`, `catalogue` or `harvested` in DECISIONS, and my v11 round tested the one seam that could have made it load-bearing (the driver's catalogue is internal to `parseReviewFilename`, surfaced as `reason: "bad_doc_type"`, so no fifth classifier escapes DEC-STATS-03's bundle) |
| No new `BR-`, `E-` or `AC-` row and no vocabulary rename in those rounds | **True** — the FSPEC delta is +10/−3, a pin correction and a changelog entry; *"No other change"* |
| TSPEC §2.1 still derives **ten** co-change sites, matching this table and K-1's partition | **True** — TSPEC §6.4 and §7.3 both still read ten |
| Site-table preamble: **five** hold, **four** pin, from two other packages | **True** — counted off the table; corroborated by the sweep narration, *Reversibility: hard*, and TSPEC §7.3 |
| *"Every count … re-measured true at HEAD"* | **Overstated** — see F-01 (Medium). Options, obligations and falsifiers re-measure true; the baseline counts do not, because the feature's own implementation landed on this branch before the attestation was written |

**The bar applied is the one set at v9 and held at v10 and v11.** Only two things block: a defect this
revision introduced, or a factual contradiction with upstream/HEAD on a load-bearing claim. The
revision introduced no defect in any decision — it retired a paid debt, fixed a transposition, and
scoped two changelog entries to their own versions, and all three land correctly. The one factual
gap it did introduce sits on a bookkeeping attestation with no downstream consumer, so it is
recorded at Medium and does not gate. **DECISIONS v1.7 holds as approved.**
