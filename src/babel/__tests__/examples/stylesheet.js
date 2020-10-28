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
    },
  },
  text: {
    color: '#abcdef',
    fontSize: 12,
    fontWeight: 'bold',
    paddingLeft: 20,
    paddingRight: 20,
  },
})
