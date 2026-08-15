# PLAN — pdlc-halt-hardening

Engine hardening for the three structural halt causes surfaced by driving
`regime-scaffold-pivot-alignment` through `pdlc dev` (engine pdlc-engine v0.1.0, plugin
pdlc **v0.22.7**): the verdict-shaped erratum gate with its one-round budget, the
anchor-staleness cascade, and parser-mechanics gates that halt late instead of failing
fast at authoring time.

| Field | Value |
|---|---|
| Upstream (evidence) | `~/workspace/regime-ledger/docs/regime-scaffold-pivot-alignment/POSTMORTEM-{T,P,D,PR}-regime-scaffold-pivot-alignment.md` |
| Engine source | `pdlc/workflows/orchestrate-dev.js` @ `46de120d` (plugin v0.22.7) — all line refs below verified at this HEAD |
| Downstream | implementation waves (Opus/Sonnet/Haiku per §6), gated by architect review of this plan |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | **approved** (architect gate 2026-08-14, four conditions folded in — §10) | Claude (planning agent) | 1.1 | 2026-08-14 |

> **Scope in one line.** Make each of the three documented halt causes structurally
> impossible to recur, each fix shipping with a regression test that reproduces the
> historical halt from this feature's history and asserts the new behavior — assertions
> on behavior, never on prose.

> **Definition of "never surface again".** For every historical halt/refusal named in the
> four postmortems there is a fixture-driven test that (a) reconstructs the triggering
> input (document bytes, confirmer verdicts, item lists) and (b) asserts the redesigned
> engine takes the non-halting path (or the halting path with the redesigned payload),
> through the same public seams the runtime uses (`agentFn`/`readFileFn`/`gitFn`
> dependency injection, as every existing `__tests__/*.test.js` does).

---

## 1. Current behavior at HEAD — verified touch points

The architect's line refs were approximate; these are exact at `46de120d` (v0.22.7).

### 1.1 Cause 1 — erratum gate

