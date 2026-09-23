import React from 'react';

/**
 * Native no-op fallback for iOS / PWA Install Prompt.
 * Kept empty on native platforms to prevent any DOM interaction or bundle overhead.
 */
export default function IosInstallPrompt() {
  return null;
}
