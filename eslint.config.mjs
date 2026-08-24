import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

const config = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    // Fora do app: skills do Claude Code, imagens de referência e build.
    ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts', '.claude/**', 'referencias/**'],
  },
];

export default config;
