/* eslint-disable no-use-before-define */
// Note: Why is this one big file? Because that makes it possible to work with it using https://astexplorer.net :)

exports.__esModule = true

/*

TERMINOLOGY:

zacs.{view,text,styled}()       -- styled declaration
zacs.create{View,Text,Styled}() -- styled component

styles.foo                      -- predefined styleset
{ foo: 'bar' }                  -- literal styleset

zacs.view(
  styles.foo,                   -- unconditional styleset (uncond styleset)
  { bar: styles.bar },          -- conditional styleset spec (cond styleset)
  { width: 'width' }            -- literal style spec
)

*/

function getPlatform(state) {
  // return 'web'
  // return 'native'
  const { platform } = state.opts
  if (!platform) {
    throw new Error('platform option is required for ZACS babel plugin')
  }
  if (platform !== 'web' && platform !== 'native') {
    throw new Error(
      'illegal platform option passed to ZACS babel plugin. allowed values: web, native',
    )
  }
  return platform
}

function getTarget(state) {
  // return 'ios'
  // return 'android'
  const { target } = state.opts
  if (target && !['ios', 'android', 'web'].includes(target)) {
    // eslint-disable-next-line no-console
    console.warn(
      'Unrecognized target passed to ZACS babel plugin. Known targets: web, ios, android',
    )
  }
  return target
}

function isProduction(state) {
  // return true
  // return false
  const { production } = state.opts
  return !!production
}

function jsxName(t, name) {
  if (name.includes('.')) {
    const segments = name.split('.')
    if (segments.length !== 2) {
      throw new Error(`Invalid JSX name ${name}`)
    }
    const [obj, prop] = segments
    return t.jSXMemberExpression(t.jSXIdentifier(obj), t.jSXIdentifier(prop))
  }
  return t.jSXIdentifier(name)
}

