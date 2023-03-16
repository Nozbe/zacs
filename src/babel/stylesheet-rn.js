const { types: t } = require('@babel/core')
const { getTarget, isProduction } = require('./state')
const { isZacsStylesheetLiteral, resolveInsetsShorthand } = require('./stylesheet-utils')
const { preserveComments, deduplicatedProperties } = require('./astUtils')

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

function resolveShorthandsRN(key, node) {
  if (!(node.type === 'ArrayExpression' || key === 'inset')) {
    return null
  }
  switch (key) {
    case 'inset': {
      const [top, right, bottom, left] = resolveInsetsShorthand(node)
      return { top, right, bottom, left }
    }
    case 'border':
    case 'borderTop':
    case 'borderRight':
    case 'borderBottom':
    case 'borderLeft': {
      const [width, style, color] =
        node.elements.length === 3
          ? node.elements
          : [node.elements[0], t.stringLiteral('solid'), node.elements[1]]
      return {
        [`${key}Width`]: width,
        [`${key}Style`]: style,
        [`${key}Color`]: color,
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
      const [top, right, bottom, left] = node.elements
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

function resolveStylesetProperties(target, originalProperties) {
  const resolvedProperties = []
  const pushProp = (property) => {
    if (isZacsStylesheetLiteral(property.value)) {
      // strip ZACS_STYLESHEET_LITERAL(x)
      const [wrappedValue] = property.value.arguments
      property.value = wrappedValue
    }
    resolvedProperties.push(property)
  }
  const pushComments = (node, type) => {
    const key = `${type}Comments`
    if (node[key]) {
      resolvedProperties.push(...node[key])
    }
  }
  const pushFromObject = (object) => {
    Object.entries(object).forEach(([key, value]) => {
      pushProp(t.objectProperty(t.identifier(key), value))
    })
  }
  const pushPropOrShorthands = (property) => {
    const key = property.key.name
    const shorthandLines = resolveShorthandsRN(key, property.value)
    if (shorthandLines) {
      pushFromObject(shorthandLines)
    } else {
      pushProp(property)
    }
  }
  const pushFromProperty = (node) => {
    pushComments(node, 'leading')
    const objectExpr = node.value
    objectExpr.properties.forEach((property) => {
      if (property.type === 'ObjectProperty' && property.key.name === '_mixin') {
        // eslint-disable-next-line no-use-before-define
        pushFromMixin(property)
      } else {
        pushPropOrShorthands(property)
      }
    })
    pushComments(node, 'trailing')
  }
  const pushFromMixin = (property) => {
    if (t.isObjectExpression(property.value)) {
      pushFromProperty(property)
    } else {
      // TODO: Change this spread to an Object.assign() unless nativeSpreads:true
      pushProp(t.spreadElement(property.value))
    }
  }
  originalProperties.forEach((property) => {
    const key = property.key.name
    if (key === 'web' || key === 'css') {
      // do nothing
    } else if (property.key.value) {
      // css inner selector - do nothing
    } else if (key === 'native') {
      pushFromProperty(property)
    } else if (key === '_mixin') {
      pushFromMixin(property)
    } else if (key === 'ios' || key === 'android') {
      if (target === key) {
        pushFromProperty(property)
      }
    } else {
      pushPropOrShorthands(property)
    }
  })

  return deduplicatedProperties(resolvedProperties)
}

function resolveRNStylesheet(stylesheet, state) {
  const target = getTarget(state)

  stylesheet.properties = stylesheet.properties
    .filter((styleset) => {
      // NOTE: styleset.key could be a StringLiteral, but that's web-only
      return styleset.key.name && styleset.key.name !== 'css'
    })
    .map((styleset) => {
      const objExpr = styleset.value
      const resolvedProperties = resolveStylesetProperties(target, objExpr.properties)
      objExpr.properties = preserveComments(objExpr, resolvedProperties)

      if (state.opts.experimentalStripEmpty && !objExpr.properties.length) {
        return null
      }

      return styleset
    })
    .filter(Boolean)

  return stylesheet
}

function transformStylesheetRN(path, stylesheet, state) {
  const production = isProduction(state)

  const resolvedRules = resolveRNStylesheet(stylesheet, state)

  if (production) {
    path.get('init').replaceWith(resolvedRules)
    t.addComment(
      path.parent,
      'leading',
      ' StyleSheet.create() was stripped for production (no-op in modern React Native) ',
    )
  } else {
    state.set(`uses_rn`, true)
    state.set(`uses_rn_stylesheet`, true)

    const rnStylesheet = t.callExpression(
      t.memberExpression(t.identifier('ZACS_RN_StyleSheet'), t.identifier('create')),
      [resolvedRules],
    )
    path.get('init').replaceWith(rnStylesheet)
  }
}

module.exports = { transformStylesheetRN, isZacsStylesheetLiteral, resolveShorthandsRN }
