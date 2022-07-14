module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          edge: 17,
          firefox: 60,
          chrome: 67,
          safari: '11.1',
        },
        useBuiltIns: 'usage',
        corejs: '3.7.0',
        loose: true,
      },
    ],
    '@babel/preset-typescript',
    '@babel/preset-react',
  ],
  plugins: [
    '@babel/plugin-transform-object-assign',
    'lodash',
    [
      'module-resolver',
      {
        root: './lib',
        alias: {
          '@lib': './lib',
        },
      },
    ],
  ],
};
