import React, { useEffect } from 'react';
import { inject } from '@vercel/analytics';

/**
 * Web implementation for Vercel Web Analytics.
 * Automatically injects the tracking script and collects page views on Vercel deployments.
 */
export default function VercelAnalytics() {
  useEffect(() => {
    try {
      inject({ framework: 'react' });
    } catch (error) {
      console.warn('[Vercel Analytics] Initialization error:', error);
    }
  }, []);

  return null;
}
