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

Seven components. C1–C3 are new files; C4 is a placeholder so the inventory is exhaustive; C5–C7
are edits to existing files.

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
managed row (§1.1) — it ships with the plugin like any hook script and is never copied into a
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
| BL-05 | Which artifact the runtime resolves when `X.js` and `X.bundle.js` share a `meta.name` | Deliberately not contingent (REQ §7) | §5.3 and §6.2 row 7 specify the safe default for the unfavourable case |

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

## 5. Operator surfaces (FSPEC-DIST-04, FSPEC-DIST-05)

### 5.1 The SessionStart hook — C2 (AC-2.1–2.5a, 2.8, 2.4)

**Registration (BL-03, OQ-2).** `pdlc/hooks/hooks.json` gains a **second** `SessionStart` entry
beside `nudge-consolidation.sh`. Without this edit the hook never fires (REQ §6). Both entries are
independent; neither's failure suppresses the other.

**Behavioral flow:**

```
run the shared drift computation (§2, §3, §4)
emit warnings per §5.2
ALWAYS exit 0
```

**AC-2.4 is absolute.** The hook exits `0` on every path — including an internal error, a failed
baseline, a failed write, and an unrecognised `PDLC_FAULT` token. A broken drift check must never
block a session from starting. This is implemented as a trap plus an unconditional `exit 0` at the
end, not as per-branch discipline.

Exiting 0 is about **not blocking**, never about staying quiet: every non-green condition produces
output, and the failure is recorded in the drift state as well as on stderr — as
`baselineStatus: unresolved` + reason, or as `unknown` rows + reason, per level. The drift-state
write happens on every failure path with **exactly two exceptions**, both stated by AC-2.4:

1. **No write target** — `repo-root-unresolved`. Nothing is created anywhere.
2. **Write attempted and failed** — the AC-2.9(3) ladder ran and reached rung (iii).

### 5.2 Warning taxonomy — exhaustive over non-silence

AC-2.2 requires that the warning ACs be **exhaustive over the conditions that break silence**:
there is no silent non-green state. The hook emits, in this order:

| Order | Condition | AC | Message |
|---|---|---|---|
| 1 | `baselineStatus: unresolved` (incl. `manifest-empty`) | AC-2.5a | W-1 — manifest-level reason **verbatim**, textually distinct from every row-level message, + a remediation that can actually fix it. **No rows are printed** |
| 2 | any row `unknown` | AC-2.5 | W-2 — one line per row, each of the four reasons individually distinguishable with its own remediation |
| 3 | any row `unverified` | AC-2.5 | W-3 — "direction unknown"; remediation is *diff, then sync*; `--force` named |
| 4 | any row `local-edit` | AC-2.3 | W-4 — **textually distinct from `stale`**, does **not** recommend plain sync, names `--force` and the backup location |
| 5 | any row `stale` or `missing` | AC-2.1 | W-5 — row `id`, state, and the exact remediation command |
| 6 | `retiredPresent` non-empty | AC-2.8 | W-6 — token `retired-present`, emitted **independently of managed-row states** |
| 7 | `writeFailures` non-empty | AC-2.9(2) | W-7 — one line per entry, path + operation |

**Silence (AC-2.2)** requires *all* of: `baselineStatus: resolved`, a **non-empty** row set, every
row `in-sync`, no retired path present, and `writeFailures` empty. Silence means everything was
verified — never "could not check". A non-empty row set is part of the condition precisely so that
`manifest-empty` cannot go vacuously silent.

**AC-2.5a's remediations**, one per baseline reason, each chosen to be the thing that actually
fixes it:

| Reason | Remediation |
|---|---|
| `manifest-absent`, `manifest-malformed`, `manifest-empty` | **update the plugin** (never sync) |
| `plugin-root-unset` | environment fix — `${CLAUDE_PLUGIN_ROOT}` is not set |
| `plugin-root-unreadable` | deliberately **generic** environment/permissions fix — the cause could be either, and guessing wrong sends the operator down a dead end |
| `repo-root-unresolved` | "create `.claude/` at the intended root, or run inside a git work tree" |
| `json-tool-absent` | install a Python interpreter |
| `drift-state-invalidated` | permissions/filesystem fix — **never** sync (§4.4, AC-4.2) |

`manifest-absent` is universal at rollout, which is why AC-2.5a exists at all: without it, the
single most common state at first release reaches the operator as silence.

### 5.3 Retired-artifact warning (AC-2.8)

Emitted whenever a path in some row R's `retires` exists in the consumer — **independently of
managed-row states**. All-`in-sync` with a legacy `.js` still on disk still warns; that
configuration is precisely the one where the runtime may load the stale artifact (BL-05).

Retirement is manifest-derived, so it is **not evaluated while the baseline is unresolved** — that
case belongs to AC-2.5a end to end, and `retiredPresent` is `[]` meaning *not evaluated*.

Token: `retired-present` — deliberately in **neither** reason set (it is a message token, not a
`baselineReason` and not a row `reason`). Each warning names the retired path, R's `id`, and R's
state, with a remediation conditioned on R's state:

| R's state | Remediation |
|---|---|
| `in-sync` (the primary, rollout-universal case), `stale`, `missing` | plain sync |
| `local-edit`, `unverified` | `--force`, naming the backup **directory** and both backup filename **patterns** — R's bundle and the retired basename, each labelled |
| `unknown` (any of the four reasons) | plugin update or environment fix; **sync is not named** |

Two rules the implementation must not soften: the `--force` case prints a directory plus a literal
*pattern*, **never a concrete filename** (the concrete name depends on a timestamp that does not
exist yet); and **manual deletion is never recommended**, in any state — the tool backs up before
it deletes, and an operator deleting by hand loses that.

### 5.4 `sync-workflows.sh` — delivery and invocation (REQ-DIST-03 preamble)

A **bash script** (NFR-5) shipped at `<pluginRoot>/hooks/scripts/sync-workflows.sh`, invoked
directly by the operator, and runnable in the maintainer repo with **no plugin installed**
(AC-0.3a). It is not an LLM prompt: an LLM-driven file copy is neither deterministic (NFR-1) nor
auditable. A thin discoverability `SKILL.md` may exist, but its **only permitted action** is to run
the script verbatim and relay its output — it may not paraphrase, summarise a decision, or copy a
file itself.

Three modes:

