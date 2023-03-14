const { types: t } = require('@babel/core')
const { htmlAttributes, htmlElements } = require('./attributes')
const { getPlatform, isProduction } = require('./state')
const {
  jsxAttr,
  jsxRenameElement,
  jsxGetAttrValue,
  jsxInferAttrTruthiness,
  jsxHasAttrNamed,
  jsxFindNamespacedAttr,
  jsxFindNamespacedAttrPath,
} = require('./jsxUtils')
const { mergeObjects, concatArraysOfObjects, objectExpressionFromPairs } = require('./astUtils')
const { resolveInlineStyleset } = require('./resolveStyle')

function isAttributeWebSafe(attr) {
  return (
    htmlAttributes.has(attr) ||
    attr.startsWith('__zacs') ||
    attr.startsWith('data-') ||
    attr === 'key' ||
    attr === 'ref'
  )
}

function webSafeAttributes(attributes) {
  return attributes.filter((attribute) => {
    if (attribute.type === 'JSXSpreadAttribute') {
      // not sure what to do here - this might spread non-dom-safe attributes...
      // better to get the warning than skip something important but perhaps we
      // should disallow this, or filter at runtime, or convert this into
      // standalone ZACS component (no inline substitution)?
      return true
    } else if (attribute.type === 'JSXAttribute') {
      return isAttributeWebSafe(attribute.name.name)
    }
    throw new Error('Unknown JSX Attribute type')
  })
}

function withoutStylingProps(attributes, condStyles, literalStyleSpec) {
  const stylingProps = []

  if (condStyles && condStyles.properties) {
    condStyles.properties.forEach((property) => {
      stylingProps.push(property.key.name)
    })
  }

  if (literalStyleSpec && literalStyleSpec.properties) {
    literalStyleSpec.properties.forEach((property) => {
      stylingProps.push(property.key.name)
    })
  }

  return attributes.filter((attribute) => {
    if (t.isJSXSpreadAttribute(attribute)) {
      return true
    } else if (t.isJSXAttribute(attribute)) {
      // strip zacs:inherit and other magic attributes from runtime
      if (t.isJSXNamespacedName(attribute.name)) {
        return attribute.name.namespace.name !== 'zacs'
      }
      return !stylingProps.includes(attribute.name.name)
    }
    throw new Error('Unknown JSX Attribute type')
  })
}

function resolveStyles(
  state,
  // ZACS declaration
  { uncondStyles, condStyles, literalStyleSpec },
  // IF zacs element:
  jsxAttrPaths,
  // IF zacs component:
  passthroughProps,
) {
  const stylesets = []
  const literalStyles = []
  const jsxAttributes = jsxAttrPaths ? jsxAttrPaths.map((path) => path.node) : null

  if (uncondStyles && !t.isNullLiteral(uncondStyles)) {
    if (t.isArrayExpression(uncondStyles)) {
      stylesets.push(...uncondStyles.elements.map((styleset) => [styleset]))
    } else {
      stylesets.push([uncondStyles])
    }
  }

  if (condStyles && !t.isNullLiteral(condStyles)) {
    condStyles.properties.forEach((property) => {
      const style = property.value
      const propName = property.key.name

      if (jsxAttributes) {
        const attr = jsxAttributes.find((a) => a.name && a.name.name === propName)
        if (!attr) {
          return
        }

        const flag = jsxInferAttrTruthiness(attr)

        if (flag === true) {
          stylesets.push([style])
        } else if (flag === false) {
          // we know for a fact the style won't be used -- so ignore it
        } else {
          stylesets.push([style, flag])
        }
      } else {
        stylesets.push([style, t.memberExpression(t.identifier('props'), t.identifier(propName))])
      }
    })
  }

  if (literalStyleSpec && !t.isNullLiteral(literalStyleSpec)) {
    literalStyleSpec.properties.forEach((property) => {
      const styleAttr = property.value.value
      const propName = property.key.name

      if (jsxAttributes) {
        const attr = jsxAttributes.find((a) => a.name && a.name.name === propName)
        if (!attr) {
          return
        }

        const styleValue = jsxGetAttrValue(attr)
        literalStyles.push([styleAttr, styleValue])
      } else {
        literalStyles.push([
          styleAttr,
          t.memberExpression(t.identifier('props'), t.identifier(propName)),
        ])
      }
    })
  }

  // TODO: Validate inherited props value
  const inheritFrom = (() => {
    if (passthroughProps.includes('zacs:inherit')) {
      return t.identifier('props')
    }

    const inheritedPropsAttr = jsxAttributes && jsxFindNamespacedAttr(jsxAttributes, 'inherit')
    if (inheritedPropsAttr) {
      return inheritedPropsAttr.value.expression
    }

    return null
  })()

  // TODO: Validate zacs:style value
  // TODO: If the value is a simple object, we could merge them into literalStyles. OTOH, maybe another
  // optimizer Babel plugin can do it further down the line?
  const zacsStyle = (() => {
    // NOTE: In case of zacs components, zacs:style and zacs:inherit both get passed into style=""
    // so we don't need to worry about both
    if (passthroughProps.includes('zacs:style') && !inheritFrom) {
      return t.memberExpression(t.identifier('props'), t.identifier('style'))
    }

    const zacsStyleAttrPath = jsxAttrPaths && jsxFindNamespacedAttrPath(jsxAttrPaths, 'style')
    if (zacsStyleAttrPath) {
      const zacsStyleExprPath = zacsStyleAttrPath.get('value.expression')
      if (t.isObjectExpression(zacsStyleExprPath.node)) {
        resolveInlineStyleset(zacsStyleExprPath, state)
      }

      return zacsStyleExprPath.node
    }

    return null
  })()

  return [
    stylesets,
    literalStyles.length ? objectExpressionFromPairs(literalStyles) : null,
    zacsStyle,
    inheritFrom,
  ]
}

