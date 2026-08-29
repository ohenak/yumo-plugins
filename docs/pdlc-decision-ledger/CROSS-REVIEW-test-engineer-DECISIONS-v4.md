# Cross-Review: test-engineer — DECISIONS

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/DECISIONS-pdlc-decision-ledger.md` (Version 1.4)
**Date:** 2026-08-28
**Iteration:** 4

Delta re-review. Last reviewed at commit `3c4b499c4` (v3, document at Version 1.2). Since then the
document moved across five commits — `ab8d64780`, `de61d3892`, `9d46108e0`, `416195bb2`,
`25a19ff88` — net +69/−15 lines, carrying two labelled extensions: **v1.3** (DEC-DECLEDGER-16, from
`POSTMORTEM-D` recommendation item 6) and **v1.4** (three passages re-grounded on TSPEC v0.7 now
that `ERR-2`'s propagation has landed).

I re-verified v3's single Medium at HEAD, ground-checked every new claim about upstream against the
TSPEC bytes on disk rather than against the document's own account of them, and scanned only the
changed hunks for new issues. Unchanged sections — DEC-DECLEDGER-01/-02, -04 through -09, -11, -14,
-15's mechanism, the untouched Decision rows, the Options arithmetic re-derived in v2 — are not
re-litigated.

**v3's Medium F-01 is resolved, and resolved in the stronger form.** The under-inclusive "those five
sites are the discharge list" enumeration is gone; the trigger row now names the discharge as
complete and re-purposes the list as the worked shape of a future one-pass re-measurement, including
the two sites v3 said were missing (§4.3's framing-budget argument, §7.3's assertions *and their
rationale*) plus §9.2's erratum record.

**Every new upstream claim checks out on disk.** TSPEC is at Version `0.7`
(`TSPEC-pdlc-decision-ledger.md:15`-frontmatter) pinned at REQ v1.9 / FSPEC v1.3
(`TSPEC:9`) with Baseline v1.2 (`TSPEC:40`); §3.6 computes `12500 − 1200 = 11,300` and ~4,995 bytes
of project-level headroom (`TSPEC:504-505`); `M-6b`'s 441 is at `TSPEC:514` and `TSPEC:540`;
`ERR-2` is recorded **RESOLVED upstream — REQ v1.8** at `TSPEC:1448`; and every surviving `8000` /
`8,000` mention is explicitly past-tensed as retired (`TSPEC:31`, `:45`, `:57`, `:59`, `:471-476`,
`:502`, `:558`, `:1449`, `:1452`). No `6,800` or `~495` survives anywhere in TSPEC. The
DEC-DECLEDGER-03/-13 re-grounding is likewise exact: `TSPEC:1049-1051` states the drop loop's
condition is one disjunction, that at 141 records **both** bounds are exceeded from the outset, and
that "It is the **byte** bound [that] sets the terminal survivor count" — which is what this
document's revised sentences now say, in the same terms and with no over-claim.

One new Medium enters, inside the new DEC-DECLEDGER-16: the provenance rule's stated predicate is
positional and undefined over prose-vs-assertion, so it cannot be applied as the mechanical
authoring check the decision exists to be — and applied literally it reds sound sites at HEAD.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Cross-Feature | **DEC-DECLEDGER-16's rule is stated positionally ("only on the larger side of an inequality") over a scope that includes prose, and in that form it is not the mechanical check the decision is for: it over-rejects sound sites and under-defines what "asserted" means.** Two concrete consequences at HEAD. (a) *Over-rejection.* `measured ≤ decision − ceiling` and `measured + ceiling ≤ decision` are the same claim — `10,859 ≤ 12,500 − 1,200` ⟺ `10,859 + 1,200 ≤ 12,500` — and both err in the safe direction (charging the full ceiling can only understate the margin, as `TSPEC:514` itself argues). The rule admits the first and forbids the second, because in the second the ceiling sits on the *smaller* side. TSPEC HEAD uses the forbidden form in exactly the place the rule was written to protect: `TSPEC:47` (`12,059 ≤ 12,500`), `TSPEC:513-514`, and D-10 at `TSPEC:1430` ("each half of `12,059 ≤ 12,500` is instead pinned where it is measurable"). A future author running this rule as a check would raise those as violations of an approved, sound document. The sound criterion is *directional*, not positional: a ceiling may enter a comparison only where substituting the true (smaller) drafted value preserves the claim — i.e. only where it overstates usage or understates margin — and never in an equality, where substitution breaks it. Stated that way the rule accepts `10,859 + 1,200 ≤ 12,500` and still refutes `10,859 + 1,200 = 12,059`, which is what the POSTMORTEM asked for. (b) *Undefined scope.* The Consequences row says the rule "binds assertions the same way it binds TSPEC prose", and the decision opens "every byte literal in TSPEC" — but the prohibition is worded against an "**asserted** equality". TSPEC HEAD carries `10,859 + 1,200 = 12,059` as descriptive prose at `TSPEC:66` and `TSPEC:558`, sound in context and correctly *not* asserted anywhere (`TSPEC:1074-1079` conjunct (5) states the omission explicitly). Under the prose-binding reading those two lines violate the rule; under the assertion-only reading they do not. A rule whose grep result depends on which reading you take cannot discharge its own re-evaluation trigger. Fix is local and mechanical: restate the prohibition directionally, and give it an explicit scope predicate — *assertions and pinned expected values, plus any prose stating a figure as a fact rather than recounting a retired one* — so that the check has one answer per site. | § Decision, DEC-DECLEDGER-16 (narrative + Decision row + PROPERTIES Consequences row) |

## Prior findings disposition

| Prior | Status | Evidence |
|-------|--------|----------|
| v3 F-01 (Medium) — "those five sites are the discharge list" under-enumerated the 8,000-based figures in TSPEC (§4.3's `TSPEC:630` framing-budget argument and §7.3's companion figures were unnamed) | **Resolved** | The DEC-DECLEDGER-10/-12 trigger row no longer asserts a closed five-site list. It records the re-measurement as **discharged** and re-states the list as the shape a future one-pass move takes: "§3.6's allowance and headroom arithmetic, §4.3's framing-budget argument, §7.3's shipped-default assertions and their rationale, D-10's restatement, and §9.2's erratum record". Both sites v3 named are now in it, and the completeness risk is retired at the root rather than patched: with `ERR-2` closed there is no stale figure left to enumerate. Verified at HEAD — no `6,800`, no `~495`, no untensed `8000` survives in TSPEC. |
| v3 Q-01 (carried from v2 Q-02) — is §7.3's frozen fixture captured at the Baseline's `Verified at` commit? | **Still open, still cheap** | Re-asked below as Q-01. `TSPEC:1067-1069` and `TSPEC:1096-1099` are precise that all four literals are hand-transcribed from the fixture and re-measured together at re-capture, which is most of the value; the one clause still missing is *which commit the fixture was captured at*. |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Carried, third time, and still a one-clause fix: DEC-DECLEDGER-13 pins 41 ids / 6,305 bytes "at the Baseline's commit" (`8c673a09f`). Is §7.3's frozen fixture captured at that same commit? If it was captured at another, the transcribed expected values and the pinned corpus are two artifacts that can drift apart silently, and every byte figure in this document inherits the discrepancy. This is a TSPEC-side statement, not a DECISIONS edit — noting it here only so it is not lost at the phase boundary. |
| Q-02 | DEC-DECLEDGER-16 is marked "Candidate for promotion to `docs/_constraints/DOMAIN-CONSTRAINTS.md` at consolidation". Is the promoted form intended to be the directional statement F-01 describes? If so, fixing the wording now costs nothing and saves the constraint from shipping in a form the next feature has to re-derive. |

## Positive Observations

- **The re-grounding says "closed" without deleting the record of it having been open.** The Context
  passage could have simply dropped the live-exception paragraph once TSPEC caught up; instead it
  keeps the episode in past tense and names what it leaves behind (DEC-DECLEDGER-16's rule and the
  one-pass trigger) rather than a standing divergence. That is the difference between a document a
  future reviewer can audit and one that merely looks consistent: the quote/derive split v3 praised
  is still legible, and now so is the moment it resolved.
- **The DEC-DECLEDGER-03/-13 correction removed a false mechanism claim, not just a stale number.**
  The prior text said `maxEntries` 70 "fires first and forces at least 71 omissions" — a staged
  reading of a loop that has no stages. The revision states the disjunction, that both bounds are
  exceeded from the outset, and that the *byte* bound sets the terminal survivor count, and then
  keeps the conclusion that actually matters for testability: `omitted[]` is non-empty by a wide
  margin at either default, so §7.3's conjunct cannot go vacuous. It replaced a wrong reason for a
  right conclusion with the right reason — the shape a reviewer wants, because the wrong reason was
  the part a test could have been built on.
- **DEC-DECLEDGER-16 generalises the defect class instead of the instance, and its Consequences row
  reaches the test author.** "A ceiling may not be a term in an asserted equality" refutes an entire
  family of expectations at authoring time; the PROPERTIES row then binds it where it bites — pinned
  expected values — which is precisely where the round-6/-7 halt would have been prevented. F-01 is
  about the predicate's wording, not about the decision being wrong to record: the decision is the
  right one and TSPEC §7.3's conjuncts (5)–(6) (`TSPEC:1074-1085`) already implement it correctly.
- **The trigger row is now honest about its own expiry.** "Kept here as the worked example of the
  shape a future one-pass re-measurement takes" is a durable statement; "one such re-measurement is
  outstanding now" was one that had to be maintained. The revision converts a maintenance obligation
  into reusable guidance without losing the enumeration.

## Recommendation

**Approved with minor changes**

No open High finding. v3's Medium is resolved at the root, and every claim the v1.3/v1.4 deltas make
about upstream state was verified against TSPEC HEAD's bytes rather than accepted from the prose —
version, pins, arithmetic, tensing and the §7.3 loop-condition reading all reconcile. The one new
Medium is a wording defect in a new rule's predicate: the rule's *intent* is correct and is already
correctly implemented upstream, but as written it is positional rather than directional and its
scope over prose is ambiguous, so it cannot be run as the mechanical check it was recorded to be.
That is recorded, not gating; it is best fixed before DEC-DECLEDGER-16 is promoted to
`DOMAIN-CONSTRAINTS.md`, which is why it carries `Cross-Feature` scope.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Section anchor | Description |
|----|----------|-----------|----------|----------------|-------------|
| F-01 | Medium | delta | local | § Decision, DEC-DECLEDGER-16 | The new provenance rule is stated positionally ("ceiling only on the larger side of an inequality") and over a scope that includes prose, so it over-rejects the equivalent sound form `10,859 + 1,200 ≤ 12,500` used at `TSPEC:47`, `TSPEC:513-514` and D-10 (`TSPEC:1430`), and is ambiguous about the descriptive prose equalities at `TSPEC:66` / `TSPEC:558`. Restate directionally (a ceiling may enter only where substituting the true smaller value preserves the claim) with an explicit assertion/pinned-value scope |

FINDING: Medium | delta | local | § Decision, DEC-DECLEDGER-16 provenance rule | positional "larger side of an inequality" predicate over-rejects the equivalent sound form `measured + ceiling ≤ bound` used at TSPEC:47/:513-514/:1430, and the prose-vs-assertion scope is undefined against TSPEC:66/:558 — restate directionally with an explicit scope predicate

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 0}
