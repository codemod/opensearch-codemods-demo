export const mapping = {
  settings: {
    analysis: {
      analyzer: {
        // Romanian analyzer normalizes cedilla→comma forms in 3.0; reindex existing docs
        ro: { type: "romanian" },
      },
    },
  },
  migrationNote: "reindex Romanian documents after upgrading to 3.0",
};
