exports.__esModule = true

const { types: t } = require('@babel/core')
const { getPlatform } = require('./state')
const { transformStylesheet } = require('./stylesheet')
const {
  isZacsDeclaration,
  validateZacsDeclaration,
  registerDeclaration,
  getDeclaration,
} = require('./declarations')
const { convertZacsElement } = require('./elements')
const { createZacsComponent } = require('./components')
const { handleImportDeclaration, injectNativeImportsIfNeeded } = require('./imports')
const { transformZacsAttributesOnNonZacsElement } = require('./nonZacsElements')

exports.default = function () {
  return {
    name: 'zacs',
    visitor: {
      VariableDeclarator: {
        enter(path, state) {
          if (!isZacsDeclaration(path.node)) {
            return
          }

          validateZacsDeclaration(path)

          const { node } = path
          const { init } = node
          const zacsMethod = init.callee.property.name

          if (zacsMethod === 'stylesheet') {
            // do nothing, will process on exit
            // eslint-disable-next-line no-useless-return
            return
          } else if (zacsMethod.startsWith('create')) {
            node.init = createZacsComponent(state, path)
          } else {
            registerDeclaration(path, state)
          }
        },
        // Stylesheets must be processed on exit so that other babel plugins that transform
        // inline expressions into literals can do their work first
        // TODO: Deduplicate
        exit(path, state) {
          if (!isZacsDeclaration(path.node)) {
            return
          }

          const zacsMethod = path.node.init.callee.property.name
          if (zacsMethod !== 'stylesheet') {
            return
          }
          transformStylesheet(state, path)
        },
      },
      JSXElement(path, state) {
        const { node } = path
        const { openingElement } = node
        const { name } = openingElement.name
        const platform = getPlatform(state)

        const declaration = getDeclaration(path, state, name)
        if (declaration) {
          convertZacsElement(path, declaration, state)
        } else {
          transformZacsAttributesOnNonZacsElement(platform, path)
        }
      },
      Program: {
        exit(path, state) {
          injectNativeImportsIfNeeded(path, state)
        },
      },
      ImportDeclaration(path, state) {
        handleImportDeclaration(path, state)
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
