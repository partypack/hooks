module.exports = {
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/'],
  moduleNameMapper: {
    '^@lib/(.*)$': '<rootDir>/lib/$1',
  },
};
