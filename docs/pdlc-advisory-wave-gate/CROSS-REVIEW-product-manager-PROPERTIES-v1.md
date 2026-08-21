# Cross-Review: product-manager — PROPERTIES (delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-advisory-wave-gate/PROPERTIES-pdlc-advisory-wave-gate.md`
**Date:** 2026-08-20
**Iteration:** 1 (delta confirmation, erratum round Phase F)

## Overview

**What this round is.** A delta confirmation on an erratum edit to PROPERTIES. Every routed item was
reported ABSORBED against upstream HEAD, so nothing on the item list needed landing. Per DEC-ERR-03 the
scope is therefore the whole of this PROPERTIES measured against its upstream **at HEAD** — is it still a
faithful compression of REQ v1.15, FSPEC v1.6, TSPEC v1.11, DECISIONS and PLAN as they now read?

**Upstream re-grounded, not taken on trust.** All five dispatch hashes were recomputed against the working
tree and match byte for byte: REQ `c62cfc35…`, FSPEC `91ef2557…`, TSPEC `3fa21acf…`, DECISIONS `84deee10…`,
PLAN `f7de7fcb…`. The version numbers the edit now claims are the ones upstream carries: REQ header reads
`1.15`, FSPEC header `1.6`, TSPEC header `1.11`.

**The delta.** Commits `fa5d48b1`..`1e297117`, ten edits, all rooted in one upstream event: **OQ-7 is closed,
answered *no***. The edit retires five upstream-pending sites and restates them on the decided form —
PROP-REST-01 (domain + observation point as conjuncts), PROP-REST-03 (plain positive assertion, no
`test.todo`), new PROP-REST-10 (ordering), new PROP-ENV-13 (ignored-path-only repair), Oracle O-C, the
falsifiability close, Fixtures hazard 2, §G-2's known-soft bullet — plus coverage-matrix and PLAN-home rows.

**Verdict in one line.** The delta resolves the absorbed items and breaks nothing previously approved. Three
findings, none High: two Medium on the newly minted PROP-ENV-13 (one transcribed literal upstream does not
decide, one PLAN home PLAN does not mint) and one Low on a widened Scope line without a matching trace.

## Properties

Property-by-property against upstream at HEAD. Each row records what the property now claims and the upstream
text it must compress.

| Property | Claim after the delta | Upstream at HEAD | Faithful? |
|---|---|---|---|
| PROP-REST-01 | Map domain = tracked + **non-ignored** untracked, generated outputs included, ignored excluded **both sides**; observation point immediately after restoration and before the record carriers | REQ AC-5.1 (§REQ-AWG-05) states both, naming AC-6.1's record append, AC-6.2's escalation-log append and AC-5.2's queue-row write (M-WG-7) as excluded; FSPEC BR-9 states the same domain and observation point; TSPEC §5.2 cases 1 and 5 | Yes |
| PROP-REST-03 | Non-ignored untracked file **absent** after restore; `.gitignore`d file the wave added **present**, byte for byte; no `test.todo`; `clean -fdx` **fails** it | FSPEC BR-9 — ignored paths "outside restoration's reach — A6 never deletes or rewrites one"; REQ AC-5.1 — "operator files A6 never wrote and never restores over" (quoted verbatim, correctly); TSPEC §5.2 cases 3 and 4, case 4 marked "now a plain positive assertion, no longer upstream-pending" | Yes |
| PROP-REST-10 (new) | Map observed **before** all three carriers; ordering asserted, not only content; `restoreTreeSnapshot`'s sequence complete at `git reset --mixed {head}` | TSPEC §5.2 case 5 verbatim on the ordering and on "asserts the *ordering*, not only the content"; TSPEC §2.5 states the restore sequence "is therefore complete at `git reset --mixed`"; REQ AC-5.1 names all three carriers, so the third (queue row) is not an over-reach beyond FSPEC's two | Yes |
| PROP-ENV-13 (new) | Ignored-path-only repair ⇒ `producedPaths() === []`, `{ok:false}`, literal `post-action-verification-failed`, escalation entry, **one attempt consumed**, no re-gate appended after the anchor; plus a non-ignored positive control | TSPEC §3.3 `apply` row and §5.5's *Ignored-path-only repair* row carry every literal **except the attempt count**; §6 OQ-11 closed on the same decision | Partly — see F-01 |
| PROP-REST-02, -04…-09 | Unchanged by this edit | — | Unchanged, previously approved |

