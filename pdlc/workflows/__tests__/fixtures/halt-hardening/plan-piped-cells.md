# Test Plan — backticked pipe in description

| Task ID | Description | Deps | Status |
|---|---|---|---|
| T-01 | Set up initial config (no pipes here) | — | ⬚ |
| T-02 | Load type hints from specification like `list[str] \| None` for optional fields | T-01 | ⬚ |
| T-03 | Validate loader signature accepts `Optional[list[str]]` or `list[str] \| None` as type hints | T-02 | ⬚ |
| T-04 | Transform union types `int \| float \| None` into frozen registry entries | T-02 | ⬚ |
| T-05 | Reconcile registry against upstream specification, which uses `dict[str, Any] \| None` | T-03, T-04 | ⬚ |
| T-06 | Ship final artifact | T-05 | ⬚ |

## Notes

The description cells contain backticked pipes like `` `list[str] | None` `` and `` `int | float | None` ``.
These should not shift the Deps column, which is the third column and should remain parseable.
