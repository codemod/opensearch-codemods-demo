export async function createGroup(client: { put: (url: string, body: object) => Promise<{ queryGroupID: string }> }) {
  const res = await client.put("/_plugins/_wlm/query_group", {
    name: "analytics",
  });
  return res.queryGroupID;
}
