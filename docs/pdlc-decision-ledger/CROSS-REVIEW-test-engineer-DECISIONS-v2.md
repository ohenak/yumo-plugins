# Cross-Review: test-engineer — DECISIONS

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/DECISIONS-pdlc-decision-ledger.md` (Version 1.1)
**Date:** 2026-08-28
**Iteration:** 2

Delta re-review. Base commit for the diff is `1b0e749e4` (the commit carrying my v1); the document
moved across eight commits `b6f967c38 … dfa9496b2`. I re-verified every v1 High against HEAD and
scanned only the changed hunks for new issues. Unchanged sections — DEC-DECLEDGER-01/-02/-04/-05/-06/
-07/-09/-10/-11/-14's mechanism, the Decision table's untouched rows, the Risks list's first three
bullets — were not re-litigated.

**All five v1 blocking findings are resolved, and the arithmetic behind them re-derives correctly.**
One new High enters with the F-04 remediation itself: the errata renumbering pairs
DEC-DECLEDGER-14 with the wrong erratum id.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **DEC-DECLEDGER-14 is routed to the wrong erratum id — it is `ERR-4`, not `ERR-3`.** The new text states it twice: the Decision table row reads "routed upstream as `ERR-3` (open, FSPEC-owned)" (L272) and the Risks bullet reads "DEC-DECLEDGER-14 is the design-side half of `ERR-3`" (L312). Against the cited authority, TSPEC §9.2 holds `ERR-3` = *FSPEC AT-02's Then clause is written against a citation format this spec retired* (`TSPEC-pdlc-decision-ledger.md:1332`), and `ERR-4` = *FSPEC AT-03's Given … is contradicted by AT-01's frozen-fixture requirement* (`:1341`) — the `_readFile`-double substitution that DEC-DECLEDGER-14 *is*. TSPEC's own D-11 row says so in terms: "Raised at the FSPEC as ERR-4" (`:1286`). DEC-DECLEDGER-14's `Traces to` column already reads `§7.6 / D-11`, so the document cites the right TSPEC decision and the wrong erratum beside it. The open **set** `{ERR-3, ERR-4}` is correct and both are FSPEC-owned, so the count survives; what does not is the routing. A PLAN or FSPEC author following L312 lands on AT-02's heading-citation wording, concludes AT-03's contradiction is unrouted, and either re-raises it or leaves the digest-guard/fixture-mutation collision to surface at implementation — which is precisely the AT-01-vs-AT-03 red the decision exists to pre-empt. Swap both mentions to `ERR-4`. | § Decision, `DEC-DECLEDGER-14` row (L272); § Consequences → Risks accepted (L311–313) |
| F-02 | Medium | Local | **Three of the new byte figures are attributed to a TSPEC section that still carries the 8,000-based arithmetic they replace.** DEC-DECLEDGER-12 now reads "Against REQ C-5's shipped `maxBytes` 12,500 the allowance left for records is 11,300, and the G-1-scoped worst standing case renders 10,859 (TSPEC §3.6, `M-7b`'s 63 records) — **441 bytes of slack**" (L204–208), and DEC-DECLEDGER-03/-13 derive from the same 11,300. I re-executed the chain and it is internally sound: `12,500 − 1,200 = 11,300`; §3.6's table gives 63 lines / **10,859** shipped-form bytes (`TSPEC:422`); `11,300 − 10,859 = 441`; `10,859 + 1,200 = 12,059`, which §3.6 itself states at `:472`; `11,300 − 6,305 = 4,995` and `6,305 / 41 = 153.8` give the "~32 more" and `70 − 41 = 29` the entry-bound figure, so the trigger row's "roughly 73 records, entry cap fires first" checks out. The problem is the citation target, not the sum: §3.6's prose around `TSPEC:435–443` still computes "`8000 − 1200 = 6,800`", still reports "**~495** bytes of headroom", still concludes "**the order is live under shipped defaults**", and D-10 (`:1285`) restates the 6,800-byte allowance verbatim — the direct negation of what this document now derives at L92–99. A reviewer re-verifying DECISIONS against its named source finds the source disagreeing. The numbers this document *quotes* from §3.6 (10,859, 12,059) are the ones §3.6 got right; the derived ones (11,300, 441, 4,995) exist nowhere upstream yet. This is a TSPEC defect, raised as an erratum rather than edited here; DECISIONS' own mitigation — DEC-DECLEDGER-10/-12's trigger row demanding §3.6 be re-measured "in one pass" (L298) — is the right instrument and should name §3.6's surviving 6,800/495/"order is live" prose as the specific outstanding re-measurement, so the obligation is checkable rather than general. | § Options, `DEC-DECLEDGER-12` (L204–208), `DEC-DECLEDGER-13` (L215–222); § Re-evaluation triggers (L298) |

## Resolution of v1 findings

| v1 finding | Status | Evidence executed at HEAD |
|---|---|---|
| F-01 High — DEC-DECLEDGER-15's premise gone, trigger already fired | **Resolved** | The decision now reads "*Rejected: positive-integer validators*, the typing an earlier REQ draft carried" and records the alignment explicitly (L240–249); the trigger row is restated as "**Fired and closed:** REQ v1.8 retyped both C-5 thresholds as non-negative … Revisit only if a future REQ re-narrows either threshold" (L299). Verified upstream: `REQ-pdlc-decision-ledger.md:172-173` types both thresholds "non-negative integer" and spells out that `0` is a valid admits-nothing value, with the v1.8 erratum note at `REQ:22-24` giving E-7 as the reason. The trigger is now observable and points at a condition that has not fired |
| F-02 High — Baseline pin stale at v1.1, "one site" guarantee unproven | **Resolved** | Header pins **v1.2** (L12) and the Context paragraph now names the `M-7` block by sub-id — `M-7a` project-level substance bytes, `M-7b` the 63-record worst standing case, `M-7c` the cap that clears it — as the authority behind C-5's 12,500 (L55–60). `docs/_constraints/pdlc-decision-corpus-baseline.md:7` is v1.2, `:109-111` carry `M-7a` 5,262 / `M-7b` 9,296 over 63 / `M-7c` 12,500 clearing by 3,204. The re-measurement path the document promised is now demonstrated rather than asserted |
| F-03 High — byte rationales and a trigger computed on a retired default | **Resolved** | DEC-DECLEDGER-03 (L90–104), -12 (L204–211) and -13 (L215–225) are re-derived against 12,500, and the trigger row moves from "~44 promoted records" to "**70** promoted records … the entry cap fires first" (L294). I re-derived all of it independently; see F-02 above for the arithmetic. The substituted quantity is now the one the design cares about |
| F-04 High — open-errata enumeration failed set-equality | **Partially resolved** | The set is now stated explicitly and correctly — "Two of the four errata TSPEC §9.2 carries are still open: `ERR-3` and `ERR-4`, both FSPEC-owned", with `ERR-1`/`ERR-2` recorded closed against REQ v1.8 (L311–318). Set-equality re-checked: TSPEC §9.2 holds exactly `ERR-1`…`ERR-4` (`TSPEC:1293,1302,1332,1341`). The **membership** claim is right; the **pairing** of DEC-DECLEDGER-14 to a member is wrong — see F-01 |
| F-05 Medium — DEC-DECLEDGER-09 had no feature-owned falsifier | **Resolved** | A PROPERTIES obligation row is added (L286) requiring a positive assertion over this feature's own source region — the `// === DECISION LEDGER WIRING START/END ===` run plus the new function bodies — that the flag is read destructured and compared `=== true`, with PROP-DIS-06's `toHaveLength(3)` demoted to "a useful second line, never the primary one". The region it names exists upstream: `TSPEC:178` and `TSPEC:1007` define the sentinel run and the four owned slices, and `TSPEC:1007` already requires each slice be asserted non-empty before counting, so the obligation cannot be discharged vacuously |
| F-06 Low — raw line-range anchor off by one | **Resolved** | The range is dropped and both sentinel literals are quoted in full (L33). The two literals sit at `pdlc/workflows/__tests__/advisoryDisabled.test.js:718-719`, matched by `source.indexOf` on the exact strings, so the citation is now drift-proof by content |

