# PLAN — pdlc-merge-phase

| Field | Value |
|---|---|
| Upstream | REQ → FSPEC → TSPEC → **PLAN** |
| Downstream | PROPERTIES, IMPL |
| Cross-Reviews | `CROSS-REVIEW-{pm,te}-TSPEC-v1.md`, `-v2.md`, `-v3.md` |
| LEARNINGS | `docs/pdlc-merge-phase/LEARNINGS-pdlc-merge-phase.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude | 1.0 | 2026-08-02 |

## 1. Summary

Build **Phase MERGE** — the last phase of `orchestrate-dev` — per TSPEC v1.2 against FSPEC v1.3 and
REQ v1.1. Four files change:

| File | What lands |
|---|---|
| `pdlc/workflows/orchestrate-dev.js` | constants, config reader, `mergeCommandFor` + six observations over one `_ghRun` transport, the pure `decideMerge` core, the self-modification guard, merge execution, the post-merge M1–M5 sequence, `phaseMerge`, `main()` wiring, three report fields |
| `pdlc/workflows/orchestrate-queue.js` | the `Evidence` column helpers, `updateQueueStatus`/`rewriteStatus` evidence parameters, the `recorded` disposition catalogue, `runPicked`'s `done` transition |
| `pdlc/workflows/runtime-adapter.js` | `rtGhRun` + one `rtDevInjections` key |
| `pdlc/workflows/build-runtime.mjs` | both entrypoint closures (seam rename), `DEV_META.phases`, and the rebuilt `dist/` artifacts |

17 tasks in 12 derived batches. The batch count is high for the task count because **rule 2 below
forces every task touching the same physical file into a different batch**, and `orchestrate-dev.js`
is touched by nine of them. Cross-file parallelism is the only parallelism available: the
`orchestrate-dev` chain (A), the `orchestrate-queue` chain (B) and the adapter task (D1) run
alongside one another, not the tasks within a chain.

## 2. TDD discipline, and one declared deviation

**Every task is a red → green → refactor unit**, executed by one `se-implement` agent whose own SKILL
enforces red-first. Normative per task, without exception:

1. Write the named tests **first** and observe them fail for the stated reason.
2. Implement the minimum that turns them green.
3. `cd pdlc/workflows && npm test -- <the task's test file>` must pass **before the commit**, and
   `npm test` (whole suite) must pass before the task is reported done. Never `npx jest` — the repo's
   runner is `npm test --`.
4. Commit on `feat-pdlc-merge-phase` only; re-verify the branch immediately before committing.

**Declared deviation from the se-author SKILL's batch-safety rule 3.** The SKILL asks for a separate
red-test row per implementation row, joined by a `Deps` edge. This PLAN does **not** split them, and
says so rather than quietly complying in form: because rule 2 already serializes every same-file task
into its own batch, a separate red row for the same test file would land in its own batch too —
doubling 17 tasks to 34 and 12 batches to ~23 — while the red-before-green ordering it protects is
performed atomically inside one agent's TDD loop, on a chain that is already fully serial per file. No
concurrency exists between the red and green halves for a reviewer to protect. Instead, **every task
row names the acceptance tests it must red first**, which is the property the rule exists to secure.
If the tech-lead's PLAN-lint rejects this shape, the mechanical fix is to split each row in two with
the green row depending on the red row; the batch numbers then re-derive automatically.

The `[Fake first]` obligation **is** honoured: **F1** is a batch-1 task owning every shared test
double and golden fixture, and every downstream task depends on it (rule 4).

## 3. Task table

## 4. Per-batch file-ownership manifest

## 5. Dependency notes and the batch derivation

## 6. Integration points

## 7. Absorbed review items

## 8. Risk register

## 9. The rebuild-in-the-same-commit rule

## 10. Final verification checklist

## 11. Definition of Done
