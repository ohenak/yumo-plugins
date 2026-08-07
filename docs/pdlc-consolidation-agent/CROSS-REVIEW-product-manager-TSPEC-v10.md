# Cross-Review: product-manager — TSPEC (delta re-review, round 10)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-consolidation-agent/TSPEC-pdlc-consolidation-agent.md
**Date:** 2026-08-07
**Iteration:** 10
**Scope:** Delta only — `569578d0..HEAD` (TSPEC v1.8 → **v2.0**, the marker release-form re-decision plus three repairs). Sections untouched by that diff were approved at v8/v9 and are not re-reviewed.

## Prior findings

| ID (v9) | Severity | Finding | Status |
|---|---|---|---|
| F-01 | Low | §12.2's closing paragraph still said both register gaps "now carry a `(no FSPEC AT)` case" after `AT-Q13` / `AT-R7` had landed | **Resolved.** The paragraph is re-cast into the past tense — "each **was** covered by a `(no FSPEC AT)` case … both errata have since landed … so no `(no FSPEC AT)` case remains for either" — and the principle it exists to state is preserved rather than deleted. The edit went further than I asked: §13.3's matching hand-off bullet, which still handed the PLAN the same two gaps as **open**, is re-cast the same way and now states in terms that the PLAN "should write the two cases as `AT-Q13` and `AT-R7`, and it must not re-raise either erratum". That was a second instance of the same defect that I did not catch at v9 |

