'use strict';

const eslintFriendlyFormatter = require('eslint-friendly-formatter');
const path = require('path');
const webpack = require('webpack');

const ROOT = path.join(__dirname, '..');

module.exports = {
  devtool: '#source-map',

  entry: [path.join(ROOT, 'src', 'index.js')],

  externals: {
    react: {
      amd: 'react',
      commonjs: 'react',
      commonjs2: 'react',
      root: 'React'
    }
  },

  module: {
    rules: [
      {
        enforce: 'pre',
        include: [path.join(ROOT, 'src')],
        loader: 'eslint-loader',
        options: {
          configFile: '.eslintrc',
          failOnError: true,
          failOnWarning: false,
          formatter: eslintFriendlyFormatter
        },
        test: /\.js$/
      },
      {
        include: [path.join(ROOT, 'DEV_ONLY'), path.join(ROOT, 'src')],
        loader: 'babel-loader',
        test: /\.js$/
      }
    ]
  },

  output: {
    filename: 'react-idle-manager.js',
    library: 'IdleManager',
    path: path.join(ROOT, 'dist'),
    umdNamedDefine: true
  },

  plugins: [new webpack.EnvironmentPlugin(['NODE_ENV'])]
};
