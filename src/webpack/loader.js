// Inspiration:
// https://github.com/callstack/linaria/blob/master/src/loader.ts
// https://github.com/callstack/linaria/blob/f1cd66d0b68e8abb5e855819a6fb14019debdf06/src/transform.ts#L43

const { getOptions } = require('loader-utils')

exports.default = function loader(source) {
  const options = getOptions(this)

  source = source.replace(/\[name\]/g, options.name).trim()

  return `export default ${JSON.stringify(source)}`
}
