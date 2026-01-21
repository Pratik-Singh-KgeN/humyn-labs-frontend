# 🚀 Humyn Labs Frontend Monorepo

A **scalable, production-grade frontend monorepo** built with **pnpm**, **Turborepo**, **Vite**, **Next.js**, and a **shared UI design system**.

---

## 🏗️ Architecture & Configuration

### Dependency Graph

This monorepo uses **pnpm workspaces** and **Turborepo** to manage dependencies and build pipelines.

- **`apps/*`**: Consumer applications (Vite, Next.js). They depend on packages but never on each other.
- **`packages/*`**: Shared libraries.
  - **`@humyn/ui`**: The core design system. It exports a built CSS file (`dist/styles.css`) and raw React components.
  - **`@humyn/config`**: Shared configurations (TS, ESLint) that all other workspaces extend.
  - **`@humyn/generator`**: CLI tool for scaffolding.
- **`templates/*`**: Blueprints used by `@humyn/generator`.

### Configuration Inheritance

Configurations are centralized in `packages/config` to ensure consistency.

- **TypeScript**: `tsconfig.json` in apps extends `packages/config/tsconfig/base.json` or `react-library.json`.
- **ESLint**: Apps extend `packages/config/eslint-preset`.
- **Tailwind**: `packages/ui` exports its config presets, allowing apps to inherit the same valid tokens.

---

## 🎨 Component Workflow (`@humyn/ui`)

We use a **Headless + Styled** approach. We install headless components via Shadcn CLI and wrap them to enforce our design system.

### 1. Install a new Component

Use the custom script in `packages/ui` to add a component via Shadcn. This automatically configures imports to use `@humyn/ui`.

```bash
cd packages/ui
pnpm run add <component-name>
# Example: pnpm run add input
```

### 2. Modify & Wrap (The Wrapper Pattern)

**Never import Shadcn components directly in apps.** Always create a wrapper in `packages/ui/src/components`.

1.  **Locate**: Shadcn installs primitive components into `src/components/ui/`.
2.  **Create Wrapper**: Create a new folder `src/components/<ComponentName>/index.tsx`.
3.  **Export**: Re-export the primitive component, potentially adding custom logic or default props.

**Example `src/components/Badge/index.tsx`:**

```tsx
import {
  Badge as ShadcnBadge,
  BadgeProps as ShadcnBadgeProps,
} from "../ui/badge";

export type BadgeProps = ShadcnBadgeProps;

export default function Badge(props: BadgeProps) {
  return <ShadcnBadge {...props}>{props.children}</ShadcnBadge>;
}
```

### 3. Add Animations (SCSS + Tailwind)

We support **Hybrid Styling**. Use Tailwind for layout/spacing and SCSS for complex animations.

1.  Create `src/components/<Name>/<Name>.module.scss`.
2.  Import shared variables and define keyframes.
3.  Import the module in your wrapper and merge classes using `cn()`.

**`Button.module.scss`**:

```scss
@use "../../../styles/variables" as *;

.animated {
  &:hover {
    animation: bounce 0.5s;
  }
}
```

**`Button/index.tsx`**:

```tsx
import styles from "./Button.module.scss";
import { cn } from "@humyn/ui/lib/utils";

<ShadcnButton className={cn(styles.animated, props.className)} />;
```

---

### 4. Build the UI Package

After creating or modifying components, you must rebuild the UI package. This regenerates the Tailwind CSS file (`dist/styles.css`) that apps consume to apply the correct styles.

```bash
cd packages/ui
pnpm build
```

---

## 🧪 Testing Guidelines

Every new component must have unit tests ensuring it renders and handles interactions correctly.

- **Tooling**: We use **Vitest** and **React Testing Library**.
- **Location**: Place tests inside `src/components/<Name>/test/<Name>.test.tsx`.
- **Command**: Run `pnpm test` from the root or `packages/ui`.

**Ref Example:**

```tsx
import { render, screen } from "@testing-library/react";
import Button from "../index";

test("renders button", () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText("Click me")).toBeDefined();
});
```

---

## 🚀 App Generation

Scaffold new apps instantly using standard templates.

```bash
pnpm generate
```

- **Templates**: Located in `templates/`. Changes here affect all _future_ generated apps.
- **CI/CD**: The generator ensures new apps have correct CI pipelines and dependency versions pre-configured.

---

## 🧠 Project Architecture

```
humyn-labs-frontend/
├── apps/               # Consumer applications
│   ├── next-app/       # Generated Next.js apps
│   └── vite-app/       # Generated Vite apps
├── packages/           # Shared workspace libraries
│   ├── config/         # Shared configurations
│   ├── generator/      # Scaffolding CLI
│   └── ui/             # Design System (@humyn/ui)
│       ├── src/
│       │   ├── components/
│       │   │   ├── ui/        # Raw Shadcn components
│       │   │   └── [Name]/    # Wrapped components (e.g., Button/)
│       │   └── styles/        # Global SCSS & Tailwind tokens
│       └── dist/              # Built CSS (tailwind.css -> styles.css)
├── templates/          # App blueprints
│   ├── next-app/       # Next.js App Router template
│   └── vite-app/       # Vite + React template
└── turbo.json          # Turborepo task pipeline configuration
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
import Button from "@humyn/ui/Button";

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
