/* eslint-disable */
import zacs from 'zacs'

const styles = zacs._experimentalStyleSheet({
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
    },
    ios: {
      // check replacement by babel
      width: REPLACE_INTO_NUMBER,
    },
    android: {
      opacity: 0.1,
    },
    // web-only
    web: {
      WebkitPaddingStart: 20,
      zIndex: 1500,
    },
    css: '& > span { opacity: 0.5 }',
    '& > div': {
      margin: -20,
      opacity: 0.5,
    }
  },
  text: {
    color: '#abcdef',
    fontSize: 12,
    fontWeight: 'bold',
    paddingLeft: 20,
    paddingRight: 20,
    opacity: 0.5,
    css: `&:hover {
      opacity: .8;
      color: #abbaba;
    }`,
  },
  css: `
  @keyframes hello {
    from { opacity: 0 }
    to { opacity: 0 }
  }
  `,
})
