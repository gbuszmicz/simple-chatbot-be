module.exports = {
  testEnvironment: 'node',
  testEnvironmentOptions: {
    NODE_ENV: 'test',
  },
  restoreMocks: true,
  coveragePathIgnorePatterns: [
    '<rootDir>/node_modules',
    '<rootDir>/src/app.js',
    '<rootDir>/src/index.js',
  ],
  coverageReporters: ['text', 'lcov', 'clover', 'html'],
  setupFilesAfterEnv: ['./jest.setup.redis-mock.js']
};
