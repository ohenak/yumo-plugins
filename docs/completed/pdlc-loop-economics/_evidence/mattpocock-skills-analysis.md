# Matt Pocock Skills — Mechanism Analysis

All 12 skills downloaded and analyzed from https://raw.githubusercontent.com/mattpocock/skills/main/

---

## 1. grilling

**Description:** Grill the user relentlessly about a plan, decision, or idea. Use when the user wants to stress-test their thinking, or uses any 'grill' trigger phrases.

**Mechanism (3-6 bullets):**
- Interview user relentlessly by building a **design tree**: every decision branches into decisions that hang off it
- Work the tree in **rounds**; the **frontier** is every decision whose prerequisites are settled—ask only those questions now
- Number each frontier question, provide your recommended answer, then **wait for user's answers** before computing next round
- Finding facts is the agent's job (dispatch sub-agents), never the user's; dispatch exploration for environmental facts without blocking remaining questions
- Questions whose answers depend on other open questions belong to **later rounds**, not this one
- Session is done when frontier is empty and user confirms shared understanding; **do not act until confirmed**

**Stopping rules / Constraints:**
- Session completes only when frontier is empty (every branch visited, nothing left assumed)
- Questions must be numbered; recommended answer provided for each
- Sub-agent dispatch for environmental facts does not block unrelated frontier questions
- User confirmation required before action; no silent assumptions


---

## 2. research

**Description:** Investigate a question against high-trust primary sources and capture the findings as a Markdown file in the repo. Use when the user wants a topic researched, docs or API facts gathered, or reading legwork delegated to a background agent.

**Mechanism (3-6 bullets):**
- Spin up **background agent** to do research while you continue working
- Agent investigates against **primary sources** only (official docs, source code, specs, first-party APIs), following every claim back to its source
- Agent writes findings to single Markdown file, citing each claim's source
- Agent saves findings where repo already keeps such notes, matching existing convention, or in sensible location with disclosure
- Only primary sources, never secondary write-ups
- Results provided asynchronously; frees main agent to continue in parallel

**Stopping rules / Constraints:**
- Use only primary sources; follow claims back to source owner
- All claims must be cited with source location
- Save to existing convention location or with explanation
- Use background agent (asynchronous, non-blocking)


---

## 3. prototype

**Description:** Build a throwaway prototype to answer a design question. Use when the user wants to sanity-check whether a state model or logic feels right, or explore what a UI should look like.

