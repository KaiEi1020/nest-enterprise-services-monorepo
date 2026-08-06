import type { Config } from 'jest';
import baseConfig from '../../jest.preset.ts';

const config: Config = {
  ...baseConfig,
  rootDir: '.',
  roots: ['<rootDir>/src'],
  testRegex: '.*\\.spec\\.ts$',
};

export default config;
