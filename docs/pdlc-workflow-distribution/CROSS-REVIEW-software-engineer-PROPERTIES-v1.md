# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-workflow-distribution/PROPERTIES-pdlc-workflow-distribution.md` (v1.0, Draft)
**Date:** 2026-07-28
**Iteration:** 1

**Upstream at review time:** REQ v17.0, FSPEC v5.1, TSPEC v2.1 — all approved. Findings below are
PROPERTIES-altitude only; nothing here reopens an approved upstream decision.

**Verification performed:** §0.2's five entry-obligation rows checked one by one against the bodies
they cite; §2.3's eleven leaves recounted against FSPEC §3.3's ladder; §5.1's evidence vectors
recounted against FSPEC §2.1 Phase 1 and §2.8's worked table; all HEAD claims (`package.json` jest
config, `testPathIgnorePatterns`, `document-oracles.mjs`, `M6_ID_REGEX`, the three bash source
paths, `itOrSkip`/`describeOrSkip` signatures, `assertPostCopyNarrow`) diffed against the repo and
TSPEC in a single pass.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | **High** | Local | **PROP-CLS-02's precedence table is vacuous for three of its five adjacent pairs.** §2.1(2) claims single-valuedness is asserted "by constructing, for each precedence pair, a leaf where **both** conditions hold". Three rows do not do that. `missing > in-sync` is the fixture "consumer path absent, plugin present" — that is leaf **L6** verbatim; the `in-sync` guard (`sha1(consumer) == sha1(plugin)`) does not hold, it only holds under the *defect* being hunted. `unverified > stale` is "bytes differ, no entry" — leaf **L8** verbatim; the `stale` guard needs an entry, so it cannot hold. `stale > local-edit` is "bytes differ, entry with `consumerHash == sha1(consumer)`" — leaf **L9** verbatim; the two guards are complements by construction (`==` vs `!=` against the same entry) and **can never co-hold**. So three of six rows re-run leaves PROP-CLS-01 already covers and assert nothing about ladder order, while the document's own argument says only a co-holding fixture catches an order drift. Fix: split the table into (a) genuinely co-holding rows (`unknown > missing`, `unknown > every lower`, `in-sync > unverified`) and (b) explicitly **mutation-directed** rows that target a named wrong implementation, and drop the claim that every pair has a co-holding leaf — or state the falsifying implementation per row so the row has an oracle. `stale > local-edit` needs a different treatment entirely, since no fixture can co-hold it. | §2.1(2), §3 PROP-CLS-02 |
| F-02 | **High** | Local | **§5.1's determinacy rules narrow FSPEC §2.1's, and the narrowing makes PROP-BSL-03's computed oracle wrong on the ordinary first-release vector.** FSPEC §2.1 Phase 1 says E5 `manifestMalformed` is "indeterminate when E2 **or E4 failed**" and its first dependency bullet says explicitly that `manifestAbsent` is determinate JSON-free while "`manifestMalformed` and `manifestEmpty` are **not**". §5.1's table renders E5 as indeterminate only when "`E2 = holds` or `E4` **indeterminate**" — dropping the `E4 = holds` (manifest absent) case entirely, and rendering E6 as indeterminate only when E5 is indeterminate, dropping the `E5 = holds` (malformed) case. Consequence: on the manifest-absent vector the generator must assign E5/E6 determinate values, and PROP-BSL-03's oracle `precedence.find(c => vector[c] === "holds")` will select **`manifest-empty`** (an absent manifest has zero rows) over `manifest-absent`, contradicting FSPEC §2.8's normative row `repoRootUnresolved + manifestAbsent ⇒ manifest-absent` — which §2.8 flags as "the ordinary first-release consumer". The correct closure is E5 indeterminate when `E2 = holds ∨ E4 = holds ∨ E4 indeterminate`; E6 indeterminate when `E5 = holds ∨ E5 indeterminate`. | §5.1 table rows E5/E6; FSPEC §2.1, §2.8 |
| F-03 | **High** | Local | **The "14 reachable determinate vectors" count does not survive the corrected rules and is not closed over the axes two properties quantify against.** Under §5.1's own (incorrect) rules I count 14 only if E1 and E7 are held *fixed*; under FSPEC's rules the count is **10**. Either way the enumeration cannot be the domain of PROP-BSL-06 ("for every vector in which **E1 = holds**" — requires E1 in the vector, ×2) or PROP-BSL-08 ("for every generated vector … the six `checkEnabled` config states" — requires E7 in the vector, ×6). `enumerateEvidenceVectors()` therefore has no single stated cardinality, and §1.4's "≤ 14 spawns / one per determinate vector" budget row is derived from a number that does not describe the set the properties range over. State the axes the enumeration closes over, recount, and re-derive the budget. | §5.1, §5.2 PROP-BSL-06/-08, §1.4 |
| F-04 | **High** | Local | **PROP-MTM-04's agreement conjunct is red against a *conforming* implementation on the AT-35 fault composition.** The justification offered is "deleting a retired path cannot change R's own `consumerPath` bytes, so R's state is identical across steps 5 and 7". That argument only covers bytes; it ignores that the **sync manifest is a classifier input** for ladder rungs 4–6, and step 6 rewrites it between the post-copy pass (step 5) and the post-run pass (step 7). Concretely, on `PDLC_FAULT=artifact-copy-corrupt` (TSPEC §5.2 token 10) for a `stale` R: at post-copy the truncated bytes differ from the plugin **and** differ from the still-present old entry's `consumerHash` ⇒ R is `local-edit`; §5.5 then removes the entry and step 6 rewrites, so at post-run R is `unverified` — which is exactly the value PROP-MTM-06 itself says AT-35 must record. The two passes therefore legitimately disagree, and §7's generated set explicitly includes write-failing trees (PROP-MTM-06). Either scope PROP-MTM-04's second conjunct to fault-free sync runs with the exclusion stated, or replace the bytes-only argument with one that accounts for the step-6 rewrite. As written the property would be deleted the first time it goes red, which is the opposite of the "stays honest" intent. | §7 PROP-MTM-04; TSPEC §5.2 token 10, §4.3 |
| F-05 | **High** | Local | **The ≈55-spawn ceiling is materially understated, and §1.4's own rule ("any property that would exceed its row's number must be re-expressed") therefore never fires.** Row-by-row: **§8 "≤ 20"** budgets only PROP-SEAM-01 (16 members + 4 non-members) and silently omits PROP-SEAM-03 ("for every token, with a selector appended" = 16 more runs over 2–4-row manifests), PROP-SEAM-04 (generated mixed lists) and PROP-SEAM-05 (a two-run byte-equivalence per generated tree) — realistically ≥ 40. **§9 "8 — four invariance pairs"** does not match §9's **six** PROP-DET rows, plus PROP-DET-02's discriminating one-sided variant (a third pair) and PROP-CLS-05's own two-run comparison — ≥ 14. **§3 "one packed run (9 leaves)"** is arithmetically wrong: 11 leaves − L0 − the two permission leaves = **8** packable rows (§1.4's prose "the nine hash-present leaves" is also wrong; there are ten hash-present leaves). **§6 "4"** omits PROP-BKP-04 (`nnExhausted`, an Integration entrypoint run, not a grammar-driver case) and treats §6.5's five prune properties — including PROP-BKP-12's `prune(prune(D))` and PROP-BKP-13's re-shuffled-mtime second directory — as one spawn; it also mislabels PROP-BKP-07 as "§6.5's locale conjunct" when it lives in §6.4. **§7 "6"** is a per-mode count, not a per-generated-tree count, while every PROP-MTM row quantifies "for every generated tree". Since TSPEC R-3 (no CI ⇒ a slow suite stops being run) is the whole risk P-R-7 names, the budget has to be recomputed from the properties as written. | §1.4, P-R-7 |
| F-06 | **Medium** | Local | **§0.2 and §1.6 carry a stale leaf numbering that contradicts §2.3 and §11.1, inside normative skip-message text.** §0.2's O-11 row says "the two existence-`indeterminate` leaves (§2.3 **L3, L7**)"; §1.6 repeats "leaf **L7** (P3 `indeterminate`)" and says L3's reason "remains covered by leaf **L4** via `PDLC_FAULT=plugin-artifact-read`" and L7's "by leaf **L8** via `PDLC_FAULT=consumer-artifact-read`". Per §2.3, L7 is `A5 = equal ⇒ in-sync`, L8 is `unverified`, and the two token-15/16 leaves are **L2** and **L5**. §11.1 gets all of this right (L3/L4 skipped, covered by L2/L5). Two skip inventories over the same properties (§1.6 and §11.1) is itself a duplication hazard — they already disagree on the `git`-gated set too (§1.6: PROP-BSL-05; §11.1: PROP-BSL-03/04/06). Collapse to one inventory (§11.1) and have §1.6 reference it. | §0.2 O-11 row, §1.6, §2.3, §11.1 |
| F-07 | **Medium** | Local | **`PDLC_FAULT_TOKENS` has no specified form, home or extraction mechanism, and both §8 oracles depend on it as a JS value.** TSPEC names it in exactly one place — §16's "new" row ("exported from C1 as `PDLC_FAULT_TOKENS`") — and §5.2's enumeration itself is a markdown table, not a code artifact. It is a **bash** identifier in a sourced library; PROP-SEAM-01 iterates it and PROP-SEAM-02 compares a static scan against it, both from JS. Unless the document pins how the JS side obtains it (parse the bash assignment? a generated JSON alongside? re-export from `document-oracles.mjs`?), the likely implementation reads the same literal twice from the same file and the claimed "**two independent oracles**" degenerates to one. Pin the single source and the extraction. | §8.1 PROP-SEAM-01/-02; TSPEC §5.2, §16 |
| F-08 | **Medium** | Local | **The `hash` capability skip is file-level in the TSPEC, which contradicts §2.2's "`hash-tool-absent` is the one row reason that never skips".** TSPEC §7 / line 627 and §1.3's fixture table both put tool-absence at `describeOrSkip("hash")` **file level** — so on a runner with no hash utility the whole of `driftClassify.test.js` is skipped, taking PROP-CLS-01's L0 case and PROP-RSN-01's L0 case with it. Those two need **no** hash capability: L0's recipe is `makeToolDir` *omitting* the tool. §11.1's blanket row ("every §3, §4, §7, §9 property | `hash`") makes the same over-skip normative. Since §2.3 and §11.1 both rest the row-reason meta-oracle floor on L0 staying hard, specify the granularity: L0-bearing cases at `it()` level outside the file-level `describeOrSkip`, or state that the floor is relaxed on a hash-less runner. | §2.2, §11.1 row 4; TSPEC §7, §1.3 |
| F-09 | **Medium** | Local | **§0.2's disposition index — which the document itself instructs reviewers to check row by row — is stale against the body in four places.** (i) O-20's row says "**Three** executable properties … plus a fourth for `supersedingState`"; §7 has **six** (PROP-MTM-01…06). (ii) The AC-1.8(iv) row says "PROP-RSN-01…**05** and PROP-BSL-01…**07**"; the body has PROP-RSN-01…**06** and PROP-BSL-01…**08**. (iii) The O-9 row says "both precedences asserted as **selector** properties (`selected == max by precedence over holding-and-determinate conditions`)" — that describes PROP-BSL-03 only. PROP-CLS-02 and PROP-RSN-03 are co-holding-fixture properties and §2.1(2) *explicitly rejects* the selector/disjointness framing for them; and there are three precedences in play (row state, row reason, baseline), not two. (iv) The O-11 row carries F-06's wrong leaf ids. An index that a reviewer is told to trust row by row must be regenerated after the body settles. | §0.2 |
| F-10 | **Low** | Local | **§1.2 says "exactly two surfaces" above a three-row table** (batched grammar driver, `runScript`, in-process JS). Same paragraph then says "no third runner". Reword to two *spawning* surfaces plus in-process JS. | §1.2 |
| F-11 | **Low** | Local | **`itOrSkip` signature is cited with the wrong arity.** §11.1 says "TSPEC §1.3's `itOrSkip(capability, unverifiedInvariants, fn)`"; TSPEC §1.3 line 205 declares `itOrSkip(name, capability, unverifiedInvariants, body)` — four parameters, `name` first. Same for `describeOrSkip`. | §11.1; TSPEC §1.3 |
| F-12 | **Low** | Local | **§12's placement table and the per-property "Lands in" annotations disagree.** PROP-SEAM-05 declares `driftFault.test.js, driftOrdering.test.js` but §12's `driftFault` row lists only "PROP-SEAM-01…04, -06". PROP-RSN-05 declares `driftBaseline.test.js` but §12's `driftBaseline` row does not list it. PROP-BSL-06 and PROP-BSL-07 appear in *two* rows each (`driftBaseline` via the `01…08` range plus `driftRepoRoot` / `driftOrdering`), which reads as two homes for one `it()` against §12's rule 2. | §12 vs §3–§8 |
| F-13 | **Low** | Local | **The fixed literal seed makes the "500 generated cases" a permanently static fixture set, and "seed + case index" alone is not a reproduction recipe.** §1.3 rule 1 pins a literal seed constant per test file — correct for reproducibility, but it means the drawn set never changes, so the suite explores the same 500 strings for the life of the feature and §6.2's "adversarial draws are forced" is doing all the work. Also, `seeded(seed)` is a stateful xorshift32 consumed in draw order, so reproducing case *n* requires replaying draws 1…n, not indexing. State both: the trade-off, and that reproduction is by replay (or make the generator a pure function of `(seed, index)`). A documented env override for widening (e.g. `PDLC_PROP_SEED`) would cost nothing and is the usual escape hatch. | §1.3 rules 1 and 4, §6.2 |
| F-14 | **Low** | Local | **PROP-SEAM-02's "every call site passes a literal (never a variable)" needs scoping to the first argument.** TSPEC §5.1.1 requires selector-bearing guards to pass a *variable* scope key as the **second** argument (`pdlc_fault_active artifact-copy "$id"`), so the conjunct as worded is false against a conforming implementation. Also note the scan must exclude the function's own definition site and any comment/heredoc occurrences in C1 — worth stating, since the oracle's soundness is the stated reason for the conjunct. Separately, `document-oracles.mjs` is cited by bare basename throughout; its path is `pdlc/workflows/lib/document-oracles.mjs` (TSPEC §2.1) and it does **not** exist at HEAD — correct, but the document should say "new, per TSPEC §2.1" the first time it cites it, as it does for `driftGenerators.js`. | §8.1 PROP-SEAM-02, §6.2 |
| F-15 | **Low** | Local | **PROP-SEAM-01(b)'s four non-member draw categories overlap.** The four are listed as "a random M6-conforming string, a one-character mutation (`mkdirr`, `mkdi`, `Mkdir`), leading whitespace, a different case" — but `Mkdir` is simultaneously the one-character-mutation example and the different-case category, and three mutation examples are given for one draw slot. With "4 draws per run family" the four distinct classes are not guaranteed to be covered. Make the four classes the enumeration and draw one from each. | §8.1 PROP-SEAM-01(b) |

