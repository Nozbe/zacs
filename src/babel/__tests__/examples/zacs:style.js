/* eslint-disable */
import zacs from 'zacs'

/* === Added styles (directly with a prop) === */

const AddedStylesNull = zacs.view(null, null, null)

const addedViaProp = <AddedStylesNull zacs:style={{ width: 100, height: 50 }} />
const stylesToAddViaProp = { width: 100, height: 50 }

const addedViaProp_2 = <AddedStylesNull zacs:style={stylesToAddViaProp} />
