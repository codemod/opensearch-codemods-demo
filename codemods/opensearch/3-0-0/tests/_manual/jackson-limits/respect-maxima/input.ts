export function buildDeepPayload(depth: number): object {
  let node: object = { value: 1 };
  for (let i = 0; i < depth; i++) {
    node = { nested: node };
  }
  return node;
}

export const payload = buildDeepPayload(2000);
