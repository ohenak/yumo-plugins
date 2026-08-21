# Cross-Review: test-engineer — DECISIONS (delta re-review)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/DECISIONS-pdlc-advisory-wave-gate.md` (v1.12)
**Date:** 2026-08-20
**Iteration:** 4

## Context

Iteration 3 was an upstream-cascade confirmation that returned **Needs revision** on one High
(`CROSS-REVIEW-test-engineer-DECISIONS-v3.md`): `DEC-A6-03` asserted, as a checked negative fact,
that the halt-message overwrite obligation "has not landed" upstream, when REQ v1.16 had already
landed it. The document has since moved v1.11 → v1.12 across three commits
(`5f35bd8f`, `a147c9cf`, `279d38a2`).

**Scope of this round.** Delta only. I read my v3 file, then diffed the document against the commit
I last reviewed:

```
git diff 3143290a..HEAD -- docs/pdlc-advisory-wave-gate/DECISIONS-pdlc-advisory-wave-gate.md
75 insertions(+), 22 deletions(-)
```

Four regions changed, and nothing else:

| Region | Change |
|---|---|
| Header `Upstream` cell (`:5`), version row (`:12`) | pins all three upstream hashes; v1.11 → v1.12 |
| v1.9 re-grounding note (`:42-45`) | hashes date-scoped as that round's observation, not a current pin |
| Revision note `On v1.12` (`:123-138`) | new paragraph recording the cascade round |
| `DEC-A6-03` Reversibility / gap paragraph / Re-evaluation triggers (`:372-419`) | the F-01 repair |
| `## Consequences` operator-remedy bullet (`:515-521`) | remedy is no longer record-only |

No decision moves: `DEC-A6-01`…`DEC-A6-04`'s `Decision`, `Constraints` and option tables are
byte-identical to v1.11, and `## Options Considered` is untouched — I confirmed this from the diff
hunk list, which contains no line inside those regions. My v2 findings F-08 (DEC-A6-02 cardinality
oracle) and F-09 (packed-set fixture count) remain open, accepted, non-gating and untouched; I do
not re-file them.

**Everything below is verified against the repository at HEAD, not against the document's own
citations.** Every hash in this review I recomputed; every upstream claim I re-ran the document's
own grep against.

## Options Considered

Two readings of the delta were open to me; I record both and why I took the first.

**A. Verify the repair by re-running the check that falsified the old text, then stop.** This is the
delta protocol applied literally: F-01 was a false negative claim about upstream, so the resolution
test is mechanical — does the new text match HEAD? Taken.

**B. Re-open the entry's substance because the routing landed.** Rejected. REQ v1.16 / FSPEC v1.7 /
TSPEC v1.15 ratify DEC-A6-03's remedy on the operator surface; none of them contests the ref's
wave-scoped shape, which is what the entry actually decides. Re-litigating a decision because its
*documentation of upstream* changed would be the inverse of the mistake I filed in v3.

**The verification I ran, and its result.** The repair replaces a negative claim with a
three-level positive one, so I checked each level rather than trusting the citation:

