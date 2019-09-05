module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      '@nozbe/zacs/babel',
      {
        platform: 'native',
        production: true,
      },
    ],
  ],
};
