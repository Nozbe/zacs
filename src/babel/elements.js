const { types: t } = require('@babel/core')
const { htmlAttributes, htmlElements } = require('./attributes')
const { getPlatform, isProduction } = require('./state')
const { setUsesRN } = require('./imports')
const {
  jsxAttr,
  jsxRenameElement,
  jsxGetAttrValue,
  jsxInferAttrTruthiness,
  jsxHasAttrNamed,
  jsxFindNamespacedAttr,
} = require('./jsxUtils')
const { mergeObjects, concatArraysOfObjects, objectExpressionFromPairs } = require('./astUtils')

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

function getStyles(uncondStyles, condStyles, literalStyleSpec, jsxAttributes, passthroughProps) {
  const stylesets = []
  const literalStyles = []

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

  // TODO: Validate zacs:style value
  // TODO: If the value is a simple object, we could merge them into literalStyles. OTOH, maybe another
  // optimizer Babel plugin can do it further down the line?
  const zacsStyleAttribute = jsxAttributes && jsxFindNamespacedAttr(jsxAttributes, 'style')
  const hasZacsStyleAttr = zacsStyleAttribute || passthroughProps.includes('zacs:style')
  const zacsStyle = hasZacsStyleAttr
    ? (zacsStyleAttribute && zacsStyleAttribute.value.expression) ||
      t.memberExpression(t.identifier('props'), t.identifier('__zacs_style'))
    : null

  // TODO: Validate inherited props value
  const inheritedPropsAttr = jsxAttributes && jsxFindNamespacedAttr(jsxAttributes, 'inherit')
  const hasInheritedProps = inheritedPropsAttr || passthroughProps.includes('zacs:inherit')
  const inheritedProps = hasInheritedProps
    ? (inheritedPropsAttr && inheritedPropsAttr.value.expression) || t.identifier('props')
    : null

  return [
    stylesets,
    literalStyles.length ? objectExpressionFromPairs(literalStyles) : null,
    inheritedProps,
    zacsStyle,
  ]
}

function webClassNameExpr(classNamesExpr, inheritedProps) {
  if (inheritedProps) {
    const inheritedClassNames = t.memberExpression(inheritedProps, t.identifier('className'))

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

function webStyleExpr(styles, inheritedProps, zacsStyle) {
  const inheritedStyles = inheritedProps
    ? t.memberExpression(inheritedProps, t.identifier('style'))
    : null
  const allStyles = [styles, zacsStyle, inheritedStyles]

  return mergeObjects(allStyles)
}

function webStyleAttributes([classNames, styles, inheritedProps, zacsStyle]) {
  const attributes = []

  const classNamesExpr = classNames.reduce((expr, [className, condition]) => {
    const isFirstExpr = !expr

    const classNameSpace = isFirstExpr
      ? className
      : t.binaryExpression('+', t.stringLiteral(' '), className)

    const classNameExpr = condition
      ? t.conditionalExpression(condition, classNameSpace, t.stringLiteral(''))
      : classNameSpace

    return isFirstExpr ? classNameExpr : t.binaryExpression('+', expr, classNameExpr)
  }, null)

  const classNamesValue = webClassNameExpr(classNamesExpr, inheritedProps)
  if (classNamesValue) {
    attributes.push(jsxAttr('className', classNamesValue))
  }

  const stylesValue = webStyleExpr(styles, inheritedProps, zacsStyle)
  if (stylesValue) {
    attributes.push(jsxAttr('style', stylesValue))
  }

  return attributes
}

function nativeStyleAttributes([stylesets, literalStyleset, inheritedProps, zacsStyle]) {
  const styles = stylesets.map(([styleName, condition]) =>
    condition ? t.logicalExpression('&&', condition, styleName) : styleName,
  )

  if (literalStyleset) {
    styles.push(literalStyleset)
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
    inheritedProps && t.memberExpression(inheritedProps, t.identifier('style')),
  )

  return stylesExpr ? [jsxAttr('style', stylesExpr)] : []
}

function styleAttributes(
  platform,
  uncondStyles,
  condStyles,
  literalStyleSpec,
  jsxAttributes,
  passedProps = [],
) {
  const styles = getStyles(uncondStyles, condStyles, literalStyleSpec, jsxAttributes, passedProps)
  switch (platform) {
    case 'web':
      return webStyleAttributes(styles)
    case 'native':
      return nativeStyleAttributes(styles)
    default:
      throw new Error('Unknown platform passed to ZACS config')
  }
}

const builtinElements = {
  web: {
    view: 'div',
    text: 'span',
  },
  native: {
    view: 'ZACS_RN_View',
    text: 'ZACS_RN_Text',
  },
}

// 'Foo' (uppercase) builtins need special treatment, hence second arg
function getElementName(platform, path, originalName, component) {
  if (typeof component === 'string') {
    const identifier = builtinElements[platform][component]
    return [identifier, false]
  } else if (
    t.isMemberExpression(component) &&
    t.isIdentifier(component.object, { name: 'zacs' }) &&
    t.isIdentifier(component.property) &&
    ['text', 'view'].includes(component.property.name)
  ) {
    const identifier = builtinElements[platform][component.property.name]
    return [identifier, false]
  } else if (t.isIdentifier(component)) {
    return [component.name, false]
  } else if (t.isStringLiteral(component)) {
    return [component.value, true]
  } else if (t.isMemberExpression(component)) {
    // assuming it was already validated to be id.id
    const identifier = `${component.object.name}.${component.property.name}`
    return [identifier, false]
  } else if (t.isObjectExpression(component)) {
    const platformComponent = component.properties.find(
      (property) => property.key.name === platform,
    )

    if (!platformComponent) {
      throw path.buildCodeFrameError(
        `Invalid component specifier in ZACS declaration - no ${platform} key specified for ${originalName}`,
      )
    }

    return getElementName(platform, path, originalName, platformComponent.value)
  }

  throw path.buildCodeFrameError(
    `Invalid component type in ZACS declaration -- look at the const ${originalName} = zacs.styled/createStyled(...) declaration. The component to style that was passed is not of valid syntax.`,
  )
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
  const { id, init } = declaration
  const originalName = id.name
  const zacsMethod = init.callee.property.name
  const [elementName, isBuiltin] = getElementName(
    platform,
    // should be path to declaration, not use, but the path gets removed after visiting
    // (unless keepDeclarations: true)
    path,
    originalName,
    zacsMethod === 'styled' ? init.arguments[0] : zacsMethod,
  )
  const [uncondStyles, condStyles, literalStyleSpec] =
    zacsMethod === 'styled' ? init.arguments.slice(1) : init.arguments
  const originalAttributes = openingElement.attributes

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
  } else if (platform === 'native') {
    setUsesRN(state, elementName)
  } else {
    throw new Error('Unknown platform')
  }

  // add styling attributes
  openingElement.attributes.unshift(
    ...styleAttributes(platform, uncondStyles, condStyles, literalStyleSpec, originalAttributes),
  )

  // add debug info
  if (!isProduction(state)) {
    openingElement.attributes.unshift(
      t.jSXAttribute(t.jSXIdentifier('__zacs_original_name'), t.stringLiteral(originalName)),
    )
  }
}

module.exports = { convertZacsElement, getElementName, isAttributeWebSafe, styleAttributes }
