import type { Codemod, SgNode } from "codemod:ast-grep";
import { useMetricAtom } from "codemod:metrics";
import {
  type Edit,
  type Lang,
  rewriteExactStringMap,
  rewriteStringSubstrings,
} from "./lib/ast.ts";

/**
 * OpenSearch 2.x → 3.0
 *
 * Replace removed non-inclusive API/config terms with OpenSearch 3.0 names.
 * Uses exact identifier / setting / path maps — not open-ended regex.
 */
const PROPERTY_MAP: Record<string, string> = {
  blacklist: "deny_list",
  whitelist: "allow_list",
  ip_blacklist: "ip_deny_list",
  ip_whitelist: "ip_allow_list",
  master_timeout: "cluster_manager_timeout",
};

const STRING_EXACT: Record<string, string> = {
  "cluster.initial_master_nodes": "cluster.initial_cluster_manager_nodes",
  master_timeout: "cluster_manager_timeout",
};

const metric = useMetricAtom("non-inclusive-terms");

function rewritePropertyIdentifiers(rootNode: SgNode<Lang>, edits: Edit[]) {
  for (const node of rootNode.findAll({ rule: { kind: "property_identifier" } })) {
    const next = PROPERTY_MAP[node.text()];
    if (!next) continue;
    edits.push(node.replace(next));
    metric.increment({ kind: "property-identifier" });
  }
}

const codemod: Codemod<Lang> = (root) => {
  const rootNode = root.root();
  const edits: Edit[] = [];

  rewritePropertyIdentifiers(rootNode, edits);
  rewriteExactStringMap(rootNode, STRING_EXACT, edits, () =>
    metric.increment({ kind: "string-literal" }),
  );
  rewriteStringSubstrings(
    rootNode,
    [["/_cat/master", "/_cat/cluster_manager"]],
    edits,
    () => metric.increment({ kind: "string-substring" }),
  );

  if (edits.length === 0) return null;
  return rootNode.commitEdits(edits);
};

export default codemod;
