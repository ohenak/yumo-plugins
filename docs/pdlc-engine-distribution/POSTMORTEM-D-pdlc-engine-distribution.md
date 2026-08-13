# POSTMORTEM — Phase D — pdlc-engine-distribution

| Field | Value |
|---|---|
| Upstream | `REQ → FSPEC → TSPEC → DECISIONS → **POSTMORTEM-D**` |
| Downstream | operator decision; `LEARNINGS-pdlc-engine-distribution.md` at harvest |
| Cross-Reviews | `CROSS-REVIEW-{product-manager,test-engineer}-DECISIONS-v{1,2}.md`; erratum confirmation `CROSS-REVIEW-{product-manager,test-engineer}-TSPEC-v10.md` |
| LEARNINGS | `docs/pdlc-engine-distribution/LEARNINGS-pdlc-engine-distribution.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | Halted — Phase D erratum confirmation | Claude (se-author) | 1.0 | 2026-08-13 |

RESOLVED: no

## What Halted

**Phase D's own document converged. The halt is the erratum protocol's, not the review
loop's: the erratum round Phase D raised against its upstream TSPEC came back
non-approving from one of the two reviewers, and the protocol allows one erratum round per
upstream document per phase.**

| | |
|---|---|
| Phase document | `docs/pdlc-engine-distribution/DECISIONS-pdlc-engine-distribution.md` — **v0.3**, approved |
| Branch | `feat-pdlc-engine-distribution` |
| Halt reason | Erratum delta-confirmation on **TSPEC v0.10** non-approving: `te-review` **Needs revision** `{"high": 1, "medium": 2, "low": 0}` (`CROSS-REVIEW-test-engineer-TSPEC-v10.md:81-82`) |
| Non-approving reviewer | `te-review` only. `pm-review` returned **Approved with minor changes** `{"high": 0, "medium": 2, "low": 1}` (`CROSS-REVIEW-product-manager-TSPEC-v10.md:88-90`) |
| Round budget | Not exhausted, and not the cause. DECISIONS spent **2 of 5** rounds. TSPEC's lifetime window stands at **10 of `MAX_LIFETIME_ROUNDS` 15** |
| Erratum budget | **Exhausted for TSPEC in this phase** — one round, spent |

DECISIONS itself is in good order and no part of this post-mortem asks for it to be
re-authored:

| Round | DECISIONS version | PM verdict | TE verdict |
|---|---|---|---|
| 1 | v0.2 | Needs revision (`CROSS-REVIEW-product-manager-DECISIONS-v1.md:120`) | Needs revision (`…-test-engineer-DECISIONS-v1.md:118`) |
| 2 | v0.3 | **Approved with minor changes** `{0, 1, 1}` | **Approved with minor changes** `{0, 2, 1}` |

Both round-1 High findings were closed at the level raised, and both reviewers said so
(`CROSS-REVIEW-test-engineer-DECISIONS-v2.md:93`). Two of those closures — DEC-EDIST-04's
corrected notice accounting (§5) and DEC-EDIST-06's signalled-child decision (§7) — are
precisely the material the phase then had to route back up as errata, because the record had
now decided something its own upstream TSPEC still stated wrongly. That is the erratum
channel working as designed. What failed is one item's *landing*, not its *routing*.

## The Erratum Round

Seven items were raised against TSPEC while DECISIONS was in review. Upstream was re-grounded
first, per DEC-ERR-01: REQ is v0.10 and FSPEC v0.2 at HEAD, both last edited *below* the
approval anchor `a3d3489a`, so there was nothing to absorb and no upstream decision to route
back. Both reviewers verified that claim independently and both found it true.

The edit landed as six commits plus a changelog commit, `046f0c58…85ecb399`, and both
reviewers confirmed by diff that it touches only the hunks the changelog claims and re-opens
nothing settled in rounds 1–8.

| # | Raised item | Commit | Landed? |
|---|---|---|---|
| 1 | §5.4/PF-3 closes O-8 blocker 1 but records still count three open | `046f0c58` | Yes — §5.1 (`TSPEC:216-221`), PF-3 (`:1199`), DECISIONS §12 (`:769-784`) now agree; one routing loose end, PM `F-02` |
| 2 | `.npmignore` absent from §5.1's inventory while DEC-EDIST-01/05 ship one | `046f0c58` | Yes — inventory row (`TSPEC:214`), one line `!vendor/workflows/`, never a packed member, PK-* set unchanged |
| 3 | §5.2 does not schedule the file beside the `vendor/` git-ignore rule | `dd3df53d` | Yes — `TSPEC:241-247`, both files authored in one task, PLAN ownership manifest keeps one row |
| 4 | D-5's wording contradicts a shipped `.npmignore` | `2243fecc` | Yes — D-5 (`:152`) now reads "a `files` allow-list **decides the packed set**"; §5.4 (`:302-313`) states the two consequences; consistent with DECISIONS §6 (`:416-419`) |
| 5 | §6.2 names signal handling as needing assertion but decides only exit code and stdio | `403f4057` | Substantively yes — `128 + signum` for `status === null` (`:457-466`), **exact-number** oracle (`:469-478`, §12.1 fixture row `:1770`). One citation defect rode in with it — PM `F-01` / TE `F-47` |
| 6 | §6.5's "the catalogue equality covers it for free" is false at HEAD | `da2f2798` | **Partly** — the false claim is correctly withdrawn; the replacement oracle is not writable as specified. TE `F-45`, `F-46` |
| 7 | AC-5.6 needs a named path-level oracle | `da2f2798`, `e0bff33a` | **Partly** — same defect as item 6 |

Five of seven items land cleanly. The two that half-landed are the same §6.5 defect, raised
twice from different directions.

## What the Confirmation Found

Three findings, one blocking.

| ID | Reviewer | Severity | Finding |
|---|---|---|---|
| `F-45` | te-review | **High** | **AC-5.6's path-level oracle is not writable as §6.5 specifies it.** §6.5 (`TSPEC:650-655`) names "a unit test over `resolvePluginRoot`" asserting (a) the returned root is the discovered one and (b) "the run's notices contain the entry by catalogue id, with its rendered text". At HEAD `resolvePluginRoot` returns `{ok, root, source, reason, tried}` (`pdlc/engine/lib/skills.mjs:204-231`, JSDoc `:200-201`) — **there is no notices channel on it**. §3.1 places the ignored-env notice in the startup module (`TSPEC:101`) while the `skills.mjs` row (`:102`) says only that the function "gains a `devDeclared` input", and §10.1 carries no seam row for it. Half (a) is writable; half (b) is not, at the unit named |
| `F-46` | te-review | Medium | **The honour-direction assertion decided in DECISIONS §5 has no counterpart in the new text.** DECISIONS' assertion 2 (`DECISIONS:335-336`) requires the `devDeclared: true` × variable-set row to assert the variable **is** honoured, so that an implementation ignoring it unconditionally is caught. §6.5's new paragraph pays only the absence half — the three other rows assert **no** notice, which a permanently-silent implementation satisfies |
| `F-47` / PM `F-01` | both | Medium | **`AC-1.4's exit-code contract` cites an authority that does not exist upstream.** §6.2 (`TSPEC:461`) and the v0.10 changelog justify the signalled-child decision by that phrase; at HEAD AC-1.4 is the version-triple AC (`REQ:266-270`) and REQ carries no exit-code statement anywhere. The decision is sound — "crash 1, halt 2" is shipped behaviour, `exitCodeFor` (`pdlc/engine/lib/run.mjs:283-295`, PROP-EXIT-1) — it is pinned to the wrong record, in **two** documents (TSPEC §6.2 and DECISIONS §7, `:467`) |

