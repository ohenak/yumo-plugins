# Cross-Review: product-manager — TSPEC (delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-wave-resume/TSPEC-pdlc-wave-resume.md
**Date:** 2026-08-21
**Iteration:** 5 (round 3 erratum — delta confirmation)
**Scope:** Local

## Scope

This is a **delta confirmation**, not a fresh review. I approved this TSPEC at v4 (`REVIEWED-COMMIT:
618589c22e6d5e20ed061158df001a65032ed2d6`, *Approved with minor changes*). Since then the document
has received exactly the round-3 erratum edit: four commits, `0a1ec695` → `b4a628b8`, +26/−7 lines
against `docs/pdlc-wave-resume/TSPEC-pdlc-wave-resume.md`, and nothing else. No other file in
`docs/pdlc-wave-resume/` moved.

The question I answer is the narrow one: does that delta land the routed items without breaking what
I previously approved, and is the document still a faithful compression of its upstream **at HEAD**?

Upstream state at this dispatch, verified by hash against my v4 `UPSTREAM-STATE:` anchors — both are
**byte-identical to the versions I approved against**, so no upstream text moved under this document
between v4 and now:

| Upstream | sha256 (measured, HEAD worktree) | Same as at v4? |
|---|---|---|
| `REQ-pdlc-wave-resume.md` | `17e83bfc…9e8c79f` | yes |
| `FSPEC-pdlc-wave-resume.md` | `9a6be7b5…1552356e` | yes |

That does not make the re-grounding duty vacuous — it makes it *cheap*: the upstream clauses the new
bytes newly lean on (FSPEC BR-07, BR-02) still had to be read at HEAD, and were (§ *Upstream
Re-Grounding*). It also means the upstream-drift findings I recorded at v4 are still live in exactly
the form I recorded them, which is what the *Carried Findings* section is about.

## Routed Items — Landing Check

The nine routed bullets are six distinct defects (the off-by-one, the RT-1 size claim and the §2.4
catalogue were each raised by two or three roles). Each row below is checked against the bytes at
HEAD and, where the claim is about the world rather than about the document, against the world.

| # | Routed item | Landed? | Evidence I checked |
|---|---|---|---|
| 1 | §3.1 "Four of the seven reasons interpolate" is an off-by-one | **Partly** — see F-01 | §3.1 now reads "**Three** of the seven reasons interpolate … `feature-mismatch`, `head-unreachable` and `over-count` … carrying **four** interpolated values". The *three* is right; the *four* is not (F-01, Low). |
| 2 | §6.1 DEC-WVR-06 repeats the same "four of seven" count | **Partly** — same defect | The row now reads "three of the seven interpolate run-specific values (four values in total, §3.1)". The two figures are now consistent with each other, which was the routed complaint; both inherit F-01's residual. |
| 3 | §6.4 RT-1 "the single largest file in the repo" | **Yes** | RT-1 now reads "the largest tracked *source module* … (734,711 B) and the second-largest tracked file of any kind — the generated `pdlc/workflows/dist/pdlc-cli.mjs` is larger at 738,924 B". I re-ran the measurement: `git ls-tree -r -l 345ae358 \| sort -k4 -nr \| head -2` returns `pdlc-cli.mjs 738924` then `orchestrate-dev.js 734711`. Both byte counts are exact, and the citation now names the command and the commit, so the claim is falsifiable rather than atmospheric. |
| 4 | §2.4's announcement table omits the invalid-`startWave` notice; the catalogue is closed by omission | **Yes** | §2.4 now carries an explicit iff-rule ("a notice carries a provenance token **iff** the resume decision emits it about a *resolved start point*") plus a one-row exclusion table naming the notice and its reason. |
| 5 | §2.4's "three shipped assertions that do change" count is unsafe while the catalogue is open | **Yes** | The exclusion paragraph now derives the count from the rule: the excluded notice gains no suffix, so no assertion pinning it changes, so the count stays three. The count is now a consequence rather than an enumeration that a reader has to trust. |
| 6 | §3.2 duplicates a clause ("on the decision on the decision") | **Yes** | The sentence now reads "Keeping the field on the decision is what lets that line be rendered…". This was my own v4 F-08; it is closed. |
| 7 | DEC-WVR-02 (b) calls an ancestry seam "a runtime capability" | **Yes** | The alternative now says extraction "would add a `main()` parameter and one more adapter binding, not a host capability", and names the mechanism. Verified against the tree: the shipped probe calls `branchGuardTransport(gitFn)` (`orchestrate-dev.js` on `origin/main`, the `headCorroborated` helper), and `runtime-adapter.js` defines `rtGit` and binds `_git: rtGit`. So the seam does already exist and the corrected cost — plumbing, not capability — is the true one. |

### On item 4, which is the one with product content

This is the only routed item that changes what the document *decides* rather than what it *states*,
so it deserves more than a landed/not-landed tick. I checked the rule against FSPEC BR-07 at HEAD,
which reads: "Every run that starts anywhere other than the plan's first wave — outcomes (b) and (c)
— announces its provenance … and so does **a full run reached by an operator pointer** or by an
announced disregard cause."

The exclusion argument is that an invalid `implementation.startWave` is rejected by config
validation *before* any resume decision, the pointer is discarded, and the run that follows is
therefore not "reached by an operator pointer". I confirmed the shipped mechanism matches that
description: the notice is emitted from the `implParsed.invalidKeys` loop, which runs well above the
resume block, and the rejected key falls back to the default — after which the run's start point is
decided by the ledger path like any other automatic run. So the run genuinely is an ordinary
automatic run, and §2.4's claim that "whatever it announces afterwards is one of the six rows above"
is the correct product reading, not a convenient one. FSPEC BR-02's silent IG-6 case is named too,
which is the case an operator would most plausibly hit after a typo'd pointer.

The wording of the notice is quoted accurately as content: shipped emits
`` `Notice: implementation.${key} in ${MERGE_CONFIG_PATH} is not a valid value — using the default.` ``,
and §2.4 renders it with `startWave` and `{cfg}` substituted, which is the same sentence.

**Why I care about the rule rather than the row.** A catalogue closed by enumeration is one an
implementer can silently outgrow: add a seventh notice and nothing reds. A catalogue closed by an
iff-rule gives the implementer and the reviewer the same decision procedure, and it is the rule —
not the row — that keeps §2.4's "exactly three assertions change" honest. This is the shape I asked
for, and it is better than the shape I asked for.

## Upstream Re-Grounding (DEC-ERR-03)

_(pending)_

## Carried Findings (inherited, unchanged bytes)

_(pending)_

## Questions

_(pending)_

## Positive Observations

_(pending)_

## Recommendation

_(pending)_

## Delta-Confirmation Findings

_(pending)_

## Verdict

_(pending)_
