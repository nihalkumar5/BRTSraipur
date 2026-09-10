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

export function setDarkMode(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, enabled ? 'true' : 'false');
    if (enabled) {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
    triggerTactileVibration([0, 30]);
    window.dispatchEvent(
      new CustomEvent('tatpar-theme-change', { detail: { isDark: enabled } })
    );
  } catch (e) {}
}

export function useDarkMode(): [boolean, (val: boolean) => void] {
  const [isDark, setIsDark] = useState<boolean>(() => getIsDarkMode());

  useEffect(() => {
    const current = getIsDarkMode();
    setIsDark(current);
    if (typeof document !== 'undefined') {
      if (current) {
        document.documentElement.classList.add('dark-theme');
      } else {
        document.documentElement.classList.remove('dark-theme');
      }
    }

    const handler = (e: any) => {
      setIsDark(e.detail?.isDark ?? getIsDarkMode());
    };

    window.addEventListener('tatpar-theme-change', handler);
    window.addEventListener('storage', (e) => {
      if (e.key === THEME_STORAGE_KEY) {
        setIsDark(e.newValue === 'true');
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
