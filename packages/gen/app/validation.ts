export const kindOptions = [
  {
    hint: "Generated Module exports constants and functions",
    label: "Values",
    value: "values",
  },
  {
    hint: "Generated Module exports a class",
    label: "Class",
    value: "class",
  },
];

export const languageOptions = [
  { label: "TypeScript", value: "ts" },
  { label: "JavaScript", value: "js" },
];

export const testRunnerOptions = [
  { label: "Vitest", value: "vitest" },
  { hint: "No test file generated", label: "None", value: "none" },
  { hint: "Native node:test", label: "Native", value: "node" },
];

export function enquote(s: string): string {
  return `"${s}"`;
}

export function getValidationErrors(
  options: Record<string, boolean | number | string>,
): string[] {
  const errors: string[] = [];
  const check = (k: string, vals: string[]) => {
    const given = options[k];
    if (typeof given === "string" && !vals.includes(given)) {
      errors.push(
        [k, "must be one of", JSON.stringify(vals), "not", enquote(given)].join(
          " ",
        ),
      );
    }
  };
  check(
    "testRunner",
    testRunnerOptions.map((m) => m.value),
  );
  check(
    "kind",
    kindOptions.map((m) => m.value),
  );
  check(
    "language",
    languageOptions.map((m) => m.value),
  );

  return errors;
}
