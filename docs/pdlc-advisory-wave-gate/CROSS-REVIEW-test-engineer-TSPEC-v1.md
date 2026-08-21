# Cross-Review: test-engineer — TSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md (v1.11)
**Date:** 2026-08-20
**Iteration:** 1 (delta confirmation, erratum round)
**Delta under confirmation:** `b6eab7f1..HEAD` (6 commits, +67/-26)
**Upstream at dispatch:** REQ v1.15 `sha256:c62cfc35…`, FSPEC v1.6 `sha256:91ef2557…` — both re-hashed on disk and matching.

## Overview

The routed item list arrived empty — every item was reported ABSORBED against upstream HEAD — so
this confirmation is governed entirely by DEC-ERR-03: the question is not whether a list landed but
whether this TSPEC is still a faithful compression of REQ v1.15 and FSPEC v1.6 as they now read.

I re-hashed both upstream documents on disk before reading anything else. They match the dispatch
digests exactly, so the text I checked against is the text the orchestrator pinned.

The delta is a re-grounding round, and its shape is unusual in a way that matters for this lens:
nothing in the mechanism moved. Every edit converts a *conditional* into a *decided* statement.
Before this round, §2.5, §3.3, §5.2, §5.5, §5.6 and three OQ rows described the ignored-path
boundary as a TSPEC narrowing pending an upstream erratum, and instructed PLAN to mint red-test
tasks with expected values marked pending. Upstream has since decided that boundary — in this
document's favour — so the erratum flags are retired and the expected values are transcribed.

That is exactly the right disposition for the testing lens, and it is the one thing this round had
to get right: a test task whose expected value is "pending" is not yet a test. Six sections'
worth of pending markers becoming concrete assertions is a net gain in testability, and the one
genuinely new assertion the round adds (§5.2 case 5, the observation-point ordering oracle) closes
a gap that nothing in this document previously asserted at all.

## Architecture

## Interfaces

## Data Model

## Test Strategy

## Open Questions

## Delta-Confirmation Findings

## Verdict
