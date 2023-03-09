import * as zacs from '@nozbe/zacs'

const someStyles = { with: 100 }

const components = [
  <>
    <span zacs:style={someStyles} />
    <span zacs:style={{ color: 'red' }} />
    <span zacs:inherit={INHERIT} />
    <span zacs:inherit={INHERIT} zacs:style={someStyles} />
    <span zacs:inherit={INHERIT} zacs:style={{ color: 'white' }} />
  </>,
]
