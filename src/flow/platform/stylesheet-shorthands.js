// @flow

type size = number | string
type ZacsInsets = size | [size] | [size, size] | [size, size, size] | [size, size, size, size]
type ZacsBorder = number | string | [size, string] | [size, string, string]
export type ZacsStylesheetShorthandExtensions = $Exact<{
  margin?: ZacsInsets,
  padding?: ZacsInsets,
  inset?: ZacsInsets,
  border?: ZacsBorder,
  borderTop?: ZacsBorder,
  borderRight?: ZacsBorder,
  borderBottom?: ZacsBorder,
  borderLeft?: ZacsBorder,
}>
