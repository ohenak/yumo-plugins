# Cross-Review: software-engineer — FSPEC (delta confirmation)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-stats/FSPEC-pdlc-stats.md` (v1.5)
**Upstream pinned:** `docs/pdlc-stats/REQ-pdlc-stats.md` v1.4 (sha256:60a516fb…, re-verified at HEAD)
**Date:** 2026-08-31
**Iteration:** 8 (targeted erratum delta confirmation)

## Overview

Targeted erratum delta confirmation carrying **two** routed items, both against §7.3: the entries
for REQ-STATS-09 (no-`docs/`-root) and REQ-STATS-07 (zero-state row) still described live
disagreements after REQ v1.4 had already landed both carve-outs.

**Both items land, the delta is faithful to REQ v1.4 at HEAD, and nothing previously approved
breaks.** I re-read the upstream text each touched site now leans on rather than trusting the
erratum's own account of it, and every quotation and paraphrase holds.

The edit did more than the two routed items asked, and this is the part worth stating plainly
because it is where a scope-widening erratum usually goes wrong. Re-grounding on REQ v1.4 found the
same staleness in §7.3's other three entries and at five sibling sites, and the author closed all of
them in one pass. I checked that widening on its merits rather than waving it through: **every one
of the three unrouted closures is independently correct against REQ v1.4**, so the wider sweep
removed stale text rather than inventing settlements the REQ does not carry (see §Business Rules).
A §7.3 left half-de-staled would have been the worse outcome — two entries reading as settled record
beside three claiming live disagreement, all five against the same REQ version.

The `Version` row moves 1.4 → 1.5, the `Upstream` row still pins REQ v1.4, and the REQ's own header
reads 1.4 — the pin and the pinned agree.

## Linked Requirements

Upstream re-verification. Each closure asserts something about REQ v1.4's text; I read each in the
current REQ rather than accepting the erratum's characterisation. `docs/pdlc-stats/REQ-pdlc-stats.md`
hashes to the dispatched `sha256:60a516fb…` at HEAD, so the text below is the pinned version.

| §7.3 entry | What the FSPEC now claims REQ v1.4 says | Upstream at HEAD | Verdict |
|---|---|---|---|
| E-4 (routed) | REQ-STATS-09's *Given* scopes itself to a present, readable `docs/` root and names a missing/unreadable root a root failure | REQ:227-228 — *"in a repository whose `docs/` root is present and readable — a missing or unreadable `docs/` root is not this criterion's case but a root failure"* | **Holds, verbatim** |
| E-5 (routed) | REQ-STATS-07 states a readable-but-empty directory "is not a gap but a normal row whose metrics report their zero states" | REQ:203-204 — quoted string present **word for word** | **Holds, verbatim** |
| E-2 (unrouted) | C-5 carves out post-mortem *discovery*; fidelity binds the `RESOLVED:` marker, not the listing | REQ:119-122 — *"Discovering which phases have a post-mortem is carved out… That listing is this REQ's own (REQ-STATS-05); fidelity binds the `RESOLVED:` marker, not the discovery"* | **Holds** |
| E-3 (unrouted) | REQ-STATS-03 names the `CROSS-REVIEW-{role}-REVIEW-v{N}.md` basenames and settles the label; a third bucket is an independent rule C-5 forbids | REQ:153-156 — criterion now names that exact basename form and says *"one label stands: a third bucket would be an independent rule C-5 forbids"* | **Holds** |
| E-1 (unrouted) | REQ v1.3/v1.4 scoped REQ-STATS-04/06's harvested predicates to the documented basename grammars | REQ:168-172 (REQ-STATS-04 names `CODE_REVIEW-{feature}-v{N}.md` and the version grammar explicitly); absorbed at FSPEC v1.4 and confirmed in round v7 | **Holds** |

The two routed items are quotations, not paraphrases, and both survive a literal string match. That
is the strongest form this check can take.

**C-5 consistency cross-check.** E-3's closure and C-5's closing sentence could have collided: C-5
(REQ:122-124) says fidelity binds *"the driver's per-file rejection reason, not its coarser aggregate
reject list: a basename it rejects as not a cross-review is not malformed here"*, while D-8/BR-06
report `CROSS-REVIEW-{role}-REVIEW-v{N}.md` as malformed. They do not collide. REQ-STATS-03 draws the
line at the prefix: a basename that **begins** `CROSS-REVIEW-` but fails the grammar is malformed; a
file *"not claiming that prefix — the feature's own REQ, LEARNINGS or POSTMORTEM"* is neither counted
nor called malformed. The `-REVIEW-v{N}` names claim the prefix, so malformed is the consistent
answer under both sentences. The FSPEC's D-8 rationale states exactly this and now cites the REQ's
decision rather than routing it upstream.

## Behavioral Flow

Nothing in the flow changed, and I verified that rather than assuming it. The diff is confined to a
single file (`git diff 09aeb067b..HEAD --stat -- docs/pdlc-stats/` → `FSPEC-pdlc-stats.md | 109 +++---`,
50 insertions / 59 deletions, no other document touched). §3.1's step table, §3.2's Flow B and §3.3's
JSON mode carry no changed lines.

The step-A row set (A1…A7) is byte-identical, so the ordering the erratum's own reasoning depends on
— A2 exiting on a root failure before A3 can resolve a feature, which is what makes D-9's root-failure
answer reachable at all — is unchanged and still stated where D-9 cites it.

## Business Rules

No business rule changed behaviour. Four rule sites were reworded (BR-06, BR-12, BR-27, plus §1's
fidelity anchor); in each the rule sentence stands and only the surrounding justification moved from
"we diverge and raised an erratum" to "the REQ carries the carve-out".

