// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import nxPlugin from '@nx/eslint-plugin';

const bffRoots = ['apps/bff-admin/src/**/*', 'apps/bff-student/src/**/*'];
const testFiles = [
  '**/*.spec.ts',
  '**/*.e2e-spec.ts',
  '**/jest.config.ts',
  '**/jest-e2e.json',
];

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs', 'dist/**', 'coverage/**', '.nx/**'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...nxPlugin.configs['flat/base'],
  ...nxPlugin.configs['flat/typescript'],
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      // async methods that don't await still return a Promise; this rule is a
      // noisy false positive for passthrough/stub methods and adds no safety.
      '@typescript-eslint/require-await': 'off',
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },
  // Test and jest-config files are transformed by ts-jest at runtime; the
  // type-checked lint context does not see their resolved types, so the
  // unsafe-* family is noisy there. Keep type-checking authoritative for
  // those files via `nx typecheck` instead.
  {
    files: testFiles,
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
    },
  },
  // BFFs must not import any business persistence layer (ADR-0002). MikroORM is
  // only one vector; ban the common ORM/persistence packages outright so a BFF
  // cannot wire a business database by mistake. Real persistence belongs to the
  // owning BSC; BFFs reach it over gRPC.
  {
    files: bffRoots,
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@mikro-orm/*',
                '@mikro-orm/*/sub-path',
                '@nestjs/typeorm',
                '@nestjs/mongoose',
                '@nestjs/mikro-orm',
                'typeorm',
                'mongoose',
                'prisma',
                '@prisma/client',
                'pg',
                'mysql2',
                'mongodb',
              ],
              message:
                'BFFs must not import business persistence. Use gRPC to call the owning BSC (ADR-0002).',
            },
          ],
        },
      ],
    },
  },
  // Enforce Nx module boundaries: domain scopes may not import each other, BFFs
  // may only depend on shared libs, and shared libs must stay domain-free.
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['jest.preset.ts', '../../jest.preset.ts', '../jest.preset.ts'],
          depConstraints: [
            {
              sourceTag: 'scope:shared',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
            {
              sourceTag: 'scope:bff-admin',
              onlyDependOnLibsWithTags: ['scope:shared', 'scope:bff-admin'],
            },
            {
              sourceTag: 'scope:bff-student',
              onlyDependOnLibsWithTags: ['scope:shared', 'scope:bff-student'],
            },
            {
              sourceTag: 'scope:bsc-user',
              onlyDependOnLibsWithTags: ['scope:shared', 'scope:bsc-user'],
            },
            {
              sourceTag: 'scope:bsc-marketing',
              onlyDependOnLibsWithTags: ['scope:shared', 'scope:bsc-marketing'],
            },
          ],
        },
      ],
    },
  },
);
