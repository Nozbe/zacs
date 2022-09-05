# TERMINOLOGY

```js
zacs.{view,text,styled}()       // styled declaration
zacs.create{View,Text,Styled}() // styled component

styles.foo                      // predefined styleset
{ foo: 'bar' }                  // literal styleset

zacs.view(
  styles.foo,                   // unconditional styleset (uncond styleset)
  { bar: styles.bar },          // conditional styleset spec (cond styleset)
  { width: 'width' }            // literal style spec
)
```
