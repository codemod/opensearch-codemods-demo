export async function listIndexes(client: { cat: { indices: (o: object) => Promise<Array<{ index: string; "creation.date.string"?: string }>> } }) {
  return client.cat.indices({ format: "json" });
}
