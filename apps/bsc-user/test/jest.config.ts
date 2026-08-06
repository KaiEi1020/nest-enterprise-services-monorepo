import type { Config } from 'jest';
import baseConfig from '../../../jest.preset.ts';

const config: Config = {
  ...baseConfig,
  rootDir: '..',
  roots: ['<rootDir>/src'],
  testRegex: '.*\\.spec\\.ts$',
  moduleNameMapper: {
    '^@enterprise/contracts(|/.*)$': '<rootDir>/../../libs/contracts/src/$1',
    '^@enterprise/platform(|/.*)$': '<rootDir>/../../libs/platform/src/$1',
  },
};

export default config;
