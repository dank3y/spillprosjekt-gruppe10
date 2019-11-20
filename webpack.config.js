const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    entry: ['./src/options.ts', './src/index.ts', './src/utility/level.loader.ts'],
    devtool: 'inline-source-map',
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        compress: true,
        port: 9000
    },
    module: {
        rules: [{
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader']
            },
            {
                test: /\.(png|jpe?g|gif|mp3)$/i,
                use: [
                    {
                        loader: 'file-loader',
                    }, 
                ],
            },
            {
                test: /\.ttf$/,
                loader: 'file-loader',
                options: {
                    name: '[path][name].[ext]'
                }
            }
        ],
    },
    resolve: {
        extensions: ['.ts', '.js', '.png'],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './index.html',
            meta: {
                viewport: 'width=device-width, initial-scale=1, shrink-to-fit=no',
            }
        }),
        new MiniCssExtractPlugin({
            filename: '[name].css'
        })
    ],
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
};