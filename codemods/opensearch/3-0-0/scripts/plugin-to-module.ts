import type { Codemod } from "codemod:ast-grep";
import { useMetricAtom } from "codemod:metrics";
import { type Edit, type Lang, unquote } from "./lib/ast.ts";

/**
 * OpenSearch 2.x → 3.0
 *
 * Module classes under modules/ dropped the Plugin suffix for JPMS clarity.
 * Only rewrites fully-qualified org.opensearch.* strings ending in Plugin.
 */
const metric = useMetricAtom("plugin-to-module");

const codemod: Codemod<Lang> = (root) => {
  const rootNode = root.root();
  const edits: Edit[] = [];

  for (const node of rootNode.findAll({ rule: { kind: "string" } })) {
    const parsed = unquote(node.text());
    if (!parsed) continue;
    if (!parsed.value.startsWith("org.opensearch.")) continue;
    if (!parsed.value.endsWith("Plugin")) continue;
    const next = `${parsed.value.slice(0, -"Plugin".length)}Module`;
    edits.push(node.replace(`${parsed.quote}${next}${parsed.quote}`));
    metric.increment({ kind: "fqcn" });
  }

  if (edits.length === 0) return null;
  return rootNode.commitEdits(edits);
};

export default codemod;