| Claim in v1.12 | Where I checked | Result |
|---|---|---|
| REQ v1.16 AC-6.3 lands the warning, citing this entry | `REQ:535` ("re-running this feature overwrites that capture"); changelog `REQ:23`; version row `REQ:18` = `1.16` | **holds** |
| FSPEC v1.7 BR-14 states the conjunct and names co-location as the observable | `FSPEC:249` — verbatim "a pointer in the halt report and the warning in a runbook does not satisfy it"; version row `FSPEC:12` = `1.7` | **holds** |
| `AT-06-4` conjunct (3) is its AT; `AT-06-4b` the negative arm | `FSPEC:477-478` (oracle asserts co-location and presence, never the capture's name), `FSPEC:481` (negative arm carries no overwrite warning) | **holds** |
| E-34 requires no warning, there being no capture to point at | `FSPEC:312` — "**no** overwrite warning, there being no capture to point at" | **holds** |
| TSPEC v1.15 §4.5 is no longer the closed four-literal halt set; adds a notice rendered by `renderSnapshotOverwriteNotice(snapshotRef)` into `notices` | `TSPEC:1428` (notice row), `TSPEC:1460` (named pure helper, exported, pushed through `advisoryNotice`), `TSPEC:1446` (`snapshotRef: null` suppresses the notice), `TSPEC:1530` (four shipped four-key set-equalities widened to five); version row `TSPEC:12` = `1.15` | **holds** |
| Emitted on every A6-touched halt with non-`null` `snapshotRef`, never when `null` | `TSPEC:1446`, `TSPEC:1942` (universal quantifier incl. the post-gate un-skip arm), `TSPEC:1943` | **holds** |
| At HEAD the conjunct has no property and no test | `grep -ci overwrit PROPERTIES` = **0**; `PROP-REC-05` (`PROPERTIES:180`) asserts diagnosis + root-cause class only; `grep -rn renderSnapshotOverwriteNotice pdlc/` = **no match** — the helper does not exist in `pdlc/workflows/` yet | **holds** |
| Header pins REQ `f97f4f66…`, FSPEC `d602c440…`, TSPEC `1f6ea486…` | `shasum -a 256` on all three at HEAD: `f97f4f660140…`, `d602c440fc9f…`, `1f6ea4869d10…` | **all three match** |

The three-hash pin is the part I most expected to drift, since it is the exact failure mode F-03
named. It does not drift: the document now pins a hash I can recompute, for each of the three
documents whose edits can falsify its claims.

## Decision

**All three v3 findings are resolved. No new High. Two new Low findings, neither gating.**

### F-01 (v3, High) — RESOLVED

The false negative claim is gone. `DEC-A6-03:377-397` now reads *"The gap this entry carried was
real and is now closed at the specification levels"* and states the split as three cited limbs
(REQ v1.16 AC-6.3, FSPEC v1.7 BR-14/AT-06-4/AT-06-4b/E-34, TSPEC v1.15 §4.5). Every limb verifies
at HEAD per the table above. Two things the repair did that I asked for and one it did better:

- The Re-evaluation trigger no longer advertises the routing as open. `:412-419` marks the
  halt-message trigger **fired at REQ v1.16 and spent**, and replaces it with a narrower one —
  *revisit if the conjunct is still unasserted by any property or test when Phase I closes*. That
  replacement trigger is **observable**, which is what my lens asks of a re-evaluation trigger: it
  is decidable by exactly the grep I ran (`overwrit` in PROPERTIES, `renderSnapshotOverwriteNotice`
  in `pdlc/workflows/`), so a monitor or a DoD sweep can fire it without judgement.
- It states HEAD, not the reviews' snapshot. Both reviewers caught only the REQ limb; the author
  re-grounded and found FSPEC v1.6 → v1.7 and TSPEC v1.11 → v1.15 had also landed it. I confirmed
  both version rows. A repair that resolved the finding *as filed* would have shipped a second
  stale sentence in the same place, one cascade later.

### F-02 (v3, Medium) — RESOLVED

`:399-410` records the specified-vs-asserted split explicitly, in the shape the document already
uses for DEC-A6-04's `waveBudgetPerRun: 0`, and — the part that matters in my lens — it transcribes
the **falsifiable oracle** rather than the obligation:

> The falsifiable half is **co-location**, not presence: the oracle asserts the ref pointer and the
> overwrite statement on the **same rendered report field**, and must go RED both when the warning
> is deleted and when it is emitted somewhere other than beside the pointer. An
> `expect(report).toContain(ref)` alone can fail neither.

Two RED conditions and a named non-oracle. That is a test author's instruction, not a wish. It also
agrees with the authoritative statement downstream of it (`TSPEC:1942`, which additionally supplies
the anti-echo rule: both halves matched by spec-side literals, never a constant imported from the
module under test).

### F-03 (v3, Low) — RESOLVED

`:5` pins all three upstream hashes and dates the pin; `:42-45` re-labels the v1.9 hashes as *"that
round's dated observation, not a current pin"*. I recomputed all three pinned hashes at HEAD and
all three match (see table above). The cell also states *why* it pins three rather than one, which
is the generalisation of the F-01 defect.

### New Low findings

Both sit inside changed lines, both are accuracy nits on claims about downstream state, and
neither changes a decision or an oracle. They are in `## Findings`.

## Consequences

**For the PROPERTIES author (the trigger this entry now points at).** DEC-A6-03's replacement
trigger is live *today*, not at Phase I close: at HEAD the AC-6.3 overwrite conjunct is specified
at three levels and asserted at none. Concretely, `PROPERTIES:387` traces AC-6.3 to `PROP-REC-05`
and `PROP-REST-08`; `PROP-REC-05` (`:180`) asserts only diagnosis + root-cause class, `PROP-REST-08`
(`:168`) is E-34's arm, and `grep -ci overwrit PROPERTIES` returns 0. The property owed is the
co-location one, in the shape `TSPEC:1942` pins: pick the one `notices` element matching
`refs/pdlc/a6-snapshot-{waveNum}` and assert `/overwrit/i` **on that same element**, plus
`PROP-REST-08`'s negative arm asserting neither predicate matches any notice when `snapshotRef` is
`null`. Two independent `toContain`s over separate strings cannot falsify a split and must not be
accepted as the oracle.

**One downstream observation, recorded not filed** (it is a defect of PROPERTIES, which is
*downstream* of this document, so it is neither an erratum nor a finding here): `PROP-REST-08`
(`PROPERTIES:168`) pins "§4.5's **four** fields" and transcribes four literals, while TSPEC v1.15
§4.5 is a **five**-key shape — `TSPEC:1530` states the four shipped four-key set-equalities "are
widened to five by the same task that widens the production `fields` object", and `TSPEC:1446` adds
`snapshotRef`. A `toEqual` set-equality fails on an extra key exactly as on a missing one, so
`PROP-REST-08` as written would go RED against the specified shape. This is the PROPERTIES round's
to fix, and it is the healthy consequence of the widening DEC-A6-03's routing caused — but the
DECISIONS entry is not wrong about it, because it never claims PROPERTIES is current.

**For harvest.** The durable lesson from v3 is now recorded inside the document itself
(`:132-138`), so it survives the cross-reviews' deletion: *a sentence of the form "X matches nothing
upstream" is a dated observation, not a decision, and must carry the upstream version it was checked
against and be re-checked on every cascade.* The author added a second clause worth keeping — where
such a claim is load-bearing, prefer the **specified-vs-asserted split** over a bare "nothing
anywhere", because the split degrades gracefully as routing lands one hop at a time. That is exactly
what saved this round: the split form was still true after two more upstream limbs landed, where the
bare form was false after one.

**For the DoD sweep.** `renderSnapshotOverwriteNotice` does not exist in `pdlc/workflows/` at HEAD
(`grep -rn renderSnapshotOverwriteNotice pdlc/` → no match), and neither
`advisoryWaveGate.test.js` nor `advisoryEscalationLog.test.js` inspects halt text for an overwrite
warning. The document says so, correctly. Nothing in this feature's implementation is claimed to
exist that does not.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