**Two things worth stating because they are the ones a re-grounding usually gets wrong.**

1. *The third carrier.* FSPEC BR-9 names only two carriers at the observation point ("before the record and
   escalation writes BR-13 requires"). PROP-REST-10 asserts three, adding AC-5.2's queue-row write. That is
   not the document inventing a conjunct: **REQ AC-5.1 at HEAD names all three explicitly**, and FSPEC E-23
   independently puts the `halted` queue-row rewrite on the halt path after restoration. The compression is
   of the REQ, which is the stronger source, and it is correct.
2. *The `.gitignore`d file asserted present "byte for byte".* FSPEC BR-9 also says "an ignored path the
   re-gate mutated is not a restoration defect", which on its face admits a mutated ignored path. No conflict:
   PROP-REST-03's fixture file is one **the wave added** and the re-gate does not touch, so byte-for-byte
   presence is exactly BR-9's "A6 never deletes or rewrites one". The property is not over-claiming.

**Traceability.** The coverage matrix rows the edit touched all check out: AC-3.4 gains PROP-ENV-13; AC-5.1
gains PROP-REST-10 (observation point); AC-5.2, AC-6.1 and AC-6.2 each gain PROP-REST-10 with the carrier
named; AT-05-1 gains PROP-REST-03 and -10; AT-06-1 gains PROP-REST-10. Every added trace is one upstream
supports. No property lost a trace.

## Oracles

**O-C's two new paragraphs are the load-bearing part of this delta, and they are sound.** The edit adds
PROP-REST-10 to O-C's title list and appends two paragraphs transcribing the decided conjuncts:

- *Domain.* "the fixture must carry a `.gitignore`d file the wave added and assert it **present** afterwards
  … an implementation that ran `clean -fdx` fails it." This is BR-9's decided boundary, and O-C states it as
  a **positive-presence** conjunct rather than the absence check the pending form invited — which is the right
  product reading: the operator's `.env` and `node_modules/` surviving is the user-visible promise, not an
  abstract exclusion rule.
- *Observation point.* "because all three carriers are files inside the tree, a map observed after them
  differs from the pre-A6 map by exactly the bytes BR-13 mandates, so a correct restore would read as red."
  This reasoning is FSPEC BR-9's own ("both carriers are files inside the tree, so an observation taken after
  them differs by exactly the bytes BR-13 mandates"), extended to the third carrier the REQ names. Correct.

**The falsifiability discipline survives the edit.** O-C's pre-existing rule — the fixture must contain
content the restore could plausibly get wrong, or the equality is vacuous — is untouched, and the new
paragraph tightens it in the right direction by ruling out a degenerate fixture: "A fixture whose only
generated output is `.gitignore`d tests nothing at all here (AT-05-2), so PROP-REST-02's rewritten path must
be a non-ignored one." That is FSPEC AT-05-2's own stated caveat ("whose generated output is `.gitignore`d
tests nothing here, since BR-9 puts it outside the map"), correctly propagated. This is the kind of
consequence a re-grounding usually drops; it did not.

**The weak-property close is now honest.** The falsifiability check previously listed three deliberately weak
properties; PROP-REST-03 is removed from that list with the reason stated inline ("its boundary was
upstream-pending on OQ-7, which is now closed"). PROP-REC-06 and PROP-NFR-03 remain, correctly — neither was
touched by OQ-7. §G-2's known-soft bullet is rewritten to match, and it goes further than it needed to by
recording the two consequences so they are not re-derived (`clean -fdx` fails PROP-REST-03; the ignored-path-
only refusal is decided, not awaiting OQ-7). TSPEC §6 OQ-9's status is quoted accurately — the TSPEC records
it as "Moot, and it never bound."

**Residue check.** No `test.todo`, `upstream-pending` or open-OQ-7 marker survives anywhere in the document
in a live (non-changelog) position. Grep confirms the only remaining mentions are the v1.3 changelog row and
the retrospective clauses in PROP-REST-03, O-C, Fixtures hazard 2 and §G-2 that explicitly say the pending
form is retired. DEC-ERR-01's anti-pattern is cleared, not relocated.

## Fixtures

**Hazard 2 is now a fixture specification rather than a pending-marker warning, and it is the right one.**
The rewritten hazard enumerates four file classes the real-repo restoration fixture must carry:

| Class | Assertion after restore | Upstream source |
|---|---|---|
| Tracked file the wave modified | restored to pre-A6 content | REQ AC-5.1, FSPEC BR-9, TSPEC §5.2 case 1 |
| **Non-ignored** untracked file the wave added | absent — "not merely reset" | TSPEC §5.2 case 3; FSPEC BR-9 ("a file the repair created that no pre-A6 entry covers is therefore absent afterwards, not merely reset") |
| `.gitignore`d file the wave added | still present, byte for byte | TSPEC §5.2 case 4; FSPEC BR-9; REQ AC-5.1 |
| Non-ignored generated output the re-run post-wave command rewrites over an already-dirty path | discriminates hash-map from `git status` | FSPEC AT-05-2 |

The fourth row carries the substitution warning ("Substituting an ignored path for that last one makes AT-05-2
vacuous, since BR-9 puts it outside the map"), which is the one way this fixture could silently stop testing
anything. Naming it is worth more than the property statement it supports.

**The `test.skip` guard reasoning is preserved, not discarded with the pending marker.** The hazard keeps
`orchestrate-dev.js`'s skip-guard regex `/\b(describe|test|it)\.skip\s*\(/` on the record while stating that
**no** case in A6-09 now ships with a pending marker of either kind. This matches PLAN's own handling: PLAN
v1.10 replaced A6-10's former-A6-09 `test.todo` with a live both-sides assertion and explicitly kept the
`.skip`-halt reasoning "since it still governs the file". The two documents agree.

**PLAN homes.** The PLAN-home matrix rows the edit touched: A6-09 gains PROP-REST-10 (PLAN A6-10's former-
A6-09 red step does mint the real-repo round trip at BR-9's observation point — verified in PLAN's task row),
and A6-15 gains PROP-ENV-13. The first is correct. The second is not: PLAN mints the ignored-path-only
refusal in **A6-14's former-A6-13 red step** (`apply` "returning `{ok:true}` iff `producedPaths()` is
non-empty (an empty set is `{ok:false}` ⇒ `post-action-verification-failed`, which is also the disposition for
a repair writing only `.gitignore`d paths — OQ-11)"), and A6-18's former-A6-15 red step — whose contents PLAN
enumerates at length — contains no such case. See F-02.

**Fixture-level consistency with PLAN is otherwise intact.** PLAN's AT-05-1 row reads "real-repo hash-map
oracle over tracked + non-ignored untracked paths, taken at BR-9's observation point; ignored-path case live
(OQ-7 closed), restoring one fails" — the same four-class fixture this document specifies, from the other
side. No divergence.

## Positive Observations

- **The re-grounding was done first and done properly.** All five upstream hashes recompute to the dispatch
  values, and the three version claims (REQ v1.15, FSPEC v1.6, TSPEC v1.11) match the upstream headers. The
  changelog row leads with the absorbed decision rather than the routed item, which is DEC-ERR-03's order.
- **Five pending sites retired together, not one at a time.** OQ-7's closure touched PROP-REST-01,
  PROP-REST-03, Oracle O-C, the falsifiability close, Fixtures hazard 2 and §G-2. All six moved in the same
  round. A partial retirement — the common failure — would have left the document self-contradicting.
- **The closure was used to find a gap, not just to delete markers.** PROP-ENV-13 gives TSPEC §5.5's
  ignored-path-only-repair row its first PROPERTIES home; that case previously had a TSPEC-assigned test and
  no property. Absorbing a decision and noticing the coverage hole it exposes is the better move.
- **PROP-ENV-13 ships with a positive control.** "an otherwise identical repair writing one **non-ignored**
  in-envelope path returns a non-empty `producedPaths()` and `{ok:true}`, so the refusal is pinned to the
  ignored-ness and not to the fixture being broken." Without it the refusal assertion passes on any broken
  fixture. This is the discipline AC-4.5 asks for, applied where no rule compelled it.
- **PROP-REST-10 asserts ordering rather than trusting the comparison.** A map that happens to match is not
  evidence the observation was taken at the right point; asserting each carrier's write follows the
  observation is what makes the AC-5.1 observation-point clause falsifiable at all.
- **The raised item was answered by verification, not by editing.** The lineage-header `Downstream` defect
  belongs to the REQ, not here; this document's `Downstream` row reads `IMPL` and its tests, and the REQ's row
  at HEAD already reads `FSPEC, TSPEC, PLAN, PROPERTIES (all in this directory)`. Recording "verified, not
  edited" is the right disposition and stops the item being re-raised.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Medium | delta | local | PROP-ENV-13 transcribes "one attempt must be consumed" as an expected value, but no upstream text decides the attempt count for a post-action `apply` refusal. TSPEC §3.3's `apply` row and §5.5's *Ignored-path-only repair* row enumerate the expected values (`producedPaths() === []`, `{ok:false}`, `post-action-verification-failed`, an escalation entry, a tree carried no further) and are silent on attempts; the nearest FSPEC rule points the other way — §3.3's flow table, step 5, reads "escalate with a refusal reason, **no attempt consumed**", and BR-15 puts `post-action-verification-failed` in that same refusal-reason set. A red test minted on this conjunct can fail an implementation that followed the spec. Fix: drop the conjunct, or route it to TSPEC/FSPEC as an erratum and cite the answer. | §C, PROP-ENV-13 |
| F-02 | Medium | delta | local | PROP-ENV-13's Home reads `advisoryWaveGate.test.js` (A6-15), and the PLAN-home matrix adds it to the A6-15 row, but PLAN at HEAD mints this case in **A6-14's former-A6-13 red step**, whose text names the ignored-path-only disposition and OQ-11 explicitly. PLAN's A6-18 row enumerates the former-A6-15 red step in full and contains no ignored-path-only case. A reader following the property to its stated owner finds no test. Fix: retarget the Home and the PLAN-home matrix row to A6-13/A6-14, or state which conjuncts are integration-level additions A6-15 must mint on top of A6-13's unit assertion. | §C PROP-ENV-13 Home; §"PLAN homes" A6-15 row |
| F-03 | Low | delta | local | Scope was widened from `E-01…E-33` to `E-01…E-34` to match FSPEC v1.6, but no property traces E-34 (capture cannot be taken at all). The behaviour is covered — PROP-REST-08 is exactly E-34's observable — so this is a missing trace, not a missing property. Fix: add `E-34` to PROP-REST-08's Traces cell. | §Scope; §E, PROP-REST-08 |

FINDING: Medium | delta | local | §C, PROP-ENV-13 | "one attempt must be consumed" is transcribed as an expected value, but TSPEC §3.3's `apply` row and §5.5's ignored-path-only row are silent on attempts and FSPEC §3.3's step-5 refusal row says refusals consume none — the literal is undecided upstream
FINDING: Medium | delta | local | §C PROP-ENV-13 Home and the PLAN-home matrix | the property is homed at A6-15, but PLAN mints the ignored-path-only refusal in A6-14's former-A6-13 red step; A6-18's former-A6-15 step contains no such case
FINDING: Low | delta | local | §Scope and §E PROP-REST-08 | Scope widened to E-01…E-34 without any property tracing E-34; PROP-REST-08 carries the behaviour but not the trace

## Recommendation

**Approved with minor changes**

The delta resolves the absorbed items and breaks nothing previously approved. OQ-7's closure is transcribed
faithfully at every one of the five sites that carried the pending form, the domain and observation point
match REQ AC-5.1 and FSPEC BR-9 word for word, and PROP-REST-10's ordering assertion is TSPEC §5.2 case 5
compressed without loss. No High finding; nothing here gates the round.

Two Medium findings sit entirely inside the newly minted PROP-ENV-13 — one expected value upstream does not
decide (F-01) and one PLAN home PLAN does not mint (F-02) — plus one Low missing trace (F-03). All three are
addressable in place and none touches a property statement, category, level assignment or oracle form that
was previously approved.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 1}
