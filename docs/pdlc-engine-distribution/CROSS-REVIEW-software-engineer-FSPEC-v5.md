# Cross-Review: software-engineer — FSPEC (delta round 5)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/FSPEC-pdlc-engine-distribution.md` (v0.5)
**Date:** 2026-08-14
**Iteration:** 5
**Scope:** Delta re-review of `2f4b04f7..HEAD` (v0.5, commits `40c3ff91`…`7076e771`). My v4
findings F-01 (High), F-02 (Medium), F-03 (Low) were checked for resolution; only the changed
sections — the version row and 0.5 changelog, §1's ownership paragraph, §5.2's workflow-module
row and count paragraph, AT-3.8a and AT-3.8b — were scanned for new defects. Sections settled in
rounds 1–4 were not re-litigated.

## Prior findings disposition

| v4 ID | Severity | Resolved? | Evidence |
|---|---|---|---|
| F-01 | High | **Yes** | The self-contradiction is gone in both places. §5.2's workflow row now reads `named in TSPEC §5.4 (PK-20…PK-22)` with `[blocked on O-10]` deleted, and scopes O-10 to *how* the members arrive (BR-8.2) rather than *which* they are (`:507`). AT-3.8b drops its blocked marker and names the same three, citing §5.4's "and nothing else" (`:746-749`). Both match `TSPEC:421-429` verbatim in substance — the note there names PK-20/PK-21/PK-22 as the three `vendor/workflows/` rows and states "AT-3.8b is therefore writable" — so the FSPEC no longer contradicts the document `PLAN:131` already scheduled AT-3.8b's carrier against. `grep -n "O-10"` over the FSPEC now returns only BR-8.2 (`:541`), §9's parked-question prose (`:64`, `:839`) and changelog history; no live blocker remains on the packed set |
| F-02 | Medium | **Yes** | Settled in one sentence, as recommended: "**AT-3.8a is the authoritative whole-set assertion**; AT-3.8b a sub-assertion over one class, not a competing expected side" (`:743-745`). The two carriers `PLAN:131` (T11) and T16 can no longer be read as owning rival expected sides |
| F-03 | Low | **Routed, not fixed here** | Correct disposition: the count is FSPEC's to state and the reciprocal co-change sentence is TSPEC's to carry, so the 0.5 changelog routes it upstream (`:22-23`) rather than asserting an obligation on another document's behalf. Re-emitted below as an erratum against TSPEC so the routing actually lands |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **The new per-class conjunct is not mechanically derivable from the source the verifier transcribes.** AT-3.8a now asserts the count "equals §5.2's … and §5.2's per-class counts" (`:733-734`), and the count conjunct is asserted against the transcribed `PK-*` list (`:735-739`). But the transcription is a flat list of paths, and the class partition exists only in §5.2's Class column: five of the seven rows anchor to `PK-*` ids (manifest names the file literally; README `PK-2`, licence `PK-3`, install script `PK-23`, workflows `PK-20`…`PK-22`), while **CLI entry** and **Engine modules** say only "named in TSPEC §5.4" with no ids (`:503-504`). TSPEC's own arithmetic partitions differently — "four manifest-adjacent and `bin/` members (PK-1, PK-2, PK-4, PK-4b), fifteen `lib/*.mjs` (PK-5…PK-19), three vendored (PK-20…PK-22) and `scripts/postinstall.mjs`" (`TSPEC:386-389`) — i.e. 4+15+3+1, against §5.2's 1+1+2+15+3+1. Both total 23, but the two partitions are not the same partition, so an implementer writing the per-class assertion has to *invent* the PK→class mapping. The remedy is two cells: add `(PK-4, PK-4b)` to the CLI-entry row and `(PK-5…PK-19)` to the engine-modules row, matching the form the other five rows already use. Then each class's expected count is a literal sub-list of the transcription and the conjunct is writable without inference | §5.2 (`:503-504`, `:510-511`), AT-3.8a (`:733-739`), `TSPEC:386-389` |
| F-02 | Medium | Local | **The CLI-entry row's ownership sentence is now stale against the paragraph three lines below it.** The row still reads "how many files carry that entry is a decomposition question TSPEC §5.4 decides, **not this document**" (`:503`), while the count paragraph fixes "CLI entry 2" (`:510`) and §1 states this document owns "member *counts, per class and in total*" with "a change to any class's cardinality moves both sides together" (`:57-59`). There is a reading that reconciles them — TSPEC *decides* the decomposition, the FSPEC *records* its cardinality as the change-control point — and §1 all but says it. But the row as written denies exactly the ownership the new conjunct rests on, and it is the only class row that does. One clause fixes it: "…TSPEC §5.4 decides; this document records the resulting count (2) as the change-control point." Left alone, an implementer or a future author can justify moving `bin/` from two files to one or three without an FSPEC edit, which is the single failure mode the per-class count was added to prevent | §5.2 (`:503`, `:509-511`), §1 (`:57-59`) |
| F-03 | Low | Local | **The count conjunct's subject and object are ambiguous as phrased.** "The count conjunct is asserted against the **transcribed** `PK-*` list, never the tarball's own length" (`:735-736`) reads on first pass as *tarball length vs transcription length*, which is the tautology the sentence goes on to disclaim. The intended assertion is the opposite orientation — `len(transcribed list)` (and each class's slice of it) against §5.2's literal 23/24 and per-class numbers — and the trailing clause "against the transcription it fails when the transcription has drifted from §5.2" confirms it. Stating it in that direction once ("the transcribed list's length, and each class's slice of it, must equal §5.2's numbers") removes the re-read. The underlying reasoning is right and worth keeping: it is the only conjunct that can catch a transcription that drifted from the FSPEC while remaining internally consistent with the tarball | AT-3.8a (`:735-739`) |
| F-04 | Low | Local | **The workflow-module class holds a member that is not a module.** `PK-22` is `vendor/workflows/VENDOR-MANIFEST.json` (`TSPEC:357`), so the class named "Workflow modules" with count 3, and AT-3.8b's "its workflow **modules** are enumerated" (`:746-747`), both include a JSON manifest. TSPEC's own phrasing is more careful — "three vendored workflow **members**" (`TSPEC:388`). No behavioural consequence: the enumeration scope is "everything under `vendor/workflows/`" either way. But a verifier who takes "modules" literally enumerates `*.js` and gets 2, then reports a count mismatch against a correct package. "Workflow members" in the class title and in AT-3.8b costs two words | §5.2 (`:507`), AT-3.8b (`:746-748`), `TSPEC:355-357`, `TSPEC:388` |

