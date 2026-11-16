import { test } from "node:test";
import assert from "node:assert/strict";
import { ESLint } from "eslint";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";

// Guards against the class of bug where a page calls a function/variable that
// is never defined (these crash at runtime, only when the user clicks).
test("src has no undefined variables or components", async () => {
  const eslint = new ESLint({
    overrideConfigFile: true,
    overrideConfig: [
      { ignores: ["**/._*"] },
      {
        files: ["**/*.{js,jsx}"],
        languageOptions: {
          ecmaVersion: "latest",
          sourceType: "module",
          parserOptions: { ecmaFeatures: { jsx: true } },
          globals: { ...globals.browser },
        },
        plugins: { react: (await import("eslint-plugin-react")).default, "react-hooks": reactHooks },
        rules: { "no-undef": "error", "react/jsx-no-undef": "error" },
      },
    ],
  });
  const results = await eslint.lintFiles(["src/**/*.{js,jsx}"]);
  const problems = results.flatMap((r) =>
    r.messages
      .filter((m) => m.severity === 2)
      .map((m) => `${r.filePath.split("/src/")[1]}:${m.line} ${m.message}`)
  );
  assert.deepEqual(problems, []);
});
