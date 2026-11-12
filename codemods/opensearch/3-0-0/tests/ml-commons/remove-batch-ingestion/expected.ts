export const batchIngestionUrl = "https://opensearch.org/docs/latest/data-prepper/";
export async function ingestBatch(client: { post: (url: string, body: object) => Promise<unknown> }, body: object) {
  return client.post(batchIngestionUrl, body);
}
