# Diamond Dependency Plan

| Task ID | Description | Deps | Batch |
|---|---|---|---|
| P0-01 | Pre-flight gate: verify upstream exists | — | 1 |
| P1-01 | Write red test for feature A | P0-01 | 2 |
| P1-02 | Implement feature A | P1-01 | 3 |
| P2-01 | Write red test for feature B | P0-01 | 2 |
| P2-02 | Implement feature B | P2-01 | 3 |
| P3-01 | Integration test for both features | P1-02, P2-02 | 4 |

## Batch Breakdown

Batch 1: Pre-flight (P0-01)
Batch 2: Red tests (P1-01, P2-01)
Batch 3: Implementations (P1-02, P2-02)
Batch 4: Integration (P3-01)
