import type { Codemod } from "codemod:ast-grep";
import { useMetricAtom } from "codemod:metrics";
import {
  type Edit,
  type Lang,
  pairKeyText,
  pairValueNode,
  removePairEdit,
  rewriteStringSubstrings,
  unquote,
} from "./lib/ast.ts";

/**
 * OpenSearch 2.x → 3.0 — SQL plugin removals
 *
 * - Rewrite legacy OpenDistro SQL endpoint prefixes
 * - Remove removed settings / DSL responseFormat pairs
 * - Remove config pairs whose value is a SQL DELETE statement
 */
const REMOVED_KEYS = new Set([
  "plugins.sql.pagination.api",
  "plugins.sql.delete.enabled",
  "responseFormat",
]);

const metric = useMetricAtom("sql-plugin-removals");

function isDslResponseFormat(pair: import("codemod:ast-grep").SgNode<Lang>): boolean {
  if (pairKeyText(pair) !== "responseFormat") return false;
  const value = pairValueNode(pair);
  if (!value || value.kind() !== "string") return false;
  const parsed = unquote(value.text());
  return parsed?.value === "dsl";
}

function isDeleteSqlPair(pair: import("codemod:ast-grep").SgNode<Lang>): boolean {
  const value = pairValueNode(pair);
  if (!value || value.kind() !== "string") return false;
  const parsed = unquote(value.text());
  if (!parsed) return false;
  return /^\s*DELETE\s+FROM\b/i.test(parsed.value);
}

const codemod: Codemod<Lang> = (root) => {
  const rootNode = root.root();
  const edits: Edit[] = [];

  rewriteStringSubstrings(
    rootNode,
    [["/_opendistro/_sql", "/_plugins/_sql"]],
    edits,
    () => metric.increment({ kind: "opendistro-endpoint" }),
  );

  for (const pair of rootNode.findAll({ rule: { kind: "pair" } })) {
    const key = pairKeyText(pair);
    if (key && REMOVED_KEYS.has(key)) {
      if (key === "responseFormat" && !isDslResponseFormat(pair)) continue;
      edits.push(removePairEdit(pair));
      metric.increment({ kind: key });
      continue;
    }
    if (isDeleteSqlPair(pair)) {
      edits.push(removePairEdit(pair));
      metric.increment({ kind: "delete-sql-statement" });
    }
  }

  if (edits.length === 0) return null;
  return rootNode.commitEdits(edits);
};

export default codemod;
