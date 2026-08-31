# Cross-Review: test-engineer — FSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/FSPEC-pdlc-decision-ledger.md` (v1.4)
**Date:** 2026-08-31
**Iteration:** 6 (delta confirmation, not a full re-review)

## Overview

This is a **delta confirmation**, not a re-review. I approved this FSPEC at v1.3. The erratum edit
under confirmation is commit `75e8bca19` — 13 insertions, 2 deletions, all inside the front matter:
the upstream pin advances `REQ …md **v1.9**` → `**v1.10**`, the status row advances to
`1.4 | 2026-08-31`, and an eleven-line `**v1.4 erratum**` changelog paragraph is added. No `BR-`,
`E-`, `AT-`, `N-`, `O-` or `Q-` body text is touched.

Two questions decide this round, and per DEC-ERR-03 the second is in scope whether or not it appears
on the routed-item list:

1. **Does the delta land the routed items?** The routed item names stale `TSPEC v0.7` literals. I
   grepped this FSPEC for `v0\.7` / `TSPEC v`: the only hits are lines 20–21, inside the new
   changelog paragraph that *records the routing*. The live loci are in
   `DECISIONS-pdlc-decision-ledger.md` — `§ Context` (lines 36, 97–98) and the DEC-DECLEDGER-10/-12
   re-evaluation-trigger row (line 398). Those are se-author's, not this document's. The item is
   ABSORBED here in the only sense available: there was nothing in this spec to correct, and the
   disposition is now recorded rather than left implicit. This mirrors, byte-for-byte in shape, the
   disposition REQ v1.10 recorded against its own body.

2. **Is the document still a faithful compression of REQ at HEAD?** REQ is at v1.10,
   `sha256:9bc8bc32…`, which matches the hash in my dispatch, so I reviewed against the same bytes
   the orchestrator pinned. I re-read REQ §C-5, §5, §6 R-5 and §7 A-1 at HEAD and diffed them
   against every FSPEC site that leans on them. Details per section below. **The compression holds.**

## Linked Requirements

The traceability table (FSPEC lines 95–102) maps REQ-DECLEDGER-01…-08 to `BR-`, flow steps, `E-`
and `AT-` ids. The erratum touched none of it, and REQ v1.10's changelog names **no new `BR-`, `E-`,
`AC-` or vocabulary row** — I confirmed this by reading REQ lines 22–42 verbatim rather than trusting
the FSPEC's summary of them. The three round-9 items REQ v1.10 disposed of are:

- C-5's `maxBytes` slack rationale reworded (3,204-byte slack now described as covering the rendered
  index's per-line *and* block framing);
- the REQ's own *Cross-Reviews* header row corrected (v1–v6 → v7–v9 exist);
- a v1.9 note re-sited from `§1` to `§2` G-1.

None of the three mints, renames or retires an id. So every left-hand and right-hand cell of the
FSPEC traceability table still resolves at REQ v1.10. The one obligation REQ v1.10 explicitly
*re-affirms* as routed to this FSPEC — "AC-01's id-only expected-value basis stays routed to FSPEC,
as v1.7 recorded" — is discharged here and was discharged before this round: see **Acceptance
Tests** below.

## Behavioral Flow

The behavioral flow (§3.1–§3.3) is untouched by the delta. The one flow-adjacent literal the erratum
re-asserts is §3.1's defaults sentence — `enabled` `false`, `maxEntries` `70`, `maxBytes` `12500`
(FSPEC line 138). I checked each against REQ C-5 at HEAD (REQ lines 193–194): `maxEntries` `70`
derived from `M-6b` (63) / `M-6c` (clears by 7), `maxBytes` `12500` derived from `M-7b` (9,296
substance bytes over 63 records) / `M-7c`, both at Baseline **v1.2**. All three literals match. The
changelog's claim that "`maxEntries` `70` and `maxBytes` `12500` stand" is true at HEAD, not merely
asserted.

## Business Rules

The load-bearing check for this round sits here. REQ v1.10's *only* substantive rewording is C-5's
`maxBytes` slack rationale. The FSPEC changelog claims that rationale is one "**this spec never
recites**". A claim of non-recital is exactly the kind of assertion a delta confirmation must verify
rather than accept, because if it were false the spec would now carry a rationale REQ no longer
states in that form.

I grepped this FSPEC for `3,204` / `3204` / `framing` / `per-line` / `slack`: **zero hits in body
text.** The only `slack` hit is the changelog line asserting the non-recital. The claim is true.

What the FSPEC *does* carry is the bound's **scope**, at BR-12 (line 300): "`maxEntries` bounds the
number of rendered lines; `maxBytes` bounds the bytes of the index block as it appears in the prompt
— not its contribution to total dispatch size, and not the underlying records." REQ at HEAD
(lines 196–200) says: "`maxBytes` bounds **the rendered index text alone** — the index block as it
appears in the prompt, not its contribution to total dispatch size, nor the underlying records."
Same scope, same three exclusions, same order. BR-13's omit-whole-lines rule likewise matches REQ's
"whole lines are omitted rather than the dispatch being oversized or aborted, and no line is
truncated mid-line; which lines are omitted is TSPEC material (O-1)". Faithful, and — the point that
matters to me — still **testable as written**: BR-12 gives two independently falsifiable oracles
(line count, block byte count) over a named artifact, not a vague "stays within budget".

