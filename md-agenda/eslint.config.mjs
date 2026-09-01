import next from 'eslint-config-next'
import tseslint from 'typescript-eslint'

/**
 * Configuração plana do ESLint. O eslint-config-next 16 já exporta flat
 * config; não passa por FlatCompat.
 */
const config = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'playwright-report/**',
      'test-results/**',
      'public/sw.js',
    ],
  },
  ...next,
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: { '@typescript-eslint': tseslint.plugin },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
]

export default config
