# Cross-Review: test-engineer — FSPEC (delta re-review)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/FSPEC-pdlc-engine-distribution.md` (v0.5)
**Date:** 2026-08-14
**Iteration:** 5
**Scope:** Delta re-review of `c63429f2..HEAD` (the round-4 edits, `204ec552`…`7076e771`) against
my v4 findings. Unchanged sections already approved are not re-reviewed.

## Prior-finding verification

| Prior ID | Severity | Resolved? | Evidence |
|---|---|---|---|
| v4 F-01 | Medium | **Yes** — the count is now **per class**, not only a total. §5.2 (`:505-508`) states manifest 1, README 1, CLI entry 2, engine modules 15, workflow modules 3, install script 1, licence 0/1 → **23 before N-2, 24 after**, and §1 (`:56-59`) restates ownership as "counts, per class and in total". The swap I described (merge one `lib/*.mjs`, split a `bin/` entry) now moves two FSPEC-owned numbers even though the total is unchanged. Arithmetic checked against `TSPEC:386-389` ("four manifest-adjacent and `bin/` members … fifteen `lib/*.mjs` … three vendored … `scripts/postinstall.mjs`"): 1+1+2+15+3+1 = 23, +`LICENSE` = 24 — both sides agree, and per-class agrees row-for-row with `TSPEC:346-358` (PK-4/PK-4b = 2, PK-5…PK-19 = 15, PK-20…PK-22 = 3). The rename case is now stated explicitly rather than silently uncovered (`:516-517`, §1 `:58-59`): constant cardinality is downstream-only and AT-3.8a catches it as spec-vs-package drift. Correct — AT-3.8a's expected side is the transcribed `PK-*` list, so a package rename without a TSPEC rename is red. |
| v4 F-02 | Medium | **Yes.** `[blocked on O-10]` is gone from the §5.2 workflow row (`:507`) and from AT-3.8b (`:746-749`); both now cite TSPEC §5.4's "the three rows under the `files` entry `vendor/workflows/`, and nothing else" (`TSPEC:421-429`), and O-10 is retained only where it still bites, on BR-8.2 (`:541`). AT-3.8b's `Then` is now a writable member-for-member equality naming `PK-20`…`PK-22` with a removed-module falsifier. Grepped the whole FSPEC for `O-10` (`:64`, `:507`, `:541`, `:839`): no stale blocked marker survives. |
| v4 F-03 | Low | **Yes** — and fixed the way I asked. `:735-739` pins the count conjunct to the **transcribed** `PK-*` list, "never the tarball's own length", names the tautology it would otherwise be, and states the failure mode it does catch (transcription drifted from §5.2). |
| v4 Q-01 | — | REQ AC-1.3 (`REQ:257-261`) still reads "the expected set stated in the FSPEC" while member names live in TSPEC §5.4. The v0.5 changelog records this as routed upstream (`:21-22`); re-raised as an erratum below so the routing is on the record for this round too. |
| v4 Q-02 / Q-03 | — | Still downstream-only (see Questions). |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **The CLI-entry class row and the new per-class count contradict each other on who owns that number.** The row still reads "how many files carry that entry is a decomposition question TSPEC §5.4 decides, **not this document**" (`:504`), while the paragraph two lines below now says "**CLI entry 2**" and that the count is owned here (`:505-506`). Both cannot be true: if §9.3's guard/body split ever became three files, the row says no FSPEC edit is needed and the paragraph says one is. This is not an oracle gap — AT-3.8a still goes red against the transcribed list either way — but it is exactly the change-control ambiguity the per-class count was added to remove, and a verifier deciding whether a red count conjunct means "FSPEC stale" or "TSPEC stale" reads two answers. Delete the "not this document" clause from the CLI-entry row (and, for symmetry, check the Engine-modules row's "decomposition itself is the TSPEC's", `:505`, which reads consistently only because it speaks about *names*). | §5.2 (`:504-506`) |
| F-02 | Low | Local | **AT-3.8a's count conjunct is now a spec-vs-spec assertion sitting inside a tarball-framed `When`.** The `When` is "the packed tarball's contents are enumerated" (`:731`), but conjunct 2 compares the transcribed `PK-*` list against §5.2's numbers (`:735-739`) and touches the tarball not at all — it is decidable with no `npm pack` at all. Worth one clause saying so, because (a) it can then be scheduled at unit level rather than paying the pack cost, and (b) checking the **per-class** counts requires a stated class-partition rule over the transcribed names (manifest / `README.md` / `LICENSE` / `bin/*` / `lib/*.mjs` / `vendor/workflows/*` / `scripts/postinstall.mjs`); the partition is derivable from §5.2's class rows, but it is currently left to the implementer to invent, and two implementers could partition `bin/cli.mjs` differently from `bin/pdlc.mjs`. Naming the partition in §5.2 makes the conjunct mechanical. | §8 AT-3.8a (`:730-745`), §5.2 (`:499-508`) |

