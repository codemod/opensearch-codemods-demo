export const policy = {
  permissions: [
    "cluster:admin/opensearch/drep/execute",
    "thread_context:stash_and_merge_headers",
    "thread_context:stash_with_origin",
    "thread_context:mark_as_system_context",
  ],
};
