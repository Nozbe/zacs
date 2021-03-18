/* eslint-disable */
import zacs from 'zacs'

const styles = zacs.stylesheet({
  text: {
    // magic syntax for babel replacement plugins
    backgroundColor: ZACS_STYLESHEET_LITERAL(Styling.colors.onSurface1),
    android: {
      backgroundColor: ZACS_STYLESHEET_LITERAL(Styling.colors.onSurface2),
    }
  },
})
