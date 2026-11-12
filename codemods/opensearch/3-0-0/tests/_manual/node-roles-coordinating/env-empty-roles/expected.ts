export const env = {
  OPENSEARCH_JAVA_OPTS: "-Xms1g -Xmx1g",
  // Pre-3.0 env form was ambiguous; 3.0 treats empty node.roles as coordinating-only
  "node.roles": "",
};
