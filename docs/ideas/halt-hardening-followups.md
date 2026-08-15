# pdlc-halt-hardening follow-ups (backlog)

Status: **ideas only — not built.** Field findings from live 0.23.0 consumer runs,
captured for a 0.23.1-class pickup. Source of truth for the shipped behavior:
`docs/pdlc-halt-hardening/PLAN-pdlc-halt-hardening.md`.

---

## 1. Inverted/mislabeled qualifying ownership table poisons the manifest union

**Reported:** 2026-08-15, first live 0.23.0 run (regime-ledger, resuming its in-flight
feature), via the architect session. Not urgent — the shipped diagnostics named every
offending row verbatim and the consumer-side fix was one header rename.

**The edge.** A consumer PLAN carried BOTH a machine-read `Task | Files` manifest AND a
legacy prose per-file table headed `File (subpackage-qualified) | Owning task(s) | …`.
Under 0.22.7 the prose table was invisible (the bug T7 fixed); under 0.23.0 the header
normalization makes it *qualify* too, and `parsePlanOwnership` unions qualifying blocks —
so the prose table's **inverted orientation** (file→tasks) fed its multi-task cells in as
task ids, producing five "manifest row names a task id that is not in the task table"
errors. T7's near-miss design contemplated a *missing* manifest, not a semantically
inverted *qualifying* one.

**Suggested hardening.** When a qualifying block's task-cell values mostly fail
task-table membership (or mostly parse as paths while its files cells parse as id
lists), report it as a probable inverted/mislabeled table — same loud diagnostic
discipline, naming the header row and the orientation evidence — and **exclude it from
the union** rather than poisoning the merged manifest.

**Regression-test candidate.** Fixture with one valid manifest + one inverted qualifying
table; assert the valid manifest alone is consumed and the inverted table is named in a
notice, never merged.

**What went right, keep it:** the mint-time oracle-contract lint's drop-with-notice, the
per-row verbatim manifest diagnostics, and the lifetime-cap accept-as-is notice all fired
as designed in the same run.

---

## 2. planHash re-key forces full wave replay; replay is not idempotent on a built tree

**Reported:** 2026-08-15, second live 0.23.0 finding (regime-ledger, same in-flight
feature), via the architect session. Not urgent. Touches the wave ledger
(`.claude/pdlc-wave-state.json`), so coordinate with `docs/pdlc-wave-resume/` if that
feature is in flight when this is picked up.

**The edge.** A PLAN revision grew the task table 20→22 tasks mid-feature, re-keying the
ledger's `planHash` and forcing a full 11-wave replay — on a tree where every task's end
state was already committed and the suite green. Replay is not idempotent there: wave 2's
task declared `tests/regime/fixtures/model_config/.gitkeep`, which a later task deletes
**by design**, so the engine's post-task `git add -- <declared files>` failed on a
pathspec that correctly no longer exists. The failure message was honest (work verified,
uncommitted, two remedies offered) — but both remedies re-enter the trap: recreating the
placeholder reds a tracked-path set-equality oracle at any later full-suite gate, and
there is nothing to commit because the end state is already in history.

**Operator workaround used (documented-semantics-consistent, disclosed):** advanced the
ledger's `lastGreenWave` to the full wave count with head at HEAD — the tree is the
ledger's own authority and every end state was committed and CR-approved — then
re-invoked and let DoD arbitrate.

**Suggested hardening, in decreasing value (architect's shapes):**
(a) on `planHash` re-key, seed the new ledger by **tree-verification** — walk the new
plan's tasks and mark green without replay any task whose declared files match HEAD
state, *including declared deletions*, so only genuinely new tasks run;
(b) make the post-task `git add` tolerate a declared file that a **later task in the same
plan** declares as deleted (the manifest already encodes this);
(c) minimum: when the add fails but the tree + gate verify, record the wave green with a
notice instead of exiting 2.

**Regression-test candidate.** Built-tree fixture + re-keyed plan with one
create-then-delete file pair; assert no replay failure and only new tasks dispatched.
