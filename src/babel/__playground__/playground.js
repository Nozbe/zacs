/* eslint-disable */
import zacs from '@nozbe/zacs'

const Root = zacs.view([style.root, style.root2])
const Root2 = zacs.createView([style.root, style.root2])
const view = <Root />

const styles = zacs.stylesheet({
  threeArray: {
    margin: [5, 10, 15],
    padding: [5, 10, 15],
    inset: [5, 10, 15],
  },
  border: {
    border: [1, 'solid', 'red'],
  },
})
