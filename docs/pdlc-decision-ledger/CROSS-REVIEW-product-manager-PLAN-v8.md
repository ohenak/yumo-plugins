# Cross-Review: product-manager — PLAN (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-decision-ledger/PLAN-pdlc-decision-ledger.md` (v0.7, unchanged bytes)
**Date:** 2026-08-29
**Iteration:** 8 (upstream-cascade confirmation — TSPEC moved, PLAN did not)

## Overview

This is an **upstream-cascade confirmation**, not a re-review. PLAN's own bytes are unchanged since
`5ffa27135`, the commit my v7 round approved (`APPROVAL-HASH: sha256:a8e91304…97a100`). What moved is
the upstream I pinned in that approval: `452d72c07 docs(tspec): erratum v1.0 — home the census
constants, drop them from owned decls` re-wrote TSPEC §7.3. My v7 `UPSTREAM-STATE` recorded TSPEC at
`sha256:eef45ef3…0623c8`; TSPEC at HEAD is `sha256:b1b603a8…d31a0`. REQ (`ce6b133f…3c7b7c`), FSPEC
(`2bd5c3ef…5aed39`) and DECISIONS (`13aba061…4fb89a`) are byte-identical to the versions I approved
against, so the whole question is PLAN-against-TSPEC-§7.3.

I re-read `CROSS-REVIEW-product-manager-PLAN-v7.md`, ran `git show 452d72c07` on the TSPEC, and asked
the single question the dispatch names: **does the PLAN still hold against the TSPEC as it now
stands?** I did not re-litigate any settled decision, and I checked the erratum's whole post-image
rather than the routed-item list (DEC-ERR-03).

It does not hold. The erratum adopted the resolution PLAN v0.7 **explicitly examined and rejected in
writing**. My v7 Q-02 asked where the residual gap would land — on TSPEC, or absorbed into PLAN prose
— and the answer came back "on TSPEC", in the direction opposite to the one PLAN had already
committed to at four sites plus its revision history. PLAN v0.7's central claim about the census —
that `DECISION_LEDGER_CENSUS_TOKENS` is production code declared in `orchestrate-dev.js` by T-18, is
therefore a member of `DECISION_LEDGER_OWNED_DECLS`, and that the partition is six ∪ nine = fifteen —
is now a statement upstream contradicts term for term. TSPEC v1.0 says the constant is a **test-file**
declaration, that "a test-file constant can never be a member of it", and that the owned list is
wholly module declarations (six ∪ eight = fourteen).

This is one defect with several loci, not several defects. One finding, High, below.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Description | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | High | delta | local | PLAN's census contract is the reading TSPEC v1.0 rejects: it makes `DECISION_LEDGER_CENSUS_TOKENS` production code of `orchestrate-dev.js`, a member of `DECISION_LEDGER_OWNED_DECLS` and of `DECISION_LEDGER_CENSUS_EXEMPT`, and pins the partition at six ∪ nine = fifteen. §7.3 now homes it in the census **test file**, states a test-file constant can never be an owned member, and leaves six ∪ eight = fourteen. | T-11 (`PLAN`:152), T-18 (`PLAN`:158), ownership manifest (`PLAN`:207, `PLAN`:219), Definition of Done (`PLAN`:485-500), revision history (`PLAN`:19) |
| F-02 | Low | delta | local | Every PLAN citation of the moved section reads `TSPEC v0.9 §7.3`; the section is now v1.0. | T-11 (`PLAN`:152), DoD (`PLAN`:492, `PLAN`:497) |

FINDING: High | delta | local | T-11 / T-18 / ownership manifest / Definition of Done — PLAN specifies `DECISION_LEDGER_CENSUS_TOKENS` as a production declaration of `orchestrate-dev.js` and an owned member (partition six ∪ nine = fifteen); TSPEC v1.0 §7.3 homes it in the census test file, forbids test-file constants as owned members, and leaves fourteen owned declarations
FINDING: Low | delta | local | T-11 and the Definition of Done cite `TSPEC v0.9 §7.3` for text that is now TSPEC v1.0 §7.3

