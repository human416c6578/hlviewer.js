const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const packageJson = require('./package.json');

const license = fs.readFileSync('LICENSE', 'utf8');

const isProduction = process.env.NODE_ENV === 'production';

const plugins = [
  new webpack.BannerPlugin({
    banner: license
  }),
  new webpack.DefinePlugin({
    VERSION: JSON.stringify(packageJson.version)
  })
];

if (isProduction) {
  plugins.push(new TerserPlugin());
}

module.exports = {
  mode: isProduction ? 'production' : 'development',
  entry: './src/index.ts',
  output: {
    filename: isProduction ? 'hlviewer.min.js' : 'hlviewer.js',
    path: path.resolve(__dirname, './dist'),
    library: 'HLViewer',
    libraryTarget: 'umd'
  },
  devtool: isProduction ? 'source-map' : 'eval-source-map', // Corrected devtool option
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        include: [path.resolve(__dirname, './src')],
        use: { loader: 'ts-loader' }
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.jsx']
  },
  plugins
};
