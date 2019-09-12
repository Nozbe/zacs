<p align="center">
  <img src="https://github.com/Nozbe/zacs/raw/master/assets/logo.png" alt="ZACS: Zero Abstraction Cost Styling" width="472" />
</p>

<h4 align="center">
  👨‍🎨 Component styling with no performance penalty for React and React Native ⚡️
</h4>

<p align="center">
  <a href="https://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="MIT License">
  </a>
  <a href="https://travis-ci.com/Nozbe/zacs">
    <img src="https://api.travis-ci.com/Nozbe/zacs.svg?branch=master" alt="CI Status">
  </a>
  <a href="https://coveralls.io/github/Nozbe/zacs?branch=master">
    <img src="https://img.shields.io/coveralls/github/Nozbe/zacs.svg" alt="Coverage" />
  </a>
  <a href="https://www.npmjs.com/package/@nozbe/zacs">
    <img src="https://img.shields.io/npm/v/@nozbe/zacs.svg" alt="npm">
  </a>
</p>

## What is `zacs`?

**ZACS** turns React components that look like this:

```js
import zacs from '@nozbe/zacs'
import style from './style'

const Box = zacs.view(style.box, { isHighlighted: style.highlighted })

const rendered = <Box isHighlighted />
```

Into **optimized** code that looks like this (**web**):

```js
const rendered = <div className={style.box + ' ' + style.highlighted} />
```

Or this (**React Native**):

```js
import { View } from 'react-native'

const rendered = <View style={[style.box, style.highlighted]} />
```

## Pitch

**ZACS** (Zero Abstraction Cost Styling) is a super-fast component styling library for cross-platform React web and React Native apps.

**Super-fast** as in: there is no difference between using ZACS and writing `<div className>` and `<View style>` manually. That's because **the library doesn't actually _exist_** at runtime, it's entirely implemented as a [Babel](https://babeljs.io) plugin, which compiles the "styled components" syntax down to bare metal.

