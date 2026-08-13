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

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Process | **The document's bytes changed after approval, but its version cell and changelog still say `0.3` — so two different byte-states now share one label, and the approval anchor that pinned the first one is silently stale.** Round 2 approved v0.3 and recorded `APPROVAL-HASH: sha256:d075c281…` (`CROSS-REVIEW-test-engineer-DECISIONS-v2.md:118`). Commit `8ab3b795` then rewrote seven lines of §7. The header still reads `| pdlc | Draft (Phase T) | Claude | 0.3 | 2026-08-13 |` (`:12`) and the changelog's last row is `0.3` (`:20`), whose text ends "§13's rows for DEC-EDIST-01 and DEC-EDIST-04 updated to match" — it does not mention the AC-1.4 withdrawal, because that row predates it. The sibling document handled the identical situation the other way in the same remediation: TSPEC bumped to **v0.11** with a changelog row naming F-47 (`TSPEC:28`, `:12`). The asymmetry matters for a reason inside my lens: PLAN and PROPERTIES are authored against "DECISIONS v0.3", and there are now two of those. A downstream author who transcribed the constraint before `8ab3b795` and re-checks their citation against "v0.3" finds no signal that the authority changed. **Fix:** bump the header to `0.4` and add one changelog row naming the §7 repair and its two sites, exactly as TSPEC's v0.11 row does. No entry's substance changes | Header (`:12`), Changelog (`:20`), §7 |
| F-02 | Medium | Local | **§7 still tells the reader that TSPEC §6.2 "pays for two" — four lines above the paragraph this round edited — and that is false at HEAD.** `:490-492` reads "Raised as an erratum against TSPEC §6.2, which **carries** the same three-behaviour sentence and **pays for two**", in the present tense about upstream's current state. The erratum was raised, accepted, and discharged: `TSPEC:460-472` now decides the signalled child, `TSPEC:476-479` nominates the third leg ("asserts the launcher's own exit status **equals the exact decided number** (`128 + signum` — e.g. `130` for `SIGINT`)"), and `TSPEC:1806` schedules that leg onto the fixture machine. TSPEC §6.2 pays for **three**. This is a test-accounting statement, not prose colour: a PROPERTIES author reading DECISIONS §7 top-to-bottom is told the upstream spec under-covers a behaviour this entry decided, and the natural response is to open a coverage obligation that is already met, or to re-raise a discharged erratum. **Fix:** one sentence, past tense — "Raised as an erratum against TSPEC §6.2, which paid for two of the three; discharged in TSPEC v0.10 (`TSPEC:476-479`)." The parallel sentence at `:341` is already written this way ("whose 'covers it for free' sentence this entry **transcribed**") and needs no change | §7 (`:490-492`) |
| F-03 | Medium | Local | **`PROP-EXIT-1` is cited three times in the new text with no home document and no pinning test, and its id is about to collide with this feature's own PROPERTIES namespace.** `:468-469` and `:495-496` cite "`exitCodeFor` (`pdlc/engine/lib/run.mjs`, pinned by `PROP-EXIT-1`)". Two gaps. (a) **No line number**, where every other code citation in this document carries one (`cli.test.js:13,22` at `:490`, `orchestrate-dev.js:13088` at `:169`, `run.mjs:57-62` at `:176`) — and the useful coordinate is the *oracle*, `pdlc/engine/__tests__/exit-loop.test.js:88`, which is what a test author must not duplicate or contradict. (b) **`PROP-EXIT-1` belongs to a different, completed feature** — `docs/completed/pdlc-headless-engine/PROPERTIES-pdlc-headless-engine.md:287`, where its recorded status is *`partial`*. `PROPERTIES-pdlc-engine-distribution.md` does not exist yet; when it is authored it will mint its own `PROP-*` ids into a document that names no other feature's, and a reader grepping this feature's docs for `PROP-EXIT-1` finds nothing. **Fix:** one parenthesis at first use — "`PROP-EXIT-1` (`docs/completed/pdlc-headless-engine/PROPERTIES-…:287`, pinned by `pdlc/engine/__tests__/exit-loop.test.js:88`)" — and a bare `PROP-EXIT-1` thereafter | §7 (`:468-469`, `:495-496`) |
| F-04 | Low | Cross-Feature | **"REQ carries no exit-code statement at all" overshoots what I can verify, and the sentence omits the one fact that would stop the mis-citation being re-made.** `:470-471` asserts the absolute. `grep -in "exit"` over `REQ-pdlc-engine-distribution.md` returns `:434-435` — "`pdlc/hooks/scripts/sync-workflows.sh` both exit 0, and `sync-workflows.sh --check` then exits 0" — literal exit-code statements, just not about the launcher. The precise claim, and the one that survives a checker, is "no exit-code statement about the launcher or the engine's run outcome". More useful still: the *predecessor* feature's AC-1.4 **did** carry this contract — `docs/completed/pdlc-headless-engine/PROPERTIES-…:482` maps "AC-1.4 | a halt exits `2`, not `1` | PROP-EXIT-1…10". That is the most likely origin of a phrase that reached two documents, and naming it converts a correction into a guard against the next transcription. Tagged Cross-Feature: AC-id reuse across a completed feature and its successor is a citation hazard any future entry in this repo inherits | §7 (`:470-471`) |
| F-05 | Medium | Local | **Restated from v2 F-01, unresolved: §13's DEC-EDIST-09 register row still prices the rejected alternative at "six imports"; §10 says nine.** `:820` — "ESM static imports evaluate first, so **six** imports throw before its first statement" — against `:652-653`, "carries **nine** static imports (`pdlc/engine/bin/pdlc.mjs:22-31`) — three `node:` builtins at `:22-24` and six local modules at `:26-31`". Re-derived at HEAD: `bin/pdlc.mjs:22-24` is three `node:` imports and `:26-31` is six local ones, so §10's nine is right and the register is wrong. The register is the surface PLAN and PROPERTIES transcribe from. **Fix:** one word, plus a changelog clause so the correction is auditable rather than silent (folds into F-01's bump) | §13 (`:820`) vs §10 (`:652-653`) |
| F-06 | Medium | Local | **Restated from v2 F-02, and now confirmed structurally unclosable by PF-4: the shipped `pdlc/engine/.npmignore` has no oracle that goes red if it is deleted.** The upstream half of my round-2 finding **is** resolved — TSPEC now creates the file (`TSPEC:215`) and reconciles D-5 (`TSPEC:153`, `:305-306`), so the erratum against `TSPEC:151` is discharged. But `TSPEC:314` states plainly "npm excludes `.npmignore` (and `.gitignore`) from every tarball — so PF-4's PK-* set is unchanged by it", which settles the question against the real-pack oracle: a test that inspects a tarball can never observe a file npm refuses to put in one. §2 (`:111-114`) turns that file into load-bearing packaging behaviour, and §6 (`:416-418`) rests the cross-npm-major claim on it. On the single npm major CI runs, deleting the file may leave PF-4 green — that is precisely the silent case. **Fix:** two clauses, no redesign. (a) Nominate a repo-shape assertion in the AF-family — the file exists **and** its content contains the `!vendor/workflows/` negation (positive assertion on content, not mere existence). (b) State that PF-4 is single-npm-major evidence, so the cross-major guarantee rests on the shipped file, not on the pack test | §2 (`:105-114`), §6 (`:416-418`) |
| F-07 | Low | Local | **Restated from v2 F-03, unresolved, and now the last surface still carrying the un-nuanced form.** `:816`'s DEC-EDIST-05 row rejects "An `.npmignore` deny-list — a forgotten entry **ships** what should not", with nothing noting that the chosen allow-list nonetheless ships a one-line `.npmignore` carrying only a negation. TSPEC has since written that distinction out explicitly (`TSPEC:305-306`, "This does not mean the package ships no `.npmignore`… D-5's shorthand is about *who decides the packed set*"), and §2/§6 of this document already do. A reader consulting §13 alone still gets the reverse of what was decided — and per F-06 nothing catches the deletion that reading invites. **Fix:** one clause in the register row | §13 (`:816`) |

## Questions

| ID | Question |
|----|---------|
| Q-01 | **Re-asked from v2 Q-02, because it is the one open question with a test consequence and §7's oracle is now the settled shape.** The signalled-child leg asserts the launcher's exit status equals `128 + signum`. Is the expected number a **literal transcription** in the test (fake target self-kills with `SIGTERM`, test asserts `143`), or computed from the observed `signal`? Only the literal form falsifies: `128 + observedSignum` passes even when launcher and test share the same wrong mapping. TSPEC `:479` already writes it the right way ("e.g. `130` for `SIGINT`") — one clause in §7 saying "the expected value is written as a literal, not derived from the observed signal" would put the decision where PROPERTIES transcribes from, and closes this for good |
| Q-02 | Following F-03: when `PROPERTIES-pdlc-engine-distribution.md` is authored, does this feature's property register **re-state** the `exitCodeFor` invariant under a new local id (with a cross-reference to the completed feature's `PROP-EXIT-1`), or **cite the foreign id directly** as an inherited invariant it does not own? Either is defensible; the entry should say which, because the two produce different PROPERTIES tables and different answers to "who re-verifies this if `run.mjs:290` changes" |

