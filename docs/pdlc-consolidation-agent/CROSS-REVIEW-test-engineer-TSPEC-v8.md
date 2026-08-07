# Cross-Review: test-engineer — TSPEC (delta confirmation, erratum round 7)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-consolidation-agent/TSPEC-pdlc-consolidation-agent.md
**Date:** 2026-08-06
**Iteration:** 8
**Scope:** Delta confirmation only — the erratum edit at `94e6bb1f..a3049d1f` (TSPEC v1.6 → v1.7). Sections outside that diff were approved at v7 and are not re-reviewed.

## Delta reviewed

Four commits, all targeted, no restructuring:

| Commit | Edit |
|---|---|
| `186cb403` | §8 traceability row `:1325` (NFR-2 / §7.4) — qualifies non-disclosure as structural **outbound**, records the inbound failure-reply residual |
| `37c97bb2` | §9.2 — corrects the push mechanism, picks the credential-helper lane, records two rejected alternatives |
| `a3049d1f` | §5.3 summary sentence and §13.1 row 1 aligned to the corrected mechanism; version 1.6 → 1.7 with a changelog note |

I verified every code citation the delta makes against the tree rather than taking the document's word for it:

- `rtShellQuote` POSIX single-quotes its argument — `pdlc/workflows/runtime-adapter.js:668-670` (`return \`'${String(arg).split("'").join("'\\''")}'\``); `rtGit` maps it over every argv element at `:948` before interpolating into the transported command. The document's claim that a `$VAR` in a `_git` argv is transported literally is correct.
- `rtGit`'s failure prompt asks for "the LAST 300 characters of its **combined output**" — `:951`. `rtParseTransportReply` is at `:967` and surfaces the field as `stderr` at `:977`. Correct as cited.
- `rtGhRun` takes a command string and interpolates it verbatim — `:995`. The `gh` half of the original claim survives intact, which is what the delta now says.

## Erratum items — disposition

The seven routed items collapse to two distinct defects (four restatements of the NFR-2 row, three of the push mechanism). Both are resolved.

| Item | Raised by | Disposition | Evidence |
|---|---|---|---|
| NFR-2 row at `:1325` claims non-disclosure "structural" without qualification (items 1, 3, 5, 7) | pm-review ×2, se-author ×2 | **Resolved** | The row now says "structural **on the outbound path**", states explicitly "It is **not** structural inbound, and this row does not claim it is", names the mechanism (`rtGit:951` combined output → `rtParseTransportReply:967` → `stderr` at `:977`), names both render sites (§10.3 row 1a at `TSPEC:1832`, `openClone`'s `{failure, detail}` at `TSPEC:1522`), states the residual's bound ("what `git` prints on failure, not the seam's interface"), and carries it under DEC-CONS-01's existing qualification rather than inventing a second one. It records the residual **and** names the one thing that is still closed (the rendered artifacts stay credential-free because the value never becomes a JS string) — which is the "either record or close" the erratum asked for, on the correct side of the line for each half. |
| §9.2 claims the credentialed push reaches `git` by shell expansion (items 2, 4, 6) | se-author ×2, pm-review ×1 | **Resolved** | §9.2 now states the `gh` half is exact (`_ghRun` is a command string, `:995`) and that the push half was wrong, with the mechanism cited (`rtShellQuote`, `:668-670`). A lane is picked rather than left open: the push stays on `_git` and carries `-c credential.helper=!f(){ echo username=x; echo password=$VAR; };f`, expanded by `git`'s own shell one process below the transport. Both alternatives the errata named are recorded as rejected with reasons — the command-string git seam (would move the push out of §9.3's `_git`-argv domain classifier) and `gh`-for-both (`gh` has no push verb). §5.3 (`:341-345`) and §13.1 row 1 (`:2481`) are swept to match, so the three statements of the mechanism now agree. |

Two testability checks on the chosen lane, both pass:

