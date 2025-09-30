module.exports = {
	testEnvironment: 'jsdom',
	roots: ['<rootDir>/src'],
	testMatch: ['**/__tests__/**/*.{js,ts}', '**/?(*.)+(spec|test).{js,ts}'],
	testPathIgnorePatterns: ['/node_modules/', 'setup.config.js'],
	transform: {
		'^.+\\.js$': 'babel-jest',
		'^.+\\.ts$': 'ts-jest',
	},
	transformIgnorePatterns: [
		'node_modules/(?!(phaser3-juice-plugin|phaser3-nineslice|phaser3-rex-plugins)/)',
	],
	moduleNameMapper: {
		'\\.(css|less|scss|sass)$': '<rootDir>/src/__mocks__/styleMock.js',
		'\\.(gif|ttf|eot|svg|png|jpg|jpeg|mp4)$': '<rootDir>/src/__mocks__/fileMock.js',
		'^phaser$': '<rootDir>/src/__mocks__/phaserMock.js',
		'^phaser3-juice-plugin$': '<rootDir>/src/__mocks__/phaserJuiceMock.js',
		'^phaser3-nineslice$': '<rootDir>/src/__mocks__/ninesliceMock.js',
		'^phaser3-rex-plugins/plugins/(.*)$': '<rootDir>/src/__mocks__/rexPluginsMock.js',
	},
	collectCoverageFrom: [
		'src/**/*.{js,ts}',
		'!src/index.{js,ts}',
		'!src/**/*.test.{js,ts}',
		'!src/**/*.spec.{js,ts}',
		'!src/__mocks__/**',
		'!src/__tests__/**',
		'!src/**/*.d.ts',
	],
	coverageDirectory: 'coverage',
	coverageReporters: ['text', 'lcov', 'html'],
	setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.config.js'],
};