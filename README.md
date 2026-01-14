# 🚀 Humyn Labs Frontend Monorepo

A **scalable, production-grade frontend monorepo** built with **pnpm**, **Turborepo**, **Vite**, **Next.js**, and a **shared UI design system**.

---

## 🏗️ App Generation & Dependency Structure

### How we generate apps

This monorepo uses an interactive CLI to scaffold new applications instantly. This ensures all apps follow the same directory structure, naming conventions, and dependency patterns.

```bash
# Run the app generator
pnpm generate
```

### Dependency Logic

The monorepo enforces a strict dependency flow:

- **Apps** (in `apps/`) depend on **Shared Packages** (in `packages/`).
- **Templates** (in `templates/`) are used by the generator to create new apps.
- **Packages** (in `packages/`) provide common logic, UI components, and configurations.

| Layer       | Package            | Description                                             |
| ----------- | ------------------ | ------------------------------------------------------- |
| **Config**  | `@humyn/config`    | Shared TypeScript, ESLint, and Prettier configurations. |
| **UI**      | `@humyn/ui`        | Core design system, components, and global styles.      |
| **Tooling** | `@humyn/generator` | CLI tool for scaffolding new Vite or Next.js apps.      |

---

## 🧠 Project Architecture

```
humyn-labs-frontend/
├── apps/                 # Runnable applications (Vite / Next)
├── packages/             # Shared workspace libraries
│   ├── config/           # Shared tool configs (TS, ESLint, Prettier)
│   ├── generator/        # App generation logic (@humyn/generator)
│   └── ui/               # Core design system (@humyn/ui)
├── templates/            # Source templates for the app generator
│   ├── next-app/         # Next.js App Router template
│   └── vite-app/         # Vite + React template
├── turbo.json            # Turborepo task pipeline configuration
├── pnpm-workspace.yaml   # Workspace member definition
├── package.json          # Root scripts and global dev dependencies
└── README.md
```

---

## ✨ Key Features

- **⚡ Fast Builds**: Powered by [Turborepo](https://turbo.build/) with remote and local caching.
- **🔒 Strict Scoping**: Using [pnpm workspaces](https://pnpm.io/workspaces) to prevent ghost dependencies.
- **🎨 Design System**: Centralized `@humyn/ui` package for consistent branding across products.
- **🚀 One-Command Generation**: Rapidly spin up new products with `pnpm generate`.
- **🛠️ Standardized Tooling**: Shared ESLint, Prettier, and TypeScript configs via `@humyn/config`.
- **🧪 Testing Ready**: Pre-configured Vitest and React Testing Library setup in templates.

---

## 🎨 Shared UI Design System (`@humyn/ui`)

### Usage in Apps

**Components:**

```tsx
import { Button } from "@humyn/ui";

export const MyComponent = () => <Button>Click Me</Button>;
```

**Global Styles (SCSS):**

```scss
@use "@humyn/ui/styles" as ui;

.my-element {
  color: ui.$color-primary;
}
```

---

## 🛠️ Development Workflow

### Prerequisites

- [pnpm](https://pnpm.io/) installed globally.
- Node.js (Latest LTS recommended).

### Commands

| Command          | Purpose                                        |
| ---------------- | ---------------------------------------------- |
| `pnpm install`   | Install all dependencies across the workspace. |
| `pnpm dev`       | Start development servers for all apps.        |
| `pnpm build`     | Build all apps and packages.                   |
| `pnpm generate`  | Create a new application from templates.       |
| `pnpm lint`      | Run ESLint across the entire monorepo.         |
| `pnpm test`      | Execute all tests using Vitest.                |
| `pnpm typecheck` | Run TypeScript compiler checks workspace-wide. |

---

## 🏁 Design Decisions

- **Modular SCSS**: Using `@use` and `@forward` to avoid global namespace pollution.
- **Template-Driven**: New apps aren't built from scratch; they are cloned from vetted templates to reduce technical debt.
- **Turborepo Pipelines**: Orchestrates complex build orders (e.g., ensuring `ui` is built before `apps` that use it).

---

Happy building 🚀
**Humyn Labs**
