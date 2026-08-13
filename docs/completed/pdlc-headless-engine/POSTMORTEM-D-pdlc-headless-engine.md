# POSTMORTEM — Phase D, pdlc-headless-engine

| Field | Value |
|---|---|
| Upstream | `REQ` → `FSPEC` → `TSPEC` → `DECISIONS` → **POSTMORTEM-D** |
| Downstream | operator decision; `LEARNINGS-pdlc-headless-engine.md` at harvest |
| Cross-Reviews | `CROSS-REVIEW-{product-manager,test-engineer}-DECISIONS-v{1,2}.md` (4 files); `CROSS-REVIEW-{software-engineer,test-engineer}-REQ-v8.md` (erratum delta, 2 files) |
| LEARNINGS | `docs/pdlc-headless-engine/LEARNINGS-pdlc-headless-engine.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | halted — awaiting operator resolution | Claude (se-author) | 1.0 | 2026-08-11 |

RESOLVED: yes

Resolution (2026-08-11, operator-directed): Step 1 verified before clearing — both REQ v8 files
end `VERDICT: Approved with minor changes` / `{"high": 0, "medium": 1, "low": 1}` (exact bytes
checked, not a paraphrase); the confirmations (`2d125f41`, `23a1a614`) postdate the erratum edit
`6ff9871a`, which touches REQ only, `+31/−28`. The root-cause account stands: the branch's
artifacts approve and the halt read only the response trailer. Step 2 — anchors appended to both
v8 files in `b65861be`; the digest was recomputed at HEAD (`9176adf0…0957`) and matches the REQ
at `6ff9871a` byte-for-byte. Step 3 — DECISIONS v1.3 (`d02d764e`) rewrites only DEC-ENG-03's
authority paragraph: C-11 (`REQ:284`, verified present at HEAD) cited as the landed REQ
authority, the FSPEC half kept outstanding (`grep -inE "python|interpreter"` over the FSPEC:
zero hits, re-run at HEAD). Step 4 — the discarded FSPEC rung-placement erratum cannot be
pre-filed from here (errata are per-invocation signals); DEC-ENG-03's updated paragraph states
it "remains filed as an erratum" so the round-3 confirmation reviewers re-emit it, per this
file's Step 4. Step 6 noted: if the re-run halts again on approving artifacts, fix the erratum
gate (countermeasure 1) instead of re-invoking.

## Phase

**Phase D (DECISIONS Creation + Review) converged and was then halted by the erratum protocol.**
The DECISIONS document itself is not in dispute: it converged in round 2 and its approval anchors
are recorded. The halt came afterwards, in the erratum wave Phase D routed upward to `REQ` — and it
came with **both delta-confirmation files on the branch carrying approving verdicts**.

| | |
|---|---|
| Documents | `docs/pdlc-headless-engine/DECISIONS-pdlc-headless-engine.md` (v1.2, **converged**, anchors `sha256:bce4becb…` recorded in `96b8671a`); upstream `docs/pdlc-headless-engine/REQ-pdlc-headless-engine.md` (edited to v0.10 in `6ff9871a`) |
| Branch | `feat-pdlc-headless-engine` |
| Halt reason reported | *ERRATUM-PROTOCOL: the REQ delta confirmation was non-approving: `[se-review]`* |
| Erratum items routed to REQ | (1) *se-author:* no constraint authorises requiring a working interpreter on an unattended host — DEC-ENG-03's startup refusal turns a host that previously ran with the guard silently inert into one that cannot run at all; `grep -in "python\|interpreter"` over REQ returned zero hits. (2) *pm-review:* the REQ must state the precondition — a working Python interpreter of the kind probed at `guard-harvest-before-delete.sh:14-21` is required on the host running the engine unattended |
| Round budget | **not exhausted.** `MAX_REVIEW_ROUNDS` is 5; DECISIONS converged in round 2. The binding bound was `MAX_ERRATUM_ROUNDS_PER_DOC = 1` (`orchestrate-dev.js:5644`) — and even that was not exceeded |
| Erratum window | `96b8671a` (DECISIONS approval anchors) → `6ff9871a` (targeted REQ edit, v0.9 → v0.10, `+31/−28`) → `2d125f41` (se delta confirmation) → `23a1a614` (te delta confirmation) |
| Terminal state | **the halt contradicts the artifacts on the branch.** Both confirmation files end `VERDICT: Approved with minor changes` with `{"high": 0, "medium": 1, "low": 1}`; under the High-only bar (`isPassResult`, `orchestrate-dev.js:5230-5233`) each is a pass. Nothing in the repository records a non-approving se-review |
| Collateral | the phase's **second** erratum — the FSPEC EC-row / rung-placement item DEC-ENG-03 also depends on — was never dispatched. `ERRATUM_DOC_TYPES` orders `REQ` before `FSPEC` (`:5613-5617`), and the REQ halt threw out of the routing loop before FSPEC's round ran. `grep -inE "python|interpreter"` over FSPEC still returns zero hits at HEAD |

## Iterations

| Round | Document | Version | pm-review | te-review | Outcome |
|---|---|---|---|---|---|
| 1 | DECISIONS | v1.1 | Needs revision (`f084bdbc`) | Needs revision (`c98fcb05`) | six commits of targeted repair (`a4bd72bc` … `07bb1b0a`): DEC-ENG-03 dropped its EC-GUARD-4 message contract and rung-5 pin and cited upstream authority; DEC-ENG-04 re-cited BR-GUARD-5/O-2; DEC-ENG-05 corrected HEAD measurements |
| **2** | DECISIONS | **v1.2** | **Approved with minor changes** (`ca212254`) | **Approved with minor changes** (`9938f3f8`) | **converged.** Anchors recorded in `96b8671a`. Both reviewers re-emitted the two DEC-ENG-03 errata; pm-review filed the open dependency as `Q-01`, not as a finding, "because it is upstream's state, not this document's" |
| **E1** | **REQ (erratum)** | **v0.10** | *(not a REQ approver)* | — | targeted edit `6ff9871a`; delta confirmation by REQ's own approvers below — **the halt** |
| E1 | REQ (erratum) | v0.10 | `se-review`: **Approved with minor changes** `{0, 1, 1}` (`2d125f41`) | `te-review`: **Approved with minor changes** `{0, 1, 1}` (`23a1a614`) | files approve; **the run reported `se-review` non-approving** |
| — | FSPEC (erratum) | v1.5 | — | — | **never dispatched.** Pre-empted by the REQ halt |

The erratum edit is small and squarely inside the protocol's scope: `+31/−28` lines, one new
constraint **C-11** at `REQ:284-298`, the version row, and a change-note block (the 0.8/0.9 notes
compressed into one paragraph to hold the REQ size budget). `git diff` shows no `AC-`, `BR-`, goal,
non-goal or risk text touched. C-11 declares the engine's ability to execute the shipped guard a
**declared host precondition**, observed once at startup, whose absence is a fail-closed startup
refusal — and explicitly leaves *which* interpreters satisfy it, how the observation is made, the
refusal string, and the check's position among the startup rungs to FSPEC and TSPEC.

## Reviewers

| Reviewer | Verdict in file | Findings | Substance |
|---|---|---|---|
| `se-review` (software-engineer) | **Approved with minor changes** `{0, 1, 1}` | `F-01` Medium: C-11 claims the same footing as C-10 but has no AC of AC-3.2's shape; `F-02` Low: REQ now 695 lines / 54,685 bytes against a 700-line / 60 KB budget | Verified both erratum items cleared, re-ran the author's own grep (`REQ:23`, `:25`, `:285-298`), re-checked the `guard-harvest-before-delete.sh:14-21` citation line-by-line at HEAD, and audited four places the new refusal could contradict standing text (AC-4.1's closed catalogue, AC-2.1's first-match table, C-8's string catalogue, NG-1) — all intact |
| `te-review` (test-engineer) | **Approved with minor changes** `{0, 1, 1}` | `F-04` Medium carried forward to FSPEC/TSPEC review; `F-05` Low process note | "The delta resolves both errata and breaks nothing previously approved: the AC set is byte-stable at 26, the constraint set gains only C-11, the guard citation holds at HEAD, and NG-1 is preserved explicitly" |

Neither reviewer raised a High. Neither asked for a re-edit. `se-review` closed with the opposite
of a rejection: "neither is gating and neither should trigger a re-authoring round."

Two further facts about these two files matter for recovery:

- **They carry no approval anchors.** `grep -c "APPROVAL-HASH\|REVIEWED-COMMIT"` returns `0` for
  both REQ v8 files, and `2` for the DECISIONS v2 files. The anchor append runs *after* the
  confirmation gate (`orchestrate-dev.js:9357` onward); the halt threw first. So REQ's recorded
  approval still points at v0.9's bytes even though its approvers confirmed v0.10.
- **`se-review` left a note for the DECISIONS author**, explicitly not a finding against REQ:
  DEC-ENG-03 still reads that `grep -in "python\|interpreter"` over REQ and FSPEC "returns **zero
  hits in both**" and still describes its authority as pending (`DECISIONS:183-196`). That sentence
  is now half false — the REQ half by design, as the downstream half of this same erratum wave.

## Pattern of Disagreement

**There is none.** This is the first halt in this feature's history with no disagreement of any
kind to record — not between reviewers, not between reviewer and author, not between document and
HEAD.

- The two DECISIONS approvers agreed with each other in round 2 and approved.
- The two REQ approvers agreed with each other in round E1 and approved.
- The erratum author did what both erratum items asked, at the altitude both asked for, and both
  confirming reviewers said so in their Positive Observations.
- The only open items on the branch are one Medium and one Low per reviewer, all four explicitly
  non-gating and routed to the next time the document is opened.

Prior halts in this feature turned on real substance: POSTMORTEM-T on a claim duplicated at a
search-resistant second site, POSTMORTEM-F on a reviewer re-deriving a cell another did not.
This one turns on nothing a participant said. **The disagreement is between the run report and the
branch.** The report names `se-review` as non-approving; `se-review`'s file, committed in
`2d125f41` before the halt was written, ends:

```
VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}
```

That is a pass under every rule the workflow states: the value is in the closed catalogue, the
counts parse, `high === 0` clears the High-only bar. Two records of one reviewer's judgement
disagree, and the one that decided the phase is the one no longer in existence.

## Best-Guess Root Cause

**A reviewer's verdict has two carriers — the response trailer and the cross-review file — and the
erratum delta-confirmation gate reads only the volatile one, with a fail-closed default and none of
the recovery the ordinary review loop has.**

The gate is one line (`orchestrate-dev.js:9343-9345`):

```js
const verdicts = reviewers.map((skill, i) => parseVerdict(responses[i], skill));
const nonApproving = reviewers.filter((_, i) => !isPassResult(verdicts[i]));
```

`parseVerdict` (`:4136`) scans the **agent's response string** in reverse for the last
`VERDICT: ` line. A response that is empty, that never emitted a trailer, or whose trailer value
falls outside `VALID_VERDICTS` returns the fallback `{verdict: "Needs revision", high: 0,
medium: 0, low: 0, malformed: true}` — correct fail-closed behaviour in isolation, and
indistinguishable at the call site from a reviewer who genuinely rejected the delta.

Compare the review loop this path borrows its shape from (`:5987-6008`), which does two more things
before deciding:

1. On `malformed`, it spends one cheap Haiku `recoverVerdict` call (`:7443-7466`) asking the same
   reviewer to re-emit its own trailer without redoing the review.
2. Across invocations, the approval search reads the **file** through `extractFileVerdict`
   (`:4637`, used at `:6635`) — the carrier that survives the process.

The erratum path has neither. It never reads the confirmation file it just instructed the reviewer
to write, even though that file is on disk and committed by the time the gate runs, and even though
`extractFileVerdict` exists three thousand lines above for exactly this purpose. So the most
probable chain is:

1. `se-review` performed the delta confirmation, wrote `CROSS-REVIEW-software-engineer-REQ-v8.md`,
   committed it (`2d125f41`), and returned a summary whose final lines did not carry a parseable
   `VERDICT: ` trailer — the ordinary trailer-loss mode the review loop pays a Haiku call to absorb.
2. `parseVerdict` returned the `malformed` fallback: `Needs revision`.
3. `isPassResult` rejected it, `nonApproving` became `["se-review"]`, and `erratumPostmortemHalt`
   ran — writing this document.
4. Nothing consulted the file that says otherwise, and nothing recorded the response text, so the
   halt cannot be audited after the fact from the repository alone.

**The falsifiable claim** is step 1, and it is falsifiable only outside the repository: if the run
transcript shows `se-review` returning a well-formed `VERDICT: Needs revision` trailer, this root
cause is wrong and the real defect is a reviewer whose response contradicted its own committed
file — a different and worse problem. Everything from step 2 on is readable in the shipped code and
holds under either hypothesis: **a delta confirmation cannot fail on this branch's artifacts.**

Two contributing factors, neither sufficient alone:

- **The erratum gate is a copy of the review gate that lost its safety net.** Both decide the same
  question — "did these two reviewers pass?" — and only one of them treats a missing trailer as
  recoverable. The asymmetry is invisible at the call site; the erratum path reads as complete.
- **The halt is terminal at the first upstream document.** `routeErrata` iterates
  `ERRATUM_DOC_TYPES` in pipeline order and `erratumPostmortemHalt` throws, so a spurious failure on
  `REQ` silently discarded the FSPEC erratum queued behind it. The phase lost a real item to a false
  one, and the run report names only the false one.

## Recommendation

**Do not re-author anything. Do not re-open C-11, DEC-ENG-03's retained half, or any DECISIONS
entry. The branch already holds the converged DECISIONS, the landed REQ erratum and two approving
confirmations of it.** What is missing is bookkeeping the halt pre-empted, one downstream sentence,
and one erratum that never got dispatched.

### Step 1 — Verify the contradiction yourself before clearing anything

Three commands, all cheap; if any disagrees with this document, stop and re-diagnose:

```
grep -A1 "^VERDICT:" docs/pdlc-headless-engine/CROSS-REVIEW-{software-engineer,test-engineer}-REQ-v8.md
git log --oneline 96b8671a..HEAD -- docs/pdlc-headless-engine/
git show --stat 6ff9871a
```

Expected: both files end `VERDICT: Approved with minor changes` / `{"high": 0, "medium": 1,
"low": 1}`; the confirmations (`2d125f41`, `23a1a614`) are committed *after* the erratum edit
(`6ff9871a`); the edit touches REQ only, `+31/−28`.

### Step 2 — Append the approval anchors the halt skipped (se-author or operator)

REQ's approvers confirmed v0.10, but the anchor append never ran, so REQ's recorded approval still
pins v0.9's bytes. Append beneath the `## Verdict` section of **both** `…-REQ-v8.md` files — the
sanctioned post-terminal write, which adds no second `VERDICT:` line:

