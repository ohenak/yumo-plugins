---
feature: pdlc-engine-distribution
---

# FSPEC — pdlc-engine-distribution

| Field | Value |
|---|---|
| Upstream | `docs/pdlc-engine-distribution/REQ-pdlc-engine-distribution.md` (v0.9, approved round 4); `docs/_decisions/DECISIONS-plugin-distribution.md` (DEC-DIST-05); `docs/_constraints/pdlc-engine-baseline.md` (M-ENG-10…M-ENG-13) |
| Downstream | TSPEC, PLAN, PROPERTIES for this feature; `pdlc-plugin-retirement` |
| Cross-Reviews | `CROSS-REVIEW-{software-engineer,test-engineer}-FSPEC-v{N}.md` |
| LEARNINGS | `docs/pdlc-engine-distribution/LEARNINGS-pdlc-engine-distribution.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | Draft | Claude | 0.1 | 2026-08-13 |

**FSPEC ID:** `FSPEC-EDIST-01`

## 1. Purpose and scope

This FSPEC specifies the **observable behaviour** of the four things REQ-EDIST-01…06 ask for:
the compat handshake a run performs before it dispatches, the install/upgrade lifecycle on an
operator machine, the tag-driven publish pipeline, and the provenance a run leaves behind in a
consumer repo. It also carries the two **expected sets** the REQ deliberately parked here rather
than in a measurement file (§5): the required-check set (T-7) and the packed-content set (AC-1.3).

**Altitude.** Behaviour, decision points, business rules, expected sets, error text obligations.
Not here, and owned by the TSPEC: package layout, manifest schema beyond the fields the REQ
already fixed, flag and field names, module boundaries, workflow YAML, and every carrier decision
parked at O-9 and O-10. Where a rule below says "the run states X", it fixes *that X is stated and
is machine-checkable*, not the string.

**Two sources of behaviour, one product.** The engine executes the canonical workflow modules;
the prompts it dispatches are read from the **installed plugin** at dispatch time. Every flow here
treats the plugin as an external, versioned input that may be absent, present-and-compatible, or
present-and-incompatible — three states, never two.

**Grounded at HEAD.** Every claim below about shipped behaviour is either cited to a measured fact
(`M-ENG-*`) or to a symbol in the tree. Where this FSPEC describes behaviour that does **not**
exist yet, it says so in the flow that needs it and names the obligation that owns it.

## 2. Linked requirements

| Flow | Requirement | Criteria covered | User stories |
|---|---|---|---|
| **F-1** Compat handshake and version query | REQ-EDIST-01 | AC-1.1, AC-1.2, AC-1.4 | US-01, US-02 |
| **F-2** Install on a clean machine | REQ-EDIST-02 | AC-2.1, AC-2.3 (install leg), AC-2.4 | US-01 |
| **F-3** Upgrade, and the zero-per-project promise | REQ-EDIST-02 | AC-2.2, AC-2.3 (upgrade leg), AC-2.5 | US-02 |
| **F-4** Version resolution: pin, latest, dev-mode | REQ-EDIST-05 | AC-5.1…AC-5.6 | US-05, US-06 |
| **F-5** Tag-driven publish | REQ-EDIST-03 | AC-3.1…AC-3.7, AC-1.5 | US-03 |
| **F-6** Provenance emission into consumer artifacts | REQ-EDIST-04 | AC-4.1…AC-4.5 | US-04 |
| **F-7** Coexistence and non-regression of the bundle path | REQ-EDIST-06 | AC-6.1, AC-6.2 | US-02 |
| §5.1 Expected required-check set | REQ-EDIST-03 | AC-3.4, T-7, C-5 | US-03 |
| §5.2 Expected packed-content set | REQ-EDIST-01 | AC-1.3 | US-01 |

Every acceptance criterion of the REQ appears in exactly one row above; a criterion added to the
REQ without a row here is a defect in this table, not a gap for a reader to resolve.

**Values read, never re-declared.** T-1a, T-1b, T-2…T-7 are the REQ's; this document cites them
by id. Where a flow needs a value the REQ did not declare, it is raised in §9, not invented here.

## 3. Behavioral flows

Each flow is stated as steps with explicit decision points. A step that describes behaviour not
present at HEAD is marked **[new]**; one that describes shipped behaviour is marked **[shipped]**
with its symbol, so a reviewer can check the claim in one pass.

### F-1 — Compat handshake and version query *(AC-1.1, AC-1.2, AC-1.4)*

Every pipeline command performs the handshake **before** any dispatch, and never partially: no
prompt is read, no agent is started, nothing is written until the handshake resolves.

1. Resolve the **engine version** (T-1a) from the running package. Always succeeds; if it cannot,
   that is a corrupt install and the run refuses under BR-1.6.
2. Resolve the **declared compatible-plugin range** (T-3, `pdlcPluginCompat`). **[shipped]**
   `pdlc/engine/lib/handshake.mjs` — `satisfiesRange`.
3. Resolve the **plugin root** in the precedence order of F-4, then read the installed plugin's
   version (T-1b). **[shipped]** `skills.mjs` — `resolvePluginRoot`; `handshake.mjs` —
   `readPluginVersion`, which distinguishes *absent* from *unreadable* (BR-1.3).
4. **Decision point — three outcomes, never two:**
   - **No plugin found** → refuse, naming the declared range and stating that none is installed.
   - **Plugin found, version outside the range** → refuse, naming the declared range *and* the
     version found.
   - **Plugin found, version inside the range** → proceed; prompts are read from that plugin's
     `skills/` tree **at dispatch time**, never from bytes inside the engine package (AC-1.2), and
     §5.2 makes that structurally true by containing no skills files to read.
5. On either refusal the run exits non-zero, dispatches nothing, and writes nothing into the
   consumer project. **[shipped]** `handshake.mjs` — `checkCompat` and its `REMEDY` text.
6. **The diagnostic command sits outside the gate** (AC-1.1). The command whose job is to explain
   a refusal still runs when the handshake fails, and reports the same triple as step 7. Any other
   pipeline command is gated. Which command is the diagnostic is fixed by the TSPEC; that exactly
   one class of command is exempt, and that it is the diagnostic, is fixed here.
7. **The version triple.** The version query reports, in one output: engine version (T-1a), the
   declared range (T-3), and the installed plugin's version *or* the explicit statement that none
   is installed. The same triple appears in the startup banner and in every run report (F-6), from
   one resolution per run — not three independent resolutions that can disagree (BR-1.5).

### F-2 — Install on a clean machine *(AC-2.1, AC-2.3 install leg, AC-2.4)*

1. The operator reads the install command from **one place**: `pdlc/README.md`'s
   `## Install in another repo` section, which today documents the plugin install and gains the
   engine install command under it. No other file is a transcription source (AC-2.1). Any second
   copy of the command anywhere in the repo is a defect, not a convenience.
