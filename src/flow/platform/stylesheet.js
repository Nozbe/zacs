// @flow
import type { ReactNativeBasicStylesheet } from './stylesheet-native'
import type { CSSBasicStylesheet } from './stylesheet-web'

export type BasicStylesheet = $ReadOnly<
  $Exact<{ ...CSSBasicStylesheet, ...ReactNativeBasicStylesheet }>,
>
export type { ReactNativeBasicStylesheet, CSSBasicStylesheet }
