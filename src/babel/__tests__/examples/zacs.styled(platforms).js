import * as zacs from '@nozbe/zacs'

const PlatformBox = zacs.styled({ web: WebBox, native: NativeBox }, style.box)

const platbox = <PlatformBox />
const platbox_attrs = <PlatformBox foo={foo} bar title="hello" />

const PlatformParagraph = zacs.styled({ web: 'p', native: 'RCTText' }, style.p)

const p = <PlatformParagraph>Hello</PlatformParagraph>
const p_attrs = <PlatformParagraph foo={foo} title="DOM attr" />

const PlatformZacsBuiltin = zacs.styled({ web: 'article', native: zacs.text })
const platform_zacs = <PlatformZacsBuiltin />

const PlatformZacsBuiltin2 = zacs.styled({ web: zacs.view, native: NativeBox })
const platform_zacs2 = <PlatformZacsBuiltin2 />
