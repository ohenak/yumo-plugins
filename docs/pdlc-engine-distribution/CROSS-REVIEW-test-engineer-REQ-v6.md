# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/REQ-pdlc-engine-distribution.md` (v0.11)
**Date:** 2026-08-14
**Iteration:** 6
**Scope:** Testing lens, erratum delta-confirmation. Diff `01c27ee4` on the REQ, plus
re-grounding over what the changed text now leans on: FSPEC §5.2 and F-4 step 2,
TSPEC §5.4's `PK-*` table, `docs/_constraints/pdlc-engine-baseline.md` at HEAD.

## Erratum disposition

All five items landed, and the five are really three distinct edits (three reviewers raised
the AC-1.3 ownership split; two raised the changelog citation). Verified against the
documents, not against the changelog's claim about them:

| Item (raised by) | Landed | Grounding checked |
|---|---|---|
| AC-1.3: expected set's counts in FSPEC, member names in TSPEC (pm-author) | AC-1.3 (`REQ:264-273`) now reads "an expected set whose **classes and per-class member counts are stated in the FSPEC** and whose **member names are stated downstream in the TSPEC**" | FSPEC §5.2 (`FSPEC:519-527`): "The member *count* is owned here, per class and in total … TSPEC §5.4's `PK-*` table says which files". The REQ's wording is now the FSPEC's own split, not a paraphrase of it |
| AC-1.3 names classes that no longer match FSPEC §5.2's class rows (se-review) | Same edit. The class enumeration ("the CLI entry, the workflow modules and the engine adapter") survives as a *content* statement — "That expected set contains …" — no longer as a claim about what the FSPEC enumerates | FSPEC §5.2's class table carries seven rows (manifest, package README, licence, CLI entry, engine modules, install script, workflow modules). The REQ names three of them and no longer asserts the list is exhaustive, so the two documents no longer contradict. See `F-01` — the adapter clause is now the one loose thread |
| `REQ:22` cites "FSPEC F-3 step 5" for the run-side `engine.*` pin read (se-review) | v0.10 changelog line (`REQ:29`) now cites **F-4 step 2** | FSPEC F-4 step 2 (`FSPEC:194-198`) is the flow: "The pin is read from the `engine.*` namespace of the consumer-owned `.claude/pdlc.config.json` (O-2, grounded in DEC-HE-02) and never written by the engine". F-3 step 5 (`FSPEC:171-172`) only *cross-references* F-4 step 2 inside a non-interference clause. The corrected citation is the one a reader can act on |
| AC-1.3 asks for a list the FSPEC deliberately does not carry (te-review, my v5 line of the same defect) | Same edit as row 1 | TSPEC §5.4 (`TSPEC:347-358`) carries `PK-1`…`PK-23` by literal path; the arithmetic (`TSPEC:387-389`) is 23 members before N-2's licence decision, 24 after, and FSPEC §5.2 (`FSPEC:519-522`) states the same totals per class. Both sides of the split are populated at HEAD — the AC is now satisfiable, where in v0.10 it named a document that could not answer it |
| v0.10 changelog attributes the pin read to F-3 step 5 (pm-author) | Same edit as row 3 | As above; prose only, no AC touched |

The diff is exactly the version-and-date bump, one new changelog paragraph, one word-range
inside the v0.10 paragraph, and AC-1.3's *Then* clause. "No other change" is true as
written. 613 lines / 51,504 bytes — inside the 700-line / 60 KB REQ budget, so
`check-req-size` stays quiet.

**One thing the edit deliberately did not do, and was right not to:** AC-3.4 still says its
expected check-name set is "stated in the FSPEC", unchanged. That is correct and must stay —
FSPEC §5.1 transcribes the check names literally, so that set genuinely does live upstream of
the TSPEC. A search-and-replace applying the AC-1.3 split to AC-3.4 would have broken a
sound criterion. The edit was targeted at the one AC whose ownership claim was false.

## Findings