## Positive Observations

- **The repair moved the constraint from a document to an executing test, which is a strict
  upgrade in falsifiability.** The old text rested the decision on "AC-1.4's exit-code contract
  (crash 1, halt 2)" — a claim about a spec. The new text rests it on `exitCodeFor`
  (`run.mjs:290`) pinned by `PROP-EXIT-1` (`exit-loop.test.js:88`). If someone changes the
  mapping, a test goes red; the old citation would have gone quietly false, exactly as it did.
  A citation repair that lands on a *shipped oracle* rather than on a differently-numbered AC is
  the version of this fix worth having.
- **The withdrawal is stated, not just silently swapped.** `:470-471` says outright that the
  invariant "is the engine's own, **not** REQ's AC-1.4 — AC-1.4 is the version-triple
  criterion". Deleting the wrong citation and inserting the right one would have passed review;
  writing down *what was wrong* is what stops the phrase being re-introduced by anyone who
  remembers the old wording. Same discipline as §5's round-1 retraction.
- **Both promised sites were repaired, and I could confirm it mechanically.** The post-mortem
  committed to §7's "**both** occurrences" (`POSTMORTEM-D:25`); the body paragraph and the
  "Constraints that forced the shape" row were both rewritten, and a grep for `AC-1.4` over the
  document leaves only §8/§13's legitimate version-triple uses. A promise of "both" that turns
  out to be exactly both, verifiable by one grep, is the kind of remediation record that does
  not need to be re-audited later.