## Questions

| ID | Question |
|----|---------|
| Q-01 | §5.2's exclusion of the test corpus now cites TE round-4 Q-02 and says "which mechanism achieves it is the TSPEC's" (`:526-528`). Is that mechanism in fact settled by `TSPEC:346-358`'s explicit `files` entries — i.e. an allow-list packs `__tests__/` out by construction, with no exclusion mechanism needed at all? If so the row could state the reason positively rather than deferring it, which would close my round-4 Q-01 as well |

## Positive Observations

- The v4 High is fixed in the structurally right place rather than the cheap one. Nothing was
  copied into the FSPEC: the workflow row delegates *names* to `PK-20`…`PK-22` in exactly the
  form its five sibling rows use, and the O-10 dependency was **re-scoped** rather than deleted —
  it still blocks BR-8.2's *how the members get inside the package*, which is genuinely open, and
  no longer blocks *which members exist*, which `TSPEC:421-429` closed. That distinction is the
  whole finding, and the edit states it in one clause.
- Per-class counts are a real strengthening, not a cosmetic response to the round-4 feedback, and
  the document says why in a sentence I could not have written better: a total alone "is invariant
  under a swap merging one `lib/*.mjs` while splitting a `bin/` entry" (`:512-513`). That is a
  concrete, checkable failure the previous version would have passed.
- The rename-vs-cardinality split (`:58-59`, `:513-515`) resolves the co-change rule's one real
  cost. Renames are the common case and now cost no FSPEC round; only cardinality changes — the
  rare, genuinely spec-visible kind — force both sides to move. This is the version of the rule
  that will survive contact with implementation.
- Every cross-document and code citation added by this edit checks out against the tree, not
  memory: `pdlc/engine/lib/run.mjs:52-55` does reach the workflow modules by relative URL outside
  the package root; `pdlc/engine/lib/` holds exactly twelve `.mjs` modules at HEAD, so the
  engine-modules count of 15 is V-03's twelve plus §3.1's three; `TSPEC:386-389` carries the same
  23-before-N-2 / 24-after arithmetic; `TSPEC:355-357` assigns PK-20…PK-22 to the three
  `vendor/workflows/` rows. The 0.5 changelog's claim about what it changed matches the diff.
- The anti-tautology reasoning behind the count conjunct (F-03's subject, `:735-739`) is exactly
  the kind of oracle self-scrutiny that keeps a both-directions equality honest, and it is
  reasoned about in the document rather than left for the implementer to rediscover.

## Recommendation

**Approved with minor changes** — no High findings remain.

Round 4's blocking finding is fully resolved and its Medium companion is settled in the one
sentence I asked for. The four findings above are all cheap and none of them gates: F-01 and F-02
are two cells and one clause in §5.2's table, F-03 is a re-orientation of one sentence, F-04 is a
two-word noun swap. None requires new material, a new decision, or another party's input, and
none touches anything settled in rounds 1–4. They are the kind of thing that can land alongside
the TSPEC's erratum confirmation rather than costing a round of their own.

Two items belong upstream and are emitted as errata rather than folded in here: TSPEC lacks the
reciprocal co-change sentence for the count it now shares with this document, and REQ carries two
stale citations (AC-1.3's "expected set stated in the FSPEC" against the ownership split this
FSPEC now states, and `REQ:22`'s "FSPEC F-3 step 5" for a flow that lives at F-4 step 2).

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 2}
