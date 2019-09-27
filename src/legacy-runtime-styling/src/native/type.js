// @flow

export type StyleObject = { [string]: any }
export type FactoryStyleNameLegacy<T> = (props: T) => Array<mixed[]>
export type StyleNameDeclaration<T> = { [propName: $Keys<T>]: StyleObject }
export type FactoryStyleName<T> = FactoryStyleNameLegacy<T> | FactoryStyleName<T>
export type FactoryStyle<T> = { [propName: $Keys<T>]: string } | ((props: T) => StyleObject)
export type StyledElement<A> = React$StatelessFunctionalComponent<{
  ...$Exact<A>,
  style: Array<mixed[]>,
}>

export type StyledComponent<A> = (
  ?StyleObject,
  ?FactoryStyleName<any>,
  ?FactoryStyle<any>,
) => React$StyledComponent<A>

export type CreateStyledElement<A> = React$ElementType => (
  ?StyleObject,
  ?FactoryStyleName<any>,
  ?FactoryStyle<any>,
) => StyledElement<A>

export type StyleClassNameProps = $Exact<{ style?: Array<{ [string]: mixed }>, className?: void }>
