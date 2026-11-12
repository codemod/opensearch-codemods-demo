import type { Codemod, SgNode } from "codemod:ast-grep";
import { useMetricAtom } from "codemod:metrics";
import { type Edit, type Lang } from "./lib/ast.ts";

/**
 * OpenSearch 2.x → 3.0
 *
 * Nodes API swapped total_indexing_buffer vs total_indexing_buffer_in_bytes
 * meanings. Swap property identifiers so consumers read the corrected fields.
 */
const SWAP: Record<string, string> = {
  total_indexing_buffer: "total_indexing_buffer_in_bytes",
  total_indexing_buffer_in_bytes: "total_indexing_buffer",
};

const metric = useMetricAtom("swap-indexing-buffer-fields");

function rewriteIdentifiers(rootNode: SgNode<Lang>, edits: Edit[]) {
  for (const kind of ["property_identifier", "identifier"] as const) {
    for (const node of rootNode.findAll({ rule: { kind } })) {
      const next = SWAP[node.text()];
      if (!next) continue;
      // Avoid rewriting import bindings / unrelated locals named similarly by
      // requiring property access or type-literal property shapes.
      if (kind === "identifier") {
        const parent = node.parent();
        if (!parent) continue;
        const pk = parent.kind();
        if (pk !== "pair" && pk !== "object_type" && pk !== "type_literal") {
          continue;
        }
      }
      edits.push(node.replace(next));
      metric.increment({ kind });
    }
  }
}

const codemod: Codemod<Lang> = (root) => {
  const rootNode = root.root();
  const edits: Edit[] = [];
  rewriteIdentifiers(rootNode, edits);
  if (edits.length === 0) return null;
  return rootNode.commitEdits(edits);
};

export default codemod;
