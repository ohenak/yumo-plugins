# Cross-Review: software-engineer — REQ (delta re-review, frozen round)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/REQ-pdlc-engine-distribution.md`
**Date:** 2026-08-16
**Iteration:** 9
**Scope:** Delta only. `git diff 20c87cd3..HEAD` on the REQ is a single hunk, +11 / −0,
adding the second bullet under **NG-5** (`REQ:194–204`, commit `3605092b`, "bump past the
published 0.1.0 and guard the skew"). Prior review: `CROSS-REVIEW-software-engineer-REQ-v8.md`
(Approved with minor changes, 0 High). Decision freeze respected: nothing new opened.

## Delta verification — every claim in the added bullet, checked at HEAD

| Claim in delta | Verified against | Result |
|---|---|---|
| `pdlc/engine/package.json` 0.1.0 → 0.2.0 | `pdlc/engine/package.json:3` → `"version": "0.2.0"` | **True** |
| `engine-v0.1.0` was published | `git tag -l 'engine-v*'` → `engine-v0.1.0`; `EVIDENCE-BR-3.9.md:7–8` records `@kaneho/pdlc-engine@0.1.0` from that tag at `30773d0c` | **True** |
| Packed members changed after that publish | `git diff --stat 30773d0c HEAD -- pdlc/engine/{bin,lib}`: `bin/cli.mjs` +368/−, `bin/pdlc.mjs`, `lib/catalogue.mjs`, `lib/startup.mjs` | **True** (but see F-01 on the enumeration) |
| Attributed to T41, T43, T45, T46, T48, T50 | PLAN ownership manifest `:350–359` — those rows own `bin/cli.mjs`, `bin/pdlc.mjs`, `lib/run.mjs`, `lib/catalogue.mjs` | **True** |
| `EVIDENCE-BR-3.9.md` is a dated record, not edited | Untouched in `3605092b`; file is dated 2026-08-16 and states the tag/commit | **True** |
| Guard exists: `pdlc/engine/__tests__/version-skew.test.js` | File present, 129 lines, 3 tests; `node --test` → `# pass 3 / # fail 0`; picked up by the suite runner's whole-directory arg (`__tests__/_run-suite.mjs:50`) | **True** |
| Guard "reds whenever the manifest version **equals**… a published version" | Test 1, `:86–91` — `assert.ok(!published.has(pkg.version))` | **True** |
| Guard "reds whenever the manifest version… **fails to exceed** a published version" | Test 2, `:99–104` — `assert.equal(compareSemver(pkg.version, highest), 1)` | **True** |
| Published set read from tracked feature evidence | `:33` `EVIDENCE_PATHSPEC = "docs/pdlc-engine-distribution/EVIDENCE-*.md"`, harvested via `git ls-files` (`:39–48`), only `@name@X.Y.Z` / `engine-vX.Y.Z` forms (`:54–67`) | **True** — hermetic, offline, and deliberately narrower than bare-`X.Y.Z` prose |
| "This is a version number, not pipeline semantics, so it is not itself an NG-5 exception" | Correct as written: NG-5's subject is phase graph / review bars / completeness criteria / queue lifecycle / report shape (`REQ:179–182`); a manifest version touches none | **True** |
| Plugin-side half it leans on (`plugin.json` 0.23.0 → 0.23.1, inside `^0.23.0`) | `pdlc/.claude-plugin/plugin.json:4` = `0.23.1`; `pdlc/engine/package.json:18` `pdlcPluginCompat: "^0.23.0"` — 0.23.1 satisfies | **True**, unchanged by the delta |

Oracle quality of the new guard, judged against this round's bar: no implementation echo (the
expected relation is a literal semver comparison against evidence-file bytes, not a value derived
from the code under test); not absence-only (test 1's negative — "not already published" — is
paired with test 2's positive assertion that HEAD is strictly ahead of the highest published
version, on the same manifest); the published set is a harvested closed set rather than a
containment spot-check. The evidence-file direction is the right one: the file is written *after*
a publish, so a tag commit is never red on account of its own release (`:11–15`).

