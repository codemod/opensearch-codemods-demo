import type { Codemod, SgNode } from "codemod:ast-grep";
import { useMetricAtom } from "codemod:metrics";
import {
  type Edit,
  type Lang,
  rewriteExactStringMap,
  unquote,
} from "./lib/ast.ts";

/**
 * OpenSearch 2.x → 3.0 — ML Commons
 *
 * - CatIndexTool → ListIndexTool (string + literal type names)
 * - Removed batch ingestion endpoint string → Data Prepper docs URL
 */
const STRING_MAP: Record<string, string> = {
  CatIndexTool: "ListIndexTool",
  "/_plugins/_ml/_batch_ingestion":
    "https://opensearch.org/docs/latest/data-prepper/",
};

const metric = useMetricAtom("ml-commons");

function rewriteLiteralTypeNames(rootNode: SgNode<Lang>, edits: Edit[]) {
  for (const node of rootNode.findAll({ rule: { kind: "literal_type" } })) {
    const text = node.text();
    const parsed = unquote(text);
    if (!parsed) continue;
    const next = STRING_MAP[parsed.value];
    if (next === undefined) continue;
    edits.push(node.replace(`${parsed.quote}${next}${parsed.quote}`));
    metric.increment({ kind: "literal-type" });
  }
}

const codemod: Codemod<Lang> = (root) => {
  const rootNode = root.root();
  const edits: Edit[] = [];
  rewriteExactStringMap(rootNode, STRING_MAP, edits, (from) =>
    metric.increment({ kind: from }),
  );
  rewriteLiteralTypeNames(rootNode, edits);
  if (edits.length === 0) return null;
  return rootNode.commitEdits(edits);
};

export default codemod;
