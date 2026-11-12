import type { Codemod, SgNode } from "codemod:ast-grep";
import type TS from "codemod:ast-grep/langs/typescript";
import { useMetricAtom } from "codemod:metrics";

/**
 * OpenSearch 2.x → 3.0
 *
 * Remove deprecated k-NN plugin/index settings removed in 3.0.
 */
type Lang = TS;

const REMOVED = new Set([
  "knn.plugin.enabled",
  "index.knn.algo_param.ef_construction",
  "index.knn.algo_param.m",
  "index.knn.space_type",
]);

const metric = useMetricAtom("remove-deprecated-knn-settings");

function unquote(text: string): string | null {
  if (text.length < 2) return null;
  const quote = text[0]!;
  if ((quote !== '"' && quote !== "'") || text[text.length - 1] !== quote) {
    return null;
  }
  return text.slice(1, -1);
}

function pairKeyText(pair: SgNode<Lang>): string | null {
  const key = pair.children().find((child) => {
    const kind = child.kind();
    return kind === "string" || kind === "property_identifier";
  });
  if (!key) return null;
  if (key.kind() === "string") return unquote(key.text());
  return key.text();
}

function removePairEdit(pair: SgNode<Lang>) {
  const parent = pair.parent();
  if (!parent) return pair.replace("");
  const children = parent.children();
  const idx = children.findIndex((child) => child.id() === pair.id());
  if (idx < 0) return pair.replace("");

  const after = children[idx + 1];
  if (after && after.kind() === ",") {
    return {
      startPos: pair.range().start.index,
      endPos: after.range().end.index,
      insertedText: "",
    };
  }

  const before = children[idx - 1];
  if (before && before.kind() === ",") {
    return {
      startPos: before.range().start.index,
      endPos: pair.range().end.index,
      insertedText: "",
    };
  }

  return pair.replace("");
}

const codemod: Codemod<Lang> = (root) => {
  const rootNode = root.root();
  const edits: Array<ReturnType<SgNode<Lang>["replace"]> | {
    startPos: number;
    endPos: number;
    insertedText: string;
  }> = [];

  for (const pair of rootNode.findAll({ rule: { kind: "pair" } })) {
    const key = pairKeyText(pair);
    if (!key || !REMOVED.has(key)) continue;
    edits.push(removePairEdit(pair));
    metric.increment({ kind: key });
  }

  if (edits.length === 0) return null;
  return rootNode.commitEdits(edits);
};

export default codemod;
