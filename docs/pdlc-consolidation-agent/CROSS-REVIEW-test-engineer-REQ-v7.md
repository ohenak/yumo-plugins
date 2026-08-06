# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md`
**Date:** 2026-08-06
**Iteration:** 7
**Scope:** Local (Scope tags per finding below)
**Delta base:** `0681852` (the tree v6 reviewed) → HEAD

Delta re-review. v6's findings F-38…F-41 are dispositioned in §Prior findings; new findings are
numbered F-42 onward so ids never collide across rounds. Only the five commits that touched the REQ
since `0681852` were read for new issues; unchanged sections approved in v1–v6 were not revisited.

## Prior findings

All four v6 findings are dispositioned below. Each was checked against the code the revision cites,
not against its prose. Both Mediums are resolved on the mechanism, not by softening the claim.

| v6 ID | Sev | Disposition | Evidence |
|---|---|---|---|
| F-38 | Medium | **Resolved** | AC-5.1 re-keys `failure-mode-id` on the promotion's `phase` and its target `artifact`, "and from **nothing else** — not from the pass, not from its consumed set, and **not** from `symptom`" (`:362-364`), with `symptom` demoted in the same sentence to "one line, human-readable and explicitly **non-keying**". That is the first of the two fixes I named, taken in full. The justifying paragraph states the argument I made rather than asserting the conclusion — "Determinism of the derivation is not stability of its inputs … `symptom` is a line the pass's own model writes under no vocabulary, so two passes recognising one failure mode from different corpora would word it differently and slug differently" (`:368-372`) — and ties it to the case NFR-4 exists for (AC-3.8b abandonment, a later pass with a larger consumed set). The oracle is now writable: two passes, same `phase` + `artifact`, different `symptom` text, assert equal ids and assert `duplicate-suppressed`. Under v6's wording that fixture could not be built at all. One residual in the *granularity* dimension survives as F-42 (Low) — it is a different defect from the one I filed, and it is fixturable, which the old one was not. |
| F-39 | Medium | **Resolved — and the stronger of the two fixes I offered was taken** | The marker moves out of the log entirely: AC-1.3 now puts it in `docs/_decisions/.consolidation-lock`, "deliberately **not** in `.consolidation-log.md`, because taking and releasing it are in-place rewrites of a whole small file and every write to the *log* must stay an append" (`:167-171`). The new "**Why no lock is needed: the write-granularity obligation**" paragraph (`:191-196`) then states the invariant positively and closes the two writes that would have broken it: the marker (moved out) and the winner's `<!-- pdlc:consumed -->` pair, which is "emitted **complete, in one append**, its consumed set being fixed at step 1 of the tick order before any promotion work". A whole-file read-modify-write of the log is called out as "**forbidden**, not merely unnecessary: it is the one shape that loses a concurrent append". With that, AC-1.3's race fixture has a deterministic oracle — the loser's `refused` row and the winner's records interleave in either order and both survive — instead of the flaky one I flagged. The claim is grounded in a shipped capability I re-verified: `rtAppendFile` (`pdlc/workflows/runtime-adapter.js:863`) dispatches `cat >> "${path}"` (`:883`) and is explicitly not a read-modify-write (`:852-857`); it is plumbed as a real injected seam `_appendFile`, not a latent capability — `orchestrate-dev.js:2684` / `:2809` consume it and `orchestrate-queue.js:801` / `:874` thread it, with `defaultAppendFile` as the default (`orchestrate-dev.js:5697`). |
| F-40 | Low | **Resolved** | AC-5.1's new "**Uniqueness, scoped.**" paragraph (`:374-379`) removes the collision I flagged by removing the premise: within one pass, two promotions deriving the same id "name the same `phase` and `artifact`, are one failure mode, and are recorded once — the pass never mints a suffixed variant, which would break derivation purity and with it NFR-4", and the cost is stated out loud ("the accepted cost of keying on `artifact` rather than prose"). Cross-pass repetition is then made deliberate rather than accidental, with the referent disambiguated by key arity: log **records** are keyed `(failure-mode-id, passId)`, a **promotion** on the id alone, and every downstream contract is restated in promotion terms — AC-5.2 one row per id, AC-5.3 one streak per id over all its records, AC-5.4 retires an id. That last sentence is what makes AC-5.2's set-equality obligation unambiguous over a corpus containing a re-proposal; it also survived into AC-5.2 itself (`:414-415`). |
| F-41 | Low/Process | **Improved, still open — refiled as F-44** | The round bought headroom rather than spending it: at HEAD the file is 663 lines / 61,371 bytes against `LINE_LIMIT=700` / `BYTE_LIMIT=61440` (`pdlc/hooks/scripts/check-req-size.sh:41`, `:40`), so 37 lines and 69 bytes of margin, up from 2 lines and 8 bytes. Two of the five commits this round were pure compression (`0377214`). The recurrence I flagged is unchanged in kind — a fourth consecutive round paid for edit budget with reflow — so it is refiled at the same severity rather than closed. |

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
