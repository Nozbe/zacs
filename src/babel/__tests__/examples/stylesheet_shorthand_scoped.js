import * as zacs from '@nozbe/zacs'

const styles = zacs.stylesheet({
  scope1: {
    web: {
      margin: [5, 10],
      border: [1, 'solid', 'red'],
    },
  },
  scope2: {
    native: {
      margin: [5, 10],
      border: [1, 'solid', 'red'],
    },
  },
})
