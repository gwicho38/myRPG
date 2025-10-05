#!/usr/bin/env node

const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const net = require('net');

/**
 * Check if a port is available
 */
function isPortAvailable(port) {
	return new Promise((resolve) => {
		const server = net.createServer();
		server.once('error', () => {
			resolve(false);
		});
		server.once('listening', () => {
			server.close();
			resolve(true);
		});
		server.listen(port);
	});
}

/**
 * Find an available port, starting with preferred port
 */
async function findAvailablePort(preferredPort = 8080) {
	if (await isPortAvailable(preferredPort)) {
		return preferredPort;
	}

	console.log(`Port ${preferredPort} is in use, finding alternative port...`);

	// Try random ports between 8081 and 8999
	for (let attempts = 0; attempts < 100; attempts++) {
		const randomPort = Math.floor(Math.random() * (8999 - 8081 + 1)) + 8081;
		if (await isPortAvailable(randomPort)) {
			return randomPort;
		}
	}

	throw new Error('Could not find an available port');
}

let config;
try {
	config = require('../webpack/dev.js');
} catch (error) {
	console.error('Error loading webpack config:', error);
	process.exit(1);
}

// Remove problematic _assetEmittingPreviousFiles property if it exists
if (config && config._assetEmittingPreviousFiles) {
	delete config._assetEmittingPreviousFiles;
}

const runServer = async () => {
	try {
		const preferredPort = config.devServer?.port || 8080;
		const availablePort = await findAvailablePort(preferredPort);

		// Update config with available port
		if (!config.devServer) {
			config.devServer = {};
		}
		config.devServer.port = availablePort;

		let compiler;
		try {
			compiler = webpack(config);
		} catch (error) {
			console.error('Error creating webpack compiler:', error);
			process.exit(1);
		}

		const devServerOptions = config.devServer || {};
		const server = new WebpackDevServer(devServerOptions, compiler);

		console.log(`Starting development server on http://localhost:${availablePort}...`);
		await server.start();
		console.log(`Development server started successfully on http://localhost:${availablePort}!`);
	} catch (error) {
		console.error('Error starting dev server:', error);
		process.exit(1);
	}
};

runServer().catch((error) => {
	console.error('Unhandled error:', error);
	process.exit(1);
});
