// @flow
/* eslint-disable no-use-before-define */

import type { ReactNativeStyleAttributeName } from './platform/attributes.native'
import type { CSSPropertyName } from './platform/attributes.web'
import type { ReactNativePredefinedStyle } from './platform/style.native'
import type { WebPredefinedStyle } from './platform/style.web'

// Predefined/unconditional styles (always applying to the component)
export type PredefinedStyle = ReactNativePredefinedStyle | WebPredefinedStyle
export type UnconditionalStyles = PredefinedStyle | PredefinedStyle[]

// Conditional styles (applying to the component only if the prop is truthy)
export type ConditionalStylesSpec = {
  [propNameThatAddsConditionalStyleIfTruthy: string]: PredefinedStyle,
}

// Literal styles (passed from prop to styles unconditionally)
type StyleAttributeName = CSSPropertyName | ReactNativeStyleAttributeName
export type LiteralStylesSpec = { [propName: string]: StyleAttributeName }

// zacs.text / zacs.view
export type WhitelistedPropNames = Array<'ref' | 'zacs:inherit' | 'zacs:style' | string>

export type ZacsViewFunction = (
  unconditionalStyles: ?UnconditionalStyles,
  conditionalStyles: ?ConditionalStylesSpec,
  literalStyles: ?LiteralStylesSpec,
) => React$ComponentType<any> // TODO: Add more concrete types

export type ZacsTextFunction = (
  unconditionalStyles: ?UnconditionalStyles,
  conditionalStyles: ?ConditionalStylesSpec,
  literalStyles: ?LiteralStylesSpec,
) => React$ComponentType<any> // TODO: Add more concrete types

export type ZacsCreateViewFunction = (
  unconditionalStyles: ?UnconditionalStyles,
  conditionalStyles: ?ConditionalStylesSpec,
  literalStyles: ?LiteralStylesSpec,
  whitelistedProps: ?WhitelistedPropNames,
) => React$ComponentType<any> // TODO: Add more concrete types

export type ZacsCreateTextFunction = (
  unconditionalStyles: ?UnconditionalStyles,
  conditionalStyles: ?ConditionalStylesSpec,
  literalStyles: ?LiteralStylesSpec,
  whitelistedProps: ?WhitelistedPropNames,
) => React$ComponentType<any> // TODO: Add more concrete types