### F-01 — the rejected alternative is now the specification (High)

**What PLAN says.** Four sites, all written by the v0.7 pass, say the same thing deliberately:

- **T-11 (`PLAN`:152):** `DECISION_LEDGER_CENSUS_TOKENS` "is itself **declared in
  `pdlc/workflows/orchestrate-dev.js` as a production top-level constant, written by T-18**"; "That
  home is what makes it a member of `DECISION_LEDGER_OWNED_DECLS` — and therefore of
  `DECISION_LEDGER_CENSUS_EXEMPT`". The same row enumerates `DECISION_LEDGER_CENSUS_EXEMPT` as "the
  **nine** plumbing declarations … (`parseDecisionLedgerConfig`, `buildDecisionLedgerInjector`,
  `DECISION_LEDGER_DEFAULTS`, `DECISION_HEADING_RE`, `DECISION_CORPUS_ARGV`,
  `DECISION_LEDGER_PREAMBLE`, `DECISION_LEDGER_RULE_TEXT`, `DECISION_LEDGER_NOTICES`,
  `DECISION_LEDGER_CENSUS_TOKENS` itself)", and `DECISION_LEDGER_OWNED_DECLS` as "the **fifteen**
  top-level declarations this feature introduces — all fifteen declared in
  `pdlc/workflows/orchestrate-dev.js` by a `[green]` task of batches 3–8".
- **T-18 (`PLAN`:158):** "**Add the frozen `DECISION_LEDGER_CENSUS_TOKENS` declaration to
  `pdlc/workflows/orchestrate-dev.js`** as a top-level constant holding T-11's six token strings …
  it is production code, not a test operand".
