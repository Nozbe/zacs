// @flow
import type { PredefinedStyle } from './style'

// NOTE: This file is used when user doesn't have .web.js, .native.js imports configured in flow
export type ZacsStylesheet = { [string]: PredefinedStyle }
