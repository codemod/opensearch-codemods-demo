import type { Codemod } from "codemod:ast-grep";
import { useMetricAtom } from "codemod:metrics";
import { type Edit, type Lang, rewriteExactStringMap } from "./lib/ast.ts";

/**
 * OpenSearch 2.x → 3.0
 *
 * JPMS split-package cleanup moved transport client types under
 * org.opensearch.transport.client.
 */
const MAP: Record<string, string> = {
  "org.opensearch.client.RestClient":
    "org.opensearch.transport.client.RestClient",
  "org.opensearch.client.RestHighLevelClient":
    "org.opensearch.transport.client.RestHighLevelClient",
};

const metric = useMetricAtom("jpms-client-package");

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
