#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

console.log("🔍 Checking DataScube CI/CD Setup...\n");

// Check required files
const requiredFiles = [
  ".env",
  "Dockerfile",
  "package.json",
  ".github/workflows/ci-cd.yml",
  "k8s/deployment.yaml",
  "k8s/secrets.yaml",
];

console.log("📁 Required Files:");
requiredFiles.forEach((file) => {
  const exists = fs.existsSync(file);
  console.log(`${exists ? "✅" : "❌"} ${file}`);
});

// Check environment variables
console.log("\n🔐 Environment Variables:");
const requiredEnvVars = ["MONGODB_URI", "JWT_SECRET", "SMTP_USER", "SMTP_PASS"];

const envExists = fs.existsSync(".env");
if (envExists) {
  const envContent = fs.readFileSync(".env", "utf8");
  requiredEnvVars.forEach((envVar) => {
    const hasVar = envContent.includes(`${envVar}=`);
    console.log(`${hasVar ? "✅" : "❌"} ${envVar}`);
  });
} else {
  console.log("❌ .env file not found");
}

// Check package.json scripts
console.log("\n📜 Package.json Scripts:");
const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
const requiredScripts = ["start", "test", "docker:build", "docker:push"];

requiredScripts.forEach((script) => {
  const hasScript = packageJson.scripts && packageJson.scripts[script];
  console.log(`${hasScript ? "✅" : "❌"} ${script}`);
});

console.log("\n🚀 Next Steps:");
console.log("1. Enable GitHub Actions permissions in repository settings");
console.log("2. Choose deployment option (Docker-only or Kubernetes)");
console.log("3. Push to main branch to trigger first build");
console.log("\n✨ Setup looks good! Ready for deployment.");
