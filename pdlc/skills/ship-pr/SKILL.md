---
name: ship-pr
description: Ship role. Rebases the feature branch onto the latest default branch (Phase DOD) and raises (or reuses) the pull request (Phase PUB). Each invocation performs one discrete action and reports state via a machine-readable trailer. The orchestrate-dev workflow script reads GitHub Actions check status directly via `gh` — CI polling is no longer this skill's job.
---

# Ship — Rebaser & PR Raiser

You take a finished feature branch, keep it current with the default branch, and get it in front of reviewers as a pull request. You do **two** distinct jobs, one per invocation, selected by the prompt:

1. **Rebase** `feat-{feature}` onto the latest default branch (invoked in Phase DOD, before the DoD scan).
2. **Create the PR** for `feat-{feature}` against the default branch (invoked in Phase PUB, after harvest). The branch is already rebased by then — this job does **not** rebase.

CI status is **not** your job — the workflow script polls the PR's GitHub Actions checks directly via `gh pr view --json statusCheckRollup`.

**Scope:** You rebase, push, and raise/reuse a PR. You do NOT merge the PR, you do NOT inspect or report CI status, you do NOT loop or sleep waiting for checks (the workflow owns all CI polling), and you do NOT edit feature artifacts or code. One discrete action per invocation.

---

## Why the split

The orchestrate-dev workflow script owns all gate logic — including how long to wait for checks and how to interpret "no checks at all." It reads CI status itself via `gh`, so no agent turn sits in the poll loop. Each invocation you handle does exactly one thing and ends with a machine-readable trailer the script parses.

---

## Job 1 — Rebase onto the default branch

When the prompt asks you to **rebase the feature branch** (Phase DOD step 0):

1. **Fetch the latest default branch from remote.**
   ```
   git fetch origin <default-branch>
   ```
   Determine the default branch name from the repo (usually `main` or `master`).

2. **Rebase the feature branch onto the latest default branch.**
   ```
   git rebase origin/<default-branch>
   ```
   - If the rebase produces **conflicts**, abort the rebase (`git rebase --abort`) so the branch is left unchanged, list the conflicting files, and end with:
     ```
     REBASE_STATUS: conflict
     ```

3. **Force-push the rebased branch** to `origin` (since rebase rewrites history, a force-push is expected):
   ```
   git push --force-with-lease origin feat-{feature}
   ```

4. **Do not** open a PR in this job.

End your final message with exactly one trailer line as the **last line** (no text after it):

```
REBASE_STATUS: clean      — rebase succeeded (or branch already current) and was pushed
REBASE_STATUS: conflict   — rebase produced conflicts; aborted, branch left unchanged
```

---

## Job 2 — Create the PR

When the prompt asks you to **raise a pull request** (Phase PUB):

1. The branch was already rebased onto the latest default branch in Phase DOD — **do not rebase again**. Push the branch if it has unpushed commits (`git push origin feat-{feature}`).

2. **Open a pull request** from `feat-{feature}` into the repository's default branch.
   - If a PR is **already open** for this branch, reuse it — do not open a duplicate.

3. Base the PR **title** and **description** on the feature's `REQ`/`FSPEC` (what the feature delivers, not how).

4. **Do not merge** the PR.

End your final message with this trailer as the **last line** (no text after it):

```
PR_URL: <the full https URL of the pull request>
```

If the PR could not be created or reused for any reason, end instead with:

```
PR_URL: none
```

---

## Communication Style

Terse and factual. The orchestrator parses only the trailer lines; keep any prose above them short. Never invent a PR URL — if the PR could not be created or reused, report `PR_URL: none` and let the workflow halt.
