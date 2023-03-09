import * as zacs from '@nozbe/zacs'

const component1 = zacs.createView()
const component2 = zacs.createView(null, null, null, ['zacs:style'])
const component3 = zacs.createView(null, null, null, ['zacs:inherit'])
const component4 = zacs.createView(null, null, null, ['zacs:style', 'zacs:inherit'])
const component5 = zacs.createView(styles.foo, null, null, ['zacs:style', 'zacs:inherit'])
