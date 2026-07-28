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

## 3. Row classification (FSPEC-DIST-02)

**Linked requirements:** AC-1.1, AC-1.2, AC-1.3, AC-1.4, AC-1.5, AC-1.6, AC-1.7, AC-1.8, AC-0.6.

Runs once per managed row, only under a resolved baseline, against the filesystem **as found** —
before this run creates anything (AC-2.9(1)).

### 3.1 C1's classifier surface

```
classify_row(rowId, pluginPath, consumerPath) -> (state, reason, pluginHash, consumerHash,
                                                  pluginArtifactVersion, consumerArtifactVersion)
```

Pure with respect to the filesystem: it reads, it never writes, and it never spawns a process other
than the declared hash utility. Rows are independent (AC-1.4) — no row's outcome is an input to
another's, and the loop has no early exit.

### 3.2 Probes

Six probes, each with a three-valued outcome (`yes` / `no` / `indeterminate`). "Indeterminate" is
what produces `unknown`, and keeping it distinct from "no" is the whole of AC-1.1's `missing`
caveat.

| # | Probe | `indeterminate` when |
|---|---|---|
| P1 | plugin artifact exists | its first existing ancestor is not traversable |
| P2 | plugin artifact readable | — (open failure is a definite `no`) |
| P3 | consumer artifact exists | its first existing ancestor is not traversable |
| P4 | consumer artifact readable | — |
| P5 | sha1 of a readable file | hash utility absent |
| P6 | sync-manifest entry for `rowId` | manifest unreadable/malformed ⇒ treated as **no entry**, §1.2 |

**The definite-negative rule (AC-1.1).** `missing` is the one non-`unknown` state that sync
overwrites *without a backup*, so it demands a **definite** negative: the path is absent **and its
first existing ancestor is traversable**. An absent path behind an untraversable ancestor is
`unknown`, not `missing`. An entirely **absent** ancestor chain establishes absence — which is what
lets the fresh-consumer bootstrap classify `missing` rather than `unknown` (AC-3.8).

### 3.3 Decision procedure

Evaluated in AC-1.8(ii)'s fixed precedence — `unknown` > `missing` > `in-sync` > `unverified` >
`stale` > `local-edit`. First match wins; the ladder is total.

```
1. unknown    if  P1 indeterminate                   → consumer-artifact-unreadable*
              or  P1 == no                           → plugin-artifact-missing
              or  P2 == no                           → plugin-artifact-unreadable
              or  P3 indeterminate                   → consumer-artifact-unreadable
              or  (P3 == yes and P4 == no)           → consumer-artifact-unreadable
              or  P5 unavailable (no hash tool)      → hash-tool-absent
2. missing    if  P3 == no (definite)
3. in-sync    if  sha1(consumer) == sha1(plugin)
4. unverified if  P6 == no entry
5. stale      if  sha1(consumer) == syncManifest[id].consumerHash
6. local-edit otherwise
```

\* P1 indeterminate is an untraversable ancestor **on the plugin side**; its reason is
`plugin-artifact-unreadable`. (Written out rather than folded in, because the four reasons exist
precisely so the remediations differ — AC-1.2.)

**Row reason precedence (§4, AC-1.2):**
`hash-tool-absent` > `plugin-artifact-missing` > `plugin-artifact-unreadable` >
`consumer-artifact-unreadable`. `hash-tool-absent` outranks the rest because it is a property of
the machine, not of any path — remediating a permission while no hash tool exists changes nothing.
`reason` is `null` on every state except `unknown`.

Row reasons and baseline reasons are **disjoint sets** (AC-1.2); a row reason exists only under a
resolved baseline. Nothing in the implementation may write a baseline reason into `rows[].reason`
or vice versa.

### 3.4 Business rules

| # | Rule | Source |
|---|---|---|
| R-1 | `stale` vs `local-edit` is discriminated **solely** by `sha1(consumer bytes) == syncManifest[id].consumerHash`. `pluginHash` is reporting-only and never enters a state decision | AC-1.1 |
| R-2 | **mtime is never read.** Not for state, not for backup retention, not for tie-breaking. Byte-identical ⇒ `in-sync` regardless of timestamps | AC-1.3 |
| R-3 | No sync-manifest entry ⇒ `unverified`, never `stale`, never `local-edit`. First adoption must be safe in both directions | AC-1.7 |
| R-4 | Equal bytes classify `in-sync` **regardless of provenance** — a degraded sync manifest cannot turn a byte-identical row into `unverified` | AC-1.6, **O-8** |
| R-5 | All four `unknown` reasons: never `in-sync`, never copied by sync, `--check` exit 3, queue `blocked` | AC-1.2 |
| R-6 | A file in `.claude/workflows/` with no manifest row and in no `retires` is `not-managed`: never read for comparison, never overwritten, never deleted | AC-1.5, NFR-3 |
| R-7 | A retired path is neither a managed row nor `not-managed` — it is quarantined by sync (§5.7) | AC-0.7 |

