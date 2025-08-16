import base from "@synoro/eslint-config/base";
import nextjs from "@synoro/eslint-config/nextjs";

export default [
  ...base,
  ...nextjs,
  {
    linterOptions: { reportUnusedDisableDirectives: true },
    languageOptions: { parserOptions: { projectService: true } },
  },
];
