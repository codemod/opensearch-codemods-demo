import type { Codemod, SgNode } from "codemod:ast-grep";
import type TS from "codemod:ast-grep/langs/typescript";
import { useMetricAtom } from "codemod:metrics";

/**
 * OpenSearch 2.x → 3.0
 *
 * Rename WLM query groups to workload groups in paths, setting keys, and IDs.
 * Pure AST rewrites of string literals and property identifiers.
 */
type Lang = TS;

const metric = useMetricAtom("query-group-to-workload-group");

function unquote(text: string): { quote: string; value: string } | null {
  if (text.length < 2) return null;
  const quote = text[0]!;
  if ((quote !== '"' && quote !== "'") || text[text.length - 1] !== quote) {
    return null;
  }
  return { quote, value: text.slice(1, -1) };
}

function rewriteStringValue(value: string): string | null {
  let next = value;
  next = next.split("wlm/query_group").join("wlm/workload_group");
  next = next.split("wlm.query_group").join("wlm.workload_group");
  next = next.split("queryGroupID").join("workloadGroupID");
  if (next === value) return null;
  return next;
}

const codemod: Codemod<Lang> = (root) => {
  const rootNode = root.root();
  const edits: ReturnType<SgNode<Lang>["replace"]>[] = [];

  for (const node of rootNode.findAll({ rule: { kind: "string" } })) {
    const parsed = unquote(node.text());
    if (!parsed) continue;
    const next = rewriteStringValue(parsed.value);
    if (!next) continue;
    edits.push(node.replace(`${parsed.quote}${next}${parsed.quote}`));
    metric.increment({ kind: "string-literal" });
  }

  for (const node of rootNode.findAll({
    rule: { kind: "property_identifier", regex: "^queryGroupID$" },
  })) {
    edits.push(node.replace("workloadGroupID"));
    metric.increment({ kind: "property-identifier" });
  }

  if (edits.length === 0) return null;
  return rootNode.commitEdits(edits);
};

export default codemod;
