import * as zacs from '@nozbe/zacs'

const styles = zacs.stylesheet({
  root: {
    // check native-only expressions
    native: {
      backgroundColor: foo ? rgba(a, b) : bar,
    },
    ios: {
      marginHorizontal: foo(0),
    },
    android: {
      marginVertical: foo(0),
    },
  },
})
