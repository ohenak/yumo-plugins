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

## Fixtures

## Positive Observations

## Delta-Confirmation Findings

## Recommendation

## Verdict
