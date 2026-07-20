// jest.config.cjs
module.exports = {
  moduleNameMapper: {
    '^\\$lib/(.*)$': '<rootDir>/src/lib/$1',
  },
  transform: {
    '^.+\\.svelte$': ['svelte-jester', { preprocess: true }],
    '^.+\\.ts$': 'ts-jest',
    '^.+\\.m?js$': 'babel-jest',
  },
  transformIgnorePatterns: ['node_modules/(?!(@sveltejs|msw|rettime|@mswjs)/)'],
  moduleFileExtensions: ['js', 'mjs', 'ts', 'svelte'],
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  testEnvironment: 'jsdom',
};