| Invocation | Writes artifacts? | Writes drift state? | `generatedBy` |
|---|---|---|---|
| `--check` | no | **yes** (and, per AC-2.9(1), the directory containing it) | `check` |
| *(no flags)* | `stale` + `missing` rows | yes | `sync` |
| `--force` | additionally `local-edit` + `unverified` rows, after verified backup | yes | `sync` |

`--check` and a sync run are mutually exclusive; `--check --force` is a usage error (exit 4).

### 5.5 Copy semantics (AC-3.1, AC-3.2)

```
for each row, in manifest order:
    if state ∈ {stale, missing}                    → copy
    elif state ∈ {local-edit, unverified} and --force → verified backup (§4.7), then copy
    else                                            → skip, report the reason
```

Every row falls in **exactly one** of the copy set / skip set (AC-3.1) — the loop has no
fall-through and no row is silently ignored.

- **Never copied under any flag:** all four `unknown` reasons. `--force` overrides *provenance*
  doubt, never *verification* failure — forcing a copy over a row whose plugin side is unreadable
  would write bytes nobody has read.
- **Per-row atomicity:** sibling temp + `mv`, same as the drift state.
- **Each copy is reported with both hashes** (AC-3.1).
- **The sync manifest is updated per copied row** — and *only* per copied row. A row that failed to
  copy gets **no** sync-manifest entry (AC-2.9(2)), which is what keeps a failed copy from later
  masquerading as `stale` instead of `unverified`.
- **A failed copy does not abort the loop** (AC-3.1): `writeFailures` entry, continue, exit 4.
- **Unresolved baseline:** copy nothing, retire nothing, print the manifest-level reason +
  remediation, **still rewrite the drift state** (AC-2.7, AC-3.1).

`sync-workflows.sh` is the **only** writer of managed artifacts into `.claude/workflows/`, in every
repo including the maintainer's (AC-1.6). The maintainer green path is two commands: **build, then
sync** (AC-0.3a).

### 5.6 Backups (AC-3.4, AC-3.5)

Every overwrite or delete this feature performs is preceded by a verified backup (§4.7) at
`.claude/workflows/.pdlc-backups/{id}.{stamp}[-N].bak` (§1.4).

- **Id namespace** is the union of row ids and retired basenames (AC-0.1/M6) — so retirement
  backups share the retention rule, and the pairwise-distinctness clause is what stops a retired
  basename from colliding with a row id in this directory.
- **Same-second collision:** `-2`, `-3`, … ascending. A backup file is **never overwritten**.
- **Retention: newest 5 per id**, selected by `LC_ALL=C` lexicographic **descending** filename sort.
  The fixed-width stamp makes lexicographic == chronological. Pruning is **never** mtime-based and
  never touches a file that does not match the §1.4 pattern for a currently-known id.
- **Backup dir creation** follows AC-2.9(1) (classify first); its failure is the write-failed
  outcome, `operation: backup`.
- **Restore (AC-3.5):** restoring the newest backup for an id yields a file **byte-identical** to
  its pre-sync content. This is the one oracle for AC-3.4 that cannot be false-greened — a hash
  comparison can pass against a backup that was never written; a restore cannot.

### 5.7 Retirement (AC-3.9)

```
for each path p in each row R's retires, where p exists and the baseline is resolved:
    if sync run (NOT --check):
        if R's POST-COPY state == in-sync:
            verified backup of p (id = basename(p))      §4.7
            success  → delete p
            failure  → leave p, report retire-skipped, writeFailures, exit 4
        else:
            leave p, report retire-skipped naming R's state
    if --check:
        report retired-present, exit class 1 (sync-fixable, same as stale)
```

- **`iff` R's post-copy state is `in-sync`** — measured *after* this run's copies, not before. Any
  other state, **including every `unknown`**, leaves `p` in place. The failure mode this prevents
  is deleting the loadable artifact and leaving nothing behind.
- **Per path, idempotent, never before its replacement is in place.**
- A `mv` into the backup directory is an acceptable implementation of backup-then-delete.

**Version control — two rules of different kind, and only the second ships:**

1. A **one-time maintainer landing step** in this repo `git rm`s the four tracked
   `.claude/workflows/*` paths and gitignores the directory's generated contents (§7.5).
2. **In any consumer, sync never runs a VCS command.** It detects tracked-ness best-effort
   (`git ls-files --error-unmatch`; no usable git ⇒ **treat as untracked**) and prints a one-line
   manual action telling the operator to commit the removal. **Detection failure never blocks
   retirement** — the retirement is the safety-relevant act; the commit reminder is a courtesy.

### 5.8 Exit codes (AC-3.3). **Disposes O-14.**

The complete precedence table — highest applicable wins, never green while anything is unverified:

| Condition (precedence order) | Exit |
|---|---|
| any mandated write was attempted and failed (AC-2.9(2)) | **4** |
| `baselineStatus: unresolved` (any reason, incl. `manifest-empty`), or any row `unknown` | **3** |
| any row `local-edit` or `unverified` | **2** |
| any row `stale` or `missing`, or any retired path present | **1** |
| `resolved`, non-empty rows, all `in-sync`, no retired path, `writeFailures` empty | **0** |

**The observation point — O-14's substance.** The code is computed over the state observed **at the
end of the run**:

- **`--check`** changes nothing, so its post-run state *is* its pre-run state.
- **A sync run** applies the same table to the **post-run** state.

Worked consequences, all normative:

| Run | Post-run state | Exit |
|---|---|---|
| sync repaired the only `stale` row | all `in-sync` | **0** |
| sync copied a `stale` row and skipped an `unverified` one | one `unverified` remains | **2** |
| sync copied a `stale` row; a second copy failed | `writeFailures` non-empty | **4** |
| `--check` on a consumer with one `stale` row | unchanged | **1** |

**Exit `1` is reachable only under `--check`.** Post-run, every `stale`/`missing` row has either
been copied (⇒ `in-sync`) or failed (⇒ 4); and a retired path still present implies its row was
skipped as `local-edit`/`unverified`/`unknown`, which outranks 1 at 2 or 3. **No acceptance test
should attempt to construct a sync run that exits 1.**

**The 3/4 boundary** is *no write target* vs *attempted write*. 4 outranks 3 because "could not
repair the record" dominates "could not verify".

**Exit 0 asserts** "every managed row was compared against a resolved baseline and matched" — the
automated form can never go green having verified nothing (AC-1.0).

**The `unverified` asymmetry is deliberate and both halves must be tested:** `--check` exits **2**
on an `unverified` row, while the queue **proceeds** (§6.2). `--check` is an assertion surface, red
whenever provenance is missing; the queue is a work surface, and blocking on "direction unknown"
would strand every consumer at first adoption. The two seams optimise for opposite errors.

