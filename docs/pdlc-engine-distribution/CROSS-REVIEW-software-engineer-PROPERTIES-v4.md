# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/PROPERTIES-pdlc-engine-distribution.md` (v0.6)
**Date:** 2026-08-14
**Iteration:** 4
**Scope:** Delta re-review of the v0.5 → v0.6 edit (commits `c8ae346d`, `1418429a`, `d71e3986`,
`a4b12eb7`) against my v3 review at `06e74162`. Two of my open findings (F-01 Medium, F-02 Low)
checked for resolution; only the changed regions scanned for new issues. Not a whole-document
re-review.

## 1. Prior findings — resolution

Both of my round-2 findings, carried forward unaddressed through the round-3 erratum round,
are now closed. I checked the diff, not the changelog.

| Prior finding | Severity | Edit made | Verified |
|---|---|---|---|
| **F-01** — PROP-LAUNCH-1 traced `AC-5.5` while asserting `store.empty`, whereas AC-5.5's message id is `version.pin-missing` and is already carried by PROP-VER-5; §4's no-`AT-`-row paragraph compounded it by naming AT-5.5's and AT-1.3's legs as the observation site | Medium | (a) `:86`'s `Traces` cell now reads `TSPEC §6.2` alone and the row states it is a resolver-shape property with no acceptance criterion of its own, quoting AC-5.5's *Given* and naming PROP-VER-5 as its carrier; (b) `:316-323`'s paragraph now points at PROP-LAUNCH-4's resolution state (b) and says explicitly that neither AT-5.5's fixture nor AT-1.3's refusal states is the observation site | **Resolved, both legs.** The quoted *Given* — *"a pin naming a version that is not installed"* — is verbatim from `REQ:427`, and the cited span `REQ:427-429` is exactly AC-5.5's three lines. `version.pin-missing` is PROP-VER-5's id at `:194`. No other row now claims AC-5.5 while asserting `store.empty`: the remaining AC-5.5 tracers (`:194`, `:195`, `:198`, `:200`) are all pin/config-branch properties. §5's REQ-EDIST-01 row (`:348`) already spoke of the "engine-store/launcher half" rather than of AC-5.5, so nothing there went stale |
| **F-02** — PROP-LAUNCH-9's two structural negatives (dispatch count `=== 0`, byte-identical tree) had no §3 catalogue row, against §3's own "every negative appears here" claim | Low | §3 gains **PROP-NEG-18** (`:269`) | **Resolved.** The row is written to §3's own form — negative stated with the positive conjunct that falsifies it — and both conjuncts are transcribed from PROP-LAUNCH-9, not paraphrased into something weaker. The non-empty pre-state qualifier survives the move, which is the clause that stops an empty fixture passing the byte-identity check |

## 2. New-issue scan over the changed regions

The diff touches five regions and nothing else: the version cell (0.5 → 0.6), a new changelog
row, PROP-LAUNCH-1's row, §3's new PROP-NEG-18, and §4's no-`AT-`-row paragraph. Each was
scanned against the three standing bars — no implementation echoes, no absence-only oracles,
set-equality not containment — plus grounding of every code and upstream claim it introduces.

**Every new anchor re-verified against HEAD, line by line.**

| New claim | Where | Verified |
|---|---|---|
| AC-5.5's *Given* is *"a pin naming a version that is not installed"*, `REQ:427-429` | `:86` | Exact. `REQ:427` opens `- **AC-5.5** … *Given:* a pin naming a version that is not installed.`, `:428-429` are its *When* and *Then* |
| `handshake.test.js:110-118` pins the range, `not found`, `Remedy:` and `PDLC_PLUGIN_ROOT` | `:269` | Exact and tight. `:110` is `test("a missing plugin refuses and names the range, 'not found', and the remedy"…`, `:113` asserts `pluginVersion === "not found"`, `:114-117` are the four `assert.match` calls named, `:118` closes the test. Four named substrings, four assertions, no slack |
| `handshake.mjs:144` is `checkCompat`'s reason | `:269` | Exact. `:144` is `export function checkCompat(engineCompatRange, pluginVersion) {` |
| PROP-LAUNCH-4's resolution state (b) is the observation site | `:320-322` | Grounded in PLAN, not just in this document. `PLAN:148` T15(b) reads *"empty store reports the launcher's own triple with `mode: "unresolved"` and the refusal text as a notice"* — the §4 prose, PROP-LAUNCH-4's row (`:89`) and the owning task now say the same thing in the same words |
| Carrier cells still name planned artifacts | `:86` | `T15`, `T14`, `T46` all exist in PLAN §2.1 (`:148`, `:147`, `:186`) and the ownership manifest gives T15 `version-doctor.test.js` (`PLAN:284`), T14 `launcher.test.js` (`:283`), T46 both plus `bin/cli.mjs` (`:315`). Test file and level unchanged by this edit anyway |

**No oracle weakened, and no new oracle is absence-only.** PROP-NEG-18 is a catalogue entry, not
a new assertion: both conjuncts are the ones PROP-LAUNCH-9 already carried, and each negative is
paired on the same path with the positive that falsifies it — *"dispatched nothing"* with a
dispatch count asserted `=== 0`, *"left the tree unmodified"* with a byte-identical comparison
against a recorded **non-empty** pre-state. Neither reads a value out of the code under test;
the strings (`not found`, `Remedy:`, `PDLC_PLUGIN_ROOT`) are literal transcriptions of the spec's
own vocabulary that happen to be green at HEAD, which is the right direction of derivation.

