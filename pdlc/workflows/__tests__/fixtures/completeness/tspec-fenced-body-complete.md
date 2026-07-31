# TSPEC — {feature-name}

## Overview

This specification describes the structural-completeness judgement and the pacing
wrapper that consumes it.

## Architecture

One pure judgement over document text, called by the episode's terminal test.

## Interfaces

```js
export function isComplete(artifactClass, docType, fileText)
//   → { complete: true } | { complete: false, missing: string[] }
```

## Data Model

The episode key is the tuple `(phaseId, docType, roundIndex, dispatchKind, mode)`.

## Test Strategy

Three acceptance tests over pinned fixtures plus one generated property over
document text.

## Open Questions

None outstanding at this revision.