## Questions

| ID | Question |
|----|---------|
| Q-01 | `PLAN:136` (T16) still blocks the literal transcription on "the erratum raised against FSPEC AT-3.8a" and quotes AT-3.8a's superseded "the twelve named `lib/*.mjs` modules" wording, which v0.4 already removed. Downstream document, no FSPEC change needed — but the PLAN carries a resolved blocker into Phase I and should be swept before dispatch. |
| Q-02 | `TSPEC:421-429` still opens with *"That row is marked `[blocked on O-10]`, not enumerable yet"*, describing a marker v0.5 has now removed. Harmless (the unblocking sentence it introduces is what §5.2 cites), but the TSPEC's narration of the FSPEC is one round stale. |
| Q-03 | Unchanged from v4: `pdlc/engine/package.json:11` declares `"license": "UNLICENSED"` at HEAD while PK-3's `LICENSE` **file** is gated on N-2. Nothing in §5.2 or AT-3.8a pins the manifest field to the file, so a package shipping `LICENSE` with the field still `UNLICENSED` passes both. Likely TSPEC/PLAN territory (`PLAN:151` T25 defers the field to T05); flagged, not filed. |

## Positive Observations

- The per-class breakdown is the cheap fix landing in the cheap place: it is transcribed from arithmetic `TSPEC:386-389` already carried, so the two documents can be diffed by a reader in seconds, and it closes the swap-invariance hole without inventing a new mechanism. Re-derived it independently against `TSPEC:346-358` and against the tree (`pdlc/engine/lib/` holds exactly twelve `.mjs` at HEAD, plus §3.1's three = 15; `pdlc/engine/bin/` holds one, plus PK-4b = 2) — every class number checks out.
- The revision states the limit of its own claim rather than overclaiming: "a rename at constant cardinality stays downstream-only" (`:516-517`) is precisely the case the count cannot catch, and it names the oracle that does. Specs that admit what they do not cover are the ones whose tests do not lie.
- AT-3.8a/AT-3.8b now stand in a stated relation (`:743-745`, "AT-3.8a is the authoritative whole-set assertion; AT-3.8b a sub-assertion over one class") instead of reading as two competing expected sides — that removes the failure mode where an implementer satisfies one and treats the other as redundant.
- No regression in the surrounding contract: the anti-directory-listing rule (BR-8.1, `:526-530`), the deletion-tolerant licence sourcing (`:503`), and the exclusion-by-set-equality paragraph (`:520+`) are untouched by this round's edits.

## Recommendation

**Approved with minor changes**

All three of my v4 findings are resolved, and resolved at the right altitude: the packed-content
set's ownership is now per-class, the workflow-module class and AT-3.8b are unblocked with a
citation rather than a promise, and the count conjunct is pinned to the transcription so it cannot
degenerate into a tautology. No open High findings. F-01 is a one-clause deletion an optimizer can
make without a further review round; F-02 is a clarification. The REQ AC-1.3 wording mismatch is
routed upstream as an erratum, not held against this document.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}
