import * as zacs from '@nozbe/zacs'

export const ExportedView = zacs.createView()

export const ExportedText = zacs.createText(style.text)

export const ExportedButton = zacs.createStyled(
  Button,
  style.button,
  { isHighlighted: style.highlighted },
  { color: 'backgroundColor' },
)

export const ExportedLabel = zacs.createText(style.label, null, null, ['title', 'numberOfLines'])

export const ExportedWrapper = zacs.createView(style.wrapper, null, null, ['ref'])

export const ExportedStylable = zacs.createText(
  style.text,
  { isBold: style.bold },
  { color: 'color' },
  ['zacs:inherit'],
)

export const ExportedStylable2 = zacs.createText(
  style.text,
  { isBold: style.bold },
  { color: 'color' },
  ['zacs:inherit', 'zacs:style'],
)

export const ExportedCombo = zacs.createStyled(
  { native: Native.Combo, web: WebCombo },
  style.combo,
  { isFoo: style.foo, isBar: style.bar },
  { color: 'color', height: 'height' },
  ['comboProp1', 'comboProp2', 'zacs:inherit', 'ref'],
)

// Make sure nothing breaks if I use created component in the same file

const combo = <ExportedCombo isFoo={true} />
