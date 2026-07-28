# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-workflow-distribution/FSPEC-pdlc-workflow-distribution.md` (v2.0, Draft)
**Date:** 2026-07-28
**Iteration:** 2
**Prior review:** `CROSS-REVIEW-software-engineer-FSPEC-v1.md` (6H/4M/3L)
**Diff reviewed:** `6f4b39b^..6f4b39b` (+764/−115)
**Scope of review:** technical feasibility and implementability only. REQ v17.0 is approved at
product scope; scope, need, priority and phasing are not re-litigated. REQ §10 rows whose "Lands in"
is TSPEC/PROPERTIES are treated as discharged by FSPEC §10 and are not raised as findings.

## Disposition of my v1 findings

| v1 ID | Claim | Verdict | Evidence |
|---|---|---|---|
| F-01 (H) | Sync run's recorded row states unspecified / self-contradictory | **Genuinely fixed** | §4.2 is now a ten-step ordering naming copy/backup/retire; §3's pass table pins hook/`--check` = 1 pass, sync = 2; the `generatedBy` → source-pass table makes the record's provenance explicit; §4.2's "second invocation, not a derivation" paragraph closes the shortcut. §5.7, §5.8, §4.3 and §6.2 now read consistently. Residual tension recorded as OQ-6 (assessed below). Two *new* Mediums fall out of the fix (F-15, F-18) |
| F-02 (H) | Plain sync destroyed `stale` content with no backup | **Genuinely fixed** | §5.5 now `stale → verified backup (§4.7), then copy`; §5.6 and §3.2 agree; AT-26 pins it with the restore oracle, and the backup-failure branch (row not copied, exit 4) is stated |
| F-03 (H) | `P5` probed last, contradicting the declared row-reason precedence | **Genuinely fixed** | §3.3's ladder now evaluates `P5 unavailable` first, in the declared order; the two consequences (all-or-nothing across a run; no mixed fixture) are stated and match §3.1's once-per-run probe. §3.6's "structural, not asserted" claim is now true. Ladder totality re-verified by hand |
| F-04 (H) | §6.2 mapping not total, no shape validation | **Fixed, with a new coupling** | D1–D8 plus terminal row 10 make the mapping total; `resolved` + `rows: []` now lands on row 10. But D8 escalates the FSPEC-invented `syncCommand` into a hard gate above the opt-out — see F-16 |
| F-05 (H) | §4.6/AT-18 deviated from AC-2.9(5) | **Genuinely fixed** | §4.6 now pins hook `0` / `--check` `4` / sync `4`; AT-18 asserts `--check` exit 4; §9 O-2's disposition is rewritten. Verified verbatim against REQ AC-2.9(5) ("4 on `--check`/sync, **0 on the hook**") |
| F-06 (H) | BL-04 discharged against the module, not the runtime | **Fixed in substance; one factual claim is wrong** | §6.1 is rewritten against `rtReadFile`, names the `haiku` pin, tabulates what D1–D8 catches, states the shape-preserving-value residual, and routes hardening as §10 O-19 (Cross-Feature). Verified: `runtime-adapter.js:42` `RT_IO_MODEL = "haiku"`, `:85–96` `rtReadFile`, `build-runtime.mjs:132` `_readFile: rtReadFile`. The `null`-on-transport-failure claim is false — see F-14 (my v1 finding asserted it too; I was wrong then) |
| F-07 (M) | Backup ordering invariant false for the same-second case | **Genuinely fixed** | §1.4 makes `-NN` mandatory and zero-padded; the fixed-width argument is correct and the 24-byte suffix arithmetic checks out (`.`1 + stamp 16 + `-`1 + NN 2 + `.bak`4 = 24; stamp `YYYYMMDDTHHMMSSZ` = 16). Injectivity argument is sound. §10 O-18 binds the round-trip property |
| F-08 (M) | Rung-1 clause named the wrong reason | **Genuinely fixed** | §3.3 line 3 now `plugin-artifact-unreadable`, agreeing with the footnote |
| F-09 (M) | `checkEnabled: false` unreachable under `json-tool-absent` | **Fixed by stating the residual** — a disposition I offered | §2.7 states it plainly, rejects both escapes with reasons, names the remediation, and §4.4's contrary rationale is corrected. AT-14 rebuilt on a constructible fixture and AT-14b added for the falsifiable `false` case. Traced through §6.2: forced `true` ⇒ row 2 cannot fire ⇒ row 4 blocks. Consistent |
| F-10 (M) | Blast radius not a spec invariant | **Partially fixed** | M10 is added and correctly excludes `pluginPath`. It does not reserve the `.pdlc-` namespace — see F-17 |
| F-11 (L) | §4.4 vacuous with no pre-existing file | **Fixed** — §4.4a's third bullet |
| F-12 (L) | §1.3 understated the `syncCommand` addition | **Fixed** — the inline note in §1.3 |
| F-13 (L) | gitignore scope | **Fixed** — §7.5 item 1 names all three state paths and argues each |

