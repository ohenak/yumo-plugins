---
feature: test-feature
---

# Properties Document: Test Feature

| Field | Value |
|---|---|
| Upstream | REQ → FSPEC → TSPEC → PLAN → **PROPERTIES** |
| Downstream | test suite |

## Overview

This document specifies the testable properties for the test feature. Three key deliverables are addressed with comprehensive oracle coverage.

## Properties

**PROP-TEST-001 (basic property).** The system must correctly initialize the configuration store. When loading a well-formed config file with schema version 1, the loader returns a frozen dataclass with registry and sections attributes.

**PROP-TEST-002 (error handling).** When an unpermitted owner is specified in the registry, the loader must raise `TestConfigError` with a message naming the offending owner token and the permitted set.

## Test Oracles

**Orbit-01.** Configuration can be loaded and accessed through immutable mappings.

**Orbit-02.** Schema version mismatch is detected and reported with the actual and supported versions named.

**Orbit-03.** Multi-fault files report only the first detected fault in document order.

## Test Data

**Fixture-A.** Well-formed config file with schema version 1 and four owner entries.

**Fixture-B.** Config file with unpermitted owner token in registry.

**Fixture-C.** Config file with missing schema version field.

**Fixture-D.** Config file with non-integer schema version.

## Gaps

No known gaps at this time. All properties are discharged by the test suite.
