const path = require("path");

const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const TerserJSPlugin = require("terser-webpack-plugin");

const babelConfig = require("./babel.config");
const constants = require("./buildConstants");

const stringReplacer = {
  loader: "string-replace-loader",
  options: {
    multiple: Object.entries(constants)
      .sort(([a], [b]) => {
        return b.length - a.length;
      })
      .map(([key, val]) => ({
        search: key,
        replace: val,
        flags: "g",
      })),
  },
};

const wpConfig = {
  mode: process.env.NODE_ENV || "production",
  stats: {
    /* Reduce output for MiniCssExtractPlugin
     * See https://github.com/webpack-contrib/mini-css-extract-plugin/issues/39 */
    children: false,
  },
  optimization: {
    /* CSS is not optimized by default, so use override */
    minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})],
  },

  entry: path.join(__dirname, "src", "index.js"),

  output: {
    path: path.join(__dirname, "/build"),
    filename: "[name].js",
    chunkFilename: "[id].chunk.js",
    publicPath: "/",
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          stringReplacer,
          {
            loader: "babel-loader",
            options: babelConfig,
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [
          { loader: MiniCssExtractPlugin.loader, options: { esModule: true } },
          "css-loader",
          stringReplacer,
        ],
      },
      { test: /\.png$/, use: "file-loader" },
    ],
  },

  plugins: [
    new BundleAnalyzerPlugin({ analyzerMode: "static" }),
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].chunk.css",
    }),
  ],

  /* Some libs e.g. musicmetadata require fs,
   * even though it might not actually be used. */
  node: {
    fs: "empty",
  },
};

module.exports = wpConfig;