2. They run it once, on a machine with Node ≥ T-2 and nothing pdlc-related installed.
3. **Decision point — Node floor.** If Node is below T-2 the attempt fails with a message naming
   the required floor and the version found: no stack trace, no partial install, nothing left
   half-written (AC-2.4).
4. On success the CLI resolves on `PATH`, from an install location that exists, at the version the
   command asked for.
5. The operator invokes a pipeline command. With no plugin installed, F-1 step 4 refuses naming
   the declared range. **That refusal is the pass condition** on a plugin-free machine: install is
   proven by *reaching the handshake*, not by dispatching (AC-2.1).
6. No second command, manual step, repo clone, or per-project action is required at any point.

### F-3 — Upgrade, and the zero-per-project promise *(AC-2.2, AC-2.3 upgrade leg, AC-2.5)*

1. Record, before the upgrade: the resolved CLI version and the install location.
2. Run the documented upgrade command once, **on the machine** — never inside a consumer project.
3. Invoke the pipeline in each of two consumer repos that had previously completed a run at the
   old version. Each run executes the new version, observable **both** in the run's own output and
   in the artifacts it writes (F-6).
4. **No command is executed inside either repo** other than the pipeline invocation itself: no
   sync, no copy, no drift check, no config edit.
5. **Non-interference, checked on the same run** (C-2, AC-2.3): the consumer repo's working tree
   and index are unchanged by install and by upgrade — no file created, modified or deleted
   anywhere under the project, in particular nothing under `.claude/`. Consumer-owned config is
   *read* (F-4 step 2) and never written; reading is not writing (NG-6 forbids only the latter).
