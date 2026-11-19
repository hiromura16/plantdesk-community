/** 実行環境ごとに使用できるAPIを限定し、暗黙のグローバル依存とHooksの不整合を検査します。 */
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';
const ignored = [
  'public/**',
  'frontend/.build/**',
  '**/node_modules/**',
  '.runtime/**',
  '.deploy/**',
  '.wrangler/**',
  'cloudflare/dist/**',
  'cloudflare/generated-env.d.ts',
  'shared/api-schema.d.ts',
];
export default [
  { ignores: ignored },
  js.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs,jsx,ts}'],
    languageOptions: { ecmaVersion: 'latest' },
    rules: {
      'no-var': 'error',
      'prefer-const': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      curly: ['error', 'all'],
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-duplicate-imports': 'error',
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrors: 'none',
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  {
    files: ['frontend/src/**/*.{js,jsx,ts}', 'shared/*.js'],
    languageOptions: { sourceType: 'module', globals: globals.browser },
  },
  {
    files: ['cloudflare/**/*.mjs', 'connectors/notion/*.mjs'],
    ignores: ['cloudflare/tests/**'],
    languageOptions: { globals: globals.worker },
  },
  {
    files: [
      'scripts/**/*.mjs',
      'server/**/*.mjs',
      'tests/**/*.{mjs,cjs}',
      'cloudflare/tests/**/*.mjs',
      'frontend/*.mjs',
      'eslint.config.mjs',
    ],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['frontend/src/**/*.jsx'],
    languageOptions: { parser: tseslint.parser, parserOptions: { ecmaFeatures: { jsx: true } } },
    plugins: { 'react-hooks': reactHooks, '@typescript-eslint': tseslint.plugin },
    rules: {
      ...reactHooks.configs.flat.recommended.rules,
      'react-hooks/exhaustive-deps': 'error',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrors: 'none',
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  {
    files: ['**/*.ts'],
    languageOptions: { parser: tseslint.parser },
    plugins: { '@typescript-eslint': tseslint.plugin },
    rules: {
      'no-undef': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
];
