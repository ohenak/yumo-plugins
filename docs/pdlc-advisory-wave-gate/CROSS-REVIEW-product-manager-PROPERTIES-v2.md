# Cross-Review: product-manager — PROPERTIES (delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-advisory-wave-gate/PROPERTIES-pdlc-advisory-wave-gate.md
**Date:** 2026-08-20
**Iteration:** 2 (delta confirmation, erratum round — continuation of round 1)

## Overview

**Question answered.** Does the erratum delta resolve the five routed items without breaking what v1
approved, and is this PROPERTIES still a faithful compression of its upstream *at HEAD*? Answer:
**yes on both**, with two Low findings — neither gating, both inside text this round added.

**Re-grounding first (DEC-ERR-03).** All five upstream documents were re-hashed on disk before
reading the delta, and all five match the dispatch byte for byte: REQ `c62cfc35…`, FSPEC
`91ef2557…`, TSPEC `3fa21acf…`, DECISIONS `84deee10…`, PLAN `f7de7fcb…`. Nothing this document
cites has moved underneath it since round 1, so the confirmation reduces to: are the delta's new
claims true of that upstream, and did the edit disturb anything else?

**Delta measured.** `git diff 1e297117..HEAD` on the document: **26 insertions, 10 deletions**,
across exactly six sites — the v1.4 changelog row, PROP-ENV-13 (§C), PROP-REST-03 and PROP-REST-08
(§E), Fixtures hazard 2, the C-3 PLAN-home matrix rows for A6-13/A6-15, and §G-3's preamble plus a
new item 3. No property was added or removed; no category, oracle form or level assignment moved
except PROP-ENV-13's, which the round's own items required. The changelog's closing claim — "no
other property statement, category, level assignment, oracle form or PLAN home changed in this
round" — is true of the diff as measured.

**Round-1 findings, all three closed.**

| v1 finding | Disposition at HEAD |
|---|---|
| F-01 (Medium) — undecided `attempts` literal | **Closed.** The conjunct now reads `attempts` **unchanged**, sourced to FSPEC BR-15 and §3.3's flow table |
| F-02 (Medium) — Home vs. where PLAN mints the case | **Closed.** Home and the C-3 row move to the former-A6-13 red step; the un-minted run-level conjuncts are routed, not dropped |
| F-03 (Low) — E-34 untraced | **Closed.** PROP-REST-08's Traces cell carries `E-34` and its text names the observable |

The two items raised by se-review (the `attempts` literal, and PROP-REST-03 / hazard 2 over-asserting
against BR-9) are closed by the same edit; I re-checked both against upstream rather than taking the
changelog's word for it, and both check out — see the sections below.

## Properties

## Oracles

## Fixtures

## Delta-Confirmation Findings

## Verdict
