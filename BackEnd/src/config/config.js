const fs = require("fs");
require("dotenv").config();

let mysql2;
try {
  mysql2 = require("mysql2");
} catch {
  // fallback if not yet installed
}

const buildSslDialectOptions = () => {
  const isTiDb = Boolean(process.env.DB_HOST && process.env.DB_HOST.includes("tidbcloud.com"));
  const sslEnabled = process.env.DB_SSL === "true" || isTiDb;
  if (!sslEnabled) return {};

  const rejectUnauthorized =
    process.env.DB_SSL_REJECT_UNAUTHORIZED === "false"
      ? false
      : !isTiDb || Boolean(process.env.DB_SSL_CA);

  const sslConfig = {
    minVersion: "TLSv1.2",
    require: true,
    rejectUnauthorized,
  };

  if (process.env.DB_SSL_CA) {
    sslConfig.ca = fs.existsSync(process.env.DB_SSL_CA)
      ? fs.readFileSync(process.env.DB_SSL_CA, "utf8")
      : process.env.DB_SSL_CA;
  }

  return {
    connectTimeout: 20000,
    ssl: sslConfig,
  };
};

module.exports = {
  development: {
    username: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || "123456",
    database: process.env.DB_DATABASE_NAME || "project_app",
    host: process.env.DB_HOST || "127.0.0.1",
    port: process.env.DB_PORT || 3306,
    dialect: process.env.DB_DIALECT || "mysql",
    dialectModule: mysql2,
    logging: false,
    dialectOptions: buildSslDialectOptions(),
    pool: {
      max: parseInt(process.env.DB_POOL_MAX || "5", 10),
      min: parseInt(process.env.DB_POOL_MIN || "0", 10),
      acquire: 30000,
      idle: 10000,
    },
  },
  test: {
    username: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_DATABASE_NAME || "project_app",
    host: process.env.DB_HOST || "127.0.0.1",
    port: process.env.DB_PORT || 3306,
    dialect: process.env.DB_DIALECT || "mysql",
    dialectModule: mysql2,
    logging: false,
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE_NAME,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    dialect: process.env.DB_DIALECT || "mysql",
    dialectModule: mysql2,
    dialectOptions: buildSslDialectOptions(),
    pool: {
      max: parseInt(process.env.DB_POOL_MAX || "10", 10),
      min: parseInt(process.env.DB_POOL_MIN || "0", 10),
      acquire: 30000,
      idle: 10000,
    },
    logging: false,
  },
};
