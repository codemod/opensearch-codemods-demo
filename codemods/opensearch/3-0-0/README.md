# opensearch-2-to-3-0

Migrate OpenSearch **application code and checked-in config objects** from 2.x to 3.0.

This package rewrites TypeScript/JavaScript sources. It does **not** migrate cluster data or live traffic — use [OpenSearch Migration Assistant](https://github.com/opensearch-project/opensearch-migrations) for that.

## What it changes

1. **PathHierarchy → path_hierarchy** tokenizer name in string literals
2. **Query groups → workload groups** (`wlm/query_group`, `wlm.query_group`, `queryGroupID`)
3. **Removes** `compatibility.override_main_response_version` object properties
4. **Removes** deprecated k-NN settings:
   - `knn.plugin.enabled`
   - `index.knn.algo_param.ef_construction`
   - `index.knn.algo_param.m`
   - `index.knn.space_type`

Transforms are pure AST string/property rewrites (no `semantic_analysis`) because they match exact literals and object keys, not shared method names or import-bound symbols.

## Out of scope

- Reindexing pre-2.x indexes / system indexes
- JDK 21 runtime requirement
- Blind `search` → `warm` node-role renames (3.0 also adds a new `search` role)
- Java client API renames, Dashboards UI, Performance Analyzer RCA

## Run

```bash
npx codemod@latest opensearch-2-to-3-0 --target .
```

## Test

```bash
npm test
```
