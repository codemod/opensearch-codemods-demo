export function buildDeepPayload(depth: number): object {
  const capped = Math.min(depth, 1000);
  let node: object = { value: 1 };
  for (let i = 0; i < capped; i++) {
    node = { nested: node };
  }
  return node;
}

export const payload = buildDeepPayload(1000);
