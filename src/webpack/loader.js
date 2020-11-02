// Inspiration:
// https://github.com/callstack/linaria/blob/master/src/loader.ts
// https://github.com/callstack/linaria/blob/f1cd66d0b68e8abb5e855819a6fb14019debdf06/src/transform.ts#L43

const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')
const normalize = require('normalize-path')
const loaderUtils = require('loader-utils')

function writeFileIfChanged(outputFilename, cssText) {
  // Read the file first to compare the content
  // Write the new content only if it's changed
  // This will prevent unnecessary WDS reloads
  let currentCssText

  // TODO: We should be using input/output fs provided to webpack, but it breaks tests for some reason
  // TODO: read, then write without a transaction is susceptible to race conditions
  try {
    currentCssText = fs.readFileSync(outputFilename, 'utf-8')
  } catch (e) {
    // Ignore error
  }

  if (currentCssText !== cssText) {
    // TODO: Remove unnecessary dependency on mkdirp
    mkdirp.sync(path.dirname(outputFilename))
    fs.writeFileSync(outputFilename, cssText)
  }
}

const startMarker = 'ZACS_MAGIC_CSS_STYLESHEET_MARKER_START("'
const cssDisclaimer = '/* Generated CSS file (from ZACS Stylesheets) - do not edit! */\n'

exports.default = function loader(source, inputSourceMap) {
  const { cacheDirectory = '.zacs-cache', extension = '.zacs.css' } = loaderUtils.getOptions(this) || {}

  const stylesheetMarkerPos = source.indexOf(startMarker)
  if (stylesheetMarkerPos === -1) {
    // fast path
    return source
  }

  if (source.lastIndexOf(startMarker) !== stylesheetMarkerPos) {
    this.emitError(`It's not allowed to have multiple \`zacs.stylesheet()\`s in a single JavaScript file`)
  }

  // NOTE: We can't use simple indexOf + substring, because some Babel plugins malform the magic markers, insterting whitespace
  // between end of string argument and the closing paren
  const match = source.match(/ZACS_MAGIC_CSS_STYLESHEET_MARKER_START\("(.*)ZACS_MAGIC_CSS_STYLESHEET_MARKER_END"\s*\)/s)
  if (!match) {
    this.emitError(`Broken ZACS stylesheet. Found the beginning of it, but the end is missing or malformed.`)
  }

  const extractedStyles = match[0]
  const cssText = cssDisclaimer + match[1].replace(/ \\n\\/g, '')

  // TODO: Linaria checks for workspace/learna root -- see if it's needed here
  const root = /* workspaceRoot || lernaRoot || */ process.cwd()
  const baseOutputFileName = this.resourcePath.replace(/\.[^.]+$/, extension)
  const outputFilename = normalize(
    path.join(
      path.isAbsolute(cacheDirectory) ? cacheDirectory : path.join(process.cwd(), cacheDirectory),
      this.resourcePath.includes(root)
        ? path.relative(root, baseOutputFileName)
        : baseOutputFileName,
    ),
  )

  writeFileIfChanged(outputFilename, cssText)

  // Add extra whitespace as to not break sourcemap positions of items before/after
  const extraWhitespaceCount = extractedStyles.split('\n').length - 1
  const extraWhitespace = Array(extraWhitespaceCount).fill('\n').join('')
  const requireStatement = `require(${loaderUtils.stringifyRequest(this, outputFilename)})${extraWhitespace}`
  const cleanSource = source.replace(extractedStyles, requireStatement)

  this.callback(
    null,
    cleanSource,
    inputSourceMap,
  )
  return undefined
}
