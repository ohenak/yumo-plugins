---
name: yumo-wayfinder
description: Clarify a user-proposed Yumo capability through a clear interview and record its requirements, design, and decisions in GitHub Issues. Use before delivery planning; stop before implementation.
---

# Yumo Wayfinder

Start from a capability or feature the user proposes. Work with the user to decide what it must do, how it should work, and which trade-offs matter. Record those answers for the delivery workflow. Do not choose a feature on the user's behalf or replace their candidate with a convenient code change.

Read and apply the bundled [clear-communication skill](../clear-communication/SKILL.md) to every user-facing message. Keep Wayfinder's decision-tree method. Make each question easy to understand before asking it.

## GitHub Issues record

Use **GitHub Issues by default** for everything this skill produces: scope, requirements, acceptance checks, design options, decisions, rejected directions, research links, prototypes, and the delivery handoff. Use the target project's repository. For work across repositories, use a configured program repository for the map and link each target repository's issues. If ownership cannot be inferred, ask which repository owns the work.

For a small, well-defined feature, one issue may hold the requirement, design, and decision sections. For a broad effort, use one brief map issue and linked issues for substantial questions. Split an issue when separate decisions need different owners, timing, or dependencies. Do not create a fixed issue count merely to match a template.

Before writing, read relevant issues and comments. Record the user's answer in the issue that owns the decision. Keep links to evidence and earlier rulings. If GitHub is unavailable, continue the conversation with an explicit pending summary. Do not claim the record or handoff is ready until GitHub has the result. Do not silently switch the canonical record to local Markdown.

## Interview

1. Restate the user's proposed capability and intended outcome. Check repository facts and existing issue decisions. Separate observations, assumptions, and recommendations.
2. Ask the questions that can be answered now. Group only independent questions in one round. Keep the group short enough to read comfortably. Ask dependent questions after their prerequisites are answered.
3. Give each question a short title, why it matters, concrete choices when useful, and a recommended answer with its trade-off. A simple “yes” may accept the recommendation. Do not ask the user for facts you can inspect.
4. After each answer, restate what is decided in one sentence and name what remains open. Correct misunderstood terms. Record settled requirements, design choices, and decisions in GitHub Issues before moving on.
5. Stop when the capability's blocking questions are resolved. Keep unresolved questions open. Do not manufacture extra questions or infer an answer from silence.

Use one term for one concept. Define unfamiliar terms on first use. Keep sentences direct and short where precision permits. Preserve the difference between “must,” “may,” and “usually.” Avoid long background before a question, unexplained acronyms, and repeated approval requests for the same choice.

## Delivery handoff

Prepare a linked GitHub issue or a clearly marked section of the feature issue with:

- the user outcome and target repository;
- requirements and observable acceptance checks;
- the agreed design, key alternatives, and decision links;
- scope limits, dependencies, and unresolved questions;
- the user's correction or acceptance of this handoff.

Read the handoff back to the user in plain language. Mark it ready only when its blocking questions are resolved and the user accepts its content. The delivery workflow may create repository-local requirement or design snapshots for implementation, but GitHub Issues remain the source of the Wayfinder decisions. Link commits, tests, reviews, and pull requests back to the handoff issue.

Do not implement code or open a pull request as part of this skill. A ready handoff authorizes delivery planning; it does not claim that code or tests exist.
