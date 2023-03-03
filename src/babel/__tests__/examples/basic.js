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

/* === Conditional styles === */

const Conditional1 = zacs.view(style.root, {
  isFoo: style.rootFoo,
  isBar: style.rootBar,
})

const cond1_root = <Conditional1 />
const cond1_one = <Conditional1 isFoo={foo} />
const cond1_two = <Conditional1 isFoo={foo} isBar={barCount > 0} />

// infer that a style is to be included / not included
const cond1_true = <Conditional1 isFoo={true} />
const cond1_true2 = <Conditional1 isFoo={true} isBar={true} />

const cond1_trueShort = <Conditional1 isFoo />
const cond1_true2Short = <Conditional1 isFoo isBar />

const cond1_false = <Conditional1 isFoo={false} />

const cond1_truthy = <Conditional1 isFoo={1} />
const cond1_truthy2 = <Conditional1 isFoo={100} />
const cond1_truthy3 = <Conditional1 isFoo="foo" />

const cond1_falsy = <Conditional1 isFoo={null} />
const cond1_falsy2 = <Conditional1 isFoo={0} />
const cond1_falsy3 = <Conditional1 isFoo="" />
const cond1_falsy4 = <Conditional1 isFoo={undefined} />
const cond1_falsy5 = <Conditional1 isFoo={NaN} />

// check with mainStyle=null

const Conditional2 = zacs.view(null, {
  isA: style.cond2Foo,
  isB: style.cond2Bar,
})

const cond2_one = <Conditional2 isA={foo} />
const cond2_two = <Conditional2 isA={foo} isB={bCount > 100} />
const cond2_true2 = <Conditional2 isA isB />

// check with null

const ConditionalNull = zacs.view(null, null)

const condNull = <ConditionalNull onPress={onPress} />

/* === Added styles === */

const AddedStyles1 = zacs.view(null, null, {
  width: 'width',
  color: 'backgroundColor',
  background: '--background',
  one: 1,
})

const added1_none = <AddedStyles1 />
const added1_one = <AddedStyles1 width={width} />
const added1_two = <AddedStyles1 width={width} color={factoryColor(color)} />

const added1_literals = <AddedStyles1 width={500} color="#abcdef" />

const added1_propKeys = <AddedStyles1 background="white" one={1} />

// check with null

const AddedStylesNull = zacs.view(null, null, null)

const addedNull = <AddedStylesNull onPress={onPress} />
