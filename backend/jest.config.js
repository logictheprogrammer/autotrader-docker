/** @type {import('ts-jest').JestConfigWithTsJest} */

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },

  testMatch: ['**/__test__/*.test.ts'],
  verbose: true,
  forceExit: true,
  clearMocks: true,
}
