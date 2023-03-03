/* eslint-disable */
import * as zacs from 'zacs'

const styles = zacs.stylesheet({
  root: {
    height: 100,
    native: {
      width: 1337,
    },
    ios: {
      marginHorizontal: 5,
    },
    android: {
      opacity: 0.1,
    },
    web: {
      color: 'black',
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
