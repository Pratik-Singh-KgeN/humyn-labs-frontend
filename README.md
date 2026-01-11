# 🚀 Humyn Labs Frontend Monorepo

A **scalable, production-grade frontend monorepo** built with **pnpm**, **Turborepo**, **Vite**, **Next.js**, and a **shared UI design system**.

This repo is designed to:

- Generate apps in seconds (Vite or Next)
- Share UI, styles, and tokens safely
- Enforce clean dependency boundaries
- Stay fast with caching & incremental builds

---

## 🧠 High-Level Architecture

```
humyn-labs-frontend/
├── apps/                 # All runnable applications
│   ├── vite-app/         # Vite + React app
│   ├── next-app/         # Next.js (App Router)
│   └── <generated-apps>/
│
├── packages/             # Shared libraries
│   └── ui/               # Design system (@humyn/ui)
│
├── templates/            # App templates used by generator
│   ├── vite-app/
│   └── next-app/
│
├── scripts/
│   └── create-app.ts     # Interactive app generator CLI
│
├── turbo.json            # Turborepo pipelines
├── pnpm-workspace.yaml   # Workspace definition
├── package.json          # Root config
└── README.md
```

---

## 📦 Package Manager: **pnpm**

We use **pnpm workspaces** for:

- ⚡ Faster installs
- 🔒 Strict dependency isolation
- 🧠 Predictable builds

### Important concept (VERY IMPORTANT)

Each app **has its own `node_modules` folder**, but:

> **Dependencies are NOT duplicated**

pnpm stores packages **once** in a global store and links them using symlinks.

✅ Correct
✅ Expected
✅ Optimal

---

## ⚙️ Turborepo Setup

### `turbo.json`

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "dev": {
      "cache": false,
      "persistent": true
    },
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "lint": {
      "outputs": []
    },
    "test": {
      "outputs": ["coverage/**"]
    }
  }
}
```

### What this gives you

| Task    | Behavior                 |
| ------- | ------------------------ |
| `dev`   | No cache, long-running   |
| `build` | Cached, dependency-aware |
| `lint`  | Fast, cacheable          |
| `test`  | Cached with coverage     |

---

## 🎨 Shared UI Design System (`@humyn/ui`)

### Location

```
packages/ui
```

### Responsibilities

- Shared React components (`Button`, etc.)
- Design tokens (colors, fonts, spacing)
- Global SCSS variables
- Single source of truth for styling

---

### `@humyn/ui` package.json

```json
{
  "name": "@humyn/ui",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./styles": "./styles/index.scss"
  }
}
```

### Why this matters

- `import { Button } from '@humyn/ui'`
- `@use '@humyn/ui/styles' as ui;`

Works in **Vite & Next** consistently.

---

## 🎨 SCSS Architecture (Modern & Correct)

### UI styles

```
packages/ui/styles/
├── _variables.scss
├── index.scss
```

#### `_variables.scss`

```scss
$font-base: "Inter", system-ui, sans-serif;
$color-primary: #6c5ce7;
```

#### `index.scss`

```scss
@forward "./variables";

html,
body {
  font-family: $font-base;
}
```

---

### App usage (Vite / Next)

```scss
@use "@humyn/ui/styles" as ui;

body {
  font-family: ui.$font-base;
}
```

✅ Uses `@use / @forward` (modern Sass)
✅ No global variable leaks
✅ Tool-agnostic

---

## ⚛️ App Types

### 🟢 Vite App

- React + Vite
- Fast dev server
- Ideal for dashboards, widgets, micro-apps

### 🔵 Next App

- App Router
- SSR / RSC ready
- Production-grade SEO & routing

Both apps:

- Consume `@humyn/ui`
- Share SCSS tokens
- Live inside the same monorepo

---

## 🧩 Module Resolution Strategy

### Vite

```ts
resolve: {
  alias: {
    '@humyn/ui': path.resolve(__dirname, '../../packages/ui/src')
  }
}
```

### Next.js (Turbopack compatible)

```ts
const nextConfig = {
  sassOptions: {
    includePaths: ["packages/ui/styles"],
  },
  turbopack: {},
};
```

👉 **No webpack config needed**
👉 Works with Turbopack by default

---

## 🧪 App Generator CLI

### Location

```
scripts/create-app.ts
```

### What it does

- Prompts for:
  - App type (Vite / Next)
  - App name

- Copies correct template
- Rewrites `package.json`
- Replaces placeholders
- Ensures `@humyn/ui` is linked
- Tells you exactly what to run next

---

### Usage

```bash
pnpm ts-node scripts/create-app.ts
```

Or directly:

```bash
pnpm create-app
```

(You can wire this via `bin` later)

---

### Example flow

```text
? Choose a template › vite-app
? App name › dashboard
```

Result:

```
apps/dashboard
```

Then run:

```bash
pnpm -w install
pnpm dev
```

---

## 🧰 Root Commands

| Command           | Purpose            |
| ----------------- | ------------------ |
| `pnpm -w install` | Install everything |
| `pnpm dev`        | Run all apps       |
| `pnpm build`      | Build all apps     |
| `pnpm lint`       | Lint workspace     |
| `pnpm test`       | Run tests          |

---

## 🧼 .gitignore

```gitignore
node_modules/
**/node_modules/
.pnpm-store
dist
.next
.env
```

---

## 🧠 Key Design Decisions (Why this works)

- **pnpm** → strict + fast
- **Turborepo** → cache & scale
- **SCSS @use** → predictable styling
- **Workspace UI** → no duplication
- **Generator CLI** → zero-friction app creation

---

## 🛣️ What’s Next?

You can easily add:

- Storybook for `@humyn/ui`
- Versioned UI packages
- CI caching with Turbo
- App-level feature flags
- Deployment pipelines

---

## 🏁 Final Notes

This setup is:

- ✅ Enterprise-ready
- ✅ Scales to 50+ apps
- ✅ Tooling-agnostic
- ✅ Easy to onboard new devs

If you understand this repo — **you understand modern frontend architecture** 🔥

---

Happy building 🚀
**Humyn Labs**
