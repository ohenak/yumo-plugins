---
name: se-implement-python
description: Python supplement for se-implement. Encodes the REQ-SKILL-03 four-gate quality bar — pytest, uv, ruff, ruff-format, mypy --strict, __all__, async/await idioms — to be loaded alongside the core SKILL.md when the assigned phase targets Python.
---

# se-implement Python Supplement

Load this file **in addition to** `SKILL.md` when the assigned phase targets Python. This supplement overrides or extends any language-neutral guidance in the core with Python-specific conventions. All four gates below are mandatory for every Python deliverable (REQ-SKILL-03).

---

## Language and Runtime

- **Language:** Python 3.11+ (type annotations required on all public symbols)
- **Package manager:** uv (use `uv` for installs, not pip directly)
- **Virtual environment:** managed by uv (`uv venv`, `uv pip install`)
- **Project config:** `pyproject.toml` (PEP 517/518 — no `setup.py`)

---

## Gate 1 — Tests: pytest

Use **pytest** for all unit and integration tests.

```python
# tests/unit/test_my_service.py
import pytest
from my_package.service import MyService
from tests.fixtures.fakes import FakeStore


def test_returns_none_when_record_not_found() -> None:
    store = FakeStore(records={})
    svc = MyService(store=store)
    result = svc.get("missing-id")
    assert result is None


@pytest.mark.asyncio
async def test_async_method_raises_on_transport_error() -> None:
    store = FakeStore(records={}, fail_on_next=True)
    svc = MyService(store=store)
    with pytest.raises(TransportError, match="store unavailable"):
        await svc.fetch("any-id")
```

Key pytest conventions:
- Test files: `test_<thing>.py` (snake_case, `test_` prefix)
- Test functions: `test_<behavior>()` (snake_case, `test_` prefix)
- Use `pytest.mark.asyncio` for async test functions (requires `pytest-asyncio`)
- Use `pytest.raises(ExcType, match=r"pattern")` for exception assertions
- Use `tmp_path` fixture for temporary file system operations
- Use `monkeypatch` for environment-variable overrides in tests

Run tests with:
```
uv run pytest                      # run all tests
uv run pytest tests/unit/          # unit tests only
uv run pytest -x --tb=short        # fail fast, short tracebacks
```

---

## Gate 2 — Linting: ruff

Use **ruff** for linting. Zero warnings is required before commit.

Configuration lives in `pyproject.toml`:
```toml
[tool.ruff]
line-length = 100
target-version = "py311"

[tool.ruff.lint]
select = ["E", "F", "I", "UP", "B", "C4", "SIM"]
```

Run:
```
uv run ruff check .                # lint
uv run ruff check --fix .          # auto-fix safe violations
```

---

## Gate 3 — Formatting: ruff-format