## Questions

| ID | Question |
|----|---------|
| Q-01 | F-04: at exactly which step does §5.5's failed-verification **entry removal** land — inside step 5 (before the post-copy classify), or inside step 6? If it precedes the post-copy pass, PROP-MTM-04's agreement conjunct may survive the AT-35 composition; if it lands in step 6, it does not. This needs a citation, not an inference, because the property's whole value is that a red run means "the spec question is reopened". |
| Q-02 | F-03: does `enumerateEvidenceVectors()` close over E1 and E7, or are they varied separately per property? If separately, which properties own which axis, and what is each one's spawn cost? |
| Q-03 | F-07: is `PDLC_FAULT_TOKENS` intended to be a bash array in C1 (parsed by the JS test), a JSON side-artifact, or a JS constant in `document-oracles.mjs` mirrored into C1? The answer decides whether PROP-SEAM-01 and -02 are genuinely independent. |
| Q-04 | F-01: for `stale > local-edit` — since no fixture can co-hold both guards, what is the intended oracle for that adjacency? A mutation of the ladder order in a scratch copy of C1 is one option, but that is a different test category than the rest of §3. |
| Q-05 | §2.3 leaf L4's path is written as `A3 = indeterminate` without its `A1 = yes, A2 = yes` prefix (unlike L2, L5, L9, L10, which spell out their ancestors). Is that an omission, or does `enumerateLeaves()` really emit a partial path there? |

