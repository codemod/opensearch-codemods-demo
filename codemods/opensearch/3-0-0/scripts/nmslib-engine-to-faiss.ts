import type { Codemod } from "codemod:ast-grep";
import { useMetricAtom } from "codemod:metrics";
import {
  type Edit,
  type Lang,
  pairKeyText,
  pairValueNode,
  unquote,
} from "./lib/ast.ts";

/**
 * OpenSearch 2.x → 3.0
 *
 * NMSLIB engine is deprecated — rewrite engine: "nmslib" to "faiss".
 * Only touches the value of an `engine` object property.
 */
const metric = useMetricAtom("nmslib-engine-to-faiss");

const codemod: Codemod<Lang> = (root) => {
  const rootNode = root.root();
  const edits: Edit[] = [];

  for (const pair of rootNode.findAll({ rule: { kind: "pair" } })) {
    if (pairKeyText(pair) !== "engine") continue;
    const value = pairValueNode(pair);
    if (!value || value.kind() !== "string") continue;
    const parsed = unquote(value.text());
    if (!parsed || parsed.value !== "nmslib") continue;
    edits.push(value.replace(`${parsed.quote}faiss${parsed.quote}`));
    metric.increment({ kind: "engine-value" });
  }

  if (edits.length === 0) return null;
  return rootNode.commitEdits(edits);
};

export default codemod;