**Questions:** Q-01 answered honestly in §11.1 (documentation-only, converted to a named
implementation-time observation). Q-02 answered in §3.1/§13.1 (once-per-run probe) — and the answer
is load-bearing for the F-03 fix, correctly. Q-03 answered in §5.8, but the answer is now falsifiable
— see F-18. Q-04 answered in §4.2 ("E7 completes HERE", step 1).

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-14 | High | Local | **Removing E1's short-circuit broke the "no write target" guard, and §2.1 asserts the opposite of what §4.2 says.** §2.1's third bullet claims "§4.2 still guarantees that **nothing is created on disk** when `repoRootUnresolved` **holds**". §4.2 guards step 3 on something else: "never when the **selected reason** is `repo-root-unresolved`". In v1 those were the same predicate because the ladder stopped at E1. In v2 they are not, and §2.8's own worked table declares the divergence in its first two rows: `repoRootUnresolved + manifestEmpty ⇒ manifest-empty` and `repoRootUnresolved + jsonToolAbsent ⇒ json-tool-absent`. On either of those runs `repoRootUnresolved` holds, the selected reason is *not* `repo-root-unresolved`, so §4.2's guard does not fire — and steps 3, 9 and the whole of §5.1's exception 1 ("No write target — `repo-root-unresolved`. Nothing is created anywhere.") are then applied to a `<repoRoot>` that does not exist. Every path in the feature (`<repoRoot>/.claude/workflows/…`) is undefined in that state, so an implementer must invent something: `mkdir -p` relative to `$PWD` (writing under an arbitrary directory, exactly what §2.2 clause 2 exists to forbid), or skip the write on their own initiative. The evidence that this is known-but-unhandled is AT-2, whose Given was tightened in v2 to "a JSON tool is present and the installed plugin ships a **valid, non-empty** manifest, so no higher-precedence baseline condition holds" — the untightened case is precisely the unspecified one, and it is the *ordinary* case for `manifest-absent`/`json-tool-absent` consumers. **Fix:** guard the write on the *condition* (`repoRootUnresolved` holds ⇒ no `mkdir`, no drift-state write, no `checkEnabled` escape, exit 3), independently of which reason §2.1 Phase 2 selected, and reword §5.1's exception 1 and §4.2 step 3 in those terms. This needs one sentence but it decides whether the feature writes to an unresolved root. | §2.1 (E1 bullet), §4.2 step 3, §5.1, §2.8 table rows 1–2, AT-2 |
| F-15 | Medium | Local | **§5.7's step-5 re-classification is a third classification event, contradicting §3's pass table and §13.1's budget.** §3 states categorically that a sync run makes **2** passes, and §4.2 names them (step 2 as-found, step 7 post-run). §5.7 then requires a *further* evaluation between them: "R's post-copy state is obtained by re-running `classify_row` for R against the tree as it stands at **step 5**" — necessarily distinct from step 7, because step 5's deletions must be visible to step 7's re-probe. So a sync run over a manifest whose rows all carry `retires` performs three `classify_row` evaluations per such row, not two. Three consequences: (a) §3's table is wrong as stated; (b) §13.1's "worst case `2 × 2 × |rows|` hash invocations" is really `2 × 3 × |rows|` — a structural NFR-2 discharge that miscounts is not a discharge; (c) §4.2's "O-1's single classification invocation is unaffected … step 7 is a distinct, separately-labelled phase" names two phases to the trace grammar (§10 O-1/O-7) when there are three, so the ordering assertion can still be satisfied by the wrong pass. State the step-5 evaluation as a named pass (or specify that retirement consumes step 7's results and reorder steps 5 and 7 accordingly) and correct §3, §13.1 and O-1's contribution column together. | §5.7 (second bullet), §3 pass table, §4.2 steps 5/7, §13.1 item 2, §10 O-1 |
| F-16 | Medium | Local | **D8 makes the FSPEC-invented `syncCommand` a mandatory gate on the approved AC-4.1 mapping, above the operator's opt-out — and §6.2's row-2 claim is now false.** D8 requires `syncCommand` to be *present* (`null`-or-string). A drift state that satisfies AC-2.6's schema exactly — the schema §1.3 calls "fixed by REQ AC-2.6" — but omits `syncCommand` therefore fails row 1 and is `blocked`, permanently and with no escape, because row 1 sits above row 2. §1.3 and OQ-5 both concede `syncCommand` is an FSPEC-level addition and explicitly invite a reviewer to route it as a REQ amendment; D8 quietly converts that open question into a hard runtime gate, so if OQ-5 is ever resolved against the FSPEC the queue blocks every consumer. Make D8's clause `absent-or-null-or-string` (the field is only *read* by §6.3, which already specifies a `null` fallback), or record the coupling the way OQ-5/OQ-6 are recorded. Related and in the same paragraph: §6.2's bullet "**Row 2 sits above every blocking row deliberately** — the operator's opt-out stays reachable even on a consumer whose state is otherwise unreadable" is contradicted three lines above it ("A record whose `checkEnabled` is absent or non-boolean is `blocked` at row 1") and by §4.4's own reasoning ("an *absent* drift state blocks the queue at AC-4.1 row 1, which sits **above** the `checkEnabled` row"). Row 2 sits above rows 3–10 only, and v2's widening of row 1 from four conditions to D1–D8 widened the set of states in which the opt-out is unreachable. Say that. | §6.2 D8, §6.2 row-2 bullet, §1.3, OQ-5, §4.4 |
| F-17 | Medium | Local | **M10 bounds the blast radius to a directory but does not reserve that directory's own state namespace.** M10 requires `consumerPath` and every `retires` member to name a file directly under `.claude/workflows/`. Nothing forbids `consumerPath: ".claude/workflows/.pdlc-drift-state.json"`, `".pdlc-sync-manifest.json"`, or a path inside `.pdlc-backups/` — M6's charset clause governs the *union namespace* (row `id`s and `basename(retires)`), not `consumerPath` basenames, so such a row passes M1–M10. Sync would then treat one of this feature's own state files as a managed artifact: overwrite it every run, and §3.5's `not-managed` enumeration would never see it (it drops every basename starting `.pdlc-` by design). That is the same class of failure M10 was added to close — a build bug or hand-edited plugin cache is the stated threat model — and it lands on the files the queue's entire verdict depends on. Add to M10: no `consumerPath` and no `retires` member may have a basename beginning `.pdlc-`. | §1.1 M10, §1.1 M6, §3.5 |
| F-18 | Medium | Local | **§5.8's "exit 1 is reachable only under `--check`" is falsified by the truncated-copy case §4.2 itself invokes, and §4.2's description of that case disagrees with §1.2.** §4.2 justifies step 7 being a real measurement with: "a copy that reported success but truncated would be recorded `in-sync` by derivation and **`local-edit`/`unverified`** by measurement". Trace it against §1.2 and §3.3: step 6 writes the sync-manifest entry with `consumerHash` = "the sha1 of the bytes **written into** `consumerPath`" (§1.2 is explicit that this is deliberate, "what makes `local-edit` detection correct if a copy is ever truncated"), so at step 7 the row has an entry (not `unverified`), consumer ≠ plugin (not `in-sync`), and `sha1(consumer) == syncManifest[id].consumerHash` ⇒ **`stale`** — not `local-edit`, not `unverified`. A sync run then ends with a `stale` row in its own record and exits **1**, which §5.8 declares unreachable and instructs downstream not to test ("No acceptance test should attempt to construct a sync run that exits 1"), and which §9 O-14 repeats as a disposition. Either §5.5 must make a post-copy content verification a `writeFailures` case (so the outcome is 4, not 1), or §5.8's claim must be weakened to "reachable under `--check`, and on a sync run only when a copy silently corrupted" with the test instruction rewritten. As written, two normative statements and a downstream instruction rest on an invariant the document elsewhere argues can be violated. | §5.8, §4.2 ("Step 7 is a second invocation…"), §1.2, §3.3 rung 5, §9 O-14 |
| F-19 | Low | Local | **§4.4's `writeFailures` filter says "Three" and lists four.** "Three of §4.5's nine `operation` values — `mkdir`, `drift-state-replace`, `drift-state-invalidate`, `drift-state-unlink`". §4.5's arithmetic is right (4 stderr-only + 5 recordable = 9), so the word is the error. It matters because this is the normative filter an implementer transcribes into the emitter, and "three … one of those" invites dropping a member. | §4.4 (`writeFailures` filtering) |
| F-20 | Low | Local | **§2.1 Phase 2's justification states a universal that is false, then supplies the real argument.** "An `indeterminate` condition is never selected — its prerequisite failed, and **that prerequisite's own condition is higher in the precedence in every case**." For E3 → E4 it is not: `plugin-root-unreadable` and `plugin-root-unset` are the two *lowest* entries in §2.8, below `manifest-absent`. The sentence immediately following gives the correct argument for that pair (when E3's conditions hold, `manifestAbsent` is indeterminate, so the selector never faces the choice). Drop the false universal and keep the two-case argument — this paragraph is what O-9's fixture generation will be read against. | §2.1 Phase 2 |
| F-21 | Low | Local | **Off-by-one in the `NN` exhaustion prose.** §1.4 says "`NN` exhaustion (**100** backups of one id inside one second)"; the grammar is `01..99`, and §5.6 correctly says "suffix exhaustion at `-99`". 99, not 100. | §1.4, §5.6 |

