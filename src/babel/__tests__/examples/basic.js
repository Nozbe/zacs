/* eslint-disable */
import zacs from 'zacs'

const Root = zacs.view(style.root)
const Root2 = zacs.view(styles.root2)
const Text = zacs.text(style.text)

/* === Different invocations === */

const view = <Root />
const view2 = <Root2 />

const composition = (
  <>
    <Root>
      <Text />
    </Root>
  </>
)

function AnotherComponent() {
  const helper = <Root />

  return <Root2>{helper}</Root2>
}
