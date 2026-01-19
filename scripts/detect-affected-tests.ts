import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

/**
 * ---------------------------------------------
 * STEP 1: Figure out what changed using git diff
 * ---------------------------------------------
 *
 * - We compare HEAD with a base branch.
 * - Base branch is configurable via env (for CI safety).
 * - Defaults to origin/main for local dev.
 */

const BASE = process.env.GIT_BASE ?? "origin/main";

const diff = execSync(`git diff --name-only ${BASE}...HEAD`, {
  stdio: ["pipe", "pipe", "ignore"],
})
  .toString()
  .trim()
  .split("\n")
  .filter(Boolean);

/**
 * ---------------------------------------------
 * STEP 2: Track affected scopes
 * ---------------------------------------------
 */

const affected = new Set<string>();

let rootChanged = false;
let uiChanged = false;
let configChanged = false;

/**
 * ---------------------------------------------
 * STEP 3: Detect direct file changes
 * ---------------------------------------------
 */

for (const file of diff) {
  // Root-level file (README, turbo.json, etc.)
  if (!file.includes("/")) {
    rootChanged = true;
  }

  // apps/<app-name>/...
  if (file.startsWith("apps/")) {
    affected.add(file.split("/")[1]);
  }

  // UI package
  if (file.startsWith("packages/ui")) {
    uiChanged = true;
    affected.add("@humyn/ui");
  }

  // Shared config package
  if (file.startsWith("packages/config")) {
    configChanged = true;
  }

  // Templates
  if (file.startsWith("templates/next-app")) {
    affected.add("template-next");
  }

  if (file.startsWith("templates/vite-app")) {
    affected.add("template-vite");
  }
}

/**
 * ---------------------------------------------
 * STEP 4: SAFE grep helpers
 * ---------------------------------------------
 *
 * - Restrict to source files only
 * - Exclude node_modules
 * - Prevent false positives & slowness
 */

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

function appUsesUI(appPath: string): boolean {
  return grepSafe("@humyn/ui", appPath);
}

function appUsesConfig(appPath: string): boolean {
  return grepSafe("@humyn/config", appPath);
}

/**
 * ---------------------------------------------
 * STEP 5: Dependency-based propagation
 * ---------------------------------------------
 */

// If UI changed → run tests for apps that import UI
if (uiChanged) {
  const appsDir = path.join(process.cwd(), "apps");

  if (fs.existsSync(appsDir)) {
    for (const app of fs.readdirSync(appsDir)) {
      const appPath = path.join(appsDir, app);

      if (appUsesUI(appPath)) {
        affected.add(app);
      }
    }
  }
}

// If config changed → run tests for apps using config
if (configChanged) {
  const appsDir = path.join(process.cwd(), "apps");

  if (fs.existsSync(appsDir)) {
    for (const app of fs.readdirSync(appsDir)) {
      const appPath = path.join(appsDir, app);

      if (appUsesConfig(appPath)) {
        affected.add(app);
      }
    }
  }
}

// Root tests (only if root has tests)
if (rootChanged && fs.existsSync("test")) {
  affected.add("root");
}

/**
 * ---------------------------------------------
 * STEP 6: Exit early if nothing is affected
 * ---------------------------------------------
 */

if (affected.size === 0) {
  console.log("✅ No affected tests detected");
  process.exit(0);
}

/**
 * ---------------------------------------------
 * STEP 7: Run Turbo with filters
 * ---------------------------------------------
 */

const filters = [...affected].map((pkg) => `--filter=${pkg}`).join(" ");

console.log("🧪 Running tests for:", [...affected].join(", "));

execSync(`pnpm turbo run test ${filters}`, { stdio: "inherit" });
