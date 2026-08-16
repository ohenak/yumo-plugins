# LEARNINGS — pdlc-engine-distribution

| Field | Detail |
|---|---|
| Feature | pdlc-engine-distribution |
| REQ | docs/pdlc-engine-distribution/REQ-pdlc-engine-distribution.md |
| Date Completed | 2026-08-16 |
| Total Iterations | REQ: 9, FSPEC: 11, TSPEC: 14, DECISIONS: 3, PLAN: 13, PROPERTIES: 7, Final codebase review: 4, IMPL: 17 waves |
| Upstream | REQ → FSPEC → TSPEC → DECISIONS → PLAN → PROPERTIES → IMPL |
| Harvested from | 122 `CROSS-REVIEW-*` files (REQ v1–v9 ×2 roles, FSPEC v1–v11 ×2, TSPEC v1–v14 ×2, PLAN v1–v13 ×2, PROPERTIES v1–v7 ×2, DECISIONS v1–v3 ×2, final-review REVIEW v1–v4 ×2) and 8 `CODE_REVIEW-pdlc-engine-distribution-v{1..8}.md` — all now deleted; plus `POSTMORTEM-{T,P,D,PR}-pdlc-engine-distribution.md` (read, retained on branch) |
| Phases exercised | R, F, T, D, P, PT, I, CR, DOD, H |
| DoD rounds | 8 (`CODE_REVIEW-…-v1` … `-v8`) |

## 1. Non-Convergences

Four phases halted. None halted because the phase's own document was bad; three of four halted in the **erratum channel**, whose budget is one round per upstream document per phase.

| Phase | Reviewer | Issue | Resolution | Iteration Count |
|---|---|---|---|---|
| T (TSPEC) | pm-review + te-review | Round-budget exhaustion (`MAX_REVIEW_ROUNDS` 5/5). Each round closed 100% of prior findings, and each round's *own new prose* carried one new High. Two chains drove it: the provenance carrier chased one hop per round (`cli.mjs` → `run*()` → injection object → `main()` → commit helpers), and §9.3's structural clause re-scoped once per round (ES-2020 → parser-free → non-comment). | `v0.6` (six commits, eleven minutes) closed all eight round-5 findings and three questions; operator verified each fix site at HEAD, flipped `RESOLVED: yes`, re-invoked `forcePhases: "T"`. Rounds 6+ confirmed. | 5 (of a lifetime 15) |
| P (PLAN) | se-review + te-review | PLAN itself converged and was approved at round 4. An **FSPEC erratum round** failed delta-confirmation: the edit removed AT-3.8a's expected-member list rather than reconciling it with TSPEC §5.4, leaving three packed members (`README.md`, `LICENSE`, `scripts/postinstall.mjs`) in no class. SE saw incomplete routing downward; TE saw an unauthorised acceptance-set relocation upward (REQ AC-1.3 owns where the set lives). One erratum round per doc per phase — no budget to repair either half. | Operator chose direction (a): FSPEC `v0.4` re-transcribed the three class rows and the count (23 pre-N-2, 24 post-E-4b), dropped the colliding "no repo-level documentation" exclusion, reworded BR-8.1. Re-invoked `forcePhases: "F,P"`. | PLAN 4/5; erratum 1/1 |
| D (DECISIONS) | te-review (+ pm-review Mediums) | DECISIONS converged in 2 rounds. The erratum round to TSPEC half-landed: five of seven items landed cleanly, but items 6 and 7 were the same §6.5 defect entered from two directions — the false catalogue-equality claim was correctly *withdrawn* but no replacement oracle was specified, and `resolvePluginRoot`'s shipped signature (`{ok, root, source, reason, tried}`) did not carry the notices the new oracle assumed. | TSPEC `v0.11`: extended the resolver's return with `notices`, added the positive honour-direction assertion, and replaced the fabricated "AC-1.4's exit-code contract" citation with `exitCodeFor`/`PROP-EXIT-1` in both TSPEC §6.2 and DECISIONS §7. Re-invoked `forcePhases: "D"`. | DECISIONS 2/5; TSPEC 10/15 lifetime |
| PR (PROPERTIES) | te-review | PROPERTIES approved by both roles in round 2 with zero re-litigation. The FSPEC erratum round (aligning `"none installed"` → `not found` with shipped `lib/handshake.mjs`) **skipped DEC-ERR-01's re-grounding step**: REQ had moved v0.10 → v0.11 81 minutes earlier, in a different phase, and the FSPEC's Upstream cell + three hand-off statements still described that decision as open. se-review scored it Process/Medium (no consequence); te-review scored it High (DEC-ERR-01 forbids demoting a routed-but-already-decided item). High-only bar ⇒ halt. | Operator re-pinned `FSPEC:9` to REQ v0.11, recorded the absorbed decisions in the v0.6 changelog, marked the three statements discharged, and — separately — propagated the deleted literal *downstream* to `PLAN:146`, `PLAN:458` and `PROP-LAUNCH-3`. Re-invoked `forcePhases: "PR"`. | PROPERTIES 2/5; erratum 1/1 |