- **The helper string survives the transport.** It contains no single quote, so `rtShellQuote` wraps it cleanly and `git` receives it byte-intact; `git` treats a `credential.helper` value beginning `!` as a shell command, so the expansion the section claims is the one that actually happens. The module still holds only the variable name, so the NFR-2 outbound property the whole design rests on is unchanged — and it is asserted the same way it was at v7 (argv-shape over the seam double), so no oracle in §11.3 or §12.2 is invalidated by the change.
- **§9.3's classifier still bins the push.** The credentialed argv begins `["-C", dir, …]`, so `resolveSeamDomain` still returns `git-clone`, and `resolveSeamVerb` must skip the `-c` element to resolve `push` — an obligation that pre-existed this delta (the withdrawn `-c http.extraheader` form had the same shape), so AT-Q7's containment assertion is unaffected.

## Findings

Nothing in the delta breaks a section I approved at v7. Two Low findings, both consistency residue from a deliberately targeted edit — neither invalidates an oracle, a test level, or a falsifier.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | §12.1's traceability row for `CONS-06 Credential handling` (`:2337`) still describes the mechanism as "shell-expansion of the value", which the delta has just made half-true — expansion at transport for `gh`, expansion one process lower for `git`. The row points at §5.3 and §9.2, both of which are now correct, so a reader following the trace lands on the right mechanism; only the row's own summary is stale. Suggest "shell-expansion of the value (`gh` at transport, `git` via credential helper)". No test or oracle reads this row. | §12.1 `:2337` |
| F-02 | Low | Local | The `push` row of §9.2's step table (`:1569`) shows `_git(["-C", dir, "push", "origin", …])` with no indication that the credentialed arm carries a preceding `-c credential.helper=…` element — the two-arm shape lives only in the prose 60 lines below (`:1628`, `:1641`). A test author transcribing the table writes one push oracle and no credentialed-arm case. This is pre-existing (the withdrawn `extraheader` form had the same table/prose split) and so not a delta regression, but the delta is the moment to close it: a parenthetical in the row, or a second row for the credentialed arm, makes the arm difference transcribable. | §9.2 `:1569` |

**Noted, not filed as a finding.** The chosen lane interpolates `consolidation.credentialEnv` into a shell snippet that `git` executes, so a config value that is not a bare identifier becomes executed shell. This is the same property the already-approved `gh` prefix has (`GH_TOKEN="$VAR" gh …`, `:1611`), the config is maintainer-owned at the same trust level as the rest of `.claude/pdlc.config.json`, and the delta extends an existing surface rather than opening a new class — so it is out of scope for a delta confirmation and I am not raising it against this round. It is worth one property at the PROPERTIES layer (`credentialEnv` conforms to `^[A-Za-z_][A-Za-z0-9_]*$`, else the credential resolves `absent` + `credential-unavailable`), which would make the non-disclosure argument total over config inputs rather than over well-formed ones. Handing it to the next layer, not back to this one.

## Questions

None. Neither Low finding needs an answer before implementation.

## Positive Observations

- The NFR-2 row does the thing a traceability row usually fails to do under pressure: it separates the property that is **structural** from the property that is **disciplined**, names the exact byte channel that carries the residual, and bounds it. A reviewer can now falsify the claim by reading three cited lines instead of reasoning about the whole seam.
- §9.2 records that an earlier draft was wrong, in the section, rather than silently rewriting it. That is the second time this document has done so (the `read-remote`/`read-object` fold at `:1681` is the first) and it is what makes the rejected-alternative rows worth reading.
- The rejection of the command-string git transport is argued on a **testability** ground, not an aesthetic one: it would move the push out of the domain whose classifier AT-Q7's containment assertion ranges over. That is the right reason to reject it and it is stated as such.
- The version block's changelog note names both errata and the two swept sections, so the next reviewer can scope a diff without reconstructing it.

## Recommendation

**Approved with minor changes**

The delta resolves both underlying defects — all seven routed items — and breaks nothing I approved at v7. The two Low findings are documentation-consistency residue and may be swept whenever §12.1 or §9.2 is next touched; neither blocks Phase P.

## Verdict

VERDICT: Approved with minor changes
