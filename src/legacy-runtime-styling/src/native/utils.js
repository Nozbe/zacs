// @flow

import { Component, forwardRef, createElement } from 'react'
import { filter, toPairs, piped, fromPairs, map } from 'rambdax'

import type { CreateStyledElement } from './type'

const isObject: <T>(T) => boolean = (maybeObject) =>
  maybeObject !== null && typeof maybeObject === 'object' && !Array.isArray(maybeObject)

type CreateStyle = Function

const isBuiltInComponent = (component) =>
  typeof component !== 'function' &&
  (component.displayName === 'View' || component.displayName === 'Text')

const createClassComponent = <A: *>(
  element: React$ElementType,
  createStyle: CreateStyle,
): React$AbstractComponent<A, *> => {
  class StyledNativeComponent extends Component<A> {
    props: A

    _style: {}

    _component: React$StatelessFunctionalComponent<any>

    setNativeProps = (nativeProps) => {
      // $FlowFixMe
      this._component.setNativeProps(nativeProps)
    }

    render(): React$Element<*> {
      const attributes = {
        ...this.props,
        style: createStyle(this.props),
      }

      if (isBuiltInComponent(element)) {
        attributes.ref = (node) => {
          this._component = node
        }
      } else if (this.props.__forwardedRef) {
        attributes.ref = this.props.__forwardedRef
      }

      return createElement(element, attributes)
    }
  }

  return !isBuiltInComponent(element)
    ? forwardRef((props, ref) =>
        createElement(StyledNativeComponent, { ...props, __forwardedRef: ref }),
      )
    : StyledNativeComponent
}

const getAddedStyles = (styleSelector, props) =>
  typeof styleSelector === 'function'
    ? styleSelector(props)
        .filter(([, flag]) => flag)
        .map(([styles]) => styles)
    : toPairs(styleSelector)
        .filter(([propName]) => props[propName])
        .map(([, style]) => style)

const getAddedAttributes = (addAttributes, props) =>
  typeof addAttributes === 'function'
    ? filter((value) => !!value || value === 0, addAttributes(props))
    : piped(
        addAttributes,
        toPairs,
        map(([propName, attr]) => [attr, props[propName]]),
        filter(([, value]) => !!value || value === 0),
        fromPairs,
      )

const getStylesFromProps = (maybeStyles) =>
  isObject(maybeStyles) ? [maybeStyles] : maybeStyles || []

const createStyleFactory =
  ({ styleSelector, addAttributes, rootStyle }) =>
  (props) => {
    const extraStyles = styleSelector ? getAddedStyles(styleSelector, props) : []
    const extraAttributes = addAttributes ? getAddedAttributes(addAttributes, props) : {}

    return [rootStyle, ...extraStyles, extraAttributes, ...getStylesFromProps(props.style)]
  }

export const createStyledElement: CreateStyledElement<any> =
  (element) => (rootStyle, styleSelector, addAttributes) => {
    const createStyle = createStyleFactory({ rootStyle, styleSelector, addAttributes })
    // $FlowFixMe
    return createClassComponent(element, createStyle)
  }
