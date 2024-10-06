const svgToMiniDataURI = require('mini-svg-data-uri');
const webpack = require('webpack');
const path = require('path');
const { UserscriptPlugin } = require('webpack-userscript');
const { includeURLs } = require('./generate-helper');
const packageJSON = require('./package.json');
const process = require('node:process');

const standalone = {
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    entry: './src/index.ts',
    output: {
        // eslint-disable-next-line no-undef
        path: path.resolve(__dirname, 'dist'),
        publicPath: './',
        filename: 'eureka-loader.js'
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
                namespace: 'EurekaLoader',
                source: packageJSON.repository,
                description: packageJSON.description,
                version: packageJSON.version,
                license: packageJSON.license,
                grant: ['none'],
                updateURL: 'https://eureka.codingclip.cc/release/eureka-loader.user.js',
                downloadURL: 'https://eureka.codingclip.cc/release/eureka-loader.user.js',
                'run-at': 'document-start',
                include: includeURLs
            },
            pretty: true,
            strict: true,
            whitelist: true
        }),
        new webpack.DefinePlugin({
            __EUREKA_VERSION__: JSON.stringify(packageJSON.version)
        })
    ]
};

const charlotte = {
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    target: 'web',
    entry: './src/charlotte.ts',
    experiments: {
        outputModule: true
    },
    output: {
        library: {
            type: 'module'
        },
        path: path.resolve(__dirname, 'dist'),
        publicPath: './',
        filename: 'eureka-charlotte.js'
    },
    resolve: standalone.resolve,
    module: standalone.module,
    plugins: [
        new webpack.DefinePlugin({
            __EUREKA_VERSION__: JSON.stringify(packageJSON.version)
        })
    ]
}

module.exports = [standalone, charlotte];
