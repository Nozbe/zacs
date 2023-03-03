import * as zacs from '@nozbe/zacs'

const styles = zacs.stylesheet({
  root: {
    height: 100,
    height: 200,
    _mixin: { color: 'red', margin: 2, opacity: 0.5 },
    native: {
      color: 'black',
      _mixin: { opacity: 0.2 },
    },
    // Note: web keys should NOT be merged (leave that up to PostCSS), because declaring a property
    // multiple times in CSS is a common technique to use new CSS features with a fallback
    web: {
      background: 'some-css-background',
      background: 'some-modern-css-magic',
    },
  },
})
