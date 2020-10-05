# Changelog

All notable changes to this project will be documented in this file.

## Unreleased

- You can now declare multiple unconditional styles by passing an array of stylesets/class names
- You can now add extra styles to a ZACS component via `zacs:style={{ attr: value }}` syntax
- Strip ZACS declarations (`const Foo = zacs.foo(...)`) from output code by default. Pass `keepDeclarations: true` in Babel config to revert to previous behavior

## 0.9.3 (2019-09-27)

- Add Flow types

## 0.9.2 (2019-09-27)

- Fix issue with web installation

## 0.9.1 (2019-09-05)

- Initial release of `zacs`
