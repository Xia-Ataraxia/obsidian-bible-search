export type MigrationFn = (data: Record<string, unknown>) => Record<string, unknown>

/**
 * Run a series of migration functions over settings data.
 * Each migration receives a shallow copy and may mutate it or return a new object.
 * `changed` is true only if the migrations altered the data, so loads don't rewrite data.json.
 */
export function migrateSettings(
	data: Record<string, unknown>,
	migrations: MigrationFn[],
): { data: Record<string, unknown>; changed: boolean } {
	let current = { ...data }

	for (const migrate of migrations) {
		current = migrate(current)
	}

	return { data: current, changed: JSON.stringify(current) !== JSON.stringify(data) }
}
