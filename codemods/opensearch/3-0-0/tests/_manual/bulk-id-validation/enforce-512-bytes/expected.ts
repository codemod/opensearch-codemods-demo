export async function bulkIndex(
  client: { bulk: (body: object) => Promise<unknown> },
  id: string,
  doc: object,
) {
  if (new TextEncoder().encode(id).length > 512) {
    throw new Error("document _id exceeds OpenSearch 3.0 512-byte limit");
  }
  return client.bulk({
    body: [{ index: { _index: "logs", _id: id } }, doc],
  });
}
