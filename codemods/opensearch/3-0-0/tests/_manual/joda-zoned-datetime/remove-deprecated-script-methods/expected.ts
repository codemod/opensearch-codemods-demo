export const painlessSnippet = `
ZonedDateTime dt = doc['timestamp'].value;
return dt.toInstant().toEpochMilli();
`;
