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

## Oracles

## Fixtures

## Positive Observations

## Delta-Confirmation Findings

## Recommendation

## Verdict
