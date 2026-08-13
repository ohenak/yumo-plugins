# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/REQ-pdlc-engine-distribution.md` (v0.8)
**Date:** 2026-08-13
**Iteration:** 3
**Scope:** Testing lens, delta only. Round-2 findings re-checked at HEAD against code, not
against the REQ's own account of the fix. Only changed sections scanned for new issues.

## Round-2 disposition

All six round-2 findings resolved. Verified in the working tree:

| Prior | Resolution in v0.8 | Verified at HEAD |
|---|---|---|
| F-01 — AC-3.4 set-equality stated in one alphabet, consumed in another | M-ENG-10 now carries **two columns** (authored `name:` vs rendered); AC-3.4 requires equality in **both**; T-7 makes a matrix edit a change to M-ENG-10 first | `pdlc-engine-baseline.md:196-209` — rows 1–2 differ between columns, rows 3–5 identical; row 3 transcribes `Generated artifacts are in sync` byte-exactly, matching `pr-tests.yml:112` |
| F-02 — O-5 cited M-ENG-06, whose `AC-*` ids collide with this REQ's | Repointed to `handshake.mjs:130-133`, with the id-collision hazard stated explicitly | Repoint is real; the range is off by one — see F-02 below |
| F-03 — AC-4.5's exception set unnamed | The comparison set is now **the run's own final report's authored-file enumeration**, with the "if the report does not enumerate them today, that is new work" clause routed to O-9 | REQ:377-383 |
| F-04 — AC-6.2 called an absence a positive | Now a three-conjunct observation bound to one run: (1) run completed and emitted named outputs, (2) output carries no engine provenance block, (3) write root touched is the plugin's `.claude/workflows/` — with the crashed-run and engine-run falsifiers named | REQ:425-435 |
| F-05 — AC-1.3 read a `files` declaration that does not exist | Oracle is now **the packed tarball's contents**, with the vacuity of the declaration oracle stated inline | `pdlc/engine/package.json` has no `files` key (M-ENG-11 row confirmed); tarball set-equality is decidable offline |
| F-06 — AC-2.1's transcription source ambiguous between two READMEs | Names exactly one: `pdlc/README.md`'s `## Install in another repo` section, "no other file is a transcription source" | Heading is at `pdlc/README.md:132`, exactly as cited |

Two further checks on newly written text held:

- **AC-1.1's `pdlc doctor` exemption** (round-2 Q-01) is closed in the direction that keeps the
  diagnostic usable, and the command it exempts exists: `pdlc/engine/bin/pdlc.mjs:489`, dispatching
  nothing (`:205-225`), printing the plugin-root override on failure (`:222`).
- **AC-2.3's per-leg split** (install asserts resolution/version/location exists; upgrade asserts
  both differ from pre-run values) removes the round-2 defect where a clean-machine install had no
  before-value to differ from. Both legs are positive; neither is absence-shaped.

## Findings

