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

/* === Component attributes === */

// custom props -- different JSX syntaxes (will be cut out on web)
const customProps = (
  <Root foo={foo} isHighlighted={true} isBlocked bar="bar" Component={<Hello />} />
)

// DOM-safe attributes
const domSafeAttributes = <Root onClick={onPress} href="http://example.com" data-foo="foo" />

// React attributes
const reactAttributes = <Root key={element.id} ref={reference} />

// legacy nozbe styled components hack
const styledhack = <Root __forwardedRef={__forwardedRef} />

// react splat
const splat = <Root2 {...props} />

/* === No styles === */

const NoStyles = zacs.view(null)
const noStyles = <NoStyles />

const NoStyles2 = zacs.view()
const noStyles2 = <NoStyles2 />
