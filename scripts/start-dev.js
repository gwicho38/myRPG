#!/usr/bin/env node

const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const config = require('../webpack/dev.js');

// Clean any problematic options
const cleanConfig = (obj) => {
    if (obj && typeof obj === 'object') {
        const cleaned = { ...obj };
        delete cleaned._assetEmittingPreviousFiles;

        Object.keys(cleaned).forEach(key => {
            if (typeof cleaned[key] === 'object' && cleaned[key] !== null) {
                cleaned[key] = cleanConfig(cleaned[key]);
            }
        });

        return cleaned;
    }
    return obj;
};

const cleanedConfig = cleanConfig(config);

const compiler = webpack(cleanedConfig);
const server = new WebpackDevServer(cleanedConfig.devServer, compiler);

const runServer = async () => {
    console.log('Starting development server...');
    await server.start();
};

runServer();