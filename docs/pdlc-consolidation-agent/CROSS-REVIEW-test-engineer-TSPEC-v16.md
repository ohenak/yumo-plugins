# Cross-Review: test-engineer — TSPEC (delta, round 16)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-consolidation-agent/TSPEC-pdlc-consolidation-agent.md
**Date:** 2026-08-10
**Iteration:** 16
**Scope:** Local. Delta re-review of v2.6 only (`147d327b..HEAD`: TSPEC commits `e02d42b9`,
`9d20fdd0`, `1cf7c98f`, `d74d80d0`). v15 was *Needs revision* (1 High, 1 Low). This round
verifies the two v15 findings, re-grounds each new claim against HEAD, and scans only the
four changed sections (§7.1, §10.3, §10.4, §12.2/§12.3) for new issues.

## 1. Status of v15 findings

| # | Subject | Status | Evidence at HEAD |
|---|---|---|---|
| F-01 (High) | The all-unreadable pass's terminal status was absorbed into §10.4's *deliberately not handled* list with no §10.3 row and no §12 case | **Resolved**, and repaired in all four places the finding named. §10.3 gains **row 1b** (`TSPEC:2215`) keyed on the exact reachable condition (`enumerateCorpus` succeeds and returns ≥1 basename; `_readFile` ⇒ `null` for **every** one), terminating `no-op` with no reason code, carrying REQ's quiet-week discriminator (consumed empty **and** un-consolidated non-empty) and an explicit "not row 1a" clause. §10.4 (`:2251-2253`) now keeps only the residue — the entry re-offered until the operator fixes it — and states the corpus-wide consequence is *handled, not accepted*. §12.2 (`:2835`) adds the second fixture in the same case: two enumerated basenames, `_readFile` ⇒ `null` for both, asserting terminal status **exactly** `no-op` (named against `failed` and `refused`), an **empty** rendered pair, `\|un-consolidated\| = 2`, and both basenames named in the report body. §12.3 (`:2908`) records the second fixture and mints no id, so the file's assignment set and the set-equality claim are undisturbed. §7.1 promotes the report-body naming to its own numbered observable (3) and states the all-unreadable arm inline (`:1068-1073`) |
| F-02 (Low) | §12.2 conjunct (2) was containment-plus-absence, not set equality | **Resolved**. Conjunct (2) now reads *"the basename list rendered by `renderConsumedPair` is **set-equal to `{readable}`**"* with the "no third name" clause spelled and NFR-5's *exactly the consumed set* named as the reason (`:2835`) |

## 2. Grounding checks on the new material

Each mechanical claim the round added was re-measured against HEAD, not read off TSPEC prose.

| # | Claim | Source at HEAD | Result |
|---|---|---|---|
| 1 | REQ §4b decides `no-op` as AC-1.4's third cause, with no reason code | `REQ-pdlc-consolidation-agent.md:625-628` | **Confirmed** — *"That pass's terminal status is `no-op`" — AC-1.4's third cause … and no reason code is added either"* |
| 2 | The quiet-week discriminator is consumed-empty **and** un-consolidated-non-empty | `REQ:627-628` | **Confirmed**, transcribed rather than paraphrased |
| 3 | Row 1b's streak claim: consuming nothing advances the same streaks AC-1.4's first cause does, keyed on consumed-set emptiness and never on the `no-op` label | `REQ:455-456` (*"keyed on consumed-set emptiness, never on the `no-op` label"*), `REQ:480` (the `unmeasurable` streak, *"AC-1.4's first or third cause"*) | **Confirmed** — the row states the derived consequence, and REQ names the third cause in both streak populations |
| 4 | No register AT reaches AC-1.4's third cause; the map offers AT-K3, AT-L2, AT-F13, AT-R7 | `FSPEC-…:2370`; AT-R7's fixtures at `FSPEC:2164` (fixture (b) = all-duplicate-suppressed); `AT-P6`/`E-08` at `FSPEC:2129`, `:2699` (empty corpus / glob matches nothing) | **Confirmed** — the three ids named as reachable `no-op` fixtures resolve to AC-1.4's **second** and **first** causes exactly as claimed |
| 5 | Row 1a still terminates `failed` and says *"Never `no-op`"*, so 1b is a genuinely distinct row rather than a restatement | `TSPEC:2214` | **Confirmed**; the two rows are adjacent and their discriminator (*enumeration* failed vs. bodies unreadable) is stated on both |

