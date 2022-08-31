// @flow

export type CSSBasicStylesheet = $Exact<{
  // List from https://github.com/frenic/csstype
  alignContent?: string | number,
  alignItems?: string | number,
  alignSelf?: string | number,
  animationDelay?: string | number,
  animationDirection?: string | number,
  animationDuration?: string | number,
  animationFillMode?: string | number,
  animationIterationCount?: string | number,
  animationName?: string | number,
  animationPlayState?: string | number,
  animationTimingFunction?: string | number,
  appearance?: string | number,
  backdropFilter?: string | number,
  backfaceVisibility?: string | number,
  backgroundAttachment?: string | number,
  backgroundBlendMode?: string | number,
  backgroundClip?: string | number,
  backgroundColor?: string | number,
  backgroundImage?: string | number,
  backgroundOrigin?: string | number,
  backgroundPosition?: string | number,
  backgroundPositionX?: string | number,
  backgroundPositionY?: string | number,
  backgroundRepeat?: string | number,
  backgroundSize?: string | number,
  blockOverflow?: string | number,
  blockSize?: string | number,
  borderBlockColor?: string | number,
  borderBlockEndColor?: string | number,
  borderBlockEndStyle?: string | number,
  borderBlockEndWidth?: string | number,
  borderBlockStartColor?: string | number,
  borderBlockStartStyle?: string | number,
  borderBlockStartWidth?: string | number,
  borderBlockStyle?: string | number,
  borderBlockWidth?: string | number,
  borderBottomColor?: string | number,
  borderBottomLeftRadius?: string | number,
  borderBottomRightRadius?: string | number,
  borderBottomStyle?: string | number,
  borderBottomWidth?: string | number,
  borderCollapse?: string | number,
  borderEndEndRadius?: string | number,
  borderEndStartRadius?: string | number,
  borderImageOutset?: string | number,
  borderImageRepeat?: string | number,
  borderImageSlice?: string | number,
  borderImageSource?: string | number,
  borderImageWidth?: string | number,
  borderInlineColor?: string | number,
  borderInlineEndColor?: string | number,
  borderInlineEndStyle?: string | number,
  borderInlineEndWidth?: string | number,
  borderInlineStartColor?: string | number,
  borderInlineStartStyle?: string | number,
  borderInlineStartWidth?: string | number,
  borderInlineStyle?: string | number,
  borderInlineWidth?: string | number,
  borderLeftColor?: string | number,
  borderLeftStyle?: string | number,
  borderLeftWidth?: string | number,
  borderRightColor?: string | number,
  borderRightStyle?: string | number,
  borderRightWidth?: string | number,
  borderSpacing?: string | number,
  borderStartEndRadius?: string | number,
  borderStartStartRadius?: string | number,
  borderTopColor?: string | number,
  borderTopLeftRadius?: string | number,
  borderTopRightRadius?: string | number,
  borderTopStyle?: string | number,
  borderTopWidth?: string | number,
  bottom?: string | number,
  boxDecorationBreak?: string | number,
  boxShadow?: string | number,
  boxSizing?: string | number,
  breakAfter?: string | number,
  breakBefore?: string | number,
  breakInside?: string | number,
  captionSide?: string | number,
  caretColor?: string | number,
  clear?: string | number,
  clipPath?: string | number,
  color?: string | number,
  colorAdjust?: string | number,
  columnCount?: string | number,
  columnFill?: string | number,
  columnGap?: string | number,
  columnRuleColor?: string | number,
  columnRuleStyle?: string | number,
  columnRuleWidth?: string | number,
  columnSpan?: string | number,
  columnWidth?: string | number,
  contain?: string | number,
  content?: string | number,
  contentVisibility?: string,
  counterIncrement?: string | number,
  counterReset?: string | number,
  counterSet?: string | number,
  cursor?: string | number,
  direction?: string | number,
  display?: string | number,
  emptyCells?: string | number,
  filter?: string | number,
  flexBasis?: string | number,
  flexDirection?: string | number,
  flexGrow?: string | number,
  flexShrink?: string | number,
  flexWrap?: string | number,
  float?: string | number,
  fontFamily?: string | number,
  fontFeatureSettings?: string | number,
  fontKerning?: string | number,
  fontLanguageOverride?: string | number,
  fontOpticalSizing?: string | number,
  fontSize?: string | number,
  fontSizeAdjust?: string | number,
  fontStretch?: string | number,
  fontStyle?: string | number,
  fontSynthesis?: string | number,
  fontVariant?: string | number,
  fontVariantCaps?: string | number,
  fontVariantEastAsian?: string | number,
  fontVariantLigatures?: string | number,
  fontVariantNumeric?: string | number,
  fontVariantPosition?: string | number,
  fontVariationSettings?: string | number,
  fontWeight?: string | number,
  gridAutoColumns?: string | number,
  gridAutoFlow?: string | number,
  gridAutoRows?: string | number,
  gridColumnEnd?: string | number,
  gridColumnStart?: string | number,
  gridRowEnd?: string | number,
  gridRowStart?: string | number,
  gridTemplateAreas?: string | number,
  gridTemplateColumns?: string | number,
  gridTemplateRows?: string | number,
  hangingPunctuation?: string | number,
  height?: string | number,
  hyphens?: string | number,
  imageOrientation?: string | number,
  imageRendering?: string | number,
  imageResolution?: string | number,
  initialLetter?: string | number,
  inlineSize?: string | number,
  inset?: string | number,
  insetBlock?: string | number,
  insetBlockEnd?: string | number,
  insetBlockStart?: string | number,
  insetInline?: string | number,
  insetInlineEnd?: string | number,
  insetInlineStart?: string | number,
  isolation?: string | number,
  justifyContent?: string | number,
  justifyItems?: string | number,
  justifySelf?: string | number,
  left?: string | number,
  letterSpacing?: string | number,
  lineBreak?: string | number,
  lineHeight?: string | number,
  lineHeightStep?: string | number,
  listStyleImage?: string | number,
  listStylePosition?: string | number,
  listStyleType?: string | number,
  marginBlock?: string | number,
  marginBlockEnd?: string | number,
  marginBlockStart?: string | number,
  marginBottom?: string | number,
  marginInline?: string | number,
  marginInlineEnd?: string | number,
  marginInlineStart?: string | number,
  marginLeft?: string | number,
  marginRight?: string | number,
  marginTop?: string | number,
  maskBorderMode?: string | number,
  maskBorderOutset?: string | number,
  maskBorderRepeat?: string | number,
  maskBorderSlice?: string | number,
  maskBorderSource?: string | number,
  maskBorderWidth?: string | number,
  maskClip?: string | number,
  maskComposite?: string | number,
  maskImage?: string | number,
  maskMode?: string | number,
  maskOrigin?: string | number,
  maskPosition?: string | number,
  maskRepeat?: string | number,
  maskSize?: string | number,
  maskType?: string | number,
  maxBlockSize?: string | number,
  maxHeight?: string | number,
  maxInlineSize?: string | number,
  maxLines?: string | number,
  maxWidth?: string | number,
  minBlockSize?: string | number,
  minHeight?: string | number,
  minInlineSize?: string | number,
  minWidth?: string | number,
  mixBlendMode?: string | number,
  motionDistance?: string | number,
  motionPath?: string | number,
  motionRotation?: string | number,
  objectFit?: string | number,
  objectPosition?: string | number,
  offsetAnchor?: string | number,
  offsetDistance?: string | number,
  offsetPath?: string | number,
  offsetPosition?: string | number,
  offsetRotate?: string | number,
  offsetRotation?: string | number,
  opacity?: string | number,
  order?: string | number,
  orphans?: string | number,
  outlineColor?: string | number,
  outlineOffset?: string | number,
  outlineStyle?: string | number,
  outlineWidth?: string | number,
  overflow?: string | number,
  overflowAnchor?: string | number,
  overflowBlock?: string | number,
  overflowClipBox?: string | number,
  overflowInline?: string | number,
  overflowWrap?: string | number,
  overflowX?: string | number,
  overflowY?: string | number,
  overscrollBehavior?: string | number,
  overscrollBehaviorX?: string | number,
  overscrollBehaviorY?: string | number,
  paddingBlock?: string | number,
  paddingBlockEnd?: string | number,
  paddingBlockStart?: string | number,
  paddingBottom?: string | number,
  paddingInline?: string | number,
  paddingInlineEnd?: string | number,
  paddingInlineStart?: string | number,
  paddingLeft?: string | number,
  paddingRight?: string | number,
  paddingTop?: string | number,
  pageBreakAfter?: string | number,
  pageBreakBefore?: string | number,
  pageBreakInside?: string | number,
  paintOrder?: string | number,
  perspective?: string | number,
  perspectiveOrigin?: string | number,
  placeContent?: string | number,
  pointerEvents?: string | number,
  position?: string | number,
  quotes?: string | number,
  resize?: string | number,
  right?: string | number,
  rotate?: string | number,
  rowGap?: string | number,
  rubyAlign?: string | number,
  rubyMerge?: string | number,
  rubyPosition?: string | number,
  scale?: string | number,
  scrollBehavior?: string | number,
  scrollMargin?: string | number,
  scrollMarginBlock?: string | number,
  scrollMarginBlockEnd?: string | number,
  scrollMarginBlockStart?: string | number,
  scrollMarginBottom?: string | number,
  scrollMarginInline?: string | number,
  scrollMarginInlineEnd?: string | number,
  scrollMarginInlineStart?: string | number,
  scrollMarginLeft?: string | number,
  scrollMarginRight?: string | number,
  scrollMarginTop?: string | number,
  scrollPadding?: string | number,
  scrollPaddingBlock?: string | number,
  scrollPaddingBlockEnd?: string | number,
  scrollPaddingBlockStart?: string | number,
  scrollPaddingBottom?: string | number,
  scrollPaddingInline?: string | number,
  scrollPaddingInlineEnd?: string | number,
  scrollPaddingInlineStart?: string | number,
  scrollPaddingLeft?: string | number,
  scrollPaddingRight?: string | number,
  scrollPaddingTop?: string | number,
  scrollSnapAlign?: string | number,
  scrollSnapStop?: string | number,
  scrollSnapType?: string | number,
  scrollbarColor?: string | number,
  scrollbarWidth?: string | number,
  shapeImageThreshold?: string | number,
  shapeMargin?: string | number,
  shapeOutside?: string | number,
  tabSize?: string | number,
  tableLayout?: string | number,
  textAlign?: string | number,
  textAlignLast?: string | number,
  textCombineUpright?: string | number,
  textDecorationColor?: string | number,
  textDecorationLine?: string | number,
  textDecorationSkip?: string | number,
  textDecorationSkipInk?: string | number,
  textDecorationStyle?: string | number,
  textEmphasisColor?: string | number,
  textEmphasisPosition?: string | number,
  textEmphasisStyle?: string | number,
  textIndent?: string | number,
  textJustify?: string | number,
  textOrientation?: string | number,
  textOverflow?: string | number,
  textRendering?: string | number,
  textShadow?: string | number,
  textSizeAdjust?: string | number,
  textTransform?: string | number,
  textUnderlinePosition?: string | number,
  top?: string | number,
  touchAction?: string | number,
  transform?: string | number,
  transformBox?: string | number,
  transformOrigin?: string | number,
  transformStyle?: string | number,
  transitionDelay?: string | number,
  transitionDuration?: string | number,
  transitionProperty?: string | number,
  transitionTimingFunction?: string | number,
  translate?: string | number,
  unicodeBidi?: string | number,
  userSelect?: string | number,
  verticalAlign?: string | number,
  visibility?: string | number,
  whiteSpace?: string | number,
  widows?: string | number,
  width?: string | number,
  willChange?: string | number,
  wordBreak?: string | number,
  wordSpacing?: string | number,
  wordWrap?: string | number,
  writingMode?: string | number,
  zIndex?: string | number,
  zoom?: string | number,
  all?: string | number,
  animation?: string | number,
  background?: string | number,
  border?: string | number,
  borderBlock?: string | number,
  borderBlockEnd?: string | number,
  borderBlockStart?: string | number,
  borderBottom?: string | number,
  borderColor?: string | number,
  borderImage?: string | number,
  borderInline?: string | number,
  borderInlineEnd?: string | number,
  borderInlineStart?: string | number,
  borderLeft?: string | number,
  borderRadius?: string | number,
  borderRight?: string | number,
  borderStyle?: string | number,
  borderTop?: string | number,
  borderWidth?: string | number,
  columnRule?: string | number,
  columns?: string | number,
  flex?: string | number,
  flexFlow?: string | number,
  font?: string | number,
  gap?: string | number,
  grid?: string | number,
  gridArea?: string | number,
  gridColumn?: string | number,
  gridRow?: string | number,
  gridTemplate?: string | number,
  lineClamp?: string | number,
  listStyle?: string | number,
  margin?: string | number,
  mask?: string | number,
  maskBorder?: string | number,
  motion?: string | number,
  offset?: string | number,
  outline?: string | number,
  padding?: string | number,
  placeItems?: string | number,
  placeSelf?: string | number,
  textDecoration?: string | number,
  textEmphasis?: string | number,
  transition?: string | number,
  MozAnimationDelay?: string | number,
  MozAnimationDirection?: string | number,
  MozAnimationDuration?: string | number,
  MozAnimationFillMode?: string | number,
  MozAnimationIterationCount?: string | number,
  MozAnimationName?: string | number,
  MozAnimationPlayState?: string | number,
  MozAnimationTimingFunction?: string | number,
  MozAppearance?: string | number,
  MozBackfaceVisibility?: string | number,
  MozBorderBottomColors?: string | number,
  MozBorderEndColor?: string | number,
  MozBorderEndStyle?: string | number,
  MozBorderEndWidth?: string | number,
  MozBorderLeftColors?: string | number,
  MozBorderRightColors?: string | number,
  MozBorderStartColor?: string | number,
  MozBorderStartStyle?: string | number,
  MozBorderTopColors?: string | number,
  MozBoxSizing?: string | number,
  MozColumnCount?: string | number,
  MozColumnFill?: string | number,
  MozColumnGap?: string | number,
  MozColumnRuleColor?: string | number,
  MozColumnRuleStyle?: string | number,
  MozColumnRuleWidth?: string | number,
  MozColumnWidth?: string | number,
  MozContextProperties?: string | number,
  MozFloatEdge?: string | number,
  MozFontFeatureSettings?: string | number,
  MozFontLanguageOverride?: string | number,
  MozForceBrokenImageIcon?: string | number,
  MozHyphens?: string | number,
  MozImageRegion?: string | number,
  MozMarginEnd?: string | number,
  MozMarginStart?: string | number,
  MozOrient?: string | number,
  MozOutlineRadiusBottomleft?: string | number,
  MozOutlineRadiusBottomright?: string | number,
  MozOutlineRadiusTopleft?: string | number,
  MozOutlineRadiusTopright?: string | number,
  MozPaddingEnd?: string | number,
  MozPaddingStart?: string | number,
  MozPerspective?: string | number,
  MozPerspectiveOrigin?: string | number,
  MozStackSizing?: string | number,
  MozTabSize?: string | number,
  MozTextSizeAdjust?: string | number,
  MozTransformOrigin?: string | number,
  MozTransformStyle?: string | number,
  MozTransitionDelay?: string | number,
  MozTransitionDuration?: string | number,
  MozTransitionProperty?: string | number,
  MozTransitionTimingFunction?: string | number,
  MozUserFocus?: string | number,
  MozUserModify?: string | number,
  MozUserSelect?: string | number,
  MozWindowDragging?: string | number,
  msAccelerator?: string | number,
  msAlignSelf?: string | number,
  msBlockProgression?: string | number,
  msContentZoomChaining?: string | number,
  msContentZoomLimitMax?: string | number,
  msContentZoomLimitMin?: string | number,
  msContentZoomSnapPoints?: string | number,
  msContentZoomSnapType?: string | number,
  msContentZooming?: string | number,
  msFilter?: string | number,
  msFlexDirection?: string | number,
  msFlexPositive?: string | number,
  msFlowFrom?: string | number,
  msFlowInto?: string | number,
  msGridColumns?: string | number,
  msGridRows?: string | number,
  msHighContrastAdjust?: string | number,
  msHyphenateLimitChars?: string | number,
  msHyphenateLimitLines?: string | number,
  msHyphenateLimitZone?: string | number,
  msHyphens?: string | number,
  msImeAlign?: string | number,
  msLineBreak?: string | number,
  msOrder?: string | number,
  msOverflowStyle?: string | number,
  msOverflowX?: string | number,
  msOverflowY?: string | number,
  msScrollChaining?: string | number,
  msScrollLimitXMax?: string | number,
  msScrollLimitXMin?: string | number,
  msScrollLimitYMax?: string | number,
  msScrollLimitYMin?: string | number,
  msScrollRails?: string | number,
  msScrollSnapPointsX?: string | number,
  msScrollSnapPointsY?: string | number,
  msScrollSnapType?: string | number,
  msScrollTranslation?: string | number,
  msScrollbar3dlightColor?: string | number,
  msScrollbarArrowColor?: string | number,
  msScrollbarBaseColor?: string | number,
  msScrollbarDarkshadowColor?: string | number,
  msScrollbarFaceColor?: string | number,
  msScrollbarHighlightColor?: string | number,
  msScrollbarShadowColor?: string | number,
  msScrollbarTrackColor?: string | number,
  msTextAutospace?: string | number,
  msTextCombineHorizontal?: string | number,
  msTextOverflow?: string | number,
  msTouchAction?: string | number,
  msTouchSelect?: string | number,
  msTransform?: string | number,
  msTransformOrigin?: string | number,
  msTransitionDelay?: string | number,
  msTransitionDuration?: string | number,
  msTransitionProperty?: string | number,
  msTransitionTimingFunction?: string | number,
  msUserSelect?: string | number,
  msWordBreak?: string | number,
  msWrapFlow?: string | number,
  msWrapMargin?: string | number,
  msWrapThrough?: string | number,
  msWritingMode?: string | number,
  OObjectFit?: string | number,
  OObjectPosition?: string | number,
  OTabSize?: string | number,
  OTextOverflow?: string | number,
  OTransformOrigin?: string | number,
  WebkitAlignContent?: string | number,
  WebkitAlignItems?: string | number,
  WebkitAlignSelf?: string | number,
  WebkitAnimationDelay?: string | number,
  WebkitAnimationDirection?: string | number,
  WebkitAnimationDuration?: string | number,
  WebkitAnimationFillMode?: string | number,
  WebkitAnimationIterationCount?: string | number,
  WebkitAnimationName?: string | number,
  WebkitAnimationPlayState?: string | number,
  WebkitAnimationTimingFunction?: string | number,
  WebkitAppearance?: string | number,
  WebkitBackdropFilter?: string | number,
  WebkitBackfaceVisibility?: string | number,
  WebkitBackgroundClip?: string | number,
  WebkitBackgroundOrigin?: string | number,
  WebkitBackgroundSize?: string | number,
  WebkitBorderBeforeColor?: string | number,
  WebkitBorderBeforeStyle?: string | number,
  WebkitBorderBeforeWidth?: string | number,
  WebkitBorderBottomLeftRadius?: string | number,
  WebkitBorderBottomRightRadius?: string | number,
  WebkitBorderImageSlice?: string | number,
  WebkitBorderTopLeftRadius?: string | number,
  WebkitBorderTopRightRadius?: string | number,
  WebkitBoxDecorationBreak?: string | number,
  WebkitBoxReflect?: string | number,
  WebkitBoxShadow?: string | number,
  WebkitBoxSizing?: string | number,
  WebkitClipPath?: string | number,
  WebkitColorAdjust?: string | number,
  WebkitColumnCount?: string | number,
  WebkitColumnFill?: string | number,
  WebkitColumnGap?: string | number,
  WebkitColumnRuleColor?: string | number,
  WebkitColumnRuleStyle?: string | number,
  WebkitColumnRuleWidth?: string | number,
  WebkitColumnSpan?: string | number,
  WebkitColumnWidth?: string | number,
  WebkitFilter?: string | number,
  WebkitFlexBasis?: string | number,
  WebkitFlexDirection?: string | number,
  WebkitFlexGrow?: string | number,
  WebkitFlexShrink?: string | number,
  WebkitFlexWrap?: string | number,
  WebkitFontFeatureSettings?: string | number,
  WebkitFontKerning?: string | number,
  WebkitFontVariantLigatures?: string | number,
  WebkitHyphens?: string | number,
  WebkitJustifyContent?: string | number,
  WebkitLineBreak?: string | number,
  WebkitLineClamp?: string | number,
  WebkitMarginEnd?: string | number,
  WebkitMarginStart?: string | number,
  WebkitMaskAttachment?: string | number,
  WebkitMaskClip?: string | number,
  WebkitMaskComposite?: string | number,
  WebkitMaskImage?: string | number,
  WebkitMaskOrigin?: string | number,
  WebkitMaskPosition?: string | number,
  WebkitMaskPositionX?: string | number,
  WebkitMaskPositionY?: string | number,
  WebkitMaskRepeat?: string | number,
  WebkitMaskRepeatX?: string | number,
  WebkitMaskRepeatY?: string | number,
  WebkitMaskSize?: string | number,
  WebkitMaxInlineSize?: string | number,
  WebkitOrder?: string | number,
  WebkitOverflowScrolling?: string | number,
  WebkitPaddingEnd?: string | number,
  WebkitPaddingStart?: string | number,
  WebkitPerspective?: string | number,
  WebkitPerspectiveOrigin?: string | number,
  WebkitScrollSnapType?: string | number,
  WebkitShapeMargin?: string | number,
  WebkitTapHighlightColor?: string | number,
  WebkitTextCombine?: string | number,
  WebkitTextDecorationColor?: string | number,
  WebkitTextDecorationLine?: string | number,
  WebkitTextDecorationSkip?: string | number,
  WebkitTextDecorationStyle?: string | number,
  WebkitTextEmphasisColor?: string | number,
  WebkitTextEmphasisPosition?: string | number,
  WebkitTextEmphasisStyle?: string | number,
  WebkitTextFillColor?: string | number,
  WebkitTextOrientation?: string | number,
  WebkitTextSizeAdjust?: string | number,
  WebkitTextStrokeColor?: string | number,
  WebkitTextStrokeWidth?: string | number,
  WebkitTouchCallout?: string | number,
  WebkitTransform?: string | number,
  WebkitTransformOrigin?: string | number,
  WebkitTransformStyle?: string | number,
  WebkitTransitionDelay?: string | number,
  WebkitTransitionDuration?: string | number,
  WebkitTransitionProperty?: string | number,
  WebkitTransitionTimingFunction?: string | number,
  WebkitUserModify?: string | number,
  WebkitUserSelect?: string | number,
  WebkitWritingMode?: string | number,
  MozAnimation?: string | number,
  MozBorderImage?: string | number,
  MozColumnRule?: string | number,
  MozColumns?: string | number,
  MozTransition?: string | number,
  msContentZoomLimit?: string | number,
  msContentZoomSnap?: string | number,
  msFlex?: string | number,
  msScrollLimit?: string | number,
  msScrollSnapX?: string | number,
  msScrollSnapY?: string | number,
  msTransition?: string | number,
  WebkitAnimation?: string | number,
  WebkitBorderBefore?: string | number,
  WebkitBorderImage?: string | number,
  WebkitBorderRadius?: string | number,
  WebkitColumnRule?: string | number,
  WebkitColumns?: string | number,
  WebkitFlex?: string | number,
  WebkitFlexFlow?: string | number,
  WebkitMask?: string | number,
  WebkitTextEmphasis?: string | number,
  WebkitTextStroke?: string | number,
  WebkitTransition?: string | number,
}>
