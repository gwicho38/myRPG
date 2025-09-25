const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    devtool: 'eval-source-map',
    entry: './src/index.ts',
    output: {
        path: path.resolve(__dirname, '../dist'),
        filename: 'bundle.js',
        clean: true,
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },
    module: {
        rules: [
            {
                test: /\.[jt]sx?$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                    },
                    {
                        loader: 'ts-loader',
                        options: {
                            transpileOnly: true,
                        },
                    },
                ],
            },
            {
                test: /\.css$/i,
                use: ['css-loader'],
            },
            {
                test: [/\.vert$/, /\.frag$/],
                use: 'raw-loader',
            },
            {
                test: /\.(gif|png|jpe?g|svg|xml|mp3|mp4|ogg)$/i,
                use: 'file-loader',
            },
        ],
    },
    devServer: {
        port: 8080,
        open: true,
        hot: true,
        static: {
            directory: path.join(__dirname, '../public'),
        },
        historyApiFallback: true,
        compress: true,
    },
    plugins: [
        new webpack.DefinePlugin({
            CANVAS_RENDERER: JSON.stringify(true),
            WEBGL_RENDERER: JSON.stringify(true),
        }),
        new HtmlWebpackPlugin({
            template: './index.html',
            favicon: './favicon.png',
        }),
    ],
};