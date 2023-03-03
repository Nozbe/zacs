// @flow

import { createElement, forwardRef } from 'react'
import { pickBy, is, fromPairs, piped, map, toPairs } from 'rambdax'
import classNames from 'classnames'

import type { CreateStyledElement } from './type'

const htmlAttributes = new Set([
  // attributes
  'abbr',
  'accept',
  'acceptCharset',
  'accessKey',
  'action',
  'allowFullScreen',
  'allowTransparency',
  'alt',
  'async',
  'autoComplete',
  'autoFocus',
  'autoPlay',
  'cellPadding',
  'cellSpacing',
  'challenge',
  'charset',
  'checked',
  'cite',
  'cols',
  'colSpan',
  'command',
  'content',
  'contentEditable',
  'contextMenu',
  'controls',
  'coords',
  'crossOrigin',
  'data',
  'dateTime',
  'default',
  'defer',
  'dir',
  'disabled',
  'download',
  'draggable',
  'dropzone',
  'encType',
  'for',
  'form',
  'formAction',
  'formEncType',
  'formMethod',
  'formNoValidate',
  'formTarget',
  'frameBorder',
  'headers',
  'height',
  'hidden',
  'high',
  'href',
  'hrefLang',
  'htmlFor',
  'httpEquiv',
  'icon',
  'id',
  'inputMode',
  'isMap',
  'itemId',
  'itemProp',
  'itemRef',
  'itemScope',
  'itemType',
  'kind',
  'label',
  'lang',
  'list',
  'loop',
  'manifest',
  'max',
  'maxLength',
  'media',
  'mediaGroup',
  'method',
  'min',
  'minLength',
  'multiple',
  'muted',
  'name',
  'noValidate',
  'open',
  'optimum',
  'pattern',
  'ping',
  'placeholder',
  'poster',
  'preload',
  'radioGroup',
  'readOnly',
  'rel',
  'required',
  'role',
  'rows',
  'rowSpan',
  'sandbox',
  'scope',
  'scoped',
  'scrolling',
  'seamless',
  'selected',
  'shape',
  'size',
  'sizes',
  'sortable',
  'span',
  'spellCheck',
  'src',
  'srcDoc',
  'srcSet',
  'start',
  'step',
  'style',
  'tabIndex',
  'target',
  'title',
  'translate',
  'type',
  'typeMustMatch',
  'useMap',
  'value',
  'width',
  'wmode',
  'wrap',
  // handlers
  'onBlur',
  'onChange',
  'onClick',
  'onContextMenu',
  'onCopy',
  'onCut',
  'onDoubleClick',
  'onDrag',
  'onDragEnd',
  'onDragEnter',
  'onDragExit',
  'onDragLeave',
  'onDragOver',
  'onDragStart',
  'onDrop',
  'onFocus',
  'onInput',
  'onKeyDown',
  'onKeyPress',
  'onKeyUp',
  'onMouseDown',
  'onMouseEnter',
  'onMouseLeave',
  'onMouseMove',
  'onMouseOut',
  'onMouseOver',
  'onMouseUp',
  'onPaste',
  'onPointerDown',
  'onPointerEnter',
  'onPointerMove',
  'onPointerUp',
  'onPointerCancel',
  'onPointerOut',
  'onPointerLeave',
  'onScroll',
  'onSubmit',
  'onTouchCancel',
  'onTouchEnd',
  'onTouchMove',
  'onTouchStart',
  'onWheel',
])

const isHtmlAttribute = (key: string): boolean => htmlAttributes.has(key)
const pickHtmlAttributes = pickBy(isHtmlAttribute)
const isHtmlElement = is(String)

export const createStyledElement: CreateStyledElement<any> =
  (element) => (root, factoryClass, factoryStyle) =>
    // $FlowFixMe
    forwardRef((props, ref) => {
      const { children } = props

      const getClassNames = () => {
        if (!factoryClass) {
          return null
        } else if (typeof factoryClass === 'object') {
          return piped(
            factoryClass,
            toPairs,
            map(([propName, className]) => [className, props[propName]]),
            fromPairs,
          )
        }
        return fromPairs(factoryClass(props))
      }

      const attributes = {
        children,
        className: classNames({ [root || '']: true }, getClassNames()),
        ...(isHtmlElement(element) ? pickHtmlAttributes(props) : props),
      }
      const forwardedRef = ref || props.__forwardedRef

      if (props.style) {
        attributes.style = props.style
      }

      if (factoryStyle) {
        const { style } = attributes

        const getExtraStyles = () => {
          if (!factoryStyle) {
            return null
          } else if (typeof factoryStyle === 'object') {
            return piped(
              factoryStyle,
              toPairs,
              map(([propName, attr]) => [attr, props[propName]]),
              fromPairs,
            )
          }

          return factoryStyle(props)
        }

        attributes.style = {
          ...style,
          ...getExtraStyles(),
        }
      }

      if (forwardedRef) {
        attributes[isHtmlElement(element) ? 'ref' : '__forwardedRef'] = forwardedRef
      }

      return createElement(element, attributes)
    })
