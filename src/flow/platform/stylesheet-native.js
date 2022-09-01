// @flow

import type { ZacsStylesheetShorthandExtensions } from './stylesheet-shorthands'

export type ReactNativeBasicStylesheet = $Exact<{
  // https://github.com/facebook/react-native/blob/master/Libraries/StyleSheet/StyleSheetTypes.js
  alignContent?:
    | 'flex-start'
    | 'flex-end'
    | 'center'
    | 'stretch'
    | 'space-between'
    | 'space-around',
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline',
  alignSelf?: 'auto' | 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline',
  aspectRatio?: number,
  backfaceVisibility?: string | number,
  backgroundColor?: string | number,
  borderColor?: string,
  borderCurve?: 'circular' | 'continuous',
  borderBottomColor?: string,
  borderEndColor?: string,
  borderLeftColor?: string,
  borderRightColor?: string,
  borderStartColor?: string,
  borderTopColor?: string,
  borderRadius?: number | string,
  borderBottomEndRadius?: number | string,
  borderBottomLeftRadius?: number | string,
  borderBottomRightRadius?: number | string,
  borderBottomStartRadius?: number | string,
  borderTopEndRadius?: number | string,
  borderTopLeftRadius?: number | string,
  borderTopRightRadius?: number | string,
  borderTopStartRadius?: number | string,
  borderStyle?: 'solid' | 'dotted' | 'dashed',
  borderWidth?: number | string,
  borderBottomWidth?: number | string,
  borderEndWidth?: number | string,
  borderLeftWidth?: number | string,
  borderRightWidth?: number | string,
  borderStartWidth?: number | string,
  borderTopWidth?: number | string,
  bottom?: string | number,
  color?: string | number,
  decomposedMatrix?: string | number,
  direction?: string | number,
  display?: string | number,
  elevation?: string | number,
  flex?: number,
  flexBasis?: string | number,
  flexDirection?: string | number,
  flexGrow?: number,
  flexShrink?: number,
  flexWrap?: string | number,
  fontFamily?: string,
  fontSize?: number,
  fontStyle?: 'normal' | 'italic',
  fontVariant?: $ReadOnlyArray<
    | 'small-caps'
    | 'oldstyle-nums'
    | 'lining-nums'
    | 'tabular-nums'
    | 'proportional-nums'
    | 'stylistic-one'
    | 'stylistic-two'
    | 'stylistic-three'
    | 'stylistic-four'
    | 'stylistic-five'
    | 'stylistic-six'
    | 'stylistic-seven'
    | 'stylistic-eight'
    | 'stylistic-nine'
    | 'stylistic-ten'
    | 'stylistic-eleven'
    | 'stylistic-twelve'
    | 'stylistic-thirteen'
    | 'stylistic-fourteen'
    | 'stylistic-fifteen'
    | 'stylistic-sixteen'
    | 'stylistic-seventeen'
    | 'stylistic-eighteen'
    | 'stylistic-nineteen'
    | 'stylistic-twenty',
  >,
  fontWeight?: string | number,
  height?: string | number,
  includeFontPadding?: string | number,
  justifyContent?: string | number,
  left?: string | number,
  letterSpacing?: number,
  lineHeight?: number,
  margin?: string | number,
  marginBottom?: string | number,
  marginHorizontal?: string | number,
  marginLeft?: string | number,
  marginRight?: string | number,
  marginTop?: string | number,
  marginVertical?: string | number,
  maxHeight?: string | number,
  maxWidth?: string | number,
  minHeight?: string | number,
  minWidth?: string | number,
  opacity?: string | number,
  overflow?: 'visible' | 'hidden' | 'scroll',
  overlayColor?: string,
  padding?: string | number,
  paddingBottom?: string | number,
  paddingEnd?: string | number,
  paddingHorizontal?: string | number,
  paddingLeft?: string | number,
  paddingRight?: string | number,
  paddingStart?: string | number,
  paddingTop?: string | number,
  paddingVertical?: string | number,
  position?: string | number,
  resizeMode?: 'contain' | 'cover' | 'stretch' | 'center' | 'repeat',
  right?: string | number,
  rotation?: string | number,
  scaleX?: number,
  scaleY?: number,
  shadowColor?: string | number,
  shadowOffset?: $FlowFixMe,
  shadowOpacity?: number,
  shadowRadius?: number,
  textAlign?: 'auto' | 'left' | 'right' | 'center' | 'justify',
  textAlignVertical?: 'auto' | 'top' | 'bottom' | 'center',
  includeFontPadding?: boolean,
  textDecorationColor?: string | number,
  textDecorationLine?: string | number,
  textDecorationStyle?: string | number,
  textTransform?: 'none' | 'capitalize' | 'uppercase' | 'lowercase',
  writingDirection?: 'auto' | 'ltr' | 'rtl',
  textShadowColor?: string | number,
  textShadowOffset?: $FlowFixMe,
  textShadowRadius?: number,
  tintColor?: string,
  top?: string | number,
  transform?: $ReadOnlyArray<
    | {| +perspective: number |}
    | {| +rotate: string |}
    | {| +rotateX: string |}
    | {| +rotateY: string |}
    | {| +rotateZ: string |}
    | {| +scale: number |}
    | {| +scaleX: number |}
    | {| +scaleY: number |}
    | {| +translateX: number |}
    | {| +translateY: number |}
    | {|
        +translate: [number, number],
      |}
    | {| +skewX: string |}
    | {| +skewY: string |}
    | {|
        +matrix: $ReadOnlyArray<number>,
      |},
  >,
  transformMatrix?: string | number,
  translateX?: number,
  translateY?: number,
  width?: string | number,
  zIndex?: number,
  ...ZacsStylesheetShorthandExtensions,
}>
