import * as zacs from '@nozbe/zacs'

const styles = zacs.stylesheet({
  with_css: {
    // string
    css: 'opacity: 0.5; color: #abbaba;',
    // zacs.css template
    css: zacs.css`
      opacity: 0.5;
      color: #abbaba;
    `,
    // plain template + nesting
    css: `&:hover {
      opacity: .8;
      color: #abbaba;
    }`,
    // css in nested scoped
    '& > div': {
      css: 'border: 1px solid red;',
    },
  },
  // global scope
  css: zacs.css`
  @keyframes hello {
    from { opacity: 0 }
    to { opacity: 0 }
  }
  `,
})