| Mechanism | Location | Verified behavior |
|---|---|---|
| `MAX_ERRATUM_ROUNDS_PER_DOC = 1` | `orchestrate-dev.js:6030` | one erratum round per upstream doc **per phase invocation**; second batch for the same doc halts (`:11337–:11347`) |
| `erratumPostmortemHalt` | `:11000` (def) | writes `POSTMORTEM-{phase}` via the phase's optimizer, halts run |
| Any-non-approving halt | `:11243–:11251` | `nonApproving = reviewers.filter(!isPassResult(verdicts[i]))`; **any** non-approving confirmer halts — no severity, provenance, or locality distinction |
| Halt payload | `:11248–:11251` and `:11341–:11345` | reason string carries `itemText` — the **pre-edit routed item list** — not the confirmers' findings (POSTMORTEM-T occ.3 durable-fix 5 confirmed in code) |
| Verdict source | `:11204–:11240` | `parseVerdict` on response trailer, file fallback when trailer malformed (DEC-ERR-02); returns `{verdict, high, medium, low, malformed}` — counts exist but the gate only consults `isPassResult` (`:5616`) |
| Item mint & dedupe | `routeErrata` `:11289`; dedupe key `` `${docType} ${entry.item}` `` `:11298` | dedupe is **exact-string** only — the thirteen-strings-five-defects batch (POSTMORTEM-PR) passes untouched; no multi-home split; no per-item mint-version tag beyond the doc-level `mintedHashes` |
| Mint-vs-execute skew | `deriveUpstreamState` + `movedSinceMinted` `:11090–:11098` | detected, but produces only an emitted **notice** telling the author to re-ground; items themselves are not re-minted, and confirmers receive the original `itemLines` (`:11050`, `:11154`) |
| Land-proof | — | none. No mechanical grep is run by the engine on any item before confirmers are dispatched (POSTMORTEM-PR §2.1's gap confirmed) |
| Prompts | `erratumAuthorPrompt :8193`, `erratumConfirmPrompt :8262` | confirm prompt asks for a verdict; it does not ask findings to be tagged delta-introduced vs inherited, and POSTMORTEM-P/PR both show confirmers answering different scope questions as a result |

### 1.2 Cause 2 — anchor staleness

| Mechanism | Location | Verified behavior |
|---|---|---|
| Staleness rule (§5.5) | `:5168` region; gate step 4 byte comparison `:10727–:10759` | an approval is stale iff the **document's own bytes** moved vs `APPROVAL-HASH` — an upstream edit never invalidates a downstream anchor mechanically; semantic staleness is discovered one phase per pass on later invocations (POSTMORTEM-P contributing cause 3, POSTMORTEM-D rec 4.1, cited unlanded in three later postmortems) |
| Post-erratum re-anchor | `:11255–:11266` | when the erratum round **passes**, the *edited upstream* doc is re-anchored (`appendApprovalAnchors :6615`) — correct, but nothing walks downstream |
| Anchor capture window | `:11134–:11144` | anchor hash/commit captured after the author edit, before confirmations — the window POSTMORTEM-P's REQ-v1.9-mid-window incident slid through is real: nothing aborts a confirmation when a *different* doc's sibling round moves the chain mid-window |

### 1.3 Cause 3 — parser mechanics

| Mechanism | Location | Verified behavior |
|---|---|---|
| `splitPipeRow` | `:4093–:4099` | splits on every `|` after stripping edge pipes — no `\|` escape handling, no backtick code-span awareness. `` `list[str] \| None` `` or a backticked `|` inside a cell shifts every later column, including Deps → fabricated dependency edges → "graph cycle" halt (`computeTopologicalBatches :9457`, cycle throw `:9493`, Phase P self-parse gate `:11842–:11846`, Phase I re-parse `:11956`) |
| `parsePlanTasks` | `:3996`; `PLAN_ID_HEADER_CELLS :4081`, `PLAN_DEPS_HEADER_CELLS :4082` | exact-cell closed-set header match (correct doctrine); shares `splitPipeRow` so inherits the pipe defect |
| `parsePlanOwnership` | `:4214`; `PLAN_OWNER_HEADER_CELLS :4137`, `PLAN_FILES_HEADER_CELLS :4145` | owner set is `{task, task id, task-id, task_id, owning task, id}` — `"Owning task(s)"` is not a member, so that manifest is **silently invisible** (no near-miss diagnostic; `sawQualifyingTable` stays false and the contract check downstream refuses) |
| PROPERTIES completeness | `REQUIRED_HEADINGS :5247` (PROPERTIES rows `:5280–:5285`: Oracles alts `["Checks"]`, Fixtures alts `["Generators","Test data"]`); `isComplete :5495`, `shortfall :5522` | strict closed-set headings; the no-progress halt does name still-missing rows and flags likely heading-naming mismatch (`:7796–:7828`), but only **after** burning `MAX_AUTHORING_ATTEMPTS` dispatches — the expected forms are not fed forward into the author's prompt up front, and near-miss headings actually present are not named |
| Cycle diagnostic | `:9493` | message is `"PLAN dependency graph contains a cycle — cannot compute topological batches"` — names neither row nor cell, so a shifted-column artifact reads as a design defect |

---

## 2. Design — Cause 1: severity-, provenance- and locality-shaped erratum gate

### 2.1 Structured confirmation findings (new input surface)

`erratumConfirmPrompt` (`:8262`) additionally requires each finding as one non-fenced line:

```
FINDING: {High|Medium|Low} | {delta|inherited} | {local|nonlocal} | {section anchor} | {text}
```

- **delta** = introduced or left unlanded by this round's edit; **inherited** = present in
  pre-round bytes the round did not touch.
- **local** = confined to the section(s) the prior round edited (the confirmer names the
  `##` section); **nonlocal** otherwise.
- A new `parseConfirmationFindings(text)` (pure, beside `parseVerdict :4367`) parses these;
  the `VERDICT:` trailer/file channel is unchanged and remains the fail-closed floor.
- **Fail-closed default:** a non-approving confirmation whose High findings carry no
  parseable `FINDING:` tags is treated as `{delta, nonlocal}` — i.e. exactly today's halt.
  The redesign can only *relax* behavior when confirmers comply with the new grammar; it
  can never loosen an untagged rejection. This is the migration guarantee for in-flight
  consumer repos (§7).

### 2.2 Gate decision rules (inputs → verdict)

Evaluated at the current halt site (`:11243`), in order; first match wins:

| # | Inputs | Verdict |
|---|---|---|
| R1 | all confirmers approving (`isPassResult`) | pass — re-anchor upstream (`:11259`), unchanged |
| R2 | ≥1 non-approving, **zero** High findings tagged `delta` (all Highs `inherited`) | **no halt.** Do not re-anchor the upstream doc. Route each inherited High as a re-open of the owning phase's ordinary revision loop (mark that doc's approval stale via the §3 machinery; owning phase re-runs under its existing `MAX_REVIEW_ROUNDS`/lifetime budgets). Mediums/Lows recorded, not gating — same bar as the review loop |
| R3 | ≥1 High tagged `delta`, **and** every **High** finding is `local` to the prior round's edited sections *(as-implemented in T2, amending v1.1's "every finding (any severity)": the literal reading is unreachable on RT-1a's own repro fixture, which carries a Low/inherited/nonlocal rider, and contradicts R2's "Mediums/Lows not gating" bar — flagged for architect ratification at check-in (i))*, **and** the follow-up budget for this doc is unspent | dispatch **one** follow-up erratum round (`MAX_ERRATUM_FOLLOWUP_ROUNDS = 1`, shipped constant, per upstream doc per phase invocation), its item list = the confirmers' findings verbatim; then re-confirm. A second non-approving confirmation → R4 |
| R4 | ≥1 High tagged `delta` and (nonlocal, or follow-up spent) | `erratumPostmortemHalt` — with the §2.4 payload |

