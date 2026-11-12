export async function bulkIndex(
  client: { bulk: (body: object) => Promise<unknown> },
  id: string,
  doc: object,
) {
  return client.bulk({
    body: [{ index: { _index: "logs", _id: id } }, doc],
  });
}
