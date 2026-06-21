module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: '18.2' } },
  plugins: ['react-refresh'],
  rules: {
    'react/jsx-no-target-blank': 'off',
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    // This project is plain JS (no PropTypes) and uses react-three-fiber
    // extensively, whose intrinsic elements (<mesh geometry=.../>, custom
    // shader uniforms, etc.) aren't real DOM/React props. Both rules only
    // produce false positives here.
    'react/prop-types': 'off',
    'react/no-unknown-property': 'off',
  },
}
