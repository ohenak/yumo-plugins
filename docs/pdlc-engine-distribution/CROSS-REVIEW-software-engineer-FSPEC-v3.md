# Cross-Review: software-engineer — FSPEC (delta confirmation, erratum round)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/FSPEC-pdlc-engine-distribution.md` (v0.3)
**Date:** 2026-08-13
**Iteration:** 3
**Scope:** Delta confirmation of the erratum edit `aa4d4a50..HEAD`, plus re-grounding against
upstream REQ v0.10 (`sha256:f570fb72…57e1`, matches dispatch) and the downstream TSPEC §5.4
`PK-*` table the edit now defers to. Not a full re-review.

## Raised items — disposition

| Item | Raised by | Landed? | Evidence |
|---|---|---|---|
| §3 F-7's dangling `AT-7.2` citation should read `AT-6.2` | pm-review, te-review, se-author (5 filings) | **Yes** | `FSPEC:296` now reads "§8's AT-6.2"; `grep AT-7` returns only changelog prose at `:20-21`. `AT-6.2` at `:755` is the manual load-root/coexistence test, which is the criterion F-7's two-channel conjunction actually depends on (`:773`, `:775` corroborate: "the load-root half of AT-6.2") |
| AT-3.8a's expected packed set contradicts TSPEC §5.4's `PK-*` table | se-author | **Partially** — see F-01 | §5.2's CLI-entry and engine-module rows no longer restate members ("named in TSPEC §5.4"); AT-3.8a (`:691-696`) now says the members "are named downstream, in TSPEC §5.4's `PK-*` table". This resolves four of the seven members TSPEC named (`TSPEC:410-413`): `bin/cli.mjs` (PK-4b) and the three new `lib/*.mjs` (PK-17…PK-19). Three are still unresolved |

Absorption of REQ v0.10 is faithful: AT-3.5 (`:680-684`) now carries both positives verbatim in
substance against REQ AC-3.5 (`REQ:340-346`), and the NG-6/O-2 run-reads-the-pin scope was
already carried at BR-4.7 (`:381`), I-4 (`:538`), E-11 (`:572`) — correctly recorded as absorbed
rather than as new work.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | The erratum closed four of the seven divergent members TSPEC §5.4 raised, not seven. `README.md` (PK-2), `LICENSE` (PK-3) and `scripts/postinstall.mjs` (PK-23) still have **no class row** in §5.2, and the exclusion list still reads "no repo-level documentation". AT-3.8a gates on both-directions equality (BR-8.1), so the contradiction is live in both directions: a verifier transcribing TSPEC §5.4's full `PK-*` table enumerates PK-2/PK-3/PK-23, which §5.2 admits under no class; a verifier reading §5.2's classes literally must **fail** the build when those three are packed. This is the same defect class the erratum was raised to end, so routing alone did not end it — §5.2 needs class rows for the package README, the licence (with PK-3's conditional-on-N-2 note preserved) and the postinstall script, each pointing at TSPEC §5.4 for members | §5.2 (`:474-478`), AT-3.8a (`:691`), `TSPEC:408-419` |
| F-02 | Medium | Local | BR-8.1 still instructs the verifier that "the expected side is the **literal list above**" (`:500`). After the erratum there is no list above — §5.2's rows delegate to TSPEC §5.4. The sentence now contradicts AT-3.8a's corrected text and points the implementer back at the FSPEC-local copy that diverged. Reword to "the expected side is a literal list, transcribed from TSPEC §5.4's `PK-*` table, never a listing of the shipped tree" — the anti-directory-listing half of the rule is the part worth keeping | §5.2 BR-8.1 (`:500`) |
| F-03 | Low | Local | REQ v0.10's changelog attributes the run-side pin read to "FSPEC F-3 step 5" (`REQ:21`); the flow that reads `engine.*` is **F-4** (`:158`, `:170`) — F-3 itself defers to "F-4 step 2" at `:146`. Prose-only misattribution in an upstream changelog, no behavioural consequence, and both documents agree on the substance. Recorded here rather than raised as a second erratum: the erratum budget for this phase is spent and the defect does not affect any acceptance criterion | `REQ:21` vs `FSPEC:146,158,170` |

Nothing previously approved was broken by the edit. §5.2's workflow-module row remains marked
*[blocked on O-10]* even though `TSPEC:421-429` explicitly unblocks it (PK-20…PK-22); that is a
downstream-ahead-of-upstream state that AT-3.8b already handles on the TSPEC side, and it is not
new in this delta, so it is not filed as a finding here.

## Questions

| ID | Question |
|----|---------|
| Q-01 | Should §5.2 keep *any* member text at all, or should the whole table collapse to class names plus a single "members: TSPEC §5.4 `PK-*`" pointer? The half-delegated state (manifest named literally, CLI entry and modules delegated) is what left F-01's three members homeless; a uniform rule is harder to drift |

## Positive Observations

- The AT-7.2 → AT-6.2 correction is exactly right, not merely plausible: AT-6.2 is the manual
  load-root observation, which is the only criterion that can carry F-7's two-channel conjunction,
  and the surrounding §9 Q-2 text already treated it as such.
- Routing the packed-member list to a single downstream source (rather than re-synchronising two
  copies) is the correct structural fix — an FSPEC-local copy is what diverged, and a second
  synchronised copy would have diverged again on the next decomposition change.
- The changelog names what was **absorbed** (NG-6/O-2 scope, already carried) separately from what
  was **fixed**, which is what makes this confirmation cheap to perform.

## Recommendation

**Needs revision** — F-01 is a High finding: the erratum resolved four of seven divergent members
and left `README.md`, `LICENSE` and `scripts/postinstall.mjs` with no class in §5.2 while AT-3.8a
gates on member-for-member equality in both directions. Add the three class rows (delegating
members to TSPEC §5.4, preserving PK-3's conditionality on N-2) and drop the "no repo-level
documentation" exclusion's collision with the package README; F-02's BR-8.1 wording should be
corrected in the same edit.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 1, "low": 1}
