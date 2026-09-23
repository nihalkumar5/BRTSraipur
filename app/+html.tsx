import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

/**
 * Root HTML layout for Expo Router static web export.
 * Web-only: executes in Node during static export.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <title>Tatpar BRTS Raipur</title>

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, shrink-to-fit=no, viewport-fit=cover"
        />

        {/* PWA / mobile-web-app behaviour */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Tatpar BRTS" />
        <meta name="application-name" content="Tatpar BRTS" />
        <meta name="theme-color" content="#18258F" />
        <meta name="msapplication-TileColor" content="#18258F" />

        {/* High Resolution Favicons & PWA Icons */}
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />

        {/* ScrollView reset */}
        <ScrollViewStyleReset />

        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('tatpar_dark_mode') === 'true') {
                  document.documentElement.classList.add('dark-theme');
                }
              } catch(e) {}
            `,
          }}
        />

        <style
          dangerouslySetInnerHTML={{
            __html: `
              html, body, #root {
                background-color: #F8F6F0;
                margin: 0;
                overflow: hidden;
                overscroll-behavior: none;
                touch-action: pan-x pan-y;
                -webkit-text-size-adjust: 100%;
                text-size-adjust: 100%;
              }
              * {
                -webkit-tap-highlight-color: transparent;
                touch-action: manipulation;
              }
            `,
          }}
        />

        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                document.addEventListener('touchstart', function(e) {
                  if (e.touches.length > 1) {
                    e.preventDefault();
                  }
                }, { passive: false });

                var lastTouch = 0;
                document.addEventListener('touchend', function(e) {
                  var now = Date.now();
                  if (now - lastTouch <= 300) {
                    e.preventDefault();
                  }
                  lastTouch = now;
                }, false);

                document.addEventListener('gesturestart', function(e) { e.preventDefault(); });
                document.addEventListener('gesturechange', function(e) { e.preventDefault(); });
                document.addEventListener('gestureend', function(e) { e.preventDefault(); });
              })();
            `,
          }}
        />

        {/* Vercel Web Analytics */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };`,
          }}
        />
        <script defer src="/_vercel/insights/script.js" />

        {/* Vercel Speed Insights */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.si = window.si || function () { (window.siq = window.siq || []).push(arguments); };`,
          }}
        />
        <script defer src="/_vercel/speed-insights/script.js" />
      </head>
      <body>{children}</body>
    </html>
  );
}
