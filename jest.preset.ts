import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testEnvironment: 'node',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: './coverage',
  moduleNameMapper: {
    '^@enterprise/contracts(|/.*)$': '<rootDir>/libs/contracts/src/$1',
    '^@enterprise/platform(|/.*)$': '<rootDir>/libs/platform/src/$1',
  },
};

export default config;
