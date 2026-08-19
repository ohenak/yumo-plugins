# Cross-Review: product-manager — DECISIONS

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-advisory-wave-gate/DECISIONS-pdlc-advisory-wave-gate.md` (v1.1)
**Date:** 2026-08-20
**Iteration:** 2
**Scope:** Delta re-review, product lens only. I read my v1 findings, diffed the document over
`ebbeb1fa..HEAD`, and scanned only the changed sections. Technical adequacy, test strategy and code
quality remain the engineering reviewers' lenses.

## Prior Findings — Disposition

All seven v1 findings are addressed, and I verified each correction against the repository rather
than against the document's own account of it.

| v1 | Severity | Disposition | Verification |
|----|----------|-------------|--------------|
| F-01 | Medium | **Resolved** | The consequence now says the engine test must gain a *new* expectation and that nothing moves. Confirmed: `.claude/pdlc.config.example.json` carries exactly `dispatch` and `implementation`, no `advisory` section; `pdlc/engine/__tests__/ci-arrangement.test.js` has zero occurrences of `advisory` and asserts only on `implementation.testCommand`. The product reason (an affordance nothing asserts into the example ships working and undiscoverable) is now stated in the record, which is where a PLAN reader will meet it |
| F-02 | Medium | **Resolved, and better than I asked** | I asked for the task-count claim to be requalified; the revision keeps "one task" as the right call and re-sizes it against the counterparts. Every count checks out: the five-member seam literal is at six sites (`advisoryEnvelope` ×1, `advisoryRecord` ×2, `advisoryHarvest` ×1, `consolidationProperties` ×1, `helpers/advisoryDoubles` ×1); the four-member envelope literal is at six more (`advisoryEnvelope`, `advisoryDisabled` ×2, `advisoryHarvest`, and `advisoryDoubles` ×2 — the frozen shape and the generator). The `ADVISORY_DEFAULTS_SHAPE` comment does say it must be kept in sync by hand because the real symbol does not exist yet at that task |
| F-03 | Medium | **Resolved** | DEC-A6-02 now names the supersession explicitly and distinguishes the wrong row from the merely permissive clause. The defect is still live upstream — TSPEC §1.1 row O-8 still reads "the wave commit loop's existing `commitPaths` writer gains one more pathspec" — so the erratum still has to land; the record no longer leaves a reader stranded at it in the meantime |
| F-04 | Low | **Resolved** | Re-attributed to TSPEC §7's AT-04-5 row ("identified by its `message` literal and its pathspec") and §3.6. Confirmed FSPEC's AT-04-5 asserts four things and does not range over the message |
| F-05 | Low | **Resolved** | The known gap is carried as its own paragraph, the routing to REQ/FSPEC is named rather than performed, and the re-evaluation trigger now closes the loop when the halt-message obligation lands. This is the right division: the record holds the gap, the REQ holds the obligation |
| F-06 | Low | **Resolved** | Option D's rejection cell now carries the ignored-path boundary and points at OQ-7, so the table and the prose agree |
| F-07 | Low | **Resolved** | The contract is quoted in full and the load-bearing half is identified: shipped bytes at `orchestrate-dev.js:9701` read `Do NOT run git add or git commit — the orchestrator verifies your work and commits it.` — a verbatim match. `commit-tree {tree} -p {head} -m "…"` is corrected in both the options table and the decision body |

Nothing in the revision broke anything I had approved. The five-verb correction, the `-m`
justification and the DEC-A6-03 falsifiability admission are new material from the other reviewer's
findings; I checked them too, and two small citation and scope slips are below.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | DEC-A6-04's new consequence says "Nothing anywhere exercises the behaviour this entry rests on — `waveBudgetPerRun: 0` **on a red wave** ⇒ escalate, zero `_agent` calls, a sixth row reading zero". Two of those three conjuncts *are* exercised: TSPEC §5.2's **wave entered over budget** case (added in TSPEC v1.4 on my own v1 TSPEC finding) asserts, on a red wave, escalation with `reason: "budget-exhausted"` and no `_agent` call. The real, and smaller, gap is the `0` *arrangement* and the sixth-row-reading-zero assertion. As written the consequence over-states the hole the PLAN and the TE erratum have to fill | REQ C-2; FSPEC E-33, AT-01-6; TSPEC §5.2 |
| F-02 | Low | Local | Three new sentences attribute the capture oracle to TSPEC **§5.5**; it lives in **§5.2**. §5.5 is the prohibitions-and-mutation-fixtures section and contains no `commit-tree` assertion. Same defect class as v1 F-04 — a "no test would catch this" claim hung on the wrong test — reintroduced while fixing the original instance | TSPEC §5.2, §5.5; REQ NFR-3 |

## Detail

### F-01 — the `waveBudgetPerRun: 0` coverage gap is real but smaller than the record claims (Medium)

The consequence under "What follows from DEC-A6-04" now reads, in part:

> Nothing anywhere exercises the behaviour this entry rests on — `waveBudgetPerRun: 0` **on a red
> wave** ⇒ escalate, zero `_agent` calls, a sixth row reading zero — even though TSPEC §5's coverage
> matrix lists "`waveBudgetPerRun: 0`" among the tier-gate arms it covers.

The three sub-claims it makes about the AT set are right and I re-checked each: FSPEC AT-01-4 is the
disabled-tier case; AT-01-6's premise is "tier enabled and no wave gate goes red", so it never
reaches the budget gate; AT-07-2b is parse-level only. TSPEC §5.4's coverage matrix does list
"`waveBudgetPerRun: 0`" among the tier-gate arms. The conclusion the entry draws from all this — that
a future simplification collapsing `0` into `enabled: false` passes the suite — I believe still
stands, and it is worth stating.

What is over-stated is the "nothing anywhere" premise, and the thing it misses is a fixture this
feature added on my own v1 TSPEC finding. TSPEC v1.4's changelog records it, §3.2 step 3 argues for
it, and §5.2 hosts it:

> **A wave entered over budget still captures, and dispatches nothing.** One run, three positive
> facts and one negative: `waveBudget.resolved` already at `waveBudgetPerRun` on entry ⇒ the
> disposition is `escalated` with `reason: "budget-exhausted"`, an advisory record entry and an
> escalation entry are written, the snapshot was still taken … and no `_agent` call occurs.

Two of the entry's three conjuncts are exactly that fixture's assertions. What the fixture does not
pin is the arrangement — its premise is `resolved >= waveBudgetPerRun`, which the default `1` reaches
after one resolved wave and which never names `0` — and it says nothing about the sixth summary row.
So the residual gap is: *a red first wave under `waveBudgetPerRun: 0`, asserting the sixth advisory
row is present and reads zero*, which is precisely the assertion that separates `0` from
`enabled: false`.

This matters for the product reason the entry exists. `waveBudgetPerRun: 0` is an operator affordance
promised by REQ C-2 and FSPEC E-33; the record is arguing that the affordance's distinguishing
behaviour is undefended. Sizing that defence as "author the whole no-dispatch-on-red case" rather
than "instantiate the existing over-budget case at `0` and add the summary-row conjunct" is the
difference between a new fixture and a parameter, and the erratum on TSPEC will be easier to close if
it says which.

Suggested change: keep the conclusion, narrow the premise — name §5.2's over-budget case as the
nearest coverage, say what it does and does not pin (arrangement, summary row), and let the erratum
ask for the `0`-arranged variant rather than for coverage from scratch.

### F-02 — the capture oracle is TSPEC §5.2's, cited three times as §5.5's (Low)

Three new passages hang a claim on §5.5:

1. DEC-A6-01's `-m` paragraph — "§5.5's oracle is an **argv-sequence** assertion over the `_git`
   double's recorded argv (`commit-tree === 1`, plus an `update-ref` on the snapshot ref)".
2. DEC-A6-03's falsifiability paragraph — "every fixture that observes the ref (§3.2's over-budget
   case and §5.5's capture assertions)".
3. The five-verbs consequence — "why §5.5 counts a capture-*unique* verb (`commit-tree === 1`)".

Both assertions live in §5.2. TSPEC's own v1.3 changelog attributes them there ("§5.2's
one-snapshot-per-wave assertion now counts a capture-unique argv verb (`commit-tree === 1`)"), the
`commit-tree === 1` text is in §5.2, and the over-budget case is a §5.2 bullet, not a §3.2 one — §3.2
step 3 argues for it and defers the oracle to §5.2. §5.5 is "Prohibitions, paired positives, and the
tests neither review found a home for", and it contains no `commit-tree` assertion at all.

The substance is unaffected: an argv-sequence oracle over a double genuinely cannot catch a `-m`-less
`commit-tree`, and the `-m` argument is the strongest new paragraph in the document. But this is the
same shape as v1's F-04 — a claim of the form "a test will/won't catch this" pointing at a test that
is not the one in question — and F-04's own fix says why it matters: that claim is one an
implementer acts on, and it is only checkable if the pointer resolves. Three instances is worth one
find-and-replace.

Suggested change: §5.5 → §5.2 in all three places, and "§3.2's over-budget case" → "§5.2's
over-budget case (argued in §3.2 step 3)".

## Questions

| ID | Question |
|----|---------|
| Q-01 | DEC-A6-04 now says `0` "suppresses agent calls, not git objects", so a repo running with `0` accumulates one dangling `refs/pdlc/a6-snapshot-{waveNum}` per red wave in a namespace nothing prunes, forever, while getting no repairs. That is defensible — the snapshot is the thing a `0` operator inspects — but it is an operator-visible cost of an affordance REQ C-2 describes as "keep the tier on, keep A6 off". Does the PM (me) need to carry that to REQ alongside the halt-message obligation from v1 F-05, or is DEC-A6-03's pruning re-evaluation trigger the right home for it? I lean on the trigger, and I am asking rather than routing. |

## Positive Observations

- **Every correction was made against the code, not against my review.** I asked for four factual
  fixes and got four fixes plus the evidence that produced them — occurrence counts, file names, the
  shipped prompt quoted verbatim. Each one I re-derived independently and each one holds. That is the
  standard I would want a later reader to be able to rely on when they meet this record cold.
- **F-02 came back stronger than the finding.** I asked for the "one task, not three" claim to be
  requalified; the revision defends "one task" as correct, and re-sizes it — a dozen transcriptions
  and a shared double whose failure reason the record could not otherwise predict. Keeping the
  decision and fixing the sizing is the better answer, and the `advisoryDoubles` coupling paragraph
  is now the single most useful sentence in the document for whoever writes that PLAN task.
- **The `-m` paragraph is exemplary.** It states why the literal is load-bearing (argv-only
  transport, no stdin channel — confirmed: `runtime-adapter.js:995` and `:1048` resolve
  `{ok, stdout, stderr}`), why no test catches its omission, and where the literal therefore belongs
  ("in the implementing task's argv, not in its judgement"). That last clause is the kind of guidance
  a record exists to carry.
- **DEC-A6-03's option-A rejection now admits it is not falsifiable.** A record that says "read this
  rejection as a design commitment, not a tested one" and then names the oracle that would change
  that is doing exactly what I want from reversibility and rejection columns. §4.5 does assert the
  one-ref-per-wave property, and the observing fixtures are single-wave, so the admission is honest.
- **The five-verb correction sizes real work.** `write-tree`, `commit-tree`, `update-ref`,
  `read-tree` and `clean` are each at zero occurrences in `orchestrate-dev.js`; `reset` really does
  ship exactly once as `reset --hard` on the seam-revert path (`orchestrate-dev.js:2870`); `add`
  ships twice. Under-enumerating the double is a real way for a restore path to false-green, and the
  record now names it.
- **Gaps are carried rather than closed by fiat.** Three separate places (the halt-message reach, the
  `0` coverage hole, option A's falsifiability) route work upstream and say so, instead of the record
  quietly making a product decision that belongs in REQ/FSPEC. The DECISIONS document is staying
  inside its lens.

## Recommendation

**Approved with minor changes**

No High findings. Every v1 finding is resolved, verified against the repository, and none of the
revisions broke anything I had previously approved. The four decisions still trace cleanly to the
REQ/FSPEC vocabulary they serve, and the document is now noticeably more honest about what is decided
versus what is tested — which, for a record whose whole job is to be read months later by someone
deciding whether to unwind one of these choices, is the improvement that matters most.

The two items below are non-gating and can land in one pass:

1. **F-01 (Medium)** — narrow the `waveBudgetPerRun: 0` coverage claim: TSPEC §5.2's over-budget case
   already pins escalation and zero `_agent` calls on a red wave; the gap is the `0` arrangement and
   the sixth-row-reading-zero conjunct. Keep the conclusion, size the erratum to the actual hole.
2. **F-02 (Low)** — §5.5 → §5.2 in the three new capture-oracle citations, and attribute the
   over-budget case to §5.2 rather than §3.2.

Outstanding upstream: the TSPEC O-8 obligation row (v1 F-03) and the §7 `ci-arrangement` claim
(v1 F-01) are still uncorrected on disk. Both were routed as errata in round 1 and are tracked there;
I am not re-raising them, but this approval assumes they land before the O-8 traceability path is
read by anyone downstream.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}

APPROVAL-HASH: sha256:5145d90af8ed14261979b0c46fa60791c11ac9fd672950f1fab634f7e6c5ccc3
APPROVAL-HASH-NORMALIZED: sha256:5145d90af8ed14261979b0c46fa60791c11ac9fd672950f1fab634f7e6c5ccc3
REVIEWED-COMMIT: d40e14e2c45b6b74657c790295584fee9a9b7089
UPSTREAM-STATE: REQ sha256:a10396e88a52c1905b0d2cdfe0bbb2174b8f100888b7a7b2d69b0e0bd5ed9645
UPSTREAM-STATE: FSPEC sha256:82f74a2da52df5be64bf266d61341a0879df8bdafe69adf2f85f5ba9db961c3e
UPSTREAM-STATE: TSPEC sha256:93385165ef7c7ad8ce2c87d990c48007fa80090dcd8980cb980513692611b4f2
