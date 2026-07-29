# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-workflow-distribution/TSPEC-pdlc-workflow-distribution.md` (v2.0, Draft)
**Date:** 2026-07-28
**Iteration:** 2

**Upstream:** REQ v17.0 (approved) → FSPEC v5.1 (dual-approved) → TSPEC v2.0.
**Protocol:** delta re-review. Prior findings: `CROSS-REVIEW-product-manager-TSPEC-v1.md` (3H/3M/3L).
Verified against `git diff da1fd65..HEAD` over the TSPEC (`da1fd65` was the last v1.0 commit; eight
v2 commits since, `835064c`…`0b967dc`). Only changed sections
were re-read for new issues; unchanged sections approved at v1 are not re-litigated. REQ/FSPEC are
approved and out of scope. `docs/_constraints/` and `docs/_decisions/` still do not exist on this
branch, so no standing constraint applies.

## Verification of v1 findings

| v1 ID | Sev | Claimed disposition (§0.4) | Verified? | Evidence |
|---|---|---|---|---|
| F-01 | High | Fixed — `expectHookSilent()`, S-1/S-2, AT-18a strengthened, new floor | **Yes** | §1.4a exists with five conjuncts. Conjunct 5 is the real fix: `readDriftState(root)` non-null, `baselineStatus: "resolved"`, `rows` non-empty and all `in-sync`, `retiredPresent: []`, `writeFailures: []` — a hook that "goes quiet" by doing nothing fails it, which is precisely AC-2.2's claim that silence means *verified*. Conjunct 1 is strict `=== ""`, not `not.toContain("pdlc:")`, so an unprefixed line is caught; conjunct 2 closes the stdout escape. The negative-direction test over `staleRow` (`expect(() => expectHookSilent(run)).toThrow()`) is what makes the oracle itself falsifiable — without it a helper degraded to `return true` keeps the class green. §14.1 S-1/S-2 are real rows, AT-18a now asserts "N-7 and nothing else" (§14 row, PM Q-01 answered yes), §1.4 carries the `≥ 2` floor, §15.1's AC-2.2 row cites S-1/S-2 instead of the warning tests. Silence now has a real, falsifiable test. |
| F-02 | High | Fixed — remediation captures, §7.4 classes, AT-24 assertion 7 | **Yes** | §7.2 now captures remediation text **to end of line** in every remediation-bearing matcher (`remediation` on W-1/W-2/W-6, `cmd` on W-3/W-4/W-5) plus `remediationOf()`/`allOf()`. §7.4 states what the captured text must *be* as five classes with `mustName`/`mustNotName`; `SYNC_CMD` is the test-computed expanded invocation, explicitly not the substring `"sync"` — the right construction, since `"resyncing"` would satisfy a substring. §9.2 assertion 7 is the positive case: `expect(record.syncCommand).toBe(join(root, "pdlc/hooks/scripts/sync-workflows.sh"))`, **string-equal**, on the suite's only fully-resolved record, with the no-`$`/no-`{` conjunct and the W-5-agreement conjunct. The literal-`${CLAUDE_PLUGIN_ROOT}` regression AC-4.2 exists to prevent is now red. |
| F-03 | High | Fixed — five B-rows, own §15.1 row | **Yes** | §14.1 B-1 (`--check` exit 3, W-1 `manifest-absent`, `pluginUpdate` class with `mustNotName: [SYNC_CMD]`), B-2 (sync copies and retires nothing, retired-shaped file still present, record still written with `rows: []`/`retiredPresent: []` per AC-3.1, no backup dir, exit 3), B-3 (escape via hook), B-4 (escape via `--check`, which still exits 3 — AC-4.3's queue-only scoping), B-5 (**config alone does not unblock**: no writer run ⇒ no record ⇒ `{ blocked, row: 1 }`). B-5 is the one I most wanted and it is stated in the strongest form — it also doubles as NFR-1's "the queue never reads the config itself" assertion, cited in §15.1's NFR-1 row. New `preManifestOptOut` fixture (§13.1) explicitly carries "**no pre-existing drift state**", which is what makes B-5 non-vacuous. AC-0.3b has its own §15.1 row. PM Q-02 answered correctly: AT-14b did not cover it. |
| F-04 | Med | Fixed honestly — AC-5.3 marked partial, R-12 opened | **Yes** | §15.1 no longer cites AT-19/AT-24 for AC-5.3/AC-5.4. AC-5.1/5.2/5.4 have real citations (AC-5.4 → AT-14/AT-14b's asserted `pluginVersion: null`, §12.1 D8). AC-5.3's row says "partial", names V-4 for the record fields, and states plainly that the rendered lines have no assertion. That is the honest form I asked for. |
| F-05 | Med | Fixed — `pdlc/RELEASE-CHECKLIST.md` is a real inventory row | **Yes** | §2.1 has the file row; §2.1a enumerates the three commitments (AC-6.2a's installed-package assertion via the shipped `packagingViolations`, AC-6.6's landed-violation fallback, NFR-2's one-off observation) and the constraint that its own wording must avoid the five `coveredViolations` patterns — a genuinely non-obvious catch. §16 carries it as a named landing-step obligation, and the durable rule is routed to harvest. §15.1's AC-6.2a and NFR-2 rows now point at a file that will exist. PM Q-03 answered. |
| F-06 | Med | Fixed — four new message-content floors | **Yes** | §1.4 gains AC-2.5 (all 4 row reasons → class), AC-2.8 (all 6 of R's states, including the two negative conjuncts), AC-2.5a (all 8 baseline reasons, `manifest-*` and `drift-state-invalidated` asserting `mustNotName: [SYNC_CMD]`), and the `syncCommand` expansion floor. §7.4's three tables land them and §14.1 R-1/R-2/R-3 make each a per-row `it()`. The `mustNotName` half is what converts these from a second distinctness test into a pairing assertion — §7.4 says so in as many words. AC-2.8's `unknown ⇒ mustNotName: [SYNC_CMD]` and AC-2.5's two `*-unreadable ⇒ permissions, not sync, not plugin-update` rows are exactly the branches the REQ calls out. |
| F-07 | Low | Taken — V-1 | **Yes** | §14.1 V-1: retire, resurrect byte-identically, retire again, two backups with distinct `(stamp, nn)`; explicitly red against once-per-id retirement. |
| F-08 | Low | Taken — V-2 | **Yes** | §14.1 V-2 on AT-11's `retiredPresent` fixture, `--check` exit **1**; §15.1's AC-3.3 and AC-3.9 rows both cite it. |
| F-09 | Low | Taken; R-11 closed | **Yes** | §14.1 V-3 asserts presence + `/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/` on a record not otherwise normalised; R-11 is rewritten as **closed**, and honestly concedes v1.0's residual understated the gap (the field had *no* oracle, not merely no format oracle). |

All three Highs and all three Mediums are genuinely closed — not narrowed, not reworded. The two
oracles I was most worried about being vacuous (silence, and remediation "distinctness") both now
carry an explicit anti-vacuity conjunct, and both carry a negative-direction assertion.

## Assessment of the two author-flagged items

**R-12 (AC-5.3's rendered version lines).** Product-acceptable as a deferral. AC-5.3 is *(P2)*; the
record fields — the machine-readable half US-03's "which direction the drift runs" actually depends
on downstream — **are** asserted by V-4 on every non-`in-sync` row, key-present-with-`null`-permitted,
absent-not. What is deferred is the *rendered* presentation, and the stated reason is the right one:
FSPEC §8.2's W-2/W-3/W-4/W-5 shapes name no version line and no "not a drift signal" label, so an
assertion would have to invent operator-facing message text. A TSPEC inventing product strings to
make its own traceability table look complete is a worse outcome than a declared P2 residual. The
change condition is named and cheap ("an FSPEC revision adding the version lines … at the cost of two
conjuncts"). My one reservation is bookkeeping, not substance — see L-3.

**§12.1 row 4's validator-strictness decision.** Product-acceptable, and I'd have made the same call.
The choice — a validator that sees a known envelope key wrapping a shape-valid record must **reject**
(D2) rather than unwrap — is the conservative direction: unwrapping is how an LLM relay mangling
becomes invisible, which is the exact hazard NFR-1 and O-19 exist to guard. The operator-visible
consequence is confined to *which clause id* appears in a blocked report; both D2 and D3 leave the
queue blocked, so no product outcome turns on it. Critically, it is declared as "a TSPEC-level
test-design decision, **not** an FSPEC amendment" with FSPEC D2/D3 wording left unchanged, which is
the correct handling of an engineering-altitude choice that touches an approved artifact. No finding.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Low | Local | **AC-0.3b's "on every surface" conjunct is asserted on one surface.** The AC says "The stated remediation is **update the plugin** — not `sync-workflows.sh` — **on every surface**" (REQ §2, AC-0.3b), and it names three: hook, `--check`, sync. §14.1 B-1 carries the `pluginUpdate` class with `mustNotName: [SYNC_CMD]` through `--check`. AT-3 is the hook surface and its "key assertions" column names only "repo root resolves, so the empty record is attributable to `manifest-absent` alone"; B-2 is the sync surface and asserts exits/filesystem/record but no stderr conjunct. §14.1 R-3 does floor `manifest-absent → pluginUpdate`, but it lives in `driftBaseline.test.js`, i.e. once, on one entrypoint. So a wrong-remediation regression confined to the hook's or sync's rendering — the two surfaces every consumer hits at first release before they ever type `--check` — is invisible. One extra conjunct on AT-3 and on B-2 (`expectRemediationClass(remediationOf(stderr, "W-1"), "pluginUpdate")`) closes it at zero fixture cost. | AC-0.3b, AC-2.5a |
| F-02 | Low | Local | **Two stale counts introduced by the v2.0 edits**, the same class TE F-11 flagged at v1. (a) §14's AT-24 row still reads "§9.2's **six** assertions" while §9.2's table now has **seven** — the new row is precisely the `syncCommand` expansion assertion that discharges my F-02, so the traceability table under-advertises the fix. (b) §13.1's `preManifestConsumer` row reads "§14's **four** AC-0.3b rows" and enumerates four behaviors, but §14.1 has **five** (B-1…B-5), and two of the four enumerated ("the config-then-hook escape", "the config-alone negative") are actually built on `preManifestOptOut`, not on this fixture — `preManifestConsumer` is used by B-1 and B-2 only. Cosmetic, but §0.2/§14 counts are how a reviewer verifies this document mechanically. | §9.2, §13.1, §14 |
| F-03 | Low | Process | **R-12 is a deferral with no queued successor.** §17 R-12 states the change condition — "an FSPEC revision adding the version lines to §8.2's shapes" — but nothing schedules it: §16's hand-off table has no row for it, no `docs/_queue/QUEUE.md` entry exists, and unlike PM F-05's checklist rule it is not routed to harvest. R-11 was *closed*; R-12 is *open* and will be read at DoD as an unhandled deferral. A one-line §16 row ("FSPEC §8.2 version-line shapes → follow-up REQ or `consolidate-learnings`") makes the deferral tracked rather than merely stated. The durable rule — *an accepted residual whose change condition is an upstream edit needs a named successor surface* — is why this is `Process`. | AC-5.3, R-12 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | §7.4's `permissions` and `environment` classes are byte-identical (`mustName: []`, same three `mustNotName` entries), so AC-2.5's `plugin-artifact-unreadable ⇒ permissions` and AC-2.5a's `plugin-root-unreadable ⇒ environment` are the same assertion under two names. That is fine for the negative half the REQ actually states, but is the class distinction load-bearing anywhere, or should the two collapse into one `neitherSyncNorUpdate` class so a future reader does not assume a stronger positive check exists? (No finding either way — the `mustNotName` half is what the ACs require.) |

## Positive Observations

- **Every fix is stated with the failure it now catches, not just the assertion added.** §1.4a
  conjunct 5's "the vacuous pass", §7.4's "`SYNC_CMD` … never a substring like `"sync"`, which
  'resyncing' would satisfy", §9.2's "`toContain` on the tail passes against exactly that". This is a
  test spec that can be reviewed for *whether it would go red*, which is the only property that
  matters to a PM.
- **§0.4 is an honest disposition table.** It cites reviewer-qualified ids, marks PM F-04 "Fixed,
  **honestly**" rather than claiming coverage, and where a fix needed a fact the FSPEC does not state
  it says so and opens a residual (R-12) or a stated design decision (§12.1 row 4) instead of
  inventing product text. Two of my six findings were about exactly that failure mode at v1.
- **R-2 and R-11 are rewritten to name the v1.0 claims as factually wrong** rather than quietly
  amended. A residual table that corrects itself out loud is worth more than one that only grows.
- **B-5 is the sharpest new test in the document.** "The config alone does not unblock the queue" is
  simultaneously AC-0.3b's escape-hatch negative and NFR-1's no-second-read guarantee, and it is the
  one an implementation that "helpfully" read the config from the queue would fail.
- **§2.1a's constraint that the release checklist's own wording must dodge the five
  `coveredViolations` patterns** is a hazard nobody asked about and that would have gone red on the
  landing commit. Same instinct as v1's anchored-gitignore catch.

## Recommendation

**Approved with minor changes**

Three Low findings, all polish: F-01 (two extra remediation conjuncts on AT-3 and B-2), F-02 (two
stale counts), F-03 (give R-12 a named successor surface in §16). None blocks; each may be taken in
the landing commit or explicitly declined. No High or Medium finding remains — the six v1 findings
are closed on the merits and the v2.0 additions opened no new product gap.

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 3}
