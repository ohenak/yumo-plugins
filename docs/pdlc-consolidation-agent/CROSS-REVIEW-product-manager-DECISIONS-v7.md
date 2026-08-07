# Cross-Review: product-manager — DECISIONS

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-consolidation-agent/DECISIONS-pdlc-consolidation-agent.md`
**Date:** 2026-08-07
**Iteration:** 7
**Scope:** Local (per-finding tags in the table)

## Delta scope

Re-review of `01624628..HEAD` — eight document commits: `d5ed31a5` (§11.2 conjunct 4 item (i) takes
the invoking-tree bound from `TSPEC:1724`, TE F-01), `da869757` (§11.3 item 3 retired; the
credential-helper lane stated, TE F-02), `c9b710f9` + `d0265525` + `e7d7d865` (the DEC-CONS-07
two-halves supersession and its reconciliation through cost, testability, triggers, reversibility,
the §11.2 unasserted row and §10 — PM F-13), `8ae08458` (the supersession carried to the index,
heading, PLAN obligation and PROPERTIES bullet — PM F-14), `c42654f8` (sweep counts restated 11/14
and a recipe as wide as the claim — PM F-15, TE F-03), `50e28b23` (the Decision block flagged at the
point of reading; why the `_readFile` rejection outlived the empty payload).

I read my v6 cross-review, ran
`git diff 01624628..HEAD -- docs/pdlc-consolidation-agent/DECISIONS-pdlc-consolidation-agent.md`
(194 insertions, 79 deletions), and confined this pass to the changed spans plus my three open v6
findings.

Changed spans: §2's DEC-CONS-01 and DEC-CONS-07 index rows; §3's decision sentence and its
inbound-residual bullet; §9's heading, Decision preamble, both accepted-cost paragraphs, the
anchor-sweep note (rewritten into a five-bullet supersession), the `_readFile` rejected-alternative
bullet, Reversibility, Re-evaluation triggers and both Testability conjuncts; §10's closing
boundary paragraph; §11.1's DEC-CONS-04/07 obligation row; §11.2's conjunct 4 item (i), its
DEC-CONS-07 consequence bullet, the *unasserted* table's first two rows and the *Anchor provenance*
paragraph; §11.3's preamble and items 1 and 3. Everything else is untouched and not re-litigated.

## Prior findings — disposition

| Prior | Severity | Status | Evidence in the revision |
|---|---|---|---|
| F-13 | **High** | **Resolved, and past the remedy I asked for** | I asked for four things: extend the supersession to both halves, state that `present` is now `file_missing` alone, state that an empty marker is truncated and reclaims, and reconcile `DECISIONS:679` and `:685-687`. All four are done, and the entry goes further. The note now opens "**Both halves of the Decision are superseded, not one**" and **withdraws** the earlier claim by name ("that is withdrawn — it is exactly backwards about the probe"). The probe bullet quotes `TSPEC:987-988` verbatim; I re-resolved it — "the layer reads **`file_missing` alone as absent**, and treats `{ok:true}` and `file_empty` alike as **present**" — plus `TSPEC:1026` ("decision 2 above reads `file_missing` alone as absent") and §13.1 row 13 (`TSPEC:2590`). The consequence bullet states outright that the entry's *rejected* first alternative is the shipped behaviour and cites `TSPEC:1940` (§10.3 row 4: empty ⇒ `markerVerdict` ⇒ `reclaim`, `reclaimed-stale-lock`, id `unknown`) and `TSPEC:2640`. `DECISIONS:687` no longer says "zero-byte"; `:692` now reads "a **released** `.consolidation-lock` means free"; `:695-700` keeps the conclusion and replaces the mechanism with "released ⇒ a parseable `RELEASED:` line ⇒ **E-11b** ⇒ `free` at any age" (`TSPEC:1016-1018`, `:1040` — both resolve). Beyond the ask: Reversibility, the Re-evaluation triggers (two of three struck as answered/taken), both Testability conjuncts, §10's boundary paragraph and §11.2's *unasserted* row were reconciled in the same pass. |
| F-14 | **Medium** | **Resolved on all four surfaces I named** | (a) §2's index row now carries "**payload and probe both superseded** by `TSPEC:974-977` … and `TSPEC:987-988` … Write downstream work against the TSPEC form, never against this row's". (b) §9's heading is "… — **both halves superseded upstream** (`TSPEC:974-977`, `:987-988`)". (c) §11.1's obligation row no longer says "empty-vs-unparseable fixture pair"; it names the **four-fixture** case (`TSPEC:2640`) — AT-M3's `""` and neither-verb fixtures reclaim, AT-M11's two `RELEASED:` fixtures do not, at either age — and states explicitly that the ownership manifest is unchanged. (d) §11.2's DEC-CONS-07 bullet gained three lettered sub-points: the `RELEASED:` payload with the read-back conjunct (`TSPEC:998-1003`, `:2443`), `file_missing`-alone-as-absent, and the four-fixture pairing with the positive/negative argument. `50e28b23` also added the flag to the **Decision block itself**, which I had not asked for and which is where a reader who skips headings actually lands. |
| F-15 | Low | **Resolved, and the arithmetic is now right** | The paragraph publishes `grep -onE 'TSPEC[^ ]* ?§?[0-9.]*:[0-9]+(-[0-9]+)?'`, states that the narrower first-pass pattern "returned **40** of the **42** sites present at the sweep commit (`01624628`), missing exactly the two `TSPEC §7.1:806` sites", and adds "Re-run it after any TSPEC move — the site count is a function of the revision, not a constant." I ran both patterns against `git show 01624628:…`: narrow **40**, wide **42**, and `diff` of the two outputs shows exactly `444:TSPEC §7.1:806` and `489:TSPEC §7.1:806`. The counts also moved from "ten across twelve" to "**eleven** across **fourteen**", which is the correction I had *not* caught: counting occurrences in the pre-sweep file (`2566d28d`) gives 618×1, 1832×1, 1522×1, 1595-1601×2, 787-788×2, 117×**2**, 793-796×1, 962-966×1, 2522×1, 1325×1 = 13, plus the bare `:684` continuation = 14. My v6 verification of "twelve" was itself wrong by one; this revision found it. |
| Q-04 | — | **Answered upstream; retired** | I asked from v2 onward whether AC-4.2's `present (redacted)` path had any shipped mechanism. `TSPEC:1693-1698` picks one: the push stays on `_git` and carries `-c credential.helper=!f(){ echo username=x; echo password=$VAR; };f`, which `rtShellQuote` transports intact and `git` expands through its own shell one process below the transport. I verified `rtShellQuote` at `pdlc/workflows/runtime-adapter.js:667-669` (POSIX single-quote wrapping, total) and the rejected command-string-seam alternative at `TSPEC:1700-1704`. No open product question remains here. |
| Q-05 / Q-06 / Q-07 / Q-08 | — | Still open, still not findings | Carried forward. Q-08 is partly answered in practice — the author chose "annotate in place", thoroughly — but the structural question it asks is still live for the next document. |

All three v6 findings are resolved. The verdict turns on the new material.

## Verification of the changed sections

*(pending)*

## Findings

*(pending)*

## Questions

*(pending)*

## Positive Observations

*(pending)*

## Recommendation

*(pending)*

## Verdict

*(pending)*
