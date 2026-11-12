# Manual / non-AST backlog

These fixtures document OpenSearch 3.0 breaks that are **not** safe or meaningful as
generic AST rewrites of application source (runtime/JDK ops, reindex/data-plane,
blind node-role renames, or transforms that would invent new control flow).

They are intentionally **not** wired into `npm test`. Prefer Migration Assistant /
ops runbooks / follow-up packages with stronger semantic gates.