6. **Positive halves differ by leg, deliberately.** A clean-machine install has no before-value to
   differ from, so its positive is "resolves on `PATH`, at the expected version, from an install
   location that exists". The upgrade's positive is a *change*: resolved version and install
   location differ from the values recorded at step 1 — the observation that proves the upgrade
   was not a silent no-op.
7. **Coexistence** (AC-2.5): with the plugin also installed and in use interactively, both paths
   work positively on the same run — the engine reaches dispatch, an interactive plugin session
   invokes a skill — and neither install path modifies the other's files.

### F-4 — Version resolution: pin, latest, dev-mode *(AC-5.1…AC-5.6)*

Resolution is a **total, ordered** decision: exactly one branch is taken per run, and the branch
taken is announced in the run's own output. Silence is never a permitted outcome.

1. **Dev-mode declaration present** (explicit, per-invocation, T-6) → the checkout's engine and
   the checkout's prompts execute. Dev-mode is the **conjunction** of running the checkout's
   engine *and* pointing the plugin-root selector at the checkout's `pdlc/` (O-5); one without the
   other is not dev-mode and must not be reported as such. The run's dev-mode mark is written to
   exactly the artifact kinds enumerated at §5.3. **[new]** — nothing marks such a run today
   (M-ENG-13).
2. **No dev-mode declaration, project pin present** → the pinned version executes. The pin is read
   from the `engine.*` namespace of the consumer-owned `.claude/pdlc.config.json` (O-2, grounded
   in DEC-HE-02) and never written by the engine. The run announces the pin, naming the version.
   - **Pinned version not installed** → refuse, naming the pinned version and what is installed.
     Never a silent fallback to latest (AC-5.5).
3. **No dev-mode declaration, no pin** → the latest installed version executes and the run says
   so. **The absence of a pin is announced as loudly as its presence** (AC-5.2): "no pin; latest
   installed" is an emitted statement, not the absence of one.
4. **A checkout merely existing on the machine changes nothing** (AC-5.4): with no dev-mode
   declaration, the installed released version executes. Dev-mode is never inferred from cwd, from
   an environment variable's presence, or from a checkout being nearby (T-6).
5. **The shipped environment override is a conflict, and is resolved loudly** (AC-5.6). Today
   `PDLC_PLUGIN_ROOT` is honoured on presence alone. **[shipped]** `skills.mjs` — `PLUGIN_ROOT_ENV`
   and `resolvePluginRoot`. With the variable exported and no per-invocation dev-mode declaration,
   the run takes exactly one of two branches — refuse naming the exported variable, or execute the
   released version and state that the variable was ignored. **[new]** Which branch is the TSPEC's
   to fix; that one of them happens, loudly, and that neither is a silent switch of skill source,
   is fixed here.
6. **The "newer version exists" notice is a probe behind an injectable seam** (AC-5.1), never an
   unconditional network call. When the probe is unavailable — offline, CI, registry down — the
   run states that it could not check and proceeds. It never fails, never blocks, and never
   fetches or applies a version (NG-3). The seam exists so the pin assertion is testable without a
   network and so NG-3's boundary is testable by stubbing.

## 4. Business rules

## 5. Expected sets owned by this FSPEC

## 6. Input / output

## 7. Edge cases and error scenarios

## 8. Acceptance tests

## 9. Open questions
