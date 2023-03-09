const { types: t } = require('@babel/core')
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

function deduplicatedProperties(input) {
  // Note: we're doing double-reverse instead of adding to map because we want to preserve order
  // of the LAST property, not the first one
  const output = []
  const seen = new Set()
  input.reverse().forEach((node) => {
    if (node.key) {
      // looks property-ish
      const { name } = node.key
      if (seen.has(name)) {
        return
      }
      seen.add(name)
      output.push(node)
    } else {
      // looks comment-ish
      output.push(node)
    }
  })
  return output.reverse()
}

const unshiftComments = (node, type, comments) => {
  const key = `${type}Comments`
  if (!node[key]) {
    node[key] = []
  }
  node[key].unshift(...comments)
  return node
}

// NOTE: Adding comments in Babel is a bit tricky (they should be put into leading/trailing/innerComments,
// depending on where they are in relation to other AST nodes), so when trying to preserve comments
// of deleted nodes, we just add comment nodes to an array incorrectly and here we're trying to recreate the
// proper placement
function preserveComments(parent, childNodes) {
  const output = []
  let pendingComments = []
  childNodes.forEach((node) => {
    if (node.type.startsWith('Comment')) {
      pendingComments.push(node)
      return
    }

    // Add any pending comments to the following node as leading comments
    if (pendingComments.length) {
      unshiftComments(node, 'leading', pendingComments)
      pendingComments = []
    }

    output.push(node)
  })

  if (!pendingComments) {
    return output
  }

  // Add any pending comments to the last node as trailing comments if possible
  const lastNode = output[output.length - 1]
  if (lastNode) {
    unshiftComments(lastNode, 'trailing', pendingComments)
    return output
  }

  // Otherwise add them as inner comments to the parent node
  unshiftComments(parent, 'inner', pendingComments)
  return output
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
    const shorthandLines = resolveShorthands(key, property.value)
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
      if (
        property.type === 'ObjectProperty' &&
        property.key.name === '_mixin' &&
        property.value.type === 'ObjectExpression'
      ) {
        pushFromProperty(property)
      } else {
        pushPropOrShorthands(property)
      }
    })
    pushComments(node, 'trailing')
  }
  originalProperties.forEach((property) => {
    // if (property.type === 'SpreadElement') {
    //   pushFromInner(property.argument)
    //   return
    // }

    const key = property.key.name
    if (key === 'web' || key === 'css') {
      // do nothing
    } else if (property.key.value) {
      // css inner selector - do nothing
    } else if (key === 'native' || key === '_mixin') {
      pushFromProperty(property)
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

function resolveRNStylesheet(target, stylesheet) {
  stylesheet.properties = stylesheet.properties
    .filter((styleset) => {
      // NOTE: styleset.key could be a StringLiteral, but that's web-only
      return styleset.key.name && styleset.key.name !== 'css'
    })
    .map((styleset) => {
      const objExpr = styleset.value
      const resolvedProperties = resolveStylesetProperties(target, objExpr.properties)
      objExpr.properties = preserveComments(objExpr, resolvedProperties)
      return styleset
    })

  return stylesheet
}

function transformStylesheetRN(path, stylesheet, state) {
  state.set(`uses_rn`, true)
  state.set(`uses_rn_stylesheet`, true)

  const target = getTarget(state)

  const resolvedRules = resolveRNStylesheet(target, stylesheet)
  const rnStylesheet = t.callExpression(
    t.memberExpression(t.identifier('ZACS_RN_StyleSheet'), t.identifier('create')),
    [resolvedRules],
  )
  path.get('init').replaceWith(rnStylesheet)
}

module.exports = { transformStylesheetRN, isZacsStylesheetLiteral }
