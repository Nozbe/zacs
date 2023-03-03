/* eslint-disable */
import zacs from 'zacs'

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
