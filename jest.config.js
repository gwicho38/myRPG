module.exports = {
	testEnvironment: 'jsdom',
	roots: ['<rootDir>/src'],
	testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
	transform: {
		'^.+\\.js$': 'babel-jest',
	},
	moduleNameMapper: {
		'\\.(css|less|scss|sass)$': '<rootDir>/src/__mocks__/styleMock.js',
		'\\.(gif|ttf|eot|svg|png|jpg|jpeg|mp4)$': '<rootDir>/src/__mocks__/fileMock.js',
	},
	collectCoverageFrom: [
		'src/**/*.js',
		'!src/index.js',
		'!src/**/*.test.js',
		'!src/**/*.spec.js',
		'!src/__mocks__/**',
	],
	coverageDirectory: 'coverage',
	coverageReporters: ['text', 'lcov', 'html'],
	setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.js'],
};