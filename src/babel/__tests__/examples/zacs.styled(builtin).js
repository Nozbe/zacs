/* eslint-disable */
import zacs from 'zacs'

// you wouldn't do it in shared code, only in .{native,web}.js
const StyledLi = zacs.styled('li')
const li = <StyledLi foo={foo} title="hello" />
