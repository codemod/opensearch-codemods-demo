export function indexUrl(id: string) {
  // IDs longer than 512 bytes are rejected by Bulk and Index APIs in 3.0
  return `/events/_doc/${id}`;
}

export const longId = "customer-" + "a".repeat(520);
