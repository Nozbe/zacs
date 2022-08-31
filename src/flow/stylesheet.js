// @flow

import type { ReactNativeBasicStylesheet } from './platform/stylesheet.native'
import type { CSSBasicStylesheet } from './platform/stylesheet.web'

type BasicStylesheet = $ReadOnly<$Exact<{ ...CSSBasicStylesheet, ...ReactNativeBasicStylesheet }>>

type ZacsStylesheetMixin = BasicStylesheet

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

export type ZacsStylesheet = $Exact<{
  [string]: ZacsStylesheetStyleset,
  css?: string,
}>

// TODO: Fix return type
export type ZacsStylesheetFunction = ZacsStylesheet => $Exact<{ [string]: string }>

export type CSSStringTemplateTag = (_strings: string[], ..._exprs: Array<any>) => string
