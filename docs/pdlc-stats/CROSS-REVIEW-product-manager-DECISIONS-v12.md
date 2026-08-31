# Cross-Review: product-manager — DECISIONS (erratum-round delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-stats/DECISIONS-pdlc-stats.md` (v1.7)
**Base reviewed v11:** `930d65c49d6c308b73f1084da19b852bafe08887` (document at v1.6)
**Upstream at this round:** REQ `sha256:f75c348f…` (v1.7) · FSPEC `sha256:a493133f…` (v1.8) · TSPEC `sha256:f32d9cb5…` (v1.8)
**Date:** 2026-08-31
**Iteration:** 12 (erratum round 8 — decision freeze in force)

## Context

**This round the document did move.** `git diff 930d65c4..HEAD -- docs/pdlc-stats/DECISIONS-pdlc-stats.md`
is +51/−7 across three commits — `39d7d46f7` (K-3), `82a2f8ec7` (site-table preamble), `f3ab46e72`
(changelog) — taking DECISIONS v1.6 → **v1.7**. Unlike v9–v11, which were pure upstream-cascade
confirmations over frozen bytes, this is a real, bounded edit, and it is an edit that answers
findings I raised. So my job has two halves: did the two things it changed land correctly, and did
the edit break anything that held at v1.6.

**What changed, precisely — three hunks, all bookkeeping.**

1. **K-3's *Upstream divergence* clause is retired** (`39d7d46f7`). Through v1.6 the row routed
   TSPEC §2.1's *six → seven* description of P9-02's title as *"an erratum owed upstream, not
   resolved here (TE F-05)"*. It now records the route as discharged: *"Upstream divergence resolved
   in TSPEC v1.7 — no longer owed (retires TE F-05, PM F-01)."* This is the exact repair my **F-01**
   asked for at v6–v11.
2. **The site-table preamble's transposition is corrected** (`82a2f8ec7`). *"Four hold the
   enumerations; five pin them"* → *"**Five** hold the enumerations; **four** pin them."*
3. **A v1.7 changelog entry is added, and the v1.6 entry is marked version-scoped** (`f3ab46e72`) —
   *"(Version-scoped: the pins in this entry state upstream as it stood at v1.6, not at HEAD…)"*,
   plus a matching supersession marker on the v1.5 entry's carried-unresolved paragraph. This is the
   answer to my **F-02**.

**Upstream moved too, and the changelog's pins reconcile.** I checked all three against the branch
rather than trusting the entry: TSPEC HEAD is `f32d9cb5…` (**v1.8**) ✔, FSPEC HEAD is `a493133f…`
(**v1.8**) ✔, REQ HEAD is `f75c348f…` (**v1.7**) ✔. All three match what the v1.7 entry states. The
long-running non-resolving TSPEC dispatch pin, carried as DEFERRED since v8, is *also* addressed —
not by a document edit, which could not fix it, but by being named as a workflow-side defect and
routed to harvest. That is the right disposition and I record it as closed from this document's side.

**No decision is opened, re-opened or re-litigated.** Every chosen option, the ten-site table's rows,
K-1…K-9's substance, the falsifier column and the standing-costs bullets are byte-identical. The
freeze held.
