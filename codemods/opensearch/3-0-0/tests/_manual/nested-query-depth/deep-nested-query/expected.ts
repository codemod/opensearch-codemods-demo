export const query = {
  nested: {
    path: "a",
    query: {
      nested: {
        path: "a.b",
        query: {
          match_all: {},
        },
      },
    },
  },
};
