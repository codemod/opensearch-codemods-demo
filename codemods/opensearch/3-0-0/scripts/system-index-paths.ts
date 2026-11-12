import type { Codemod } from "codemod:ast-grep";
import { useMetricAtom } from "codemod:metrics";
import { type Edit, type Lang, rewriteExactStringMap } from "./lib/ast.ts";

/**
 * OpenSearch 2.x → 3.0
 *
 * Direct REST access to system indexes was removed — rewrite known paths to
 * supported APIs.
 */
const MAP: Record<string, string> = {
  "/.opendistro_security/_search":
    "/_plugins/_security/api/securityconfig",
  "/.tasks/_search": "/_tasks",
  "/.kibana/_search": "/_plugins/_kibana/api/saved_objects/_find",
};

const metric = useMetricAtom("system-index-paths");

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
