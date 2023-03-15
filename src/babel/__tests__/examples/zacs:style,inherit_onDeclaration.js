import * as zacs from '@nozbe/zacs'

const View = zacs.view(style.root)
const someStyles = { with: 100 }

const components = [
  <>
    <View zacs:style={someStyles} />
    <View zacs:style={{ color: 'red' }} />
    <View zacs:inherit={INHERIT} />
    <View zacs:inherit={INHERIT} zacs:style={someStyles} />
    <View zacs:inherit={INHERIT} zacs:style={{ color: 'white' }} />
    // regression test
    <View title="hello" zacs:inherit={INHERIT} />
  </>,
]
