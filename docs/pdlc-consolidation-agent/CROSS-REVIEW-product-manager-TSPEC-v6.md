# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-consolidation-agent/TSPEC-pdlc-consolidation-agent.md` (v1.6)
**Date:** 2026-08-06
**Iteration:** 6
**Scope:** Local (per-finding tags in the table)
**Delta base:** `9436e87` (the commit I reviewed at v5) → HEAD `c8c5760`; `git diff` over the document is 183 insertions / 27 deletions across §4 (`CheckReply`), §5.5, §7.3, §10.3, §10.4, §11.1, §11.2, §12.2, §12.3, §13.1 (row 13) and §13.3. Only changed sections are re-read.

## Prior findings — disposition

| v5 ID | Sev | Status | Evidence in the revision |
|---|---|---|---|
| F-17 | High | **Resolved, on all three axes I named** | I asked for (a) an explicit statement that FSPEC §4.2's fourth row's *empty* arm is not satisfiable under this release form, (b) correction of §10.3 row 4 and any §12 row still claiming AT-M3's truncated arm, and (c) the erratum. All three are present, and the FSPEC citations behind them hold at HEAD: `FSPEC-…:442` is verbatim "Marker present, unparseable **or empty (truncated write)** … treated as **stale and reclaimed**, recording `reclaimed-stale-lock` … `unknown`"; E-11 is at `:2594` ("Marker file truncated or unparseable ⇒ **reclaimed, not refused**"; the revision corrected my own `:2592` in its own commit, `c8c5760`); AT-M3's *Given* is at `:2038`; §4.1's lifetime row "Removed at step 16" is at `:415`. (a) §7.3 `:924-947` states it in the document's own idiom — "that half of it is unreachable", "The row is not narrowed or reinterpreted", and then the reason no layer can undo it (a released marker *is* an empty file; preserving the row would record `reclaimed-stale-lock` on **every** steady-state pass after the first, "a louder, more frequent falsehood than the one it prevents"). (b) §10.3 row 4 is now "Marker present and **non-empty**, unparseable" and a new row **4a** carries the empty arm with its actual outcome (`free`, pass proceeds, **no** `reclaimed-stale-lock`) and labels it a "deliberate, recorded narrowing" with the three FSPEC citations attached. §12.3's `consolidationPass.test.js` row now says AT-M3 "is owned here but is only partly satisfiable at this layer", names which arm the case asserts, and states that "a test written to the register's full *Given* would be red on correct code" — which is the sentence that stops a DoD reader from writing it. (c) §13.3 carries a full upstream section that puts the **product** question first — "what the durable log must witness when a pass dies mid-take" — and states the accepted residue in both halves (one class of pass death with no log trace; one permanent zero-byte lock per repo). §13.1 gains row 13 recording the decision with three rejected alternatives, and the reversibility list is widened from "1, 2, 4, 5, 6 and 11" to "1, 2, 4, 5, 6, 11 and 13" with the matching §13.3 DECISIONS entry. |
| F-18 | Medium | **Resolved, and by the oracle shape I asked for** | §12.2 gains a `(no FSPEC AT)` row for "release across the whole terminal-status set" (`:2319`) and §12.3 assigns it to `consolidationLifecycle.test.js` beside T-13, with the reason the two share a file (both hold the same observable — the write double's recorded history for the marker path — "so one file owns that oracle and the single-writer-per-file rule stays satisfiable"). The row is set-equality, not containment: "the table's key set is asserted set-equal to `TerminalStatus`, so deleting a status arm reds rather than passing on the survivors". The FSPEC obligation it transcribes checks out — §4.3's table is six rows at `FSPEC-…:460-465`, `promoted`/`promoted-degraded`/`no-op`/`failed` all "yes, at 16", `refused` (`:464`) and `skipped-cadence` (`:465`) both "**no**" on take and release. The row's own diagnosis of the existing coverage is right too: AT-M4 (`:2041`) and AT-M6 assert release on one `failed` fixture each, which is one member of a six-member set. And the two negative rows are paired rather than absence-only, explicitly — "`refused` and `skipped-cadence` must show **neither** write, which cannot pass vacuously because the four positive rows in the same table show both". The `failed` arm I named as the likely omission is named back in the row's own words. §13.3 records the PLAN consequence (item (v)): the lifecycle file now owes two cases and stays a single task per batch-safety rule 2. |
| F-19 | Low | **Resolved, and the divergence is recorded rather than merely dropped** | I offered two forms; the revision takes both. The `CheckReply` comment (`:256-262`) now states only the decision — "What §7.3 depends on is **ONLY** that BOTH `file_empty` and `file_missing` are treated as absent; nothing in this document reads WHICH reason came back, and no row asserts it" — and then records the boundary divergence beside it with both citations, which I re-verified at HEAD: `rtCheckFile`'s command is `test -f "$path" && test -s "$path"` (`runtime-adapter.js:823`), i.e. byte size, and `fakeFs.checkFile` is `String(self.files[path]).trim() === ""` (`__tests__/helpers/seams.js:298`), i.e. trimmed content. The comment closes with the reachability argument — the two agree on `""` and on a missing file, "which is the whole set of states this feature can produce (release writes `\"\"`)" — and with the instruction that makes it durable: "Do not build on the distinction between the two reasons." |

Q-12 and Q-13 are both answered. Q-12 asked whether the *operator-facing* consequence is a product judgement that belongs to the REQ/FSPEC author; §13.3's new upstream section frames the erratum exactly that way and refuses to settle it here ("the choice belongs to the REQ/FSPEC author and not to the adapter's verb set"), stating both defensible answers rather than the one this layer ships. Q-13 asked whether any operator-visible surface reads a permanently-present lock as "a pass is stuck"; §7.3 consequence (2) (`:963-968`) answers it surface by surface — `.gitignore`d by §3.3 (whose exact text is pinned at `:120`), so absent from every diff, PR and fresh-clone check; the only surface is a literal `ls docs/_decisions/`, "where a zero-byte `.consolidation-lock` means *free*, not *stuck*" — and closes the manual channel too (an operator deleting the file yields `file_missing`, the pass yields `file_empty`, §7.3 treats both as absent, "so the manual channel and the pass channel agree, and neither can wedge the cadence"). Both are answered where a later reader will hit the question, not only in the reply.

## Findings

_(filled below)_

## Questions

_(filled below)_

## Positive Observations

_(filled below)_

## Recommendation

_(filled below)_

## Verdict

_(filled below)_
