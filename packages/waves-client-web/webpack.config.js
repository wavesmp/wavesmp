const fs = require('fs')
const path = require('path')
const webpack = require('webpack')
const yaml = require('js-yaml')

const babelConfig = require('./babel.config')

const constants = yaml.safeLoad(fs.readFileSync('constants.yaml', 'utf8'));

const stringReplacer = {
  loader: 'string-replace-loader',
  options: {
    multiple: Object.entries(constants).sort(([a], [b]) => {
      return b.length - a.length
    }).map(([key, val]) => ({
      search: key,
      replace: val,
      flags: 'g'
    }))
  }
}

const wpConfig = {
  // mode: 'development',
  mode: 'production',

  entry: path.join(__dirname, 'src', 'index.js'),

  output: {
    path: path.join(__dirname, '/build'),
    filename: '[name].js',
    chunkFilename: '[id].chunk.js',
    publicPath: '/'
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          stringReplacer,
          {
            loader: 'babel-loader',
            options: babelConfig
          }
        ],
        exclude: /node_modules/
      },
      { test: /\.css$/, use: ['style-loader', 'css-loader', stringReplacer] },
      { test: /\.png$/, use: 'file-loader' },
      { test: /\.svg$/, use: 'file-loader' }
    ]
  },

  /* Some libs e.g. musicmetadata require fs,
   * even though it might not actually be used. */
  node: {
    fs: 'empty'
  }

}

module.exports = wpConfig
