import * as zacs from '@nozbe/zacs'

const styles = zacs.stylesheet({
  root: {
    width: 100,
    ...mixins.mixin1,
    ...mixin2,
    native: {
      ...(arbitrary ? mixin : expressions),
    },
    web: {
      '& > div': {
        // this wouldn't actually work for web, but presumably setting whether mixin expressions are
        // replaced statically with object expressions is per-platform, and we don't want ZACS to
        // crash on this
        ...mixin4,
      },
    },
  },
})
