import * as zacs from '@nozbe/zacs'

const styles = zacs.stylesheet({
  // comment before styleset
  root: {
    // comment before property
    height: 100,
    // comment before scope
    native: {
      // comment before property
      width: 1337,
    },
    // trailing comment
  },
  // comment before top-scope css
  css: 'foo',
  /*
  multiline block comment
  */
  baz: {
    color: 'red',
    // comment before css
    css: 'foo',
    // comment after css
  },
  // trailing comment
})