## 3. Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **The mixed fixture is credited with a status assertion it is not told to make.** The all-unreadable fixture's closing sentences claim mutual control — *"this fixture keeps **the mixed one's status assertion** from passing on an implementation that terminates every unreadable-touching pass `failed`"* and *"**Both fixtures** pin the status against the terminal-status catalogue §6.4 freezes"* — but the mixed fixture's enumerated conjuncts are exactly (1) count, (2) set-equal pair, (3) report body: no terminal status among them. An implementer writing this case from the row as written produces a mixed fixture with no status assertion, and then half the claimed control does not exist — an implementation that terminates *any* pass touching an unreadable member as `failed` reds only on the all-unreadable fixture's status conjunct and greens the mixed one, which is the very confusion row 1a/1b was separated to prevent. Repair is one clause, not a new fixture: give the mixed fixture a fourth conjunct — terminal status is a **normal** one for a pass that did consume something (positively named, not `!= failed`) — and the sentence about mutual control becomes true as written. | §12.2, unreadable-corpus row (`:2835`) |
| F-02 | Low | Local | **Two citations of REQ §4b overshoot their passage.** §7.1 (`:1068-1069`) and §10.3 row 1b (`:2215`) both cite `REQ-…:625-631`; the decided text runs `625-628`, and `629-631` are a blank line, `## 5. Scope`, and a blank line. Harmless to a reader, but this document has spent three rounds repairing line anchors that drifted, and a range whose tail is a different section is the shape that drifts next. `625-628` is the measured range. | §7.1, §10.3 row 1b |

## 4. Questions

| ID | Question |
|----|---------|
| — | None. F-01 names the missing conjunct and F-02 the measured range; neither asks what was intended. |

## 5. Positive Observations

- **The repair landed where the behaviour lives, not where the finding was filed.** The round could
  have satisfied v15's F-01 by adding a §12.2 fixture alone; instead it moved the decision into §10.3
  as a routing row, cut §10.4 back to the part genuinely accepted, and renumbered §7.1's observables
  so the report-body obligation stopped hiding inside a sub-clause. The test case is then a
  consequence of the routing table rather than a patch beside it — which is the ordering that keeps a
  later edit to the behaviour from leaving the oracle stranded.
- **Row 1b defends against the specific wrong answer.** It names row 1a by number, states the
  discriminator in terms of what succeeded (enumeration) versus what failed (bodies), and carries the
  quiet-week test in enumerated values rather than in prose. The §12.2 fixture then pins the status
  *against* `failed` and `refused` by name. An implementer reaching for the adjacent branch reds on a
  conjunct that says so, rather than on a generic status mismatch.
- **The set-equality repair took the reason with it.** Conjunct (2) does not merely say "set-equal";
  it names NFR-5's *exactly the consumed set* and the implementation a containment oracle would have
  let through (one that names a basename the enumeration never returned). That is the form that
  survives a future reviewer who wonders why the weaker oracle was rejected.
- **The changelog raised the upstream cause rather than absorbing it.** FSPEC §5.3's *"two named
  causes"* is still at HEAD (`FSPEC-…:757-758`) against REQ's three; the round emitted an
  `ERRATUM: FSPEC` instead of quietly reconciling the count inside TSPEC. Re-emitted here.

## 6. Recommendation

**Approved with minor changes**

Both v15 findings are resolved, and resolved at the layer where the behaviour is decided rather than
patched at the oracle. Every mechanical claim the round added — the REQ decision, the quiet-week
discriminator, the streak keying, the four register ids that do *not* reach the third cause — was
re-measured against HEAD and holds. What remains is one Medium: the mixed fixture is described as
carrying a status assertion that its own conjunct list does not include, so the mutual-control claim
is half-true as written; one clause fixes it. F-02 is a line-range trim.

## 7. Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}