No High findings. One Medium, two Lows — all in text written this round.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **AC-3.4's second set-equality does not say how the rendered set is obtained, and the two candidate answers are different tests at different levels.** The rendered names can be produced either (a) offline, by expanding the matrix locally from `pr-tests.yml:40-41` and `:87` — deterministic, unit-level, runs in the same suite as the authored-column check — or (b) by observing what GitHub actually reported on a PR run, which needs network, a merged PR, and cannot run in the gate it is asserting on. The AC says only "read the required-check names off the PR gate", which reads like (b) while the surrounding ACs (AC-1.3, AC-6.1) are careful to say "decidable offline". Name the carrier: if it is local expansion, say so and the AC is testable today; if it is a GitHub observation, AC-3.4 needs an owner and a level, because it cannot be a PR-gate check. | AC-3.4; T-7 |
| F-02 | Low | Local | **O-5's repointed citation is off by one line and excludes the token it cites.** `handshake.mjs:130-133` covers the blank line and the first three fragments of `REMEDY`; the string that actually names `PDLC_PLUGIN_ROOT` is at `:134`. A verifier grepping the cited range for the variable finds nothing and may conclude the claim is stale when it is true. Cite `:131-134` (the whole `REMEDY` const). The substance — that the engine already ships the selector rather than needing a new one — is confirmed: `bin/pdlc.mjs:78, 141` register `--plugin-root`, and `:104` accepts it on `doctor`. | §7 O-5 |
| F-03 | Low | Cross-Feature | **O-8 now disclaims a failure ordering that its own cited authority still asserts.** O-8 says "no failure ordering is claimed, because none is measured", but M-ENG-11's `private` row in `docs/_constraints/pdlc-engine-baseline.md:220` still reads "`npm publish` refuses outright, **before licence or credentials**". Whichever is right, the REQ and the fact it delegates to should not disagree — a test written from O-8 asserts three independent blockers, a test written from M-ENG-11 asserts an order. Drop the ordering clause from the baseline row, since it is the unmeasured half. | §7 O-8; M-ENG-11 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | AC-1.3 now excludes "no test corpus" from the packed set. `pdlc/engine/__tests__/` is inside the package root and lands in `npm pack`'s default set with no `files` field, so this exclusion is not free — it implies either a `files` field or an `.npmignore` as part of the outcome. Is that intended to be FSPEC's call, or is the exclusion itself the requirement? (Not blocking: the AC states an outcome and R-5/O-10 own the mechanism.) |
| Q-02 | AC-4.5's exception set is the run report's authored-file enumeration. If a run halts before writing its report, every file it touched is outside the exception set and the AC fails. Is that the intended semantics — halt means no exemption — or should the halt artifacts of AC-4.2 be enumerated too? |

## Positive Observations

- The two-alphabet fix is the right shape and was made in the right place. The REQ did not
  transcribe the check names a second time; it delegated to M-ENG-10 and made M-ENG-10 carry the
  distinction. There is still exactly one authoritative enumeration, and T-7's change-control
  sentence now names the specific failure mode — a matrix edit — that motivated the finding, so
  the next reader learns why the second column exists without re-deriving it.
- AC-4.5's exception set moved from a judgement ("normal phase work") to an artifact the run
  itself emits, and the REQ says plainly that the artifact may not exist yet and routes that to
  O-9 rather than assuming it. That is the same honesty pattern as AC-4.2's "this does not hold
  in construction today" — the REQ states criteria and admits which have no implementation path,
  which is far cheaper to discover here than in Phase I.
- AC-6.2's three conjuncts each name their falsifier in the AC itself ("a run that crashed before
  emitting anything fails (1); an engine run fails (2) and (3)"). A test engineer can write three
  assertions and two negative fixtures straight from that sentence.
- AC-2.3's per-leg split is a small change that fixes a real hole: the round-2 wording demanded a
  changed install location on a clean machine, which is unsatisfiable. The revision found the
  asymmetry rather than papering over it.
- v0.8 is shorter than v0.7 despite adding material — old changelog entries compressed, the O-1
  comparison delegated to DEC-DIST-05, R-1/R-3/R-4 mitigations trimmed to one direction each.
  Nothing load-bearing was lost in the compression; every deleted clause I spot-checked was
  duplicated elsewhere or superseded.

## Recommendation

**Approved with minor changes**

Every round-2 finding is resolved at the source, verified against code rather than against the
REQ's account: M-ENG-10 carries two alphabets and transcribes them byte-exactly; AC-1.3's oracle
is the tarball rather than a `files` field that does not exist; AC-4.5's exception set is
decidable from the run's own output; AC-6.2 is a conjunction with named falsifiers; AC-2.1 names
one transcription source that exists at the cited line. No High finding is open.

The remaining Medium is one clause: say whether AC-3.4's rendered-column equality is computed by
local matrix expansion or observed from GitHub, because those are different tests at different
levels and only one of them can run inside the gate it asserts on. The two Lows are a citation
off by one line and an ordering claim the baseline should drop now that O-8 has disclaimed it.

The erratum raised in round 2 is still live and is re-raised below: the false "copies embedded in
`pdlc/workflows/orchestrate-dev.js`" clause, correctly deleted from this REQ's NG-1 and O-1,
remains at `docs/_decisions/DECISIONS-plugin-distribution.md:127` as the stated reason for
rejecting the private-registry channel.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 2}
