import { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@shared-types/(.*)$': '<rootDir>/../shared-types/$1',
  },
  testMatch: ['**/*.test.ts'],
  setupFilesAfterEnv: [],
};

export default config;
