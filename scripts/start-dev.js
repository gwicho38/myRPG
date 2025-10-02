#!/usr/bin/env node

const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

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

let compiler;
try {
    compiler = webpack(config);
} catch (error) {
    console.error('Error creating webpack compiler:', error);
    process.exit(1);
}

const devServerOptions = config.devServer || {};
const server = new WebpackDevServer(devServerOptions, compiler);

const runServer = async () => {
    try {
        console.log('Starting development server on http://localhost:8080...');
        await server.start();
        console.log('Development server started successfully!');
    } catch (error) {
        console.error('Error starting dev server:', error);
        process.exit(1);
    }
};

runServer().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
});