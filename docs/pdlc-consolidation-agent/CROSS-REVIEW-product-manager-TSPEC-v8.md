# Cross-Review: product-manager — TSPEC (delta confirmation, erratum round 7)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-consolidation-agent/TSPEC-pdlc-consolidation-agent.md`
**Date:** 2026-08-06
**Iteration:** 8
**Scope:** Local (per-finding tags in the table)
**Delta base:** `94e6bb1f` (the HEAD I approved at v7) → `a3049d1f`; three commits, all erratum-targeted (`186cb403`, `37c97bb2`, `a3049d1f`). This is a **delta confirmation**, not a re-review: I read only the diff and the two erratum items it answers.

## Erratum items — disposition

The seven routed items collapse to two distinct defects (four restatements of the NFR-2 row, three of the push mechanism). I take them as two.

| Item | Status | Evidence in the revision |
|---|---|---|
| **E-1 — the NFR-2 traceability row states non-disclosure as unqualifiedly "structural"** (raised by me at v7 and by se-author; four routed restatements) | **Resolved, and resolved the way I asked** — the row records the residual rather than closing it by assertion | The row (`TSPEC:1339`) now reads that the renderer taking no credential argument makes non-disclosure structural "**on the outbound path**", then states in the row itself that "it is **not** structural inbound, and this row does not claim it is", naming the channel end to end: `rtGit` asking its transport agent for "the LAST 300 characters of its **combined output**" (verified — `pdlc/workflows/runtime-adapter.js:951` is exactly that sentence), `rtParseTransportReply` (`:967`) surfacing it as `stderr` (`:977`, `stderr: typeof (parsed && parsed.stderr) === "string" ? …`), and the two render sites in this feature — §10.3 row 1a's "the pathspec and `stderr` in the report body" and `openClone`'s `{failure, detail}` on the credentialed clone/push path. The bound is stated honestly ("bounded by what `git` prints on failure, not by the seam's interface") and the disposition is explicit: "carried — not closed — under the same qualification DEC-CONS-01 records". That last clause is the part that matters for me as PM: the TSPEC row and the already-approved DECISIONS residual now say the same thing in the same words ("honoured by construction outbound and by implementation discipline inbound"; `DECISIONS-…:93-120`, which I re-read and which carries that sentence verbatim). No product-level claim moved: REQ NFR-2 (`REQ-…:521`, "the credential never appears in a log, PR body, artifact, or notification") is still asserted, still with the same coverage — what changed is that the *reason* it holds is now stated per-direction instead of over-claimed for both. |
| **E-2 — §9.2 claims the credentialed push reaches `git` by shell expansion, which `rtShellQuote` makes impossible** (raised by me and by se-author; three routed restatements) | **Resolved** — the wrong claim is withdrawn by name, a lane is picked, and the two alternatives are recorded as rejected | §9.2 (`TSPEC:1611-1641`) now splits the two halves. The `gh` half keeps the original claim and it verifies: `_ghRun` takes a command string that `rtGhRun` interpolates verbatim into the transported command (`runtime-adapter.js:995` — confirmed, the prompt embeds `${command}` unquoted), so a module-written env prefix is expanded by the shell that runs it. The push half is corrected in the document's own voice — "an earlier draft of this section was wrong about it" — with the mechanism named: `rtGit` passes every argv element through `rtShellQuote` (`runtime-adapter.js:668-670`, confirmed: `'${String(arg).split("'").join("'\\''")}'`), so `-c http.extraheader=…$VAR…` is transported literally and never expands. The chosen lane is a **git credential helper** carried as a single (quoted) `-c` element whose expansion happens inside the shell `git` itself runs — one process below the transport — so the module still holds only the variable name and the value still never becomes a JS string. The two alternatives I would have asked about are pre-empted: a second, unquoted command-string git transport is rejected because it moves the push out of §9.3's `_git`-argv domain classifier and re-opens a **frozen FSPEC §6.5 seam set** for a capability the helper form already gives; `gh`-for-both is rejected because `gh` has no push verb. `grep` over the document confirms `extraheader` now survives only inside the correction narrative and the change note — no surviving assertion of the withdrawn mechanism. §5.3 (`:341-342`) and §13.1 row 1 (`:2481`) are swept to match, as the change note claims. |

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-23 | Low | Local | **Two internal line pointers in the new NFR-2 row are stale by the edit that introduced them.** The row cites §10.3 row 1a as `TSPEC:1832` and `openClone`'s `{failure, detail}` as `TSPEC:1522`; after this erratum's own +25-line insertion the actual lines are **1872** and **1536** (`:1832` now lands in §8.4's `teeLog` paragraph, `:1522` in a fenced block). Both citations also name their target in prose (§10.3 row 1a; `openClone`), so nothing is unfindable and no claim is wrong — this is citation drift, not a content defect, and it is the same class of sweep the v7 round closed for BR-15 and E-11. Fix on the next touch of §12.1/§8; not worth a round of its own. | NFR-2 |

Not a finding, recorded so the next reviewer does not re-raise it: §12.1's CONS-06 row (`:2337`) still summarises the mechanism as "shell-expansion of the value". I considered flagging it as inconsistent with the corrected §9.2 and decided it is not — the chosen lane *is* shell expansion of the value, performed by `git`'s own shell rather than the transport's, and the row's own § pointers (§5.3, §9.2) lead to the two places that now state which shell does it. A one-word qualifier there would read better but changes nothing a reader could get wrong.

## Questions

| ID | Question |
|----|---------|
| Q-14 | (carried, unchanged from v6/v7, still deliberately open) Does the accepted residue — one class of pass death that leaves no log trace — deserve an operator-facing sentence? Nothing in this round touched it. |
| Q-15 | The credential-helper element reaches `git` as a single-quoted argv element, which is what makes it survive transport. `rtGit`'s own doc comment notes the executing agent "sometimes runs it verbatim and sometimes re-quotes it". I am satisfied this is harmless for the helper (it is inert text to `git` either way, and the value is expanded below the transport), and it is a technical question rather than a product one — recorded, not asked as a blocker. |

## Positive Observations

- **The erratum did the harder of the two available things.** The cheap resolution of E-1 was to delete the word "structural"; the row instead states the residual, names its two render sites, bounds it, and ties it to the DECISIONS disposition already approved — so the TSPEC and DECISIONS now cannot drift apart on the one NFR the operator cares about. As PM I would rather ship a recorded residual than an unqualified claim I cannot verify.
- **E-2 was resolved without spending a frozen scope boundary.** The obvious fix (a second, unquoted command-string git transport) would have added a seam to FSPEC §6.5's frozen set and broken §9.3's `_git`-argv domain classifier. The chosen helper form leaves both untouched — no product-scope change, no FSPEC re-open, no new operator-visible surface. The rejected alternatives are recorded with that reason, which is exactly where a scope-protecting argument belongs.
- **The document withdraws its own wrong claim by name** ("an earlier draft of this section was wrong about it") rather than quietly rewriting it, which is the pattern §7.3 and §13.1 row 5 already established here.
- Every code citation in the delta verified at HEAD: `runtime-adapter.js:668-670`, `:951`, `:967`, `:977`, `:995`.

## Recommendation
