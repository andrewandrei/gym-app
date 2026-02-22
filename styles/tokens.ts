// styles/tokens.ts
import { StyleSheet } from "react-native";

import { Radius } from "./radius";

import { Spacing } from "./spacing";

import { Colors } from "./colors";
import { Shadow } from "./shadow";

export const HAIR = StyleSheet.hairlineWidth;

export const Tokens = {
  // Global page padding rhythm
  pageX: Spacing.lg, // 24
  pageTop: Spacing.sm, // 12

  // Header sizing
  headerTopPad: 6,
  headerBottomPad: 12,

  // Buttons
  buttonHeight: 56,
  buttonRadius: Radius.pill,

  // Cards
  cardRadius: Radius.lg,
  cardBorder: Colors.border,
  cardShadow: Shadow.soft,
};