```
APPROVAL-HASH: sha256:9176adf0e0f33b085bf238dc181741c7991315474d864c76673bb7e20c970957
REVIEWED-COMMIT: 6ff9871a
```

The digest above is `shasum -a 256` over `REQ-pdlc-headless-engine.md` at HEAD; re-compute it
before writing rather than trusting this line, and re-compute it again if Step 3 or 4 touches REQ
(they should not). Commit pathspec-scoped to the two review files.

### Step 3 — Update DEC-ENG-03's stale sentence, and only that sentence

`DECISIONS:183-196` still asserts `grep -in "python\|interpreter"` returns "**zero hits in both**"
and that its authority is pending. The REQ half of that is now false. This is the downstream half
of the erratum wave, exactly as `se-review` flagged it: rewrite the sentence to cite **C-11
(`REQ:284-298`)** as the landed authority for the startup refusal, keep the FSPEC half as still
outstanding (verified: `grep -inE "python|interpreter"` over FSPEC returns zero hits at HEAD), and
bump DECISIONS to v1.3 with a one-line change note naming this postmortem. Change no other entry,
no alternative, no consequence table. Both DECISIONS approvers will see it in the confirmation
round Step 5 opens.

### Step 4 — Re-file the FSPEC erratum that never ran

The rung-placement item (te `F-02`, pm `F-02`/`Q-01` in the DECISIONS v2 reviews) — whether the
interpreter observation surfaces as rung 6, or as rung 5 redefined with per-cause ids, given
BR-START-2's totality (`FSPEC:307-311`) and `RungRecord`'s pinned `rung: 0..5` (`TSPEC:834`,
`:840`) — was queued behind the REQ round and discarded by the halt. It must be re-emitted as an
`ERRATUM: FSPEC:` line in the re-run, or it is lost: nothing in the repository remembers a
discarded erratum. The re-invocation's erratum budget is per-invocation, so the round is available.

