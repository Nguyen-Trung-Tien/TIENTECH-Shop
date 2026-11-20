const fs = require("fs");
const path = require("path");
const {
  tableExists,
  createTableIfNotExists,
  addColumnIfNotExists,
  addIndexIfNotExists,
} = require("../../src/utils/migrationHelper");

const MIGRATIONS_DIR = path.resolve(__dirname, "../../src/migrations");

describe("Database Migrations Ordering & Idempotency", () => {
  test("all migrations are timestamp-prefixed, export up/down, and create parent tables before dependencies", () => {
    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith(".js"))
      .sort();

    expect(files.length).toBe(38);

    const createdTables = new Set();

    for (const file of files) {
      expect(file).toMatch(/^\d{8,14}-.+\.js$/);
      const fullPath = path.join(MIGRATIONS_DIR, file);
      const mod = require(fullPath);
      expect(typeof mod.up).toBe("function");
      expect(typeof mod.down).toBe("function");

      const src = fs.readFileSync(fullPath, "utf8");

      // Collect tables created by this file
      const createMatches = [
        ...src.matchAll(/(?:createTableIfNotExists\s*\(\s*queryInterface,\s*|queryInterface\.createTable\s*\(\s*)["']([^"']+)["']/g),
      ];
      for (const m of createMatches) {
        createdTables.add(m[1]);
      }

      // Verify any referenced FK tables already exist in earlier (or same) migrations
      const refMatches = [
        ...src.matchAll(/references\s*:\s*\{\s*model\s*:\s*["']([^"']+)["']/g),
      ];
      for (const m of refMatches) {
        expect(createdTables.has(m[1])).toBe(true);
      }

      // Verify any addColumn/changeColumn/addIndex targets an already-created table
      const alterMatches = [
        ...src.matchAll(/(?:addColumnIfNotExists|changeColumnIfExists|addIndexIfNotExists)\s*\(\s*queryInterface,\s*["']([^"']+)["']/g),
      ];
      for (const m of alterMatches) {
        expect(createdTables.has(m[1])).toBe(true);
      }
    }
  });

  test("migrationHelper guards prevent duplicate createTable, addColumn, and addIndex errors", async () => {
    const tables = ["Users", "Products"];
    const mockQI = {
      showAllTables: jest.fn(async () => tables),
      createTable: jest.fn(async (name) => {
        tables.push(name);
      }),
      describeTable: jest.fn(async () => ({ id: {}, name: {} })),
      addColumn: jest.fn(),
      showIndex: jest.fn(async () => [
        { name: "idx_existing", fields: [{ attribute: "name" }] },
      ]),
      addIndex: jest.fn(),
    };

    expect(await tableExists(mockQI, "users")).toBe(true);
    expect(await createTableIfNotExists(mockQI, "Users", {})).toBe(false);
    expect(mockQI.createTable).not.toHaveBeenCalled();

    expect(await createTableIfNotExists(mockQI, "NewTable", {})).toBe(true);
    expect(mockQI.createTable).toHaveBeenCalledTimes(1);

    expect(await addColumnIfNotExists(mockQI, "Products", "name", {})).toBe(false);
    expect(mockQI.addColumn).not.toHaveBeenCalled();

    expect(await addColumnIfNotExists(mockQI, "Products", "embedding", {})).toBe(true);
    expect(mockQI.addColumn).toHaveBeenCalledTimes(1);

    expect(
      await addIndexIfNotExists(mockQI, "Products", ["name"], { name: "idx_existing" })
    ).toBe(false);
    expect(mockQI.addIndex).not.toHaveBeenCalled();

    expect(
      await addIndexIfNotExists(mockQI, "Products", ["createdAt"], { name: "idx_new" })
    ).toBe(true);
    expect(mockQI.addIndex).toHaveBeenCalledTimes(1);
  });
});
