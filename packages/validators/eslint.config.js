const { base } = require("@synoro/eslint-config");

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: ["dist/**"],
  },
  ...base,
];
