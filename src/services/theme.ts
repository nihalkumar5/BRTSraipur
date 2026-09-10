import { useState, useEffect } from 'react';
import { triggerTactileVibration } from './notifications';

const THEME_STORAGE_KEY = 'tatpar_dark_mode';

export function getIsDarkMode(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return saved === 'true';
  } catch (e) {
    return false;
  }
}

/**
 * Base static rules for Dark Mode (in addition to dynamic RNW style sheet parsing)
 */
const BASE_DARK_CSS = `
/* ------------------------------------------------------------- */
/*             TATPAR ULTIMATE GLOBAL DARK THEME ENGINE         */
/* ------------------------------------------------------------- */
html.dark-theme,
html.dark-theme body,
html.dark-theme #root {
  background-color: #0B0F19 !important;
  color: #F8FAFC !important;
}

/* Primary View & Scroll Containers */
html.dark-theme [style*="background-color: rgb(248, 246, 240)"],
html.dark-theme [style*="background-color: rgb(252, 251, 247)"],
html.dark-theme [style*="background-color: rgb(251, 249, 244)"],
html.dark-theme [style*="background-color: rgb(234, 230, 223)"],
html.dark-theme [style*="background-color: #F8F6F0"],
html.dark-theme [style*="background-color: #FCFBF7"],
html.dark-theme [style*="background-color: #FBF9F4"],
html.dark-theme [style*="background-color: #EAE6DF"] {
  background-color: #0B0F19 !important;
}

/* White Card Containers & Modals */
html.dark-theme [style*="background-color: rgb(255, 255, 255)"],
html.dark-theme [style*="background-color: #FFFFFF"],
html.dark-theme [style*="background-color:#FFFFFF"],
html.dark-theme [style*="background-color: white"] {
  background-color: #151D2F !important;
  border-color: #24324D !important;
}

/* Inputs and Search Fields */
html.dark-theme input,
html.dark-theme textarea {
  color: #F8FAFC !important;
  background-color: #1A243B !important;
  border-color: #24324D !important;
}
html.dark-theme input::placeholder,
html.dark-theme textarea::placeholder {
  color: #64748B !important;
}

/* Bottom Tab Bar Dock in dark mode */
html.dark-theme div[style*="border-bottom-left-radius: 36px"],
html.dark-theme div[style*="borderBottomLeftRadius: 36px"],
html.dark-theme div[style*="border-radius: 36px"],
html.dark-theme div[style*="borderRadius: 36px"] {
  background-color: rgba(21, 29, 47, 0.85) !important;
  border-color: rgba(255, 255, 255, 0.12) !important;
  -webkit-backdrop-filter: blur(28px) saturate(200%) !important;
  backdrop-filter: blur(28px) saturate(200%) !important;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.1) !important;
}

/* Modal Bottom Sheets */
html.dark-theme div[style*="border-top-left-radius: 28px"],
html.dark-theme div[style*="borderTopLeftRadius: 28px"],
html.dark-theme div[style*="border-top-left-radius: 24px"],
html.dark-theme div[style*="borderTopLeftRadius: 24px"],
html.dark-theme div[style*="border-top-left-radius: 20px"],
html.dark-theme div[style*="borderTopLeftRadius: 20px"] {
  background-color: #151D2F !important;
  border-color: #24324D !important;
}

/* SVG Icon Recoloring for dark mode contrast */
html.dark-theme svg line,
html.dark-theme svg path,
html.dark-theme svg circle,
html.dark-theme svg rect,
html.dark-theme svg polygon {
  stroke: inherit;
}
html.dark-theme svg [stroke="#101828"],
html.dark-theme svg [stroke="#0F172A"],
html.dark-theme svg [stroke="#0B132B"],
html.dark-theme svg [stroke="#111827"] {
  stroke: #F8FAFC !important;
}
html.dark-theme svg [stroke="#64748B"],
html.dark-theme svg [stroke="#667085"],
html.dark-theme svg [stroke="#556080"],
html.dark-theme svg [stroke="#475569"] {
  stroke: #94A3B8 !important;
}
html.dark-theme svg [stroke="#E2E8F0"],
html.dark-theme svg [stroke="#E4E7EC"],
html.dark-theme svg [stroke="#EDF2F7"] {
  stroke: #24324D !important;
}
html.dark-theme svg [fill="#101828"],
html.dark-theme svg [fill="#0F172A"],
html.dark-theme svg [fill="#0B132B"] {
  fill: #F8FAFC !important;
}
`;

