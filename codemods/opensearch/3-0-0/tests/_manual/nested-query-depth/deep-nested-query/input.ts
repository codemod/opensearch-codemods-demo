export const query = {
  nested: {
    path: "a",
    query: {
      nested: {
        path: "a.b",
        query: {
          nested: {
            path: "a.b.c",
            query: { match_all: {} },
          },
        },
      },
    },
  },
};
