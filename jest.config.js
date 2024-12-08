module.exports = {
  testEnvironment: 'jsdom', // Ensure we're using jsdom for DOM manipulation
  transform: {
    '^.+\\.[t|j]sx?$': 'babel-jest', // Transform JSX and TSX files
		'^.+\\.tsx?$': 'ts-jest', // For TypeScript and TSX
    '^.+\\.scss$': 'jest-scss-transform', // If you use SCSS, handle them
		
  },
  moduleNameMapper: {
    '\\.(css|scss)$': 'identity-obj-proxy', // Mock CSS modules
  },
  setupFilesAfterEnv: [
    '@testing-library/jest-dom/extend-expect',  // Extend jest with custom matchers
    'jest-styled-components', // Ensure styled-components work with Jest
  ],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}', // Collect coverage for all JS/TS files
  ],
  testTimeout: 10000, // 10 seconds timeout for tests
};
