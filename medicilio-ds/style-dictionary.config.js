/**
 * MD Design System — Style Dictionary config
 *
 * Outputs from one token source:
 *   CSS custom properties  →  build/css/variables.css
 *   Android XML            →  build/android/colors.xml + dimens.xml
 *   iOS Swift              →  build/ios/MDTokens.swift
 *
 * Token naming: category/role/variant  (e.g. color/interactive/primary)
 * CSS output:   --med-color-interactive-primary
 */

module.exports = {
  source: ['tokens/**/*.json'],

  platforms: {
    css: {
      transformGroup: 'css',
      prefix: 'med',
      buildPath: 'build/css/',
      files: [
        {
          destination: 'variables.css',
          format: 'css/variables',
          options: {
            outputReferences: true,
          },
        },
      ],
    },

    android: {
      transformGroup: 'android',
      buildPath: 'build/android/',
      files: [
        {
          destination: 'colors.xml',
          format: 'android/colors',
          filter: { type: 'color' },
        },
        {
          destination: 'dimens.xml',
          format: 'android/dimens',
          filter: (token) =>
            ['dimension', 'fontSizes', 'spacing', 'borderRadius'].includes(token.type),
        },
      ],
    },

    ios: {
      transformGroup: 'ios-swift',
      buildPath: 'build/ios/',
      files: [
        {
          destination: 'MDTokens.swift',
          format: 'ios-swift/class.swift',
          className: 'MDTokens',
          filter: (token) =>
            ['color', 'dimension', 'fontSizes', 'spacing', 'borderRadius'].includes(token.type),
        },
      ],
    },
  },
};
