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
 * Remove index.store.hybrid.mmap.extensions (removed with hybridfs improvements).
 */
const REMOVED = new Set(["index.store.hybrid.mmap.extensions"]);
const metric = useMetricAtom("remove-mmap-extensions");

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
