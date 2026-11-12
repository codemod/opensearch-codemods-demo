export const knnMethod = {
  name: "hnsw",
  engine: "nmslib",
  space_type: "l2",
  parameters: { ef_construction: 128, m: 16 },
};
