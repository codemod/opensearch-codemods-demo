export const tools = ["ListIndexTool", "SearchIndexTool"];
export function createTool(name: "ListIndexTool") {
  return { type: name };
}