No High findings. The erratum landed correctly and made AC-1.3 satisfiable for the first
time: in v0.10 it named a document that structurally could not answer it, so the AC had no
implementable oracle at all. `F-01` is new and small. `F-02`…`F-05` are carried from round 5
and re-verified as still open at HEAD — the erratum touched two sites, so none of them could
have been resolved by it. They are re-recorded so a targeted round does not quietly retire
them; none is re-litigated and none is a gate.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | **AC-1.3's surviving containment clause names three things where the FSPEC has seven classes and no adapter row.** "That expected set contains the CLI entry, the workflow modules and the engine adapter" is *true* as containment — `lib/adapter.mjs` is `PK-*`-listed among the engine modules — and it is no longer a claim about what the FSPEC enumerates, which is what the erratum fixed. What remains is a reading hazard for whoever builds the check: FSPEC §5.2 says in terms "There is **no separate 'engine adapter' row**: the adapter is `lib/adapter.mjs`, already an engine-modules member, and a second row would double-count it" (`FSPEC:539-540`). A verifier who reads AC-1.3's triple as a class list will look for a class the FSPEC deliberately declined to create, and per-class counts are the half the FSPEC owns. The set-equality is unaffected — it is decided against the FSPEC's classes and the TSPEC's names, not against this sentence — so this is wording, not a defect in the oracle. One clause ("named among the engine modules, not as a class of its own") or dropping the adapter from the triple closes it. | AC-1.3; FSPEC §5.2 |
| F-02 | Medium | Local | **Carried from v5 F-01, unchanged at HEAD: NG-6's load-bearing half — install and upgrade *read* nothing in a consumer project — still has no falsifiable carrier.** C-2 (`REQ:196-198`) and AC-2.3 (`REQ:300-307`) observe only that the working tree and index are unchanged, and a read leaves both clean, so an install that quietly parsed `.claude/pdlc.config.json` passes every criterion in REQ-EDIST-02. The discharge available is **locus, not observation** — FSPEC F-2 step 1 and F-3 step 2 already require both commands to run on the machine, never inside a consumer project, which puts no consumer file in scope to read. One clause in NG-6 or AC-2.3 naming that reason turns an unassertable promise into a structural one. | NG-6; C-2; AC-2.3 |
| F-03 | Medium | Local | **Carried from v5 F-02, unchanged at HEAD: AC-3.5's positive (a) — "the release is cut" — still has no stated observable, and its downstream carrier is a stub.** FSPEC AT-3.5 (`FSPEC:718`) still runs against a **stub-channel** publish with a sentinel credential. A stub-channel success proves the workflow authenticated *to the stub*; it cannot falsify a mis-wired real secret name, which is the failure (a) exists to catch. Two honest routes, either acceptable: state the observable in AC-3.3's existing vocabulary ("the published bytes for version N exist and the run's own output names N"), or accept (a) as discharged against the stub and say so, seeding the real-channel half as a one-time dated provenance observation on the first genuine release — explicitly not a gate. As written it reads like a gate nobody can build. | AC-3.5(a); C-8; FSPEC AT-3.5 |
| F-04 | Low | Local | **Carried from v5 F-03, unchanged at HEAD: AC-3.5(b) is a stronger statement than its downstream carries, and stronger than default tool behaviour.** "Fails at the publish step **naming the missing secret**" requires a preflight guard: an unset GitHub secret expands to empty and `npm publish` fails with a registry auth error that names no secret at all. FSPEC E-18 (`FSPEC:619`) still says only "workflow run fails visibly; no partial publish; no credential value in any log" — it does not carry the naming obligation, and AT-3.5 covers only the absence scan. The REQ is at the right altitude stating the outcome; the point is that E-18 and AT-3.5 need to move in the FSPEC's own confirmation round, not later, or the REQ's strengthening is unimplemented by construction. | AC-3.5(b); FSPEC E-18, AT-3.5 |
| F-05 | Medium | Cross-Feature | **Carried from v4 F-01 and v5 F-04, still open: the T-7 / M-ENG-10 authority overlap is asserted nowhere.** AC-3.4 and T-7 make the FSPEC's expected check-name set the change-control point and demote M-ENG-10 (`docs/_constraints/pdlc-engine-baseline.md:188`) to a point-in-time measurement, but nothing asserts the two against each other, and both are green today only by construction — they were seeded from the same reading. The fix remains one sentence in the baseline row marking it seed-only and non-authoritative. Cross-Feature because the baseline file is shared and the same seed-vs-gate confusion recurs wherever a REQ cites it. Not a gate. | T-7; AC-3.4; M-ENG-10 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | FSPEC §5.2's closing paragraph still quotes the REQ back at itself in the *old* words — "so REQ AC-1.3's *expected set stated in the FSPEC* is stated here" (`FSPEC:524-525`). That phrase no longer exists in REQ v0.11. The FSPEC's substance is right and is what the REQ now mirrors, so this is a stale quotation, not a contradiction — but it is exactly the kind of thing that survives three rounds and then reads as authority. Can it be picked up in the FSPEC's own delta-confirmation rather than left to a later compression pass? |
| Q-02 | Carried from v5 Q-01, and now overdue: FSPEC F-3 step 5 (`FSPEC:171-172`) still ends "NG-6's own wording is an erratum against the REQ, not fixed here". REQ v0.10 fixed it. The sentence became stale the moment that round closed, and this round's citation correction pointed a reader straight at the paragraph above it. Same request as Q-01 — name it as an FSPEC-side edit so it is not lost between rounds. |
| Q-03 | Carried from v5 Q-02, still non-blocking: NG-6's *title* is still "Consumer-side generated state" while its body is now purely about install and upgrade. The title over-promises relative to the text, and a title is what a reader greps for. Not a finding at REQ altitude, but a one-word title change would make the scope restatement self-evident. |