## Positive Observations

- **The dependent-tree representation does what §2.1 claims.** I recounted §2.3's leaves against
  FSPEC §3.3's ladder independently: rung 1's six sub-conditions map exactly to L0–L5, rungs 2–6 to
  L6–L10, and the tree `A1{no,indet,yes} → A2{no,yes} → A3{no,indet,yes} → A4{no,yes} → A5{equal,
  differ} → A6{3}` has **exactly 11** leaves with no unreachable path and no missing one. Undefined
  cells really are inexpressible in this representation — this is a genuine repair of REQ v13's
  failure mode, not a restatement of it.
- **The uid-0 leaf-vs-reason distinction is correct, and I verified it independently.** With L0 →
  `hash-tool-absent`, L1 → `plugin-artifact-missing`, L2 (token 15) → `plugin-artifact-unreadable`
  and L5 (token 16) → `consumer-artifact-unreadable`, all four row reasons are F-reachable on a root
  runner, so TSPEC §1.4's row-reason meta-oracle stays a hard assertion and only two *leaves* skip.
  All eight baseline reasons are likewise root-reachable (token 3 for `plugin-root-unreadable`,
  tokens 6/7 for `drift-state-invalidated`, fixtures for the rest). §11.1's framing of the residual
  is precise. (F-08 is about the skip *granularity*, not this argument.)
