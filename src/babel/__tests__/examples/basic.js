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

/* === Added styles (directly with a prop) === */

const addedViaProp = <AddedStylesNull zacs:style={{ width: 100, height: 50 }} />
const stylesToAddViaProp = { width: 100, height: 50 }

const addedViaProp_2 = <AddedStylesNull zacs:style={stylesToAddViaProp} />

/* === Added, conditional, main styles === */

const Mix1 = zacs.view(
  styles.box,
  {
    isFoo: style.mixFoo,
    isBar: style.mixBar,
  },
  { width: 'width' },
)

const mix1_none = <Mix1 />
const mix1_add = <Mix1 width={500} />
const mix1_add_true1 = <Mix1 isFoo width={500} />
const mix1_add_true2 = <Mix1 isFoo isBar width={500} />
const mix1_add_1 = <Mix1 isFoo={isFoo} width={500} />
const mix1_add_2 = <Mix1 isFoo={isFoo} isBar width={500} />

const mix_splat = <Mix1 isFoo={isFoo} isBar width={500} {...props} />

const mix1_zacsStyle = <Mix1 zacs:style={{ width: 100 }} />
const mix1_add_zacsStyle = <Mix1 zacs:style={{ width: 100 }} width={50} />
const mix1_add_zacsStyle_2 = <Mix1 zacs:style={{ width: 100 }} width={50} isFoo />

const mix1_add_zacsStyle_3 = <Mix1 zacs:style={stylesToAddViaProp} width={50} isFoo />

/* === styled(Component) === */

const StyledBox = zacs.styled(Box)
const box = <StyledBox isFoo />
const box_ref = <StyledBox ref={boxRef} />

const StyledLink = zacs.styled(
  Link,
  styles.link,
  { isVisited: style.visitedLink },
  { color: 'color' },
)
const link = <StyledLink />
const link_visited = <StyledLink isVisited />
const link_colored = <StyledLink isVisited={visited} color={factoryColor(color)} href={href} />

const link_attrs = <StyledLink foo={foo} bar title="hello" />

/* === styled(Namespaced.Component) === */

const StyledModalText = zacs.styled(Modal.Text, style.foo)
const modalText = <StyledModalText />

/* === styled('builtin') === */

// you wouldn't do it in shared code, only in .{native,web}.js
const Li = zacs.styled('li')
const li = <Li foo={foo} title="hello" />

/* === styled(web,native) === */

const PlatformBox = zacs.styled({ web: WebBox, native: NativeBox }, style.box)

const platbox = <PlatformBox />
const platbox_attrs = <PlatformBox foo={foo} bar title="hello" />

const RCTText = 'RCTText' // passing string directly won't work because it's uppercase (won't get transpiled to createElement correctly)
const PlatformParagraph = zacs.styled({ web: 'p', native: RCTText }, style.p)

const p = <PlatformParagraph>Hello</PlatformParagraph>
const p_attrs = <PlatformParagraph foo={foo} title="DOM attr" />

const PlatformZacsBuiltin = zacs.styled({ web: 'article', native: zacs.text })
const platform_zacs = <PlatformZacsBuiltin />

const PlatformZacsBuiltin2 = zacs.styled({ web: zacs.view, native: NativeBox })
const platform_zacs2 = <PlatformZacsBuiltin2 />
