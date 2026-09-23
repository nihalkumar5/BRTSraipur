import React from 'react';

/**
 * Native no-op fallback for Vercel Web Analytics.
 * Keeps native Android and iOS builds completely isolated from browser DOM scripts.
 */
export default function VercelAnalytics() {
  return null;
}
