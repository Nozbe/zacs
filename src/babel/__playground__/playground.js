/* eslint-disable */
import zacs from '@nozbe/zacs'

const Root = zacs.view([style.root, style.root2])
const Root2 = zacs.createView([style.root, style.root2])
const view = <Root />

const styles = zacs.stylesheet({
  root: {
    margin: 5,
    padding: 10,
    inset: 15,
  },
  root2: {
    margin: [5, 10],
    padding: [5, 10, 15],
    inset: [5, 10, 15, 20],
  },
  root3: {
    padding: ['10%', '50%'],
    border: [1, 'solid', 'red'],
  },
})
