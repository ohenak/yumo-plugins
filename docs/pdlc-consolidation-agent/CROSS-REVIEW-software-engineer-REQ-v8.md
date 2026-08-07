# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md`
**Date:** 2026-08-06
**Iteration:** 8
**Scope:** Local (delta re-review — v7 findings + changed sections only)
**Baseline diffed:** `9c5ea35..HEAD` (9 revision commits, +122/−102; 683 lines, up from 663)

## Prior-Finding Disposition

All five v7 findings, checked against the revision.

| v7 | Severity | Status | Evidence in the revision |
|---|---|---|---|
| F-01 | High | **Resolved — by the `action` discriminator, and the consequence is stated where a reader will hit it** | NFR-4 is now keyed "on the pair `(failure-mode-id, action)`" (`:527-528`) and states the rejected alternative in its own words: keying on the id alone "would let a merged `promote` PR suppress the `revise` and `retire` proposals AC-5.3 requires, making the remediation of an `ineffective` promotion unreachable and the §1 `Unfalsifiability` problem unsolved" (`:531-533`) — the finding's own argument, written down as the reason for the key rather than as a patch to it. `merged` stays in the key set with the qualification the finding asked for: "deliberately, and now harmlessly … with `action` in the key it suppresses only a re-`promote`, never a remediation" (`:536-538`). AC-5.1 carries the visible consequence in a new "Action, and what it discriminates" paragraph (`:390-394`): "a merged `promote` PR bars a second `promote` for that `(phase, artifact)` pair forever and bars **nothing else**". AC-5.4 restates it at the remediation site (`:448-449`). The AC-5.3 route is reachable. |
| F-02 | Medium | **Resolved, both halves, with one grammar** | The trailer is redefined as `PDLC-CONSOLIDATION-PROMOTIONS: {sorted id:action pairs}`, "one `{failure-mode-id}:{action}` pair per proposal the PR enacts … and **set-equal** to the proposals the PR enacts: a revision or a retirement (AC-5.4) sharing the PR is enumerated here like any other, under its own action" (`:246-248`) — so the membership question the finding said was undecided is now answered explicitly, in the direction that keeps the trailer set-equal. AC-3.3's "its own id" is gone: the retirement commit "carries the **retired promotion's own `failure-mode-id`** under the `revise` or `retire` action — AC-5.1 mints no second id for it" (`:263-264`), and the commit trailer moved to `PDLC-PROMOTION-ID: {id}:{action}` (`:261`) so the commit key and the PR key are one grammar. A PROPERTIES author now has exactly one enumeration to transcribe. |
| F-03 | Medium | **Resolved by the first of the two offered fixes, and the §4b row came with it** | AC-7.2's biconditional is scoped: "Its `pr:` field carries the URL of a PR **this pass opened**, when and only when this pass opened one — the biconditional is scoped to *this pass's own* PR, so an all-suppressed `no-op` (AC-1.4's second cause) leaves `pr:` empty and carries its evidence in the distinct `suppressed-by:` field instead (NFR-4, §4b); the two fields are never merged and a row may carry both" (`:507-509`). That last clause disposes of the mixed case the finding raised (a pass that opened one PR and suppressed another) without inventing a rule for telling two URLs apart. NFR-4 was updated to the same field name and states the negative half positively — the URL goes "in its log row's `suppressed-by:` field (§4b) … and **never** in AC-7.2's `pr:` field, which stays empty for a pass that opened nothing" (`:534-536`) — and both fields got §4b rows (`:605-606`), which is what Q-03 asked for. `suppressed-by:`'s permitted statuses (`promoted`, `promoted-degraded`, `no-op`) are set-equal to `duplicate-suppressed`'s own row (`:596`); I checked, they agree. |
| F-04 | Low | **Resolved** | The exempt record's field list now reads "status, trigger, `credential:`, reason code, and the held marker's passId and ISO-8601 timestamp, which AC-1.3 requires it to name, and only those" (`:36-37`), set-equal to AC-1.3's own requirement. The "never a basename" argument was kept and strengthened rather than dropped — it is restated as a property of the whole field set ("**no field it carries is ever a basename**") and then discharged for the two new members: "A passId is `{YYYY-MM-DD}-{n}` and a timestamp is neither a `LEARNINGS-*.md` basename" (`:38`). |
| F-05 | Low | **Resolved, and the mechanism is named rather than implied** | AC-1.3 now carries the complementary clause: "Because a standalone untracked file in a tracked directory is committable by any actor that is not pathspec-scoped, 'working tree only' is guaranteed against actors other than the pass too: this feature adds `docs/_decisions/.consolidation-lock` to the repository `.gitignore` (§5), which today carries no pattern matching it" (`:72-75`), with the HEAD `.gitignore` contents transcribed inline (verified, row 3 below) and the cost of omitting it stated ("a committed lock reaches every fresh clone and refuses every pass with `consolidation-in-progress` until `staleLockMinutes` elapses, per clone", `:75-76`). §5's in-scope list gained the matching row (`:632-633`), so the edit is scoped as work rather than assumed. |

Five of five resolved. No v7 fix regressed, and the F-01/F-02 fixes propagated into the four places
that depend on them without being asked twice — NFR-4, the REQ-CONS-03 trailer preamble, AC-3.3 and
AC-3.8b's "PR route under the same abandonment" paragraph (`:202-204`) all now say
`(failure-mode-id, action)` in the same words.

The three findings below are **new**, and two of the three are consequences of this round's own
edits: the `action` key (F-01) and the narrowed `artifact` definition (F-02). That is the same
pattern as v7 — a sharpening makes a previously-fuzzy contract collide visibly with a neighbour.
Neither is a regression in quality; both are the next contradiction down.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **The `action` set is closed at three members and the key is the pair, so each action fires at most once per id in the life of the repository — which makes a *second* revision unreachable, and AC-5.1's "reach the AC-3.1 route unimpeded" false as written.** Replay it with the revision's own rules. Promotion X (`(phase, artifact)` ⇒ id `x`) is promoted, merged, and two passes later flagged `ineffective`. AC-5.3 lets the pass propose "either a revision or a retirement" (`:435`); it proposes a revision, which routes as a PR (AC-5.4 `:447-448`) carrying `x:revise`. That merges. The edit still does not work: X recurs on two more counted passes, is flagged `ineffective` again (AC-5.3's streak is "counted per `failure-mode-id`", `:438`, and a revision does not reset it — nothing says it does), and the pass proposes a revision again. NFR-4 now fires on the pair: "A pass whose proposal's pair is already on a PR in state **open or merged** opens nothing for it, records `duplicate-suppressed`" (`:534-535`). `x:revise` is merged, so the second revision opens nothing — permanently. AC-5.1's claim that the remediations "are never suppressed by the promotion they remediate, and reach the AC-3.1 route unimpeded" (`:393`) is literally true in its first clause and false in its second: the second revision is suppressed, not by the `promote`, but by the first `revise`. The consequence is that AC-5.3's central promise — "an edit that did not work is not left in place indefinitely" (`:435`) — can fail, because AC-5.3 gives the pass a free choice between the two alternatives and nothing routes it to `retire` when `revise` is spent. It is weaker than v7 F-01 (there *both* alternatives were barred; here `retire` is always available once, so the promise is *achievable* but not *guaranteed*), which is why it is Medium and not High — but it is the same defect one level down, and it is a REQ-layer contradiction because both sentences are requirements: AC-5.1 asserts unimpeded remediation and NFR-4's key impedes it. Three fixes, any one of which closes it, cheapest first: (a) state in AC-5.3 that a pass whose chosen alternative is already suppressed proposes the other one, and that `retire` is the terminal remediation — one clause, and it makes the promise total; (b) state that a merged `revise` does not bar a later `revise`, since by construction a revision is a *different edit* to the same file (this weakens the pair key exactly where duplicate-suppression has no work to do, because a revision is never accidental); (c) qualify AC-5.1's sentence to "reach the AC-3.1 route unimpeded **by the `promote` they remediate**", and state the once-per-action limit as an accepted cost with a D-CONS row — the honest-cost shape this document already uses well (D-CONS-08). I would take (a): it keeps the guarantee rather than pricing its loss. | AC-5.1 "Action, and what it discriminates", NFR-4, AC-5.3, AC-5.4 |
| F-02 | Medium | Local | **AC-5.1's narrowed `artifact` presupposes that every promotion edits exactly one file, and no requirement in the document says so — a multi-file promotion has no derivable `failure-mode-id`.** `artifact` is now "**exactly one canonical repository path, never a glob and never a directory**: the single file the edit touches" (`:369-370`). The definite article is doing load-bearing work: it is a *function's input*, so if the edit touches two files the id is undefined, not merely awkward. I grepped the document for the constraint that would justify it and it is not there — AC-3.3 says "each edit is a separate commit" (`:260-261`) which pins commits per *promotion*, not files per commit; AC-3.1's routing predicate is stated over "any path under the guard set" (`:251`); AC-2.1/AC-2.2 name single files but only for the two consuming-repo routes; §5 and §4b are silent. And the case is ordinary in this repo, not a corner: the guard set (`MERGE_GUARD_DEFAULTS`, verified `orchestrate-dev.js:48-53`) spans `pdlc/workflows/`, `pdlc/skills/`, `pdlc/hooks/`, and this repo's own CLAUDE.md documents the coupling that makes multi-file edits routine — a skill prompt and the workflow that dispatches it, a hook script and `hooks/hooks.json`, and above all any `pdlc/workflows/*.js` edit, which **must** be accompanied by its rebuilt `pdlc/workflows/dist/` artifacts "in the same commit" (CLAUDE.md, "Consequence for anyone editing a workflow source"). So the single most likely promotion this feature will ever make — an edit to `orchestrate-dev.js` — is a two-or-more-file edit by the repo's own standing rule, and its `artifact` is underivable. This is REQ-layer because the derivation basis is enumerated here as closed ("from **nothing else**", `:368`) and because the fix is a requirement, not a mechanism: either (a) state that a promotion is a single-file edit and that a change needing several files is several promotions sharing a PR (AC-3.3 already permits that shape) — noting the cost, that they then share nothing but the PR and are measured separately; or (b) define `artifact` as the promotion's **primary** file under a stated total rule (e.g. the lexicographically-first non-generated path it touches), so the derivation stays a pure function of file text. (b) is the smaller change and survives the generated-artifact case; (a) is cleaner if promotions really are meant to be atomic. Either way the sentence must stop assuming the answer. | AC-5.1, AC-3.3, AC-3.1, §5 |
| F-03 | Low | Local | **The new §4b `action` row introduces an unenumerated status qualifier, and inserting it silently re-pointed the `revision`/`retirement` row's "as above".** §4b's stated obligation is set-equality over this table (`:576-577`), so every cell is transcribed by a test. The new row's *May accompany status* cell reads "any status emitting a proposal" (`:603`). Every other non-enumerated qualifier in the column is defined elsewhere in the REQ — "any status that writes a row" is fixed by AC-7.2's exemption of `skipped-cadence`, and "any status emitting the AC-5.2 table" by AC-5.2 — but "emitting a proposal" appears nowhere else in the document, so the row cannot be transcribed without the reader inventing the set. Second half: the `revision`/`retirement` row (`:604`) carries "as above" and was **not** edited this round, but the new row was inserted directly above it, so its referent silently changed from "any status emitting the AC-5.2 table" (v7, where it followed the `ineffective`/`unmeasurable` row) to the new undefined phrase. That is a semantic change to an unchanged row, made by an insertion — the exact failure mode a positional back-reference has, and the one an enumerated cell does not. Low because both sets are inferable and the fix is mechanical, but worth taking in this pass: replace "any status emitting a proposal" with the explicit `promoted`, `promoted-degraded`, `no-op` (matching `duplicate-suppressed` at `:596`, since a suppressed proposal is still a proposal), and replace the `revision`/`retirement` row's "as above" with "any status emitting the AC-5.2 table" — its actual, intended referent. While there, consider whether §4b should carry a one-line note that no cell in this table may use a positional back-reference, since the table is now long enough that another insertion will do this again. | §4b, AC-5.1, AC-5.3 |

## Existing-Code Claim Verification (changed sections)

Every claim about existing state that the `9c5ea35..HEAD` diff added or rewrote, checked in a single
pass. Rows verified in earlier rounds and untouched by this diff are not re-checked. This round's
diff is almost entirely contract work plus compression, so the changed existing-code surface is
three rows; row 4 is an anchor my own F-02 rests on and is therefore verified here rather than
asserted.

| # | New/changed REQ claim | Section | Verdict | Evidence |
|---|---|---|---|---|
| 1 | The repo `.gitignore` "today carries no pattern matching" `docs/_decisions/.consolidation-lock`, and its entries are `.tokensave/`, `.claude/settings.local.json`, `.claude/.headroom_wrap_marker.json`, `node_modules/`, `/.claude/workflows/` — **newly transcribed into the REQ this round** | AC-1.3 | **Confirmed — the enumeration is set-equal to HEAD** | `.gitignore` at HEAD carries exactly those five patterns (the rest of the file is comment prose explaining the `/.claude/workflows/` anchoring). None matches a dotfile under `docs/`: four are anchored elsewhere and `node_modules/` is a directory pattern. Transcribing the list into the REQ is the right shape here — it makes the claim falsifiable by a test rather than by a reviewer's memory — though note it is now a copy that can drift; a test asserting the absence of a matching pattern would be the durable form, and that is FSPEC/PROPERTIES work, not a REQ defect |
| 2 | AC-1.5's shortened quote: `resolveAdvisoryRung` is exported at `orchestrate-dev.js:1833` under a doc comment at `:1800` calling it "the **one** ladder the tier ships" | AC-1.5 | **Confirmed — the compression did not break the quote** | `orchestrate-dev.js:1833` is `export function resolveAdvisoryRung({ _agent, _log, _state, prompt })`; `:1800` reads ``* `resolveAdvisoryRung` — TSPEC §3.4's model-rung ladder, and the **one** ladder the tier ships.`` The REQ dropped the "TSPEC §3.4's model-rung ladder, and" prefix and kept the operative clause verbatim, including its emphasis. `MODEL_ADVISORY` (`:1652`) and `MODEL_ADVISORY_FALLBACK` (`:1653`) are both where the drift-observable fallback says they are |
| 3 | The shipped second consumer "takes it through an injected seam with a threaded `rungState` (`orchestrate-queue.js:1245-1256`) rather than copying literals" — rewritten this round | AC-1.5 | **Confirmed** | `orchestrate-queue.js:1245` opens `const advisoryDisposition = await runAdvisorySeamFn({` and the option object through `:1256` carries `rungState`, `_agent: rawAgentFn`, and the file/git seams. No model literal appears in that call — the rung is resolved inside the seam, which is exactly the pattern the REQ says this feature will follow |
| 4 | (my F-02) `MERGE_GUARD_DEFAULTS` at `orchestrate-dev.js:48-53` is the four-member guard set AC-3.1 routes on | AC-3.1 | **Confirmed, and it is what makes F-02's case ordinary** | The constant spans those lines with the four members the REQ names. The point F-02 rests on is not the constant but its span: `pdlc/workflows/` includes both `orchestrate-dev.js` and its generated `dist/` bundles, and this repo's own standing rule requires a source edit and its rebuilt artifacts to land "in the same commit" (CLAUDE.md, "Consequence for anyone editing a workflow source"; enforced in CI by the `Generated artifacts are in sync` job, `.github/workflows/pr-tests.yml`). So the most likely guard-set promotion is multi-file by construction |

No claim added or changed in this round is factually wrong about the codebase — the second
consecutive round with no defect row. The two compressions that touched citations (AC-1.5's doc-comment
quote, AC-3.7's `guardVerdict`/`effectiveGuardPaths` sentence) both kept every `file:line` anchor and
cut only connective prose.

## Questions

Only questions arising from the changed sections. v7's Q-01 is answered by AC-5.4's new sentence
("A **revision** routes exactly as that promotion's retirement would", `:447-448`) — which is the
answer I hoped for and is what makes F-01 above a narrow question about *repetition* rather than
about routing. Q-02 is answered by choosing the `action` discriminator over the leaves-the-key-set
rule, which is the more conservative of the two and needs no defence. Q-03 is answered by both §4b
rows landing (`:605-606`). Q-04 is answered by D-CONS-08 (`:683`) — the cost was priced and
deferred by name, which is the reviewable form.

| ID | Question |
|----|---------|
| Q-01 | For F-01: is a revision meant to reset AC-5.3's `recurred` streak? The REQ says the streak is "counted per `failure-mode-id` **in passes, not elapsed time**" over the promotion's records (`:438`), and AC-5.5 explicitly names what resets *its* streak ("a `prevented` or `recurred` verdict resets the `unmeasurable` streak to zero", `:454-455`) — so the asymmetry is conspicuous. If a merged revision resets the `ineffective` streak, F-01's second-revision case still arises, just two passes later; if it does not, the promotion is re-flagged `ineffective` on the very next counted pass after the revision merges, which would make the second revision the *common* case rather than the rare one. Either answer is fine, but the document should state one — it is the difference between F-01 being a corner and F-01 being the main line. |
| Q-02 | For F-02: is a promotion intended to be atomic — one failure mode, one file, one commit? Reading AC-3.3 (`:260-265`) and AC-5.1 together I think yes, and if so the fix is to say it, because two other statements start to look like consequences rather than coincidences: "each edit is a separate commit" and "Two distinct failure modes in one `phase` touching one file therefore merge into one promotion" (`:384`). But if promotions are atomic, then the `orchestrate-dev.js` + `dist/` case is *two* promotions with two ids for one logical change, both measured separately by AC-5.2, and one of them targets a generated artifact that no human edits — which is a strange promotion to carry a standing effectiveness verdict for. That is the argument for the primary-file rule (F-02's option (b)) instead, with generated paths excluded by name. Which way you go changes what AC-5.2's table counts, so it is a REQ-layer choice. |
| Q-03 | Non-blocking, on §4b's two overlapping vocabularies: `promote`/`revise`/`retire` (the key's action) and `revision`/`retirement` (the reported field) now both live in the table with a cross-reference in each cell (`:603-604`). That is correctly *documented*, but it is two names for one distinction, and the reported set is missing the third member — a pass that made an ordinary promotion reports no value at all from the `revision`/`retirement` field. Was keeping both deliberate (AC-5.3's field predates the action and is what an operator reads), or is the reported field now redundant with the trailer's `action`? If deliberate, one clause in AC-5.3 saying the field is absent for a `promote` would close the enumeration; if not, collapsing to one vocabulary removes a mapping every downstream layer has to carry. |

## Positive Observations

- **Five of five, and the High was closed by adopting the argument rather than the patch.** The
  cheapest fix for v7 F-01 was a sentence exempting AC-5.3 remediations from NFR-4. Instead the key
  itself was changed and NFR-4 now carries the *reason* — keying on the id alone "would let a merged
  `promote` PR suppress the `revise` and `retire` proposals AC-5.3 requires, making the remediation of
  an `ineffective` promotion unreachable and the §1 `Unfalsifiability` problem unsolved" (`:531-533`).
  A future reader proposing to simplify the key back to the id finds the counter-argument, and the
  failure it produces, already written down. That is the difference between a document that records
  its decisions and one that records only their outcomes.

- **One grammar, propagated to every site that carries the key.** F-02 asked for a decision about the
  trailer's membership; the revision picked `{id}:{action}` and then used it consistently in the
  trailer (`:246`), the commit trailer `PDLC-PROMOTION-ID: {id}:{action}` (`:261`), NFR-4's key
  (`:527-528`), AC-3.8b's abandonment paragraph (`:202-203`), AC-5.1's record key
  `(failure-mode-id, passId, action)` (`:386`), and two §4b rows (`:603`, `:606`). I looked for a
  site still speaking the old vocabulary and did not find one. That consistency is what lets F-01
  above be stated as a two-line replay instead of an interpretation.

- **AC-7.2's fix took the harder of the two offered routes and closed the case I only gestured at.**
  Reverting NFR-4's relocation would have been legal and cheaper. Scoping the biconditional to *this
  pass's own* PR and giving suppression its own field is the version that serves a `/loop` operator,
  and the clause "the two fields are never merged and a row may carry both" (`:509`) disposes of the
  mixed promoted-and-suppressed case that my finding raised as an aside and did not propose a fix for.
  Both fields then got §4b rows with permitted-status sets I could check against `duplicate-suppressed`'s
  own row — and they agree.

- **F-05 was closed with the mechanism *and* the counterfactual.** The `.gitignore` clause could have
  been one line. It is instead a clause that states why the hazard exists (an untracked file in a
  tracked directory is committable by anything not pathspec-scoped), transcribes the HEAD `.gitignore`
  so the "no pattern matches it" claim is falsifiable, names the cost of omission ("a committed lock
  reaches every fresh clone … per clone"), and adds the work to §5 so it is scoped rather than assumed
  (`:72-76`, `:632-633`). Four things a later implementer would otherwise have to reconstruct.

- **D-CONS-08 is the right response to v7's Q-04.** The question was whether a path-level `artifact`
  key had been priced against this repo's file-size distribution. The answer — state the merge as an
  accepted cost in AC-5.1 (`:384-385`) and defer the finer key by name, with the reason it cannot be
  built today ("a finer key needs a stable sub-file location identity LEARNINGS does not carry",
  `:683`) — is better than either silently narrowing the key or pretending the cost is small. It also
  demonstrates the shape F-02 should be resolved into if the atomicity answer turns out to be
  awkward.

## Recommendation

**Needs revision.** 0 High, 2 Medium, 1 Low. Every v7 finding closed — including the High — no v7 fix
regressed, and the verification table has no defect row for the second round running.

The High is gone and nothing replaced it. That is a real state change, not a rounding: F-01 below is
Medium precisely because the escape hatch AC-5.3 already offers (`retire`) is always available, so
the promise "an edit that did not work is not left in place indefinitely" is *achievable* on every
path — it is merely not *guaranteed*, because the pass may choose the spent alternative. v7's High
had no such hatch: both alternatives derived a barred id.

The trajectory: v1→v2 closed 8H, v2→v3 2H+5M, v3→v4 2H+2M+3L, v4→v5 2 of 3, v5→v6 4 of 4, v6→v7
5 of 5, v7→v8 **5 of 5 including the High**. Three consecutive clean sweeps. The surface keeps
narrowing and it is now narrow in a specific way worth naming: both Mediums live inside AC-5.1, and
both are the *second-order* consequence of a first-order fix this round made correctly. F-01 is the
`action` key meeting its own closed set; F-02 is the canonical-path rule meeting multi-file edits.
Neither questions the choice that produced it.

### The stopping rule, applied against itself

§5a names what must be fixed at the REQ layer and directs everything else downstream. Neither Medium
is a "this cannot be tested" or "this needs an oracle" finding — the class §5a routes away from here.

- **F-01 (Medium)** belongs here. AC-5.1 asserts remediations reach the AC-3.1 route unimpeded and
  NFR-4's key impedes one of them; both are requirements, and the key set is enumerated in this
  document as closed. An FSPEC resolving it would be choosing which AC to disregard — the same test
  that put v7 F-01 and F-02 at this layer.
- **F-02 (Medium)** belongs here. `artifact` is an input to a derivation the REQ declares pure ("from
  **nothing else**"), so what counts as *the* artifact of a multi-file promotion is a REQ-layer
  contract, not a mechanism. It also changes what AC-5.2's set-equality table counts (one row or two
  for one logical change), and that table is enumerated here.
- **F-03 (Low)** would not hold the document alone: two cells in §4b, both mechanical. Take it in the
  same pass.

### What must change for approval

1. **F-01** — make AC-5.3's promise total against a spent action. Cheapest and best: state that when
   the pass's chosen alternative is already suppressed under NFR-4 it proposes the other, and that
   `retire` is the terminal remediation. Alternatives, if you prefer them: exempt `revise` from
   pair-suppression (a revision is by construction a different edit, so duplicate-suppression has no
   work to do there), or qualify AC-5.1's "unimpeded" to "unimpeded **by the `promote` they
   remediate**" and price the once-per-action limit as a D-CONS row. Answer Q-01 in the same edit —
   whether a merged revision resets the `recurred` streak decides whether this is a corner or the
   main line.
2. **F-02** — say what `artifact` is when a promotion edits more than one file. Either declare
   promotions single-file (and say that a multi-file change is several promotions sharing one PR, which
   AC-3.3 already permits), or define a **primary** file by a stated total rule with generated paths
   excluded by name. The `orchestrate-dev.js` + rebuilt `dist/` case must be decidable by whichever
   rule you write, because it is the likeliest promotion this feature will ever make.
3. **F-03** — replace §4b's "any status emitting a proposal" with the explicit
   `promoted`, `promoted-degraded`, `no-op`, and replace the `revision`/`retirement` row's "as above"
   with its intended referent, "any status emitting the AC-5.2 table", so a later row insertion cannot
   silently re-point it again.

All three are a sentence or two. F-01 and F-02 are independent and touch adjacent paragraphs of
AC-5.1, so the round is plausibly two edits plus a table correction.

## Verdict

VERDICT: Needs revision