PM raised one further Medium, `F-02`: §5.1's blocker-1 closure (`TSPEC:216-221`) states that
this feature closes O-8 blocker 1, while REQ (`:578-589`) and FSPEC (`:211-215`, `:795-802`)
still say all three blockers are operator-owned, and the TSPEC's mitigation points *downstream*
at records that cannot absorb it. That is a routing gap against a second upstream document,
not a defect in the closure itself.

**The two reviewers did not disagree.** Both confirmed the same five clean items with the same
evidence; both independently verified the §6.5 withdrawal's three citations at HEAD and called
it exemplary; both raised the AC-1.4 mis-citation. They parted on one question only — whether
the *replacement* oracle in §6.5 is executable. PM checked the new oracle against **upstream**
(AC-5.6 exists as cited, `REQ:422`; the positive/absence split matches its trigger) and found
it sound. TE checked it against **shipped code** and found the observation channel absent.
Both checks were correct; they were checks of different things, and only one of them can make
a test file exist.

## Best-Guess Root Cause

**The erratum edit transcribed DECISIONS' decided text into the TSPEC faithfully, and the
defect was already inside the text being transcribed. `resolvePluginRoot` never had a notices
channel; DECISIONS §5 (`:332`) says it "returns a notice list containing the
`env.plugin-root-ignored` id", and §6.5 carried that sentence up one layer unchanged.
Fidelity to the item list is exactly what the erratum protocol asks for, and it is what
propagated the one thing no reviewer had yet checked.**

