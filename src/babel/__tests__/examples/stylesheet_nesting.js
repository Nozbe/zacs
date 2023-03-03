/* eslint-disable */
import * as zacs from 'zacs'

const styles = zacs.stylesheet({
  root: {
    backgroundColor: 'red',
    opacity: 50,
    width: '100%',
    // native-only
    native: {
      width: 1337,
    },
    ios: {
      marginHorizontal: 5,
    },
    android: {
      opacity: 0.1,
    },
    // web-only
    web: {
      WebkitPaddingStart: 20, // prefixed properties
      backgroundColor: '@theme(onSurface1)', // postcss syntax
      '& > span': {
        '&:first-child': {
          color: 'red',
        },
      },
    },
    '&:hover': {
      margin: -20,
      opacity: 0.5,
    },
  },
})
