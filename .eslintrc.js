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
    /* For implmenting interfaces, methods without `this` may be needed */
    'class-methods-use-this': 'off',
    /* for-in loops without guard is fine for simple objects */
    'guard-for-in': 'off',
    /* Seeing import warning due to this being a monorepo */
    'import/no-extraneous-dependencies': 'off',
    /* Allow multiple classes for convenience */
    'max-classes-per-file': 'off',
    /* Allow awaits in loops */
    'no-await-in-loop': 'off',
    /* Allow console for debugging */
    'no-console': 'off',
    /* Allow parameter modifying/reassigning */
    'no-param-reassign': 'off',
    /* Don't restrict features such as for-of loops
     * See https://github.com/airbnb/javascript/issues/1271 */
    'no-restricted-syntax': 'off',
    /* Use shadowing feature */
    'no-shadow': 'off',
    /* Allow dangling underscore in identifiers */
    'no-underscore-dangle': 'off',
    /* Update ignored var pattern */
    'no-unused-vars': ['error', { varsIgnorePattern: '^_$' }],
    /* Use hoisting feature */
    'no-use-before-define': 'off',
    /* Avoid prop types for now. May want to look into TypeScript instead */
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
