export const batchIngestionUrl = "/_plugins/_ml/_batch_ingestion";
export async function ingestBatch(client: { post: (url: string, body: object) => Promise<unknown> }, body: object) {
  return client.post(batchIngestionUrl, body);
}