### 3.5 `not-managed` and the report-only listing (AC-0.6)

Produced when a **human-facing report** is built, not when the managed set is computed:

```
enumerate .claude/workflows/ once (non-recursive)
  drop every basename starting ".pdlc-"            # no state file describes itself
  drop every path that is some row's consumerPath
  drop every path in any row's retires             # those are retired-present, §5.7
  remainder → not-managed
```

This is the **only** operation that needs directory *read* permission. When enumeration fails, the
report says so (§8.3 N-6) and **no row state changes** — the managed set came from the manifest,
never from a directory listing (AC-0.1's globbing prohibition).

`not-managed` never appears in `rows` (AC-2.6) and is not one of AC-1.1's six states.

### 3.6 Classifier properties (AC-1.8) — restated as a PROPERTIES obligation

The classifier is required to be **total**, **single-valued** with the precedence in §3.3, and
**deterministic** (same filesystem inputs ⇒ same state across runs and processes, independent of
clock, mtime, environment order, directory order), with the same three properties holding for
`rows[].reason` and for `baselineReason`.

The FSPEC's contribution is the decision procedure above, which is written as a first-match ladder
precisely so single-valuedness is structural rather than asserted. **Generating the axes and
fixtures is PROPERTIES' obligation, §10 O-9** — and v13's axis tables are explicitly *not* to be
imported (24 of 96 cells were undefined).

Two determinism hazards the implementation must avoid, called out because they are easy to
reintroduce in bash:

- **Directory order.** `not-managed` output is sorted `LC_ALL=C` before printing. Row order in
  `rows` follows the **manifest's** row order, never a glob's.
- **Environment order.** No behavior depends on the iteration order of environment variables or on
  locale; every comparison and sort in C1/C3 runs under `LC_ALL=C`.

## 4. The shared drift-state writer (FSPEC-DIST-03)

**Linked requirements:** AC-2.6, AC-2.7, AC-2.9(1)–(5), AC-2.4, AC-4.3.
**Disposes:** §10 **O-4** (the `printf` invalidation emitter), **O-5** (ladder rung-2
reachability), **O-6** (the both-failed message).

### 4.1 Writer inventory (AC-2.7) — exhaustive

| Writer | Component | `generatedBy` |
|---|---|---|
| SessionStart hook | C2 | `"hook"` |
| `sync-workflows.sh --check` | C3 | `"check"` |
| `sync-workflows.sh` (plain or `--force`) | C3 | `"sync"` |

**This list is exhaustive.** `build-runtime.mjs` (C5) is not on it and gains no write target
(AC-6.1). `orchestrate-queue` (C6) reads only. Any future process gaining write access to the drift
state must be added to this table in the same commit — the REQ makes that a requirement, and the
FSPEC records it as a maintenance rule on this section.

All three call **one routine in C1**. Neither entrypoint contains its own serialiser.

### 4.2 Ordering: classify first, create second (AC-2.9(1))

```
1. resolve baseline                                   (§2)
2. classify every row + probe retired paths           (§3, §5.7)   ← filesystem AS FOUND
3. build the record                                   (§1.3)
4. mkdir -p .claude/ and .claude/workflows/           ← at most these two, at process umask
5. atomic write of the drift state                    (§4.3)
```

Step 4 happens **only** after step 2, **never** when the reason is `repo-root-unresolved` (no write
target at all), and **never** under `$HOME` or `/` (§2.2). A first run on a fresh consumer
therefore records `missing` rows in a directory that the very same run then creates — which is the
intended, stated behavior (AC-3.8), not an inconsistency.

The alternative — skip the write when the directory is absent — was considered and rejected by the
REQ: it leaves the queue permanently blocked at rollout and makes the `checkEnabled` escape
unreachable.

**The ordering invariant needs a script-layer call-order observable. That is a TSPEC obligation
(§10 O-1)**, and the `PDLC_TRACE_FILE` seam (§4.6) exists to serve it.

### 4.3 Atomic write

Sibling temp file in the destination directory, then `mv` (same filesystem, so the rename is
atomic). Whole-file; last complete write wins. No reader ever observes a partial record.

Consequence the REQ draws out: a post-sync drift state is current **within the same session**, so
an operator who syncs mid-session unblocks the queue without restarting. This is also why AC-4.1
has no freshness clause — every writer refreshes the file, so a stale snapshot cannot outlive the
operation that invalidated it.

### 4.4 Failure class (a): `mkdir` or the atomic replace fails — the invalidation ladder (AC-2.9(3))

Three rungs, **stop at first success**:

```
(i)   in-place overwrite with a schema-valid invalidation record
(ii)  unlink the file, then write it fresh
(iii) print the residual to stderr and exit 4   (hook: 0)
```

#### Rung (i) — the invalidation record. **Disposes O-4.**

Written **over the pre-existing file in place**, without `mv`, and **without the JSON tool**. It
must be emitted by a fixed-literal `printf` for the reason O-4 names: the ladder's most important
case is `json-tool-absent`, where by construction no serialiser is available. A `printf` template
can only be safe if every interpolated value is closed-domain, so:

| Field | Value in the record | Why it is safe to interpolate |
|---|---|---|
| `schemaVersion` | `1` | literal |
| `generatedAtUtc` | ISO-8601 Z from `date -u` | fixed-width, closed charset |
| `generatedBy` | this entrypoint | closed 3-member set |
| `pluginVersion` | **`null`, unconditionally** | it is an arbitrary string from the plugin cache — the one field that could inject arbitrary bytes into the template. It is context-only (AC-5.4), so emitting `null` loses nothing |
| `checkEnabled` | this run's resolved boolean | closed 2-member set — **and this is the field the whole rung exists to preserve** |
| `baselineStatus` | `"unresolved"` | literal |
| `baselineReason` | `"drift-state-invalidated"` | literal |
| `rows`, `retiredPresent` | `[]` | literal |
| `writeFailures` | this run's collected entries | `path` is **not** closed-domain — see below |

`writeFailures[].operation` is drawn from the closed nine-member set, so it interpolates safely.
`writeFailures[].path` is a filesystem path and is **not** closed-domain. The emitter therefore
JSON-escapes it with a fixed, dependency-free routine: backslash and double-quote are escaped,
control characters below `0x20` are emitted as `\uXXXX`, and a path containing a byte that cannot
be represented is replaced wholesale by the literal `"<unprintable>"`. A path can never break the
record's parseability — that is the rung's entire purpose.

**Record-first ordering is deliberate** (AC-2.9(3)): an *absent* drift state blocks the queue at
AC-4.1 row 1, which sits **above** the `checkEnabled` row. Unlinking first would therefore make the
documented opt-out unreachable on a permanently-unwritable consumer. The record preserves
`checkEnabled`; that is why it is rung (i) and not rung (ii).

**Mandated test, per O-4:** a `json-tool-absent` ladder test asserting that the emitted record
*parses* and that AC-4.1's mapping over it produces the `baselineStatus`-unresolved outcome. TSPEC
owns its construction (§10 O-10).

#### Rung (ii) — `unlink` and retry. **Disposes O-5.**

`unlink(2)` is attempted only if rung (i) failed. O-5's point, carried here as spec: **rung (ii) is
reachable for essentially one cause.**

| Condition that failed rung (i) | Does `unlink` succeed? | Rung reached |
|---|---|---|
| `ENOSPC` / quota exhausted | yes — `unlink` frees space and needs none | **(ii)** |
| immutable attribute (`chattr +i`, `uchg`) | no — `EPERM` | (iii) |
| append-only attribute | no — `EPERM` | (iii) |
| a **directory** at the path | no — `EISDIR`/`EPERM` on `unlink` | (iii) |
| read-only mount | no — `EROFS` | (iii) |
| parent directory not writable | no — `EACCES` | (iii) |

So `ENOSPC`/quota is the only ordinary path to rung (ii); the rest are rung-3 residual, derived the
same way the read-only-mount case is. The implementation still *attempts* rung (ii) unconditionally
— probing the cause first would be a syscall race — but the spec states the reachability so that
TSPEC does not attempt to build fixtures for unreachable rung-2 variants.

If `unlink` succeeds, a fresh write is attempted; if **that** fails, the ladder falls to (iii).

#### Rung (iii) — residual

Print to stderr and exit 4 (hook: 0). **Accepted, stated residual** (NFR-6 exception ii): on a
consumer where neither the drift state nor its directory is writable, the queue may proceed on
stale contents. This is announced on stderr at **every** drift computation — not once — so it
cannot become invisible. Message N-3, §8.3.

### 4.5 Failure class (b): a per-row write fails (AC-2.9(2))

Applies to the five recordable operations: `artifact-copy`, `backup`, `backup-verify`,
`retire-delete`, `sync-manifest-update`.

```
the run CONTINUES to the next row                    (rows are independent, AC-1.4)
that row's sync-manifest entry is NOT written
{ path, operation } appended to writeFailures
final exit 4;  queue blocks
```

Write failure is a **run-level** outcome — deliberately not a fifth row reason (AC-2.9(2)), so
`rows[].reason` stays the four-member closed set and "could not verify" stays distinct from "could
not write".

`operation` is the closed nine-member set of §4: `mkdir`, `drift-state-replace`,
`drift-state-invalidate`, `drift-state-unlink` (stderr-only — they describe a failure of the record
itself, so they cannot be *in* the record), plus the five recordable ones above.

Exit **4** ("attempted and could not write") is distinct from exit **3** ("no write target"). 4
outranks 3 because "could not repair the record" dominates "could not verify".

#### The both-failed message. **Disposes O-6.**

When a run fails **both** a per-row write **and** the drift-state write, the operator must be told
about the **invalidated state**, not only the failed copy — otherwise they fix the copy, re-run,
and are still blocked by a record that no longer measures anything. The message emits **both**
lines, drift-state line **first**, and it names the state explicitly:

```
pdlc: drift state at .claude/workflows/.pdlc-drift-state.json could not be written
      (operation: drift-state-replace). The recorded state does not describe this run.
      Fix filesystem permissions or free space; syncing will not repair this.
pdlc: 1 artifact write also failed:
      .claude/workflows/orchestrate-queue.bundle.js (artifact-copy)
```

The ordering is normative: the drift-state failure is the one that changes what the operator should
*do next* (a permissions/filesystem fix, never a sync — AC-4.2 puts `drift-state-invalidated` in
that remediation class).

### 4.6 Test seams (AC-2.9(5)). **Disposes O-2.**

Two declared, test-only environment seams owned by C1/C3. **Neither is a config surface**, and
every other observable is identical with the seams on or off.

| Seam | Unset behavior | Set behavior |
|---|---|---|
| `PDLC_TRACE_FILE` | inert | append-only call trace; a failure to open or append is **ignored by the script** |
| `PDLC_FAULT` | inert | closed token set; injects one fault |

**An unrecognised `PDLC_FAULT` token** — this is exactly what O-2 requires FSPEC to pin, so that
NFR-6's "exactly two exceptions" stays true:

```
print ONE line to stderr:  pdlc: unrecognised PDLC_FAULT token "<token>"; no fault injected
inject nothing
exit with the ENTRYPOINT'S NORMAL EXIT — the token changes no exit code:
     hook   → 0     (unconditionally; NFR-6 admits no third exception)
     --check → its computed exit (0–4)
     sync    → its computed exit (0–4)
```

The phrase "uses the entrypoint's normal exit" in AC-2.9(5) means the run **proceeds normally** and
the exit is whatever the drift computation would have produced anyway — an unrecognised token is
not a usage error and must not manufacture a 4. Note the asymmetry with a genuine *usage* error
(an unknown `--flag`), which **is** an error and exits 4 on `--check`/sync — and still exits 0 on
the hook, which takes no flags.

The trace failure asymmetry is deliberate and stated: the **script** ignores a trace-write failure
(it must never change production behavior), while the **test** that relies on the trace treats an
unwritable trace as red. That split is TSPEC's to implement (§10 O-1).

The trace grammar — delimiter, quoting, whether non-row probes are traced — is **TSPEC's, §10
O-7**. The seam's *existence* is mandated here and by §4; only its grammar is downstream.

### 4.7 No destroy before verified backup (AC-2.9(4))

A cross-cutting rule binding every destroying operation in §5:

```
1. copy the pre-existing bytes to the backup path            (§1.4)
2. RE-READ the backup from disk and hash it
3. compare to the hash of the source bytes
4. equal    → proceed with the overwrite/delete
   not equal or step 1/2 failed
            → original UNTOUCHED
            → operation reported skipped
            → writeFailures gains { path, backup|backup-verify }
            → exit 4
```

Step 2 is a genuine re-read, not a reuse of the in-memory hash: the failure this guards against is
a backup that was written but did not land. A recorded hash is explicitly **not** a substitute for
a backup — a digest cannot restore content (AC-3.4).
