import * as zacs from '@nozbe/zacs'

// web builtins
const StyledLi = zacs.styled('li')
const li = <StyledLi foo={foo} title="hello" />

// react-native builtins
const StyledRCTText = zacs.styled('RCTText')
const text = <StyledRCTText foo={foo} title="hello" />
