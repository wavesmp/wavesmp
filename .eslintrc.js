const buildConstants = require('./packages/waves-client-web/buildConstants')

module.exports = {
  parser: 'babel-eslint',
  env: {
    browser: true,
    es6: true,
    node: true,
    mocha: true
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'prettier',
    'prettier/babel',
    'prettier/react'
  ],
  globals: getGlobals(),
  plugins: ['babel', 'react'],
  rules: {
    'no-unused-vars': ['error', { varsIgnorePattern: '^_$' }],
    'react/prop-types': 'off'
  }
}

function getGlobals() {
  const globals = {
    AWS: 'readonly',
    gapi: 'readonly'
  }
  for (const c in buildConstants) {
    globals[c] = 'readonly'
  }
  return globals
}
