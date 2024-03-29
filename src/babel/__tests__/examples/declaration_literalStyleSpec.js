import * as zacs from '@nozbe/zacs'

const AddedStyles1 = zacs.view(null, null, {
  width: 'width',
  color: 'backgroundColor',
  background: '--background',
  one: 1,
})

const added1_none = <AddedStyles1 />
const added1_one = <AddedStyles1 width={width} />
const added1_two = <AddedStyles1 width={width} color={factoryColor(color)} />

const added1_literals = <AddedStyles1 width={500} color="#abcdef" />

const added1_propKeys = <AddedStyles1 background="white" one={1} />
