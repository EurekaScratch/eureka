const svgToMiniDataURI = require('mini-svg-data-uri');
const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { UserscriptPlugin } = require('webpack-userscript');
const { includeURLs } = require('./generate-helper');
const packageJSON = require('./package.json');
const process = require('node:process');

const base = {
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    entry: './src/index.ts',
    output: {
        // eslint-disable-next-line no-undef
        path: path.resolve(__dirname, 'dist'),
        publicPath: './',
        filename: 'chibi.js'
    },
    resolve: {
        extensions: ['.ts', '.js', '.tsx', '.jsx']
    },
    module: {
        rules: [
            {
                test: /\.worker\.ts$/,
                use: {
                    loader: 'codingclip-worker-loader',
                    options: {
                        filename: '[name].js',
                        inline: 'fallback'
                    }
                }
            },
            {
                test: /\.tsx?/,
                use: ['babel-loader'],
                exclude: /node_moudles/
            },
            {
                test: /\.(png|jpg|gif)$/,
                type: 'asset/inline'
            },
            {
                test: /\.svg$/,
                type: 'asset/inline',
                generator: {
                    dataUrl: (content) => svgToMiniDataURI(content.toString())
                }
            }
        ]
    },
    plugins: [
        new UserscriptPlugin({
            headers: {
                name: packageJSON.displayName,
                author: packageJSON.author,
                namespace: 'ScratchChibiLoader',
                source: packageJSON.repository,
                description: packageJSON.description,
                version: packageJSON.version,
                license: packageJSON.license,
                grant: ['none'],
                'run-at': 'document-start',
                include: includeURLs
            },
            pretty: true,
            strict: true,
            whitelist: true
        }),
        new webpack.DefinePlugin({
            __CHIBI_VERSION__: JSON.stringify(packageJSON.version)
        })
    ]
};

module.exports = base;
