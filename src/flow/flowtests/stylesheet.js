// @flow
/* eslint-disable no-dupe-keys */
import * as zacs from '../../index'

const noop = (..._args: any[]): void => {}

const centered = {
  alignItems: 'center',
  justifyContent: 'center',
}

const stylesheet = zacs.stylesheet({
  root: {
    _mixin: centered,
    margin: 0,
    // $FlowExpectedError[incompatible-call]
    fontKerning: null,
    // $FlowExpectedError[incompatible-call]
    fake_attribute: 'this_does_not_exist',
    web: {
      _mixin: centered,
      display: 'inline-block',
      // $FlowExpectedError[incompatible-call]
      fontKerning: null,
      // $FlowExpectedError[incompatible-call]
      fake_attribute: 'this_does_not_exist',
      '&:hover': {
        padding: 5,
        // $FlowExpectedError[incompatible-call]
        fontKerning: null,
        // $FlowExpectedError[incompatible-call]
        fake_attribute: 'this_does_not_exist',
      },
      css: zacs.css`
        display: inline-block;
      `,
      // $FlowExpectedError[incompatible-call]
      css: 123,
    },
    native: {
      _mixin: centered,
      transform: [],
      // $FlowExpectedError[incompatible-call]
      alignContent: 'bad_align',
      // $FlowExpectedError[incompatible-call]
      fake_attribute: 'this_does_not_exist',
    },
    ios: {
      _mixin: centered,
      tintColor: 'red',
      // $FlowExpectedError[incompatible-call]
      alignContent: 'bad_align',
      // $FlowExpectedError[incompatible-call]
      fake_attribute: 'this_does_not_exist',
    },
    android: {
      _mixin: centered,
      elevation: 4,
      // $FlowExpectedError[incompatible-call]
      alignContent: 'bad_align',
      // $FlowExpectedError[incompatible-call]
      fake_attribute: 'this_does_not_exist',
    },
  },
  css: zacs.css`
    @animation {}
  `,
  // $FlowExpectedError[incompatible-call]
  css: 123,
})

noop(stylesheet)
noop((stylesheet: zacs.Stylesheet))
noop(stylesheet.root)
noop((stylesheet.root: string | { [string]: mixed } | number))

// $FlowExpectedError[incompatible-cast]
noop((stylesheet.root: Date))
