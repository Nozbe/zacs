import * as zacs from '@nozbe/zacs'

const styles = zacs.stylesheet({
  empty: {},
  emptyOnWeb: {
    native: {
      backgroundColor: 'red',
    },
  },
  emptyOnNative: {
    web: {
      width: 100,
    },
  },
})
