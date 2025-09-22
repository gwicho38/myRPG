const js = require('@eslint/js');
const prettierPlugin = require('eslint-plugin-prettier');
const prettierConfig = require('eslint-config-prettier');
const babelParser = require('@babel/eslint-parser');

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
		files: ['**/__tests__/**/*.js', '**/*.test.js', '**/*.spec.js'],
		languageOptions: {
			globals: {
				jest: 'readonly',
				describe: 'readonly',
				it: 'readonly',
				expect: 'readonly',
				beforeEach: 'readonly',
				afterEach: 'readonly',
				beforeAll: 'readonly',
				afterAll: 'readonly',
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
		],
	},
];