- **Ownership manifest (`PLAN`:207, `PLAN`:219):** T-11's test-file row explicitly *disclaims* the
  third operand ("`DECISION_LEDGER_CENSUS_TOKENS` is **not** a test-file constant"), and T-18's
  `orchestrate-dev.js` row *claims* it ("**and the `DECISION_LEDGER_CENSUS_TOKENS` declaration** — one
  member of `DECISION_LEDGER_OWNED_DECLS`").
- **Definition of Done (`PLAN`:489-497):** the partition is stated as
  "`DECISION_LEDGER_CENSUS_TOKENS` (**six** members) ∪ `DECISION_LEDGER_CENSUS_EXEMPT` (**nine**) =
  `DECISION_LEDGER_OWNED_DECLS` (**fifteen**)", with "All fifteen owned members are declarations in
  `orchestrate-dev.js`" and "`DECISION_LEDGER_CENSUS_TOKENS` is **production**, declared by T-18".

**What TSPEC now says.** §7.3's new *Where the three census constants live* paragraph:
"`DECISION_LEDGER_CENSUS_TOKENS`, `DECISION_LEDGER_CENSUS_EXEMPT` and `DECISION_LEDGER_OWNED_DECLS`
are declarations of the **census test file itself**, not of `orchestrate-dev.js`. That is why no
module-surface section declares them … so a test-file constant can **never** be a member of it, and
the census never scans the file the three are declared in." The exempt list's post-image drops
`DECISION_LEDGER_CENSUS_TOKENS` and closes: "The census constants themselves are absent from both
sub-sets because they are not module declarations at all." The owned enumeration's post-image drops
`DECISION_LEDGER_CENSUS_TOKENS` **and** the "the token strings live inside its own declaration"
rationale, which PLAN:152 quotes verbatim as the reason the member is *included*.

**Why this is High, and product-lens rather than technical taste.** PLAN's job is to be a faithful
compression of the approved upstream so an implementer can execute it without re-deriving the design.
On this clause it is now an anti-faithful compression in three concrete ways:

1. **It orders production code TSPEC forbids.** T-18 is a `[green]` row instructing a batch-8
   implementer to add a top-level constant to `orchestrate-dev.js`. TSPEC v1.0 says that constant
   belongs in `decisionLedgerCensus.test.js`. REQ NG-6's one-production-file discipline and BR-11's
   census both run through this file; an implementer following PLAN writes a declaration the spec
   does not sanction, and the ownership manifest — the artefact the wave gate reads — names T-18 as
   its owner.
2. **It makes T-11's own companion assertion red.** T-11 is instructed to assert set equality with a
   fifteen-member owned list containing `DECISION_LEDGER_CENSUS_TOKENS`. Under TSPEC v1.0 the owned
   list has fourteen members and excludes it. The two documents disagree about the *literal* a
   batch-2 implementer must freeze. This is the exact failure class the v0.5–v0.7 rounds spent three
   passes closing (unsatisfiable census tokens), re-opened from the upstream side.
3. **PLAN records the now-adopted resolution as rejected, with reasons.** `PLAN`:19: "TE's proposed
   alternative — dropping the member and restating the partition as six ∪ eight = fourteen — is
   **rejected** as the resolution: it would put the PLAN out of contract with the upstream it had
   just re-pinned". The erratum commit message states it "Adopted te-review's diagnosis". So the
   revision history now argues against the specification it is supposed to be downstream of. This is
   not a stale citation an implementer can route around — it is a written instruction to *not* do
   what TSPEC requires, and it will be read as authoritative by whoever hits the conflict mid-wave.

**Fix (four sentences, one direction, mirroring the v0.7 pass in reverse):** restate T-11's operands
so all three census constants are declarations of `decisionLedgerCensus.test.js` and the partition is
six ∪ eight = fourteen, with `DECISION_LEDGER_CENSUS_EXEMPT` holding the eight plumbing declarations
TSPEC v1.0 lists; delete T-18's "Add the frozen `DECISION_LEDGER_CENSUS_TOKENS` declaration to
`pdlc/workflows/orchestrate-dev.js`" instruction; swap the two manifest rows back so T-11's test-file
row owns all three constants and T-18's `orchestrate-dev.js` row claims none of them; and restate the
DoD bullet's partition arithmetic. The red-before-green justification in T-11 ("the two conjuncts …
are therefore satisfied at **T-18's** landing, not before") should go with it: under TSPEC v1.0 the
resolves-to-one and non-empty-slice conjuncts range only over module declarations, so T-11's
dependency on T-18 rests on the fourteen owned members alone, which is the ordinary batch-8 edge
already stated elsewhere in the row. The v0.7 revision-history paragraph should record the reversal
rather than the rejection, so the next reader is not left with two contradictory accounts.

### F-02 — stale version pins on the moved section (Low)

`PLAN`:152 and `PLAN`:492/`PLAN`:497 cite "TSPEC v0.9 §7.3" for the census contract. §7.3 is the one
section the erratum touched, so these pins now name a version whose text no longer exists. Fold the
re-pin into the F-01 edit; it is not separately gating.

## Batches

Confirmation scope by batch, so the revision pass knows what it may leave alone. The erratum touched
one TSPEC section, and exactly one requirement chain runs through it (BR-11 / REQ NG-4, the source
census).

| PLAN batch | Tasks | Touched by this confirmation? |
|---|---|---|
| 1–2 | T-00…T-12a | **Yes, one row.** T-11 (`[red]`, batch 2) carries the census operands and must be restated. Every other row in batches 1–2 — corpus enumeration, fixtures, config, recognition, render, bounds — is untouched by the erratum and stays approved. |
| 3–7 | T-13…T-17 | **No.** The six production greens' declarations are exactly the fourteen owned members TSPEC v1.0 keeps; nothing in their instructions moved. |
| 8 | T-18 | **Yes.** One instruction sentence to delete (the production `DECISION_LEDGER_CENSUS_TOKENS` declaration). The wiring, sentinel, `reviewLoop`/`reviewerPrompt` and delta-coverage content of the row is untouched. |
| 9–10 | T-19, T-20 | **No.** Documentation disclosure and the version bump are unaffected; the engine-disclosure and compat constraints I checked in earlier rounds still read correctly against upstream at HEAD. |

No batch boundary, dependency edge or task count needs to move to fix F-01 — the repair is prose at
four loci plus the revision history, all inside rows that already exist.

## Dependencies

Upstream state at dispatch, re-measured against the working tree at `531706abb`:

| Upstream | Hash at HEAD | Hash in my v7 approval | Moved? |
|---|---|---|---|
| REQ | `sha256:ce6b133f0c1d692f172f1753b4d17a075bf1f933827a34701b2ee69d0d3c7b7c` | same | No |
| FSPEC | `sha256:2bd5c3ef055fd39d2645482a97219c2d096b534a6bed0c55b99306d1735aed39` | same | No |
| TSPEC | `sha256:b1b603a86f1b5a801229bdc9911e9ab26e3dbb9f8f340d2393979084218d31a0` | `sha256:eef45ef32f0dd394e81abcf3aa5215fa54ba8dbbdc69f9d595c08feece0623c8` | **Yes** (`452d72c07`, v0.9 → v1.0) |
| DECISIONS | `sha256:13aba06127b4d392bdf71f93066dd7ed6cb626dadbc4dda54029ab80bb4fb89a` | same | No |

The erratum's own changelog states the same thing from the author's side — "Upstream is unmoved and
was re-measured at HEAD before this edit … nothing is absorbed and no pin advances" — so no REQ or
FSPEC acceptance criterion changed meaning, and no `DEC-DECLEDGER-*` was re-litigated. That bounds the
confirmation to the single §7.3 clause, and is why F-01 is the only finding rather than the opening of
a general re-review.

PLAN's own upstream pin (`PLAN`:19 and its §Verification citations) still reads TSPEC v0.9; see F-02.

## Verification

What I executed in the working tree on `feat-pdlc-decision-ledger`, so the finding rests on measured
facts rather than reading:

1. **PLAN bytes are genuinely unchanged.** `git log --oneline -- PLAN-pdlc-decision-ledger.md` shows
   `5ffa27135` as the newest commit touching the file — the same commit my v7 `REVIEWED-COMMIT`
   records. No PLAN edit has landed since the approval, so this is a pure cascade question.
2. **The erratum's post-image, not its commit message.** I read `git show 452d72c07` in full: 44
   insertions, 4 deletions, confined to the §7.3 census table plus the changelog, as claimed. The two
   deletions are the exempt-list row and the scanned-source row; both post-images drop
   `DECISION_LEDGER_CENSUS_TOKENS`, and the scanned-source row additionally drops the "(the token
   strings live inside its own declaration, so the census would otherwise red on its own literal)"
   parenthetical. I confirmed the dropped parenthetical is quoted verbatim inside `PLAN`:152 as the
   justification for the membership TSPEC has now removed — that is the sharpest single piece of
   evidence that PLAN is no longer a faithful compression.
