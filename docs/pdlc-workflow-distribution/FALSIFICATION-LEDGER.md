# Falsification ledger — pdlc-workflow-distribution

Owner (creation): T-40, batch 7 (empty, header only). Populated by T-41…T-49 (batch 12, each
appending its own `docs/pdlc-workflow-distribution/FALSIFICATION-LEDGER-T-{task}.md` fragment)
and T-50 (batch 13, appending its own fragment for its three queue-side properties, then
concatenating every fragment into this file in task order and deleting them). See PLAN §3.1 and
§4.4.

## Format (PLAN §3.1)

A property is marked **green** in this ledger only when a **falsification run** has been recorded
for it: the ordered triple *(mutation, red, revert)*.

1. **Mutation, named before the run.** Before running anything, the implementer writes the
   mutation as a one-line diff description against the *subject* — C1 (`pdlc-drift.sh`), C2/C3
   (`check-workflow-drift.sh` / `sync-workflows.sh`), or `orchestrate-queue.js`. Where PROPERTIES
   §7 or §8.1 already names the mutation for a property, the ledger cites that section instead of
   re-describing it. Naming the mutation before running anything is what stops a post-hoc
   rationalisation of a green.
2. **Red observed.** After applying the mutation, record the failing case count and the first
   failure message verbatim.
3. **Revert verified green.** After reverting, record that the suite is green again, and that
   `git diff --exit-code` over the subject file is clean (no subject file is left mutated when the
   batch closes).

A property with **no nameable mutation** is not marked green. It is filed in the **Residuals**
table below instead, with the reason, and counts against §9's property total as unverified — a
property no mutation can falsify is vacuous, and this ledger exists to catch exactly that.

## Column layout

| Column | Meaning |
|---|---|
| Property | the `PROP-{DOMAIN}-{NN}` id from PROPERTIES |
| Subject | the file the mutation is applied to (C1 / C2 / C3 / `orchestrate-queue.js`) |
| Mutation (named before run) | the one-line diff description, or a citation into PROPERTIES §7 / §8.1 when already named there |
| Red observed | failing case count + the first failure message, verbatim |
| Revert verified | confirmation the suite is green again and `git diff --exit-code` is clean over the subject |
| Task | the property task that recorded this entry (T-41…T-50) |

## Ledger

| Property | Subject | Mutation (named before run) | Red observed | Revert verified | Task |
|---|---|---|---|---|---|
| *(none yet — populated by T-41…T-50)* | | | | | |

## Residuals

Properties with no nameable mutation — filed here instead of marked green (PLAN §3.1's fallback).

| Property | Reason no mutation is nameable | Task |
|---|---|---|
| *(none yet)* | | |
