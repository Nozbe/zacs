/* eslint-disable */
import * as zacs from 'zacs'

const styles = zacs.stylesheet({
  root: {
    backgroundColor: 'red',
    height: 50,
    width: '100%',
    // check emulated mixins
    // ...{
    //   flex: 1,
    //   zIndex: -1000,
    // },
    _mixin: { flex: 1, zIndex: -1000 },
    _mixin: { zIndex: -2 },
    // native-only
    native: {
      width: 1337,
      // check native-only expressions
      backgroundColor: foo ? rgba(a, b) : bar,
      _mixin: { left: 0, right: 0 },
    },
    ios: {
      // check replacement by babel
      width: REPLACE_INTO_NUMBER,
      marginHorizontal: foo(0),
    },
    android: {
      opacity: 0.1,
      marginVertical: foo(0),
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
