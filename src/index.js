/* eslint-disable */

function displayZacsError(methodName) {
  return function zacsRuntimePlaceholder() {
    return function zacsPlaceholderComponent() {
      console.log(`zacs arguments passed:`, arguments)
      throw new Error(
        'zacs.' + methodName + 'method called directly (not transpiled). Your Babel file is probably misconfigured or you have a syntax error. See https://github.com/Nozbe/zacs#troubleshooting for more info',
      )
    }
  }
}

module.exports = {
  view: displayZacsError('view'),
  text: displayZacsError('text'),
  styled: displayZacsError('styled'),
  createView: displayZacsError('createView'),
  createText: displayZacsError('createText'),
  createStyled: displayZacsError('createStyled'),
}
