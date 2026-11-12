import type { Codemod, SgNode } from "codemod:ast-grep";
import { useMetricAtom } from "codemod:metrics";
import {
  type Edit,
  type Lang,
  pairKeyText,
  pairValueNode,
  unquote,
} from "./lib/ast.ts";

/**
 * OpenSearch 2.x → 3.0
 *
 * JDK 21 is the minimum runtime — bump engines.java ">=17" and known
 * eclipse-temurin:17 image tags in string/template literals.
 */
const metric = useMetricAtom("jdk21-runtime");

function rewriteTemurinTags(rootNode: SgNode<Lang>, edits: Edit[]) {
  for (const kind of ["string", "template_string"] as const) {
    for (const node of rootNode.findAll({ rule: { kind } })) {
      const text = node.text();
      if (!text.includes("eclipse-temurin:17")) continue;
      const next = text.split("eclipse-temurin:17").join("eclipse-temurin:21");
      if (next === text) continue;
      edits.push(node.replace(next));
      metric.increment({ kind: "temurin-image" });
    }
  }
}

function rewriteEnginesJava(rootNode: SgNode<Lang>, edits: Edit[]) {
  for (const pair of rootNode.findAll({ rule: { kind: "pair" } })) {
    if (pairKeyText(pair) !== "java") continue;
    const value = pairValueNode(pair);
    if (!value || value.kind() !== "string") continue;
    const parsed = unquote(value.text());
    if (!parsed || parsed.value !== ">=17") continue;

    // Confirm an ancestor pair key is engines
    let cursor: SgNode<Lang> | null = pair.parent();
    let underEngines = false;
    while (cursor) {
      if (cursor.kind() === "pair" && pairKeyText(cursor) === "engines") {
        underEngines = true;
        break;
      }
      cursor = cursor.parent();
    }
    if (!underEngines) continue;

    edits.push(value.replace(`${parsed.quote}>=21${parsed.quote}`));
    metric.increment({ kind: "engines.java" });
  }
}

const codemod: Codemod<Lang> = (root) => {
  const rootNode = root.root();
  const edits: Edit[] = [];
  rewriteEnginesJava(rootNode, edits);
  rewriteTemurinTags(rootNode, edits);
  if (edits.length === 0) return null;
  return rootNode.commitEdits(edits);
};

export default codemod;