## 2. Cross-Feature Patterns

| Finding | Suggested Promotion Target |
|---|---|
| **A deleted literal outlives its deletion in already-approved downstream documents.** Removing `"none installed"` from the FSPEC left `PLAN:146` (T15(e)), `PLAN:458` and `PROP-LAUNCH-3` still discriminating on it, so a faithful implementer would have written an assertion against a string in no shipped module. The erratum wave propagated *up* (child-confirmed-before-parent) but nothing owned propagating it *down*. | `docs/_decisions/DECISIONS-review-severity-bars.md` (extend DEC-ERR-01 with a downstream-literal sweep) |
| **Set-equality oracles degrade silently when the set is delegated.** AT-3.8a's four falsifiers: three (added `SKILL.md`, added file, extra manifest member) survived delegation because they sat in a still-literal exclusion list; only "a *removed* member fails" died. The oracle reads complete and is three-quarters green. Reviewers must score falsifiers one at a time. | `docs/_constraints/DOMAIN-CONSTRAINTS.md` |
| **A stated set-equality is only testable if both sides live in the same alphabet.** REQ AC-3.4's check-name equality was authored against the workflow files' *template* strings (`Unit tests (${{ matrix.os }}, node ${{ matrix.node }})`) while Phase PUB polls GitHub's *rendered* names. The gap is exactly a rename. Resolved by deriving both alphabets in `ci-arrangement.test.js`. | `docs/_constraints/DOMAIN-CONSTRAINTS.md` |
| **Prose that transcribes a count is a self-falsifying oracle surface.** Comments in `publish.yml:5`, `publish.yml:24` and `fixture-machine.yml:3-6` each transcribed "five check names" after the gate widened to six; DoD rounds 6–8 chased the same defect through three files. Guard the count-word by regex, or do not write the count. | `docs/_constraints/DOMAIN-CONSTRAINTS.md` |
| **Repo-level `CLAUDE.md` is an integration surface, and a new distribution channel falsifies it silently.** DoD v1 §3-4 found `CLAUDE.md` contained zero mentions of `pdlc/engine/` while asserting unconditionally that "the workflow runtime loads a separate untracked copy under `.claude/workflows/`" — false for the engine channel. | skill update: `dod-verify` integration-boundary checklist should name repo-root `CLAUDE.md` explicitly |
| **A convention landing in two places gets recorded in one.** Commit `93390246` changed both the recorded exception file and `waveImplementPrompt` in `pdlc/workflows/orchestrate-dev.js`; only the former was disclosed. Half-recorded conventions read as undocumented drift later. | `docs/_constraints/DOMAIN-CONSTRAINTS.md` |
| **Skipped-block un-skip is mechanically unverifiable per-file.** `checkWaveUnskips` only sees whether skip tokens still exist; a `[red]` task's inert block whose `[green]` partner deletes the file is invisible to the gate. Carried unresolved through PLAN v9–v13 as a named, deferred gap (DoD item 17). | `docs/_decisions/DECISIONS-{wave-gates}.md` |

## 3. Rejected Proposals (with rationale)

| Proposal | Rejected By | Rationale | Reusable for future features? |
|---|---|---|---|
| Clear the Phase-P halt with direction (b): raise `ERRATUM: REQ:` on AC-1.3 to relocate expected-set ownership to the TSPEC | Operator (POSTMORTEM-P Step 1) | A three-layer wave (REQ re-approval → FSPEC → TSPEC confirmation) to buy a change with no behavioural consequence. Direction (a) — transcribe the three class rows back into FSPEC §5.2 — cost three edits inside one round. | Yes: prefer the edit that needs no upstream re-decision, when both close the same two findings |
| Give `resolvePluginRoot` a widened signature purely to satisfy §6.5's oracle | te-review's own `Q-23`, then declined in favour of the narrow answer | The resolver *decides*, startup *renders*. Extending the existing `{ok, root, source, reason, tried}` with `notices` honoured DECISIONS §5's assertions verbatim, matched the shipped `readEngineConfig` `{config, notices}` idiom, and required no DECISIONS edit. | Yes: answer "where is this observed?" before "what should this function return?" |
| Raise `MAX_REVIEW_ROUNDS` to clear the Phase-T halt | POSTMORTEM-T §Recommendation | The budget counts *rounds*, not defect mass. More rounds do not change the rate at which each round's new sections generate findings; repair discipline does. | Yes |
| Force Phase P/I forward on an approved-but-unconfirmed upstream | POSTMORTEM-P, POSTMORTEM-T, POSTMORTEM-PR (all three, independently) | Every deferred defect was of the class "the honest implementation goes red" — cheap in a confirmation round, expensive in Phase I. | Yes |
| Merge or destroy the `v3`-named DoD dispatch | dod-verify v8 | Review history is append-only; five consecutive rounds dispatched stale version numbers (`v3`, `v2`) while `v1..v7` were tracked on branch. The verifier took the next free integer instead. | Yes |
| Add a second macOS CI job for bash-3.2 portability | Operator (2026-08-10, recorded in CLAUDE.md) | Doubled CI wall time without failing independently; portability of shipped scripts is a maintainer-local concern. | Yes |

