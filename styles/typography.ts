// styles/typography.ts
// Single source of truth for all text styles across the app.
// Every screen uses these — never hardcode fontSize/fontWeight directly.

import { StyleSheet } from "react-native";

export const Typography = StyleSheet.create({

  // ── Display ─────────────────────────────────────────────────────────────────
  // Hero greetings, workout start screens
  display: {
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.5,
    lineHeight: 33,
  },

  // ── Titles ───────────────────────────────────────────────────────────────────
  // Screen-level page titles (Progress, History, Program name)
  title1: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.35,
    lineHeight: 27,
  },

  // Section titles inside screens, card headers
  title2: {
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.25,
    lineHeight: 22,
  },

  // Sub-section titles, week labels, exercise names
  title3: {
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: -0.15,
    lineHeight: 20,
  },

  // ── Headline ─────────────────────────────────────────────────────────────────
  // Row titles, session types, card primary text
  headline: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: -0.1,
    lineHeight: 19,
  },

  // ── Body ─────────────────────────────────────────────────────────────────────
  // Descriptions, program overviews, bullet text
  body: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: -0.05,
    lineHeight: 20,
  },

  // Smaller body — notes, secondary descriptions
  bodySmall: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: -0.03,
    lineHeight: 18,
  },

  // ── Subhead ──────────────────────────────────────────────────────────────────
  // Meta info, dates, labels in rows
  subhead: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: -0.03,
    lineHeight: 17,
  },

  // ── Caption ──────────────────────────────────────────────────────────────────
  // Dates, counts, hints, secondary labels
  caption: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0,
    lineHeight: 15,
  },

  // ── Meta ─────────────────────────────────────────────────────────────────────
  // Slightly heavier captions — pill labels, stat subtitles
  meta: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0,
    lineHeight: 16,
  },

  // ── Micro ────────────────────────────────────────────────────────────────────
  // Uppercase eyebrows, section kickers
  micro: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    lineHeight: 14,
  },

  // ── Numeric / stats ──────────────────────────────────────────────────────────
  // Big stat numbers (body weight, PR value)
  statLarge: {
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: -0.4,
    lineHeight: 31,
  },

  // Medium stat numbers (streak count, session count)
  statMedium: {
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: -0.3,
    lineHeight: 24,
  },

  // ── Buttons ──────────────────────────────────────────────────────────────────
  // Primary CTA buttons
  button: {
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: -0.15,
    lineHeight: 19,
  },

  // Smaller buttons, ghost buttons
  buttonSmall: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: -0.1,
    lineHeight: 17,
  },
});

// ─── Convenience aliases for commonly used combos ────────────────────────────
// Use these when you need just fontSize + fontWeight without a StyleSheet

export const FontSize = {
  display:    28,
  title1:     22,
  title2:     18,
  title3:     16,
  headline:   15,
  body:       14,
  bodySmall:  13,
  subhead:    13,
  caption:    11,
  meta:       12,
  micro:      10,
  statLarge:  26,
  statMedium: 20,
  button:     15,
  buttonSmall:13,
} as const;

export const FontWeight = {
  regular: "400",
  medium:  "600",
  bold:    "700",
  heavy:   "800",
  black:   "900",
} as const;