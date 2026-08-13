# Cross-Review: test-engineer — DECISIONS

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/DECISIONS-pdlc-engine-distribution.md`
**Date:** 2026-08-13
**Iteration:** 3
**Scope:** Testing lens only, delta-scoped. The document was approved at round 2
(`{"high": 0, "medium": 2, "low": 1}`); this round re-reviews the one post-approval edit
(`8ab3b795`, §7's citation repair) plus the round-2 findings' disposition. Sections unchanged
since `8f3d6a1e` and already reviewed in v1/v2 are not re-litigated.

## Round-2 finding disposition

Delta read: `git diff 8f3d6a1e..HEAD` over the document. **One commit** touched it since
round 2 — `8ab3b795`, "DECISIONS §7 — DEC-EDIST-06 cites `exitCodeFor`/`PROP-EXIT-1`, not
AC-1.4 (TE F-47 / PM F-01)" — two hunks, both in §7 (`:467-470` body, `:494-498` the
"Constraints that forced the shape" row). That edit answers a **TSPEC** round-10 finding
routed here by the Phase D post-mortem's resolution record
(`POSTMORTEM-D-pdlc-engine-distribution.md:25`), not a DECISIONS v2 finding. My three round-2
findings were non-blocking and the remediation did not reach them; they are still open at HEAD
and are restated below rather than dropped.

| v2 ID | Sev | Status | Evidence at HEAD |
|---|---|---|---|
| F-01 — §13's DEC-EDIST-09 row still prices the rejected alternative at "six imports" | Medium | **Open** | `:820` still reads "six imports throw before its first statement"; §10 reads "**nine** static imports" at `:652`. Restated as F-05 |
| F-02 — the shipped `pdlc/engine/.npmignore` has no nominated oracle | Medium | **Partly addressed upstream, oracle still unnominated** | TSPEC v0.10 item (2) now creates the file explicitly (`TSPEC:215`, `:244-249`) and reconciles D-5 (`TSPEC:153`, `:305-314`) — so the v2 erratum I raised against `TSPEC:151` **is** resolved. But `TSPEC:314` states the file is **never a packed member**, which confirms rather than closes the gap: PF-4 packs for real and structurally cannot observe a file npm excludes from every tarball. Restated as F-06 |
| F-03 — §13's DEC-EDIST-05 row reads as the opposite of §2/§6 | Low | **Open** | `:816` still says "An `.npmignore` deny-list — a forgotten entry **ships** what should not", with no clause noting the allow-list ships a one-line negation. Now sharper than in round 2, because TSPEC `:305-306` has since spelled out that exact distinction — the register is the one surface still carrying the un-nuanced form. Restated as F-07 |
| Q-01 / Q-02 / Q-03 | — | **Not taken up** | The remediation was single-finding and scoped to §7; none of the three round-2 questions were answered in the document. Q-02 (literal vs derived expected exit number) is the one with test consequences and I re-ask it below |

**The edit's own claims re-derived against HEAD, not against the documents that assert them:**

- `exitCodeFor` exists at `pdlc/engine/lib/run.mjs:290` and maps exactly as §7 now says —
  `refusal` → 1 (`:291`), missing report → 1 (`:292`), `outcome === "halted" || "blocked"` → 2
  (`:293`), else 0 (`:294`). "An engine refusal or crash to 1 and a halt or block to 2" is a
  faithful transcription, not a paraphrase that drifts.
- `PROP-EXIT-1` is real and pinned by an executing test:
  `pdlc/engine/__tests__/exit-loop.test.js:88`, "exitCodeFor: halt/block => 2, engine refusal
  => 1, a clean outcome => 0". So the entry's constraint now rests on a shipped oracle rather
  than on a document.
- **AC-1.4 is the version-triple criterion** — `REQ-pdlc-engine-distribution.md:266-270`,
  "*When:* they ask the CLI for its version. *Then:* it reports the engine version, the
  declared compatible-plugin range, and the version of the plugin it currently finds
  installed". Independently confirmed by `grep -n "AC-1\.4"` over the REQ: five hits
  (`:251`, `:266`, `:282`, `:365`, `:379`), every one about the version triple, none about
  exit codes. The withdrawal is correct.
- Both occurrences the post-mortem promised are repaired. `grep -n "AC-1\.4"` over DECISIONS
  returns `:470` (the new withdrawal itself), `:532`, `:536`, `:542`, `:549`, `:818` — all in
  §8/§13's version-triple context, none re-asserting an exit-code contract. No third occurrence
  was missed.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