## Questions

| ID | Question |
|----|---------|
| Q-01 | DEC-DECLEDGER-03 now concludes the order is **inert at the Baseline commit** (L96) while TSPEC §3.6 concludes it is **live under shipped defaults** (`TSPEC:441-443`). I read the difference as entirely attributable to `maxBytes` 8,000 → 12,500 and therefore as a TSPEC staleness (F-02), not a disagreement — but §3.6's live-order conclusion is what motivates its feature-level-first ordering prose. When §3.6 is re-measured, does the *motivation* for the order change with it, or does DEC-DECLEDGER-03's operator-lowers-a-threshold argument become the sole live justification? The answer belongs in whichever document survives the re-measurement, and I would rather it be recorded than inferred |
| Q-02 | Carried from v1 Q-03, still open: DEC-DECLEDGER-13 pins 41 ids / 6,305 bytes "at the Baseline's commit", and the Baseline's `Verified at` is `8c673a09f`. Is the frozen fixture of TSPEC §7.3 captured at that same commit? If it is captured at another, the transcribed expected values are pinned to one artifact and justified by another, and the pin's provenance conjunct is weaker than it reads |

## Positive Observations

- **The default raise was chased into the one place it could have gone vacuous, and the answer is
  right.** DEC-DECLEDGER-13's revision states that over the whole 141-record fixture "`maxEntries` 70
  alone forces at least 71 omissions" (L224–225), so the `omitted[]` conjunct still does work at
  12,500. I re-checked this independently rather than taking it: the entry bound is corpus-wide and
  the fixture is 141 records, so the conjunct reddens under a reversed drop order at either default.
  The raise widened the project-level margin — which is exactly why building the pin over the
  project-level-only slice stays rejected — and the document now says both halves in one place.
