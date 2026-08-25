import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

const config = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    // Fora do app: skills do Claude Code, imagens de referência e build.
    ignores: ['.next/**', '.vercel/**', 'node_modules/**', 'next-env.d.ts', '.claude/**', 'referencias/**'],
  },
  {
    // Ferramentas de linha de comando: rodam no Node direto, sem bundler, e
    // precisam resolver a CLI da Vercel em tempo de execução — só com require.
    files: ['scripts/**/*.cjs'],
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
];

export default config;
