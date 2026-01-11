#!/usr/bin/env node

import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";

import fs from "fs-extra";
import inquirer from "inquirer";
import minimist from "minimist";

/**
 * Run pnpm -w install
 */
async function runPnpmInstall(): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log("\n📦 Installing dependencies (pnpm -w install)...\n");

    const child = spawn("pnpm", ["-w", "install"], {
      stdio: "inherit",
      cwd: ROOT,
      shell: true,
    });

    child.on("close", (code) => {
      if (code === 0) {
        console.log("\n✅ Dependencies installed successfully");
        resolve();
      } else {
        reject(new Error(`pnpm install failed with code ${code}`));
      }
    });
  });
}

/**
 * Absolute paths
 */
const ROOT = path.resolve(process.cwd());
const TEMPLATES_DIR = path.join(ROOT, "templates");
const APPS_DIR = path.join(ROOT, "apps");

async function copyTemplate(
  templateName: string,
  appName: string,
): Promise<void> {
  const src = path.join(TEMPLATES_DIR, templateName);
  const dest = path.join(APPS_DIR, appName);

  if (!fs.existsSync(src)) {
    throw new Error(`Template "${templateName}" does not exist in templates/`);
  }

  if (fs.existsSync(dest)) {
    throw new Error(`Target folder apps/${appName} already exists.`);
  }

  await fs.copy(src, dest);

  const pkgPath = path.join(dest, "package.json");
  if (fs.existsSync(pkgPath)) {
    const pkg = await fs.readJSON(pkgPath);

    pkg.name = appName;
    pkg.dependencies ??= {};
    pkg.devDependencies ??= {};

    if (pkg.dependencies["@humyn/ui"]) {
      pkg.dependencies["@humyn/ui"] = "workspace:*";
    }

    await fs.writeJSON(pkgPath, pkg, { spaces: 2 });
  }

  await replaceInFiles(dest, "__APP_NAME__", appName);

  console.log(`✅ Generated ${templateName} → apps/${appName}`);
  await runPnpmInstall();
}

async function replaceInFiles(
  dir: string,
  from: string,
  to: string,
): Promise<void> {
  const entries = await fs.readdir(dir);

  await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry);
      const stat = await fs.stat(fullPath);

      if (stat.isDirectory()) {
        await replaceInFiles(fullPath, from, to);
        return;
      }

      const ext = path.extname(entry);
      const allowed = new Set([
        ".js",
        ".ts",
        ".tsx",
        ".json",
        ".scss",
        ".html",
        ".md",
      ]);

      if (!allowed.has(ext)) return;

      const content = await fs.readFile(fullPath, "utf8");
      if (!content.includes(from)) return;

      await fs.writeFile(fullPath, content.replaceAll(from, to), "utf8");
    }),
  );
}

async function interactive(): Promise<void> {
  const answers = await inquirer.prompt<{
    template: "vite-app" | "next-app";
    name: string;
  }>([
    {
      type: "list",
      name: "template",
      message: "Choose a template",
      choices: ["vite-app", "next-app"],
    },
    {
      type: "input",
      name: "name",
      message: "App name",
      validate: (v: string) =>
        /^[a-z0-9-_]+$/i.test(v) || "Invalid folder name",
    },
  ]);

  await copyTemplate(answers.template, answers.name);
}

async function main(): Promise<void> {
  const args = minimist(process.argv.slice(2));
  const [template, name] = args._ as [string | undefined, string | undefined];

  if (!template) {
    await interactive();
    return;
  }

  if (!name) {
    throw new Error("App name is required");
  }

  await copyTemplate(template, name);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
