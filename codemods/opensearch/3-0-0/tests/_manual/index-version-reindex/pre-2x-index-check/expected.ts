export async function listIndexes(client: {
  cat: { indices: (o: object) => Promise<Array<{ index: string; "creation.date.string"?: string }>> };
  indices: { get: (o: object) => Promise<Record<string, { settings?: { index?: { version?: { created?: string } } } }>> };
}) {
  const indices = await client.cat.indices({ format: "json" });
  // Indexes created before 2.x must be reindexed before / during upgrade to 3.0
  for (const row of indices) {
    const meta = await client.indices.get({ index: row.index });
    const created = meta[row.index]?.settings?.index?.version?.created;
    if (created && created < "2000099") {
      throw new Error(`Index ${row.index} must be reindexed (created in ${created})`);
    }
  }
  return indices;
}