## Assessment of OQ-6 (requested)

**The reading is sound, and it is genuinely non-blocking.** Verified against the REQ text rather
than the FSPEC's paraphrase:

- AC-2.6 does contain both sentences, verbatim as quoted (REQ lines 438–441): "`supersedingState` is
  measured at write time (hook: at session start; check: current; **sync: post-copy**)" and
  "Recorded states are those observed **before this run created anything** (AC-2.9(1))".
- The tension is real and confined to sync. The post-run reading is forced by three separate
  approved ACs, each of which I checked in the REQ: AC-2.6's own `supersedingState` clause;
  AC-2.7's stated consequence ("Consequently a post-sync drift state is current within the same
  session and the queue unblocks without a restart"); and AC-3.3/§4's end-of-run observation point.
  The pre-copy reading makes a fully successful sync write `stale` rows, block the queue at §6.2
  row 6, and exit 1 — contradicting all three.
- It changes no observable the REQ pins for the hook or `--check`, where the two readings coincide
  because those runs create nothing a re-measurement could see. So nothing downstream branches on
  the REQ's wording.
- Recording it rather than reinterpreting it unilaterally is the right handling, and is the pattern
  I asked for in v1 F-05. The FSPEC applies that pattern consistently now (OQ-5, OQ-6) and
  *conformed* rather than reinterpreted where the AC was unambiguous (AC-2.9(5)).

