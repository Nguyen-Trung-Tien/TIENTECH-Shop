const fs = require("fs");
const path = require("path");
const db = require("../models");

const MIGRATIONS_DIR = path.resolve(__dirname, "../migrations");

/**
 * Ensures SequelizeMeta table exists in database.
 * Matches standard Sequelize CLI schema.
 */
const ensureSequelizeMetaTable = async (queryInterface) => {
  const metaTableName = "SequelizeMeta";
  try {
    await queryInterface.createTable(metaTableName, {
      name: {
        type: db.Sequelize.STRING(255),
        allowNull: false,
        primaryKey: true,
      },
    });
    console.log(`[AutoMigrate] Created ${metaTableName} table.`);
  } catch (err) {
    // Table already exists or check notice (e.g. in TiDB / MySQL)
    if (!String(err?.message || "").includes("already exists")) {
      console.warn(`[AutoMigrate] Meta table notice:`, err?.message);
    }
  }
};

/**
 * Retrieves list of executed migration filenames from SequelizeMeta table.
 */
const getExecutedMigrations = async () => {
  try {
    const [rows] = await db.sequelize.query(
      "SELECT name FROM SequelizeMeta ORDER BY name ASC;"
    );
    return new Set((rows || []).map((r) => r.name || r.NAME));
  } catch (_err) {
    return new Set();
  }
};

/**
 * Runs all pending migrations sequentially.
 * Safe for TiDB Cloud and Render production restarts.
 */
const runPendingMigrations = async () => {
  if (process.env.NODE_ENV === "test") {
    return { applied: [], count: 0 };
  }

  const queryInterface = db.sequelize.getQueryInterface();
  await ensureSequelizeMetaTable(queryInterface);

  const executedSet = await getExecutedMigrations();

  if (!fs.existsSync(MIGRATIONS_DIR)) {
    console.warn(`[AutoMigrate] Migrations directory not found at ${MIGRATIONS_DIR}`);
    return { applied: [], count: 0 };
  }

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".js"))
    .sort();

  const pendingFiles = files.filter((f) => !executedSet.has(f));

  if (pendingFiles.length === 0) {
    console.log(`[AutoMigrate] Database schema is up-to-date (${files.length} migrations verified).`);
    return { applied: [], count: 0 };
  }

  console.log(`[AutoMigrate] Found ${pendingFiles.length} pending migrations to apply...`);
  const applied = [];

  for (const file of pendingFiles) {
    const fullPath = path.join(MIGRATIONS_DIR, file);
    try {
      console.log(`[AutoMigrate] Executing migration: ${file}...`);
      const migration = require(fullPath);
      if (typeof migration.up === "function") {
        await migration.up(queryInterface, db.Sequelize);
      }

      await db.sequelize.query(
        "INSERT INTO SequelizeMeta (name) VALUES (?);",
        {
          replacements: [file],
        }
      );

      console.log(`[AutoMigrate] Successfully applied: ${file}`);
      applied.push(file);
    } catch (err) {
      console.error(`[AutoMigrate] Error applying migration ${file}:`, err?.message || err);
      // If error is duplicate table/column already exists in TiDB, record in SequelizeMeta to prevent blocking
      if (
        String(err?.message || "").includes("already exists") ||
        String(err?.message || "").includes("Duplicate")
      ) {
        console.warn(`[AutoMigrate] Marking ${file} as executed due to idempotent match.`);
        await db.sequelize.query(
          "INSERT INTO SequelizeMeta (name) VALUES (?) ON DUPLICATE KEY UPDATE name=name;",
          { replacements: [file] }
        ).catch(() => {});
        applied.push(file);
      } else {
        throw err;
      }
    }
  }

  console.log(`[AutoMigrate] All ${applied.length} pending migrations applied successfully.`);
  return { applied, count: applied.length };
};

module.exports = {
  runPendingMigrations,
  ensureSequelizeMetaTable,
  getExecutedMigrations,
};
