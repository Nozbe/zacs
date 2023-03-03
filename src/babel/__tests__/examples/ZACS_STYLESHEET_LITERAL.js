/* eslint-disable */
import zacs from 'zacs'

const styles = zacs.stylesheet({
  text: {
    // magic syntax for babel replacement plugins
    backgroundColor: ZACS_STYLESHEET_LITERAL(Styling.colors.onSurface1),
    border: [1, 'solid', ZACS_STYLESHEET_LITERAL(Styling.colors.onSurface1)],
    android: {
      backgroundColor: ZACS_STYLESHEET_LITERAL(Styling.colors.onSurface2),
      border: [2, 'solid', ZACS_STYLESHEET_LITERAL(Styling.colors.onSurface2)],
    },
    ios: {
      backgroundColor: ZACS_STYLESHEET_LITERAL(Styling.colors.onSurface3),
      border: [3, 'solid', ZACS_STYLESHEET_LITERAL(Styling.colors.onSurface3)],
    },
  },
})