- **HEAD claims check out.** `pdlc/workflows/package.json` has exactly one devDependency (jest) and
  `testPathIgnorePatterns` already contains `/__tests__/helpers/` (lines 16–20), so the new
  `driftGenerators.js` needs no config change. PROP-SEAM-02's three bash source paths match TSPEC
  §2.1's C1/C2/C3 inventory exactly (`pdlc/hooks/scripts/lib/pdlc-drift.sh`,
  `check-workflow-drift.sh`, `sync-workflows.sh`) — no fourth file carries a guard.
  `assertPostCopyNarrow(trace, retiringIds)` does classify the retiring row, so PROP-MTM-04's
  post-copy conjunct is *measurable* (its truth is F-04's problem, not its observability).
- **The two biconditionals (PROP-RSN-02, PROP-BSL-02) are the right formulation** and the rationale
  for the reverse direction being load-bearing is exactly right — the one-directional reading really
  is satisfied by an implementation that nulls the reason on `unknown` rows too.
- **PROP-BKP-05/-06 split** ("lexicographic == tuple order" is a claim about strings; "== chronological"
  is a claim about time) is a genuinely useful decomposition, and PROP-BKP-13's re-shuffled-mtime
  falsifier is the only thing in the feature that makes FSPEC R-2 falsifiable at the prune site.
- **PROP-CLS-03's positive-presence conjunct** and PROP-CLS-08's "hash before and after" both avoid
  the absence-based-oracle trap the rest of the suite is at risk of; §10's blanket "three positive
  conjuncts" rule is the right standing discipline.
- **§14's residual table is honest**, especially P-R-5 (recording the property-shaped opportunity
  *not* taken and why) and P-R-7 (naming the budget as a ceiling). F-05 is a defect in the numbers,
  not in the discipline that produced them.

