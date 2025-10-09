const { merge } = require('webpack-merge');
const path = require('path');
const base = require('./base');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = merge(base, {
	mode: 'production',
	output: {
		filename: '[name].[contenthash].js',
		chunkFilename: '[name].[contenthash].chunk.js',
		clean: true, // Clean dist folder before build
	},
	devtool: 'source-map',
	performance: {
		hints: 'warning',
		maxEntrypointSize: 800000, // Reduced from 1024000
		maxAssetSize: 800000, // Reduced from 1024000
	},
	optimization: {
		minimize: true,
		minimizer: [
			new TerserPlugin({
				terserOptions: {
					compress: {
						drop_console: true, // Remove console logs in production
						drop_debugger: true,
						pure_funcs: ['console.log', 'console.info', 'console.debug'],
					},
					output: {
						comments: false,
					},
				},
				extractComments: false,
			}),
		],
		splitChunks: {
			chunks: 'all',
			minSize: 20000,
			maxSize: 500000,
			cacheGroups: {
				// Phaser core - highest priority
				phaser: {
					test: /[\\/]node_modules[\\/]phaser[\\/]/,
					name: 'phaser',
					priority: 30,
					chunks: 'all',
					enforce: true,
				},
				// Rex plugins - high priority
				rexPlugins: {
					test: /[\\/]node_modules[\\/]phaser3-rex-plugins[\\/]/,
					name: 'rex-plugins',
					priority: 25,
					chunks: 'all',
				},
				// Other vendor libraries
				vendor: {
					test: /[\\/]node_modules[\\/]/,
					name: 'vendors',
					priority: 20,
					chunks: 'all',
					maxSize: 300000,
				},
				// Game scenes - medium priority
				scenes: {
					test: /[\\/]src[\\/]scenes[\\/]/,
					name: 'scenes',
					priority: 15,
					chunks: 'all',
					minChunks: 1,
				},
				// Game plugins - medium priority
				plugins: {
					test: /[\\/]src[\\/]plugins[\\/]/,
					name: 'plugins',
					priority: 15,
					chunks: 'all',
					minChunks: 1,
				},
				// Common code
				common: {
					minChunks: 2,
					priority: 10,
					reuseExistingChunk: true,
					maxSize: 200000,
				},
				// Default chunk
				default: {
					minChunks: 2,
					priority: 5,
					reuseExistingChunk: true,
				},
			},
		},
		runtimeChunk: {
			name: 'runtime',
		},
		usedExports: true,
		sideEffects: false,
	},
	module: {
		rules: [
			...base.module.rules,
			{
				test: /\.(mp3|mp4|ogg)$/i,
				type: 'asset/resource',
				generator: {
					filename: 'assets/audio/[name].[contenthash][ext]',
				},
			},
			{
				test: /\.(png|jpe?g|gif|svg)$/i,
				type: 'asset/resource',
				generator: {
					filename: 'assets/images/[name].[contenthash][ext]',
				},
			},
		],
	},
});
