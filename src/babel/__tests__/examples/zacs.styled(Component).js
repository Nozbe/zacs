import * as zacs from '@nozbe/zacs'

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
