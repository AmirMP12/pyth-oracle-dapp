/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {

  preset: 'ts-jest',
  
  testEnvironment: 'node',
  
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  
  testMatch: [
    '**/_tests_/**/*.ts',
    '**/_tests_/**/*.tsx',
    '**/?(*.)+(spec|test).ts',
    '**/?(*.)+(spec|test).tsx'
  ],
  
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: {
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        resolveJsonModule: true,
        moduleResolution: 'node',
      }
    }],
  },
  
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/types/**',
    '!src/server.ts',
    '!src/**/*.interface.ts',
    '!src/**/*.mock.ts',
  ],
  
  coverageDirectory: 'coverage',
  
  coverageReporters: [
    'text',
    'text-summary',
    'lcov',
    'html',
    'json'
  ],
  
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
    '^routes/(.*)$': '<rootDir>/src/routes/$1',
    '^services/(.*)$': '<rootDir>/src/services/$1',
    '^utils/(.*)$': '<rootDir>/src/utils/$1',
  },
  
  transformIgnorePatterns: [
    'node_modules/(?!(@pythnetwork|@conflux-dev)/)',
  ],
  
  moduleFileExtensions: [
    'ts',
    'tsx',
    'js',
    'jsx',
    'json',
    'node'
  ],
  
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  
  testTimeout: 10000,
  
  verbose: true,
  
  clearMocks: true,
  
  resetMocks: true,
  
  restoreMocks: true,
  
  notify: false,
  
  bail: 0,
  
  maxWorkers: '50%',
  
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/',
  ],
  
  watchPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/',
  ],
  
  moduleDirectories: [
    'node_modules',
    'src',
  ],
  
  errorOnDeprecated: false,
  
  forceCoverageMatch: [],
  
  setupFiles: [],
  
  testResultsProcessor: undefined,
  
  testRunner: 'jest-circus/runner',
  
  globals: {
    'ts-jest': {
      tsconfig: {
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        resolveJsonModule: true,
        module: 'commonjs',
        target: 'ES2020',
        lib: ['ES2020'],
        strict: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        moduleResolution: 'node',
        types: ['node', 'jest'],
      },
      isolatedModules: true,
      diagnostics: {
        warnOnly: true,
      },
    },
  },
};