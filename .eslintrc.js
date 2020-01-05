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
    'airbnb-base',
    'prettier',
    'prettier/babel',
    'prettier/react'
  ],
  globals: getGlobals(),
  plugins: ['babel', 'react'],
  rules: {
    'class-methods-use-this': 'off',
    'consistent-return': 'off',
    'guard-for-in': 'off',
    'import/no-extraneous-dependencies': 'off',
    'max-classes-per-file': 'off',
    'no-await-in-loop': 'off',
    'no-console': 'off',
    'no-continue': 'off',
    'no-lonely-if': 'off',
    'no-nested-ternary': 'off',
    'no-param-reassign': 'off',
    'no-restricted-syntax': 'off',
    'no-shadow': 'off',
    'no-underscore-dangle': 'off',
    'no-unused-vars': ['error', { varsIgnorePattern: '^_$' }],
    'no-use-before-define': 'off',
    'prefer-template': 'off',
    radix: 'off',
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
