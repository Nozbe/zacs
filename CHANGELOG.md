# Changelog

All notable changes to this project will be documented in this file.

## Unreleased

- Officially release `zacs.stylesheet({})`

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
