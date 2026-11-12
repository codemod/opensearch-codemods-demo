import type { Codemod } from "codemod:ast-grep";
import { useMetricAtom } from "codemod:metrics";
import { type Edit, type Lang, rewriteStringSubstrings } from "./lib/ast.ts";

/**
 * OpenSearch 2.x → 3.0
 *
 * Rename WLM query groups to workload groups in paths, setting keys, and IDs.
 * Pure AST rewrites of string literals and property identifiers.
 */
const metric = useMetricAtom("query-group-to-workload-group");

const codemod: Codemod<Lang> = (root) => {
  const rootNode = root.root();
  const edits: Edit[] = [];

  rewriteStringSubstrings(
    rootNode,
    [
      ["wlm/query_group", "wlm/workload_group"],
      ["wlm.query_group", "wlm.workload_group"],
      ["queryGroupID", "workloadGroupID"],
    ],
    edits,
    () => metric.increment({ kind: "string-literal" }),
  );

  for (const node of rootNode.findAll({
    rule: { kind: "property_identifier", regex: "^queryGroupID$" },
  })) {
    edits.push(node.replace("workloadGroupID"));
    metric.increment({ kind: "property-identifier" });
  }

  if (edits.length === 0) return null;
  return rootNode.commitEdits(edits);
};

export default codemod;
