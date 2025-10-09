const { merge } = require('webpack-merge');
const path = require('path');
const base = require('./base');

module.exports = merge(base, {
	mode: 'development',
	devtool: 'eval-source-map',
	output: {
		filename: '[name].js',
		chunkFilename: '[name].chunk.js',
		clean: false, // Don't clean in development
	},
	performance: {
		hints: false, // Disable performance hints in development
	},
	optimization: {
		minimize: false,
		splitChunks: {
			chunks: 'all',
			cacheGroups: {
				// Phaser core
				phaser: {
					test: /[\\/]node_modules[\\/]phaser[\\/]/,
					name: 'phaser',
					priority: 30,
					chunks: 'all',
					enforce: true,
				},
				// Rex plugins
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
				},
			},
		},
		runtimeChunk: 'single',
	},
	devServer: {
		static: {
			directory: path.join(__dirname, '../dist'),
		},
		compress: true,
		port: 8080,
		hot: true,
		open: false,
		historyApiFallback: true,
		client: {
			overlay: {
				errors: true,
				warnings: false,
			},
		},
	},
});
