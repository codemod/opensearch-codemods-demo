export const painlessSnippet = `
ZonedDateTime dt = doc['timestamp'].value;
return dt.getMillis() + dt.toDateTime().getMillis();
`;
