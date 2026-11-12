import type { Codemod, SgNode } from "codemod:ast-grep";
import type TS from "codemod:ast-grep/langs/typescript";
import { useMetricAtom } from "codemod:metrics";

/**
 * OpenSearch 2.x → 3.0
 *
 * Rename camelCase PathHierarchy tokenizer to snake_case path_hierarchy.
 * Pure AST string rewrite — no shared method names or symbol renames.
 */
type Lang = TS;

const metric = useMetricAtom("path-hierarchy-tokenizer");

function unquote(text: string): { quote: string; value: string } | null {
  if (text.length < 2) return null;
  const quote = text[0]!;
  if ((quote !== '"' && quote !== "'") || text[text.length - 1] !== quote) {
    return null;
  }
  return { quote, value: text.slice(1, -1) };
}

const codemod: Codemod<Lang> = (root) => {
  const rootNode = root.root();
  const edits: ReturnType<SgNode<Lang>["replace"]>[] = [];

  for (const node of rootNode.findAll({ rule: { kind: "string" } })) {
    const parsed = unquote(node.text());
    if (!parsed || parsed.value !== "PathHierarchy") continue;
    edits.push(node.replace(`${parsed.quote}path_hierarchy${parsed.quote}`));
    metric.increment({ kind: "string-literal" });
  }

  if (edits.length === 0) return null;
  return rootNode.commitEdits(edits);
};

export default codemod;
