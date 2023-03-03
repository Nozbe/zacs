/* eslint-disable */
import * as zacs from 'zacs'

const styles = zacs.stylesheet({
  root: {
    backgroundColor: 'red',
    height: 50,
    width: '100%',
    // native-only
    native: {
      width: 1337,
      _mixin: { left: 0, right: 0 },
    },
    ios: {
      marginHorizontal: 5,
    },
    android: {
      opacity: 0.1,
    },
    // web-only
    web: {
      WebkitPaddingStart: 20,
      zIndex: 1500,
    },
    '& > div': {
      margin: -20,
      opacity: 0.5,
    },
  },
  text: {
    color: '#abcdef',
    fontSize: 12,
    fontWeight: 'bold',
    paddingLeft: 20,
    paddingRight: 20,
    opacity: 0.5,
    // web-only postcss syntax
    backgroundColor: '@theme(onSurface1)',
  },
})
