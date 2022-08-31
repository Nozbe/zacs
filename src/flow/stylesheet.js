// @flow

import type { ReactNativeBasicStylesheet } from './platform/stylesheet.native'
import type { CSSBasicStylesheet } from './platform/stylesheet.web'
import type { PredefinedStyle } from './components'

type BasicStylesheet = $ReadOnly<$Exact<{ ...CSSBasicStylesheet, ...ReactNativeBasicStylesheet }>>

type ZacsStylesheetMixin = BasicStylesheet

opaque type ThisPropertyIsUnknown = any

type ZacsStylesheetStylesetWeb = $ReadOnly<{
  ...CSSBasicStylesheet,
  _mixin?: ZacsStylesheetMixin,
  css?: string,
  // web nested
  [string]: ZacsStylesheetStylesetWeb,
}>

type ZacsStylesheetStylesetNative = $ReadOnly<{
  ...ReactNativeBasicStylesheet,
  _mixin?: ZacsStylesheetMixin,
  // HACK: raise error if unknown style property is used
  [string]: ThisPropertyIsUnknown,
}>

type ZacsStylesheetStyleset = $ReadOnly<{
  _mixin?: ZacsStylesheetMixin,
  native?: ZacsStylesheetStylesetNative,
  ios?: ZacsStylesheetStylesetNative,
  android?: ZacsStylesheetStylesetNative,
  web?: ZacsStylesheetStylesetWeb,
  css?: string,
  ...BasicStylesheet,
  // web nested
  [string]: ZacsStylesheetStylesetWeb,
}>

type ZacsStylesheetSpec = $Exact<{
  [string]: ZacsStylesheetStyleset,
  css?: string,
}>

export type ZacsStylesheet = { [string]: PredefinedStyle }

export type ZacsStylesheetFunction = ZacsStylesheetSpec => ZacsStylesheet

export type CSSStringTemplateTag = (_strings: string[], ..._exprs: Array<any>) => string