Q-01 (v9) — the AT-M11 spelling divergence — is no longer a question; see E-1 below. Q-02 (the PLAN's `Version` pin at TSPEC 1.7) is unchanged in kind and now points at 2.0; still Phase P's follow-through, not a TSPEC defect.

## Delta verified

The delta is not a patch: it re-decides the marker's **release form** on FSPEC v11.3's answer and propagates the consequence through nine sections. Each item checked against the primary sources — the FSPEC register and the shipped code — not against the changelog's own summary.

| # | Change | Independent check | Sound |
|---|---|---|---|
| E-1 | §7.3 withdraws the empty release form and adopts FSPEC **BR-14a**: `releaseMarker` writes `RELEASED: {passId} {ISO-8601}` in place | `FSPEC:2585` reads exactly "released by an **in-place write** of `RELEASED: {passId} {ISO-8601}` — never by removing the file, which no seam can do — and a `RELEASED:` marker is taken like an absent one, at any age, with no reason code". The TSPEC transcribes it, does not paraphrase it. **The approved premise is genuinely untouched**, which is the load-bearing claim: §7.3's argument was "no seam can unlink" (verified again at HEAD — `runtime-adapter.js` ships `rtWriteFile:802`, `rtAppendFile:863`, `rtListFiles:905`, `rtGit:945` and no unlink), and a sentinel write needs no unlink either. What is withdrawn is the `file_empty ≡ absent` equivalence, which was a *consequence* of the empty form, not the premise | Yes |
| E-2 | `parseMarker` gains a `state` discriminant; `markerVerdict` maps `released` ⇒ `free` at **any** age, no reason code | `FSPEC:2679` **E-11b**: "Marker file carrying a `RELEASED:` line, of any age ⇒ taken like an absent file: the pass proceeds and records **no** reason code — a released marker is free, not stale". The TSPEC's added clause "neither the refusal arm nor the reclamation arm may fire" is the same obligation stated as two negatives, and it names AT-M11's two fixtures (seconds old / older than `staleLockMinutes`) as its oracle — which is `FSPEC:2119`'s fixture pair verbatim | Yes |
| E-3 | §7.3 decision 2 inverts: `present` reads `file_missing` **alone** as absent, so an empty marker is *truncated* and reclaims | `FSPEC:2678` **E-11**: empty "(a write that died mid-flush), or carrying a line that is neither `IN-PROGRESS:` nor `RELEASED:` ⇒ **reclaimed, not refused**; the abandoned id is reported `unknown`. Reachable because §4.1 releases by writing a `RELEASED:` sentinel and never by truncating". §10.3 row 4 (rows 4/4a collapsed) states both arms with that outcome and no narrowing clause. The probe contract still holds: `rtCheckFile` (`runtime-adapter.js:817-831`) returns `{ok:true}` / `file_empty` / `file_missing` as the TSPEC describes, and the double's trimmed-content branch is at `__tests__/helpers/seams.js:296-299` as cited | Yes |
| E-4 | The prod/double emptiness divergence is re-argued rather than dropped | §5.1's comment now says the divergence "cannot change a verdict: both replies are present, so both reach `markerVerdict` through `parseMarker` over the same text". Checked: `rtCheckFile` decides by `test -s` (`:823`), `fakeFs.checkFile` by trimmed content (`seams.js:298`) — so a single-newline marker is `{ok:true}` in production and `file_empty` under the double. Under the new decision 2 both are `present`, both read the same text, both parse to `null`, both reclaim. The divergence really is verdict-neutral now, where before it was neutral only because the states were unreachable | Yes |
| E-5 | The FSPEC narrowing, the erratum and the AT-M3 partial-coverage disclosure are all **withdrawn**, not deleted | The v1.8 raise is retained as a labelled decision record, and §13.3's bullet is re-cast to "decided upstream, absorbed here, nothing handed on". This is the correct disposition: the upstream answered, so re-routing would be the defect. Confirmed the answer exists — `FSPEC:436` reads "an absent file and a `RELEASED:` file are the same free state to §4.2", the exact quotation §7.3 attributes to §4.1 | Yes |
| E-6 | §12.3's AT-M3 row now claims **full** satisfiability; the AT-M11 divergence note is withdrawn | `FSPEC:2118` AT-M3 is now *two* fixtures — (a) present but empty, (b) a line that is neither verb — with `reclaimed-stale-lock` / id `unknown` on both, and names AT-M11 as its paired negative in the register's own words. The TSPEC's row transcribes that pairing. The oracle discipline holds: neither side is absence-only (an implementation that reclaims on every take fails AT-M11, one that never reclaims fails AT-M3), and both are asserted in one case because the pairing *is* the oracle | Yes |
| E-7 | §12.2's marker row inverted and retired into AT-M3/AT-M11; T-13 and the release-set row re-stated against the sentinel | The `(no FSPEC AT)` local case is gone and the ids it is folded into (`AT-M3`, `AT-M11`) were already assigned to `consolidationPass.test.js`, so §12.3's set equality is genuinely undisturbed — I re-ran it (below). The release-set row's observable moves from "last contents are the empty form" to "last contents match `RELEASED: {passId} {ISO-8601}`", and keeps its set-equality-over-`TERMINAL_STATUSES` oracle and its positive-control argument for the two negative rows unchanged | Yes |
| E-8 | §13.1 row 13 re-decided; the DECISIONS warrant re-stated | Row 13 now records (a) — the empty form — as **this document's own withdrawn decision**, withdrawn "on the FSPEC's answer, not on taste", and keeps (b) and (c) as live rejected alternatives with their original reasoning. Naming the losing side as one's own prior decision, with the trade the FSPEC actually resolved, is what makes the DECISIONS entry re-derivable rather than a bare assertion | Yes |
| E-9 | §12.2's `CLAUDE.md` ↔ manifest oracle names its one exclusion | This is the repair I would otherwise have raised as Medium. Checked at HEAD: `distribution-manifest.json` carries `rows[].id` = exactly `orchestrate-dev`, `orchestrate-queue`, `pdlc-cli` and **no row for itself**, while `CLAUDE.md:57-59` must keep advertising the manifest. Without the named exclusion the two sets are structurally unequal and the case is red on correct code. The exclusion is stated as an exclusion, the oracle stays **set equality in both directions**, and the drift it must catch (`pdlc-cli.mjs`, tracked and stamped and unadvertised — which containment would pass) is named. `pluginPath` really is `workflows/dist/…`, so the `pdlc/` prefix rule the row states is the right join | Yes |

**Set-equality re-run, both directions.** I re-extracted the `AT-…` token set from the FSPEC register and from §12.3's file table and diffed them: **99 ≡ 99, empty on both sides**. No id is unassigned and no file claims an id the register does not carry — so E-7's "undisturbed" claim is verified against the tables, not accepted from the prose.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
