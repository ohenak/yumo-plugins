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

## Questions

## Positive Observations

## Recommendation
