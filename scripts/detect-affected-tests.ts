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
}

/**
 * ---------------------------------------------
 * STEP 5: Safe grep helpers
 * ---------------------------------------------
 */
function grepSafe(pattern: string, dir: string): boolean {
  try {
    const result = execSync(
      `grep -R "${pattern}" ${dir} --include="*.ts" --include="*.tsx" --exclude-dir=node_modules`,
      {
        stdio: ["pipe", "pipe", "ignore"],
      },
    ).toString();

    return result.length > 0;
  } catch {
    return false;
  }
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

if (uiChanged && fs.existsSync(appsDir)) {
  for (const app of fs.readdirSync(appsDir)) {
    if (appUsesUI(path.join(appsDir, app))) {
      affected.add(app);
    }
  }
}

if (configChanged && fs.existsSync(appsDir)) {
  for (const app of fs.readdirSync(appsDir)) {
    if (appUsesConfig(path.join(appsDir, app))) {
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
if (affected.size === 0) {
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
    }),
  );
}

/**
 * ---------------------------------------------
 * STEP 9: Run tests (UNCHANGED BEHAVIOR)
 * ---------------------------------------------
 */
const filters = [...affected].map((p) => `--filter=${p}`).join(" ");

console.log("🧪 Running tests for:", [...affected].join(", "));

execSync(`pnpm turbo run test ${filters}`, {
  stdio: "inherit",
});
