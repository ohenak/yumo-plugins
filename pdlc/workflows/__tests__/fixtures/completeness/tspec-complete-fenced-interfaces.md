# TSPEC — fenced-interfaces

**Feature:** fenced-interfaces
**Status:** Approved

## 1. Overview

This document specifies the fenced-interfaces feature: one module, one seam, no new
dependency. It exists so that a document whose `## Interfaces` section is expressed
entirely as a signature block is scored honestly.

## 2. Architecture

A single pure module sits behind the existing dispatcher. No process boundary is
crossed and no state is retained between calls.

## 3. Interfaces

```js
export function resolveTopology(nodes, edges)
//   → { ok: true, order: string[] } | { ok: false, reason: "cycle", nodes: string[] }
```

## 4. Data Model

A node is `{ id: string, deps: string[] }`. Nothing is persisted; the graph is rebuilt
from the manifest on every call.

## 5. Test Strategy

Unit tests over the pure resolver, plus one integration test that drives the dispatcher
end to end against a three-node manifest.

## 6. Open Questions

None outstanding. The one carried question — whether a cycle should halt or degrade —
was closed in favour of halting.
