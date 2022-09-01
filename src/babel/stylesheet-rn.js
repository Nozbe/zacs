const { getTarget } = require('./state')
const { isZacsStylesheetLiteral, resolveInsetsShorthand } = require('./stylesheet-utils')

const insetsPropNames = {
  margin: {
    axes: ['marginVertical', 'marginHorizontal'],
    all: ['marginTop', 'marginRight', 'marginBottom', 'marginLeft'],
  },
  padding: {
    axes: ['paddingVertical', 'paddingHorizontal'],
    all: ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'],
  },
}

function resolveShorthands(key, node) {
  if (!(node.type === 'ArrayExpression' || key === 'inset')) {
    return null
  }
  switch (key) {
    case 'inset': {
      const [top, right, bottom, left] = resolveInsetsShorthand(node)
      return { top, right, bottom, left }
    }
    case 'border': {
      const [width, style, color] = node.elements
      return {
        borderWidth: width,
        borderStyle: style,
        borderColor: color,
      }
    }
    case 'margin':
    case 'padding': {
      if (node.elements.length === 1) {
        return { [key]: node.elements[0] }
      } else if (node.elements.length === 2) {
        const [vertical, horizontal] = node.elements
        const [verticalProp, horizontalProp] = insetsPropNames[key].axes
        return {
          [verticalProp]: vertical,
          [horizontalProp]: horizontal,
        }
      } else if (node.elements.length === 3) {
        const [top, horizontal, bottom] = node.elements
        const [, horizontalProp] = insetsPropNames[key].axes
        const [topProp, , bottomProp] = insetsPropNames[key].all
        return {
          [topProp]: top,
          [bottomProp]: bottom,
          [horizontalProp]: horizontal,
        }
      }
      const [top, right, bottom, left] = resolveInsetsShorthand(node)
      const [topProp, rightProp, bottomProp, leftProp] = insetsPropNames[key].all
      return {
        [topProp]: top,
        [rightProp]: right,
        [bottomProp]: bottom,
        [leftProp]: left,
      }
    }
    default:
      return null
  }
}

function resolveRNStylesheet(t, target, stylesheet) {
  stylesheet.properties = stylesheet.properties
    .filter(styleset => styleset.key.name !== 'css')
    .map(styleset => {
      const resolvedProperties = []
      const pushProp = property => {
        if (isZacsStylesheetLiteral(t, property.value)) {
          // strip ZACS_STYLESHEET_LITERAL(x)
          const [wrappedValue] = property.value.arguments
          property.value = wrappedValue
        }
        resolvedProperties.push(property)
      }
      const pushFromInner = objectExpr => {
        objectExpr.properties.forEach(property => {
          if (
            property.type === 'ObjectProperty' &&
            property.key.name === '_mixin' &&
            property.value.type === 'ObjectExpression'
          ) {
            pushFromInner(property.value)
          } else {
            pushProp(property)
          }
        })
      }
      const pushFromObject = object => {
        Object.entries(object).forEach(([key, value]) => {
          pushProp(t.objectProperty(t.identifier(key), value))
        })
      }
      styleset.value.properties.forEach(property => {
        if (property.type === 'SpreadElement') {
          pushFromInner(property.argument)
          return
        }

        const key = property.key.name
        if (key === 'web' || key === 'css') {
          // do nothing
        } else if (property.key.value) {
          // css inner selector - do nothing
        } else if (key === 'native' || key === '_mixin') {
          pushFromInner(property.value)
        } else if (key === 'ios' || key === 'android') {
          if (target === key) {
            pushFromInner(property.value)
          }
        } else {
          const shorthandLines = resolveShorthands(key, property.value)
          if (shorthandLines) {
            pushFromObject(shorthandLines)
          } else {
            pushProp(property)
          }
        }
      })
      styleset.value.properties = resolvedProperties
      return styleset
    })

  return stylesheet
}

function transformStylesheetRN(t, path, stylesheet, state) {
  state.set(`uses_rn`, true)
  state.set(`uses_rn_stylesheet`, true)

  const target = getTarget(state)

  const resolvedRules = resolveRNStylesheet(t, target, stylesheet)
  const rnStylesheet = t.callExpression(
    t.memberExpression(t.identifier('ZACS_RN_StyleSheet'), t.identifier('create')),
    [resolvedRules],
  )
  path.get('init').replaceWith(rnStylesheet)
}

module.exports = { transformStylesheetRN, isZacsStylesheetLiteral }