**No set-equality claim disturbed.** §4's `AT-` table is untouched by the diff — the five `AT-1.*`
rows at `:280-285` are byte-identical to the version I checked at `06e74162`, and PROP-LAUNCH-1
was never in that table, so removing its AC trace cannot change the 35-row set. §7's counts (89
properties, column sum 95, Unit 74) are untouched because PROP-LAUNCH-1's Category and Level cells
did not move and PROP-NEG-18 lives in §3, which is a catalogue of §2's clauses and not a member of
the property count. I looked for a stated §3 cardinality that adding an eighteenth row would
falsify; there is none — §3's preamble quantifies over "every negative" rather than counting them.

**One real defect found, and it is presentational.** The new changelog row is filed **out of
order**: `:22` carries 0.6 and `:23` carries 0.5, so the table now reads 0.1, 0.2, 0.3, 0.4, 0.6,
0.5. Nothing machine-read depends on changelog ordering, and the Version cell (`:12`) correctly
reads 0.6, so this is a readability defect only — but the erratum protocol has a reader diff
`Version` cells and changelog rows to work out what a document absorbed and when, and a
non-monotonic table is exactly the shape that makes that read go wrong. Filed F-01 (Low).

**One phrasing nit in the new §4 prose.** *"the triple it reports there is AT-1.6's"* (`:322`) is
true of the triple's *shape* — engine version, declared range, plugin version, per `FSPEC:694-697`
— but AT-1.6 is carried by PROP-LAUNCH-5 alone (`:285`), and the sentence sits three lines below
a paragraph whose whole purpose is to stop a DoD reader inferring a second carrier from prose.
Saying "the same three members AT-1.6 pins" would carry the meaning without the inference risk.
Filed F-02 (Low). Not gating; the `AT-` table remains the authority and it is unambiguous.

## 3. Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|-------------|
| F-01 | Low | Local | Changelog rows are non-monotonic: 0.6 (`:22`) is filed above 0.5 (`:23`). The Version cell is correct, so nothing downstream misreads the document's version — but the erratum protocol's re-grounding step has readers diff `Version` cells against changelog rows to establish what was absorbed when, and an out-of-order table is the shape that makes that read go wrong. Move the 0.6 row below 0.5 | Changelog, `:22-23` |
| F-02 | Low | Local | §4's new prose says PROP-LAUNCH-4 state (b) reports a triple that *"is AT-1.6's"* (`:322`). True of the triple's three members (`FSPEC:694-697`), but AT-1.6's carrier is PROP-LAUNCH-5 alone (`:285`), and this sentence sits inside the paragraph whose purpose is to stop a reader inferring carriers from prose. Suggest *"the same three members AT-1.6 pins"* | §4, `:322` |

Both are Low and neither is gating. No High or Medium finding is open against this document:
my round-2 F-01 (Medium) and F-02 (Low) are both resolved, and the v0.6 delta introduces no new
one.

## 4. Questions

| ID | Question |
|----|---------|
| — | None this round. My round-2 Q-01 (the five-state exit-code split) and Q-02 (T32's ownership manifest) still stand as asked; the v0.6 delta touches neither, and both are answerable in Phase I without re-opening this document |

## 5. Positive Observations

- **F-01 was fixed at both sites, not just the one the finding pointed at.** The Medium was
  written against PROP-LAUNCH-1's `Traces` cell, but the same wrong claim had a second home in
  §4's prose. Fixing only the cell would have satisfied the finding literally and left the
  document contradicting itself — the exact failure mode the round-3 erratum had to clean up
  after. Both moved, and the four commits keep them separable.
- **The fix states the positive, not just the retraction.** The row does not merely drop
  `AC-5.5`; it says what AC-5.5 actually is (quoted verbatim from `REQ:427`), which id it owns
  (`version.pin-missing`), which property carries it (PROP-VER-5, with -6/-9/-11 reinforcing),
  and how the empty store relates to it (the precondition state upstream of the pin case). A
  reader who arrives with the old wrong belief is corrected rather than merely deprived.
- **PROP-NEG-18 catalogues without re-authoring.** The easy version of this fix invents a fresh
  negative and quietly drifts from the §2 clause it is supposed to mirror. This one transcribes
  PROP-LAUNCH-9's clauses (c) and (d), keeps the *non-empty* pre-state qualifier that does the
  falsification work, and re-verified its HEAD anchors this round rather than copying them
  forward — `handshake.test.js:110-118` is still exactly the missing-plugin test, boundary to
  boundary.
- **The self-limiting claims in the changelog are all true.** It claims no property added,
  removed or re-scoped in §2; no carrier, task or ownership-manifest change; §4's 35 `AT-` rows
  and their set-equality untouched; §5's accounting and §7's counts unchanged. I checked each
  against the diff rather than against the sentence, and each holds.

## 6. Recommendation

**Approved with minor changes**

Both findings I left open in round 2 are resolved, at both sites in the case of the Medium, and
the revision broke nothing previously approved: no property added, removed or re-scoped, no
carrier or task cell moved, §4's 35-row set-equality against FSPEC §8 intact, §7's counts (89 /
95 / 74) unchanged, and every new anchor — `REQ:427-429`, `handshake.test.js:110-118`,
`handshake.mjs:144`, `PLAN:148` T15(b) — verified line by line at HEAD. Two Low findings remain
(changelog row ordering, one prose phrasing in §4); neither gates and both can be swept into the
next edit this document takes for any reason. No High is open, so the document is ready for
Phase I.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 2}

APPROVAL-HASH: sha256:dacf4b751d3db8057a37d1f5de2199c2f963a0c7f006015d5a2e1866447b5558
APPROVAL-HASH-NORMALIZED: sha256:164da25d84345a15a231298b647c77cb1627119efaae7c8293eea98bbc56e016
REVIEWED-COMMIT: a4b12eb72246abb8f9c63dd082f9201782da8763
