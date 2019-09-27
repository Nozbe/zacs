// How to run this codemod:
// npx jscodeshift -t bin/codemods/zacsify.js app/components app/pages && yarn prettier

function isStyledComponentDefinition(node) {
  const { callee } = node
  if (callee.type !== 'Identifier') {
    return false
  }

  const { name } = callee

  return (
    name === 'view' ||
    name === 'text' ||
    (name.startsWith('createStyled') && name !== 'createStyledElement')
  )
}

function isZacsComponentDeclaration(node) {
  const { callee } = node
  if (callee.type !== 'MemberExpression') {
    return false
  }

  const { object, property } = callee

  return object.type === 'Identifier' && property.type === 'Identifier' && object.name === 'zacs'
}

function extractFnReturn(node, type) {
  if (!(node.type === 'ArrowFunctionExpression' && node.params.length === 1)) {
    return null
  }

  if (node.body.type === type) {
    return node.body
  } else if (
    node.body.type === 'BlockStatement' &&
    node.body.body.length === 1 &&
    node.body.body[0].type === 'ReturnStatement' &&
    node.body.body[0].argument.type === type
  ) {
    return node.body.body[0].argument
  }

  return null
}

function getPatternProps(node) {
  return node.params[0].type === 'ObjectPattern'
    ? node.params[0].properties.map(p => p.key.name)
    : null
}

function convertAddedToStatic(j, node) {
  const stylesObj = extractFnReturn(node, 'ObjectExpression')

  if (!stylesObj) {return}

  const hasPropsArg = node.params[0].type === 'Identifier' && node.params[0].name === 'props'
  const availablePatternProps = getPatternProps(node)
  const hasPropsPattern = !!availablePatternProps

  if (!(hasPropsArg || hasPropsPattern)) {
    return null
  }

  try {
    const styles = stylesObj.properties.map(property => {
      const attr = property.key.name
      if (!attr) {
        throw 'out'
      }
      const prop = property.value
      let propName
      if (hasPropsArg) {
        if (!(prop.type === 'MemberExpression' && prop.object.name === 'props')) {
          throw 'out'
        } else {
          propName = prop.property.name
        }
      } else if (hasPropsPattern) {
        if (prop.type === 'Identifier' && availablePatternProps.includes(prop.name)) {
          propName = prop.name
        } else {
          throw 'out'
        }
      }
      return [attr, propName]
    })

    const uniquePropNames = styles.filter(
      ([, propName]) => styles.filter(([, p]) => p === propName).length === 1,
    )
    if (uniquePropNames.length !== styles.length) {
      return null
    }

    return j.objectExpression(
      styles.map(([attr, propName]) =>
        j.objectProperty(j.identifier(propName), j.stringLiteral(attr)),
      ),
    )
  } catch (e) {
    return null
  }
}

function convertConditionalToStatic(j, node) {
  const stylesArray = extractFnReturn(node, 'ArrayExpression')

  if (!stylesArray) {return}

  const hasPropsArg = node.params[0].type === 'Identifier' && node.params[0].name === 'props'
  const availablePatternProps = getPatternProps(node)
  const hasPropsPattern = !!availablePatternProps

  if (!(hasPropsArg || hasPropsPattern)) {
    return null
  }

  try {
    const styles = stylesArray.elements.map(el => {
      if (el.type !== 'ArrayExpression' || el.elements.length !== 2) {
        throw 'out'
      }
      const [style, prop] = el.elements
      if (
        !(
          style.type === 'MemberExpression' &&
          (style.object.name === 'style' || style.object.name === 'styles')
        )
      ) {
        throw 'out'
      }
      let propName
      if (hasPropsArg) {
        if (!(prop.type === 'MemberExpression' && prop.object.name === 'props')) {
          throw 'out'
        } else {
          propName = prop.property.name
        }
      } else if (hasPropsPattern) {
        if (prop.type === 'Identifier' && availablePatternProps.includes(prop.name)) {
          propName = prop.name
        } else {
          throw 'out'
        }
      }
      return [style, propName]
    })

    return j.objectExpression(
      styles.map(([style, propName]) => j.objectProperty(j.identifier(propName), style)),
    )
  } catch (e) {
    return null
  }
}

