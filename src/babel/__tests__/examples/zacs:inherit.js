/* eslint-disable */
import zacs from 'zacs'

const StylableBlank = zacs.view()
const stylableBlank = <StylableBlank zacs:inherit={props} />

const StylableMain = zacs.text(style.main, { isHighlighted: style.highlighted }, { color: 'color' })
const stylableMain = <StylableMain zacs:inherit={props} />
const stylableMain_highlighted = <StylableMain zacs:inherit={props} isHighlighted />
const stylableMain_color = <StylableMain zacs:inherit={props} color="red" />
const stylableMain_colorAlt = <StylableMain zacs:inherit={props} zacs:style={{ color: 'red' }} />
const stylableMain_all = <StylableMain zacs:inherit={props} isHighlighted color="red" />

const stylableMain_splat = <StylableMain zacs:inherit={props} {...props} /> // dangerous territory!

export const StylableButton = (props) => {
  const { title, isHighlighted, color } = props
  return (
    <StylableMain zacs:inherit={props} isHighlighted={isHighlighted} color={factoryColor(color)}>
      {title}
    </StylableMain>
  )
}

// second-order stylable component (no zacs definition)
const ImportedComponent = require('ImportedComponent')
const stylable2nd = <ImportedComponent zacs:inherit={props} />
