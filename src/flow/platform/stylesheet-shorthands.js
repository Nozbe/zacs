// @flow

type size = number | string
export type ZacsStylesheetShorthandExtensions = $Exact<{
  margin?: size | [size] | [size, size] | [size, size, size] | [size, size, size, size],
  padding?: size | [size] | [size, size] | [size, size, size] | [size, size, size, size],
  inset?: size | [size] | [size, size] | [size, size, size] | [size, size, size, size],
  border?: number | string | [size, string, string],
}>
