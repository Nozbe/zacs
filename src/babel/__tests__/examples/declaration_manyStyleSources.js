/* eslint-disable */
import zacs from 'zacs'

const Mix1 = zacs.view(
  styles.box,
  {
    isFoo: style.mixFoo,
    isBar: style.mixBar,
  },
  { width: 'width' },
)

const mix1_none = <Mix1 />
const mix1_add = <Mix1 width={500} />
const mix1_add_true1 = <Mix1 isFoo width={500} />
const mix1_add_true2 = <Mix1 isFoo isBar width={500} />
const mix1_add_1 = <Mix1 isFoo={isFoo} width={500} />
const mix1_add_2 = <Mix1 isFoo={isFoo} isBar width={500} />

const mix_splat = <Mix1 isFoo={isFoo} isBar width={500} {...props} />

const mix1_zacsStyle = <Mix1 zacs:style={{ width: 100 }} />
const mix1_add_zacsStyle = <Mix1 zacs:style={{ width: 100 }} width={50} />
const mix1_add_zacsStyle_2 = <Mix1 zacs:style={{ width: 100 }} width={50} isFoo />

const mix1_add_zacsStyle_3 = <Mix1 zacs:style={stylesToAddViaProp} width={50} isFoo />
