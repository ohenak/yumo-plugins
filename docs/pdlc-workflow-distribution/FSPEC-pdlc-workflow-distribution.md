---
feature: pdlc-workflow-distribution
---

# FSPEC — pdlc-workflow-distribution

| Field | Value |
|---|---|
| Upstream | `REQ-pdlc-workflow-distribution.md` v17.0 (**approved, product scope**) |
| Downstream | `TSPEC-pdlc-workflow-distribution.md`, `PROPERTIES-pdlc-workflow-distribution.md` |
| REQ §10 rows disposed here | O-2, O-4, O-5, O-6, O-8, O-14, O-15 (the seven whose "Lands in" is FSPEC) |
| REQ §10 rows carried forward | O-1, O-3, O-7, O-9, O-10, O-11, O-12, O-16, O-17 → TSPEC/PROPERTIES; O-13 → `consolidate-learnings` |
| Prerequisites | BL-01, BL-03, BL-06 are **"Before FSPEC"** and are **not discharged** — see §0.3 |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | **Draft** | Claude + operator | 1.0 | 2026-07-28 |

> **Altitude.** The REQ is approved at product scope and states *observable behavior*. This FSPEC
> states *how the behavior is produced*: the component inventory, the data formats, the algorithms
> and their decision points, and the exact operator-facing strings. It does not choose bash idioms,
> test frameworks or file layouts beyond what the REQ already fixes — those are TSPEC/PLAN.
>
> Where the REQ names an obligation as downstream (§10), this document either discharges it (the
> seven FSPEC rows, §9) or restates it as a TSPEC entry obligation (§10). A reviewer finding that
> a TSPEC-bound row is unspecified here is answered by §10.

## 0. Preliminaries

### 0.1 Naming used throughout

| Term | Meaning |
|---|---|
| `<pluginRoot>` | `${CLAUDE_PLUGIN_ROOT}` in a consumer; `<repoRoot>/pdlc` in the maintainer repo (REQ AC-0.3a) |
| `<repoRoot>` | consumer repo root resolved per REQ AC-0.5 |
| **distribution manifest** | `<pluginRoot>/workflows/dist/distribution-manifest.json` — ships with the plugin, authored by the builder |
| **sync manifest** | `<repoRoot>/.claude/workflows/.pdlc-sync-manifest.json` — provenance, written only by `sync-workflows.sh` |
| **drift state** | `<repoRoot>/.claude/workflows/.pdlc-drift-state.json` — the queue's only input |
| **managed row** | one entry of the distribution manifest's `rows` |
| **entrypoint** | one of the three surfaces that can run a drift computation: `hook`, `check`, `sync` |

### 0.2 Component inventory

Seven components. The first four are new files; the rest are edits to existing ones.

| # | Component | Path | Kind | Owns |
|---|---|---|---|---|
| C1 | drift library | `pdlc/hooks/scripts/lib/pdlc-drift.sh` | bash, sourced (never executed) | baseline resolution, row classification, the drift-state writer, message formatting |
| C2 | SessionStart hook | `pdlc/hooks/scripts/check-workflow-drift.sh` | bash, executable | sources C1, warns, always exits 0 |
| C3 | sync tool | `pdlc/hooks/scripts/sync-workflows.sh` | bash, executable | sources C1, `--check` / plain / `--force`, backups, retirement, exit codes |
| C4 | fixture-free test support | *(TSPEC-owned)* | — | listed only so the inventory is exhaustive |
| C5 | builder | `pdlc/workflows/build-runtime.mjs` | ES module (node) | retargeted to `dist/`, emits the distribution manifest |
| C6 | queue workflow | `pdlc/workflows/orchestrate-queue.js` | ES module → bundle | one injected read of the drift state, AC-4.1 mapping |
| C7 | hook registration | `pdlc/hooks/hooks.json` | JSON | second `SessionStart` entry (REQ §6, BL-03) |