Use **ruff format** (ruff's built-in formatter) for all Python source. No manual formatting.

Run:
```
uv run ruff format .               # format in place
uv run ruff format --check .       # check without modifying (CI mode)
```

---

## Gate 4 — Type-checking: mypy --strict

All public symbols must carry complete type annotations. Run mypy in strict mode:

```
uv run mypy --strict src/
```

`mypy --strict` enables: `--disallow-any-generics`, `--disallow-untyped-defs`, `--disallow-incomplete-defs`, `--check-untyped-defs`, `--no-implicit-optional`, `--warn-return-any`, `--warn-unused-ignores`, among others.

Common patterns:
```python
# Always annotate return types
def parse_id(raw: str) -> str:
    return raw.strip()

# Use Optional carefully — prefer X | None (Python 3.10+ union syntax)
def find_record(record_id: str) -> MyRecord | None:
    ...

# Annotate class attributes
class MyService:
    _store: DataStore
    _logger: logging.Logger

    def __init__(self, store: DataStore, logger: logging.Logger) -> None:
        self._store = store
        self._logger = logger
```

---

## Module Public API — `__all__`

Every public module must declare `__all__` listing all symbols intended for external use.

```python
__all__ = [
    "MyService",
    "MyRecord",
    "TransportError",
]
```

Symbols absent from `__all__` are treated as private implementation details. This is checked by the `tech-lead-python` idiom checker.

---

## Async/Await Idioms

Follow these patterns for all async code:

```python
import asyncio
from collections.abc import AsyncIterator


# Prefer explicit coroutine functions over sync wrappers
async def fetch_data(url: str) -> bytes:
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as resp:
            return await resp.read()


# Avoid sync-in-async: never call blocking I/O directly inside an async function
# WRONG:
async def bad_example() -> str:
    return open("file.txt").read()   # blocks the event loop

# RIGHT:
async def good_example() -> str:
    return await asyncio.get_event_loop().run_in_executor(None, Path("file.txt").read_text)


# Always await asyncio.create_task() results — do not create and discard
# WRONG:
async def fire_and_forget() -> None:
    asyncio.create_task(some_coro())   # dangling task

# RIGHT:
async def properly_awaited() -> None:
    task = asyncio.create_task(some_coro())
    await task
```

---

## Dependency Injection — Python Pattern

Use constructor injection with abstract base classes or `Protocol` for service boundaries.

```python
from typing import Protocol


class DataStore(Protocol):
    async def insert(self, record: dict) -> None: ...
    async def find_by_id(self, record_id: str) -> dict | None: ...


class MyService:
    def __init__(self, store: DataStore, logger: logging.Logger) -> None:
        self._store = store
        self._logger = logger

    async def get(self, record_id: str) -> dict | None:
        return await self._store.find_by_id(record_id)
```

Use `dataclass` for plain data containers:
```python
from dataclasses import dataclass, field


@dataclass
class MyRecord:
    record_id: str
    payload: dict = field(default_factory=dict)
```

Avoid mutable default arguments — this is checked by the `tech-lead-python` idiom checker.

---

## Test Fakes

Write fakes as concrete classes implementing the Protocol:

```python
class FakeStore:
    def __init__(self, records: dict[str, dict] | None = None) -> None:
        self._records: dict[str, dict] = records or {}

    async def insert(self, record: dict) -> None:
        self._records[record["id"]] = record

    async def find_by_id(self, record_id: str) -> dict | None:
        return self._records.get(record_id)
```

Do not use `unittest.mock.MagicMock` as the primary test strategy — it bypasses type checking. Use fakes with correct signatures.

---

## Bare `except:` — Prohibited

Never use bare `except:` without an exception type. Always name the exception:

```python
# WRONG:
try:
    risky()
except:
    pass

# RIGHT:
try:
    risky()
except ValueError as exc:
    logger.warning("value error: %s", exc)
```

Bare `except:` is checked by the `tech-lead-python` idiom checker.

---

## No `print()` in Library Code

Use `logging.Logger` (or `yumo_core.logger.get_logger`) for all diagnostic output in library and service code. `print()` is only acceptable in CLI entrypoints and scripts.

This is checked by the `tech-lead-python` idiom checker.

---

## Schema Validation — jsonschema

Use **jsonschema** for JSON Schema validation in Python:

```python
import jsonschema

validator = jsonschema.Draft7Validator(
    schema=MY_SCHEMA,
    format_checker=jsonschema.FormatChecker(),
)
errors = list(validator.iter_errors(data))
if errors:
    raise ValueError(jsonschema.exceptions.best_match(errors).message)
```

All schemas must pass Python `jsonschema` validation in tests AND the TS-side `ajv` validator (cross-language parity — see TSPEC for the parity fixture catalog).

---

## Commit Conventions

Follow the project's conventional-commit format:

```
feat(scope): short present-tense summary
fix(scope): what the bug was and how it is fixed
test(scope): add / extend tests for X
refactor(scope): rename / restructure without behavior change
chore(scope): dependency bump, config change
```

One logical unit per commit. Tests and their implementation land in the same commit.
