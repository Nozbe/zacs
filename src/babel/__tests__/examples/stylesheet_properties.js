import * as zacs from '@nozbe/zacs'

const styles = zacs.stylesheet({
  root: {
    // strings
    backgroundColor: 'red',
    // unitless quantities
    opacity: 0.5,
    // pixels
    width: 100,
    // units
    height: '100%',
    web: {
      // prefixed names
      WebkitPaddingStart: 20,
      // postcss syntax
      backgroundColor: '@theme(onSurface1)',
    },
    native: {
      // arrays
      transform: [{ translateY: 4 }],
    },
  },
})
