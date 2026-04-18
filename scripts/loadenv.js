import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";


const ENV = process.argv[2] || "dev";
const PROJECT_ID = "dc317ce1-1253-45e3-b1df-13641fec3e04";

try {

  const envExample = readFileSync(".env.example", "utf8");

  const envVars = parseEnvFile(envExample);

  const output = execSync(
    `infisical export --projectId=${PROJECT_ID} --env=${ENV} --silent --format=dotenv`,
    { encoding: "utf8" }
  );

  const infisicalVars = parseEnvFile(output);

  envVars["VITE_GOOGLE_CLIENT_ID"] = infisicalVars["GOOGLE_WEB_CLIENT_ID"]

  const envContent = parseEnvVars([envVars]);

  writeFileSync(".env", envContent);
  console.log(".env file generated successfully");
} catch (err) {
  console.error(".env file generation failed");
  process.exit(1);
}

function parseEnvFile(fileContent) {
  const lines = fileContent.split("\n");
  const envVars = {};
  for (const line of lines) {

    if (line.startsWith('#', 1)) continue;
    if (!line.includes('=')) continue;

    const [key, value] = line.split("=");
    if (key && value) {
      envVars[key.trim()] = value.trim().slice(1, -1)
    }
  }
  return envVars;
}

function parseEnvVars(envVarsLists) {
  const mergedVars = {};
  for (const envVars of envVarsLists) {
    for (const key in envVars) {
      if (envVars[key]) {
        mergedVars[key] = envVars[key];
      }
    }
  }

  return Object.entries(mergedVars).map(([key, value]) => `${key}=${value}`).join("\n");
}
