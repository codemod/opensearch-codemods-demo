import type { Codemod } from "codemod:ast-grep";
import { useMetricAtom } from "codemod:metrics";
import {
  type Edit,
  type Lang,
  removeListElementEdit,
  rewriteExactStringMap,
  unquote,
} from "./lib/ast.ts";

/**
 * OpenSearch 2.x → 3.0
 *
 * transport-nio plugin removed — drop it from plugin lists and rewrite
 * nio-transport type strings to netty4.
 */
const metric = useMetricAtom("remove-transport-nio");

const codemod: Codemod<Lang> = (root) => {
  const rootNode = root.root();
  const edits: Edit[] = [];

  for (const node of rootNode.findAll({ rule: { kind: "string" } })) {
    const parsed = unquote(node.text());
    if (!parsed || parsed.value !== "transport-nio") continue;
    const parent = node.parent();
    if (parent && (parent.kind() === "array" || parent.kind() === "arguments")) {
      edits.push(removeListElementEdit(node));
      metric.increment({ kind: "plugin-list" });
    }
  }

  rewriteExactStringMap(
    rootNode,
    { "nio-transport": "netty4" },
    edits,
    () => metric.increment({ kind: "transport-type" }),
  );

  if (edits.length === 0) return null;
  return rootNode.commitEdits(edits);
};

export default codemod;
