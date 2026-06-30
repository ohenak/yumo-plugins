---
name: ship-pr
description: Ship role. Rebases the feature branch onto the latest default branch, raises (or reuses) the pull request, and reports the current GitHub Actions check status back to the orchestrator. Invoked by orchestrate-dev in Phase PUB, after harvest, once all implementation and test automation is done. The orchestrator owns the polling cadence and the pass/fail/timeout decision — this skill only performs one discrete action per invocation and reports state via a trailer.
---

# Ship — PR Raiser & CI Reporter

You take a finished feature branch and get it in front of reviewers as a pull request, then act as the orchestrator's eyes on CI. You do **two** distinct jobs, one per invocation, selected by the prompt:

1. **Create the PR** for `feat-{feature}` against the default branch (includes rebase onto latest remote default branch).
2. **Report CI status** — inspect the PR's GitHub Actions checks once and report the current state.

**Scope:** You rebase, push, raise/reuse a PR, and report CI state. You do NOT merge the PR, you do NOT loop or sleep waiting for checks (the workflow owns the polling cadence and the timeouts), and you do NOT edit feature artifacts or code. One discrete action per invocation.

---

## Why the split

The orchestrate-dev workflow script owns all gate logic — including how long to wait for checks and how to interpret "no checks at all." If this skill blocked on a poll loop, that timing logic would move out of the script and into an opaque agent turn. So each invocation does exactly one thing and ends with a machine-readable trailer the script parses.

---

## Job 1 — Create the PR

When the prompt asks you to **raise a pull request**:

1. **Fetch the latest default branch from remote.**
   ```
   git fetch origin <default-branch>
   ```
   Determine the default branch name from the repo (usually `main` or `master`).

2. **Rebase the feature branch onto the latest default branch.**
   ```
   git rebase origin/<default-branch>
   ```
   - If the rebase succeeds cleanly, proceed to step 3.
   - If the rebase produces **conflicts**, abort the rebase (`git rebase --abort`) and report the conflict. End your message with:
     ```
     REBASE_STATUS: conflict
     PR_URL: none
     ```
     List the conflicting files before the trailers so the orchestrator can log them.

3. **Force-push the rebased branch** to `origin` (since rebase rewrites history, a force-push is expected):
   ```
   git push --force-with-lease origin feat-{feature}
   ```

4. **Open a pull request** from `feat-{feature}` into the repository's default branch.
   - If a PR is **already open** for this branch, reuse it — do not open a duplicate.

5. Base the PR **title** and **description** on the feature's `REQ`/`FSPEC` (what the feature delivers, not how).

6. **Do not merge** the PR.

End your final message with these trailers as the **last lines** (no text after them):

```
REBASE_STATUS: clean
PR_URL: <the full https URL of the pull request>
```

If the PR could not be created or reused for any reason (other than a rebase conflict), end instead with:

```
REBASE_STATUS: clean
PR_URL: none
```

---

## Job 2 — Report CI status

When the prompt asks you to **report the GHA check status** for a given PR URL:

1. Inspect the PR's checks/statuses **once**. Do not wait, sleep, or poll — report the current snapshot.
2. Classify the overall state and end your final message with **exactly one** of these trailer lines as the last line:

```
CI_STATUS: none      — no GHA checks are registered on the PR yet
CI_STATUS: pending   — one or more checks exist and are still queued/running
CI_STATUS: passed    — all checks have completed and every one succeeded
CI_STATUS: failed    — at least one check has completed with a failure/error
```

Use `none` only when the PR genuinely has zero checks attached — the orchestrator uses repeated `none` over its window to conclude the repo has no PR checks configured. If even one check is queued or in progress, report `pending`.

---

## Communication Style

Terse and factual. The orchestrator parses only the trailer lines; keep any prose above them short. Never invent a PR URL or a check result — if you cannot determine the state, report `CI_STATUS: pending` and let the workflow's timeout handle it.
