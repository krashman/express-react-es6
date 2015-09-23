// Webpack config for creating the production bundle.

/* eslint no-var: 0, no-console: 0 */

var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var StatsWriterPlugin = require('webpack-stats-plugin').StatsWriterPlugin;
var CleanPlugin = require('clean-webpack-plugin');
var strip = require('strip-loader');

var dist = path.resolve(__dirname, '../static/dist');

module.exports = {
    devtool: 'source-map',
    entry: './app/client.js',
    output: {
        path: dist,
        filename: '[name]-[hash].js',
        chunkFilename: '[name]-[chunkhash].js',
        publicPath: '/dist/'
    },
    module: {
        loaders: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loaders: [strip.loader('debug'), 'babel']
        }, {
            test: /\.less$/,
            loader: ExtractTextPlugin.extract('style', 'css!autoprefixer?browsers=last 2 version!less')
        }, {
            test: /\.(jpe?g|gif|png|json|txt)$/,
            loader: 'file'
        }, {
            // use this mask for font-awesome fonts with params
            test: /\.(eot|svg|woff2?|ttf)(\?.*$|$)/,
            loader: 'file'
        }]
    },
    plugins: [
        // clean dist directory
        new CleanPlugin('./static/dist', path.join(__dirname, '..')),

        // use only one 'en-gb' locale from momentjs
        new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en-gb/),

        // css files from the extract-text-plugin loader
        new ExtractTextPlugin('[name]-[chunkhash].css'),

        // set global vars
        new webpack.DefinePlugin({
            'process.env': {

                // Mainly used to require CSS files with webpack, which can happen only on browser
                // Used as `if (process.env.BROWSER)...`
                BROWSER: JSON.stringify(true),

                // Useful to reduce the size of client-side libraries, e.g. react
                NODE_ENV: JSON.stringify('production')

            }
        }),

        // optimizations
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        }),

        // Write out stats.json file to build directory.
        new StatsWriterPlugin({
            transform: function (data) {
                return {
                    main: data.assetsByChunkName.main[0],
                    css: data.assetsByChunkName.main[1]
                };
            }
        })

    ]
};