### 5.9 Idempotence and round-trip (AC-3.6, AC-3.7, AC-3.8)

| # | Property | Behavior |
|---|---|---|
| AC-3.6 | sync, then `--check` with no intervening edit | every copied row `in-sync`; every skipped row reports its **prior** state |
| AC-3.7 | sync twice with no intervening change **from any source** | second run copies nothing, writes no backup, leaves the sync manifest **byte-identical**, exits 0 |
| AC-3.8 | fresh consumer, `.claude/workflows/` absent, root resolves | `--check`: every row `missing` (classified before this run's `mkdir -p`), drift state written into the directory the run itself created, exit **1**. sync: directory created under the AC-0.5 root — never `$HOME` — every row copied |
| AC-3.8 | **non-git tree with no `.claude/` anywhere** | does not resolve: `--check` exits **3**, the hook warns the environment fix, **nothing is created**, the queue blocks. Remediation is one `mkdir .claude` (or `git init`) at the intended root |

**AC-3.7's byte-identical clause** is why the sync manifest is only rewritten when at least one row
was copied: an unconditional rewrite would change `syncedAtUtc` and break the property.

**Version-control caveat, stated:** a checkout or stash-pop that resurrects a retired, still-tracked
file **is** an intervening change. The next sync legitimately retires it again, with a second
backup. That is correct behavior, not an idempotence violation.

## 6. Queue integration (FSPEC-DIST-06)

**Linked requirements:** AC-4.1, AC-4.2, AC-4.3, NFR-1, NFR-6.

**Primary detector is the hook, not the queue** (REQ-DIST-04 preamble). The hook ships from the
plugin and fires regardless of what the consumer's workflow copies contain; the queue check lives
*inside* the artifact whose staleness it detects. A consumer whose queue bundle predates this
feature will never self-report via AC-4.1 — the first and worst instance is covered **only** by the
hook. **No AC in this section may be relied on for first adoption.**

First-adoption story: install/update plugin → hook fires next session → operator syncs → the queue
check exists from then on.

### 6.1 The single read (AC-4.1, BL-04)

`orchestrate-queue` performs **one** injected read of `.claude/workflows/.pdlc-drift-state.json` at
the start of an invocation. It never hashes, never enumerates, never classifies, and **never opens
any other file** — in particular it never opens `.claude/pdlc.config.json` (AC-4.3's one-read rule,
NFR-1).

**BL-04 discharged by citation.** The read uses the existing `_readFile` dependency-injection
parameter in `pdlc/workflows/orchestrate-queue.js`, whose contract returns `null` for an absent
file — the queue already relies on this for `docs/_queue/QUEUE.md` (`orchestrate-queue.js`, the
`readFileFn(queuePath)` path, which distinguishes `null` from `""`). `runtime-adapter.js` honours
the same contract. Per CLAUDE.md, **the injected call must be `await`ed** — the adapter's
implementation is async while the test doubles are sync — and the bundles must be rebuilt in the
same commit.

No new injected seam is introduced. Adding one would widen the runtime-adapter surface for a read
the existing seam already performs.

### 6.2 The mapping (AC-4.1) — precedence order

| # | Condition | Outcome |
|---|---|---|
| 1 | read absent, unparseable, `schemaVersion` != 1, or `baselineStatus` absent | `blocked` |
| 2 | `checkEnabled` is `false` | **proceed**; skip noted in the report (AC-4.3) |
| 3 | `writeFailures` non-empty | `blocked`, naming each `{ path, operation }` — and naming `drift-state-invalidated` when `baselineReason` carries it |
| 4 | `baselineStatus: unresolved` (incl. `manifest-empty`, `drift-state-invalidated`) | `blocked`, naming `baselineReason` |
| 5 | any row `unknown` | `blocked` |
| 6 | any row `missing` or `stale` | `blocked` |
| 7 | `retiredPresent` non-empty | `blocked` (sync-fixable — BL-05) |
| 8 | any row `local-edit` or `unverified` | **proceed**, rows named in the run report |
| 9 | `resolved`, non-empty rows, all `in-sync`, `retiredPresent` `[]`, `writeFailures` `[]` | **proceed silently** |

Three design points the implementation must preserve:

- **Row 2 sits above every blocking row deliberately.** The operator's opt-out stays reachable even
  on a consumer whose state is otherwise unreadable — which is also why §4.4 rung (i) preserves
  `checkEnabled`.
- **Row 7 blocks** because a retired path beside a fresh bundle is the one configuration where the
  runtime may load the stale artifact (BL-05). AC-2.8's warning and this row are deliberately **not
  contingent** on BL-05's answer: they specify the safe default for the unfavourable case.
- **No freshness clause.** AC-2.7 makes every writer refresh the file, so a stale snapshot cannot
  outlive the operation that invalidated it. "Hook never ran" is row 1 (absent). A write
  attempted-and-failed is closed at the writer by §4.4's ladder, whose rung-3 residual — the queue
  may proceed on stale contents — is **accepted and stated** (NFR-6 exception ii), not asserted
  away. `generatedAtUtc` is human-report-only; **the queue never compares timestamps** (NFR-1).

The mapping is a pure function of the parsed record. It is implemented in `orchestrate-queue.js` as
a standalone function so it is unit-testable against literal records without a filesystem.

### 6.3 The blocked report (AC-4.2) — split by level

The three reason sets are disjoint, so the report is split into **Manifest / Row / Run**:

```
Manifest level:
  manifest-absent | manifest-malformed | manifest-empty   → update the plugin
  plugin-root-unset | plugin-root-unreadable
    | repo-root-unresolved | json-tool-absent             → environment fix
  drift-state-invalidated                                 → permissions/filesystem fix (NEVER sync)

Row level:
  plugin-artifact-missing                                 → update the plugin
  plugin-artifact-unreadable | consumer-artifact-unreadable
    | hash-tool-absent                                    → environment/permissions fix
  stale | missing                                         → sync

Run level:
  one line per writeFailures entry, naming path + operation
```

- Multiple simultaneous **row** reasons print the one selected by the declared precedence (§3.3).
- `retiredPresent` entries carry R's `id` and state and the remediation **AC-2.8's table** names for
  that state (§5.3) — the queue does not invent a second vocabulary.
- **Every printed command is `<pluginRoot>`-expanded** and runnable exactly as shown (AC-0.4,
  AC-4.2). The queue has `<pluginRoot>` available only if the drift state carries it; the record
  therefore does not need it — the queue prints the *sync* command against the consumer path it
  knows, and any plugin-root-relative command is emitted by C1 into the message the state carries.
- The design target, stated by AC-4.2: **the operator's next turn is one command, not an
  investigation.**

### 6.4 `checkEnabled` scope (AC-4.3)

The flag gates the **queue only**. The hook still warns and `--check` still exits non-zero. It
deliberately does **not** live in workflow source, because that source is what drifts — a flag
inside the stale artifact could not turn off the check that detects the staleness.

The **shell writer** resolves it (§2.7) and records the boolean; the queue reads that field from the
one file it already reads.

## 7. Build, packaging and publication (FSPEC-DIST-07)

**Linked requirements:** AC-5.1–5.4, AC-6.1–6.6, REQ §6.
**Disposes:** §10 **O-15** (monotonicity decision).

### 7.1 The builder (AC-6.1, AC-5.1)

`node pdlc/workflows/build-runtime.mjs` writes to **exactly one location**:

```
pdlc/workflows/dist/orchestrate-dev.bundle.js
pdlc/workflows/dist/orchestrate-queue.bundle.js
pdlc/workflows/dist/distribution-manifest.json
```

tracked and committed. It writes **nothing else**: no `.claude/workflows/` copy, no sync-manifest
entry, no drift state. The builder is not on §4.1's writer list and gains no write target.

`build-runtime.mjs --check` compares `dist/` only. The builder keeps its single output directory and
its **node-builtins-only** dependency footprint (REQ §0 fact 8) — a future builder dependency would
extend the bootstrap story of AC-6.5 and is out of scope here.

`meta` literals and the runtime's pure-literal constraint are **untouched** (AC-5.1). Version
stamping is data emitted *alongside* the bundles, never a `meta` field: the runtime demands a pure
first-statement literal, and grepping a 92 KB generated file from shell is backwards.

**Manifest emission.** Per row, `artifactVersion` is the `pdlc/.claude-plugin/plugin.json` version
at build time and `pluginSha1` is the sha1 of the bytes just emitted — computed from the emitted
buffer, so it cannot disagree with what landed.

**The maintainer loop is: build, then sync.** This repo's `.claude/workflows/*.bundle.js` become
untracked, gitignored consumer copies produced by the same sync script every consumer runs.

### 7.2 Version semantics (AC-5.2, AC-5.3, AC-5.4)

| # | Rule |
|---|---|
| AC-5.2 | Where hash and version stamp disagree, **content hash is authoritative**. Versions are compared for **equality only, never ordered** — no semver comparator exists anywhere in this feature (§4) |
| AC-5.3 | A row not `in-sync` reports **both** `pluginArtifactVersion` and `consumerArtifactVersion` (absent ⇒ reported as unknown). Both lines are **required** and both labelled **"not a drift signal"** — many distinct bundle contents legitimately share one `artifactVersion`. The two sha1 values are printed as the discriminating evidence |
| AC-5.4 | `pluginVersion` in any report or state file is **context only** — never an input to any state decision; `null` when unreadable. REQ §0 fact 6 measured `0.9.0` and `0.10.0` shipping byte-identical workflow files |

### 7.3 Packaging and freshness oracles (AC-6.2, AC-6.2a, AC-6.3)

**AC-6.2 — packaging oracle, executable before release.** Over the set of files the plugin would
package (everything under `pdlc/` minus ignore rules), `npm test` asserts:

- (a) every `pluginPath` in the manifest resolves **inside** the packaged set;
- (b) each file's sha1, **recomputed from disk bytes**, equals its `pluginSha1`;
- (c) top-level `retired` equals the union of rows' `retires`;
- (d) the manifest itself sits at `pdlc/workflows/dist/distribution-manifest.json` inside that set.

Build inputs present in the package are **tolerated, not asserted away**. **No test may write into
this repository's `pdlc/workflows/dist/`** — a constraint on the jest suite, not on BL-01's manual
spike.

**AC-6.2a — post-release check (P1, release checklist).** A published release, once installed,
exposes `${CLAUDE_PLUGIN_ROOT}/workflows/dist/` containing the named bundles **plus the manifest
itself**. Hosted automation is D-DIST-06.

**AC-6.3 — freshness.** `__tests__/runtimeBundle.test.js` fails unless the committed `dist/` bundles
were rebuilt in the same commit as any workflow-source change — the existing assertion, repointed at
`dist/`.

### 7.4 The advertised-version oracle (AC-6.6). **Disposes O-15.**

**Observation point: the working tree against `HEAD`** — matching AC-6.3, and deliberately *not* an
audit of committed history.

```
red  iff  `git status --porcelain -- pdlc/workflows/dist/` produces ANY line
     and  working-tree pdlc/.claude-plugin/plugin.json `version` == its value at HEAD
```

**`--porcelain` is required, not `git diff HEAD`.** `git diff` reports tracked paths only, and on
the landing commit — the highest-risk commit, and the first to ship `dist/` — **every** file under
`dist/` is untracked (`pdlc/workflows/dist/` neither exists nor is gitignored at `HEAD`). A `git
diff` form is therefore empty, falls into inert case (a), and would pass a brand-new bundle set
under an unchanged advertised version. The same hole reopens on every later commit that adds a
*new* bundle. `--porcelain` covers `??`, `A`, `M` and `D` alike.

**Rationale for gating the working tree rather than history:** `npm test` runs pre-commit, so the
violating commit does not yet exist to be audited; and a history-walking form is red on every
subsequent commit that changes nothing relevant — a steady-state red, disabled within a week.

**Inert cases — each skips loudly**, printing the reason and naming the invariant left unverified,
never passing silently: (a) the `--porcelain` output is empty (the ordinary case — nothing to
advertise); (b) `git` absent from `PATH`; (c) no `.git` (source tarball, exported copy); (d) `HEAD`
does not exist (unborn branch). **Shallow clones and linked worktrees are not inert** — neither
`git status` nor a `HEAD` comparison needs ancestry. Probe order and the exact printed strings are
**TSPEC's, §10 O-16**.

**Accepted residual, restated:** a violation that already landed is not detected here. The scope is
strictly the commit about to be authored. The fallback is the same P1 surface as AC-6.2a — the
maintainer's release checklist confirms, before publishing, that `plugin.json` `version` differs
from the previously published release whenever the packaged `dist/` bytes differ. **No acceptance
test should attempt to detect the landed case.**

#### O-15 — monotonicity: **decided, and the decision is no.**

AC-6.6 asserts only that the pin **moved**; a downgrade (`0.11.0` → `0.10.0`) passes. O-15 asks
FSPEC to decide whether to add a monotonicity assertion and, if so, which comparator. **This FSPEC
does not add one**, for three reasons:

1. **It would require the comparator §4 forbids.** REQ §4 states flatly that *no semver comparator
   exists anywhere in this feature*, and AC-5.2 fixes version comparison as **equality only**.
   Adding an ordering assertion here would introduce the project's only version-ordering code, in a
   test, for a failure mode nobody has observed.
2. **The `version` field is not this feature's to police.** It is the marketplace's advertised
   version, changed by the maintainer for many reasons. AC-6.6's claim is a *change-detection*
   claim — "the thing you are shipping is advertised as new" — and a downgrade satisfies that claim
   in the only sense the consumer's cache cares about: the advertised value differs, so the cache
   is refreshable.
3. **The genuine risk is already covered elsewhere.** A downgrade that collides with a
   *previously published* version is the AC-6.2a/AC-6.6 release-checklist row, which compares
   against the previously published release rather than against `HEAD` — the correct place for it,
   because only the checklist knows what was published.

**Recorded as a deliberate omission, not an oversight.** If a monotonic pin is later wanted, it
belongs to D-DIST-06's release automation, where a published-version baseline exists.

### 7.5 Landing step and document corrections (REQ §6, AC-6.4, AC-3.9)

A **one-time** maintainer landing step, all in the commit that lands this feature:

1. `git rm` the four tracked `.claude/workflows/*` paths; gitignore the directory's generated
   contents. The directory's contents become untracked consumer copies.
2. `pdlc/.claude-plugin/plugin.json` `version` bumped — required by AC-6.6, since `dist/` is new
   bytes — and in **every later commit that changes `dist/`**.
3. `pdlc/hooks/hooks.json` gains the second `SessionStart` entry (§5.1, BL-03).
4. **Execute bits on five scripts**: this feature's two (C2, C3) **and** the three existing sibling
   hook scripts. Both objects are required and are independent — index mode `100755` **and**
   on-disk `[ -x ]` (REQ §0 fact 11, §4). The three siblings are deliberately in scope: they work
   today only because `hooks.json` happens to invoke them by bare path, and this feature adds a
   fourth script under the same convention plus AC-6.5's bare-path bootstrap, so the latent
   exit-126 class is fixed once here rather than split into a follow-up.
5. **Document corrections**: whatever `coveredViolations(repoRoot)` returns — **7 files today**,
   including both orchestrator SKILLs — plus `dist/` path updates to the already-correct normative
   documents. Archived per-feature spec history under other features' `docs/` dirs is **not**
   edited.
6. Bootstrap sequence documented in `CLAUDE.md` and `pdlc/README.md` (AC-6.5).

**AC-6.4's two assertions run against two different roots and are never both evaluated over the
same tree:**

| Assertion | Root | Claim |
|---|---|---|
| Landing criterion | **live repo root** | `coveredViolations(liveRepoRoot) == ∅` — green from the landing commit onward |
| Anti-widening guard | **pinned fixture tree** under `pdlc/workflows/__tests__/fixtures/` | `\|coveredViolations(fixtureRoot)\| == 7`, the returned paths equal the enumerated 7, and the exemption list itself is asserted literally |

A cardinality assertion over the *live* root would be red from the landing commit and red forever.
The fixture never changes, so the count assertion is stable; widening an exemption or narrowing a
pattern turns it red even when the exemption-list prose is untouched. **Fixture construction is
TSPEC's, §10 O-17.**

`coveredViolations` is a **pure function of a root directory with no judgement step**: `grep` of
five literal qualifier-free patterns — the two `.claude/workflows/orchestrate-{dev,queue}.js` forms;
`.claude/workflows/*.js`; the phrase `managed manually`; the phrase `opying the bundle into a
consumer repo` (case-tolerant stem) — minus a four-member exemption enumerated literally: (i)
generated trees `.claude/workflows/` and `pdlc/workflows/dist/`; (ii) per-feature artifact dirs,
**mechanically defined as a `docs/<X>/` containing `REQ-<X>.md`**; (iii) any
`distribution-manifest.json`; (iv) any `__tests__/`.

The definition in (ii) is load-bearing: "any `docs/` subdirectory" would silently exempt
`docs/_queue/` and `docs/design/`, dropping the covered set from 7 to 5 and losing the two most
normative non-SKILL documents while the oracle stayed green.

A false positive is resolved by **rephrasing the document**. Narrowing a pattern or widening an
exemption requires changing AC-6.4 **and** the fixture expectation in the same commit.

### 7.6 Fresh-clone bootstrap (AC-6.5)

Given a fresh clone with **no plugin installed** and `${CLAUDE_PLUGIN_ROOT}` unset, the two
documented commands:

```
node pdlc/workflows/build-runtime.mjs
pdlc/hooks/scripts/sync-workflows.sh          # bare path — the scripts ship executable
```

yield: bundles present, every row `in-sync`, `--check` exit 0, and the queue's §6.2 mapping over
the resulting drift state is **proceed silently**. **No published release, no installed plugin, no
network.**

The maintainer substitution (§2.4) is what makes this work with `${CLAUDE_PLUGIN_ROOT}` unset:
`build-runtime.mjs` is present, so `<pluginRoot>` is `<repoRoot>/pdlc` and the env var is never
consulted. Every row first classifies `missing` (§3.2's ancestor rule) and the sync run creates the
directory (§4.2).

Fixture construction, mode-bit assertions, and the classify-before-create trace oracle are
downstream: **§10 O-1, O-12**.

### 7.7 Enforcement surface, stated (REQ §6)

Every AC whose Who is `npm test` — AC-6.2, AC-6.3, AC-6.4, AC-6.5, AC-6.6 — is enforced by
**maintainer discipline plus `npm test`** until D-DIST-06 lands hosted CI. **No pre-commit hook is
in scope and none is implied**; a maintainer who commits without running `npm test` bypasses all of
them. This is a pre-existing property of AC-6.3, made load-bearing by AC-6.6's working-tree
observation point, and it is why AC-6.6 and AC-6.2a both name the release checklist as the P1
fallback.

## 8. Message catalogue

Operator-facing strings are specified here because AC-2.3, AC-2.5, AC-2.5a, AC-2.8 and AC-4.2 all
make *textual distinctness* a requirement. The exact wording below is normative for the
distinctions the ACs demand; incidental phrasing may change without a spec revision.

### 8.1 Conventions

- Every line is prefixed `pdlc:` on stderr.
- Every command shown is **`<pluginRoot>`-expanded** and runnable exactly as printed (AC-0.4,
  AC-4.2).
- No message ever recommends **manual deletion** of any file (AC-2.8).
- No message recommends `sync-workflows.sh` for a condition sync cannot fix — specifically
  `manifest-*` (⇒ update the plugin) and `drift-state-invalidated` (⇒ permissions/filesystem).

### 8.2 Warnings (hook)

| # | Trigger | Shape |
|---|---|---|
| W-1 | unresolved baseline | `pdlc: workflow drift check could not run — {reason}. {remediation}` |
| W-2 | row `unknown` | `pdlc: {id} could not be verified — {reason}. {per-reason remediation}` |
| W-3 | row `unverified` | `pdlc: {id} differs from the plugin's copy and has no sync provenance — direction unknown. Diff it, then sync (--force required): {cmd}` |
| W-4 | row `local-edit` | `pdlc: {id} was edited locally after its last sync. Plain sync will NOT overwrite it; --force will, after backing it up to {backupDir}: {cmd}` |
| W-5 | row `stale` / `missing` | `pdlc: {id} is {state}. Run: {cmd}` |
| W-6 | retired present | `pdlc: retired-present — {path} is superseded by {id} ({state}). {state-conditioned remediation}` |
| W-7 | write failure | `pdlc: could not write {path} ({operation})` |

W-3 and W-4 are required to be **textually distinct** (AC-2.3) and they are: W-4 names `--force` and
the backup location and explicitly denies plain sync; W-3 asks for a diff first. Neither is a
substring of the other.

### 8.3 Notices

| # | Condition | Line |
|---|---|---|
| N-3 | ladder rung (iii) — announced at **every** drift computation (NFR-6 ii) | `pdlc: drift state is not writable at {path}; the queue may proceed on stale contents until this is fixed.` |
| N-4 | sync manifest unreadable/malformed | `pdlc: sync manifest at {path} is {unreadable\|malformed}; rows that differ are reported unverified.` |
| N-5 | `pdlc.config.json` unreadable/malformed/non-boolean | `pdlc: {path} could not be read for distribution.checkEnabled; assuming true.` |
| N-6 | `.claude/workflows/` enumeration failed | `pdlc: could not list {dir}; unmanaged files are not reported this run. Managed rows are unaffected.` |
| N-7 | unrecognised `PDLC_FAULT` (§4.6) | `pdlc: unrecognised PDLC_FAULT token "{token}"; no fault injected.` |

N-4's wording is **O-8's verbatim requirement**: *rows whose bytes differ are reported `unverified`;
an equal-bytes row is `in-sync` regardless of provenance.* N-6 states explicitly that row states are
unaffected (AC-0.6).

The **absent** sync manifest produces no notice — never having synced is the ordinary
first-adoption state, not a fault.

## 9. Disposition of REQ §10 FSPEC obligations

Every row whose "Lands in" names FSPEC, with where it is discharged. A reviewer verifying this
document should check these seven.

| # | Obligation | Disposed in | Disposition |
|---|---|---|---|
| **O-2** | Unrecognised `PDLC_FAULT` must never make the hook exit non-zero; specify per-entrypoint behavior so NFR-6's "exactly two exceptions" stays true | **§4.6** | One stderr line, nothing injected, and the **entrypoint's normal exit** — hook unconditionally 0, `--check`/sync their computed 0–4. Contrasted explicitly with a genuine usage error, which does exit 4 on `--check`/sync and still 0 on the hook |
| **O-4** | The `printf` invalidation emitter; `pluginVersion` emitted `null` unconditionally; mandate a `json-tool-absent` ladder test | **§4.4 rung (i)** | Field-by-field table showing every interpolated value is closed-domain; `pluginVersion` `null` unconditionally with the reason (it is the one field that could inject arbitrary bytes); a fixed, dependency-free escaping rule for `writeFailures[].path`, which is *not* closed-domain, with `"<unprintable>"` as the fallback. The mandated ladder test is stated; its construction is TSPEC's (O-10) |
| **O-5** | Rung-2 reachability: only `ENOSPC`/quota reaches `unlink`; the rest are rung-3 residual | **§4.4 rung (ii)** | Six-row cause → `unlink` outcome → rung table. The implementation still *attempts* rung (ii) unconditionally (probing the cause first would be a syscall race); the spec states reachability so TSPEC does not build fixtures for unreachable variants |
| **O-6** | A run failing both an artifact copy and the drift-state write must name the invalidated state | **§4.5** | Both lines emitted, **drift-state line first**, naming the state as not describing this run and directing to a permissions/filesystem fix rather than a sync. Ordering is normative because that line is the one that changes what the operator does next |
| **O-8** | Degraded-provenance wording, verbatim | **§1.2, §3.4 R-4, §8.3 N-4** | Rows whose bytes **differ** are reported `unverified`; an **equal-bytes** row is `in-sync` regardless of provenance. Carried as a schema rule, a business rule, and the notice's wording |
| **O-14** | `sync-workflows.sh`'s exit code = AC-3.3's table applied to the **post-run** state, with the mixed-run example | **§5.8** | Observation point stated per mode (`--check` changes nothing ⇒ pre == post); four worked rows including the mixed run (copied a `stale`, skipped an `unverified` ⇒ **2**); and the derived consequence that **exit 1 is reachable only under `--check`**, with the instruction that no test should try to construct it |
| **O-15** | Decide whether to add a monotonicity assertion to AC-6.6, and which comparator | **§7.4** | **Decided: no.** Three reasons — it would require the semver comparator REQ §4 forbids and AC-5.2's equality-only rule excludes; the advertised `version` is not this feature's to police, and AC-6.6's claim is change-detection, which a downgrade satisfies; and the real risk (colliding with a previously *published* version) belongs to the release checklist, the only surface that knows what was published. Recorded as a deliberate omission, with a pointer to D-DIST-06 if it is later wanted |

## 10. Obligations carried forward to TSPEC / PROPERTIES

Restated as **entry obligations** — the TSPEC/PROPERTIES author must dispose of every row, and that
document's reviewers must verify the disposition. A finding that one of these is unspecified in
*this* document is answered by this table.

| # | Lands in | Obligation | This FSPEC's contribution |
|---|---|---|---|
| O-1 | TSPEC / PROPERTIES | Classify-before-create ordering observable: scope to a single classification invocation; row-id and phase fields in the trace grammar; a positive-presence conjunct so it cannot pass vacuously on an empty trace; an unwritable trace is a red **test** while the script still ignores trace failures | §4.2 states the ordering; §4.6 mandates the seam's existence and the script-ignores/test-reds split |
| O-3 | TSPEC / PROPERTIES | AC-0.5 step 2 is reachable only on a **non-git** fixture; its oracle must assert observables that exist in `repo-root-unresolved` (stderr reason line, `--check` exit 3), not drift-state fields never written there; one fault token per guard (git vs walk) | §2.2 makes the never-fall-through rule explicit; §2.9 and §5.9 give the observables |
| O-7 | TSPEC | The trace seam's delimiter and quoting; whether non-row probes (manifest, sync manifest, `pdlc.config.json` reads) are traced | §4.6 mandates existence; grammar is explicitly deferred |
| O-9 | PROPERTIES | Classifier totality / single-valuedness / determinism over states, row reasons and baseline reasons, including both declared precedences. **Regenerate the axes; do not import v13's tables** (24 of 96 cells undefined) | §3.3's first-match ladder makes single-valuedness structural; §3.6 names two determinism hazards (directory order, environment order/locale) |
| O-10 | TSPEC | Write-failure test design: which failures are injectable, per-runner fixture requirements (uid-0 caveats), fail-open assertions per writer surface. v13's tests (a)–(f) are the starting inventory | §4.4/§4.5 give the contract; §4.4 rung (i) names the mandated `json-tool-absent` ladder test |
| O-11 | TSPEC / PROPERTIES | Probe vocabulary and permission-fixture policy: uid-0 runners **skip with a printed reason and named unverified invariants** — never silently pass. Coverage floors live here | §3.2's six probes are the vocabulary's basis; §7.4 reuses the skip-loudly pattern |
| O-12 | TSPEC | Bootstrap fixture construction (working-tree copy with mode bits, `git init` anchor, pinned `HOME`, `realpath` normalisation) and **both** mode-bit assertions (index and on-disk) | §7.5 item 4 and §7.6 state the requirement; §2.2 requires `realpath` normalisation for the `$HOME` guard |
| O-16 | TSPEC | AC-6.6's skip-loudly branches: pin the **probe order** and the printed reason string for each of (a) empty `--porcelain`, (b) `git` absent, (c) no `.git`, (d) unborn `HEAD`, reusing O-11's vocabulary. Also pin the **untracked-addition** case as a positive (red) fixture | §7.4 states the four branches and why `--porcelain` (not `git diff`) is required — which is the same reason the untracked fixture must exist |
| O-17 | TSPEC | AC-6.4's pinned fixture tree reproducing the pre-landing layout for the five patterns and four exemption members; the expected 7 paths; and that live-root (`== ∅`) and fixture-root (`== 7`, exact paths, exemption list) are **separate test cases over separate roots** | §7.5 states the two-root structure and the exemption definitions verbatim |
| O-13 | `consolidate-learnings` | REQ-scope stopping rule → `docs/_constraints/DOMAIN-CONSTRAINTS.md`. **Neither `docs/_constraints/` nor `docs/_decisions/` exists on this branch** — the file must be **created**, not merged into; "no such file" does not discharge the row | Not FSPEC's; recorded so it is not lost |

## 11. Open questions

| # | Question | Blocking? | Owner |
|---|---|---|---|
| **OQ-1** | **BL-01 has not been run.** Does a nested build-output directory survive packaging — i.e. does an installed plugin expose a *readable* `${CLAUDE_PLUGIN_ROOT}/workflows/dist/distribution-manifest.json` whose bytes equal the repo's? | **Blocks implementation, not this document.** If false, REQ-DIST-06's shipping path is wrong and §7 must change | Operator — run the spike. Positive-presence exit criterion: `test -r` plus a byte comparison. **Echoing a resolved path does not discharge it** — string interpolation succeeds identically whether or not `dist/` shipped. The spike may use a placeholder `distribution-manifest.json` of arbitrary bytes on a throwaway branch |
| **OQ-2** | **BL-03 has not been run.** Does `hooks.json` accept a second `SessionStart` entry beside `nudge-consolidation.sh`? | Blocks implementation of §5.1 only | Operator — observe both hooks firing in one session. If refused, C2 merges into `nudge-consolidation.sh` |
| **OQ-3** | **BL-06 has not been run.** In a **linked git worktree**, does the runtime load `.claude/workflows/` from that worktree or from the main one? | Blocks §2.2's main-worktree rule | Operator — runtime observation. If per-worktree, D-DIST-07 pulls into this feature and AC-0.5's resolution is insufficient |
| **OQ-4** | C1 is specified as a sourced bash library at `pdlc/hooks/scripts/lib/pdlc-drift.sh`. Is a `lib/` subdirectory under `hooks/scripts/` acceptable to the plugin packaging and to `hooks.json`'s bare-path convention? | Low — a flat `pdlc/hooks/scripts/pdlc-drift-lib.sh` is an equivalent fallback | TSPEC/PLAN. Note C1 is **sourced, never executed**, so it does not need the execute bit — but it must not be registered as a hook |
| **OQ-5** | §6.3 assumes the queue can print `<pluginRoot>`-expanded commands. The queue never resolves `<pluginRoot>` itself (one-read rule). Should the drift state carry a pre-expanded remediation command string per condition, or should the queue print only consumer-relative commands? | Low — affects §6.3's wording, not any state decision | TSPEC. This FSPEC assumes C1 emits the expanded command into the message the state carries |

## 12. Acceptance tests

Who/Given/When/Then, one per behavioral cluster. These are FSPEC-level; the fixture matrix,
generation axes and coverage policy are TSPEC/PROPERTIES (§10).

| # | Who | Given | When | Then |
|---|---|---|---|---|
| AT-1 | operator, fresh consumer | repo root resolves, `.claude/` absent, plugin ships a valid manifest | `--check` | every row `missing`; drift state written into the directory the run created; exit **1** |
| AT-2 | operator, non-git tree, no `.claude/` anywhere | — | `--check` | exit **3**, reason `repo-root-unresolved`, **nothing created on disk** |
| AT-3 | operator, pre-manifest consumer | installed plugin ships no manifest | hook runs | warns `manifest-absent` with **update the plugin**; exits **0**; drift state has `baselineStatus: unresolved`, `rows: []`, `retiredPresent: []` |
| AT-4 | queue | that same drift state | queue invocation | `blocked`, naming `manifest-absent` at **Manifest** level |
| AT-5 | operator | `distribution.checkEnabled: false` and rows `stale` | hook, then queue | hook **still warns**; `--check` **still** exits 1; queue **proceeds** with the skip noted |
| AT-6 | operator | one row byte-identical, sync manifest absent | `--check` | that row `in-sync` (**not** `unverified`) — O-8's equal-bytes rule |
| AT-7 | operator | one row differs, no sync-manifest entry | `--check` | `unverified`, exit **2**; queue over the same state **proceeds** — the asymmetry, both halves |
| AT-8 | operator | one row `local-edit` | plain sync | not overwritten, reported with reason; then `--force` | overwritten after a verified backup; restoring the newest backup yields **byte-identical** pre-sync content |
| AT-9 | operator | sync completed, nothing changed | sync again, same flags | copies nothing, writes no backup, sync manifest **byte-identical**, exit **0** |
| AT-10 | operator | one `stale` row and one `unverified` row | plain sync | `stale` copied, `unverified` skipped, exit **2** (post-run precedence) — O-14's worked case |
| AT-11 | operator | all rows `in-sync`, a retired `.js` present | hook | **still warns** `retired-present` with R's id and `in-sync` remediation (plain sync); queue **blocks** |
| AT-12 | operator | retired path present, R post-copy `in-sync` | sync | `p` backed up (id = retired basename), verified, then deleted; a one-line manual commit action printed if tracked |
| AT-13 | operator | retired path present, R `unknown` | sync | `p` **left**, `retire-skipped` naming R's state |
| AT-14 | operator | no JSON interpreter on `PATH` | hook | `json-tool-absent`, exit **0**; ladder emits a `printf` record that **parses**, carries `pluginVersion: null` and this run's `checkEnabled` — O-4 |
| AT-15 | operator | drift-state file exists and its directory is unwritable, `ENOSPC` on the file | any entrypoint | rung (i) attempted, rung (ii) `unlink` succeeds, fresh write lands — O-5's only reachable rung-2 path |
| AT-16 | operator | drift-state file immutable | any entrypoint | rung (i) fails, rung (ii) `unlink` refused (`EPERM`), rung (iii): N-3 on stderr, `--check` exit **4**, hook exit **0** |
| AT-17 | operator | a copy fails **and** the drift-state write fails | sync | both lines printed, **drift-state line first**, naming the invalidated state and a permissions fix — O-6 |
| AT-18 | operator | `PDLC_FAULT=not-a-real-token`, everything else green | hook | N-7 printed, nothing injected, exit **0**; `--check` under the same env exits **0** — O-2 |
| AT-19 | jest | manifest and packaged set | `npm test` | AC-6.2 (a)–(d) all assert; no test writes into `pdlc/workflows/dist/` |
| AT-20 | jest | working tree with any `dist/` change and `plugin.json` `version` == `HEAD`'s | `npm test` | **red** — including the untracked-only case (`??` lines), which `git diff HEAD` would miss |
| AT-21 | jest | `git` absent from `PATH` | `npm test` | AC-6.6 **skips loudly**, printing the reason and naming the unverified invariant — never a silent pass |
| AT-22 | jest | live repo root, post-landing | `npm test` | `coveredViolations(liveRepoRoot) == ∅` |
| AT-23 | jest | pinned fixture root | `npm test` | `\|coveredViolations(fixtureRoot)\| == 7`, paths equal the enumerated 7, exemption list asserted literally |
| AT-24 | maintainer | fresh clone, no plugin, `${CLAUDE_PLUGIN_ROOT}` unset | `build-runtime.mjs` then `sync-workflows.sh` | bundles present, all rows `in-sync`, `--check` exit **0**, queue mapping proceeds silently — AC-6.5 |
| AT-25 | operator | a `.claude/workflows/` file with no row and in no `retires` | any entrypoint | reported `not-managed`; never read for comparison, never overwritten, never deleted; absent from `rows` |

## 13. Traceability

| REQ unit | FSPEC section |
|---|---|
| REQ-DIST-00 (AC-0.1–0.7) | §1.1, §2, §3.5 |
| REQ-DIST-01 (AC-1.0–1.8) | §2, §3 |
| REQ-DIST-02 (AC-2.1–2.9) | §4, §5.1–5.3 |
| REQ-DIST-03 (AC-3.1–3.9) | §5.4–5.9 |
| REQ-DIST-04 (AC-4.1–4.3) | §2.7, §6 |
| REQ-DIST-05 (AC-5.1–5.4) | §7.1, §7.2 |
| REQ-DIST-06 (AC-6.1–6.6) | §7 |
| NFR-1 | §5.4, §6.1, §6.2 |
| NFR-2 | §13.1 below |
| NFR-3 | §3.4 R-6, §3.5 |
| NFR-4 | §5.4 |
| NFR-5 | §2.3, §5.4, §4.6 |
| NFR-6 | §5.1, §4.4 rung (iii), §6.2, §4.6 |

| User story | FSPEC sections |
|---|---|
| US-01 (told at session start) | §5.1, §5.2, §5.3 |
| US-02 (single command to update) | §5.4, §5.5, §7.6 |
| US-03 (which direction, deterministically) | §3.3, §3.4, §3.6, §5.6 |
| US-04 (published and reaches consumers) | §7.1, §7.3, §7.4 |

### 13.1 NFR-2 — the structural latency discharge

NFR-2 requires the p95 budget to be discharged **structurally and reviewably at FSPEC**, with **no
test asserting wall-clock time** (a timing assertion on a SessionStart hook is flaky by
construction). The three structural claims, each checkable by reading this document:

1. **No unbounded filesystem enumeration.** The managed set comes from the manifest (§2.5), never
   from a glob — AC-0.1 prohibits globbing outright. The only directory listing in the feature is
   the single non-recursive read of `.claude/workflows/` for the `not-managed` report (§3.5).
2. **No process spawn per row beyond the three declared tools.** Per row: at most two hash
   invocations (plugin side, consumer side). Baseline resolution spawns the JSON helper a bounded
   number of times (manifest, sync manifest, config) and `git` at most twice (§2.2). Nothing scales
   with the size of the repo.
3. **No network.** Nowhere in C1/C2/C3. `${CLAUDE_PLUGIN_ROOT}` is used verbatim and the cache is
   never enumerated (§2.4).

The wall-clock number is observed **once**, on the maintainer's release checklist (the AC-6.2a
pattern), and is advisory: a miss opens a bug, it never fails a build.
