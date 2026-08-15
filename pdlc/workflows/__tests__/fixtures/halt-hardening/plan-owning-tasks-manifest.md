# Test Plan — file ownership manifest (canonical header)

## Task table

| Task ID | Description | Deps |
|---|---|---|
| T-01 | Initialize config directory | — |
| T-02 | Create model loader | T-01 |
| T-03 | Write test suite | T-02 |

## File ownership manifest

| Owning task(s) | Files |
|---|---|
| T-01 | `config/regime_model.json` |
| T-02 | `products/regime/config/model.py`, `products/regime/config/__init__.py` |
| T-03 | `tests/regime/test_model_config.py`, `tests/regime/fixtures/model_config/*.json` |
