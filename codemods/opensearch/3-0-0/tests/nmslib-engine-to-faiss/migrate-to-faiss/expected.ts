export const knnMethod = {
  name: "hnsw",
  engine: "faiss",
  space_type: "l2",
  parameters: { ef_construction: 128, m: 16 },
};
