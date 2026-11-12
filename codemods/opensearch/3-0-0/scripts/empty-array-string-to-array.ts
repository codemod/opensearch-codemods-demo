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
 * Empty-array string forms like "[]" for node.roles are now treated as [].
 * Normalize checked-in config objects to a real empty array literal.
 */
const metric = useMetricAtom("empty-array-string-to-array");

const codemod: Codemod<Lang> = (root) => {
  const rootNode = root.root();
  const edits: Edit[] = [];

  for (const pair of rootNode.findAll({ rule: { kind: "pair" } })) {
    if (pairKeyText(pair) !== "node.roles") continue;
    const value = pairValueNode(pair);
    if (!value || value.kind() !== "string") continue;
    const parsed = unquote(value.text());
    if (!parsed || parsed.value !== "[]") continue;
    edits.push(value.replace("[]"));
    metric.increment({ kind: "node.roles" });
  }

  if (edits.length === 0) return null;
  return rootNode.commitEdits(edits);
};

export default codemod;
