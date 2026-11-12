export async function createGroup(client: { put: (url: string, body: object) => Promise<{ workloadGroupID: string }> }) {
  const res = await client.put("/_plugins/_wlm/workload_group", {
    name: "analytics",
  });
  return res.workloadGroupID;
}
