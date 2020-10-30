const webpack = require('webpack')
const { createFsFromVolume, Volume } = require('memfs')
const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const compile = (fixture, options = {}) => {
  const compiler = webpack({
    context: __dirname,
    entry: `./${fixture}`,
    output: {
      path: path.resolve(__dirname),
      filename: 'bundle.js',
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: 'static/[name].css',
        chunkFilename: 'static/[name].[hash].css',
      }),
    ],
    optimization: {
      minimize: false,
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          use: [
            {
              loader: path.resolve(__dirname, '../loader.js'),
              options,
            },
          ],
        },
        {
          test: /\.css$/,
          use: [
            // NOTE: use for development
            // {
            //   loader: 'style-loader',
            //   options: {
            //     injectType: 'singletonStyleTag',
            //   },
            // },
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                esModule: true,
                modules: {
                  namedExport: true,
                },
              },
            },
            {
              loader: 'css-loader',
              options: {
                modules: {
                  namedExport: true,
                  localIdentName: '[name]__[local]',
                },
              },
            },
          ],
        },
      ],
    },
  })

  compiler.outputFileSystem = createFsFromVolume(new Volume())
  compiler.outputFileSystem.join = path.join.bind(path)

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) {
        reject(err)
      }
      if (stats.hasErrors()) {
        reject(new Error(stats.toJson().errors))
      }

      resolve(stats)
    })
  })
}

/*
NOTE:
useful stuff in these paths:

stats.compilation.modules
stats.compilation.assets
json.modules

*/

describe('zacs-loader', () => {
  it(`extracts CSS`, async () => {
    const stats = await compile('examples/basic.js')
    const { modules } = stats.compilation
    expect(modules.length).toBe(3)

    const js = modules.find(m => m.rawRequest === './examples/basic.js')._source._value
    expect(js).toMatchSnapshot()

    const css = modules.find(m => m.constructor.name === 'CssModule').content
    expect(css).toMatchSnapshot()

    const cssShim = modules.find(m => m.rawRequest.endsWith('/basic.zacs.css'))._source._value
    expect(cssShim).toMatchSnapshot()
  })
  it(`extracts CSS with slightly malformed whitespace`, async () => {
    // For some reason, babel can insert unexpected whitespace in the generated marked CSS
    const stats = await compile('examples/brokenWhitespace.js')
    const { modules } = stats.compilation
    expect(modules.length).toBe(3)

    const js = modules.find(m => m.rawRequest === './examples/brokenWhitespace.js')._source._value
    expect(js).toMatchSnapshot()
  })
  it(`does not allow multiple stylesheets in one file`, async () => {
    await expect(compile('examples/multipleMarkers.js')).rejects.toMatchObject({
      message: expect.stringMatching('not allowed to have multiple'),
    })
  })
  it(`fails on broken stylesheet markers`, async () => {
    await expect(compile('examples/brokenMarker.js')).rejects.toMatchObject({
      message: expect.stringMatching('Broken ZACS stylesheet'),
    })
  })
  // TODO: e2e test (from source code to end result) with a more realistic setup.
  // further babel plugins may mess up formatting of the magic markers breaking webpack
})
