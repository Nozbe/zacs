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
    throw new Error('platform not specified to this plugin')
  }
  return platform
}

function isProduction(state) {
  // return true
  // return false
  const { production } = state.opts
  return !!production
}

function renameJSX(node, name) {
  const { openingElement, closingElement } = node
  openingElement.name.name = name
  if (closingElement) {
    closingElement.name.name = name
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

function getElementName(t, platform, path, component) {
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
  } else if (t.isObjectExpression(component)) {
    const platformComponent = component.properties.find(property => property.key.name === platform)

    if (!platformComponent) {
      throw path.buildCodeFrameError(
        `Invalid component specifier in zacs declaration - no ${platform} key specified`,
      )
    }

    return getElementName(t, platform, path, platformComponent.value)
  }

  throw path.buildCodeFrameError(`Invalid component type in zacs declaration`)
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

  const component = t.arrowFunctionExpression(
    shouldForwardRef ? [t.identifier('props'), t.identifier('ref')] : [t.identifier('props')],
    t.jSXElement(
      t.jSXOpeningElement(t.jSXIdentifier(elementName), jsxAttributes),
      t.jSXClosingElement(t.jSXIdentifier(elementName)),
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
    !['text', 'view', 'styled', 'createText', 'createView', 'createStyled'].includes(zacsMethod)
  ) {
    throw path.buildCodeFrameError(
      `zacs.${init.callee.property.name} is not a valid zacs declaration`,
    )
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
        // TODO: Validate platform specifier keys
        (t.isIdentifier(componentToStyle) ||
          t.isStringLiteral(componentToStyle) ||
          t.isObjectExpression(componentToStyle))
      )
    ) {
      throw path.buildCodeFrameError(
        'zacs.styled() requires an argument - a `Component`, a `{ web: Component, native: Component }` specifier, or a `"builtin"` (e.g. `"div"` on web)',
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

const componentKey = name => `declaration_${name}`

exports.default = function(babel) {
  const { types: t } = babel

  return {
    name: 'zacs',
    visitor: {
      VariableDeclarator(path, state) {
        if (!isZacsDeclaration(t, path.node)) {
          return
        }

        validateZacsDeclaration(t, path)

        const { node } = path
        const { init } = node
        const zacsMethod = init.callee.property.name

        if (zacsMethod.startsWith('create')) {
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
          path, // should be path to declaration
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
          renameJSX(node, elementName)

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
          renameJSX(node, elementName)
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
          }
        },
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
