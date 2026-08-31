# Cross-Review: software-engineer — PROPERTIES (upstream-cascade confirmation)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-stats/PROPERTIES-pdlc-stats.md`
**Date:** 2026-08-31
**Iteration:** 4 (upstream-cascade confirmation — PROPERTIES bytes unchanged)

## Overview

**Question this round answers, and only this one:** does PROPERTIES still hold against REQ as it now
stands? PROPERTIES' own bytes did not change — `shasum -a 256` over
`docs/pdlc-stats/PROPERTIES-pdlc-stats.md` at HEAD is
`7baf9b336f04c0e1848ff370878646f7c08f0ccccabf13eb8aaba312bbbecab6`, byte-identical to the
`APPROVAL-HASH:` recorded in my v3 approval. The upstream that moved is REQ.

**The upstream delta is exactly one commit.** Walking the blob hashes of `REQ-pdlc-stats.md` back
through its history: my v3 `UPSTREAM-STATE: REQ` pinned `5f3e80519b982f29…` (commit `1847dd9c0`,
v1.6); HEAD is `f75c348f299ebff8518b590f64668d054587c0c9d4d7ba442477e6fdfa7a8862`, matching this
dispatch's stated sha, and the only commit between them is `e12b78fd8` — "REQ v1.7 erratum — decide
REQ-STATS-06 out-of-catalogue basename as harvested". The other upstreams are unmoved: FSPEC at HEAD
is `c7d2c832dee586c8e371ec843c0809b167b65dbbeced4dd140934fe68d0ec63d`, identical to my v3
`UPSTREAM-STATE: FSPEC` pin and to this dispatch's sha.

**What the edit did.** It withdrew one clause from REQ-STATS-06. v1.6 read "The predicate is
set-membership over C-4's grammars, so a grammatical basename outside the driver's document-type
catalogue is a **survivor** even where REQ-STATS-03 reports it malformed." v1.7 replaces it with:
the predicate "is evaluated over exactly the file set whose bytes the process side sums," so an
unrecognised basename "contributes no process bytes and counts as no file of its family remaining: a
feature whose only `CROSS-REVIEW-` basenames are of that shape reports **harvested**." Plus the
version bump 1.6 → 1.7 and its changelog paragraph. Nothing else in REQ changed.

**This is the resolution of my own v3 F-02.** I raised that clause as an upstream defect and
explicitly declined to fold it into the PROPERTIES verdict, because REQ-STATS-06 v1.6 contradicted
FSPEC BR-16 v1.7 and inverted PROP-RATIO-08's fourth leg while PROP-RATIO-08 cited REQ-STATS-06 as
its authority. The erratum decided the dispute in the direction PROPERTIES, FSPEC and TSPEC §4.3 had
all independently taken. So the cascade question has an unusually clean answer: the upstream moved
**toward** this document, not away from it. I re-derived that below rather than assuming it — an
edit landing on your side can still land in different words, and the words are what PROPERTIES
compresses.

## Properties

## Oracles

## Fixtures

## Delta-Confirmation Findings

## Recommendation

## Verdict
