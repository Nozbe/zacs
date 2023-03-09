import * as zacs from '@nozbe/zacs'

const styles = zacs.stylesheet({
  border: {
    border: [1, 'solid', 'red'],
  },
  borderSides: {
    borderTop: [2, 'solid', 'green'],
    borderRight: [3, 'solid', 'yellow'],
    borderBottom: [4, 'solid', 'blue'],
    borderLeft: [5, 'solid', 'black'],
  },
  borderShorter: {
    border: [1, 'red'],
  },
})
