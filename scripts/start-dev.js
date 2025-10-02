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

// Clean any problematic options
const cleanConfig = (obj) => {
    if (!obj || typeof obj !== 'object') {
        return obj;
    }

    // Handle arrays
    if (Array.isArray(obj)) {
        return obj.map(item => cleanConfig(item));
    }

    // Don't clean webpack plugin instances or functions
    if (typeof obj.apply === 'function' || typeof obj === 'function') {
        return obj;
    }

    // Don't clean class instances
    if (obj.constructor && obj.constructor !== Object && obj.constructor !== Array) {
        return obj;
    }

    // Handle plain objects
    const cleaned = { ...obj };
    delete cleaned._assetEmittingPreviousFiles;

    Object.keys(cleaned).forEach(key => {
        if (typeof cleaned[key] === 'object' && cleaned[key] !== null) {
            cleaned[key] = cleanConfig(cleaned[key]);
        }
    });

    return cleaned;
};

const cleanedConfig = cleanConfig(config);

let compiler;
try {
    compiler = webpack(cleanedConfig);
} catch (error) {
    console.error('Error creating webpack compiler:', error);
    process.exit(1);
}

const devServerOptions = cleanedConfig.devServer || {};
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