## Recommendation

**Needs revision**

Must change before approval:

1. **F-01** — Re-derive PROP-CLS-02's table. Separate genuinely co-holding rows from
   mutation-directed rows, name the falsifying implementation for each of the latter, and give
   `stale > local-edit` an oracle that is not leaf L9 re-run (Q-04).
2. **F-02 / F-03** — Correct §5.1's E5/E6 determinacy rules to FSPEC §2.1's (`E4 = holds` and
   `E5 = holds` both propagate indeterminacy), recount `enumerateEvidenceVectors()` under the
   corrected rules, and state which axes (E1, E7) the enumeration closes over. Re-derive §1.4's
   baseline budget row from the new count.
3. **F-04** — Either scope PROP-MTM-04's post-copy agreement conjunct away from the fault
   compositions where step 6's manifest rewrite legitimately splits the two passes, or replace the
   bytes-only argument with one that survives the AT-35 case (Q-01).
4. **F-05** — Recompute the spawn budget from the properties as written. §8, §9, §6 and §7 are all
   understated and §3's packed count is off by one; the ≈55 ceiling and P-R-7's mitigation rule both
   depend on the numbers being real.
5. **F-06 / F-09** — Fix the L3/L4-vs-L7/L8 leaf ids in §0.2 and §1.6, collapse the two skip
   inventories into one, and regenerate §0.2's disposition index against the settled body.
6. **F-07 / F-08** — Pin `PDLC_FAULT_TOKENS`'s single source and its JS extraction (Q-03), and
   specify the `hash` skip at a granularity that keeps L0 hard.