One caveat, raised as Q-01 rather than a finding.

## Questions

| ID | Question |
|----|---------|
| Q-01 | OQ-6's owner is "PM, at the next REQ revision **if one occurs**". The REQ is approved under a binding stopping rule, so in practice no revision will occur and §4.2's reading becomes the de facto contract with no REQ text behind it. The PROPERTIES author will cite AC-2.6 sentence (2) — that is exactly how v1's F-05 conflict arose. Should OQ-6 be restated as a §10 entry obligation on PROPERTIES ("the sync-run record asserts post-run states; AC-2.6 sentence (2) governs the acted-on pass only") so the resolution travels with the document that will be tested, rather than living only in §11? |
| Q-02 | §5.5 specifies per-row atomicity (sibling temp + `mv`) and "each copy is reported with both hashes", but no clause makes a post-copy hash **mismatch** a `writeFailures` case. Is the copied bytes' hash compared to `pluginSha1` before the sync-manifest entry is written at step 6? If yes, F-18 collapses to a wording fix; if no, a silently corrupted copy is recorded as provenance-verified in the sync manifest. §4.7 mandates re-read-and-verify for *backups* but §5.5 mandates nothing equivalent for *copies*, which is the asymmetric half. |
| Q-03 | §6.2 D7 requires `retiredPresent` members to carry `path`, `supersededBy`, `supersedingState` but does not constrain `supersedingState` to the six closed states, while it does close `rows[].state`. Deliberate (because §6.2 never branches on it) or an omission? If §6.3 prints it in the blocked report, an LLM-relayed re-wording reaches the operator unchecked. |

