// babel.config.js (create this file in your root directory)
module.exports = {
  presets: [
    ['next/babel'],
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
    '@babel/preset-typescript'
  ],
}
