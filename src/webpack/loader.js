// Inspiration:
// https://github.com/callstack/linaria/blob/master/src/loader.ts
// https://github.com/callstack/linaria/blob/f1cd66d0b68e8abb5e855819a6fb14019debdf06/src/transform.ts#L43

const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')
const normalize = require('normalize-path')
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
  const cssText = match[1]

  const baseOutputFileName = this.resourcePath.replace(/\.[^.]+$/, '.zacs.css')

  const root = /*workspaceRoot || lernaRoot || */ process.cwd()
  const cacheDirectory = '.zacs-cache'
  const outputFilename = normalize(
    path.join(
      path.isAbsolute(cacheDirectory) ? cacheDirectory : path.join(process.cwd(), cacheDirectory),
      this.resourcePath.includes(root)
        ? path.relative(root, baseOutputFileName)
        : baseOutputFileName,
    ),
  )

  // Read the file first to compare the content
  // Write the new content only if it's changed
  // This will prevent unnecessary WDS reloads
  let currentCssText

  // TODO: We should be using input/output fs provided to webpack, but it breaks tests for some reason
  try {
    currentCssText = fs.readFileSync(outputFilename, 'utf-8')
  } catch (e) {
    // Ignore error
  }

  if (currentCssText !== cssText) {
    // TODO: Remove unnecessary dependency
    mkdirp.sync(path.dirname(outputFilename))
    fs.writeFileSync(outputFilename, cssText)
  }

  const requireStatement = `require(${loaderUtils.stringifyRequest(this, outputFilename)})`
  // TODO: This breaks source maps
  const cleanSource = source.replace(match[0], requireStatement)

  this.callback(
    null,
    cleanSource,
    // TODO: source map
  )
}
