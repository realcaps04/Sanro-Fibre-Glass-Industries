export function matchesQuery(query: string, ...fields: Array<string | number | undefined>): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return fields.some((field) =>
    String(field ?? "")
      .toLowerCase()
      .includes(needle),
  );
}

export function createId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
