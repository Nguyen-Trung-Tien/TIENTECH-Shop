const normalizeTableEntry = (entry) => {
  if (typeof entry === "string") return entry;
  if (entry && typeof entry === "object") {
    return entry.tableName || entry.TABLE_NAME || Object.values(entry)[0] || "";
  }
  return "";
};

const tableExists = async (queryInterface, tableName) => {
  const tables = await queryInterface.showAllTables();
  const target = String(tableName).toLowerCase();
  return tables.some((t) => String(normalizeTableEntry(t)).toLowerCase() === target);
};

const createTableIfNotExists = async (queryInterface, tableName, attributes, options) => {
  if (await tableExists(queryInterface, tableName)) {
    return false;
  }
  await queryInterface.createTable(tableName, attributes, options);
  return true;
};

const dropTableIfExists = async (queryInterface, tableName) => {
  if (!(await tableExists(queryInterface, tableName))) {
    return false;
  }
  await queryInterface.dropTable(tableName);
  return true;
};

const columnExists = async (queryInterface, tableName, columnName) => {
  if (!(await tableExists(queryInterface, tableName))) {
    return false;
  }
  const desc = await queryInterface.describeTable(tableName);
  const target = String(columnName).toLowerCase();
  return Object.keys(desc).some((col) => col.toLowerCase() === target);
};

const addColumnIfNotExists = async (queryInterface, tableName, columnName, definition) => {
  if (!(await tableExists(queryInterface, tableName))) {
    return false;
  }
  if (await columnExists(queryInterface, tableName, columnName)) {
    return false;
  }
  await queryInterface.addColumn(tableName, columnName, definition);
  return true;
};

const removeColumnIfExists = async (queryInterface, tableName, columnName) => {
  if (!(await columnExists(queryInterface, tableName, columnName))) {
    return false;
  }
  await queryInterface.removeColumn(tableName, columnName);
  return true;
};

const changeColumnIfExists = async (queryInterface, tableName, columnName, definition) => {
  if (!(await columnExists(queryInterface, tableName, columnName))) {
    return false;
  }
  await queryInterface.changeColumn(tableName, columnName, definition);
  return true;
};

const addIndexIfNotExists = async (queryInterface, tableName, fields, options = {}) => {
  if (!(await tableExists(queryInterface, tableName))) {
    return false;
  }
  const indexes = await queryInterface.showIndex(tableName);
  const indexName = options?.name ? String(options.name).toLowerCase() : null;
  const normalizedTargetFields = (fields || []).map((f) => String(f).toLowerCase());

  const alreadyExists = indexes.some((idx) => {
    if (indexName && idx.name && String(idx.name).toLowerCase() === indexName) {
      return true;
    }
    const idxFields = (idx.fields || []).map((f) => String(f.attribute || f.columnName || "").toLowerCase());
    return (
      idxFields.length === normalizedTargetFields.length &&
      idxFields.every((col, i) => col === normalizedTargetFields[i])
    );
  });

  if (alreadyExists) {
    return false;
  }

  await queryInterface.addIndex(tableName, fields, options);
  return true;
};

const removeIndexIfExists = async (queryInterface, tableName, indexName) => {
  if (!(await tableExists(queryInterface, tableName))) {
    return false;
  }
  const indexes = await queryInterface.showIndex(tableName);
  const target = String(indexName).toLowerCase();
  if (!indexes.some((idx) => idx.name && String(idx.name).toLowerCase() === target)) {
    return false;
  }
  await queryInterface.removeIndex(tableName, indexName);
  return true;
};

const addConstraintIfNotExists = async (queryInterface, tableName, options = {}) => {
  if (!(await tableExists(queryInterface, tableName))) {
    return false;
  }
  const indexes = await queryInterface.showIndex(tableName);
  const constraintName = options?.name ? String(options.name).toLowerCase() : null;
  if (
    constraintName &&
    indexes.some((idx) => idx.name && String(idx.name).toLowerCase() === constraintName)
  ) {
    return false;
  }
  await queryInterface.addConstraint(tableName, options);
  return true;
};

module.exports = {
  tableExists,
  createTableIfNotExists,
  dropTableIfExists,
  columnExists,
  addColumnIfNotExists,
  removeColumnIfExists,
  changeColumnIfExists,
  addIndexIfNotExists,
  removeIndexIfExists,
  addConstraintIfNotExists,
};
