# opensearch-codemods-demo

Codemod packages for OpenSearch application-side version migrations.

## Layout

```text
codemods/
  opensearch/
    <target-version>/    # e.g. 3-0-0
```

Each target-version folder is a Codemod package (`codemod.yaml`, `workflow.yaml`, scripts, fixtures).

## Current packages

| Path | Registry name | Migration |
| --- | --- | --- |
| `codemods/opensearch/3-0-0` | `opensearch-2-x-to-3-0` | OpenSearch 2.x → 3.0 (app/config) |

Cluster data / traffic migration remains in [opensearch-migrations](https://github.com/opensearch-project/opensearch-migrations).
