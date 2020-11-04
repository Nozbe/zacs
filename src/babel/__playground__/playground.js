/* eslint-disable */
import zacs from '@nozbe/zacs'

const Root = zacs.view([style.root, style.root2])
const Root2 = zacs.createView([style.root, style.root2])
const view = <Root />

const styles = zacs._experimentalStyleSheet({
  root: {
    backgroundColor: 'red',
    height: 100,
  },
})
