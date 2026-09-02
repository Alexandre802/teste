import next from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

/** ESLint 9 flat config. eslint-config-next 16 ja exporta config plana. */
const config = [
  { ignores: [".next/**", "node_modules/**", "public/**", "test-results/**"] },
  ...next,
  ...nextTypescript,
];

export default config;