### Step 5 — Flip the marker with evidence, then re-invoke Phase D

Set `RESOLVED: yes` in this file only after Steps 1–4 are on the branch, with the clearing commit
naming what it verified. Then:

```
/pdlc:orchestrate-dev { "reqPath": "docs/pdlc-headless-engine/REQ-pdlc-headless-engine.md", "forcePhases": "D" }
```

`forcePhases: "D"` overrides Phase D's recorded approval (necessary — Step 3 edits DECISIONS, which
invalidates the v1.2 anchors anyway); it does **not** clear this POSTMORTEM, which is why the marker
is flipped first. `deriveRoundWindow` reads the four existing DECISIONS cross-review basenames and
opens round 3 against v1.3. Expect a cheap confirmation round, then the FSPEC erratum round — and
expect the REQ erratum step to find nothing to route, because C-11 exists.

### Step 6 — If the re-run halts the same way, stop and read the transcript

A second spurious non-approval on artifacts that approve is not a phase problem; it is the runtime
defect below, and no number of re-invocations will clear it. In that case the correct move is to
fix `orchestrate-dev.js`'s erratum gate (countermeasure 1) rather than to spend another Phase D.

### Durable countermeasures (route to LEARNINGS at harvest; not blocking this halt)

1. **The erratum delta-confirmation gate should read both verdict carriers, like the review loop
   does.** `orchestrate-dev.js:9343` should, on `malformed`, spend the same `recoverVerdict` call
   the loop spends at `:5991`, and failing that read the confirmation file it just commissioned via
   `extractFileVerdict` (`:4637`). A committed file that says "Approved with minor changes" must not
   lose to an absent trailer. Fail-closed is right when there is no evidence; here there was.
2. **A halt must name the evidence it read.** The reported reason says `non-approving: [se-review]`
   and nothing else — not "trailer unparseable", not the file path it did or did not consult. Had
   the message distinguished *rejected* from *unreadable*, this postmortem would have been one line
   of triage. Halt reasons that decide a phase should carry the parse's provenance.
3. **A halt on one upstream document silently drops the errata queued behind it.** `routeErrata`
   throws mid-iteration over `ERRATUM_DOC_TYPES`; the FSPEC item vanished with no record. At
   minimum the halt reason should enumerate the unrouted items so recovery does not depend on a
   human re-reading round-2 cross-reviews.
4. **Reviewer response trailers are the least durable of the three carriers, and the erratum path
   is where they are load-bearing.** The project already knows this — the file-verdict rule exists
   precisely because "the response trailer only feeds the loop inside the current invocation". The
   erratum protocol was added later and did not inherit the lesson. Worth a project-level decision
   that *every* gate deciding a phase reads the file, with the response as an accelerator only.