## Positive Observations

- **The erratum fixed the document that was wrong, not the document that was loudest.** Three
  reviewers reported AC-1.3 from three angles and all three descriptions were of a REQ defect:
  the REQ asked for a member list, the FSPEC had deliberately decided not to carry one, and the
  FSPEC's decision was the better one. The REQ moved. That is the right direction of travel for
  a downstream-ownership dispute.
- **The split now has a real oracle, and it is better than the thing it replaced.** FSPEC
  AT-3.8a (`FSPEC:730-748`) asserts the count conjunct against the **transcribed** `PK-*` list,
  never the tarball's own length, and says why: against the tarball the count is a tautology once
  the first conjunct passes; against the transcription it fails when the transcription has drifted
  from §5.2. So the cross-document consistency the split creates — FSPEC's counts against TSPEC's
  names — is itself the falsifier, not an unchecked assumption. AC-1.3's two-document expectation
  is stronger than v0.10's one-document one, not weaker.
- **AT-3.8a and AT-3.8b are correctly ranked.** One authoritative whole-set assertion, one
  sub-assertion over a class, explicitly not a competing expected side. Two set-equalities over
  overlapping sets is a classic way to get a green suite with an unowned gap; the FSPEC named the
  hazard and resolved it rather than shipping both as peers.
- **The citation correction is the kind that matters.** F-3 step 5 only cross-references the pin
  read inside a non-interference clause; F-4 step 2 is the flow that states it, with the config
  namespace, the owner and the never-written rule. A reader following the old citation would land
  on a sentence that points elsewhere. Small edit, real difference for anyone deriving a test.
- **The round stayed a round.** Two sites touched, "No other change" true as written, and AC-3.4's
  superficially-similar "stated in the FSPEC" left alone because it is correct there. A targeted
  erratum that resists the pull to tidy adjacent text is cheap to confirm — this one took a diff
  and four greps.

## Recommendation

**Approved with minor changes**

All five erratum items landed, and they landed in the right document. AC-1.3 now states the
ownership split the downstream documents actually hold — classes and per-class counts in
FSPEC §5.2, member names in TSPEC §5.4's `PK-*` table — and both halves are populated at HEAD
(seven classes, 23 members before N-2's licence decision and 24 after, the same arithmetic on
both sides). The v0.10 changelog's pin-read citation now points at F-4 step 2, which is the
flow. Re-grounded against the current FSPEC and TSPEC rather than against the changelog: the
REQ remains a faithful compression of what they say, and on this AC it is a more faithful one
than it was, because the criterion is now satisfiable where before it named a source that
could not answer it. Nothing outside the two edited sites moved.

No High finding is open. `F-01` is a Low reading hazard in surviving wording — one clause, or
one deletion, and the adapter stops looking like a class the FSPEC declined to create.
`F-02`…`F-05` are carried from earlier rounds, re-verified as untouched by this edit, and are
about assertability rather than correctness: give "install and upgrade read nothing" a
structural carrier (locus, not observation), say what "the release is cut" is observed as and
whether the stub channel discharges it, and let the FSPEC's own confirmation move E-18 and
AT-3.5 up to AC-3.5(b)'s new strength.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 3, "low": 2}
