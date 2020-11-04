/* eslint-disable */
import zacs from 'zacs'

const styles = zacs._experimentalStyleSheet({
  root: {
    backgroundColor: 'red',
    height: 50,
    width: '100%',
    flex: 1,
    zIndex: -1000,
    web: {
      WebkitPaddingStart: 20,
      zIndex: 1500,
    },
    native: {
      width: 1337,
    },
    ios: {
      width: REPLACE_INTO_NUMBER,
    },
    android: {
      opacity: 0.1,
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
