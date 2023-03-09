# Changelog

All notable changes to this project will be documented in this file.

## Unreleased

- NEW: You can now use `zacs:style` on all elements
- NEW: `'.foo, .bar': {}` CSS-only stylesets
- NEW: `border: [1, 'red']` shorthand
- `__zacs_original_name` debug attribute is now placed at the beginning of output elements
- `className={}` is now consistently placed before `style={}`
- stylesheets: overriden properties are stripped on native to save space and silence Hermes warnings
- stylesheets: try to preserve comments in output
- Fix `zacs.styled('UppercaseBuiltin')`, e.g. `'RCTText'`
- Fix unnecessary `require('react-native')` insertions
- Fix broken `zacs.styled({ web: ..., native: zacs.text })`

## 2.0.0 (2023-02-20)

- BREAKING: If you use Flow, you need to upgrade to >=0.199.0
- Officially release `zacs.stylesheet({})`
- Flow typing improvements - `zacs.styled()` now returns correctly typed React component in most cases

## 1.1.0 (2020-10-09)

- You can now declare multiple unconditional styles by passing an array of stylesets/class names
- You can now add extra styles to a ZACS component via `zacs:style={{ attr: value }}` syntax
- Strip ZACS declarations (`const Foo = zacs.foo(...)`) and ZACS import from output code by default. Pass `keepDeclarations: true` in Babel config to revert to previous behavior.
- Fix buggy behavior on `zacs.createXXX` components with both `zacs:inherit` and `zacs:style` props whitelisted
- Improved validation and error messages
- Improved Flow typing (likely to reveal new errors)
- Allow styling namespaced components, e.g. `zacs.style(Modal.Text, style.root)`

## 0.9.3 (2019-09-27)

- Add Flow types

## 0.9.2 (2019-09-27)

- Fix issue with web installation

## 0.9.1 (2019-09-05)

- Initial release of `zacs`
