import type { Codemod } from "codemod:ast-grep";
import { useMetricAtom } from "codemod:metrics";
import {
  type Edit,
  type Lang,
  pairKeyText,
  removePairEdit,
} from "./lib/ast.ts";

/**
 * OpenSearch 2.x → 3.0
 *
 * Remove removed setting compatibility.override_main_response_version.
 */
const SETTING = "compatibility.override_main_response_version";
const metric = useMetricAtom("remove-compatibility-override");

const codemod: Codemod<Lang> = (root) => {
  const rootNode = root.root();
  const edits: Edit[] = [];

  for (const pair of rootNode.findAll({ rule: { kind: "pair" } })) {
    if (pairKeyText(pair) !== SETTING) continue;
    edits.push(removePairEdit(pair));
    metric.increment({ kind: "object-pair" });
  }

  if (edits.length === 0) return null;
  return rootNode.commitEdits(edits);
};

export default codemod;
