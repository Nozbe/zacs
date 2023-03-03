/* eslint-disable */
import zacs from 'zacs'

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