/**
 * Dynamically scans React Native Web style sheets and produces high-priority
 * overrides under html.dark-theme for every atomic class generated in the DOM.
 */
export function syncDarkThemeStyles(): void {
  if (typeof document === 'undefined') return;

  try {
    let engineStyle = document.getElementById('tatpar-dark-engine') as HTMLStyleElement | null;
    if (!engineStyle) {
      engineStyle = document.createElement('style');
      engineStyle.id = 'tatpar-dark-engine';
      document.head.appendChild(engineStyle);
    }

    const rulesToAdd: string[] = [BASE_DARK_CSS];
    const processedSelectors = new Set<string>();

    const sheets = document.styleSheets;
    for (let i = 0; i < sheets.length; i++) {
      const sheet = sheets[i];
      if ((sheet.ownerNode as HTMLElement)?.id === 'tatpar-dark-engine') continue;

      let cssRules: CSSRuleList;
      try {
        cssRules = sheet.cssRules;
      } catch (e) {
        continue;
      }
      if (!cssRules) continue;

      for (let j = 0; j < cssRules.length; j++) {
        const rule = cssRules[j] as CSSStyleRule;
        if (!rule.selectorText || !rule.cssText) continue;

        const selector = rule.selectorText;
        if (processedSelectors.has(selector)) continue;

        const cssText = rule.cssText;

        // 1. Root and Screen Backgrounds (#F8F6F0, #FCFBF7, #FBF9F4, #EAE6DF)
        if (
          /background-color:\s*(?:rgba?\(\s*248,\s*246,\s*240|rgba?\(\s*252,\s*251,\s*247|rgba?\(\s*251,\s*249,\s*244|rgba?\(\s*234,\s*230,\s*223|#F8F6F0|#FCFBF7|#FBF9F4|#EAE6DF)/i.test(
            cssText
          )
        ) {
          rulesToAdd.push(`html.dark-theme ${selector} { background-color: #0B0F19 !important; }`);
          processedSelectors.add(selector);
        }
        // 2. White Cards & Surfaces (#FFFFFF)
        else if (
          /background-color:\s*(?:rgba?\(\s*255,\s*255,\s*255,\s*1(?:\.0+)?\)|#FFFFFF\b|white\b)/i.test(
            cssText
          )
        ) {
          rulesToAdd.push(
            `html.dark-theme ${selector} { background-color: #151D2F !important; border-color: #24324D !important; }`
          );
          processedSelectors.add(selector);
        }
        // 3. Secondary/Muted/Pill Backgrounds (#F8FAFC, #F1F5F9, #EEF0F9, #EDF2F7, #EFF3FF, #EFF2F7, #EEF1FB, #EEF1FF)
        else if (
          /background-color:\s*(?:rgba?\(\s*248,\s*250,\s*252|rgba?\(\s*241,\s*245,\s*249|rgba?\(\s*238,\s*240,\s*249|rgba?\(\s*237,\s*242,\s*247|rgba?\(\s*239,\s*242,\s*247|rgba?\(\s*239,\s*243,\s*255|rgba?\(\s*233,\s*236,\s*255|#F8FAFC|#F1F5F9|#EEF0F9|#EDF2F7|#EFF3FF|#E9ECFF)/i.test(
            cssText
          )
        ) {
          rulesToAdd.push(
            `html.dark-theme ${selector} { background-color: #1E293B !important; border-color: #2E3D5C !important; }`
          );
          processedSelectors.add(selector);
        }
        // 4. Primary Dark Text (#0F172A, #101828, #0B132B, #111827)
        else if (
          /color:\s*(?:rgba?\(\s*15,\s*23,\s*42|rgba?\(\s*16,\s*24,\s*40|rgba?\(\s*11,\s*19,\s*43|rgba?\(\s*17,\s*24,\s*39|#0F172A|#101828|#0B132B|#111827)/i.test(
            cssText
          )
        ) {
          rulesToAdd.push(`html.dark-theme ${selector} { color: #F8FAFC !important; }`);
          processedSelectors.add(selector);
        }
        // 5. Muted / Subtitle Text (#64748B, #667085, #475569, #556080)
        else if (
          /color:\s*(?:rgba?\(\s*100,\s*116,\s*139|rgba?\(\s*102,\s*112,\s*133|rgba?\(\s*71,\s*85,\s*105|rgba?\(\s*85,\s*96,\s*128|#64748B|#667085|#475569|#556080)/i.test(
            cssText
          )
        ) {
          rulesToAdd.push(`html.dark-theme ${selector} { color: #94A3B8 !important; }`);
          processedSelectors.add(selector);
        }
        // 6. Medium Text (#334155, #344054, #374151)
        else if (
          /color:\s*(?:rgba?\(\s*51,\s*65,\s*85|rgba?\(\s*52,\s*64,\s*84|rgba?\(\s*55,\s*65,\s*81|#334155|#344054|#374151)/i.test(
            cssText
          )
        ) {
          rulesToAdd.push(`html.dark-theme ${selector} { color: #CBD5E1 !important; }`);
          processedSelectors.add(selector);
        }
        // 7. Light Grey Borders (#E2E8F0, #E4E7EC, #EAECF0, #EDF2F7, #D0D5DD, #CBD5E1)
        else if (
          /border(?:-(?:bottom|top|left|right))?-color:\s*(?:rgba?\(\s*226,\s*232,\s*240|rgba?\(\s*228,\s*231,\s*236|rgba?\(\s*234,\s*236,\s*240|rgba?\(\s*237,\s*242,\s*247|rgba?\(\s*208,\s*213,\s*221|rgba?\(\s*203,\s*213,\s*225|#E2E8F0|#E4E7EC|#EAECF0|#EDF2F7|#D0D5DD|#CBD5E1)/i.test(
            cssText
          )
        ) {
          rulesToAdd.push(`html.dark-theme ${selector} { border-color: #24324D !important; }`);
          processedSelectors.add(selector);
        }
      }
    }

    engineStyle.textContent = rulesToAdd.join('\n');
  } catch (e) {}
}

export function setDarkMode(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, enabled ? 'true' : 'false');
    if (enabled) {
      document.documentElement.classList.add('dark-theme');
      document.body?.classList?.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
      document.body?.classList?.remove('dark-theme');
    }

    syncDarkThemeStyles();
    triggerTactileVibration([0, 30]);

    window.dispatchEvent(
      new CustomEvent('tatpar-theme-change', { detail: { isDark: enabled } })
    );
  } catch (e) {}
}

let observerInitialized = false;

export function useDarkMode(): [boolean, (val: boolean) => void] {
  const [isDark, setIsDark] = useState<boolean>(() => getIsDarkMode());

  useEffect(() => {
    const current = getIsDarkMode();
    setIsDark(current);
    if (typeof document !== 'undefined') {
      if (current) {
        document.documentElement.classList.add('dark-theme');
        document.body?.classList?.add('dark-theme');
      } else {
        document.documentElement.classList.remove('dark-theme');
        document.body?.classList?.remove('dark-theme');
      }
      syncDarkThemeStyles();
    }

    if (typeof window !== 'undefined' && !observerInitialized) {
      observerInitialized = true;
      // Continuously ensure any dynamically loaded RNW classes are dark-themed
      const timer = setInterval(() => {
        syncDarkThemeStyles();
      }, 500);

      // Mutation observer to detect newly added style tags
      if (typeof MutationObserver !== 'undefined') {
        const obs = new MutationObserver(() => {
          syncDarkThemeStyles();
        });
        obs.observe(document.head, { childList: true, subtree: true });
      }

      // Stop polling after 5 seconds to preserve CPU once tree settles
      setTimeout(() => {
        clearInterval(timer);
      }, 5000);
    }

    const handler = (e: any) => {
      const nextVal = e.detail?.isDark ?? getIsDarkMode();
      setIsDark(nextVal);
      syncDarkThemeStyles();
    };

    window.addEventListener('tatpar-theme-change', handler);
    window.addEventListener('storage', (e) => {
      if (e.key === THEME_STORAGE_KEY) {
        const nextVal = e.newValue === 'true';
        setIsDark(nextVal);
        syncDarkThemeStyles();
      }
    });

    return () => {
      window.removeEventListener('tatpar-theme-change', handler);
    };
  }, []);

  const toggle = (val: boolean) => {
    setDarkMode(val);
    setIsDark(val);
  };

  return [isDark, toggle];
}
