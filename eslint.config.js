import globals from "globals";

import baseConfig from "./packages/config/eslint/base.js";

export default [
  ...baseConfig,
  {
    files: ["apps/**/*.{ts,tsx}", "packages/ui/**/*.{ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },
];