**C1 exists because the REQ requires it.** AC-2.7 mandates "exactly one writer routine, shared by
the hook and `sync-workflows.sh`", and AC-1.0's baseline-then-rows order plus AC-1.1's classifier
must produce identical results on all three entrypoints. A shared sourced library is the only
structure that makes "shared routine" a fact rather than a convention. C1 is **not** shipped as a
managed row (§2.2) — it ships with the plugin like any hook script and is never copied into a
consumer repo.

**Dependency direction is strictly one-way:** C2 and C3 source C1; C1 sources nothing and never
calls back into an entrypoint. C1 exposes exactly the surface in §3.1 and holds no global state
other than the documented output variables.

### 0.3 Prerequisites — status at FSPEC entry

REQ §7 gates BL-01, BL-03 and BL-06 as **"Before FSPEC"**. They are **not discharged**. This is
recorded here rather than worked around, and each is carried as an open question in §11:

| # | Claim | Status | What this FSPEC does about it |
|---|---|---|---|
| BL-01 | `${CLAUDE_PLUGIN_ROOT}` resolves in a consumer `SessionStart`, **and a nested build-output dir survives packaging** | **Not run.** REQ §0 fact 3 records the first clause measured, the second evidenced-not-measured | §7 specifies the build and packaging exactly as the REQ requires. If the spike falsifies the second clause, REQ-DIST-06's shipping path is wrong and the FSPEC's §7 must change — **OQ-1**, and it is a genuine blocker for implementation, not for this document |
| BL-03 | `hooks.json` accepts a second `SessionStart` entry | **Not run.** | §5.1 specifies the registration. If refused, C2 must be merged into `nudge-consolidation.sh`, which changes §5 only — **OQ-2** |
| BL-06 | Whether the runtime in a **linked worktree** loads `.claude/workflows/` from that worktree or the main one | **Not run.** | §2.4 implements AC-0.5's main-worktree rule as written. If per-worktree, D-DIST-07 pulls in and §2.4 changes — **OQ-3** |
| BL-04 | The runtime's injected read can read the drift state and distinguish absence | **Discharged by citation**, §6.1 | — |
| BL-02 | The plugin package contains an artifact to copy | Discharged by §7 landing (AC-6.1 + AC-6.2) | — |
| BL-05 | Which artifact the runtime resolves when `X.js` and `X.bundle.js` share a `meta.name` | Deliberately not contingent (REQ §7) | §5.4 and §6.2 specify the safe default for the unfavourable case |

## 1. Data formats

Three JSON documents and one filename grammar. All three JSON documents are read with the JSON
utility (REQ §4) and never with `grep`/`sed`. All are UTF-8, LF-terminated.

### 1.1 Distribution manifest — `<pluginRoot>/workflows/dist/distribution-manifest.json`

Emitted by C5 (AC-5.1), read by C1. Sole authority for the managed set (AC-0.1).

```json
{
  "schemaVersion": 1,
  "generatedAtUtc": "2026-07-28T00:00:00Z",
  "pluginVersion": "0.11.0",
  "rows": [
    {
      "id": "orchestrate-dev",
      "pluginPath": "workflows/dist/orchestrate-dev.bundle.js",
      "consumerPath": ".claude/workflows/orchestrate-dev.bundle.js",
      "artifactVersion": "0.11.0",
      "pluginSha1": "<sha1 of the emitted bundle>",
      "retires": [".claude/workflows/orchestrate-dev.js"]
    },
    {
      "id": "orchestrate-queue",
      "pluginPath": "workflows/dist/orchestrate-queue.bundle.js",
      "consumerPath": ".claude/workflows/orchestrate-queue.bundle.js",
      "artifactVersion": "0.11.0",
      "pluginSha1": "<sha1 of the emitted bundle>",
      "retires": [".claude/workflows/orchestrate-queue.js"]
    }
  ],
  "retired": [
    ".claude/workflows/orchestrate-dev.js",
    ".claude/workflows/orchestrate-queue.js"
  ]
}
```

