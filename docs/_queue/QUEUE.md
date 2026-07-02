<!--
  PDLC work queue — pdlc plugin hardening features (from 2026-07-01 workflow gap review).
  Drive with:  /loop run /pdlc:orchestrate-queue

  Status lifecycle: pending → in-progress → awaiting-merge → (human merges PR) → done
                    | halted | blocked
  Effective deps = Depends-On column ∪ REQ frontmatter depends-on.
-->

# PDLC Queue

| Order | Status  | Feature                  | REQ Path                                                      | Depends-On             |
|-------|---------|--------------------------|---------------------------------------------------------------|------------------------|
| 1     | pending | harden-harvest-guard     | docs/harden-harvest-guard/REQ-harden-harvest-guard.md         | —                      |
| 2     | pending | agent-trailer-contracts  | docs/agent-trailer-contracts/REQ-agent-trailer-contracts.md   | —                      |
| 3     | pending | pipeline-entry-guards    | docs/pipeline-entry-guards/REQ-pipeline-entry-guards.md       | —                      |
| 4     | pending | skill-prompt-consistency | docs/skill-prompt-consistency/REQ-skill-prompt-consistency.md | —                      |
| 5     | pending | harvest-after-pub        | docs/harvest-after-pub/REQ-harvest-after-pub.md               | harden-harvest-guard   |
| 6     | pending | dod-loop-hardening       | docs/dod-loop-hardening/REQ-dod-loop-hardening.md             | agent-trailer-contracts |
| 7     | pending | queue-recovery           | docs/queue-recovery/REQ-queue-recovery.md                     | —                      |