## Positive Observations

- **The four "self-inflicted-by-v1's-own-elaboration" Highs are genuinely fixed, not renamed.**
  F-02, F-03, F-05 and F-08 are each corrected at the site of the error, with the v1 text quoted and
  the reason it was wrong preserved in place — §3.3's footnote, §5.5's "v1's procedure grouped
  `stale` with `missing`", §1.4's optional-suffix derivation, §4.6's inset "v1 deviated here and this
  version conforms". That is the right way to prevent the next author from re-deriving the mistake.
- **§1.4's grammar rewrite is correct arithmetic, not just correct prose.** I re-derived the 24-byte
  suffix, the fixed-width sort claim, the `-`(0x2D)/`.`(0x2E) collision that motivated it, and the
  injectivity argument. All four hold, and O-18 asks for the right two properties (round-trip over
  the full M6 charset including stamp-shaped ids; sort agreement with `(stamp, NN)`).
- **§4.2's refusal to derive the post-run state from copy success** is the single best decision in
  this revision. Deriving would have made the record structurally incapable of catching the failure
  the feature exists to catch, and the paragraph says exactly that. (F-18 is a consequence of taking
  that seriously — the derivation-free path admits an outcome §5.8 denies.)
- **§6.1's honesty about NFR-1.** "NFR-1's guarantee — *no judgement in an LLM turn* — holds for the
  **decision** … but it does **not** hold for the **transport** at this seam. Saying otherwise would
  be false, and this feature exists to stop exactly that kind of unverified green." That is the
  correct disposition of a Cross-Feature residual, and O-19's three concrete implementation duties
  (no second mediated read; validator tested against mangled-relay fixtures; comment the seam at the
  call site) are checkable rather than aspirational.
- **Every existing-code claim I checked in this revision verifies**, with one exception (F-14's
  transport-failure claim, which I introduced in v1): `RT_IO_MODEL = "haiku"` at
  `runtime-adapter.js:42`; `rtReadFile` at `:85–96`; `_readFile: rtReadFile` at
  `build-runtime.mjs:132`; `readFileFn(queuePath)` at `orchestrate-queue.js:523`. AC-2.9(5),
  AC-2.6, AC-2.7 and AC-4.1 were re-read in the REQ and the FSPEC's quotations of them are exact.
- **§4.4a is a real closure, not a restatement.** Defining the `printf` emitter by a *property* of
  the record (every field closed-domain) rather than by the rung that happens to use it is what makes
  T1 fall out as a theorem instead of a special case, and it is why the first-adoption/no-interpreter
  consumer now gets a parseable record instead of nothing.
- **AT-27, AT-28, AT-29 and AT-30 are falsifying counterparts, not coverage padding** — each names
  the implementation it is red against. AT-30's substring-exclusion predicate in §8.2 is the right
  shape for a distinctness requirement that was previously prose only.

## Recommendation

**Needs revision**

Must change before this FSPEC is implementable:

1. **F-14** — decide, in one sentence, that the write guard is keyed on `repoRootUnresolved`
   *holding*, not on it being *selected*. Everything else in §2.1's restructure is sound; this is
   the one place where removing the short-circuit left a consumer of the old equivalence behind.
2. **F-15** — reconcile §5.7's step-5 evaluation with §3's pass count, §13.1's spawn bound, and the
   trace-phase labelling O-1 depends on.
3. **F-16** — relax D8's `syncCommand` clause (or record the coupling), and correct §6.2's
   "row 2 sits above every blocking row" bullet, which row 1 falsifies.
4. **F-17** — reserve the `.pdlc-` basename prefix in M10, so the blast-radius bound covers the
   feature's own state files.
5. **F-18** — settle whether a silently corrupted copy is a `writeFailures` case (Q-02); then either
   §5.5 gains the verification or §5.8's exit-1 claim and its downstream test instruction are
   weakened. They cannot both stand.
6. **F-19 – F-21** — three one-word/one-line corrections, each in a clause an implementer or
   fixture author transcribes literally.

VERDICT: Needs revision
{"high": 1, "medium": 4, "low": 3}