**Mechanism (3-6 bullets):**
- Pick branch based on question: **Logic** (state model/logic) → HTML file with guided walkthroughs; **UI** (what should this look like?) → several radically different UI variations switchable via URL param
- Locate prototype close to actual usage (next to module/page prototyping for) but name it so reader sees it's throwaway, not production
- Trivial to run: one command in task runner (pnpm, python, bun) or double-click HTML file
- No persistence by default; state lives in memory (exception: database is what you're checking)
- **Skip polish**: no tests, minimal error handling, no abstractions; surface full state after every action
- Capture validated decision: fold into real code, commit prototype to throwaway branch with context pointer

**Stopping rules / Constraints:**
- One command to run or double-click to start
- No database persistence unless explicitly being tested
- Skip tests, error handling, abstractions
- Commit prototype to throwaway branch, not main
- Done when question is answered and decision is validated (then fold into production code)


---

## 4. to-spec

**Description:** Turn current conversation into spec publish it project issue tracker: no interview, just synthesis you've already discussed.

**Mechanism (3-6 bullets):**
- **Do NOT interview**; synthesize only what already discussed (conversation context + codebase understanding)
- Explore repo to understand codebase state, use project's domain glossary, respect ADRs in touching area
- Sketch out seams for test-driven feature; prefer existing seams over new ones, use highest seam possible
- One seam across codebase ideal; fewer seams better; propose highest point for changes
- Check user seams match expectations
- Write spec using template (Problem Statement, Solution, User Stories, Implementation Decisions, Testing Decisions, Out of Scope, Further Notes) and publish to issue tracker with `ready-for-agent` triage label

**Stopping rules / Constraints:**
- Do NOT interview user; pure synthesis only
- Use existing domain glossary from repo
- Minimize number of seams (one ideal, few better)
- Verify seams with user before publishing
- Publish with `ready-for-agent` label (no additional triage needed)


---

## 5. to-tickets

**Description:** Break plan, spec, current conversation into set tracer-bullet tickets, declaring blocking edges, published configured tracker (edges text in one file per ticket locally, native blocking links on real tracker).

**Mechanism (3-6 bullets):**
- Gather context from conversation, user references (spec path, issue number), or read full body/comments if user passes reference
- Explore codebase (if not already done) to understand current state; use domain glossary; look for prefactoring opportunities ("make change easy, then make easy change")
- Break work into **tracer-bullet** vertical slices: each cuts narrow COMPLETE path through every layer (schema, API, UI, tests), demoable or verifiable on its own, sized to fit one context window
- Identify **blocking edges**: tickets that must complete before start; wide refactors use expand–contract sequence (new form, migrate batches, delete old), not vertical slices
- Quiz user: granularity feel right? Are blocking edges correct? Any tickets to merge/split?
- Publish tickets to tracker (local files `.scratch/<feature>/issues/<NN>-<slug>.md` or real tracker GitHub/Linear) in dependency order (blockers first), with blocking references and `ready-for-agent` label

**Stopping rules / Constraints:**
- Each vertical slice is complete (all layers: schema, API, UI, tests)
- Each ticket fits one fresh context window
- Ask user quiz before publishing; iterate until approved
- Publish in dependency order (blockers first)
- Use `ready-for-agent` label (agent-grabbable immediately)
- Do NOT close or modify parent issue


---

## 6. implement

**Description:** Implement piece work based on spec set tickets. Use /tdd where possible, pre-agreed seams. Run typechecking regularly, single test files regularly, full test suite once end.

**Mechanism (3-6 bullets):**
- Implement work described in spec tickets
- Use `/tdd` (red-green-refactor) where possible, at pre-agreed seams
- Run typechecking regularly (not just at end)
- Run single test files regularly (isolated feedback)
- Run full test suite once at end
- Use `/code-review` to review work once done; commit work to current branch

**Stopping rules / Constraints:**
- Stop when spec tickets complete
- Required: run typechecking during implementation
- Required: run single test files during
- Required: full test suite run at end
- Must use pre-agreed seams only
- Code review required before commit


---

## 7. tdd

**Description:** Test-driven development. Use when the user wants to build features or fix bugs test-first, mentions "red-green-refactor", or wants integration tests.

**Mechanism (3-6 bullets):**
- Tests verify behavior through **public interfaces**, not implementation details; good test reads like specification
- **Seams** are public boundaries you test at; **pre-agreed seams only**—write down seams, confirm with user, no unconfirmed seams
- **Anti-patterns**: implementation-coupled (mocks internals), tautological (assertion recomputes expected the same way), horizontal slicing (all tests then all code instead of vertical slices)
- **Rules of loop**: (1) Red before green—write failing test first, then minimal code to pass; (2) One slice at a time—one seam, one test, one implementation per cycle; (3) Refactoring is NOT part of loop (belongs to review stage)
- Consult `tests.md` and `mocking.md` for examples; respect project's `CONTEXT.md` domain language and ADRs
- Vertical slices only: one test → one implementation → repeat, each test a tracer bullet

**Stopping rules / Constraints:**
- Pre-agreed seams only; get user confirmation before any test
- One slice per cycle (one seam, one test, one implementation)
- Red BEFORE green; always
- Refactoring deferred to review stage
- No speculative features; only enough code to pass current test
- No horizontal slicing


---

## 8. code-review

**Description:** Review the changes since a fixed point (commit, branch, tag, or merge-base) along two axes: Standards (does the code follow this repo's documented coding standards?) and Spec (does the code match what the originating issue/spec asked for?). Runs both reviews in parallel sub-agents and reports them side by side.

**Mechanism (3-6 bullets):**
- Pin the **fixed point** user supplied (commit SHA, branch, tag, main, HEAD~5, etc.); confirm it resolves and diff is non-empty
- Identify **spec source**: issue references in commits, user-passed path, docs/specs/_scratch/ file matching branch, or ask user; if none exists, Spec sub-agent skips
- Identify **standards sources**: repo documentation (CODING_STANDARDS.md, CONTRIBUTING.md) plus **smell baseline** (Fowler code smells: Mysterious Name, Duplicated Code, Feature Envy, Data Clumps, Primitive Obsession, Repeated Switches, Shotgun Surgery, Divergent Change, Speculative Generality, Message Chains, Middle Man, Refused Bequest)
- Spawn **two parallel sub-agents**: (1) Standards axis: find violations of documented standards + baseline smells (under 400 words); (2) Spec axis: find missing requirements, scope creep, wrong implementations (under 400 words)
- Aggregate reports under `## Standards` and `## Spec` headings, verbatim or lightly cleaned; do NOT merge or rerank
- End with one-line summary: total findings per axis, worst issue within each axis; no single winner across axes

**Stopping rules / Constraints:**
- Two parallel sub-agents; they do not pollute each other
- Standards: under 400 words per sub-agent
- Spec: under 400 words per sub-agent
- Repo standard OVERRIDES baseline smell
- Do NOT merge findings across axes
- Two separate reports; two separate summaries (one per axis, not one overall)


---

## 9. triage

**Description:** Move issues on project issue tracker through small state machine triage roles, categorise, verify, grill needed, agent-ready briefs.

**Mechanism (3-6 bullets):**
- **Roles**: two category roles (`bug`, `enhancement`); five state roles (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`); every triaged issue carries exactly one category + one state role
- Gather context: read full issue/PR (body, comments, labels, dates; for PR, check diff); parse prior triage notes; don't re-ask resolved questions; run redundancy check (existing implementation?) and prior-rejection check (in `.out-of-scope/`?)
- **Recommend** category + state, give brief reasoning, wait for maintainer direction
- **Verify claim**: if bug, reproduce reporter's steps; if PR, confirm diff matches claims, run relevant tests
- **Grill** if needed: call `grilling` or `domain-modeling` skills if request needs fleshing out; sharpen domain terms, update ADRs; sharpened decisions inline as they land
- **Apply outcome**: `ready-for-agent` → post agent brief; `ready-for-human` → agent brief + note why not delegated; `needs-info` → post notes; `wontfix` → close + cite `.out-of-scope/` KB

**Stopping rules / Constraints:**
- Every triaged issue must have exactly one category role AND one state role
- No re-asking resolved questions from prior triage
- Verify claim before recommending (reproduce bug, confirm PR diff)
- Grill optional; optional if state already clear
- Post disclaimer on every comment: "*This was generated by AI during triage.*"
- Fast state override: maintainer says "move #42 ready-for-agent" → trust it, apply directly, skip grilling (ask if want brief written)


---

## 10. wizard

**Description:** Generate interactive bash wizard walks human through steps only perform. Use provisioning infrastructure, setting up credentials CI secrets, walking unfamiliar third-party dashboard, running one-off migration cutover.

**Mechanism (3-6 bullets):**
- Scope procedure: work out manual steps human must take; every value gets captured along way; read repo first (`.env`, `.env.example`, README, docker-compose, GitHub workflows/secrets/vars)
- Map each stage's journey: URL to open, exact UI path, value to copy, which variable it fills (e.g., "Dashboard → Developers → API keys → Reveal test key → copy")
- Copy `template.sh`, replace each stage with one `stage` per step in order; use library helpers: `stage`, `say`/`step`, `open_url`, `ask`/`ask_secret`, `write_env`, `set_secret`/`set_var`, `pause`/`confirm`
- Set `TOTAL_STAGES` to stage count; follow template's bar: open URL if asking value, use `ask_secret` for secrets, `write_env` for persisted values, `set_secret` only for CI-needed values, `confirm` before irreversible action
- **Verify**: `bash -n <script>` and `shellcheck`; `chmod +x`; end-to-end dry run matching exactly 1:1 with GitHub secrets/vars references; tell user to run it
- Commit only if repeatable setup path; link from README so next person runs script instead of asking AI

**Stopping rules / Constraints:**
- Scope stage sequence with user; show ordered list + values + capture target before drafting
- Never invent UI steps; ask user to verify current UI if unsure
- Do NOT touch library code above STAGES marker in template
- Hold bar: wizard opens URL, asks value, writes to correct place (`.env`, secret, both, or pure action)
- One stage = one focused task; each `stage` clears screen; nothing scrolls away
- No persistence in memory; state lives only in environment or `.env`
- Do NOT edit library code; only edit stage definitions


---

## 11. diagnosing-bugs

**Description:** Diagnosis loop for hard bugs and performance regressions. Use when the user says "diagnose"/"debug this", or reports something broken/throwing/failing/slow.

**Mechanism (3-6 bullets):**
- **Phase 1: Build feedback loop** (most critical; everything else is mechanical)—construct tight pass/fail signal: failing test, curl script, CLI invocation + snapshot, headless browser script, replay captured trace, throwaway harness, property/fuzz loop, bisection harness, differential loop, or HITL bash script. Refuse to proceed without tight, red-capable, deterministic, fast, agent-runnable loop
- **Phase 2: Reproduce + minimise**—run loop, confirm failure matches user's symptom (not adjacent bug), verify reproducibility, capture exact symptom; shrink repro to **smallest scenario still red**, removing one element at a time, keeping only load-bearing pieces
- **Phase 3: Hypothesise**—generate 3–5 ranked hypotheses BEFORE testing; each must be falsifiable ("if X is cause, changing Y will make bug disappear / changing Z will make worse"); show ranked list to user before testing; cheap checkpoint
- **Phase 4: Instrument**—add logging, assertions, breakpoints to narrow hypothesis search space; run loop against instrumented code; repeat Phase 3–4 until hypothesis confirmed
- **Phase 5: Fix + Verify**—apply fix; loop should go green; minimal regression test from Phase 2 repro
- **Phase 6: Broaden**—find similar bugs elsewhere (same pattern, same code); check related code paths

**Stopping rules / Constraints:**
- Completion criterion for Phase 1: **tight loop that goes red**—one command you've already run ✓ that is red-capable ✓ deterministic ✓ fast (seconds) ✓ agent-runnable ✓
- NO Phase 2 without Phase 1 complete
- NO hypothesizing before Phase 2 complete + minimized
- Non-deterministic bugs: goal is higher reproduction rate (50% is debuggable; 1% is not)
- If genuinely cannot build loop: stop, list what tried, ask user for (a) access to reproducing environment, (b) redacted artifact (HAR, log, core dump, recording), or (c) production instrumentation permission
- Redact all secrets before showing commands/outputs
- Do NOT proceed without tight loop; no code-reading theories without red-capable loop


---

## 12. diagnosing-bugs (continued — Phase 4–6 detail)

**Phase 4: Instrument detail:**
- Insert assertions, logs, breakpoints into code being debugged
- Narrow hypothesis space by observing code path taken, state transitions, timing
- Iterate: hypothesis → instrumentation → test → hypothesis refinement
- Logs must be high-signal; skip low-signal noise

**Phase 5: Fix + Verify:**
- Apply minimal fix for confirmed hypothesis
- Run loop; watch it go green
- Minimal regression test emerges from Phase 2 minimization

**Phase 6: Broaden:**
- Search codebase for similar bug patterns (same logic, same code structure)
- Check related code paths that might fail the same way
- Done when no further instances found

---

## Summary: Constraints Across All Skills

| Skill | Primary Constraint | Secondary Constraints |
|-------|-------------------|----------------------|
| **grilling** | Session incomplete until frontier empty | User confirms before action; sub-agents for facts only |
| **research** | Primary sources only | All claims cited; background agent async |
| **prototype** | One question answered | Throwaway branch; tight feedback |
| **to-spec** | Pure synthesis, no interview | Existing seams preferred; minimize seam count |
| **to-tickets** | Tracer-bullet vertical slices | One context window per ticket; dependency-ordered; user quiz |
| **implement** | Spec tickets drive work | Pre-agreed seams only; typechecking + testing at each stage |
| **tdd** | Red before green, always | One slice per cycle; pre-agreed seams only |
| **code-review** | Two parallel axes (Standards + Spec) | No merging/reranking; separate summaries |
| **triage** | One category + one state role per issue | Verify claim before recommending; no re-asking |
| **wizard** | One focused task per stage | Do NOT edit library code; ask user to verify UI steps |
| **diagnosing-bugs** | Tight red-capable loop in Phase 1 | Phase 2–6 blocked until Phase 1 done; minimize in Phase 2 |

---

## Key Shared Patterns

1. **Confirmation gates**: grilling (user confirms), to-tickets (user quiz), tdd (pre-agreed seams), code-review (two parallel agents, no merge)
2. **One-at-a-time discipline**: grilling (frontier questions), tdd (one slice), to-tickets (tracer bullets), diagnosing-bugs (remove one element per iteration)
3. **Refuse to proceed**: diagnosing-bugs (no Phase 2 without Phase 1 loop), tdd (no unconfirmed seams), to-spec (no interview/synthesis only)
4. **Primary source + curation**: research (primary only, all cited), code-review (standards + smell baseline, repo overrides)
5. **User in the loop**: grilling (decisions are user's), triage (maintainer direction), wizard (verify UI steps user would see), to-tickets (granularity quiz)
6. **Parallel delegation**: research (background agent), code-review (two sub-agents), diagnosing-bugs (hypothesis testing)
7. **Vertical slices everywhere**: prototype (answer one question), to-tickets (tracer bullets), tdd (one seam per cycle), implement (spec-driven)