Nothing previously approved was contradicted. NG-5's first bullet, O-A/O-B (the v8 subject),
AC-3.4, T-7 and C-5 are byte-identical in this diff.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **The packed-member enumeration in the new bullet is inaccurate in both directions, though its conclusion holds.** It reads "The packed members (`bin/`, `lib/`, `scripts/postinstall.mjs`, the manifest) changed after `engine-v0.1.0` was published". At HEAD, `git diff --stat 30773d0c HEAD -- pdlc/engine/scripts/postinstall.mjs` is **empty** — that member did not change; and `vendor/workflows/`, which *is* a packed member (`pdlc/engine/package.json` `files: ["bin/","lib/","vendor/workflows/","scripts/postinstall.mjs"]`) and which is re-vendored from `pdlc/workflows/` at prepack, is omitted from the list. The load-bearing claim — that packed bytes moved, so the number had to move — is independently true from `bin/` and `lib/` alone, so this does not block. Suggested one-clause fix: "`bin/` and `lib/` (and, at prepack, `vendor/workflows/`) changed after `engine-v0.1.0` was published". | NG-5, second bullet (`REQ:195–197`) |
| F-02 | Low | Local | **The edit did not move the Version cell or add a changelog row.** The header still reads `0.12` (`REQ:18`) and the 0.12 entry ends "*No other change.*" (`REQ:24`), while HEAD carries 11 lines authored after 0.12. Non-gating — REQ version is not an oracle input, and the round's approval anchor is byte-hashed, not version-keyed — but it is worth noting that the un-versioned edit is itself a note about not letting a version number name older bytes. | Header table / changelog |

## Questions

| ID | Question |
|----|---------|
| Q-01 | The guard harvests `engine-v(\d+\.\d+\.\d+)` from **any** tracked `EVIDENCE-*.md` under this feature. `EVIDENCE-AT-4.4.md` / `EVIDENCE-AT-6.2.md` are in that pathspec today. Intended (any dated evidence file may record a publish), or intended to be BR-3.9-only? Reading the comment at `:11–13` ("and any successor"), I take it as intended and file no finding. |

## Positive Observations

- The delta closes the engine axis of exactly the skew the plugin-side bullet already closed, and
  says so in one sentence rather than restating the reasoning — the REQ acquires no second
  change-control point.
- It is recorded **with a mechanical guard rather than as prose intent**. The prior bullet's
  "never again ship under a version number that already named different bytes" was a promise; this
  one ships an oracle that reds when the promise is broken.
- The bullet is explicit that it is *not* an NG-5 exception and explains why it is recorded here
  anyway. That is the right handling of a note that would otherwise look like non-goal drift.
- Keeping `EVIDENCE-BR-3.9.md` immutable and moving the manifest instead preserves the evidence
  file's value as a dated record — the same discipline the immutable-tag argument rests on.

DEFERRED: Version cell / changelog row not moved for the post-0.12 NG-5 addition (F-02) — fold into the next authored revision of the REQ.
DEFERRED: Packed-member enumeration wording in NG-5's second bullet (F-01) — one-clause correction, no AC affected.

## Recommendation

**Approved with minor changes** — the delta's load-bearing claims all verify against HEAD, the
guard it names exists and behaves as described (3/3 pass), and nothing previously approved was
broken. Both findings are wording-level and non-gating under this round's freeze.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}

APPROVAL-HASH: sha256:44d0e18836f534cb68444f6e5a0b26eebf3d2aafe7f7630ce1f38fed78b1d00f
APPROVAL-HASH-NORMALIZED: sha256:ab2e8c4732037aa1ef69d5ec119cf9dcb44da2a6c869d43e79f4f9580c7a95cd
REVIEWED-COMMIT: f02d51567739ce856fc6e7d577538517b539a46c