Three contributing conditions, in order of leverage:

1. **The originating correction was reviewed for its retraction, not for its replacement.**
   DECISIONS §5 is a *good* entry: it names the earlier draft's error, proves it false at HEAD
   with three exact citations, and replaces it with two assertions. TE's DECISIONS round-2
   review scored it "Resolved" on precisely those grounds
   (`CROSS-REVIEW-test-engineer-DECISIONS-v2.md:19`), and the round-2 questions probed the
   assertions' *coverage* (`Q-03`: is the fourth row asserted?) rather than their *addressability*
   (on what object is a notice observed?). A retraction verified against HEAD reads as
   well-grounded work, and it was — the grounding just stopped one clause short of the new
   claim. Both reviewers approved, so nothing flagged the shape before it was promoted.

2. **An erratum round is a transcription task by construction, and transcription suppresses
   re-grounding.** In a normal authoring round the author is writing a claim for the first time
   and the standing instruction is to verify it against code and cite `file:line`. In an
   erratum round the claim already exists, decided, in a sibling record; the author's success
   condition is that the upstream document now says what was decided. Six of the seven items
   here were genuinely of that kind — a manifest row, a schedule line, a wording reconciliation
   — and were done well. Item 6/7 was not: it required specifying a *new test* against a
   *shipped function signature*, which is authoring work wearing an erratum's clothes. The same
   mechanism explains `F-46`: the round carried assertion 1 of DECISIONS §5 and left assertion
   2 behind, because the raised item named the false claim to withdraw, not the decision record
   to reproduce in full.

3. **One erratum round per upstream document means the first transcription is the only one,
   and this round spent its single attempt on its hardest item twice.** Items 6 and 7 are the
   same §6.5 defect entered from two directions, so seven raised items were really six, and the
   hardest of them — the only one requiring a new oracle rather than a reworded sentence — had
   no second hop available. The budget is right; the observation is only that a round mixing
   five reword-grade items with one specify-a-new-test item will be judged on the latter.

**What was not the cause.** Not reviewer disagreement — the two reviewers agree on every item
and on all shared findings; they applied different, individually correct grounding sets. Not
round exhaustion — DECISIONS spent 2 of 5, TSPEC stands at 10 of 15 lifetime. Not upstream
drift — REQ v0.10 and FSPEC v0.2 are stable and both reviewers verified the anchor ordering.
Not re-litigation — zero settled decisions were re-opened, and both reviewers confirmed that
by diff. Not authoring stall — the seven-commit edit landed in section-sized commits with no
`MAX_AUTHORING_ATTEMPTS` pressure. Not a wrong decision — DEC-EDIST-04 and DEC-EDIST-06 are
both endorsed by both reviewers; only their *expression* upstream is defective.

## Recommendation

This halt clears by a **bounded, targeted TSPEC edit — four clauses in three sections — not by
re-authoring anything**. DECISIONS v0.3 is approved and needs no change except one citation.
The blocking finding is a design question with a one-sentence answer that the document's own
§3.1 already implies.

**Step 1 — Answer `F-45` by naming the observation level, not by widening the function.**
TE's `Q-23` asks it directly. §3.1 already places the ignored-env notice in the **startup**
module (`TSPEC:101`) and gives `skills.mjs` only the `devDeclared` input (`:102`), so the
consistent answer is that `resolvePluginRoot` decides the root and the startup composition
emits the notice — and the path-level oracle therefore drives **the startup unit that calls
`resolvePluginRoot`**, asserting (a) on the resolver's return and (b) on the notices the
startup unit produces. Whichever answer is taken, three places must move together or the next
round finds the third: §6.5's oracle sentence (`:650-655`), §12.1's unit row (`:1767`), and
§10.1's seam table. If instead the decision is to give `resolvePluginRoot` a `notices` member,
that is a signature change and §3.1's `skills.mjs` row (`:102`) must say so.

