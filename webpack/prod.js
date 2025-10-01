const { merge } = require('webpack-merge');
const path = require('path');
const base = require('./base');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = merge(base, {
	mode: 'production',
	output: {
		filename: '[name].[contenthash].js',
		chunkFilename: '[name].[contenthash].chunk.js',
	},
	devtool: 'source-map',
	performance: {
		hints: 'warning',
		maxEntrypointSize: 1024000,
		maxAssetSize: 1024000,
	},
	optimization: {
		minimize: true,
		minimizer: [
			new TerserPlugin({
				terserOptions: {
					compress: {
						drop_console: false, // Temporarily enabled for debugging
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
			cacheGroups: {
				vendor: {
					test: /[\\/]node_modules[\\/]/,
					name: 'vendors',
					priority: 10,
				},
				phaser: {
					test: /[\\/]node_modules[\\/]phaser/,
					name: 'phaser',
					priority: 20,
				},
				common: {
					minChunks: 2,
					priority: 5,
					reuseExistingChunk: true,
				},
			},
		},
		runtimeChunk: 'single',
	},
});