And because **ZACS** hides the API difference between web (DOM) and React Native, you can build a web and RN app with shared codebase without [`react-native-web`](https://github.com/necolas/react-native-web).

## Installation

```sh
npm install @nozbe/zacs
```

or

```sh
yarn add @nozbe/zacs
```

Then add ZACS to your Babel config (`.babelrc` or `babel.config.js`):

```diff
{
  "plugins": [
+   ["@nozbe/zacs/babel", {
+     "platform": "web", // or "native"
+     "production": true // pass `false` to enable debug attributes
+   }]
  ]
}
```

For web support, you need a temporary workaround in your Webpack config, because zacs releases are not compiled yet. Sorry - this is a temporary inconvenience:

```js
  module: {
    rules: [
      ...
      {
        test: /\.js$/,
        exclude: {
          and: [/(node_modules)/, { not: [/zacs/] }],
        },
        use: {
          loader: 'babel-loader',
          // ...
        },
      },
    },
    ...
  }
```

## Using `zacs`

### Unstyled view or text

```js
import zacs from '@nozbe/zacs'

const Box = zacs.view() // or zacs.view(null)
const Label = zacs.text()

const rendered = <Box><Label>Hello</Label></Box>
```

<details>
  <summary>See compiled output</summary>

  **Web:**

  ```js
  const rendered = <div><span>Hello</span></div>
  ```

  **React Native:**

  ```js
  import { View, Text } from 'react-native'

  const rendered = <View><Text>Hello</Text></View>
  ```
</details>

### Simple styled view or text

```js
import styles from './styles'

const Box = zacs.view(styles.box) // or zacs.text

const rendered = <Box />
```

<details>
  <summary>See compiled output</summary>

  **Web:**

  ```js
  const rendered = <div className={styles.box} />
  ```

  **React Native:**

  ```js
  import { View } from 'react-native'

  const rendered = <View style={styles.box} />
  ```
</details>

### Conditional styles

```js
const Box = zacs.view(styles.box, {
  isHighlighted: styles.isHighlighted,
  isVisible: styles.isVisible,
})

const rendered = <Box isHighlighted={reactions > 0} isVisible />
```

Declare conditional styles as `{ [propName: string]: RNStyleOrClassName }`. If a specified prop is
passed to the component with a truthy value, the corresponding style will be added.

<details>
  <summary>See compiled output</summary>

  **Web:**

  ```js
  const rendered = <div className={styles.box
                                  + ' ' + styles.isVisible
                                  + (reactions > 0) ? (' ' + styles.isHighlighted) : ''} />
  ```

  Please note:

  - conditions are inlined whenever possible (when a constant is passed to a styling prop)
  - styling props are removed from the compiled output

  **React Native:**

  ```js
  import { View } from 'react-native'

  const rendered = <View style={[styles.box,
                                styles.isVisible,
                                reactions > 0 && styles.isHighlighted]} />
  ```
</details>

### Adding style attributes

```js
const Box = zacs.view(styles.box, null, {
  width: 'width',
  color: 'backgroundColor',
})

const rendered = <Box width={100} color="#80EADC" />
```

Declare CSS / React Native `StyleSheet` attributes available as component properties with `{ [propName: string]: CSSOrRNStyleAttributeName }`.

**Gotcha:** If you pass a style attribute at all, *it will override* the main and conditional styles, even if the value is `undefined`.

<details>
  <summary>See compiled output</summary>

  **Web:**

  ```js
  const rendered = <div className={styles.box} style={{ width: 100, backgroundColor: '#80EADC' }} />
  ```

  **React Native:**

  ```js
  import { View } from 'react-native'

  const rendered = <View style={[styles.box, { width: 100, backgroundColor: '#80EADC' }]} />
  ```
</details>

### Styling custom components

```js
import Touchable from 'components/Touchable'

const Button = zacs.styled(Touchable, styles.button, null, {
  width: 'width'
})

const rendered = <Button width={500} />
```

<details>
  <summary>See compiled output</summary>

  **Web:**

  ```js
  import Touchable from 'components/Touchable'

  const rendered = <Touchable className={styles.button} style={{ width: 500 }} />
  ```

  **React Native:**

  ```js
  import Touchable from 'components/Touchable'

  const rendered = <Touchable style={[styles.button, { width: 500 }]} />
  ```
</details>

### Making stylable components

To define new components that you can style using `zacs.styled`, use the special `zacs:inherit` prop
to let **ZACS** know you want styles from `props.style` / `props.className` added in.

```js
const Root = zacs.view(styles.root)

export default const Touchable = props => {
  return <Root zacs:inherit={props} />
}
```

**TODO:** I don't love the `zacs:inherit` name — if you have a better suggestion, let us know!

<details>
  <summary>See compiled output</summary>

  **Web:**

  ```js
  export default const Touchable = props => {
    return <div className={styles.root + ' ' + (props.className || '')} style={props.style} />
  }
  ```

  **React Native:**

  ```js
  import { View } from 'react-native'

  export default const Touchable = props => {
    return <View style={[styles.root].concat(props.style || [])} />
  }
```
</details>

### Configuring output component/element types

Sometimes you need to style a different component on `web` and `native`. To do this, use
`zacs.styled` with `{ web: ComponentType, native: ComponentType }` instead of a direct component reference.

```js
const Paragraph = zacs.styled({ web: 'p', native: zacs.text }, styles.paragraph)

const rendered = <Paragraph>Hello world!</Paragraph>
```

As parameters, you can pass:
- built in element type (string - `p`, `div`, `form`)
- a component reference
- magic `zacs.text` or `zacs.view` (this is so you can easily fall back to RN View/Text without importing `react-native`)

**TODO:** Passing `zacs.text/view` as parameter seems magic and gross. If you have a better idea for this API, let us know!

<details>
  <summary>See compiled output</summary>

  **Web:**

  ```js
  const rendered = <p className={styles.paragraph}>Hello world!</p>
  ```

  **React Native:**

  ```js
  import { Text } from 'react-native'

  const rendered = <Text style={styles.paragraph}>Hello world!</Text>
  ```
</details>

### Exporting ZACS components

`zacs.view/text/styled` are special **declarations** for the compiler, not real components — that's the whole point of "zero abstraction cost styling".

Unfortunately, this means that you can only use those components in the same file in which they're defined, and you can't export it. And this is how you should use `zacs` most of the time. But sometimes, to avoid repetitive code, you really need this.

In that case, use `zacs.createView/Text/Styled`, which actually creates a real component:

```js
export const Box = zacs.createView(styles.box)
export const Label = zacs.createText(styles.label, {
  isBold: style.labelBold,
}, null, ['title', 'numberOfLines'])
export const Wrapper = zacs.createView(styles.wrapper, null, null, ['ref'])
```

You must declare (in the last argument) all non-zacs props you want to be able to pass into the component you're styling (component props, DOM attributes, `ref`, and `zacs:inherit`).

<details>
  <summary>Hey, that's really annoying, why do I need to do this?</summary>

  A distinction between `view` and `createView` is necessary because Babel is a single file compiler, and
  it does not have visibility to imports, so an imported component can't be magically transformed into a `<div />` or `<View />`.

  So we have to de-optimize and do the next best thing -- export an actual component. Not quite `zero abstraction cost`, but almost.

  There is another limitation: because the declaration doesn't see the callsite, we don't know whether
  someone wants to pass props (DOM attributes or View/Text RN props) to the underlying component,
  and we can't use `{...props}`, because you can't pass arbitrary attributes to DOM elements in ReactDOM
  (it will throw errors and can have unexpected side effects).

  Honestly, needing to declare all used props is super annoying and I hate it. If you have a better idea on how to tackle this while staying as close as possible to the _zero abstraction cost_ ideal, **please let us know!**.
</details>


<details>
  <summary>See compiled output</summary>

  **Web:**

  ```js
  export const Box = (props) => {
    return <div className={styles.box}>{props.children}</div>
  }

  export const Label = (props) => {
    return (
      // Note that `numberOfLines` is not passed on because it's not a DOM attribute
      <span className={styles.label + (props.isBold ? ' ' + styles.labelBold : '')} title={props.title}>
        {props.children}
      </span>
    )
  }

  // We add forwardRef if `ref` is an allowed attribute
  export const Wrapper = React.forwardRef((props, ref) => {
    return <div className={styles.wrapper} ref={ref}>{props.children}</div>
  })
  ```

  **React Native:**

  ```js
  import { View, Text } from 'react-native'

  export const Box = (props) => {
    return <Text style={styles.box}>{props.children}</Text>
  }

  export const Label = (props) => {
    return (
      <Text style={[styles.label, props.isBold && styles.labelBold]}
            title={props.title}
            numberOfLines={props.numberOfLines}>
        {props.children}
      </Text>
    )
  }

  export const Wrapper = React.forwardRef((props, ref) => {
    return <Text style={styles.wrapper} ref={ref}>{props.children}</Text>
  })
  ```
</details>

## Defining styles

Unlike popular "CSS-in-JS" libraries, `zacs` only provides the "component styling" part, but styles
themselves are defined in a separate file. Here is how you define them.

**React Native**

```js
// style.native.js
import { StyleSheet } from 'react-native'

export default StyleSheet.create({
  box: {
    backgroundColor: "#80EADC",
    width: 500,
  },
  highlighted: {
    // ...
  },
})
```

See [React Native documentation](https://facebook.github.io/react-native/docs/stylesheet) for more details.

**Web**

We recommend using [PostCSS](https://postcss.org) in your Webpack config to make CSS styles importable from JS.

```css
/* style.web.css */
.box {
  background: #80EADC;
  width: 500px;
}

.highlighted {
  /* ... */
}
```

**ZACS shared styles**

We're thinking of extending ZACS to defining styles, so that you can declare styles once in CSS and have them compile to both CSS and React Native StyleSheet in a "zero abstraction cost" fashion. If you're interested in this project — please contact us!

## Troubleshooting

WIP - Please contribute!

## Contributing

<img src="https://github.com/Nozbe/zacs/raw/master/assets/needyou.jpg" alt="We need you" width="220" />

**ZACS is an open-source project and it needs your help to thrive!**

If there's a missing feature, a bug, poor documentation, or other improvement you'd like, don't ask what we can do to help you, **ask what you can do to help the community**. Feel free to open an issue to get some guidance, and then please [send a pull request](https://github.com/Nozbe/zacs/compare) addressing your issue!

If you make a non-trivial contribution, email me, and I'll send you a nice ZACS sticker!

If you make an app using ZACS, please let us know!

## Author and license

**ZACS** was created by [@Nozbe](https://github.com/Nozbe). Main author and maintainer is [Radek Pietruszewski](https://github.com/radex).

**ZACS** is available under the MIT license. See the [LICENSE file](./LICENSE) for more info.
