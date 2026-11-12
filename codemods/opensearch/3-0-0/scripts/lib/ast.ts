import type { SgNode } from "codemod:ast-grep";
import type TS from "codemod:ast-grep/langs/typescript";

export type Lang = TS;

export type Edit =
  | ReturnType<SgNode<Lang>["replace"]>
  | { startPos: number; endPos: number; insertedText: string };

export function unquote(
  text: string,
): { quote: string; value: string } | null {
  if (text.length < 2) return null;
  const quote = text[0]!;
  if ((quote !== '"' && quote !== "'") || text[text.length - 1] !== quote) {
    return null;
  }
  return { quote, value: text.slice(1, -1) };
}

export function pairKeyText(pair: SgNode<Lang>): string | null {
  const key = pair.children().find((child) => {
    const kind = child.kind();
    return kind === "string" || kind === "property_identifier";
  });
  if (!key) return null;
  if (key.kind() === "string") {
    const parsed = unquote(key.text());
    return parsed?.value ?? null;
  }
  return key.text();
}

export function pairValueNode(pair: SgNode<Lang>): SgNode<Lang> | null {
  const children = pair.children();
  const colon = children.findIndex((child) => child.kind() === ":");
  if (colon < 0) return null;
  for (let i = colon + 1; i < children.length; i++) {
    const child = children[i]!;
    if (child.kind() === ",") continue;
    return child;
  }
  return null;
}

export function removePairEdit(pair: SgNode<Lang>): Edit {
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

/** Remove a node from an array/arguments list, including a neighboring comma. */
export function removeListElementEdit(node: SgNode<Lang>): Edit {
  const parent = node.parent();
  if (!parent) return node.replace("");
  const children = parent.children();
  const idx = children.findIndex((child) => child.id() === node.id());
  if (idx < 0) return node.replace("");

  const after = children[idx + 1];
  if (after && after.kind() === ",") {
    return {
      startPos: node.range().start.index,
      endPos: after.range().end.index,
      insertedText: "",
    };
  }

  const before = children[idx - 1];
  if (before && before.kind() === ",") {
    return {
      startPos: before.range().start.index,
      endPos: node.range().end.index,
      insertedText: "",
    };
  }

  return node.replace("");
}

export function rewriteExactStringMap(
  rootNode: SgNode<Lang>,
  map: Record<string, string>,
  edits: Edit[],
  onHit?: (from: string) => void,
): void {
  for (const node of rootNode.findAll({ rule: { kind: "string" } })) {
    const parsed = unquote(node.text());
    if (!parsed) continue;
    const next = map[parsed.value];
    if (next === undefined) continue;
    edits.push(node.replace(`${parsed.quote}${next}${parsed.quote}`));
    onHit?.(parsed.value);
  }
}

export function rewriteStringSubstrings(
  rootNode: SgNode<Lang>,
  replacements: Array<[from: string, to: string]>,
  edits: Edit[],
  onHit?: () => void,
): void {
  for (const node of rootNode.findAll({ rule: { kind: "string" } })) {
    const parsed = unquote(node.text());
    if (!parsed) continue;
    let next = parsed.value;
    for (const [from, to] of replacements) {
      if (!next.includes(from)) continue;
      next = next.split(from).join(to);
    }
    if (next === parsed.value) continue;
    edits.push(node.replace(`${parsed.quote}${next}${parsed.quote}`));
    onHit?.();
  }
}
