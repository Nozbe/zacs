const { types: t } = require('@babel/core')
const { jsxAttr, jsxFindNamespacedAttr } = require('./jsxUtils')
const { mergeObjects } = require('./babelUtils')

function transformZacsAttributesOnNonZacsElement(platform, path) {
  // this is called on a JSXElement that doesn't (directly) reference a zacs declaration
  // we need to spread zacs:inherit and zacs:style into separate props or it won't work
  const { node } = path
  const { openingElement } = node

  const inheritedPropsAttr = jsxFindNamespacedAttr(openingElement.attributes, 'inherit')
  const zacsStyleAttr = jsxFindNamespacedAttr(openingElement.attributes, 'style')
  if (!inheritedPropsAttr && !zacsStyleAttr) {
    return
  }

  const addedAttrs = []
  const addedStyles = []

  // zacs:style come before zacs:inherit
  if (zacsStyleAttr) {
    addedStyles.push(zacsStyleAttr.value.expression)
  }

  if (inheritedPropsAttr) {
    const inheritedProps = inheritedPropsAttr.value.expression

    if (platform === 'web') {
      const classNameAttr = jsxAttr(
        'className',
        t.memberExpression(inheritedProps, t.identifier('className')),
      )
      addedAttrs.push(classNameAttr)
    }

    addedStyles.push(t.memberExpression(inheritedProps, t.identifier('style')))
  }

  // Merge styles coming from zacs:inherit and zacs:style
  addedAttrs.unshift(jsxAttr('style', mergeObjects(addedStyles)))

  openingElement.attributes = openingElement.attributes
    .filter((attr) => attr !== inheritedPropsAttr && attr !== zacsStyleAttr)
    .concat(addedAttrs)
}

module.exports = { transformZacsAttributesOnNonZacsElement }
