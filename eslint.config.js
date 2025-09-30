const js = require('@eslint/js');
const prettierPlugin = require('eslint-plugin-prettier');
const prettierConfig = require('eslint-config-prettier');
const babelParser = require('@babel/eslint-parser');
const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');

module.exports = [
	js.configs.recommended,
	{
		files: ['src/**/*.js'],
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			parser: babelParser,
			parserOptions: {
				requireConfigFile: false,
			},
			globals: {
				Phaser: 'readonly',
				document: 'readonly',
				window: 'readonly',
				console: 'readonly',
				localStorage: 'readonly',
				setTimeout: 'readonly',
				setInterval: 'readonly',
				clearTimeout: 'readonly',
				clearInterval: 'readonly',
				HTMLCanvasElement: 'readonly',
				process: 'readonly',
				navigator: 'readonly',
				performance: 'readonly',
			},
		},
		plugins: {
			prettier: prettierPlugin,
		},
		rules: {
			...prettierConfig.rules,
			'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
			'no-console': ['warn', { allow: ['warn', 'error'] }],
			'prettier/prettier': ['error', { endOfLine: 'auto' }],
			'no-debugger': 'warn',
			'no-var': 'error',
			'prefer-const': 'warn',
			'no-duplicate-imports': 'error',
		},
	},
	{
		files: ['src/**/*.ts', 'src/**/*.tsx'],
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			parser: tsParser,
			parserOptions: {
				project: './tsconfig.json',
			},
			globals: {
				Phaser: 'readonly',
				document: 'readonly',
				window: 'readonly',
				console: 'readonly',
				localStorage: 'readonly',
				setTimeout: 'readonly',
				setInterval: 'readonly',
				clearTimeout: 'readonly',
				clearInterval: 'readonly',
				HTMLCanvasElement: 'readonly',
				process: 'readonly',
				navigator: 'readonly',
				performance: 'readonly',
			},
		},
		plugins: {
			'@typescript-eslint': tsPlugin,
			prettier: prettierPlugin,
		},
		rules: {
			...tsPlugin.configs.recommended.rules,
			...prettierConfig.rules,
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
			'@typescript-eslint/explicit-module-boundary-types': 'off',
			'prettier/prettier': ['error', { endOfLine: 'auto' }],
		},
	},
	{
		files: ['**/__tests__/**/*.{js,ts}', '**/*.test.{js,ts}', '**/*.spec.{js,ts}', 'src/__mocks__/**/*.js'],
		languageOptions: {
			globals: {
				jest: 'readonly',
				describe: 'readonly',
				it: 'readonly',
				test: 'readonly',
				expect: 'readonly',
				beforeEach: 'readonly',
				afterEach: 'readonly',
				beforeAll: 'readonly',
				afterAll: 'readonly',
				module: 'readonly',
				require: 'readonly',
				global: 'readonly',
			},
		},
	},
	{
		ignores: [
			'node_modules/**',
			'dist/**',
			'docs/**',
			'tutorial/**',
			'webpack/**',
			'*.min.js',
			'bundle.js',
			'coverage/**',
			'src/assets/maps/**/*.tsx',
			'*.config.js',
			'electron-main.js',
			'src/plugins/AnimatedTiles.js',
		],
	},
];