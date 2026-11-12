import type { Codemod } from "codemod:ast-grep";
import { useMetricAtom } from "codemod:metrics";
import { type Edit, type Lang, rewriteExactStringMap } from "./lib/ast.ts";

/**
 * OpenSearch 2.x → 3.0
 *
 * Client transports moved to Apache HttpClient / Core 5.x — rewrite known
 * HttpAsyncClient class name strings checked into TS config/docs helpers.
 */
const MAP: Record<string, string> = {
  "org.apache.http.impl.nio.client.HttpAsyncClientBuilder":
    "org.apache.hc.client5.http.impl.async.HttpAsyncClientBuilder",
  "org.apache.http.nio.entity.NStringEntity":
    "org.apache.hc.core5.http.io.entity.StringEntity",
};

const metric = useMetricAtom("httpclient5-imports");

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
