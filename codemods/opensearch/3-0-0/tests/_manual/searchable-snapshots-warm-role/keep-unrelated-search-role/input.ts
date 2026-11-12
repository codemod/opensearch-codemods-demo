// 3.0 introduces a new search-only role for search replicas; do not rename blindly
export const searchReplicaNode = {
  "node.name": "search-replica-1",
  "node.roles": ["search"],
};
