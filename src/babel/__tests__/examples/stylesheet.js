/* eslint-disable */
import zacs from 'zacs'

const styles = zacs._experimentalStyleSheet({
  root: {
    backgroundColor: 'red',
    height: 50,
    width: '100%',
    flex: 1,
    zIndex: 1000,
    web: {
      WebkitPaddingStart: 20,
      zIndex: 1500,
    },
    native: {
      width: 1337,
    },
    ios: {
      width: 2137,
    },
    android: {
      opacity: 0.1
    },
    css: '& > span { opacity: 0.5 }',
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
    }`
  },
})
