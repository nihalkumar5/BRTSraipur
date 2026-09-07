import { Platform, TextStyle } from 'react-native';

export const FONT = {
  regular: Platform.select({
    web: "'Plus Jakarta Sans', sans-serif",
    default: 'PlusJakartaSans_400Regular',
  }),
  medium: Platform.select({
    web: "'Plus Jakarta Sans', sans-serif",
    default: 'PlusJakartaSans_500Medium',
  }),
  semiBold: Platform.select({
    web: "'Plus Jakarta Sans', sans-serif",
    default: 'PlusJakartaSans_600SemiBold',
  }),
  bold: Platform.select({
    web: "'Plus Jakarta Sans', sans-serif",
    default: 'PlusJakartaSans_700Bold',
  }),
  extraBold: Platform.select({
    web: "'Plus Jakarta Sans', sans-serif",
    default: 'PlusJakartaSans_800ExtraBold',
  }),
};

/**
 * Standard typography system strictly following:
 * - One primary typeface: Plus Jakarta Sans
 * - Strictly no Inter, Poppins, Montserrat, Roboto, Arial, or generic system fonts
 * - Exact sizes, line-heights, and weights specified in typography hierarchy
 */
export const typography = {
  // Large heading: 30–32 px / 700, Tight line-height
  largeHeading: {
    fontFamily: FONT.bold,
    fontSize: 31,
    lineHeight: 36,
    fontWeight: Platform.OS === 'web' ? ('700' as const) : undefined,
    letterSpacing: -0.5,
  } as TextStyle,

  // Page title: 26 px / 700, Line-height around 32 px
  pageTitle: {
    fontFamily: FONT.bold,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: Platform.OS === 'web' ? ('700' as const) : undefined,
    letterSpacing: -0.4,
  } as TextStyle,

  // Section heading: 18 px / 700, Line-height around 24 px
  sectionHeading: {
    fontFamily: FONT.bold,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: Platform.OS === 'web' ? ('700' as const) : undefined,
    letterSpacing: -0.2,
  } as TextStyle,

  // Route name: 15–16 px / 700, Line-height around 22 px
  routeName: {
    fontFamily: FONT.bold,
    fontSize: 15.5,
    lineHeight: 22,
    fontWeight: Platform.OS === 'web' ? ('700' as const) : undefined,
    letterSpacing: -0.1,
  } as TextStyle,

  // Station name: 15–16 px / 700, Line-height around 22 px
  stationName: {
    fontFamily: FONT.bold,
    fontSize: 15.5,
    lineHeight: 22,
    fontWeight: Platform.OS === 'web' ? ('700' as const) : undefined,
  } as TextStyle,

  // Primary body: 14–15 px / 500, Line-height around 20–22 px
  primaryBody: {
    fontFamily: FONT.medium,
    fontSize: 14.5,
    lineHeight: 21,
    fontWeight: Platform.OS === 'web' ? ('500' as const) : undefined,
  } as TextStyle,

  // Secondary/supporting text: 13–14 px / 500, Line-height around 18–20 px
  secondary: {
    fontFamily: FONT.medium,
    fontSize: 13.5,
    lineHeight: 19,
    fontWeight: Platform.OS === 'web' ? ('500' as const) : undefined,
  } as TextStyle,

  // Metadata: 12–13 px / 500, Line-height around 18 px
  metadata: {
    fontFamily: FONT.medium,
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: Platform.OS === 'web' ? ('500' as const) : undefined,
  } as TextStyle,

  // Fare: 14–15 px / 700 (tabular numerals)
  fare: {
    fontFamily: FONT.bold,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: Platform.OS === 'web' ? ('700' as const) : undefined,
    fontVariant: ['tabular-nums'],
  } as TextStyle,

  // Button: 15–16 px / 700
  button: {
    fontFamily: FONT.bold,
    fontSize: 15.5,
    lineHeight: 22,
    fontWeight: Platform.OS === 'web' ? ('700' as const) : undefined,
    letterSpacing: 0.1,
  } as TextStyle,

  // Bottom navigation: 12 px / 600
  bottomNav: {
    fontFamily: FONT.semiBold,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: Platform.OS === 'web' ? ('600' as const) : undefined,
  } as TextStyle,

  // Secondary descriptive copy: 400 weight (used sparingly)
  caption: {
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: Platform.OS === 'web' ? ('400' as const) : undefined,
  } as TextStyle,

  // Tabular numeral styling for ₹ fares, ETAs, durations, and timings
  tabularNumeral: {
    fontVariant: ['tabular-nums'],
  } as TextStyle,
};

export default typography;
