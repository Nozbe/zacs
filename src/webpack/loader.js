// Inspiration:
// https://github.com/callstack/linaria/blob/master/src/loader.ts
// https://github.com/callstack/linaria/blob/f1cd66d0b68e8abb5e855819a6fb14019debdf06/src/transform.ts#L43

const loaderUtils = require('loader-utils')

exports.default = function loader(source) {
  // const options = getOptions(this)

  const stylesheetMarkerPos = source.indexOf('ZACS_MAGIC_CSS_STYLESHEET_MARKER_START`')
  if (stylesheetMarkerPos === -1) {
    return source
  }

  // TODO: Avoid regex (perf) + allow multiple markers
  const match = source.match(
    /ZACS_MAGIC_CSS_STYLESHEET_MARKER_START`(.*)ZACS_MAGIC_CSS_STYLESHEET_MARKER_END`/s,
  )
  const css = match[1]
  const baseOutputFileName = this.resourcePath.replace(/\.[^.]+$/, '.zacs.css')
  const requireStatement = `require(${loaderUtils.stringifyRequest(this, baseOutputFileName)})`
  // TODO: This breaks source maps
  const cleanSource = source.replace(match[0], requireStatement)

  return cleanSource

  // source = source.replace(/\[name\]/g, options.name).trim()

  // return `export default ${JSON.stringify(source)}`
}
