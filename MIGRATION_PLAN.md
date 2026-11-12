# Migration plan: OpenSearch 2.x → 3.0.0

- Author: alexbit-codemod <alex@codemod.com>
- Registry: access=public, visibility=public
- Layout: `codemods/opensearch/<target-version>/`
- Path: `codemods/opensearch/3-0-0/`
- Sources:
  - https://github.com/opensearch-project/OpenSearch/releases/tag/3.0.0
  - https://docs.opensearch.org/latest/breaking-changes/#300
- Package(s):
  1. `opensearch-2-x-to-3-0` — multi-step AST transforms for checked-in TS/JS config and API strings (see package README for the full step list)
- Break inventory (summary):
  - **codemod:** PathHierarchy, query→workload group, compatibility override, k-NN settings, mmap extensions, thread_pool.test_*, bulk batch_size, discover:newExperience, SQL OpenDistro/DSL/delete settings, LegacyBM25, NMSLIB engine, COMPAT→CLDR, HttpClient5 class names, JPMS client package, ML Commons tool/URL, non-inclusive terms, Plugin→Module FQCNs, transport-nio, indexing-buffer field swap, node.roles `"[]"`→`[]`, JDK21 markers, system-index paths, Dashboards gantt/notebook strings
  - **manual** (see `tests/_manual/`): pre-2.x reindex / system-index ops beyond path rewrite, searchable-snapshot `search`→`warm` (unsafe vs new search-only role), Blake2b/Romanian reindex behavior, PA RCA port rewrite as object synthesis, painless Joda script rewrites, ID-length/Jackson/nested-depth control-flow injection, node.roles coordinating-empty heuristics
- Test plan: wired `jssg test` per step + `workflow validate` + package `npm test`
