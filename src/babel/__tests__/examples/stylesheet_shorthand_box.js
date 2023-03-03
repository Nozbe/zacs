/* eslint-disable */
import * as zacs from 'zacs'

const styles = zacs.stylesheet({
  one: {
    margin: 5,
    padding: 5,
    inset: 5,
    inset: '10%',
  },
  oneArray: {
    margin: [5],
    padding: [5],
    inset: [5],
  },
  twoArray: {
    margin: [5, 10],
    padding: [5, 10],
    inset: [5, 10],
  },
  threeArray: {
    margin: [5, '10%', 15],
    padding: [5, '10%', 15],
    inset: [5, '10%', 15],
  },
  fourArray: {
    margin: [5, 10, 15, 20],
    padding: [5, 10, 15, 20],
    inset: [5, 10, 15, 20],
  },
})
