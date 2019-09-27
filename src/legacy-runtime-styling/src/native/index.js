// @flow

import { View, Text, Button, ScrollView, TouchableOpacity } from 'react-native'
import { createStyledElement } from './utils'

export default createStyledElement
export const view = createStyledElement(View)
export const text = createStyledElement(Text)
export const button = createStyledElement(Button)
export const scrollView = createStyledElement(ScrollView)
export const touchableOpacity = createStyledElement(TouchableOpacity)
