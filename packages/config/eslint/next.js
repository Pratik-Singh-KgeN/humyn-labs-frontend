import base from "./base.js";

export default [
  ...base,
  {
    extends: ["plugin:@next/next/recommended"],
    rules: {
      // Next-specific ESLint overrides
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];
