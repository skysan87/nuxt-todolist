module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    parser: '@babel/eslint-parser',
    requireConfigFile: false
  },
  extends: [
    '@nuxtjs',
    'plugin:nuxt/recommended'
  ],
  // add your custom rules here
  rules: {
    'no-lonely-if': 'off',
    'no-unused-vars': 'off',
    'dot-notation': 'off',
    'vue/multi-word-component-names': 'off',
    'no-console': 'off'
  }
}