function renameJSX(t, node, name) {
  const { openingElement, closingElement } = node
  const jsxId = jsxName(t, name)

  openingElement.name = jsxId
  if (closingElement) {
    closingElement.name = jsxId
  }
}

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
  return attributes.filter(attribute => {
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

function withoutStylingProps(t, attributes, condStyles, literalStyleSpec) {
  const stylingProps = []

  if (condStyles && condStyles.properties) {
    condStyles.properties.forEach(property => {
      stylingProps.push(property.key.name)
    })
  }

  if (literalStyleSpec && literalStyleSpec.properties) {
    literalStyleSpec.properties.forEach(property => {
      stylingProps.push(property.key.name)
    })
  }

  return attributes.filter(attribute => {
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

function jsxAttrValue(t, attr) {
  if (attr.value === null) {
    return t.booleanLiteral(true)
  } else if (t.isJSXExpressionContainer(attr.value)) {
    return attr.value.expression
  } else if (t.isStringLiteral(attr.value)) {
    return attr.value
  }
  throw new Error('Unknown JSX Attribute value type')
}

function inferJsxAttrTruthiness(t, attr) {
  const value = jsxAttrValue(t, attr)

  if (
    t.isBooleanLiteral(value, { value: true }) ||
    (t.isStringLiteral(value) && value.value.length) ||
    (t.isNumericLiteral(value) && value.value)
  ) {
    return true
  }

  if (
    t.isBooleanLiteral(value, { value: false }) ||
    t.isNullLiteral(value) ||
    (t.isStringLiteral(value) && value.value === '') ||
    (t.isNumericLiteral(value) && value.value === 0) ||
    t.isIdentifier(value, { name: 'undefined' }) ||
    t.isIdentifier(value, { name: 'NaN' })
  ) {
    return false
  }

  return value
}

function jsxAttr(t, name, value) {
  return t.jSXAttribute(t.jSXIdentifier(name), t.jSXExpressionContainer(value))
}

function objectExpressionFromPairs(t, keyValuePairs) {
  return t.objectExpression(
    keyValuePairs.map(([key, value]) => t.objectProperty(t.identifier(key), value)),
  )
}

function findNamespacedAttr(t, attributes, attrName) {
  return attributes.find(
    ({ name }) =>
      t.isJSXNamespacedName(name) && name.namespace.name === 'zacs' && name.name.name === attrName,
  )
}

function getStyles(t, uncondStyles, condStyles, literalStyleSpec, jsxAttributes, passedProps) {
  const stylesets = []
  const literalStyles = []

  if (uncondStyles && !t.isNullLiteral(uncondStyles)) {
    if (t.isArrayExpression(uncondStyles)) {
      stylesets.push(...uncondStyles.elements.map(styleset => [styleset]))
    } else {
      stylesets.push([uncondStyles])
    }
  }

  if (condStyles && !t.isNullLiteral(condStyles)) {
    condStyles.properties.forEach(property => {
      const style = property.value
      const propName = property.key.name

      if (jsxAttributes) {
        const attr = jsxAttributes.find(a => a.name && a.name.name === propName)
        if (!attr) {
          return
        }

        const flag = inferJsxAttrTruthiness(t, attr)

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
    literalStyleSpec.properties.forEach(property => {
      const styleAttr = property.value.value
      const propName = property.key.name

      if (jsxAttributes) {
        const attr = jsxAttributes.find(a => a.name && a.name.name === propName)
        if (!attr) {
          return
        }

        const styleValue = jsxAttrValue(t, attr)
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
  const zacsStyleAttribute = jsxAttributes && findNamespacedAttr(t, jsxAttributes, 'style')
  const hasZacsStyleAttr = zacsStyleAttribute || passedProps.includes('zacs:style')
  const zacsStyle = hasZacsStyleAttr
    ? (zacsStyleAttribute && zacsStyleAttribute.value.expression) ||
      t.memberExpression(t.identifier('props'), t.identifier('__zacs_style'))
    : null

  // TODO: Validate inherited props value
  const inheritedPropsAttr = jsxAttributes && findNamespacedAttr(t, jsxAttributes, 'inherit')
  const hasInheritedProps = inheritedPropsAttr || passedProps.includes('zacs:inherit')
  const inheritedProps = hasInheritedProps
    ? (inheritedPropsAttr && inheritedPropsAttr.value.expression) || t.identifier('props')
    : null

  return [
    stylesets,
    literalStyles.length ? objectExpressionFromPairs(t, literalStyles) : null,
    inheritedProps,
    zacsStyle,
  ]
}

function webClassNameExpr(t, classNamesExpr, inheritedProps) {
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

function webStyleExpr(t, styles, inheritedProps, zacsStyle) {
  const inheritedStyles = inheritedProps
    ? t.memberExpression(inheritedProps, t.identifier('style'))
    : null
  const allStyles = [styles, zacsStyle, inheritedStyles].filter(Boolean)

  if (!allStyles.length) {
    return null
  } else if (allStyles.length === 1) {
    return allStyles[0]
  }

  // prevent Object.assign(props.__zacs_style, ...), because if it's not an object, it will crash
  if (!styles && zacsStyle && inheritedProps && !t.isObjectExpression(zacsStyle)) {
    allStyles.unshift(t.objectExpression([]))
  }

  // Object.assign({styles:'values'}, props.style)
  // TODO: Maybe we can use spread operator and babel will transpile it into ES5 if necessary?
  return t.callExpression(
    t.memberExpression(t.identifier('Object'), t.identifier('assign')),
    allStyles,
  )
}

function webStyleAttributes(t, [classNames, styles, inheritedProps, zacsStyle]) {
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

  const classNamesValue = webClassNameExpr(t, classNamesExpr, inheritedProps)
  if (classNamesValue) {
    attributes.push(jsxAttr(t, 'className', classNamesValue))
  }

  const stylesValue = webStyleExpr(t, styles, inheritedProps, zacsStyle)
  if (stylesValue) {
    attributes.push(jsxAttr(t, 'style', stylesValue))
  }

  return attributes
}

function nativeStyleAttributes(t, [stylesets, literalStyleset, inheritedProps, zacsStyle]) {
  const styles = stylesets.map(([styleName, condition]) =>
    condition ? t.logicalExpression('&&', condition, styleName) : styleName,
  )

  if (literalStyleset) {
    styles.push(literalStyleset)
  }

  if (zacsStyle) {
    styles.push(zacsStyle)
  }

  if (!styles.length && !inheritedProps) {
    return []
  }

  // {style} or [{styles}, {styles}]
  const stylesExpr = styles.length === 1 ? styles[0] : t.arrayExpression(styles)

  // [originalStyles].concat(props.styles || [])
  // TODO: Skip originalStyles if empty, only pass inheritedProps
  const exprWithInherited = inheritedProps
    ? t.callExpression(t.memberExpression(t.arrayExpression(styles), t.identifier('concat')), [
        t.logicalExpression(
          '||',
          t.memberExpression(inheritedProps, t.identifier('style')),
          t.arrayExpression([]),
        ),
      ])
    : stylesExpr
  return [jsxAttr(t, 'style', exprWithInherited)]
}

function styleAttributes(
  t,
  platform,
  uncondStyles,
  condStyles,
  literalStyleSpec,
  jsxAttributes,
  passedProps = [],
) {
  const styles = getStyles(
    t,
    uncondStyles,
    condStyles,
    literalStyleSpec,
    jsxAttributes,
    passedProps,
  )
  switch (platform) {
    case 'web':
      return webStyleAttributes(t, styles)
    case 'native':
      return nativeStyleAttributes(t, styles)
    default:
      throw new Error('Unknown platform passed to ZACS config')
  }
}

function hasAttrNamed(t, name, attributes) {
  return attributes.find(attribute => t.isJSXAttribute(attribute) && attribute.name.name === name)
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

function getElementName(t, platform, path, originalName, component) {
  if (typeof component === 'string') {
    return builtinElements[platform][component]
  } else if (
    t.isMemberExpression(component) &&
    t.isIdentifier(component.object, { name: 'zacs' }) &&
    t.isIdentifier(component.property) &&
    ['text', 'view'].includes(component.property.name)
  ) {
    return builtinElements[platform][component.property.name]
  } else if (t.isIdentifier(component)) {
    return component.name
  } else if (t.isStringLiteral(component)) {
    return component.value
  } else if (t.isMemberExpression(component)) {
    // assuming it was already validated to be id.id
    return `${component.object.name}.${component.property.name}`
  } else if (t.isObjectExpression(component)) {
    const platformComponent = component.properties.find(property => property.key.name === platform)

    if (!platformComponent) {
      throw path.buildCodeFrameError(
        `Invalid component specifier in ZACS declaration - no ${platform} key specified for ${originalName}`,
      )
    }

    return getElementName(t, platform, path, originalName, platformComponent.value)
  }

  throw path.buildCodeFrameError(
    `Invalid component type in ZACS declaration -- look at the const ${originalName} = zacs.styled/createStyled(...) declaration. The component to style that was passed is not of valid syntax.`,
  )
}

function propsChildren(t) {
  return [
    t.jSXExpressionContainer(t.memberExpression(t.identifier('props'), t.identifier('children'))),
  ]
}

function forwardRef(t, component) {
  return t.callExpression(t.memberExpression(t.identifier('React'), t.identifier('forwardRef')), [
    component,
  ])
}

const createMethodToZacsMethod = {
  createView: 'view',
  createText: 'text',
  createStyled: 'styled',
}

function arrayExprToStringArray(t, expr) {
  if (!expr || t.isNullLiteral(expr)) {
    return []
  }

  return expr.elements.map(element => {
    // TODO: Validate passed props earlier, don't just crash babel
    t.assertStringLiteral(element)
    if (element.value === 'style' || element.value === 'className') {
      throw new Error(`Don't add style/className to passed props, add 'zacs:inherit' instead`)
    }
    return element.value
  })
}

function createZacsComponent(t, state, path) {
  const { node } = path
  const { init } = node
  const platform = getPlatform(state)

  const zacsMethod = createMethodToZacsMethod[init.callee.property.name]
  const elementName = getElementName(
    t,
    platform,
    path, // should be path to declaration
    undefined, // TODO: this should be the name of the component
    zacsMethod === 'styled' ? init.arguments[0] : zacsMethod,
  )
  const [uncondStyles, condStyles, literalStyleSpec, passedPropsExpr] =
    zacsMethod === 'styled' ? init.arguments.slice(1) : init.arguments

  if (platform === 'native') {
    // TODO: Reuse global `react-native` import if there already is one
    // FIXME: Using state is ugly, but if if I insert an import/require, it doesn't show up
    // as a binding on next attempt (as to not duplicate imports)
    state.set(`uses_rn`, true)
    state.set(`uses_rn_${zacsMethod}`, true)
  }

  const passedProps = arrayExprToStringArray(t, passedPropsExpr)
  const shouldForwardRef = passedProps.includes('ref')

  const jsxAttributes = []
  passedProps.forEach(prop => {
    const isAttrWebSafe =
      platform === 'web' && htmlElements.has(elementName) ? isAttributeWebSafe(prop) : true
    if (prop !== 'zacs:inherit' && prop !== 'zacs:style' && prop !== 'ref' && isAttrWebSafe) {
      jsxAttributes.push(
        jsxAttr(t, prop, t.memberExpression(t.identifier('props'), t.identifier(prop))),
      )
    }
  })

  if (shouldForwardRef) {
    jsxAttributes.push(jsxAttr(t, 'ref', t.identifier('ref')))
  }

  jsxAttributes.unshift(
    ...styleAttributes(t, platform, uncondStyles, condStyles, literalStyleSpec, null, passedProps),
  )

  const jsxId = jsxName(t, elementName)

  const component = t.arrowFunctionExpression(
    shouldForwardRef ? [t.identifier('props'), t.identifier('ref')] : [t.identifier('props')],
    t.jSXElement(
      t.jSXOpeningElement(jsxId, jsxAttributes),
      t.jSXClosingElement(jsxId),
      propsChildren(t),
    ),
  )

  return shouldForwardRef ? forwardRef(t, component) : component
}

function isZacsDeclaration(t, node) {
  if (!t.isVariableDeclarator(node)) {
    return false
  }
  const { init } = node
  if (!t.isCallExpression(init)) {
    return false
  }
  const {
    callee: { object, property },
  } = init

  if (!(t.isIdentifier(object, { name: 'zacs' }) && t.isIdentifier(property))) {
    return false
  }

  return true
}

function validateZacsDeclaration(t, path) {
  const { node } = path
  const { init } = node
  const zacsMethod = init.callee.property.name

  // Validate variable name

  if (!t.isIdentifier(node.id)) {
    throw path.buildCodeFrameError('Expected zacs declaration to be assigned to a simple variable')
  }

  // Validate declaration
  if (
    ![
      'text',
      'view',
      'styled',
      'createText',
      'createView',
      'createStyled',
      '_experimentalStyleSheet',
    ].includes(zacsMethod)
  ) {
    throw path.buildCodeFrameError(
      `zacs.${init.callee.property.name} is not a valid zacs declaration`,
    )
  }

  if (zacsMethod === '_experimentalStyleSheet') {
    return
  }

  if (!zacsMethod.startsWith('create')) {
    // TODO: It's not very reliable, as you could define first, export later...
    // declarator -> declaration -> export declaration
    if (t.isExportDeclaration(path.parentPath.parent)) {
      throw path.buildCodeFrameError(
        `It's not allowed to export zacs declarations. You can export zacs components (use zacs.createView/createText/createStyled), however they behave a little differently -- please check documentation for more information.`,
      )
    }
  }

  if (zacsMethod === 'styled') {
    const componentToStyle = init.arguments[0]
    if (
      !(
        init.arguments.length >= 1 &&
        (t.isIdentifier(componentToStyle) ||
          // e.g. Foo.Bar
          (t.isMemberExpression(componentToStyle) &&
            t.isIdentifier(componentToStyle.object) &&
            t.isIdentifier(componentToStyle.property)) ||
          // builtin, e.g. 'div'
          t.isStringLiteral(componentToStyle) ||
          // {web:x, native:y} TODO: Validate platform specifier keys
          t.isObjectExpression(componentToStyle))
      )
    ) {
      throw path.buildCodeFrameError(
        'zacs.styled() requires an argument - a `Component`, `Namespaced.Component`, a `{ web: Component, native: Component }` specifier, or a `"builtin"` (e.g. `"div"` on web)',
      )
    }
  }

  const [, condStyles, literalStyleSpec] =
    zacsMethod === 'styled' || zacsMethod === 'createStyled'
      ? init.arguments.slice(1)
      : init.arguments

  if (condStyles && !(t.isObjectExpression(condStyles) || t.isNullLiteral(condStyles))) {
    throw path.buildCodeFrameError(
      'Conditional styles (second argument to ZACS) should be an object expression',
    )

    // TODO: Validate keys / values too
  }

  if (
    literalStyleSpec &&
    !(t.isObjectExpression(literalStyleSpec) || t.isNullLiteral(literalStyleSpec))
  ) {
    throw path.buildCodeFrameError(
      'Literal styles (third argument to ZACS) should be an object expression',
    )

    // TODO: Validate keys / values too
  }
}

function validateElementHasNoIllegalAttributes(t, path) {
  const { openingElement } = path.node
  const { attributes } = openingElement
  if (hasAttrNamed(t, 'style', attributes)) {
    throw path.buildCodeFrameError(
      'It\'s not allowed to pass `style` attribute to ZACS-styled components',
    )
  }
  if (hasAttrNamed(t, 'className', attributes)) {
    throw path.buildCodeFrameError(
      'It\'s not allowed to pass `className` attribute to ZACS-styled components',
    )
  }
}

function validateZacsImport(t, path) {
  const { node } = path
  if (
    !(
      node.specifiers.length === 1 &&
      t.isImportDefaultSpecifier(node.specifiers[0]) &&
      node.specifiers[0].local.name === 'zacs'
    )
  ) {
    throw path.buildCodeFrameError(
      'ZACS import must say exactly `import zacs from \'@nozbe/zacs\'`. Other forms such as `import { view, text }`, `require`, `import * as zacs` are not allowed.',
    )
  }
}

function transformZacsAttributesOnNonZacsElement(t, platform, path) {
  // this is called on a JSXElement that doesn't (directly) reference a zacs declaration
  // we need to spread zacs:inherit and zacs:style into separate props or it won't work
  const { node } = path
  const { openingElement } = node

  const inheritedPropsAttr = findNamespacedAttr(t, openingElement.attributes, 'inherit')
  const zacsStyleAttr = findNamespacedAttr(t, openingElement.attributes, 'style')
  if (!inheritedPropsAttr && !zacsStyleAttr) {
    return
  }

  const addedAttrs = []

  if (inheritedPropsAttr) {
    const inheritedProps = inheritedPropsAttr.value.expression
    const styleAttr = jsxAttr(t, 'style', t.memberExpression(inheritedProps, t.identifier('style')))
    addedAttrs.push(styleAttr)

    if (platform === 'web') {
      const classNameAttr = jsxAttr(
        t,
        'className',
        t.memberExpression(inheritedProps, t.identifier('className')),
      )
      addedAttrs.push(classNameAttr)
    }
  }

  if (zacsStyleAttr) {
    // rewrite zacs:style to __zacs_style, otherwise React babel plugin will have a problem
    addedAttrs.push(jsxAttr(t, '__zacs_style', zacsStyleAttr.value.expression))
  }

  openingElement.attributes = openingElement.attributes
    .filter(attr => attr !== inheritedPropsAttr && attr !== zacsStyleAttr)
    .concat(addedAttrs)
}

function isPlainObjectProperty(t, node, allowStringLiterals) {
  const isAllowedKey =
    t.isIdentifier(node.key) || (allowStringLiterals && t.isStringLiteral(node.key))
  return (
    t.isObjectProperty(node) && isAllowedKey && !node.shorthand && !node.computed && !node.method
  )
}

function isPlainTemplateLiteral(t, node) {
  return t.isTemplateLiteral(node) && !node.expressions.length && node.quasis.length === 1
}

function isNumberLiteral(t, node) {
  return (
    t.isNumericLiteral(node) ||
    (t.isUnaryExpression(node) &&
      node.operator === '-' &&
      node.prefix &&
      t.isNumericLiteral(node.argument))
  )
}

// ZACS_STYLESHEET_LITERAL(xxx) - magic syntax that passes validation
// for use by babel plugins that transform dynamic expressions into static literals
function isZacsStyleSheetLiteral(t, node) {
  return (t.isCallExpression(node) && t.isIdentifier(node.callee, { name: 'ZACS_STYLESHEET_LITERAL' }))
}

function validateStyleset(t, styleset, nestedIn) {
  if (!t.isObjectExpression(styleset.node)) {
    throw styleset.buildCodeFrameError(
      'ZACS StyleSheets must be simple object literals, like so: `text: { backgroundColor: \'red\', height: 100 }`. Other syntaxes, like `foo ? {xxx} : {yyy}` or `...styles` are not allowed.',
    )
  }

  const properties = styleset.get('properties')
  properties.forEach(property => {
    // FIXME: We want to allow `...{literal-object}` syntax as a natural way to do mixins, but
    // most setups use a Babel plugin that will transpile object spread syntax into a function call
    // before ZACS stylesheets be processed. We can't do all processing earlier because that will
    // break constant-replacement and other plugins that turn dynamic syntax into compile-time constants
    // I think the way to fix it is to preprocess at the beginning, traverse object literal tree and
    // replace `...`s, but that might still turn out to be buggy...

    // if (t.isSpreadElement(property.node)) {
    //   const spreadArg = property.get('argument')
    //   if (!t.isObjectExpression(spreadArg.node)) {
    //     throw spreadArg.buildCodeFrameError("Spread element in a ZACS StyleSheet must be a simple object literal, like so: `{ height: 100, ...{ width: 200 } }`. Other syntaxes, like `...styles` are not allowed.")
    //   }
    //   validateStyleset(t, spreadArg, nestedIn)
    //   return
    // }

    if (!isPlainObjectProperty(t, property.node, true)) {
      throw property.buildCodeFrameError(
        'ZACS StyleSheets style attributes must be simple strings, like so: `{ backgroundColor: \'red\', height: 100 }`. Other syntaxes, like `[propName]:` are not allowed.',
      )
    }
    const valuePath = property.get('value')
    const value = valuePath.node

    if (t.isStringLiteral(property.node.key)) {
      if (!t.isObjectExpression(value)) {
        throw styleset.buildCodeFrameError(
          'ZACS StyleSheets style attributes must be simple strings, like so: `{ backgroundColor: \'red\', height: 100 }`. Quoted keys are only allowed for web inner styles, e.g. `{ "& > span": { opacity: 0.5 } }`',
        )
      }
      validateStyleset(t, valuePath, 'web')
      return
    }

    const key = property.node.key.name

    if (key === 'css') {
      if (!(t.isStringLiteral(value) || isPlainTemplateLiteral(t, value))) {
        throw valuePath.buildCodeFrameError(
          'ZACS StyleSheet\'s magic css: property expects a simple literal string as its value. Object expressions, references, expressions in a template literal are not allowed.',
        )
      }
    } else if (key === '_mixin') {
      validateStyleset(t, valuePath, nestedIn)
    } else if (key === 'web' || key === 'native' || key === 'ios' || key === 'android') {
      if (nestedIn) {
        throw property.buildCodeFrameError(
          'ZACS StyleSheets cannot have platform-specific blocks nested within a platform-specific block',
        )
      }

      validateStyleset(t, valuePath, key)
    } else {
      const nestedInNative = nestedIn === 'native' || nestedIn === 'ios' || nestedIn === 'android'
      if (!(t.isStringLiteral(value) || isNumberLiteral(t, value) || isZacsStyleSheetLiteral(t, value)) && !nestedInNative) {
        throw valuePath.buildCodeFrameError(
          'ZACS StyleSheet\'s style values must be simple literal strings or numbers, e.g.: `backgroundColor: \'red\'`, or `height: 100.`. Compound expressions, references, and other syntaxes are not allowed',
        )
      }
    }
  })
}

function validateStyleSheet(t, path) {
  const args = path.get('init.arguments')
  const stylesheet = args[0]
  if (!(args.length === 1 && t.isObjectExpression(stylesheet.node))) {
    throw path.buildCodeFrameError('ZACS StyleSheet accepts a single Object argument')
  }

  stylesheet.get('properties').forEach(styleset => {
    if (!isPlainObjectProperty(t, styleset.node)) {
      throw styleset.buildCodeFrameError(
        'ZACS StyleSheet stylesets must be defined as `name: {}`. Other syntaxes, like `[name]:`, `"name": `, `...styles` are not allowed',
      )
    }
    const stylesetName = styleset.node.key.name
    if (stylesetName === 'css') {
      const cssValue = styleset.get('value')
      if (!(t.isStringLiteral(cssValue.node) || isPlainTemplateLiteral(t, cssValue.node))) {
        throw cssValue.buildCodeFrameError(
          'ZACS StyleSheet\'s magic css: styleset expects a simple literal string as its value. Object expressions, references, expressions in a template literal are not allowed.',
        )
      }
    } else {
      validateStyleset(t, styleset.get('value'), null)
    }
  })
}

const strval = stringLiteralOrPlainTemplateLiteral =>
  stringLiteralOrPlainTemplateLiteral.value ||
  stringLiteralOrPlainTemplateLiteral.quasis[0].value.cooked

const capitalRegex = /([A-Z])/g
const cssCaseReplacer = (match, letter) => `-${letter.toLowerCase()}`
function encodeCSSProperty(property) {
  return property.replace(capitalRegex, cssCaseReplacer)
}

function normalizeNumber(node) {
  // assume number literal or unaryExpr(-, num)
  if (node.argument) {
    return -node.argument.value
  }

  return node.value
}

function encodeCSSValue(property, value) {
  const val = normalizeNumber(value)
  if (typeof val === 'number' && !unitlessCssAttributes.has(property)) {
    return `${val}px`
  }
  return val
}

function encodeCSSStyle(property, spaces = '  ') {
  if (property.type === 'SpreadElement') {
    return encodeCSSStyles(property.argument, spaces)
  }

  const { value } = property

  if (property.key.value) {
    return `${spaces}${property.key.value} {\n${encodeCSSStyles(value, `${spaces}  `)}\n${spaces}}`
  }

  const key = property.key.name
  if (key === 'native' || key === 'ios' || key === 'android') {
    return null
  } else if (key === 'css') {
    return `${spaces}${strval(value)}`
  } else if (key === 'web' || key === '_mixin') {
    return encodeCSSStyles(value)
  }

  return `${spaces}${encodeCSSProperty(key)}: ${encodeCSSValue(key, value)};`
}

function encodeCSSStyles(styleset, spaces) {
  return styleset.properties
    .map(style => encodeCSSStyle(style, spaces))
    .filter(rule => rule !== null)
    .join('\n')
}

function encodeCSSStyleset(styleset) {
  const { name } = styleset.key

  if (name === 'css') {
    return strval(styleset.value)
  }

  return `.${name} {\n${encodeCSSStyles(styleset.value)}\n}`
}

function encodeCSSStyleSheet(stylesheet) {
  const stylesets = stylesheet.properties.map(encodeCSSStyleset).join('\n\n')
  return `${stylesets}\n`
}

function resolveRNStylesheet(t, platform, target, stylesheet) {
  stylesheet.properties = stylesheet.properties
    .filter(styleset => styleset.key.name !== 'css')
    .map(styleset => {
      const resolvedProperties = []
      const pushProp = property => {
        if (isZacsStyleSheetLiteral(t, property.value)) {
          // strip ZACS_STYLESHEET_LITERAL(x)
          const [wrappedValue] = property.value.arguments
          property.value = wrappedValue
        }
        resolvedProperties.push(property)
      }
      const pushFromInner = objectExpr => {
        objectExpr.properties.forEach(property => {
          if (property.type === 'ObjectProperty' && property.key.name === '_mixin' && property.value.type === 'ObjectExpression') {
            pushFromInner(property.value)
          } else {
            pushProp(property)
          }
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
          pushProp(property)
        }
      })
      styleset.value.properties = resolvedProperties
      return styleset
    })

  return stylesheet
}

function transformStyleSheet(t, state, path) {
  const { node } = path
  const { init } = node
  const { arguments: args } = init
  const platform = getPlatform(state)

  validateStyleSheet(t, path)

  const stylesheet = args[0]

  if (platform === 'web') {
    const css = encodeCSSStyleSheet(stylesheet)
    const preparedCss = `\n${css}ZACS_MAGIC_CSS_STYLESHEET_MARKER_END`
    const formattedCss = t.stringLiteral(preparedCss)
    // NOTE: We can't use a template literal, because most people use a Babel transform for it, and it
    // doesn't spit out clean output. So we spit out an ugly string literal, but keep it multi-line
    // so that it's easier to view source code in case webpack fails to extract it.
    // TODO: Escaped characters are probably broken here, please investigate
    formattedCss.extra = {
      rawValue: preparedCss,
      raw: `"${preparedCss.split('\n').join(' \\n\\\n')}"`,
    }

    const magicCssExpression = t.expressionStatement(
      t.callExpression(t.identifier('ZACS_MAGIC_CSS_STYLESHEET_MARKER_START'), [formattedCss]),
    )
    t.addComment(
      path.parent,
      'leading',
      '\nZACS-generated CSS stylesheet begins below.\nPRO TIP: If you get a ReferenceError on the line below, it means that your Webpack ZACS support is not configured properly.\nIf you only see this comment and the one below in generated code, this is normal, nothing to worry about!\n',
    )
    path.get('init').replaceWith(magicCssExpression)
    t.addComment(path.parent, 'trailing', ' ZACS-generated CSS stylesheet ends above ')
  } else if (platform === 'native') {
    state.set(`uses_rn`, true)
    state.set(`uses_rn_stylesheet`, true)

    const target = getTarget(state)

    const resolvedRules = resolveRNStylesheet(t, platform, target, stylesheet)
    const rnStylesheet = t.callExpression(
      t.memberExpression(t.identifier('ZACS_RN_StyleSheet'), t.identifier('create')),
      [resolvedRules],
    )
    path.get('init').replaceWith(rnStylesheet)
  } else {
    throw new Error('unknown platform')
  }
}

const componentKey = name => `declaration_${name}`

exports.default = function(babel) {
  const { types: t } = babel

  return {
    name: 'zacs',
    visitor: {
      VariableDeclarator: {
        enter(path, state) {
          if (!isZacsDeclaration(t, path.node)) {
            return
          }

          validateZacsDeclaration(t, path)

          const { node } = path
          const { init } = node
          const zacsMethod = init.callee.property.name

          if (zacsMethod === '_experimentalStyleSheet') {
            // do nothing, will process on exit
            // eslint-disable-next-line no-useless-return
            return
          } else if (zacsMethod.startsWith('create')) {
            node.init = createZacsComponent(t, state, path)
          } else {
            const id = node.id.name
            const stateKey = componentKey(id)
            if (state.get(stateKey)) {
              throw path.buildCodeFrameError(`Duplicate ZACS declaration for name: ${id}`)
            }
            state.set(stateKey, node)

            if (!state.opts.keepDeclarations) {
              path.remove()
            }
          }
        },
        // StyleSheets must be processed on exit so that other babel plugins that transform
        // inline expressions into literals can do their work first
        // TODO: Deduplicate
        exit(path, state) {
          if (!isZacsDeclaration(t, path.node)) {
            return
          }

          const zacsMethod = path.node.init.callee.property.name
          if (zacsMethod !== '_experimentalStyleSheet') {
            return
          }
          transformStyleSheet(t, state, path)
        },
      },
      JSXElement(path, state) {
        const { node } = path
        const { openingElement } = node
        const { name } = openingElement.name
        const platform = getPlatform(state)

        // check if it's a ZACS element
        const declaration = state.get(componentKey(name))
        if (!declaration) {
          transformZacsAttributesOnNonZacsElement(t, platform, path)
          return
        }

        validateElementHasNoIllegalAttributes(t, path)

        // get ZACS element info
        const { id, init } = declaration
        const originalName = id.name
        const zacsMethod = init.callee.property.name
        const elementName = getElementName(
          t,
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

        // add debug info
        if (!isProduction(state)) {
          openingElement.attributes.unshift(
            t.jSXAttribute(t.jSXIdentifier('__zacs_original_name'), t.stringLiteral(originalName)),
          )
        }

        // filter out styling props
        // TODO: Combine this and web safe attributes into one step
        openingElement.attributes = withoutStylingProps(
          t,
          openingElement.attributes,
          condStyles,
          literalStyleSpec,
        )

        // replace component
        if (platform === 'web') {
          renameJSX(t, node, elementName)

          // filter out non-DOM attributes (React will throw errors at us for this)
          if (htmlElements.has(elementName)) {
            openingElement.attributes = webSafeAttributes(openingElement.attributes)
          }
        } else if (platform === 'native') {
          // TODO: Reuse global `react-native` import if there already is one
          // FIXME: Using state is ugly, but if if I insert an import/require, it doesn't show up
          // as a binding on next attempt (as to not duplicate imports)
          state.set(`uses_rn`, true)
          state.set(`uses_rn_${zacsMethod}`, true)
          renameJSX(t, node, elementName)
        } else {
          throw new Error('Unknown platform')
        }

        // add styling attributes
        openingElement.attributes.unshift(
          ...styleAttributes(
            t,
            platform,
            uncondStyles,
            condStyles,
            literalStyleSpec,
            originalAttributes,
          ),
        )
      },
      Program: {
        exit(path, state) {
          const platform = getPlatform(state)

          if (platform === 'native' && state.get('uses_rn')) {
            const myImport = babel.template(`const zacsReactNative = require('react-native')`)
            const [zacsRN] = path.get('body')[0].insertBefore(myImport())

            if (state.get('uses_rn_view')) {
              const makeZacsElement = babel.template(`const ZACS_RN_View = zacsReactNative.View`)
              zacsRN.insertAfter(makeZacsElement())
            }

            if (state.get('uses_rn_text')) {
              const makeZacsElement = babel.template(`const ZACS_RN_Text = zacsReactNative.Text`)
              zacsRN.insertAfter(makeZacsElement())
            }

            if (state.get('uses_rn_stylesheet')) {
              const makeZacsElement = babel.template(
                `const ZACS_RN_StyleSheet = zacsReactNative.StyleSheet`,
              )
              zacsRN.insertAfter(makeZacsElement())
            }
          }
        },
      },
      ImportDeclaration(path, state) {
        const { node } = path

        if (
          !node.source ||
          // Make it work even if someone makes a fork of zacs
          !(node.source.value === 'zacs' || node.source.value.endsWith('/zacs'))
        ) {
          return
        }

        validateZacsImport(t, path)

        if (!state.opts.keepDeclarations) {
          path.remove()
        }
      },
      TaggedTemplateExpression(path) {
        const { node } = path
        const { tag } = node

        // Strip zacs.css`` tag (only an annotation for editor highlighting)
        if (
          !(
            t.isMemberExpression(tag) &&
            t.isIdentifier(tag.object, { name: 'zacs' }) &&
            t.isIdentifier(tag.property, { name: 'css' })
          )
        ) {
          return
        }

        path.replaceWith(node.quasi)
      },
    },
  }
}

const htmlAttributes = new Set([
  // attributes
  'abbr',
  'accept',
  'acceptCharset',
  'accessKey',
  'action',
  'allowFullScreen',
  'allowTransparency',
  'alt',
  'async',
  'autoComplete',
  'autoFocus',
  'autoPlay',
  'cellPadding',
  'cellSpacing',
  'challenge',
  'charset',
  'checked',
  'cite',
  'cols',
  'colSpan',
  'command',
  'content',
  'contentEditable',
  'contextMenu',
  'controls',
  'coords',
  'crossOrigin',
  'data',
  'dateTime',
  'default',
  'defer',
  'dir',
  'disabled',
  'download',
  'draggable',
  'dropzone',
  'encType',
  'for',
  'form',
  'formAction',
  'formEncType',
  'formMethod',
  'formNoValidate',
  'formTarget',
  'frameBorder',
  'headers',
  'height',
  'hidden',
  'high',
  'href',
  'hrefLang',
  'htmlFor',
  'httpEquiv',
  'icon',
  'id',
  'inputMode',
  'isMap',
  'itemId',
  'itemProp',
  'itemRef',
  'itemScope',
  'itemType',
  'kind',
  'label',
  'lang',
  'list',
  'loop',
  'manifest',
  'max',
  'maxLength',
  'media',
  'mediaGroup',
  'method',
  'min',
  'minLength',
  'multiple',
  'muted',
  'name',
  'noValidate',
  'open',
  'optimum',
  'pattern',
  'ping',
  'placeholder',
  'poster',
  'preload',
  'radioGroup',
  'readOnly',
  'rel',
  'required',
  'role',
  'rows',
  'rowSpan',
  'sandbox',
  'scope',
  'scoped',
  'scrolling',
  'seamless',
  'selected',
  'shape',
  'size',
  'sizes',
  'sortable',
  'span',
  'spellCheck',
  'src',
  'srcDoc',
  'srcSet',
  'start',
  'step',
  'style',
  'tabIndex',
  'target',
  'title',
  'translate',
  'type',
  'typeMustMatch',
  'useMap',
  'value',
  'width',
  'wmode',
  'wrap',
  // handlers
  'onBlur',
  'onChange',
  'onClick',
  'onContextMenu',
  'onCopy',
  'onCut',
  'onDoubleClick',
  'onDrag',
  'onDragEnd',
  'onDragEnter',
  'onDragExit',
  'onDragLeave',
  'onDragOver',
  'onDragStart',
  'onDrop',
  'onFocus',
  'onInput',
  'onKeyDown',
  'onKeyPress',
  'onKeyUp',
  'onMouseDown',
  'onMouseEnter',
  'onMouseLeave',
  'onMouseMove',
  'onMouseOut',
  'onMouseOver',
  'onMouseUp',
  'onPaste',
  'onPointerDown',
  'onPointerEnter',
  'onPointerMove',
  'onPointerUp',
  'onPointerCancel',
  'onPointerOut',
  'onPointerLeave',
  'onScroll',
  'onSubmit',
  'onTouchCancel',
  'onTouchEnd',
  'onTouchMove',
  'onTouchStart',
  'onWheel',
])

const htmlElements = new Set([
  'a',
  'abbr',
  'address',
  'area',
  'article',
  'aside',
  'audio',
  'b',
  'base',
  'bdi',
  'bdo',
  'blockquote',
  'body',
  'br',
  'button',
  'canvas',
  'caption',
  'cite',
  'code',
  'col',
  'colgroup',
  'data',
  'datalist',
  'dd',
  'del',
  'details',
  'dfn',
  'dialog',
  'div',
  'dl',
  'dt',
  'em',
  'embed',
  'fieldset',
  'figcaption',
  'figure',
  'footer',
  'form',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'head',
  'header',
  'hr',
  'html',
  'i',
  'iframe',
  'img',
  'input',
  'ins',
  'kbd',
  'keygen',
  'label',
  'legend',
  'li',
  'link',
  'main',
  'map',
  'mark',
  'math',
  'menu',
  'menuitem',
  'meta',
  'meter',
  'nav',
  'noscript',
  'object',
  'ol',
  'optgroup',
  'option',
  'output',
  'p',
  'param',
  'picture',
  'pre',
  'progress',
  'q',
  'rb',
  'rp',
  'rt',
  'rtc',
  'ruby',
  's',
  'samp',
  'script',
  'section',
  'select',
  'small',
  'source',
  'span',
  'strong',
  'style',
  'sub',
  'summary',
  'sup',
  'svg',
  'table',
  'tbody',
  'td',
  'template',
  'textarea',
  'tfoot',
  'th',
  'thead',
  'time',
  'title',
  'tr',
  'track',
  'u',
  'ul',
  'variable',
  'video',
  'wbr',
])

const unitlessCssAttributes = new Set([
  // Based on https://github.com/giuseppeg/style-sheet/blob/e71c119ecaccdb2e50be0759b45820b8cbf0c6df/src/data.js
  'animationIterationCount',
  'borderImageOutset',
  'borderImageSlice',
  'borderImageWidth',
  'boxFlex',
  'boxFlexGroup',
  'boxOrdinalGroup',
  'columnCount',
  'columns',
  'flex',
  'flexGrow',
  'flexPositive',
  'flexShrink',
  'flexNegative',
  'flexOrder',
  'gridRow',
  'gridRowEnd',
  'gridRowSpan',
  'gridRowStart',
  'gridColumn',
  'gridColumnEnd',
  'gridColumnSpan',
  'gridColumnStart',
  'fontWeight',
  'lineClamp',
  'lineHeight',
  'opacity',
  'order',
  'orphans',
  'tabSize',
  'widows',
  'zIndex',
  'zoom',
  // SVG
  'fillOpacity',
  'floodOpacity',
  'stopOpacity',
  'strokeDasharray',
  'strokeDashoffset',
  'strokeMiterlimit',
  'strokeOpacity',
  'strokeWidth',
])