3. **The count is checkable, and it moved.** TSPEC v1.0's owned enumeration is six functions
   (§4.1/§4.2/§4.4) plus §3.1's `DECISION_CORPUS_ARGV`, §3.2's `DECISION_HEADING_RE`, §4.1's
   `DECISION_LEDGER_DEFAULTS`, §4.3's `DECISION_LEDGER_PREAMBLE` and `DECISION_LEDGER_RULE_TEXT`, and
   §5.2's three catalogues = 6 + 8 = **fourteen**. PLAN:152 and PLAN:493 both say **fifteen**, and
   PLAN's exempt count says **nine** against TSPEC's **eight**. The disagreement is arithmetic, not
   interpretive.
4. **No module-surface section acquired the constant.** I checked that the erratum did not instead
   add `DECISION_LEDGER_CENSUS_TOKENS` to §5.2's frozen-catalogue table or to §4 — it did not; §5.2
   still lists only `DECISION_LEDGER_OMIT_REASONS`, `DECISION_LEDGER_CORPUS_OUTCOMES` and
   `DECISION_LEDGER_NOTICES`. So there is no reading on which PLAN's production home survives.
5. **REQ and FSPEC really are unmoved.** I hashed all four upstreams (table in §Dependencies) rather
   than trusting the changelog's assertion. REQ `ce6b133f…` matches the hash the dispatch supplied, so
   no acceptance criterion behind the census — BR-11, REQ NG-4, REQ NG-6 — has changed meaning. The
   product substance of my v7 approval (every P0/P1 criterion owning a task, the eighteen-AT and
   fourteen-failure-row coverage tables, nothing out of scope) is therefore undisturbed, and I did
   not re-derive it.
