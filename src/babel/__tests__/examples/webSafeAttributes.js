/* eslint-disable */
import zacs from 'zacs'

const Root = zacs.view(style.root)

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