`MAX_ERRATUM_ROUNDS_PER_DOC = 1` (`:6030`) is retained for *fresh* item sets; the R3
follow-up is a distinct, separately-capped budget so the channel's bound on unbounded
chains is preserved (POSTMORTEM-T occ.3 durable-fix 4's "scoped strictly to the section
the prior erratum edited" is R3's locality conjunct). `lifetimeCapReached` (`:6958`)
continues to dominate everything.

### 2.3 Mechanical land-proof for literal-token items

At mint time (`routeErrata :11289`), an item whose text matches the shape "should say X,
not Y" (or that carries an explicit `EXPECT-TOKEN: {token}` clause, which the updated
reviewer SKILLs will emit) is classified **literal-token**. After the author edit and
*before* confirmers are dispatched (`:11146`), the engine re-reads the target doc via
`readFileFn` and checks the expected token is present (word-boundary containment, same
matcher family as `isComplete`'s `shortfall`). On failure: one bounded author re-dispatch
naming the missing token and its target section; on second failure the round proceeds to
confirmation (which will fail) so nothing is masked — but the frozenset-class miss
(POSTMORTEM-PR: halt was one grep away, grep run by the wrong party one step too late)
is caught engine-side, pre-confirmation.

### 2.4 Item-list hygiene at mint, and halt payload

All in `routeErrata` / `erratumRound`:

1. **Dedupe by normalized target, not exact string** (`:11298` today): items sharing
   docType + cited anchor/section + expected token collapse to one item carrying the union
   of source attributions. (POSTMORTEM-D: five entries, three obligations; POSTMORTEM-PR:
   thirteen strings, five defects — restatement count was an accidental, anticorrelated
   priority signal.)
2. **Per-item mint tag:** each item records the upstream doc hash it was minted against
   (extending `mintedHashes` from per-doc to per-item). When `deriveUpstreamState`
   (`:11090`) reports skew, the engine **re-mints**: the author's dispatch is required to
   return a re-derived item list against HEAD (absorbed vs still-raised, DEC-ERR-01
   vocabulary), and it is *that* list — not the stale one — that reaches the confirmers.
   Today's notice-only path (`:11092–:11097`) becomes structural.
3. **Multi-home split:** an item naming N target docs mints N tracked items; each closes
   independently; the sourcing DECISIONS row is only reportable closed when all N are
   (POSTMORTEM-D contributing causes 1–2, durable fixes 1 and 3).
4. **Oracle contract:** an item touching a test oracle (matches `AT-`/`INV-`/oracle id
   vocabulary) must carry the oracle's full contract — property, non-subsumption
   rationale, per-conjunct red witness. Enforced as a mint-time lint: a non-conforming
   oracle item is not routed; it is reported to the current phase as a malformed erratum
   (loud notice naming the missing contract field), where the ordinary review loop can fix
   the finding's statement. Nothing halts on this.
5. **Halt payload = confirmers' findings.** `erratumPostmortemHalt`'s `reason` (and the
   POSTMORTEM prompt) carries the parsed `FINDING:` lines from both confirmations,
   verbatim, with the routed item list demoted to background. (Occ.3 durable-fix 5: the
   historical payload contained already-landed items with stale line numbers.)

---

## 3. Design — Cause 2: same-pass anchor cascade

### 3.1 Record upstream state in the anchor block

`appendApprovalAnchors` (`:6615`) additionally writes, per approval, one line per
upstream doc in the chain:

```
UPSTREAM-STATE: {DOCTYPE} sha256:{64 hex}
```

(normalized-hash variant alongside, mirroring `APPROVAL-HASH-NORMALIZED :4895`). The
§5.5 staleness rule (`:5168`, comparison at `:10727`) extends to: an approval is stale iff
the doc's own bytes moved **or** any recorded `UPSTREAM-STATE` hash no longer matches that
upstream doc at HEAD. Staleness becomes mechanically visible the moment an upstream edit
lands, instead of semantically latent.

### 3.2 Cascade in the same pass

When an erratum round edits upstream doc X and its confirmation **passes** (R1), the
engine, still inside the same run:

1. Walks the doc chain downstream of X in `ERRATUM_DOC_TYPES` order (`:5999`).
2. For each downstream doc with a recorded approval whose `UPSTREAM-STATE` for X now
   mismatches (or, for grandfathered anchors, whose approval predates the edit commit),
   dispatches a bounded **delta re-confirmation**: each of that doc's reviewers re-reads
   their own prior cross-review plus the diff of X, and confirms or rejects. Approving →
   refresh anchors over the (unchanged) doc bytes with updated `UPSTREAM-STATE`.
   Non-approving → the doc's phase re-opens through its ordinary revision loop, still in
   this run, under its existing budgets.
3. Bounded by construction: ≤ |chain| docs, one re-confirmation round each,
   `MAX_LIFETIME_ROUNDS` unchanged as the damping term.

**Known limitation (as-implemented, architect-accepted 2026-08-15):** a non-approving
cascade re-confirmation for a phase that has *already run* in the current invocation
records the re-open (registry + run report); that phase re-runs on the **next**
invocation, not mid-run. All staleness is still discovered and recorded in one pass —
worst case is one extra invocation to complete the re-opens, never one discovery per
pass.

This lands POSTMORTEM-D rec 4.1 ("invalidate downstream anchors in the same pass and
carry re-confirmation forward within that run") — cited unlanded in three later
postmortems — and, via §3.1, the closure-edit case (POSTMORTEM-T occ.2 §2 tail): the
engine-sanctioned post-approval edit path already re-anchors the edited doc (`:11259`);
§3.2 extends the refresh to its dependents.

### 3.3 Freeze the confirmation window

While any doc's confirmation round is in flight, sibling erratum rounds against that
doc's upstream chain are serialized behind it (POSTMORTEM-P durable fix: REQ v1.9 landed
inside TSPEC's confirmation window; three beliefs about "current" within four minutes).
Implementation: `routeErrata` already runs targets serially (`:11328` loop); the change is
to re-derive `upstreamState` *between* targets and abort-and-re-dispatch a confirmation
whose target's upstream moved mid-window, instead of letting a trailing sha re-stamp
paper over it.

---

## 4. Design — Cause 3: parser hardening + authoring-time fail-fast

### 4.1 `splitPipeRow` (`:4093`) — escape- and code-span-aware

Rewrite as a small scanner: a `|` is a delimiter only when it is (a) not preceded by an
unescaped backslash and (b) not inside an open backtick code span (backtick runs matched
per CommonMark: a span opens/closes on equal-length backtick strings). Pure function, no
seam. Every current caller (`parsePlanTasks :4031/:4049`, `parsePlanOwnership
:4238/:4247`, the findings-table reader `:8956`) inherits the fix. Strict widening: any
row with no in-cell pipes parses byte-identically (property test over a corpus of
existing PLANs, §5 RT-3b).

### 4.2 Ownership header matching (`:4137`) — tolerant match, loud near-miss

Keep the closed-set doctrine (exact cell, never substring — the documented reason at
`:4131–:4135` stands). Two changes:

1. **Normalization before membership:** lowercase, trim, collapse whitespace, strip one
   trailing parenthetical (`owning task(s)` → `owning task`, `file(s)` → `file`). Plus
   enumerate the observed spellings: `owning task(s)`, `owning tasks`, `owner`.
2. **Loud near-miss contract error:** a block that matches one of the two column sets but
   not the other (e.g. a Files column found, no owner column) no longer stays silently
   non-qualifying — `parsePlanOwnership` returns a structured diagnostic naming the header
   row verbatim, the cell that near-missed, and the exact accepted spellings, and the
   Phase P gate surfaces it as an in-phase contract error fed back to the author. A
   manifest can be *rejected loudly*; it can never be *invisible*.

### 4.3 Cycle and Deps diagnostics name the row and cell

- `computeTopologicalBatches` (`:9457`) cycle throw (`:9493`) reports the actual cycle
  path (task ids in order).
- New pre-check in the Phase P gate (`:11842`): any Deps cell containing a token that is
  not a known task id is reported per-row (`row {N}: Deps cell "{raw}" names unknown id
  "{tok}"`) **before** cycle detection runs — a shifted column then reads as "unknown id
  `None`" at the offending row, never as "graph cycle".

### 4.4 In-phase artifact lint (fail fast at authoring time)

A new pure `lintPlanArtifact(markdown)` — runs `parsePlanTasks` + `parsePlanOwnership` +
`validatePlanContract` + the §4.3 pre-checks and returns structured diagnostics — is
invoked (a) inside Phase P's authoring loop after each author dispatch, feeding exact
expected forms plus the offending row/cell into the next author prompt, and (b) at the
existing post-convergence gate (`:11842`), which becomes a backstop that should never
fire. Same pattern for PROPERTIES: the completeness probe already runs per-round; the
change is to feed `REQUIRED_HEADINGS[docType]` canonical titles + alts **into the
creator's first prompt** (extending the grounding manifest, `PHASE_DISPATCH[*].grounding`)
and, on a shortfall, to name the nearest-miss headings actually present in the document
(normalized-title fuzzy report) — so te-author's 3× stall on `## Oracles`/`## Fixtures`
becomes a first-round self-correction. **The feed-forward is generic** (architect
condition 3): it is driven by `REQUIRED_HEADINGS[docType]` for every doc type that has an
entry — REQ, FSPEC, TSPEC, PLAN, PROPERTIES, DECISIONS — not a PROPERTIES special case;
the incident was PROPERTIES this time, but the gate exists for six doc types. Additionally extend the PROPERTIES alts
(`:5282–:5284`) with the observed synonyms from the incident (e.g. `Oracles` +=
`Test Oracles`, `Fixtures` += `Test Fixtures`, `Test Data`) — alts stay a bounded closed
set, no config surface.

**Invariant delivered:** a malformed table or heading set is caught inside the authoring
phase; it can never survive to a later phase, and no parser failure ever reports as a
different defect class ("graph cycle") than it is.

---

## 5. Historical-repro regression tests

All fixture-driven, in `pdlc/workflows/__tests__/`, using the existing DI seams; fixtures
extracted (sanitized) from the regime-ledger feature's git history.

| Id | Reproduces | Asserts (new behavior) |
|---|---|---|
| RT-1a | POSTMORTEM-PR frozenset halt: erratum round lands 4/5 items, both confirmers High-delta-local on one noun | R3 fires: exactly one follow-up round dispatched with the confirmers' findings as items; no POSTMORTEM written; second failure → halt whose payload contains the `FINDING:` lines and not the routed item list |
| RT-1b | POSTMORTEM-P inherited-staleness halt: confirmers non-approving, all Highs tagged `inherited` | R2: no halt; owning phase's approval marked stale and re-opened in-run; upstream doc not re-anchored |
| RT-1c | untagged non-approving confirmation (legacy reviewer output) | fail-closed: behaves exactly as v0.22.7 (halt), byte-comparable payload apart from the findings section |
| RT-1d | POSTMORTEM-D five-items-three-obligations mint; POSTMORTEM-T occ.1 stale-mint | dedupe collapses to 3; per-item mint tags present; on upstream skew the confirmer-visible list is the re-minted one; multi-home DEC-rspa-05-shaped item mints 2 tracked items |
| RT-1e | POSTMORTEM-PR land-proof gap | literal-token item with absent token triggers engine-side re-dispatch naming the token, pre-confirmation |
| RT-2c | POSTMORTEM-P window-freeze incident: upstream REQ moves *inside* a TSPEC confirmation window, two confirmers citing different upstream shas ("three beliefs about current inside four minutes") | §3.3 freeze: the in-flight confirmation is aborted and re-dispatched against the re-derived upstream state; no confirmation whose cited upstream sha mismatches HEAD-at-dispatch is ever consulted by the gate |
| RT-2 | POSTMORTEM-P/D anchor cascade (PLAN anchored on TSPEC v1.6, TSPEC → v1.7 in-run) | after a passing erratum on TSPEC, PLAN's approval is stale in the same pass, re-confirmation dispatched in-run; approving path refreshes `UPSTREAM-STATE`; grandfathered anchor (no `UPSTREAM-STATE` lines) is not spuriously staled by unrelated edits |
| RT-3a | fabricated-cycle halt: PLAN task table with `` `list[str] \| None` `` in a description cell | columns parse unshifted; no cycle; old parser demonstrably mis-parses the same fixture (control assertion) |
| RT-3b | parser back-compat | corpus property: for every pipe-free row and every existing-fixture PLAN, new `splitPipeRow` ≡ old |
| RT-3c | invisible manifest: header `Owning task(s) \| Files` | manifest parses; header `Writers \| Files` yields the loud near-miss diagnostic naming the cell and accepted spellings, not silence |
| RT-3d | te-author 3× stall: PROPERTIES with `## Test Oracles` / `## Test Data` | `isComplete` passes under extended alts; for a genuinely missing section, the first-round author prompt contains canonical titles + nearest-miss report |

---

## 6. Task breakdown and delegation map

Complexity: S ≤ ~50 changed lines, M ≤ ~200, L > 200 (incl. tests). Every task carries
its regression tests; the engine's own gates (`npm test` in `pdlc/workflows/`,
`build-runtime.mjs --check`) apply per wave.

| # | Task | Files touched | Tests | Cx | Model | Deps |
|---|---|---|---|---|---|---|
| T1 | `parseConfirmationFindings` + `FINDING:` grammar in confirm prompt + reviewer SKILL updates | `orchestrate-dev.js` (`:8262`, new fn near `:4367`), `pdlc/skills/{pm,se,te}-review/SKILL.md` | new `erratumFindings.test.js`; `parseVerdict.test.js` untouched-green | M | **Opus** | — |
| T2 | Gate decision rules R1–R4, `MAX_ERRATUM_FOLLOWUP_ROUNDS`, findings-shaped halt payload | `orchestrate-dev.js` `:11046–:11251`, `:11000` | RT-1a/1b/1c in `erratumProtocol.test.js` | L | **Opus** | T1 |
| T3 | Mint hygiene: normalized dedupe, per-item mint tags + structural re-mint, multi-home split, oracle-contract lint | `orchestrate-dev.js` `:11289–:11377`, `:6060` | RT-1d; extend `erratumProtocol.test.js` | M | **Sonnet** | T2 |
| T4 | Engine-side literal-token land-proof | `orchestrate-dev.js` (pre-confirm hook in `erratumRound` `:11146`) | RT-1e | S | **Sonnet** | T2 |
| T5 | `UPSTREAM-STATE` anchor lines, §5.5 extension, same-pass cascade, window freeze | `orchestrate-dev.js` `:6615`, `:5168`/`:10727`, `:11255+`, `:11328` | RT-2; `approvalHash.test.js`, `reviewLoop.test.js` green | L | **Opus** | T2 |
| T6 | Escape/code-span-aware `splitPipeRow` + cycle/Deps diagnostics | `orchestrate-dev.js` `:4093`, `:9493`, `:11842` | RT-3a/3b in `planParse.test.js` | M | **Sonnet** | — |
| T7 | Ownership header normalization + near-miss diagnostic | `orchestrate-dev.js` `:4137–:4160`, `:4214+` | RT-3c in `planOwnership.test.js` | S | **Sonnet** | T6 |
| T8 | In-phase lint plumbing (`lintPlanArtifact`, prompt feedback loop, PROPERTIES heading feed-forward + nearest-miss) | `orchestrate-dev.js` (Phase P/T authoring loops, grounding manifests) | RT-3d; `completeness.test.js`, `groundingPrompts.test.js` | M | **Sonnet** | T6, T7 |
| T9 | PROPERTIES alts additions | `orchestrate-dev.js` `:5280–:5285` | alt-table rows in `completeness.test.js` | S | **Haiku** | — |
| T10 | Fixture extraction from regime-ledger history (sanitized), corpus for RT-3b | `__tests__/fixtures/` | consumed by RT-* | S | **Haiku** | — |
| T11 | Version bump 0.23.0, `build-runtime.mjs` regen, `distribution-manifest.json`, CLAUDE.md §Review-loop-mechanics update, RELEASE-CHECKLIST entry | `pdlc/.claude-plugin/plugin.json`, `pdlc/workflows/dist/*`, `CLAUDE.md`, `pdlc/RELEASE-CHECKLIST.md` | `runtimeBundle.test.js`, `sync-workflows.sh --check` | S | **Haiku** | all |

Wave shape (per architect condition 2, stricter isolation adopted):
{T1, T6, T9, T10} → {T2, T7} → **T3 → T4 → T5 (strictly serial)** → {T8} → {T11}.
Because all engine tasks edit one file (`orchestrate-dev.js`) in one shared tree, tasks
touching that file are additionally serialized *within* each wave; only T10 (fixtures) is
file-disjoint and runs truly in parallel. `cd pdlc/workflows && npm test` must be green
after every task before the next dispatches.

---

## 7. Risks, backward compatibility, migration

1. **In-flight consumer (regime-ledger, mid-pipeline).** No stored state changes shape:
   existing `APPROVAL-HASH`/`REVIEWED-COMMIT` anchors parse unchanged and are
   **grandfathered** (no `UPSTREAM-STATE` lines → byte-staleness rule only, exactly
   today); existing POSTMORTEMs keep the `RESOLVED:` lifecycle untouched; existing
   cross-review files with untagged verdicts hit the R-rules' fail-closed default
   (RT-1c). A consumer resuming a halted feature after upgrading sees behavior changes
   only in *future* erratum rounds — strictly fewer halts, never a silently passed gate.
2. **Loosening risk.** R2/R3 are the only relaxations, both conditional on explicit
   confirmer tags and both bounded (R3 by a shipped constant, R2 by the owning phase's
   ordinary budgets + lifetime cap). An inherited-High can no longer halt the erratum
   channel, but it cannot ride to ship either — it re-opens the owning phase in-run.
3. **Confirmer non-compliance with `FINDING:` grammar** degrades to today's behavior
   (halt), never to a pass. SKILL updates (T1) and the prompt itself both carry the
   grammar.
4. **Parser widening regressions.** Guarded by RT-3b's equivalence corpus; the header
   normalization is enumerable and tested; near-miss reporting adds a diagnostic, never
   changes an accept.
5. **Run length.** Same-pass cascade + in-run re-opens make single invocations longer
   (bounded: ≤5 downstream docs × 1 re-confirmation, plus ordinary budgets). The
   trade is deliberate: the historical alternative was one halt per pass across ~12
   passes.
6. **Self-modification guard.** The PR touches `pdlc/workflows/` → Phase MERGE will never
   auto-merge it; human merge required (as designed).
7. **Bootstrapping.** If this ships through the pdlc queue, the erratum channel would be
   fixing itself while running; a halt mid-feature leaves the engine half-hardened. See
   Q-6.

---

## 8. Version bump and rollout

- **Ships as pdlc plugin `0.23.0`** (minor: halt-semantics behavior change + additive
  grammar; nothing breaks a well-formed 0.22.7 artifact). `build-runtime.mjs` regenerates
  `pdlc/workflows/dist/` + `distribution-manifest.json` (one row per artifact, retired
  predecessors listed).
- **Consumer upgrade path:** update the plugin in the plugins cache (0.22.7 → 0.23.0);
  on next session `check-workflow-drift` announces the consumer's `.claude/workflows/`
  copy drifted; consumer runs `pdlc/hooks/scripts/sync-workflows.sh` (then `--check`
  exits 0). **Pinning** = simply not updating the cached plugin; the drift gate never
  force-upgrades. For regime-ledger specifically: safe to upgrade mid-feature per §7.1;
  recommended sequence is upgrade → re-invoke → let the R-rules handle the currently
  halted round.

---

## 9. Open questions for the architect

| # | Question | My default if unanswered |
|---|---|---|
| Q-1 | R2 re-opens the owning phase **in the same run**. Accept the longer single-invocation runtime, or record-and-continue to end of pipeline (defect rides until next pass)? | in-run re-open |
| Q-2 | Grandfather old anchors (no `UPSTREAM-STATE` → byte-rule only), or force a one-time re-confirmation sweep on first post-upgrade invocation? | grandfather |
| Q-3 | Is `MAX_ERRATUM_FOLLOWUP_ROUNDS = 1` (shipped constant, not config) the right bound, or should it share the lifetime-rounds ledger? | shipped constant 1; lifetime cap already dominates |
| Q-4 | Header tolerance: normalization + enumerated spellings (proposed) vs enumeration-only with near-miss error? The former accepts unforeseen `(s)` variants; the latter is the purer closed-set doctrine | normalization + enumeration |
| Q-5 | PROPERTIES heading synonyms: alts-only (proposed) or a per-repo config surface? | alts-only |
| Q-6 | Delivery route: through the pdlc queue as a feature (self-hosting risk, §7.7) or direct `feat-pdlc-halt-hardening` branch + PR with the ordinary test gates (my recommendation, matching how the queue's own bootstrapping constraint was handled)? | direct branch + PR |
| Q-7 | The plan corrects several of your line refs (`:6075→:6030`, `:11322→:11245/:11338`, `:4007→:3996`, `:4138→:4093`, `:4259→:4214`, `:5326→:5247`, `:5540→:5495`). If your refs came from a different checkout (yumo-plugins vs yumo-plugins-dev2), confirm which worktree implementation should target | this repo (`yumo-plugins-dev2` @ `46de120d`) |

---

## 10. Gate record (architect, regime-ledger session, 2026-08-14)

**Verdict: APPROVED** — implementation authorized per the §6 delegation map.

Rulings on §9: Q-1 in-run re-open. Q-2 grandfather (no forced sweep). Q-3 shipped
constant `MAX_ERRATUM_FOLLOWUP_ROUNDS = 1`, lifetime cap dominating, no config surface.
Q-4 normalization + enumerated spellings, keeping the loud near-miss error. Q-5
alts-only. Q-6 direct branch + PR (`feat-pdlc-halt-hardening` off default; self-hosting
risk disqualifies the queue route; self-mod guard mandates human merge). Q-7 implement in
`yumo-plugins-dev2` @ `46de120d`; plan committed as the branch's first commit.

Conditions (all folded into this v1.1): (1) RT-2c window-freeze regression test added to
§5; (2) T3 → T4 → T5 strictly serialized after T2 (§6 wave shape); (3) heading
feed-forward generic across all six `REQUIRED_HEADINGS` doc types (§4.4); (4) two
architect check-ins — (i) after wave 2 (T2+T7): diff summary, `npm test` output,
RT-1a/1b/1c/3c status, **before wave 3 dispatches**; (ii) final validation before T11:
full suite + all RT-* green + `build-runtime.mjs --check`, **holding the 0.23.0
release/PR (no push, no PR) until the architect confirms**.
