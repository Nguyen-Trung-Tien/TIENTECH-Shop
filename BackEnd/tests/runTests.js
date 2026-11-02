const net = require("net");
const { spawn } = require("child_process");

function checkDatabase(port = 3306, host = "127.0.0.1", timeout = 500) {
  return new Promise((resolve) => {
    const socket = net.connect({ port, host, timeout });
    socket.on("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.on("error", () => {
      socket.destroy();
      resolve(false);
    });
    socket.on("timeout", () => {
      socket.destroy();
      resolve(false);
    });
  });
}

async function main() {
  const isDbOnline = await checkDatabase();
  const extraArgs = process.argv.slice(2);

  const jestArgs = ["--testTimeout=10000", "--runInBand"];

  if (extraArgs.length > 0) {
    jestArgs.push(...extraArgs);
  } else if (!isDbOnline) {
    console.warn(
      "\x1b[33m%s\x1b[0m",
      "⚠️  [TIENTECH TEST GATE] MySQL database is offline (127.0.0.1:3306)."
    );
    console.warn(
      "\x1b[36m%s\x1b[0m",
      "ℹ️  Running unit tests and stateless API tests (tests/unit + health + security.headers)..."
    );
    jestArgs.push(
      "tests/unit",
      "tests/integration/health.api.test.js",
      "tests/integration/security.headers.test.js"
    );
  }

  const jestBin = require.resolve("jest/bin/jest");
  const child = spawn(process.execPath, [jestBin, ...jestArgs], {
    stdio: "inherit",
    env: { ...process.env, NODE_ENV: "test" },
  });

  child.on("close", (code) => {
    process.exit(code || 0);
  });
}

main();
