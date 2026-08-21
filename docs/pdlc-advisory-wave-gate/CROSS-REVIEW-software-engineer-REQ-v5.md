# Cross-Review: software-engineer — REQ (delta confirmation)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md (v1.15)
**Date:** 2026-08-20
**Iteration:** 5 (delta confirmation, erratum round Phase F)

## Problem / Context

I approved this REQ at v4. Since then one erratum edit landed across three commits
(`88c3554f`, `f3fbbc7b`, `0cef7148`), touching 15 lines and removing 7: the lineage header
(`Upstream`, `Cross-Reviews`, version/changelog), §6 AC-1.1, §6 AC-5.1, and §7 R-5. The routed list
carried one High (TE F-01, AC-5.1's carrier exclusion omitting AC-6.2), four Lows taken, and two
Lows explicitly not taken as inherited/nonlocal.

This round answers one question: does that delta land the routed items without breaking what v4
approved, and — per DEC-ERR-03 — is the document still a faithful compression of the upstream it
leans on, read at upstream's current bytes rather than at the version the REQ was written against.

## Goals

1. Confirm each routed item either landed in the bytes or is correctly recorded as not taken.
2. Re-read the upstream this REQ now cites — `docs/_constraints/pdlc-wave-gate-baseline.md` v1.2 and
   `docs/completed/pdlc-advisory-tier/REQ-pdlc-advisory-tier.md` — at HEAD, and verify every id and
   commit the delta newly pins is still said, and still said the same way, upstream.
3. Verify the edit broke nothing in the sections it did not target.

## Non-Goals

- Re-reviewing sections the erratum did not touch. Unchanged material approved at v4 stands.
- Re-litigating decisions this REQ already closed, or the two Lows dispositioned "not taken" —
  except where this round's own bytes changed the fact underneath one of them (see F-01).
- FSPEC/TSPEC/PLAN altitude material. Mechanism remains O-1's and TSPEC's.

## Constraints

Measured at HEAD, not recalled:

| # | Check | Result |
|---|---|---|
| 1 | `docs/completed/pdlc-advisory-tier/REQ-pdlc-advisory-tier.md` resolves | Present (26.7K). The `Upstream` row is now a reachable path. |
| 2 | Every upstream id this REQ cites exists at HEAD — AC-1.6, AC-2.2, AC-3.4, AC-3.6, AC-9.2, NFR-1, BL-01 | All seven resolve in the tier REQ (`:87`, `:109`, `:134`, `:148`, `:276`, `:321`, `:347`). Upstream is unchanged at v1.4 / 2026-08-03, so no withdrawal or re-anchoring happened under this REQ. |
| 3 | `11420461`, newly pinned by AC-1.1 and R-5, is what upstream says | Baseline v1.2 header: "§1–§2 at `c8aa22a4`; §3 at `1efb9a3b`; §4 at `11420461`". §4 states M-WG-8's five-member reading is "true at `c8aa22a4`, false at this base", and M-WG-13/M-WG-14 are the post-change readings. The pin is upstream's own word, at the right section, for the right facts. |
| 4 | Baseline version cited (`v1.2`) matches upstream's `Version` field | Yes — `1.2 · 2026-08-20`. |
| 5 | C-5's quoted thresholds match the hook | Exact: `pdlc/hooks/scripts/check-req-size.sh` `LINE_LIMIT=700`, `BYTE_LIMIT=61440`, `SOFT_LINE_LIMIT=630`, `SOFT_BYTE_LIMIT=55296`. |
| 6 | Document size after the edit | 676 lines / 54,803 bytes. Over the 630-line soft threshold, 24 lines under the hard ceiling, 493 bytes under the soft byte threshold. See F-01. |
| 7 | The `Cross-Reviews` claim | LEARNINGS `:10` enumerates the 116 harvested rounds as "all deleted in the harvest commit"; the twelve `CROSS-REVIEW-*` files now on the branch are post-harvest erratum rounds appearing in no LEARNINGS table. The rewritten row is accurate. |

## Acceptance Criteria

Item-by-item disposition of the routed list. "Landed" means I read the bytes at HEAD, not the
changelog's claim about them.

| Routed item | Raised by | Landed? | Evidence at HEAD |
|---|---|---|---|
| Low/delta/local — `Upstream` dropped the resolvable path | se-review (F-02), te-review (F-02) | Yes | Header row now reads `docs/completed/pdlc-advisory-tier/REQ-pdlc-advisory-tier.md` (the five-seam tier this extends) → **REQ**. Path resolves; the chain form is retained alongside it, so nothing v4 approved was lost. |
| Low/delta/local — `Cross-Reviews` over-claimed harvest | se-review (F-03) | Yes | Row now scopes harvest to "rounds through harvest … in `LEARNINGS-…`" and names the on-branch files as post-harvest erratum rounds "in no LEARNINGS table". Cross-checked against LEARNINGS `:10`; accurate. |
| **High**/delta/local — AC-5.1 carrier list omitted AC-6.2's `ESCALATIONS.md` append | te-review (F-01) | Yes | AC-5.1 now excludes "AC-6.1's record append, AC-6.2's escalation-log append, and AC-5.2's queue-row write (M-WG-7)". AC-6.2's Given ("any A6 escalation") is entailed by AC-5.1's Given (refusal, budget exhaustion, red re-gate), so the three carriers the run still owes are now the three the comparison excludes. The self-contradiction at run end is closed. |
| Low/delta/local — AC-1.1 / R-5 left the post-change reading on unpinned "HEAD" | te-review (F-03) | Yes | AC-1.1: "the post-change reading, at `11420461`, carries A6 (baseline v1.2 §4, M-WG-13)". R-5: "M-WG-13/M-WG-14 are the post-change ones, measured at `11420461`". Both agree with the baseline's `Verified at` row verbatim. |
| Low/inherited/nonlocal — C-5 soft-budget overage | se-review (F-04) | Not taken, correctly so | Recorded in the v1.15 changelog as inherited and nonlocal, dissolved by SE Q-02's relocation. I do not reopen it. This round's own bytes did change the numbers underneath it — filed fresh and narrowly as F-01. |
| Low/inherited/nonlocal — baseline `Cited by` row vs §6/§7 | te-review (F-04) | Not taken, correctly so | The defect is in upstream's bytes, not this REQ's; owner is the baseline file. Still open upstream — recorded as F-02 so it is not lost. |

Nothing outside the four targeted locations moved: `git diff c58fd61d..HEAD` is 15 insertions / 7
deletions, all inside the header, AC-1.1, AC-5.1 and R-5. No decision was reopened; no AC's Given,
Then, or trace list changed except AC-5.1's exclusion list and the two commit pins.

## Risks

- **The changelog stack is now the document's growth term.** Every erratum round adds ~8 lines and
  ~450 bytes of changelog and changes nothing else. At 676 lines / 54,803 bytes, the next round
  crosses the 55,296-byte soft threshold and the third crosses the 700-line hard ceiling — the hook
  would then block the write, on prose about edits rather than on requirements. This is a cost
  curve, not a defect in what the round said (F-01).
- **Upstream is quiet, so the DEC-ERR-03 exposure is currently low but unmonitored.** The tier REQ
  has not moved since 2026-08-03 and the baseline is at the version this REQ cites. The pins added
  this round (`11420461`) are correct precisely because upstream still says so; if the baseline is
  re-verified at a newer base, AC-1.1 and R-5 become the two sites that go stale first. The
  baseline's own "Re-verification" paragraph already states the rule, so no new obligation is needed.
- **The `Cross-Reviews` row's accuracy is time-dependent.** It is true of the twelve files on the
  branch today; a second harvest would falsify it silently. Low, and cheaper to fix at that harvest
  than to hedge now.

## Obligations

- **O-A (this REQ, before the next erratum round).** If another erratum round is dispatched against
  this document, collapse or drop superseded changelog blocks in the same edit, or land SE Q-02's
  relocation first. Do not add a fifth changelog block to a 676-line file without reclaiming lines.
- **O-B (baseline file, not this REQ).** `docs/_constraints/pdlc-wave-gate-baseline.md`'s `Cited by`
  row should read `(§1, §4, §5, §6, §7, §8)` with a version bump, since §6 AC-1.1 and §7 R-5 cite
  `M-WG-13`/`M-WG-14` from §4. Owner is the baseline's change control, not this document's author.
- No new obligation on the mechanism side. O-1 still owns the restoration mechanism; AC-5.1's
  exclusion list is a statement of what the comparison observes, not of how the tree is captured,
  so the High's fix stayed at requirements altitude.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Low | delta | local | This round's 8-line v1.15 changelog block took the document to 676 lines / 54,803 bytes against C-5's own 630-line / 55,296-byte soft budget — 493 bytes and 24 lines of hard-ceiling headroom left. At ~8 lines per erratum changelog, the next round breaches the soft byte threshold and the third trips the 700-line hard block in `check-req-size.sh`. The growth is entirely changelog, not requirements: collapse superseded blocks in the next edit, or land SE Q-02's relocation. Filed separately from the dispositioned SE F-04 overage because the numbers are this round's. | Lineage header, v1.15 changelog block, vs §5 C-5 |
| F-02 | Low | inherited | nonlocal | `docs/_constraints/pdlc-wave-gate-baseline.md`'s `Cited by` row records this REQ as citing the baseline from §1/§4/§5/§8, but §6 AC-1.1 and §7 R-5 cite `M-WG-13`/`M-WG-14` from §4 — and this round added a further §4-grounded pin at both sites. The defect is in upstream's bytes and its fix belongs to the baseline's change control (row + version bump), not to this REQ. Recorded so it is not lost with the erratum round. | Baseline `Cited by` row vs REQ §6 AC-1.1 / §7 R-5 |
| F-03 | Low | delta | local | AC-5.1's edit left ragged reflow — "…are excluded from / the comparison. So are paths / ignored by `.gitignore`…" wraps mid-clause across three short lines where the surrounding paragraph is filled to margin. Content is correct; only the fill is off. Reflow the paragraph on the next touch. | §6 REQ-AWG-05 AC-5.1 |

FINDING: Low | delta | local | Lineage header v1.15 changelog vs §5 C-5 | this round's changelog block took the document to 676 lines / 54,803 bytes against C-5's 630-line / 55,296-byte soft budget, leaving 493 bytes and 24 lines of hard-ceiling headroom; at ~8 lines per erratum round the next round breaches the soft byte threshold and the third trips the hard block — collapse superseded changelog blocks or land SE Q-02's relocation
FINDING: Low | inherited | nonlocal | baseline `Cited by` row vs REQ §6 AC-1.1 / §7 R-5 | upstream records this REQ as citing the baseline from §1/§4/§5/§8 only, while §6 and §7 cite `M-WG-13`/`M-WG-14` from §4; fix belongs to the baseline file's change control (row + version bump), not to this REQ
FINDING: Low | delta | local | §6 REQ-AWG-05 AC-5.1 | the edit left ragged mid-clause reflow ("excluded from / the comparison. So are paths / ignored by `.gitignore`") in an otherwise margin-filled paragraph; content correct, fill only

## Positive Observations

- The High landed exactly as it should have: AC-5.1 now names all three record carriers the run
  still owes at the observation point, and it did so by extending the exclusion list rather than by
  importing capture mechanics — the fix stayed at requirements altitude and left O-1 intact.
- The two commit pins are quoted from upstream's `Verified at` row rather than reasoned, and they
  attach to the right facts (`M-WG-13`/`M-WG-14` at §4, `M-WG-8` at `c8aa22a4`). This is the DC-02
  measured-fact discipline working as designed.
- The v1.15 changelog states both what was taken and what was **not**, with provenance and locality
  for the two declined items. That is what let this round confirm the declines instead of
  re-deriving them.
- The `Cross-Reviews` rewrite is a rare instance of a lineage row being made *less* tidy in order to
  be true. Verified against LEARNINGS `:10`; it earns its extra clause.

## Recommendation

**Approved with minor changes**

The delta resolves every routed item it took, declines the two inherited ones correctly, and breaks
nothing v4 approved. Upstream re-read at HEAD: the tier REQ is unchanged at v1.4 and all seven cited
ids resolve; the baseline is at the cited v1.2 and its `Verified at` row backs both new pins. The
document remains a faithful compression of its upstream. All three findings are Low; none gates.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 3}

APPROVAL-HASH: sha256:c62cfc35ac9e49f60f70226036a3381c1d08518f33d5454fbef062ced0611bf7
APPROVAL-HASH-NORMALIZED: sha256:c62cfc35ac9e49f60f70226036a3381c1d08518f33d5454fbef062ced0611bf7
REVIEWED-COMMIT: 0cef714887f1511a7e468236ba39bac6259d9fc5
