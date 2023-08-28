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
    ...centered,
    _mixin: centered,
    margin: 0,
    // $FlowExpectedError[incompatible-call]
    fontKerning: null,
    // $FlowExpectedError[incompatible-call]
    fake_attribute: 'this_does_not_exist',
    web: {
      ...centered,
      _mixin: centered,
      display: 'inline-block',
      aspectRatio: 0.5,
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
      ...centered,
      _mixin: centered,
      transform: [],
      aspectRatio: 0.5,
      // $FlowExpectedError[incompatible-call]
      alignContent: 'bad_align',
      // $FlowExpectedError[incompatible-call]
      fake_attribute: 'this_does_not_exist',
    },
    ios: {
      ...centered,
      _mixin: centered,
      tintColor: 'red',
      // $FlowExpectedError[incompatible-call]
      alignContent: 'bad_align',
      // $FlowExpectedError[incompatible-call]
      fake_attribute: 'this_does_not_exist',
    },
    android: {
      ...centered,
      _mixin: centered,
      elevation: 4,
      // $FlowExpectedError[incompatible-call]
      alignContent: 'bad_align',
      // $FlowExpectedError[incompatible-call]
      fake_attribute: 'this_does_not_exist',
    },
  },
  shorthands: {
    inset: 5,
    inset: '10%',
    margin: [5],
    padding: [5, 10],
    inset: [5, '10%', 15],
    margin: [5, 10, 15, 20],
    // border(3)
    border: [1, 'solid', 'red'],
    borderTop: [2, 'solid', 'green'],
    borderRight: [3, 'solid', 'yellow'],
    borderBottom: [4, 'solid', 'blue'],
    borderLeft: [5, 'solid', 'black'],
    // border(2)
    border: [1, 'red'],
    borderTop: [2, 'green'],
    borderRight: [3, 'yellow'],
    borderBottom: [4, 'blue'],
    borderLeft: [5, 'black'],
    // $FlowExpectedError[incompatible-call]
    border: [2],
    // $FlowExpectedError[incompatible-call]
    inset: [1, 2, 3, 4, 5],
    web: {
      inset: [5, '10%', 15],
      border: [1, 'solid', 'red'],
    },
    native: {
      inset: [5, '10%', 15],
      border: [1, 'solid', 'red'],
      borderLeft: [1, 'red'],
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