**Well-formedness predicate** (all clauses; any failure ⇒ `manifest-malformed`, AC-0.1/AC-0.2):

| # | Clause |
|---|---|
| M1 | Top-level is a JSON object; `schemaVersion` is the integer `1` |
| M2 | `rows` is an array. Zero rows is **well-formed** and yields `manifest-empty`, not `manifest-malformed` (AC-1.0 lists them separately) |
| M3 | Every row is an object with exactly the six keys `id`, `pluginPath`, `consumerPath`, `artifactVersion`, `pluginSha1`, `retires` — no more, no fewer. `retires` is an array, possibly empty, **never absent** |
| M4 | `id`, `pluginPath`, `consumerPath`, `artifactVersion`, `pluginSha1` are non-empty strings; every member of `retires` is a non-empty string |
| M5 | `pluginPath` and `consumerPath` and every `retires` member are **relative** — no leading `/`, no `.` or `..` segment, no backslash, no NUL |
| M6 | Every member of the union namespace `{row ids} ∪ {basename(p) : p ∈ any retires}` matches `^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$`, and the members are **pairwise distinct** (AC-0.1; the namespace is shared with backup filenames, §5.6) |
| M7 | No path appears in two rows' `retires`; no `retires` member equals any row's `consumerPath` (AC-0.1) |
| M8 | `retired` is present and its **set** equals the union of every row's `retires` (AC-0.2). Order and duplicates are ignored in the comparison; the two disagreeing as sets is malformed |
| M9 | `pluginSha1` matches `^[0-9a-f]{40}$` |

M1–M9 are evaluated in order and the **first** failure decides; the reason is always
`manifest-malformed` regardless of which clause failed, with the failing clause id printed on
stderr for the operator (not in the drift state — the reason set is closed, AC-1.0).

**Non-clause, stated:** the manifest is *not* validated against what the plugin directory actually
contains. A row whose `pluginPath` is absent is a **row-level** `unknown`/`plugin-artifact-missing`
(AC-1.2), never a malformed manifest. This keeps a single missing bundle from blanking the whole
managed set.

### 1.2 Sync manifest — `.claude/workflows/.pdlc-sync-manifest.json`

Written only by C3 (AC-1.6), read by C1 for the `stale`/`local-edit`/`unverified` discrimination.

```json
{
  "schemaVersion": 1,
  "entries": {
    "orchestrate-dev": {
      "id": "orchestrate-dev",
      "consumerHash": "<sha1 of the bytes written into consumerPath>",
      "pluginHash": "<sha1 of the source bytes>",
      "artifactVersion": "0.11.0",
      "pluginVersion": "0.11.0",
      "syncedAtUtc": "2026-07-28T09:14:02Z"
    }
  }
}
```

