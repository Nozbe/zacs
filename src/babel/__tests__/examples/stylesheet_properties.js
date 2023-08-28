import * as zacs from '@nozbe/zacs'

const styles = zacs.stylesheet({
  root: {
    // strings
    backgroundColor: 'red',
    // unitless quantities
    opacity: 0.5,
    aspectRatio: 0.5, // regression test
    // pixels
    width: 100,
    // units
    height: '100%',
    web: {
      // prefixed names
      WebkitPaddingStart: 20,
      MozTransitionDuration: '0.5s',
      msGridColumns: '1fr 2fr',
      OTextOverflow: 'ellipsis',
      // postcss syntax
      backgroundColor: '@theme(onSurface1)',
    },
    native: {
      // arrays
      transform: [{ translateY: 4 }],
    },
  },
})
