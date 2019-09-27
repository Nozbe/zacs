// @flow

export type ClassName = string
export type TupleClassName = [string, ?boolean]
export type FactoryClassNameLegacy<T> = (props: T) => TupleClassName[]
export type ClassNameDeclaration<T> = { [propName: $Keys<T>]: ClassName }
export type FactoryClassName<T> = ClassNameDeclaration<T> | FactoryClassNameLegacy<T>
export type TupleStyle = [string, ?mixed]
export type StyleObject = {
  [key: string]: ?mixed,
}
export type FactoryStyle<T> = { [propName: $Keys<T>]: string } | ((props: T) => StyleObject)

export type HtmlElement =
  | React$ElementType
  | 'a'
  | 'abbr'
  | 'address'
  | 'area'
  | 'article'
  | 'aside'
  | 'audio'
  | 'b'
  | 'base'
  | 'bdi'
  | 'bdo'
  | 'blockquote'
  | 'body'
  | 'br'
  | 'button'
  | 'canvas'
  | 'caption'
  | 'cite'
  | 'code'
  | 'col'
  | 'colgroup'
  | 'data'
  | 'datalist'
  | 'dd'
  | 'del'
  | 'details'
  | 'dfn'
  | 'dialog'
  | 'div'
  | 'dl'
  | 'dt'
  | 'em'
  | 'embed'
  | 'fieldset'
  | 'figcaption'
  | 'figure'
  | 'footer'
  | 'form'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'head'
  | 'header'
  | 'hr'
  | 'html'
  | 'i'
  | 'iframe'
  | 'img'
  | 'input'
  | 'ins'
  | 'kbd'
  | 'keygen'
  | 'label'
  | 'legend'
  | 'li'
  | 'link'
  | 'main'
  | 'map'
  | 'mark'
  | 'math'
  | 'menu'
  | 'menuitem'
  | 'meta'
  | 'meter'
  | 'nav'
  | 'noscript'
  | 'object'
  | 'ol'
  | 'optgroup'
  | 'option'
  | 'output'
  | 'p'
  | 'param'
  | 'picture'
  | 'pre'
  | 'progress'
  | 'q'
  | 'rb'
  | 'rp'
  | 'rt'
  | 'rtc'
  | 'ruby'
  | 's'
  | 'samp'
  | 'script'
  | 'section'
  | 'select'
  | 'small'
  | 'source'
  | 'span'
  | 'strong'
  | 'style'
  | 'sub'
  | 'summary'
  | 'sup'
  | 'svg'
  | 'table'
  | 'tbody'
  | 'td'
  | 'template'
  | 'textarea'
  | 'tfoot'
  | 'th'
  | 'thead'
  | 'time'
  | 'title'
  | 'tr'
  | 'track'
  | 'u'
  | 'ul'
  | 'var'
  | 'video'
  | 'wbr'

export type StyledElement<A> = React$StatelessFunctionalComponent<{
  ...$Exact<A>,
  style: StyleObject,
  className: ClassName,
}>

export type StyledComponent<A> = (
  ?ClassName,
  ?FactoryClassName<any>,
  ?FactoryStyle<any>,
) => React$StyledComponent<A>

export type CreateStyledElement<A> = HtmlElement => (
  ?ClassName,
  ?FactoryClassName<any>,
  ?FactoryStyle<any>,
) => StyledElement<A>

export type StyleClassNameProps = $Exact<{
  style?: { [string]: mixed },
  className?: string,
}>