function webClassNameExpr(classNamesExpr, inheritFrom) {
  if (inheritFrom) {
    const inheritedClassNames = t.memberExpression(inheritFrom, t.identifier('className'))

    if (classNamesExpr) {
      // classNames + ' ' + (props.className || '')
      return t.binaryExpression(
        '+',
        classNamesExpr,
        t.binaryExpression(
          '+',
          t.stringLiteral(' '),
          t.logicalExpression('||', inheritedClassNames, t.stringLiteral('')),
        ),
      )
    }

    // only inherited class names
    return inheritedClassNames
  }

  // only defined class names
  return classNamesExpr
}

function webStyleExpr(literalStyles, zacsStyle, inheritFrom) {
  const inheritedStyles = inheritFrom
    ? t.memberExpression(inheritFrom, t.identifier('style'))
    : null
  const allStyles = [literalStyles, zacsStyle, inheritedStyles]

  return mergeObjects(allStyles)
}

function webStyleAttributes([stylesets, literalStyles, zacsStyle, inheritFrom]) {
  const attributes = []

  const classNamesExpr = stylesets.reduce((expr, [className, condition]) => {
    const isFirstExpr = !expr

    const classNameSpace = isFirstExpr
      ? className
      : t.binaryExpression('+', t.stringLiteral(' '), className)

    const classNameExpr = condition
      ? t.conditionalExpression(condition, classNameSpace, t.stringLiteral(''))
      : classNameSpace

    return isFirstExpr ? classNameExpr : t.binaryExpression('+', expr, classNameExpr)
  }, null)

  const classNamesValue = webClassNameExpr(classNamesExpr, inheritFrom)
  if (classNamesValue) {
    attributes.push(jsxAttr('className', classNamesValue))
  }

  const stylesValue = webStyleExpr(literalStyles, zacsStyle, inheritFrom)
  if (stylesValue) {
    attributes.push(jsxAttr('style', stylesValue))
  }

  return attributes
}

function nativeStyleAttributes([stylesets, literalStyles, zacsStyle, inheritFrom]) {
  const styles = stylesets.map(([styleName, condition]) =>
    condition ? t.logicalExpression('&&', condition, styleName) : styleName,
  )

  if (literalStyles) {
    styles.push(literalStyles)
  }

  if (zacsStyle) {
    styles.push(zacsStyle)
  }

  // Depending on arguments:
  //   {style}
  //   [{style}, {style}]
  //   [{style}, {style}].concat(props.styles || [])
  //   props.styles
  const stylesExpr = concatArraysOfObjects(
    styles,
    inheritFrom && t.memberExpression(inheritFrom, t.identifier('style')),
  )

  return stylesExpr ? [jsxAttr('style', stylesExpr)] : []
}

function styleAttributes(state, declaration, jsxAttributes, passedProps = []) {
  const resolvedStyles = resolveStyles(state, declaration, jsxAttributes, passedProps)
  switch (getPlatform(state)) {
    case 'web':
      return webStyleAttributes(resolvedStyles)
    case 'native':
      return nativeStyleAttributes(resolvedStyles)
    default:
      throw new Error('Unknown platform passed to ZACS config')
  }
}

function validateElementHasNoIllegalAttributes(path) {
  const { openingElement } = path.node
  const { attributes } = openingElement
  if (jsxHasAttrNamed('style', attributes)) {
    throw path.buildCodeFrameError(
      "It's not allowed to pass `style` attribute to ZACS-styled components. You can pass inline style object using `zacs:style` attribute instead.",
    )
  }
  if (jsxHasAttrNamed('className', attributes)) {
    throw path.buildCodeFrameError(
      "It's not allowed to pass `className` attribute to ZACS-styled components",
    )
  }
}

function convertZacsElement(path, declaration, state) {
  const { node } = path
  const { openingElement } = node
  const platform = getPlatform(state)

  validateElementHasNoIllegalAttributes(path)

  // get ZACS element info
  const { elementName, originalName, isBuiltin, uncondStyles, condStyles, literalStyleSpec } =
    declaration

  const jsxAttributes = path.get('openingElement.attributes')

  // filter out styling props
  // TODO: Combine this and web safe attributes into one step
  openingElement.attributes = withoutStylingProps(
    openingElement.attributes,
    condStyles,
    literalStyleSpec,
  )

  // replace component
  jsxRenameElement(node, elementName, isBuiltin)

  if (platform === 'web') {
    // filter out non-DOM attributes (React will throw errors at us for this)
    if (htmlElements.has(elementName)) {
      openingElement.attributes = webSafeAttributes(openingElement.attributes)
    }
  }

  // add styling attributes
  openingElement.attributes.unshift(
    ...styleAttributes(state, { uncondStyles, condStyles, literalStyleSpec }, jsxAttributes),
  )

  // add debug info
  if (!isProduction(state)) {
    openingElement.attributes.unshift(
      t.jSXAttribute(t.jSXIdentifier('__zacs_original_name'), t.stringLiteral(originalName)),
    )
  }
}

module.exports = { convertZacsElement, isAttributeWebSafe, styleAttributes }
