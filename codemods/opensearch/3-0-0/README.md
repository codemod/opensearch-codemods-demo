# opensearch-2-x-to-3-0

Migrate OpenSearch **application code and checked-in config objects** from 2.x to 3.0.

This package rewrites TypeScript/JavaScript sources with **AST edits** (ast-grep / JSSG). It does **not** migrate cluster data or live traffic — use [OpenSearch Migration Assistant](https://github.com/opensearch-project/opensearch-migrations) for that.

## What it changes

Multi-step `workflow.yaml` (one focused transform per break):

1. **PathHierarchy → path_hierarchy** tokenizer name
2. **Query groups → workload groups** (`wlm/query_group`, `wlm.query_group`, `queryGroupID`)
3. **Remove** `compatibility.override_main_response_version`
4. **Remove** deprecated k-NN settings (`knn.plugin.enabled`, `index.knn.algo_param.*`, `index.knn.space_type`)
5. **Remove** `index.store.hybrid.mmap.extensions`
6. **Remove** deprecated `thread_pool.test.{min,max}_queue_size`
7. **Remove** deprecated bulk `batch_size`
8. **Remove** Dashboards `discover:newExperience`
9. **SQL plugin** — OpenDistro → `_plugins/_sql` endpoints; remove pagination/delete settings, DSL `responseFormat`, and DELETE SQL config pairs
10. **LegacyBM25 / LegacyBM25Similarity → BM25**
11. **NMSLIB `engine` → `faiss`** (only the `engine` property value)
12. **COMPAT → CLDR** locale provider JVM flags
13. **HttpClient 4.x → 5.x** known class-name strings
14. **JPMS** `org.opensearch.client.Rest*` → `org.opensearch.transport.client.Rest*`
15. **ML Commons** `CatIndexTool` → `ListIndexTool`; batch-ingestion URL → Data Prepper docs URL
16. **Non-inclusive terms** (`blacklist`/`whitelist`/`master` API/config names)
17. **`…Plugin` → `…Module`** for `org.opensearch.*` FQCNs
18. **Remove `transport-nio`** from plugin lists; `nio-transport` → `netty4`
19. **Swap** Nodes API `total_indexing_buffer` / `total_indexing_buffer_in_bytes` consumers
20. **Normalize** `node.roles: "[]"` → `[]`
21. **JDK 21** markers (`engines.java` `>=17`→`>=21`, `eclipse-temurin:17`→`:21`)
22. **System-index REST paths** → supported APIs
23. **Dashboards** Gantt/visualizations + legacy notebook index strings

Transforms operate on AST nodes (string literals, object pairs, property identifiers, array elements, template strings). They do **not** invent new control flow.

## Out of scope / manual

See `tests/_manual/` for documented backlog (reindex/data-plane, blind `search`→`warm` role renames, painless script rewrites, control-flow injection, etc.).

## Run

```bash
npx codemod@latest opensearch-2-x-to-3-0 --target .
```

## Test

```bash
npm test
```
