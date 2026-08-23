# Cross-Review: test-engineer — PLAN (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-wave-resume/PLAN-pdlc-wave-resume.md`
**Date:** 2026-08-23
**Iteration:** 4 (upstream-cascade confirmation, round 5 erratum on TSPEC)

## Overview

This is not a re-review of the PLAN. The PLAN's own bytes are unchanged since my v3 approval
(`git diff 485d62fa -- docs/pdlc-wave-resume/PLAN-pdlc-wave-resume.md` is empty). What changed is
the upstream I approved it against: TSPEC moved from v1.3 (`sha256:5ed76227…`, commit `03483136`)
to v1.4 (`sha256:4b5f7f5b…`) across nine commits in a round-5 erratum. The other three upstreams
are byte-identical to the versions recorded in my v3 `UPSTREAM-STATE` block — REQ
`sha256:17e83bfc…`, FSPEC `sha256:9a6be7b5…`, DECISIONS `sha256:37b3684d…` — so TSPEC is the whole
delta surface.

The one question: **does the PLAN still hold as a faithful compression of the TSPEC that now
stands?** Measured against the upstream text at HEAD, not against the routed-item list.

The erratum touched eight places. Seven of them the PLAN either already matched or never leaned on:

| TSPEC v1.4 change | Does the PLAN lean on it? |
|---|---|
| §5.7 generative run count pinned at `numRuns: 500` | **Already matched.** T-08 and §4.5's DoD line both carry `numRuns: 500` with the same `advisoryHelperProperties.test.js` precedent. TSPEC moved *toward* the PLAN here; the three documents now agree. |
| §3.1 / §6.1 DEC-WVR-06 interpolated-value count four → five | **Not carried.** The PLAN never states the count; it delegates the catalogue set-equality to T-02 by reference. No drift. |
| §2.4 exclusion column names the *first* conjunct as discriminating | **Not carried.** T-07 says only that the `is not a valid value` notice is left untouched and is "the one excluded notice, named in §2.4" — a pointer, not a restatement of the reasoning. Still true. |
| §5.2 H-1 restated as a reuse-and-consistency choice, not a harness limit | **Not carried as rationale.** T-07 and §3.1 describe H-1 mechanically (optional `events` array, additive, default-off). The PLAN never claimed the extension was forced. No drift. |
| §2.5 restated as ratification of FSPEC §3.4 | **Not carried.** The PLAN cites §3.4 only for the config literal and pathspecs, never for the write-site question. No drift. |
| §6.3 items 1–4 recorded as landed upstream | Bears on §3.4 / RK-2's "erratum this dispatch raises" wording — see F-03, inherited. |
| §5.4 AT-05 gains a write-side conjunct | **Carried by reference.** T-07 owns "every new integration case of TSPEC §5.4", AT-05 among them, and §4.1 maps AT-05 → T-07. The new conjunct arrives with the section. Good. |
| §5.5 three mutations → **five** | **Carried by enumeration, and now stale.** See F-01. |

That last row is the finding. The PLAN's §4.3 is not a pointer at TSPEC §5.5 — it is a
transcription of it into a task-ownership table, with a heading that states the count, a T-07 duty
line that states the range, and a DoD checkbox that states the count again. An enumeration is
exactly the kind of compression that breaks when the upstream grows, and this one broke.

One further drift comes from §5.8's disclosure of a fourth `c8.include` entry — see F-02.

## Batches

_(placeholder)_

## Dependencies

_(placeholder)_

## Verification

_(placeholder)_

## Findings

_(placeholder)_

## Delta-Confirmation Findings

_(placeholder)_

## Verdict

_(placeholder)_
