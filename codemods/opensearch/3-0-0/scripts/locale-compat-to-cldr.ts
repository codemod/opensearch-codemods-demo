import type { Codemod } from "codemod:ast-grep";
import { useMetricAtom } from "codemod:metrics";
import { type Edit, type Lang, rewriteStringSubstrings } from "./lib/ast.ts";

/**
 * OpenSearch 2.x → 3.0
 *
 * COMPAT locale provider removed — rewrite JVM locale provider flags to CLDR.
 */
const metric = useMetricAtom("locale-compat-to-cldr");

const codemod: Codemod<Lang> = (root) => {
  const rootNode = root.root();
  const edits: Edit[] = [];
  rewriteStringSubstrings(
    rootNode,
    [["-Djava.locale.providers=COMPAT", "-Djava.locale.providers=CLDR"]],
    edits,
    () => metric.increment({ kind: "jvm-flag" }),
  );
  if (edits.length === 0) return null;
  return rootNode.commitEdits(edits);
};

export default codemod;