Keyed by row `id` so a lookup is O(1) and cannot be confused by a `consumerPath` change between
releases. **Degradation (AC-1.6, and O-8's verbatim requirement):** absent, unreadable, or
malformed ⇒ *every* row whose bytes differ classifies `unverified`; a row whose bytes are **equal**
still classifies `in-sync`. The unreadable and malformed cases print one stderr notice (§8.3 N-4);
the absent case does not — never having synced is the ordinary first-adoption state, not a fault.
An unreadable sync manifest is deliberately **not** a baseline reason.

`consumerHash` records the bytes the sync wrote, not the bytes of the source: they are equal by
construction after a verified copy, but recording the written side is what makes `local-edit`
detection correct if a copy is ever truncated.

### 1.3 Drift state — `.claude/workflows/.pdlc-drift-state.json`

The exact schema is fixed by REQ AC-2.6 and reproduced here as the writer's contract. All three
arrays are always present.

```json
{
  "schemaVersion": 1,
  "generatedAtUtc": "2026-07-28T09:14:02Z",
  "generatedBy": "hook",
  "pluginVersion": "0.11.0",
  "checkEnabled": true,
  "baselineStatus": "resolved",
  "baselineReason": null,
  "retiredPresent": [
    { "path": ".claude/workflows/orchestrate-dev.js",
      "supersededBy": "orchestrate-dev",
      "supersedingState": "in-sync" }
  ],
  "writeFailures": [
    { "path": ".claude/workflows/orchestrate-queue.bundle.js", "operation": "artifact-copy" }
  ],
  "rows": [
    { "id": "orchestrate-dev",
      "state": "in-sync",
      "reason": null,
      "pluginHash": "<sha1>",
      "consumerHash": "<sha1>",
      "pluginArtifactVersion": "0.11.0",
      "consumerArtifactVersion": "0.11.0" }
  ]
}
```

Field rules the writer enforces:

- `generatedBy ∈ {"hook","check","sync"}` — the entrypoint, not the caller.
- `pluginVersion` is context only and is `null` when unreadable (AC-5.4). It is **always** `null`
  in the invalidation record (§4.4, O-4).
- `baselineReason` is `null` exactly when `baselineStatus == "resolved"`, else one of the eight
  closed values.
- When `baselineStatus == "unresolved"`: `rows == []` **and** `retiredPresent == []`, meaning *not
  evaluated* (AC-0.3b). `writeFailures` may still be non-empty.
- `rows` has exactly one entry per manifest row and nothing else. `not-managed` files never appear
  (AC-0.6); retired paths never appear (AC-2.6) — they travel in `retiredPresent`.
- `reason` is `null` on every state except `unknown`.
- `pluginHash` / `consumerHash` are `null` when not computed (unreadable side, or no hash tool).
- Hashes and versions are reporting-only. **No consumer of this file may derive a state from them**
  — the state is already decided.

### 1.4 Backup filename grammar

`.claude/workflows/.pdlc-backups/{id}.{YYYYMMDDTHHMMSSZ}[-N].bak` (AC-3.4).

```
backup   ::= id "." stamp [ "-" N ] ".bak"
id       ::= ^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$      (the union namespace, M6)
stamp    ::= YYYY MM DD "T" HH MM SS "Z"            (UTC, fixed width, 16 chars)
N        ::= 2 | 3 | …                              (same-second collision, ascending, never reused)
```

The stamp is fixed-width so `LC_ALL=C` lexicographic descending sort **is** reverse-chronological
(AC-3.4). Because `id` may itself contain `.` and `-`, the id is recovered by **anchoring on the
stamp**, not by splitting on the first `.`: the pattern is matched right-to-left from `.bak`, and
everything left of the stamp is the id. Retention prunes to the newest 5 **per id** and never
touches a file that does not match this pattern for a *currently known* id — a stray file in the
backup directory is left alone forever.

## 2. Baseline resolution (FSPEC-DIST-01)

**Linked requirements:** AC-0.1, AC-0.2, AC-0.3, AC-0.3a, AC-0.3b, AC-0.4, AC-0.5, AC-1.0, and
§4's tool declarations.

Baseline resolution runs first on every entrypoint and produces either
`baselineStatus=resolved` plus a managed set, or `baselineStatus=unresolved` plus exactly one
reason. **No row is classified and nothing is created on disk until it completes** (AC-1.0,
AC-2.9(1)).

### 2.1 Behavioral flow

```
B1  resolve consumer repo root          → fail: repo-root-unresolved  (no write target; stop)
B2  probe JSON utility                  → fail: json-tool-absent
B3  resolve <pluginRoot>                → fail: plugin-root-unset | plugin-root-unreadable
B4  read distribution manifest bytes    → fail: manifest-absent | plugin-root-unreadable
B5  parse + validate (M1..M9)           → fail: manifest-malformed
B6  rows empty?                         → yes:  manifest-empty
B7  resolve checkEnabled                → never fails (fail-closed true)
    ⇒ baselineStatus = resolved, managed set = rows
```

B1 precedes B2 because `repo-root-unresolved` is the one state with **no write target at all** —
there is nowhere to record anything, so probing tools first would be work with no destination.

### 2.2 B1 — consumer repo root (AC-0.5)

```
if git is on PATH and `git rev-parse --git-dir` succeeds:
    candidate := work-tree path of the FIRST record of `git worktree list --porcelain`
    accept iff:  candidate is not bare
             and candidate is traversable
             and `git -C candidate rev-parse --show-toplevel` agrees with candidate
    if any check fails → repo-root-unresolved        # step 3, NEVER the walk
else:
    walk upward from $PWD to the nearest ancestor containing `.claude/`,
    stopping before $HOME and before /
    not found → repo-root-unresolved

finally, whichever step produced it:
    if resolved == $HOME or resolved == / → repo-root-unresolved
```

Three points the REQ makes load-bearing and the implementation must not soften:

1. **"If step 1 applies and any check fails, the result is step 3 — never the walk."** A git work
   tree whose main-worktree probe fails does **not** fall through to the upward walk. A wrong root
   is worse than a refusal, because a wrong root is a write target.
2. The `$HOME` / `/` rejection is applied **after** either step, not inside step 2's stopping
   condition alone. `~/.claude/` exists on every machine running Claude Code; no operation in this
   feature may ever write under `$HOME/.claude/`.
3. `git worktree list --porcelain` is why §4 declares `git ≥ 2.7.0`. Paths are compared after
   `realpath`-style normalisation so a symlinked `$HOME` does not defeat clause 2.

Linked worktrees of one clone therefore share one `.claude/workflows/`, one sync manifest, one
drift state (D-DIST-07, and **OQ-3**/BL-06).

### 2.3 B2 — JSON utility

The three shipped hook scripts already share a Python-interpreter discovery loop (REQ §0 fact 9);
C1 reuses it verbatim rather than inventing a second one (NFR-5).

The JSON read is a **dedicated four-outcome helper**, not a bare `python -c` (REQ §4):

| Outcome | Exit | Meaning |
|---|---|---|
| parsed | `0` | value printed on stdout |
| unreadable | `10` | path exists but could not be opened/read |
| absent | `11` | path does not exist |
| malformed | `12` | read succeeded, JSON parse failed |

`10`–`12` sit outside CPython's own `1`/`2` and outside the script's `0`–`4` exit space, so an
interpreter crash is never mistaken for a data verdict. The helper catches named exceptions only —
**never a bare `except`** — so an interpreter-level fault surfaces as CPython's exit, which the
caller treats as "no usable JSON tool".

No interpreter found ⇒ `json-tool-absent`, a **baseline** reason: without JSON there is no manifest,
hence no managed set. This is the whole-run degradation NFR-5 contrasts with the hash tool's
row-level one.

### 2.4 B3 — `<pluginRoot>` (AC-0.3, AC-0.3a, AC-0.4)

```
if <repoRoot>/pdlc/workflows/build-runtime.mjs exists:      # the maintainer marker
    <pluginRoot> := <repoRoot>/pdlc
    ${CLAUDE_PLUGIN_ROOT} is NOT consulted; its being unset is not an error
else:
    <pluginRoot> := ${CLAUDE_PLUGIN_ROOT}, used verbatim
    unset or empty            → plugin-root-unset
    set but not traversable   → plugin-root-unreadable
```

The maintainer branch is checked **first** so that a maintainer who happens to have the plugin
installed still gets their working tree as the baseline — otherwise their own repo would report
every row stale-or-worse forever and block the queue on itself (AC-0.3a rationale).

`${CLAUDE_PLUGIN_ROOT}` is used **verbatim**. C1 contains no code that enumerates, sorts, or
version-compares `~/.claude/plugins/cache/**` — REQ §0 fact 7 measured two concurrently cached
versions, and picking between them is exactly the bug AC-0.4 forbids.

The maintainer marker is `build-runtime.mjs` rather than, say, `.claude-plugin/` because the marker
must be a file only the *source* tree has; a packaged plugin ships `.claude-plugin/` too.

### 2.5 B4/B5 — manifest load

Read via the JSON helper (§2.3), **never** via the hash utility — AC-0.4 is explicit that
hash-tool absence is a row-level reason and never a baseline one.

| Helper outcome | Baseline reason |
|---|---|
| absent (`11`) | `manifest-absent` |
| unreadable (`10`) | `plugin-root-unreadable` |
| malformed (`12`), or any M1–M9 failure | `manifest-malformed` |

`manifest-absent` maps to AC-0.3b — **every** consumer at first release. Its remediation on every
surface is **update the plugin**, never `sync-workflows.sh`: syncing cannot create a manifest that
the installed plugin does not ship. The `checkEnabled` escape stays reachable because B7 runs on
the unresolved path too (§2.7).

### 2.6 B6 — `manifest-empty`

A parsed manifest with zero rows is well-formed but yields `baselineStatus: unresolved`, reason
`manifest-empty`. Rationale, stated by AC-1.0: a size-zero managed set satisfies every universal
claim ("all rows in-sync") vacuously, so treating it as resolved would turn an empty manifest into
a silent green.

### 2.7 B7 — `checkEnabled` (AC-4.3)

Resolved by the **shell writer**, never by the queue (one-read rule, NFR-1), and recorded in the
drift state.

| Read of `.claude/pdlc.config.json` | `checkEnabled` |
|---|---|
| parsed, `distribution.checkEnabled` present and boolean | that boolean |
| parsed, key absent | `true` |
| file absent | `true` |
| unreadable or malformed | `true` + one verbatim stderr notice (§8.3 N-5) |
| present but not a boolean (string `"false"`, number, null) | `true` + the same notice |

Fail-closed to `true` in every degraded case. B7 runs on **both** the resolved and unresolved
paths, and on the invalidation record (§4.4) — this is what AC-2.9(3) means by "the record
preserves `checkEnabled`", and it is why a permanently-unwritable consumer can still opt out.

### 2.8 Baseline reason precedence (AC-1.0, §4)

When several conditions hold, one reason is reported, by this declared precedence — highest first,
the reverse of §4's listing order:

```
drift-state-invalidated
  > manifest-empty > json-tool-absent > manifest-malformed > manifest-absent
  > repo-root-unresolved > plugin-root-unreadable > plugin-root-unset
```

`drift-state-invalidated` is highest because it is written by the drift-state writer *about this
run's own failure* — "nothing in this file measures this run" dominates any statement the file
would otherwise carry. It is the only reason not produced by the B1–B6 ladder; the flow's natural
short-circuit order already realises the rest, and the precedence is stated so the ladder is not
free to be reordered.

### 2.9 Edge cases

| Case | Behavior |
|---|---|
| `$PWD` deleted underneath the process | `git rev-parse` fails, walk cannot start ⇒ `repo-root-unresolved` |
| `<repoRoot>` resolves but `.claude/` absent | Not a baseline failure. Rows classify `missing` (AC-3.8) and the run creates the directory *after* classifying (§4.2) |
| `${CLAUDE_PLUGIN_ROOT}` set to a **file** | not traversable ⇒ `plugin-root-unreadable` |
| Manifest readable, one `pluginPath` absent | baseline **resolved**; that row is `unknown`/`plugin-artifact-missing` (§3.4) |
| Maintainer marker present **and** `${CLAUDE_PLUGIN_ROOT}` set to some other plugin | marker wins; the env var is not consulted (AC-0.3a) |
| Manifest has 2 rows with the same `id` | M6 pairwise-distinct fails ⇒ `manifest-malformed` |
| `retired` array present but empty while a row has non-empty `retires` | M8 set-equality fails ⇒ `manifest-malformed` |
