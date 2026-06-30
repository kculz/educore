import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

const tsFiles = ['**/*.ts', '**/*.tsx'];

export default [
  {
    ignores: [
      '**/dist/**',
      '**/.next/**',
      '**/coverage/**',
      '**/node_modules/**',
      '**/*.d.ts',
    ],
  },
  {
    files: tsFiles,
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
];

