# Cross-Review: software-engineer — REQ (delta confirmation, erratum round v2.1)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md
**Date:** 2026-08-06
**Iteration:** 15
**Scope:** Delta confirmation only. I re-read my v14 approval and `git diff 6c025bb4..HEAD` on the REQ.
I judge exactly two things: do the four routed erratum items close, and does the delta break anything
I previously approved. I did not re-review unchanged sections.

## Delta under review

`git diff 6c025bb4..HEAD` on the REQ is three hunks and nothing else:

| Hunk | Location | Change |
|---|---|---|
| 1 | header `:18` | Version `2.0` → `2.1`, plus a four-line erratum note naming the three corrections |
| 2 | REQ-CONS-01 step 1 (`:115-140`) | withdraws "keeping one enumeration as well as one predicate"; adds a labelled **One predicate, two enumerations** block deciding the two divergence classes |
| 3 | §4b (`:595-605`) | adds **Unreadable corpus entries add no field** — no `unread:` field, §3 stays at `Version` 1.4, an unreadable entry is *not consumed* |

No other section moved. `git diff --stat` is +40/−3 lines confined to those three regions, so nothing
I approved at v14 outside REQ-CONS-01 step 1 and §4b was touched.

## Item-by-item disposition

**E-1 (te-review) — the enumeration claim cannot be delivered as written; the REQ must answer whether
a `.gitignore`d LEARNINGS file is corpus. → CLOSED.** Step 1 now withdraws the claim in terms ("The
second half is not deliverable and is **withdrawn**") and answers the sub-question directly: a
`.gitignore`d LEARNINGS file **is** corpus, membership being presence on disk under the two globs,
so the pass's enumeration does not pass `--exclude-standard`. The staged-but-deleted class is decided
the other way — an index entry with no working-tree file is not corpus. Both classes te-review named
now have a stated answer in the REQ rather than a deferral.

**E-2 (se-author) — `_listFiles` structurally cannot walk directories, so only the predicate can be
held equal. → CLOSED, and the citations verify.** I checked both against HEAD:

- `pdlc/workflows/runtime-adapter.js:915` is `else ls -p -A "${d}" | grep -v '/$'; true; fi` — one
  directory, directory entries filtered out. The seam cannot recurse.
- `:929-931` is the reply validator `if (!lines.every((l) => !/[\/\s]/.test(l) …)) return { ok: false,
  reason: "unreadable" }` — a basename carrying a separator is rejected as unreadable, so even an
  agent that volunteered `completed/LEARNINGS-x.md` would be discarded, not parsed.

Together those are exactly the mechanism the REQ claims: `_listFiles` cannot express `docs/*/`, so a
second enumeration through the git seam is forced. That seam exists at HEAD (`rtGit`,
`runtime-adapter.js:945`), so the REQ is not assuming a capability the runtime lacks. The new framing —
one predicate guaranteed by construction (both sides run the same block-scoped basename test), two
enumerations whose agreement is a stated, testable property — is the correct weakening: it is what
the code supports, and it hands te-review a property to write rather than an identity to assume.

**E-3 (se-author) — the sub-question the relaxation turns on, and the asymmetry of the two answers.
→ CLOSED.** The REQ picks "yes, `.gitignore`d is corpus", gives a mechanism reason that is not merely
aesthetic (the hook cannot see `.gitignore`, so the alternative is a nag that can never quiesce — the
pass would be forbidden to consume the very file the hook counts), and reproduces the price boundary
se-author measured: the class closes at exactly that price "because `docs/discarded/*/` is excluded by
the pathspec, not by the ignore rules". I re-measured that at HEAD:
`git ls-files --others --ignored --exclude-standard -- ':(glob)docs/*/LEARNINGS-*.md'
':(glob)docs/completed/*/LEARNINGS-*.md'` returns empty, and the plain `--cached --others` form
returns the same 5 files the REQ's step-1 worked example names. So dropping `--exclude-standard` is a
no-op on today's tree and cannot silently move the first-run test's expected set — the relaxation is
paid for only in the class it was bought for.

**E-4 (se-author) — §4b must answer the unreadable-corpus / `unread:` field question. → CLOSED.** §4b
now decides it in the section that owns the record grammar: no `unread:` field, §3 stays at `Version`
1.4, and the entry is simply **omitted** from the consumed pair. That is the cheaper of the two
repairs and the one that needs no vocabulary version bump, so it does not disturb the §4b freeze
clauses or any downstream test transcribing `Version 1.4`. It is also internally consistent with
NFR-5 (`:553`), which already requires the block to name **exactly** the consumed set — omission is
what NFR-5 was already asking for, not an exception carved into it. The stated defect it removes is
real and directionally argued: an unreadable-but-consumed entry can only ever push AC-5.2 toward
`prevented` or `insufficient-evidence`, never toward `recurred`, i.e. it biases REQ-CONS-05's
falsifiability loop in one direction only.

## Findings

Nothing in the delta breaks anything I approved at v14. Two new Low findings, both single-clause
wording repairs inside text this REQ already owns, plus the two Lows carried forward from v14 that
the erratum did not touch (correctly — they were out of its routed scope).

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | AC-2.4 (`:239-240`) still glosses the recorded consumed basenames as "exactly the AC-1.1 predicate's set". Under the new §4b rule an unreadable-but-enumerated basename is un-consolidated yet **not** consumed, so on the strict reading of that parenthetical the two sets can differ by exactly the unreadable entries. NFR-5's "**exactly** the consumed set" (`:553`) is the binding statement and is unaffected, so this is a legibility defect, not a contradiction — but AC-2.4 is the AC an implementer transcribes. Suggested repair, byte-neutral: "consumed basenames (the set the pass actually consumed — §4b omits an unreadable entry)". | AC-2.4 |
| F-02 | Low | Local | Step 1's new block asserts "**The two** classes on which those mechanisms would otherwise disagree", which is a closed enumeration. A third class exists in principle: `glob.glob` matches a symlinked directory for `docs/*/` and reads through it, while `git ls-files` does not descend into a symlinked directory, so a symlinked feature directory holding a LEARNINGS is visible to the hook and invisible to the pass. There is none at HEAD (`find docs -maxdepth 2 -type l` is empty), so this costs nothing today; the exposure is that a closed "two classes" claim is what a later reader will trust. Suggested repair: say "the two classes that arise at HEAD" rather than "the two classes". | REQ-CONS-01 step 1 |
| F-03 | Low | Local | *(carried forward from v14, unchanged, still open)* §4b's split needs an explicit subject — "Of the vocabularies file's owned sections, §1, §2 and §4 are enumerations and §3 is owned normative prose; the baseline's four sections are all owned normative prose, under no row oracle". Not re-argued here. | §4b |
| F-04 | Low | Local | *(carried forward from v14, unchanged, still open)* Narrow §4b's baseline change-control clause from "a **content** change" to "a change to any **stated fact**", matching the vocabularies file's row-scoped wording. Not re-argued here. | §4b |

None of the four is a gate. F-01 and F-02 are each one clause; if an optimizer pass is already open
for F-03/F-04 they should ride along with it, and if none is, they are not worth opening a round for.

## Questions

| ID | Question |
|----|---------|
| Q-01 | The gitignore decision's stated reason is that the alternative leaves "a nag that never quiesces". The unreadable-entry decision accepts exactly that shape — an on-disk file that cannot be read stays un-consolidated forever, so `nudge-consolidation.sh` nags about it on every session start. I read this as deliberate and bounded rather than contradictory (the retry is the point, and the volume trigger cannot wedge: consuming the readable entries drops `\|un-consolidated\|` below `volumeThreshold` unless ≥5 files are simultaneously unreadable, after which the cadence test governs). Confirming that reading is intended, and that no AC needs to bound the retry, is a TSPEC-level note at most — not a REQ change. |
| Q-02 | The REQ is now 64,397 bytes across 674 lines, against the pdlc REQ budget of 700 lines / 60 KB, so `check-req-size.sh` warns. The byte budget was already breached before this erratum (61,109 bytes at `6c025bb4`) and I approved it then, so this is not a delta regression; the erratum added 3.3 KB to a document already over. Flagging it only so the next author knows the line budget now has 26 lines of headroom, not that anything here should be cut. |

## Positive Observations

- The withdrawal is stated as a withdrawal, in place, with the superseded wording quoted. A reader who
  arrives via the old text finds out immediately that it was retracted and why — much better than a
  silent rewrite, and it keeps the erratum auditable against the round that raised it.
- Both mechanism citations are exact, not approximate: `:915` is the single-directory `ls` and
  `:929-931` is the separator-rejecting validator. Two independent lines are needed to establish "cannot
  walk `docs/*/`", and the REQ cites both rather than the more quotable one.
- The relaxation is priced. "Closes this class at exactly that price and no other, because
  `docs/discarded/*/` is excluded by the pathspec, not by the ignore rules" is a falsifiable claim about
  mechanism, and it holds at HEAD — the ignored-file probe returns empty, so the first-run expected set
  of 5 does not move.
- §4b picked the repair that needs no vocabulary version bump. Choosing omission over an `unread:` field
  keeps `Version 1.4` pinned, which means no downstream test transcribing that version has to change and
  the §3 freeze clauses stay intact. The cheap repair was also the correct one here.
- The `recurred`-direction argument is the right justification. It shows the defect is a *biased*
  corruption of AC-5.2, not merely a cosmetic inaccuracy, which is what makes it worth deciding at REQ
  level rather than deferring to TSPEC.

## Recommendation

**Approved with minor changes.**

All four routed erratum items close. Every mechanism claim the delta introduces verifies against HEAD
(`runtime-adapter.js:915`, `:929-931`, `rtGit` at `:945`; the ignored-file and symlink probes both
empty; the 5-file expected set unchanged). Nothing outside REQ-CONS-01 step 1 and §4b was touched, and
neither edit re-scopes anything downstream — the enumeration relaxation is a no-op on today's tree, and
the §4b decision is the one that leaves `Version 1.4` pinned.

My v14 approval stands, extended to this revision. The four open findings are all Low and all
single-clause wording repairs (F-01 and F-02 new, F-03 and F-04 carried forward untouched); none of
them blocks TSPEC, PLAN or implementation, and I will not open a further round on any of their account.

## Verdict

VERDICT: Approved with minor changes
