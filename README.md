<p align="center">
  <img src="https://github.com/Nozbe/zacs/raw/master/assets/logo.png" alt="ZACS: Zero Abstraction Cost Styling" width="472" />
</p>

<h4 align="center">
  Component styling with no performance penalty for React and React Native ⚡️
</h4>

<p align="center">
  <a href="https://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="MIT License">
  </a>
  <!--
  <a href="https://travis-ci.com/Nozbe/WatermelonDB">
    <img src="https://api.travis-ci.com/Nozbe/WatermelonDB.svg?branch=master" alt="CI Status">
  </a>-->

  <a href="https://www.npmjs.com/package/@nozbe/zacs">
    <img src="https://img.shields.io/npm/v/@nozbe/zacs.svg" alt="npm">
  </a>
</p>

## What is `zacs`?

**ZACS** turns React components that look like this:

```js
import zacs from 'zacs'
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

"Super-fast" as in: there is no difference between using ZACS and writing `<div className>` and `<View style>` manually. That's because **the library doesn't actually _exist_** at runtime, it's entirely implemented as a [Babel](https://babeljs.io) plugin, which compiles the "styled components" syntax down to bare metal.

And because **ZACS** hides the API difference between web (DOM) and React Native, you can build a web and RN app with shared codebase without [`react-native-web`](https://github.com/necolas/react-native-web).

## Installation

TODO

## API

### Unstyled view or text

```js
import zacs from 'zacs'

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
const Box = zacs.view(styles.box) // or zacs.text

const rendered = <Box />
```

<details>
  <summary>See compiled output</summary>

  **Web:**

  ```js
  import styles from './styles'

  const rendered = <div className={styles.box} />
  ```

  **React Native:**

  ```js
  import { View } from 'react-native'
  import styles from './styles'

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
passed to the component with a truthy value, the corresponsing style will be added.

<details>
  <summary>See compiled output</summary>

  **Web:**

  ```js
  import styles from './styles'

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
  import styles from './styles'

  const rendered = <View style={[styles.box,
                                styles.isVisible,
                                reactions > 0 && styles.isHighlighted]} />
  ```
</details>

## Contributing

## Author and license

**ZACS** was created by [@Nozbe](https://github.com/Nozbe). Main author and maintainer is [Radek Pietruszewski](https://github.com/radex).

**ZACS** is available under the MIT license. See the [LICENSE file](./LICENSE) for more info.