## 4. Process Learnings

**One-hop-at-a-time repair on a chain-shaped defect guarantees the next round finds the next link.** This is the single highest-value learning of the feature and it cost five TSPEC rounds. Answering exactly what a finding says is normally correct discipline; when the finding names a *hop* in a chain, it is a recipe for indefinite convergence. The standing instruction should be: *when a finding names a hop, close the chain end-to-end in the same revision — enumerate every link from process entry to the observable byte, and name the oracle that goes red if a single link is missing.* The same applies to oracle clauses: state the scan's domain exhaustively the first time (non-comment, non-string, statement position), not one qualifier per round.

**An erratum round is transcription work, and transcription suppresses re-grounding.** In a normal authoring round the author writes a claim for the first time under a standing instruction to verify it against code. In an erratum round the claim already exists in a sibling record, and the success condition is "the upstream document now says what was decided". Six of seven items in the Phase-D round were genuinely of that kind. The two that were not — specifying a *new test* against a *shipped function signature* — were authoring work wearing erratum's clothes, and both half-landed. Corollary from the same round: *transcribe the whole decision, not the sentence quoted in the item* (DECISIONS §5's assertion 2 was left behind because nobody asked about it).

**A downward-routing fix sometimes needs an upward erratum first.** DEC-ERR-01 makes an erratum round re-ground on its immediate upstream and *absorb* what was already decided. It has no step for noticing that the repair being written **requires a new upstream decision**. The Phase-P halt is exactly that gap: moving expected-set ownership from FSPEC to TSPEC is a REQ-layer change, performed inside an FSPEC round.

**A raised item that names a contradiction, not a resolution, hands the author a coin-flip.** "AT-3.8a's set contradicts TSPEC §5.4" is true and closeable in either direction; nothing in the filing said which direction wins, and the confirmation round is where that becomes a blocking High.

**DEC-ERR-01's re-grounding obligation belongs to the round, not the item — and needs an explicit, checkable step.** The Phase-PR halt fired on paperwork (a header cell plus a changelog paragraph) while the round's live defect rode along as a Medium note. Both reviewers agreed on the fix, its size, and that it moved no criterion; they disagreed only on whether it could wait one round. That is a rule gap, not a review defect, and the recommended remedy is a *stated* completion condition: an erratum edit is not complete until the Upstream cell names the upstream version read and the changelog records what was absorbed — including "nothing, already held".

**Under a High-only convergence bar, an unpinned severity is a coin-flip on halting.** Three of the four halts turned on one reviewer scoring Process/Medium what the other scored High, with both readings defensible against the shipped rule text.

**Budget shape, not budget size.** One erratum round per upstream document per phase is the right damping constant, but it prices the round one-shot: a round that fixes two of three items perfectly gets no second attempt and halts exactly as a 0%-correct one would. Similarly, a round that mixes five reword-grade items with one specify-a-new-test item is judged on the latter.

**Round-budget exhaustion and reviewer disagreement are different failure modes, and none of the four halts here were the latter.** Across all four post-mortems: zero re-litigation of settled decisions, 100% prior-round disposition, no authoring stalls, no contested designs. Reviewers repeatedly measured the *same* defect from opposite ends (SE looking downward at implementability, TE looking upward at upstream fidelity) and each one's High was invisible to the other's lens.

