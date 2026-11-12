export function formatNodeStats(node: {
  total_indexing_buffer_in_bytes: number;
  total_indexing_buffer: string;
}) {
  // Pre-3.0: total_indexing_buffer was bytes; *_in_bytes was human-readable (interchanged)
  return {
    bytes: node.total_indexing_buffer_in_bytes,
    pretty: node.total_indexing_buffer,
  };
}
