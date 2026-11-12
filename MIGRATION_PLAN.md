# Migration plan: OpenSearch 2.x → 3.0.0

- Author: alexbit-codemod <alex@codemod.com>
- Registry: access=public, visibility=public
- Layout: `codemods/opensearch/<target-version>/`
- Path: `codemods/opensearch/3-0-0/`
- Sources:
  - https://github.com/opensearch-project/OpenSearch/releases/tag/3.0.0
  - https://docs.opensearch.org/latest/breaking-changes/#300
- Package(s):
  1. `opensearch-2-to-3-0` — multi-step: path_hierarchy tokenizer, query_group→workload_group, remove compatibility.override_main_response_version, remove deprecated k-NN settings
- Out of scope / manual:
  - Cluster data plane (reindex pre-2.x indexes, system indexes, live traffic) — Migration Assistant
  - JDK 21 runtime requirement
  - Searchable-snapshot `search`→`warm` node role (3.0 also introduces a new `search` role; unsafe to blind-rename)
  - Security Blake2b salt, Romanian analyzer reindex
  - Dashboards UI / Performance Analyzer RCA removals
  - Java client AST (non-inclusive term renames) — follow-up package
- Test plan: fixtures per step + `workflow validate` + `validate_codemod_package` + package tests