**DoD converged in eight rounds, and the tail was spent on prose that transcribes counts.** Rounds 1–5 found real gaps (no coverage gate in `pdlc/workflows`, global-aggregate rather than per-file floors, `fixture-machine` never installing the *published* artifact, unbound deferrals). Rounds 6–8 chased one count-word ("five" vs "six" check names) through `publish.yml`, `QUEUE.md`, `RELEASE-CHECKLIST.md` and `fixture-machine.yml`, each fix creating the next same-shape instance because the guard was file-scoped. **Guards written against one file's copy of a claim do not bind the sibling that carries it.**

**Five consecutive DoD dispatches carried a stale version number** (`v3`/`v2` while `v1..v7` were tracked). The verifier's refusal to overwrite is what preserved the history; the dispatch-side version derivation is what should be fixed.

**Two acceptance criteria closed on one-time, spec-acknowledged evidence rather than regression guards** — AC-4.4's revert half (`EVIDENCE-AT-4.4.md`) and AC-6.2's bundle-side run-bound root (`EVIDENCE-AT-6.2.md`). Both are legitimately hard to guard continuously, both were disclosed in PLAN §2 / TSPEC §7.3, and both were re-reported as open in all eight DoD rounds. A one-time observation that must be re-reported eight times is a signal the pipeline lacks a first-class "evidence-backed, no continuous guard" disposition.

**A known-false local red cost review attention in every final-review round.** `documentOracles.test.js` walks the whole tree under `root` skipping only `.git/` and `node_modules/`, so untracked `.claude/` and `.serena/` trees turn it red locally while CI is green. Every reviewer re-derived this independently.

**Under-tagging was mild but present.** Several Process-shaped findings (changelog/version-cell drift, half-recorded conventions, stale erratum-pending clauses) were filed `Local`; they are routed to §4 here. The final-review rounds tagged consistently; the spec rounds did not always.

## 5. Open Items for Consolidation

- **Extend DEC-ERR-01 with an explicit re-grounding completion condition.** An erratum edit is not complete until (a) the edited document's Upstream cell names the upstream version actually read at HEAD, and (b) the changelog records what was absorbed, including the null case "nothing, already held". Both Phase-PR halt conditions disappear under this rule. *(Named directly in POSTMORTEM-PR Step 6.)*
- **Add a downstream-literal sweep to the erratum protocol.** When an erratum *deletes or replaces a literal*, the wave must propagate down to every approved document that discriminates on it, not only up to the parent. Target: `docs/_decisions/DECISIONS-review-severity-bars.md`.
- **Pin the severity of a routed-but-already-decided hand-off statement.** DEC-ERR-01 forbids demoting it; it does not say what happens when the staleness lives in an *earlier round's changelog prose* and the current round is scoped to a single literal. Two candidate rules were written out in POSTMORTEM-PR Step 6.
- **Add a "needs a new upstream decision" exit to the erratum protocol.** An erratum author who discovers the repair requires re-deciding an upstream AC should be able to escalate to a multi-layer wave (child-first) rather than land an unauthorised single-layer edit.
- **Chain-shaped-defect repair discipline for review-loop authoring prompts.** Promote the POSTMORTEM-T instruction verbatim into the author-side dispatch grounding: name the whole chain, name the oracle that goes red if one link is missing.
- **First-class disposition for spec-acknowledged one-time evidence.** `EVIDENCE-*.md`-backed criteria (AC-4.4 revert half, AC-6.2 bundle-side) should be recordable once and not re-reported as open findings in every DoD round.
- **Guard-writing rule: a claim carried by N files needs an N-file guard.** DoD rounds 6–8 were entirely the cost of a single-file guard on a multi-file claim.
- **Fix DoD dispatch version derivation.** The verifier should never be handed a version number lower than the highest `CODE_REVIEW-*-v{N}.md` on branch; five consecutive rounds were dispatched stale.
- **Make the document-oracle scan ignore untracked local-state trees** (`.claude/`, `.serena/`) or make the red name them, so a clean-CI/red-local split stops consuming reviewer attention. *(Already documented in CLAUDE.md as a known trap; a code fix would retire the trap.)*
- **Queue follow-ups already bound, listed here for the consolidation record:** `docs/_queue/QUEUE.md` row 22 `pdlc-halt-hardening-followups` (blocked) and row 23 `pdlc-engine-v0.2.0-release` (blocked on this feature) — the post-merge publish of `engine-v0.2.0` and its `RELEASE-CHECKLIST.md` §7 discharge remain operator-owned.

## 6. Approval Record

The durable (tier-2) record of every approving cross-review round, copied verbatim out of the `CROSS-REVIEW-*` files before deletion. Rows are ordered by document type in pipeline order, then round ascending, then role slug ascending. Final-codebase-review (`REVIEW`) rounds are not spec-class documents and contribute no rows.

