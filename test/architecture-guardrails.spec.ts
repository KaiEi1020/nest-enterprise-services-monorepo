import { describe, it, expect } from '@jest/globals';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

/**
 * Regression for the architectural guardrails in ADR-0002 / ADR-0001.
 *
 * ESLint (`no-restricted-imports` + `@nx/enforce-module-boundaries`) is the
 * real enforcer; these tests assert the current source tree stays on the
 * right side of the rules so a violation fails CI before lint even runs.
 */
const repoRoot = process.cwd();

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (
      entry === 'node_modules' ||
      entry === 'dist' ||
      entry === '.git' ||
      entry === '.nx' ||
      entry === 'coverage'
    )
      continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, acc);
    else if (entry.endsWith('.ts')) acc.push(full);
  }
  return acc;
}

function sourceFilesUnder(root: string): string[] {
  return walk(join(repoRoot, root)).map((f) => relative(repoRoot, f));
}

describe('architecture guardrails', () => {
  const bffFiles = [
    ...sourceFilesUnder('apps/bff-admin/src'),
    ...sourceFilesUnder('apps/bff-student/src'),
  ];

  it('BFF source never imports MikroORM or business persistence (ADR-0002)', () => {
    const offenders = bffFiles.filter((f) =>
      /from\s+['"](@mikro-orm|@nestjs\/(typeorm|mongoose|mikro-orm)|typeorm|mongoose|prisma|@prisma\/client|pg|mysql2|mongodb)/.test(
        readFileSync(join(repoRoot, f), 'utf8'),
      ),
    );
    expect(offenders).toEqual([]);
  });

  it('bsc-marketing source never imports bsc-user internals (ADR-0006)', () => {
    const files = sourceFilesUnder('apps/bsc-marketing/src');
    const offenders = files.filter((f) =>
      /from\s+['"]apps\/bsc-user/.test(readFileSync(join(repoRoot, f), 'utf8')),
    );
    expect(offenders).toEqual([]);
  });

  it('bsc-user source never imports bsc-marketing internals (ADR-0006)', () => {
    const files = sourceFilesUnder('apps/bsc-user/src');
    const offenders = files.filter((f) =>
      /from\s+['"]apps\/bsc-marketing/.test(
        readFileSync(join(repoRoot, f), 'utf8'),
      ),
    );
    expect(offenders).toEqual([]);
  });

  it('shared libraries contain no domain aggregates or repositories (ADR-0001)', () => {
    const files = [
      ...sourceFilesUnder('libs/contracts/src'),
      ...sourceFilesUnder('libs/platform/src'),
    ];
    const offenders = files.filter(
      (f) =>
        /\.(entity|repository)\.ts$/.test(f) ||
        /class\s+\w+\s*(implements|extends)\s*\w*Repository/.test(
          readFileSync(join(repoRoot, f), 'utf8'),
        ),
    );
    expect(offenders).toEqual([]);
  });
});
