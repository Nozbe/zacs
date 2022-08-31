// @flow
import type { UnconditionalStyles, ConditionalStylesSpec, LiteralStylesSpec } from './components'

export type Component<T> = React$ComponentType<T>

type GetConditionalProps<ConditionalStyles> = $Partial<$ObjMapConst<ConditionalStyles, ?boolean>>
// TODO: We could get fancy here and get the correct expected type based on style attribute
type GetLiteralProps<LiteralStyles> = $Partial<$ObjMapConst<LiteralStyles, number | string>>

type StyledFnWithConditionalLiteralStyles = <
  OriginalProps,
  ConditionalStyles: {},
  LiteralStyles: {},
>(
  component: Component<OriginalProps>,
  conditionalStyles: ConditionalStyles,
  unconditionalStyles: LiteralStyles,
) => Component<
  $Exact<{
    ...GetConditionalProps<ConditionalStyles>,
    ...$Exact<OriginalProps>,
    ...GetLiteralProps<LiteralStyles>,
  }>,
>

type StyledFnWithConditionalStyles = <OriginalProps, ConditionalStyles: {}, LiteralStyles: {}>(
  component: Component<OriginalProps>,
  conditionalStyles: ConditionalStyles,
) => Component<
  $Exact<{
    ...GetConditionalProps<ConditionalStyles>,
    ...$Exact<OriginalProps>,
  }>,
>

type StyledFnWithLiteralStyles = <OriginalProps, ConditionalStyles: {}, LiteralStyles: {}>(
  component: Component<OriginalProps>,
  conditionalStyles: null,
  unconditionalStyles: LiteralStyles,
) => Component<
  $Exact<{
    ...$Exact<OriginalProps>,
    ...GetLiteralProps<LiteralStyles>,
  }>,
>

type StyledFnEmpty = <OriginalProps, ConditionalStyles: {}, LiteralStyles: {}>(
  component: Component<OriginalProps>,
) => Component<
  $Exact<{
    ...$Exact<OriginalProps>,
  }>,
>

export type ZacsStyledFunction = StyledFnWithConditionalLiteralStyles &
  StyledFnWithConditionalStyles &
  StyledFnEmpty &
  StyledFnWithLiteralStyles
