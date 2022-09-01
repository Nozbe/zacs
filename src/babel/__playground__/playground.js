/* eslint-disable */
import zacs from '@nozbe/zacs'

const Root = zacs.view([style.root, style.root2])
const Root2 = zacs.createView([style.root, style.root2])
const view = <Root />

const styles = zacs.stylesheet({
  one: {
    margin: 5,
    padding: 5,
    inset: 5,
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
    margin: [5, 10, 15],
    padding: [5, 10, 15],
    inset: [5, 10, 15],
  },
  fourArray: {
    margin: [5, 10, 15, 20],
    padding: [5, 10, 15, 20],
    inset: [5, 10, 15, 20],
  },
  border: {
    border: [1, 'solid', 'red'],
  },
})
