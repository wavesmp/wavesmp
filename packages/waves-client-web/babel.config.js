/* Lerna (monorepo tool) may use symlinks to connect
 * packages. This can confuse module resolution to look
 * for node_modules relative to the symlinked package.
 * So, resolve the babel modules here.
 * See: https://github.com/webpack/webpack/issues/1866 */
module.exports = {
  presets: ['@babel/preset-react'].map(require.resolve),
  plugins: [
    '@babel/plugin-proposal-class-properties',
    'babel-plugin-inline-react-svg'
  ].map(require.resolve)
}
