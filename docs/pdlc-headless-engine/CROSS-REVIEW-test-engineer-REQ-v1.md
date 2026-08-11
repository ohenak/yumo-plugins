# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-headless-engine/REQ-pdlc-headless-engine.md (v0.4)
**Date:** 2026-08-11
**Iteration:** 1
**Scope:** Testing lens — testability of acceptance criteria, oracle falsifiability, edge-case and enumeration completeness, verification strategy.

## Grounding performed

Every code citation in §1.2 was checked against HEAD rather than taken on trust. All of them
are accurate:

| REQ claim | Verified at HEAD |
|---|---|
| `agent()` throws outside the runtime (`orchestrate-dev.js:8458`) | `orchestrate-dev.js:8458` — `throw new Error("agent() not available outside Claude Code runtime")` |
| `parallel` / `pipeline` / `phase` have plain-Node bodies (`:8464`, `:8469`, `:8474`) | exact lines; `parallel` → `Promise.all`, `pipeline` → `fn()`, `phase` → no-op |
| `defaultReadFile` → `fs.readFileSync` (`:8492`) | exact line |
| `execSync` by dynamic import (`:7680`, `:10754`) | `checkPrCi` and `mergeWorktree`, exact lines |
| `orchestrate-queue.js:948` fs-backed defaults | exact line, `defaultReadFile` via `await import("fs")` |
| `runtime-adapter.js:47` `rtSkillPrompt` emits `"pdlc:{skill}"` | exact line |
| `runtime-adapter.js` is 53,056 bytes | `wc -c` → 53056 |
| 17 skill prompt files = 15 `SKILL.md` + 2 supplements | `ls pdlc/skills` → 15 dirs; `ls pdlc/skills/*/SKILL*.md` → 17 |
| `dist/pdlc-cli.mjs` is an existing plain-Node artifact | present in `pdlc/workflows/dist/` |
| DC-01, DC-02 exist as cited | `docs/_constraints/DOMAIN-CONSTRAINTS.md:20`, `:48` |
| `_sessionAgent` is a real seam | `orchestrate-dev.js:5497`–`5567` |

