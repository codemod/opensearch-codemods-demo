import type { Codemod } from "codemod:ast-grep";
import { useMetricAtom } from "codemod:metrics";
import {
  type Edit,
  type Lang,
  pairKeyText,
  pairValueNode,
  rewriteExactStringMap,
  unquote,
} from "./lib/ast.ts";

/**
 * OpenSearch 2.x → 3.0 — Dashboards-related checked-in config
 *
 * - Gantt / dashboards-visualizations → Vega
 * - Legacy notebooks index → .kibana; legacy flag false
 *
 * Does not invent explanatory `note` fields.
 */
const STRING_MAP: Record<string, string> = {
  gantt_vis: "vega",
  "dashboards-visualizations": "vis_type_vega",
  ".opensearch-observability": ".kibana",
};

const metric = useMetricAtom("dashboards-migrations");

const codemod: Codemod<Lang> = (root) => {
  const rootNode = root.root();
  const edits: Edit[] = [];

  rewriteExactStringMap(rootNode, STRING_MAP, edits, (from) =>
    metric.increment({ kind: from }),
  );

  for (const pair of rootNode.findAll({ rule: { kind: "pair" } })) {
    if (pairKeyText(pair) !== "legacy") continue;
    const value = pairValueNode(pair);
    if (!value || value.kind() !== "true") continue;
    // Only flip legacy: true → false when the same object also references
    // observability notebook storage (after or before string rewrite).
    const obj = pair.parent();
    if (!obj) continue;
    const objText = obj.text();
    if (
      !objText.includes(".opensearch-observability") &&
      !objText.includes(".kibana")
    ) {
      continue;
    }
    edits.push(value.replace("false"));
    metric.increment({ kind: "legacy-flag" });
  }

  if (edits.length === 0) return null;
  return rootNode.commitEdits(edits);
};

export default codemod;
