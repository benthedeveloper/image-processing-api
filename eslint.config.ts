import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier';

export default defineConfig([
  {
    ignores: ['dist/**', 'spec/**', 'eslint.config.ts'],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    plugins: { js },
    extends: ['js/recommended'],
    languageOptions: {
      parserOptions: {
        // Required for type-aware lint rules like no-floating-promises
        project: './tsconfig.json',
      },
    },
    rules: {
      // 1. Core Code Safety
      eqeqeq: ['error', 'always'],
      'prefer-const': 'error',

      // 2. Safely ignore unused express parameters like '_next'
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],

      // 3. Strict Typing for API Safety
      '@typescript-eslint/no-explicit-any': 'warn', // Consider changing to 'error' later
      '@typescript-eslint/explicit-function-return-type': 'off', // 'warn' or 'error' to enforce strict controller return values

      // 4. Async & Promise Protection
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
    },
  },
  tseslint.configs.recommended,
  eslintConfigPrettier,
]);