| Document Type | Round | Role | Verdict | Approval Hash | Reviewed Commit |
|---|---|---|---|---|---|
| REQ | 2 | test-engineer | Approved with minor changes | unavailable | unavailable |
| REQ | 3 | test-engineer | Approved with minor changes | unavailable | unavailable |
| REQ | 4 | software-engineer | Approved with minor changes | sha256:84aa3990c6f37c9cdc4e6a1f2446250562ac3676b14c69e4142da253f44c83c0 | 2a1f910d835a15426352a68dac22744df190106e |
| REQ | 4 | test-engineer | Approved with minor changes | sha256:84aa3990c6f37c9cdc4e6a1f2446250562ac3676b14c69e4142da253f44c83c0 | 2a1f910d835a15426352a68dac22744df190106e |
| REQ | 5 | software-engineer | Approved with minor changes | sha256:f570fb72dd31d9e264b7c3d9292ef6af94e263332df0af3e74787558825457e1 | c38feb616cd05964cf1e2327b7440ffd1e2f7d26 |
| REQ | 5 | test-engineer | Approved with minor changes | sha256:f570fb72dd31d9e264b7c3d9292ef6af94e263332df0af3e74787558825457e1 | c38feb616cd05964cf1e2327b7440ffd1e2f7d26 |
| REQ | 6 | software-engineer | Approved with minor changes | sha256:abd47bee480bd50b86c17dfbd51c73e5356a76ebaa6c876cdb552f8d4a2eadd0 | 01c27ee4c6eb05c9df9d3c9ab9e693b5271e5517 |
| REQ | 6 | test-engineer | Approved with minor changes | sha256:abd47bee480bd50b86c17dfbd51c73e5356a76ebaa6c876cdb552f8d4a2eadd0 | 01c27ee4c6eb05c9df9d3c9ab9e693b5271e5517 |
| REQ | 7 | software-engineer | Approved with minor changes | sha256:6fc7a382654a530e553721e9995a94f4406248b813768cc18da1c4a3cabcf51a | 3049958c693dff3f55922c2f9f4bfa1315309043 |
| REQ | 7 | test-engineer | Approved with minor changes | sha256:6fc7a382654a530e553721e9995a94f4406248b813768cc18da1c4a3cabcf51a | 3049958c693dff3f55922c2f9f4bfa1315309043 |
| REQ | 8 | software-engineer | Approved with minor changes | sha256:04d2c39df40e7ef7092fb4081ac4bcf29df47ea23305ba88d2c4da567666157f | 20c87cd3d45eb0876a590685ca34dd7a677a8d37 |
| REQ | 8 | test-engineer | Approved | sha256:04d2c39df40e7ef7092fb4081ac4bcf29df47ea23305ba88d2c4da567666157f | 20c87cd3d45eb0876a590685ca34dd7a677a8d37 |
| REQ | 9 | software-engineer | Approved with minor changes | sha256:44d0e18836f534cb68444f6e5a0b26eebf3d2aafe7f7630ce1f38fed78b1d00f | f02d51567739ce856fc6e7d577538517b539a46c |
| REQ | 9 | test-engineer | Approved | sha256:44d0e18836f534cb68444f6e5a0b26eebf3d2aafe7f7630ce1f38fed78b1d00f | f02d51567739ce856fc6e7d577538517b539a46c |
| FSPEC | 2 | software-engineer | Approved with minor changes | sha256:9211f5cc72e443ef4574f8a2497cc8f6ac40ffe4ee87200c43ff12f222f92a3c | aa4d4a507ce3dc03b4199cebb2a08916ce161dec |
| FSPEC | 2 | test-engineer | Approved with minor changes | sha256:9211f5cc72e443ef4574f8a2497cc8f6ac40ffe4ee87200c43ff12f222f92a3c | aa4d4a507ce3dc03b4199cebb2a08916ce161dec |
| FSPEC | 4 | test-engineer | Approved with minor changes | unavailable | unavailable |
| FSPEC | 5 | software-engineer | Approved with minor changes | sha256:1e49f9d5737164d81416aa00fdd830697c01095f2f9dd138e64a7742aa3acce4 | 7076e7713d4c194bd05ebeee1d828b82cebb1f6b |
| FSPEC | 5 | test-engineer | Approved with minor changes | sha256:1e49f9d5737164d81416aa00fdd830697c01095f2f9dd138e64a7742aa3acce4 | 7076e7713d4c194bd05ebeee1d828b82cebb1f6b |
| FSPEC | 6 | software-engineer | Approved with minor changes | unavailable | unavailable |
| FSPEC | 7 | software-engineer | Approved with minor changes | sha256:d3891a6570da0f3abb126312255e430934ba7fcaa653d63ce1132b39b03423b1 | a57e0547e9f233ed5e6b86fc87b6263e57974921 |
| FSPEC | 7 | test-engineer | Approved with minor changes | sha256:d3891a6570da0f3abb126312255e430934ba7fcaa653d63ce1132b39b03423b1 | a57e0547e9f233ed5e6b86fc87b6263e57974921 |
| FSPEC | 8 | software-engineer | Approved with minor changes | sha256:6c1414c1a97f1306b6bb7afecf9942b6bc0d1566f483a1f6de618e4472022dd4 | 5910f0c2a6da3dc95e403644c9e9c3edf3bd45f9 |
| FSPEC | 8 | test-engineer | Approved with minor changes | sha256:6c1414c1a97f1306b6bb7afecf9942b6bc0d1566f483a1f6de618e4472022dd4 | 5910f0c2a6da3dc95e403644c9e9c3edf3bd45f9 |
| FSPEC | 9 | software-engineer | Approved with minor changes | sha256:6c1414c1a97f1306b6bb7afecf9942b6bc0d1566f483a1f6de618e4472022dd4 | e63bcad0b32df8cde8a1d0a991bc771fb578fc54 |
| FSPEC | 9 | test-engineer | Approved with minor changes | sha256:6c1414c1a97f1306b6bb7afecf9942b6bc0d1566f483a1f6de618e4472022dd4 | e63bcad0b32df8cde8a1d0a991bc771fb578fc54 |
| FSPEC | 10 | software-engineer | Approved with minor changes | sha256:5ffc38a7f6ff1b19d31250a7d54dce32c3498941723cfb3f35102d2004027b06 | 730aa0b6824e79ec22f5d21a22191a1979439db4 |
| FSPEC | 10 | test-engineer | Approved with minor changes | sha256:5ffc38a7f6ff1b19d31250a7d54dce32c3498941723cfb3f35102d2004027b06 | 730aa0b6824e79ec22f5d21a22191a1979439db4 |
| FSPEC | 11 | software-engineer | Approved with minor changes | sha256:5ffc38a7f6ff1b19d31250a7d54dce32c3498941723cfb3f35102d2004027b06 | 98fb99a2a9864c4b8c191f0473679f79fe2666b9 |
| FSPEC | 11 | test-engineer | Approved with minor changes | sha256:5ffc38a7f6ff1b19d31250a7d54dce32c3498941723cfb3f35102d2004027b06 | 98fb99a2a9864c4b8c191f0473679f79fe2666b9 |
| TSPEC | 7 | product-manager | Approved with minor changes | unavailable | unavailable |
| TSPEC | 8 | product-manager | Approved with minor changes | unavailable | unavailable |
| TSPEC | 9 | product-manager | Approved with minor changes | sha256:26f89b63bf2ac897ac71602a13cb1b566870d9424dfca6f0cf485471db9df0b7 | 501b8fe1f8f44253c21198ba9c1928505a63117f |
| TSPEC | 9 | test-engineer | Approved with minor changes | sha256:26f89b63bf2ac897ac71602a13cb1b566870d9424dfca6f0cf485471db9df0b7 | 501b8fe1f8f44253c21198ba9c1928505a63117f |
| TSPEC | 10 | product-manager | Approved with minor changes | unavailable | unavailable |
| TSPEC | 11 | product-manager | Approved | sha256:4e8b26ca7dbd497f9ee9e49af5012a49ee2cd2d2521e8b4e3d9b1b78466ec13a | e6f519924cd47d693d32fb56d5c21b24f8b073ed |
| TSPEC | 11 | test-engineer | Approved | sha256:4e8b26ca7dbd497f9ee9e49af5012a49ee2cd2d2521e8b4e3d9b1b78466ec13a | e6f519924cd47d693d32fb56d5c21b24f8b073ed |
| TSPEC | 12 | product-manager | Approved with minor changes | sha256:5bef8afa3b9d6af5a72d58dfbc41b028a65e72c4c6ffb5972288690d111e75ad | a9f1584b25dcc111f9e6e3dcdfb9fdf95521fecd |
| TSPEC | 12 | test-engineer | Approved with minor changes | sha256:5bef8afa3b9d6af5a72d58dfbc41b028a65e72c4c6ffb5972288690d111e75ad | a9f1584b25dcc111f9e6e3dcdfb9fdf95521fecd |
| TSPEC | 13 | product-manager | Approved with minor changes | unavailable | unavailable |
| TSPEC | 14 | product-manager | Approved with minor changes | sha256:440711317830ec2cc111e58be51a5610ba174906eb1cd6c206e68e508b703833 | d6df50155749164a70935dc50a32ed48438785b2 |
| TSPEC | 14 | test-engineer | Approved with minor changes | sha256:440711317830ec2cc111e58be51a5610ba174906eb1cd6c206e68e508b703833 | d6df50155749164a70935dc50a32ed48438785b2 |
| PLAN | 4 | product-manager | Approved with minor changes | sha256:2e16cf898c0008ff0bb55fc6d92c44236e4bde0c731cf5b3d51c05977a704926 | d377dbc7d4bd71513f1096ffc985ca87de3c0123 |
| PLAN | 4 | test-engineer | Approved with minor changes | sha256:2e16cf898c0008ff0bb55fc6d92c44236e4bde0c731cf5b3d51c05977a704926 | d377dbc7d4bd71513f1096ffc985ca87de3c0123 |
| PLAN | 5 | product-manager | Approved with minor changes | sha256:a59bb90cbf90d3df2a0425a4e2f7e8f732e3305ed0301a70e18a9e3a7b0719aa | 4097aec7db2db9f3554c8ff4e4f048d06fad2822 |
| PLAN | 5 | test-engineer | Approved with minor changes | sha256:a59bb90cbf90d3df2a0425a4e2f7e8f732e3305ed0301a70e18a9e3a7b0719aa | 4097aec7db2db9f3554c8ff4e4f048d06fad2822 |
| PLAN | 6 | product-manager | Approved with minor changes | sha256:aa1602af45b28c793f4b8a436b19116fcd18ed5957183e0b6539b097d012273b | df4d1c444bff75a27b47b9121ff80b1341ffc63b |
| PLAN | 6 | test-engineer | Approved with minor changes | sha256:aa1602af45b28c793f4b8a436b19116fcd18ed5957183e0b6539b097d012273b | df4d1c444bff75a27b47b9121ff80b1341ffc63b |
| PLAN | 7 | product-manager | Approved with minor changes | sha256:ad3ecdd36498df5872ee9992a1ac30bc544ae15fe5482c79878bf1d7a190a354 | 6030d7e36cd76dc1514a886403660003171cd897 |
| PLAN | 7 | test-engineer | Approved with minor changes | sha256:ad3ecdd36498df5872ee9992a1ac30bc544ae15fe5482c79878bf1d7a190a354 | 6030d7e36cd76dc1514a886403660003171cd897 |
| PLAN | 8 | product-manager | Approved with minor changes | sha256:1dd40b83af080f85cd1c290fac70e81b4dd6c31e7a1cae485f9a09ff8726e90a | 06f7666727eb739c7073273a95115fc348c3b761 |
| PLAN | 8 | test-engineer | Approved with minor changes | sha256:1dd40b83af080f85cd1c290fac70e81b4dd6c31e7a1cae485f9a09ff8726e90a | 06f7666727eb739c7073273a95115fc348c3b761 |
| PLAN | 9 | product-manager | Approved with minor changes | sha256:11c42cfad28ff04912a372a91b3e445496938bfaa47e709054a979adb5043af7 | 1c76961298be33908577f105ca62b6582f5b156f |
| PLAN | 9 | test-engineer | Approved with minor changes | sha256:11c42cfad28ff04912a372a91b3e445496938bfaa47e709054a979adb5043af7 | 1c76961298be33908577f105ca62b6582f5b156f |
| PLAN | 10 | product-manager | Approved with minor changes | sha256:eb087db310652bbd21be04c5849eecef4569790c2bad02619c32f561dabac105 | 7bce054eb48846d51dee364f487a5a00c156f619 |
| PLAN | 10 | test-engineer | Approved | sha256:eb087db310652bbd21be04c5849eecef4569790c2bad02619c32f561dabac105 | 7bce054eb48846d51dee364f487a5a00c156f619 |
| PLAN | 11 | product-manager | Approved with minor changes | sha256:899a9ed60229d9e79468b2e617b2505932730e850ac39a8655c5962903ae43f6 | 1eea225fc45f80a94f492799293034f6d969b6af |
| PLAN | 11 | test-engineer | Approved with minor changes | sha256:899a9ed60229d9e79468b2e617b2505932730e850ac39a8655c5962903ae43f6 | 1eea225fc45f80a94f492799293034f6d969b6af |
| PLAN | 12 | product-manager | Approved with minor changes | unavailable | unavailable |
| PLAN | 13 | product-manager | Approved with minor changes | sha256:d2c3356a750662030b8a8d4a5bf2e767d115af6702bb781981b902c0eba16ae6 | c3f8d624e600d9ccb4864585c01ea284d406a199 |
| PLAN | 13 | test-engineer | Approved with minor changes | sha256:d2c3356a750662030b8a8d4a5bf2e767d115af6702bb781981b902c0eba16ae6 | c3f8d624e600d9ccb4864585c01ea284d406a199 |
| PROPERTIES | 1 | software-engineer | Approved with minor changes | unavailable | unavailable |
| PROPERTIES | 2 | product-manager | Approved with minor changes | sha256:5742146d078c333fea6a5b6bc06025a94689e3fe1c674e117c05b3abc8a1d9bb | 16b022b3702c74a91d2e825cbeca9452c9d68cc1 |
| PROPERTIES | 2 | software-engineer | Approved with minor changes | sha256:5742146d078c333fea6a5b6bc06025a94689e3fe1c674e117c05b3abc8a1d9bb | 16b022b3702c74a91d2e825cbeca9452c9d68cc1 |
| PROPERTIES | 3 | product-manager | Approved | sha256:d30577b08761916978cef2c73aa501ab4f427ff815dd762889194a939f1e7ddf | 06e741625b25f8e74994f4e87db177e709491ec6 |
| PROPERTIES | 3 | software-engineer | Approved | sha256:d30577b08761916978cef2c73aa501ab4f427ff815dd762889194a939f1e7ddf | 06e741625b25f8e74994f4e87db177e709491ec6 |
| PROPERTIES | 4 | product-manager | Approved with minor changes | sha256:dacf4b751d3db8057a37d1f5de2199c2f963a0c7f006015d5a2e1866447b5558 | a4b12eb72246abb8f9c63dd082f9201782da8763 |
| PROPERTIES | 4 | software-engineer | Approved with minor changes | sha256:dacf4b751d3db8057a37d1f5de2199c2f963a0c7f006015d5a2e1866447b5558 | a4b12eb72246abb8f9c63dd082f9201782da8763 |
| PROPERTIES | 5 | product-manager | Approved with minor changes | sha256:dacf4b751d3db8057a37d1f5de2199c2f963a0c7f006015d5a2e1866447b5558 | f09ac6e7d7d4375fbe77a2e3ce9095a50cf749b1 |
| PROPERTIES | 5 | software-engineer | Approved with minor changes | sha256:dacf4b751d3db8057a37d1f5de2199c2f963a0c7f006015d5a2e1866447b5558 | f09ac6e7d7d4375fbe77a2e3ce9095a50cf749b1 |
| PROPERTIES | 6 | product-manager | Approved with minor changes | sha256:aeb7de4d1a3a6d0f938f0b9b65253eea582277dbb0a797b92d18219ab73ed054 | 3a5ca4b680f8cbc916b1442adcfbd7dc5afb8df7 |
| PROPERTIES | 6 | software-engineer | Approved with minor changes | sha256:aeb7de4d1a3a6d0f938f0b9b65253eea582277dbb0a797b92d18219ab73ed054 | 3a5ca4b680f8cbc916b1442adcfbd7dc5afb8df7 |
| PROPERTIES | 7 | product-manager | Approved with minor changes | sha256:f807d0684f79c65931da217c7f2258fd3310cf2576746bfa52ad2714e0c56759 | 81920109a4e3b722f00bd8a3cbb0e50d4e4de6c9 |
| PROPERTIES | 7 | software-engineer | Approved with minor changes | sha256:f807d0684f79c65931da217c7f2258fd3310cf2576746bfa52ad2714e0c56759 | 81920109a4e3b722f00bd8a3cbb0e50d4e4de6c9 |
| DECISIONS | 2 | product-manager | Approved with minor changes | sha256:d075c2818341978a219b595d4e937b2f9b2a3a52ad48aacbdb5ab76da1a1b959 | 8f3d6a1e8174f050566ef9ffb25771d77b232f23 |
| DECISIONS | 2 | test-engineer | Approved with minor changes | sha256:d075c2818341978a219b595d4e937b2f9b2a3a52ad48aacbdb5ab76da1a1b959 | 8f3d6a1e8174f050566ef9ffb25771d77b232f23 |
| DECISIONS | 3 | product-manager | Approved with minor changes | sha256:05d305f8699fa494c368ddd9e383ab3b34f4fd02a139ae99914886d53c5c7f66 | b88c787cb6fd5282496ed18aa757438939891f30 |
| DECISIONS | 3 | test-engineer | Approved with minor changes | sha256:05d305f8699fa494c368ddd9e383ab3b34f4fd02a139ae99914886d53c5c7f66 | b88c787cb6fd5282496ed18aa757438939891f30 |

