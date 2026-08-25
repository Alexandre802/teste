import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

const config = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    // Fora do app: skills do Claude Code, imagens de referência e build.
    ignores: ['.next/**', '.vercel/**', 'node_modules/**', 'next-env.d.ts', '.claude/**', 'arquivo/**'],
  },
  {
    // Argumentos com underscore marcam o que ainda não é usado de propósito —
    // é o caso das funções de lib/auth.ts, que esperam o back-end.
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  {
    // Ferramentas de linha de comando: rodam no Node direto, sem bundler, e
    // precisam resolver a CLI da Vercel em tempo de execução — só com require.
    files: ['scripts/**/*.cjs'],
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
];

export default config;
