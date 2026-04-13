const path = require("path");
const fs = require("fs");

const deploymentType = process.env.APP_ENV || "local";
const filePath1 = path.resolve(__dirname, "./env/" + deploymentType + ".env");

fs.readFile(filePath1, { encoding: "utf8" }, function (err, data) {
  if (err) {
    console.warn(
      `[envSetup] Skipping env merge (${err.code}): ${filePath1}. Next.js will use .env.local if present.`
    );
    return;
  }
  const fileEnvPath = path.resolve(__dirname, "./.env");

  fs.writeFile(
    fileEnvPath,
    data,
    { encoding: "utf8", mode: 0o777, flag: "w+" },
    function (writeErr) {
      if (writeErr) {
        console.error(writeErr);
      }
    }
  );
});