## Edge Cases and Error Scenarios

E-6/E-7/E-8 (FSPEC lines 342–348) are untouched. I re-checked E-7 against REQ's edge enumeration at
HEAD (REQ lines 305–311), because E-7 is the site the *previous* erratum (v1.3) moved and therefore
the site most exposed to a second-order break:

- REQ: "`maxEntries` of `0`, as zero in-scope decisions, not an error" — FSPEC E-7 states the same
  outcome for **either** bound resolving to `0`, and justifies the `maxBytes` axis via E-8-then-E-6
  (every line exceeds `0`). That is a strict superset of REQ's text, derived rather than invented,
  and REQ C-5 types both keys **non-negative**, which licenses it.
- REQ: "a single line alone exceeding `maxBytes`, omitted whole, never truncated mid-line, without
  aborting the rest" — FSPEC E-8 verbatim in substance.

E-7's closing clause, "stated for both so O-8's bounds property is total over either bound", is the
sentence I care about most as a reviewer: it is what makes the zero case a *property* obligation
rather than two example cases, and REQ v1.10 does nothing to undercut it. Totality survives the
delta.

## Acceptance Tests

REQ v1.10 re-affirms one obligation as routed **to this document**: AC-01's id-only expected-value
basis. So I verified the discharge rather than assuming the earlier approval still covers it.

FSPEC AT-01 (lines 363–373) fixes the expected value as `M-1d`'s 41 project-level ids **union the
single `M-2e` row for that dispatch's feature** — 4 for (a) `pdlc-advisory-wave-gate`, 7 for (b)
`pdlc-engineering-loop` — giving **45 and 48 lines**, both inside `maxEntries` `70`. The comparison
is pinned as "**equality of rendered lines, not containment and not equality over ids alone**", and
a named negative is attached: "a build rendering all 100 feature-level ids fails."

That is a determinate, falsifiable oracle, and it is precisely the *opposite* of an id-only basis —
the routed obligation is discharged, not deferred. The arithmetic still closes at HEAD: 45 and 48
are both under the `maxEntries` `70` that REQ C-5 still declares, so the erratum's pin advance does
not silently invalidate AT-01's own in-bounds claim. I re-derived this rather than trusting the
sentence.

Two supporting checks, both still green after the delta:

- **AT-03** ("derived fresh, not carried forward") keeps its negative — "a snapshot taken at the
  first dispatch and rendered again fails" — and keeps mutation confined to the frozen fixture copy,
  never the live repository.
- **AT-18** (an id in two files renders **exactly one** line) is a positive-count oracle, not an
  absence-only one.

FSPEC §7 A-1 (lines 571–573) still derives both defaults **by id** — `maxEntries` (70) from
`M-6b`/`M-6c`, `maxBytes` (12500) from `M-7b`/`M-7c` — matching REQ §7 A-1 at HEAD (REQ lines
399–400) clause for clause. The retired "`learningsInjection` analogy, not measured" claim stays
retired.

## Open Questions

No new open question. Q-1…Q-3 and O-1…O-8 are unchanged by the delta and were settled or routed in
earlier rounds.

One observation I am deliberately **not** filing as a finding, recorded so the next reviewer does
not re-derive it: the changelog sentence "this spec names no TSPEC version anywhere" now sits two
lines below a paragraph that itself contains the literal `TSPEC v0.7`. The claim is about the
spec's *body* — its pins, recitals and rules — not about the changelog paragraph recording the
routing decision, and REQ v1.10 uses the identical construction in its own changelog for the same
item. It is an established convention across this feature's documents, it is not ambiguous in
context, and it has no bearing on testability or on any oracle. Per DEC-DOC-01 this is a style nit,
not a finding, so it is not tagged and not counted.

Two REQ v1.10 items are Baseline-side or REQ-local and correctly do **not** propagate here: the
Baseline's *Cited by* list omitting `§6` R-5 / `§7` A-1 / `§7` O-6 (fixed in the Baseline itself,
no id moves), and the REQ's own *Cross-Reviews* header row correction.

## Positive Observations

- The erratum did the smallest correct thing. A pin advance plus a changelog entry, with an explicit
  argument for why nothing else follows, is exactly the right shape for a re-grounding round — and
  the argument is checkable, which is why I could check it.
- The changelog does not merely assert "nothing else changed"; it enumerates *what* moved upstream
  (C-5 rationale, Cross-Reviews row, re-sited note) and *why* each is inert here. That converted my
  confirmation from a re-read of the whole document into three targeted greps. This is a pattern
  worth keeping.
- The non-recital claim ("this spec never recites C-5's slack rationale") was true when tested. An
  erratum that claims a negative and survives the grep is a good erratum.
- AT-01's expected set is still one of the strongest acceptance tests in this feature: determinate
  cardinality (45 / 48), whole-line equality, and a named failing build.

## Recommendation

**Approved**

The delta lands the routed item (ABSORBED — the live loci are in `DECISIONS-…md`, correctly routed
to se-author, and the disposition is now recorded here), and the document remains a faithful
compression of REQ at HEAD `sha256:9bc8bc32…`. Nothing I previously approved is broken. No High,
Medium or Low finding.

## Delta-Confirmation Findings

No findings.

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}
