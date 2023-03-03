/* eslint-disable */
import zacs from 'zacs'

const AddedStylesNull = zacs.view(null, null, null)

const addedViaProp = <AddedStylesNull zacs:style={{ width: 100, height: 50 }} />
const stylesToAddViaProp = { width: 100, height: 50 }

const addedViaProp_2 = <AddedStylesNull zacs:style={stylesToAddViaProp} />
