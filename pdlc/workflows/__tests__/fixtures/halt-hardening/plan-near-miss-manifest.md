# Test Plan — file ownership manifest (near-miss header)

## Task table

| Task ID | Description | Deps |
|---|---|---|
| T-01 | Initialize config directory | — |
| T-02 | Create model loader | T-01 |
| T-03 | Write test suite | T-02 |

## File ownership (non-canonical header — should trigger loud diagnostic)

| Writers | Files |
|---|---|
| T-01 | `config/regime_model.json` |
| T-02 | `products/regime/config/model.py` |
| T-03 | `tests/regime/test_model_config.py` |
