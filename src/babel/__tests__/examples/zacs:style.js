/* eslint-disable */
import zacs from 'zacs'

const View = zacs.view()

const addedViaProp = <View zacs:style={{ width: 100, height: 50 }} />

const stylesToAddViaProp = { width: 100, height: 50 }
const addedViaProp_2 = <View zacs:style={stylesToAddViaProp} />