- **The decision itself was left untouched.** `128 + signum`, the exact-number oracle, the
  three-behaviour accounting and the rejection of `!== 0` all survive the edit verbatim. This
  was a citation repair scoped as one, and nothing settled in rounds 1–2 was re-opened — I
  re-read §7's oracle paragraph (`:474-487`) specifically to check the exact-number assertion
  had not been softened while the paragraph above it was rewritten. It had not.
- **The post-mortem's deviation note is the artifact I would want to find in six months.** It
  records that recommendation step 1 was *not* taken, and why: moving assertion (b) up a level
  would have falsified approved DECISIONS §5 text and re-opened this document
  (`POSTMORTEM-D:31-40`). Choosing the option that honours approved text verbatim, and writing
  down that the cheaper option was rejected for that reason, is what keeps an approval anchor
  meaningful.

## Recommendation

**Approved with minor changes**

No High findings. The one edit this round was correct, complete against what it promised, and
verifiable against HEAD in every particular I checked: `exitCodeFor`'s mapping
(`run.mjs:290-294`), its pinning test (`exit-loop.test.js:88`), AC-1.4's actual text
(`REQ:266-270`), and the absence of any third un-repaired occurrence. The revision broke nothing
reviewed in rounds 1–2 — I specifically re-read §7's oracle paragraph to confirm the
exact-number assertion survived the rewrite of the paragraph above it. It did.

Seven findings, none blocking, and they fall into two piles the author should treat differently.

**Three are bookkeeping the remediation could not have known to do** (F-01, F-02, F-03), and
they share one cause: a single-finding repair landed inside a document whose surrounding text
had assumed the pre-repair world. §7 now cites the right invariant but still tells the reader
upstream under-covers a behaviour upstream now covers (F-02); the new citation lacks the
coordinates every other citation in the document carries (F-03); and the document's own version
label no longer distinguishes the approved bytes from the current ones, while its sibling TSPEC
bumped to v0.11 in the same remediation (F-01). F-01 is the one I would fix first — not for
tidiness, but because PLAN and PROPERTIES are about to be authored against "DECISIONS v0.3", and
two byte-states now answer to that name.

**Four are round-2 findings that were never in scope for this remediation** (F-05, F-06, F-07,
plus the still-open half of the `.npmignore` question). They were non-blocking when raised and
remain so. Worth noting that upstream moved under two of them: TSPEC v0.10 discharged my v2
erratum about D-5, and in doing so *confirmed* F-06's mechanism — `TSPEC:314` states the
`.npmignore` is never a packed member, which settles that PF-4 structurally cannot observe its
deletion. That finding is now better evidenced than when I first raised it, and its fix is still
two clauses.

The pattern I flagged in round 2 held again this round, in the good direction: the fix decided a
mechanism (`exitCodeFor` as the named constraint) and nominated the oracle that pins it in the
same edit. What it did not do is sweep the sentences that the fix made false — a cheaper and
more mechanical obligation, and the whole of F-02.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 5, "low": 2}