module.exports = function transformer(file, api) {
  const j = api.jscodeshift
  const root = j(file.source)

  let replacedToZacs = false
  const usedStyleExports = {}
  const needsComponentImport = {}

  root.find(j.CallExpression).forEach(path => {
    const def = path.node

    // fix up existing zacs code
    if (isZacsComponentDeclaration(def)) {
      const exportDecl = path.parent.parent.parent.node
      const zacsMethod = def.callee.property.name
      if (exportDecl.type === 'ExportNamedDeclaration' && !zacsMethod.startsWith('create')) {
        const toCreateMethod = {
          view: 'createView',
          text: 'createText',
          styled: 'createStyled',
        }
        def.callee.property.name = toCreateMethod[zacsMethod]
      }
    }

    // convert to zacs
    if (!isStyledComponentDefinition(def)) {
      return
    }

    const { arguments: args } = def
    const [main, extra, addedStyles] = args

    if (args.length > 3) {
      usedStyleExports[def.callee.name] = true
      console.log('skip (too many args)')
      return
    }

    if (args.length === 1 && main.type === 'NullLiteral') {
      def.arguments = []
    }

    const elementType = def.callee.name
    let needsCreatedComponent = false

    const parent = path.parent.node
    if (
      parent.type === 'CallExpression' &&
      parent.callee.type === 'Identifier' &&
      parent.callee.name === 'createAnimatedComponent'
    ) {
      needsCreatedComponent = true
    }

    const exportDecl = path.parent.parent.parent.node
    if (exportDecl.type === 'ExportNamedDeclaration') {
      needsCreatedComponent = true
    }

    let shortHandExtras
    if (extra && extra.type !== 'NullLiteral') {
      shortHandExtras = convertConditionalToStatic(j, extra)

      if (!shortHandExtras) {
        usedStyleExports[elementType] = true
        console.warn(`--> skip (extra styles not compatible) in ${file.path}:${def.loc.start.line}`)
        return
      }
    }

    let shorthandAdded
    if (addedStyles && addedStyles.type !== 'NullLiteral') {
      shorthandAdded = convertAddedToStatic(j, addedStyles)

      if (!shorthandAdded) {
        usedStyleExports[elementType] = true
        console.warn(`--> skip (added styles not compatible) in ${file.path}:${def.loc.start.line}`)
        return
      }
    }

    if (shortHandExtras) {args[1] = shortHandExtras}

    if (shorthandAdded) {args[2] = shorthandAdded}

    const zacsMethods = {
      [true]: {
        view: 'createView',
        text: 'createText',
        styled: 'createStyled',
      },
      [false]: {
        view: 'view',
        text: 'text',
        styled: 'styled',
      },
    }

    if (elementType.startsWith('createStyled')) {
      const componentName = elementType.replace('createStyled', '')
      def.callee = j.memberExpression(
        j.identifier('zacs'),
        j.identifier(zacsMethods[needsCreatedComponent].styled),
      )
      args.unshift(j.identifier(componentName))
      needsComponentImport[componentName] = true
    } else {
      def.callee = j.memberExpression(
        j.identifier('zacs'),
        j.identifier(zacsMethods[needsCreatedComponent][elementType]),
      )
    }

    replacedToZacs = true
    console.log('zacsified!')
  })

  const allImports = root.find(j.ImportDeclaration).paths()
  const styleImports = root
    .find(j.ImportDeclaration, { source: { type: 'StringLiteral', value: 'style' } })
    .paths()

  const zacsImports = root
    .find(j.ImportDeclaration, { source: { type: 'StringLiteral', value: 'zacs' } })
    .paths()

  // add zacs import
  if (replacedToZacs && !zacsImports.length) {
    const lastImport = styleImports.length
      ? styleImports[styleImports.length - 1]
      : allImports[allImports.length - 1]

    lastImport.insertBefore(
      j.importDeclaration(
        [j.importDefaultSpecifier(j.identifier('zacs'))],
        j.stringLiteral('zacs'),
      ),
    )
  }

  // remove style import if possible
  if (styleImports.length) {
    styleImports.forEach(styleImport => {
      const { specifiers } = styleImport.value

      styleImport.value.specifiers = specifiers.filter(specifier => {
        const zacsifiable = ['view', 'text']

        if (
          zacsifiable.includes(specifier.imported.name) &&
          specifier.local.name === specifier.imported.name
        ) {
          return !!usedStyleExports[specifier.imported.name]
        }
        return true
      })

      if (!styleImport.value.specifiers.length) {
        styleImport.prune()
      }
    })
  }

  // replace `createStyledXX` imports with `XX` imports
  allImports.forEach(({ value }) => {
    if (!value) {return}
    let importToAdd = null
    value.specifiers = value.specifiers.filter(specifier => {
      const { local, imported } = specifier
      if (
        imported &&
        local.name === imported.name &&
        local.name.startsWith('createStyled') &&
        local.name !== 'createStyledElement'
      ) {
        const componentName = local.name.replace('createStyled', '')

        if (needsComponentImport[componentName]) {importToAdd = componentName}

        return usedStyleExports[local.name]
      }
      return true
    })
    if (
      importToAdd &&
      !value.specifiers.find(specifier => specifier.type === 'ImportDefaultSpecifier')
    ) {
      value.specifiers.push(j.importDefaultSpecifier(j.identifier(importToAdd)))
    }
  })

  return root.toSource({ quote: 'single', trailingComma: true, tabWidth: 2 })
}

module.exports.parser = 'babylon'
