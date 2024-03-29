import * as zacs from '@nozbe/zacs'

const styles = zacs.stylesheet({
  root: {
    // _mixin syntax
    _mixin: { flex: 1, zIndex: -1000 },
    // second mixin with override
    _mixin: { zIndex: -2 },
    // nested mixins
    _mixin: { _mixin: { flexDirection: 'row' }, alignItems: 'center' },

    // mixins in nested scoped
    native: {
      _mixin: { backgroundColor: 'native' },
    },
    web: {
      '& > div': {
        _mixin: { backgroundColor: 'web' },
      },
    },
  },
})
