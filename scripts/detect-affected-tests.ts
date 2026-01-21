import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

/**
 * ---------------------------------------------
 * STEP 1: Determine base branch
 * ---------------------------------------------
 */

const BASE = process.env.GIT_BASE ?? "origin/main";
const OUTPUT_JSON = process.env.OUTPUT_JSON === "1";

/**
 * ---------------------------------------------
 * STEP 2: Git diff
 * ---------------------------------------------
 */

const diff = execSync(`git diff --name-only ${BASE}...HEAD`, {
  stdio: ["pipe", "pipe", "ignore"],
})
  .toString()
  .trim()
  .split("\n")
  .filter(Boolean);

/**
 * ---------------------------------------------
 * STEP 3: Track affected scopes
 * ---------------------------------------------
 */

const affected = new Set<string>();

let rootChanged = false;
let uiChanged = false;
let configChanged = false;

/**
 * ---------------------------------------------
 * STEP 4: Direct change detection
 * ---------------------------------------------
 */

const affectedTemplates = new Set<string>();

for (const file of diff) {
  if (!file.includes("/")) {
    rootChanged = true;
  }

  if (file.startsWith("apps/")) {
    affected.add(file.split("/")[1]);
  }

  if (file.startsWith("packages/ui")) {
    uiChanged = true;
    affected.add("@humyn/ui");
  }

  if (file.startsWith("packages/config")) {
    configChanged = true;
  }

  if (file.startsWith("templates/next-app")) {
    affectedTemplates.add("templates/next-app");
  }

  if (file.startsWith("templates/vite-app")) {
    affectedTemplates.add("templates/vite-app");
  }
}

/**
 * ---------------------------------------------
 * STEP 5: Safe grep/json helpers
 * ---------------------------------------------
 */

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

function grepSafe(pattern: string, dir: string): boolean {
  try {
    const result = execSync(
      `grep -R "${pattern}" ${dir} --include="*.ts" --include="*.tsx" --exclude-dir=node_modules`,
      { stdio: ["pipe", "pipe", "ignore"] },
    ).toString();

    return result.length > 0;
  } catch {
    return false;
  }
}

function getPackageJson(appPath: string): PackageJson | null {
  const pkgPath = path.join(appPath, "package.json");
  if (!fs.existsSync(pkgPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  } catch {
    return null;
  }
}

function isNextApp(appPath: string): boolean {
  const pkg = getPackageJson(appPath);
  return Boolean(pkg?.dependencies?.["next"] || pkg?.devDependencies?.["next"]);
}

function isViteApp(appPath: string): boolean {
  const pkg = getPackageJson(appPath);
  return Boolean(pkg?.dependencies?.["vite"] || pkg?.devDependencies?.["vite"]);
}

function appUsesUI(appPath: string): boolean {
  return grepSafe("@humyn/ui", appPath);
}

function appUsesConfig(appPath: string): boolean {
  return grepSafe("@humyn/config", appPath);
}

/**
 * ---------------------------------------------
 * STEP 6: Dependency propagation
 * ---------------------------------------------
 */

const appsDir = path.join(process.cwd(), "apps");

if (fs.existsSync(appsDir)) {
  const apps = fs.readdirSync(appsDir);

  for (const app of apps) {
    const appPath = path.join(appsDir, app);
    if (!fs.statSync(appPath).isDirectory()) continue;

    // UI propagation
    if (uiChanged && appUsesUI(appPath)) {
      affected.add(app);
    }

    // Config propagation
    if (configChanged && appUsesConfig(appPath)) {
      affected.add(app);
    }

    // Template propagation
    if (affectedTemplates.has("templates/next-app") && isNextApp(appPath)) {
      affected.add(app);
    }
    if (affectedTemplates.has("templates/vite-app") && isViteApp(appPath)) {
      affected.add(app);
    }
  }
}

if (rootChanged && fs.existsSync("test")) {
  affected.add("root");
}

/**
 * ---------------------------------------------
 * STEP 7: Exit early if nothing affected
 * ---------------------------------------------
 */

if (affected.size === 0 && affectedTemplates.size === 0) {
  console.log("✅ No affected tests detected");

  if (OUTPUT_JSON) {
    console.log(JSON.stringify({ affected: [] }));
  }

  process.exit(0);
}

/**
 * ---------------------------------------------
 * STEP 8: Optional JSON output (CI use only)
 * ---------------------------------------------
 */

if (OUTPUT_JSON) {
  console.log(
    JSON.stringify({
      affected: [...affected],
      templates: [...affectedTemplates],
    }),
  );
}

/**
 * ---------------------------------------------
 * STEP 9: Run tests (UNCHANGED BEHAVIOR)
 * ---------------------------------------------
 */

if (affected.size > 0) {
  const filters = [...affected].map((p) => `--filter=${p}`).join(" ");
  console.log("🧪 Running tests for apps/packages:", [...affected].join(", "));
  try {
    execSync(`pnpm turbo run test ${filters}`, { stdio: "inherit" });
  } catch (err) {
    process.exit(1);
  }
}

if (affectedTemplates.size > 0) {
  console.log(
    "🧪 Running tests for templates:",
    [...affectedTemplates].join(", "),
  );
  for (const templateDir of affectedTemplates) {
    console.log(`\n👉 Testing template: ${templateDir}`);
    try {
      execSync(`pnpm test`, {
        cwd: path.join(process.cwd(), templateDir),
        stdio: "inherit",
      });
    } catch (err) {
      process.exit(1);
    }
  }
}
