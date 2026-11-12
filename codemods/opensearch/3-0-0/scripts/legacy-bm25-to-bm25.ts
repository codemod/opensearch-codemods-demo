import type { Codemod } from "codemod:ast-grep";
import { useMetricAtom } from "codemod:metrics";
import { type Edit, type Lang, rewriteExactStringMap } from "./lib/ast.ts";

/**
 * OpenSearch 2.x → 3.0
 *
 * Lucene BM25Similarity is the default; rewrite legacy BM25 type names.
 */
const MAP: Record<string, string> = {
  LegacyBM25Similarity: "BM25",
  LegacyBM25: "BM25",
};

const metric = useMetricAtom("legacy-bm25-to-bm25");

const codemod: Codemod<Lang> = (root) => {
  const rootNode = root.root();
  const edits: Edit[] = [];
  rewriteExactStringMap(rootNode, MAP, edits, (from) =>
    metric.increment({ kind: from }),
  );
  if (edits.length === 0) return null;
  return rootNode.commitEdits(edits);
};

export default codemod;
