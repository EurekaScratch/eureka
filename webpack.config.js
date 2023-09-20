const svgToMiniDataURI = require('mini-svg-data-uri');
const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { UserscriptPlugin } = require('webpack-userscript');
const packageJSON = require('./package.json');

const prodConfig = {
    mode: 'production',
    entry: './src/index.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
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
                use: [
                    'babel-loader'
                ],
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
                    dataUrl: content =>
                        svgToMiniDataURI(content.toString())
                }
            }
        ]
    },
    plugins: [
        new UserscriptPlugin({
            headers: {
                name: packageJSON.displayName,
                author: packageJSON.author,
                source: packageJSON.repository,
                description: packageJSON.description,
                version: packageJSON.version,
                grant: ['none'],
                'run-at': 'document-start',
                include: [
                    'http://localhost:8601/*',
                    'https://scratch.mit.edu/projects/*',
                    'https://aerfaying.com/Projects/*',
                    'https://www.ccw.site/*', 
                    'https://gitblock.cn/Projects/*',
                    'https://world.xiaomawang.com/*',
                    'https://cocrea.world/*',
                    'https://create.codelab.club/*',
                    'https://www.scratch-cn.cn/*',
                    'https://www.40code.com/*',
                    'https://turbowarp.org/*',
                    'https://codingclip.com/*'
                ]
            },
            pretty: true,
            strict: true,
            whitelist: true
        }),
        new webpack.DefinePlugin({
            '__CHIBI_VERSION__': JSON.stringify(packageJSON.version)
        })
    ]
};

const devConfig = {
    mode: "development",
    entry: {
        main: path.resolve(__dirname, 'src', 'ui', 'playground.tsx')
    },
    output: {
        filename: "app.js",
        path: path.resolve(__dirname, 'dist')
    },
    devServer: {
        port: 11726
    },
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx']
    },
    module: {
        rules: [
            {
                test: /\.tsx?/,
                use: [
                    'babel-loader'
                ],
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
                    dataUrl: content =>
                        svgToMiniDataURI(content.toString())
                }
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin()
    ]
};

if (process.env.NODE_ENV === 'production') {
    module.exports = prodConfig;
} else {
    module.exports = devConfig;
}