// @flow

// TODO: Add Flow types

const displayZacsError = (type: string) => (...args: any[]) => (): any => {
  // eslint-disable-next-line no-console
  console.log(`zacs error info`, args)
  throw new Error(
    `zacs.${type} method called directly (not transpiled). Your Babel file is probably misconfigured or you have a syntax error. See https://github.com/Nozbe/zacs#troubleshooting for more info`,
  )
}

export default {
  view: displayZacsError('view'),
  text: displayZacsError('text'),
  styled: displayZacsError('styled'),
  createView: displayZacsError('createView'),
  createText: displayZacsError('createText'),
  createStyled: displayZacsError('createStyled'),
}
