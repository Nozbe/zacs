module.exports = {
  verbose: true,
  bail: true,
  rootDir: __dirname,
  modulePaths: ['<rootDir>/src'],
  moduleDirectories: ['<rootDir>/node_modules'],
  restoreMocks: true,
  moduleFileExtensions: ['js'],
  modulePathIgnorePatterns: ['<rootDir>/dist', '<rootDir>/dev', '__tests__/examples'],
  // collectCoverage: true,
  // collectCoverageFrom: ['!**/node_modules/**', 'src/**'],
  // coverageDirectory: 'coverage',
  // coverageReporters: ['html', 'json'],
}
