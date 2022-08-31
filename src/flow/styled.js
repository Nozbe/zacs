// @flow
import type {
  UnconditionalStyles,
  ConditionalStylesSpec,
  LiteralStylesSpec,
  WhitelistedPropNames,
} from './components'

export type Component<T> = React$ComponentType<T>

// NOTE: $Partial is ncessary to make the new props optional. $Shape doesn't do what you think it does
// and using { [string]: sth } doesn't work either
type GetConditionalProps<ConditionalStyles> = $Partial<$ObjMapConst<ConditionalStyles, ?boolean>>
// TODO: We could get fancy here and get the correct expected type based on style attribute
type GetLiteralProps<LiteralStyles> = $Partial<$ObjMapConst<LiteralStyles, number | string>>

// NOTE: It's probably possible to use some Flow magic to convert missing or null props to `{}` so that
// we don't have to create a union function type in such an awful way
type StyledFnWithConditionalLiteralStyles = <
  OriginalProps,
  ConditionalStyles: ConditionalStylesSpec,
  LiteralStyles: LiteralStylesSpec,
>(
  component: Component<OriginalProps>,
  unconditionalStyles: ?UnconditionalStyles,
  conditionalStyles: ConditionalStyles,
  literalStyles: LiteralStyles,
  whitelistedProps: ?WhitelistedPropNames,
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
  literalStyles: ?null,
  whitelistedProps: ?WhitelistedPropNames,
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
  whitelistedProps: ?WhitelistedPropNames,
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
  unconditionalStyles: ?UnconditionalStyles,
  conditionalStyles: ?null,
  literalStyles: ?null,
  whitelistedProps: ?WhitelistedPropNames,
) => Component<
  $Exact<{
    ...$Exact<OriginalProps>,
  }>,
>

export type ZacsStyledFunction = StyledFnWithConditionalLiteralStyles &
  StyledFnWithConditionalStyles &
  StyledFnEmpty &
  StyledFnWithLiteralStyles

// NOTE: out of laziness (ahem, for maintainability), we're pretending that zacs.styled also has whitelistedProps argument to share the type definition
export type ZacsCreateStyledFunction = ZacsStyledFunction