6. **The rest of the PLAN still cites live upstream text.** Spot-checking PLAN's other TSPEC-derived
   literals against HEAD: the four corpus byte literals (6,305 / 10,859 / 12,059 / 441) are unchanged
   by the erratum, as its changelog states and as the diff confirms; T-10a's `report.decisionLedger`
   grounding in §5.4 is untouched; the `decisionLedger`-is-not-a-token exclusion PLAN carries is still
   §7.3's position in the post-image. Only the census-constant home moved.

## Questions

| ID | Question |
|----|---------|
| Q-01 | My v7 Q-01 is now sharper rather than resolved: `PROPERTIES-pdlc-decision-ledger.md`:377-378 (PROP-INV-06/07) describes the token set as "set-equal to the module's decision-ledger exports" — a contract that was superseded at TSPEC v0.8, contradicted differently by PLAN v0.7, and superseded again by TSPEC v1.0. With the census clause having now changed direction twice, does the orchestrator intend PROPERTIES to be re-grounded on TSPEC v1.0 in the same pass that fixes PLAN? Two downstream documents describing the same census three different ways is the condition under which a batch-2 implementer picks whichever they read first. |
| Q-02 | Process, not product: my v7 raised the census-constant home as an `ERRATUM: TSPEC` route and PLAN v0.7 simultaneously argued in writing for the opposite resolution. The erratum then adopted the reviewer diagnosis without the PLAN's rejection reasoning being answered. Is there a channel by which a downstream document's *recorded rejection* of a proposed upstream fix reaches the erratum author before they edit? If not, this round is the second-cheapest possible version of that gap and worth one line in the post-mortem. |

## Positive Observations

- **The erratum picked the right resolution, and PLAN's repair is genuinely small.** I want to be
  clear that F-01 is not an argument that TSPEC chose wrongly. Homing the constant in the test file is
  the reading that matches the precedent (`ANCHOR_TOKENS` is a constant of
  `loopEconomicsAnchorGuard.test.js`, not of the module it scans), and it removes a manufactured
  production declaration whose only purpose was to make an exclusion rule true. It is the better
  product outcome under REQ NG-6, which wants the production diff minimal. The finding is about the
  documents disagreeing, not about which way they should agree.
- **The erratum bounded itself honestly.** "Sections touched: §7.3 and this changelog, nothing else",
  the four corpus literals restated as unchanged, and the upstream re-measured at HEAD with no pin
  advanced — all three claims hold under `git show`. A cascade confirmation is cheap to run precisely
  because the author stated the blast radius and the statement was true.
- **PLAN's v0.7 pass, though now pointed the wrong way, is exactly the shape that makes reversal
  cheap.** Because the v0.7 author wrote the same sentence at four named sites and recorded *why* the
  alternative was rejected, the reversal is a mechanical four-site edit with a known justification to
  invert. Had the claim been diffused through the document, this confirmation would have been a
  re-review instead. Keep that discipline.
- **Everything outside the census clause survived the cascade intact**, and it is the majority of the
  document: eighteen-of-eighteen AT coverage, fourteen-of-fourteen failure-row ownership, the batch
  and dependency graph, the anti-echo and set-equality commitments, and the scope disclaimers. No P0
  or P1 requirement lost its owning task.

## Recommendation

_pending_
