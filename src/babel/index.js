// Note: Why is this one big file? Because that makes it possible to work with it using https://astexplorer.net :)

exports.__esModule = true

const { getPlatform } = require('./state')
const { jsxAttr, jsxFindNamespacedAttr } = require('./jsxUtils')
const { transformStylesheet } = require('./stylesheet')
const {
  isZacsDeclaration,
  validateZacsDeclaration,
  registerDeclaration,
  getDeclaration,
} = require('./declarations')
const { convertZacsElement } = require('./elements')
const { createZacsComponent } = require('./components')

function validateZacsImport(t, path) {
  const { node } = path
  if (
    !(
      node.specifiers.length === 1 &&
      node.specifiers[0].local.name === 'zacs' &&
      // import zacs from 'zacs'
      (t.isImportDefaultSpecifier(node.specifiers[0]) ||
        // import * as zacs from 'zacs'
        t.isImportNamespaceSpecifier(node.specifiers[0]))
    )
  ) {
    throw path.buildCodeFrameError(
      "ZACS import must say exactly `import zacs from '@nozbe/zacs'` or `import * as zacs from '@nozbe/zacs'`. Other forms such as `import { view, text }`, `require` are not allowed.",
    )
  }
}

function transformZacsAttributesOnNonZacsElement(t, platform, path) {
  // this is called on a JSXElement that doesn't (directly) reference a zacs declaration
  // we need to spread zacs:inherit and zacs:style into separate props or it won't work
  const { node } = path
  const { openingElement } = node

  const inheritedPropsAttr = jsxFindNamespacedAttr(t, openingElement.attributes, 'inherit')
  const zacsStyleAttr = jsxFindNamespacedAttr(t, openingElement.attributes, 'style')
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

          if (zacsMethod === 'stylesheet') {
            // do nothing, will process on exit
            // eslint-disable-next-line no-useless-return
            return
          } else if (zacsMethod.startsWith('create')) {
            node.init = createZacsComponent(t, state, path)
          } else {
            registerDeclaration(t, path, state)
          }
        },
        // Stylesheets must be processed on exit so that other babel plugins that transform
        // inline expressions into literals can do their work first
        // TODO: Deduplicate
        exit(path, state) {
          if (!isZacsDeclaration(t, path.node)) {
            return
          }

          const zacsMethod = path.node.init.callee.property.name
          if (zacsMethod !== 'stylesheet') {
            return
          }
          transformStylesheet(t, state, path)
        },
      },
      JSXElement(path, state) {
        const { node } = path
        const { openingElement } = node
        const { name } = openingElement.name
        const platform = getPlatform(state)

        // check if it's a ZACS element
        const declaration = getDeclaration(t, path, state, name)
        if (!declaration) {
          transformZacsAttributesOnNonZacsElement(t, platform, path)
          return
        }

        convertZacsElement(t, path, declaration, state)
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