The claim most worth testing was the erratum's own *"**No behavioural change**: every rule, exit code
and acceptance test is unaltered."* A self-certification is exactly the sort of line that should not
be taken at face value, so I diffed for the load-bearing tokens:

- **Exit codes.** Every changed line mentioning `exit` is a reworded rationale. BR-27 still reads
  *"Fleet mode exits 0 whenever it produced its report; the only non-zero fleet exit is failure to
  read the `docs/` root itself."* EC-09's exit column still reads `1`. D-9's Decision column is
  untouched: *"A root failure: EC-09's message and `no_docs_root` error object, not EC-01's
  not-found."* Only D-9's *Question* column was re-tensed (v1.3's *Given* "appeared to demand"),
  which is the correct place to record that the question is now historical.
- **Enum surfaces.** `no_docs_root` and `unreadable_feature` both survive; BR-30's `reason` set is
  unchanged, and D-10 — the decision that added the third value — carries no diff at all.
- **Metric states.** `malformed`, `unmeasurable`, `harvested` and the zero-state row read the same.
  BR-27's narrowing is now grounded in REQ-STATS-07's own words instead of being flagged as a
  deliberate departure, which is the substantive improvement: the FSPEC no longer claims to depart
  from a criterion it in fact matches.

All twelve anchors the new §7.3 table cites (BR-06, BR-11, BR-12, BR-16, BR-27, BR-30, AT-12, AT-17,
AT-19, EC-09, D-8, D-9) resolve in the document — no citation points at a section that does not
exist, which is the failure mode a table rewritten in one pass invites.

## Edge Cases and Error Scenarios

EC-09 is the only edge-case row with a diff, and it is the routed E-4 item's landing site. The
behaviour column keeps every clause it had — stderr message in both modes naming the root and
whether it was absent or unreadable, `--json` stdout carrying BR-30's error object with `reason`
`no_docs_root`, fleet mode's only non-zero exit, and single-feature mode refusing to re-spell an
absent root as EC-01's not-found. The exit column still reads `1`.

What changed is the closing sentence. Before: *"That departs from REQ-STATS-09's Given, which sweeps
this case in; the departure is decided at D-9 and raised as an erratum (§7.3)."* After: *"REQ-STATS-09's
Given agrees: it scopes itself to a repository whose `docs/` root is present and readable, and names
a missing or unreadable root a root failure."* That is now a true statement about REQ:227-228 — I
matched it against the criterion — and it is the correct repair. A spec that claims to depart from
its upstream when it in fact agrees with it is a real defect, because the next reader has to
re-derive which document is stale before trusting either.

EC-10, EC-11 and EC-12 are unchanged, so the neighbouring rows an EC-09 rewrite could have disturbed
still read as approved.

## Acceptance Tests

No acceptance test changed — no `AT-*` definition carries a diff line. AT-19 (fleet zero-state row)
and AT-23/AT-24/AT-27 (not-found and root legs) are the tests that would have had to move had the
erratum altered behaviour, and none did. AT-12 and AT-17, cited by E-1, are likewise untouched.

The §2.1 coverage matrix is unchanged, including the REQ-STATS-09 row's *"AT-27 (root leg, per D-9)"*
annotation. That annotation still resolves: D-9 survives as a decision, only its framing moved. This
matters more than it looks — had the author "closed" E-4 by deleting D-9 as obsolete, the matrix
would have pointed at nothing. Keeping the decision and re-tensing its question is the right call,
since the decision is still the reason AT-27 has a root leg.

## Open Questions

None. Both routed items are discharged, no upstream text is misquoted, and §7.3 now routes nothing
upstream — consistent with REQ v1.4 being the settled version.

One observation, recorded as a positive rather than a finding: §7.3's heading reads *"Upstream errata
raised, not folded in — all closed"*, which is momentarily odd on its own. The section's first
paragraph resolves it immediately — the entries are *"kept as a record of what was raised and how it
settled"* — and preserving the raised-and-settled history is more useful to a later reader than
deleting the section outright would have been. Not worth a finding.

## Delta-Confirmation Findings

No findings.

## Positive Observations

- **The scope widening was audited, not assumed.** Closing three unrouted §7.3 entries alongside the
  two routed ones is the kind of move that usually earns a finding. Here each of the three is
  independently true against REQ v1.4, so the sweep deleted stale text rather than manufacturing
  settlements — and it left §7.3 internally consistent instead of half-de-staled against one REQ
  version.
- **The de-staling reached the sibling sites, not just the index.** §7.3 is where errata are listed,
  but BR-06, BR-12, BR-27, EC-09, §1's fidelity anchor and D-8/D-9 each carried their own copy of the
  stale framing. Fixing the table alone would have left six sites asserting live disagreements that
  no longer existed. Chasing every site in the same edit is what stops an erratum from needing a
  successor erratum.
- **Decisions were re-tensed, not deleted.** D-8 and D-9 survive with their Decision columns intact
  and their Question columns moved into the past. §2.1's *"AT-27 (root leg, per D-9)"* still
  resolves; deleting the decisions as obsolete would have orphaned that citation.
- **The corrected direction of the E-4/E-5 claims is the real gain.** The FSPEC previously described
  itself as deliberately departing from REQ-STATS-07 and REQ-STATS-09 while actually matching them.
  Both now read as agreement, which is what the upstream text says.

## Recommendation

**Approved**

Both routed items land. The delta is a faithful compression of REQ v1.4 as it reads at HEAD: the two
quoted criteria match word for word, the three unrouted closures are each independently supported,
and no rule, exit code, enum value or acceptance test moved. Nothing previously approved is broken —
the confined single-file diff, the intact A1…A7 flow, the unchanged EC/AT rows and the twelve
resolving anchors were each checked rather than inferred from the erratum's "no behavioural change"
self-certification.

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}
