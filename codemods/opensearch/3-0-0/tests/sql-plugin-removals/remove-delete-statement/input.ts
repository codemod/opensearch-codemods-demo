export const statements = {
  select: "SELECT id FROM events WHERE status = 'gone'",
  delete: "DELETE FROM events WHERE status = 'gone'",
  "plugins.sql.delete.enabled": true,
};
