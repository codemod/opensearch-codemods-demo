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
 * Remove deprecated thread_pool.test min/max queue size settings.
 */
const REMOVED = new Set(["thread_pool.test.min_queue_size", "thread_pool.test.max_queue_size"]);
const metric = useMetricAtom("remove-thread-pool-test-settings");

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
