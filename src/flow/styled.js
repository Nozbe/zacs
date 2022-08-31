// @flow
import type { UnconditionalStyles, ConditionalStylesSpec, LiteralStylesSpec } from './components'

export type Component<T> = React$ComponentType<T>

type GetConditionalProps<ConditionalStyles> = $Partial<$ObjMapConst<ConditionalStyles, ?boolean>>
// TODO: We could get fancy here and get the correct expected type based on style attribute
type GetLiteralProps<LiteralStyles> = $Partial<$ObjMapConst<LiteralStyles, number | string>>

type StyledFnWithConditionalLiteralStyles = <
  OriginalProps,
  ConditionalStyles: ConditionalStylesSpec,
  LiteralStyles: LiteralStylesSpec,
>(
  component: Component<OriginalProps>,
  unconditionalStyles: ?UnconditionalStyles,
  conditionalStyles: ConditionalStyles,
  literalStyles: LiteralStyles,
) => Component<
  $Exact<{
    ...GetConditionalProps<ConditionalStyles>,
    ...$Exact<OriginalProps>,
    ...GetLiteralProps<LiteralStyles>,
  }>,
>

type StyledFnWithConditionalStyles = <
  OriginalProps,
  ConditionalStyles: ConditionalStylesSpec,
  LiteralStyles: LiteralStylesSpec,
>(
  component: Component<OriginalProps>,
  unconditionalStyles: ?UnconditionalStyles,
  conditionalStyles: ConditionalStyles,
) => Component<
  $Exact<{
    ...GetConditionalProps<ConditionalStyles>,
    ...$Exact<OriginalProps>,
  }>,
>

type StyledFnWithLiteralStyles = <
  OriginalProps,
  ConditionalStyles: ConditionalStylesSpec,
  LiteralStyles: LiteralStylesSpec,
>(
  component: Component<OriginalProps>,
  unconditionalStyles: ?UnconditionalStyles,
  conditionalStyles: null,
  literalStyles: LiteralStyles,
) => Component<
  $Exact<{
    ...$Exact<OriginalProps>,
    ...GetLiteralProps<LiteralStyles>,
  }>,
>

type StyledFnEmpty = <
  OriginalProps,
  ConditionalStyles: ConditionalStylesSpec,
  LiteralStyles: LiteralStylesSpec,
>(
  component: Component<OriginalProps>,
  unconditionalStyles?: ?UnconditionalStyles,
) => Component<
  $Exact<{
    ...$Exact<OriginalProps>,
  }>,
>

export type ZacsStyledFunction = StyledFnWithConditionalLiteralStyles &
  StyledFnWithConditionalStyles &
  StyledFnEmpty &
  StyledFnWithLiteralStyles
