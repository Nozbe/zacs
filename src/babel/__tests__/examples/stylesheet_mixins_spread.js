import * as zacs from '@nozbe/zacs'

const styles = zacs.stylesheet({
  root: {
    // _mixin syntax
    ...{ flex: 1, zIndex: -1000 },
    // second mixin with override
    ...{ zIndex: -2 },
    // nested mixins
    ...{ ...{ flexDirection: 'row' }, alignItems: 'center' },

    // mixins in nested scoped
    native: {
      ...{ backgroundColor: 'native' },
    },
    web: {
      '& > div': {
        ...{ backgroundColor: 'web' },
      },
    },
  },
})