One material piece of HEAD state the REQ does **not** mention: a substantial engine
implementation is already committed — `pdlc/engine/{bin,lib,__tests__}` (7 lib modules, 9 test
files, `pdlcPluginCompat: "^0.22.0"` in `package.json`), landed across commits `059750de`
(P1 SDK transport), `2ed13815` (P2 handshake), `054d5292` (P3 wiring), `d0d2288b` (P4
retries/report), `f6f8029a`. See F-07.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **Every testable transport mechanic still names `claude -p`, which §1.3 demoted to fallback.** C-2 ("every spawned `claude` process inherits the parent environment"), C-5/AC-5.1 ("enforced via per-dispatch hook/settings configuration passed to `claude -p`"), AC-2.3 ("the child process environment contains both"), AC-6.1 ("fails if a test path would spawn a real `claude` process") and AC-6.3 ("recorded fixtures of real **CLI** output") each specify an oracle that only exists on the fallback path. On the primary SDK path there is no `claude -p` argv, no engine-passed `--settings`, and the env contract is an options field, not a child-process environment (`pdlc/engine/lib/transport.mjs:157-160` spreads `env` into `options.env`). As written, none of these five ACs can be turned into a passing-or-failing test of the transport that actually runs. Restate each oracle transport-neutrally, and state the obligation for **both** transports where both must satisfy it. | C-2, C-5, AC-2.3, AC-5.1, AC-6.1, AC-6.3 |
| F-02 | High | Local | **AC-2.4 has no observable oracle.** "setting one does not change which account is billed" is not observable from the engine, the CLI, or any artifact — no test can be written for it, and the clause "neither reads nor requires `ANTHROPIC_API_KEY`" is absence-only. §1.3 already names the falsifiable proxy: the SDK-reported `apiKeySource` stays exactly `"none"` with a key present. Restate AC-2.4 as a positive assertion on that observable (`apiKeySource == "none"` **and** the dispatch completes), so the negative ("no key was needed") is paired with a positive on the same path. | AC-2.4 |
| F-03 | High | Local | **Two incompatible closed sets describe the same auth fact, with no mapping.** AC-2.1 requires the banner to name the auth source from `{logged-in session, OAuth token, API key}`; C-1's mechanical form makes the tested value the SDK's `apiKeySource` (`"none"` vs anything else). A test observing `apiKeySource: "none"` cannot derive which of AC-2.1's three strings is the expected banner text without inventing the mapping — and a test that derives it by reading engine code is an implementation echo. Give the total mapping in the REQ as a literal table (`apiKeySource` value → banner catalogue id), so the expected string is transcribed from the spec, and state the outcome for an unrecognised source value. | AC-2.1, C-1 |
| F-04 | High | Local | **AC-3.3 forces the model-forwarding test to echo the implementation.** "every model value the modules currently name" is not enumerated anywhere in the REQ, so the only way to build the expected phase→model map is to import the modules' own constants — precisely the derivation an oracle must not do. HEAD names four: `MODEL_DEFAULT = "opus"` (`orchestrate-dev.js:1603`), `MODEL_IMPLEMENTATION = "sonnet"` (`:1646`), `MODEL_ADVISORY_FALLBACK = "opus"` (`:1653`), `MODEL_QUEUE = "sonnet"` (`orchestrate-queue.js:70`). Transcribe the expected map as literals in the AC, and make the check **set-equality** over the dispatch set (every dispatch's model appears in the map, and every map row is exercised) so a phase that silently stops pinning a model fails the test. Note this cuts against C-7's "the engine knows no model names" only for the *test fixture*, not the engine. | AC-3.3, C-7 |
| F-05 | High | Local | **AC-4.1's taxonomy is self-contradictory: "a closed, documented taxonomy — at minimum: …".** A catalogue that is closed is testable by set-equality against the enumeration; a catalogue that is open ("at minimum") admits any additional member, so the completeness half of the AC cannot fail. Pick one: either the six named members are the whole catalogue (then say "exactly", and the test asserts set-equality over classifier outputs), or extension is permitted (then say how a new member is registered and what the closed part is). As written, the classifier's total-function claim in the same AC is untestable at the boundary. | AC-4.1 |
| F-06 | High | Local | **AC-3.1 is a containment check over the skill catalogue where set-equality is needed.** "a dispatch for any of the 17 skill prompts" passes with 16 covered, and the number 17 is a literal that will silently go stale: skill resolution at HEAD is string→path derivation (`pdlc/engine/lib/skills.mjs:267-282` `skillFilePath`), with no enumeration and no existence check ahead of dispatch, so a renamed, added or missing `SKILL.md` is discovered only when the phase that needs it dispatches — mid-run, after hours of pipeline work. Add an AC asserting set-equality between the skill identifiers the modules can dispatch and the `SKILL*.md` files present in the installed plugin, evaluated at **startup** alongside the C-10 handshake, failing closed with the missing identifiers named. | AC-3.1, G-5, C-10 |
| F-07 | High | Local | **The REQ states no HEAD baseline although the engine is already implemented, so no AC can distinguish new behaviour from committed behaviour — or catch its regression.** `pdlc/engine/` is tracked at HEAD with 7 lib modules and 9 test files (commits `059750de`…`f6f8029a`); §1.2's "three measured facts" and every AC read as greenfield, and NG-2 says only that the engine "is run from a checkout of this repo". A test engineer deriving AC-1.1 cannot tell whether they are writing a new failing test (TDD red) or re-asserting a green one — the two demand different work. Add a short "state at HEAD" subsection to §1.2 recording which ACs are already satisfied by the committed engine and which are open, with the commit that satisfied each; then every remaining AC has an honest red-first path. | §1.2, NG-2, AC-1.1 |
| F-08 | High | Local | **AC-1.1's headline oracle — "the same artifact set as the workflow-runtime path produces for the same inputs" — is not derivable.** Two pipeline runs dispatch non-deterministic model calls, so "same" cannot mean byte-equality of document bodies, and the REQ does not say what it does mean. It also requires running the workflow-runtime path as a comparison arm, which AC-6.1 forbids in CI (no live model calls) and NG-7 discourages. State the comparison as a set-equality over **structural** observables the pipeline already defines: the set of artifact filenames produced under `docs/{f}/`, each cross-review carrying a parseable `VERDICT:` line and counts JSON, the approval anchors, the queue row value, and the named run-report fields — with the expected sets transcribed in the AC rather than obtained by running the other host. | AC-1.1 |
| F-09 | Medium | Local | **AC-1.2's central assertion is absence-only.** "no path under the consumer's `.claude/workflows/` is opened" passes vacuously on a run that opened nothing at all — e.g. a startup refusal, or a dispatch loop that never resolved a skill. The AC's second clause bounds *where* reads may come from (containment) but never asserts a read positively happened. Pair it: on the same observed run, at least one read of `{pluginRoot}/skills/{skill}/SKILL.md` **and** at least one read of the consumer's `docs/{f}/REQ-{f}.md` are observed, and the `.claude/workflows/` set is empty. | AC-1.2 |
| F-10 | Medium | Local | **AC-4.2 leaves the timeout/retry budget interaction underived.** A `timeout` is "treated as retryable once, then terminal" while `dispatch.retryAttempts` is 3 — is the timeout's single retry drawn from that budget, added to it, or does a timeout reset it? The three readings give different attempt counts on the same fixture, so the test cannot assert a number. State the total attempt count for each of: 3 consecutive `retryable`, 1 `timeout`, `retryable` then `timeout`, `timeout` then `retryable`. | AC-4.2, §4.1 |
| F-11 | Medium | Local | **C-8 is a hard constraint with no acceptance criterion.** "Every operator-visible string is a registered catalogue entry asserted by id" and "every value the engine parses is read by a total function" are exactly the claims that need a set-equality test (catalogue ids emitted == catalogue ids registered) and a defined-outcome test for malformed input — but no AC in §5 references C-8, so nothing obliges either test to exist. Add one, including the malformed-input outcome for each parsed value (F-03's unrecognised `apiKeySource` is one instance). | C-8, §5 |
| F-12 | Medium | Local | **AC-1.5's anti-fork oracle is unspecified and, as phrased, unfalsifiable.** "asserts that the workflow modules it loads are this repo's tested sources and not a vendored or edited copy" — "not edited" cannot be tested without a reference to compare against. Name the observable: e.g. the resolved module specifier is the repo-relative path under `pdlc/workflows/`, and no second copy of `orchestrate-dev.js` exists under the engine tree. This keeps the AC black-box while making failure reachable. | AC-1.5, C-4 |
| F-13 | Medium | Local | **AC-6.1's hermeticity gate has no stated detection mechanism.** "fails if a test path *would* spawn a real `claude` process" describes a counterfactual; a test can only observe what a run did. State the observable — e.g. the suite runs with the transport seam injected and a guard that fails on any attempt to construct the real transport, plus an assertion that no outbound network connection is attempted — otherwise the strongest safety property in §5 is the one with no derivable test. | AC-6.1 |
| F-14 | Medium | Local | **AC-4.3's "does not leave an orphan `claude` child" needs a positive counterpart.** As written it is an absence assertion over an unbounded space. Pair it with a positive: after the run ends, the set of child processes the engine started is empty **and** the halt artifacts (POSTMORTEM, `halted` queue row, its pathspec-scoped commit) are present — the second half is what proves the process stayed alive long enough to record the halt. | AC-4.3 |
| F-15 | Low | Local | **R-3 cites the wrong section.** "§1.1's auth facts are policy, not physics" — §1.1 is the user-story table; the auth facts are in §1.3. | R-3 |
| F-16 | Low | Local | **`queue.loopIdleExit` is not a threshold.** §4.1 declares itself the register of tunables ("No AC may depend on a tunable that is not listed here") but this row's "default" is a behaviour ("exit 0 when no ready row remains"), with no value to tune. Either give it a value or move the behaviour into AC-1.3 and drop the row, so the table stays a clean set of tunables a test can enumerate. | §4.1, AC-1.3 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Is the fallback `claude -p` transport in scope for *this* REQ's ACs, or is it declared-but-unbuilt? F-01's fix differs: if in scope, each transport-neutral AC needs a both-transports clause and AC-6.3 needs two fixture sets; if not, say so in NG-6 and the fallback's ACs become obligations. |
| Q-02 | AC-6.2's live smoke "drives one real, small feature end-to-end against a scratch repo and asserts the artifact set of AC-1.1" — if AC-1.1's oracle becomes structural (F-08), does the smoke assert the same structural set, or something stronger that only a live run can see (e.g. real verdict convergence)? |
| Q-03 | Does the C-10 handshake's compatible range live in one place a test can read as data? `pdlc/engine/package.json` carries `pdlcPluginCompat: "^0.22.0"` at HEAD; the REQ says "the engine declares a compatible range" without naming where, so the AC-3.2 test cannot transcribe the expected range literal. |
| Q-04 | AC-4.5 requires "per-phase dispatch counts" in the run report. Is the expected count per phase derivable from the spec for a given fixture run, or only observable? If only observable, the field is reportable but not assertable, and the AC should say which. |

## Positive Observations

- §1.2's "three measured facts" are exemplary REQ grounding: every one of the eleven code
  citations I checked resolves to the exact line claimed, including the byte count
  (`runtime-adapter.js` = 53,056 bytes exactly) and the skill-file arithmetic (15 + 2 = 17).
  This is the standard DC-02 is asking for, and it made this review's verification cheap.
- AC-4.5's "A run with zero retries carries an **empty set** of such rows, not a missing field"
  is exactly the distinction that stops a report-shape test from passing vacuously. More ACs in
  this document would benefit from that sentence's discipline.
- AC-5.1/AC-5.2 are a properly paired guard test: refusal without `LEARNINGS-{f}.md`, success
  with it, so the guard is proven not to be a blanket ban. AC-5.1's "asserted independently of
  the plugin's own hook wiring" also names the false-green it is defending against.
- §1.3's `apiKeySource` tripwire is a genuinely falsifiable auth oracle — a specific value from
  a specific message, failing closed on anything else — and the policy-risk caveat honestly
  records that the spike shows *that* subscription auth works, not *why*.
- §4.1's rule that no AC may depend on an unlisted tunable is a good structural constraint, and
  the note that the retry defaults are "a starting point, not a measured floor" with O-7 owning
  the re-derivation prevents an invented number from hardening into a tested constant.
- AC-4.1's "unrecognised output classifies as `transport-contract-violation`, never as success"
  is the right default direction for a parser at a trust boundary.

## Recommendation

**Needs revision**

The document's grounding is strong and its verification intent (C-8, C-9, AC-6.1/6.2/6.3) is
better than most REQs reach. The blocking gap is that §1.3's transport swap did not propagate
into the ACs' oracles: the mechanics that make the criteria testable still describe the
fallback transport (F-01), and several headline criteria — the parity oracle (F-08), the
billing oracle (F-02), the banner mapping (F-03), the model map (F-04), the failure taxonomy
(F-05) and the skill catalogue (F-06) — cannot yet be turned into a test that could fail. F-07
compounds this: with the engine already committed, ACs that cannot fail cannot protect it
either. Resolving the eight High findings makes every criterion in §5 derivable without asking
a further question.

## Verdict

VERDICT: Needs revision
{"high": 8, "medium": 6, "low": 2}

