import * as zacs from '@nozbe/zacs'

const styles = zacs.stylesheet({
  style_before: {
    background: 'foo',
    css: 'width: bar;',
    background: 'baz',
  },
  css: zacs.css`
  @keyframes hello { }
  `,
  style_after: {
    width: 100,
  },
})
