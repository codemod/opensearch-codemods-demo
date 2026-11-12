import type { Codemod } from "codemod:ast-grep";
import { useMetricAtom } from "codemod:metrics";
import {
  type Edit,
  type Lang,
  pairKeyText,
  removePairEdit,
} from "./lib/ast.ts";

/**
 * OpenSearch 2.x → 3.0
 *
 * Remove deprecated k-NN plugin/index settings removed in 3.0.
 */
const REMOVED = new Set([
  "knn.plugin.enabled",
  "index.knn.algo_param.ef_construction",
  "index.knn.algo_param.m",
  "index.knn.space_type",
]);

const metric = useMetricAtom("remove-deprecated-knn-settings");

const codemod: Codemod<Lang> = (root) => {
  const rootNode = root.root();
  const edits: Edit[] = [];

  for (const pair of rootNode.findAll({ rule: { kind: "pair" } })) {
    const key = pairKeyText(pair);
    if (!key || !REMOVED.has(key)) continue;
    edits.push(removePairEdit(pair));
    metric.increment({ kind: key });
  }

  if (edits.length === 0) return null;
  return rootNode.commitEdits(edits);
};

export default codemod;
