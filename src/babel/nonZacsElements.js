const { types: t } = require('@babel/core')
const { getPlatform, isProduction } = require('./state')
const { getElementName } = require('./declarations')
const { jsxAttr, jsxFindNamespacedAttrPath, jsxRenameElement } = require('./jsxUtils')
const { mergeObjects, concatArraysOfObjects } = require('./astUtils')
const { resolveZacsStyleAttr } = require('./resolveStyle')
const { setUsesRN } = require('./imports')

function mergeStyles(platform, maybeZacsStyleExpr, maybeZacsInheritStyleExpr) {
  // NOTE: zacs:style comes before zacs:inherit
  if (platform === 'web') {
    // { ...a, ...b }
    return mergeObjects([maybeZacsStyleExpr, maybeZacsInheritStyleExpr])
  } else if (platform === 'native') {
    // [a].concat(b || [])
    return concatArraysOfObjects([maybeZacsStyleExpr], maybeZacsInheritStyleExpr)
  }

  throw new Error('Unknown platform')
}

function transformAnonymousZacsElement(path, state) {
  const platform = getPlatform(state)

  const { node } = path
  const { openingElement } = node

  if (
    !(
      t.isJSXMemberExpression(openingElement.name) &&
      t.isJSXIdentifier(openingElement.name.object, { name: 'zacs' })
    )
  ) {
    return
  }

  if (
    !(t.isJSXIdentifier(openingElement.name.property),
    ['view', 'text'].includes(openingElement.name.property.name))
  ) {
    throw path
      .get('openingElement.name.property')
      .buildCodeFrameError(
        `zacs.${openingElement.name.property.name} is not a valid element. Did you mean <zacs.view /> or <zacs.text /> ?`,
      )
  }

  const elementType = openingElement.name.property.name
  const originalName = `zacs.${elementType}`

  const [elementName, isBuiltin] = getElementName(platform, path, originalName, elementType)

  if (platform === 'native') {
    setUsesRN(state, elementName)
  }

  // replace component
  jsxRenameElement(node, elementName, isBuiltin)

  // add debug info
  if (!isProduction(state)) {
    openingElement.attributes.unshift(
      t.jSXAttribute(t.jSXIdentifier('__zacs_original_name'), t.stringLiteral(originalName)),
    )
  }
}

function transformZacsAttributesOnNonZacsElement(path, state) {
  const platform = getPlatform(state)

  // this is called on a JSXElement that doesn't (directly) reference a zacs declaration
  // we need to spread zacs:inherit and zacs:style into separate props or it won't work
  const { node } = path
  const { openingElement } = node

  const attrPaths = path.get('openingElement.attributes')
  const zacsInheritAttr = jsxFindNamespacedAttrPath(attrPaths, 'inherit')?.node
  const zacsStyleAttrPath = jsxFindNamespacedAttrPath(attrPaths, 'style')
  if (!zacsInheritAttr && !zacsStyleAttrPath) {
    return
  }

  const addedAttrs = []

  const zacsStyleExpr = (() => {
    if (!zacsStyleAttrPath) {
      return null
    }

    return resolveZacsStyleAttr(zacsStyleAttrPath, state)
  })()
  const zacsInheritExpr = zacsInheritAttr && zacsInheritAttr.value.expression

  if (zacsInheritExpr && platform === 'web') {
    const classNameAttr = jsxAttr(
      'className',
      t.memberExpression(zacsInheritExpr, t.identifier('className')),
    )
    addedAttrs.push(classNameAttr)
  }

  // Merge styles coming from zacs:inherit and zacs:style
  const resolvedStyleExpr = mergeStyles(
    platform,
    zacsStyleExpr,
    zacsInheritExpr && t.memberExpression(zacsInheritExpr, t.identifier('style')),
  )

  addedAttrs.push(jsxAttr('style', resolvedStyleExpr))

  openingElement.attributes = openingElement.attributes
    .filter((attr) => attr !== zacsInheritAttr && attr !== zacsStyleAttrPath.node)
    .concat(addedAttrs)
}

module.exports = { transformAnonymousZacsElement, transformZacsAttributesOnNonZacsElement }
