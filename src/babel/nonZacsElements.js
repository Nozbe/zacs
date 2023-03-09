const { types: t } = require('@babel/core')
const { jsxAttr, jsxFindNamespacedAttr } = require('./jsxUtils')
const { mergeObjects, concatArraysOfObjects } = require('./astUtils')

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

function transformZacsAttributesOnNonZacsElement(platform, path) {
  // this is called on a JSXElement that doesn't (directly) reference a zacs declaration
  // we need to spread zacs:inherit and zacs:style into separate props or it won't work
  const { node } = path
  const { openingElement } = node

  const zacsInheritAttr = jsxFindNamespacedAttr(openingElement.attributes, 'inherit')
  const zacsStyleAttr = jsxFindNamespacedAttr(openingElement.attributes, 'style')
  if (!zacsInheritAttr && !zacsStyleAttr) {
    return
  }

  const addedAttrs = []

  const zacsStyleExpr = zacsStyleAttr && zacsStyleAttr.value.expression
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
    .filter((attr) => attr !== zacsInheritAttr && attr !== zacsStyleAttr)
    .concat(addedAttrs)
}

module.exports = { transformZacsAttributesOnNonZacsElement }