- **DEC-DECLEDGER-03's new inertness argument is falsifiable rather than reassuring.** It does not
  claim the order never fires; it says inertness is "a measurement at one commit, not a property of
  the mechanism" and names the operator action that fires it on the next dispatch (L96–101). That is
  the same distinction DEC-DECLEDGER-13 draws for the promoted set, applied consistently, and it is
  the shape that survives a corpus change instead of expiring green.
- **Which bound binds first is now stated per-corpus instead of globally.** L101–104 separates the
  G-1-scoped 63 records (entry cap has slack, a lowered `maxBytes` fires first) from §7.3's 141-record
  fixture (`maxEntries` fires first). The v1 draft's single global "`maxBytes` binds first in every
  case" was the claim the raise falsified; replacing it with a two-case statement removes the standing
  hazard rather than re-tuning it.
- **DEC-DECLEDGER-08's refusal is now honest about its own authority.** The rewrite concedes that
  `prepack.mjs` is a pack-time build script and that NG-6's literal text forbids runtime changes only,
  then rests the refusal on the frozen list itself (L149–158). I verified the list: `MODULE_NAMES` at
  `pdlc/engine/scripts/prepack.mjs:20-25` is exactly four entries. An argument that names the weakness
  in its own premise is one a future reader can re-open deliberately instead of by accident.
- **The v1.8 propagation is recorded as a worked example, not just absorbed.** The trigger row at L298
  keeps the cost of a single-literal move visible ("one literal in C-5's row and the same literal in
  the parser default … what it did move is every headroom figure"), which is the durable half of this
  round's lesson and the part a successor feature will need.

## Recommendation

**Needs revision**

One High finding, and it is a two-token fix: DEC-DECLEDGER-14's erratum id is `ERR-4`, not `ERR-3`,
at both L272 and L312 (F-01). Everything else this round changed re-derives correctly against HEAD —
the Baseline v1.2 re-pin, the 12,500 arithmetic in DEC-DECLEDGER-03/-12/-13, the re-derived trigger
rows, the DEC-DECLEDGER-09 PROPERTIES obligation and the sentinel citation are all verified and
accepted. F-02 is Medium and non-gating: the derived 11,300/441/4,995 figures have no upstream home
yet because TSPEC §3.6 still carries the 8,000-based arithmetic, which is routed as a TSPEC erratum
rather than fixed here; naming that outstanding re-measurement in DEC-DECLEDGER-10/-12's trigger row
would make the obligation checkable.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Section anchor | Description |
|----|----------|-----------|----------|----------------|-------------|
| F-01 | High | delta | local | § Decision DEC-DECLEDGER-14 row (L272); § Risks accepted (L311–313) | DEC-DECLEDGER-14 is the design-side half of `ERR-4` (AT-03 / fixture mutation, `TSPEC:1341`, D-11 at `:1286`), not `ERR-3` (AT-02 citation format, `TSPEC:1332`); both new mentions carry the wrong id |
| F-02 | Medium | delta | local | § Options DEC-DECLEDGER-12/-13; § Re-evaluation triggers | The derived 11,300-byte allowance, 441 bytes of slack and 4,995 bytes of headroom are attributed to TSPEC §3.6, which still computes `8000 − 1200 = 6,800`, still reports ~495 bytes of headroom and still concludes the order is live under shipped defaults (`TSPEC:435-443`, D-10 at `:1285`) |

FINDING: High | delta | local | § Decision DEC-DECLEDGER-14 row (L272) and § Risks accepted (L311-313) | DEC-DECLEDGER-14 is routed to ERR-3, but TSPEC §9.2 makes it the design-side half of ERR-4 (AT-03 fixture mutation, TSPEC:1341; TSPEC's own D-11 at :1286 says "Raised at the FSPEC as ERR-4"); ERR-3 is AT-02's retired citation format (TSPEC:1332)
FINDING: Medium | delta | local | § Options DEC-DECLEDGER-12/-13 and § Re-evaluation triggers | The new 11,300 / 441 / 4,995 byte figures cite TSPEC §3.6, which still carries the 8,000-based arithmetic they replace (6,800 allowance, ~495 headroom, "the order is live under shipped defaults") — routed as a TSPEC erratum, and the trigger row should name it as the outstanding re-measurement

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 1, "low": 0}