**Step 2 — Close `F-46` in the same edit.** Add the positive honour-direction assertion to
§6.5 and to §12.1's unit row: row 1 (`devDeclared: true`, variable set) asserts the resolved
root `===` the env value and `source` unchanged. This is DECISIONS §5's assertion 2
(`:335-336`) transcribed; it makes the four-row oracle falsifiable in both directions, so an
implementation that ignores the variable unconditionally goes red.

**Step 3 — Close `F-47` / PM `F-01` in both documents.** Replace "AC-1.4's exit-code contract"
with the shipped invariant it actually rests on — `exitCodeFor` (`pdlc/engine/lib/run.mjs:283-295`,
PROP-EXIT-1) — at `TSPEC:461`, in the v0.10 changelog sentence, and at `DECISIONS:467` plus
DEC-EDIST-06's "Constraints that forced the shape" row. Per PM `Q-02`, prefer stating the
constraint **once** in DECISIONS §7 and having §6.2 defer to DEC-EDIST-06, so there is one
place left to be wrong instead of two. Take this even if nothing else is taken: it is the
finding that propagates, because PLAN and PROPERTIES will copy the phrase forward from two
documents.

**Step 4 — Decide PM `F-02`'s routing, and prefer the narrow option.** Option (b) — reword
§5.1 to "blocker 1 is discharged by this feature's manifest edit; O-8's owner field is
unchanged because clearing it still gates AC-3.1's real-channel leg" — costs one sentence and
raises nothing upstream. Option (a) opens an FSPEC erratum, which is a fresh upstream document
and therefore a fresh erratum budget, but it also opens a second confirmation surface while
this one is unresolved. Take (b) now; if FSPEC F-5 step 7 and Q-8 still read wrongly at Phase
P, raise it there where it is cheap.

**Step 5 — Fix the changelog arithmetic (PM `F-03`).** `TSPEC:27` says "Four items" and then
numbers five. Say five, and note that raised items 5 and 6 are one §6.5 defect.

**Step 6 — Verify, version, flip the marker.** Land steps 1–5 as **TSPEC v0.11**, section-sized
commits, one changelog row naming the three round-10 findings and their fix sites. Then set
`RESOLVED: yes` in this file with the verification date and the commit range checked, and
commit. Do not flip the marker on the strength of the plan above — flip it on the strength of
the edit having landed and been read back at HEAD.

**Step 7 — Re-invoke Phase D.**

```
/pdlc:orchestrate-dev {"reqPath": "docs/pdlc-engine-distribution/REQ-pdlc-engine-distribution.md", "forcePhases": "D"}
```

The re-invocation gets a fresh erratum budget for TSPEC, so the v0.11 edit is confirmable as
round 11 rather than being an unreviewed hand-edit carried into Phase P. Expect a delta
confirmation, not a re-review: three findings, three fix sites, one design answer. TSPEC's
lifetime usage would stand at 11 of 15 — the margin is real but no longer generous, which is
the other reason to make this edit complete rather than incremental.

**If round 11 does not converge, change the grounding discipline, not the budget.** The
standing instruction for any future erratum round should be: *an erratum item that names a new
test or a new observation is authoring work, not transcription — before writing it, read the
function or module the assertion will run against and cite its signature at `file:line`; if the
value the assertion needs is not on that object, say where it is before naming the unit.* And:
*transcribe the whole decision, not the sentence that was quoted in the item* — `F-46` exists
only because assertion 2 was never asked about.

**Not recommended.** Forcing Phase P on TSPEC v0.10. `F-45` is not a documentation defect; it
specifies a test that cannot be written as stated, and PLAN's author would faithfully create a
task row for it whose honest implementation cannot go green — discovered in Phase I, where it
is expensive, rather than in a confirmation round, where it costs one sentence. `F-47` is the
same argument in the cheaper direction: a false citation copied into two more documents is four
fix sites instead of two. Both are exactly the class of defect a confirmation round is for.
